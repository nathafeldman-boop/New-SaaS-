"use client";

import { Reveal } from "./Reveal";

const words = [
  "Hydratation",
  "Coupe sur-mesure",
  "Routine quotidienne",
  "Cuir chevelu",
  "Pousse",
  "Brillance",
  "Soin ciblé",
  "30 jours",
  "Diagnostic photo",
];

function Strip() {
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
  return (
    <Reveal>
      <div className="mask-fade-x relative flex overflow-hidden border-y border-clay-200/70 bg-sand/40 py-5">
        <div className="flex animate-marquee">
          <Strip />
          <Strip />
        </div>
      </div>
    </Reveal>
  );
}
