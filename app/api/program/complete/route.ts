import { NextResponse } from "next/server";
import { PROGRAM_LENGTH, requireActive, todayISO } from "@/lib/program";
import { nextUnlockMs } from "@/lib/routine-timer";

export const runtime = "nodejs";

/**
 * Valide la journée : marque le jour terminé, fait progresser le score et
 * ouvre le jour suivant. La séance suivante se débloque à l'heure de routine
 * choisie par l'utilisateur (au moins quelques heures plus tard).
 */
export async function POST(req: Request) {
  const { error, supabase, user } = await requireActive();
  if (error) return NextResponse.json({ ok: false, reason: error });

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_day, hair_score, last_completed_at, routine_time, routine_tz_offset, program")
    .eq("id", user!.id)
    .single();

  if (!profile) return NextResponse.json({ ok: false, error: "Profil introuvable" });

  const last = profile.last_completed_at
    ? new Date(profile.last_completed_at).getTime()
    : 0;
  // Verrou : la séance suivante se débloque à l'heure de routine choisie.
  if (last) {
    const unlock = nextUnlockMs(last, profile.routine_time, profile.routine_tz_offset ?? 0);
    if (Date.now() < unlock) {
      return NextResponse.json({
        ok: false,
        reason: "cooldown",
        unlockAt: new Date(unlock).toISOString(),
      });
    }
  }

  const day = profile.current_day || 1;

  // Photo obligatoire : pas de validation tant que la photo du jour n'est pas envoyée.
  const { data: entry } = await supabase
    .from("daily_entries")
    .select("photo_before_path, photo_after_path")
    .eq("user_id", user!.id)
    .eq("day_number", day)
    .maybeSingle();
  if (!entry?.photo_before_path && !entry?.photo_after_path) {
    return NextResponse.json({ ok: false, reason: "photo-required" });
  }

  // Le score monte à chaque jour validé, sans dépasser le potentiel IA.
  const prev = Number(profile.hair_score ?? 60);
  const potential = Number((profile.program as { potential?: number } | null)?.potential) || 100;
  const cap = Math.min(100, Math.max(potential, prev));
  const score = Math.min(cap, prev + 1.3);
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
    unlockAt: new Date(
      nextUnlockMs(Date.now(), profile.routine_time, profile.routine_tz_offset ?? 0),
    ).toISOString(),
    finished: nextDay >= PROGRAM_LENGTH,
  });
}
