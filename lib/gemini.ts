// ──────────────────────────────────────────────────────────────────────────
//  Client serveur Google Gemini — édition d'image (palier GRATUIT).
//  Alternative à Replicate pour le rendu avant/après : transforme la photo en
//  gardant le visage. Clé lue côté serveur uniquement (GEMINI_API_KEY).
//  Modèle « image » de Gemini (ex. gemini-2.5-flash-image), gratuit dans le
//  free tier de Google AI Studio (sans carte bancaire, quota limité).
// ──────────────────────────────────────────────────────────────────────────

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-image";

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export class GeminiError extends Error {}

function parseDataUrl(dataUrl: string): { mime: string; base64: string } {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) throw new GeminiError("Image invalide (data URL attendue)");
  return { mime: m[1], base64: m[2] };
}

/**
 * Édite l'image fournie selon le prompt et renvoie une data URL (base64) de
 * l'image générée. Lève GeminiError en cas d'échec (clé, quota, refus…).
 */
export async function editImageGemini(
  imageDataUrl: string,
  prompt: string,
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("GEMINI_API_KEY manquante");

  const { mime, base64 } = parseDataUrl(imageDataUrl);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mime, data: base64 } },
            ],
          },
        ],
        // on veut une image en sortie
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
      signal: AbortSignal.timeout(55_000),
    },
  );

  const json = await res.json().catch(() => ({}) as any);
  if (!res.ok) {
    const detail = json?.error?.message || JSON.stringify(json).slice(0, 200);
    throw new GeminiError(`Gemini ${res.status}: ${detail}`);
  }

  // Cherche la première part image (la réponse REST est en camelCase).
  const parts: any[] = json?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const inline = p?.inlineData ?? p?.inline_data;
    if (inline?.data) {
      const outMime = inline.mimeType ?? inline.mime_type ?? "image/png";
      return `data:${outMime};base64,${inline.data}`;
    }
  }
  throw new GeminiError("Pas d'image renvoyée par Gemini");
}
