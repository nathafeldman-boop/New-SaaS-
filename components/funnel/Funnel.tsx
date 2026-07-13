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
  SignupGate,
} from "./Steps";
import {
  getPostQuestions,
  getPreQuestions,
  QuizScreen,
  StoryScreen,
  typeConfirmQuestion,
} from "./Onboarding";
import { LangSwitch, useLang } from "@/lib/i18n";

type Step = {
  id: string;
  label: string;
  Component: (p: StepProps) => JSX.Element | null;
};

// Une étape "story" par illustration générée (dimensions natives → pas de déformation).
const story =
  (src: string, width = 768, height = 1376): ((p: StepProps) => JSX.Element) =>
  (p) =>
    <StoryScreen {...p} src={src} width={width} height={height} />;

// Écrans de quiz sensibles à la langue (les questions changent avec FR/EN).
function PreQuizStep({ index, ...p }: StepProps & { index: number }) {
  const [lang] = useLang();
  return <QuizScreen {...p} question={getPreQuestions(lang)[index]} />;
}
function PostQuizStep({ index, ...p }: StepProps & { index: number }) {
  const [lang] = useLang();
  return <QuizScreen {...p} question={getPostQuestions(lang)[index]} />;
}
function TypeConfirmStep(p: StepProps) {
  const [lang] = useLang();
  return (
    <QuizScreen {...p} question={typeConfirmQuestion(p.data.analysis?.hairType, lang)} />
  );
}

// Quiz AVANT paiement : uniquement les objectifs de l'utilisateur — rien de
// descriptif, pour que l'IA prouve d'elle-même ce qu'elle lit sur la photo.
const preQuizSteps: Step[] = getPreQuestions("fr").map((q, i) => ({
  id: `quiz-pre-${q.id}`,
  label: "Objectifs",
  Component: (p: StepProps) => <PreQuizStep {...p} index={i} />,
}));

// Quiz APRÈS paiement : ouvre sur la confirmation du type détecté par l'IA
// (elle montre qu'elle a vu juste), puis affine les habitudes.
const postQuizSteps: Step[] = [
  {
    id: "quiz-post-type",
    label: "Vérification",
    Component: TypeConfirmStep,
  },
  ...getPostQuestions("fr").map((q, i) => ({
    id: `quiz-post-${q.id}`,
    label: "Personnalisation",
    Component: (p: StepProps) => <PostQuizStep {...p} index={i} />,
  })),
];

const STEPS: Step[] = [
  { id: "intro", label: "Bienvenue", Component: Intro },
  // Compte créé dès l'entrée (Google 1 clic ou email + mot de passe) :
  // chaque personne qui commence le scan devient un utilisateur relançable.
  { id: "signup", label: "Ton compte", Component: SignupGate },
  { id: "story-transfo", label: "Transformation", Component: story("/onboarding/transformation.png") },
  ...preQuizSteps,
  { id: "story-ia", label: "Analyse IA", Component: story("/onboarding/analyse-ia.png") },
  { id: "guide", label: "Photo", Component: Guide },
  { id: "capture", label: "Photo", Component: Capture },
  { id: "analyze", label: "Analyse", Component: Analyzing },
  { id: "story-ready", label: "Recommandations", Component: story("/onboarding/recommandations.png") },
  { id: "reveal", label: "Diagnostic", Component: Reveal },
  { id: "paywall", label: "Accès", Component: Paywall },
  { id: "checkout", label: "Paiement", Component: Checkout },
  ...postQuizSteps,
  { id: "cuts", label: "Coupes", Component: Cuts },
  { id: "generate", label: "Génération", Component: Generating },
  { id: "schedule", label: "Horaire", Component: Schedule },
  { id: "routine", label: "Routine", Component: RoutineView },
];

// Libellés du header en anglais (par id d'étape ; les quiz par préfixe).
const LABELS_EN: Record<string, string> = {
  intro: "Welcome",
  signup: "Your account",
  "story-transfo": "Transformation",
  "story-ia": "AI analysis",
  guide: "Photo",
  capture: "Photo",
  analyze: "Analysis",
  "story-ready": "Recommendations",
  reveal: "Diagnosis",
  paywall: "Access",
  checkout: "Payment",
  "quiz-post-type": "Verification",
  cuts: "Haircuts",
  generate: "Generating",
  schedule: "Schedule",
  routine: "Routine",
};

function stepLabel(step: Step, en: boolean): string {
  if (!en) return step.label;
  if (LABELS_EN[step.id]) return LABELS_EN[step.id];
  if (step.id.startsWith("quiz-pre")) return "Goals";
  if (step.id.startsWith("quiz-post")) return "Personalization";
  return step.label;
}

export function Funnel() {
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<FunnelData>({});
  const [lang] = useLang();
  const en = lang === "en";

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
    // Après paiement, on enchaîne sur le quiz post-paiement (confirmation IA).
    const afterPayIndex = STEPS.findIndex((s) => s.id.startsWith("quiz-post"));
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
        setIndex(afterPayIndex);
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-cocoa-600">
              {en ? "Step" : "Étape"} {index + 1} / {STEPS.length} · {stepLabel(step, en)}
            </span>
            <LangSwitch />
          </div>
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
