import type {
  CutSuggestion,
  CutsResult,
  HairAnalysis,
  Routine,
} from "@/lib/funnel-types";

export type Choice = { type: "keep" } | { type: "cut"; cut: CutSuggestion };

export type FunnelData = {
  photo?: string;
  analysis?: HairAnalysis;
  analysisDemo?: boolean;
  cuts?: CutsResult;
  cutsDemo?: boolean;
  choice?: Choice;
  routine?: Routine;
  routineDemo?: boolean;
  paid?: boolean;
};

export type StepProps = {
  data: FunnelData;
  update: (patch: Partial<FunnelData>) => void;
  next: () => void;
  back: () => void;
  restart: () => void;
};
