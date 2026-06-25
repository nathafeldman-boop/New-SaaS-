import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Coupe (nom en base) -> requête Pexels (anglais, ciblée « jeune / moderne »
// pour des portraits plus flatteurs et actuels).
const QUERIES: [string, string][] = [
  ["Skin Fade", "young man skin fade haircut studio portrait"],
  ["French Crop", "young man french crop haircut fashion"],
  ["Textured Crop", "young man textured crop hairstyle fashion"],
  ["Pompadour", "young man modern pompadour hairstyle"],
  ["Quiff", "young man quiff hairstyle fashion"],
  ["Undercut", "young man undercut hairstyle fashion"],
  ["Slick Back", "young man slicked back hair fashion"],
  ["Side Part", "young man side part haircut fashion"],
  ["Buzz Cut", "young man buzz cut studio portrait"],
  ["Crew Cut", "young man short crew cut portrait"],
  ["Caesar Cut", "young man caesar fringe haircut"],
  ["Curtains", "young man curtain bangs hairstyle"],
  ["Mid-Length Flow", "young man medium length wavy hair portrait"],
  ["Man Bun", "young man bun hairstyle fashion"],
  ["Coupe Afro", "young man afro hairstyle studio portrait"],
  ["Twists", "young man twist hairstyle portrait"],
  ["Locks", "young man dreadlocks studio portrait"],
  ["Burst Fade + Boucles", "young man curly hair fade fashion"],
];

/**
 * Amorçage des images du catalogue via Pexels (à lancer une fois en prod).
 * Protégé par CRON_SECRET. Met à jour cuts_catalog.image_url.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = new URL(req.url).searchParams.get("secret");
  // Le secret n'est exigé que s'il est défini côté serveur.
  if (secret && provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Clé Pexels : variable d'env si présente, sinon clé embarquée (clé gratuite du projet).
  const key =
    process.env.PEXELS_API_KEY ||
    new URL(req.url).searchParams.get("key") ||
    "uDljl1SJLK0iskRUUYS6kTHHJP8MDV8hRDo84jhMOVUU7py2QI9uLri5";

  const admin = createAdminClient();
  const done: Record<string, string> = {};
  const empty: string[] = [];

  for (const [name, query] of QUERIES) {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query,
      )}&per_page=15&orientation=portrait`;
      const res = await fetch(url, { headers: { Authorization: key } });
      const json = await res.json().catch(() => ({}));
      const photos: any[] = Array.isArray(json?.photos) ? json.photos : [];
      // On pioche au hasard parmi les premiers résultats : relancer la route
      // donne ainsi un nouveau jeu de photos (« re-roll » jusqu'à satisfaction).
      const pool = photos.slice(0, 10);
      const photo = pool[Math.floor(Math.random() * pool.length)] ?? photos[0];
      const src: string | undefined = photo?.src?.portrait || photo?.src?.large;
      if (src) {
        await admin.from("cuts_catalog").update({ image_url: src }).eq("name", name);
        done[name] = src;
      } else {
        empty.push(name);
      }
    } catch {
      empty.push(name);
    }
  }

  return NextResponse.json({ ok: true, updated: Object.keys(done).length, empty });
}
