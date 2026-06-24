import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const dynamic = "force-dynamic";

export default async function EspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/espace");

  const [{ data: profile }, { data: subscription }, { data: entries }, { data: catalog }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("day_number", { ascending: true }),
      supabase
        .from("cuts_catalog")
        .select("*")
        .order("popularity", { ascending: false }),
    ]);

  // URLs signées pour les photos (bucket privé).
  const signedEntries = await Promise.all(
    (entries ?? []).map(async (e: any) => {
      const sign = async (path: string | null) =>
        path
          ? (
              await supabase.storage
                .from("progress-photos")
                .createSignedUrl(path, 3600)
            ).data?.signedUrl ?? null
          : null;
      return {
        day_number: e.day_number,
        score: e.score,
        completed: e.completed,
        beforeUrl: await sign(e.photo_before_path),
        afterUrl: await sign(e.photo_after_path),
      };
    }),
  );

  const via: "stripe" | "code" | null = subscription
    ? subscription.price_id?.startsWith("access_code:")
      ? "code"
      : "stripe"
    : null;

  return (
    <Dashboard
      email={user.email ?? ""}
      program={profile?.program ?? null}
      diagnosis={profile?.diagnosis ?? null}
      currentDay={profile?.current_day ?? 0}
      score={profile?.hair_score ?? null}
      startedAt={profile?.started_at ?? null}
      lastCompletedDate={profile?.last_completed_date ?? null}
      lastCompletedAt={profile?.last_completed_at ?? null}
      subscription={{ status: subscription?.status ?? null, via }}
      entries={signedEntries}
      catalog={catalog ?? []}
    />
  );
}
