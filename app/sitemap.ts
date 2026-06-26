import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllCuts } from "@/lib/cuts";
import { NORWOOD_STAGES, stageSlug } from "@/lib/norwood";

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

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/coupes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/calvitie`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...cutUrls,
    ...stageUrls,
  ];
}
