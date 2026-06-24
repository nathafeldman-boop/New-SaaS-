import { NextResponse } from "next/server";
import { hasStripeConfig, isSessionPaid } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(req: Request) {
  let sessionId: string | undefined;
  try {
    ({ sessionId } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "session_id manquant" }, { status: 400 });
  }
  if (!hasStripeConfig()) {
    return NextResponse.json({ ok: false, reason: "no-config" });
  }
  try {
    const paid = await isSessionPaid(sessionId);
    return NextResponse.json({ ok: true, paid });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : "Erreur Stripe",
    });
  }
}
