"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { IconCamera, IconScissors, IconSparkle } from "./Illustrations";
import { LivingStrands } from "./LivingStrands";

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    n: "01",
    icon: IconCamera,
    word: "Capture",
    title: "Prends-toi en photo",
    text: "Une photo suffit. Chaque jour, tu captures l'état réel de tes cheveux depuis l'app web — aucune installation.",
  },
  {
    n: "02",
    icon: IconSparkle,
    word: "Analyse",
    title: "Reçois ta routine",
    text: "On lit ta photo et on génère ta routine du jour, pensée sur 30 jours, pour des cheveux sains et faciles à coiffer.",
  },
  {
    n: "03",
    icon: IconScissors,
    word: "Style",
    title: "Essaie des coupes",
    text: "Teste des coupes sur ton visage, garde celle qui te va, et montre-la au coiffeur — sans avoir à l'expliquer.",
  },
];

export function HowItWorks() {
  return (
    <section id="methode" className="relative overflow-hidden py-24 sm:py-32">
      <LivingStrands delay={1} className="pointer-events-none absolute -left-16 top-24 h-[460px] w-[460px] rotate-180 text-clay-300/30" />
      <div className="container-page relative">
        <div className="max-w-2xl">
          <Reveal>
            <span className="eyebrow">La méthode</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-2 mt-5 text-balance text-4xl text-ink sm:text-5xl">
              Trois gestes. Un cheveu qui reprend vie.
            </h2>
          </Reveal>
        </div>

        <ol className="relative mt-16 max-w-3xl">
          {/* fil conducteur vertical (mèche) */}
          <motion.span
            aria-hidden
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.1, ease }}
            className="absolute left-7 top-4 bottom-10 w-px origin-top bg-gradient-to-b from-clay-300 via-clay-400 to-clay-200 sm:left-9"
          />

          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.15 + i * 0.15, duration: 0.6, ease }}
              className="group relative grid grid-cols-[56px_1fr] gap-6 pb-14 last:pb-0 sm:grid-cols-[72px_1fr] sm:gap-10"
            >
              {/* nœud numéroté sur le fil */}
              <div className="relative z-10 flex justify-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-clay-300 bg-cream font-display text-2xl font-light text-cocoa-700 transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-cream sm:h-[72px] sm:w-[72px] sm:text-3xl">
                  {s.n}
                </span>
              </div>

              {/* contenu, sans carte */}
              <div className="pt-1.5 sm:pt-3">
                <div className="flex items-center gap-3 text-cocoa-600">
                  <s.icon className="h-4 w-4 text-clay-500" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                    {s.word}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-cocoa-700">
                  {s.text}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
