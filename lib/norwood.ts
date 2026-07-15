// ──────────────────────────────────────────────────────────────────────────
//  Échelle de Norwood — référentiel statique (7 stades).
//  Sert au suivi « calvitie & ligne frontale ». Le stade courant de
//  l'utilisateur est estimé par Mistral (diagnosis.norwoodStage) ; ce fichier
//  fournit le contenu pédagogique + le pilotage du modèle 3D pour chaque stade.
// ──────────────────────────────────────────────────────────────────────────

export type NorwoodStage = {
  /** 1 → 7 */
  stage: number;
  /** Nom court du stade. */
  name: string;
  /** Résumé de l'état du cuir chevelu. */
  summary: string;
  /** Étiquettes rapides. */
  tags: string[];
  /** Pourcentage indicatif de cuir chevelu dégarni (0 → 100). */
  baldPct: number;
  /** Conseil / piste de prise en charge. */
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

export const NORWOOD_STAGES_EN: NorwoodStage[] = [
  {
    stage: 1,
    name: "Intact hairline",
    summary:
      "No sign of recession. The hairline is full and even, and the crown is fully covered.",
    tags: ["Full hairline", "Normal density"],
    baldPct: 0,
    advice:
      "Nothing to correct in terms of density. Maintenance only: a healthy scalp, gentle washing and good hydration are enough.",
  },
  {
    stage: 2,
    name: "Early temple recession",
    summary:
      "A very slight recession appears at the temples. This is often just a natural hairline maturation, not baldness.",
    tags: ["Light temple recession", "Mature hairline"],
    baldPct: 8,
    advice:
      "Simple monitoring. A scalp routine (massage, gentle cleansing) keeps the follicle in good shape.",
  },
  {
    stage: 3,
    name: "Marked temple recession",
    summary:
      "The temples recede noticeably, forming an \"M\" shape at the front. The hairline recedes symmetrically.",
    tags: ["M-shaped recession", "Thinning temples"],
    baldPct: 18,
    advice:
      "This is the ideal moment to act. Targeted scalp actives, a dermatologist's opinion, and a well-suited haircut make a real difference.",
  },
  {
    stage: 4,
    name: "Front + crown",
    summary:
      "Frontal thinning increases and a sparse area appears at the crown. A band of hair still connects the two sides.",
    tags: ["Crown loss", "Frontal recession", "Visible scalp"],
    baldPct: 32,
    advice:
      "Professional care is recommended: medical treatments are possible, and a transplant may be worth discussing. A short, clean cut visually adds density.",
  },
  {
    stage: 5,
    name: "Areas merging",
    summary:
      "The frontal and crown areas expand; the band of hair separating them thins further.",
    tags: ["Thin band", "Expanding areas"],
    baldPct: 48,
    advice:
      "Dermatological follow-up is advised. Very short cuts (or an owned shaved look) remain the most flattering.",
  },
  {
    stage: 6,
    name: "Front and crown joined",
    summary:
      "The central band has almost disappeared: the thinning areas at the front and top merge. Only the sides and back remain full.",
    tags: ["Bridge gone", "Side crown"],
    baldPct: 66,
    advice:
      "A well-maintained shave or a transplant (depending on the donor area) are the cleanest options. A dermatologist can help frame the project.",
  },
  {
    stage: 7,
    name: "Residual crown",
    summary:
      "The most advanced stage: only a horseshoe-shaped band of hair remains on the sides and back of the head.",
    tags: ["Horseshoe", "Bald crown"],
    baldPct: 85,
    advice:
      "An owned shaved look is elegant and maintenance-free. A transplant remains an option if the donor area is sufficient.",
  },
];

export function getStage(n: number | null | undefined, en?: boolean): NorwoodStage {
  const i = Math.min(7, Math.max(1, Math.round(n ?? 1))) - 1;
  return (en ? NORWOOD_STAGES_EN : NORWOOD_STAGES)[i];
}

/** Slug d'URL d'un stade ("stade-3"). */
export const stageSlug = (s: number) => `stade-${s}`;

/** Retrouve un stade depuis son slug ("stade-3" → stade 3), ou null. */
export function getStageBySlug(slug: string, en?: boolean): NorwoodStage | null {
  const m = /^stade-([1-7])$/.exec(slug);
  return m ? (en ? NORWOOD_STAGES_EN : NORWOOD_STAGES)[Number(m[1]) - 1] : null;
}
