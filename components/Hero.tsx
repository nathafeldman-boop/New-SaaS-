"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { IconArrow } from "./Illustrations";
import { LivingStrands } from "./LivingStrands";
import { Carousel } from "./Carousel";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-grad-warm pt-32 sm:pt-36">
      {/* formes douces en arrière-plan */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-clay-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-latte/50 blur-3xl" />
      <LivingStrands className="pointer-events-none absolute -right-10 -top-6 h-[520px] w-[520px] text-clay-400/45" />

      <div className="container-page relative grid items-center gap-14 pb-24 lg:grid-cols-2 lg:pb-32">
        {/* Colonne texte */}
        <div className="relative z-10 max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-clay-300 bg-paper/70 px-3.5 py-1.5 text-sm text-cocoa-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cocoa-700" />
            Diagnostic capillaire par IA · gratuit
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="display-1 mt-5 text-balance text-[2.8rem] text-ink sm:text-6xl lg:text-[4.2rem]"
          >
            De cheveux abîmés à{" "}
            <span className="relative whitespace-nowrap">
              <span className="italic text-cocoa-700">cheveux de fou</span>
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
            en 30 jours.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="mt-7 max-w-lg text-lg leading-relaxed text-cocoa-700"
          >
            Tu ne sais pas quoi faire pour tes cheveux ? Prends-toi en photo :{" "}
            {siteConfig.name} analyse <strong className="font-semibold text-ink">ton type de cheveux</strong>,
            te donne un <strong className="font-semibold text-ink">score sur 100</strong> et une{" "}
            <strong className="font-semibold text-ink">routine sur-mesure</strong>, jour par jour. Pas
            besoin de t'y connaître ni d'être discipliné — on te guide.
          </motion.p>

          {/* Accroche score (preuve de la transformation) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-clay-200 bg-paper/70 px-4 py-3"
          >
            <span className="font-display text-2xl text-cocoa-500">71<span className="text-sm">/100</span></span>
            <IconArrow className="h-4 w-4 text-cocoa-600" />
            <span className="font-display text-2xl text-ink">94<span className="text-sm text-cocoa-500">/100</span></span>
            <span className="text-sm text-cocoa-600">ton potentiel en 30 jours</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a href="/scan" className="btn-primary group">
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
              Basé sur la science du cheveu
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
              Sans engagement, annulable en 1 clic
            </span>
          </motion.div>
        </div>

        {/* Carrousel de résultats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="relative z-10"
        >
          <Carousel />
        </motion.div>
      </div>
    </section>
  );
}
