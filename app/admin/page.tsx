import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

/** Vérifie le code d'accès et pose le cookie (Server Action — pas de route POST). */
async function enterDashboard(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "").trim();
  if (code === ADMIN_CODE) {
    const store = await cookies();
    store.set("cpx_admin", ADMIN_CODE, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/admin");
  }
  redirect("/admin?error=1");
}

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
          {new Date(m.generatedAt).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Europe/Paris",
          })}{" "}
          (Paris)
        </p>
      </div>

      <TabNav active={tab} />

      {tab === "overview" && (
        <>
          {/* Le parcours en un coup d'œil : où vont (et où se perdent) les visiteurs. */}
          <ConversionStrip
            visits={m.visits.unique}
            clicks={m.visits.ctaClicks}
            signups={m.signups.series.reduce((s, d) => s + d.value, 0)}
          />

          <SectionLabel emoji="💶" title="Argent" sub="Ce que le site rapporte" />
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="MRR" value={euro(m.revenue.mrr)} hint="Revenu récurrent / mois" accent />
            <Kpi label="Revenus ce mois" value={euro(m.revenue.thisMonth)} hint="Encaissé depuis le 1er" />
            <Kpi
              label="Abonnés actifs"
              value={String(m.subscribers.active)}
              hint={`${m.subscribers.activeStripe} payants · ${m.subscribers.activeCode} via code`}
            />
            <Kpi label="Churn" value={pct(m.churnRate)} hint="Abonnés qui résilient" />
          </div>

          <SectionLabel emoji="🚪" title="Acquisition" sub="Qui arrive sur le site (30 jours)" />
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Visiteurs uniques" value={String(m.visits.unique)} hint={`${m.visits.total} pages vues`} />
            <Kpi
              label="Clics « scan »"
              value={String(m.visits.ctaClicks)}
              hint={
                m.visits.unique > 0
                  ? `${pct(m.visits.ctaClicks / m.visits.unique)} des visiteurs`
                  : "Clics vers le funnel"
              }
            />
            <Kpi label="Inscrits (total)" value={String(m.signups.total)} hint={`+${m.signups.last7} sur 7 j`} />
            <Kpi label="Inscrits aujourd'hui" value={String(m.signups.today)} />
          </div>

          <SectionLabel emoji="📈" title="Tendances" sub="L'évolution jour par jour" />
          <Card
            title="Croissance des inscrits"
            sub="Nombre total de comptes, cumulé sur les 30 derniers jours."
          >
            <GrowthChart series={m.signups.series} />
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card
              title="Inscrits par jour"
              sub="Chaque barre = nouveaux comptes ce jour-là."
            >
              <BarChart series={m.signups.series} />
            </Card>
            <Card
              title="Visites par jour"
              sub="Chaque barre = visiteurs uniques ce jour-là."
            >
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
      <form action={enterDashboard} className="mt-5 space-y-3">
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

function Card({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 rounded-3xl bg-paper/80 p-5 ring-1 ring-clay-200/60">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      {sub && <p className="mt-0.5 text-xs text-cocoa-500">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionLabel({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div className="mt-8 flex items-baseline gap-2.5">
      <span aria-hidden>{emoji}</span>
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <span className="text-xs text-cocoa-500">· {sub}</span>
    </div>
  );
}

/** Le parcours visiteur → client en une bande : chaque flèche montre le taux de passage. */
function ConversionStrip({
  visits,
  clicks,
  signups,
}: {
  visits: number;
  clicks: number;
  signups: number;
}) {
  const stages = [
    { label: "Visiteurs", value: visits, hint: "arrivent sur le site" },
    { label: "Cliquent « scan »", value: clicks, hint: "entrent dans le funnel" },
    { label: "S'inscrivent", value: signups, hint: "créent un compte" },
  ];
  return (
    <div className="mt-5 rounded-3xl bg-ink p-5 text-cream">
      <p className="text-xs uppercase tracking-[0.18em] text-clay-300">
        Le parcours sur 30 jours — où vont tes visiteurs
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-0">
        {stages.map((s, i) => {
          const prev = stages[i - 1]?.value ?? 0;
          const rate = i > 0 && prev > 0 ? s.value / prev : null;
          return (
            <div key={s.label} className="flex flex-1 items-center gap-3 sm:gap-0">
              {i > 0 && (
                <div className="flex shrink-0 flex-col items-center px-1 sm:px-3">
                  <span aria-hidden className="text-clay-400">→</span>
                  <span
                    className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      rate !== null && rate < 0.1
                        ? "bg-red-400/20 text-red-200"
                        : "bg-clay-400/20 text-clay-200"
                    }`}
                  >
                    {rate !== null ? pct(rate) : "—"}
                  </span>
                </div>
              )}
              <div className="flex-1 rounded-2xl bg-cream/5 px-4 py-3 ring-1 ring-cream/10">
                <p className="font-display text-3xl leading-none">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-clay-100">{s.label}</p>
                <p className="text-[11px] text-clay-300/80">{s.hint}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-clay-300/80">
        Le % sous chaque flèche = la part qui passe à l&apos;étape suivante. C&apos;est là que tu vois
        où ça bloque. Détail étape par étape dans l&apos;onglet Funnel.
      </p>
    </div>
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
  const last = pts[pts.length - 1] ?? 0;
  const max = Math.max(1, ...pts);
  const w = 600;
  const h = 150;
  const stepX = pts.length > 1 ? w / (pts.length - 1) : w;
  const coords = pts.map((v, i) => [i * stepX, h - 8 - (v / max) * (h - 24)] as const);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const [endX, endY] = coords[coords.length - 1] ?? [w, h];
  return (
    <div className="text-cocoa-700">
      <div className="relative">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-40 w-full">
          <path d={area} fill="currentColor" opacity="0.12" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx={endX} cy={endY} r="5" fill="#43321F" stroke="#FBF7F1" strokeWidth="2" />
        </svg>
        <span className="absolute right-0 top-0 rounded-full bg-cocoa-700 px-2.5 py-1 text-xs font-semibold text-cream">
          {last} inscrit{last > 1 ? "s" : ""}
        </span>
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-cocoa-500">
        <span>{series[0] ? dayLabel(series[0].day) : ""}</span>
        <span>aujourd&apos;hui</span>
      </div>
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
                      timeZone: "Europe/Paris",
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

const dayLabel = (iso: string) => {
  const [, mm, dd] = iso.split("-");
  return `${dd}/${mm}`;
};

function BarChart({ series, money }: { series: DayPoint[]; money?: boolean }) {
  const max = Math.max(...series.map((d) => d.value), 0);
  const total = series.reduce((s, d) => s + d.value, 0);
  const nonZero = series.filter((d) => d.value > 0).length;
  // Valeurs affichées au-dessus des barres tant que ça reste lisible.
  const showValues = nonZero > 0 && nonZero <= 12;

  if (max === 0) {
    return (
      <div className="grid h-32 place-items-center rounded-2xl bg-sand/40 text-sm text-cocoa-500">
        Aucune donnée sur la période — ça se remplira au fil des jours.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-cocoa-500">
        <span>
          Total sur 30 j :{" "}
          <b className="font-semibold text-ink">{money ? euro(total) : total}</b>
        </span>
        <span>pic : {money ? euro(max) : max}</span>
      </div>
      <div className="mt-2 flex h-36 items-end gap-[3px] border-b border-clay-200 pb-px">
        {series.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            {showValues && d.value > 0 && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-cocoa-700">
                {money ? Math.round(d.value) : d.value}
              </span>
            )}
            <div
              className={`w-full rounded-t transition group-hover:bg-cocoa-700 ${
                d.value > 0 ? "bg-clay-500" : "bg-clay-200/50"
              }`}
              style={{
                height: d.value > 0 ? `${Math.max((d.value / max) * 88, 6)}%` : "2px",
              }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] text-cream group-hover:block">
              {dayLabel(d.day)} · {money ? euro(d.value) : d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-cocoa-500">
        <span>{series[0] ? dayLabel(series[0].day) : ""}</span>
        <span>{series[Math.floor(series.length / 2)] ? dayLabel(series[Math.floor(series.length / 2)].day) : ""}</span>
        <span>{series[series.length - 1] ? `aujourd'hui` : ""}</span>
      </div>
    </div>
  );
}

function FunnelChart({ steps }: { steps: Metrics["funnel"] }) {
  const top = Math.max(1, steps[0]?.sessions ?? 1);
  const last = steps[steps.length - 1]?.sessions ?? 0;
  const globalRate = steps.length > 1 ? last / top : null;

  // Repère la plus grosse perte (le taux de passage le plus faible) pour
  // pointer directement l'étape à travailler.
  let worstIdx = -1;
  let worstRate = 1;
  steps.forEach((s, i) => {
    const prev = steps[i - 1]?.sessions ?? 0;
    if (i > 0 && prev >= 3) {
      const r = s.sessions / prev;
      if (r < worstRate) {
        worstRate = r;
        worstIdx = i;
      }
    }
  });

  return (
    <div>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const fromTop = top > 0 ? s.sessions / top : 0;
          const prev = steps[i - 1]?.sessions ?? 0;
          const stepRate = i > 0 && prev > 0 ? s.sessions / prev : null;
          const isWorst = i === worstIdx;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-sm text-cocoa-700">{s.label}</span>
              <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-sand/60">
                <div
                  className={`flex h-full items-center rounded-lg px-2 text-sm font-medium text-cream ${
                    isWorst ? "bg-clay-600" : "bg-cocoa-700"
                  }`}
                  style={{ width: `${Math.max(fromTop * 100, s.sessions > 0 ? 8 : 0)}%` }}
                >
                  {s.sessions}
                </div>
              </div>
              <span
                className={`w-24 shrink-0 text-right text-xs ${
                  isWorst ? "font-semibold text-clay-600" : "text-cocoa-500"
                }`}
              >
                {stepRate !== null ? pct(stepRate) : ""}
                {isWorst && " ⚠️"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-sand/50 px-4 py-3 text-sm text-cocoa-800">
        <span>
          Conversion globale :{" "}
          <b className="font-semibold text-ink">{globalRate !== null ? pct(globalRate) : "—"}</b>{" "}
          des sessions vont du début à la fin.
        </span>
        {worstIdx >= 0 && (
          <span>
            ⚠️ Plus grosse perte : <b className="font-semibold">{steps[worstIdx].label}</b> — c&apos;est
            l&apos;étape à améliorer en priorité.
          </span>
        )}
      </div>
    </div>
  );
}
