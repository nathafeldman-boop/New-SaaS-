"use client";

import { useLang } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import type { Guide } from "@/lib/guides";

// Le corps du guide (intro, sections, FAQ) est un contenu éditorial SEO en
// français, pas encore traduit — seule la structure de la page l'est ici.
export function GuidePageContent({ guide, related }: { guide: Guide; related: Guide[] }) {
  const [lang] = useLang();
  const en = lang === "en";

  return (
    <article className="container-page pt-28 sm:pt-32">
      <nav className="text-sm text-cocoa-500" aria-label={en ? "Breadcrumb" : "Fil d'Ariane"}>
        <a href="/" className="hover:text-ink">
          {en ? "Home" : "Accueil"}
        </a>
        <span className="px-1.5">/</span>
        <a href="/guides" className="hover:text-ink">
          {en ? "Guides" : "Guides"}
        </a>
        <span className="px-1.5">/</span>
        <span className="text-cocoa-700">{guide.kicker}</span>
      </nav>

      {en && (
        <p className="mt-4 max-w-md rounded-xl bg-sand/60 px-3.5 py-2.5 text-xs leading-relaxed text-cocoa-700">
          This guide is currently only available in French.
        </p>
      )}

      <header className="mt-8 max-w-2xl">
        <span className="eyebrow">{guide.kicker}</span>
        <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-5xl">
          {guide.title}
        </h1>
        <p className="mt-3 text-sm text-cocoa-500">
          {en ? "Updated:" : "Mis à jour :"} {guide.updated}
        </p>
        {guide.intro.map((p) => (
          <p key={p.slice(0, 40)} className="mt-5 text-lg leading-relaxed text-cocoa-700">
            {p}
          </p>
        ))}
      </header>

      <div className="mt-12 max-w-2xl space-y-12">
        {guide.sections.map((s) => (
          <section key={s.h2}>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">{s.h2}</h2>
            {s.paras?.map((p) => (
              <p key={p.slice(0, 40)} className="mt-4 leading-relaxed text-cocoa-800">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-4 space-y-2.5">
                {s.list.map((item) => (
                  <li key={item.slice(0, 40)} className="flex items-start gap-3 text-cocoa-800">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* CTA produit */}
        <aside className="rounded-3xl bg-ink p-7 text-cream sm:p-9">
          <p className="font-display text-2xl">
            {en
              ? "A routine designed for YOUR hair, not the average."
              : "Une routine pensée pour TES cheveux, pas pour la moyenne."}
          </p>
          <p className="mt-3 text-clay-200">
            {en
              ? "Take a photo, get your diagnosis (type, condition, score out of 100) and your personalized 30-day routine — the diagnosis is free."
              : "Prends une photo, reçois ton diagnostic (type, état, score sur 100) et ta routine de 30 jours personnalisée — gratuit pour le diagnostic."}
          </p>
          <a
            href="/scan"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-paper"
          >
            {en ? "Get my free scan" : siteConfig.cta.primary}
          </a>
        </aside>

        {/* FAQ */}
        <section>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            {en ? "Frequently asked questions" : "Questions fréquentes"}
          </h2>
          <div className="mt-5 divide-y divide-clay-200">
            {guide.faq.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none font-display text-lg text-ink">
                  {f.q}
                </summary>
                <p className="mt-3 leading-relaxed text-cocoa-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Maillage interne */}
        {related.length > 0 && (
          <section className="pb-20">
            <h2 className="font-display text-2xl text-ink">
              {en ? "Read next" : "À lire ensuite"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <a
                  key={r.slug}
                  href={`/guides/${r.slug}`}
                  className="group rounded-2xl bg-paper p-5 shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-0.5"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">
                    {r.kicker}
                  </span>
                  <p className="mt-1.5 font-display text-lg leading-snug text-ink">{r.title}</p>
                  <span className="mt-2 inline-block text-sm text-clay-600 group-hover:text-ink">
                    {en ? "Read →" : "Lire →"}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
