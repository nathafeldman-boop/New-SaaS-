// ──────────────────────────────────────────────────────────────────────────
//  Guides SEO — contenu éditorial ciblant les recherches capillaires homme.
//  Chaque guide alimente /guides/[slug] : métadonnées, sections, FAQ,
//  maillage interne (related). Rédigé pour être réellement utile (E-E-A-T),
//  pas du remplissage.
// ──────────────────────────────────────────────────────────────────────────

export type GuideSection = {
  h2: string;
  paras?: string[];
  list?: string[];
};

export type Guide = {
  slug: string;
  title: string; // H1
  metaTitle: string; // < 60 caractères
  metaDescription: string; // ~150 caractères
  kicker: string;
  updated: string;
  intro: string[];
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  related: string[]; // slugs d'autres guides
};

export const GUIDES: Guide[] = [
  {
    slug: "routine-capillaire-homme",
    title: "Routine capillaire homme : le guide complet",
    metaTitle: "Routine capillaire homme : le guide complet",
    metaDescription:
      "Construire une routine capillaire homme efficace : fréquence de lavage, soins, coiffage, erreurs à éviter et plan sur 30 jours, selon ton type de cheveux.",
    kicker: "Routine",
    updated: "juillet 2026",
    intro: [
      "La plupart des hommes lavent leurs cheveux trop souvent, avec le mauvais shampoing, puis se demandent pourquoi ils sont ternes, gras ou cassants. Une routine capillaire n'a pas besoin d'être longue : elle doit être adaptée à TON type de cheveux et répétée assez longtemps pour que la fibre se renouvelle.",
      "Ce guide pose les bases valables pour tous, puis explique comment ajuster selon que tes cheveux sont raides, ondulés, bouclés ou crépus.",
    ],
    sections: [
      {
        h2: "Les 4 piliers d'une routine qui marche",
        list: [
          "Nettoyer sans agresser : shampoing doux (sans sulfates agressifs), 2 à 3 lavages par semaine pour la plupart des types.",
          "Hydrater systématiquement : l'après-shampoing n'est pas optionnel — il referme les écailles et limite la casse.",
          "Protéger : chaleur (sèche-cheveux, fers) toujours avec un protecteur thermique ; friction limitée (taie en satin, séchage en tamponnant).",
          "Être régulier : le cheveu pousse d'environ 1 cm par mois — les résultats se jugent sur 30 jours, pas sur 3.",
        ],
      },
      {
        h2: "La bonne fréquence de lavage",
        paras: [
          "Cheveux à tendance grasse : un jour sur deux maximum — laver tous les jours stimule encore plus le sébum. Cheveux normaux à secs : 2 lavages par semaine suffisent. Cheveux bouclés à crépus : 1 lavage par semaine, complété par des rinçages à l'après-shampoing (co-wash).",
          "Le signal fiable, c'est ton cuir chevelu : s'il gratte, regraisse en quelques heures ou pèle, la fréquence ou le produit est mauvais.",
        ],
      },
      {
        h2: "Le déroulé d'une semaine type",
        list: [
          "Jour 1 — Lavage doux + après-shampoing, massage du cuir chevelu 30 secondes.",
          "Jour 2 — Repos : pas de chaleur, coiffage léger.",
          "Jour 3 — Hydratation : brume ou crème légère sur les longueurs.",
          "Jour 4 — Lavage ou co-wash selon ton type.",
          "Jour 5 — Soin ciblé : masque (secs/bouclés) ou exfoliation douce du cuir chevelu (gras).",
          "Jour 6 — Coiffage travaillé, produits légers.",
          "Jour 7 — Repos complet + photo pour suivre l'évolution.",
        ],
      },
      {
        h2: "Les erreurs qui ruinent tout",
        list: [
          "L'eau très chaude : elle décape le sébum protecteur — termine tiède ou frais.",
          "Frotter la serviette : la fibre mouillée est fragile, tamponne au lieu de frotter.",
          "Accumuler les produits au hasard : mieux vaut 3 produits adaptés que 8 produits contradictoires.",
          "Zapper le cuir chevelu : un cheveu sain pousse d'un cuir chevelu sain — masse-le, il régule le sébum et stimule la microcirculation.",
        ],
      },
      {
        h2: "Adapter la routine à ton type de cheveux",
        paras: [
          "Une routine générique donne des résultats génériques. Un cheveu bouclé a besoin de deux à trois fois plus d'hydratation qu'un cheveu raide ; un cuir chevelu gras a besoin d'espacement et de légèreté ; un cheveu crépu se démêle uniquement humide et chargé d'après-shampoing.",
          "C'est exactement ce que fait Capilatyx : une photo, un diagnostic de ton type et de l'état de ta fibre, puis une routine de 30 jours calée sur ton temps disponible — 2 minutes ou 15 minutes par jour.",
        ],
      },
    ],
    faq: [
      {
        q: "Combien de temps avant de voir des résultats ?",
        a: "Les premiers changements visibles (brillance, toucher) arrivent en 2 à 3 semaines. Les changements de fond (casse réduite, densité mieux exploitée) se jugent sur un cycle complet de 30 jours, le temps que la fibre exposée se renouvelle partiellement.",
      },
      {
        q: "Faut-il un shampoing sans sulfates ?",
        a: "Pas obligatoirement, mais les sulfates agressifs (SLS) décapent le sébum et assèchent les cheveux texturés. Plus tes cheveux sont bouclés, crépus ou secs, plus un nettoyant doux fait la différence.",
      },
      {
        q: "L'après-shampoing rend-il les cheveux gras ?",
        a: "Non si tu l'appliques sur les longueurs et pointes, pas sur les racines. Il referme les écailles de la cuticule : moins de frisottis, moins de casse, plus de brillance.",
      },
    ],
    related: ["type-de-cheveux", "cheveux-gras-homme", "cheveux-secs-cassants"],
  },
  {
    slug: "type-de-cheveux",
    title: "Quel est ton type de cheveux ? Le test simple",
    metaTitle: "Type de cheveux homme : le test simple (1 à 4)",
    metaDescription:
      "Raides, ondulés, bouclés ou crépus ? Identifie ton type de cheveux en 2 minutes avec la classification de 1 à 4, et découvre les soins adaptés à chaque type.",
    kicker: "Fondamentaux",
    updated: "juillet 2026",
    intro: [
      "Tout part de là : le type de cheveux détermine la fréquence de lavage, les produits, les coupes qui tiennent et celles qui ne tiendront jamais. La classification la plus utilisée (système d'André Walker) va de 1 (raide) à 4 (crépu), avec des sous-catégories A à C selon l'intensité.",
      "Le test le plus fiable : observe une mèche propre, séchée à l'air libre, sans produit.",
    ],
    sections: [
      {
        h2: "Type 1 — Raides",
        paras: [
          "Aucune ondulation, la mèche tombe droite. Le sébum glisse facilement le long de la fibre : ces cheveux regraissent vite mais sont naturellement brillants et résistants. Priorité : espacer les lavages et alléger les produits.",
        ],
      },
      {
        h2: "Type 2 — Ondulés",
        paras: [
          "Des vagues en S larges, sans boucle fermée. Le type le plus polyvalent, mais sujet aux frisottis et à l'effet « ni raide ni bouclé » quand il manque de définition. Priorité : hydratation légère et produits qui définissent sans alourdir.",
        ],
      },
      {
        h2: "Type 3 — Bouclés",
        paras: [
          "De vraies boucles en spirale, refermées sur elles-mêmes — de la taille d'un doigt à celle d'un stylo. Le sébum ne descend pas le long des spirales : ces cheveux sont structurellement plus secs. Priorité : hydrater beaucoup, démêler humide, ne jamais brosser à sec.",
        ],
      },
      {
        h2: "Type 4 — Crépus",
        paras: [
          "Frisures très serrées en Z ou en ressort, motif dense et compact. Le plus fragile des quatre types malgré son apparence robuste : chaque coude de la fibre est un point de casse potentiel. Priorité : hydratation intensive, manipulation minimale, coiffures protectrices.",
        ],
      },
      {
        h2: "Pourquoi on se trompe souvent",
        paras: [
          "Beaucoup d'hommes classent leurs cheveux « ondulés » parce qu'ils les portent courts : à moins de 5 cm, une boucle n'a pas la longueur de se former. L'humidité, le coiffage et les produits masquent aussi le motif réel.",
          "Le diagnostic photo de Capilatyx croise ce que déclare l'utilisateur avec ce que montre la fibre — et construit la routine sur le type réel, pas sur une impression.",
        ],
      },
    ],
    faq: [
      {
        q: "Mon type de cheveux peut-il changer ?",
        a: "Le motif de base est génétique, mais l'âge, les hormones et les agressions (chaleur, décoloration) peuvent le modifier légèrement. Des cheveux abîmés paraissent souvent plus raides ou plus mousseux que leur vrai type.",
      },
      {
        q: "On peut avoir plusieurs types en même temps ?",
        a: "Oui, c'est même courant : plus serré sur la nuque, plus lâche sur le dessus. On construit alors la routine sur le type dominant et on ajuste localement.",
      },
      {
        q: "Cheveux courts : comment savoir ?",
        a: "Regarde tes cheveux à 6-8 semaines de pousse sans coupe, ou observe la racine qui frise ou non près du cuir chevelu. Une photo bien éclairée analysée par l'IA donne aussi une réponse fiable.",
      },
    ],
    related: ["cheveux-boucles-homme", "cheveux-crepus-homme", "routine-capillaire-homme"],
  },
  {
    slug: "cheveux-boucles-homme",
    title: "Cheveux bouclés homme : la routine qui change tout",
    metaTitle: "Cheveux bouclés homme : routine, coupes, erreurs",
    metaDescription:
      "Routine cheveux bouclés homme : hydratation, définition des boucles, coupes adaptées et erreurs qui cassent la boucle. Le guide complet type 3.",
    kicker: "Type 3",
    updated: "juillet 2026",
    intro: [
      "Des boucles bien définies, ça ne dépend presque jamais de la génétique seule : c'est 80 % de méthode. Le problème n°1 du cheveu bouclé, c'est la sécheresse — le sébum produit au cuir chevelu ne parvient pas à descendre le long des spirales.",
      "Résultat sans routine : frisottis, boucles ouvertes, volume informe. Avec la bonne routine : des boucles nettes, souples et brillantes.",
    ],
    sections: [
      {
        h2: "La règle d'or : l'hydratation d'abord",
        list: [
          "Lavage 1 fois par semaine avec un shampoing doux sans sulfates — pas plus.",
          "Entre deux : co-wash (rinçage à l'après-shampoing) pour rafraîchir sans décaper.",
          "Après-shampoing à CHAQUE lavage, posé 2-3 minutes, démêlage au peigne large pendant la pose.",
          "Masque hydratant 1 fois par semaine sur cheveux essorés.",
        ],
      },
      {
        h2: "Définir ses boucles (sans effet carton)",
        paras: [
          "La définition se joue sur cheveux HUMIDES, jamais secs. Applique une crème ou un gel léger en froissant les mèches vers le haut (scrunch), puis laisse sécher à l'air libre ou au diffuseur à basse température. Une fois secs, ne touche plus : c'est ce qui casse la boucle et crée le frisottis.",
          "Le brossage à sec est l'ennemi n°1 : il ouvre la boucle et la transforme en mousse. Démêle uniquement humide, chargé d'après-shampoing.",
        ],
      },
      {
        h2: "Les coupes qui mettent les boucles en valeur",
        list: [
          "Dégradé bouclé (curly fade) : côtés courts, boucles libres sur le dessus — structure sans effort.",
          "Mi-long assumé : au-delà de 10 cm, les boucles prennent leur vrai mouvement — demande un dégradé intérieur pour éviter la pyramide.",
          "Crop texturé : court mais suffisant pour montrer le motif, entretien minimal.",
        ],
      },
      {
        h2: "Les erreurs classiques",
        list: [
          "Laver tous les jours « parce que ça regraisse » — un bouclé regraisse rarement, il s'assèche.",
          "La serviette éponge frottée : remplace par un t-shirt en coton et tamponne.",
          "Les produits à alcool desséchant (nombreux gels coiffants bas de gamme).",
          "Dormir sans protection : une taie en satin change réellement le réveil.",
        ],
      },
    ],
    faq: [
      {
        q: "Pourquoi mes boucles sont belles mouillées et moches sèches ?",
        a: "Parce qu'elles perdent leur eau sans qu'un produit ne la retienne. Il faut sceller l'hydratation sur cheveux humides (crème ou gel), puis ne plus manipuler pendant le séchage.",
      },
      {
        q: "Diffuseur ou air libre ?",
        a: "Les deux fonctionnent. L'air libre est le plus sûr ; le diffuseur (basse température, tête penchée) donne plus de volume et de définition. Jamais de sèche-cheveux à nu sur des boucles.",
      },
      {
        q: "Quelle coupe si mes boucles sont irrégulières ?",
        a: "Un dégradé qui garde de la longueur sur le dessus : il structure les zones lâches et laisse le motif s'exprimer là où il est le plus net. L'essayage virtuel permet de comparer avant de passer chez le coiffeur.",
      },
    ],
    related: ["type-de-cheveux", "cheveux-crepus-homme", "routine-capillaire-homme"],
  },
  {
    slug: "cheveux-crepus-homme",
    title: "Cheveux crépus homme : hydratation, pousse, entretien",
    metaTitle: "Cheveux crépus homme : le guide entretien & pousse",
    metaDescription:
      "Cheveux crépus homme : pourquoi ils cassent, comment les hydrater, les faire pousser et les coiffer sans les abîmer. Méthode complète type 4.",
    kicker: "Type 4",
    updated: "juillet 2026",
    intro: [
      "Le cheveu crépu paraît robuste — c'est en réalité le plus fragile des quatre types. Chaque coude du motif en Z est un point de faiblesse mécanique, et le sébum ne circule presque pas le long de la fibre. Conséquence : sans hydratation apportée de l'extérieur, il casse avant même de pouvoir pousser.",
      "La bonne nouvelle : avec la bonne méthode, le crépu est aussi le type qui répond le plus visiblement à une routine.",
    ],
    sections: [
      {
        h2: "Pourquoi « mes cheveux ne poussent pas » est un mythe",
        paras: [
          "Ils poussent — environ 1 cm par mois comme tous les autres — mais ils cassent à la même vitesse. Le rétrécissement (shrinkage) masque aussi la longueur réelle : un cheveu crépu de 15 cm peut paraître en faire 5. La priorité n'est donc pas de stimuler la pousse, mais de stopper la casse : hydratation + manipulation minimale.",
        ],
      },
      {
        h2: "La méthode L.O.C. simplifiée",
        list: [
          "L (Liquid) : humidifie — eau ou leave-in aqueux en spray.",
          "O (Oil) : scelle avec quelques gouttes d'huile (jojoba, avocat).",
          "C (Cream) : referme avec une crème coiffante nourrissante.",
          "Fréquence : 2-3 fois par semaine ; lavage doux 1 fois par semaine maximum.",
        ],
      },
      {
        h2: "Manipuler sans casser",
        list: [
          "Démêlage UNIQUEMENT humide et chargé d'après-shampoing, aux doigts puis au peigne large, des pointes vers les racines.",
          "Sécher en tamponnant avec un t-shirt, jamais frotter.",
          "Nuit : taie en satin ou bonnet — le coton absorbe l'hydratation et casse la fibre par friction.",
          "Éviter les tractions permanentes (tresses trop serrées, durags trop tendus) qui fragilisent la lisière.",
        ],
      },
      {
        h2: "Coupes : structurer le volume",
        paras: [
          "Le crépu offre une matière sculptable unique : fade + volume dessiné dessus, coupe définie aux ciseaux (curl sponge pour les twists courts), ou afro assumé avec contours nets. La clé est un barbier qui coupe le crépu SEC — le motif rétrécit trop pour couper mouillé.",
        ],
      },
    ],
    faq: [
      {
        q: "Faut-il graisser le cuir chevelu ?",
        a: "Non — le cuir chevelu produit son propre sébum et l'étouffer favorise démangeaisons et pellicules. On huile les LONGUEURS pour sceller l'hydratation, pas la peau.",
      },
      {
        q: "Combien de temps pour voir mes cheveux pousser ?",
        a: "En stoppant la casse, la longueur retenue devient visible en 2 à 3 mois. Sur 30 jours, le premier changement est la texture : plus souple, plus hydratée, moins de cheveux cassés sur l'oreiller.",
      },
      {
        q: "Twists, tresses : bonne ou mauvaise idée ?",
        a: "Excellente en coiffure protectrice si elles sont posées sans tension excessive et pas gardées plus de 4-6 semaines. Elles réduisent la manipulation quotidienne — donc la casse.",
      },
    ],
    related: ["cheveux-boucles-homme", "type-de-cheveux", "faire-pousser-cheveux"],
  },
  {
    slug: "cheveux-gras-homme",
    title: "Cheveux gras : pourquoi, et comment s'en sortir",
    metaTitle: "Cheveux gras homme : causes et solutions durables",
    metaDescription:
      "Cheveux gras dès le soir ? Comprendre le sébum, casser le cercle du lavage quotidien et retrouver des racines nettes en 3 semaines. Guide homme complet.",
    kicker: "Cuir chevelu",
    updated: "juillet 2026",
    intro: [
      "Racines qui luisent dès le soir, sensation de cheveux « sales » au réveil : le cheveu gras n'est pas une fatalité ni un problème d'hygiène — c'est un cuir chevelu qui surproduit du sébum, souvent PARCE QU'on le lave trop.",
      "Casser ce cercle prend environ trois semaines. Voici la méthode.",
    ],
    sections: [
      {
        h2: "Le cercle vicieux du lavage quotidien",
        paras: [
          "Chaque lavage décape le film de sébum. Le cuir chevelu, agressé, compense en produisant plus — et plus vite. Tu laves donc de plus en plus souvent des cheveux de plus en plus gras. La sortie : espacer progressivement (un jour sur deux, puis deux jours sur trois) avec un shampoing doux, le temps que la production se régule.",
        ],
      },
      {
        h2: "Les bons réflexes",
        list: [
          "Shampoing doux (sans sulfates agressifs), concentré sur les RACINES — les longueurs se nettoient au rinçage.",
          "Eau tiède, rinçage final frais : la chaleur stimule les glandes sébacées.",
          "Après-shampoing uniquement sur longueurs/pointes, jamais les racines.",
          "Mains hors des cheveux pendant la journée : chaque passage redistribue sébum et impuretés.",
          "Taie d'oreiller changée souvent, casquettes aérées.",
        ],
      },
      {
        h2: "Ce qui aggrave sans qu'on s'en rende compte",
        list: [
          "Les produits coiffants lourds (cires, pommades grasses) qui étouffent la racine.",
          "Le sèche-cheveux très chaud collé au crâne.",
          "Le brossage excessif, qui tire le sébum le long de la fibre.",
          "Le stress et le manque de sommeil — les hormones de stress stimulent le sébum.",
        ],
      },
      {
        h2: "Et si ça ne suffit pas",
        paras: [
          "Pellicules grasses, démangeaisons, plaques : au-delà du simple cheveu gras, il peut s'agir d'une dermite séborrhéique — consulte un dermatologue. Pour le reste, un diagnostic photo permet de vérifier l'état réel du cuir chevelu et de calibrer une routine d'espacement progressif adaptée.",
        ],
      },
    ],
    faq: [
      {
        q: "Le shampoing sec, bonne idée ?",
        a: "En dépannage ponctuel oui, en solution non : il absorbe le sébum mais s'accumule sur le cuir chevelu. Maximum 1-2 fois par semaine, et jamais en remplacement durable du lavage.",
      },
      {
        q: "Combien de temps pour réguler la production de sébum ?",
        a: "Comptes 2 à 3 semaines d'espacement progressif pour un changement net. Les premiers jours sont les plus difficiles — c'est le moment où la plupart abandonnent, juste avant que ça marche.",
      },
      {
        q: "Cheveux gras et perte de cheveux, un lien ?",
        a: "L'excès de sébum n'arrache pas les cheveux, mais un cuir chevelu enflammé en continu n'est pas un terrain optimal. Si tu observes un recul de la ligne frontale en plus, fais le point sur l'échelle de Norwood.",
      },
    ],
    related: ["routine-capillaire-homme", "cheveux-secs-cassants", "perte-cheveux-jeune"],
  },
  {
    slug: "cheveux-secs-cassants",
    title: "Cheveux secs et cassants : le protocole de réparation",
    metaTitle: "Cheveux secs et cassants homme : le protocole",
    metaDescription:
      "Cheveux secs, ternes, qui cassent ? Les vraies causes (chaleur, sulfates, friction) et le protocole de réparation en 30 jours : hydratation, scellage, protection.",
    kicker: "Réparation",
    updated: "juillet 2026",
    intro: [
      "Un cheveu sec est un cheveu dont les écailles (la cuticule) sont ouvertes : l'eau s'échappe, la lumière ne se reflète plus — il devient terne, rêche, puis il casse. La sécheresse n'est presque jamais une fatalité : c'est l'accumulation de petites agressions répétées.",
    ],
    sections: [
      {
        h2: "Identifier la cause (sinon rien ne marche)",
        list: [
          "Chaleur non protégée : sèche-cheveux chaud, fers — cause n°1.",
          "Shampoings décapants (sulfates agressifs) et lavages trop fréquents.",
          "Friction : serviette frottée, taie en coton, casque, brossage brutal.",
          "Chimie : décolorations, colorations répétées.",
          "Environnement : soleil fort, eau de mer/piscine non rincée, eau très calcaire.",
        ],
      },
      {
        h2: "Le protocole 30 jours",
        list: [
          "Semaines 1-2 (réhydrater) : 2 lavages doux/semaine, après-shampoing systématique, masque hydratant hebdomadaire posé 10-15 min sur cheveux essorés.",
          "Semaines 2-3 (sceller) : 2-3 gouttes d'huile végétale sur pointes et mi-longueurs après chaque hydratation.",
          "Semaines 3-4 (protéger) : zéro chaleur directe non protégée, séchage tamponné, taie en satin ; couper les pointes fourchues — elles ne se réparent pas et remontent le long de la fibre.",
        ],
      },
      {
        h2: "Hydratation vs nutrition : la confusion classique",
        paras: [
          "Hydrater = apporter de l'eau (glycérine, aloé, masques aqueux). Nourrir = apporter des lipides qui retiennent cette eau (huiles, beurres). Un cheveu sec a souvent besoin des deux, dans cet ordre : l'huile seule sur un cheveu déshydraté scelle... le vide.",
          "C'est le principe de la routine générée par Capilatyx : d'abord reconstruire la réserve d'eau, ensuite la sceller, enfin protéger — dans le bon ordre, au bon rythme.",
        ],
      },
    ],
    faq: [
      {
        q: "Les fourches peuvent-elles se réparer ?",
        a: "Non — aucun produit ne ressoude une fibre fendue, il ne peut que la colmater temporairement. On coupe la fourche (0,5-1 cm suffit) et on empêche les suivantes avec le protocole hydratation + protection.",
      },
      {
        q: "Quelle huile choisir ?",
        a: "Jojoba (proche du sébum, légère), argan (brillance) ou avocat (cheveux très secs). Toujours en petite quantité — 2-3 gouttes chauffées entre les paumes — et sur les longueurs, pas les racines.",
      },
      {
        q: "L'eau calcaire abîme-t-elle vraiment les cheveux ?",
        a: "Oui, le calcaire se dépose sur la fibre et la rêche. Un rinçage final à l'eau froide aide ; en zone très calcaire, un rinçage acide occasionnel (eau + vinaigre de cidre dilué) redonne de la brillance.",
      },
    ],
    related: ["routine-capillaire-homme", "cheveux-boucles-homme", "faire-pousser-cheveux"],
  },
  {
    slug: "faire-pousser-cheveux",
    title: "Faire pousser ses cheveux plus vite : mythes et méthodes",
    metaTitle: "Faire pousser ses cheveux plus vite : la vérité",
    metaDescription:
      "1 cm par mois : peut-on vraiment accélérer la pousse des cheveux ? Ce qui marche (cuir chevelu, nutrition, rétention), ce qui ne marche pas, et le plan d'action.",
    kicker: "Pousse",
    updated: "juillet 2026",
    intro: [
      "Le cheveu pousse en moyenne de 1 à 1,25 cm par mois, un rythme largement fixé par la génétique. La vraie question n'est donc pas « comment pousser plus vite » mais « comment garder chaque centimètre qui pousse » — car la plupart des cheveux qui semblent ne pas pousser cassent en réalité aussi vite qu'ils poussent.",
    ],
    sections: [
      {
        h2: "Ce qui marche vraiment",
        list: [
          "Un cuir chevelu sain : massage quotidien de 1-2 minutes (microcirculation), lavages adaptés, pas d'accumulation de produits.",
          "La rétention de longueur : hydratation régulière, pointes entretenues, friction minimale — c'est là que se gagnent les centimètres.",
          "L'assiette : protéines suffisantes (le cheveu est de la kératine), fer, zinc, vitamines B. Une carence se voit dans les cheveux en 2-3 mois.",
          "Le sommeil et la gestion du stress : le stress chronique pousse les follicules en phase de repos prématurée.",
        ],
      },
      {
        h2: "Ce qui ne marche pas (ou pas comme promis)",
        list: [
          "Couper « pour faire pousser plus vite » : la coupe entretient les pointes mais n'accélère rien — le follicule ne sait pas que tu as coupé.",
          "Les gummies miracles : inutiles sans carence ; aucune vitamine ne dépasse ton plafond génétique.",
          "Brosser 100 coups par jour : c'est de la friction, donc de la casse.",
          "Les shampoings « accélérateurs » : un shampoing reste 2 minutes sur ta tête — il nettoie, il ne reprogramme pas le follicule.",
        ],
      },
      {
        h2: "Le plan d'action sur 90 jours",
        paras: [
          "Mois 1 : installe la routine de base (lavage adapté, hydratation, massage quotidien) et prends une photo hebdomadaire. Mois 2 : ajuste selon les résultats — moins de casse visible, toucher plus souple. Mois 3 : la longueur retenue devient mesurable.",
          "Le suivi photo est le seul juge fiable : à l'œil nu, on ne voit pas 1 cm par mois. C'est pour ça que Capilatyx intègre un suivi photo quotidien avec score d'évolution.",
        ],
      },
    ],
    faq: [
      {
        q: "Le minoxidil accélère-t-il la pousse ?",
        a: "Le minoxidil est un traitement de la chute de cheveux (avec avis médical), pas un accélérateur de pousse pour cheveux sains. Si ton objectif est la densité face à un recul, informe-toi d'abord sur ton stade de Norwood.",
      },
      {
        q: "Les massages du cuir chevelu, prouvé ou mythe ?",
        a: "Des études pilotes montrent un effet modeste mais réel du massage régulier (quelques minutes par jour) sur l'épaisseur du cheveu, via la stimulation mécanique des cellules du follicule. Gratuit, sans risque : à prendre.",
      },
      {
        q: "Cheveux longs homme : à partir de quelle longueur c'est gérable ?",
        a: "La « phase ingrate » se situe entre 8 et 15 cm. Un dégradé d'accompagnement chez le coiffeur tous les 2 mois la rend beaucoup plus présentable qu'une pousse sauvage.",
      },
    ],
    related: ["cheveux-crepus-homme", "perte-cheveux-jeune", "routine-capillaire-homme"],
  },
  {
    slug: "perte-cheveux-jeune",
    title: "Perte de cheveux à 20-30 ans : agir tôt, agir bien",
    metaTitle: "Perte de cheveux jeune (20-30 ans) : que faire ?",
    metaDescription:
      "Golfes qui se creusent, densité qui baisse à 20-30 ans ? Distinguer chute normale et alopécie, évaluer son stade de Norwood et agir pendant la fenêtre utile.",
    kicker: "Prévention",
    updated: "juillet 2026",
    intro: [
      "Perdre 50 à 100 cheveux par jour est normal. Ce qui ne l'est pas : des golfes qui se creusent, une ligne frontale qui recule sur les photos, un cuir chevelu qui devient visible sous la lumière. À 20-30 ans, ces signes méritent attention — pas panique — car c'est précisément l'âge où agir est le plus efficace.",
    ],
    sections: [
      {
        h2: "Chute normale ou début d'alopécie ?",
        list: [
          "Normal : chute diffuse et saisonnière (automne), cheveux qui repoussent, densité stable sur les photos à 1 an d'écart.",
          "À surveiller : recul localisé aux golfes ou au vertex, cheveux qui repoussent plus fins (miniaturisation), lisière visible en lumière rasante.",
          "L'échelle de Norwood (stades 1 à 7) permet de situer objectivement où tu en es — le stade 2-3 est la fenêtre d'action idéale.",
        ],
      },
      {
        h2: "Pourquoi la fenêtre 20-30 ans compte autant",
        paras: [
          "L'alopécie androgénétique miniaturise progressivement le follicule : à chaque cycle, le cheveu repousse plus fin, jusqu'à ne plus repousser. Un follicule miniaturisé peut être réactivé ; un follicule mort ne peut plus l'être. Plus on documente et on agit tôt, plus les options restent ouvertes — c'est mathématique.",
        ],
      },
      {
        h2: "Le plan d'action raisonnable",
        list: [
          "1. Documente : photos mensuelles standardisées (même angle, même lumière) — la mémoire est un très mauvais instrument de mesure.",
          "2. Optimise le terrain : cuir chevelu sain, pas de traction (coiffures serrées), nutrition correcte, stress géré.",
          "3. Situe ton stade de Norwood et suis son évolution — Capilatyx l'estime depuis une photo et le suit dans le temps.",
          "4. Si le recul progresse : consulte un dermatologue. Les traitements de référence (minoxidil, finastéride) relèvent d'un avis médical.",
        ],
      },
      {
        h2: "Coupes : jouer intelligemment avec la densité",
        paras: [
          "En attendant ou en complément : les bonnes coupes changent la perception. Un crop texturé avec frange floute une ligne frontale qui recule ; les côtés courts resserrent le contraste et rendent le dessus plus dense visuellement. À l'inverse, les cheveux longs plaqués en arrière exposent chaque millimètre de recul.",
        ],
      },
    ],
    faq: [
      {
        q: "La casquette fait-elle perdre les cheveux ?",
        a: "Non — mythe tenace. Une casquette propre et non compressive n'affecte pas le follicule. Seule la traction répétée (coiffures très serrées) peut causer une alopécie mécanique.",
      },
      {
        q: "Le stress peut-il faire perdre les cheveux ?",
        a: "Oui, temporairement : un stress intense peut déclencher une chute diffuse (effluvium télogène) 2-3 mois après l'événement. Elle est réversible — contrairement à l'alopécie androgénétique, elle ne creuse pas les golfes.",
      },
      {
        q: "À quel stade de Norwood faut-il s'inquiéter ?",
        a: "« S'inquiéter » jamais, « documenter » toujours. Le stade 2 est fréquent et souvent stable. C'est la PROGRESSION entre deux photos espacées de 6-12 mois qui doit déclencher une consultation, pas le stade lui-même.",
      },
    ],
    related: ["faire-pousser-cheveux", "cheveux-gras-homme", "routine-capillaire-homme"],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
