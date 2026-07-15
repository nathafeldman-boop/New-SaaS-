import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { NORWOOD_STAGES, stageSlug } from "@/lib/norwood";
import { CalvitieHubContent } from "@/components/calvitie/CalvitieHubContent";

export const metadata: Metadata = {
  title: "Échelle de Norwood : les 7 stades de la calvitie masculine",
  description:
    "Comprendre l'échelle de Norwood : les 7 stades de la calvitie masculine, les signes de chaque stade et comment suivre l'évolution de ta ligne frontale avec Capilatyx.",
  alternates: { canonical: "/calvitie" },
};

export default function CalvitieHub() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: NORWOOD_STAGES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Stade ${s.stage} — ${s.name}`,
      url: `${siteConfig.url}/calvitie/${stageSlug(s.stage)}`,
    })),
  };

  return (
    <div className="grain relative">
      <JsonLd data={itemList} />
      <Nav />
      <main className="bg-cream">
        <CalvitieHubContent />
      </main>
      <Footer />
    </div>
  );
}
