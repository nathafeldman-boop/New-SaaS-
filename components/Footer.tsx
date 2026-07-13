"use client";

import { siteConfig } from "@/lib/site";
import { useLang } from "@/lib/i18n";

export function Footer() {
  const [lang] = useLang();
  const en = lang === "en";
  return (
    <footer className="border-t border-clay-200 bg-cream">
      <div className="container-page py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <a href="#top" className="flex items-center gap-2.5">
              <img src="/brand/mark.png" alt={siteConfig.name} className="h-9 w-9 object-contain" />
              <span className="font-display text-xl font-medium text-ink">
                {siteConfig.name}
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-cocoa-700">
              {en ? "Your AI hair coach" : siteConfig.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title={en ? "Product" : "Produit"}
              links={siteConfig.nav.map((n) => ({
                label: en
                  ? { "#methode": "How it works", "#app": "The app", "#coupes": "Haircuts", "#tarif": "Pricing" }[n.href] ?? n.label
                  : n.label,
                href: n.href,
              }))}
            />
            <FooterCol
              title="Guides"
              links={[
                { label: en ? "All hair guides" : "Tous les guides cheveux", href: "/guides" },
                { label: en ? "Men's hair routine" : "Routine capillaire homme", href: "/guides/routine-capillaire-homme" },
                { label: en ? "What's my hair type?" : "Quel type de cheveux ?", href: "/guides/type-de-cheveux" },
                { label: en ? "Men's haircuts" : "Coupes de cheveux homme", href: "/coupes" },
                { label: en ? "Norwood scale" : "Échelle de Norwood", href: "/calvitie" },
              ]}
            />
            <FooterCol
              title={en ? "Resources" : "Ressources"}
              links={[
                { label: en ? "Legal notice" : "Mentions légales", href: "/mentions-legales" },
                { label: en ? "Terms of sale" : "CGV", href: "/cgv" },
                { label: en ? "Privacy" : "Confidentialité", href: "/confidentialite" },
                { label: "Contact", href: "mailto:nathanaelsaas@gmail.com" },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-clay-200 pt-6 text-sm text-cocoa-600 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.{" "}
            {en ? "All rights reserved." : "Tous droits réservés."}
          </p>
          <p className="text-clay-600">
            {en ? "Web app — built for mobile." : "Application web — conçue pour le mobile."}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-clay-600">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-sm text-cocoa-700 transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
