import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";
import {
  getAffiliateStats,
  verifyAffiliate,
  type AffiliatePayout,
} from "@/lib/affiliates";
import { getOrCreateAffiliateCode } from "@/lib/access-codes";
import { CopyButton } from "@/components/admin/CopyButton";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Espace affilié",
  robots: { index: false },
};

const euro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const AFF_COOKIE = "cpx_aff";

/** Connexion affilié : pseudo + code → cookie (Server Action). */
async function enterAffiliate(formData: FormData) {
  "use server";
  const pseudo = String(formData.get("pseudo") ?? "");
  const code = String(formData.get("code") ?? "");
  const affiliate = await verifyAffiliate(pseudo, code);
  if (affiliate) {
    const store = await cookies();
    store.set(AFF_COOKIE, `${affiliate.pseudo}:${affiliate.access_code}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    redirect("/affilie");
  }
  redirect("/affilie?error=1");
}

async function logoutAffiliate() {
  "use server";
  const store = await cookies();
  store.delete(AFF_COOKIE);
  redirect("/affilie");
}

export default async function AffiliePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const store = await cookies();
  const raw = store.get(AFF_COOKIE)?.value ?? "";
  const sep = raw.indexOf(":");
  const affiliate =
    sep > 0
      ? await verifyAffiliate(raw.slice(0, sep), raw.slice(sep + 1))
      : null;

  return (
    <main className="grain min-h-screen bg-ink px-4 py-10 text-cream sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark.png" alt="" className="h-8 w-8 object-contain" />
            <div>
              <p className="font-display text-lg leading-tight">{siteConfig.name}</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-clay-400">
                Espace affilié
              </p>
            </div>
          </div>
          {affiliate && (
            <form action={logoutAffiliate}>
              <button className="text-xs text-clay-300 underline-offset-4 hover:underline">
                Se déconnecter
              </button>
            </form>
          )}
        </header>

        {!affiliate ? (
          <AffiliateGate error={searchParams?.error === "1"} />
        ) : (
          <AffiliateDashboard
            pseudo={affiliate.pseudo}
            rate={Number(affiliate.rate)}
            statsPromise={getAffiliateStats(affiliate)}
            freeCodePromise={getOrCreateAffiliateCode(affiliate.pseudo)}
          />
        )}
      </div>
    </main>
  );
}

function AffiliateGate({ error }: { error: boolean }) {
  return (
    <div className="mx-auto mt-14 max-w-sm rounded-3xl bg-cream/5 p-8 ring-1 ring-cream/10">
      <h1 className="font-display text-2xl">Connexion</h1>
      <p className="mt-2 text-sm text-clay-200/80">
        Entre ton pseudo et le code d&apos;accès qu&apos;on t&apos;a transmis.
      </p>
      <form action={enterAffiliate} className="mt-6 space-y-3">
        <input
          name="pseudo"
          required
          autoFocus
          placeholder="Ton pseudo"
          autoComplete="username"
          className="w-full rounded-xl border border-cream/15 bg-ink px-4 py-3 text-cream outline-none transition placeholder:text-clay-400/60 focus:border-clay-400"
        />
        <input
          name="code"
          required
          type="password"
          placeholder="Code d'accès"
          autoComplete="current-password"
          className="w-full rounded-xl border border-cream/15 bg-ink px-4 py-3 text-cream outline-none transition placeholder:text-clay-400/60 focus:border-clay-400"
        />
        {error && <p className="text-sm text-red-300">Pseudo ou code incorrect.</p>}
        <button className="w-full rounded-xl bg-gradient-to-r from-clay-400 to-clay-500 py-3 font-semibold text-ink transition hover:opacity-90">
          Voir mes gains
        </button>
      </form>
    </div>
  );
}

async function AffiliateDashboard({
  pseudo,
  rate,
  statsPromise,
  freeCodePromise,
}: {
  pseudo: string;
  rate: number;
  statsPromise: ReturnType<typeof getAffiliateStats>;
  freeCodePromise: Promise<string>;
}) {
  const [stats, freeCode] = await Promise.all([statsPromise, freeCodePromise]);
  const link = `${siteConfig.url}/?ref=${pseudo}`;

  return (
    <div className="mt-8 space-y-4">
      {/* Lien d'affiliation */}
      <section className="rounded-3xl bg-cream/5 p-5 ring-1 ring-cream/10">
        <p className="text-[11px] uppercase tracking-[0.18em] text-clay-400">
          Ton lien d&apos;affiliation
        </p>
        <p className="mt-2 break-all font-mono text-sm text-cream/90">{link}</p>
        <div className="mt-3">
          <CopyButton
            text={link}
            label="Copier mon lien"
            className="rounded-xl bg-cream px-4 py-2 text-sm font-semibold text-ink transition hover:opacity-90"
          />
        </div>
        <p className="mt-3 text-xs text-clay-300/80">
          Partage ce lien : toute personne qui crée un compte après avoir cliqué
          t&apos;est attribuée pendant 30 jours.
        </p>
      </section>

      {/* Commission en cours — LE chiffre */}
      <section className="rounded-3xl bg-gradient-to-br from-clay-400 to-clay-500 p-6 text-ink">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70">
          Commission à te verser
        </p>
        <p className="mt-1 font-display text-6xl leading-none">{euro(stats.pending)}</p>
        <p className="mt-2 text-sm text-ink/70">
          {Math.round(rate * 100)} % par vente · {euro(stats.gross)} générés au total
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <DarkStat label="Clics" value={String(stats.clicks)} />
        <DarkStat label="Comptes amenés" value={String(stats.signups)} />
        <DarkStat label="Ventes" value={String(stats.sales)} />
      </section>

      {/* Accès gratuit au produit */}
      <section className="rounded-3xl bg-cream/5 p-5 ring-1 ring-cream/10">
        <p className="text-[11px] uppercase tracking-[0.18em] text-clay-400">
          Ton accès gratuit à {siteConfig.name}
        </p>
        <p className="mt-2 font-mono text-2xl font-bold tracking-[0.15em] text-cream">
          {freeCode}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-clay-300/80">
          Pour tester le produit que tu promeus : fais le scan sur{" "}
          {siteConfig.url.replace("https://", "")}/scan, et à l&apos;étape paiement
          clique « J&apos;ai un code d&apos;accès » puis entre ce code — 30 jours
          offerts. Valable une fois, pour toi.
        </p>
        <div className="mt-3">
          <CopyButton
            text={freeCode}
            label="Copier le code"
            className="rounded-xl bg-cream/10 px-4 py-2 text-sm font-semibold text-cream ring-1 ring-cream/15 transition hover:bg-cream/20"
          />
        </div>
      </section>

      {/* Historique des versements */}
      <section className="rounded-3xl bg-cream/5 p-5 ring-1 ring-cream/10">
        <h2 className="font-display text-lg">Versements reçus</h2>
        {stats.payouts.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-ink/40 px-4 py-4 text-center text-sm text-clay-300/80">
            Aucun versement pour l&apos;instant — ta commission s&apos;accumule
            ci-dessus.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-cream/10">
            {stats.payouts.map((p: AffiliatePayout) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-cream/90">
                    {new Date(p.paid_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      timeZone: "Europe/Paris",
                    })}
                  </p>
                  {p.note && <p className="text-xs text-clay-300/70">{p.note}</p>}
                </div>
                <span className="font-display text-lg text-clay-300">{euro(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-clay-300/70">
          Total déjà versé : {euro(stats.paid)}. Les versements sont effectués
          manuellement — contacte-nous quand tu veux encaisser.
        </p>
      </section>
    </div>
  );
}

function DarkStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-cream/5 p-4 text-center ring-1 ring-cream/10">
      <p className="font-display text-3xl">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-clay-400">{label}</p>
    </div>
  );
}
