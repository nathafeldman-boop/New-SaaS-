"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any;
  }
}

/** Charge le script Google Identity Services une seule fois. */
let gsiPromise: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    if (typeof document === "undefined") return resolve();
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Impossible de charger Google."));
    document.head.appendChild(s);
  });
  return gsiPromise;
}

/**
 * Bouton « Sign in with Google » natif (Google Identity Services).
 * Récupère un ID token côté Google puis ouvre une session Supabase via
 * signInWithIdToken — la session de l'app reste donc intacte.
 *
 * Nécessite NEXT_PUBLIC_GOOGLE_CLIENT_ID (Client ID OAuth Google Cloud).
 */
export default function GoogleButton({
  next,
  onError,
}: {
  next: string;
  onError?: (msg: string) => void;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef<string>("");
  const [pending, setPending] = useState(false);

  const handleCredential = useCallback(
    async (response: { credential?: string }) => {
      if (!response.credential) return;
      setPending(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
          nonce: nonceRef.current,
        });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } catch (err) {
        setPending(false);
        onError?.(
          err instanceof Error ? err.message : "Connexion Google impossible.",
        );
      }
    },
    [next, router, onError],
  );

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    (async () => {
      // Nonce : on envoie le hash SHA-256 à Google, et le nonce brut à Supabase.
      const raw = btoa(
        String.fromCharCode(...Array.from(crypto.getRandomValues(new Uint8Array(32)))),
      );
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(raw),
      );
      const hashed = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      nonceRef.current = raw;

      try {
        await loadGsi();
      } catch {
        onError?.("Impossible de charger Google. Réessaie plus tard.");
        return;
      }
      if (cancelled || !window.google || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        nonce: hashed,
        use_fedcm_for_prompt: true,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "center",
        width: 320,
        locale: "fr",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [handleCredential, onError]);

  if (!CLIENT_ID) return null;

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className={pending ? "pointer-events-none opacity-60" : ""} />
    </div>
  );
}
