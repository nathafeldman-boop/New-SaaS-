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
  /** Rapport de score multi-axes (radar), généré par Mistral. */
  scores?: HairScores;
  /** true si la coupe actuelle est déjà le meilleur choix */
  keepCurrentCut: boolean;
  keepReason: string;
};

/* ── Rapport de score capillaire (radar) ─────────────────────── */
export type ScoreAxis = {
  key: string;
  label: string;
  /** 0 → 100 */
  current: number;
  /** 0 → 100, potentiel atteignable avec la routine (≥ current) */
  potential: number;
};

export type HairScores = {
  axes: ScoreAxis[];
  /** moyenne actuelle (0-100) */
  overall: number;
};

/* ── Recommandation de produits (vraies marques via Mistral) ──── */
export type ProductReco = {
  id: string;
  /** Shampoing · Après-shampoing · Sérum · Masque · Huile … */
  category: string;
  brand: string;
  name: string;
  sizeMl?: number | null;
  /** 0 → 100, pertinence pour ce profil */
  matchPct: number;
  /** 2-3 raisons concrètes */
  why: string[];
  /** Requête Pexels (anglais) générée par Mistral pour illustrer. */
  imageQuery?: string;
  /** Rempli côté serveur via Pexels. */
  imageUrl?: string | null;
};

/* ── Analyse d'un produit (ingrédients) ──────────────────────── */
export type ProductAnalysis = {
  productName: string;
  /** 0 → 100, compatibilité avec le profil capillaire */
  matchPct: number;
  /** Attributs détectés du profil utilisé pour juger ("Faible densité"…) */
  detected: string[];
  keyIngredients: { name: string; role: string; good: boolean }[];
  verdict: string;
  pros: string[];
  cons: string[];
};

export type CutSuggestion = {
  id: string;
  name: string;
  description: string;
  why: string;
  maintenance: string;
  vibe: string;
  /** Photo de la coupe (issue du catalogue), si on a pu en associer une. */
  image?: string | null;
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
