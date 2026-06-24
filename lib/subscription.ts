import { createClient } from "@/lib/supabase/server";

const ACTIVE = new Set(["active", "trialing", "past_due"]);

/**
 * Renvoie l'utilisateur courant et s'il a un accès actif (abonnement en cours).
 * Utilisé pour le routage et le verrou d'accès.
 */
export async function getAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, active: false, status: null as string | null };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .single();

  return {
    user,
    active: sub ? ACTIVE.has(sub.status) : false,
    status: sub?.status ?? null,
  };
}
