import { siteConfig } from "@/lib/site";

export function Footer() {
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
              {siteConfig.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Produit"
              links={siteConfig.nav.map((n) => ({ label: n.label, href: n.href }))}
            />
            <FooterCol
              title="Guides"
              links={[
                { label: "Tous les guides cheveux", href: "/guides" },
                { label: "Routine capillaire homme", href: "/guides/routine-capillaire-homme" },
                { label: "Quel type de cheveux ?", href: "/guides/type-de-cheveux" },
                { label: "Coupes de cheveux homme", href: "/coupes" },
                { label: "Échelle de Norwood", href: "/calvitie" },
              ]}
            />
            <FooterCol
              title="Ressources"
              links={[
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "CGV", href: "/cgv" },
                { label: "Confidentialité", href: "/confidentialite" },
                { label: "Contact", href: "mailto:nathanaelsaas@gmail.com" },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-clay-200 pt-6 text-sm text-cocoa-600 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </p>
          <p className="text-clay-600">Application web — conçue pour le mobile.</p>
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
