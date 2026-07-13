"use client";

import { Reveal } from "./Reveal";
import { useLang } from "@/lib/i18n";

const WORDS = {
  fr: [
    "Hydratation",
    "Coupe sur-mesure",
    "Routine quotidienne",
    "Cuir chevelu",
    "Pousse",
    "Brillance",
    "Soin ciblé",
    "30 jours",
    "Diagnostic photo",
  ],
  en: [
    "Hydration",
    "Tailored haircut",
    "Daily routine",
    "Scalp health",
    "Growth",
    "Shine",
    "Targeted care",
    "30 days",
    "Photo diagnosis",
  ],
};

function Strip({ words }: { words: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-10 px-5">
      {words.map((w) => (
        <span key={w} className="flex items-center gap-10">
          <span className="font-display text-lg font-light tracking-tight text-cocoa-700/80 sm:text-xl">
            {w}
          </span>
          <span className="text-clay-400" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  const [lang] = useLang();
  const words = WORDS[lang];
  return (
    <Reveal>
      <div className="mask-fade-x relative flex overflow-hidden border-y border-clay-200/70 bg-sand/40 py-5">
        <div className="flex animate-marquee">
          <Strip words={words} />
          <Strip words={words} />
        </div>
      </div>
    </Reveal>
  );
}
