import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { getAllCuts } from "@/lib/cuts";

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
        <div className="container-page pt-28 sm:pt-32">
          <nav className="text-sm text-cocoa-500" aria-label="Fil d'Ariane">
            <a href="/" className="hover:text-ink">Accueil</a>
            <span className="px-1.5">/</span>
            <span className="text-cocoa-700">Coupes</span>
          </nav>

          <header className="mt-8 max-w-2xl">
            <span className="eyebrow">Catalogue</span>
            <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-6xl">
              Coupes de cheveux homme
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
              Des classiques intemporels aux tendances du moment : trouve la coupe
              qui te va, puis essaie-la sur ta propre photo avant de passer chez le
              coiffeur. Chaque coupe a sa fiche — style, entretien et morphologies.
            </p>
            <a href="/scan" className="btn-primary mt-7 inline-flex">
              Essayer une coupe sur ma photo
            </a>
          </header>

          <section className="mt-14 grid grid-cols-2 gap-5 pb-16 sm:grid-cols-3 lg:grid-cols-4">
            {cuts.map((c) => (
              <a
                key={c.slug}
                href={`/coupes/${c.slug}`}
                className="group overflow-hidden rounded-3xl bg-paper shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-1"
              >
                {c.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imageUrl}
                    alt={`Coupe ${c.name} homme`}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition group-hover:scale-[1.03]"
                  />
                )}
                <div className="px-4 py-3">
                  <h2 className="font-display text-lg text-ink">{c.name}</h2>
                  {c.vibe && <p className="text-[0.78rem] text-cocoa-500">{c.vibe}</p>}
                </div>
              </a>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
