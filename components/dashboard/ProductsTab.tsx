"use client";

// ──────────────────────────────────────────────────────────────────────────
//  Onglet « Produits »
//   1. Recommandations personnalisées (vraies marques via Mistral + Pexels)
//   2. Analyse d'un produit (« Découvre ce qu'il y a dans tes produits »)
//  Tout est branché sur Mistral.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fileToDataUrl, resizeDataUrl } from "@/lib/image";
import type { ProductAnalysis, ProductReco } from "@/lib/funnel-types";

export function ProductsTab({ hasDiagnosis }: { hasDiagnosis: boolean }) {
  if (!hasDiagnosis) {
    return (
      <section className="rounded-4xl border border-dashed border-clay-300 bg-paper/50 p-8 text-center">
        <p className="text-sm text-cocoa-600">
          Fais ton scan pour débloquer tes recommandations produits sur mesure.
        </p>
        <a href="/scan" className="btn-primary mt-4 inline-flex">
          Faire mon scan
        </a>
      </section>
    );
  }
  return (
    <div className="space-y-6">
      <Recommendations />
      <Analyzer />
    </div>
  );
}

/* ── 1. Recommandations ──────────────────────────────────────── */
function Recommendations() {
  const [products, setProducts] = useState<ProductReco[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  async function load(force = false) {
    setLoading(true);
    try {
      const r = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      }).then((res) => res.json());
      if (r.ok && r.data) {
        setProducts(r.data);
        setDemo(Boolean(r.demo));
      } else {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="display-2 text-xl text-ink">Recommandations personnalisées</h2>
          <p className="mt-1 text-sm text-cocoa-600">Vraies marques, choisies pour ton profil.</p>
        </div>
        {products && (
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="rounded-full bg-paper/70 px-3 py-1.5 text-xs text-cocoa-700 ring-1 ring-clay-200 transition hover:bg-paper disabled:opacity-50"
          >
            ↻ Régénérer
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-clay-200/40" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {(products ?? []).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-3xl bg-paper/80 shadow-card ring-1 ring-clay-200/60"
            >
              <div className="flex gap-3 p-3">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-sand">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-2xl opacity-50">🧴</span>
                  )}
                  <span className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink text-[0.6rem] font-bold text-cream">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-sand px-2.5 py-0.5 text-[0.66rem] font-medium text-cocoa-700">
                      {p.category}
                    </span>
                    <MatchBadge pct={p.matchPct} />
                  </div>
                  <p className="mt-1.5 text-[0.7rem] uppercase tracking-wide text-cocoa-500">{p.brand}</p>
                  <h3 className="font-display text-[1rem] leading-tight text-ink">{p.name}</h3>
                  {p.sizeMl ? <p className="text-[0.72rem] text-cocoa-400">{p.sizeMl} ml</p> : null}
                </div>
              </div>
              <button
                onClick={() => setOpen(open === p.id ? null : p.id)}
                className="flex w-full items-center justify-between border-t border-clay-200/60 bg-sand/40 px-4 py-2.5 text-left text-[0.82rem] font-medium text-cocoa-700"
              >
                <span>👍 Pourquoi on le recommande</span>
                <span className={`transition-transform ${open === p.id ? "rotate-180" : ""}`}>⌄</span>
              </button>
              {open === p.id && (
                <ul className="space-y-1.5 px-4 pb-4 pt-3 text-[0.84rem] text-cocoa-700">
                  {p.why.map((w, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-400" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
          {demo && (
            <p className="text-center text-[0.7rem] text-cocoa-400">
              Exemple — connecte Mistral pour des recommandations sur mesure.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/* ── 2. Analyse d'un produit ─────────────────────────────────── */
function Analyzer() {
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProductAnalysis | null>(null);
  const [demo, setDemo] = useState(false);

  async function pickPhoto(file: File) {
    const raw = await fileToDataUrl(file);
    setImage(await resizeDataUrl(raw, 1024));
  }

  async function analyze() {
    if (!name.trim() && !image) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/product-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      }).then((res) => res.json());
      if (r.ok && r.data) {
        setResult(r.data);
        setDemo(Boolean(r.demo));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-4xl bg-ink p-6 text-cream shadow-soft">
      <p className="text-xs uppercase tracking-[0.22em] text-clay-300">Analyse d'ingrédients</p>
      <h2 className="display-2 mt-2 text-xl leading-tight">
        Découvre ce qu'il y a dans tes produits
      </h2>
      <p className="mt-1.5 text-sm text-clay-300">
        Saisis un produit ou photographie l'étiquette — on te dit s'il est fait pour toi.
      </p>

      <div className="mt-4 space-y-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Kérastase Bain Satin…"
          className="w-full rounded-2xl border border-cream/15 bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-clay-300 outline-none focus:border-clay-300"
        />
        <div className="flex gap-2.5">
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-clay-200 transition hover:bg-cream/10">
            📷 {image ? "Photo ajoutée" : "Photo de l'étiquette"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pickPhoto(f);
              }}
            />
          </label>
          <button
            onClick={analyze}
            disabled={busy || (!name.trim() && !image)}
            className="rounded-2xl bg-cream px-5 py-3 text-sm font-semibold text-ink transition hover:bg-clay-100 disabled:opacity-50"
          >
            {busy ? "…" : "Analyser"}
          </button>
        </div>
      </div>

      {result && <AnalysisResult result={result} demo={demo} />}
    </section>
  );
}

function AnalysisResult({ result, demo }: { result: ProductAnalysis; demo: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 rounded-3xl bg-paper/95 p-5 text-cocoa-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] uppercase tracking-wide text-cocoa-500">Compatibilité</p>
          <h3 className="font-display text-lg text-ink">{result.productName}</h3>
        </div>
        <div className="text-right">
          <span className="font-display text-3xl text-ink">{result.matchPct}%</span>
          <p className="text-[0.62rem] uppercase tracking-wide text-cocoa-400">match</p>
        </div>
      </div>

      {result.detected.length > 0 && (
        <>
          <p className="mt-3 text-[0.72rem] text-cocoa-500">On a détecté chez toi :</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {result.detected.map((d) => (
              <span key={d} className="rounded-full bg-sand px-2.5 py-0.5 text-[0.72rem] text-cocoa-700">
                {d}
              </span>
            ))}
          </div>
        </>
      )}

      {result.verdict && (
        <p className="mt-3 text-[0.88rem] leading-relaxed text-cocoa-700">{result.verdict}</p>
      )}

      {result.keyIngredients.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-cocoa-500">
            Ingrédients clés
          </p>
          {result.keyIngredients.map((ing, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] ${
                  ing.good ? "bg-clay-400/30 text-clay-600" : "bg-red-100 text-red-500"
                }`}
              >
                {ing.good ? "✓" : "!"}
              </span>
              <p className="text-[0.84rem]">
                <span className="font-semibold text-ink">{ing.name}</span>
                {ing.role ? <span className="text-cocoa-600"> — {ing.role}</span> : null}
              </p>
            </div>
          ))}
        </div>
      )}

      {(result.pros.length > 0 || result.cons.length > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-[0.82rem]">
          <div>
            {result.pros.map((p, i) => (
              <p key={i} className="flex items-start gap-1.5 text-cocoa-700">
                <span className="text-clay-500">+</span> {p}
              </p>
            ))}
          </div>
          <div>
            {result.cons.map((c, i) => (
              <p key={i} className="flex items-start gap-1.5 text-cocoa-500">
                <span className="text-red-400">−</span> {c}
              </p>
            ))}
          </div>
        </div>
      )}

      {demo && (
        <p className="mt-3 text-[0.7rem] text-cocoa-400">
          Exemple — connecte Mistral pour une analyse réelle.
        </p>
      )}
    </motion.div>
  );
}

function MatchBadge({ pct }: { pct: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-clay-400/20 px-2.5 py-0.5 text-[0.72rem] font-semibold text-cocoa-700">
      <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
      {pct}% match
    </span>
  );
}
