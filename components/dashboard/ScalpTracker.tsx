"use client";

// ──────────────────────────────────────────────────────────────────────────
//  « Suis ta calvitie et ta ligne frontale »
//  Tête 3D bougeable + slider Norwood + fiche de stade + jauge de couverture.
//  Le stade de départ vient du diagnostic Mistral (diagnosis.norwoodStage).
// ──────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { NORWOOD_STAGES, getStage } from "@/lib/norwood";

// Le rendu WebGL ne doit jamais s'exécuter côté serveur.
const ScalpHead3D = dynamic(() => import("@/components/three/ScalpHead3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-clay-300 border-t-cocoa-500" />
    </div>
  ),
});

export function ScalpTracker({
  currentStage,
  hasDiagnosis,
}: {
  currentStage: number | null | undefined;
  hasDiagnosis: boolean;
}) {
  const youAreHere = Math.min(7, Math.max(1, Math.round(currentStage ?? 1)));
  const [stage, setStage] = useState(youAreHere);
  const data = useMemo(() => getStage(stage), [stage]);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <section className="rounded-5xl bg-ink p-6 text-cream shadow-soft">
        <p className="text-xs uppercase tracking-[0.22em] text-clay-300">Suivi du cuir chevelu</p>
        <h2 className="display-2 mt-2 text-2xl leading-tight">
          Suis ta calvitie et ta ligne frontale
        </h2>
        <p className="mt-2 text-sm text-clay-300">
          {hasDiagnosis
            ? `D'après ton scan, tu es au stade ${youAreHere} sur l'échelle de Norwood.`
            : "Fais ton scan pour situer automatiquement ton stade. En attendant, explore l'échelle."}
        </p>
      </section>

      {/* Tête 3D */}
      <section className="overflow-hidden rounded-4xl bg-gradient-to-b from-sand/70 to-paper/80 p-4 shadow-card ring-1 ring-clay-200/60">
        <div className="relative h-72 w-full">
          <ScalpHead3D stage={stage} />
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-paper/85 px-3 py-1 text-[0.66rem] font-medium text-cocoa-600 shadow-sm backdrop-blur">
            ✋ Fais pivoter la tête
          </span>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[0.66rem] font-semibold text-cream backdrop-blur">
            Stade {stage}
          </span>
        </div>

        {/* Slider Norwood */}
        <div className="mt-4 px-1">
          <div className="mb-2 flex items-center justify-between text-[0.7rem] text-cocoa-500">
            <span>Déplace le curseur pour voir chaque stade</span>
            <span className="font-medium text-cocoa-700">Norwood {stage}/7</span>
          </div>

          {/* Marqueur « Tu es ici » */}
          <div className="relative mb-1 h-5">
            <div
              className="absolute -translate-x-1/2 transition-all duration-300"
              style={{ left: `${((youAreHere - 1) / 6) * 100}%` }}
            >
              <span className="whitespace-nowrap rounded-full bg-clay-500 px-2 py-0.5 text-[0.6rem] font-semibold text-cream shadow-sm">
                Tu es ici
              </span>
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={7}
            step={1}
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
            className="scalp-range w-full"
            aria-label="Stade de Norwood"
          />

          <div className="mt-1 flex justify-between px-0.5 text-[0.62rem] text-cocoa-400">
            {NORWOOD_STAGES.map((s) => (
              <button
                key={s.stage}
                onClick={() => setStage(s.stage)}
                className={`tabular-nums transition-colors ${
                  s.stage === stage ? "font-bold text-cocoa-800" : "hover:text-cocoa-600"
                }`}
              >
                {s.stage}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Fiche du stade + jauge */}
      <motion.section
        key={stage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-ink px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-wider text-cream">
              Stade {data.stage}
            </span>
            <h3 className="display-2 mt-2 text-xl text-ink">{data.name}</h3>
          </div>
          <CoverageGauge baldPct={data.baldPct} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-sand px-2.5 py-0.5 text-[0.7rem] text-cocoa-700"
            >
              {t}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[0.92rem] leading-relaxed text-cocoa-700">{data.summary}</p>

        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-sand/60 p-3.5">
          <span className="mt-0.5 text-base">💧</span>
          <p className="text-[0.85rem] leading-relaxed text-cocoa-700">
            <span className="font-semibold text-ink">Conseil : </span>
            {data.advice}
          </p>
        </div>
      </motion.section>
    </div>
  );
}

function CoverageGauge({ baldPct }: { baldPct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, baldPct)) / 100;
  return (
    <div className="relative grid h-20 w-20 shrink-0 place-items-center">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(216,189,157,0.3)" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="url(#cov-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        <defs>
          <linearGradient id="cov-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eccfa6" />
            <stop offset="100%" stopColor="#c2855a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="font-display text-lg text-ink">{baldPct}%</span>
        <span className="mt-0.5 text-[0.5rem] uppercase tracking-wider text-cocoa-400">dégarni</span>
      </div>
    </div>
  );
}
