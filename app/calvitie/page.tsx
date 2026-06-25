import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { NORWOOD_STAGES, stageSlug } from "@/lib/norwood";

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
        <div className="container-page pt-28 sm:pt-32">
          <nav className="text-sm text-cocoa-500" aria-label="Fil d'Ariane">
            <a href="/" className="hover:text-ink">Accueil</a>
            <span className="px-1.5">/</span>
            <span className="text-cocoa-700">Calvitie</span>
          </nav>

          <header className="mt-8 max-w-2xl">
            <span className="eyebrow">Guide</span>
            <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-6xl">
              L'échelle de Norwood
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
              L'échelle de Norwood-Hamilton décrit la progression de la calvitie
              masculine en 7 stades, du front intact à la couronne résiduelle. La
              situer permet de comprendre où tu en es et d'agir au bon moment.
              Avec {siteConfig.name}, tu estimes ton stade depuis une photo et tu
              suis son évolution dans le temps, en 3D.
            </p>
            <a href="/scan" className="btn-primary mt-7 inline-flex">
              Estimer mon stade
            </a>
          </header>

          <section className="mt-14 grid gap-4 pb-8 sm:grid-cols-2">
            {NORWOOD_STAGES.map((s) => (
              <a
                key={s.stage}
                href={`/calvitie/${stageSlug(s.stage)}`}
                className="group rounded-3xl bg-paper p-6 shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-ink">
                    Stade {s.stage}
                  </span>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs text-cocoa-700">
                    {s.baldPct}% dégarni
                  </span>
                </div>
                <p className="mt-1 font-medium text-cocoa-800">{s.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-cocoa-600">{s.summary}</p>
                <span className="mt-3 inline-block text-sm font-medium text-clay-600 group-hover:text-ink">
                  En savoir plus →
                </span>
              </a>
            ))}
          </section>

          <p className="mb-16 max-w-2xl text-sm text-cocoa-500">
            Ce contenu est informatif et ne remplace pas l'avis d'un dermatologue.
            En cas de chute rapide ou inhabituelle, consulte un professionnel de santé.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
