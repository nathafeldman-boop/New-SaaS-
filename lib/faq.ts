// Source unique des questions/réponses : utilisée par le composant FAQ
// ET par les données structurées (FAQPage). Garder les deux synchronisés est
// une exigence de Google pour l'éligibilité aux rich results.

import { siteConfig } from "@/lib/site";

export const faqs: { q: string; a: string }[] = [
  {
    q: "Comment fonctionne le diagnostic par photo ?",
    a: "Tu te prends en photo depuis l'app web. À partir de cette image, on construit une routine adaptée à l'état de tes cheveux, et tu reprends une photo chaque jour pour affiner la suite.",
  },
  {
    q: "Que se passe-t-il après les 30 jours ?",
    a: "Le cycle se termine. Tu peux en relancer un nouveau quand tu veux pour continuer ta progression — rien n'est prélevé automatiquement, c'est toi qui décides.",
  },
  {
    q: "L'essayage de coupes, ça sert à quoi ?",
    a: "À visualiser différentes coupes sur ta propre photo avant de te décider. Tu gardes celle qui te plaît et tu la montres simplement à ton coiffeur, sans avoir à l'expliquer.",
  },
  {
    q: "Faut-il installer une application ?",
    a: `Non. ${siteConfig.name} est une application web, pensée et optimisée pour le mobile. Tu y accèdes depuis ton navigateur, sans rien télécharger.`,
  },
  {
    q: "Mes photos sont-elles privées ?",
    a: "Tes photos servent uniquement à générer ta routine et tes essais de coupes. Elles t'appartiennent.",
  },
];
