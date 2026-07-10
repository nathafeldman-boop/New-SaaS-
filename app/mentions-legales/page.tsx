import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${siteConfig.name}.`,
  alternates: { canonical: "/mentions-legales" },
};

const UPDATED = "janvier 2026";

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
        <a href="/" className="text-sm text-cocoa-600 hover:text-ink hover:underline">
          ← Retour à l&apos;accueil
        </a>

        <h1 className="mt-6 font-display text-3xl text-ink sm:text-4xl">Mentions légales</h1>
        <p className="mt-2 text-sm text-cocoa-600">Dernière mise à jour : {UPDATED}.</p>

        <div className="mt-10 space-y-10 text-[0.95rem] leading-relaxed text-cocoa-800">
          <Section title="Éditeur du site">
            <p>
              Le site {siteConfig.name} (accessible à l&apos;adresse{" "}
              <a href={siteConfig.url} className="underline">
                {siteConfig.url.replace("https://", "")}
              </a>
              ) est édité par&nbsp;:
            </p>
            <ul className="mt-3 space-y-1">
              <li>Nathanaël Feldman, personne physique.</li>
              <li>Adresse : 3 bis rue Falret, 92170 Vanves.</li>
              <li>
                Contact :{" "}
                <a href="mailto:nathanaelsaas@gmail.com" className="underline">
                  nathanaelsaas@gmail.com
                </a>
                .
              </li>
            </ul>
            <p className="mt-3 text-sm text-cocoa-600">
              L&apos;éditeur n&apos;est pas immatriculé au Registre national des entreprises à la
              date de publication.
            </p>
          </Section>

          <Section title="Directeur de la publication">
            <p>Nathanaël Feldman.</p>
          </Section>

          <Section title="Hébergement">
            <p>Le site est hébergé par&nbsp;:</p>
            <ul className="mt-3 space-y-3">
              <li>
                <span className="font-medium text-ink">Vercel Inc.</span> — 340 S Lemon Ave #4133,
                Walnut, CA 91789, États-Unis.{" "}
                <a href="https://vercel.com" className="underline">
                  vercel.com
                </a>
              </li>
              <li>
                <span className="font-medium text-ink">Supabase</span> (base de données et stockage,
                serveurs situés dans l&apos;Union européenne).{" "}
                <a href="https://supabase.com" className="underline">
                  supabase.com
                </a>
              </li>
            </ul>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L&apos;ensemble des contenus du site ({siteConfig.name}, textes, visuels, logo,
              interface, code) est protégé par le droit d&apos;auteur. Toute reproduction ou
              réutilisation, totale ou partielle, sans autorisation écrite préalable de
              l&apos;éditeur est interdite.
            </p>
          </Section>

          <Section title="Données personnelles" id="donnees">
            <p>
              {siteConfig.name} collecte des données pour fournir son service : adresse e-mail lors
              de la création du compte, et photo transmise volontairement pour l&apos;analyse
              capillaire. La photo est traitée pour générer le diagnostic ; elle est conservée dans
              un espace de stockage privé, accessible uniquement par l&apos;utilisateur.
            </p>
            <p className="mt-3">
              Conformément au Règlement général sur la protection des données (RGPD) et à la loi
              Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification
              et de suppression de vos données. Pour l&apos;exercer, écrivez à{" "}
              <a href="mailto:nathanaelsaas@gmail.com" className="underline">
                nathanaelsaas@gmail.com
              </a>
              . Vous pouvez également introduire une réclamation auprès de la CNIL (
              <a href="https://www.cnil.fr" className="underline">
                cnil.fr
              </a>
              ).
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Le site utilise des cookies et un stockage local strictement nécessaires à son
              fonctionnement (connexion au compte, mesure d&apos;audience anonyme). Aucun cookie
              publicitaire tiers n&apos;est déposé.
            </p>
          </Section>

          <Section title="Responsabilité">
            <p>
              Les recommandations fournies par {siteConfig.name} (diagnostic, routine, coupes,
              produits) ont une visée cosmétique et informative. Elles ne constituent pas un avis
              médical et ne remplacent pas la consultation d&apos;un dermatologue ou d&apos;un
              professionnel de santé, notamment en cas de chute de cheveux importante ou de problème
              de cuir chevelu.
            </p>
          </Section>

          <Section title="Droit applicable">
            <p>
              Les présentes mentions sont soumises au droit français. En cas de litige, et à défaut
              de résolution amiable, les tribunaux français sont compétents.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
