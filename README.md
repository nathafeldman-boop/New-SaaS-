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
