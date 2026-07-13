import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ADMIN_CODE } from "@/lib/admin-metrics";

export const runtime = "nodejs";

/** Événements autorisés (anti-spam : on ignore tout le reste). */
const ALLOWED = new Set([
  "pageview",
  "cta_scan_click",
  "funnel_step",
  "purchase",
  "aff_click",
]);

/** Robots / crawlers à ne PAS compter dans les stats (Googlebot & cie). */
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|googlebot|google-inspectiontool|adsbot|mediapartners|facebookexternalhit|whatsapp|telegram|pingdom|uptimerobot|headless|lighthouse|preview|monitor|python-requests|curl|wget|axios|node-fetch|go-http|bytespider|yandex|sogou|seznam|scrapy|phantomjs|puppeteer|playwright|selenium|okhttp|httpclient|java\/|libwww|feedfetcher|dataprovider|scanner|gptbot|claude|perplexity|ccbot|anthropic|openai/i;

/** Enregistre un événement de tracking (visites, clics, étapes du funnel). */
export async function POST(req: Request) {
  // On ignore les robots : ils ne doivent pas gonfler les visites.
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return new NextResponse(null, { status: 204 });

  // Préchargements du navigateur (Chrome précharge des pages sans visite réelle).
  const purpose =
    req.headers.get("sec-purpose") ?? req.headers.get("purpose") ?? "";
  if (/prefetch|prerender|preview/i.test(purpose)) {
    return new NextResponse(null, { status: 204 });
  }

  // On ne compte pas le propriétaire : si le cookie admin est présent
  // (tu t'es connecté au dashboard sur ce navigateur), tes propres visites
  // et tests ne gonflent plus les stats.
  const cookies = req.headers.get("cookie") ?? "";
  if (cookies.includes(`cpx_admin=${ADMIN_CODE}`)) {
    return new NextResponse(null, { status: 204 });
  }

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

  // Les pages d'admin ne sont pas des visites.
  const path = payload.path ? String(payload.path) : "";
  if (path.startsWith("/admin")) return new NextResponse(null, { status: 204 });

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
      // _ua conservé pour pouvoir auditer (et purger) un robot passé
      // entre les mailles du filtre.
      props: { ...(payload.props ?? {}), _ua: ua.slice(0, 160) },
    });
  } catch {
    // best-effort
  }

  return new NextResponse(null, { status: 204 });
}
