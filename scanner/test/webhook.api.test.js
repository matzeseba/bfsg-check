// supertest-Harness gegen die ECHTE HTTP-Route POST /webhook (app.js) — schließt die
// Coverage-Lücke, dass test/webhook.e2e.test.js nur die lib-Funktionen direkt aufruft,
// aber NIE den echten Webhook-Handler (Signaturprüfung, Idempotenz, Fulfillment-Sync).
//
// Signatur wird ECHT über stripe.webhooks.generateTestHeaderString erzeugt (nicht gemockt),
// der rohe Body geht als Buffer durch express.raw → constructEvent verifiziert exakt.
// Gemockt wird nur der teure Fulfillment-Kern über die DI-Naht `services`; orders.js läuft
// ECHT gegen tmp-JSONL. Das Release-Gate ist AUS (REPORT_RELEASE_GATE_ENABLED='false'),
// damit der synchrone sendReportFor-Pfad läuft.
//
// Abgedeckt:
//   Gültige Signatur   → 200 received:true + Order landet MAILED (Fulfillment lief).
//   Ungültige Signatur → 400 (constructEvent wirft, kein Fulfillment).
//   Duplikat (gleiche event.id 2×) → 2. Response duplicate:true + fulfillOrder nur 1×.

import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Stripe from 'stripe';

// --- Umgebung VOR dem Import von app.js/orders.js fixieren ---
const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-webhook-api-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
process.env.STRIPE_SECRET_KEY = 'sk_test_00000000000000000000000000'; // konstruiert nur den Client (kein Netz)
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.REPORT_RELEASE_GATE_ENABLED = 'false'; // Gate AUS → synchroner sendReportFor-Pfad
process.env.ADMIN_TOKEN = '0123456789abcdef0123456789abcdef01';

const request = (await import('supertest')).default;
const { app, services } = await import('../app.js');
const orders = await import('../lib/orders.js');

// Eigener Stripe-Client nur zum Erzeugen echter Test-Signaturen.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const REAL = { ...services };
after(() => Object.assign(services, REAL));

let seq = 0;
const uniq = () => `${Date.now()}_${seq++}`;

function checkoutEvent({ eventId, sessionId, email = 'kunde@example.com', url = 'https://example.com', pkg = 'basis', amount = 12900 } = {}) {
  const id = uniq();
  return {
    id: eventId || `evt_${id}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId || `cs_test_${id}`,
        payment_status: 'paid',
        mode: 'payment',
        amount_total: amount,
        customer_email: email,
        customer_details: { email, name: '', address: {} },
        subscription: null,
        customer: null,
        metadata: { url, pkg, company: 'Test GmbH', customerType: 'business', consent: 'ja' }
      }
    }
  };
}

// Body als raw Buffer + echte Signatur über GENAU dieselben Bytes.
function postWebhook(event, { badSig = false } = {}) {
  const payload = JSON.stringify(event);
  const sig = badSig
    ? 't=1,v1=deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    : stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  // WICHTIG: den JSON-String senden (NICHT Buffer) — superagent behandelt einen Buffer
  // als Objekt und mergt ihn, was die Bytes zerstört und die Signaturprüfung brechen lässt.
  // express.raw liefert den String als exakten Buffer an constructEvent → Signatur matcht.
  return request(app)
    .post('/webhook')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', sig)
    .send(payload);
}

async function waitForStatus(sessionId, want, timeoutMs = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const o = await orders.getOrder(sessionId);
    if (o && o.status === want) return o;
    await new Promise((r) => setTimeout(r, 20));
  }
  return orders.getOrder(sessionId);
}

beforeEach(() => {
  // Defensiv: jede nicht explizit gemockte Fulfillment-Funktion knallt laut, statt
  // unbemerkt den echten (Browser/SMTP/PDF) Pfad zu treffen.
  services.fulfillOrder = async () => { throw new Error('TEST: fulfillOrder nicht gemockt'); };
  services.sendReportFor = async () => { throw new Error('TEST: sendReportFor nicht gemockt'); };
  services.generateInvoicePdf = async () => { throw new Error('TEST: generateInvoicePdf nicht gemockt'); };
});

test('Gültige Signatur → 200 received:true + Order wird MAILED', async () => {
  const evt = checkoutEvent();
  const sessionId = evt.data.object.id;

  let fulfilled = 0;
  let sent = 0;
  services.fulfillOrder = async ({ url }) => {
    fulfilled += 1;
    return { pdfPath: '/tmp/report.pdf', stmtPath: null, emailKind: 'bfsg', diff: { firstScan: true, score: 90 }, url };
  };
  services.generateInvoicePdf = async () => ({ invoiceNumber: 'RE-2026-0001', pdfPath: '/tmp/RE-2026-0001.pdf', date: '2026-07-02' });
  services.sendReportFor = async () => { sent += 1; return { dryRun: true }; };

  const res = await postWebhook(evt);
  assert.equal(res.status, 200);
  assert.equal(res.body.received, true);
  assert.equal(res.body.duplicate, undefined, 'Erst-Zustellung ist kein Duplikat');

  const order = await waitForStatus(sessionId, 'MAILED');
  assert.equal(order.status, 'MAILED', 'Fulfillment lief bis zur Auslieferung durch');
  assert.equal(order.invoiceNumber, 'RE-2026-0001');
  assert.equal(fulfilled, 1, 'fulfillOrder genau einmal aufgerufen');
  assert.equal(sent, 1, 'sendReportFor genau einmal aufgerufen');
});

test('Ungültige Signatur → 400, kein Fulfillment', async () => {
  const evt = checkoutEvent();
  let fulfilled = 0;
  services.fulfillOrder = async () => { fulfilled += 1; return { pdfPath: '/tmp/x.pdf', emailKind: 'bfsg', diff: {} }; };

  const res = await postWebhook(evt, { badSig: true });
  assert.equal(res.status, 400, 'constructEvent muss bei falscher Signatur werfen');
  await new Promise((r) => setTimeout(r, 50)); // ein etwaiger (falscher) Async-Pfad hätte Zeit
  assert.equal(fulfilled, 0, 'keine Erfüllung bei ungültiger Signatur');
  const order = await orders.getOrder(evt.data.object.id);
  assert.ok(!order, 'keine Order für ein abgelehntes Event angelegt');
});

test('Duplikat (gleiche event.id 2×) → duplicate:true + fulfillOrder nur 1×', async () => {
  const evt = checkoutEvent();
  const sessionId = evt.data.object.id;

  let fulfilled = 0;
  services.fulfillOrder = async () => {
    fulfilled += 1;
    return { pdfPath: '/tmp/report.pdf', stmtPath: null, emailKind: 'bfsg', diff: { firstScan: true, score: 90 } };
  };
  services.generateInvoicePdf = async () => ({ invoiceNumber: 'RE-2026-0002', pdfPath: '/tmp/RE-2026-0002.pdf', date: '2026-07-02' });
  services.sendReportFor = async () => ({ dryRun: true });

  // 1. Zustellung vollständig abwarten (deterministisch), damit die Idempotenz greift.
  const res1 = await postWebhook(evt);
  assert.equal(res1.status, 200);
  assert.equal(res1.body.duplicate, undefined);
  await waitForStatus(sessionId, 'MAILED');

  // 2. Zustellung desselben Events → sofort als Duplikat quittiert, KEIN zweites Fulfillment.
  const res2 = await postWebhook(evt);
  assert.equal(res2.status, 200);
  assert.equal(res2.body.duplicate, true, 'gleiche event.id wird dedupliziert');
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(fulfilled, 1, 'fulfillOrder lief trotz Doppel-Zustellung nur einmal');
});
