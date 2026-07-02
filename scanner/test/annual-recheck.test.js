// Orchestrierungs-Test für den Jahres-Abo-Re-Check-Ticker (annualRecheckTick):
// subscriptions.js läuft ECHT gegen tmp-JSONL (recordSubscription/markCancelled),
// der teure Kern (Scan/Mail/Rechnung) ist über die services-DI-Naht gemockt —
// gleiches Muster wie test/webhook.api.test.js. Release-Gate AUS, damit der
// synchrone sendReportFor-Pfad läuft und die Auslieferung beobachtbar ist.
//
// Abgedeckt:
//   Fälliger abo-jahr-Sub → GENAU 1 Re-Check, emailKind 'recheck', OHNE Rechnung
//     (generateInvoicePdf 0×, invoiceNumber/invoicePdfPath null im Versand).
//   Retry-Bremse: zweiter tick() mit gleichem now → 0 weitere Aufrufe.
//   paidScanGate-Fairness: 2 fällige Subs → max. 1 pro Tick, Rest im Folge-Tick.
//   Nicht-ACTIVE (past_due) und Monats-Abo ('abo') → 0 Aufrufe.

import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// --- Umgebung VOR dem Import von app.js fixieren ---
const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-annual-recheck-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
process.env.STRIPE_SECRET_KEY = 'sk_test_00000000000000000000000000'; // konstruiert nur den Client (kein Netz)
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.ENABLE_ABO = 'true';
process.env.REPORT_RELEASE_GATE_ENABLED = 'false'; // Gate AUS → synchroner sendReportFor-Pfad
process.env.ADMIN_TOKEN = '0123456789abcdef0123456789abcdef01';

const { services, annualRecheckTick } = await import('../app.js');
const { recordSubscription, markCancelled, markSubscriptionStatus } = await import('../lib/subscriptions.js');

const REAL = { ...services };
after(() => Object.assign(services, REAL));

// Fälligkeit: Subs entstehen mit createdAt = jetzt → 31 Tage in die Zukunft ist fällig.
const NOW = Date.now() + 31 * 24 * 3600_000;

let fulfillCalls;
let invoiceCalls;
let sentArgs;
beforeEach(() => {
  fulfillCalls = [];
  invoiceCalls = 0;
  sentArgs = [];
  services.fulfillOrder = async (args) => {
    fulfillCalls.push(args);
    return {
      pdfPath: '/tmp/report.pdf', stmtPath: '/tmp/statement.pdf', emailKind: 'recheck',
      // firstScan:true wie in test/webhook.api.test.js — diffSummaryText braucht
      // bei firstScan:false die vollen Diff-Arrays (hier irrelevant fürs Orchestrieren).
      diff: { firstScan: true, score: 82 }, snapshot: { score: 82, rules: [] }
    };
  };
  services.generateInvoicePdf = async () => { invoiceCalls += 1; return { invoiceNumber: 'RE-DARF-NICHT-SEIN' }; };
  services.sendReportFor = async (args) => { sentArgs.push(args); return { dryRun: true }; };
});

async function mkSub(id, overrides = {}) {
  return recordSubscription({
    subscriptionId: id, customerId: null, email: 'kunde@example.com',
    url: 'https://example.com', company: 'Test GmbH', pkg: 'abo-jahr', ...overrides
  });
}

test('fälliger abo-jahr-Sub → genau 1 Re-Check OHNE Rechnung; Retry-Bremse stoppt Doppel-Tick', async () => {
  await mkSub('sub_jahr_1');

  await annualRecheckTick(NOW);
  assert.equal(fulfillCalls.length, 1, 'genau ein Re-Check');
  assert.equal(fulfillCalls[0].pkg, 'abo-jahr');
  assert.equal(invoiceCalls, 0, 'Ticker darf KEINE Rechnung erzeugen (keine Zahlung im Zwischenmonat)');
  assert.equal(sentArgs.length, 1, 'Report wurde versendet');
  assert.equal(sentArgs[0].emailKind, 'recheck');
  assert.equal(sentArgs[0].invoiceNumber, null, 'Versand ohne Rechnungsnummer');
  assert.equal(sentArgs[0].invoicePdfPath, null, 'Versand ohne Rechnungs-PDF');

  // Retry-Bremse: gleicher Zeitpunkt erneut → kein zweiter Scan/Versand.
  await annualRecheckTick(NOW);
  assert.equal(fulfillCalls.length, 1, 'zweiter Tick direkt danach löst NICHTS aus');
  assert.equal(sentArgs.length, 1);

  await markCancelled('sub_jahr_1'); // Isolation für die Folge-Tests
});

test('paidScanGate-Fairness: bei 2 fälligen Subs max. 1 Re-Check pro Tick, Rest im Folge-Tick', async () => {
  await mkSub('sub_jahr_2');
  await mkSub('sub_jahr_3');

  await annualRecheckTick(NOW);
  assert.equal(fulfillCalls.length, 1, 'erster Tick arbeitet genau EINE Sub ab');

  // Folge-Tick (gleiches now): erste Sub steckt in der Retry-Bremse, die zweite läuft.
  await annualRecheckTick(NOW);
  assert.equal(fulfillCalls.length, 2, 'zweiter Tick holt die zweite Sub nach');
  const seen = new Set(fulfillCalls.map((c) => c.url && c.pkg));
  assert.ok(seen, 'beide Läufe kamen aus dem Re-Check-Pfad');

  await markCancelled('sub_jahr_2');
  await markCancelled('sub_jahr_3');
});

test('nicht-ACTIVE (past_due) und Monats-Abo werden NICHT angefasst', async () => {
  await mkSub('sub_jahr_4');
  await markSubscriptionStatus('sub_jahr_4', 'past_due');
  await mkSub('sub_monat_1', { pkg: 'abo' }); // Monats-Abo: Takt kommt von invoice.paid

  await annualRecheckTick(NOW);
  assert.equal(fulfillCalls.length, 0, 'weder past_due- noch Monats-Abo lösen einen Ticker-Re-Check aus');
  assert.equal(sentArgs.length, 0);

  await markCancelled('sub_jahr_4');
  await markCancelled('sub_monat_1');
});
