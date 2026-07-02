// Config-/Flag-Tests (reine Funktionen, kein Browser/IO):
// - paidLenientTls (MF1): bezahlter Scan-Pfad ist NUR über SCAN_PAID_LENIENT_TLS
//   tolerant, KEIN stiller Fallback auf das Teaser-Flag.
// - invoiceConfigStatus (MF3/SF6): meldet fehlende §14-/§34a-Pflichtangaben.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paidLenientTls, PKG_CONFIG } from '../lib/fulfill.js';
import { invoiceConfigStatus } from '../lib/invoice.js';
import { AXE_TAGS } from '../lib/scan.js';

test('paidLenientTls (MF1): Default false', () => {
  assert.equal(paidLenientTls({}), false);
});

test('paidLenientTls (MF1): nur SCAN_PAID_LENIENT_TLS=true aktiviert', () => {
  assert.equal(paidLenientTls({ SCAN_PAID_LENIENT_TLS: 'true' }), true);
  assert.equal(paidLenientTls({ SCAN_PAID_LENIENT_TLS: 'false' }), false);
  assert.equal(paidLenientTls({ SCAN_PAID_LENIENT_TLS: '1' }), false); // nur exakt 'true'
});

test('paidLenientTls (MF1): KEIN stiller Fallback auf das Teaser-Flag', () => {
  // Genau der Kern der Owner-Entscheidung: ein lenienter Gratis-Teaser darf den
  // bezahlten Pfad NICHT automatisch tolerant machen (verkaufter Report bleibt strikt,
  // bis der Owner SCAN_PAID_LENIENT_TLS bewusst setzt).
  assert.equal(paidLenientTls({ SCAN_TEASER_LENIENT_TLS: 'true' }), false);
});

test('invoiceConfigStatus (MF3/SF6): vollständig gesetzte Pflichtangaben → ok', () => {
  const r = invoiceConfigStatus({ INVOICE_FROM_ADDRESS: 'Lange Straße 20, 27449 Kutenholz', INVOICE_TAX_NUMBER: '12/345/67890' });
  assert.equal(r.ok, true);
  assert.equal(r.missing.length, 0);
});

test('invoiceConfigStatus (MF3): fehlende Anbieter-Anschrift wird gemeldet', () => {
  const r = invoiceConfigStatus({ INVOICE_TAX_NUMBER: '12/345/67890' });
  assert.equal(r.ok, false);
  assert.ok(r.missing.includes('INVOICE_FROM_ADDRESS'));
});

test('invoiceConfigStatus (SF6): fehlende Steuer-/USt-IdNr. wird gemeldet, USt-IdNr. reicht', () => {
  const missingTax = invoiceConfigStatus({ INVOICE_FROM_ADDRESS: 'X 1, 12345 Y' });
  assert.equal(missingTax.ok, false);
  assert.ok(missingTax.missing.includes('INVOICE_USTID|INVOICE_TAX_NUMBER'));
  // USt-IdNr. allein genügt (Alternative zur Steuernummer).
  const ustOnly = invoiceConfigStatus({ INVOICE_FROM_ADDRESS: 'X 1, 12345 Y', INVOICE_USTID: 'DE123456789' });
  assert.equal(ustOnly.ok, true);
});

// --- PR3: tieferer Bezahl-Scan -----------------------------------------------
test('AXE_TAGS: enthält WCAG 2.2 AA und keine experimentellen Regeln', () => {
  assert.ok(AXE_TAGS.includes('wcag22aa'), 'wcag22aa muss aktiv sein');
  // Basis-Sätze bleiben erhalten (Regressionsschutz).
  for (const t of ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']) {
    assert.ok(AXE_TAGS.includes(t), `${t} fehlt`);
  }
  // 'experimental' bewusst NICHT (zu viel Rauschen).
  assert.ok(!AXE_TAGS.includes('experimental'), 'experimental darf nicht aktiv sein');
});

test('PKG_CONFIG (PR3): tiefere maxPages, hart auf ≤ 50 gedeckelt', () => {
  // basis wurde vertieft (5→8), profi (25→40); scanSite cappt zusätzlich auf 50.
  assert.equal(PKG_CONFIG.basis.maxPages, 8);
  assert.equal(PKG_CONFIG.profi.maxPages, 40);
  for (const [name, cfg] of Object.entries(PKG_CONFIG)) {
    assert.ok(cfg.maxPages >= 1 && cfg.maxPages <= 50, `${name}: maxPages ${cfg.maxPages} außerhalb 1..50`);
  }
});

test('PKG_CONFIG (PR3): bezahlte BFSG-Pakete tragen Tiefen-Parameter', () => {
  for (const name of ['basis', 'profi', 'abo', 'abo-jahr']) {
    const cfg = PKG_CONFIG[name];
    assert.equal(cfg.settleMs, 12000, `${name}: settleMs`);
    assert.equal(cfg.perPageTimeout, 45000, `${name}: perPageTimeout`);
  }
});

// --- W1-G: Abo-Jahresoption ---------------------------------------------------
test("PKG_CONFIG 'abo-jahr': exakt dieselbe Leistung wie 'abo' (kein basis-Fallback)", () => {
  const y = PKG_CONFIG['abo-jahr'];
  assert.ok(y, "'abo-jahr' fehlt in PKG_CONFIG — Jahres-Abo-Kunden bekämen den basis-Report");
  // Kritische Einzel-Asserts (sprechende Fehlermeldung bei Drift)…
  assert.equal(y.emailKind, 'recheck', 'abo-jahr: emailKind muss recheck sein');
  assert.equal(y.maxPages, 25, 'abo-jahr: maxPages muss 25 sein');
  assert.equal(y.withStatement, true, 'abo-jahr: withStatement muss true sein');
  // …plus Voll-Vergleich: Jahres-Abo darf sich in KEINEM Feld vom Monats-Abo unterscheiden.
  assert.deepEqual(y, PKG_CONFIG.abo, "'abo-jahr' muss identisch zu 'abo' konfiguriert sein");
});
