// ──────────────────────────────────────────────────────────────────────────
//  Client serveur Mistral (texte + vision Pixtral).
//  La clé est lue côté serveur uniquement (MISTRAL_API_KEY) — jamais exposée
//  au navigateur. Appelé exclusivement depuis les routes app/api/*.
// ──────────────────────────────────────────────────────────────────────────

import type {
  CutsResult,
  HairAnalysis,
  HairScores,
  ProductAnalysis,
  ProductReco,
  Routine,
} from "./funnel-types";

const API_URL = "https://api.mistral.ai/v1/chat/completions";

// Modèles surchargeables via variables d'environnement.
const VISION_MODEL = process.env.MISTRAL_VISION_MODEL ?? "pixtral-large-latest";
const TEXT_MODEL = process.env.MISTRAL_TEXT_MODEL ?? "mistral-large-latest";

type Part =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: string };

type Message = { role: "system" | "user"; content: string | Part[] };

export class MistralError extends Error {}

export function hasMistralKey(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY);
}

async function chatJSON<T>(
  model: string,
  messages: Message[],
  maxTokens = 2048,
): Promise<T> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new MistralError("MISTRAL_API_KEY manquante");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
    // garde-fou : on coupe AVANT le timeout de la fonction (60 s) pour
    // toujours renvoyer du JSON (repli démo) plutôt qu'une page d'erreur 504.
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new MistralError(`Mistral ${res.status}: ${detail.slice(0, 300)}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  return parseJSON<T>(content);
}

function parseJSON<T>(raw: string): T {
  let s = raw.trim();
  // retire d'éventuels ```json ... ```
  if (s.startsWith("```")) s = s.replace(/^```[a-z]*\s*/i, "").replace(/```$/, "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  try {
    return JSON.parse(s) as T;
  } catch {
    throw new MistralError("Réponse Mistral non parsable en JSON");
  }
}

/* ── Analyse capillaire (vision) ─────────────────────────────── */
export async function analyzeHair(imageDataUrl: string): Promise<HairAnalysis> {
  const system =
    "Tu es un expert capillaire (trichologue + barbier). Tu analyses une photo " +
    "de cheveux et tu réponds STRICTEMENT en JSON, en français, sans texte autour. " +
    "Sois bienveillant, précis et concret. Schéma attendu : " +
    '{"summary": string (2 phrases), "hairType": string, "condition": string, ' +
    '"strengths": string[2..3], "concerns": string[2..3], "faceShape": string, ' +
    '"norwoodStage": number (1 à 7, estimation de la calvitie/ligne frontale sur ' +
    "l'échelle de Norwood : 1 = aucun recul, 2-3 = golfes qui se creusent, " +
    "4-5 = dégarnissement frontal + vertex, 6-7 = avancé), " +
    '"keepCurrentCut": boolean, "keepReason": string}.';

  const messages: Message[] = [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyse l'état et le type de ces cheveux à partir de la photo. Estime le stade de Norwood (norwoodStage, 1 à 7) d'après la ligne frontale et le vertex visibles. Indique si la coupe actuelle est déjà le meilleur choix (keepCurrentCut).",
        },
        { type: "image_url", image_url: imageDataUrl },
      ],
    },
  ];

  return chatJSON<HairAnalysis>(VISION_MODEL, messages, 1024);
}

/* ── Recommandation de 15 coupes ─────────────────────────────── */
export async function recommendCuts(
  analysis: HairAnalysis,
): Promise<CutsResult> {
  const system =
    "Tu es un barbier-conseil. À partir d'une analyse capillaire, tu proposes " +
    "EXACTEMENT 15 coupes adaptées, classées de la plus pertinente à la moins " +
    "pertinente. Réponds STRICTEMENT en JSON français, sans texte autour. Schéma : " +
    '{"keepCurrent": boolean, "reason": string, "currentCutName": string, ' +
    '"cuts": [{"id": string, "name": string, "description": string, ' +
    '"why": string, "maintenance": string, "vibe": string}] (exactement 15)}. ' +
    "keepCurrent = true seulement si garder la coupe actuelle est réellement le meilleur choix.";

  const messages: Message[] = [
    { role: "system", content: system },
    {
      role: "user",
      content:
        "Analyse capillaire :\n" +
        JSON.stringify(analysis) +
        "\nPropose 15 coupes pertinentes pour cette personne.",
    },
  ];

  return chatJSON<CutsResult>(TEXT_MODEL, messages, 3000);
}

/* ── Génération de la routine 30 jours ───────────────────────── */
// Pour rester rapide et fiable (pas de timeout serverless), on demande à
// Mistral un PLAN COMPACT — un cycle de 7 jours réutilisable + des thèmes
// hebdomadaires — puis on le déplie en 30 jours côté serveur.
type RoutinePlan = {
  title: string;
  overview: string;
  weeklyTips: string[];
  weeks: string[]; // thème de chaque semaine
  pattern: { phase: string; title: string; focus: string; steps: string[] }[]; // 7 jours
};

const fallbackPattern: RoutinePlan["pattern"] = [
  { phase: "Nettoyage", title: "Lavage doux", focus: "Assainir sans agresser", steps: ["Shampoing doux", "Eau tiède", "Sécher en tamponnant"] },
  { phase: "Hydratation", title: "Masque nourrissant", focus: "Réparer les longueurs", steps: ["Masque sur longueurs", "Pose 10 min", "Rincer à l'eau fraîche"] },
  { phase: "Repos", title: "Jour léger", focus: "Laisser respirer le cuir chevelu", steps: ["Pas de chaleur", "Brossage doux", "Photo du jour"] },
  { phase: "Soin", title: "Huile sur pointes", focus: "Sceller l'hydratation", steps: ["1 goutte d'huile", "Sur les pointes"] },
  { phase: "Coiffage", title: "Définition", focus: "Structurer le mouvement", steps: ["Produit léger", "Coiffer aux doigts"] },
  { phase: "Hydratation", title: "Spray hydratant", focus: "Entretenir l'hydratation", steps: ["Brume hydratante", "Répartir sur longueurs"] },
  { phase: "Repos", title: "Récupération", focus: "Préparer la semaine suivante", steps: ["Taie en satin", "Photo du jour"] },
];

export async function generateRoutine(
  analysis: HairAnalysis,
  chosenCut: string,
): Promise<Routine> {
  const system =
    "Tu es un coach capillaire. À partir d'une analyse et d'une coupe choisie, tu " +
    "conçois une routine de 30 jours. Pour rester concis, tu renvoies un CYCLE de 7 " +
    "jours réutilisable + un thème par semaine. Réponds STRICTEMENT en JSON français, " +
    "sans texte autour. Schéma : " +
    '{"title": string, "overview": string, "weeklyTips": string[3..5], ' +
    '"weeks": string[4..5] (thème de chaque semaine), ' +
    '"pattern": [{"phase": string, "title": string, "focus": string, ' +
    '"steps": string[2..3]}] (EXACTEMENT 7 jours, variés : lavage, hydratation, ' +
    "repos, soin, coiffage)}. Reste réaliste et adapté à l'analyse.";

  const messages: Message[] = [
    { role: "system", content: system },
    {
      role: "user",
      content:
        "Analyse :\n" +
        JSON.stringify(analysis) +
        "\nCoupe choisie : " +
        chosenCut +
        "\nDonne le cycle de 7 jours et les thèmes hebdomadaires.",
    },
  ];

  const plan = await chatJSON<RoutinePlan>(TEXT_MODEL, messages, 1600);

  // dépliage en 30 jours
  const pattern = plan.pattern?.length ? plan.pattern : fallbackPattern;
  const weeks = plan.weeks?.length ? plan.weeks : [];
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const base = pattern[i % pattern.length];
    const wk = weeks.length ? weeks[Math.min(Math.floor(i / 7), weeks.length - 1)] : "";
    return {
      day,
      phase: base.phase,
      title: base.title,
      focus: wk ? `${wk} · ${base.focus}` : base.focus,
      steps: base.steps,
    };
  });

  return {
    title: plan.title || "Ta routine 30 jours",
    overview: plan.overview || "",
    weeklyTips: plan.weeklyTips ?? [],
    days,
  };
}

/* ── Rapport de score capillaire (radar) ─────────────────────── */
// On fixe les axes côté serveur ; Mistral ne renvoie que les valeurs.
const SCORE_AXES: { key: string; label: string }[] = [
  { key: "couverture", label: "Couverture" },
  { key: "hydratation", label: "Hydratation" },
  { key: "volume", label: "Volume" },
  { key: "sante_cheveu", label: "Santé du cheveu" },
  { key: "sante_cuir", label: "Cuir chevelu" },
  { key: "brillance", label: "Brillance" },
];

type ScorePair = { current?: number; potential?: number };

export async function computeScores(analysis: HairAnalysis): Promise<HairScores> {
  const system =
    "Tu es un trichologue. À partir d'une analyse capillaire, tu notes l'état du " +
    "cheveu sur 6 axes, de 0 à 100, avec une valeur ACTUELLE et une valeur POTENTIELLE " +
    "(atteignable après 30 jours de routine, toujours ≥ à l'actuelle, réaliste : +5 à +25). " +
    "Réponds STRICTEMENT en JSON français, sans texte autour. Schéma : " +
    '{"scores": {"couverture": {"current": number, "potential": number}, ' +
    '"hydratation": {...}, "volume": {...}, "sante_cheveu": {...}, ' +
    '"sante_cuir": {...}, "brillance": {...}}}. ' +
    "Sois cohérent avec les forces et préoccupations décrites.";

  const messages: Message[] = [
    { role: "system", content: system },
    { role: "user", content: "Analyse :\n" + JSON.stringify(analysis) },
  ];

  const raw = await chatJSON<{ scores: Record<string, ScorePair> }>(
    TEXT_MODEL,
    messages,
    600,
  );

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const axes = SCORE_AXES.map(({ key, label }) => {
    const v = raw.scores?.[key] ?? {};
    const current = clamp(v.current ?? 55);
    const potential = clamp(Math.max(v.potential ?? current + 12, current));
    return { key, label, current, potential };
  });
  const overall = Math.round(axes.reduce((s, a) => s + a.current, 0) / axes.length);
  return { axes, overall };
}

/* ── Recommandation de produits (vraies marques) ─────────────── */
export async function recommendProducts(
  analysis: HairAnalysis,
): Promise<ProductReco[]> {
  const system =
    "Tu es un expert en produits capillaires (vraies marques du marché). À partir " +
    "d'une analyse, tu recommandes 4 à 6 produits de MARQUES RÉELLES et existantes " +
    "(ex : L'Oréal, Kérastase, The Ordinary, Bumble and bumble, Redken, Aveda, " +
    "Davines, etc.), adaptés au profil, formant une routine cohérente " +
    "(nettoyage, soin, coiffage). Réponds STRICTEMENT en JSON français, sans texte " +
    "autour. Schéma : " +
    '{"products": [{"category": string (Shampoing|Après-shampoing|Masque|Sérum|Huile|Coiffage), ' +
    '"brand": string (vraie marque), "name": string (nom de gamme réaliste), ' +
    '"sizeMl": number, "matchPct": number (70-98), "why": string[2..3], ' +
    '"imageQuery": string (2-3 mots EN ANGLAIS pour une photo, ex: "shampoo bottle")}]}. ' +
    "Choisis des produits réellement adaptés au type et à l'état décrits.";

  const messages: Message[] = [
    { role: "system", content: system },
    {
      role: "user",
      content:
        "Analyse :\n" +
        JSON.stringify(analysis) +
        "\nRecommande une routine produits de vraies marques pour ce profil.",
    },
  ];

  const raw = await chatJSON<{ products: any[] }>(TEXT_MODEL, messages, 1800);
  const list = Array.isArray(raw.products) ? raw.products : [];
  return list.slice(0, 6).map((p, i) => ({
    id: `prod-${i + 1}`,
    category: String(p.category ?? "Soin"),
    brand: String(p.brand ?? ""),
    name: String(p.name ?? ""),
    sizeMl: typeof p.sizeMl === "number" ? p.sizeMl : null,
    matchPct: Math.max(0, Math.min(100, Math.round(p.matchPct ?? 85))),
    why: Array.isArray(p.why) ? p.why.slice(0, 3).map(String) : [],
    imageQuery: String(p.imageQuery ?? `${p.category ?? "hair"} product bottle`),
  }));
}

/* ── Analyse d'un produit (ingrédients) ──────────────────────── */
export async function analyzeProduct(
  input: { name?: string; image?: string },
  analysis: HairAnalysis | null,
): Promise<ProductAnalysis> {
  const system =
    "Tu es un expert en cosmétique capillaire. On te donne un produit (nom et/ou " +
    "photo de l'étiquette) et le profil capillaire de la personne. Tu évalues la " +
    "COMPATIBILITÉ du produit avec CE profil. Réponds STRICTEMENT en JSON français, " +
    "sans texte autour. Schéma : " +
    '{"productName": string, "matchPct": number (0-100), ' +
    '"detected": string[2..4] (attributs du profil utilisés pour juger), ' +
    '"keyIngredients": [{"name": string, "role": string (rôle en 4-6 mots), ' +
    '"good": boolean (bon pour CE profil)}] (3 à 6), ' +
    '"verdict": string (1-2 phrases), "pros": string[1..3], "cons": string[0..3]}. ' +
    "Base-toi sur des ingrédients plausibles si l'étiquette n'est pas lisible.";

  const profileTxt = analysis
    ? "Profil capillaire :\n" + JSON.stringify(analysis)
    : "Profil capillaire : inconnu (juge de façon générale).";

  const userContent: Part[] = [
    {
      type: "text",
      text:
        profileTxt +
        "\nProduit à analyser : " +
        (input.name?.trim() || "(voir photo de l'étiquette)") +
        "\nÉvalue la compatibilité avec ce profil.",
    },
  ];
  if (input.image?.startsWith("data:image")) {
    userContent.push({ type: "image_url", image_url: input.image });
  }

  const messages: Message[] = [
    { role: "system", content: system },
    { role: "user", content: userContent },
  ];

  // Vision si photo fournie, sinon modèle texte.
  const model = input.image?.startsWith("data:image") ? VISION_MODEL : TEXT_MODEL;
  const raw = await chatJSON<ProductAnalysis>(model, messages, 1100);

  return {
    productName: String(raw.productName ?? input.name ?? "Produit"),
    matchPct: Math.max(0, Math.min(100, Math.round(raw.matchPct ?? 60))),
    detected: Array.isArray(raw.detected) ? raw.detected.slice(0, 4).map(String) : [],
    keyIngredients: Array.isArray(raw.keyIngredients)
      ? raw.keyIngredients.slice(0, 6).map((k: any) => ({
          name: String(k.name ?? ""),
          role: String(k.role ?? ""),
          good: Boolean(k.good),
        }))
      : [],
    verdict: String(raw.verdict ?? ""),
    pros: Array.isArray(raw.pros) ? raw.pros.slice(0, 3).map(String) : [],
    cons: Array.isArray(raw.cons) ? raw.cons.slice(0, 3).map(String) : [],
  };
}
