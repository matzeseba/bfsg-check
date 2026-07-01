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

const { sendReportFor, sendReport, sendCookieReport, sendRecheckReport, sendDelayNotice, sendLeadTeaser, buildLeadTeaser, isEmail, legalFooter, widerrufHinweis } = await import('../lib/mailer.js');

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

test('sendReport: fehlende Rechnungs-Datei kippt den Versand NICHT (SF4 — Anhang wird uebersprungen)', async () => {
  // Vorher warf ein fehlendes Rechnungs-PDF und blockierte die GESAMTE Report-Mail.
  // Jetzt wird der Anhang defensiv uebersprungen — das Kernprodukt (Report) geht raus.
  const res = await sendReport({
    to: 'kunde@beispiel.de', pdfPath: reportPdf,
    invoicePdfPath: path.join(tmp, 'nicht-da.pdf'), invoiceNumber: 'RE-2026-9999'
  });
  assert.equal(res.dryRun, true);
});

test('sendReport: fehlendes REPORT-PDF wirft weiterhin (Pflicht-Anhang strikt)', async () => {
  // Das Report-PDF ist das Kernprodukt — es bleibt ein harter Pflicht-Anhang.
  await assert.rejects(
    () => sendReport({ to: 'kunde@beispiel.de', pdfPath: path.join(tmp, 'kein-report.pdf') }),
    /ENOENT|no such file/i
  );
});

test('sendDelayNotice (MF5): Verzoegerungs-Notiz laeuft im Dry-Run durch, ungueltige Adresse wird uebersprungen', async () => {
  const ok = await sendDelayNotice({ to: 'kunde@beispiel.de', company: 'ACME GmbH' });
  assert.equal(ok.dryRun, true);
  const bad = await sendDelayNotice({ to: 'keine-email', company: 'ACME' });
  assert.equal(bad.dryRun, true);
  assert.equal(bad.skipped, 'invalid-recipient');
});

test('isEmail: Basis-Validierung', () => {
  assert.equal(isEmail('a@b.de'), true);
  assert.equal(isEmail('kaputt'), false);
});

test('isEmail (MF6): lehnt ab, was die alte liberale Checkout-Regex durchliess', () => {
  // Die alte Checkout-Validierung war /^[^\s@]+@[^\s@]+\.[^\s@]+$/ — sie liess u.a.
  // 1-Zeichen-TLDs und Nicht-ASCII durch, die der Mailer dann hart als „ungueltig"
  // wirft (bezahltes Produkt unzustellbar). Jetzt validiert der Checkout mit isEmail.
  assert.equal(isEmail('kunde@firma.c'), false);      // 1-Zeichen-TLD
  assert.equal(isEmail('müller@möller.de'), false);   // Nicht-ASCII (IDN)
  assert.equal(isEmail('kunde@firma'), false);        // keine TLD
  // Gueltige Adressen bleiben gueltig.
  assert.equal(isEmail('kunde@firma.de'), true);
  assert.equal(isEmail('first.last+tag@sub.firma.com'), true);
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

// --- PR2: Value-Mail nach Gratis-Scan ---------------------------------------
const teaserArgs = {
  url: 'https://muster-shop.de/kategorie',
  score: 42,
  counts: { critical: 3, serious: 5, moderate: 4, minor: 2 },
  topIssues: ['Unzureichender Farbkontrast', 'Fehlende Alternativtexte', 'Formularfelder ohne Label'],
  totalIssues: 14
};

test('buildLeadTeaser: Betreff traegt Note + Score + Host', () => {
  const { subject } = buildLeadTeaser(teaserArgs);
  assert.match(subject, /Note D/);          // 42 → D (Schwellen wie report.js)
  assert.match(subject, /42\/100/);
  assert.match(subject, /muster-shop\.de/); // Host aus URL extrahiert
});

test('buildLeadTeaser: zeigt Score, ALLE Kategorie-Zaehler und Top-3-Prioritaeten (text+html)', () => {
  const { text, html } = buildLeadTeaser(teaserArgs);
  for (const body of [text, html]) {
    // Alle vier Kategorie-Zahlen vorhanden.
    assert.match(body, /Kritisch/);
    assert.match(body, /Schwerwiegend/);
    assert.match(body, /Mittel/);
    assert.match(body, /Gering/);
    // Top-3-Prioritaeten (das WAS) — Titel, keine Selektoren.
    assert.match(body, /Unzureichender Farbkontrast/);
    assert.match(body, /Fehlende Alternativtexte/);
    assert.match(body, /Formularfelder ohne Label/);
  }
  // HTML hat die CTA als klickbaren Link auf #pakete.
  assert.match(html, /href="[^"]*#pakete"/);
  // "N weitere Fundstellen" = totalIssues(14) - gezeigte 3 = 11.
  assert.match(text, /11 weitere Fundstellen/);
});

test('buildLeadTeaser: leakt KEINE gesperrten Inhalte + KEINE verbotenen Claims', () => {
  const { text, html } = buildLeadTeaser(teaserArgs);
  for (const body of [text, html]) {
    // Verbotene Marketing-Claims (UWG §5 / CLAUDE.md).
    assert.doesNotMatch(body, /BFSG-konform/i);
    assert.doesNotMatch(body, /rechtssicher/i);
    assert.doesNotMatch(body, /\bgarantiert\b/i);
    assert.doesNotMatch(body, /T[ÜU]V|DEKRA/i);
    // Kein CSS-/DOM-Selektor-Leak (Vollreport-only). Grobe Heuristik: keine
    // typischen Selektor-Muster wie ".class", "#id" oder "<tag>"-Fundstellen.
    assert.doesNotMatch(body, /nth-child|querySelector|::before|\bdiv\.[a-z]/i);
  }
});

test('buildLeadTeaser: Note-Fallback aus Score, wenn keine grade uebergeben', () => {
  assert.match(buildLeadTeaser({ score: 95 }).subject, /Note A/);
  assert.match(buildLeadTeaser({ score: 80 }).subject, /Note B/);
  assert.match(buildLeadTeaser({ score: 60 }).subject, /Note C/);
  assert.match(buildLeadTeaser({ score: 10 }).subject, /Note D/);
});

test('buildLeadTeaser: robust bei fehlenden Feldern (kein Throw, keine NaN)', () => {
  const { subject, text, html } = buildLeadTeaser({});
  assert.ok(subject && text && html);
  assert.doesNotMatch(text, /NaN/);
  assert.doesNotMatch(html, /NaN/);
});

test('sendLeadTeaser: laeuft im Dry-Run durch; ungueltige Adresse wird uebersprungen', async () => {
  const ok = await sendLeadTeaser({ to: 'lead@firma.de', ...teaserArgs });
  assert.equal(ok.dryRun, true);
  const bad = await sendLeadTeaser({ to: 'keine-email', ...teaserArgs });
  assert.equal(bad.dryRun, true);
  assert.equal(bad.skipped, 'invalid-recipient');
});
