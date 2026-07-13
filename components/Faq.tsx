"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { faqs, faqsEn } from "@/lib/faq";
import { useLang } from "@/lib/i18n";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [lang] = useLang();
  const en = lang === "en";
  const items = en ? faqsEn : faqs;
  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Reveal>
            <span className="eyebrow">{en ? "Questions" : "Questions"}</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-2 mt-5 text-balance text-4xl text-ink sm:text-5xl">
              {en
                ? "What people ask us the most."
                : "Ce qu'on te demande le plus souvent."}
            </h2>
          </Reveal>
        </div>

        <Reveal className="divide-y divide-clay-200" delay={0.1}>
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="py-1">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-xl text-ink">{item.q}</span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-clay-300 text-cocoa-700 transition-transform duration-300 ${
                      isOpen ? "rotate-45 bg-ink text-cream" : ""
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 leading-relaxed text-cocoa-700">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
