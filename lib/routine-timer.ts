// ──────────────────────────────────────────────────────────────────────────
//  Minuteur de routine — calcule l'heure de déblocage de la séance suivante.
//
//  Au lieu d'un verrou fixe de 24 h, la séance suivante se débloque à l'heure
//  locale que l'utilisateur a choisie pour faire sa routine (ex. 08:00).
//  Partagé entre le serveur (enforcement) et le client (affichage).
// ──────────────────────────────────────────────────────────────────────────

export const DEFAULT_ROUTINE_TIME = "08:00";

/** Écart minimum entre deux séances, pour éviter deux validations rapprochées. */
const MIN_GAP_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Normalise une chaîne "HH:MM" → { h, m } (valeurs sûres). */
export function parseRoutineTime(t?: string | null): { h: number; m: number } {
  const [hs, ms] = (t || DEFAULT_ROUTINE_TIME).split(":");
  let h = Number(hs);
  let m = Number(ms);
  if (!Number.isFinite(h) || h < 0 || h > 23) h = 8;
  if (!Number.isFinite(m) || m < 0 || m > 59) m = 0;
  return { h, m };
}

/** "8:5" → "08:05". Renvoie null si invalide. */
export function normalizeRoutineTime(t?: string | null): string | null {
  if (!t || !/^\d{1,2}:\d{1,2}$/.test(t)) return null;
  const { h, m } = parseRoutineTime(t);
  const [raw] = t.split(":");
  if (Number(raw) > 23) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Instant (ms epoch) de déblocage de la séance suivante : la prochaine
 * occurrence de l'heure choisie, en heure locale de l'utilisateur, située au
 * moins MIN_GAP_MS après la validation.
 *
 * @param fromMs       instant de validation (ms epoch UTC)
 * @param routineTime  heure locale voulue, "HH:MM"
 * @param tzOffsetMin  décalage local vs UTC en minutes (= -getTimezoneOffset())
 */
export function nextUnlockMs(
  fromMs: number,
  routineTime?: string | null,
  tzOffsetMin = 0,
): number {
  const { h, m } = parseRoutineTime(routineTime);
  const off = tzOffsetMin * 60_000;
  // Composantes de l'horloge murale locale (via les getters UTC d'un instant décalé).
  const local = new Date(fromMs + off);
  // Candidat : aujourd'hui (heure locale) à H:M, reconverti en UTC.
  let target =
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), h, m, 0, 0) - off;
  // Avance d'un jour tant que c'est trop tôt après la validation.
  while (target < fromMs + MIN_GAP_MS) target += DAY_MS;
  return target;
}

/** Décalage local courant vs UTC, en minutes (côté navigateur). */
export function currentTzOffsetMin(): number {
  if (typeof Date === "undefined") return 0;
  return -new Date().getTimezoneOffset();
}

/** Libellé court de l'heure choisie pour l'affichage ("08:00"). */
export function routineTimeLabel(t?: string | null): string {
  const { h, m } = parseRoutineTime(t);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
