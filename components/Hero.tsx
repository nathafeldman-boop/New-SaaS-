"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site";
import {
  FaceLine,
  IconArrow,
  IconCamera,
  IconDrop,
  IconScissors,
  StrandFlow,
} from "./Illustrations";

const ease = [0.22, 1, 0.36, 1] as const;

const routine = [
  { icon: IconDrop, label: "Masque hydratant", time: "10 min" },
  { icon: IconScissors, label: "Pointes & soin", time: "5 min" },
  { icon: IconCamera, label: "Photo du jour", time: "30 s" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-grad-warm pt-28 sm:pt-32">
      {/* formes douces en arrière-plan */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-clay-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-latte/50 blur-3xl" />
      <StrandFlow className="pointer-events-none absolute -right-10 -top-6 h-[520px] w-[520px] text-clay-400/40" />

      <div className="container-page relative grid items-center gap-14 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
        {/* Colonne texte */}
        <div className="relative z-10 max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="eyebrow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
            Diagnostic capillaire par photo
          </motion.span>

          <h1 className="display-1 mt-6 text-balance text-[2.7rem] text-ink sm:text-6xl lg:text-[4.2rem]">
            Tes cheveux,{" "}
            <span className="relative whitespace-nowrap">
              <span className="italic text-cocoa-700">un rituel</span>
              <svg
                className="absolute -bottom-2 left-0 w-full text-clay-400"
                viewBox="0 0 220 12"
                fill="none"
                aria-hidden
              >
                <motion.path
                  d="M3 8C50 3 130 3 217 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease }}
                />
              </svg>
            </span>{" "}
            de 30 jours.
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-cocoa-700"
          >
            Prends-toi en photo chaque jour. {siteConfig.name} analyse tes
            cheveux et te construit une routine sur-mesure pour qu'ils
            redeviennent sains — et te laisse essayer des coupes avant le
            coiffeur.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a href="#tarif" className="btn-primary group">
              {siteConfig.cta.primary}
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#methode" className="btn-ghost">
              {siteConfig.cta.secondary}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cocoa-600"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
              Web app — pensée pour mobile
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
              Sans installation
            </span>
          </motion.div>
        </div>

        {/* Maquette téléphone */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="relative z-10 mx-auto w-full max-w-[330px]"
        >
          <PhoneMock />
        </motion.div>
      </div>
    </section>
  );
}

function PhoneMock() {
  return (
    <div className="relative">
      {/* carte flottante : coupe suggérée */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-10 top-24 z-20 hidden rounded-2xl border border-clay-200 bg-paper/95 p-3 shadow-card backdrop-blur sm:block"
      >
        <p className="text-[0.7rem] font-medium uppercase tracking-wider text-clay-600">
          Coupe à essayer
        </p>
        <p className="font-display text-base text-ink">Dégradé naturel</p>
      </motion.div>

      {/* carte flottante : progression */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute -right-8 bottom-20 z-20 hidden rounded-2xl border border-clay-200 bg-ink p-3 text-cream shadow-card sm:block"
      >
        <p className="text-[0.7rem] uppercase tracking-wider text-clay-300">
          Progression
        </p>
        <p className="font-display text-lg">Jour 12 / 30</p>
      </motion.div>

      {/* corps du téléphone */}
      <div className="relative rounded-[2.6rem] border border-clay-300/60 bg-ink p-2.5 shadow-glow">
        <div className="overflow-hidden rounded-[2.1rem] bg-cream">
          {/* zone photo */}
          <div className="relative bg-gradient-to-b from-clay-300 to-clay-400 px-5 pb-5 pt-8">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-ink/20" />
            <div className="mt-5 flex items-center justify-between text-cocoa-800">
              <span className="text-xs font-medium uppercase tracking-wider">
                Ta routine
              </span>
              <span className="rounded-full bg-cream/70 px-2.5 py-1 text-xs font-semibold">
                Jour 12
              </span>
            </div>
            <div className="mx-auto mt-3 w-32">
              <FaceLine className="h-auto w-full text-cocoa-800" />
            </div>
          </div>

          {/* liste routine */}
          <div className="space-y-2.5 px-4 py-5">
            <p className="px-1 font-display text-lg text-ink">Aujourd'hui</p>
            {routine.map(({ icon: Icon, label, time }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-clay-200/80 bg-paper px-3.5 py-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand text-cocoa-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-ink">
                  {label}
                </span>
                <span className="text-xs text-cocoa-600">{time}</span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-cream">
              <span className="text-sm font-medium">Photo du jour</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cream/15">
                <IconCamera className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
