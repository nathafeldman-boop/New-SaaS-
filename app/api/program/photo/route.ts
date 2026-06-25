import { NextResponse } from "next/server";
import { requireActive } from "@/lib/program";
import { nextUnlockMs } from "@/lib/routine-timer";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Enregistre la photo (avant/après) du jour dans le bucket privé. */
export async function POST(req: Request) {
  const { error, supabase, user } = await requireActive();
  if (error) return NextResponse.json({ ok: false, reason: error });

  const { day, kind, dataUrl } = (await req.json().catch(() => ({}))) as {
    day?: number;
    kind?: "before" | "after";
    dataUrl?: string;
  };

  if (!day || (kind !== "before" && kind !== "after") || !dataUrl) {
    return NextResponse.json({ ok: false, error: "Paramètres invalides" }, { status: 400 });
  }

  // Verrou : pas d'envoi de photo tant que la séance n'est pas débloquée (heure de routine).
  const { data: prof } = await supabase
    .from("profiles")
    .select("last_completed_at, routine_time, routine_tz_offset")
    .eq("id", user!.id)
    .single();
  const last = prof?.last_completed_at ? new Date(prof.last_completed_at).getTime() : 0;
  if (last && Date.now() < nextUnlockMs(last, prof?.routine_time, prof?.routine_tz_offset ?? 0)) {
    return NextResponse.json({ ok: false, reason: "cooldown" });
  }

  const base64 = dataUrl.split(",")[1] ?? "";
  const buf = Buffer.from(base64, "base64");
  const path = `${user!.id}/${day}/${kind}.jpg`;

  const { error: upErr } = await supabase.storage
    .from("progress-photos")
    .upload(path, buf, { contentType: "image/jpeg", upsert: true });
  if (upErr) return NextResponse.json({ ok: false, error: upErr.message });

  const col = kind === "before" ? "photo_before_path" : "photo_after_path";
  await supabase
    .from("daily_entries")
    .upsert(
      { user_id: user!.id, day_number: day, [col]: path },
      { onConflict: "user_id,day_number" },
    );

  const { data: signed } = await supabase.storage
    .from("progress-photos")
    .createSignedUrl(path, 3600);

  return NextResponse.json({ ok: true, url: signed?.signedUrl ?? null });
}
