import { NextResponse } from "next/server";
import { analyzeHair, hasMistralKey } from "@/lib/mistral";
import { demoAnalysis } from "@/lib/funnel-demo";
import type { ApiResult, HairAnalysis } from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let image: string | undefined;
  let quiz: Record<string, string> | undefined;
  try {
    ({ image, quiz } = await req.json());
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
    const data = await analyzeHair(image, quiz);
    return json({ ok: true, data });
  } catch (e) {
    // La clé est configurée mais l'appel a échoué (clé invalide, quota, modèle,
    // réseau…). On NE renvoie PAS un faux diagnostic « exemple » présenté comme
    // réel : on remonte l'erreur pour que l'étape d'analyse propose « Réessayer »
    // et que la cause soit visible (utile pour diagnostiquer une clé HS).
    const detail = e instanceof Error ? e.message : "Erreur Mistral";
    return json({ ok: false, error: `Analyse indisponible — ${detail}` }, 502);
  }
}

function json(body: ApiResult<HairAnalysis>, status = 200) {
  return NextResponse.json(body, { status });
}
