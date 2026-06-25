// ──────────────────────────────────────────────────────────────────────────
//  Accès public (anonyme) au catalogue de coupes — pour les pages SEO.
//  Client sans cookies : utilisable au build (generateStaticParams) et en ISR.
//  La RLS autorise la lecture anonyme de cuts_catalog (catalogue public).
// ──────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

export type Cut = {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  tags: string[];
  vibe: string | null;
  maintenance: string | null;
  popularity: number | null;
  description: string | null;
  imageUrl: string | null;
};

/** Transforme un nom en slug URL ("Burst Fade + Boucles" → "burst-fade-plus-boucles"). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

function mapCut(r: Record<string, any>): Cut {
  return {
    id: r.id,
    name: r.name,
    slug: slugify(r.name),
    gender: r.gender ?? null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    vibe: r.vibe ?? null,
    maintenance: r.maintenance ?? null,
    popularity: r.popularity ?? null,
    description: r.description ?? null,
    imageUrl: r.image_url ?? null,
  };
}

export async function getAllCuts(): Promise<Cut[]> {
  try {
    const { data } = await publicClient()
      .from("cuts_catalog")
      .select("id,name,gender,tags,vibe,maintenance,popularity,description,image_url")
      .order("popularity", { ascending: false, nullsFirst: false });
    return (data ?? []).map(mapCut);
  } catch {
    return [];
  }
}

export async function getCutBySlug(slug: string): Promise<Cut | null> {
  const cuts = await getAllCuts();
  return cuts.find((c) => c.slug === slug) ?? null;
}

/** Quelques coupes liées (pour le maillage interne). */
export function relatedCuts(all: Cut[], current: Cut, n = 4): Cut[] {
  const shareShape = (c: Cut) => c.tags.some((t) => current.tags.includes(t));
  return all
    .filter((c) => c.slug !== current.slug)
    .sort((a, b) => {
      const sa = shareShape(a) ? 1 : 0;
      const sb = shareShape(b) ? 1 : 0;
      if (sa !== sb) return sb - sa;
      return (b.popularity ?? 0) - (a.popularity ?? 0);
    })
    .slice(0, n);
}

const SHAPE_LABELS: Record<string, string> = {
  ovale: "ovale",
  rond: "rond",
  carre: "carré",
  carré: "carré",
  allonge: "allongé",
  allongé: "allongé",
  triangle: "triangulaire",
};

/** Transforme les tags de morphologie en libellés lisibles ("visage ovale"). */
export function faceShapes(tags: string[]): string[] {
  return tags
    .map((t) => SHAPE_LABELS[t] ?? null)
    .filter((x): x is string => Boolean(x));
}
