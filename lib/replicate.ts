// ──────────────────────────────────────────────────────────────────────────
//  Client serveur Replicate — édition d'image (FLUX Kontext).
//  Transforme la photo de l'utilisateur (cheveux sains / nouvelle coupe) en
//  gardant le visage. Clé lue côté serveur uniquement (REPLICATE_API_TOKEN).
// ──────────────────────────────────────────────────────────────────────────

// Modèle d'édition d'image guidée par instruction (garde l'identité).
const MODEL = process.env.REPLICATE_MODEL ?? "black-forest-labs/flux-kontext-pro";

export function hasReplicateKey(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

export class ReplicateError extends Error {}

/**
 * Édite l'image fournie selon le prompt et renvoie l'URL de l'image générée.
 * Utilise l'en-tête `Prefer: wait` pour bloquer jusqu'au résultat (≤ 60 s).
 */
export async function editImage(
  imageDataUrl: string,
  prompt: string,
): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new ReplicateError("REPLICATE_API_TOKEN manquante");

  const res = await fetch(
    `https://api.replicate.com/v1/models/${MODEL}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // bloque jusqu'à la fin (≤ 60 s) — pas besoin de polling
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          prompt,
          input_image: imageDataUrl,
          aspect_ratio: "match_input_image",
          output_format: "jpg",
          safety_tolerance: 2,
        },
      }),
      // on coupe avant le timeout de la fonction (60 s)
      signal: AbortSignal.timeout(55_000),
    },
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = json?.detail || JSON.stringify(json).slice(0, 200);
    throw new ReplicateError(`Replicate ${res.status}: ${detail}`);
  }
  if (json.status === "failed" || json.error) {
    throw new ReplicateError(json.error || "Génération échouée");
  }

  const out = Array.isArray(json.output) ? json.output[0] : json.output;
  if (typeof out !== "string") throw new ReplicateError("Pas d'image en sortie");
  return out;
}

/** Prompt : améliorer la santé / le style des cheveux sans changer la personne. */
export const HEALTH_PROMPT =
  "Keep the exact same person, same face, same identity, same pose, same " +
  "framing, same background and lighting. Only transform the hair: make it " +
  "look healthy, deeply hydrated, shiny, fuller, neatly cut and well styled, " +
  "as after a great hair-care routine and a fresh haircut. Natural and " +
  "photorealistic, high quality.";

/** Prompt : appliquer une coupe précise tout en gardant le visage. */
export function cutPrompt(cutName: string): string {
  return (
    `Keep the exact same person, same face, same identity, same pose, same ` +
    `framing, same background and lighting. Restyle ONLY the hair into this ` +
    `haircut: "${cutName}". Healthy, well-groomed, realistic barber result. ` +
    `Photorealistic, high quality.`
  );
}
