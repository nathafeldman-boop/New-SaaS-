import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { reminderEmail, sendEmail } from "@/lib/email";
import { todayISO } from "@/lib/program";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Relance quotidienne : email à chaque abonné actif qui a commencé son
 * programme mais n'a pas encore validé sa journée. Déclenché par le cron Vercel.
 */
export async function GET(req: Request) {
  // Protection : si CRON_SECRET est défini, on exige le bon header.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const today = todayISO();

  // Abonnés actifs.
  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id")
    .in("status", ["active", "trialing", "past_due"]);
  const activeIds = new Set((subs ?? []).map((s: any) => s.user_id));
  if (activeIds.size === 0) return NextResponse.json({ ok: true, sent: 0 });

  // Profils en cours de programme qui n'ont pas validé aujourd'hui.
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, current_day, last_completed_date, started_at")
    .not("started_at", "is", null)
    .lte("current_day", 30);

  const targets = (profiles ?? []).filter(
    (p: any) =>
      activeIds.has(p.id) &&
      p.email &&
      (!p.last_completed_date || p.last_completed_date < today),
  );

  let sent = 0;
  for (const p of targets) {
    const { subject, html } = reminderEmail(p.current_day || 1);
    const r = await sendEmail({ to: p.email, subject, html });
    if (r.ok) sent++;
    if (r.reason === "no-key") break; // inutile de continuer sans clé
  }

  return NextResponse.json({ ok: true, candidates: targets.length, sent });
}
