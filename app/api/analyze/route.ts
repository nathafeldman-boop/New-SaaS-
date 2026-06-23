import { NextResponse } from "next/server";
import { analyzeHair, hasMistralKey } from "@/lib/mistral";
import { demoAnalysis } from "@/lib/funnel-demo";
import type { ApiResult, HairAnalysis } from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let image: string | undefined;
  try {
    ({ image } = await req.json());
  } catch {
    return json({ ok: false, error: "Corps de requête invalide" }, 400);
  }
  if (!image || !image.startsWith("data:image")) {
    return json({ ok: false, error: "Photo manquante" }, 400);
  }

  if (!hasMistralKey()) {
    return json({ ok: true, demo: true, data: demoAnalysis });
  }

  try {
    const data = await analyzeHair(image);
    return json({ ok: true, data });
  } catch (e) {
    // repli démo clairement signalé plutôt qu'un écran cassé
    return json({
      ok: true,
      demo: true,
      data: demoAnalysis,
      error: e instanceof Error ? e.message : "Erreur Mistral",
    });
  }
}

function json(body: ApiResult<HairAnalysis>, status = 200) {
  return NextResponse.json(body, { status });
}
