"use client";

import { useEffect, useState } from "react";
import { detectInAppBrowser } from "@/lib/device";

// Bandeau d'invitation à ouvrir le site dans le vrai navigateur, affiché
// uniquement quand on détecte un navigateur intégré (TikTok, Instagram…),
// où l'appareil photo ne fonctionne pas.
export function OpenInBrowserNotice({ className = "" }: { className?: string }) {
  const [app, setApp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setApp(detectInAppBrowser());
  }, []);

  if (!app) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible — l'utilisateur peut toujours suivre le ⋯ */
    }
  }

  return (
    <div
      className={`rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-left text-sm text-cocoa-800 ${className}`}
    >
      <p className="font-semibold">
        📸 Ouvre la page dans ton navigateur pour la photo
      </p>
      <p className="mt-1 leading-relaxed text-cocoa-700">
        Tu es dans le navigateur intégré de {app}, où l'appareil photo est
        bloqué. Appuie sur <span className="font-semibold">⋯</span> en haut à
        droite, puis « <span className="font-semibold">Ouvrir dans le navigateur</span> »
        (Chrome / Safari). Tu peux aussi simplement importer une photo ci-dessous.
      </p>
      <button
        onClick={copyLink}
        className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream transition hover:opacity-90"
      >
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}
