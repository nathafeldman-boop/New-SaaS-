import { cookies } from "next/headers";
import {
  ADMIN_CODE,
  getMetrics,
  getSignups,
  type DayPoint,
  type Metrics,
  type Signup,
} from "@/lib/admin-metrics";
import { CopyButton } from "@/components/admin/CopyButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord", robots: { index: false } };

const euro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
const pct = (n: number) => `${(n * 100).toFixed(1)} %`;

type Tab = "overview" | "funnel" | "revenue" | "signups";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "funnel", label: "Funnel" },
  { id: "revenue", label: "Revenus" },
  { id: "signups", label: "Inscrits" },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string; tab?: string };
}) {
  const cookieStore = await cookies();
  const authed = cookieStore.get("cpx_admin")?.value === ADMIN_CODE;

  if (!authed) {
    return (
      <Shell>
        <CodeGate error={searchParams?.error === "1"} />
      </Shell>
    );
  }

  const tab: Tab = TABS.find((t) => t.id === searchParams?.tab)?.id ?? "overview";
  const m = await getMetrics();
  const signups = tab === "signups" ? await getSignups() : [];

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Capilatyx · Admin</p>
          <h1 className="font-display text-3xl text-ink">Tableau de bord</h1>
        </div>
        <p className="text-xs text-cocoa-500">
          Mis à jour le{" "}
          {new Date(m.generatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
        </p>
      </div>

      <TabNav active={tab} />

      {tab === "overview" && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Kpi label="MRR" value={euro(m.revenue.mrr)} hint="Revenu récurrent mensuel" accent />
            <Kpi label="Abonnés actifs" value={String(m.subscribers.active)} hint={`${m.subscribers.activeStripe} payants · ${m.subscribers.activeCode} via code`} />
            <Kpi label="Inscrits (total)" value={String(m.signups.total)} hint={`+${m.signups.last7} sur 7 j`} />
            <Kpi label="Inscrits aujourd'hui" value={String(m.signups.today)} />
            <Kpi label="Visites (uniques)" value={String(m.visits.unique)} hint={`${m.visits.total} pages vues`} />
            <Kpi label="Clics « scan »" value={String(m.visits.ctaClicks)} hint="Clics vers le funnel" />
            <Kpi label="Churn" value={pct(m.churnRate)} hint="Résiliés / total" />
            <Kpi label="Revenus ce mois" value={euro(m.revenue.thisMonth)} />
          </div>
          <Card title="Croissance des inscrits (cumul 30 j)">
            <GrowthChart series={m.signups.series} />
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Inscrits par jour (30 j)">
              <BarChart series={m.signups.series} />
            </Card>
            <Card title="Visites par jour (30 j)">
              <BarChart series={m.visits.series} />
            </Card>
          </div>
          {!m.hasEvents && (
            <p className="mt-4 rounded-2xl border border-clay-200 bg-sand/50 px-4 py-3 text-sm text-cocoa-700">
              ℹ️ Le suivi des visites, clics et étapes du funnel vient d&apos;être activé : ces chiffres
              se rempliront à partir de maintenant (pas d&apos;historique avant la mise en ligne).
            </p>
          )}
        </>
      )}

      {tab === "funnel" && (
        <Card title="Funnel de conversion (30 derniers jours)">
          <FunnelChart steps={m.funnel} />
          <p className="mt-4 text-xs text-cocoa-500">
            Le % à droite = taux de passage depuis l&apos;étape précédente.
          </p>
        </Card>
      )}

      {tab === "revenue" && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="MRR" value={euro(m.revenue.mrr)} hint="Revenu récurrent mensuel" accent />
            <Kpi label="ARR" value={euro(m.revenue.arr)} hint="Annualisé (MRR × 12)" />
            <Kpi label="Revenus ce mois" value={euro(m.revenue.thisMonth)} />
            <Kpi label="Revenus 30 jours" value={euro(m.revenue.last30)} />
            <Kpi label="Abonnés payants" value={String(m.subscribers.activeStripe)} />
            <Kpi label="Abonnés via code" value={String(m.subscribers.activeCode)} />
            <Kpi label="Churn" value={pct(m.churnRate)} />
            <Kpi label="ARR potentiel" value={euro((m.subscribers.active * MONTHLY_PRICE_HINT) * 12)} hint="Si tous payants" />
          </div>
          <Card title="Revenus par jour (30 j)">
            <BarChart series={m.revenue.series} money />
          </Card>
        </>
      )}

      {tab === "signups" && <SignupsTable signups={signups} />}
    </Shell>
  );
}

const MONTHLY_PRICE_HINT = 10.9;

/* ── UI ─────────────────────────────────────────────────────────── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">{children}</div>
    </main>
  );
}

function CodeGate({ error }: { error: boolean }) {
  return (
    <div className="mx-auto mt-16 max-w-sm rounded-3xl bg-paper/80 p-8 ring-1 ring-clay-200/60">
      <p className="eyebrow">Capilatyx · Admin</p>
      <h1 className="mt-2 font-display text-2xl text-ink">Tableau de bord</h1>
      <p className="mt-2 text-sm text-cocoa-600">Entre le code d&apos;accès pour voir tes statistiques.</p>
      <form action="/api/admin/login" method="post" className="mt-5 space-y-3">
        <input
          name="code"
          type="password"
          autoFocus
          required
          placeholder="Code d'accès"
          autoComplete="off"
          className="w-full rounded-xl border border-clay-200 bg-cream px-4 py-3 text-ink outline-none transition focus:border-cocoa-700"
        />
        {error && <p className="text-sm text-red-600">Code incorrect.</p>}
        <button className="w-full rounded-xl bg-ink py-3 font-medium text-cream transition hover:opacity-90">
          Entrer
        </button>
      </form>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-5 ring-1 ring-clay-200/60 ${
        accent ? "bg-cocoa-700 text-cream" : "bg-paper/80 text-ink"
      }`}
    >
      <p className={`text-xs uppercase tracking-[0.15em] ${accent ? "text-cream/70" : "text-cocoa-500"}`}>
        {label}
      </p>
      <p className="mt-1.5 font-display text-2xl">{value}</p>
      {hint && (
        <p className={`mt-1 text-xs ${accent ? "text-cream/70" : "text-cocoa-500"}`}>{hint}</p>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-3xl bg-paper/80 p-5 ring-1 ring-clay-200/60">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TabNav({ active }: { active: Tab }) {
  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {TABS.map((t) => (
        <a
          key={t.id}
          href={`/admin?tab=${t.id}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            active === t.id
              ? "bg-cocoa-700 text-cream"
              : "bg-paper/70 text-cocoa-700 ring-1 ring-clay-200/60 hover:bg-paper"
          }`}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}

function GrowthChart({ series }: { series: DayPoint[] }) {
  let acc = 0;
  const pts = series.map((d) => (acc += d.value));
  const max = Math.max(1, ...pts);
  const w = 600;
  const h = 150;
  const stepX = pts.length > 1 ? w / (pts.length - 1) : w;
  const coords = pts.map((v, i) => [i * stepX, h - 6 - (v / max) * (h - 16)] as const);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return (
    <div className="text-cocoa-700">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-40 w-full">
        <path d={area} fill="currentColor" opacity="0.12" />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <p className="mt-2 text-xs text-cocoa-500">Total cumulé sur la période : {pts[pts.length - 1] ?? 0} inscrits</p>
    </div>
  );
}

function SignupsTable({ signups }: { signups: Signup[] }) {
  const emails = signups.map((s) => s.email).filter(Boolean).join(", ");
  return (
    <section className="mt-4 rounded-3xl bg-paper/80 p-5 ring-1 ring-clay-200/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-ink">Inscrits ({signups.length})</h2>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={emails} />
          <a
            href="/api/admin/export"
            className="rounded-xl border border-clay-300 bg-cream px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper"
          >
            Export CSV
          </a>
        </div>
      </div>
      <p className="mt-2 text-sm text-cocoa-600">
        Les emails de tous les comptes créés — pour repérer les vrais inscrits et leur envoyer tes
        nouvelles / réductions.
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-clay-200/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/60 text-cocoa-600">
            <tr>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Inscrit le</th>
              <th className="px-4 py-2.5 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-clay-200/70">
            {signups.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-cocoa-500">
                  Aucun inscrit pour l&apos;instant.
                </td>
              </tr>
            ) : (
              signups.map((s, i) => (
                <tr key={i} className="text-ink">
                  <td className="px-4 py-2.5">{s.email || "—"}</td>
                  <td className="px-4 py-2.5 text-cocoa-700">
                    {new Date(s.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        s.active
                          ? "bg-cocoa-700 text-cream"
                          : "bg-sand text-cocoa-600"
                      }`}
                    >
                      {s.active ? (s.via === "code" ? "Actif · code" : "Actif · payant") : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {emails && (
        <div className="mt-4">
          <p className="text-xs text-cocoa-500">Tous les emails (sélectionne et copie) :</p>
          <textarea
            readOnly
            value={emails}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-clay-200 bg-cream px-3 py-2 text-sm text-cocoa-800"
          />
        </div>
      )}
    </section>
  );
}

function BarChart({ series, money }: { series: DayPoint[]; money?: boolean }) {
  const max = Math.max(1, ...series.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-[3px]">
      {series.map((d) => (
        <div key={d.day} className="group relative flex-1">
          <div
            className="w-full rounded-t bg-clay-400 transition group-hover:bg-cocoa-700"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0 }}
          />
          <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] text-cream group-hover:block">
            {d.day.slice(5)} · {money ? euro(d.value) : d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function FunnelChart({ steps }: { steps: Metrics["funnel"] }) {
  const top = Math.max(1, steps[0]?.sessions ?? 1);
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const fromTop = top > 0 ? s.sessions / top : 0;
        const prev = steps[i - 1]?.sessions ?? 0;
        const stepRate = i > 0 && prev > 0 ? s.sessions / prev : null;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-44 shrink-0 text-sm text-cocoa-700">{s.label}</span>
            <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-sand/60">
              <div
                className="flex h-full items-center rounded-lg bg-cocoa-700 px-2 text-sm font-medium text-cream"
                style={{ width: `${Math.max(fromTop * 100, s.sessions > 0 ? 8 : 0)}%` }}
              >
                {s.sessions}
              </div>
            </div>
            <span className="w-16 shrink-0 text-right text-xs text-cocoa-500">
              {stepRate !== null ? pct(stepRate) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
