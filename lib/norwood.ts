// ──────────────────────────────────────────────────────────────────────────
//  Échelle de Norwood — référentiel statique (7 stades).
//  Sert au suivi « calvitie & ligne frontale ». Le stade courant de
//  l'utilisateur est estimé par Mistral (diagnosis.norwoodStage) ; ce fichier
//  fournit le contenu pédagogique + le pilotage du modèle 3D pour chaque stade.
// ──────────────────────────────────────────────────────────────────────────

export type NorwoodStage = {
  /** 1 → 7 */
  stage: number;
  /** Nom court du stade (FR). */
  name: string;
  /** Résumé de l'état du cuir chevelu (FR). */
  summary: string;
  /** Étiquettes rapides (FR). */
  tags: string[];
  /** Pourcentage indicatif de cuir chevelu dégarni (0 → 100). */
  baldPct: number;
  /** Conseil / piste de prise en charge (FR). */
  advice: string;
};

export const NORWOOD_STAGES: NorwoodStage[] = [
  {
    stage: 1,
    name: "Ligne intacte",
    summary:
      "Aucun signe de recul. La ligne frontale est pleine et régulière, le vertex est entièrement couvert.",
    tags: ["Ligne pleine", "Densité normale"],
    baldPct: 0,
    advice:
      "Rien à corriger côté densité. On entretient : cuir chevelu sain, lavages doux et bonne hydratation suffisent.",
  },
  {
    stage: 2,
    name: "Golfes naissants",
    summary:
      "Un très léger recul apparaît aux golfes temporaux. C'est souvent une simple maturation de la ligne, pas une calvitie.",
    tags: ["Golfes légers", "Front mature"],
    baldPct: 8,
    advice:
      "Surveillance simple. Une routine cuir chevelu (massage, nettoyage doux) garde le follicule en forme.",
  },
  {
    stage: 3,
    name: "Golfes marqués",
    summary:
      "Les golfes se creusent nettement et dessinent un « M » à l'avant. La ligne frontale recule de façon symétrique.",
    tags: ["Recul en M", "Tempes dégarnies"],
    baldPct: 18,
    advice:
      "C'est le moment idéal pour agir. Actifs ciblés (cuir chevelu), avis dermatologique et coupe adaptée font la différence.",
  },
  {
    stage: 4,
    name: "Front + vertex",
    summary:
      "Le dégarnissement frontal s'accentue et une zone clairsemée apparaît au vertex (sommet). Une bande de cheveux relie encore les deux côtés.",
    tags: ["Perte vertex", "Recul frontal", "Cuir visible"],
    baldPct: 32,
    advice:
      "Prise en charge recommandée : traitements médicaux possibles, parfois discussion greffe. Une coupe courte et nette densifie visuellement.",
  },
  {
    stage: 5,
    name: "Zones qui se rejoignent",
    summary:
      "Les zones frontale et du vertex s'agrandissent ; la bande de cheveux qui les sépare s'amincit.",
    tags: ["Bande fine", "Zones étendues"],
    baldPct: 48,
    advice:
      "Suivi dermatologique conseillé. Les coupes très courtes (ou rasées assumées) restent les plus flatteuses.",
  },
  {
    stage: 6,
    name: "Front et vertex unis",
    summary:
      "La bande centrale a quasiment disparu : les zones dégarnies du front et du sommet se rejoignent. Seuls les côtés et l'arrière restent fournis.",
    tags: ["Pont disparu", "Couronne latérale"],
    baldPct: 66,
    advice:
      "Le rasé maîtrisé ou la greffe (selon la zone donneuse) sont les options les plus nettes. Un dermatologue cadre le projet.",
  },
  {
    stage: 7,
    name: "Couronne résiduelle",
    summary:
      "Stade le plus avancé : il ne reste qu'une couronne de cheveux en fer à cheval sur les côtés et l'arrière de la tête.",
    tags: ["Fer à cheval", "Sommet dégarni"],
    baldPct: 85,
    advice:
      "Le rasé assumé est élégant et sans entretien. Une greffe reste envisageable si la zone donneuse est suffisante.",
  },
];

export function getStage(n: number | null | undefined): NorwoodStage {
  const i = Math.min(7, Math.max(1, Math.round(n ?? 1))) - 1;
  return NORWOOD_STAGES[i];
}

/** Slug d'URL d'un stade ("stade-3"). */
export const stageSlug = (s: number) => `stade-${s}`;

/** Retrouve un stade depuis son slug ("stade-3" → stade 3), ou null. */
export function getStageBySlug(slug: string): NorwoodStage | null {
  const m = /^stade-([1-7])$/.exec(slug);
  return m ? NORWOOD_STAGES[Number(m[1]) - 1] : null;
}
