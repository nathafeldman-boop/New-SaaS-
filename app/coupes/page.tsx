import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { getAllCuts } from "@/lib/cuts";
import { CoupesIndexContent } from "@/components/coupes/CoupesIndexContent";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Coupes de cheveux homme : le catalogue à essayer sur photo",
  description:
    "Skin fade, french crop, quiff, undercut… Parcours le catalogue de coupes homme et essaie-les sur ta propre photo avant le coiffeur avec Capilatyx.",
  alternates: { canonical: "/coupes" },
};

export default async function CoupesIndex() {
  const cuts = await getAllCuts();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: cuts.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `${siteConfig.url}/coupes/${c.slug}`,
    })),
  };

  return (
    <div className="grain relative">
      <JsonLd data={itemList} />
      <Nav />
      <main className="bg-cream">
        <CoupesIndexContent cuts={cuts} />
      </main>
      <Footer />
    </div>
  );
}
