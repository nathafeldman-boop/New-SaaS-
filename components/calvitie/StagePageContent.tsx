"use client";

import { siteConfig } from "@/lib/site";
import { NORWOOD_STAGES, NORWOOD_STAGES_EN, getStageBySlug, stageSlug } from "@/lib/norwood";
import { useLang } from "@/lib/i18n";

export function StagePageContent({ stade }: { stade: string }) {
  const [lang] = useLang();
  const en = lang === "en";
  const s = getStageBySlug(stade, en);
  if (!s) return null;

  const stages = en ? NORWOOD_STAGES_EN : NORWOOD_STAGES;
  const others = stages.filter((x) => x.stage !== s.stage);

  const faqs = en
    ? [
        {
          q: `Is Norwood stage ${s.stage} serious?`,
          a: `${s.summary} ${s.advice}`,
        },
        {
          q: `How do I know if I'm at stage ${s.stage}?`,
          a: `The easiest way is to estimate your stage from a photo. ${siteConfig.name} places your hairline on the Norwood scale and tracks how it evolves over time, in 3D.`,
        },
      ]
    : [
        {
          q: `Le stade ${s.stage} de Norwood, c'est grave ?`,
          a: `${s.summary} ${s.advice}`,
        },
        {
          q: `Comment savoir si je suis au stade ${s.stage} ?`,
          a: `Le plus simple est d'estimer ton stade depuis une photo. ${siteConfig.name} situe ta ligne frontale sur l'échelle de Norwood et en suit l'évolution dans le temps, en 3D.`,
        },
      ];

  return (
    <div className="container-page pt-28 sm:pt-32">
      <nav className="text-sm text-cocoa-500" aria-label={en ? "Breadcrumb" : "Fil d'Ariane"}>
        <a href="/" className="hover:text-ink">
          {en ? "Home" : "Accueil"}
        </a>
        <span className="px-1.5">/</span>
        <a href="/calvitie" className="hover:text-ink">
          {en ? "Baldness" : "Calvitie"}
        </a>
        <span className="px-1.5">/</span>
        <span className="text-cocoa-700">
          {en ? "Stage" : "Stade"} {s.stage}
        </span>
      </nav>

      <header className="mt-8 max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="eyebrow">{en ? "Norwood scale" : "Échelle de Norwood"}</span>
          <span className="rounded-full bg-sand px-3 py-1 text-xs text-cocoa-700">
            {s.baldPct}% {en ? "bald" : "dégarni"}
          </span>
        </div>
        <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-5xl">
          {en ? "Stage" : "Stade"} {s.stage} : {s.name}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-cocoa-700">{s.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {s.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper px-3 py-1 text-sm text-cocoa-700 ring-1 ring-clay-200/60"
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="mx-auto mt-14 max-w-2xl space-y-12 pb-8">
        <section>
          <h2 className="display-2 text-2xl text-ink">
            {en ? `The signs of stage ${s.stage}` : `Les signes du stade ${s.stage}`}
          </h2>
          <p className="mt-4 leading-relaxed text-cocoa-700">{s.summary}</p>
        </section>

        <section>
          <h2 className="display-2 text-2xl text-ink">
            {en ? "What to do at this stage?" : "Que faire à ce stade ?"}
          </h2>
          <p className="mt-4 leading-relaxed text-cocoa-700">{s.advice}</p>
          <p className="mt-3 text-sm text-cocoa-500">
            {en
              ? "Informational content — does not replace a dermatologist's opinion."
              : "Contenu informatif — ne remplace pas l'avis d'un dermatologue."}
          </p>
        </section>

        <section className="rounded-3xl bg-ink p-7 text-cream">
          <h2 className="display-2 text-2xl">
            {en ? `Track your stage with ${siteConfig.name}` : `Suivre ton stade avec ${siteConfig.name}`}
          </h2>
          <p className="mt-3 leading-relaxed text-clay-200">
            {en
              ? `Take a photo: ${siteConfig.name} estimates your Norwood stage, displays it on a 3D head, and tracks its evolution month after month. You also get a 30-day routine for a healthier scalp.`
              : `Prends-toi en photo : ${siteConfig.name} estime ton stade de Norwood, l'affiche sur une tête en 3D et suit son évolution mois après mois. Tu reçois aussi une routine de 30 jours pour un cuir chevelu plus sain.`}
          </p>
          <a
            href="/scan"
            className="mt-5 inline-flex rounded-full bg-cream px-5 py-3 text-sm font-semibold text-ink transition hover:bg-clay-100"
          >
            {en ? "Estimate my stage" : "Estimer mon stade"}
          </a>
        </section>

        <section>
          <h2 className="display-2 text-2xl text-ink">
            {en ? "Frequently asked questions" : "Questions fréquentes"}
          </h2>
          <div className="mt-4 divide-y divide-clay-200">
            {faqs.map((f) => (
              <div key={f.q} className="py-4">
                <h3 className="font-display text-lg text-ink">{f.q}</h3>
                <p className="mt-2 text-cocoa-700">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="border-t border-clay-200 py-14">
        <h2 className="display-2 text-2xl text-ink">
          {en ? "The other Norwood stages" : "Les autres stades de Norwood"}
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {others.map((x) => (
            <a
              key={x.stage}
              href={`/calvitie/${stageSlug(x.stage)}`}
              className="rounded-2xl bg-paper px-4 py-3 shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-0.5"
            >
              <span className="font-display text-ink">
                {en ? "Stage" : "Stade"} {x.stage}
              </span>
              <span className="block text-[0.78rem] text-cocoa-500">{x.name}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
