"use client";

/**
 * Mini-tracking maison (visites, clics, étapes du funnel).
 * Envoie les événements à /api/track, qui les enregistre dans la table events.
 * Aucune donnée personnelle : juste un identifiant de session anonyme.
 */

const SID_KEY = "cpx_sid";

function sessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid =
        (crypto.randomUUID?.() as string | undefined) ??
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export function track(name: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      name,
      sessionId: sessionId(),
      path: window.location.pathname,
      props: props ?? null,
    });
    // sendBeacon survit aux changements de page ; fetch keepalive en repli.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // tracking best-effort : on n'interrompt jamais l'UX
  }
}
