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
    .select("current_day, hair_score, last_completed_date")
    .eq("id", user!.id)
    .single();

  if (!profile) return NextResponse.json({ ok: false, error: "Profil introuvable" });

  const today = todayISO();
  if (profile.last_completed_date === today) {
    return NextResponse.json({ ok: false, reason: "already-today" });
  }

  const day = profile.current_day || 1;
  const score = Math.min(100, Number(profile.hair_score ?? 60) + 1.3);
  const nextDay = Math.min(PROGRAM_LENGTH, day + 1);

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
      last_completed_date: today,
      updated_at: new Date().toISOString(),
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

  return NextResponse.json({ ok: true, nextDay, score, finished: nextDay >= PROGRAM_LENGTH });
}
