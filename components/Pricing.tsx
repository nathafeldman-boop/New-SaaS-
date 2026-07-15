"use client";

import { siteConfig } from "@/lib/site";
import { useLang } from "@/lib/i18n";
import { Reveal } from "./Reveal";
import { IconArrow, IconCheck } from "./Illustrations";
import { LivingStrands } from "./LivingStrands";

const INCLUDED = {
  fr: [
    "Un cycle complet de 30 jours",
    "Routine quotidienne générée par photo",
    "Suivi de progression jour après jour",
    "Essayage de coupes illimité",
    "Accès depuis n'importe quel navigateur",
  ],
  en: [
    "A full 30-day cycle",
    "Daily routine generated from your photo",
    "Day-by-day progress tracking",
    "Unlimited haircut try-ons",
    "Access from any browser",
  ],
};

export function Pricing() {
  const [lang] = useLang();
  const en = lang === "en";
  const included = INCLUDED[lang];
  return (
    <section id="tarif" className="bg-sand/40 py-24 sm:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="eyebrow">{en ? "Pricing" : "Tarif"}</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-2 mt-5 text-balance text-4xl text-ink sm:text-5xl">
              {en ? "One subscription. One clear price." : "Un abonnement. Un prix clair."}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-cocoa-700">
              {en
                ? "10,90€ billed monthly to keep your program going — renews automatically, cancel anytime in one click from your account."
                : "10,90 € prélevés chaque mois pour faire avancer ton programme — renouvellement automatique, résiliable à tout moment en 1 clic depuis ton espace."}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-12 max-w-md overflow-hidden rounded-5xl border border-clay-300/60 bg-paper p-8 shadow-soft sm:p-10">
            <LivingStrands delay={1.6} className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 text-clay-300/50" />
            <div className="relative">
              <p className="font-display text-xl text-ink">
                {en ? `${siteConfig.name} subscription` : `Abonnement ${siteConfig.name}`}
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-display text-6xl font-light text-ink">
                  {siteConfig.price.amount}
                </span>
                <span className="pb-2 text-cocoa-600">
                  {en ? "/ month" : siteConfig.price.period}
                </span>
              </div>
              <p className="mt-2 text-xs italic text-clay-600">
                {en
                  ? "Auto-renews monthly — cancel anytime, no commitment."
                  : "Renouvellement automatique chaque mois — résiliable à tout moment, sans engagement."}
              </p>

              <a href="/scan" className="btn-primary group mt-7 w-full">
                {en ? "Get my free scan" : siteConfig.cta.primary}
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <ul className="mt-8 space-y-3.5">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-cocoa-800">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-clay-300 text-ink">
                      <IconCheck className="h-3 w-3" />
                    </span>
                    <span className="text-[0.975rem]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
