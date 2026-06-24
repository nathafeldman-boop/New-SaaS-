import { NextResponse } from "next/server";
import { HEALTH_PROMPT, cutPrompt, editImage, hasReplicateKey } from "@/lib/replicate";

export const runtime = "nodejs";
export const maxDuration = 60;

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
