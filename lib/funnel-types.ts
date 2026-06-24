// Types partagés du funnel (analyse → coupes → routine).

export type HairAnalysis = {
  summary: string;
  hairType: string;
  condition: string;
  strengths: string[];
  concerns: string[];
  faceShape?: string;
  /** Stade estimé sur l'échelle de Norwood (1 = aucun signe → 7 = avancé). */
  norwoodStage?: number;
  /** true si la coupe actuelle est déjà le meilleur choix */
  keepCurrentCut: boolean;
  keepReason: string;
};

export type CutSuggestion = {
  id: string;
  name: string;
  description: string;
  why: string;
  maintenance: string;
  vibe: string;
};

export type CutsResult = {
  keepCurrent: boolean;
  reason: string;
  currentCutName: string;
  cuts: CutSuggestion[];
};

export type RoutineDay = {
  day: number;
  phase: string;
  title: string;
  focus: string;
  steps: string[];
};

export type Routine = {
  title: string;
  overview: string;
  days: RoutineDay[];
  weeklyTips: string[];
};

/** Réponse standard des routes API du funnel. */
export type ApiResult<T> = {
  ok: boolean;
  /** true quand le contenu est un exemple (clé Mistral absente / injoignable) */
  demo?: boolean;
  data?: T;
  error?: string;
};
