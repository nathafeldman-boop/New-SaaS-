"use client";

import { useLang } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import { faceShapes, type Cut } from "@/lib/cuts";

function shapesSentence(cut: Cut): string {
  const shapes = faceShapes(cut.tags);
  if (shapes.length === 0)
    return "Elle s'adapte à la plupart des morphologies — l'essentiel est l'équilibre avec tes traits et ta densité de cheveux.";
  if (shapes.length === 1)
    return `Elle met particulièrement en valeur un visage ${shapes[0]}.`;
  const last = shapes[shapes.length - 1];
  return `Elle flatte surtout les visages ${shapes.slice(0, -1).join(", ")} et ${last}.`;
}

// Le nom, la description, le style et l'entretien de chaque coupe viennent
// de la base de données et n'existent qu'en français pour l'instant. Seule
// la structure de la page (libellés, boutons, titres) est traduite ici —
// les paragraphes qui citent directement ces champs restent en français
// pour ne pas produire des phrases mi-français mi-anglais.
export function CutPageContent({ cut, related }: { cut: Cut; related: Cut[] }) {
  const [lang] = useLang();
  const en = lang === "en";
  const shapes = faceShapes(cut.tags);

  const faqs = [
    {
      q: `La coupe ${cut.name}, c'est pour quel type de visage ?`,
      a: shapesSentence(cut),
    },
    {
      q: `Quel entretien demande une ${cut.name} ?`,
      a: cut.maintenance
        ? `${cut.maintenance}. Une routine adaptée garde la coupe nette plus longtemps.`
        : "Un entretien régulier chez le coiffeur et une routine adaptée gardent la coupe nette.",
    },
    {
      q: `Comment savoir si la ${cut.name} me va vraiment ?`,
      a: `Avec ${siteConfig.name}, tu l'essaies sur ta propre photo en quelques secondes, avant de passer chez le coiffeur — tu vois le rendu sur ton visage et ta densité réelle.`,
    },
  ];

  return (
    <div className="container-page pt-28 sm:pt-32">
      {/* Fil d'Ariane */}
      <nav className="text-sm text-cocoa-500" aria-label={en ? "Breadcrumb" : "Fil d'Ariane"}>
        <a href="/" className="hover:text-ink">
          {en ? "Home" : "Accueil"}
        </a>
        <span className="px-1.5">/</span>
        <a href="/coupes" className="hover:text-ink">
          {en ? "Haircuts" : "Coupes"}
        </a>
        <span className="px-1.5">/</span>
        <span className="text-cocoa-700">{cut.name}</span>
      </nav>

      {en && (
        <p className="mt-4 max-w-md rounded-xl bg-sand/60 px-3.5 py-2.5 text-xs leading-relaxed text-cocoa-700">
          This haircut's description is currently only available in French.
        </p>
      )}

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
        <div>
          <span className="eyebrow">{en ? "Men's haircut" : "Coupe homme"}</span>
          <h1 className="display-1 mt-4 text-balance text-4xl text-ink sm:text-5xl">
            {en ? cut.name : `La coupe ${cut.name}`}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-cocoa-700">{cut.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {cut.vibe && <Fact label={en ? "Style" : "Style"} value={cut.vibe} />}
            {cut.maintenance && (
              <Fact label={en ? "Maintenance" : "Entretien"} value={cut.maintenance} />
            )}
            {shapes.length > 0 && (
              <Fact label={en ? "Face shapes" : "Morphologies"} value={shapes.join(", ")} />
            )}
            {typeof cut.popularity === "number" && (
              <Fact label={en ? "Popularity" : "Popularité"} value={`${cut.popularity}/100`} />
            )}
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/scan" className="btn-primary">
              {en ? "Try this cut on my photo" : "Essayer cette coupe sur ma photo"}
            </a>
            <a href="/coupes" className="btn-ghost">
              {en ? "See all haircuts" : "Voir toutes les coupes"}
            </a>
          </div>
        </div>

        {cut.imageUrl && (
          <div className="overflow-hidden rounded-[2rem] border-[6px] border-paper shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cut.imageUrl}
              alt={`Coupe ${cut.name} homme`}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Sections de contenu (contenu détaillé toujours en français, cf. note en haut) */}
      <div className="mx-auto mt-16 max-w-2xl space-y-12 pb-8">
        <Section title={`À qui va la coupe ${cut.name} ?`}>
          <p>{shapesSentence(cut)}</p>
          <p>
            Au-delà de la forme du visage, la {cut.name} dépend de ta densité,
            de la texture de tes cheveux et de l&apos;effet recherché ({cut.vibe?.toLowerCase()}).
            Le plus sûr reste de la visualiser sur ta propre tête avant de te décider.
          </p>
        </Section>

        <Section title="Entretien au quotidien">
          <p>
            {cut.maintenance
              ? `${cut.maintenance}.`
              : "Un passage régulier chez le coiffeur suffit à garder la ligne nette."}{" "}
            Une routine capillaire adaptée (lavage, hydratation, coiffage) prolonge
            la tenue et garde des cheveux sains entre deux coupes.
          </p>
        </Section>

        <Section title={`Essayer la ${cut.name} avant le coiffeur`}>
          <p>
            Avec {siteConfig.name}, prends-toi en photo et essaie la {cut.name}{" "}
            en quelques secondes. Tu gardes le rendu qui te plaît et tu le montres
            à ton coiffeur — sans avoir à l&apos;expliquer. En bonus, tu reçois une
            routine de 30 jours pour des cheveux plus sains.
          </p>
          <a href="/scan" className="btn-primary mt-2 inline-flex">
            Commencer mon essai
          </a>
        </Section>

        {/* FAQ visible (synchro avec le JSON-LD) */}
        <Section title="Questions fréquentes">
          <div className="divide-y divide-clay-200">
            {faqs.map((f) => (
              <div key={f.q} className="py-4">
                <h3 className="font-display text-lg text-ink">{f.q}</h3>
                <p className="mt-2 text-cocoa-700">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Maillage interne */}
      {related.length > 0 && (
        <section className="border-t border-clay-200 py-14">
          <h2 className="display-2 text-2xl text-ink">
            {en ? "Other haircuts to discover" : "Autres coupes à découvrir"}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((c) => (
              <a
                key={c.slug}
                href={`/coupes/${c.slug}`}
                className="group overflow-hidden rounded-2xl bg-paper shadow-card ring-1 ring-clay-200/60 transition hover:-translate-y-0.5"
              >
                {c.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imageUrl}
                    alt={`Coupe ${c.name}`}
                    className="aspect-square w-full object-cover"
                  />
                )}
                <span className="block px-3 py-2.5 font-display text-sm text-ink">
                  {c.name}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper/70 px-4 py-3 ring-1 ring-clay-200/60">
      <dt className="text-[0.7rem] uppercase tracking-wide text-cocoa-500">{label}</dt>
      <dd className="mt-0.5 text-cocoa-800">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display-2 text-2xl text-ink">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-cocoa-700">{children}</div>
    </section>
  );
}
