import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { GUIDES } from "@/lib/guides";
import { GuidesHubContent } from "@/components/guides/GuidesHubContent";

export const metadata: Metadata = {
  title: "Guides capillaires homme : routines, types de cheveux, pousse",
  description:
    "Tous nos guides cheveux homme : routine capillaire, cheveux bouclés, crépus, gras ou secs, pousse et perte de cheveux. Des méthodes concrètes, sans blabla.",
  alternates: { canonical: "/guides" },
};

export default function GuidesHub() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: GUIDES.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.title,
      url: `${siteConfig.url}/guides/${g.slug}`,
    })),
  };

  return (
    <div className="grain relative">
      <JsonLd data={itemList} />
      <Nav />
      <main className="bg-cream">
        <GuidesHubContent guides={GUIDES} />
      </main>
      <Footer />
    </div>
  );
}
