// SSRF-Schutz: erlaubt nur öffentliche http(s)-URLs. Blockt private/interne
// IP-Bereiche (localhost, RFC1918, link-local inkl. Cloud-Metadaten 169.254.169.254,
// IPv6-Loopback/ULA/link-local). Löst den Hostnamen per DNS auf und prüft JEDE
// zurückgegebene Adresse — gegen DNS-Rebinding sollte zusätzlich die geprüfte IP
// an den Browser gepinnt werden (siehe Hinweis in scan.js).

import dns from 'node:dns/promises';
import net from 'node:net';

function ipv4IsPrivate(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  if (a === 0) return true;                         // 0.0.0.0/8
  if (a === 10) return true;                        // 10/8
  if (a === 127) return true;                       // loopback
  if (a === 169 && b === 254) return true;          // link-local + Cloud-Metadaten
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true;          // 192.168/16
  if (a === 100 && b >= 64 && b <= 127) return true;// CGNAT 100.64/10
  if (a === 192 && b === 0 && p[2] === 0) return true; // 192.0.0/24
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true;                        // multicast/reserved/broadcast
  return false;
}

function ipv6IsPrivate(ip) {
  const x = ip.toLowerCase();
  if (x === '::1' || x === '::') return true;       // loopback/unspecified
  if (x.startsWith('fe80')) return true;            // link-local
  if (x.startsWith('fc') || x.startsWith('fd')) return true; // unique local fc00::/7
  // IPv4-mapped (::ffff:a.b.c.d) auf IPv4-Regeln zurückführen
  const m = x.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (m) return ipv4IsPrivate(m[1]);
  return false;
}

function isBlockedIp(ip) {
  const kind = net.isIP(ip);
  if (kind === 4) return ipv4IsPrivate(ip);
  if (kind === 6) return ipv6IsPrivate(ip);
  return true; // unbekannt = blockieren
}

// DNS-Rebinding-Schutz: vor jedem page.goto() erneut DNS auflösen und mit
// der ursprünglich verifizierten Adressliste vergleichen. Bei Drift → throw.
// Override per env DNS_PIN_STRICT=false (Notbremse, falls Multi-A-Hosts wie
// Cloudflare/CDN-Pools legitime Rotation machen). Default: strict.
export async function verifyNoDnsRebinding(urlString, expectedAddresses) {
  // DNS_PIN_STRICT=false lockert NUR die Set-Drift-Prüfung (CDN-Rotation-Notbremse).
  // Der Private-IP-Check läuft IMMER — eine interne Adresse ist nie legitim, egal
  // wie der Pin-Modus steht (sonst hebelt die Notbremse den SSRF-Schutz aus).
  const strict = process.env.DNS_PIN_STRICT !== 'false';
  let host;
  try { host = new URL(urlString).hostname; } catch { return; }
  if (net.isIP(host)) return; // direkte IP, kein DNS
  let records;
  try {
    records = await dns.lookup(host, { all: true });
  } catch {
    throw new Error('DNS-Rebinding-Check: zweite Auflösung fehlgeschlagen');
  }
  // IMMER: jede aktuelle Adresse muss public sein (sonst Angreifer-/Rebinding-IP).
  for (const r of records) {
    if (isBlockedIp(r.address)) throw new Error('DNS-Rebinding-Check: private Adresse in 2. Auflösung');
  }
  if (!strict) return; // Set-Drift-Check übersprungen (CDN-Rotation), Private-Check lief.
  if (!Array.isArray(expectedAddresses) || expectedAddresses.length === 0) return;
  const current = new Set(records.map((r) => r.address));
  // Wir verlangen NUR, dass mindestens eine der erwarteten Adressen noch dabei ist.
  // Strikter wäre: exakte Set-Gleichheit. CDN-Hosts (Cloudflare) rotieren aber
  // legitim — exakte Gleichheit würde False-Positives erzeugen.
  const intersect = expectedAddresses.some((a) => current.has(a));
  if (!intersect) {
    throw new Error('DNS-Rebinding erkannt: Host ' + host + ' hat zwischen Check und Load die IP geändert');
  }
}

// SSRF-Defense-in-Depth für den Headless-Browser: validiert JEDE Top-Level-
// Dokument-/Subframe-Navigation (inkl. der durch 30x-Redirects ausgelösten
// Folge-Navigationen) gegen die IP-Blockliste und bricht interne Ziele ab.
// Schließt die Lücke, dass page.goto() Redirects intern folgt, ohne dass
// assertPublicHttpUrl pro Hop greift. Hinweis: vollständige Absicherung erfordert
// zusätzlich eine Netz-Egress-Policy/IP-pinnenden Proxy auf dem Host (Pen-Test).
export async function installSsrfGuard(page) {
  const verdict = new Map(); // host -> 'ok' | 'blocked'
  await page.route('**/*', async (route) => {
    const req = route.request();
    const type = req.resourceType();
    // Nur Navigationen sind der relevante SSRF-Redirect-Vektor; Subressourcen
    // (Bilder/CSS/Fonts) durchlassen, um die DNS-Last pro Seite zu begrenzen.
    if (type !== 'document' && type !== 'sub_frame') return route.continue();
    let host;
    try { host = new URL(req.url()).hostname; } catch { return route.continue(); }
    const cached = verdict.get(host);
    if (cached === 'ok') return route.continue();
    if (cached === 'blocked') return route.abort('blockedbyclient');
    try {
      await assertPublicHttpUrl(req.url()); // wirft bei privater/interner IP
      verdict.set(host, 'ok');
      return route.continue();
    } catch {
      verdict.set(host, 'blocked');
      return route.abort('blockedbyclient');
    }
  });
}

// Wirft bei unsicheren URLs. Gibt bei Erfolg { url, addresses } zurück.
export async function assertPublicHttpUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error('Ungültige URL');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:')
    throw new Error('Nur http/https erlaubt');
  if (u.username || u.password) throw new Error('Zugangsdaten in der URL sind nicht erlaubt');

  // Direkt als IP angegebene Hosts sofort prüfen.
  const hostIsIp = net.isIP(u.hostname);
  if (hostIsIp) {
    if (isBlockedIp(u.hostname)) throw new Error('Interne/private Adresse blockiert');
    return { url: u.toString(), addresses: [u.hostname] };
  }

  let records;
  try {
    records = await dns.lookup(u.hostname, { all: true });
  } catch {
    throw new Error('DNS-Auflösung fehlgeschlagen');
  }
  if (!records || records.length === 0) throw new Error('Host nicht auflösbar');
  for (const r of records) {
    if (isBlockedIp(r.address)) throw new Error('Interne/private Adresse blockiert');
  }
  return { url: u.toString(), addresses: records.map((r) => r.address) };
}
