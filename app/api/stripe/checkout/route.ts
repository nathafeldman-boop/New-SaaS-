import { NextResponse } from "next/server";
import { createCheckoutSession, hasStripeConfig } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 25;

export async function POST(req: Request) {
  if (!hasStripeConfig()) {
    return NextResponse.json({ ok: false, reason: "no-config" });
  }

  // Le paiement doit être relié à un compte (pour activer l'abonnement ensuite).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "no-auth" });
  }

  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    const url = await createCheckoutSession(origin, {
      userId: user.id,
      email: user.email ?? undefined,
    });
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : "Erreur Stripe",
    });
  }
}
