import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { NORWOOD_STAGES, getStageBySlug, stageSlug } from "@/lib/norwood";
import { StagePageContent } from "@/components/calvitie/StagePageContent";

export const dynamicParams = false;

export function generateStaticParams() {
  return NORWOOD_STAGES.map((s) => ({ stade: stageSlug(s.stage) }));
}

export async function generateMetadata({
  params,
}: {
  params: { stade: string };
}): Promise<Metadata> {
  const s = getStageBySlug(params.stade);
  if (!s) return { title: "Stade introuvable" };

  const title = `Stade ${s.stage} de Norwood (${s.name}) : signes et que faire`;
  return {
    title,
    description: s.summary,
    alternates: { canonical: `/calvitie/${params.stade}` },
    openGraph: { title, description: s.summary, type: "article" },
  };
}

export default async function StagePage({
  params,
}: {
  params: { stade: string };
}) {
  const { stade } = params;
  const s = getStageBySlug(stade);
  if (!s) notFound();

  const faqs = [
    {
      q: `Le stade ${s.stage} de Norwood, c'est grave ?`,
      a: `${s.summary} ${s.advice}`,
    },
    {
      q: `Comment savoir si je suis au stade ${s.stage} ?`,
      a: `Le plus simple est d'estimer ton stade depuis une photo. ${siteConfig.name} situe ta ligne frontale sur l'échelle de Norwood et en suit l'évolution dans le temps, en 3D.`,
    },
  ];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Calvitie", item: `${siteConfig.url}/calvitie` },
      {
        "@type": "ListItem",
        position: 3,
        name: `Stade ${s.stage}`,
        item: `${siteConfig.url}/calvitie/${stade}`,
      },
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
        <StagePageContent stade={stade} />
      </main>
      <Footer />
    </div>
  );
}
