// ──────────────────────────────────────────────────────────────────────────
//  Envoi d'emails via Resend (sans SDK) + templates.
// ──────────────────────────────────────────────────────────────────────────

const RESEND_API = "https://api.resend.com/emails";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capilatyx.website";
// ⚠️ Tant que le domaine n'est pas vérifié dans Resend, n'utiliser que
// "onboarding@resend.dev" (et l'envoi n'est possible que vers ta propre adresse).
const FROM = process.env.EMAIL_FROM ?? "Capilatyx <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; reason?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "no-key" };

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    return { ok: false, error: j?.message || `Resend ${res.status}` };
  }
  return { ok: true };
}

function shell(title: string, body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#FBF7F1;padding:32px 16px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;border:1px solid #ECE3D6">
      <div style="font-size:22px;font-weight:700;color:#2A2521;margin-bottom:18px">Capilatyx</div>
      <h1 style="font-size:22px;color:#2A2521;margin:0 0 12px">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#5C5249">${body}</div>
      <a href="${SITE}/espace" style="display:inline-block;margin-top:24px;background:#2A2521;color:#FBF7F1;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:600">Ouvrir mon programme</a>
      <p style="font-size:12px;color:#A89F93;margin-top:24px">Capilatyx — ton coach capillaire IA</p>
    </div>
  </div>`;
}

export function welcomeEmail() {
  return {
    subject: "Bienvenue dans ton Cycle Capilatyx 🌱",
    html: shell(
      "Ton programme commence !",
      `Ton diagnostic est prêt et ton <strong>programme de 30 jours</strong> t'attend.<br><br>
       Chaque jour : une <strong>photo avant</strong>, ta routine, une <strong>photo après</strong>.
       Reviens demain pour débloquer le Jour 2 — c'est la régularité qui fait la différence. 💪`,
    ),
  };
}

export function reminderEmail(day: number) {
  return {
    subject: `Ta photo du Jour ${day} t'attend 📸`,
    html: shell(
      `Jour ${day} — c'est l'heure !`,
      `Tes cheveux progressent jour après jour, mais seulement si tu restes régulier.<br><br>
       Prends ta <strong>photo avant</strong>, fais ta routine du jour, puis ta <strong>photo après</strong>,
       et valide ta journée pour faire monter ton score.`,
    ),
  };
}
