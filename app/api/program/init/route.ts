import { NextResponse } from "next/server";
import { baselineScore, requireActive } from "@/lib/program";
import { computeScores, hasMistralKey } from "@/lib/mistral";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { DEFAULT_ROUTINE_TIME, normalizeRoutineTime } from "@/lib/routine-timer";

export const runtime = "nodejs";

/**
 * Démarre le programme 30 jours après le paiement : stocke la routine, les
 * coupes et l'analyse sur le profil, ouvre le Jour 1. Idempotent.
 */
export async function POST(req: Request) {
  const { error, supabase, user } = await requireActive();
  if (error) return NextResponse.json({ ok: false, reason: error });

  const body = await req.json().catch(() => ({}));
  const { analysis, routine, cuts, choice, routineTime, routineTzOffset, quizAnswers } = body ?? {};
  const cleanTime = normalizeRoutineTime(routineTime) ?? DEFAULT_ROUTINE_TIME;
  const tzOffset = Number.isFinite(routineTzOffset) ? Math.trunc(routineTzOffset) : 0;

  const { data: profile } = await supabase
    .from("profiles")
    .select("started_at")
    .eq("id", user!.id)
    .single();

  // Déjà démarré → on ne réécrit pas le programme.
  if (profile?.started_at) return NextResponse.json({ ok: true, already: true });

  // Score actuel + potentiel 30 jours, calculés par l'IA (réels, par profil).
  let score = baselineScore(analysis);
  let potential = Math.min(97, score + 22);
  if (analysis && hasMistralKey()) {
    try {
      const sc = await computeScores(analysis);
      if (sc?.overall) score = sc.overall;
      const pots = (sc?.axes ?? [])
        .map((a) => a.potential)
        .filter((n): n is number => typeof n === "number");
      if (pots.length) potential = Math.round(pots.reduce((s, x) => s + x, 0) / pots.length);
    } catch {
      // repli silencieux : on garde l'estimation de base
    }
  }
  potential = Math.min(100, Math.max(potential, score + 5));

  await supabase
    .from("profiles")
    .update({
      program: { routine, cuts, choice, potential },
      diagnosis: analysis ?? null,
      quiz_answers: quizAnswers ?? null,
      current_day: 1,
      hair_score: score,
      routine_time: cleanTime,
      routine_tz_offset: tzOffset,
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

  // Email de bienvenue (sans bloquer la réponse si Resend n'est pas prêt).
  if (user!.email) {
    const { subject, html } = welcomeEmail();
    sendEmail({ to: user!.email, subject, html }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
