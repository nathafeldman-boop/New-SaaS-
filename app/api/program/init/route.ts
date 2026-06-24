import { NextResponse } from "next/server";
import { baselineScore, requireActive } from "@/lib/program";

export const runtime = "nodejs";

/**
 * Démarre le programme 30 jours après le paiement : stocke la routine, les
 * coupes et l'analyse sur le profil, ouvre le Jour 1. Idempotent.
 */
export async function POST(req: Request) {
  const { error, supabase, user } = await requireActive();
  if (error) return NextResponse.json({ ok: false, reason: error });

  const body = await req.json().catch(() => ({}));
  const { analysis, routine, cuts, choice } = body ?? {};

  const { data: profile } = await supabase
    .from("profiles")
    .select("started_at")
    .eq("id", user!.id)
    .single();

  // Déjà démarré → on ne réécrit pas le programme.
  if (profile?.started_at) return NextResponse.json({ ok: true, already: true });

  const score = baselineScore(analysis);

  await supabase
    .from("profiles")
    .update({
      program: { routine, cuts, choice },
      diagnosis: analysis ?? null,
      current_day: 1,
      hair_score: score,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user!.id);

  await supabase
    .from("daily_entries")
    .upsert(
      { user_id: user!.id, day_number: 1, score },
      { onConflict: "user_id,day_number" },
    );

  return NextResponse.json({ ok: true });
}
