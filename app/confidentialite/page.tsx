import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { ConfidentialiteContent } from "@/components/legal/ConfidentialiteContent";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment ${siteConfig.name} traite et protège vos données personnelles.`,
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return <ConfidentialiteContent />;
}
