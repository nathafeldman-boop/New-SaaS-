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
import { HAIR_KNOWLEDGE } from "./hair-knowledge";
import { fallbackPattern, type PatternDay } from "./routine-pattern";

const API_URL = "https://api.mistral.ai/v1/chat/completions";

// ──────────────────────────────────────────────────────────────────────────
// Sélection de modèle « auto-réparante ».
// Les alias de modèles Mistral changent (ex. « pixtral-large-latest » a été
// retiré → erreur 400 invalid_model). Plutôt que de dépendre d'un seul nom, on
// donne une LISTE de candidats par rôle et on prend le premier qui répond. Le
// modèle qui marche est mémorisé pour les appels suivants (pas de latence en
// plus). Chaque rôle reste surchargeable via variable d'environnement.
// ──────────────────────────────────────────────────────────────────────────
type ModelRole = "vision" | "text" | "fast";

const dedupe = (a: (string | undefined)[]) =>
  [...new Set(a.filter(Boolean) as string[])];

const MODEL_CANDIDATES: Record<ModelRole, string[]> = {
  // Modèles multimodaux (analyse photo).
  vision: dedupe([
    process.env.MISTRAL_VISION_MODEL,
    "mistral-medium-latest",
    "pixtral-12b-2409",
    "pixtral-large-latest",
    "mistral-small-latest",
  ]),
  // Modèles texte haut de gamme (coupes, routine).
  text: dedupe([
    process.env.MISTRAL_TEXT_MODEL,
    "mistral-large-latest",
    "mistral-medium-latest",
    "mistral-small-latest",
  ]),
  // Modèle rapide pour les appels moins critiques (scores, produits).
  fast: dedupe([
    process.env.MISTRAL_FAST_MODEL,
    "mistral-small-latest",
    "mistral-medium-latest",
  ]),
};

// Modèle retenu (celui qui a répondu) par rôle, mémorisé le temps de l'instance.
const resolvedModel: Partial<Record<ModelRole, string>> = {};

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

// Extrait le code HTTP d'une MistralError (message « Mistral 400: … »).
function mistralStatus(e: unknown): number | null {
  if (e instanceof MistralError) {
    const m = e.message.match(/Mistral (\d{3}):/);
    if (m) return Number(m[1]);
  }
  return null;
}

// Essaie les modèles candidats du rôle jusqu'à en trouver un qui répond.
// - 401/402/429 (clé, crédits, quota) → inutile d'essayer d'autres modèles.
// - 400/403/404 (modèle indisponible / non accessible) → on tente le suivant.
// - autre (réseau, 5xx, parse) → on remonte l'erreur.
async function chatJSONResilient<T>(
  role: ModelRole,
  messages: Message[],
  maxTokens = 2048,
): Promise<T> {
  const cached = resolvedModel[role];
  const candidates = cached ? [cached] : MODEL_CANDIDATES[role];
  let lastErr: unknown = new MistralError(`Aucun modèle ${role} disponible`);
  for (const model of candidates) {
    try {
      const out = await chatJSON<T>(model, messages, maxTokens);
      resolvedModel[role] = model; // on mémorise celui qui marche
      return out;
    } catch (e) {
      lastErr = e;
      const st = mistralStatus(e);
      if (st === 401 || st === 402 || st === 429) throw e;
      if (st === 400 || st === 403 || st === 404) continue;
      throw e;
    }
  }
  throw lastErr;
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

/* ── Bilan de santé de l'IA (endpoint /api/ai-health) ────────── */
// Image JPEG 1x1 minimale : suffit à vérifier qu'un modèle VISION accepte
// bien une image (le contenu importe peu, on teste la tuyauterie).
const TINY_JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==";

export async function checkAiHealth(): Promise<{
  ok: boolean;
  vision: { ok: boolean; model?: string; error?: string };
  text: { ok: boolean; model?: string; error?: string };
}> {
  const probe = async (role: ModelRole, messages: Message[]) => {
    try {
      await chatJSONResilient<Record<string, unknown>>(role, messages, 30);
      return { ok: true, model: resolvedModel[role] };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  const vision = await probe("vision", [
    {
      role: "user",
      content: [
        { type: "text", text: 'Réponds en JSON: {"ok":true}' },
        { type: "image_url", image_url: TINY_JPEG },
      ],
    },
  ]);
  const text = await probe("text", [
    { role: "user", content: 'Réponds en JSON: {"ok":true}' },
  ]);

  return { ok: vision.ok && text.ok, vision, text };
}

/* ── Analyse capillaire (vision) ─────────────────────────────── */
const HAIR_TYPE_LABELS: Record<string, string> = {
  raides: "raides (type 1)",
  ondules: "ondulés (type 2)",
  boucles: "bouclés (type 3)",
  crepus: "crépus (type 4)",
};

// Consigne de langue ajoutée aux prompts (le schéma JSON reste identique).
const langNote = (lang?: string) =>
  lang === "en"
    ? "\n\nLANGUAGE: write ALL user-facing text (every JSON string value) in ENGLISH. Keep the JSON keys unchanged."
    : "";

export async function analyzeHair(
  imageDataUrl: string,
  quiz?: Record<string, string>,
  lang?: string,
): Promise<HairAnalysis> {
  const declaredType = quiz?.type ? HAIR_TYPE_LABELS[quiz.type] : null;
  const system =
    HAIR_KNOWLEDGE +
    "\n\nTu es un expert capillaire (trichologue + barbier). Tu analyses une photo " +
    "de cheveux et tu réponds STRICTEMENT en JSON, en français, sans texte autour. " +
    "Identifie le type Walker (1-4) et fonde ton analyse sur le référentiel ci-dessus. " +
    "CLASSIFICATION DU TYPE — sois rigoureux, c'est l'erreur la plus fréquente : " +
    "observe le MOTIF de la fibre, pas seulement le volume global. " +
    "Type 2 (ondulé) = vagues en S larges, PAS de boucle fermée. " +
    "Type 3 (bouclé) = vraies boucles en spirale/tire-bouchon (de la taille d'un doigt " +
    "à un stylo), bien refermées sur elles-mêmes. " +
    "Type 4 (crépu) = frisures très serrées en Z/ressort, motif dense et compact. " +
    "En cas de doute entre ondulé et bouclé/crépu, si tu vois des spirales ou des " +
    "frisures serrées c'est du 3 ou du 4, JAMAIS du 2. Ne sous-estime jamais la " +
    "texture : mieux vaut reconnaître des boucles/crépus marqués que les aplatir en « ondulé ». " +
    (declaredType
      ? `IMPORTANT : l'utilisateur DÉCLARE lui-même avoir des cheveux ${declaredType}. ` +
        "Considère cette déclaration comme la VÉRITÉ pour le type (hairType / classification " +
        "Walker) : ne le classe JAMAIS dans un autre type, même si la photo prête à confusion " +
        "(lumière, humidité, coiffage). Affine seulement l'état, la santé et les coupes. "
      : "") +
    "Sois bienveillant, précis et concret.\n\n" +
    "RÈGLES DU DIAGNOSTIC — il est lu JUSTE avant l'offre payante, il doit donner " +
    "envie d'agir SANS jamais mentir, exagérer ni évoquer une maladie :\n" +
    "1) Personnalise à fond : parle à CETTE personne en t'appuyant sur son type, " +
    "l'état visible ET ses réponses au quiz (objectif, problème n°1, temps dispo, " +
    "niveau de confiance). Cite implicitement ce qui la concerne.\n" +
    "2) Éduque : explique brièvement le POURQUOI (mécanisme) de chaque point faible " +
    "→ ça crée la crédibilité et la confiance.\n" +
    "3) Crée l'écart : montre le vrai potentiel atteignable et ce qui l'empêche " +
    "AUJOURD'HUI (mauvaises habitudes, produits pris au hasard, entretien inadapté) " +
    "pour donner envie de combler cet écart.\n" +
    "4) Urgence honnête : rappelle que prévenir vaut mieux que réparer, surtout tôt " +
    "(densité, casse), sans jamais faire peur.\n" +
    "5) Cadre la solution : la clé n'est pas PLUS de produits, c'est LA BONNE MÉTHODE " +
    "adaptée à son type, jour après jour — précisément ce qu'apporte un programme suivi.\n" +
    "6) Ton expert, franc et encourageant ; jamais culpabilisant ni de promesse médicale.\n\n" +
    "Schéma attendu : " +
    '{"summary": string (2 phrases PERCUTANTES et personnalisées : ce qui va + le potentiel à débloquer), ' +
    '"hairType": string, "condition": string, ' +
    '"strengths": string[2..3] (atouts réels à valoriser), ' +
    '"concerns": string[2..3] (points faibles concrets, formulés de façon actionnable), "faceShape": string, ' +
    '"norwoodStage": number (1 à 7, estimation de la calvitie/ligne frontale sur ' +
    "l'échelle de Norwood : 1 = aucun recul, 2-3 = golfes qui se creusent, " +
    "4-5 = dégarnissement frontal + vertex, 6-7 = avancé), " +
    '"keepCurrentCut": boolean, "keepReason": string (une phrase motivante qui justifie le choix de coupe)}.' +
    langNote(lang);

  const messages: Message[] = [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        {
          type: "text",
          text:
            (declaredType
              ? `Type déclaré par l'utilisateur : ${declaredType} (à respecter). `
              : "") +
            (quiz ? `Réponses du quiz utilisateur : ${JSON.stringify(quiz)}. ` : "") +
            "Analyse l'état et le type de ces cheveux à partir de la photo. Estime le stade de Norwood (norwoodStage, 1 à 7) d'après la ligne frontale et le vertex visibles. Indique si la coupe actuelle est déjà le meilleur choix (keepCurrentCut).",
        },
        { type: "image_url", image_url: imageDataUrl },
      ],
    },
  ];

  return chatJSONResilient<HairAnalysis>("vision", messages, 1024);
}

/* ── Recommandation de 15 coupes ─────────────────────────────── */
export async function recommendCuts(
  analysis: HairAnalysis,
  lang?: string,
): Promise<CutsResult> {
  const system =
    HAIR_KNOWLEDGE +
    "\n\nTu es un barbier-conseil. À partir d'une analyse capillaire, tu proposes " +
    "EXACTEMENT 15 coupes adaptées (au type Walker, à la texture, à la forme du visage " +
    "et au stade de Norwood), classées de la plus pertinente à la moins " +
    "pertinente. Réponds STRICTEMENT en JSON français, sans texte autour. Schéma : " +
    '{"keepCurrent": boolean, "reason": string, "currentCutName": string, ' +
    '"cuts": [{"id": string, "name": string, "description": string, ' +
    '"why": string, "maintenance": string, "vibe": string}] (exactement 15)}. ' +
    "keepCurrent = true seulement si garder la coupe actuelle est réellement le meilleur choix. " +
    "Si le champ 'quiz.type' de l'analyse contredit 'hairType', c'est la réponse de " +
    "l'utilisateur (quiz.type) qui fait foi : il a confirmé ou corrigé le diagnostic. " +
    "Tiens compte du champ 'quiz' de l'analyse : privilégie des coupes à ENTRETIEN FAIBLE si le " +
    "temps dispo est court (time), oriente le style vers l'objectif (goal) et le niveau de confiance " +
    "(confidence), et si le stade de Norwood est élevé propose des coupes qui masquent malinement le " +
    "recul frontal. Dans chaque 'why', explique pourquoi CETTE coupe lui va (visage + type + objectif)." +
    langNote(lang);

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

  return chatJSONResilient<CutsResult>("text", messages, 3000);
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
  pattern: PatternDay[]; // 7 jours
};

export async function generateRoutine(
  analysis: HairAnalysis,
  chosenCut: string,
  lang?: string,
): Promise<Routine> {
  const system =
    HAIR_KNOWLEDGE +
    "\n\nTu es un coach capillaire. À partir d'une analyse et d'une coupe choisie, tu " +
    "conçois une routine de 30 jours ADAPTÉE au type Walker et aux besoins identifiés, " +
    "en appliquant les principes fondés sur les preuves ci-dessus (fréquence de lavage, " +
    "après-shampoing systématique, protection thermique, démêlage doux, etc.). " +
    "Pour rester concis, tu renvoies un CYCLE de 7 " +
    "jours réutilisable + un thème par semaine. Réponds STRICTEMENT en JSON français, " +
    "sans texte autour. Schéma : " +
    '{"title": string, "overview": string, "weeklyTips": string[3..5], ' +
    '"weeks": string[4..5] (thème PROGRESSIF de chaque semaine, qui montre une ' +
    "évolution : réparation → renforcement → croissance → entretien), " +
    '"pattern": [{"phase": string, "title": string, "focus": string, ' +
    '"duration": string (ex "8 min"), "why": string (1-2 phrases : le MÉCANISME ' +
    'derrière ce soin, pédagogique et motivant — pas juste "c\'est important"), ' +
    '"tip": string (1 astuce concrète de pro, un détail que peu de gens connaissent), ' +
    '"steps": string[4..6] (étapes précises, actionnables, dans l\'ordre d\'exécution : ' +
    "préparation → application → temps de pose si besoin → rinçage/finition), " +
    '"mistakes": string[2..3] (erreurs fréquentes et concrètes à éviter CE JOUR-LÀ, ' +
    'avec la conséquence — ex "X → Y"), ' +
    '"expected": string (1 phrase concrète : ce que la personne doit ressentir ou observer ' +
    "après ce soin, pour qu'elle sache que ça marche)}] (EXACTEMENT 7 jours, " +
    "variés : lavage, hydratation, repos, soin, coiffage). CHAQUE JOUR DOIT ÊTRE DENSE : " +
    "beaucoup de contenu concret, pas de généralités. Sois expert, précis et " +
    "encourageant. Adapte tout à l'analyse et à la coupe choisie.\n\n" +
    "PERSONNALISE À FOND avec le champ 'quiz' de l'analyse (s'il existe) — la routine " +
    "doit sembler faite SUR-MESURE pour cette personne. Si 'quiz.type' contredit " +
    "'hairType', la réponse de l'utilisateur (quiz.type) fait foi :\n" +
    "- DURÉE quotidienne calée sur le temps dispo (time : <2min → routine ultra-express ; " +
    ">10min → soins plus poussés) ;\n" +
    "- routine CENTRÉE sur le problème n°1 (problem) et la priorité (priority) ;\n" +
    "- fréquence de lavage/soins cohérente avec washFreq et oiliness ;\n" +
    "- part du niveau produits actuel (products) : ne surcharge pas un débutant, " +
    "enrichis un initié ;\n" +
    "- ton plus rassurant si la confiance (confidence) est basse ;\n" +
    "- l'overview et les weeklyTips parlent DIRECTEMENT de son objectif (goal)." +
    langNote(lang);

  const messages: Message[] = [
    { role: "system", content: system },
    {
      role: "user",
      content:
        "Analyse :\n" +
        JSON.stringify(analysis) +
        "\nCoupe choisie : " +
        chosenCut +
        "\nDonne le cycle de 7 jours — RICHE : why, tip, duration, 4-6 étapes, 2-3 mistakes, " +
        "expected pour CHAQUE jour — et les thèmes hebdomadaires progressifs.",
    },
  ];

  const plan = await chatJSONResilient<RoutinePlan>("text", messages, 2400);

  // dépliage en 30 jours, avec décalage du cycle chaque semaine pour éviter
  // que le jour 8 soit identique au jour 1 (variété + sensation de progression).
  // Chaque jour est normalisé : si l'IA omet why/tip/duration ou renvoie moins
  // de 3 étapes, on comble depuis le cycle expert — jamais de séance « vide ».
  const rawPattern = plan.pattern?.length ? plan.pattern : fallbackPattern;
  const pattern = rawPattern.map((p, i) => {
    const fb = fallbackPattern[i % fallbackPattern.length];
    return {
      phase: p.phase || fb.phase,
      title: p.title || fb.title,
      focus: p.focus || fb.focus,
      duration: p.duration || fb.duration,
      why: p.why || fb.why,
      tip: p.tip || fb.tip,
      steps: p.steps?.length ? p.steps : fb.steps,
      mistakes: p.mistakes?.length ? p.mistakes : fb.mistakes,
      expected: p.expected || fb.expected,
    };
  });
  const weeks = plan.weeks?.length ? plan.weeks : [];
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const week = Math.floor(i / 7);
    const base = pattern[(i + week) % pattern.length];
    const wk = weeks.length ? weeks[Math.min(week, weeks.length - 1)] : "";
    return {
      day,
      phase: base.phase,
      title: base.title,
      focus: wk ? `${wk} · ${base.focus}` : base.focus,
      steps: base.steps,
      why: base.why,
      tip: base.tip,
      duration: base.duration,
      mistakes: base.mistakes,
      expected: base.expected,
    };
  });

  return {
    title: plan.title || (lang === "en" ? "Your 30-day routine" : "Ta routine 30 jours"),
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
    HAIR_KNOWLEDGE +
    "\n\nTu es un trichologue. À partir d'une analyse capillaire, tu notes l'état du " +
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

  const raw = await chatJSONResilient<{ scores: Record<string, ScorePair> }>(
    "fast",
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
    HAIR_KNOWLEDGE +
    "\n\nTu es un expert en produits capillaires (vraies marques du marché). À partir " +
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

  const raw = await chatJSONResilient<{ products: any[] }>("fast", messages, 1800);
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
  const role: ModelRole = input.image?.startsWith("data:image") ? "vision" : "text";
  const raw = await chatJSONResilient<ProductAnalysis>(role, messages, 1100);

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
