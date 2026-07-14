// Contenu d'EXEMPLE (mode démo). Sert uniquement de repli quand la clé Mistral
// est absente ou l'API injoignable. Toujours signalé comme "exemple" dans l'UI.

import type {
  CutsResult,
  HairAnalysis,
  HairScores,
  ProductAnalysis,
  ProductReco,
  Routine,
  RoutineDay,
} from "./funnel-types";
import { fallbackPattern } from "./routine-pattern";

export const demoAnalysis: HairAnalysis = {
  summary:
    "Cheveux à tendance sèche avec de belles ondulations, mais des pointes fragilisées et un volume irrégulier sur le dessus.",
  hairType: "Ondulé (2B), densité moyenne",
  condition: "Déshydratation légère · pointes abîmées",
  strengths: ["Mouvement naturel", "Bonne implantation", "Matière exploitable"],
  concerns: ["Pointes sèches", "Manque de définition", "Frisottis en surface"],
  faceShape: "Ovale",
  norwoodStage: 2,
  keepCurrentCut: false,
  keepReason:
    "Une coupe légèrement structurée mettrait davantage en valeur le mouvement naturel.",
};

const cutNames: [string, string, string][] = [
  ["Dégradé texturé", "Volume maîtrisé sur le dessus, côtés nets", "Entretien moyen"],
  ["Mi-long ondulé", "Longueur qui suit le mouvement naturel", "Entretien faible"],
  ["Frange effilée", "Adoucit le front, encadre le visage", "Entretien moyen"],
  ["Crop français", "Court, net, frange courte texturée", "Entretien élevé"],
  ["Coupe bouclée définie", "Boucles assumées et hydratées", "Entretien moyen"],
  ["Dégradé bas", "Transition douce sur les côtés", "Entretien moyen"],
  ["Ivy League", "Classique propre, côté travaillé", "Entretien moyen"],
  ["Quiff texturé", "Hauteur sur l'avant, volume", "Entretien élevé"],
  ["Coupe au bol moderne", "Ligne franche, esprit contemporain", "Entretien moyen"],
  ["Mèche longue", "Longueur sur le dessus à coiffer", "Entretien faible"],
  ["Dégradé fondu", "Fondu progressif et net", "Entretien élevé"],
  ["Wolf cut", "Ultra-texturé, esprit décontracté", "Entretien faible"],
  ["Side part volume", "Raie marquée, volume latéral", "Entretien moyen"],
  ["Caesar texturé", "Court devant, texture sur le dessus", "Entretien faible"],
  ["Curtain bangs", "Frange rideau ouverte au centre", "Entretien moyen"],
];

export const demoCuts: CutsResult = {
  keepCurrent: false,
  reason:
    "Le potentiel de mouvement n'est pas pleinement exploité — une coupe structurée apporterait plus de définition.",
  currentCutName: "Coupe actuelle (mi-long non structuré)",
  cuts: cutNames.map(([name, description, maintenance], i) => ({
    id: `cut-${i + 1}`,
    name,
    description,
    why: "Met en valeur ton type de cheveux et la forme de ton visage.",
    maintenance,
    vibe: i % 3 === 0 ? "Soigné" : i % 3 === 1 ? "Naturel" : "Audacieux",
  })),
};

export const demoScores: HairScores = {
  axes: [
    { key: "couverture", label: "Couverture", current: 72, potential: 80 },
    { key: "hydratation", label: "Hydratation", current: 48, potential: 74 },
    { key: "volume", label: "Volume", current: 58, potential: 70 },
    { key: "sante_cheveu", label: "Santé du cheveu", current: 52, potential: 76 },
    { key: "sante_cuir", label: "Cuir chevelu", current: 66, potential: 78 },
    { key: "brillance", label: "Brillance", current: 50, potential: 72 },
  ],
  overall: 58,
};

export const demoProducts: ProductReco[] = [
  {
    id: "prod-1",
    category: "Shampoing",
    brand: "Kérastase",
    name: "Bain Hydratant Nutritive",
    sizeMl: 250,
    matchPct: 91,
    why: ["Nettoie en douceur sans dessécher", "Réhydrate les longueurs sèches"],
    imageQuery: "shampoo bottle",
    imageUrl: null,
  },
  {
    id: "prod-2",
    category: "Après-shampoing",
    brand: "Davines",
    name: "MOMO Moisturizing Conditioner",
    sizeMl: 200,
    matchPct: 88,
    why: ["Démêle et lisse les frisottis", "Apporte de la souplesse aux pointes"],
    imageQuery: "hair conditioner bottle",
    imageUrl: null,
  },
  {
    id: "prod-3",
    category: "Sérum",
    brand: "The Ordinary",
    name: "Multi-Peptide Serum for Hair",
    sizeMl: 60,
    matchPct: 84,
    why: ["Renforce la fibre", "Cible la densité et la vitalité"],
    imageQuery: "hair serum dropper bottle",
    imageUrl: null,
  },
  {
    id: "prod-4",
    category: "Huile",
    brand: "Aveda",
    name: "Nutriplenish Multi-Use Hair Oil",
    sizeMl: 100,
    matchPct: 80,
    why: ["Scelle l'hydratation sur les pointes", "Brillance sans effet gras"],
    imageQuery: "hair oil bottle",
    imageUrl: null,
  },
];

export const demoProductAnalysis: ProductAnalysis = {
  productName: "Shampoing hydratant (exemple)",
  matchPct: 82,
  detected: ["Cheveux ondulés", "Tendance sèche", "Pointes fragilisées"],
  keyIngredients: [
    { name: "Glycérine", role: "Attire et retient l'eau", good: true },
    { name: "Huile d'argan", role: "Nourrit et lisse la fibre", good: true },
    { name: "Protéines de soie", role: "Réduit les frisottis", good: true },
    { name: "Sulfates (SLS)", role: "Tensioactif décapant", good: false },
  ],
  verdict:
    "Bon choix global pour réhydrater des cheveux secs ; surveille la présence de sulfates qui peut assécher à la longue.",
  pros: ["Hydratation ciblée", "Bonne base nourrissante"],
  cons: ["Présence de sulfates"],
};

function demoDay(day: number): RoutineDay {
  const weeks = ["Semaine 1 · Réparation", "Semaine 2 · Renforcement", "Semaine 3 · Croissance", "Semaine 4 · Entretien", "Semaine 5 · Entretien"];
  const i = day - 1;
  const week = Math.floor(i / 7);
  const c = fallbackPattern[(i + week) % fallbackPattern.length];
  return { day, ...c, focus: `${weeks[Math.min(week, weeks.length - 1)]} · ${c.focus}` };
}

export const demoRoutine: Routine = {
  title: "Ta routine 30 jours — exemple",
  overview:
    "Un cycle progressif pour réhydrater, réparer les pointes et révéler le mouvement naturel, jour après jour.",
  weeklyTips: [
    "Bois assez d'eau : l'hydratation commence de l'intérieur.",
    "Évite la chaleur excessive (sèche-cheveux trop chaud, fer).",
    "Taie d'oreiller en satin pour limiter la casse.",
    "Reprends une photo chaque jour pour suivre l'évolution.",
  ],
  days: Array.from({ length: 30 }, (_, i) => demoDay(i + 1)),
};
