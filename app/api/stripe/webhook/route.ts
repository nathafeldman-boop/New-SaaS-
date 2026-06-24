import { NextResponse } from "next/server";
import { getSubscription, verifyWebhookSignature } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tsToIso = (s?: number | null) =>
  s ? new Date(s * 1000).toISOString() : null;

/**
 * Réception des événements d'abonnement Stripe (MRR).
 * Met à jour la table `subscriptions` → c'est ce qui pilote l'accès à l'app.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, reason: "no-webhook-secret" }, { status: 500 });
  }

  // Signature calculée sur le corps BRUT, pas sur du JSON re-sérialisé.
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!verifyWebhookSignature(rawBody, sig, secret)) {
    return NextResponse.json({ ok: false, error: "Signature invalide" }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: any } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  const admin = createAdminClient();
  const obj = event.data?.object ?? {};

  try {
    switch (event.type) {
      // Nouvel abonné : on relie l'abonnement au compte (via client_reference_id).
      case "checkout.session.completed": {
        const userId = obj.client_reference_id || obj.metadata?.user_id;
        if (userId && obj.subscription) {
          const sub = await getSubscription(obj.subscription);
          await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id: obj.customer ?? null,
              stripe_subscription_id: obj.subscription,
              status: sub?.status ?? "active",
              price_id: sub?.items?.data?.[0]?.price?.id ?? null,
              current_period_end: tsToIso(sub?.current_period_end),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
        }
        break;
      }

      // Changement de statut ou résiliation effective.
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const status =
          event.type === "customer.subscription.deleted" ? "canceled" : obj.status;
        await admin
          .from("subscriptions")
          .update({
            status,
            price_id: obj.items?.data?.[0]?.price?.id ?? null,
            current_period_end: tsToIso(obj.current_period_end),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", obj.id);
        break;
      }

      // Renouvellement réussi / échoué.
      case "invoice.paid":
      case "invoice.payment_failed": {
        const subId = obj.subscription;
        if (subId) {
          await admin
            .from("subscriptions")
            .update({
              status: event.type === "invoice.paid" ? "active" : "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    // On log mais on renvoie 200 : Stripe ré-essaiera si on renvoie une erreur.
    console.error("[stripe webhook] erreur de traitement", e);
  }

  return NextResponse.json({ received: true });
}
