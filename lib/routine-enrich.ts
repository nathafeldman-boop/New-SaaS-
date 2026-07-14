import type { RoutineDay } from "./funnel-types";
import { fallbackPattern, type PatternDay } from "./routine-pattern";

// ──────────────────────────────────────────────────────────────────────────
// Enrichissement des jours de routine « maigres ».
// Les programmes générés avant le format riche (ou quand l'IA omet un champ)
// n'ont ni why, ni tip, ni mistakes, ni expected → l'espace membre paraît
// vide. On comble à l'affichage avec le référentiel expert (fallbackPattern,
// partagé avec la génération IA et le mode démo), sans toucher à la base.
// ──────────────────────────────────────────────────────────────────────────

type PhaseDefault = { match: RegExp; ref: PatternDay };

const PHASE_DEFAULTS: PhaseDefault[] = [
  { match: /nettoy|lavage|shampo|wash/i, ref: fallbackPattern[0] },
  { match: /hydrat|masque|brume|apres|après/i, ref: fallbackPattern[1] },
  { match: /repos|récup|recup|leger|léger|pause/i, ref: fallbackPattern[2] },
  { match: /soin|huile|serum|sérum/i, ref: fallbackPattern[3] },
  { match: /coiff|défin|defin|style/i, ref: fallbackPattern[4] },
];

const GENERIC: PatternDay = {
  phase: "Routine",
  title: "Soin du jour",
  focus: "Régularité",
  duration: "5 min",
  why: "Chaque geste répété compte : c'est la régularité sur 30 jours qui transforme la fibre, pas l'intensité d'un seul jour.",
  tip: "Fais ta séance à heure fixe — l'habitude s'installe en une dizaine de jours.",
  steps: [
    "Suis les étapes du jour sans te presser",
    "Observe tes cheveux : toucher, brillance",
    "Masse ton cuir chevelu 1 min",
    "Photo du jour pour ton suivi",
  ],
  mistakes: [
    "Sauter une séance « juste pour cette fois » — c'est la régularité qui fait l'effet, pas un jour isolé",
    "Changer de produits trop souvent — laisse au moins 2 semaines pour juger un soin",
  ],
  expected: "De petits progrès chaque jour, visibles surtout en comparant tes photos sur une semaine.",
};

/** Complète un jour de routine avec des valeurs expertes si des champs manquent. */
export function enrichRoutineDay(d: RoutineDay): RoutineDay;
export function enrichRoutineDay(d: RoutineDay | undefined): RoutineDay | undefined;
export function enrichRoutineDay(d: RoutineDay | undefined): RoutineDay | undefined {
  if (!d) return d;
  const def =
    PHASE_DEFAULTS.find((p) => p.match.test(`${d.phase ?? ""} ${d.title ?? ""}`))?.ref ?? GENERIC;
  const steps =
    (d.steps?.length ?? 0) >= 4
      ? d.steps
      : [...(d.steps ?? []), ...def.steps.filter((s) => !d.steps?.includes(s))].slice(0, 5);
  const mistakes =
    (d.mistakes?.length ?? 0) >= 2
      ? d.mistakes
      : [...(d.mistakes ?? []), ...(def.mistakes ?? []).filter((m) => !d.mistakes?.includes(m))].slice(0, 3);
  return {
    ...d,
    duration: d.duration || def.duration,
    why: d.why || def.why,
    tip: d.tip || def.tip,
    steps,
    mistakes,
    expected: d.expected || def.expected,
  };
}
