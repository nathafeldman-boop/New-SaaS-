// ──────────────────────────────────────────────────────────────────────────
//  Client serveur Stripe (Checkout Sessions, via l'API REST — sans SDK).
//  Clés lues côté serveur uniquement (STRIPE_SECRET_KEY / STRIPE_PRICE_ID).
// ──────────────────────────────────────────────────────────────────────────

import { createHmac, timingSafeEqual } from "crypto";

const API = "https://api.stripe.com/v1";

export function hasStripeConfig(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

/**
 * Vérifie la signature d'un webhook Stripe (sans SDK).
 * Header `Stripe-Signature` : `t=timestamp,v1=signature`.
 * Payload signé = `${t}.${rawBody}`, HMAC-SHA256 avec le secret `whsec_…`.
 */
export function verifyWebhookSignature(
  rawBody: string,
  sigHeader: string | null,
  secret: string,
  toleranceSec = 300,
): boolean {
  if (!sigHeader) return false;

  let timestamp = "";
  const signatures: string[] = [];
  for (const part of sigHeader.split(",")) {
    const [k, v] = part.split("=");
    if (k === "t") timestamp = v;
    if (k === "v1") signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) return false;

  // Anti-rejeu : on refuse les signatures trop vieilles.
  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(age) || age > toleranceSec) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");

  return signatures.some((sig) => {
    const sigBuf = Buffer.from(sig, "hex");
    return (
      sigBuf.length === expectedBuf.length &&
      timingSafeEqual(sigBuf, expectedBuf)
    );
  });
}

export class StripeError extends Error {}

/** Crée une session de paiement et renvoie l'URL de checkout hébergée. */
export async function createCheckoutSession(origin: string): Promise<string> {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  if (!key || !price) throw new StripeError("Stripe non configuré");

  const params = new URLSearchParams({
    mode: process.env.STRIPE_MODE ?? "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/scan?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/scan?canceled=1`,
    allow_promotion_codes: "true",
  });

  const res = await fetch(`${API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    signal: AbortSignal.timeout(20_000),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    throw new StripeError(json?.error?.message || `Stripe ${res.status}`);
  }
  return json.url as string;
}

/** Vérifie qu'une session de checkout est bien payée. */
export async function isSessionPaid(sessionId: string): Promise<boolean> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError("Stripe non configuré");

  const res = await fetch(`${API}/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return false;
  const j = await res.json().catch(() => ({}));
  return j?.payment_status === "paid" || j?.status === "complete";
}
