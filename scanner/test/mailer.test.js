// Mailer-Tests: Invoice-Attachment-Wiring + Empfänger-Validierung.
// SMTP ist hier NICHT konfiguriert → deliver() läuft im Dry-Run (sendet nichts),
// liest aber trotzdem die Anhang-Dateien ein. Wir prüfen, dass die Rechnungs-PDF
// als zusätzlicher Anhang verarbeitet wird (kein Throw bei vorhandener Datei) und
// dass eine fehlende Datei sauber fehlschlägt.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Sicherstellen: kein SMTP → Dry-Run-Pfad (kein echter Versand).
delete process.env.SMTP_HOST;
delete process.env.SMTP_USER;
delete process.env.SMTP_PASS;

const { sendReportFor, sendReport, sendCookieReport, sendRecheckReport, isEmail, legalFooter, widerrufHinweis } = await import('../lib/mailer.js');

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-mailer-'));
const reportPdf = path.join(tmp, 'report.pdf');
const invoicePdf = path.join(tmp, 'RE-2026-0001.pdf');
writeFileSync(reportPdf, '%PDF-1.4 report');
writeFileSync(invoicePdf, '%PDF-1.4 invoice');

test('sendReport: mit invoicePdfPath läuft im Dry-Run durch (Anhang gelesen)', async () => {
  const res = await sendReport({
    to: 'kunde@beispiel.de', company: 'ACME GmbH',
    pdfPath: reportPdf, stmtPath: null,
    invoicePdfPath: invoicePdf, invoiceNumber: 'RE-2026-0001'
  });
  assert.equal(res.dryRun, true);
});

test('sendReport: ohne invoicePdfPath läuft ebenfalls durch', async () => {
  const res = await sendReport({ to: 'kunde@beispiel.de', pdfPath: reportPdf });
  assert.equal(res.dryRun, true);
});

test('sendReportFor: emailKind=cookie reicht Rechnung weiter (kein Throw)', async () => {
  const res = await sendReportFor({
    to: 'kunde@beispiel.de', company: 'ACME', pdfPath: reportPdf,
    emailKind: 'cookie', invoicePdfPath: invoicePdf, invoiceNumber: 'RE-2026-0002'
  });
  assert.equal(res.dryRun, true);
});

test('sendReportFor: emailKind=recheck reicht Rechnung weiter (kein Throw)', async () => {
  const res = await sendRecheckReport({
    to: 'kunde@beispiel.de', pdfPath: reportPdf, diffText: 'Score: 80/100',
    invoicePdfPath: invoicePdf, invoiceNumber: 'RE-2026-0003'
  });
  assert.equal(res.dryRun, true);
});

test('sendReport: ungültige Empfängeradresse wirft', async () => {
  await assert.rejects(
    () => sendReport({ to: 'keine-email', pdfPath: reportPdf }),
    /Empfängeradresse/
  );
});

test('sendReport: fehlende Rechnungs-Datei wirft (Datei nicht lesbar)', async () => {
  await assert.rejects(
    () => sendReport({
      to: 'kunde@beispiel.de', pdfPath: reportPdf,
      invoicePdfPath: path.join(tmp, 'nicht-da.pdf'), invoiceNumber: 'RE-2026-9999'
    }),
    /ENOENT|no such file/i
  );
});

test('isEmail: Basis-Validierung', () => {
  assert.equal(isEmail('a@b.de'), true);
  assert.equal(isEmail('kaputt'), false);
});

test('legalFooter: Anbieterkennzeichnung + Disclaimer, keine verbotenen Claims', () => {
  const f = legalFooter();
  // Anbieterkennzeichnung (Name + Kontakt) vorhanden.
  assert.match(f, /Kontakt:/);
  // Disclaimer-Pflichtsprache vorhanden.
  assert.match(f, /automatisierte technische Analyse/);
  assert.match(f, /Keine Rechtsberatung/);
  // Keine verbotenen Claims (CLAUDE.md-Compliance).
  assert.doesNotMatch(f, /BFSG-konform/i);
  assert.doesNotMatch(f, /rechtssicher/i);
  assert.doesNotMatch(f, /garantiert/i);
});

test('widerrufHinweis: nur fuer Verbraucher, mit § 356 BGB; leer fuer Unternehmer', () => {
  const consumer = widerrufHinweis({ customerType: 'consumer', consentTs: '2026-06-28T10:00:00Z' });
  assert.match(consumer, /WIDERRUFSRECHT/);
  assert.match(consumer, /§ 356 Abs\. 5 BGB/);
  // de-DE Datum aus consentTs (Tages-/Monats-Padding ist locale-/ICU-abhaengig).
  assert.match(consumer, /\b28\.0?6\.2026\b/);
  // Unternehmer + leerer Typ → kein Hinweis.
  assert.equal(widerrufHinweis({ customerType: 'business' }), '');
  assert.equal(widerrufHinweis({}), '');
});

test('sendReport: Verbraucher-Mail laeuft mit customerType/consentTs durch (Dry-Run)', async () => {
  const res = await sendReport({
    to: 'kunde@beispiel.de', company: '', pdfPath: reportPdf,
    customerType: 'consumer', consentTs: '2026-06-28T10:00:00Z'
  });
  assert.equal(res.dryRun, true);
});
