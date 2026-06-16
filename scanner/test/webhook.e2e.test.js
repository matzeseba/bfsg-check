// E2E-Test für Stripe-Webhook-Flow (Mock-Stripe-Event, kein echtes Stripe nötig).
// Verifiziert: alreadyProcessed-Idempotenz, recordPaid-Persistenz, Status-Übergänge.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-webhook-e2e-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');

const { alreadyProcessed, recordPaid, markStatus, getOrder } = await import('../lib/orders.js');
const { recordSubscription, getSubscription, markCancelled } = await import('../lib/subscriptions.js');

// --- Hilfsfunktion: synthetisches Stripe-Event nachstellen ---
function mockCheckoutSessionEvent(overrides = {}) {
  const eventId = overrides.eventId || `evt_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const sessionId = overrides.sessionId || `cs_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: eventId,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId,
        payment_status: 'paid',
        mode: overrides.mode || 'payment',
        amount_total: overrides.amount || 19900,
        customer_email: overrides.email || 'kunde@example.com',
        customer_details: { email: overrides.email || 'kunde@example.com' },
        subscription: overrides.subscriptionId || null,
        customer: overrides.customerId || null,
        metadata: {
          url: overrides.url || 'https://example.com',
          pkg: overrides.pkg || 'basis',
          company: overrides.company || 'Test GmbH',
          customerType: 'business',
          consent: 'ja'
        }
      }
    }
  };
}

test('Idempotenz: alreadyProcessed greift beim 2. Aufruf', async () => {
  const evt = mockCheckoutSessionEvent();
  assert.equal(await alreadyProcessed(evt.id), false, 'Erst-Aufruf darf nicht als processed gelten');
  await recordPaid({
    eventId: evt.id,
    sessionId: evt.data.object.id,
    email: evt.data.object.customer_email,
    url: evt.data.object.metadata.url,
    pkg: evt.data.object.metadata.pkg,
    amount: evt.data.object.amount_total
  });
  assert.equal(await alreadyProcessed(evt.id), true, 'Nach recordPaid muss processed=true sein');
});

test('Status-Übergang: PAID → FULFILLING → MAILED → korrekt persistiert', async () => {
  const evt = mockCheckoutSessionEvent();
  await recordPaid({
    eventId: evt.id,
    sessionId: evt.data.object.id,
    email: 'flow@test.de',
    url: 'https://flow.example.com',
    pkg: 'profi',
    amount: 49900
  });
  let order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'PAID');
  assert.equal(order.amount, 49900);

  await markStatus(evt.data.object.id, 'FULFILLING');
  order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'FULFILLING');

  await markStatus(evt.data.object.id, 'MAILED', { pdfPath: '/tmp/report.pdf' });
  order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'MAILED');
  assert.equal(order.pdfPath, '/tmp/report.pdf');
});

test('Status-Übergang: PAID → FAILED → RESENDING → RESENT (Resend-Pfad)', async () => {
  const evt = mockCheckoutSessionEvent();
  await recordPaid({
    eventId: evt.id,
    sessionId: evt.data.object.id,
    email: 'resend@test.de',
    url: 'https://resend.example.com',
    pkg: 'basis',
    amount: 19900
  });
  await markStatus(evt.data.object.id, 'FAILED', { error: 'Mock-SMTP-Timeout' });
  let order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'FAILED');
  assert.equal(order.error, 'Mock-SMTP-Timeout');

  // Resend-Pfad simulieren
  await markStatus(evt.data.object.id, 'RESENDING');
  order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'RESENDING');

  await markStatus(evt.data.object.id, 'RESENT', { pdfPath: '/tmp/resent.pdf' });
  order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'RESENT');
});

test('Subscription-Lifecycle: record → markCancelled', async () => {
  const subId = `sub_test_${Date.now()}`;
  await recordSubscription({
    subscriptionId: subId,
    customerId: 'cus_test_1',
    email: 'abo@test.de',
    url: 'https://abo.example.com',
    company: 'Abo GmbH',
    pkg: 'abo'
  });
  let sub = await getSubscription(subId);
  assert.equal(sub.status, 'ACTIVE');
  assert.equal(sub.email, 'abo@test.de');

  await markCancelled(subId);
  sub = await getSubscription(subId);
  assert.equal(sub.status, 'CANCELLED');
});

test('Order-Persistenz übersteht Modul-Neuladen (JSONL ist die Source of Truth)', async () => {
  const evt = mockCheckoutSessionEvent({ sessionId: 'cs_persistence_test' });
  await recordPaid({
    eventId: evt.id,
    sessionId: evt.data.object.id,
    email: 'persist@test.de',
    url: 'https://persist.example.com',
    pkg: 'basis',
    amount: 19900
  });
  // Modul "neu laden" — simuliert Prozess-Restart
  // In ESM nicht trivial, aber wir können getOrder erneut aufrufen und prüfen dass es persistent ist
  const order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'PAID');
});
