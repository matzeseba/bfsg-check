// Invoice-Tests: fortlaufende Nummer, HTML-Render, Kleinunternehmer vs Regelbesteuerung.
// PDF-Generierung wird NICHT getestet (braucht Playwright-Browser, zu langsam für Unit-Test).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-invoice-'));
process.env.INVOICE_COUNTER_FILE = path.join(tmp, 'counter.json');
process.env.INVOICE_DIR = path.join(tmp, 'invoices');

const { renderInvoiceHtml, nextInvoiceNumber } = await import('../lib/invoice.js');

test('nextInvoiceNumber: fortlaufende Sequenz im selben Jahr', async () => {
  const n1 = await nextInvoiceNumber();
  const n2 = await nextInvoiceNumber();
  const n3 = await nextInvoiceNumber();
  const year = new Date().getUTCFullYear();
  assert.equal(n1, `RE-${year}-0001`);
  assert.equal(n2, `RE-${year}-0002`);
  assert.equal(n3, `RE-${year}-0003`);
});

test('renderInvoiceHtml: Kleinunternehmer = kein USt-Ausweis, § 19-Hinweis', () => {
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0001',
    date: '2026-06-16T12:00:00Z',
    customer: { company: 'Test GmbH', email: 'a@b.de' },
    items: [{ description: 'BFSG-Report Basis', amount: 19900 }],
    vatMode: 'kleinunternehmer'
  });
  assert.match(html, /§ 19 UStG/);
  assert.doesNotMatch(html, /USt\. 19 %/);
  assert.match(html, /Gesamtbetrag/);
  assert.match(html, /199,00 €/);
  // Customer-Render
  assert.match(html, /Test GmbH/);
});

test('renderInvoiceHtml: Regelbesteuerung = USt 19% ausgewiesen', () => {
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0010',
    date: '2026-06-16T12:00:00Z',
    customer: { company: 'B2B AG', email: 'rechnung@b2b.de' },
    items: [{ description: 'BFSG-Report Profi', amount: 49900 }],
    vatMode: 'regelbesteuerung'
  });
  assert.match(html, /USt\. 19 %/);
  assert.doesNotMatch(html, /§ 19 UStG/);
  // 499 netto + 94,81 USt = 593,81 gross
  assert.match(html, /94,81 €/);
  assert.match(html, /593,81 €/);
});

test('renderInvoiceHtml: HTML-Escaping verhindert XSS in customer-name', () => {
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0001',
    date: '2026-06-16T12:00:00Z',
    customer: { company: '<script>alert(1)</script>', email: 'a@b.de' },
    items: [{ description: 'Test', amount: 100 }],
    vatMode: 'kleinunternehmer'
  });
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
});

test('renderInvoiceHtml: multiple items werden summiert', () => {
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0001',
    date: '2026-06-16T12:00:00Z',
    customer: { email: 'a@b.de' },
    items: [
      { description: 'Basis', amount: 19900 },
      { description: 'Cookie-Profi', amount: 7900 }
    ],
    vatMode: 'kleinunternehmer'
  });
  // 19900 + 7900 = 27800 cents = 278,00 €
  assert.match(html, /278,00 €/);
});

test('renderInvoiceHtml: Umlaute im Output korrekt (UTF-8)', () => {
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0001',
    date: '2026-06-16T12:00:00Z',
    customer: { company: 'Müller Söhne GmbH', email: 'müller@bäcker.de' },
    items: [{ description: 'BFSG-Prüfung für große Schriften', amount: 19900 }],
    vatMode: 'kleinunternehmer'
  });
  // & in HTML wird zu &amp; — also entweder escaped form prüfen oder Umlaute isoliert
  assert.match(html, /Müller Söhne/);
  assert.match(html, /BFSG-Prüfung für große Schriften/);
});
