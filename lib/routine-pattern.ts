// ──────────────────────────────────────────────────────────────────────────
//  Cycle de routine expert (7 jours) — référentiel PARTAGÉ par :
//   - lib/mistral.ts (repli si l'IA omet des champs, et prompt de référence)
//   - lib/funnel-demo.ts (mode démo, clé Mistral absente)
//   - lib/routine-enrich.ts (enrichissement des programmes déjà en base)
//  Module volontairement sans dépendance serveur (pas d'appel réseau, pas de
//  process.env) : il peut être importé aussi bien côté client (espace membre)
//  que côté serveur sans alourdir le bundle ni dupliquer le contenu.
// ──────────────────────────────────────────────────────────────────────────

export type PatternDay = {
  phase: string;
  title: string;
  focus: string;
  steps: string[];
  why?: string;
  tip?: string;
  duration?: string;
  mistakes?: string[];
  expected?: string;
};

export const fallbackPattern: PatternDay[] = [
  {
    phase: "Nettoyage", title: "Lavage doux", focus: "Assainir sans agresser", duration: "8 min",
    why: "Un cuir chevelu propre et apaisé, c'est la base d'une fibre qui repousse plus saine.",
    tip: "Masse le cuir chevelu 30 s du bout des doigts pour activer la microcirculation.",
    steps: ["Démêler à sec avant de mouiller (moins de casse)", "Mouiller à l'eau tiède 30 s", "Shampoing sans sulfates, masser le cuir chevelu 30 s", "Rincer à l'eau tiède puis un jet frais final", "Sécher en tamponnant avec une serviette (jamais frotter)"],
    mistakes: ["Se laver les cheveux à l'eau très chaude — ça décape le sébum protecteur", "Frotter la serviette sur les longueurs — ça ouvre la cuticule et crée des frisottis"],
    expected: "Cuir chevelu qui respire, racines plus légères dès ce soir.",
  },
  {
    phase: "Hydratation", title: "Masque nourrissant", focus: "Réparer les longueurs", duration: "15 min",
    why: "Les longueurs déshydratées cassent : on reconstruit la réserve d'eau et de lipides.",
    tip: "Pose le masque sur cheveux essorés, jamais trempés, pour qu'il pénètre vraiment.",
    steps: ["Essorer les cheveux après le lavage (pas dégoulinants)", "Appliquer le masque sur longueurs et pointes, pas les racines", "Démêler au peigne large pendant la pose", "Laisser poser 10-15 min (bonnet chauffant si tu en as)", "Rincer à l'eau fraîche jusqu'à disparition du toucher glissant"],
    mistakes: ["Appliquer le masque sur cuir chevelu — ça alourdit et regraisse plus vite", "Rincer trop vite — le masque n'a pas eu le temps d'agir"],
    expected: "Longueurs plus souples au toucher, moins de résistance au démêlage.",
  },
  {
    phase: "Repos", title: "Jour léger", focus: "Laisser respirer le cuir chevelu", duration: "3 min",
    why: "Le cheveu se renforce aussi quand on le laisse tranquille : pas de surcharge.",
    tip: "Zéro chaleur aujourd'hui : laisse sécher à l'air libre.",
    steps: ["Pas de chaleur ni de produit lourd aujourd'hui", "Brossage doux, tête en bas, des pointes vers les racines", "Masser le cuir chevelu 1 min (stimule la microcirculation)", "Photo du jour pour ton suivi"],
    mistakes: ["Coiffer avec un produit lourd par habitude — laisse la fibre respirer", "Zapper le massage du cuir chevelu — c'est gratuit et ça compte sur la durée"],
    expected: "Un jour de récupération : c'est normal et nécessaire, pas un jour perdu.",
  },
  {
    phase: "Soin", title: "Huile sur pointes", focus: "Sceller l'hydratation", duration: "4 min",
    why: "L'huile scelle l'hydratation de la veille et protège les pointes du dessèchement.",
    tip: "1 à 2 gouttes max, chauffées entre les paumes : trop d'huile alourdit.",
    steps: ["1-2 gouttes d'huile végétale (argan, jojoba ou pépins de raisin)", "Chauffer entre les paumes 5 secondes", "Appliquer sur pointes et mi-longueurs uniquement", "Répartir en pressant les mèches entre les mains", "Sans rincer"],
    mistakes: ["Mettre l'huile sur cheveux secs et racines — effet gras immédiat garanti", "Trop en mettre « pour être sûr » — l'excès étouffe la fibre au lieu de la nourrir"],
    expected: "Brillance visible dans l'heure, pointes moins rêches en fin de journée.",
  },
  {
    phase: "Coiffage", title: "Définition", focus: "Structurer le mouvement", duration: "6 min",
    why: "Mettre en valeur ta coupe entretient la motivation et évite la chaleur agressive.",
    tip: "Coiffe sur cheveux légèrement humides pour une tenue souple et naturelle.",
    steps: ["Produit coiffant léger, taille d'une noisette", "Répartir mèche par mèche, pas en une seule fois", "Coiffer aux doigts plutôt qu'à la brosse", "Fixer sans figer (évite les sprays trop rigides)"],
    mistakes: ["Utiliser un sèche-cheveux très chaud sans protection thermique", "Appliquer le produit sur cheveux totalement secs — moins bonne répartition"],
    expected: "Une coupe qui tient sans effort et sans avoir l'air « travaillée ».",
  },
  {
    phase: "Hydratation", title: "Brume hydratante", focus: "Entretenir l'hydratation", duration: "3 min",
    why: "Une hydratation d'entretien en milieu de semaine évite l'effet paille des longueurs.",
    tip: "Vaporise à 20 cm et froisse les longueurs pour réveiller le mouvement.",
    steps: ["Brume hydratante sur longueurs, à 20 cm de distance", "Froisser les longueurs avec les mains", "Laisser sécher à l'air libre", "Optionnel : 1 goutte d'huile en finition si pointes sèches"],
    mistakes: ["Vaporiser directement sur le cuir chevelu — inutile et ça peut alourdir", "Sauter cette étape « parce que ça a l'air déjà bien » — c'est justement ce qui évite la rechute"],
    expected: "Longueurs qui gardent leur souplesse jusqu'au prochain lavage.",
  },
  {
    phase: "Repos", title: "Récupération", focus: "Préparer la semaine suivante", duration: "2 min",
    why: "Une bonne nuit limite la casse par friction : on prépare la fibre pour repartir.",
    tip: "Dors sur une taie en satin ou attache lâche en chouchou doux.",
    steps: ["Taie d'oreiller en satin ou soie si possible", "Cheveux attachés sans serrer (chouchou en tissu, pas d'élastique fin)", "Photo du jour pour ton suivi", "Relis tes progrès de la semaine — la régularité paie"],
    mistakes: ["Dormir avec un élastique serré — point de casse quasi garanti au même endroit", "Oublier la photo du jour — sans suivi, tu ne verras pas ta propre progression"],
    expected: "Fin de semaine : compare ta photo du jour 1 à aujourd'hui, la différence est déjà là.",
  },
];
