"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/components/Illustrations";
import { siteConfig } from "@/lib/site";
import type { FunnelData, StepProps } from "./types";
import {
  Analyzing,
  Capture,
  Checkout,
  Cuts,
  Generating,
  Guide,
  Intro,
  Paywall,
  Reveal,
  RoutineView,
} from "./Steps";

type Step = {
  id: string;
  label: string;
  Component: (p: StepProps) => JSX.Element | null;
};

const STEPS: Step[] = [
  { id: "intro", label: "Scan", Component: Intro },
  { id: "guide", label: "Guide", Component: Guide },
  { id: "capture", label: "Photo", Component: Capture },
  { id: "analyze", label: "Analyse", Component: Analyzing },
  { id: "reveal", label: "Diagnostic", Component: Reveal },
  { id: "paywall", label: "Accès", Component: Paywall },
  { id: "checkout", label: "Paiement", Component: Checkout },
  { id: "cuts", label: "Coupes", Component: Cuts },
  { id: "generate", label: "Génération", Component: Generating },
  { id: "routine", label: "Routine", Component: RoutineView },
];

export function Funnel() {
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<FunnelData>({});

  const update = useCallback(
    (patch: Partial<FunnelData>) => setData((d) => ({ ...d, ...patch })),
    [],
  );
  const next = useCallback(
    () => setIndex((i) => Math.min(STEPS.length - 1, i + 1)),
    [],
  );
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const restart = useCallback(() => {
    setData({});
    setIndex(0);
  }, []);

  const step = STEPS[index];
  const progress = useMemo(() => ((index + 1) / STEPS.length) * 100, [index]);
  const Current = step.Component;

  return (
    <div className="grain relative flex min-h-screen flex-col bg-cream">
      {/* barre du haut */}
      <header className="sticky top-0 z-30 border-b border-clay-200/70 bg-cream/80 backdrop-blur-md">
        <div className="container-page flex items-center justify-between py-3.5">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-clay-300">
              <LogoMark className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-medium text-ink">
              {siteConfig.name}
            </span>
          </a>
          <span className="text-sm text-cocoa-600">
            Étape {index + 1} / {STEPS.length} · {step.label}
          </span>
        </div>
        <div className="h-1 w-full bg-clay-200/60">
          <motion.div
            className="h-full rounded-r-full bg-cocoa-700"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </header>

      <main className="container-page flex-1 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Current
              data={data}
              update={update}
              next={next}
              back={back}
              restart={restart}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
