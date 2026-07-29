import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAffiliate } from "@/lib/affiliates";

export const runtime = "nodejs";

/** Lit le cookie `cpx_ref` posé par le lien /?ref=pseudo (voir Analytics.tsx). */
function readRefCookie(req: Request): string {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)cpx_ref=([^;]+)/);
  return m ? decodeURIComponent(m[1]).toLowerCase().slice(0, 32) : "";
}

/**
 * Crée un compte directement confirmé (pas d'email de validation à attendre),
 * pour que l'inscription dans le tunnel enchaîne immédiatement sur le paiement.
 * Le client appelle ensuite signInWithPassword pour ouvrir la session.
 */
export async function POST(req: Request) {
  let email: string | undefined;
  let password: string | undefined;
  try {
    ({ email, password } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email et mot de passe requis" }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ ok: false, error: "Mot de passe trop court (6 caractères min.)" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    // Email déjà inscrit → le client tentera la connexion avec le mot de passe.
    const exists = /already|registered|exists/i.test(error.message);
    return NextResponse.json({ ok: false, exists, error: error.message });
  }

  // Attribution affilié (cookie ?ref=) — c'est ici, pas côté client, que ça doit
  // se jouer : cette route couvre TOUS les chemins d'inscription (paiement,
  // code d'accès), contrairement à /api/ref-attach qui ne tourne qu'après
  // Google OAuth. Best-effort : ne bloque jamais la création du compte.
  const ref = readRefCookie(req);
  if (ref && data.user) {
    try {
      const affiliate = await getAffiliate(ref);
      if (affiliate) {
        await admin
          .from("profiles")
          .update({ ref: affiliate.pseudo })
          .eq("id", data.user.id)
          .is("ref", null);
      }
    } catch {
      // best-effort — une erreur d'attribution ne doit pas casser l'inscription.
    }
  }

  return NextResponse.json({ ok: true });
}
