"use client";

import { siteConfig } from "@/lib/site";
import { NORWOOD_STAGES, NORWOOD_STAGES_EN, stageSlug } from "@/lib/norwood";
import { useLang } from "@/lib/i18n";

export function CalvitieHubContent() {
  const [lang] = useLang();
  const en = lang === "en";
  const stages = en ? NORWOOD_STAGES_EN : NORWOOD_STAGES;

  return (
    <div className="container-page pt-28 sm:pt-32">
      <nav className="text-sm text-cocoa-500" aria-label={en ? "Breadcrumb" : "Fil d'Ariane"}>
        <a href="/" className="hover:text-ink">
          {en ? "Home" : "Accueil"}
        </a>
        <span className="px-1.5">/</span>
        <span className="text-cocoa-700">{en ? "Baldness" : "Calvitie"}</span>
      </nav>

      <header className="mt-8 max-w-2xl">
        <span className="eyebrow">{en ? "Guide" : "Guide"}</span>
        <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-6xl">
          {en ? "The Norwood scale" : "L'échelle de Norwood"}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
          {en
            ? `The Norwood-Hamilton scale describes the progression of male pattern baldness in 7 stages, from an intact hairline to a residual crown. Placing yourself on it helps you understand where you stand and act at the right time. With ${siteConfig.name}, you estimate your stage from a photo and track how it evolves over time, in 3D.`
            : `L'échelle de Norwood-Hamilton décrit la progression de la calvitie masculine en 7 stades, du front intact à la couronne résiduelle. La situer permet de comprendre où tu en es et d'agir au bon moment. Avec ${siteConfig.name}, tu estimes ton stade depuis une photo et tu suis son évolution dans le temps, en 3D.`}
        </p>
        <a href="/scan" className="btn-primary mt-7 inline-flex">
          {en ? "Estimate my stage" : "Estimer mon stade"}
        </a>
      </header>

      <section className="mt-14 grid gap-4 pb-8 sm:grid-cols-2">
        {stages.map((s) => (
          <a
            key={s.stage}
            href={`/calvitie/${stageSlug(s.stage)}`}
            className="group rounded-3xl bg-paper p-6 shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl text-ink">
                {en ? "Stage" : "Stade"} {s.stage}
              </span>
              <span className="rounded-full bg-sand px-3 py-1 text-xs text-cocoa-700">
                {s.baldPct}% {en ? "bald" : "dégarni"}
              </span>
            </div>
            <p className="mt-1 font-medium text-cocoa-800">{s.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-cocoa-600">{s.summary}</p>
            <span className="mt-3 inline-block text-sm font-medium text-clay-600 group-hover:text-ink">
              {en ? "Learn more →" : "En savoir plus →"}
            </span>
          </a>
        ))}
      </section>

      <p className="mb-16 max-w-2xl text-sm text-cocoa-500">
        {en
          ? "This content is informational and does not replace a dermatologist's opinion. In case of rapid or unusual hair loss, consult a healthcare professional."
          : "Ce contenu est informatif et ne remplace pas l'avis d'un dermatologue. En cas de chute rapide ou inhabituelle, consulte un professionnel de santé."}
      </p>
    </div>
  );
}
