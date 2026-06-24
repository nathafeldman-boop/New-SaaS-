// Données structurées (JSON-LD) pour la page d'accueil.
// Un seul graphe @graph relie Organization, WebSite, SoftwareApplication et
// FAQPage — éligibilité aux rich results Google.

import { siteConfig } from "@/lib/site";
import { faqs } from "@/lib/faq";

export function homepageJsonLd() {
  const org = `${siteConfig.url}/#organization`;
  const site = `${siteConfig.url}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/brand/logo.png`,
        description: siteConfig.seo.description,
      },
      {
        "@type": "WebSite",
        "@id": site,
        url: siteConfig.url,
        name: siteConfig.name,
        inLanguage: "fr-FR",
        publisher: { "@id": org },
      },
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        url: siteConfig.url,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        description: siteConfig.seo.description,
        inLanguage: "fr-FR",
        publisher: { "@id": org },
        offers: {
          "@type": "Offer",
          price: "10.90",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteConfig.url}/#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
