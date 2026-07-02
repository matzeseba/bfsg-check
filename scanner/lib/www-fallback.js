// Apex↔www-Fallback-Kandidat (W1-F): schlägt bei „Seite nicht erreichbar /
// nicht gefunden" die Schwester-URL vor — Apex-Domain → www.-Variante,
// www.-Host → Variante ohne www. Realer Fall: Kunde kauft einen Scan für
// „beispiel.de" (Apex tot/404), erreichbar ist nur „www.beispiel.de".
//
// Reine Funktion (kein IO/Browser) → ohne Playwright testbar.
// SSRF-Hinweis: hier wird NUR der Kandidat-String gebaut. Der Aufrufer
// (scan.js) MUSS die Alternativ-URL durch den kompletten normalen Pfad
// schicken (assertPublicHttpUrl + frischer IP-Pin für den NEUEN Host) —
// niemals gepinnte Adressen des alten Hosts wiederverwenden.

import net from 'node:net';
import { classifyScanError } from './scan-error.js';

// Liefert die alternative URL als String oder null, wenn kein Fallback sinnvoll ist.
export function wwwFallbackCandidate(url, errMessage) {
  // Nur bei „nicht erreichbar/nicht gefunden": classifyScanError bündelt
  // DNS-/Connect-Fehler UND http-status-404/410 unter reason 'dns'.
  // timeout/tls/blocked/unknown → kein Fallback (eine www-Variante hilft dort nicht,
  // ein zweiter voller Versuch würde nur Zeit/Budget verbrennen).
  if (classifyScanError(errMessage).reason !== 'dns') return null;

  let u;
  try {
    u = new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url);
  } catch {
    return null;
  }

  const host = u.hostname;
  // IP-Adressen (v4 direkt, v6 in Klammern) haben keine www-Variante.
  if (net.isIP(host) || host.startsWith('[')) return null;

  if (host.startsWith('www.')) {
    // www.beispiel.de → beispiel.de. Der Rest muss noch ein Hostname mit Punkt
    // sein (schützt vor „www.localhost" → „localhost" u. ä.).
    const stripped = host.slice(4);
    if (!stripped.includes('.')) return null;
    u.hostname = stripped;
  } else if ((host.match(/\./g) || []).length === 1) {
    // Apex-Domain (genau 1 Punkt): beispiel.de → www.beispiel.de.
    u.hostname = 'www.' + host;
  } else {
    // Andere Subdomains (shop.beispiel.de) und einteilige Hosts (localhost):
    // kein sinnvoller Kandidat.
    return null;
  }

  // Schema/Port/Pfad/Query bleiben erhalten — das URL-Objekt ändert nur den Hostname.
  return u.toString();
}
