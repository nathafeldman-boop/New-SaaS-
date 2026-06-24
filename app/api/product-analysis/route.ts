import { NextResponse } from "next/server";
import { analyzeProduct, hasMistralKey } from "@/lib/mistral";
import { requireActive } from "@/lib/program";
import { demoProductAnalysis } from "@/lib/funnel-demo";
import type { ApiResult, HairAnalysis, ProductAnalysis } from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Analyse un produit (nom et/ou photo de l'étiquette) au regard du profil
 * capillaire de l'utilisateur. Renvoie compatibilité + ingrédients clés.
 */
export async function POST(req: Request) {
  const { error, supabase, user } = await requireActive();
  if (error) return json({ ok: false, error });

  const { name, image } = (await req.json().catch(() => ({}))) as {
    name?: string;
    image?: string;
  };

  if (!name?.trim() && !image?.startsWith("data:image")) {
    return json({ ok: false, error: "Indique un nom de produit ou une photo." }, 400);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("diagnosis")
    .eq("id", user!.id)
    .single();
  const diagnosis = (profile?.diagnosis as HairAnalysis | null) ?? null;

  if (!hasMistralKey()) {
    return json({ ok: true, demo: true, data: demoProductAnalysis });
  }

  try {
    const data = await analyzeProduct({ name, image }, diagnosis);
    return json({ ok: true, data });
  } catch (e) {
    return json({
      ok: true,
      demo: true,
      data: demoProductAnalysis,
      error: e instanceof Error ? e.message : "Erreur Mistral",
    });
  }
}

function json(body: ApiResult<ProductAnalysis>, status = 200) {
  return NextResponse.json(body, { status });
}
