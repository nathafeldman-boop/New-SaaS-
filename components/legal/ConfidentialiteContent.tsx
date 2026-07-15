"use client";

import { siteConfig } from "@/lib/site";
import { LangSwitch, useLang } from "@/lib/i18n";

const UPDATED = "juillet 2026";
const UPDATED_EN = "July 2026";

export function ConfidentialiteContent() {
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
          {en ? "Privacy policy" : "Politique de confidentialité"}
        </h1>
        <p className="mt-2 text-sm text-cocoa-600">
          {en ? `Last updated: ${UPDATED_EN}.` : `Dernière mise à jour : ${UPDATED}.`}
        </p>
        {en && (
          <p className="mt-3 rounded-xl bg-sand/60 px-3.5 py-2.5 text-xs leading-relaxed text-cocoa-700">
            This English version is provided for convenience only. In case of any
            discrepancy, the{" "}
            <a href="/confidentialite" className="underline">
              French version
            </a>{" "}
            is the one that legally applies.
          </p>
        )}

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
          <li>Vos réponses au questionnaire (type de cheveux, objectifs, habitudes).</li>
          <li>
            La photo de diagnostic initiale et les photos quotidiennes de suivi (avant/après)
            — voir le détail de leur traitement à la section 4bis ci-dessous, elles ne sont
            pas traitées de la même façon.
          </li>
          <li>Le diagnostic, le score, la routine et le suivi générés à partir de ces éléments.</li>
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
          <li>Vercel — hébergement du site (États-Unis).</li>
          <li>Supabase — base de données et stockage des fichiers (serveurs dans l&apos;UE).</li>
          <li>Stripe — traitement des paiements.</li>
          <li>
            Mistral AI (société française) — reçoit votre photo de diagnostic et vos réponses
            au questionnaire pour générer l&apos;analyse capillaire. Détail de ce traitement
            ci-dessous (section 4bis).
          </li>
          <li>Prestataire d&apos;e-mailing — envoi des e-mails de service.</li>
        </ul>
        <p className="mt-2">
          Vos données ne sont jamais vendues. Certains prestataires pouvant être établis hors
          Union européenne, les transferts sont encadrés par des garanties appropriées (clauses
          contractuelles types).
        </p>
      </Section>

      <Section title="4bis. Vos photos, en détail">
        <p>Vos photos ne sont pas toutes traitées de la même façon. Il y a deux cas distincts :</p>
        <p className="mt-3">
          <b className="font-medium text-ink">La photo de diagnostic</b> (celle prise au
          début, pour l&apos;analyse IA) est transmise à Mistral AI pour générer votre
          diagnostic. {siteConfig.name} ne conserve pas cette photo sur ses propres serveurs
          après l&apos;analyse. Selon la politique publiée par Mistral AI (
          <a
            href="https://legal.mistral.ai/terms/privacy-policy"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            legal.mistral.ai
          </a>
          , consultée en juillet 2026) pour son API payante :
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            la photo et le résultat sont conservés par Mistral pendant 30 jours glissants
            maximum, à des fins de lutte contre les abus, puis supprimés ;
          </li>
          <li>
            Mistral déclare ne pas utiliser les données transmises via son API payante pour
            entraîner ses modèles d&apos;IA (règle différente de ses offres gratuites grand
            public, que {siteConfig.name} n&apos;utilise pas).
          </li>
        </ul>
        <p className="mt-2 text-sm text-cocoa-600">
          Ces informations reflètent la politique publiée par Mistral AI à la date indiquée ;
          elle peut évoluer — la version en vigueur fait foi et est consultable à
          l&apos;adresse ci-dessus. {siteConfig.name} n&apos;a pas de contrôle direct sur les
          systèmes internes de Mistral.
        </p>
        <p className="mt-3">
          <b className="font-medium text-ink">Les photos quotidiennes de suivi</b>{" "}
          (avant/après, prises dans votre espace personnel une fois abonné) sont différentes :
          elles ne sont{" "}
          <b className="font-medium text-ink">jamais envoyées à Mistral ni à aucune IA</b>.
          Elles sont stockées dans un espace privé chez Supabase (hébergé dans l&apos;Union
          européenne), protégé techniquement de sorte que seul votre compte puisse y accéder.
          Elles servent uniquement à votre suivi visuel personnel.
        </p>
      </Section>

      <Section title="5. Durée de conservation">
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>
            Photo de diagnostic : non conservée par {siteConfig.name} ; conservée jusqu&apos;à
            30 jours par Mistral AI (voir section 4bis), puis supprimée.
          </li>
          <li>Photos quotidiennes de suivi : conservées tant que votre compte est actif.</li>
          <li>Compte, email, diagnostic, routine : conservés tant que votre compte est actif.</li>
        </ul>
        <p className="mt-2">
          Vous pouvez demander la suppression de votre compte et de toutes vos données
          (y compris les photos de suivi stockées) à tout moment, par simple email — voir
          section 7. La suppression est effective sous 30 jours, sauf obligation légale de
          conservation (facturation).
        </p>
      </Section>

      <Section title="6. Sécurité">
        <p>
          Les accès sont protégés, les mots de passe chiffrés et les photos de suivi
          conservées dans un espace de stockage privé, techniquement accessible uniquement via
          votre compte (règles d&apos;accès appliquées côté serveur).
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
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <Section title="1. Data controller">
        <p>
          Nathanaël Feldman, 3 bis rue Falret, 92170 Vanves, France. Contact:{" "}
          <a href="mailto:nathanaelsaas@gmail.com" className="underline">
            nathanaelsaas@gmail.com
          </a>
          .
        </p>
      </Section>

      <Section title="2. Data collected">
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>Email address and password (stored encrypted).</li>
          <li>Your questionnaire answers (hair type, goals, habits).</li>
          <li>
            Your initial diagnostic photo and daily before/after progress photos — see the
            detail of how each is handled in section 4bis below, they are not treated the same
            way.
          </li>
          <li>The diagnosis, score, routine and tracking generated from the above.</li>
          <li>
            Anonymized usage data (pages viewed, funnel steps) to measure audience and improve
            the service.
          </li>
          <li>
            Payment information, processed by Stripe; your card details are never stored by{" "}
            {siteConfig.name}.
          </li>
        </ul>
      </Section>

      <Section title="3. Purposes and legal basis">
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>Provide the subscribed service (performance of the contract).</li>
          <li>Improve the service and measure audience (legitimate interest).</li>
          <li>Comply with our legal and accounting obligations.</li>
        </ul>
      </Section>

      <Section title="4. Recipients and sub-processors">
        <p>
          To operate, {siteConfig.name} relies on providers who process certain data on our
          behalf:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Vercel — site hosting (USA).</li>
          <li>Supabase — database and file storage (servers in the EU).</li>
          <li>Stripe — payment processing.</li>
          <li>
            Mistral AI (a French company) — receives your diagnostic photo and questionnaire
            answers to generate the hair analysis. Details below (section 4bis).
          </li>
          <li>Email provider — sending service emails.</li>
        </ul>
        <p className="mt-2">
          Your data is never sold. Some providers may be established outside the European Union;
          such transfers are governed by appropriate safeguards (standard contractual clauses).
        </p>
      </Section>

      <Section title="4bis. Your photos, in detail">
        <p>Not all your photos are handled the same way. There are two distinct cases:</p>
        <p className="mt-3">
          <b className="font-medium text-ink">The diagnostic photo</b> (the one taken at the
          start, for the AI analysis) is sent to Mistral AI to generate your diagnosis.{" "}
          {siteConfig.name} does not keep this photo on its own servers after the analysis.
          According to the policy published by Mistral AI (
          <a
            href="https://legal.mistral.ai/terms/privacy-policy"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            legal.mistral.ai
          </a>
          , accessed July 2026) for its paid API:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            the photo and result are kept by Mistral for a rolling maximum of 30 days, for abuse
            monitoring purposes, then deleted;
          </li>
          <li>
            Mistral states it does not use data submitted via its paid API to train its AI models
            (a different rule from its free consumer offerings, which {siteConfig.name} does not
            use).
          </li>
        </ul>
        <p className="mt-2 text-sm text-cocoa-600">
          This information reflects Mistral AI&apos;s published policy as of the date indicated;
          it may change — the version in force governs and can be checked at the address above.{" "}
          {siteConfig.name} has no direct control over Mistral&apos;s internal systems.
        </p>
        <p className="mt-3">
          <b className="font-medium text-ink">Daily progress photos</b> (before/after, taken in
          your account once subscribed) are different: they are{" "}
          <b className="font-medium text-ink">never sent to Mistral or any AI</b>. They are
          stored in a private Supabase space (hosted in the European Union), technically
          restricted so only your account can access it. They are used only for your own visual
          tracking.
        </p>
      </Section>

      <Section title="5. Retention period">
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>
            Diagnostic photo: not kept by {siteConfig.name}; kept for up to 30 days by Mistral AI
            (see section 4bis), then deleted.
          </li>
          <li>Daily progress photos: kept while your account is active.</li>
          <li>Account, email, diagnosis, routine: kept while your account is active.</li>
        </ul>
        <p className="mt-2">
          You can request deletion of your account and all your data (including stored progress
          photos) at any time, by simply emailing us — see section 7. Deletion takes effect within
          30 days, except where a legal retention obligation applies (billing).
        </p>
      </Section>

      <Section title="6. Security">
        <p>
          Access is protected, passwords are encrypted, and progress photos are stored in a
          private storage space, technically accessible only through your account (access rules
          enforced server-side).
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>
          You have the right to access, correct, delete, object to, restrict and port your data.
          To exercise these rights, write to{" "}
          <a href="mailto:nathanaelsaas@gmail.com" className="underline">
            nathanaelsaas@gmail.com
          </a>
          . You may also contact the CNIL, the French data protection authority (
          <a href="https://www.cnil.fr" className="underline">
            cnil.fr
          </a>
          ).
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          Only cookies and local storage strictly necessary for the site to function (login,
          anonymous audience measurement) are used. No third-party advertising cookie is set.
        </p>
      </Section>

      <Section title="9. Minors">
        <p>
          The service is intended for adults. A minor may not subscribe without the consent of
          their legal guardian.
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
