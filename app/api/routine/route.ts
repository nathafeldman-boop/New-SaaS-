import { NextResponse } from "next/server";
import { generateRoutine, hasMistralKey } from "@/lib/mistral";
import { demoRoutine } from "@/lib/funnel-demo";
import type { ApiResult, HairAnalysis, Routine } from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let analysis: HairAnalysis | undefined;
  let cut: string | undefined;
  try {
    ({ analysis, cut } = await req.json());
  } catch {
    return json({ ok: false, error: "Corps de requête invalide" }, 400);
  }
  if (!analysis) return json({ ok: false, error: "Analyse manquante" }, 400);

  if (!hasMistralKey()) {
    return json({ ok: true, demo: true, data: demoRoutine });
  }

  try {
    const data = await generateRoutine(analysis, cut ?? "coupe conservée");
    return json({ ok: true, data });
  } catch (e) {
    return json({
      ok: true,
      demo: true,
      data: demoRoutine,
      error: e instanceof Error ? e.message : "Erreur Mistral",
    });
  }
}

function json(body: ApiResult<Routine>, status = 200) {
  return NextResponse.json(body, { status });
}
