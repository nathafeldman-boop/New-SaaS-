"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { fileToDataUrl, resizeDataUrl } from "@/lib/image";
import {
  FaceLine,
  IconArrow,
  IconCalendar,
  IconCamera,
  IconCheck,
  IconDrop,
  IconHairBack,
  IconScissors,
  IconSparkle,
} from "@/components/Illustrations";
import { LivingStrands } from "@/components/LivingStrands";
import { OpenInBrowserNotice } from "@/components/OpenInBrowserNotice";
import { isInAppBrowser } from "@/lib/device";
import {
  DEFAULT_ROUTINE_TIME,
  currentTzOffsetMin,
  normalizeRoutineTime,
} from "@/lib/routine-timer";
import type { StepProps } from "./types";
import type { CutSuggestion } from "@/lib/funnel-types";
import { createClient } from "@/lib/supabase/client";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── petits éléments partagés ─────────────────────────────────── */

function DemoBadge({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-clay-300 bg-sand/70 px-2.5 py-1 text-[11px] font-medium text-cocoa-700">
      <IconSparkle className="h-3 w-3" />
      Exemple — branche ta clé Mistral pour un résultat réel
    </span>
  );
}

function StepTitle({
  kicker,
  title,
  sub,
}: {
  kicker?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-xl">
      {kicker && <span className="eyebrow">{kicker}</span>}
      <h2 className="display-2 mt-4 text-balance text-3xl text-ink sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-cocoa-700">{sub}</p>}
    </div>
  );
}

function Loader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-clay-400/70" />
        <span className="absolute inset-3 grid place-items-center rounded-full bg-sand text-cocoa-700">
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <IconSparkle className="h-7 w-7" />
          </motion.span>
        </span>
      </div>
      <p className="font-display text-xl text-ink">{label}</p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-clay-200">
        <motion.span
          className="block h-full w-1/3 rounded-full bg-cocoa-700"
          animate={{ x: ["-120%", "320%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

/* ── 1. Intro ─────────────────────────────────────────────────── */
export function Intro({ next }: StepProps) {
  const items = [
    { icon: IconSparkle, t: "Une analyse de tes cheveux", d: "Type, état, points forts et axes d'amélioration." },
    { icon: IconScissors, t: "Des coupes faites pour toi", d: "Une sélection à essayer, ou la confirmation de garder la tienne." },
    { icon: IconCalendar, t: "Ta routine de 30 jours", d: "Un plan jour après jour pour des cheveux sains." },
  ];
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <StepTitle
          kicker="Le scan capillaire"
          title="2 minutes pour comprendre tes cheveux."
          sub="Prends-toi en photo, laisse l'analyse faire le reste, et repars avec une routine sur-mesure."
        />
        <ul className="mt-8 space-y-4">
          {items.map(({ icon: Icon, t, d }, i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1, ease }}
              className="flex items-start gap-4"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand text-cocoa-700">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-medium text-ink">{t}</span>
                <span className="text-sm text-cocoa-700">{d}</span>
              </span>
            </motion.li>
          ))}
        </ul>
        <button onClick={next} className="btn-primary group mt-10">
          Lancer le scan
          <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <p className="mt-4 text-sm text-cocoa-600">
          Sans engagement — tu ne paies que pour générer ta routine.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease }}
        className="relative mx-auto w-full max-w-sm"
      >
        <LivingStrands className="pointer-events-none absolute -right-10 -top-8 h-72 w-72 text-clay-400/40" />
        <div className="relative overflow-hidden rounded-[2.5rem] border border-clay-200 bg-grad-warm p-8 shadow-soft">
          <img
            src="/brand/logo.png"
            alt="Capilatyx"
            className="mx-auto w-52"
          />
          <motion.div
            className="absolute inset-x-8 h-[2px] bg-cocoa-700/60"
            initial={{ top: "18%" }}
            animate={{ top: ["18%", "78%", "18%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ── 2. Guide photo ───────────────────────────────────────────── */
export function Guide({ next, back }: StepProps) {
  const tips = [
    "Place-toi face à une lumière naturelle",
    "Dégage le front et les oreilles",
    "Cadre la tête et le haut des épaules",
    "Cheveux secs, dans leur état naturel",
  ];
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <StepTitle
          kicker="Avant de commencer"
          title="Une bonne photo = une bonne analyse."
          sub="Suis ces quelques repères pour un résultat fidèle."
        />
        <ul className="mt-8 space-y-3">
          {tips.map((t, i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className="flex items-center gap-3 rounded-2xl border border-clay-200 bg-paper/70 px-4 py-3"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-clay-300 text-ink">
                <IconCheck className="h-3.5 w-3.5" />
              </span>
              <span className="text-cocoa-800">{t}</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-10 flex gap-3">
          <button onClick={back} className="btn-ghost">Retour</button>
          <button onClick={next} className="btn-primary group">
            Prendre ma photo
            <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-sm grid-cols-2 gap-4">
        <ExampleCard ok />
        <ExampleCard />
      </div>
    </div>
  );
}

function ExampleCard({ ok }: { ok?: boolean }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-clay-200 bg-paper">
      <div className={`relative aspect-[3/4] ${ok ? "bg-grad-warm" : "bg-sand"}`}>
        <div className={`absolute inset-0 grid place-items-center ${ok ? "" : "blur-[2px] opacity-70"}`}>
          <FaceLine className="h-32 w-auto text-cocoa-800" />
        </div>
        <span
          className={`absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full text-cream ${
            ok ? "bg-cocoa-700" : "bg-ink/70"
          }`}
        >
          {ok ? (
            <IconCheck className="h-4 w-4" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </div>
      <p className="px-3 py-2.5 text-center text-xs font-medium text-cocoa-700">
        {ok ? "Net & de face" : "Flou / mal cadré"}
      </p>
    </div>
  );
}

/* ── 3. Capture ───────────────────────────────────────────────── */
export function Capture({ update, next, back }: StepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inApp, setInApp] = useState(false);

  useEffect(() => setInApp(isInAppBrowser()), []);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  };
  useEffect(() => () => stopCam(), []);

  // Relie le flux à la balise <video> UNE FOIS qu'elle est montée dans le DOM
  // (elle n'existe pas tant que camOn est faux → sinon aperçu vide).
  useEffect(() => {
    if (camOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [camOn]);

  async function startCam() {
    setCamError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCamOn(true);
    } catch {
      setCamError(true);
    }
  }

  function snap() {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setPreview(c.toDataURL("image/jpeg", 0.9));
    stopCam();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(await fileToDataUrl(f));
  }

  async function confirm() {
    if (!preview) return;
    setBusy(true);
    const resized = await resizeDataUrl(preview, 768, 0.85);
    update({ photo: resized });
    next();
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <StepTitle title="Ta photo" />
      <OpenInBrowserNotice className="mx-auto mt-6 max-w-sm" />
      <div className="mt-8">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2rem] border border-clay-200 bg-sand">
          {preview ? (
            <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
          ) : camOn ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
              <div className="pointer-events-none absolute inset-6 rounded-3xl border-2 border-dashed border-cream/70" />
            </>
          ) : (
            <div className="grid h-full place-items-center p-8">
              <FaceLine className="h-40 w-auto text-cocoa-800/70" />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {preview ? (
            <>
              <button
                onClick={() => setPreview(null)}
                className="btn-ghost"
              >
                Reprendre
              </button>
              <button onClick={confirm} disabled={busy} className="btn-primary group">
                {busy ? "Préparation…" : "Analyser"}
                {!busy && <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </>
          ) : camOn ? (
            <button onClick={snap} className="btn-primary">
              <IconCamera className="h-4 w-4" /> Capturer
            </button>
          ) : (
            <>
              <button onClick={startCam} className="btn-primary">
                <IconCamera className="h-4 w-4" /> Prendre une photo
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn-ghost">
                Importer une photo
              </button>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>

        {camError && (
          <p className="mt-4 text-sm text-cocoa-600">
            {inApp
              ? "L'appareil photo est bloqué dans ce navigateur intégré. Ouvre la page dans ton navigateur (⋯ en haut à droite → « Ouvrir dans le navigateur ») ou importe une photo."
              : "Caméra indisponible — utilise « Importer une photo »."}
          </p>
        )}
        <button onClick={back} className="mt-6 text-sm text-cocoa-600 underline-offset-4 hover:underline">
          Revenir au guide
        </button>
      </div>
    </div>
  );
}

/* ── 4. Analyse ───────────────────────────────────────────────── */
const SCAN_STEPS = [
  "Lecture de la fibre capillaire",
  "Détection du type de cheveux",
  "Analyse du cuir chevelu",
  "Évaluation de l'hydratation",
  "Repérage des pointes abîmées",
  "Préparation de tes recommandations",
];

const DETECT_POINTS = [
  { l: "32%", t: "16%" },
  { l: "64%", t: "13%" },
  { l: "48%", t: "26%" },
  { l: "26%", t: "34%" },
  { l: "70%", t: "32%" },
];

export function Analyzing({ data, update, next }: StepProps) {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [pct, setPct] = useState(6);
  const done = useRef(false);

  async function run() {
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.photo, quiz: data.quizAnswers }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Échec de l'analyse");
      // On greffe les réponses du quiz à l'analyse : coupes, routine et scores
      // les reçoivent ainsi automatiquement (personnalisation).
      update({
        analysis: data.quizAnswers
          ? { ...json.data, quiz: data.quizAnswers }
          : json.data,
        analysisDemo: json.demo,
      });
      done.current = true;
      setPct(100);
      setTimeout(next, 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // messages qui défilent
  useEffect(() => {
    const t = setInterval(
      () => setStepIdx((i) => (i + 1) % SCAN_STEPS.length),
      1600,
    );
    return () => clearInterval(t);
  }, []);

  // progression simulée jusqu'à 92 % puis 100 % à la fin
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => (done.current ? 100 : p < 92 ? p + Math.random() * 7 : p));
    }, 480);
    return () => clearInterval(t);
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-2xl text-ink">L'analyse a échoué</p>
        <p className="mt-2 text-sm text-cocoa-600">{error}</p>
        <button
          onClick={() => {
            started.current = true;
            run();
          }}
          className="btn-primary mt-6"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-[2rem] border border-clay-200 bg-sand shadow-soft">
        {data.photo && (
          <img src={data.photo} alt="" className="h-full w-full object-cover" />
        )}

        {/* voile + grille de scan */}
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa-800/15 via-transparent to-cocoa-800/30" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* coins réticule */}
        <span className="absolute left-3 top-3 h-6 w-6 rounded-tl-md border-l-2 border-t-2 border-cream/80" />
        <span className="absolute right-3 top-3 h-6 w-6 rounded-tr-md border-r-2 border-t-2 border-cream/80" />
        <span className="absolute bottom-3 left-3 h-6 w-6 rounded-bl-md border-b-2 border-l-2 border-cream/80" />
        <span className="absolute bottom-3 right-3 h-6 w-6 rounded-br-md border-b-2 border-r-2 border-cream/80" />

        {/* bande de scan lumineuse */}
        <motion.div
          className="absolute inset-x-0 h-1/3"
          initial={{ top: "-33%" }}
          animate={{ top: ["-33%", "100%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(201,162,126,0.28), transparent)",
          }}
        >
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-cream shadow-[0_0_14px_3px_rgba(201,162,126,0.75)]" />
        </motion.div>

        {/* points de détection */}
        {DETECT_POINTS.map((p, i) => (
          <motion.span
            key={i}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/90"
            style={{ left: p.l, top: p.t }}
            animate={{ scale: [1, 1.9, 1], opacity: [0.9, 0.15, 0.9] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35 }}
          />
        ))}

        {/* chip "Analyse IA" */}
        <div className="absolute left-3 top-3 flex translate-y-8 items-center gap-1.5 rounded-full bg-ink/55 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-clay-300"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          Analyse IA
        </div>

        {/* pourcentage */}
        <div className="absolute bottom-3 right-3 rounded-full bg-ink/55 px-2.5 py-1 text-[11px] font-semibold text-cream backdrop-blur">
          {Math.min(100, Math.round(pct))}%
        </div>
      </div>

      {/* message défilant + barre */}
      <div className="mt-8 h-7">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="font-display text-xl text-ink sm:text-2xl"
          >
            {SCAN_STEPS[stepIdx]}…
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-5 h-1.5 w-60 max-w-full overflow-hidden rounded-full bg-clay-200">
        <motion.span
          className="block h-full rounded-full bg-cocoa-700"
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ ease: "easeOut", duration: 0.5 }}
        />
      </div>
    </div>
  );
}

/* ── 5. Révélation (avant / après) ────────────────────────────── */
export function Reveal({ data, next }: StepProps) {
  const a = data.analysis;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <Image
          src="/onboarding/diagnostic.jpg"
          alt="Avant / Après — la transformation Capilatyx"
          width={968}
          height={1307}
          sizes="(max-width: 480px) 92vw, 420px"
          className="mx-auto h-auto w-full max-w-sm rounded-[2rem] shadow-soft ring-1 ring-clay-200/60"
          priority
        />
        <p className="mt-3 text-center text-xs text-cocoa-600">
          La transformation Capilatyx, en 30 jours.
        </p>
      </div>
      <div>
        <div className="flex items-center gap-3">
          <span className="eyebrow">Ton diagnostic</span>
          <DemoBadge show={data.analysisDemo} />
        </div>
        <h2 className="display-2 mt-4 text-balance text-3xl text-ink sm:text-4xl">
          Voici ce que disent tes cheveux.
        </h2>
        {a && (
          <>
            <p className="mt-4 leading-relaxed text-cocoa-700">{a.summary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoCard label="Type" value={a.hairType} />
              <InfoCard label="État" value={a.condition} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TagList title="Points forts" items={a.strengths} tone="good" />
              <TagList title="À travailler" items={a.concerns} tone="warn" />
            </div>
            <div className="mt-5 rounded-2xl border border-clay-200 bg-sand/50 p-4 text-sm text-cocoa-800">
              <b className="font-medium">Coupe actuelle : </b>
              {a.keepCurrentCut
                ? "elle te va déjà très bien. "
                : "elle peut être optimisée. "}
              {a.keepReason}
            </div>
          </>
        )}
        <button onClick={next} className="btn-primary group mt-8">
          Découvrir mes coupes & ma routine
          <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-clay-200 bg-paper/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-clay-600">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

function TagList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-clay-600">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items?.map((it) => (
          <li key={it} className="flex items-center gap-2 text-sm text-cocoa-800">
            <span
              className={`h-1.5 w-1.5 rounded-full ${tone === "good" ? "bg-cocoa-700" : "bg-clay-500"}`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Conservé au cas où on veuille revenir au curseur avant/après sur la photo réelle.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BeforeAfter({
  before,
  after,
  loading,
}: {
  before?: string;
  after?: string | null;
  loading?: boolean;
}) {
  const [pos, setPos] = useState(55);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  if (!before) return null;
  const real = Boolean(after); // vrai rendu généré dispo
  const afterSrc = after || before;

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-[4/5] w-full max-w-sm touch-none select-none overflow-hidden rounded-[2rem] border border-clay-200 bg-sand"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) update(e.clientX);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* APRÈS — vrai rendu généré, sinon simulation éclat */}
      <img
        src={afterSrc}
        alt="Après"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={real ? undefined : { filter: "saturate(1.4) contrast(1.12) brightness(1.06)" }}
      />
      {!real && (
        // sheen chaud pour donner un effet "cheveux sains & brillants"
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 68% 22%, rgba(255,241,214,0.30), transparent 55%)",
          }}
        />
      )}
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-cocoa-700 px-2.5 py-1 text-xs font-medium text-cream">
        Après
      </span>

      {/* AVANT — photo d'origine (légèrement ternie) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={before}
          alt="Avant"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "saturate(0.6) brightness(0.9) contrast(0.96) grayscale(0.14)" }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-cream">
          Avant
        </span>
      </div>

      {/* overlay de génération en cours (sur la moitié après) */}
      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/35 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3 text-cream">
            <motion.span
              className="h-8 w-8 rounded-full border-2 border-cream/40 border-t-cream"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-xs font-medium">Génération du rendu…</span>
          </div>
          <motion.div
            className="absolute inset-x-0 h-[2px] bg-cream/80 shadow-[0_0_14px_3px_rgba(201,162,126,0.7)]"
            initial={{ top: "0%" }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* poignée */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-cream/90 shadow-[0_0_8px_rgba(0,0,0,0.25)]"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-clay-300 bg-cream text-cocoa-700 shadow-card">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path d="M9 7 4 12l5 5M15 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ── 6. Paywall ───────────────────────────────────────────────── */
export function Paywall({ data, next, back }: StepProps) {
  const a = data.analysis;
  const concern = a?.concerns?.[0];

  // Accroche personnalisée à partir du diagnostic.
  const headline = concern
    ? "Tes cheveux ont un vrai potentiel — il faut juste la bonne méthode."
    : "Ta transformation commence aujourd'hui.";
  const sub = a
    ? `D'après ton diagnostic${a.hairType ? ` (${a.hairType.toLowerCase()})` : ""}, on a construit un programme précis pour ${
        concern ? `corriger « ${concern.toLowerCase()} »` : "révéler tes cheveux"
      } jour après jour.`
    : "Ton analyse est prête. Débloque ta sélection de coupes et ton programme de 30 jours.";

  const perks = [
    { t: "15 coupes générées sur TON visage", d: "essaie-les avant d'aller chez le coiffeur" },
    { t: "Ton programme jour par jour, 30 jours", d: "une routine précise, pas un PDF générique" },
    { t: "Suivi photo avant / après quotidien", d: "vois tes cheveux s'améliorer en temps réel" },
    { t: "Ton score capillaire qui progresse", d: "une preuve concrète, semaine après semaine" },
  ];

  const { amount, period, original, discount } = siteConfig.price;
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <div className="mx-auto max-w-md">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
        className="relative overflow-hidden rounded-5xl p-7 shadow-glow ring-1 ring-clay-400/25 sm:p-9"
        style={{ background: "linear-gradient(158deg,#2C211A 0%,#43321F 62%,#3a2c22 100%)" }}
      >
        {/* auras animées (profondeur / futuriste) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-clay-400/25 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 16, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cocoa-600/40 blur-3xl"
          animate={{ x: [0, -16, 0], y: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <LivingStrands className="pointer-events-none absolute right-0 top-6 h-56 w-56 text-clay-400/15" />

        <div className="relative">
          {/* badge diagnostic terminé (pulse) */}
          <motion.div variants={item} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-clay-400/30 bg-cream/5 px-3.5 py-1.5 text-xs font-medium text-clay-200 backdrop-blur">
              <motion.span
                className="grid h-4 w-4 place-items-center rounded-full bg-clay-400 text-ink"
                animate={{ boxShadow: ["0 0 0 0 rgba(201,162,126,.55)", "0 0 0 7px rgba(201,162,126,0)"] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                <IconCheck className="h-2.5 w-2.5" />
              </motion.span>
              Diagnostic terminé
            </span>
          </motion.div>

          <motion.h2 variants={item} className="display-2 mt-5 text-center text-[1.75rem] leading-tight text-cream">
            {headline}
          </motion.h2>
          <motion.p variants={item} className="mx-auto mt-3 max-w-sm text-center text-[0.95rem] leading-relaxed text-clay-200/85">
            {sub}
          </motion.p>

          {/* ancrage de prix */}
          <motion.div variants={item} className="mt-7 flex flex-col items-center">
            <div className="flex items-end gap-2">
              {original && <span className="pb-2 text-lg text-clay-300/70 line-through">{original}</span>}
              <span className="font-display text-6xl font-light tracking-tight text-cream">{amount}</span>
              <span className="pb-2 text-clay-300">{period}</span>
            </div>
            {discount && (
              <motion.span
                className="mt-3 rounded-full bg-gradient-to-r from-clay-400 to-clay-500 px-3.5 py-1 text-xs font-semibold text-ink"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                Offre de lancement · {discount}
              </motion.span>
            )}
          </motion.div>

          {/* value stack */}
          <ul className="mt-8 space-y-3.5 text-left">
            {perks.map((p) => (
              <motion.li key={p.t} variants={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay-400/20 text-clay-300 ring-1 ring-clay-400/40">
                  <IconCheck className="h-3 w-3" />
                </span>
                <span>
                  <span className="block text-[0.95rem] font-medium text-cream">{p.t}</span>
                  <span className="block text-[0.82rem] text-clay-200/65">{p.d}</span>
                </span>
              </motion.li>
            ))}
          </ul>

          {/* CTA — glow pulsé + shimmer */}
          <motion.button
            variants={item}
            onClick={next}
            whileTap={{ scale: 0.98 }}
            className="group relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-cream px-6 py-4 text-[0.98rem] font-semibold text-ink"
            animate={{ boxShadow: ["0 10px 30px -12px rgba(201,162,126,.5)", "0 14px 44px -8px rgba(201,162,126,.85)", "0 10px 30px -12px rgba(201,162,126,.5)"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/50 blur-md"
              animate={{ x: ["-40%", "420%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.1 }}
            />
            <span className="relative">Débloquer mon programme</span>
            <IconArrow className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </motion.button>

          {/* réassurance */}
          <motion.div variants={item} className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-clay-200/65">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                <rect x="5" y="10" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Paiement sécurisé Stripe
            </span>
            <span>· Sans engagement</span>
            <span>· Annulable en 1 clic</span>
          </motion.div>

          <button onClick={back} className="mt-4 block w-full text-center text-sm text-clay-300/70 transition hover:text-clay-200 hover:underline">
            Revenir au diagnostic
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── 7. Paiement ──────────────────────────────────────────────── */
// Choix du prestataire : "stripe" (défaut) | "whop" | "demo".
const PROVIDER = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "stripe") as
  | "stripe"
  | "whop"
  | "demo";
const WHOP_URL =
  process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL ??
  "https://whop.com/smartapp-8757/cycle-capilytix-30-jours";

export function Checkout(props: StepProps) {
  if (PROVIDER === "whop") return <WhopCheckout url={WHOP_URL} {...props} />;
  if (PROVIDER === "demo") return <DemoCheckout {...props} />;
  return <StripeCheckout {...props} />;
}

function StripeCheckout({ data, update, next, back }: StepProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noConfig, setNoConfig] = useState(false);

  // Compte : on doit relier le paiement à un utilisateur.
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Code d'accès (valide l'abonnement sans Stripe).
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setAuthed(Boolean(user)))
      .catch(() => setAuthed(false));
  }, []);

  async function startCheckout() {
    // on sauvegarde l'état du funnel (Stripe redirige hors de l'app)
    try {
      sessionStorage.setItem("capilytix_funnel", JSON.stringify(data));
    } catch {}
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const j = await res.json();
    if (j.ok && j.url) {
      window.location.href = j.url;
      return;
    }
    if (j.reason === "no-config") setNoConfig(true);
    else if (j.reason === "no-auth") setError("Connecte-toi pour continuer.");
    else setError(j.error || "Impossible de lancer le paiement.");
  }

  // Utilisateur déjà connecté → directement au paiement.
  async function pay() {
    setBusy(true);
    setError(null);
    try {
      await startCheckout();
    } catch {
      setError("Impossible de lancer le paiement.");
    }
    setBusy(false);
  }

  // Crée le compte (ou se connecte si déjà inscrit) puis lance le paiement.
  async function registerAndPay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const reg = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then((r) => r.json());

      if (!reg.ok && !reg.exists) {
        setError(reg.error || "Inscription impossible.");
        setBusy(false);
        return;
      }

      const { error: signInError } = await createClient().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(
          reg.exists
            ? "Cet email a déjà un compte — mauvais mot de passe ?"
            : signInError.message,
        );
        setBusy(false);
        return;
      }

      await startCheckout();
    } catch {
      setError("Une erreur est survenue.");
    }
    setBusy(false);
  }

  // Crée le compte si besoin, puis valide le code d'accès (active l'abonnement).
  async function redeemCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (authed === false) {
        if (!email || !password) {
          setError("Renseigne ton email et ton mot de passe au-dessus.");
          setBusy(false);
          return;
        }
        const reg = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }).then((r) => r.json());
        if (!reg.ok && !reg.exists) {
          setError(reg.error || "Inscription impossible.");
          setBusy(false);
          return;
        }
        const { error: signInError } = await createClient().auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(
            reg.exists
              ? "Cet email a déjà un compte — mauvais mot de passe ?"
              : signInError.message,
          );
          setBusy(false);
          return;
        }
      }

      const r = await fetch("/api/access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }).then((res) => res.json());

      if (r.ok) {
        update({ paid: true });
        next();
        return;
      }
      setError(r.error || "Code invalide.");
    } catch {
      setError("Validation impossible.");
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-md">
      <StepTitle title="Paiement sécurisé" />
      <div className="mt-6 rounded-[2rem] border border-clay-200 bg-paper p-6">
        <div className="flex items-center justify-between border-b border-clay-200 pb-4">
          <span className="text-cocoa-700">Cycle Capilatyx</span>
          <span className="font-display text-xl text-ink">
            {siteConfig.price.amount}
            <span className="text-sm text-cocoa-600"> {siteConfig.price.period}</span>
          </span>
        </div>

        {noConfig ? (
          <div className="mt-5 text-center">
            <p className="text-sm text-cocoa-700">
              Le paiement Stripe n'est pas encore configuré sur le serveur
              (clé manquante).
            </p>
            <button
              onClick={() => {
                update({ paid: true });
                next();
              }}
              className="btn-ghost mt-4 w-full"
            >
              Continuer en démo (test)
            </button>
          </div>
        ) : authed === false ? (
          <form onSubmit={registerAndPay} className="mt-5 space-y-3">
            <p className="text-sm text-cocoa-700">
              Crée ton compte pour accéder à ton programme et le retrouver à
              chaque connexion.
            </p>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Ton email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-clay-200 bg-white px-4 py-3 text-ink outline-none focus:border-cocoa-400"
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Mot de passe (6 caractères min.)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-clay-200 bg-white px-4 py-3 text-ink outline-none focus:border-cocoa-400"
            />
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? "Un instant…" : `Créer mon compte et payer — ${siteConfig.price.amount}`}
            </button>
            {error && <p className="text-center text-sm text-clay-600">{error}</p>}
          </form>
        ) : (
          <>
            <button onClick={pay} disabled={busy || authed === null} className="btn-primary mt-5 w-full disabled:opacity-60">
              {busy ? "Redirection…" : `Payer par carte — ${siteConfig.price.amount}`}
            </button>
            {error && <p className="mt-3 text-center text-sm text-clay-600">{error}</p>}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-cocoa-600">
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                  <rect x="5" y="10" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                Paiement sécurisé via Stripe
              </span>
              <span>· Annulable à tout moment</span>
            </div>
          </>
        )}

        <div className="mt-4 border-t border-clay-200 pt-4">
          {!showCode ? (
            <button
              type="button"
              onClick={() => {
                setShowCode(true);
                setError(null);
              }}
              className="block w-full text-center text-sm text-cocoa-600 hover:underline"
            >
              J'ai un code d'accès
            </button>
          ) : (
            <form onSubmit={redeemCode} className="space-y-3">
              {authed === false && (
                <p className="text-xs text-cocoa-600">
                  Renseigne ton email et ton mot de passe ci-dessus, puis valide
                  ton code.
                </p>
              )}
              <input
                type="text"
                required
                placeholder="Code d'accès"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-clay-200 bg-white px-4 py-3 text-center uppercase tracking-wider text-ink outline-none focus:border-cocoa-400"
              />
              <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
                {busy ? "Validation…" : "Valider mon code"}
              </button>
            </form>
          )}
        </div>
      </div>
      <button onClick={back} className="mt-4 block w-full text-center text-sm text-cocoa-600 hover:underline">
        Retour
      </button>
    </div>
  );
}

function WhopCheckout({ url, update, next, back }: StepProps & { url: string }) {
  const [license, setLicense] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/whop/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license }),
      });
      const j = await res.json();
      if (j.ok && j.valid) {
        update({ paid: true });
        next();
        return;
      }
      if (j.reason === "no-key")
        setError("Vérification Whop non configurée côté serveur (WHOP_API_KEY).");
      else if (j.ok && !j.valid)
        setError("Clé invalide ou abonnement inactif.");
      else setError(j.error || "Vérification impossible.");
    } catch {
      setError("Vérification impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <StepTitle title="Débloque ta routine" />
      <p className="mt-3 text-cocoa-700">
        Le paiement se fait en sécurité via Whop. Une fois payé, colle ta clé de
        licence pour activer ton accès.
      </p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-6 w-full"
      >
        Payer via Whop — {siteConfig.price.amount}
      </a>

      <form
        onSubmit={verify}
        className="mt-6 space-y-4 rounded-[2rem] border border-clay-200 bg-paper p-6"
      >
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">
            Déjà payé ? Colle ta clé de licence Whop
          </span>
          <input
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="mt-1.5 w-full rounded-xl border border-clay-200 bg-cream/60 px-4 py-3 text-ink outline-none transition focus:border-clay-400 focus:bg-paper"
          />
        </label>
        {error && <p className="text-sm text-clay-600">{error}</p>}
        <button type="submit" disabled={busy || !license} className="btn-primary w-full disabled:opacity-50">
          {busy ? "Vérification…" : "Valider mon accès"}
        </button>
        <button
          type="button"
          onClick={back}
          className="block w-full text-center text-sm text-cocoa-600 hover:underline"
        >
          Retour
        </button>
      </form>
    </div>
  );
}

function DemoCheckout({ update, next, back }: StepProps) {
  const [busy, setBusy] = useState(false);
  function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      update({ paid: true });
      next();
    }, 1100);
  }
  return (
    <div className="mx-auto max-w-md">
      <StepTitle title="Paiement" />
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-clay-300 bg-sand/60 px-3 py-1.5 text-xs font-medium text-cocoa-700">
        <IconSparkle className="h-3 w-3" /> Démo — aucun prélèvement réel (Whop à brancher)
      </div>
      <form onSubmit={pay} className="mt-6 space-y-4 rounded-[2rem] border border-clay-200 bg-paper p-6">
        <Field label="Nom sur la carte" placeholder="Alex Martin" />
        <Field label="Numéro de carte" placeholder="4242 4242 4242 4242" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Expiration" placeholder="08 / 28" />
          <Field label="CVC" placeholder="123" />
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-sand/60 px-4 py-3 text-sm">
          <span className="text-cocoa-700">Total</span>
          <span className="font-display text-xl text-ink">{siteConfig.price.amount}</span>
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Traitement…" : `Payer ${siteConfig.price.amount}`}
        </button>
        <button type="button" onClick={back} className="block w-full text-center text-sm text-cocoa-600 hover:underline">
          Retour
        </button>
      </form>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">{label}</span>
      <input
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-clay-200 bg-cream/60 px-4 py-3 text-ink outline-none transition focus:border-clay-400 focus:bg-paper"
      />
    </label>
  );
}

/* ── 8. Sélection de coupes ───────────────────────────────────── */
export function Cuts({ data, update, next }: StepProps) {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | "keep" | null>(null);

  async function run() {
    setError(null);
    try {
      const res = await fetch("/api/cuts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: data.analysis }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Échec");
      update({ cuts: json.data, cutsDemo: json.demo });
      if (json.data?.keepCurrent) setSelected("keep");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error)
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-xl text-ink">Génération impossible</p>
        <p className="mt-2 text-sm text-cocoa-600">{error}</p>
        <button onClick={() => { started.current = true; run(); }} className="btn-primary mt-6">
          Réessayer
        </button>
      </div>
    );

  if (!data.cuts) return <Loader label="Sélection de tes coupes…" />;

  const { cuts, keepCurrent, reason, currentCutName } = data.cuts;

  function choose(c: CutSuggestion) {
    setSelected(c.id);
    update({ choice: { type: "cut", cut: c } });
  }
  function keep() {
    setSelected("keep");
    update({ choice: { type: "keep" } });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="eyebrow">Tes coupes</span>
        <DemoBadge show={data.cutsDemo} />
      </div>
      <h2 className="display-2 mt-4 text-balance text-3xl text-ink sm:text-4xl">
        Choisis la coupe qui te parle.
      </h2>

      {/* recommandation : garder la coupe actuelle */}
      <button
        onClick={keep}
        className={`mt-6 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
          selected === "keep" ? "border-cocoa-700 bg-clay-200/50" : "border-clay-200 bg-paper/70 hover:border-clay-400"
        }`}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sand text-cocoa-700">
          <IconCheck className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block font-medium text-ink">
            Garder ma coupe actuelle{currentCutName ? ` — ${currentCutName}` : ""}
          </span>
          <span className="text-sm text-cocoa-700">
            {keepCurrent ? "Recommandé : " : ""}{reason}
          </span>
        </span>
        {keepCurrent && (
          <span className="rounded-full bg-cocoa-700 px-2.5 py-1 text-xs text-cream">Conseillé</span>
        )}
      </button>

      <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-clay-600">
        Ou essaie une nouvelle coupe ({cuts.length})
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cuts.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4) }}
            onClick={() => choose(c)}
            className={`flex flex-col overflow-hidden rounded-2xl border text-left transition ${
              selected === c.id ? "border-cocoa-700 bg-clay-200/40" : "border-clay-200 bg-paper/70 hover:border-clay-400"
            }`}
          >
            <div className="relative aspect-[4/5] w-full bg-sand">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-cocoa-700">
                  <IconScissors className="h-7 w-7" />
                </span>
              )}
              <span className="absolute right-2 top-2 rounded-full bg-paper/85 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-cocoa-700 backdrop-blur-sm">
                {c.vibe}
              </span>
              {selected === c.id && (
                <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-cocoa-700 text-cream">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <div className="flex flex-col p-4">
              <span className="font-display text-lg text-ink">{c.name}</span>
              <span className="mt-1 text-sm text-cocoa-700">{c.description}</span>
              <span className="mt-2 text-xs text-clay-600">Entretien : {c.maintenance}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-center">
        <button
          onClick={next}
          disabled={!selected}
          className="btn-primary group shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selected ? "Générer ma routine" : "Sélectionne une option"}
          {selected && <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </button>
      </div>
    </div>
  );
}

/* ── 9. Génération routine ────────────────────────────────────── */
export function Generating({ data, update, next }: StepProps) {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    const cut =
      data.choice?.type === "cut" ? data.choice.cut.name : "Coupe actuelle conservée";
    try {
      const res = await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: data.analysis, cut }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Échec");
      update({ routine: json.data, routineDemo: json.demo });
      setTimeout(next, 400);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md text-center">
      {error ? (
        <>
          <p className="font-display text-xl text-ink">Génération impossible</p>
          <p className="mt-2 text-sm text-cocoa-600">{error}</p>
          <button onClick={() => { started.current = true; run(); }} className="btn-primary mt-6">
            Réessayer
          </button>
        </>
      ) : (
        <Loader label="Construction de ta routine 30 jours…" />
      )}
    </div>
  );
}

/* ── 10. Routine finale ───────────────────────────────────────── */
/* ── Horaire de routine (question du quiz) ─────────────────────── */
const TIME_PRESETS: { label: string; emoji: string; time: string; hint: string }[] = [
  { label: "Matin", emoji: "🌅", time: "08:00", hint: "Au réveil" },
  { label: "Midi", emoji: "☀️", time: "12:30", hint: "Pause déjeuner" },
  { label: "Soir", emoji: "🌙", time: "20:00", hint: "Avant de dormir" },
];

export function Schedule({ data, update, next, back }: StepProps) {
  const [time, setTime] = useState(data.routineTime || DEFAULT_ROUTINE_TIME);

  function confirm() {
    const clean = normalizeRoutineTime(time) || DEFAULT_ROUTINE_TIME;
    update({ routineTime: clean, routineTzOffset: currentTzOffsetMin() });
    next();
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <StepTitle
        kicker="Ton rythme"
        title="À quelle heure veux-tu faire ta routine ?"
        sub="Chaque jour, ta séance se débloquera pile à cette heure-là. Tu pourras la changer quand tu veux."
      />

      <div className="mt-8 grid grid-cols-3 gap-3">
        {TIME_PRESETS.map((p) => {
          const active = time === p.time;
          return (
            <button
              key={p.time}
              onClick={() => setTime(p.time)}
              className={`rounded-3xl border p-4 text-center transition ${
                active
                  ? "border-cocoa-700 bg-cocoa-700 text-cream shadow-soft"
                  : "border-clay-200 bg-paper/70 text-cocoa-800 hover:border-clay-400"
              }`}
            >
              <span className="block text-2xl">{p.emoji}</span>
              <span className="mt-2 block font-medium">{p.label}</span>
              <span className={`mt-0.5 block text-xs ${active ? "text-cream/80" : "text-clay-600"}`}>
                {p.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-clay-200 bg-sand/60 px-5 py-3">
        <span className="text-sm text-cocoa-700">Heure précise</span>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-clay-200 bg-paper px-3 py-1.5 font-display text-lg tabular-nums text-ink outline-none focus:border-cocoa-700"
        />
      </div>

      <div className="mt-9 flex items-center justify-center gap-3">
        <button onClick={back} className="btn-ghost">
          Retour
        </button>
        <button onClick={confirm} className="btn-primary group">
          Voir ma routine
          <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export function RoutineView({ data }: StepProps) {
  const r = data.routine;
  const [open, setOpen] = useState<number | null>(1);

  // Sauvegarde le programme côté compte (idempotent) dès l'arrivée sur la routine.
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current || !data.routine) return;
    savedRef.current = true;
    fetch("/api/program/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis: data.analysis,
        routine: data.routine,
        cuts: data.cuts,
        choice: data.choice,
        routineTime: data.routineTime,
        routineTzOffset: data.routineTzOffset,
        quizAnswers: data.quizAnswers,
      }),
    }).catch(() => {});
  }, [data.routine, data.analysis, data.cuts, data.choice, data.routineTime, data.routineTzOffset]);

  if (!r) return null;
  return (
    <div className="mx-auto max-w-3xl">
      <a
        href="/"
        aria-label="Retour à l'accueil"
        className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-clay-200 bg-paper/70 text-cocoa-700 transition hover:border-clay-400 hover:text-ink"
      >
        <IconHairBack className="h-5 w-5" />
      </a>
      <div className="flex flex-wrap items-center gap-3">
        <span className="eyebrow">Ta routine</span>
        <DemoBadge show={data.routineDemo} />
      </div>
      <h2 className="display-2 mt-4 text-balance text-3xl text-ink sm:text-4xl">{r.title}</h2>
      <p className="mt-4 leading-relaxed text-cocoa-700">{r.overview}</p>

      {data.choice && (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-clay-200 bg-sand/60 px-4 py-2 text-sm text-cocoa-800">
          <IconScissors className="h-4 w-4 text-cocoa-700" />
          {data.choice.type === "keep"
            ? "Coupe actuelle conservée"
            : `Coupe choisie : ${data.choice.cut.name}`}
        </div>
      )}

      {r.weeklyTips?.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {r.weeklyTips.map((t) => (
            <div key={t} className="flex items-start gap-3 rounded-2xl border border-clay-200 bg-paper/70 p-4">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay-300 text-ink">
                <IconDrop className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-cocoa-800">{t}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 divide-y divide-clay-200 overflow-hidden rounded-[2rem] border border-clay-200 bg-paper/70">
        {r.days.map((d) => {
          const isOpen = open === d.day;
          return (
            <div key={d.day}>
              <button
                onClick={() => setOpen(isOpen ? null : d.day)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-sand/40"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink font-display text-sm text-cream">
                  {d.day}
                </span>
                <span className="flex-1">
                  <span className="block font-medium text-ink">{d.title}</span>
                  <span className="text-xs uppercase tracking-wider text-clay-600">{d.phase}</span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 text-cocoa-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pl-[4.75rem]">
                    <p className="text-sm text-cocoa-700">{d.focus}</p>
                    <ul className="mt-3 space-y-2">
                      {d.steps.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-sm text-cocoa-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <a href="/espace" className="btn-primary group w-full justify-center sm:w-auto">
          Accéder à mon espace
          <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
        <p className="mt-3 text-sm text-cocoa-600">
          Ta routine et ton suivi t'attendent dans ton espace, jour après jour.
        </p>
      </div>
    </div>
  );
}
