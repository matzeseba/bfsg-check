// Config-/Flag-Tests (reine Funktionen, kein Browser/IO):
// - paidLenientTls (MF1): bezahlter Scan-Pfad ist NUR über SCAN_PAID_LENIENT_TLS
//   tolerant, KEIN stiller Fallback auf das Teaser-Flag.
// - invoiceConfigStatus (MF3/SF6): meldet fehlende §14-/§34a-Pflichtangaben.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paidLenientTls } from '../lib/fulfill.js';
import { invoiceConfigStatus } from '../lib/invoice.js';

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
