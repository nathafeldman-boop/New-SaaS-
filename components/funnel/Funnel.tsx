"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { track } from "@/lib/track";
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
  Schedule,
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
  { id: "schedule", label: "Horaire", Component: Schedule },
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
    try {
      sessionStorage.removeItem("capilytix_funnel");
    } catch {}
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
    const canceled = params.get("canceled");

    const checkoutIndex = STEPS.findIndex((s) => s.id === "checkout");
    const cutsIndex = STEPS.findIndex((s) => s.id === "cuts");
    const paywallIndex = STEPS.findIndex((s) => s.id === "paywall");

    // Restaure l'état du funnel sauvegardé juste avant un départ vers Stripe.
    let hasSaved = false;
    try {
      const saved = sessionStorage.getItem("capilytix_funnel");
      if (saved) {
        setData(JSON.parse(saved));
        hasSaved = true;
      }
    } catch {}

    // Pas un retour de paiement Stripe : si on a un état sauvegardé, c'est que
    // l'utilisateur était parti vers le paiement puis est revenu (ex. bouton
    // « retour » du navigateur). On le replace pile sur l'étape Paiement au
    // lieu de tout recommencer depuis le début du guide.
    if (!sid && !canceled) {
      if (hasSaved) setIndex(checkoutIndex);
      return;
    }

    // Annulation (flèche retour de Stripe) : on revient pile sur l'étape Paiement.
    if (canceled && !sid) {
      setIndex(checkoutIndex);
      window.history.replaceState({}, "", "/scan");
      return;
    }

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

  // Tracking : chaque étape vue du funnel (pour le taux de conversion).
  useEffect(() => {
    track("funnel_step", { step: STEPS[index].id, index });
  }, [index]);

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
