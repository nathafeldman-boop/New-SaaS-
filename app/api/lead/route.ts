import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Capture d'email avant le paywall (lead marketing).
 * Best-effort : ne bloque jamais le funnel — on renvoie ok même en cas
 * d'échec d'écriture, le client continue vers le diagnostic.
 */
export async function POST(req: Request) {
  let payload: { email?: string; quiz?: Record<string, string>; source?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "Email invalide" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    await admin
      .from("leads")
      .upsert(
        {
          email,
          source: payload.source ? String(payload.source).slice(0, 64) : "funnel",
          quiz: payload.quiz ?? null,
        },
        { onConflict: "email" },
      );
  } catch {
    // best-effort : le lead ne doit jamais casser le parcours
  }

  return NextResponse.json({ ok: true });
}
