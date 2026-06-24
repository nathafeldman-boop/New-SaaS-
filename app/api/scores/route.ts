import { NextResponse } from "next/server";
import { computeScores, hasMistralKey } from "@/lib/mistral";
import { requireActive } from "@/lib/program";
import { demoScores } from "@/lib/funnel-demo";
import type { ApiResult, HairAnalysis, HairScores } from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Génère le rapport de score multi-axes (radar) à partir du diagnostic stocké,
 * puis le persiste dans profiles.diagnosis.scores. Renvoie le rapport.
 */
export async function POST() {
  const { error, supabase, user } = await requireActive();
  if (error) return json({ ok: false, error });

  const { data: profile } = await supabase
    .from("profiles")
    .select("diagnosis")
    .eq("id", user!.id)
    .single();

  const diagnosis = profile?.diagnosis as HairAnalysis | null;
  if (!diagnosis) return json({ ok: false, error: "no-diagnosis" });

  // Déjà calculé → on renvoie le cache.
  if (diagnosis.scores?.axes?.length) {
    return json({ ok: true, data: diagnosis.scores });
  }

  if (!hasMistralKey()) {
    await persist(supabase, user!.id, diagnosis, demoScores);
    return json({ ok: true, demo: true, data: demoScores });
  }

  try {
    const scores = await computeScores(diagnosis);
    await persist(supabase, user!.id, diagnosis, scores);
    return json({ ok: true, data: scores });
  } catch (e) {
    return json({
      ok: true,
      demo: true,
      data: demoScores,
      error: e instanceof Error ? e.message : "Erreur Mistral",
    });
  }
}

async function persist(
  supabase: any,
  id: string,
  diagnosis: HairAnalysis,
  scores: HairScores,
) {
  await supabase
    .from("profiles")
    .update({ diagnosis: { ...diagnosis, scores }, updated_at: new Date().toISOString() })
    .eq("id", id);
}

function json(body: ApiResult<HairScores>, status = 200) {
  return NextResponse.json(body, { status });
}
