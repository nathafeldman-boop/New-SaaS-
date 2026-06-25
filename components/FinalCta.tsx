"use client";

import { siteConfig } from "@/lib/site";
import { Reveal } from "./Reveal";
import { IconArrow } from "./Illustrations";
import { LivingStrands } from "./LivingStrands";

export function FinalCta() {
  return (
    <section className="px-5 pb-16 sm:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-5xl bg-ink px-6 py-20 text-center sm:py-28">
        <LivingStrands className="pointer-events-none absolute -left-16 top-0 h-[420px] w-[420px] text-clay-500/45" />
        <LivingStrands delay={2.5} className="pointer-events-none absolute -right-16 bottom-0 h-[420px] w-[420px] rotate-180 text-clay-500/30" />
        <div className="relative mx-auto max-w-2xl">
          <Reveal>
            <h2 className="display-2 text-balance text-4xl text-cream sm:text-6xl">
              Tes cheveux peuvent changer. Découvre ton score.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-6 max-w-lg text-lg text-clay-200">
              Une photo suffit : reçois ton diagnostic et ton score sur 100{" "}
              <strong className="font-semibold text-cream">gratuitement</strong>. Puis laisse{" "}
              {siteConfig.name} te guider, jour après jour, pendant 30 jours.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <a
              href="/scan"
              className="group mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-cream px-7 py-4 text-sm font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-paper hover:shadow-glow"
            >
              {siteConfig.cta.primary}
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
