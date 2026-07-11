import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { GUIDES, getGuide } from "@/lib/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `${siteConfig.url}/guides/${guide.slug}`,
    },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const url = `${siteConfig.url}/guides/${guide.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.metaDescription,
        inLanguage: "fr-FR",
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          logo: { "@type": "ImageObject", url: `${siteConfig.url}/brand/logo.png` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${siteConfig.url}/guides` },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const related = guide.related
    .map((slug) => getGuide(slug))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <div className="grain relative">
      <JsonLd data={jsonLd} />
      <Nav />
      <main className="bg-cream">
        <article className="container-page pt-28 sm:pt-32">
          <nav className="text-sm text-cocoa-500" aria-label="Fil d'Ariane">
            <a href="/" className="hover:text-ink">Accueil</a>
            <span className="px-1.5">/</span>
            <a href="/guides" className="hover:text-ink">Guides</a>
            <span className="px-1.5">/</span>
            <span className="text-cocoa-700">{guide.kicker}</span>
          </nav>

          <header className="mt-8 max-w-2xl">
            <span className="eyebrow">{guide.kicker}</span>
            <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-5xl">
              {guide.title}
            </h1>
            <p className="mt-3 text-sm text-cocoa-500">
              Mis à jour : {guide.updated}
            </p>
            {guide.intro.map((p) => (
              <p key={p.slice(0, 40)} className="mt-5 text-lg leading-relaxed text-cocoa-700">
                {p}
              </p>
            ))}
          </header>

          <div className="mt-12 max-w-2xl space-y-12">
            {guide.sections.map((s) => (
              <section key={s.h2}>
                <h2 className="font-display text-2xl text-ink sm:text-3xl">{s.h2}</h2>
                {s.paras?.map((p) => (
                  <p key={p.slice(0, 40)} className="mt-4 leading-relaxed text-cocoa-800">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-4 space-y-2.5">
                    {s.list.map((item) => (
                      <li key={item.slice(0, 40)} className="flex items-start gap-3 text-cocoa-800">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* CTA produit */}
            <aside className="rounded-3xl bg-ink p-7 text-cream sm:p-9">
              <p className="font-display text-2xl">
                Une routine pensée pour TES cheveux, pas pour la moyenne.
              </p>
              <p className="mt-3 text-clay-200">
                Prends une photo, reçois ton diagnostic (type, état, score sur
                100) et ta routine de 30 jours personnalisée — gratuit pour le
                diagnostic.
              </p>
              <a
                href="/scan"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-paper"
              >
                {siteConfig.cta.primary}
              </a>
            </aside>

            {/* FAQ */}
            <section>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Questions fréquentes
              </h2>
              <div className="mt-5 divide-y divide-clay-200">
                {guide.faq.map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="cursor-pointer list-none font-display text-lg text-ink">
                      {f.q}
                    </summary>
                    <p className="mt-3 leading-relaxed text-cocoa-700">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Maillage interne */}
            {related.length > 0 && (
              <section className="pb-20">
                <h2 className="font-display text-2xl text-ink">À lire ensuite</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <a
                      key={r.slug}
                      href={`/guides/${r.slug}`}
                      className="group rounded-2xl bg-paper p-5 shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-0.5"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">
                        {r.kicker}
                      </span>
                      <p className="mt-1.5 font-display text-lg leading-snug text-ink">
                        {r.title}
                      </p>
                      <span className="mt-2 inline-block text-sm text-clay-600 group-hover:text-ink">
                        Lire →
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
