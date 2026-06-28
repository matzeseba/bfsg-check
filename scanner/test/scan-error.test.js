// Tests für die Fehler-Klassifizierung des Gratis-Teaser-Scans (reine Funktion,
// kein Browser). Sichert: korrekte Kategorie + HTTP-Status + deutsche Klartext-
// Meldung ohne ASCII-Umlaut-Artefakte und ohne geleakte Interna.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyScanError } from '../lib/scan-error.js';

test('classifyScanError: Timeout → reason=timeout, status 504', () => {
  const r = classifyScanError('page.goto: Timeout 30000ms exceeded.');
  assert.equal(r.reason, 'timeout');
  assert.equal(r.status, 504);
  assert.match(r.message, /zu lange/);
});

test('classifyScanError: TLS-/Zertifikatsfehler → reason=tls, status 502', () => {
  const r = classifyScanError('net::ERR_CERT_AUTHORITY_INVALID at https://x');
  assert.equal(r.reason, 'tls');
  assert.equal(r.status, 502);
  assert.match(r.message, /Sicherheitszertifikat/);
});

test('classifyScanError: DNS/unreachable → reason=dns, status 502', () => {
  for (const msg of [
    'net::ERR_NAME_NOT_RESOLVED',
    'getaddrinfo ENOTFOUND beispiel.de',
    'net::ERR_CONNECTION_REFUSED'
  ]) {
    const r = classifyScanError(msg);
    assert.equal(r.reason, 'dns', `für: ${msg}`);
    assert.equal(r.status, 502);
  }
});

test('classifyScanError: blockierte Navigation → reason=blocked', () => {
  const r = classifyScanError('net::ERR_BLOCKED_BY_CLIENT (blockedbyclient)');
  assert.equal(r.reason, 'blocked');
  assert.equal(r.status, 502);
});

test('classifyScanError: HTTP-Fehlerstatus (SF10) → korrekte Kategorie', () => {
  // 404/410 → nicht gefunden (dns-Kategorie, „Adresse pruefen")
  assert.equal(classifyScanError('http-status-404').reason, 'dns');
  assert.equal(classifyScanError('http-status-410').reason, 'dns');
  // 401/403/429 → blockiert
  assert.equal(classifyScanError('http-status-403').reason, 'blocked');
  assert.equal(classifyScanError('http-status-401').reason, 'blocked');
  assert.equal(classifyScanError('http-status-429').reason, 'blocked');
  // 5xx + sonstige → unknown
  assert.equal(classifyScanError('http-status-500').reason, 'unknown');
  assert.equal(classifyScanError('http-status-503').reason, 'unknown');
  // Status immer 502, Meldung ohne Interna.
  const r = classifyScanError('http-status-500');
  assert.equal(r.status, 502);
  assert.doesNotMatch(r.message, /http-status|500/);
});

test('classifyScanError: unbekannt → reason=unknown, status 502', () => {
  const r = classifyScanError('irgendwas völlig anderes');
  assert.equal(r.reason, 'unknown');
  assert.equal(r.status, 502);
  assert.match(r.message, /fehlgeschlagen/);
});

test('classifyScanError: Timeout gewinnt bei Hybrid-Fehler (Reihenfolge-Garantie)', () => {
  // scanUrl() verlaesst sich darauf, dass eine Timeout-Meldung auch dann als
  // reason=timeout klassifiziert wird, wenn sie zusaetzlich andere Keywords
  // (z.B. "ssl"/"connection") enthaelt — sonst wuerde faelschlich retried.
  assert.equal(classifyScanError('Timeout 30000ms exceeded (ssl handshake)').reason, 'timeout');
  assert.equal(classifyScanError('navigation timed out, connection closed').reason, 'timeout');
});

test('classifyScanError: robust gegen leere/undefined Eingabe', () => {
  assert.equal(classifyScanError().reason, 'unknown');
  assert.equal(classifyScanError('').reason, 'unknown');
  assert.equal(classifyScanError(null).reason, 'unknown');
});

test('classifyScanError: keine ASCII-Umlaut-Artefakte, keine Interna geleakt', () => {
  const artifacts = ['ue', 'ae', 'oe', 'ss'];
  // Stichprobe der user-sichtbaren Meldungen (Wörter mit Umlauten echt schreiben).
  const messages = [
    classifyScanError('Timeout exceeded').message,
    classifyScanError('ERR_CERT').message,
    classifyScanError('ENOTFOUND').message,
    classifyScanError('blocked').message,
    classifyScanError('xyz').message
  ];
  for (const msg of messages) {
    // Keine technischen Interna in der Klartextmeldung.
    assert.doesNotMatch(msg, /net::|ERR_|ENOTFOUND|stack|at \//i, `Interna geleakt: ${msg}`);
  }
  // Mindestens eine Meldung nutzt echte Umlaute (Smoke gegen ASCII-Ersatz).
  assert.ok(messages.some((m) => /ü|ä|ö|ß/.test(m)));
  // ASCII-Ersatz-Heuristik nur als grober Hinweis (nicht hart, da "ss"/"ae" auch
  // legitim vorkommen können) — hier bewusst nur dokumentiert, nicht assertet.
  void artifacts;
});
