import { NextResponse } from "next/server";
import { requireActive } from "@/lib/program";
import { normalizeRoutineTime } from "@/lib/routine-timer";

export const runtime = "nodejs";

/**
 * Met à jour l'heure à laquelle l'utilisateur veut faire sa routine.
 * Le déblocage de la séance suivante se calera sur cette heure.
 */
export async function POST(req: Request) {
  const { error, supabase, user } = await requireActive();
  if (error) return NextResponse.json({ ok: false, reason: error });

  const body = (await req.json().catch(() => ({}))) as {
    routineTime?: string;
    routineTzOffset?: number;
  };

  const clean = normalizeRoutineTime(body.routineTime);
  if (!clean) {
    return NextResponse.json({ ok: false, error: "Heure invalide" }, { status: 400 });
  }
  const tzOffset = Number.isFinite(body.routineTzOffset)
    ? Math.trunc(body.routineTzOffset as number)
    : 0;

  await supabase
    .from("profiles")
    .update({
      routine_time: clean,
      routine_tz_offset: tzOffset,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user!.id);

  return NextResponse.json({ ok: true, routineTime: clean, routineTzOffset: tzOffset });
}
