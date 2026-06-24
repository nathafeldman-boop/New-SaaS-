// ──────────────────────────────────────────────────────────────────────────
//  Configuration centrale du site.
//  Change le nom, les textes ou le tarif ici — tout se met à jour partout.
// ──────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  name: "Capilytix",
  tagline: "Ton coach capillaire IA",
  description:
    "Prends-toi en photo, reçois une routine capillaire de 30 jours faite pour tes cheveux, et essaie des coupes avant de passer chez le coiffeur.",
  url: "https://new-saa-s.vercel.app",
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
    { label: "Tarif", href: "#tarif" },
  ],
  cta: {
    primary: "Commencer",
    secondary: "Voir comment ça marche",
  },
};

export type SiteConfig = typeof siteConfig;
