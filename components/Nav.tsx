"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/lib/site";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        className={`mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5 ${
          scrolled
            ? "border border-clay-200/80 bg-cream/80 shadow-soft backdrop-blur-md sm:mx-4 lg:mx-auto"
            : "border border-transparent bg-transparent"
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/brand/mark.png" alt={siteConfig.name} className="h-9 w-9 object-contain" />
          <span className="font-display text-xl font-medium tracking-tight text-ink">
            {siteConfig.name}
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-cocoa-700 transition-colors hover:bg-sand/70 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="/scan" className="btn-primary hidden px-5 py-2.5 sm:inline-flex">
            {siteConfig.cta.primary}
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full border border-clay-300 text-ink md:hidden"
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-ink transition-transform ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span className={`block h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span
                className={`block h-0.5 w-5 bg-ink transition-transform ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mx-4 mt-2 rounded-3xl border border-clay-200 bg-cream/95 p-3 shadow-soft backdrop-blur md:hidden"
          >
            {siteConfig.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-base text-cocoa-700 hover:bg-sand/70 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/scan"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              {siteConfig.cta.primary}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
