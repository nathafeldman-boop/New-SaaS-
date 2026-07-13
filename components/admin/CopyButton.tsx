"use client";

import { useState } from "react";

/** Bouton « copier » (emails des inscrits, lien d'affiliation, etc.). */
export function CopyButton({
  text,
  label = "Copier les emails",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard indisponible */
        }
      }}
      className={
        className ??
        "rounded-xl bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:opacity-90"
      }
    >
      {done ? "Copié ✓" : label}
    </button>
  );
}
