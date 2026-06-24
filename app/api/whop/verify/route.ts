import { NextResponse } from "next/server";
import { hasWhopKey, validateLicense } from "@/lib/whop";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(req: Request) {
  let license: string | undefined;
  try {
    ({ license } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }
  if (!license || license.trim().length < 4) {
    return NextResponse.json({ ok: false, error: "Clé de licence manquante" }, { status: 400 });
  }

  if (!hasWhopKey()) {
    return NextResponse.json({ ok: false, reason: "no-key" });
  }

  try {
    const valid = await validateLicense(license);
    return NextResponse.json({ ok: true, valid });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : "Erreur Whop",
    });
  }
}
