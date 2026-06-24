"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SVGProps } from "react";

const OFFSETS = [0, 18, 36, 54, 72, 90];
const ease = [0.22, 1, 0.36, 1] as const;

const strand = (o: number) =>
  `M${40 + o} 20 C ${120 + o} 120, ${-20 + o} 220, ${100 + o} 320 S ${60 + o} 460, ${140 + o} 470`;

/**
 * Mèches « vivantes » : elles se dessinent au chargement puis ondulent
 * doucement, avec une lueur qui glisse le long du cheveu — l'évolution
 * vers des cheveux sains. Décoratif, derrière le contenu.
 */
export function LivingStrands(props: SVGProps<SVGSVGElement>) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 480 480" fill="none" aria-hidden {...props}>
      <motion.g
        animate={reduce ? undefined : { rotate: [0, 1.1, 0, -1.1, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        {/* mèches de base — se dessinent à l'arrivée */}
        {OFFSETS.map((o, i) => (
          <motion.path
            key={i}
            d={strand(o)}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity={0.5 - i * 0.05}
            initial={reduce ? undefined : { pathLength: 0 }}
            animate={reduce ? undefined : { pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.15 * i, ease }}
          />
        ))}

        {/* lueurs qui glissent le long de deux mèches (cheveu sain qui capte la lumière) */}
        {!reduce &&
          [1, 4].map((o, i) => (
            <motion.path
              key={`glint-${o}`}
              d={strand(o * 18)}
              stroke="#E7D3BB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="16 1100"
              initial={{ strokeDashoffset: 1100 }}
              animate={{ strokeDashoffset: [1100, 0] }}
              transition={{
                duration: 3.4,
                delay: 1.4 + i * 1.7,
                repeat: Infinity,
                repeatDelay: 2.6,
                ease: "easeInOut",
              }}
            />
          ))}
      </motion.g>
    </svg>
  );
}
