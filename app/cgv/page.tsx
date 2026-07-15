import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { CgvContent } from "@/components/legal/CgvContent";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: `Conditions générales de vente de l'abonnement ${siteConfig.name}.`,
  alternates: { canonical: "/cgv" },
};

export default function CgvPage() {
  return <CgvContent />;
}
