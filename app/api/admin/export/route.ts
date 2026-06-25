import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_CODE, getSignups } from "@/lib/admin-metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Export CSV des inscrits (emails). Protégé par le cookie du dashboard. */
export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("cpx_admin")?.value !== ADMIN_CODE) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const signups = await getSignups();
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [
    ["email", "inscrit_le", "statut"],
    ...signups.map((s) => [
      s.email,
      s.created_at,
      s.active ? (s.via === "code" ? "actif (code)" : "actif (payant)") : "inactif",
    ]),
  ];
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inscrits-capilatyx.csv"',
    },
  });
}
