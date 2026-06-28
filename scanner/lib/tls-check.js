// Ehrliche TLS-Offenlegung im bezahlten Report.
//
// Warum: Läuft der bezahlte Scan mit Lenient-TLS (SCAN_PAID_LENIENT_TLS=true), hat er
// einen evtl. Zertifikatsfehler der Zielseite BEWUSST ignoriert, um trotzdem ein
// Ergebnis zu liefern. Damit der verkaufte Report diesen realen Mangel nicht verschweigt,
// prüfen wir das Zertifikat SEPARAT und weisen es als niedrigschwelligen technischen
// Hinweis aus — NICHT als WCAG-Verstoß (kein Score-Abzug, nicht in der Erklärung).
//
// Reine, defensive Probe: jeder Fehler der Probe selbst → null (kein Hinweis, Scan unberührt).
// SSRF-sicher: verbindet sich auf die per assertPublicHttpUrl geprüfte öffentliche IP
// (servername=hostname für SNI), kein zweiter ungeprüfter DNS-Hop.

import tls from 'node:tls';
import net from 'node:net';
import { assertPublicHttpUrl } from './url-guard.js';

// OpenSSL-Fehlercode → deutscher Klartext. Reine Funktion (testbar).
export function describeTlsReason(reason = '') {
  const r = String(reason).toUpperCase();
  if (r.includes('ALTNAME') || r.includes('HOSTNAME'))
    return 'Das Zertifikat ist nicht für diese Domain ausgestellt (Hostname stimmt nicht überein).';
  if (r.includes('NOT_YET_VALID'))
    return 'Das Zertifikat ist noch nicht gültig (Gültigkeitsbeginn liegt in der Zukunft).';
  if (r.includes('EXPIRED'))
    return 'Das Zertifikat ist abgelaufen.';
  if (r.includes('SELF_SIGNED') || r.includes('SELF SIGNED'))
    return 'Das Zertifikat ist selbst-signiert (nicht von einer anerkannten Stelle ausgestellt).';
  if (r.includes('UNABLE_TO_GET_ISSUER') || r.includes('UNABLE_TO_VERIFY') || r.includes('LEAF_SIGNATURE'))
    return 'Die Zertifikatskette ist unvollständig (ein Zwischenzertifikat fehlt).';
  return 'Das TLS-Zertifikat der Seite konnte nicht vollständig verifiziert werden.';
}

// Baut den Report-Hinweis (reine Funktion, testbar).
export function buildTlsNotice(host, reason) {
  return {
    title: 'TLS-Zertifikat der Website fehlerhaft',
    severity: 'moderate',
    text:
      `${describeTlsReason(reason)} Betroffener Host: ${host}. Besucher-Browser zeigen ` +
      `unter Umständen eine Sicherheitswarnung, was Vertrauen und Auffindbarkeit beeinträchtigen kann. ` +
      `Dies ist eine technische Beobachtung am Rande der Barrierefreiheitsprüfung — keine WCAG-Barriere, ` +
      `keine Konformitätsaussage und keine Rechtsberatung.`
  };
}

// Async-Probe. Gibt einen Hinweis zurück, wenn das Zertifikat NICHT sauber verifiziert,
// sonst null. Wirft nie (defensiv).
export async function tlsCertNotice(url, { timeoutMs = 8000 } = {}) {
  let u;
  try {
    u = new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null; // nur HTTPS hat ein Zertifikat
  let safe;
  try {
    safe = await assertPublicHttpUrl(u.toString());
  } catch {
    return null; // SSRF-Guard/Resolve-Fehler → keine Probe
  }
  const host = u.hostname;
  const ip = (safe.addresses || []).find((a) => net.isIP(a)) || host;
  const port = u.port ? Number(u.port) : 443;

  return await new Promise((resolve) => {
    let settled = false;
    let socket;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      try { socket && socket.destroy(); } catch { /* ignore */ }
      resolve(val);
    };
    try {
      socket = tls.connect(
        { host: ip, servername: host, port, rejectUnauthorized: false, timeout: timeoutMs },
        () => {
          // Verbunden. authorized=false + authorizationError = Zertifikat ist nicht sauber.
          if (socket.authorized) return finish(null);
          finish(buildTlsNotice(host, socket.authorizationError || 'UNTRUSTED'));
        }
      );
      socket.on('error', () => finish(null));   // Probe-Fehler ignorieren (kein Cert-Verdikt)
      socket.on('timeout', () => finish(null));
    } catch {
      finish(null);
    }
  });
}
