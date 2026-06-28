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

test('renderInvoiceHtml: Regelbesteuerung = USt 19% aus dem Brutto-Betrag herausgerechnet (§14c)', () => {
  // SF5: Der uebergebene Betrag (Stripe amount_total) ist BRUTTO. Bei Regelbesteuerung
  // wird die USt herausgerechnet, sodass der Gesamtbetrag exakt dem gezahlten Betrag
  // (499,00 €) entspricht — NICHT 19% obendrauf.
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0010',
    date: '2026-06-16T12:00:00Z',
    customer: { company: 'B2B AG', email: 'rechnung@b2b.de' },
    items: [{ description: 'BFSG-Report Profi', amount: 49900 }],
    vatMode: 'regelbesteuerung'
  });
  assert.match(html, /USt\. 19 %/);
  assert.doesNotMatch(html, /§ 19 UStG/);
  // 499,00 brutto → 419,33 netto + 79,67 USt = 499,00 gross (Gesamtbetrag == gezahlter Betrag).
  assert.match(html, /419,33 €/);
  assert.match(html, /79,67 €/);
  assert.match(html, /499,00 €/);
  // Der zu hohe alte Ausweis (593,81) darf NIE mehr erscheinen.
  assert.doesNotMatch(html, /593,81 €/);
});

test('renderInvoiceHtml: Regelbesteuerung — Positions-Einzelpreise sind netto und summieren bitgenau zur Zwischensumme (netto)', () => {
  // SF5b: Bei Regelbesteuerung weist die Einzelpreis-Spalte NETTO aus (nicht brutto),
  // konsistent mit der "Zwischensumme (netto)". Zwei Positionen mit Rundungsdrift
  // (2× 129,00 € brutto): round(12900/1,19)=10840 je Position → Summe 216,80 €, waehrend
  // round(25800/1,19)=216,81 € waere. Die Zwischensumme MUSS der Summe der gerundeten
  // Positions-Netti folgen, sonst gilt Positions-Summe ≠ gleichnamige Zwischensumme.
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0200',
    date: '2026-06-28T12:00:00Z',
    customer: { company: 'B2B AG', email: 'rechnung@b2b.de' },
    items: [
      { description: 'BFSG-Report Basis', amount: 12900 },
      { description: 'BFSG-Report Basis', amount: 12900 }
    ],
    vatMode: 'regelbesteuerung'
  });

  const euroToCents = (s) =>
    Math.round(parseFloat(s.replace(/\s*€/, '').replace(/\./g, '').replace(',', '.')) * 100);

  // Einzelpreis-Zellen NUR aus dem Positions-<tbody> (die Totals-Tabelle hat kein <tbody>).
  const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  const lineCents = [...tbody.matchAll(/<td class="amount">([^<]+)<\/td>/g)].map((m) => euroToCents(m[1]));
  assert.equal(lineCents.length, 2, 'Es müssen genau 2 Positions-Einzelpreise gerendert werden');

  // Zwischensumme (netto) aus der Totals-Tabelle.
  const subCents = euroToCents(
    html.match(/Zwischensumme \(netto\)<\/td><td class="amount">([^<]+)<\/td>/)[1]
  );

  // Kern-Assertion: Summe der Positions-Einzelpreise == Zwischensumme (netto).
  assert.equal(
    lineCents.reduce((a, b) => a + b, 0),
    subCents,
    'Positions-Summe muss bitgenau der Zwischensumme (netto) entsprechen'
  );

  // Konkret: 108,40 € je Position → 216,80 € Zwischensumme (NICHT 216,81 aus round(brutto/1,19)).
  assert.equal(subCents, 21680);
  assert.match(html, /108,40 €/);
  // Header weist die Spalte explizit als netto aus.
  assert.match(html, /Einzelpreis \(netto\)/);
  // Gesamtbetrag == gezahltes Brutto (258,00 €), USt = Differenz (41,20 €).
  assert.match(html, /258,00 €/);
  assert.match(html, /41,20 €/);
  // Regression: Die Einzelpreis-Spalte darf NIE den Brutto-Betrag (12900) zeigen.
  assert.ok(!lineCents.includes(12900), 'Einzelpreis-Spalte darf nicht den Brutto-Betrag ausweisen');
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

test('renderInvoiceHtml: § 14 UStG — Rechnungs- UND Leistungsdatum ausgewiesen', () => {
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0001',
    date: '2026-06-16T12:00:00Z',
    customer: { email: 'a@b.de' },
    items: [{ description: 'Basis', amount: 19900 }],
    vatMode: 'kleinunternehmer'
  });
  assert.match(html, /Rechnungsdatum:/);
  assert.match(html, /Leistungsdatum:/);
});

test('renderInvoiceHtml: Empfaenger mit Name + Anschrift (Stripe billing) — kein 2x E-Mail', () => {
  // Deckt die neue Empfaenger-Render-Logik ab: customer_details.{name,address} aus
  // billing_address_collection landen als saubere Zeilen, nicht zweimal die E-Mail.
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0100',
    date: '2026-06-28T12:00:00Z',
    customer: {
      company: 'Muster GmbH',
      name: 'Max Mustermann',
      line1: 'Lange Straße 1',
      line2: '',
      postalCode: '12345',
      city: 'Berlin',
      country: 'DE',
      email: 'max@muster.de'
    },
    items: [{ description: 'BFSG-Report Profi', amount: 39900 }],
    vatMode: 'kleinunternehmer'
  });
  assert.match(html, /Muster GmbH/);
  assert.match(html, /Max Mustermann/);
  assert.match(html, /Lange Straße 1/);
  assert.match(html, /12345 Berlin/);
  assert.match(html, /max@muster\.de/);
  // Inland (DE) → Land wird NICHT gezeigt.
  assert.doesNotMatch(html, /Deutschland/);
  // E-Mail erscheint genau einmal (Bug-Regression: vorher 2x bei fehlender Firma).
  const mailMatches = html.match(/max@muster\.de/g) || [];
  assert.equal(mailMatches.length, 1, 'E-Mail darf nur einmal im Empfaenger-Block stehen');
});

test('renderInvoiceHtml: Empfaenger nur E-Mail (keine Adresse) → Privatkunde + E-Mail, keine Dopplung', () => {
  // Altbestellung/Resend ohne Adresse: frueher stand die E-Mail zweimal untereinander.
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0101',
    date: '2026-06-28T12:00:00Z',
    customer: { company: '', name: '', email: 'solo@kunde.de' },
    items: [{ description: 'BFSG-Report Basis', amount: 12900 }],
    vatMode: 'kleinunternehmer'
  });
  assert.match(html, /Privatkunde/);
  const mailMatches = html.match(/solo@kunde\.de/g) || [];
  assert.equal(mailMatches.length, 1, 'E-Mail darf nur einmal erscheinen');
});

test('renderInvoiceHtml: auslaendischer Empfaenger zeigt Land', () => {
  const html = renderInvoiceHtml({
    invoiceNumber: 'RE-2026-0102',
    date: '2026-06-28T12:00:00Z',
    customer: {
      name: 'Hans Huber', line1: 'Ringstr. 5', postalCode: '1010', city: 'Wien',
      country: 'AT', email: 'hans@huber.at'
    },
    items: [{ description: 'BFSG-Report Basis', amount: 12900 }],
    vatMode: 'kleinunternehmer'
  });
  assert.match(html, /1010 Wien/);
  assert.match(html, /Österreich/);
});

test('nextInvoiceNumber: parallele Aufrufe vergeben eindeutige, lückenlose Nummern', async () => {
  // Race-Test: 20 gleichzeitige Allokationen dürfen NIE eine Nummer doppelt vergeben.
  const nums = await Promise.all(Array.from({ length: 20 }, () => nextInvoiceNumber()));
  const unique = new Set(nums);
  assert.equal(unique.size, nums.length, 'Alle Rechnungsnummern müssen eindeutig sein');
  // Sequenz lückenlos: numerischer Teil bildet einen zusammenhängenden Block.
  const seqs = nums.map((n) => Number(n.split('-')[2])).sort((a, b) => a - b);
  for (let i = 1; i < seqs.length; i++) {
    assert.equal(seqs[i], seqs[i - 1] + 1, 'Sequenz muss lückenlos sein');
  }
});
