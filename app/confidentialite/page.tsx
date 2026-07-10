import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment ${siteConfig.name} traite et protège vos données personnelles.`,
  alternates: { canonical: "/confidentialite" },
};

const UPDATED = "janvier 2026";

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
        <a href="/" className="text-sm text-cocoa-600 hover:text-ink hover:underline">
          ← Retour à l&apos;accueil
        </a>
        <h1 className="mt-6 font-display text-3xl text-ink sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-sm text-cocoa-600">Dernière mise à jour : {UPDATED}.</p>

        <div className="mt-10 space-y-9 text-[0.95rem] leading-relaxed text-cocoa-800">
          <Section title="1. Responsable du traitement">
            <p>
              Nathanaël Feldman, 3 bis rue Falret, 92170 Vanves. Contact :{" "}
              <a href="mailto:nathanaelsaas@gmail.com" className="underline">
                nathanaelsaas@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section title="2. Données collectées">
            <ul className="mt-1 list-disc space-y-1.5 pl-5">
              <li>Adresse e-mail et mot de passe (stocké de façon chiffrée).</li>
              <li>
                La photo que vous transmettez pour l&apos;analyse, ainsi que vos réponses au
                questionnaire (type de cheveux, objectifs, habitudes).
              </li>
              <li>
                Le diagnostic, le score, la routine et le suivi générés à partir de ces éléments.
              </li>
              <li>
                Des données d&apos;usage anonymisées (pages consultées, étapes du parcours) pour
                mesurer l&apos;audience et améliorer le service.
              </li>
              <li>
                Les informations nécessaires au paiement, traitées par Stripe ; vos coordonnées
                bancaires ne sont jamais stockées par {siteConfig.name}.
              </li>
            </ul>
          </Section>

          <Section title="3. Finalités et bases légales">
            <ul className="mt-1 list-disc space-y-1.5 pl-5">
              <li>Fournir le service souscrit (exécution du contrat).</li>
              <li>Améliorer le service et mesurer l&apos;audience (intérêt légitime).</li>
              <li>Respecter nos obligations légales et comptables.</li>
            </ul>
          </Section>

          <Section title="4. Destinataires et sous-traitants">
            <p>
              Pour fonctionner, {siteConfig.name} fait appel à des prestataires qui traitent
              certaines données pour notre compte :
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Vercel — hébergement du site.</li>
              <li>Supabase — base de données et stockage des fichiers (serveurs dans l&apos;UE).</li>
              <li>Stripe — traitement des paiements.</li>
              <li>
                Mistral AI (société française) — la photo et le questionnaire lui sont transmis
                pour générer l&apos;analyse.
              </li>
              <li>Prestataire d&apos;e-mailing — envoi des e-mails de service.</li>
            </ul>
            <p className="mt-2">
              Vos données ne sont jamais vendues. Certains prestataires pouvant être établis hors
              Union européenne, les transferts sont encadrés par des garanties appropriées (clauses
              contractuelles types).
            </p>
          </Section>

          <Section title="5. Durée de conservation">
            <p>
              Vos données sont conservées tant que votre compte est actif. Vous pouvez demander leur
              suppression à tout moment ; les données sont alors effacées, sauf obligation légale de
              conservation (facturation).
            </p>
          </Section>

          <Section title="6. Sécurité">
            <p>
              Les accès sont protégés, les mots de passe chiffrés et les photos conservées dans un
              espace de stockage privé, accessible uniquement via votre compte.
            </p>
          </Section>

          <Section title="7. Vos droits">
            <p>
              Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
              d&apos;opposition, de limitation et de portabilité de vos données. Pour les exercer,
              écrivez à{" "}
              <a href="mailto:nathanaelsaas@gmail.com" className="underline">
                nathanaelsaas@gmail.com
              </a>
              . Vous pouvez aussi saisir la CNIL (
              <a href="https://www.cnil.fr" className="underline">
                cnil.fr
              </a>
              ).
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              Seuls des cookies et un stockage local strictement nécessaires au fonctionnement
              (connexion, mesure d&apos;audience anonyme) sont utilisés. Aucun cookie publicitaire
              tiers n&apos;est déposé.
            </p>
          </Section>

          <Section title="9. Mineurs">
            <p>
              Le service s&apos;adresse à des personnes majeures. Un mineur ne peut souscrire sans
              l&apos;accord de son représentant légal.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
