import { NextResponse } from "next/server";
import { createCheckoutSession, hasStripeConfig } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 25;

export async function POST(req: Request) {
  if (!hasStripeConfig()) {
    return NextResponse.json({ ok: false, reason: "no-config" });
  }
  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    const url = await createCheckoutSession(origin);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : "Erreur Stripe",
    });
  }
}
