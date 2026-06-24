import { createClient } from "@/lib/supabase/server";
import type { HairAnalysis } from "@/lib/funnel-types";

export const PROGRAM_LENGTH = 30;
const ACTIVE = ["active", "trialing", "past_due"];

/** Vérifie qu'on a un utilisateur connecté ET un abonnement actif. */
export async function requireActive() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "no-auth" as const, supabase, user: null };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .single();

  if (!sub || !ACTIVE.includes(sub.status)) {
    return { error: "no-sub" as const, supabase, user };
  }
  return { error: null, supabase, user };
}

/** Score capillaire de départ (0-100) dérivé du diagnostic. */
export function baselineScore(analysis?: HairAnalysis | null): number {
  const concerns = analysis?.concerns?.length ?? 2;
  return Math.max(42, Math.min(72, 64 - concerns * 4));
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
