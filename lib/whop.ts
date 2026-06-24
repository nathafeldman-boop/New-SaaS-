// ──────────────────────────────────────────────────────────────────────────
//  Vérification de paiement Whop (validation de clé de licence).
//  La clé API Whop est lue côté serveur uniquement (WHOP_API_KEY).
// ──────────────────────────────────────────────────────────────────────────

const BASE = process.env.WHOP_API_BASE ?? "https://api.whop.com";

export function hasWhopKey(): boolean {
  return Boolean(process.env.WHOP_API_KEY);
}

/**
 * Valide une clé de licence Whop. Renvoie true si l'accès est actif.
 * Endpoint : POST /api/v2/memberships/validate_license
 */
export async function validateLicense(license: string): Promise<boolean> {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new Error("WHOP_API_KEY manquante");

  const res = await fetch(`${BASE}/api/v2/memberships/validate_license`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ license: license.trim() }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return false;
  const j = await res.json().catch(() => ({}) as Record<string, unknown>);

  // Whop renvoie le membership ; on accepte plusieurs formes de "actif".
  const status =
    (j as { status?: string }).status ??
    (j as { membership?: { status?: string } }).membership?.status;
  return (
    (j as { valid?: boolean }).valid === true ||
    status === "active" ||
    status === "completed" ||
    status === "trialing"
  );
}
