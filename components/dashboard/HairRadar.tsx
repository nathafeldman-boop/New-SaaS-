"use client";

// ──────────────────────────────────────────────────────────────────────────
//  « Visualise ton rapport de score capillaire » — radar multi-axes.
//  Actuel (rempli) vs Potentiel (contour). Données générées par Mistral
//  (/api/scores) à partir du diagnostic, mises en cache dans le diagnostic.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { HairScores } from "@/lib/funnel-types";

export function HairRadar({
  initialScores,
  hasDiagnosis,
}: {
  initialScores: HairScores | null;
  hasDiagnosis: boolean;
}) {
  const [scores, setScores] = useState<HairScores | null>(initialScores);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (scores || !hasDiagnosis) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/scores", { method: "POST" })
      .then((r) => r.json())
      .then((r) => {
        if (cancelled) return;
        if (r.ok && r.data) {
          setScores(r.data);
          setDemo(Boolean(r.demo));
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [scores, hasDiagnosis]);

  if (!hasDiagnosis) {
    return (
      <section className="rounded-4xl border border-dashed border-clay-300 bg-paper/50 p-8 text-center">
        <p className="text-sm text-cocoa-600">
          Fais ton scan pour débloquer ton rapport de score capillaire.
        </p>
        <a href="/scan" className="btn-primary mt-4 inline-flex">
          Faire mon scan
        </a>
      </section>
    );
  }

  if (loading || !scores) {
    return (
      <section className="grid h-72 place-items-center rounded-4xl bg-paper/70 ring-1 ring-clay-200/60">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-clay-300 border-t-cocoa-500" />
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="eyebrow">Rapport capillaire</p>
          <h3 className="display-2 mt-2 text-xl text-ink">Ton score en un coup d'œil</h3>
        </div>
        <div className="text-right">
          <span className="font-display text-3xl text-ink">{scores.overall}</span>
          <span className="text-sm text-cocoa-500">/100</span>
        </div>
      </div>

      <RadarChart scores={scores} />

      <div className="mt-4 flex items-center justify-center gap-5 text-xs">
        <span className="inline-flex items-center gap-1.5 text-cocoa-700">
          <span className="h-2.5 w-2.5 rounded-full bg-clay-400" /> Actuel
        </span>
        <span className="inline-flex items-center gap-1.5 text-cocoa-500">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-cocoa-400 bg-transparent" />
          Potentiel
        </span>
      </div>

      {demo && (
        <p className="mt-3 text-center text-[0.7rem] text-cocoa-400">
          Exemple — connecte Mistral pour ton rapport personnalisé.
        </p>
      )}
    </motion.section>
  );
}

function RadarChart({ scores }: { scores: HairScores }) {
  const axes = scores.axes;
  const n = axes.length;
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const R = 96;

  const pt = (i: number, value: number) => {
    const ang = (-90 + (i * 360) / n) * (Math.PI / 180);
    const r = (Math.max(0, Math.min(100, value)) / 100) * R;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  const current = poly(axes.map((a) => a.current));
  const potential = poly(axes.map((a) => a.potential));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto mt-2 h-72 w-72">
      {/* Grille concentrique */}
      {[25, 50, 75, 100].map((lvl) => (
        <polygon
          key={lvl}
          points={poly(axes.map(() => lvl))}
          fill="none"
          stroke="rgba(216,189,157,0.35)"
          strokeWidth="1"
        />
      ))}
      {/* Rayons + labels */}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 100);
        const [lx, ly] = pt(i, 128);
        const anchor = Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end";
        return (
          <g key={a.key}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(216,189,157,0.3)" strokeWidth="1" />
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-cocoa-600"
              style={{ fontSize: "9.5px", fontWeight: 600 }}
            >
              {a.label}
            </text>
            <text
              x={lx}
              y={ly + 11}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-ink"
              style={{ fontSize: "10px", fontWeight: 700 }}
            >
              {a.current}
            </text>
          </g>
        );
      })}
      {/* Potentiel (contour) */}
      <polygon
        points={potential}
        fill="none"
        stroke="#6b5440"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      {/* Actuel (rempli) */}
      <motion.polygon
        points={current}
        fill="rgba(194,133,90,0.32)"
        stroke="#c2855a"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` } as any}
      />
    </svg>
  );
}
