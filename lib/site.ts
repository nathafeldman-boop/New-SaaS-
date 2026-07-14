// ──────────────────────────────────────────────────────────────────────────
//  Configuration centrale du site.
//  Change le nom, les textes ou le tarif ici — tout se met à jour partout.
// ──────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  name: "Capilatyx",
  tagline: "Ton coach capillaire IA",
  description:
    "Prends-toi en photo, reçois une routine capillaire de 30 jours faite pour tes cheveux, et essaie des coupes avant de passer chez le coiffeur.",
  url: "https://capilatyx.website",
  locale: "fr_FR",
  // ── SEO : leviers principaux (title/description/mots-clés) ──────────────
  seo: {
    // ~58 caractères — sous la limite d'affichage Google.
    title: "Capilatyx — Coach capillaire IA & routine cheveux 30 jours",
    // ~150 caractères, riche en mots-clés mais naturel.
    description:
      "Diagnostic capillaire par IA en photo, routine sur-mesure de 30 jours, suivi de la calvitie et essayage de coupes avant le coiffeur. Sans installation.",
    keywords: [
      "routine capillaire",
      "diagnostic capillaire",
      "coach capillaire IA",
      "analyse de cheveux par photo",
      "soin des cheveux",
      "routine cheveux homme",
      "essayer une coupe de cheveux",
      "simulateur de coupe",
      "suivi calvitie Norwood",
      "produits capillaires recommandés",
      "Capilatyx",
    ],
  },
  price: {
    amount: "10,90 €",
    period: "/ mois",
    original: "13,63 €",
    discount: "−20 %",
    note: "Sans engagement — annulable à tout moment.",
  },
  nav: [
    { label: "Comment ça marche", href: "#methode" },
    { label: "L'app", href: "#app" },
    { label: "Coupes", href: "#coupes" },
    { label: "Guides", href: "/guides" },
    { label: "Tarif", href: "#tarif" },
  ],
  cta: {
    primary: "Faire mon scan gratuit",
    secondary: "Voir comment ça marche",
  },
};

export type SiteConfig = typeof siteConfig;
