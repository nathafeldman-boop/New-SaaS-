import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback OAuth (Google) : échange le `code` reçu contre une session, puis
 * redirige vers la page demandée. Le code verifier PKCE est lu depuis les
 * cookies posés par signInWithOAuth côté navigateur.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") || "/espace";
  // Sécurité : on n'autorise que des chemins internes relatifs.
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/espace";

  // Base de redirection robuste derrière le proxy Vercel.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = isLocal ? url.origin : forwardedHost ? `https://${forwardedHost}` : url.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/login?error=oauth`);
}
