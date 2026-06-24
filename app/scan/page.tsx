import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Funnel } from "@/components/funnel/Funnel";
import { siteConfig } from "@/lib/site";
import { getAccess } from "@/lib/subscription";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Scan capillaire`,
  description:
    "Prends-toi en photo, obtiens ton diagnostic, tes coupes et ta routine de 30 jours.",
};

export const dynamic = "force-dynamic";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: { session_id?: string; canceled?: string };
}) {
  // Abonné qui revient (hors retour de paiement Stripe) → direct à son espace.
  if (!searchParams.session_id) {
    const { active } = await getAccess();
    if (active) redirect("/espace");
  }
  return <Funnel />;
}
