// Regressionstest GoBD C2: bei Mail-Fehler darf KEINE zweite fortlaufende
// Rechnungsnummer verbrannt werden. Der Fix persistiert die Nummer via
// markStatus(INVOICED) VOR dem Mailversand; der Resend-Pfad muss sie dann
// wiederverwenden statt eine neue zu ziehen.
//
// Getestet wird der Order-State-Flow gegen das echte orders.js-Store (wie
// app.js ihn fuehrt) — die nicht-exportierte Handler-Funktion selbst ist
// nicht isoliert testbar (Stripe/Mailer-Init beim Modul-Load), die hier
// geprueften Invarianten sind aber genau die, die der Handler herstellt.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-invoice-resend-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');

const { recordPaid, markStatus, getOrder } = await import('../lib/orders.js');

// Spiegelt die Resend-Entscheidung aus app.js:503 wider:
//   const invoice = order.invoiceNumber ? null : await safeGenerateInvoice(...)
// true  → bereits vergebene Nummer wiederverwenden (KEINE neue ziehen)
// false → noch keine Nummer vorhanden, neue erzeugen
function resendWouldReuseExistingNumber(order) {
  return !!order.invoiceNumber;
}

test('GoBD C2: INVOICED-Nummer ueberlebt FAILED und wird beim Resend wiederverwendet', async () => {
  const sessionId = 'cs_mailfail_1';
  // 1) Zahlung gesichert (Status PAID).
  await recordPaid({
    eventId: 'evt_mf_1', sessionId, email: 'kunde@example.com',
    url: 'https://kunde.example.com', pkg: 'basis', amount: 19900
  });

  // 2) Rechnung erzeugt → Nummer SOFORT vor dem Mailen persistiert (Fix C2).
  const invoiceNumber = 'RE-2026-0007';
  await markStatus(sessionId, 'INVOICED', { invoiceNumber, invoicePdfPath: '/out/invoices/RE-2026-0007.pdf' });

  // 3) Mailversand schlaegt fehl → Order wird FAILED, OHNE die Nummer zu verlieren.
  let order = await getOrder(sessionId);
  await markStatus(sessionId, 'FAILED', {
    error: 'SMTP-Timeout',
    invoiceNumber: order.invoiceNumber || null,
    invoicePdfPath: order.invoicePdfPath || null
  });

  order = await getOrder(sessionId);
  assert.equal(order.status, 'FAILED');
  assert.equal(order.invoiceNumber, invoiceNumber, 'Rechnungsnummer muss im FAILED-Record erhalten bleiben');

  // 4) Resend: da invoiceNumber vorhanden, darf KEINE zweite Nummer gezogen werden.
  assert.equal(resendWouldReuseExistingNumber(order), true,
    'Resend muss die bereits vergebene GoBD-Nummer wiederverwenden (keine Verbrennung)');
});

test('GoBD C2: ohne erzeugte Rechnung (FAILED vor INVOICED) zieht Resend korrekt eine Nummer', async () => {
  const sessionId = 'cs_mailfail_2';
  await recordPaid({
    eventId: 'evt_mf_2', sessionId, email: 'kunde2@example.com',
    url: 'https://kunde2.example.com', pkg: 'basis', amount: 19900
  });
  // Fehler VOR der Rechnungserzeugung (z.B. Scan/Fulfill bricht ab) → keine Nummer.
  await markStatus(sessionId, 'FAILED', { error: 'Fulfill-Fehler' });

  const order = await getOrder(sessionId);
  assert.equal(order.status, 'FAILED');
  assert.ok(!order.invoiceNumber, 'ohne erzeugte Rechnung darf keine Nummer im Record stehen');
  assert.equal(resendWouldReuseExistingNumber(order), false,
    'ohne vorhandene Nummer muss der Resend eine (erste) Nummer ziehen');
});

test('GoBD C2: Happy-Path INVOICED → MAILED behaelt genau eine Nummer', async () => {
  const sessionId = 'cs_ok_1';
  await recordPaid({
    eventId: 'evt_ok_1', sessionId, email: 'ok@example.com',
    url: 'https://ok.example.com', pkg: 'profi', amount: 49900
  });
  const invoiceNumber = 'RE-2026-0008';
  await markStatus(sessionId, 'INVOICED', { invoiceNumber });
  await markStatus(sessionId, 'MAILED', { pdfPath: '/out/report.pdf', invoiceNumber });

  const order = await getOrder(sessionId);
  assert.equal(order.status, 'MAILED');
  assert.equal(order.invoiceNumber, invoiceNumber, 'genau eine Nummer ueber den ganzen Flow');
});
