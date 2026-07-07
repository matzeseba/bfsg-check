// Kleine gemeinsame Helfer (Datum, Datei-Existenz, sicheres Lesen). Keine Dependencies.
import fs from 'node:fs/promises';

export function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Lokales Datum als kompakter Schluessel: 20260707 */
export function ymd(d = new Date()) {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

/** Lokales Datum mit Bindestrichen: 2026-07-07 */
export function ymdDash(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Liest eine Datei; gibt bei Fehler den Fallback zurück (kein Throw). */
export async function readFileSafe(p, fallback = '') {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return fallback;
  }
}

/** Prueft, ob ein Datum (ISO oder YYYY-MM-DD) innerhalb der letzten `days` Tage liegt. */
export function withinDays(dateStr, days, now = Date.now()) {
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return false;
  const nowMs = typeof now === 'number' ? now : now.getTime();
  const diff = nowMs - t;
  // Zukunft (kleine Toleranz von 1 Tag) ebenfalls einschliessen, sonst >= 0 .. days
  return diff <= days * 86400000 && diff >= -86400000;
}
