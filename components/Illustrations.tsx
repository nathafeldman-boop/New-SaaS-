import type { SVGProps } from "react";

/** Marque / logo — une mèche stylisée. */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <path
        d="M9 27c-1.5-6 0-11 3-15S17 4 16 5c-1.6 1.6-2 5 0 8s4 5 1 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 28c2.2-5 1.4-9-.4-12.4S12 9 13 8c1.5 1.4 4.2 2.6 5.4 6s.6 8.6-2.4 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M22 27c2-5.5 2.6-10 .6-13.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Lignes fluides décoratives (cheveux qui ondulent). */
export function StrandFlow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 480 480" fill="none" aria-hidden {...props}>
      {[0, 18, 36, 54, 72, 90].map((o, i) => (
        <path
          key={i}
          d={`M${40 + o} 20 C ${120 + o} 120, ${-20 + o} 220, ${100 + o} 320 S ${
            60 + o
          } 460, ${140 + o} 470`}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity={0.5 - i * 0.05}
        />
      ))}
    </svg>
  );
}

/** Visage line-art pour la maquette d'app. */
export function FaceLine(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 240" fill="none" aria-hidden {...props}>
      {/* chevelure */}
      <path
        d="M50 96c-6-44 24-72 50-72s56 26 50 72c-4 30-2 44 6 64-14-12-18-30-18-30s-2 22-10 30c2-18-2-30-2-30s-10 16-26 16-26-16-26-16-4 12-2 30c-8-8-10-30-10-30s-4 18-18 30c8-20 10-34 6-64Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M50 96c-6-44 24-72 50-72s56 26 50 72"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* visage */}
      <path
        d="M64 92c0 38 14 74 36 74s36-36 36-74"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M82 104c4 3 10 3 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M104 104c4 3 10 3 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 116v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 142c5 4 11 4 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCamera(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2c.5 0 1-.3 1.3-.7l.8-1.2c.3-.4.7-.6 1.2-.6h4c.5 0 .9.2 1.2.6l.8 1.2c.3.4.8.7 1.3.7h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconSparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 3c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M19 13.5c.3 1.8.9 2.4 2.7 2.7-1.8.3-2.4.9-2.7 2.7-.3-1.8-.9-2.4-2.7-2.7 1.8-.3 2.4-.9 2.7-2.7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="13.5" r="1.1" fill="currentColor" />
      <circle cx="12" cy="13.5" r="1.1" fill="currentColor" />
      <circle cx="16" cy="13.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconScissors(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="6" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="17" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 8.4 20 17M8.2 15.6 20 7M11 12l2.4-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Flèche « retour » dont la hampe est une mèche de cheveux ondulée. */
export function IconHairBack(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 7 4 12l5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12c3 0 3.2-3 6-3s2.8 3 5.6 3 2.6-2.4 4.4-2.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDrop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 3.5c3.5 4 6 7 6 10.2A6 6 0 0 1 6 13.7C6 10.5 8.5 7.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.3 14.2a2.7 2.7 0 0 0 2.4 2.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M5 12.5 10 17.5 19 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
