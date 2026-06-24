import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Valide un code d'accès : active l'abonnement de l'utilisateur sans passer
 * par Stripe (tests / giveaways). Nécessite un compte connecté.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, reason: "no-auth" });

  let code: string | undefined;
  try {
    ({ code } = await req.json());
  } catch {}
  code = (code || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ ok: false, error: "Code manquant" }, { status: 400 });

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("access_codes")
    .select("*")
    .eq("code", code)
    .single();

  if (!row || !row.active) {
    return NextResponse.json({ ok: false, error: "Code invalide." });
  }
  if (row.max_uses != null && row.used_count >= row.max_uses) {
    return NextResponse.json({ ok: false, error: "Ce code a atteint sa limite." });
  }

  // Enregistre la redemption (unique par utilisateur + code).
  const { error: redErr } = await admin
    .from("code_redemptions")
    .insert({ code, user_id: user.id });

  // Premier usage par cet utilisateur → on incrémente le compteur.
  if (!redErr) {
    await admin
      .from("access_codes")
      .update({ used_count: row.used_count + 1 })
      .eq("code", code);
  } else if (!/duplicate|unique/i.test(redErr.message)) {
    return NextResponse.json({ ok: false, error: "Validation impossible." });
  }

  // Active l'abonnement (comp, sans Stripe) — 30 jours.
  await admin.from("subscriptions").upsert(
    {
      user_id: user.id,
      status: "active",
      price_id: `access_code:${code}`,
      current_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return NextResponse.json({ ok: true });
}
