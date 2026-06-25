import { NextResponse } from "next/server";
import { ADMIN_CODE } from "@/lib/admin-metrics";

export const runtime = "nodejs";

/** Vérifie le code d'accès du dashboard et pose un cookie de session. */
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  let code = "";
  try {
    const form = await req.formData();
    code = String(form.get("code") ?? "").trim();
  } catch {}

  if (code === ADMIN_CODE) {
    const res = NextResponse.redirect(`${origin}/admin`, { status: 303 });
    res.cookies.set("cpx_admin", ADMIN_CODE, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });
    return res;
  }

  return NextResponse.redirect(`${origin}/admin?error=1`, { status: 303 });
}
