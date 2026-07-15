import { NextResponse } from "next/server";
import { computeScores, hasMistralKey } from "@/lib/mistral";
import { demoScores } from "@/lib/funnel-demo";
import type { ApiResult, HairAnalysis, HairScores } from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Version publique et sans état de /api/scores, utilisée pendant le funnel
// GRATUIT (avant compte/paiement) à partir de l'analyse déjà en mémoire côté
// client. Contrairement à /api/scores : pas d'auth, rien lu/écrit en base.
export async function POST(req: Request) {
  let analysis: HairAnalysis | undefined;
  try {
    ({ analysis } = await req.json());
  } catch {
    return json({ ok: false, error: "Corps de requête invalide" }, 400);
  }
  if (!analysis) return json({ ok: false, error: "Analyse manquante" }, 400);

  if (!hasMistralKey()) {
    return json({ ok: true, demo: true, data: demoScores });
  }

  try {
    const data = await computeScores(analysis);
    return json({ ok: true, data });
  } catch (e) {
    return json({
      ok: true,
      demo: true,
      data: demoScores,
      error: e instanceof Error ? e.message : "Erreur Mistral",
    });
  }
}

function json(body: ApiResult<HairScores>, status = 200) {
  return NextResponse.json(body, { status });
}
