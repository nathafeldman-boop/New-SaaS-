import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function EspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protégé : pas connecté → on renvoie vers la connexion.
  if (!user) redirect("/login?next=/espace");

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
  ]);

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  const tabs = [
    { key: "routine", label: "Routine du jour" },
    { key: "photo", label: "Photo avant/après" },
    { key: "score", label: "Score" },
    { key: "evolution", label: "Avant / Après" },
    { key: "coupes", label: "Catalogue de coupes" },
    { key: "profil", label: "Profil" },
    { key: "abonnement", label: "Abonnement" },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      <header className="mb-8 flex items-center justify-between">
        <a href="/" className="font-display text-2xl text-ink">
          {siteConfig.name}
        </a>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-ink/60 underline underline-offset-4">
            Déconnexion
          </button>
        </form>
      </header>

      <h1 className="font-display text-3xl text-ink">
        Bonjour {user.email?.split("@")[0]} 👋
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        {isActive
          ? `Jour ${profile?.current_day ?? 0} de ton programme.`
          : "Ton abonnement n'est pas encore actif."}
      </p>

      {/* Onglets (placeholder — branchés étape suivante) */}
      <nav className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <span
            key={t.key}
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm text-ink/70"
          >
            {t.label}
          </span>
        ))}
      </nav>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 text-sm text-ink/60">
        🚧 Ton espace personnel arrive — programme quotidien, photos, score et
        catalogue de coupes seront ici très bientôt.
      </div>
    </main>
  );
}
