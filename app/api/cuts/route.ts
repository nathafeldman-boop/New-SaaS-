import { NextResponse } from "next/server";
import { hasMistralKey, recommendCuts } from "@/lib/mistral";
import { demoCuts } from "@/lib/funnel-demo";
import type { ApiResult, CutsResult, HairAnalysis } from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let analysis: HairAnalysis | undefined;
  try {
    ({ analysis } = await req.json());
  } catch {
    return json({ ok: false, error: "Corps de requête invalide" }, 400);
  }
  if (!analysis) return json({ ok: false, error: "Analyse manquante" }, 400);

  if (!hasMistralKey()) {
    return json({ ok: true, demo: true, data: demoCuts });
  }

  try {
    const data = await recommendCuts(analysis);
    return json({ ok: true, data });
  } catch (e) {
    return json({
      ok: true,
      demo: true,
      data: demoCuts,
      error: e instanceof Error ? e.message : "Erreur Mistral",
    });
  }
}

function json(body: ApiResult<CutsResult>, status = 200) {
  return NextResponse.json(body, { status });
}
