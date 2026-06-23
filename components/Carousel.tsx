"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  { src: "/results/result-1.jpg", alt: "Avant / après — résultat capillaire 1" },
  { src: "/results/result-2.jpg", alt: "Avant / après — résultat capillaire 2" },
  { src: "/results/result-3.jpg", alt: "Avant / après — résultat capillaire 3" },
  { src: "/results/result-4.jpg", alt: "Avant / après — résultat capillaire 4" },
];

const DURATION = 3000;

export function Carousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);

  const go = useCallback((i: number) => {
    setIdx(((i % slides.length) + slides.length) % slides.length);
  }, []);

  // relance la barre de progression à chaque slide
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = "0%";
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        bar.style.transition = `width ${DURATION}ms linear`;
        bar.style.width = paused ? "0%" : "100%";
      }),
    );
    return () => cancelAnimationFrame(id);
  }, [idx, paused]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), DURATION);
    return () => clearInterval(t);
  }, [paused]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="relative z-10 mx-auto w-full max-w-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Vos résultats avant après"
    >
      <div className="relative">
        {/* cartes inclinées en fond pour la profondeur */}
        <div className="absolute -bottom-[18px] -right-4 left-5 top-[22px] -rotate-[2.5deg] rounded-[28px] bg-gradient-to-br from-latte to-clay-200 opacity-75" />
        <div className="absolute -bottom-2 -left-3 right-2.5 top-3 rotate-2 rounded-[28px] bg-gradient-to-br from-clay-200 to-sand opacity-55" />

        <div className="relative aspect-video overflow-hidden rounded-[24px] border-[6px] border-paper shadow-[0_30px_70px_-34px_rgba(67,50,31,0.55)]">
          {slides.map((s, i) => (
            <img
              key={s.src}
              src={s.src}
              alt={s.alt}
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === idx
                  ? "scale-[1.07] opacity-100 [transition:opacity_700ms_ease,transform_3400ms_ease-out]"
                  : "opacity-0"
              }`}
            />
          ))}
          <span className="absolute right-3.5 top-3.5 z-10 rounded-full bg-ink/55 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-cream backdrop-blur-sm">
            {pad(idx + 1)} / {pad(slides.length)}
          </span>
        </div>
      </div>

      <div className="mt-[22px] flex items-center gap-4 px-1">
        <div className="flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Voir le résultat ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === idx ? "w-6 bg-cocoa-700" : "w-2 bg-clay-300"
              }`}
            />
          ))}
        </div>
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-clay-200">
          <span ref={barRef} className="block h-full w-0 rounded-full bg-cocoa-700" />
        </div>
      </div>

      <div className="mt-[18px] flex items-center gap-3 pl-1">
        <span className="h-px w-6 shrink-0 bg-clay-400" />
        <b className="font-display text-[22px] font-normal italic text-ink">
          Des résultats. Pas des promesses.
        </b>
      </div>
    </div>
  );
}
