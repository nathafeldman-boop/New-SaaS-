"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { StepProps } from "./types";
import { IconArrow, IconCheck } from "@/components/Illustrations";

const ease = [0.22, 1, 0.36, 1] as const;

/* ──────────────────────────────────────────────────────────────────────────
 *  Écran "story" plein écran (illustration générée).
 *  Sert à casser le rythme des questions et à montrer la valeur.
 *  Animations légères : fade-in, flottement doux, glow discret.
 * ────────────────────────────────────────────────────────────────────────── */
export function StoryScreen({ src, next }: StepProps & { src: string }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease }}
        className="relative w-full"
      >
        {/* glow doux derrière l'illustration */}
        <div className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-clay-300/30 blur-2xl" />
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <Image
            src={src}
            alt=""
            width={768}
            height={1376}
            sizes="(max-width: 480px) 92vw, 384px"
            className="h-auto w-full rounded-[2rem] shadow-soft ring-1 ring-clay-200/60"
            priority
          />
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease }}
        whileTap={{ scale: 0.97 }}
        onClick={next}
        className="btn-primary group mt-6 w-full justify-center"
      >
        Continuer
        <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </motion.button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Question du quiz (une par écran, sélection unique, auto-avance).
 * ────────────────────────────────────────────────────────────────────────── */
export type QuizQuestion = {
  id: string;
  kicker: string;
  question: string;
  options: { value: string; label: string; emoji?: string }[];
};

export function QuizScreen({
  question,
  data,
  update,
  next,
  back,
}: StepProps & { question: QuizQuestion }) {
  const selected = data.quizAnswers?.[question.id];

  function pick(value: string) {
    update({ quizAnswers: { ...(data.quizAnswers ?? {}), [question.id]: value } });
    // petit délai pour laisser voir la sélection avant la transition
    window.setTimeout(next, 240);
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="eyebrow">{question.kicker}</p>
      <h2 className="display-2 mt-3 text-balance text-2xl text-ink sm:text-3xl">
        {question.question}
      </h2>

      <div className="mt-7 space-y-3">
        {question.options.map((o, i) => {
          const isOn = selected === o.value;
          return (
            <motion.button
              key={o.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ease }}
              whileTap={{ scale: 0.98 }}
              onClick={() => pick(o.value)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                isOn
                  ? "border-cocoa-700 bg-clay-200/50"
                  : "border-clay-200 bg-paper/70 hover:border-clay-400"
              }`}
            >
              {o.emoji && <span className="text-xl">{o.emoji}</span>}
              <span className="flex-1 font-medium text-ink">{o.label}</span>
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition ${
                  isOn ? "bg-cocoa-700 text-cream" : "bg-sand text-transparent"
                }`}
              >
                <IconCheck className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          );
        })}
      </div>

      <button onClick={back} className="btn-ghost mt-7">
        Retour
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Les questions d'onboarding (rapides, 1 tap, fortement utiles à l'IA).
 * ────────────────────────────────────────────────────────────────────────── */
export const ONBOARDING_QUESTIONS: QuizQuestion[] = [
  {
    id: "goal",
    kicker: "Ton objectif",
    question: "Qu'est-ce que tu veux changer en premier ?",
    options: [
      { value: "sante", label: "Des cheveux plus sains", emoji: "🌿" },
      { value: "coupe", label: "Trouver ma coupe idéale", emoji: "✂️" },
      { value: "densite", label: "Plus de densité & de volume", emoji: "💪" },
      { value: "chute", label: "Ralentir la chute", emoji: "🛡️" },
    ],
  },
  {
    id: "type",
    kicker: "Type de cheveux",
    question: "Tes cheveux sont plutôt…",
    options: [
      { value: "raides", label: "Raides", emoji: "📏" },
      { value: "ondules", label: "Ondulés", emoji: "🌊" },
      { value: "boucles", label: "Bouclés", emoji: "🌀" },
      { value: "crepus", label: "Crépus", emoji: "☁️" },
    ],
  },
  {
    id: "frizz",
    kicker: "Frisottis",
    question: "Niveau de frisottis ?",
    options: [
      { value: "aucun", label: "Aucun" },
      { value: "legers", label: "Légers" },
      { value: "moderes", label: "Modérés" },
      { value: "importants", label: "Importants" },
    ],
  },
  {
    id: "oiliness",
    kicker: "Cuir chevelu",
    question: "Tes racines, c'est plutôt…",
    options: [
      { value: "gras", label: "Vite grasses", emoji: "💧" },
      { value: "normal", label: "Normales" },
      { value: "sec", label: "Plutôt sèches", emoji: "🍂" },
      { value: "mixte", label: "Racines grasses, pointes sèches" },
    ],
  },
  {
    id: "washFreq",
    kicker: "Lavage",
    question: "Tu te laves les cheveux…",
    options: [
      { value: "daily", label: "Tous les jours" },
      { value: "2-3j", label: "Tous les 2-3 jours" },
      { value: "weekly", label: "1 à 2 fois par semaine" },
      { value: "rare", label: "Moins souvent" },
    ],
  },
  {
    id: "products",
    kicker: "Tes produits",
    question: "Aujourd'hui, tu utilises…",
    options: [
      { value: "none", label: "Rien de particulier" },
      { value: "shampoo", label: "Juste un shampoing" },
      { value: "shampoo-cond", label: "Shampoing + après-shampoing" },
      { value: "routine", label: "Une vraie routine" },
    ],
  },
  {
    id: "time",
    kicker: "Ton temps",
    question: "Combien de temps par jour pour tes cheveux ?",
    options: [
      { value: "lt2", label: "Moins de 2 min", emoji: "⚡" },
      { value: "2-5", label: "2 à 5 min" },
      { value: "5-10", label: "5 à 10 min" },
      { value: "gt10", label: "Plus de 10 min" },
    ],
  },
  {
    id: "confidence",
    kicker: "Ressenti",
    question: "Tu te sens comment avec ta coiffure ?",
    options: [
      { value: "low", label: "Pas confiant du tout", emoji: "😕" },
      { value: "mid", label: "Bof, ça dépend des jours" },
      { value: "ok", label: "Plutôt bien", emoji: "🙂" },
      { value: "high", label: "Très à l'aise", emoji: "😎" },
    ],
  },
  {
    id: "problem",
    kicker: "Ton souci n°1",
    question: "Ton principal problème en ce moment ?",
    options: [
      { value: "dryness", label: "Sécheresse" },
      { value: "breakage", label: "Casse & fourches" },
      { value: "loss", label: "Chute / perte de densité" },
      { value: "volume", label: "Manque de volume" },
      { value: "dandruff", label: "Pellicules" },
    ],
  },
  {
    id: "priority",
    kicker: "Cap sur 30 jours",
    question: "Ta priorité pour les 30 prochains jours ?",
    options: [
      { value: "repair", label: "Réparer", emoji: "🩹" },
      { value: "hydrate", label: "Hydrater", emoji: "💦" },
      { value: "grow", label: "Faire pousser", emoji: "🌱" },
      { value: "style", label: "Mieux me coiffer", emoji: "✨" },
    ],
  },
];
