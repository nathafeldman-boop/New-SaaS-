"use client";

import { useLang } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import type { Guide } from "@/lib/guides";

// Les guides eux-mêmes (titre, contenu, FAQ) sont un gros corpus éditorial
// SEO en français, pas encore traduit — seule la structure de la page l'est
// ici. Voir la note affichée aux visiteurs anglophones ci-dessous.
export function GuidesHubContent({ guides }: { guides: Guide[] }) {
  const [lang] = useLang();
  const en = lang === "en";

  return (
    <div className="container-page pt-28 sm:pt-32">
      <nav className="text-sm text-cocoa-500" aria-label={en ? "Breadcrumb" : "Fil d'Ariane"}>
        <a href="/" className="hover:text-ink">
          {en ? "Home" : "Accueil"}
        </a>
        <span className="px-1.5">/</span>
        <span className="text-cocoa-700">{en ? "Guides" : "Guides"}</span>
      </nav>

      <header className="mt-8 max-w-2xl">
        <span className="eyebrow">{en ? "Guides" : "Guides"}</span>
        <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-6xl">
          {en ? "Understand and transform your hair" : "Comprendre et transformer tes cheveux"}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
          {en
            ? `Practical guides, based on what actually works: routines suited to your hair type, hydration, growth, scalp care. And when you want something tailored to you, ${siteConfig.name}'s photo diagnosis does the work in 2 minutes.`
            : `Des guides concrets, fondés sur ce qui marche vraiment : routine adaptée à ton type, hydratation, pousse, cuir chevelu. Et quand tu veux du sur-mesure, le diagnostic photo de ${siteConfig.name} fait le travail en 2 minutes.`}
        </p>
        <a href="/scan" className="btn-primary mt-7 inline-flex">
          {en ? "Get my free scan" : siteConfig.cta.primary}
        </a>
        {en && (
          <p className="mt-3 max-w-md text-xs leading-relaxed text-cocoa-500">
            The guides below are currently only available in French.
          </p>
        )}
      </header>

      <section className="mt-14 grid gap-4 pb-20 sm:grid-cols-2">
        {guides.map((g) => (
          <a
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="group rounded-3xl bg-paper p-6 shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-0.5"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">
              {g.kicker}
            </span>
            <p className="mt-2 font-display text-2xl leading-snug text-ink">{g.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-cocoa-600">{g.metaDescription}</p>
            <span className="mt-3 inline-block text-sm font-medium text-clay-600 group-hover:text-ink">
              {en ? "Read the guide →" : "Lire le guide →"}
            </span>
          </a>
        ))}
      </section>
    </div>
  );
}
