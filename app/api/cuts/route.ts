import { NextResponse } from "next/server";
import { hasMistralKey, recommendCuts } from "@/lib/mistral";
import { demoCuts } from "@/lib/funnel-demo";
import { createAdminClient } from "@/lib/supabase/server";
import type {
  ApiResult,
  CutsResult,
  CutSuggestion,
  HairAnalysis,
} from "@/lib/funnel-types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let analysis: HairAnalysis | undefined;
  let lang: string | undefined;
  try {
    ({ analysis, lang } = await req.json());
  } catch {
    return json({ ok: false, error: "Corps de requête invalide" }, 400);
  }
  if (!analysis) return json({ ok: false, error: "Analyse manquante" }, 400);

  if (!hasMistralKey()) {
    return json({ ok: true, demo: true, data: await withImages(demoCuts) });
  }

  try {
    const data = await recommendCuts(analysis, lang === "en" ? "en" : "fr");
    return json({ ok: true, data: await withImages(data) });
  } catch (e) {
    return json({
      ok: true,
      demo: true,
      data: await withImages(demoCuts),
      error: e instanceof Error ? e.message : "Erreur Mistral",
    });
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * Associe à chaque coupe une vraie photo issue du catalogue (cuts_catalog).
 * On tente d'abord un rapprochement par nom (mots-clés), puis on complète
 * avec des photos du catalogue pour qu'aucune carte ne reste sans visuel.
 * Si le catalogue est indisponible, on renvoie les coupes inchangées
 * (l'UI retombe alors sur l'icône ciseaux).
 * ────────────────────────────────────────────────────────────────────────── */
async function withImages(result: CutsResult): Promise<CutsResult> {
  let catalog: { name: string; image_url: string | null }[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("cuts_catalog")
      .select("name, image_url, popularity")
      .order("popularity", { ascending: false });
    catalog = (data ?? []).filter((c) => c.image_url);
  } catch {
    return result;
  }
  if (catalog.length === 0) return result;

  const pool = catalog.map((c) => ({ tokens: tokenize(c.name), url: c.image_url! }));
  let fallbackIdx = 0;

  const cuts: CutSuggestion[] = result.cuts.map((cut) => {
    const cutTokens = tokenize(cut.name);
    let best: { url: string; score: number } | null = null;
    for (const entry of pool) {
      const score = overlap(cutTokens, entry.tokens);
      if (score > 0 && (!best || score > best.score)) {
        best = { url: entry.url, score };
      }
    }
    // Pas de correspondance par nom → on pioche une photo du catalogue.
    const url = best?.url ?? pool[fallbackIdx++ % pool.length].url;
    return { ...cut, image: url };
  });

  return { ...result, cuts };
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 2),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}

function json(body: ApiResult<CutsResult>, status = 200) {
  return NextResponse.json(body, { status });
}
