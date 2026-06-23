// Contenu d'EXEMPLE (mode démo). Sert uniquement de repli quand la clé Mistral
// est absente ou l'API injoignable. Toujours signalé comme "exemple" dans l'UI.

import type { CutsResult, HairAnalysis, Routine, RoutineDay } from "./funnel-types";

export const demoAnalysis: HairAnalysis = {
  summary:
    "Cheveux à tendance sèche avec de belles ondulations, mais des pointes fragilisées et un volume irrégulier sur le dessus.",
  hairType: "Ondulé (2B), densité moyenne",
  condition: "Déshydratation légère · pointes abîmées",
  strengths: ["Mouvement naturel", "Bonne implantation", "Matière exploitable"],
  concerns: ["Pointes sèches", "Manque de définition", "Frisottis en surface"],
  faceShape: "Ovale",
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

function demoDay(day: number): RoutineDay {
  const cycle = [
    { phase: "Nettoyage", title: "Lavage doux", focus: "Assainir sans agresser", steps: ["Shampoing sans sulfates", "Eau tiède", "Sécher en tamponnant"] },
    { phase: "Hydratation", title: "Masque nourrissant", focus: "Réparer les pointes", steps: ["Masque sur longueurs", "Pose 10 min", "Rincer à l'eau fraîche"] },
    { phase: "Repos", title: "Jour léger", focus: "Laisser respirer le cuir chevelu", steps: ["Pas de chaleur", "Brossage doux", "Photo du jour"] },
    { phase: "Soin", title: "Huile sur pointes", focus: "Sceller l'hydratation", steps: ["1 goutte d'huile", "Sur les pointes", "Sans rincer"] },
    { phase: "Coiffage", title: "Définition", focus: "Structurer le mouvement", steps: ["Produit coiffant léger", "Mèches au doigt", "Fixer sans figer"] },
  ];
  const c = cycle[(day - 1) % cycle.length];
  return { day, ...c };
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
