"use client";

import { siteConfig } from "@/lib/site";
import { LangSwitch, useLang } from "@/lib/i18n";

const UPDATED = "juillet 2026";
const UPDATED_EN = "July 2026";

export function CgvContent() {
  const [lang] = useLang();
  const en = lang === "en";

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
        <div className="flex items-center justify-between">
          <a href="/" className="text-sm text-cocoa-600 hover:text-ink hover:underline">
            {en ? "← Back to home" : "← Retour à l'accueil"}
          </a>
          <LangSwitch />
        </div>
        <h1 className="mt-6 font-display text-3xl text-ink sm:text-4xl">
          {en ? "Terms of sale" : "Conditions générales de vente"}
        </h1>
        <p className="mt-2 text-sm text-cocoa-600">
          {en ? `Last updated: ${UPDATED_EN}.` : `Dernière mise à jour : ${UPDATED}.`}
        </p>
        {en && (
          <p className="mt-3 rounded-xl bg-sand/60 px-3.5 py-2.5 text-xs leading-relaxed text-cocoa-700">
            This English version is provided for convenience only. In case of any
            discrepancy, the{" "}
            <a href="/cgv" className="underline">
              French version
            </a>{" "}
            is the one that legally applies.
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-clay-400/50 bg-clay-100/60 px-5 py-4 text-sm leading-relaxed text-cocoa-900">
          {en ? (
            <>
              <p className="font-semibold">
                ⚠️ In short: {siteConfig.name} is a monthly SUBSCRIPTION, not a one-time
                purchase.
              </p>
              <p className="mt-1.5">
                By subscribing, you agree to be charged {siteConfig.price.amount}
                {siteConfig.price.period} <strong>every month, automatically</strong>, until you
                cancel. You can cancel at any time, in one click, from your account (article 7
                below) — cancellation takes effect at the end of the month already paid for.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">
                ⚠️ En résumé : {siteConfig.name} est un ABONNEMENT mensuel, pas un achat unique.
              </p>
              <p className="mt-1.5">
                En souscrivant, vous acceptez d&apos;être prélevé(e) de{" "}
                {siteConfig.price.amount}
                {siteConfig.price.period} <strong>chaque mois, automatiquement</strong>,
                jusqu&apos;à résiliation. Vous pouvez résilier à tout moment, en un clic, depuis
                votre espace personnel (article 7 ci-dessous) — la résiliation prend effet à la
                fin du mois déjà payé.
              </p>
            </>
          )}
        </div>

        <div className="mt-10 space-y-9 text-[0.95rem] leading-relaxed text-cocoa-800">
          {en ? <EnglishContent /> : <FrenchContent />}
        </div>
      </div>
    </main>
  );
}

function FrenchContent() {
  return (
    <>
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
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <Section title="1. Purpose">
        <p>
          These terms govern the sale of the {siteConfig.name} subscription, an online hair
          coaching service, between the publisher and any adult individual subscribing (the
          &quot;customer&quot;). Subscribing implies full acceptance of these terms.
        </p>
      </Section>

      <Section title="2. Seller">
        <p>
          Nathanaël Feldman, 3 bis rue Falret, 92170 Vanves, France. Contact:{" "}
          <a href="mailto:nathanaelsaas@gmail.com" className="underline">
            nathanaelsaas@gmail.com
          </a>
          .
        </p>
        <p className="mt-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">
          ⚠️ As of this page&apos;s last update, the publisher is not yet registered as a
          business (no SIRET number). This must be completed before any real sale — see the
          equivalent notice in the{" "}
          <a href="/mentions-legales" className="underline">
            legal notice
          </a>
          .
        </p>
      </Section>

      <Section title="3. Service">
        <p>
          The subscription gives access to: a hair analysis from a photo, a diagnosis and score,
          a personalized 30-day routine, a selection of haircuts, product recommendations and
          progress tracking. The service is cosmetic and informational in nature; it does not
          constitute medical advice.
        </p>
      </Section>

      <Section title="4. Price">
        <p>
          The subscription is offered at {siteConfig.price.amount}
          {siteConfig.price.period}, all taxes included, charged automatically on the renewal
          date for as long as the subscription is not cancelled — this is not a one-time
          payment. VAT not applicable, article 293 B of the French General Tax Code [franchise
          en base status to be confirmed after business registration]. The price applied is the
          one shown at the time of subscription. The publisher reserves the right to change
          prices; any change has no effect on ongoing subscriptions and is notified before the
          next renewal.
        </p>
      </Section>

      <Section title="5. Account and subscription">
        <p>
          Subscribing requires creating an account with a valid email address. The customer
          agrees to provide accurate information and to keep their login details confidential.
        </p>
      </Section>

      <Section title="6. Payment">
        <p>
          Payment is made securely by card via the Stripe payment provider. The subscription is
          charged each month, in advance. Card details are not stored by the publisher.
        </p>
      </Section>

      <Section title="7. Term, renewal and cancellation">
        <p>
          The subscription is monthly, with no fixed commitment period. It renews automatically
          each month. The customer may cancel at any time from their account; cancellation
          takes effect at the end of the current monthly period, with no refund for the month
          already started. Access remains open until that date.
        </p>
      </Section>

      <Section title="8. Right of withdrawal">
        <p>
          The customer generally has a 14-day right of withdrawal (article L221-18 of the French
          Consumer Code). However, as the service is digital content supplied immediately, the
          customer expressly requests its immediate performance upon subscribing and
          acknowledges waiving their right of withdrawal for the part already provided (the
          diagnosis and program already generated), in accordance with article L221-28, 13° of
          the same code. Cancelling the subscription for the future remains possible at any time
          (article 7).
        </p>
      </Section>

      <Section title="9. Liability">
        <p>
          The recommendations do not replace the advice of a dermatologist or healthcare
          professional, particularly in the case of significant hair loss, pain, or a scalp
          condition. The publisher cannot be held liable for results, which depend in particular
          on the customer&apos;s consistency in following the program.
        </p>
      </Section>

      <Section title="10. Personal data">
        <p>
          Data processing is described in the{" "}
          <a href="/confidentialite" className="underline">
            privacy policy
          </a>
          .
        </p>
      </Section>

      <Section title="11. Complaints and mediation">
        <p>
          Any complaint may be sent to{" "}
          <a href="mailto:nathanaelsaas@gmail.com" className="underline">
            nathanaelsaas@gmail.com
          </a>
          . In accordance with the French Consumer Code, the customer may use a consumer
          mediator free of charge to seek an amicable resolution of a dispute.
        </p>
        <p className="mt-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800">
          ⚠️ No mediator designated yet. This is a legal obligation for any business selling to
          consumers in France (membership with an approved mediator, e.g. via the official list
          at{" "}
          <a href="https://www.mediation-conso.fr" className="underline">
            mediation-conso.fr
          </a>
          ) — to be done as soon as the business is registered, before any real sale.
        </p>
      </Section>

      <Section title="12. Governing law">
        <p>
          These terms are governed by French law. Failing an amicable resolution, the French
          courts have jurisdiction.
        </p>
      </Section>
    </>
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
