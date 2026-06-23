"use client";

import { Reveal, revealItem } from "./Reveal";
import { IconCamera, IconSparkle, IconScissors } from "./Illustrations";
import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    icon: IconCamera,
    title: "Prends-toi en photo",
    text: "Une photo suffit. Tous les jours, tu captures l'état de tes cheveux directement depuis l'app web — aucune installation.",
  },
  {
    n: "02",
    icon: IconSparkle,
    title: "Reçois ta routine",
    text: "On analyse la photo et on génère ta routine du jour, pensée pour 30 jours, afin de retrouver des cheveux sains et faciles à coiffer.",
  },
  {
    n: "03",
    icon: IconScissors,
    title: "Essaie des coupes",
    text: "Teste différentes coupes sur ton visage. Tu choisis celle qui te va, tu la montres au coiffeur — pas besoin d'expliquer.",
  },
];

export function HowItWorks() {
  return (
    <section id="methode" className="relative py-24 sm:py-32">
      <div className="container-page">
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

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Step key={s.n} {...s} last={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  text,
}: (typeof steps)[number] & { last: boolean }) {
  return (
    <motion.div
      variants={revealItem}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="group relative flex flex-col rounded-4xl border border-clay-200/70 bg-paper/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-paper hover:shadow-soft"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sand text-cocoa-700 transition-colors group-hover:bg-clay-300 group-hover:text-ink">
          <Icon className="h-6 w-6" />
        </span>
        <span className="font-display text-3xl font-light text-clay-300">
          {n}
        </span>
      </div>
      <h3 className="mt-6 font-display text-2xl text-ink">{title}</h3>
      <p className="mt-3 text-[0.975rem] leading-relaxed text-cocoa-700">
        {text}
      </p>
    </motion.div>
  );
}
