import { createAdminClient } from "@/lib/supabase/server";

/** Prix mensuel de l'abonnement (cf. siteConfig "10,90 €"). */
export const MONTHLY_PRICE = 10.9;

/** Code d'entrée du dashboard (modifiable via env, sinon valeur par défaut). */
export const ADMIN_CODE = process.env.ADMIN_DASHBOARD_CODE || "CAPILATYX2026";

const DAY = 86_400_000;
const isCode = (priceId: string | null) => Boolean(priceId?.startsWith("access_code:"));
const isActive = (status: string | null) => status === "active" || status === "trialing";
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export type DayPoint = { day: string; value: number };

export type Metrics = {
  signups: { total: number; today: number; last7: number; last30: number; series: DayPoint[] };
  subscribers: { active: number; activeStripe: number; activeCode: number; canceled: number };
  revenue: { mrr: number; arr: number; last30: number; thisMonth: number; series: DayPoint[] };
  churnRate: number;
  visits: { total: number; unique: number; ctaClicks: number; series: DayPoint[] };
  funnel: { label: string; sessions: number }[];
  generatedAt: string;
  hasEvents: boolean;
};

function emptySeries(days: number): DayPoint[] {
  const out: DayPoint[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) out.push({ day: dayKey(new Date(now - i * DAY)), value: 0 });
  return out;
}

function bumpSeries(series: DayPoint[], iso: string, by = 1) {
  const k = iso.slice(0, 10);
  const p = series.find((s) => s.day === k);
  if (p) p.value += by;
}

export async function getMetrics(): Promise<Metrics> {
  const admin = createAdminClient();
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY).toISOString();

  const [profilesRes, subsRes, eventsRes] = await Promise.all([
    admin.from("profiles").select("created_at"),
    admin.from("subscriptions").select("status, price_id, created_at"),
    admin
      .from("events")
      .select("name, session_id, path, props, created_at")
      .gte("created_at", since30),
  ]);

  const profiles = profilesRes.data ?? [];
  const subs = subsRes.data ?? [];
  const events = eventsRes.data ?? [];

  /* ---- Inscrits ---- */
  const signupSeries = emptySeries(30);
  let sToday = 0,
    s7 = 0,
    s30 = 0;
  const startOfToday = new Date(new Date().toISOString().slice(0, 10)).getTime();
  for (const p of profiles) {
    const t = new Date(p.created_at).getTime();
    if (t >= startOfToday) sToday++;
    if (t >= now - 7 * DAY) s7++;
    if (t >= now - 30 * DAY) {
      s30++;
      bumpSeries(signupSeries, p.created_at);
    }
  }

  /* ---- Abonnés / MRR / Churn / Revenus ---- */
  let activeStripe = 0,
    activeCode = 0,
    canceled = 0;
  const revenueSeries = emptySeries(30);
  let rev30 = 0,
    revThisMonth = 0;
  const monthPrefix = new Date().toISOString().slice(0, 7);
  for (const s of subs) {
    const active = isActive(s.status);
    const code = isCode(s.price_id);
    if (active && code) activeCode++;
    else if (active && !code) activeStripe++;
    if (!active) canceled++;
    // Revenu encaissé (approx.) : abonnements Stripe payants créés sur la période.
    if (!code) {
      const t = new Date(s.created_at).getTime();
      if (t >= now - 30 * DAY) {
        rev30 += MONTHLY_PRICE;
        bumpSeries(revenueSeries, s.created_at, MONTHLY_PRICE);
      }
      if (s.created_at.slice(0, 7) === monthPrefix) revThisMonth += MONTHLY_PRICE;
    }
  }
  const mrr = activeStripe * MONTHLY_PRICE;
  const churnRate =
    activeStripe + canceled > 0 ? canceled / (activeStripe + canceled) : 0;

  /* ---- Visites & funnel (depuis events) ---- */
  const visitSeries = emptySeries(30);
  const pageviewSessions = new Set<string>();
  let pageviews = 0,
    ctaClicks = 0;
  const sScan = new Set<string>();
  const sFunnel = new Set<string>();
  const sDiag = new Set<string>();
  const sPaywall = new Set<string>();
  const sCheckout = new Set<string>();
  const sLanding = new Set<string>();

  for (const e of events) {
    const sid = e.session_id || "";
    const step = (e.props as { step?: string } | null)?.step;
    if (e.name === "pageview") {
      pageviews++;
      if (sid) pageviewSessions.add(sid);
      bumpSeries(visitSeries, e.created_at);
      if (e.path === "/" && sid) sLanding.add(sid);
    } else if (e.name === "cta_scan_click") {
      ctaClicks++;
      if (sid) sScan.add(sid);
    } else if (e.name === "funnel_step" && sid) {
      sFunnel.add(sid);
      if (step === "reveal") sDiag.add(sid);
      if (step === "paywall") sPaywall.add(sid);
      if (step === "checkout") sCheckout.add(sid);
    }
  }

  const funnel = [
    { label: "Visites landing", sessions: sLanding.size },
    { label: "Clic « Faire mon scan »", sessions: sScan.size },
    { label: "Funnel démarré", sessions: sFunnel.size },
    { label: "Diagnostic vu", sessions: sDiag.size },
    { label: "Paywall vu", sessions: sPaywall.size },
    { label: "Paiement atteint", sessions: sCheckout.size },
    { label: "Inscrits (payés)", sessions: activeStripe + activeCode },
  ];

  return {
    signups: { total: profiles.length, today: sToday, last7: s7, last30: s30, series: signupSeries },
    subscribers: { active: activeStripe + activeCode, activeStripe, activeCode, canceled },
    revenue: { mrr, arr: mrr * 12, last30: rev30, thisMonth: revThisMonth, series: revenueSeries },
    churnRate,
    visits: {
      total: pageviews,
      unique: pageviewSessions.size,
      ctaClicks,
      series: visitSeries,
    },
    funnel,
    generatedAt: new Date().toISOString(),
    hasEvents: events.length > 0,
  };
}
