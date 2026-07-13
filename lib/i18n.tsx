"use client";

import { useCallback, useEffect, useState } from "react";

// ──────────────────────────────────────────────────────────────────────────
//  i18n minimaliste : FR (défaut) / EN.
//  - la préférence vit dans le cookie `cpx_lang` (1 an) ;
//  - `/?lang=en` la fixe (liens affiliés anglophones) ;
//  - sans cookie, on suit la langue du navigateur ;
//  - le hook écoute l'événement `cpx-lang` → toute la page bascule sans
//    rechargement quand on utilise le sélecteur.
//  Le premier rendu est toujours FR (cohérent avec le SSR), puis bascule
//  côté client si besoin — évite les erreurs d'hydratation.
// ──────────────────────────────────────────────────────────────────────────

export type Lang = "fr" | "en";

const COOKIE = "cpx_lang";
const EVENT = "cpx-lang";

export function readLang(): Lang {
  if (typeof document === "undefined") return "fr";
  const m = document.cookie.match(/(?:^|;\s*)cpx_lang=(fr|en)/);
  if (m) return m[1] as Lang;
  return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function writeLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: lang }));
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    setLangState(readLang());
    const onChange = (e: Event) =>
      setLangState((e as CustomEvent<Lang>).detail ?? readLang());
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const setLang = useCallback((l: Lang) => writeLang(l), []);
  return [lang, setLang];
}

/** Sélecteur FR / EN compact (pastille). `dark` pour les fonds sombres. */
export function LangSwitch({ dark }: { dark?: boolean }) {
  const [lang, setLang] = useLang();
  const base = "rounded-full px-2.5 py-1 text-xs font-semibold transition";
  const on = dark ? "bg-cream text-ink" : "bg-ink text-cream";
  const off = dark
    ? "text-cream/60 hover:text-cream"
    : "text-cocoa-600 hover:text-ink";
  return (
    <div
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${
        dark ? "bg-cream/10" : "bg-sand/70"
      }`}
      aria-label="Langue / Language"
    >
      {(["fr", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`${base} ${lang === l ? on : off}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
