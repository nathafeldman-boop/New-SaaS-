import { NextResponse } from "next/server";
import { recommendProducts, hasMistralKey } from "@/lib/mistral";
import { requireActive } from "@/lib/program";
import { pexelsImages } from "@/lib/pexels";
import { demoProducts } from "@/lib/funnel-demo";
import type { ApiResult, HairAnalysis, ProductReco } from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Recommandation de produits (vraies marques via Mistral) + photos Pexels.
 * Mise en cache dans profiles.product_recos. `force: true` régénère.
 */
export async function POST(req: Request) {
  const { error, supabase, user } = await requireActive();
  if (error) return json({ ok: false, error });

  const { force } = (await req.json().catch(() => ({}))) as { force?: boolean };

  const { data: profile } = await supabase
    .from("profiles")
    .select("diagnosis, product_recos")
    .eq("id", user!.id)
    .single();

  // Cache.
  if (!force && Array.isArray(profile?.product_recos) && profile!.product_recos.length) {
    return json({ ok: true, data: profile!.product_recos as ProductReco[] });
  }

  const diagnosis = profile?.diagnosis as HairAnalysis | null;
  if (!diagnosis) return json({ ok: false, error: "no-diagnosis" });

  if (!hasMistralKey()) {
    const withImgs = await attachImages(demoProducts);
    await persist(supabase, user!.id, withImgs);
    return json({ ok: true, demo: true, data: withImgs });
  }

  try {
    const products = await recommendProducts(diagnosis);
    const withImgs = await attachImages(products);
    await persist(supabase, user!.id, withImgs);
    return json({ ok: true, data: withImgs });
  } catch (e) {
    const withImgs = await attachImages(demoProducts);
    return json({
      ok: true,
      demo: true,
      data: withImgs,
      error: e instanceof Error ? e.message : "Erreur Mistral",
    });
  }
}

async function attachImages(products: ProductReco[]): Promise<ProductReco[]> {
  const imgs = await pexelsImages(products.map((p) => p.imageQuery || "hair product"));
  return products.map((p, i) => ({ ...p, imageUrl: imgs[i] ?? null }));
}

async function persist(supabase: any, id: string, products: ProductReco[]) {
  await supabase
    .from("profiles")
    .update({ product_recos: products, updated_at: new Date().toISOString() })
    .eq("id", id);
}

function json(body: ApiResult<ProductReco[]>, status = 200) {
  return NextResponse.json(body, { status });
}
