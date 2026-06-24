"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fileToDataUrl, resizeDataUrl } from "@/lib/image";
import type { CutsResult, HairAnalysis, Routine } from "@/lib/funnel-types";

type Entry = {
  day_number: number;
  score: number | null;
  completed: boolean;
  beforeUrl: string | null;
  afterUrl: string | null;
};

type Props = {
  email: string;
  program: { routine?: Routine; cuts?: CutsResult; choice?: any } | null;
  diagnosis: HairAnalysis | null;
  currentDay: number;
  score: number | null;
  startedAt: string | null;
  lastCompletedDate: string | null;
  subscription: { status: string | null; via: "stripe" | "code" | null };
  entries: Entry[];
};

const TABS = [
  { key: "today", label: "Aujourd'hui" },
  { key: "evolution", label: "Évolution" },
  { key: "cuts", label: "Coupes" },
  { key: "sub", label: "Abonnement" },
  { key: "profile", label: "Profil" },
] as const;

const todayISO = () => new Date().toISOString().slice(0, 10);

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Dashboard(props: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("today");
  const [day, setDay] = useState(props.currentDay || 1);
  const [score, setScore] = useState(props.score ?? null);
  const [lastDone, setLastDone] = useState(props.lastCompletedDate);
  const [busy, setBusy] = useState(false);

  const started = Boolean(props.startedAt);
  const validatedToday = lastDone === todayISO();
  const routineDay = props.program?.routine?.days?.[Math.max(0, day - 1)];
  const completedCount = props.entries.filter((e) => e.completed).length;

  const todayEntry = props.entries.find((e) => e.day_number === day);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(todayEntry?.beforeUrl ?? null);
  const [afterUrl, setAfterUrl] = useState<string | null>(todayEntry?.afterUrl ?? null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  async function uploadPhoto(kind: "before" | "after", file: File) {
    setBusy(true);
    try {
      const raw = await fileToDataUrl(file);
      const dataUrl = await resizeDataUrl(raw, 1024);
      const r = await fetch("/api/program/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, kind, dataUrl }),
      }).then((res) => res.json());
      if (r.ok && r.url) {
        if (kind === "before") setBeforeUrl(r.url);
        else setAfterUrl(r.url);
      }
    } finally {
      setBusy(false);
    }
  }

  async function validateDay() {
    setBusy(true);
    try {
      const r = await fetch("/api/program/complete", { method: "POST" }).then((res) => res.json());
      if (r.ok) {
        setScore(r.score);
        setLastDone(todayISO());
        setDay(r.nextDay);
        setBeforeUrl(null);
        setAfterUrl(null);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    try {
      const r = await fetch("/api/stripe/portal", { method: "POST" }).then((res) => res.json());
      if (r.ok && r.url) window.location.href = r.url;
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <main className="grain relative min-h-screen bg-grad-warm">
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-7">
        {/* En-tête */}
        <header className="flex items-center justify-between">
          <a href="/" className="font-display text-[1.6rem] tracking-tight text-ink">
            Capilytix
          </a>
          {started && (
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-paper/70 px-3 py-1.5 font-medium text-cocoa-700 ring-1 ring-clay-200">
                🔥 {completedCount} {completedCount > 1 ? "jours" : "jour"}
              </span>
            </div>
          )}
        </header>

        {/* Onglets */}
        <nav className="mt-6 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${
                tab === t.key
                  ? "bg-ink text-cream shadow-soft"
                  : "bg-paper/60 text-cocoa-700 ring-1 ring-clay-200/70 hover:bg-paper"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {/* ───── AUJOURD'HUI ───── */}
          {tab === "today" &&
            (!started ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {/* Héros : anneau de progression + score */}
                <motion.section
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="overflow-hidden rounded-5xl bg-ink p-6 text-cream shadow-soft"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-clay-300">
                    {greeting} · {props.email.split("@")[0]}
                  </p>
                  <div className="mt-4 flex items-center gap-5">
                    <Ring value={day} max={30}>
                      <span className="text-[0.62rem] uppercase tracking-widest text-clay-300">Jour</span>
                      <span className="font-display text-4xl leading-none">{day}</span>
                      <span className="text-[0.62rem] text-clay-300">/ 30</span>
                    </Ring>
                    <div className="flex-1">
                      <p className="font-display text-2xl leading-tight">
                        {validatedToday ? "Journée validée 🌿" : phaseTitle(routineDay?.phase, day)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Stat label="Score" value={score != null ? Math.round(score).toString() : "—"} />
                        <Stat label="Série" value={`${completedCount} j`} />
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Routine du jour */}
                {routineDay && (
                  <motion.section
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={1}
                    className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60 backdrop-blur-sm"
                  >
                    <p className="eyebrow">{routineDay.phase || "Routine"}</p>
                    <h3 className="display-2 mt-3 text-2xl text-ink">{routineDay.title}</h3>
                    <p className="mt-1.5 text-[0.92rem] text-cocoa-600">{routineDay.focus}</p>
                    <ul className="mt-5 space-y-3">
                      {routineDay.steps.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-[0.95rem] text-cocoa-800">
                          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sand font-display text-sm text-cocoa-700">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.section>
                )}

                {/* Photos avant / après */}
                <motion.section
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={2}
                  className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60 backdrop-blur-sm"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="display-2 text-xl text-ink">Ta photo du jour</h3>
                    <span className="text-xs text-cocoa-500">avant → après</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <PhotoSlot label="Avant" url={beforeUrl} busy={busy} done={validatedToday} onPick={(f) => uploadPhoto("before", f)} />
                    <PhotoSlot label="Après" url={afterUrl} busy={busy} done={validatedToday} onPick={(f) => uploadPhoto("after", f)} />
                  </div>
                </motion.section>

                {/* Validation */}
                {validatedToday ? (
                  <div className="rounded-4xl border border-clay-200 bg-sand/50 p-5 text-center">
                    <p className="font-display text-lg text-ink">Bravo, c'est fait pour aujourd'hui ✨</p>
                    <p className="mt-1 text-sm text-cocoa-600">
                      Reviens demain pour débloquer le <strong>Jour {day}</strong>.
                    </p>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={validateDay}
                      disabled={busy || !beforeUrl}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {busy ? "Un instant…" : "Valider ma journée"}
                    </button>
                    {!beforeUrl && (
                      <p className="mt-2 text-center text-xs text-cocoa-500">
                        Ajoute au moins ta photo « avant » pour valider.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

          {/* ───── ÉVOLUTION ───── */}
          {tab === "evolution" && (
            <div className="space-y-4">
              <section className="rounded-5xl bg-ink p-6 text-center text-cream shadow-soft">
                <p className="text-xs uppercase tracking-[0.22em] text-clay-300">Ton score capillaire</p>
                <p className="mt-2 font-display text-6xl leading-none">{score != null ? Math.round(score) : "—"}</p>
                <p className="mt-1 text-xs text-clay-300">sur 100</p>
                <Sparkline entries={props.entries} />
              </section>

              {props.entries.filter((e) => e.beforeUrl || e.afterUrl).length === 0 ? (
                <p className="rounded-4xl border border-dashed border-clay-300 bg-paper/50 p-8 text-center text-sm text-cocoa-500">
                  Tes photos avant/après s'afficheront ici, jour après jour. Ta transformation se construit. 🌱
                </p>
              ) : (
                <div className="space-y-3">
                  {props.entries
                    .filter((e) => e.beforeUrl || e.afterUrl)
                    .map((e) => (
                      <div key={e.day_number} className="rounded-4xl bg-paper/80 p-4 shadow-card ring-1 ring-clay-200/60">
                        <div className="mb-2.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-ink">Jour {e.day_number}</span>
                          {e.score != null && (
                            <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs text-cocoa-700">
                              Score {Math.round(e.score)}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Thumb label="Avant" url={e.beforeUrl} />
                          <Thumb label="Après" url={e.afterUrl} />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ───── COUPES ───── */}
          {tab === "cuts" && (
            <div className="space-y-3">
              {props.program?.cuts?.cuts?.length ? (
                props.program.cuts.cuts.map((c, i) => (
                  <motion.div
                    key={c.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={i}
                    className="rounded-4xl bg-paper/80 p-5 shadow-card ring-1 ring-clay-200/60"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="display-2 text-lg text-ink">{c.name}</h3>
                      <span className="shrink-0 text-xs text-cocoa-500">{c.vibe}</span>
                    </div>
                    <p className="mt-1.5 text-[0.92rem] text-cocoa-700">{c.description}</p>
                  </motion.div>
                ))
              ) : (
                <p className="rounded-4xl border border-dashed border-clay-300 bg-paper/50 p-8 text-center text-sm text-cocoa-500">
                  Ta sélection de coupes apparaîtra ici.
                </p>
              )}
            </div>
          )}

          {/* ───── ABONNEMENT ───── */}
          {tab === "sub" && (
            <section className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60">
              <p className="text-xs uppercase tracking-[0.2em] text-cocoa-500">Statut</p>
              <p className="mt-1.5 font-display text-2xl text-ink">
                {props.subscription.status === "active" || props.subscription.status === "trialing"
                  ? "Abonnement actif"
                  : props.subscription.status === "past_due"
                    ? "Paiement en attente"
                    : "Inactif"}
              </p>
              <p className="mt-1 text-sm text-cocoa-600">
                {props.subscription.via === "code"
                  ? "Accès via code d'accès."
                  : "Cycle Capilytix — 10,90 € / mois, sans engagement."}
              </p>
              {props.subscription.via === "stripe" ? (
                <button onClick={openPortal} disabled={busy} className="btn-ghost mt-5 w-full disabled:opacity-50">
                  Gérer / annuler mon abonnement
                </button>
              ) : props.subscription.via === null ? (
                <a href="/scan" className="btn-primary mt-5 w-full">
                  Activer mon abonnement
                </a>
              ) : null}
            </section>
          )}

          {/* ───── PROFIL ───── */}
          {tab === "profile" && (
            <div className="space-y-3">
              <section className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60">
                <p className="text-xs uppercase tracking-[0.2em] text-cocoa-500">Compte</p>
                <p className="mt-1.5 text-ink">{props.email}</p>
              </section>
              {props.diagnosis && (
                <section className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-cocoa-500">Ton diagnostic</p>
                  <p className="mt-2 leading-relaxed text-ink">{props.diagnosis.summary}</p>
                  {props.diagnosis.hairType && (
                    <p className="mt-3 inline-flex rounded-full bg-sand px-3 py-1 text-sm text-cocoa-700">
                      {props.diagnosis.hairType}
                    </p>
                  )}
                </section>
              )}
              <form action="/auth/signout" method="post">
                <button className="w-full rounded-full border border-clay-300 bg-paper/60 py-3 text-sm text-cocoa-700 transition hover:bg-paper">
                  Déconnexion
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ── Sous-composants ──────────────────────────────────────────── */

function phaseTitle(phase: string | undefined, day: number) {
  if (phase) return phase;
  if (day <= 7) return "On pose les fondations.";
  if (day <= 21) return "On consolide, jour après jour.";
  return "Dernière ligne droite 💪";
}

function Ring({ value, max, children }: { value: number; max: number; children: React.ReactNode }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(216,189,157,0.25)" strokeWidth="9" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#D8BD9D"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full bg-cream/10 px-3 py-1 ring-1 ring-cream/15">
      <span className="font-display text-base text-cream">{value}</span>
      <span className="text-[0.7rem] uppercase tracking-wider text-clay-300">{label}</span>
    </span>
  );
}

function Sparkline({ entries }: { entries: Entry[] }) {
  const pts = entries.filter((e) => e.score != null).map((e) => e.score as number);
  if (pts.length < 2) return null;
  const min = Math.min(...pts) - 2;
  const max = Math.max(...pts) + 2;
  const span = Math.max(1, max - min);
  const coords = pts
    .map((p, i) => `${(i / (pts.length - 1)) * 100},${28 - ((p - min) / span) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-4 h-10 w-full">
      <polyline points={coords} fill="none" stroke="#D8BD9D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="rounded-5xl bg-paper/80 p-8 text-center shadow-card ring-1 ring-clay-200/60">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sand text-2xl">🌱</div>
      <p className="mt-4 font-display text-xl text-ink">Ton programme t'attend</p>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-cocoa-600">
        Fais ton scan pour débloquer ta routine de 30 jours et commencer ton suivi.
      </p>
      <a href="/scan" className="btn-primary mt-5 inline-flex">
        Faire mon scan
      </a>
    </div>
  );
}

function PhotoSlot({
  label,
  url,
  busy,
  done,
  onPick,
}: {
  label: string;
  url: string | null;
  busy: boolean;
  done?: boolean;
  onPick: (f: File) => void;
}) {
  return (
    <label
      className={`group relative block aspect-[3/4] overflow-hidden rounded-2xl border bg-cream transition ${
        url ? "border-clay-300" : "border-dashed border-clay-300 hover:border-clay-400"
      } ${done ? "cursor-default" : "cursor-pointer"}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center gap-1 text-center text-sm text-cocoa-500">
          <span className="text-2xl opacity-70 transition group-hover:scale-110">📷</span>
          <span className="text-xs">Ajouter</span>
        </span>
      )}
      <span className="absolute bottom-2 left-2 rounded-full bg-ink/75 px-2.5 py-0.5 text-[0.7rem] font-medium text-cream backdrop-blur-sm">
        {label}
      </span>
      <input
        type="file"
        accept="image/*"
        capture="user"
        disabled={busy || done}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
    </label>
  );
}

function Thumb({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-clay-200 bg-cream">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-xs text-cocoa-400">{label} —</span>
      )}
      <span className="absolute bottom-2 left-2 rounded-full bg-ink/75 px-2.5 py-0.5 text-[0.7rem] text-cream backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
