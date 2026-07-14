import { createAdminClient } from "@/lib/supabase/server";
import { MONTHLY_PRICE } from "@/lib/admin-metrics";
import { getOrCreateAffiliateCode } from "@/lib/access-codes";

// ──────────────────────────────────────────────────────────────────────────
//  Programme d'affiliation — helpers serveur uniquement.
//  Attribution : lien /?ref=pseudo → cookie 30 j → profiles.ref à
//  l'inscription. Une vente = un abonnement payant (hors codes d'accès)
//  d'un compte référé. Commission = ventes × prix × taux (60 % par défaut).
//  AUCUN montant n'est calculé côté client.
// ──────────────────────────────────────────────────────────────────────────

export type Affiliate = {
  id: string;
  pseudo: string;
  access_code: string;
  rate: number;
  created_at: string;
};

export type AffiliatePayout = {
  id: string;
  amount: number;
  note: string | null;
  paid_at: string;
};

export type AffiliateStats = {
  clicks: number;
  signups: number;
  sales: number;
  /** Commission cumulée depuis le début (€). */
  gross: number;
  /** Déjà versé (€). */
  paid: number;
  /** Reste à verser (€). */
  pending: number;
  payouts: AffiliatePayout[];
};

/** Normalise un pseudo : minuscules, alphanumérique + tirets. */
export function normalizePseudo(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
}

/** Code d'accès lisible (8 caractères, sans ambiguïtés 0/O, 1/I/L). */
export function genAccessCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

export async function getAffiliate(pseudo: string): Promise<Affiliate | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("affiliates")
    .select("id, pseudo, access_code, rate, created_at")
    .eq("pseudo", normalizePseudo(pseudo))
    .maybeSingle();
  return (data as Affiliate) ?? null;
}

/** Vérifie pseudo + code d'accès. */
export async function verifyAffiliate(
  pseudo: string,
  code: string,
): Promise<Affiliate | null> {
  const a = await getAffiliate(pseudo);
  if (!a) return null;
  return a.access_code === code.trim().toUpperCase() ? a : null;
}

export async function getAffiliateStats(a: Affiliate): Promise<AffiliateStats> {
  const admin = createAdminClient();
  const [clicksRes, profilesRes, payoutsRes] = await Promise.all([
    admin
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("name", "aff_click")
      .eq("props->>ref", a.pseudo),
    admin.from("profiles").select("id").eq("ref", a.pseudo),
    admin
      .from("affiliate_payouts")
      .select("id, amount, note, paid_at")
      .eq("affiliate_id", a.id)
      .order("paid_at", { ascending: false }),
  ]);

  const referredIds = (profilesRes.data ?? []).map((p) => p.id);
  let sales = 0;
  if (referredIds.length > 0) {
    const { data: subs } = await admin
      .from("subscriptions")
      .select("user_id, price_id")
      .in("user_id", referredIds);
    // Vente = abonnement payant (les codes d'accès offerts ne comptent pas).
    sales = (subs ?? []).filter(
      (s) => !String(s.price_id ?? "").startsWith("access_code:"),
    ).length;
  }

  const payouts = ((payoutsRes.data ?? []) as AffiliatePayout[]).map((p) => ({
    ...p,
    amount: Number(p.amount),
  }));
  const gross = round2(sales * MONTHLY_PRICE * Number(a.rate));
  const paid = round2(payouts.reduce((s, p) => s + p.amount, 0));

  return {
    clicks: clicksRes.count ?? 0,
    signups: referredIds.length,
    sales,
    gross,
    paid,
    pending: Math.max(0, round2(gross - paid)),
    payouts,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Crée un affilié (code généré). Renvoie une erreur lisible si pseudo pris. */
export async function createAffiliate(
  rawPseudo: string,
): Promise<{ ok: true; affiliate: Affiliate } | { ok: false; error: string }> {
  const pseudo = normalizePseudo(rawPseudo);
  if (pseudo.length < 3) {
    return { ok: false, error: "Pseudo trop court (3 caractères min., lettres/chiffres)." };
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("affiliates")
    .insert({ pseudo, access_code: genAccessCode() })
    .select("id, pseudo, access_code, rate, created_at")
    .single();
  if (error) {
    return {
      ok: false,
      error: /duplicate|unique/i.test(error.message)
        ? "Ce pseudo existe déjà."
        : error.message,
    };
  }
  return { ok: true, affiliate: data as Affiliate };
}

/** Enregistre un versement effectué à un affilié. */
export async function addPayout(
  affiliateId: string,
  amount: number,
  note?: string,
): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) return;
  const admin = createAdminClient();
  await admin.from("affiliate_payouts").insert({
    affiliate_id: affiliateId,
    amount: round2(amount),
    note: note?.slice(0, 200) || null,
  });
}

/** Tous les affiliés avec leurs stats + code produit gratuit (dashboard admin). */
export async function listAffiliatesWithStats(): Promise<
  { affiliate: Affiliate; stats: AffiliateStats; freeCode: string }[]
> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("affiliates")
    .select("id, pseudo, access_code, rate, created_at")
    .order("created_at", { ascending: true });
  const affiliates = (data ?? []) as Affiliate[];
  return Promise.all(
    affiliates.map(async (affiliate) => {
      const [stats, freeCode] = await Promise.all([
        getAffiliateStats(affiliate),
        getOrCreateAffiliateCode(affiliate.pseudo),
      ]);
      return { affiliate, stats, freeCode };
    }),
  );
}
