import { NextResponse } from "next/server";
import { PROGRAM_LENGTH, requireActive, todayISO } from "@/lib/program";

export const runtime = "nodejs";

/**
 * Valide la journée : marque le jour terminé, fait progresser le score et
 * ouvre le jour suivant — une seule fois par jour calendaire (« reviens demain »).
 */
export async function POST(req: Request) {
  const { error, supabase, user } = await requireActive();
  if (error) return NextResponse.json({ ok: false, reason: error });

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_day, hair_score, last_completed_at")
    .eq("id", user!.id)
    .single();

  if (!profile) return NextResponse.json({ ok: false, error: "Profil introuvable" });

  const COOLDOWN = 24 * 60 * 60 * 1000;
  const last = profile.last_completed_at
    ? new Date(profile.last_completed_at).getTime()
    : 0;
  // Verrou 24h : on ne peut valider qu'une fois par cycle de 24h.
  if (last && Date.now() < last + COOLDOWN) {
    return NextResponse.json({
      ok: false,
      reason: "cooldown",
      unlockAt: new Date(last + COOLDOWN).toISOString(),
    });
  }

  const day = profile.current_day || 1;
  const score = Math.min(100, Number(profile.hair_score ?? 60) + 1.3);
  const nextDay = Math.min(PROGRAM_LENGTH, day + 1);
  const nowIso = new Date().toISOString();

  await supabase
    .from("daily_entries")
    .upsert(
      { user_id: user!.id, day_number: day, completed: true, score },
      { onConflict: "user_id,day_number" },
    );

  await supabase
    .from("profiles")
    .update({
      current_day: nextDay,
      hair_score: score,
      last_completed_date: todayISO(),
      last_completed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", user!.id);

  if (nextDay !== day) {
    await supabase
      .from("daily_entries")
      .upsert(
        { user_id: user!.id, day_number: nextDay },
        { onConflict: "user_id,day_number" },
      );
  }

  return NextResponse.json({
    ok: true,
    nextDay,
    score,
    unlockAt: new Date(Date.now() + COOLDOWN).toISOString(),
    finished: nextDay >= PROGRAM_LENGTH,
  });
}
