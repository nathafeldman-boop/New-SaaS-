import { NextResponse } from "next/server";
import { HEALTH_PROMPT, cutPrompt, editImage, hasReplicateKey } from "@/lib/replicate";
import { editImageGemini, hasGeminiKey } from "@/lib/gemini";

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
