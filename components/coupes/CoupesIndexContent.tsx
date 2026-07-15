"use client";

import { useLang } from "@/lib/i18n";
import type { Cut } from "@/lib/cuts";

// Le catalogue (nom, description, style, entretien) vient de la base de
// données et n'existe qu'en français pour l'instant — seule la structure
// de la page (libellés, boutons, titres) est traduite ici.
export function CoupesIndexContent({ cuts }: { cuts: Cut[] }) {
  const [lang] = useLang();
  const en = lang === "en";

  return (
    <div className="container-page pt-28 sm:pt-32">
      <nav className="text-sm text-cocoa-500" aria-label={en ? "Breadcrumb" : "Fil d'Ariane"}>
        <a href="/" className="hover:text-ink">
          {en ? "Home" : "Accueil"}
        </a>
        <span className="px-1.5">/</span>
        <span className="text-cocoa-700">{en ? "Haircuts" : "Coupes"}</span>
      </nav>

      <header className="mt-8 max-w-2xl">
        <span className="eyebrow">{en ? "Catalog" : "Catalogue"}</span>
        <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-6xl">
          {en ? "Men's haircuts" : "Coupes de cheveux homme"}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
          {en
            ? "From timeless classics to the latest trends: find the cut that suits you, then try it on your own photo before going to the barber. Each cut has its own page — style, maintenance and face shapes."
            : "Des classiques intemporels aux tendances du moment : trouve la coupe qui te va, puis essaie-la sur ta propre photo avant de passer chez le coiffeur. Chaque coupe a sa fiche — style, entretien et morphologies."}
        </p>
        <a href="/scan" className="btn-primary mt-7 inline-flex">
          {en ? "Try a haircut on my photo" : "Essayer une coupe sur ma photo"}
        </a>
        {en && (
          <p className="mt-3 max-w-md text-xs leading-relaxed text-cocoa-500">
            Haircut names and descriptions below are currently only available in
            French.
          </p>
        )}
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
  );
}
