"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { fileToDataUrl, resizeDataUrl } from "@/lib/image";
import { LivingStrands } from "@/components/LivingStrands";
import { ScalpTracker } from "@/components/dashboard/ScalpTracker";
import { HairRadar } from "@/components/dashboard/HairRadar";
import { ProductsTab } from "@/components/dashboard/ProductsTab";
import {
  currentTzOffsetMin,
  nextUnlockMs,
  routineTimeLabel,
} from "@/lib/routine-timer";
import type { CutsResult, HairAnalysis, Routine, RoutineDay } from "@/lib/funnel-types";

type Entry = {
  day_number: number;
  score: number | null;
  completed: boolean;
  beforeUrl: string | null;
  afterUrl: string | null;
};

type Props = {
  email: string;
  program: { routine?: Routine; cuts?: CutsResult; choice?: any; potential?: number } | null;
  diagnosis: HairAnalysis | null;
  currentDay: number;
  score: number | null;
  startedAt: string | null;
  lastCompletedDate: string | null;
  lastCompletedAt: string | null;
  routineTime: string;
  routineTzOffset: number;
  subscription: { status: string | null; via: "stripe" | "code" | null };
  entries: Entry[];
  catalog?: CatalogCut[];
};

type CatalogCut = {
  id: string;
  name: string;
  vibe: string | null;
  description: string | null;
  maintenance: string | null;
  image_url: string | null;
  tags: string[] | null;
};

const TABS = [
  { key: "today", label: "Aujourd'hui", icon: "🌿", hint: "Ta routine & ta journée" },
  { key: "evolution", label: "Évolution", icon: "📈", hint: "Score, radar & photos" },
  { key: "scalp", label: "Calvitie", icon: "🪞", hint: "Suivi Norwood en 3D" },
  { key: "products", label: "Produits", icon: "🧴", hint: "Reco & analyse d'ingrédients" },
  { key: "cuts", label: "Coupes", icon: "✂️", hint: "Tes coupes & le catalogue" },
  { key: "sub", label: "Abonnement", icon: "✨", hint: "Gérer ton accès" },
  { key: "profile", label: "Profil", icon: "👤", hint: "Compte & diagnostic" },
] as const;

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
  const [menuOpen, setMenuOpen] = useState(false);
  const current = TABS.find((t) => t.key === tab) ?? TABS[0];
  const [day, setDay] = useState(props.currentDay || 1);
  const [score, setScore] = useState(props.score ?? null);
  const [lastAt, setLastAt] = useState(props.lastCompletedAt);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [routineTime, setRoutineTime] = useState(props.routineTime || "08:00");

  const started = Boolean(props.startedAt);
  const lastAtMs = lastAt ? new Date(lastAt).getTime() : 0;
  // La séance suivante se débloque à l'heure de routine choisie (pas un +24h fixe).
  const unlockMs = lastAtMs
    ? nextUnlockMs(lastAtMs, routineTime, props.routineTzOffset ?? 0)
    : 0;
  const windowMs = unlockMs && lastAtMs ? unlockMs - lastAtMs : 24 * 60 * 60 * 1000;
  const inCooldown = Boolean(lastAt) && now < unlockMs;
  const ringDay = inCooldown ? Math.max(0, day - 1) : day;
  const routineDay = props.program?.routine?.days?.[Math.max(0, day - 1)];
  const completedCount = props.entries.filter((e) => e.completed).length;

  // Horloge du compte à rebours.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Recharge automatiquement quand le compte à rebours se termine.
  const refreshedRef = useRef(false);
  useEffect(() => {
    if (inCooldown) refreshedRef.current = false;
    else if (lastAt && !refreshedRef.current) {
      refreshedRef.current = true;
      router.refresh();
    }
  }, [inCooldown, lastAt, router]);

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
        setDay(r.nextDay);
        setLastAt(new Date().toISOString());
        setNow(Date.now());
        setBeforeUrl(null);
        setAfterUrl(null);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveSchedule(time: string) {
    const prev = routineTime;
    setRoutineTime(time); // optimiste
    try {
      const r = await fetch("/api/program/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routineTime: time, routineTzOffset: currentTzOffsetMin() }),
      }).then((res) => res.json());
      if (!r.ok) setRoutineTime(prev);
      else router.refresh();
    } catch {
      setRoutineTime(prev);
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
      <div className="mx-auto max-w-2xl px-5 pb-28 pt-8">
        {/* En-tête */}
        <header className="flex items-center justify-between">
          <a href="/" className="font-display text-[1.6rem] tracking-tight text-ink">
            Capilatyx
          </a>
          {started && (
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-paper/70 px-3 py-1.5 font-medium text-cocoa-700 ring-1 ring-clay-200">
                🔥 {completedCount} {completedCount > 1 ? "jours" : "jour"}
              </span>
            </div>
          )}
        </header>

        {/* Navigation par menu (déclutter : un seul bouton) */}
        <div className="relative z-30 mt-7">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            className="flex w-full items-center justify-between rounded-3xl bg-paper/80 px-5 py-4 shadow-card ring-1 ring-clay-200/70 backdrop-blur-sm transition hover:bg-paper"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sand text-lg">
                {current.icon}
              </span>
              <span className="text-left">
                <span className="block font-display text-lg leading-tight text-ink">
                  {current.label}
                </span>
                <span className="block text-[0.72rem] text-cocoa-500">{current.hint}</span>
              </span>
            </span>
            <span className="flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-wider text-cocoa-500">
              Menu
              <motion.span animate={{ rotate: menuOpen ? 180 : 0 }} className="text-base">
                ⌄
              </motion.span>
            </span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                {/* Fond cliquable pour fermer */}
                <button
                  aria-label="Fermer le menu"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-20 cursor-default"
                />
                <motion.nav
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 right-0 top-full z-30 mt-2 grid grid-cols-2 gap-1.5 rounded-3xl bg-paper p-2 shadow-soft ring-1 ring-clay-200/70"
                >
                  {TABS.map((t) => {
                    const active = t.key === tab;
                    return (
                      <button
                        key={t.key}
                        onClick={() => {
                          setTab(t.key);
                          setMenuOpen(false);
                        }}
                        className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 text-left transition ${
                          active
                            ? "bg-ink text-cream"
                            : "text-cocoa-700 hover:bg-sand/70"
                        }`}
                      >
                        <span className="text-base">{t.icon}</span>
                        <span className="text-sm font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </motion.nav>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-7">
          {/* ───── AUJOURD'HUI ───── */}
          {tab === "today" &&
            (!started ? (
              <EmptyState />
            ) : (
              <div className="space-y-5">
                {/* Héros : anneau de progression + score */}
                <motion.section
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="relative overflow-hidden rounded-5xl bg-ink p-6 text-cream shadow-soft"
                >
                  <LivingStrands className="pointer-events-none absolute -right-8 -top-10 h-64 w-64 text-clay-400/25" />
                  <p className="relative text-xs uppercase tracking-[0.22em] text-clay-300">
                    {greeting} · {props.email.split("@")[0]}
                  </p>
                  <div className="relative mt-4 flex items-center gap-5">
                    <Ring value={ringDay} max={30}>
                      <span className="text-[0.62rem] uppercase tracking-widest text-clay-300">Jour</span>
                      <span className="font-display text-4xl leading-none">{ringDay}</span>
                      <span className="text-[0.62rem] text-clay-300">/ 30</span>
                    </Ring>
                    <div className="flex-1">
                      <p className="font-display text-2xl leading-tight">
                        {inCooldown ? "Journée validée 🌿" : phaseTitle(routineDay?.phase, day)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Stat label="Score" value={score != null ? Math.round(score).toString() : "—"} />
                        <Stat label="Série" value={`${completedCount} j`} />
                      </div>
                    </div>
                  </div>
                </motion.section>

                {inCooldown ? (
                  <CooldownSection
                    unlockMs={unlockMs}
                    windowMs={windowMs}
                    routineTime={routineTime}
                    now={now}
                    day={day}
                    routineDay={routineDay}
                  />
                ) : (
                  <>
                    {/* Routine du jour */}
                    {routineDay && (
                      <motion.section
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={1}
                        className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="eyebrow">{routineDay.phase || "Routine"}</p>
                          {routineDay.duration && (
                            <span className="rounded-full bg-sand px-3 py-1 text-[0.7rem] font-medium text-cocoa-600">
                              ⏱ {routineDay.duration}
                            </span>
                          )}
                        </div>
                        <h3 className="display-2 mt-3 text-2xl text-ink">{routineDay.title}</h3>
                        <p className="mt-1.5 text-[0.92rem] text-cocoa-600">{routineDay.focus}</p>
                        {routineDay.why && (
                          <p className="mt-4 rounded-2xl bg-sand/50 px-4 py-3 text-[0.9rem] leading-relaxed text-cocoa-700">
                            {routineDay.why}
                          </p>
                        )}
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
                        {routineDay.tip && (
                          <p className="mt-5 flex items-start gap-2 rounded-2xl border border-clay-200 bg-paper/70 px-4 py-3 text-[0.9rem] leading-relaxed text-cocoa-800">
                            <span className="shrink-0">💡</span>
                            <span>
                              <span className="font-medium">Astuce du coach : </span>
                              {routineDay.tip}
                            </span>
                          </p>
                        )}
                        <button
                          onClick={() => setTab("products")}
                          className="mt-5 flex w-full items-center justify-between rounded-2xl bg-cocoa-700 px-4 py-3 text-left text-sm font-medium text-cream transition hover:opacity-90"
                        >
                          <span>🧴 Les produits conseillés pour cette routine</span>
                          <span aria-hidden>→</span>
                        </button>
                      </motion.section>
                    )}

                    {/* Ta transformation (avant → après) */}
                    <motion.section
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      custom={2}
                      className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60 backdrop-blur-sm"
                    >
                      {(() => {
                        const now = Math.round(score ?? 55);
                        const potential = Math.max(
                          now + 3,
                          Math.round(props.program?.potential ?? Math.min(96, now + 22)),
                        );
                        return (
                          <>
                            <p className="eyebrow">Ton potentiel cheveux</p>
                            <h3 className="display-2 mt-2 text-xl text-ink">
                              De {now}/100 à {potential}/100 en 30 jours
                            </h3>
                            <div className="mt-5 grid grid-cols-2 gap-3">
                              <div className="rounded-2xl bg-sand/60 p-4 text-center">
                                <p className="font-display text-4xl text-ink">
                                  {now}
                                  <span className="text-lg text-cocoa-500">/100</span>
                                </p>
                                <p className="mt-1 text-[0.8rem] text-cocoa-600">Ton score aujourd&apos;hui</p>
                              </div>
                              <div className="rounded-2xl bg-cocoa-700 p-4 text-center text-cream">
                                <p className="font-display text-4xl">
                                  {potential}
                                  <span className="text-lg text-cream/70">/100</span>
                                </p>
                                <p className="mt-1 text-[0.8rem] text-cream/80">Ton potentiel avec Capilatyx</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
                                <div
                                  className="h-full rounded-full bg-cocoa-700 transition-all"
                                  style={{ width: `${Math.round((now / potential) * 100)}%` }}
                                />
                              </div>
                              <p className="mt-2 text-[0.75rem] text-cocoa-500">
                                Calculé par l&apos;IA d&apos;après ton diagnostic — et il monte à chaque jour validé. 📈
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </motion.section>

                    {/* Photos avant / après (optionnel) */}
                    <motion.section
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      custom={2}
                      className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60 backdrop-blur-sm"
                    >
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="eyebrow">Suivi photo · obligatoire</p>
                          <h3 className="display-2 mt-2 text-xl text-ink">Ta photo du jour</h3>
                        </div>
                        <span className="rounded-full bg-sand px-3 py-1 text-[0.66rem] font-medium text-cocoa-600">
                          avant → après
                        </span>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3.5">
                        <PhotoSlot
                          label="Avant"
                          hint="Avant ta routine"
                          url={beforeUrl}
                          busy={busy}
                          onPick={(f) => uploadPhoto("before", f)}
                        />
                        <PhotoSlot
                          label="Après"
                          hint="Après ta routine"
                          url={afterUrl}
                          busy={busy}
                          onPick={(f) => uploadPhoto("after", f)}
                        />
                      </div>
                      <p className="mt-3 text-center text-[0.72rem] text-cocoa-400">
                        Tes photos restent privées — visibles seulement par toi.
                      </p>
                    </motion.section>

                    {/* Validation */}
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
                          Ajoute ta photo du jour pour valider. 📸
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

          {/* ───── ÉVOLUTION ───── */}
          {tab === "evolution" && (
            <div className="space-y-5">
              <section className="rounded-5xl bg-ink p-6 text-center text-cream shadow-soft">
                <p className="text-xs uppercase tracking-[0.22em] text-clay-300">Ton score capillaire</p>
                <p className="mt-2 font-display text-6xl leading-none">{score != null ? Math.round(score) : "—"}</p>
                <p className="mt-1 text-xs text-clay-300">sur 100</p>
                <Sparkline entries={props.entries} />
              </section>

              {/* Rapport de score multi-axes (radar) */}
              <HairRadar
                initialScores={props.diagnosis?.scores ?? null}
                hasDiagnosis={Boolean(props.diagnosis)}
              />

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

          {/* ───── CALVITIE (Norwood + tête 3D) ───── */}
          {tab === "scalp" && (
            <ScalpTracker
              currentStage={props.diagnosis?.norwoodStage}
              hasDiagnosis={Boolean(props.diagnosis)}
            />
          )}

          {/* ───── PRODUITS (reco Mistral + analyse d'ingrédients) ───── */}
          {tab === "products" && (
            <ProductsTab hasDiagnosis={Boolean(props.diagnosis)} />
          )}

          {/* ───── COUPES ───── */}
          {tab === "cuts" && (
            <div className="space-y-6">
              {/* Recommandées pour toi (issues du scan) */}
              {props.program?.cuts?.cuts?.length ? (
                <section>
                  <h2 className="display-2 text-xl text-ink">Recommandées pour toi</h2>
                  <p className="mt-1 text-sm text-cocoa-600">D'après ton diagnostic.</p>
                  <div className="mt-3 space-y-2">
                    {props.program.cuts.cuts.slice(0, 5).map((c) => (
                      <div key={c.id} className="rounded-2xl bg-paper/80 p-4 shadow-card ring-1 ring-clay-200/60">
                        <h3 className="font-display text-base text-ink">{c.name}</h3>
                        {c.vibe && (
                          <p className="mt-0.5 text-xs uppercase tracking-wide text-cocoa-500">{c.vibe}</p>
                        )}
                        <p className="mt-1.5 text-[0.88rem] text-cocoa-700">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Le grand catalogue */}
              <section>
                <h2 className="display-2 text-xl text-ink">Le catalogue</h2>
                <p className="mt-1 text-sm text-cocoa-600">
                  {props.catalog?.length ?? 0} coupes à explorer — trouve ton prochain style.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(props.catalog ?? []).map((c, i) => (
                    <CatalogCard key={c.id} cut={c} i={i} />
                  ))}
                </div>
              </section>
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
                  : "Cycle Capilatyx — 10,90 € / mois, sans engagement."}
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
              <RoutineTimeSetting value={routineTime} onSave={saveSchedule} busy={busy} />
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

function RoutineTimeSetting({
  value,
  onSave,
  busy,
}: {
  value: string;
  onSave: (time: string) => void;
  busy: boolean;
}) {
  const [time, setTime] = useState(value);
  useEffect(() => setTime(value), [value]);
  const dirty = time !== value;

  return (
    <section className="rounded-4xl bg-paper/80 p-6 shadow-card ring-1 ring-clay-200/60">
      <p className="text-xs uppercase tracking-[0.2em] text-cocoa-500">Heure de ma routine</p>
      <p className="mt-1.5 text-sm text-cocoa-600">
        Ta séance du jour se débloque à cette heure. Change-la quand tu veux.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-clay-200 bg-paper px-3 py-2 font-display text-lg tabular-nums text-ink outline-none focus:border-cocoa-700"
        />
        <button
          onClick={() => onSave(time)}
          disabled={!dirty || busy}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition enabled:hover:opacity-90 disabled:opacity-40"
        >
          Enregistrer
        </button>
      </div>
    </section>
  );
}

function CooldownSection({
  unlockMs,
  windowMs,
  routineTime,
  now,
  day,
  routineDay,
}: {
  unlockMs: number;
  windowMs: number;
  routineTime: string;
  now: number;
  day: number;
  routineDay?: RoutineDay;
}) {
  const rem = Math.max(0, unlockMs - now);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const h = Math.floor(rem / 3_600_000);
  const m = Math.floor(rem / 60_000) % 60;
  const s = Math.floor(rem / 1000) % 60;
  const C = 2 * Math.PI * 70;
  const frac = windowMs > 0 ? rem / windowMs : 0;
  const dashoffset = C * (1 - Math.max(0, Math.min(1, frac)));

  return (
    <>
      {/* Compte à rebours */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
        className="relative overflow-hidden rounded-5xl bg-gradient-to-b from-ink to-[#241f1c] p-8 text-center text-cream shadow-soft"
      >
        <LivingStrands className="pointer-events-none absolute -right-12 -top-14 h-60 w-60 text-clay-400/15" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-clay-400/10 blur-3xl" />

        <p className="relative text-[0.68rem] uppercase tracking-[0.28em] text-clay-300">Séance verrouillée</p>
        <p className="relative mt-2 font-display text-lg">Bravo, journée validée ✨</p>

        <div className="relative mx-auto mt-7 h-56 w-56">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#cd-grad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={dashoffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
            <defs>
              <linearGradient id="cd-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#eccfa6" />
                <stop offset="100%" stopColor="#c2855a" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[2.6rem] leading-none tabular-nums tracking-tight">
              {pad(h)}:{pad(m)}:{pad(s)}
            </span>
            <span className="mt-2 text-[0.6rem] uppercase tracking-[0.24em] text-clay-300">
              avant déblocage
            </span>
          </div>
        </div>

        <div className="relative mx-auto mt-7 flex max-w-xs items-center justify-center gap-5 text-clay-300">
          {[
            ["Heures", pad(h)],
            ["Min", pad(m)],
            ["Sec", pad(s)],
          ].map(([label, val], i) => (
            <div key={label} className="flex items-center gap-5">
              {i > 0 && <span className="font-display text-2xl text-cream/25">:</span>}
              <div className="text-center">
                <div className="font-display text-2xl tabular-nums text-cream">{val}</div>
                <div className="mt-0.5 text-[0.55rem] uppercase tracking-[0.18em]">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="relative mt-6 text-xs text-clay-300/90">
          Ta prochaine séance se débloque à {routineTimeLabel(routineTime)}, ton heure de routine.
        </p>
      </motion.section>

      {/* À préparer pour demain */}
      {routineDay && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="rounded-4xl bg-sand/50 p-6 ring-1 ring-clay-200/60"
        >
          <p className="eyebrow">À préparer pour demain</p>
          <h3 className="display-2 mt-3 text-xl text-ink">
            Jour {day} · {routineDay.title}
          </h3>
          <p className="mt-1.5 text-[0.92rem] text-cocoa-600">{routineDay.focus}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-cocoa-500">
            Ce qu'il te faudra
          </p>
          <ul className="mt-2.5 space-y-2">
            {routineDay.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.9rem] text-cocoa-800">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-400" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}
    </>
  );
}

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
  hint,
  url,
  busy,
  done,
  onPick,
}: {
  label: string;
  hint: string;
  url: string | null;
  busy: boolean;
  done?: boolean;
  onPick: (f: File) => void;
}) {
  const filled = Boolean(url);
  return (
    <label
      className={`group relative block aspect-[3/4] overflow-hidden rounded-3xl transition-all duration-300 ${
        filled
          ? "ring-2 ring-clay-400/70 shadow-card"
          : "ring-1 ring-clay-200/70 hover:ring-clay-400/70 hover:-translate-y-0.5 hover:shadow-card"
      } ${done ? "cursor-default" : "cursor-pointer"}`}
    >
      {filled ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url!} alt={label} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />
          {!done && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-cream/95 px-3 py-1 text-[0.62rem] font-semibold text-ink opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
              Changer
            </span>
          )}
          <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-clay-500 text-sm text-cream shadow-sm transition group-hover:opacity-0">
            ✓
          </span>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-sand/70 to-cream px-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-cream text-xl shadow-sm ring-1 ring-clay-200 transition group-hover:scale-105 group-hover:ring-clay-400">
            📷
          </span>
          <span className="text-[0.82rem] font-medium text-cocoa-700">{hint}</span>
          <span className="text-[0.66rem] text-cocoa-400">Appuie pour ajouter</span>
        </div>
      )}

      <span className="absolute bottom-2.5 left-2.5 rounded-full bg-ink/75 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-wide text-cream backdrop-blur-sm">
        {label}
      </span>

      {busy && (
        <div className="absolute inset-0 grid place-items-center bg-ink/30 backdrop-blur-[1px]">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />
        </div>
      )}

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

function CatalogCard({ cut, i }: { cut: CatalogCut; i: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={i % 8}
      className="overflow-hidden rounded-3xl bg-paper/80 shadow-card ring-1 ring-clay-200/60"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {cut.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cut.image_url} alt={cut.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand to-clay-300/70">
            <span className="text-3xl opacity-50">✂️</span>
          </div>
        )}
        {cut.vibe && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[0.62rem] font-medium text-cream backdrop-blur-sm">
            {cut.vibe}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-display text-[0.98rem] leading-tight text-ink">{cut.name}</h3>
        {cut.description && (
          <p className="mt-1 line-clamp-2 text-[0.78rem] leading-snug text-cocoa-600">
            {cut.description}
          </p>
        )}
        {cut.maintenance && (
          <p className="mt-2 text-[0.7rem] text-cocoa-500">🗓 {cut.maintenance}</p>
        )}
      </div>
    </motion.div>
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
