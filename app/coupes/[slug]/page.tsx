import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { getAllCuts, getCutBySlug, relatedCuts, faceShapes, type Cut } from "@/lib/cuts";
import { CutPageContent } from "@/components/coupes/CutPageContent";

export const revalidate = 86400; // ISR : régénération quotidienne.

export async function generateStaticParams() {
  const cuts = await getAllCuts();
  return cuts.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const cut = await getCutBySlug(params.slug);
  if (!cut) return { title: "Coupe introuvable" };

  const title = `Coupe ${cut.name} homme : à qui ça va, entretien & photos`;
  const description = `${cut.description ?? ""} Essaie la coupe ${cut.name} sur ta propre photo avant le coiffeur avec ${siteConfig.name}.`.trim();
  const url = `${siteConfig.url}/coupes/${cut.slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/coupes/${cut.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: cut.imageUrl ? [{ url: cut.imageUrl }] : undefined,
    },
  };
}

function shapesSentence(cut: Cut): string {
  const shapes = faceShapes(cut.tags);
  if (shapes.length === 0)
    return "Elle s'adapte à la plupart des morphologies — l'essentiel est l'équilibre avec tes traits et ta densité de cheveux.";
  if (shapes.length === 1)
    return `Elle met particulièrement en valeur un visage ${shapes[0]}.`;
  const last = shapes[shapes.length - 1];
  return `Elle flatte surtout les visages ${shapes.slice(0, -1).join(", ")} et ${last}.`;
}

export default async function CutPage({
  params,
}: {
  params: { slug: string };
}) {
  const cut = await getCutBySlug(params.slug);
  if (!cut) notFound();

  const all = await getAllCuts();
  const related = relatedCuts(all, cut);

  const faqs = [
    {
      q: `La coupe ${cut.name}, c'est pour quel type de visage ?`,
      a: shapesSentence(cut),
    },
    {
      q: `Quel entretien demande une ${cut.name} ?`,
      a: cut.maintenance
        ? `${cut.maintenance}. Une routine adaptée garde la coupe nette plus longtemps.`
        : "Un entretien régulier chez le coiffeur et une routine adaptée gardent la coupe nette.",
    },
    {
      q: `Comment savoir si la ${cut.name} me va vraiment ?`,
      a: `Avec ${siteConfig.name}, tu l'essaies sur ta propre photo en quelques secondes, avant de passer chez le coiffeur — tu vois le rendu sur ton visage et ta densité réelle.`,
    },
  ];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Coupes", item: `${siteConfig.url}/coupes` },
      { "@type": "ListItem", position: 3, name: cut.name, item: `${siteConfig.url}/coupes/${cut.slug}` },
    ],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="grain relative">
      <JsonLd data={breadcrumb} />
      <JsonLd data={faqLd} />
      <Nav />
      <main className="bg-cream">
        <CutPageContent cut={cut} related={related} />
      </main>
      <Footer />
    </div>
  );
}
