import type { Metadata } from "next";
import { Funnel } from "@/components/funnel/Funnel";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Scan capillaire`,
  description:
    "Prends-toi en photo, obtiens ton diagnostic, tes coupes et ta routine de 30 jours.",
};

export default function ScanPage() {
  return <Funnel />;
}
