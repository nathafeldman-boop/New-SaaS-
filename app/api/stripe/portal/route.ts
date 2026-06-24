import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Ouvre le portail client Stripe (gérer / annuler l'abonnement). */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, reason: "no-auth" });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ ok: false, reason: "no-customer" });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ ok: false, reason: "no-config" });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const params = new URLSearchParams({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/espace`,
  });

  const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.url) {
    return NextResponse.json({ ok: false, error: j?.error?.message || "Erreur portail" });
  }
  return NextResponse.json({ ok: true, url: j.url });
}
