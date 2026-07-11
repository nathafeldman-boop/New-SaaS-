import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllCuts } from "@/lib/cuts";
import { NORWOOD_STAGES, stageSlug } from "@/lib/norwood";
import { GUIDES } from "@/lib/guides";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = siteConfig.url;

  // Les coupes viennent de la base : si l'appel échoue, on n'empêche PAS le
  // sitemap de se générer (sinon Google voit "Impossible de récupérer").
  let cuts: Awaited<ReturnType<typeof getAllCuts>> = [];
  try {
    cuts = await getAllCuts();
  } catch {
    cuts = [];
  }

  const cutUrls: MetadataRoute.Sitemap = cuts.map((c) => ({
    url: `${base}/coupes/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const stageUrls: MetadataRoute.Sitemap = NORWOOD_STAGES.map((s) => ({
    url: `${base}/calvitie/${stageSlug(s.stage)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const guideUrls: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const legalUrls: MetadataRoute.Sitemap = [
    "/mentions-legales",
    "/cgv",
    "/confidentialite",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/coupes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/calvitie`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...guideUrls,
    ...cutUrls,
    ...stageUrls,
    ...legalUrls,
  ];
}
