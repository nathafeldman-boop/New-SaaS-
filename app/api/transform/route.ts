import { NextResponse } from "next/server";
import { HEALTH_PROMPT, cutPrompt, editImage, hasReplicateKey } from "@/lib/replicate";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Sonde de diagnostic temporaire (à retirer) ─────────────────────────────
// GET /api/transform?probe=capx-diag-9211 : vérifie côté serveur si la clé est
// présente et tente un vrai appel Replicate, en renvoyant le statut/erreur exact.
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("probe") !== "capx-diag-9211") {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  const hasKey = hasReplicateKey();
  const model = process.env.REPLICATE_MODEL ?? "black-forest-labs/flux-kontext-pro";
  let replicate: unknown = null;
  try {
    const out = await editImage(TINY_PNG, HEALTH_PROMPT);
    replicate = { ok: true, urlPreview: String(out).slice(0, 80) };
  } catch (e) {
    replicate = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  return NextResponse.json({ hasKey, model, replicate });
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

  // pas de clé → le client retombe sur la simulation éclat
  if (!hasReplicateKey()) {
    return NextResponse.json({ ok: false, reason: "no-key" });
  }

  const prompt = mode === "cut" && cut ? cutPrompt(cut) : HEALTH_PROMPT;

  try {
    const url = await editImage(image, prompt);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : "Erreur Replicate",
    });
  }
}
