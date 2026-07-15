"use client";

import { siteConfig } from "@/lib/site";
import { LangSwitch, useLang } from "@/lib/i18n";

const UPDATED = "juillet 2026";
const UPDATED_EN = "July 2026";

export function MentionsLegalesContent() {
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
          {en ? "Legal notice" : "Mentions légales"}
        </h1>
        <p className="mt-2 text-sm text-cocoa-600">
          {en ? `Last updated: ${UPDATED_EN}.` : `Dernière mise à jour : ${UPDATED}.`}
        </p>
        {en && (
          <p className="mt-3 rounded-xl bg-sand/60 px-3.5 py-2.5 text-xs leading-relaxed text-cocoa-700">
            This English version is provided for convenience only. In case of any
            discrepancy, the{" "}
            <a href="/mentions-legales" className="underline">
              French version
            </a>{" "}
            is the one that legally applies.
          </p>
        )}

        <div className="mt-10 space-y-10 text-[0.95rem] leading-relaxed text-cocoa-800">
          {en ? <EnglishContent /> : <FrenchContent />}
        </div>
      </div>
    </main>
  );
}

function FrenchContent() {
  return (
    <>
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
          de la création du compte, votre photo transmise volontairement pour l&apos;analyse
          capillaire, et les photos quotidiennes de suivi si vous êtes abonné(e).
        </p>
        <p className="mt-3">
          Ces photos ne sont pas toutes traitées de la même façon. La photo de diagnostic est
          transmise à notre sous-traitant Mistral AI pour générer votre analyse capillaire, et
          n&apos;est pas conservée sur nos propres serveurs après traitement. Les photos
          quotidiennes de suivi, elles, ne sont jamais envoyées à une IA et sont stockées dans un
          espace privé accessible uniquement depuis votre compte. Le détail complet — sous-
          traitants, durées de conservation et politique de Mistral AI en matière
          d&apos;entraînement de ses modèles — est décrit dans la{" "}
          <a href="/confidentialite#donnees" className="underline">
            politique de confidentialité
          </a>{" "}
          (voir en particulier la section 4bis), qui prévaut en cas de différence avec le présent
          résumé.
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
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <Section title="Site publisher">
        <p>
          The site {siteConfig.name} (available at{" "}
          <a href={siteConfig.url} className="underline">
            {siteConfig.url.replace("https://", "")}
          </a>
          ) is published by:
        </p>
        <ul className="mt-3 space-y-1">
          <li>Nathanaël Feldman, private individual.</li>
          <li>Address: 3 bis rue Falret, 92170 Vanves, France.</li>
          <li>
            Contact:{" "}
            <a href="mailto:nathanaelsaas@gmail.com" className="underline">
              nathanaelsaas@gmail.com
            </a>
            .
          </li>
        </ul>
        <p className="mt-3 text-sm text-cocoa-600">
          The publisher is not yet registered with the French business registry
          (Registre national des entreprises) as of the publication date.
        </p>
      </Section>

      <Section title="Publication director">
        <p>Nathanaël Feldman.</p>
      </Section>

      <Section title="Hosting">
        <p>The site is hosted by:</p>
        <ul className="mt-3 space-y-3">
          <li>
            <span className="font-medium text-ink">Vercel Inc.</span> — 340 S Lemon Ave #4133,
            Walnut, CA 91789, USA.{" "}
            <a href="https://vercel.com" className="underline">
              vercel.com
            </a>
          </li>
          <li>
            <span className="font-medium text-ink">Supabase</span> (database and file storage,
            servers located in the European Union).{" "}
            <a href="https://supabase.com" className="underline">
              supabase.com
            </a>
          </li>
        </ul>
      </Section>

      <Section title="Intellectual property">
        <p>
          All content on the site ({siteConfig.name}, text, visuals, logo, interface, code) is
          protected by copyright. Any reproduction or reuse, in whole or in part, without the
          publisher&apos;s prior written consent is prohibited.
        </p>
      </Section>

      <Section title="Personal data" id="donnees">
        <p>
          {siteConfig.name} collects data to provide its service: your email address when you
          create an account, the photo you voluntarily provide for hair analysis, and your daily
          progress photos if you&apos;re subscribed.
        </p>
        <p className="mt-3">
          These photos are not all handled the same way. Your diagnostic photo is sent to our
          sub-processor Mistral AI to generate your hair analysis, and is not kept on our own
          servers afterwards. Daily progress photos, on the other hand, are never sent to any AI
          and are stored in a private space accessible only from your account. The full details —
          sub-processors, retention periods and Mistral AI&apos;s model-training policy — are
          described in the{" "}
          <a href="/confidentialite#donnees" className="underline">
            privacy policy
          </a>{" "}
          (see section 4bis in particular), which takes precedence over this summary in case of
          any difference.
        </p>
        <p className="mt-3">
          In accordance with the General Data Protection Regulation (GDPR) and French data
          protection law, you have the right to access, correct and delete your data. To exercise
          this right, write to{" "}
          <a href="mailto:nathanaelsaas@gmail.com" className="underline">
            nathanaelsaas@gmail.com
          </a>
          . You may also lodge a complaint with the French data protection authority, the CNIL (
          <a href="https://www.cnil.fr" className="underline">
            cnil.fr
          </a>
          ).
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          The site uses cookies and local storage strictly necessary for it to function (account
          login, anonymous audience measurement). No third-party advertising cookie is set.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          The recommendations provided by {siteConfig.name} (diagnosis, routine, haircuts,
          products) are cosmetic and informational in nature. They do not constitute medical
          advice and do not replace consulting a dermatologist or healthcare professional,
          particularly in the case of significant hair loss or a scalp condition.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          This legal notice is governed by French law. In the event of a dispute, and failing an
          amicable resolution, the French courts have jurisdiction.
        </p>
      </Section>
    </>
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
