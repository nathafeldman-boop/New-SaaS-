// ──────────────────────────────────────────────────────────────────────────
//  Client serveur Mistral (texte + vision Pixtral).
//  La clé est lue côté serveur uniquement (MISTRAL_API_KEY) — jamais exposée
//  au navigateur. Appelé exclusivement depuis les routes app/api/*.
// ──────────────────────────────────────────────────────────────────────────

import type {
  CutsResult,
  HairAnalysis,
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
    '"keepCurrentCut": boolean, "keepReason": string}.';

  const messages: Message[] = [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyse l'état et le type de ces cheveux à partir de la photo. Indique si la coupe actuelle est déjà le meilleur choix (keepCurrentCut).",
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
