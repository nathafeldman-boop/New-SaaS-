import type { RoutineDay } from "./funnel-types";

// ──────────────────────────────────────────────────────────────────────────
// Enrichissement des jours de routine « maigres ».
// Les programmes générés avant le format riche (ou quand l'IA omet un champ)
// n'ont ni why, ni tip, ni duration → l'espace membre paraît vide. On comble
// à l'affichage avec des valeurs expertes par phase, sans toucher à la base.
// ──────────────────────────────────────────────────────────────────────────

type PhaseDefault = {
  match: RegExp;
  duration: string;
  why: string;
  tip: string;
  steps: string[];
};

const PHASE_DEFAULTS: PhaseDefault[] = [
  {
    match: /nettoy|lavage|shampo|wash/i,
    duration: "8 min",
    why: "Un cuir chevelu propre et apaisé, c'est la base : c'est de là que part chaque cheveu qui repousse.",
    tip: "Masse le cuir chevelu 30 secondes du bout des doigts pendant le shampoing — ça active la microcirculation.",
    steps: [
      "Shampoing doux concentré sur les racines",
      "Masser le cuir chevelu 30 s",
      "Rinçage tiède puis jet frais",
      "Sécher en tamponnant, sans frotter",
    ],
  },
  {
    match: /hydrat|masque|brume|apres|après/i,
    duration: "10 min",
    why: "Les longueurs déshydratées cassent : on reconstruit la réserve d'eau de la fibre avant de la sceller.",
    tip: "Applique sur cheveux essorés, jamais trempés : le soin pénètre beaucoup mieux.",
    steps: [
      "Soin hydratant sur longueurs et pointes",
      "Démêler au peigne large pendant la pose",
      "Laisser agir 5 à 10 min",
      "Rincer à l'eau fraîche",
    ],
  },
  {
    match: /repos|récup|recup|leger|léger|pause/i,
    duration: "3 min",
    why: "Le cheveu se renforce aussi quand on le laisse tranquille : zéro agression aujourd'hui, la fibre récupère.",
    tip: "Profite du jour off : laisse sécher à l'air libre et dors sur une taie en satin si tu en as une.",
    steps: [
      "Pas de chaleur ni de produit lourd",
      "Brossage doux, tête en bas",
      "Masse ton cuir chevelu 1 min",
      "Photo du jour pour ton suivi",
    ],
  },
  {
    match: /soin|huile|serum|sérum/i,
    duration: "4 min",
    why: "L'huile scelle l'hydratation des jours précédents et protège les pointes du dessèchement.",
    tip: "1 à 2 gouttes suffisent, chauffées entre les paumes — trop d'huile alourdit et étouffe.",
    steps: [
      "1-2 gouttes d'huile végétale",
      "Chauffer entre les mains",
      "Appliquer pointes et mi-longueurs",
      "Ne pas rincer",
    ],
  },
  {
    match: /coiff|défin|defin|style/i,
    duration: "6 min",
    why: "Mettre ta coupe en valeur entretient la motivation — et un coiffage maîtrisé évite la chaleur agressive.",
    tip: "Coiffe sur cheveux légèrement humides : la tenue est plus souple et plus naturelle.",
    steps: [
      "Produit coiffant léger, petite dose",
      "Répartir mèche par mèche",
      "Coiffer aux doigts",
      "Fixer sans figer",
    ],
  },
];

const GENERIC: Omit<PhaseDefault, "match"> = {
  duration: "5 min",
  why: "Chaque geste répété compte : c'est la régularité sur 30 jours qui transforme la fibre, pas l'intensité d'un seul jour.",
  tip: "Fais ta séance à heure fixe — l'habitude s'installe en une dizaine de jours.",
  steps: [
    "Suis les étapes du jour sans te presser",
    "Observe tes cheveux : toucher, brillance",
    "Photo du jour pour ton suivi",
  ],
};

/** Complète un jour de routine avec des valeurs expertes si des champs manquent. */
export function enrichRoutineDay(d: RoutineDay): RoutineDay;
export function enrichRoutineDay(d: RoutineDay | undefined): RoutineDay | undefined;
export function enrichRoutineDay(d: RoutineDay | undefined): RoutineDay | undefined {
  if (!d) return d;
  const def =
    PHASE_DEFAULTS.find((p) => p.match.test(`${d.phase ?? ""} ${d.title ?? ""}`)) ?? GENERIC;
  const steps =
    (d.steps?.length ?? 0) >= 3
      ? d.steps
      : [...(d.steps ?? []), ...def.steps.filter((s) => !d.steps?.includes(s))].slice(0, 4);
  return {
    ...d,
    duration: d.duration || def.duration,
    why: d.why || def.why,
    tip: d.tip || def.tip,
    steps,
  };
}
