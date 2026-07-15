import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { MentionsLegalesContent } from "@/components/legal/MentionsLegalesContent";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${siteConfig.name}.`,
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return <MentionsLegalesContent />;
}
