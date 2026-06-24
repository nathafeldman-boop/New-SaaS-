// ──────────────────────────────────────────────────────────────────────────
//  Helper Pexels (serveur uniquement). Récupère une image d'illustration.
//  Utilisé pour les photos des produits recommandés. La clé vient de l'env
//  (PEXELS_API_KEY) sinon de la clé gratuite embarquée du projet.
// ──────────────────────────────────────────────────────────────────────────

const PEXELS_KEY =
  process.env.PEXELS_API_KEY ||
  "uDljl1SJLK0iskRUUYS6kTHHJP8MDV8hRDo84jhMOVUU7py2QI9uLri5";

/** Renvoie l'URL d'une image Pexels pour la requête, ou null si indisponible. */
export async function pexelsImage(query: string): Promise<string | null> {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query,
    )}&per_page=1`;
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => ({}));
    const p = json?.photos?.[0];
    return p?.src?.large || p?.src?.medium || p?.src?.portrait || null;
  } catch {
    return null;
  }
}

/** Récupère les images pour plusieurs requêtes en parallèle. */
export async function pexelsImages(queries: string[]): Promise<(string | null)[]> {
  return Promise.all(queries.map((q) => pexelsImage(q)));
}
