"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Reveal } from "./Reveal";
import { LivingStrands } from "./LivingStrands";
import { IconCalendar, IconCamera, IconCheck, IconScissors } from "./Illustrations";

export function Features() {
  return (
    <section className="relative">
      <AppFeature />
      <CoupesFeature />
      <Plan30 />
    </section>
  );
}

/* ── Web app mobile ─────────────────────────────────────────── */
function AppFeature() {
  const [lang] = useLang();
  const en = lang === "en";
  const week: [string, string, boolean][] = en
    ? [
        ["Mon", "Oil treatment", true],
        ["Tue", "Light hydration", true],
        ["Wed", "Scalp rest day", true],
        ["Thu", "Protein mask", true],
        ["Fri", "Ends care", false],
      ]
    : [
        ["Lun", "Bain d'huile", true],
        ["Mar", "Hydratation légère", true],
        ["Mer", "Repos du cuir chevelu", true],
        ["Jeu", "Masque protéiné", true],
        ["Ven", "Soin des pointes", false],
      ];
  return (
    <div id="app" className="bg-cream py-24 sm:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <div className="relative rounded-5xl border border-clay-200/70 bg-grad-warm p-8 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl text-ink">{en ? "This week" : "Cette semaine"}</p>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-cocoa-700">
                {en ? "4 / 7 days" : "4 / 7 jours"}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {week.map(([day, label, done]) => (
                <div
                  key={day as string}
                  className="flex items-center gap-4 rounded-2xl border border-clay-200/70 bg-paper/80 px-4 py-3"
                >
                  <span className="w-9 text-sm font-semibold text-cocoa-600">
                    {day}
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink">
                    {label}
                  </span>
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full ${
                      done
                        ? "bg-cocoa-700 text-cream"
                        : "border border-clay-300 text-clay-400"
                    }`}
                  >
                    {done ? <IconCheck className="h-3.5 w-3.5" /> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="order-1 max-w-lg lg:order-2">
          <Reveal>
            <span className="eyebrow">{en ? "The web app" : "L'app web"}</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-2 mt-5 text-balance text-4xl text-ink sm:text-5xl">
              {en
                ? "A routine that adjusts, day after day."
                : "Une routine qui s'ajuste, jour après jour."}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
              {en
                ? "Not a static checklist. Each photo refines the next step: the routine adapts to your hair's real progress across the whole cycle. Everything runs in the browser, optimized for your phone — nothing to download."
                : "Pas une liste figée. Chaque photo affine la suivante : la routine s'adapte à l'évolution réelle de tes cheveux sur tout le cycle. Tout se passe dans le navigateur, optimisé pour ton téléphone — rien à télécharger."}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="mt-7 space-y-3">
              {(en
                ? [
                    "Daily routine generated from your photo",
                    "Progress tracking over 30 days",
                    "Mobile-first, works in any browser",
                  ]
                : [
                    "Routine quotidienne générée à partir de ta photo",
                    "Suivi de progression sur 30 jours",
                    "Pensée mobile, accessible depuis n'importe quel navigateur",
                  ]
              ).map((item) => (
                <li key={item} className="flex items-start gap-3 text-cocoa-800">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-clay-300 text-ink">
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ── Essayage de coupes ─────────────────────────────────────── */
function CoupesFeature() {
  const [lang] = useLang();
  const en = lang === "en";
  return (
    <div id="coupes" className="bg-sand/40 py-24 sm:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <div className="max-w-lg">
          <Reveal>
            <span className="eyebrow">
              <IconScissors className="h-3.5 w-3.5" />
              {en ? "Try before you cut" : "Essaie avant de couper"}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-2 mt-5 text-balance text-4xl text-ink sm:text-5xl">
              {en
                ? "Find the cut that suits you. Just show it."
                : "Trouve la coupe qui te va. Montre-la, c'est tout."}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
              {en
                ? "Browse a catalog of haircuts and try them on your own photo. Keep the one that fits you and simply show it to your barber — no more struggling for words. Your routine then adapts to maintain the chosen cut."
                : "Parcours un catalogue de coupes et essaie-les sur ta propre photo. Tu gardes celle qui te correspond, et tu la montres simplement à ton coiffeur — plus besoin de trouver les mots. Ta routine s'adapte ensuite pour entretenir la coupe choisie."}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="mt-7 space-y-3">
              {(en
                ? [
                    "A wide range of cuts, from fades to medium-length",
                    "A clear visual to show your barber, no explaining",
                  ]
                : [
                    "Un large choix de coupes, du dégradé au mi-long",
                    "Un visuel clair à montrer au coiffeur, sans expliquer",
                  ]
              ).map((item) => (
                <li key={item} className="flex items-start gap-3 text-cocoa-800">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-clay-300 text-ink">
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal>
          <div className="relative mx-auto max-w-[400px]">
            {/* carte inclinée en fond */}
            <div className="absolute -bottom-4 -right-3.5 left-4 top-[18px] -rotate-[2.5deg] rounded-[30px] bg-gradient-to-br from-latte to-clay-200 opacity-70" />
            <div className="relative overflow-hidden rounded-[26px] border-[6px] border-paper shadow-[0_30px_70px_-34px_rgba(67,50,31,0.55)]">
              <img
                src="/results/hairstyles.jpg"
                alt="Catalogue de coupes de cheveux à essayer"
                loading="lazy"
                className="block w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-70% to-ink/45" />
              <span className="absolute bottom-[18px] left-[18px] inline-flex items-center gap-2 rounded-full bg-cream/90 px-3.5 py-2 text-[13px] font-semibold text-ink shadow-[0_10px_24px_-14px_rgba(67,50,31,0.5)] backdrop-blur-sm">
                <IconCamera className="h-3.5 w-3.5 text-cocoa-700" />
                {en ? "Try them on your photo" : "Essaie-les sur ta photo"}
              </span>
            </div>
            <span className="absolute -right-2.5 top-4 animate-float rounded-[14px] bg-ink px-3.5 py-2 text-xs text-cream shadow-[0_16px_36px_-20px_rgba(67,50,31,0.6)]">
              {en ? "More cuts every month" : "+ de choix chaque mois"}
            </span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ── Plan 30 jours ──────────────────────────────────────────── */
function Plan30() {
  const [lang] = useLang();
  const en = lang === "en";
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const current = 12;
  return (
    <div className="relative overflow-hidden bg-cream py-24 sm:py-28">
      <LivingStrands delay={1.4} className="pointer-events-none absolute -right-20 top-8 h-[380px] w-[380px] text-clay-300/25" />
      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="eyebrow">
              <IconCalendar className="h-3.5 w-3.5" />
              {en ? "The 30-day cycle" : "Le cycle de 30 jours"}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-2 mt-5 text-balance text-4xl text-ink sm:text-5xl">
              {en
                ? "A complete program, not random advice."
                : "Un programme complet, pas un conseil au hasard."}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-cocoa-700">
              {en
                ? "Each program runs for 30 days. As long as your subscription is active, a new one picks up automatically to take you further — building on what you've already achieved."
                : "Chaque programme dure 30 jours. Tant que ton abonnement est actif, un nouveau programme prend le relais automatiquement pour aller plus loin — la suite se construit sur ce que tu as déjà accompli."}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-6 gap-2 sm:grid-cols-10 sm:gap-2.5">
            {days.map((d) => {
              const done = d < current;
              const active = d === current;
              return (
                <motion.div
                  key={d}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: d * 0.015, duration: 0.3 }}
                  className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium ${
                    active
                      ? "bg-ink text-cream shadow-card ring-2 ring-clay-400 ring-offset-2 ring-offset-cream"
                      : done
                        ? "bg-clay-300 text-ink"
                        : "border border-clay-200 bg-paper/70 text-clay-400"
                  }`}
                >
                  {d}
                </motion.div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
