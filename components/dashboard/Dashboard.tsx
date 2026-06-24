"use client";

import { useState } from "react";
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

  const todayEntry = props.entries.find((e) => e.day_number === day);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(todayEntry?.beforeUrl ?? null);
  const [afterUrl, setAfterUrl] = useState<string | null>(todayEntry?.afterUrl ?? null);

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
      const r = await fetch("/api/program/complete", { method: "POST" }).then((res) =>
        res.json(),
      );
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
      const r = await fetch("/api/stripe/portal", { method: "POST" }).then((res) =>
        res.json(),
      );
      if (r.ok && r.url) window.location.href = r.url;
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <header className="flex items-center justify-between">
        <a href="/" className="font-display text-2xl text-ink">
          Capilytix
        </a>
        <div className="flex items-center gap-3 text-sm text-cocoa-600">
          {score != null && (
            <span className="rounded-full bg-ink px-3 py-1 font-medium text-clay-200">
              Score {Math.round(score)}
            </span>
          )}
        </div>
      </header>

      {/* onglets */}
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
              tab === t.key
                ? "bg-ink text-cream"
                : "border border-clay-200 bg-paper text-cocoa-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {/* ── AUJOURD'HUI ── */}
        {tab === "today" &&
          (!started ? (
            <EmptyState />
          ) : (
            <section className="space-y-5">
              <div className="rounded-2xl border border-clay-200 bg-paper p-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl text-ink">Jour {day} / 30</span>
                  <span className="text-sm text-cocoa-600">
                    {routineDay?.phase ?? "Programme"}
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-clay-200">
                  <div
                    className="h-full rounded-full bg-ink transition-all"
                    style={{ width: `${(day / 30) * 100}%` }}
                  />
                </div>
              </div>

              {routineDay && (
                <div className="rounded-2xl border border-clay-200 bg-paper p-5">
                  <h3 className="font-display text-lg text-ink">{routineDay.title}</h3>
                  <p className="mt-1 text-sm text-cocoa-600">{routineDay.focus}</p>
                  <ul className="mt-4 space-y-2.5">
                    {routineDay.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-[0.95rem] text-cocoa-800">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-clay-300 text-xs text-ink">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* photos avant / après */}
              <div className="rounded-2xl border border-clay-200 bg-paper p-5">
                <h3 className="font-display text-lg text-ink">Photo du jour</h3>
                <p className="mt-1 text-sm text-cocoa-600">
                  Une photo <strong>avant</strong> ta routine, une <strong>après</strong>.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <PhotoSlot label="Avant" url={beforeUrl} busy={busy} onPick={(f) => uploadPhoto("before", f)} />
                  <PhotoSlot label="Après" url={afterUrl} busy={busy} onPick={(f) => uploadPhoto("after", f)} />
                </div>
              </div>

              {validatedToday ? (
                <div className="rounded-2xl border border-clay-200 bg-paper p-5 text-center text-cocoa-700">
                  ✅ Journée validée. <strong>Reviens demain</strong> pour le Jour {day}.
                </div>
              ) : (
                <button
                  onClick={validateDay}
                  disabled={busy || !beforeUrl}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {busy ? "Un instant…" : "Valider ma journée"}
                </button>
              )}
              {!beforeUrl && !validatedToday && (
                <p className="text-center text-xs text-cocoa-500">
                  Ajoute au moins ta photo « avant » pour valider.
                </p>
              )}
            </section>
          ))}

        {/* ── ÉVOLUTION ── */}
        {tab === "evolution" && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-clay-200 bg-paper p-5 text-center">
              <p className="text-sm text-cocoa-600">Ton score capillaire</p>
              <p className="font-display text-5xl text-ink">{score != null ? Math.round(score) : "—"}</p>
              <p className="text-xs text-cocoa-500">sur 100</p>
            </div>
            {props.entries.filter((e) => e.beforeUrl || e.afterUrl).length === 0 ? (
              <p className="text-center text-sm text-cocoa-500">
                Tes photos avant/après apparaîtront ici, jour après jour.
              </p>
            ) : (
              <div className="space-y-3">
                {props.entries
                  .filter((e) => e.beforeUrl || e.afterUrl)
                  .map((e) => (
                    <div key={e.day_number} className="rounded-2xl border border-clay-200 bg-paper p-4">
                      <div className="mb-2 flex items-center justify-between text-sm text-cocoa-700">
                        <span>Jour {e.day_number}</span>
                        {e.score != null && <span>Score {Math.round(e.score)}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Thumb label="Avant" url={e.beforeUrl} />
                        <Thumb label="Après" url={e.afterUrl} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* ── COUPES ── */}
        {tab === "cuts" && (
          <section className="space-y-3">
            {props.program?.cuts?.cuts?.length ? (
              props.program.cuts.cuts.map((c) => (
                <div key={c.id} className="rounded-2xl border border-clay-200 bg-paper p-4">
                  <h3 className="font-display text-lg text-ink">{c.name}</h3>
                  <p className="mt-1 text-sm text-cocoa-700">{c.description}</p>
                  <p className="mt-2 text-xs text-cocoa-500">{c.vibe}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-cocoa-500">
                Ta sélection de coupes apparaîtra ici.
              </p>
            )}
          </section>
        )}

        {/* ── ABONNEMENT ── */}
        {tab === "sub" && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-clay-200 bg-paper p-5">
              <p className="text-sm text-cocoa-600">Statut</p>
              <p className="font-display text-xl text-ink">
                {props.subscription.status === "active" || props.subscription.status === "trialing"
                  ? "Actif ✅"
                  : props.subscription.status ?? "Inactif"}
              </p>
              <p className="mt-1 text-sm text-cocoa-600">
                {props.subscription.via === "code"
                  ? "Accès via code d'accès."
                  : "Abonnement Cycle Capilytix — 10,90 €/mois."}
              </p>
              {props.subscription.via === "stripe" && (
                <button onClick={openPortal} disabled={busy} className="btn-primary mt-4 w-full disabled:opacity-50">
                  Gérer / annuler mon abonnement
                </button>
              )}
            </div>
          </section>
        )}

        {/* ── PROFIL ── */}
        {tab === "profile" && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-clay-200 bg-paper p-5">
              <p className="text-sm text-cocoa-600">Compte</p>
              <p className="text-ink">{props.email}</p>
            </div>
            {props.diagnosis && (
              <div className="rounded-2xl border border-clay-200 bg-paper p-5">
                <p className="text-sm text-cocoa-600">Ton diagnostic</p>
                <p className="mt-1 text-ink">{props.diagnosis.summary}</p>
                {props.diagnosis.hairType && (
                  <p className="mt-2 text-sm text-cocoa-600">Type : {props.diagnosis.hairType}</p>
                )}
              </div>
            )}
            <form action="/auth/signout" method="post">
              <button className="w-full rounded-xl border border-clay-200 bg-paper py-3 text-cocoa-700">
                Déconnexion
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-clay-200 bg-paper p-6 text-center">
      <p className="text-cocoa-700">Tu n'as pas encore démarré ton programme.</p>
      <a href="/scan" className="btn-primary mt-4 inline-flex">
        Faire mon scan
      </a>
    </div>
  );
}

function PhotoSlot({
  label,
  url,
  busy,
  onPick,
}: {
  label: string;
  url: string | null;
  busy: boolean;
  onPick: (f: File) => void;
}) {
  return (
    <label className="relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border border-dashed border-clay-300 bg-cream">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-center text-sm text-cocoa-500">
          📷<br />
          {label}
        </span>
      )}
      <span className="absolute bottom-1 left-1 rounded bg-ink/70 px-1.5 py-0.5 text-[0.7rem] text-cream">
        {label}
      </span>
      <input
        type="file"
        accept="image/*"
        capture="user"
        disabled={busy}
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
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-clay-200 bg-cream">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-xs text-cocoa-400">{label} —</span>
      )}
      <span className="absolute bottom-1 left-1 rounded bg-ink/70 px-1.5 py-0.5 text-[0.7rem] text-cream">
        {label}
      </span>
    </div>
  );
}
