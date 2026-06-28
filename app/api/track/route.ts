import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Événements autorisés (anti-spam : on ignore tout le reste). */
const ALLOWED = new Set([
  "pageview",
  "cta_scan_click",
  "funnel_step",
  "purchase",
]);

/** Robots / crawlers à ne PAS compter dans les stats (Googlebot & cie). */
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|googlebot|google-inspectiontool|adsbot|mediapartners|facebookexternalhit|whatsapp|telegram|pingdom|uptimerobot|headless|lighthouse|preview|monitor|python-requests|curl|wget|axios|node-fetch|go-http/i;

/** Enregistre un événement de tracking (visites, clics, étapes du funnel). */
export async function POST(req: Request) {
  // On ignore les robots : ils ne doivent pas gonfler les visites.
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return new NextResponse(null, { status: 204 });

  let payload: {
    name?: string;
    sessionId?: string;
    path?: string;
    props?: Record<string, unknown> | null;
  };
  try {
    payload = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const name = String(payload.name ?? "");
  if (!ALLOWED.has(name)) return new NextResponse(null, { status: 204 });

  // user_id si une session est connectée (sinon visiteur anonyme).
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {}

  try {
    const admin = createAdminClient();
    await admin.from("events").insert({
      name,
      session_id: payload.sessionId ? String(payload.sessionId).slice(0, 64) : null,
      user_id: userId,
      path: payload.path ? String(payload.path).slice(0, 256) : null,
      props: payload.props ?? null,
    });
  } catch {
    // best-effort
  }

  return new NextResponse(null, { status: 204 });
}
