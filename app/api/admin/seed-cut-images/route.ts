import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Coupe (nom en base) -> requête Pexels (anglais, plus de résultats).
const QUERIES: [string, string][] = [
  ["Skin Fade", "man skin fade haircut"],
  ["French Crop", "french crop haircut man"],
  ["Textured Crop", "textured crop hairstyle man"],
  ["Pompadour", "pompadour hairstyle man"],
  ["Quiff", "quiff hairstyle man"],
  ["Undercut", "undercut hairstyle man"],
  ["Slick Back", "slicked back hair man"],
  ["Side Part", "side part haircut man"],
  ["Buzz Cut", "buzz cut man portrait"],
  ["Crew Cut", "short haircut man portrait"],
  ["Caesar Cut", "short fringe haircut man"],
  ["Curtains", "middle part hairstyle man"],
  ["Mid-Length Flow", "long wavy hair man portrait"],
  ["Man Bun", "man bun hairstyle"],
  ["Coupe Afro", "afro hairstyle man portrait"],
  ["Twists", "twist hairstyle man"],
  ["Locks", "dreadlocks man portrait"],
  ["Burst Fade + Boucles", "curly hair fade man"],
];

/**
 * Amorçage des images du catalogue via Pexels (à lancer une fois en prod).
 * Protégé par CRON_SECRET. Met à jour cuts_catalog.image_url.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = new URL(req.url).searchParams.get("secret");
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Définis CRON_SECRET dans Vercel." }, { status: 500 });
  }
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "Ajoute PEXELS_API_KEY dans Vercel." }, { status: 500 });
  }

  const admin = createAdminClient();
  const done: Record<string, string> = {};
  const empty: string[] = [];

  for (const [name, query] of QUERIES) {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query,
      )}&per_page=6&orientation=portrait`;
      const res = await fetch(url, { headers: { Authorization: key } });
      const json = await res.json().catch(() => ({}));
      const photo = json?.photos?.[0];
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
