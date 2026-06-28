// Tests für die TLS-Offenlegung (reine Funktionen, keine echte TLS-Verbindung).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeTlsReason, buildTlsNotice } from '../lib/tls-check.js';

test('describeTlsReason: Hostname-Mismatch', () => {
  const t = describeTlsReason('ERR_TLS_CERT_ALTNAME_INVALID');
  assert.match(t, /nicht für diese Domain/);
  assert.match(t, /Hostname/);
});

test('describeTlsReason: abgelaufen', () => {
  assert.match(describeTlsReason('CERT_HAS_EXPIRED'), /abgelaufen/);
});

test('describeTlsReason: selbst-signiert', () => {
  assert.match(describeTlsReason('DEPTH_ZERO_SELF_SIGNED_CERT'), /selbst-signiert/);
  assert.match(describeTlsReason('SELF_SIGNED_CERT_IN_CHAIN'), /selbst-signiert/);
});

test('describeTlsReason: unvollständige Kette', () => {
  assert.match(describeTlsReason('UNABLE_TO_VERIFY_LEAF_SIGNATURE'), /unvollständig/);
  assert.match(describeTlsReason('UNABLE_TO_GET_ISSUER_CERT_LOCALLY'), /unvollständig/);
});

test('describeTlsReason: unbekannt → generischer Klartext', () => {
  const t = describeTlsReason('SOMETHING_WEIRD');
  assert.match(t, /nicht vollständig verifiziert/);
});

test('describeTlsReason: robust gegen leere Eingabe', () => {
  assert.equal(typeof describeTlsReason(), 'string');
  assert.equal(typeof describeTlsReason(''), 'string');
});

test('buildTlsNotice: Form + Pflichtsprache + Host, KEIN verbotener Claim', () => {
  const n = buildTlsNotice('www.beispiel.de', 'CERT_HAS_EXPIRED');
  assert.equal(n.title, 'TLS-Zertifikat der Website fehlerhaft');
  assert.equal(n.severity, 'moderate');
  assert.match(n.text, /abgelaufen/);
  assert.match(n.text, /www\.beispiel\.de/);
  // Pflichtsprache + Entschärfung.
  assert.match(n.text, /keine Rechtsberatung/i);
  assert.match(n.text, /keine WCAG-Barriere/);
  // Keine verbotenen Claims (CLAUDE.md-Compliance).
  assert.doesNotMatch(n.text, /BFSG-konform/i);
  assert.doesNotMatch(n.text, /rechtssicher/i);
  assert.doesNotMatch(n.text, /\bgarantiert\b/i);
  // Echte Umlaute statt ASCII-Ersatz.
  assert.doesNotMatch(n.text, /Pruefung|Konformitaet|beeintraecht/);
});
