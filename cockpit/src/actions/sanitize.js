// R-01: Zentraler Prompt-Arg-Sanitizer.
// Schützt buildPrompt()-Interpolationen vor Prompt-Injection via Steuerzeichen,
// überlangen Strings, Backtick-Sequenzen, eingebetteten Anweisungsblöcken.
//
// Verwendung in registry.js:
//   import { sanitizeArg } from '../actions/sanitize.js';
//   const topic = sanitizeArg(a.topic, 80);

/** Maximale Default-Länge für interpolierte Args (Zeichen). */
const DEFAULT_MAX_LEN = 200;

/**
 * Bereinigt einen einzelnen Prompt-Argument-Wert.
 *
 * Maßnahmen:
 *  1. Nicht-String-Werte werden sicher in Strings konvertiert (null/undefined → '').
 *  2. Länge auf maxLen gekappt.
 *  3. Steuerzeichen (U+0000–U+001F, U+007F) werden entfernt — verhindert
 *     versteckte ANSI-/Escape-Sequenzen in Prompts.
 *  4. Backtick-Sequenzen (``` ... ```) werden entfernt — verhindert
 *     eingebettete Markdown-Codeblöcke, die Claude-Instruktionen enthalten könnten.
 *  5. Doppelte Zeilenumbrüche werden auf maximal einen Umbruch reduziert
 *     (verhindert versteckte "System:"-ähnliche Blöcke durch Leerzeilen).
 *  6. Whitespace am Rand wird getrimmt.
 *
 * @param {unknown} value   Roher Arg-Wert aus dem Request-Body.
 * @param {number}  maxLen  Maximale Länge nach Trim (Standard: 200).
 * @returns {string}        Bereinigter, sicherer String für Prompt-Interpolation.
 */
export function sanitizeArg(value, maxLen = DEFAULT_MAX_LEN) {
  if (value === null || value === undefined) return '';

  // Sicher in String konvertieren (kein JSON.stringify, um Anführungszeichen zu vermeiden)
  let s = typeof value === 'string' ? value : String(value);

  // 1. Länge kappen (vor weiterer Verarbeitung, um DoS durch riesige Strings zu verhindern)
  if (s.length > maxLen * 4) s = s.slice(0, maxLen * 4);

  // 2. Steuerzeichen entfernen (0x00–0x1F außer \n/\r, und 0x7F)
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Backtick-Triple (``` ... ```) entfernen — könnten Anweisungsblöcke verbergen
  s = s.replace(/`{3}[\s\S]*?`{3}/g, '');
  // Einzelne Backtick-Runs auf maximal 2 beschränken
  s = s.replace(/`{3,}/g, '``');

  // 4. Mehrfache Leerzeilen auf eine reduzieren
  s = s.replace(/(\r?\n){3,}/g, '\n\n');

  // 5. Trim und finale Längen-Kappung
  s = s.trim().slice(0, maxLen);

  return s;
}

/**
 * Sanitisiert alle string-wertigen Felder eines args-Objekts auf einmal.
 * Gibt ein neues Objekt zurück (kein Mutate des Originals).
 *
 * @param {Record<string, unknown>} args    Rohe args aus dem Request.
 * @param {Record<string, number>}  limits  Optionale feldspezifische Längen-Limits.
 * @returns {Record<string, unknown>}       Bereinigtes args-Objekt.
 */
export function sanitizeArgs(args = {}, limits = {}) {
  const out = {};
  for (const [k, v] of Object.entries(args)) {
    if (typeof v === 'string') {
      out[k] = sanitizeArg(v, limits[k] ?? DEFAULT_MAX_LEN);
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      out[k] = v; // Zahlen/Booleans passieren unverändert
    } else if (v === null || v === undefined) {
      out[k] = v;
    } else {
      // Objekte/Arrays: JSON → String → sanitize (für unerwartete Typen)
      out[k] = sanitizeArg(JSON.stringify(v), limits[k] ?? DEFAULT_MAX_LEN);
    }
  }
  return out;
}
