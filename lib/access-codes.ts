import { createAdminClient } from "@/lib/supabase/server";

// ──────────────────────────────────────────────────────────────────────────
//  Codes d'accès — gestion (création, listing, activation).
//  Un code actif validé à l'étape paiement active 30 jours d'accès sans
//  Stripe (cf. /api/access-code). Les codes d'affiliés portent le label
//  `affiliate:<pseudo>` pour être retrouvés/générés de façon idempotente.
// ──────────────────────────────────────────────────────────────────────────

export type AccessCode = {
  code: string;
  label: string | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  created_at: string;
};

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function genCode(prefix = "CPX"): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const rand = Array.from(bytes)
    .map((b) => CODE_CHARS[b % CODE_CHARS.length])
    .join("");
  return `${prefix.toUpperCase()}-${rand}`;
}

/** Normalise un code saisi à la main : majuscules, A-Z 0-9 et tirets. */
export function normalizeCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

export async function listAccessCodes(): Promise<AccessCode[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("access_codes")
    .select("code, label, max_uses, used_count, active, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as AccessCode[];
}

export async function createAccessCode(input: {
  code?: string;
  label?: string;
  maxUses?: number | null;
}): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const code = input.code ? normalizeCode(input.code) : genCode();
  if (code.length < 4) return { ok: false, error: "Code trop court (4 caractères min.)." };

  const admin = createAdminClient();
  const { error } = await admin.from("access_codes").insert({
    code,
    label: input.label?.slice(0, 120) || null,
    max_uses: input.maxUses ?? 1,
    used_count: 0,
    active: true,
  });
  if (error) {
    return {
      ok: false,
      error: /duplicate|unique/i.test(error.message) ? "Ce code existe déjà." : error.message,
    };
  }
  return { ok: true, code };
}

export async function setCodeActive(code: string, active: boolean): Promise<void> {
  const admin = createAdminClient();
  await admin.from("access_codes").update({ active }).eq("code", normalizeCode(code));
}

/**
 * Code d'accès personnel d'un affilié (accès gratuit au produit) —
 * créé au premier appel, puis toujours le même (idempotent).
 */
export async function getOrCreateAffiliateCode(pseudo: string): Promise<string> {
  const admin = createAdminClient();
  const label = `affiliate:${pseudo}`;
  const { data: existing } = await admin
    .from("access_codes")
    .select("code")
    .eq("label", label)
    .maybeSingle();
  if (existing?.code) return existing.code;

  const code = genCode(pseudo.slice(0, 10));
  await admin.from("access_codes").insert({
    code,
    label,
    max_uses: 1,
    used_count: 0,
    active: true,
  });
  return code;
}
