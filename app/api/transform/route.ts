import { NextResponse } from "next/server";
import { HEALTH_PROMPT, cutPrompt, editImage, hasReplicateKey } from "@/lib/replicate";
import { editImageGemini, hasGeminiKey } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Sonde de diagnostic temporaire (à retirer) ─────────────────────────────
// GET /api/transform?probe=capx-diag-9211 : teste les fournisseurs côté serveur.
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("probe") !== "capx-diag-9211") {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  let gemini: unknown = "skipped";
  if (hasGeminiKey()) {
    try {
      const out = await editImageGemini(TINY_PNG, HEALTH_PROMPT);
      gemini = { ok: true, kind: out.slice(0, 30) };
    } catch (e) {
      gemini = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
  return NextResponse.json({
    hasGeminiKey: hasGeminiKey(),
    hasReplicateKey: hasReplicateKey(),
    gemini,
  });
}
// ───────────────────────────────────────────────────────────────────────────

type Body = { image?: string; mode?: "health" | "cut"; cut?: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const { image, mode = "health", cut } = body;
  if (!image || !image.startsWith("data:image")) {
    return NextResponse.json({ ok: false, error: "Photo manquante" }, { status: 400 });
  }

  // aucun fournisseur configuré → le client retombe sur la simulation éclat
  if (!hasGeminiKey() && !hasReplicateKey()) {
    return NextResponse.json({ ok: false, reason: "no-key" });
  }

  const prompt = mode === "cut" && cut ? cutPrompt(cut) : HEALTH_PROMPT;
  let lastError = "";

  // 1) Gemini (palier gratuit) en priorité.
  if (hasGeminiKey()) {
    try {
      const url = await editImageGemini(image, prompt);
      return NextResponse.json({ ok: true, url, provider: "gemini" });
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Erreur Gemini";
      console.error("[transform] échec Gemini:", lastError);
      // on tente Replicate s'il est configuré
    }
  }

  // 2) Replicate (payant) en repli.
  if (hasReplicateKey()) {
    try {
      const url = await editImage(image, prompt);
      return NextResponse.json({ ok: true, url, provider: "replicate" });
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Erreur Replicate";
      console.error("[transform] échec Replicate:", lastError);
    }
  }

  // Tout a échoué → simulation côté client.
  return NextResponse.json({ ok: false, error: lastError || "Rendu indisponible" });
}
