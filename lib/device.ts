// ──────────────────────────────────────────────────────────────────────────
//  Détection des navigateurs intégrés (in-app webviews) — TikTok, Instagram…
//  Ces webviews bloquent souvent l'appareil photo (getUserMedia). On invite
//  alors l'utilisateur à ouvrir le site dans son vrai navigateur.
// ──────────────────────────────────────────────────────────────────────────

/** Renvoie le nom de l'app si on est dans son navigateur intégré, sinon null. */
export function detectInAppBrowser(ua?: string): string | null {
  const s =
    ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : "") ?? "";
  const rules: [RegExp, string][] = [
    [/bytedance|musical_ly|tiktok|trill|aweme/i, "TikTok"],
    [/instagram/i, "Instagram"],
    [/FBAN|FBAV|FB_IAB|FBIOS|fb_iab/i, "Facebook"],
    [/messenger/i, "Messenger"],
    [/snapchat/i, "Snapchat"],
    [/pinterest/i, "Pinterest"],
    [/linkedinapp/i, "LinkedIn"],
    [/\bline\//i, "Line"],
  ];
  for (const [re, name] of rules) if (re.test(s)) return name;
  return null;
}

export function isInAppBrowser(ua?: string): boolean {
  return detectInAppBrowser(ua) !== null;
}
