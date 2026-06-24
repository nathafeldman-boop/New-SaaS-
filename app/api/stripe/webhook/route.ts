import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Réception des événements d'abonnement Stripe (MRR).
 *
 * Étape actuelle : on vérifie la signature et on accuse réception (200).
 * Les actions métier (couper l'accès en cas de résiliation / paiement
 * refusé, prolonger en cas de renouvellement) seront branchées sur Supabase
 * à l'étape « comptes + base de données ».
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, reason: "no-webhook-secret" }, { status: 500 });
  }

  // IMPORTANT : signature calculée sur le corps BRUT, pas sur du JSON re-sérialisé.
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!verifyWebhookSignature(rawBody, sig, secret)) {
    return NextResponse.json({ ok: false, error: "Signature invalide" }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      // Nouvel abonné → (à venir) marquer le compte comme payé.
      console.log("[stripe] checkout terminé", event.data?.object?.id);
      break;
    case "customer.subscription.updated":
      // Changement de statut (actif, en retard, annulé en fin de période…).
      console.log("[stripe] abonnement mis à jour", event.data?.object?.status);
      break;
    case "customer.subscription.deleted":
      // Résiliation effective → (à venir) couper l'accès.
      console.log("[stripe] abonnement résilié", event.data?.object?.id);
      break;
    case "invoice.paid":
      // Renouvellement réussi → (à venir) prolonger l'accès.
      console.log("[stripe] facture payée", event.data?.object?.id);
      break;
    case "invoice.payment_failed":
      // Renouvellement échoué → (à venir) avertir / suspendre.
      console.log("[stripe] paiement de facture échoué", event.data?.object?.id);
      break;
    default:
      console.log("[stripe] événement non géré", event.type);
  }

  return NextResponse.json({ received: true });
}
