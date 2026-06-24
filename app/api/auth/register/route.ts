import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    // Email déjà inscrit → le client tentera la connexion avec le mot de passe.
    const exists = /already|registered|exists/i.test(error.message);
    return NextResponse.json({ ok: false, exists, error: error.message });
  }

  return NextResponse.json({ ok: true });
}
