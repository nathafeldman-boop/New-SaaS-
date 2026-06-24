"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  // Retour de Stripe : ?session_id=... → on restaure l'état et on vérifie le paiement.
  const handledReturn = useRef(false);
  useEffect(() => {
    if (handledReturn.current) return;
    handledReturn.current = true;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (!sid) return;

    // restaure l'état du funnel sauvegardé avant la redirection
    try {
      const saved = sessionStorage.getItem("capilytix_funnel");
      if (saved) setData(JSON.parse(saved));
    } catch {}

    (async () => {
      let paid = false;
      try {
        const res = await fetch("/api/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid }),
        });
        const j = await res.json();
        paid = Boolean(j.ok && j.paid);
      } catch {}
      const cutsIndex = STEPS.findIndex((s) => s.id === "cuts");
      const paywallIndex = STEPS.findIndex((s) => s.id === "paywall");
      if (paid) {
        setData((d) => ({ ...d, paid: true }));
        setIndex(cutsIndex);
      } else {
        setIndex(paywallIndex);
      }
      window.history.replaceState({}, "", "/scan");
      sessionStorage.removeItem("capilytix_funnel");
    })();
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
            <img src="/brand/mark.png" alt={siteConfig.name} className="h-8 w-8 object-contain" />
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
