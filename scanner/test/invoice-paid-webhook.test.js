// supertest-Harness gegen die ECHTE Route POST /webhook für invoice.paid (Abo-Re-Check)
// + checkout.session.async_payment_succeeded/async_payment_failed (F8).
//
// Abgedeckt:
//   F9  — invoice.paid für eine PAST_DUE-Subscription synct den lokalen Status auf
//         ACTIVE statt den bezahlten Zyklus stillschweigend zu verwerfen.
//   F20/F26/F21(a) — der Re-Check-Kern schreibt vor dem Scan RECHECK_STARTED (inkl.
//         eventId) und nach Erfolg RECHECK_DONE; die eventId bleibt über den Merge
//         erhalten und macht claimEvent/alreadyProcessed durabel (übersteht ensureLoaded).
//   F25 — der Order-Record des Abo-Zyklus trägt die Kunden-E-Mail (Resend-Recovery).
//   F8  — checkout.session.async_payment_succeeded erfüllt wie .completed;
//         .async_payment_failed löst KEINE Erfüllung aus (kein fulfillOrder-Call).

import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import Stripe from 'stripe';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-invoice-webhook-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
process.env.STRIPE_SECRET_KEY = 'sk_test_00000000000000000000000000';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.ENABLE_ABO = 'true';
process.env.REPORT_RELEASE_GATE_ENABLED = 'false'; // synchroner sendReportFor-Pfad
process.env.ADMIN_TOKEN = '0123456789abcdef0123456789abcdef01';

const request = (await import('supertest')).default;
const { app, services } = await import('../app.js');
const orders = await import('../lib/orders.js');
const { recordSubscription, getSubscription, markSubscriptionStatus } = await import('../lib/subscriptions.js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const REAL = { ...services };
after(() => Object.assign(services, REAL));

let seq = 0;
const uniq = () => `${Date.now()}_${seq++}`;

function postWebhook(event) {
  const payload = JSON.stringify(event);
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  return request(app).post('/webhook').set('Content-Type', 'application/json').set('stripe-signature', sig).send(payload);
}

function invoicePaidEvent({ eventId, invoiceId, subscriptionId, amount = 2499 } = {}) {
  const id = uniq();
  return {
    id: eventId || `evt_${id}`,
    type: 'invoice.paid',
    data: {
      object: {
        id: invoiceId || `in_${id}`,
        billing_reason: 'subscription_cycle',
        subscription: subscriptionId,
        amount_paid: amount,
        total: amount
      }
    }
  };
}

function checkoutEvent({ type = 'checkout.session.completed', eventId, sessionId, email = 'kunde@example.com', url = 'https://example.com', pkg = 'basis' } = {}) {
  const id = uniq();
  return {
    id: eventId || `evt_${id}`,
    type,
    data: {
      object: {
        id: sessionId || `cs_test_${id}`,
        payment_status: 'paid',
        mode: 'payment',
        amount_total: 12900,
        customer_email: email,
        customer_details: { email, name: '', address: {} },
        subscription: null,
        customer: null,
        metadata: { url, pkg, company: 'Test GmbH', customerType: 'business', consent: 'ja' }
      }
    }
  };
}

async function waitFor(fn, timeoutMs = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = await fn();
    if (v) return v;
    await new Promise((r) => setTimeout(r, 20));
  }
  return fn();
}

beforeEach(() => {
  services.fulfillOrder = async () => { throw new Error('TEST: fulfillOrder nicht gemockt'); };
  services.sendReportFor = async () => { throw new Error('TEST: sendReportFor nicht gemockt'); };
  services.generateInvoicePdf = async () => { throw new Error('TEST: generateInvoicePdf nicht gemockt'); };
});

test('F9: invoice.paid für PAST_DUE-Subscription synct auf ACTIVE + führt den Re-Check aus', async () => {
  const subId = `sub_pastdue_${uniq()}`;
  await recordSubscription({ subscriptionId: subId, customerId: null, email: 'abo@example.com', url: 'https://example.com', company: 'Abo GmbH', pkg: 'abo' });
  await markSubscriptionStatus(subId, 'past_due');
  assert.equal((await getSubscription(subId)).status, 'PAST_DUE', 'Vorbedingung: Sub ist PAST_DUE');

  let fulfillCalls = 0;
  services.fulfillOrder = async (args) => { fulfillCalls += 1; return { pdfPath: '/tmp/r.pdf', stmtPath: '/tmp/s.pdf', emailKind: 'recheck', diff: { firstScan: true, score: 80 }, snapshot: { score: 80, rules: [] } }; };
  services.generateInvoicePdf = async () => ({ invoiceNumber: 'RE-2026-9001', pdfPath: '/tmp/RE-2026-9001.pdf', date: '2026-07-07' });
  services.sendReportFor = async () => ({ dryRun: true });

  const evt = invoicePaidEvent({ subscriptionId: subId });
  const res = await postWebhook(evt);
  assert.equal(res.status, 200);

  // Auf den TERMINALEN Zustand warten (nicht nur auf den Status-Sync) — sonst racet die
  // Assertion gegen den noch laufenden Hintergrund-Scan (webhook quittiert bevor
  // handleInvoicePaid fertig ist) und ein spät abgeschlossener Call könnte in den
  // nächsten Test hineinlaufen (geteiltes paidScanGate).
  const cycleOrder = await waitFor(async () => {
    const o = await orders.getOrder(evt.data.object.id);
    return o && o.status === 'RECHECK_DONE' ? o : null;
  });
  assert.ok(cycleOrder, 'Der Abo-Zyklus muss einen Order-Record unter der Invoice-ID hinterlassen und RECHECK_DONE erreichen');
  assert.equal((await getSubscription(subId)).status, 'ACTIVE', 'invoice.paid muss den Status auf ACTIVE synchronisieren');
  assert.equal(fulfillCalls, 1, 'Re-Check muss trotz vormals PAST_DUE ausgeführt werden');
  assert.equal(cycleOrder.email, 'abo@example.com', 'F25: E-Mail muss am Zyklus-Record stehen (Resend-Recovery)');
  assert.equal(cycleOrder.eventId, evt.id, 'F21: die Stripe-event.id ist durabel am Order-Record persistiert');
});

test('F20/F21: RECHECK_STARTED persistiert die event.id durabel in der Order-Datei', async () => {
  const cycleKey = `evt-durability-${uniq()}`;
  const eventId = `evt_durability_${uniq()}`;
  await orders.markStatus(cycleKey, 'RECHECK_STARTED', { eventId, email: 'x@y.de', url: 'https://x.de', pkg: 'abo' });
  const raw = await readFile(process.env.ORDERS_FILE, 'utf8');
  const rec = raw.trim().split('\n').map((l) => JSON.parse(l)).find((r) => r.sessionId === cycleKey);
  assert.ok(rec, 'RECHECK_STARTED-Record muss in der Order-Datei stehen');
  assert.equal(rec.eventId, eventId, 'die Stripe-event.id muss mitgeschrieben sein — ensureLoaded liest sie nach einem Neustart zurück in claimEvent\'s Dedup-Menge');
});

test('F8: checkout.session.async_payment_succeeded erfüllt wie .completed', async () => {
  const evt = checkoutEvent({ type: 'checkout.session.async_payment_succeeded' });
  const sessionId = evt.data.object.id;
  let fulfilled = 0;
  services.fulfillOrder = async () => { fulfilled += 1; return { pdfPath: '/tmp/report.pdf', stmtPath: null, emailKind: 'bfsg', diff: { firstScan: true, score: 90 } }; };
  services.generateInvoicePdf = async () => ({ invoiceNumber: 'RE-2026-9100', pdfPath: '/tmp/RE-2026-9100.pdf', date: '2026-07-07' });
  services.sendReportFor = async () => ({ dryRun: true });

  const res = await postWebhook(evt);
  assert.equal(res.status, 200);
  await waitFor(async () => { const o = await orders.getOrder(sessionId); return o && o.status === 'MAILED' ? o : null; });
  const order = await orders.getOrder(sessionId);
  assert.equal(order.status, 'MAILED', 'async_payment_succeeded muss wie completed erfüllt werden');
  assert.equal(fulfilled, 1);
});

test('F8: checkout.session.async_payment_failed löst KEINE Erfüllung aus', async () => {
  const evt = checkoutEvent({ type: 'checkout.session.async_payment_failed' });
  const sessionId = evt.data.object.id;
  let fulfilled = 0;
  services.fulfillOrder = async () => { fulfilled += 1; return {}; };

  const res = await postWebhook(evt);
  assert.equal(res.status, 200);
  await new Promise((r) => setTimeout(r, 80));
  assert.equal(fulfilled, 0, 'eine fehlgeschlagene asynchrone Zahlung darf nichts erfüllen');
  assert.equal(await orders.getOrder(sessionId), null, 'keine Order für eine fehlgeschlagene Zahlung');
});
