"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/**
 * Tracking global, monté une fois dans le layout :
 *  - une visite (pageview) à chaque changement de page,
 *  - un clic CTA dès qu'on clique sur un lien vers /scan (peu importe lequel).
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    track("pageview");
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href === "/scan" || href.startsWith("/scan?")) {
        track("cta_scan_click", { from: window.location.pathname });
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
