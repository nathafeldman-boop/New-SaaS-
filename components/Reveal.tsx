"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * « La mèche qui se pose » — chaque bloc glisse vers le haut et se
 * stabilise comme une mèche de cheveu qui retombe : léger balancement
 * (rotate), détente (scale) et mise au net (blur → 0). L'effet évoque
 * le cheveu tout en restant propre et discret.
 */
const flow: Variants = {
  hidden: { opacity: 0, y: 34, rotate: -1.4, scale: 0.98, filter: "blur(7px)" },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease },
  },
};

/** Repli pour « prefers-reduced-motion » : un simple fondu, sans mouvement. */
const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease } },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span" | "li";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={reduce ? fade : flow}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-90px" }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Conteneur qui décale l'apparition de ses enfants (effet cascade / mèches). */
export function RevealGroup({
  children,
  className,
  stagger = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-90px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Variant à passer aux enfants directs d'un RevealGroup. */
export const revealItem: Variants = flow;
