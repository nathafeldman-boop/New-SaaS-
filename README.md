# Crinea — Landing page (V1)

> **Crinea** est un nom provisoire. Change-le (et tous les textes) dans `lib/site.ts`.

SaaS de routine capillaire : tu te prends en photo, tu reçois une routine
personnalisée sur **30 jours**, et tu peux **essayer des coupes** avant de
passer chez le coiffeur. Cette landing page est la première pièce du projet.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — palette marron clair / crème, typo serif *Fraunces*
- **Framer Motion** — animations au scroll, maquette animée, accordéon FAQ
- Illustrations **SVG sur-mesure** (`components/Illustrations.tsx`)

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```

## Personnaliser

| Quoi | Où |
| --- | --- |
| Nom du produit, tagline, description | `lib/site.ts` → `siteConfig.name` |
| Tarif (montant, période) | `lib/site.ts` → `siteConfig.price` |
| Menu de navigation | `lib/site.ts` → `siteConfig.nav` |
| Couleurs / typo | `tailwind.config.ts` |
| Sections de la page | `app/page.tsx` + `components/` |

## Structure

```
app/
  layout.tsx        # polices, métadonnées
  page.tsx          # assemblage des sections
  globals.css       # styles de base, grain, utilitaires
components/
  Nav, Hero, Marquee, HowItWorks, Features,
  Pricing, Faq, FinalCta, Footer, Reveal, Illustrations
lib/site.ts         # configuration centrale (nom, textes, tarif)
```

## Le funnel `/scan`

Parcours complet : `Landing → scan → guide photo → prise/import photo →
analyse → avant/après → paywall → paiement (démo) → 15 coupes (ou garder la
sienne) → génération → routine 30 jours`.

- **Analyse** (vision Pixtral) et **routine + coupes** (texte) appellent l'API
  **Mistral** côté serveur via `app/api/{analyze,cuts,routine}`.
- La clé est lue **uniquement côté serveur** (`MISTRAL_API_KEY`). Configure-la :

  ```bash
  cp .env.example .env.local   # puis renseigne MISTRAL_API_KEY
  ```

- Si la clé est absente **ou** l'API injoignable, les routes renvoient un
  **contenu d'exemple clairement étiqueté** (« Exemple — branche ta clé
  Mistral »), pour que le flow reste testable de bout en bout.
- ⚠️ Mistral ne **génère pas d'images** : le montage avant/après et les visuels
  de coupes sont des **placeholders branchables** (slider sur ta photo,
  planche de coupes). Pour de vrais rendus, brancher un modèle image (FLUX, …)
  dans une route dédiée.
- Le **paiement** est un **checkout de démo** (aucun prélèvement) — Stripe à
  brancher ensuite.

## Version `index.html` autonome

`index.html` est une version **un seul fichier** (CSS + JS embarqués, images en
base64) — ouvrable directement dans le navigateur. Ne l'édite pas à la main :
modifie le template `index.html.tmpl`, place tes images dans `public/results/`,
puis régénère :

```bash
python3 scripts/build-index.py
```

Le carrousel de la hero utilise les visuels « AVANT / APRÈS » de
`public/results/result-*.jpg`, et la section coupes affiche
`public/results/hairstyles.jpg`. Pour changer ces images, remplace les fichiers
(même nom) et relance le script.

## Notes

- Aucun faux témoignage ni faux chiffre : tout le contenu décrit le produit, rien d'inventé.
- Le tarif affiché est **indicatif** (`siteConfig.price.note`) — à fixer avant le lancement.
- Pensé **mobile-first** : c'est une web app, sans installation.
