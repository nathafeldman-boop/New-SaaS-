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
          <a
            href="/login"
            className="hidden rounded-full px-3.5 py-2 text-sm text-cocoa-700 transition-colors hover:bg-sand/70 hover:text-ink sm:inline-flex"
          >
            Se connecter
          </a>
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
            variants={{
              hidden: { opacity: 0, y: -8 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.25, staggerChildren: 0.05, delayChildren: 0.05 },
              },
            }}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="mx-4 mt-2 overflow-hidden rounded-3xl border border-clay-200 bg-cream/95 shadow-soft backdrop-blur md:hidden"
          >
            <ul className="divide-y divide-clay-200/70">
              {siteConfig.nav.map((item) => (
                <motion.li
                  key={item.href}
                  variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between px-5 py-3.5 text-[0.95rem] text-cocoa-700 transition-colors hover:bg-sand/60 hover:text-ink"
                  >
                    <span>{item.label}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-clay-400 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
              className="space-y-2 p-3"
            >
              <a href="/scan" onClick={() => setOpen(false)} className="btn-primary w-full">
                {siteConfig.cta.primary}
              </a>
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full border border-clay-300 py-3 text-center text-sm font-medium text-cocoa-700 transition hover:bg-sand/60"
              >
                Se connecter
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
