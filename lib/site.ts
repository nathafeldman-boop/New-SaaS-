// ──────────────────────────────────────────────────────────────────────────
//  Configuration centrale du site.
//  Change le nom, les textes ou le tarif ici — tout se met à jour partout.
// ──────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  name: "Crinea", // ← Nom provisoire. Remplace-le par le nom définitif.
  tagline: "Ta routine cheveux, à partir d'une simple photo.",
  description:
    "Prends-toi en photo, reçois une routine capillaire de 30 jours faite pour tes cheveux, et essaie des coupes avant de passer chez le coiffeur.",
  url: "https://crinea.app",
  // Tarif provisoire — remplace par ton prix réel quand il est fixé.
  price: {
    amount: "9,90 €",
    period: "/ cycle de 30 jours",
    note: "Tarif indicatif — à ajuster avant le lancement.",
  },
  nav: [
    { label: "Comment ça marche", href: "#methode" },
    { label: "L'app", href: "#app" },
    { label: "Coupes", href: "#coupes" },
    { label: "Tarif", href: "#tarif" },
  ],
  cta: {
    primary: "Commencer",
    secondary: "Voir comment ça marche",
  },
};

export type SiteConfig = typeof siteConfig;
