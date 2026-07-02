// Tests für den Apex↔www-Fallback (W1-F).
//
// Teil 1: wwwFallbackCandidate() — reine Funktion, alle Fallklassen.
// Teil 2: Wiring in scanUrl()/scanSite() — dns.lookup wird gemockt, damit der
// Versuch deterministisch in assertPublicHttpUrl (VOR jedem Browser-Launch)
// scheitert. An der Reihenfolge der aufgelösten Hosts ist ablesbar, dass
// 1. genau EIN Fallback-Versuch läuft (kein Ping-Pong) und
// 2. der SSRF-Guard (assertPublicHttpUrl) für den NEUEN Host frisch ausgeführt
//    wird — dieselbe Objekt-Referenz von node:dns/promises wie in url-guard.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import dns from 'node:dns/promises';
import { wwwFallbackCandidate } from '../lib/www-fallback.js';
import { scanUrl, scanSite } from '../lib/scan.js';

// ---------------------------------------------------------------- Teil 1: Helper

test('Fallback: dns-Fehler + Apex → www-Variante (Pfad/Query bleiben)', () => {
  assert.equal(
    wwwFallbackCandidate('https://beispiel.de/pfad?x=1', 'net::ERR_NAME_NOT_RESOLVED'),
    'https://www.beispiel.de/pfad?x=1'
  );
  // Auch ohne Schema (scanUrl ergänzt https:// — der Helper genauso).
  assert.equal(
    wwwFallbackCandidate('beispiel.de', 'getaddrinfo ENOTFOUND beispiel.de'),
    'https://www.beispiel.de/'
  );
});

test('Fallback: http-status-404 + www-Host → Apex-Variante', () => {
  assert.equal(
    wwwFallbackCandidate('https://www.beispiel.de/', 'http-status-404'),
    'https://beispiel.de/'
  );
  // www vor Subdomain: nur das www-Präfix fällt weg.
  assert.equal(
    wwwFallbackCandidate('https://www.shop.beispiel.de/', 'http-status-404'),
    'https://shop.beispiel.de/'
  );
});

test('Fallback: Port und http-Schema bleiben erhalten', () => {
  assert.equal(
    wwwFallbackCandidate('http://beispiel.de:8443/a', 'net::ERR_CONNECTION_REFUSED'),
    'http://www.beispiel.de:8443/a'
  );
});

test('Fallback: Subdomain (nicht www) → null', () => {
  assert.equal(wwwFallbackCandidate('https://shop.beispiel.de/', 'net::ERR_NAME_NOT_RESOLVED'), null);
});

test('Fallback: IP-Adressen → null (v4 + v6)', () => {
  assert.equal(wwwFallbackCandidate('https://93.184.216.34/', 'net::ERR_CONNECTION_REFUSED'), null);
  assert.equal(wwwFallbackCandidate('https://[2001:db8::1]/', 'net::ERR_CONNECTION_REFUSED'), null);
});

test('Fallback: einteilige Hosts und www.<TLD> → null', () => {
  assert.equal(wwwFallbackCandidate('https://localhost/', 'net::ERR_CONNECTION_REFUSED'), null);
  // www. abstreifen ergäbe „de" — kein Hostname mit Punkt → kein Kandidat.
  assert.equal(wwwFallbackCandidate('https://www.de/', 'http-status-404'), null);
});

test('Fallback: andere Fehlerklassen → null (timeout/tls/blocked/unknown)', () => {
  const url = 'https://beispiel.de/';
  assert.equal(wwwFallbackCandidate(url, 'page.goto: Timeout 30000ms exceeded.'), null, 'timeout');
  assert.equal(wwwFallbackCandidate(url, 'net::ERR_CERT_AUTHORITY_INVALID'), null, 'tls');
  assert.equal(wwwFallbackCandidate(url, 'http-status-403'), null, 'blocked');
  assert.equal(wwwFallbackCandidate(url, 'irgendwas völlig anderes'), null, 'unknown');
  assert.equal(wwwFallbackCandidate(url, ''), null, 'leer');
});

test('Fallback: kaputte URL → null (kein Throw)', () => {
  assert.equal(wwwFallbackCandidate('http://', 'net::ERR_NAME_NOT_RESOLVED'), null);
});

// ------------------------------------------------------- Teil 2: Wiring scan.js

// dns.lookup so mocken, dass JEDE Auflösung scheitert (→ assertPublicHttpUrl
// wirft „DNS-Auflösung fehlgeschlagen", Klasse dns) und die angefragten Hosts
// protokolliert werden. Der Scan scheitert damit VOR dem Chromium-Launch.
async function withFailingDns(fn) {
  const lookups = [];
  const orig = dns.lookup;
  dns.lookup = async (host) => {
    lookups.push(host);
    throw new Error(`getaddrinfo ENOTFOUND ${host}`);
  };
  try {
    await fn(lookups);
  } finally {
    dns.lookup = orig;
  }
}

test('scanUrl-Wiring: toter Apex → genau EIN www-Versuch, Originalfehler', async () => {
  await withFailingDns(async (lookups) => {
    await assert.rejects(
      () => scanUrl('https://tot-beispiel.de/seite'),
      /DNS-Auflösung fehlgeschlagen/
    );
    // Erst Original-Host, dann GENAU EIN Fallback-Host — kein dritter Versuch
    // (Ping-Pong-Guard). Beide Auflösungen laufen durch assertPublicHttpUrl,
    // d. h. der SSRF-Check läuft für den neuen Host frisch.
    assert.deepEqual(lookups, ['tot-beispiel.de', 'www.tot-beispiel.de']);
  });
});

test('scanUrl-Wiring: toter www-Host → genau EIN Apex-Versuch', async () => {
  await withFailingDns(async (lookups) => {
    await assert.rejects(() => scanUrl('https://www.tot-beispiel.de/'));
    assert.deepEqual(lookups, ['www.tot-beispiel.de', 'tot-beispiel.de']);
  });
});

test('scanUrl-Wiring: Subdomain ohne Kandidat → kein zweiter Versuch', async () => {
  await withFailingDns(async (lookups) => {
    await assert.rejects(() => scanUrl('https://shop.tot-beispiel.de/'));
    assert.deepEqual(lookups, ['shop.tot-beispiel.de']);
  });
});

test('scanUrl-Wiring: _noFallback unterbindet den Fallback', async () => {
  await withFailingDns(async (lookups) => {
    await assert.rejects(() => scanUrl('https://tot-beispiel.de/', { _noFallback: true }));
    assert.deepEqual(lookups, ['tot-beispiel.de']);
  });
});

test('scanSite-Wiring: toter Apex → genau EIN www-Versuch, Originalfehler', async () => {
  await withFailingDns(async (lookups) => {
    await assert.rejects(
      () => scanSite('https://tot-beispiel.de/', { maxPages: 3 }),
      /DNS-Auflösung fehlgeschlagen/
    );
    assert.deepEqual(lookups, ['tot-beispiel.de', 'www.tot-beispiel.de']);
  });
});
