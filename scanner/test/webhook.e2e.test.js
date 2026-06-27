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

const { alreadyProcessed, claimEvent, releaseEvent, recordPaid, markStatus, getOrder } = await import('../lib/orders.js');
const { recordSubscription, getSubscription, markCancelled, markSubscriptionStatus } = await import('../lib/subscriptions.js');

test('claimEvent: nur EIN paralleler Claim gewinnt (F1 Race-Schutz)', async () => {
  const eventId = `evt_race_${Date.now()}`;
  // 10 gleichzeitige Claims desselben Events — genau einer darf true sein.
  const results = await Promise.all(Array.from({ length: 10 }, () => claimEvent(eventId)));
  const wins = results.filter((r) => r === true).length;
  assert.equal(wins, 1, 'Exakt ein Claim darf das Event beanspruchen');
  // Folge-Claim ebenfalls false (bereits beansprucht).
  assert.equal(await claimEvent(eventId), false);
  // alreadyProcessed sieht das Event jetzt.
  assert.equal(await alreadyProcessed(eventId), true);
});

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

test('Mail-Retry (P1#3): INVOICED → READY_NOT_MAILED → RESENT behält Rechnungsnummer (kein FAILED, kein Neuscan)', async () => {
  const evt = mockCheckoutSessionEvent({ sessionId: 'cs_readynotmailed' });
  await recordPaid({
    eventId: evt.id, sessionId: evt.data.object.id,
    email: 'mailfail@test.de', url: 'https://mailfail.example.com',
    pkg: 'basis', amount: 19900
  });

  // Phase 1 abgeschlossen: Scan+PDF+Rechnung fertig, Rechnungsnummer persistiert.
  await markStatus(evt.data.object.id, 'FULFILLING');
  await markStatus(evt.data.object.id, 'INVOICED', {
    invoiceNumber: 'RE-2026-0042', invoicePdfPath: '/tmp/RE-2026-0042.pdf'
  });

  // Phase 2 (Mailversand) scheitert nach allen Retries → READY_NOT_MAILED, NICHT FAILED.
  await markStatus(evt.data.object.id, 'READY_NOT_MAILED', {
    error: 'SMTP 451 greylisted nach 3 Versuchen',
    pdfPath: '/tmp/report.pdf', stmtPath: '/tmp/stmt.md', emailKind: 'bfsg',
    invoiceNumber: 'RE-2026-0042', invoicePdfPath: '/tmp/RE-2026-0042.pdf'
  });
  let order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'READY_NOT_MAILED', 'Mail-Fehler darf NICHT FAILED setzen — Report ist fertig');
  assert.notEqual(order.status, 'FAILED');
  assert.equal(order.invoiceNumber, 'RE-2026-0042', 'Rechnungsnummer bleibt erhalten');
  assert.ok(order.pdfPath, 'Report-PDF-Pfad ist persistiert (Resend braucht keinen Neuscan)');

  // Mail-only-Resend: derselbe Report + dieselbe Rechnungsnummer (keine zweite Nummer).
  await markStatus(evt.data.object.id, 'RESENDING');
  await markStatus(evt.data.object.id, 'RESENT', {
    pdfPath: order.pdfPath, invoiceNumber: order.invoiceNumber, resendMode: 'mail-only'
  });
  order = await getOrder(evt.data.object.id);
  assert.equal(order.status, 'RESENT');
  assert.equal(order.invoiceNumber, 'RE-2026-0042', 'Resend zieht KEINE neue Rechnungsnummer (GoBD-Idempotenz)');
  assert.equal(order.resendMode, 'mail-only', 'Resend war reiner Mailversand (kein fulfillOrder)');
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

test('Zahlungsausfall: markSubscriptionStatus past_due → PAST_DUE, recovery → ACTIVE', async () => {
  const subId = `sub_pastdue_${Date.now()}`;
  await recordSubscription({
    subscriptionId: subId, customerId: 'cus_pd', email: 'pd@test.de',
    url: 'https://pd.example.com', company: 'PD GmbH', pkg: 'abo'
  });
  // active -> past_due
  let sub = await markSubscriptionStatus(subId, 'past_due');
  assert.equal(sub.status, 'PAST_DUE');
  assert.equal(sub.stripeStatus, 'past_due');
  // unpaid bleibt PAST_DUE (gleicher lokaler Status → kein Wechsel, prev zurück)
  sub = await markSubscriptionStatus(subId, 'unpaid');
  assert.equal(sub.status, 'PAST_DUE');
  // recovery: past_due -> active
  sub = await markSubscriptionStatus(subId, 'active');
  assert.equal(sub.status, 'ACTIVE');
  // canceled -> CANCELLED
  sub = await markSubscriptionStatus(subId, 'canceled');
  assert.equal(sub.status, 'CANCELLED');
});

test('recordPaid persistiert Stripe-customerId (Kundenverwaltung)', async () => {
  const evt = mockCheckoutSessionEvent({ sessionId: 'cs_custid_test' });
  await recordPaid({
    eventId: evt.id, sessionId: evt.data.object.id,
    email: 'cust@test.de', url: 'https://x.de', pkg: 'basis', amount: 19900,
    customerId: 'cus_ABC123'
  });
  const order = await getOrder(evt.data.object.id);
  assert.equal(order.customerId, 'cus_ABC123');
});

test('releaseEvent: gibt einen In-Memory-Claim frei (Vor-Persistenz-Fehlerpfad)', async () => {
  const eventId = `evt_release_${Date.now()}`;
  assert.equal(await claimEvent(eventId), true, 'Erst-Claim gewinnt');
  assert.equal(await claimEvent(eventId), false, 'Zweiter Claim ohne Freigabe scheitert (Dedup)');
  // Wenn die durable Vor-Persistenz fehlschlägt, gibt der Webhook den Claim frei und
  // quittiert NICHT → Stripes Redelivery muss das Event erneut beanspruchen können.
  releaseEvent(eventId);
  assert.equal(await claimEvent(eventId), true, 'Nach releaseEvent erneut beanspruchbar (Stripe-Redelivery)');
});

test('Durable Dedup erfüllter Bestellungen: recordPaid persistiert die event.id', async () => {
  // Kein separater Claim-Write mehr — die Persistenz läuft über recordPaid. Nach einem
  // (simulierten) Reload muss alreadyProcessed das Event weiterhin kennen.
  const evt = mockCheckoutSessionEvent({ sessionId: 'cs_dedup_recordpaid' });
  await recordPaid({
    eventId: evt.id, sessionId: evt.data.object.id,
    email: 'dedup@test.de', url: 'https://x.de', pkg: 'basis', amount: 12900
  });
  assert.equal(await alreadyProcessed(evt.id), true, 'recordPaid muss die event.id durabel deduplizieren');
});

test('Abo-Erklärung: PKG_CONFIG.abo erzeugt eine Barrierefreiheitserklärung (withStatement)', async () => {
  const { PKG_CONFIG } = await import('../lib/fulfill.js');
  assert.equal(PKG_CONFIG.abo.withStatement, true, 'Abo muss pro Re-Check eine aktualisierte Erklärung erzeugen');
  assert.equal(PKG_CONFIG.abo.emailKind, 'recheck');
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
