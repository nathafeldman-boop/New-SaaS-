import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: `Conditions générales de vente de l'abonnement ${siteConfig.name}.`,
  alternates: { canonical: "/cgv" },
};

const UPDATED = "juillet 2026";

export default function CgvPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
        <a href="/" className="text-sm text-cocoa-600 hover:text-ink hover:underline">
          ← Retour à l&apos;accueil
        </a>
        <h1 className="mt-6 font-display text-3xl text-ink sm:text-4xl">
          Conditions générales de vente
        </h1>
        <p className="mt-2 text-sm text-cocoa-600">Dernière mise à jour : {UPDATED}.</p>

        <div className="mt-6 rounded-2xl border border-clay-400/50 bg-clay-100/60 px-5 py-4 text-sm leading-relaxed text-cocoa-900">
          <p className="font-semibold">
            ⚠️ En résumé : {siteConfig.name} est un ABONNEMENT mensuel, pas un achat unique.
          </p>
          <p className="mt-1.5">
            En souscrivant, vous acceptez d&apos;être prélevé(e) de{" "}
            {siteConfig.price.amount}
            {siteConfig.price.period} <strong>chaque mois, automatiquement</strong>, jusqu&apos;à
            résiliation. Vous pouvez résilier à tout moment, en un clic, depuis votre espace
            personnel (article 7 ci-dessous) — la résiliation prend effet à la fin du mois déjà
            payé.
          </p>
        </div>

        <div className="mt-10 space-y-9 text-[0.95rem] leading-relaxed text-cocoa-800">
          <Section title="1. Objet">
            <p>
              Les présentes conditions régissent la vente de l&apos;abonnement {siteConfig.name},
              service de coaching capillaire en ligne, entre l&apos;éditeur et toute personne
              physique majeure souscrivant l&apos;abonnement (le « client »). Toute souscription
              implique l&apos;acceptation pleine et entière des présentes conditions.
            </p>
          </Section>

          <Section title="2. Vendeur">
            <p>
              Nathanaël Feldman, 3 bis rue Falret, 92170 Vanves. Contact :{" "}
              <a href="mailto:nathanaelsaas@gmail.com" className="underline">
                nathanaelsaas@gmail.com
              </a>
              .
            </p>
            <p className="mt-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">
              ⚠️ À la date de mise à jour de cette page, l&apos;éditeur n&apos;est pas immatriculé
              (pas de numéro SIRET). Cette mention doit être complétée avant toute vente réelle —
              voir la mention équivalente dans les{" "}
              <a href="/mentions-legales" className="underline">
                mentions légales
              </a>
              .
            </p>
          </Section>

          <Section title="3. Service">
            <p>
              L&apos;abonnement donne accès à : une analyse capillaire à partir d&apos;une photo,
              un diagnostic et un score, une routine personnalisée de 30 jours, une sélection de
              coupes, des recommandations de produits et un suivi de progression. Le service a une
              visée cosmétique et informative ; il ne constitue pas un avis médical.
            </p>
          </Section>

          <Section title="4. Prix">
            <p>
              L&apos;abonnement est proposé au tarif de {siteConfig.price.amount}{" "}
              {siteConfig.price.period}, toutes taxes comprises, prélevé automatiquement à date
              anniversaire tant que l&apos;abonnement n&apos;est pas résilié — ce n&apos;est pas un
              paiement unique. TVA non applicable, article 293 B du Code général des impôts
              [statut de franchise en base à confirmer après immatriculation]. Le prix applicable
              est celui affiché au moment de la souscription. L&apos;éditeur se réserve le droit
              de modifier ses prix ; toute évolution est sans effet sur les abonnements en cours
              et notifiée avant reconduction.
            </p>
          </Section>

          <Section title="5. Compte et souscription">
            <p>
              La souscription nécessite la création d&apos;un compte avec une adresse e-mail valide.
              Le client s&apos;engage à fournir des informations exactes et à préserver la
              confidentialité de ses identifiants.
            </p>
          </Section>

          <Section title="6. Paiement">
            <p>
              Le paiement s&apos;effectue par carte bancaire via le prestataire Stripe, de façon
              sécurisée. L&apos;abonnement est prélevé chaque mois, par avance. Les coordonnées
              bancaires ne sont pas conservées par l&apos;éditeur.
            </p>
          </Section>

          <Section title="7. Durée, reconduction et résiliation">
            <p>
              L&apos;abonnement est mensuel, sans engagement de durée. Il se reconduit tacitement
              chaque mois. Le client peut le résilier à tout moment depuis son espace personnel ;
              la résiliation prend effet à la fin de la période mensuelle en cours, sans
              remboursement du mois entamé. L&apos;accès reste ouvert jusqu&apos;à cette échéance.
            </p>
          </Section>

          <Section title="8. Droit de rétractation">
            <p>
              Le client dispose en principe d&apos;un délai de rétractation de 14 jours (article
              L221-18 du Code de la consommation). Toutefois, le service étant un contenu numérique
              fourni immédiatement, le client demande expressément son exécution dès la
              souscription et reconnaît renoncer à son droit de rétractation sur la partie déjà
              fournie (diagnostic et programme générés), conformément à l&apos;article L221-28, 13°
              du même code. La résiliation de l&apos;abonnement pour l&apos;avenir reste possible à
              tout moment (article 7).
            </p>
          </Section>

          <Section title="9. Responsabilité">
            <p>
              Les recommandations ne remplacent pas l&apos;avis d&apos;un dermatologue ou d&apos;un
              professionnel de santé, en particulier en cas de chute de cheveux importante, de
              douleur ou de problème de cuir chevelu. L&apos;éditeur ne saurait être tenu
              responsable des résultats, qui dépendent notamment de l&apos;assiduité du client.
            </p>
          </Section>

          <Section title="10. Données personnelles">
            <p>
              Le traitement des données est décrit dans la{" "}
              <a href="/confidentialite" className="underline">
                politique de confidentialité
              </a>
              .
            </p>
          </Section>

          <Section title="11. Réclamation et médiation">
            <p>
              Toute réclamation peut être adressée à{" "}
              <a href="mailto:nathanaelsaas@gmail.com" className="underline">
                nathanaelsaas@gmail.com
              </a>
              . Conformément au Code de la consommation, le client peut recourir gratuitement à un
              médiateur de la consommation en vue de la résolution amiable d&apos;un litige.
            </p>
            <p className="mt-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">
              ⚠️ Médiateur non encore désigné. C&apos;est une obligation légale pour tout
              professionnel vendant à des consommateurs en France (adhésion à un médiateur agréé,
              ex. via une liste officielle sur{" "}
              <a href="https://www.mediation-conso.fr" className="underline">
                mediation-conso.fr
              </a>
              ) — à faire dès l&apos;immatriculation, avant toute vente réelle.
            </p>
          </Section>

          <Section title="12. Droit applicable">
            <p>
              Les présentes conditions sont soumises au droit français. À défaut de résolution
              amiable, les tribunaux français sont compétents.
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
