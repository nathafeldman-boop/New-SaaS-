import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { GUIDES } from "@/lib/guides";

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
        <div className="container-page pt-28 sm:pt-32">
          <nav className="text-sm text-cocoa-500" aria-label="Fil d'Ariane">
            <a href="/" className="hover:text-ink">Accueil</a>
            <span className="px-1.5">/</span>
            <span className="text-cocoa-700">Guides</span>
          </nav>

          <header className="mt-8 max-w-2xl">
            <span className="eyebrow">Guides</span>
            <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-6xl">
              Comprendre et transformer tes cheveux
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
              Des guides concrets, fondés sur ce qui marche vraiment : routine
              adaptée à ton type, hydratation, pousse, cuir chevelu. Et quand tu
              veux du sur-mesure, le diagnostic photo de {siteConfig.name} fait
              le travail en 2 minutes.
            </p>
            <a href="/scan" className="btn-primary mt-7 inline-flex">
              {siteConfig.cta.primary}
            </a>
          </header>

          <section className="mt-14 grid gap-4 pb-20 sm:grid-cols-2">
            {GUIDES.map((g) => (
              <a
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group rounded-3xl bg-paper p-6 shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-0.5"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">
                  {g.kicker}
                </span>
                <p className="mt-2 font-display text-2xl leading-snug text-ink">
                  {g.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-cocoa-600">
                  {g.metaDescription}
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-clay-600 group-hover:text-ink">
                  Lire le guide →
                </span>
              </a>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
