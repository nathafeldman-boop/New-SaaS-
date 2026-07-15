import type {
  CutSuggestion,
  CutsResult,
  HairAnalysis,
  HairScores,
  Routine,
} from "@/lib/funnel-types";

export type Choice = { type: "keep" } | { type: "cut"; cut: CutSuggestion };

export type FunnelData = {
  photo?: string;
  analysis?: HairAnalysis;
  analysisDemo?: boolean;
  scores?: HairScores;
  scoresDemo?: boolean;
  cuts?: CutsResult;
  cutsDemo?: boolean;
  choice?: Choice;
  routine?: Routine;
  routineDemo?: boolean;
  /** Heure locale "HH:MM" choisie pour faire la routine chaque jour. */
  routineTime?: string;
  /** Décalage local vs UTC en minutes (= -getTimezoneOffset()). */
  routineTzOffset?: number;
  /** Réponses du quiz d'onboarding (id question → valeur choisie). */
  quizAnswers?: Record<string, string>;
  /** Email capté avant le paywall (lead) — préremplit le paiement. */
  leadEmail?: string;
  paid?: boolean;
};

export type StepProps = {
  data: FunnelData;
  update: (patch: Partial<FunnelData>) => void;
  next: () => void;
  back: () => void;
  restart: () => void;
};
