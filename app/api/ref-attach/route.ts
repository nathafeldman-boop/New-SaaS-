import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getAffiliate } from "@/lib/affiliates";

export const runtime = "nodejs";

/**
 * Attache le pseudo affilié (cookie cpx_ref, posé par le lien /?ref=) au
 * profil de l'utilisateur connecté. Appelé après l'inscription — best-effort,
 * n'écrase jamais une attribution existante.
 */
export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)cpx_ref=([^;]+)/);
  const ref = m ? decodeURIComponent(m[1]).toLowerCase().slice(0, 32) : "";
  if (!ref) return new NextResponse(null, { status: 204 });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse(null, { status: 204 });

    // On n'attribue que si l'affilié existe réellement (données propres).
    const affiliate = await getAffiliate(ref);
    if (!affiliate) return new NextResponse(null, { status: 204 });

    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ ref: affiliate.pseudo })
      .eq("id", user.id)
      .is("ref", null);
  } catch {
    // best-effort
  }
  return new NextResponse(null, { status: 204 });
}
