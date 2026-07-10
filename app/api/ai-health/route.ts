import { NextResponse } from "next/server";
import { checkAiHealth, hasMistralKey } from "@/lib/mistral";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Diagnostic de santé de l'IA (protégé par le code admin) :
// GET /api/ai-health?code=... → teste réellement un appel vision + texte
// et indique quel modèle Mistral a répondu. Sert à vérifier la prod sans
// dérouler tout le funnel.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  const expected = process.env.ADMIN_CODE ?? "CAPILATYX2026";
  if (code !== expected) {
    return NextResponse.json({ ok: false, error: "Code invalide" }, { status: 401 });
  }

  if (!hasMistralKey()) {
    return NextResponse.json({ ok: false, error: "MISTRAL_API_KEY manquante" });
  }

  const report = await checkAiHealth();
  return NextResponse.json(report, { status: report.ok ? 200 : 502 });
}
