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

// Normalisiert eine IPv6-Adresse auf die volle 16-Byte-Form (Array aus 16 Zahlen).
// Behandelt Zero-Compression (::), eingebettetes IPv4 in der letzten Gruppe und
// eine optionale Zone-ID (fe80::1%eth0). Gibt null zurück, wenn nicht parsebar —
// der Aufrufer blockt dann defensiv. Byte-Form erlaubt exakte Präfix-Prüfungen,
// statt fehleranfälliger String-startsWith-Heuristiken (fe90/feb0 rutschten durch).
function ipv6ToBytes(ip) {
  let s = ip.toLowerCase();
  const pct = s.indexOf('%');
  if (pct !== -1) s = s.slice(0, pct); // Zone-ID abschneiden
  if (!s.includes(':')) return null;

  const halves = s.split('::');
  if (halves.length > 2) return null; // '::' darf höchstens einmal vorkommen

  const parseGroups = (part) => {
    if (part === '') return [];
    const groups = part.split(':');
    const bytes = [];
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g.includes('.')) {
        // Eingebettetes IPv4 (nur als letzte Gruppe zulässig) → 4 Bytes.
        if (i !== groups.length - 1) return null;
        const v4 = g.split('.').map(Number);
        if (v4.length !== 4 || v4.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;
        bytes.push(v4[0], v4[1], v4[2], v4[3]);
      } else {
        if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
        const val = parseInt(g, 16);
        bytes.push((val >> 8) & 0xff, val & 0xff);
      }
    }
    return bytes;
  };

  const head = parseGroups(halves[0]);
  if (head === null) return null;
  let bytes;
  if (halves.length === 2) {
    const tail = parseGroups(halves[1]);
    if (tail === null) return null;
    const missing = 16 - head.length - tail.length;
    if (missing < 0) return null;
    bytes = [...head, ...new Array(missing).fill(0), ...tail];
  } else {
    bytes = head;
  }
  if (bytes.length !== 16) return null;
  return bytes;
}

function ipv6IsPrivate(ip) {
  const b = ipv6ToBytes(ip);
  if (!b) return true; // nicht parsebar → blockieren (sichere Default-Annahme)

  if (b.every((x) => x === 0)) return true;                       // :: (unspecified)
  if (b.slice(0, 15).every((x) => x === 0) && b[15] === 1) return true; // ::1 loopback
  if (b[0] === 0xfe && (b[1] & 0xc0) === 0x80) return true;       // fe80::/10 link-local (fe80–febf)
  if ((b[0] & 0xfe) === 0xfc) return true;                        // fc00::/7 unique local (fc/fd)
  if (b[0] === 0x01 && b.slice(1, 8).every((x) => x === 0)) return true; // 100::/64 discard (RFC 6666)

  const embeds = (start) => ipv4IsPrivate(`${b[start]}.${b[start + 1]}.${b[start + 2]}.${b[start + 3]}`);
  // IPv4-mapped ::ffff:0:0/96 (auch Hex-Form ::ffff:7f00:1) → letzte 32 Bit als IPv4 prüfen.
  if (b.slice(0, 10).every((x) => x === 0) && b[10] === 0xff && b[11] === 0xff) return embeds(12);
  // IPv4-translated ::ffff:0:0:0/96 (Bytes 8–9 = ff:ff, Rest davor 0) → letzte 32 Bit als IPv4.
  if (b.slice(0, 8).every((x) => x === 0) && b[8] === 0xff && b[9] === 0xff && b[10] === 0 && b[11] === 0) return embeds(12);
  // 6to4 2002::/16 → eingebettete IPv4 aus Byte 2–5 prüfen.
  if (b[0] === 0x20 && b[1] === 0x02) return embeds(2);
  // NAT64 64:ff9b::/96 → letzte 32 Bit als IPv4 prüfen.
  if (b[0] === 0x00 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b && b.slice(4, 12).every((x) => x === 0)) return embeds(12);

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

// SSRF-Redirect-Pin (Security C1): Chromium soll den geprüften Host NICHT mehr
// frei auflösen dürfen — sonst kann ein 30x-Redirect bzw. DNS-Rebind denselben
// Host nachträglich auf eine interne IP (169.254.169.254 / 127.0.0.1 / RFC1918)
// zeigen lassen. Wir pinnen die bereits verifizierte öffentliche IP fix an den
// Resolver. Gibt das passende Launch-Arg zurück (oder null bei direkter IP /
// fehlender Adresse — dann ist nichts zu pinnen). Ergänzt installSsrfGuard():
// der Pin deckt denselben Host ab, der Route-Guard fängt Redirects auf ANDERE
// (interne) Hosts ab.
export function pinnedHostResolverArg(host, addresses) {
  if (!host || net.isIP(host)) return null; // direkte IP braucht kein Mapping
  const ip = Array.isArray(addresses) ? addresses.find((a) => net.isIP(a)) : null;
  if (!ip) return null;
  // Quotes/Leerzeichen im Host wären ungültig — defensiv ablehnen statt Arg zu brechen.
  if (/[\s,"']/.test(host)) return null;
  return `--host-resolver-rules=MAP ${host} ${ip}`;
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
