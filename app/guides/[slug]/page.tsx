import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { GUIDES, getGuide } from "@/lib/guides";
import { GuidePageContent } from "@/components/guides/GuidePageContent";

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
        <GuidePageContent guide={guide} related={related} />
      </main>
      <Footer />
    </div>
  );
}
