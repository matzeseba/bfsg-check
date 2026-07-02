// supertest-Harness gegen die ECHTE HTTP-Route POST /api/checkout (app.js) — W1-G
// Abo-Jahresoption. Stripe wird über die DI-Naht services.createCheckoutSession
// gestubbt (Muster analog test/webhook.api.test.js: echte Route, teurer/externer
// Kern gemockt) — kein Netz-Call, aber Paket-Auflösung, Validierung und die an
// Stripe übergebenen price_data/interval-Parameter laufen ECHT.
//
// Abgedeckt:
//   pkg=abo-jahr  → mode subscription, recurring.interval 'year',  unit_amount 24900.
//   pkg=abo       → mode subscription, recurring.interval 'month', unit_amount 2499.
//   unbekanntes pkg → 400 (kein Stripe-Call).
//   annualRecheckDue: Fälligkeits-Logik des Jahres-Abo-Tickers (pure Funktion).

import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// --- Umgebung VOR dem Import von app.js fixieren (ENABLE_ABO schaltet 'abo-jahr' frei) ---
const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-checkout-api-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
process.env.STRIPE_SECRET_KEY = 'sk_test_00000000000000000000000000'; // konstruiert nur den Client (kein Netz)
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.ENABLE_ABO = 'true';
process.env.ADMIN_TOKEN = '0123456789abcdef0123456789abcdef01';

const request = (await import('supertest')).default;
const { app, services, annualRecheckDue } = await import('../app.js');

const REAL = { ...services };
after(() => Object.assign(services, REAL));

let captured;
beforeEach(() => {
  captured = null;
  services.createCheckoutSession = async (params) => {
    captured = params;
    return { url: 'https://checkout.stripe.test/cs_test_123' };
  };
});

function postCheckout(body) {
  return request(app)
    .post('/api/checkout')
    .set('Content-Type', 'application/json')
    .send({
      url: 'https://example.com',
      email: 'kunde@example.com',
      customerType: 'business',
      company: 'Test GmbH',
      ...body
    });
}

test("pkg=abo-jahr → Subscription-Checkout mit interval 'year' und 24900 Cent", async () => {
  const res = await postCheckout({ pkg: 'abo-jahr' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.url, 'https://checkout.stripe.test/cs_test_123');

  assert.ok(captured, 'createCheckoutSession wurde aufgerufen');
  assert.equal(captured.mode, 'subscription');
  const pd = captured.line_items[0].price_data;
  assert.equal(pd.unit_amount, 24900, 'Jahrespreis 249 € = 24900 Cent');
  assert.equal(pd.recurring.interval, 'year');
  assert.equal(pd.product_data.name, 'BFSG Re-Check Abo (jährlich)');
  // Metadata: invoice.paid/prePersist finden die Bestellung über pkg wieder.
  assert.equal(captured.metadata.pkg, 'abo-jahr');
  assert.equal(captured.subscription_data.metadata.pkg, 'abo-jahr');
});

test("pkg=abo (Monats-Abo) unverändert: interval 'month', 2499 Cent", async () => {
  const res = await postCheckout({ pkg: 'abo' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const pd = captured.line_items[0].price_data;
  assert.equal(pd.unit_amount, 2499);
  assert.equal(pd.recurring.interval, 'month');
  assert.equal(captured.mode, 'subscription');
});

test('unbekanntes Paket → 400, kein Stripe-Call', async () => {
  const res = await postCheckout({ pkg: 'abo-quartal' });
  assert.equal(res.status, 400);
  assert.equal(captured, null, 'Stripe darf bei ungültigem Paket nicht aufgerufen werden');
});

// --- Jahres-Abo-Ticker: Fälligkeits-Logik (pure Funktion) --------------------------
test('annualRecheckDue: nur AKTIVE abo-jahr-Subscriptions, ≥ 30 Tage seit letztem Scan', () => {
  const now = Date.parse('2026-07-03T12:00:00Z');
  const base = { status: 'ACTIVE', pkg: 'abo-jahr' };

  // Frisch gescannt (invoice.paid-Scan zählt mit) → nicht fällig.
  assert.equal(annualRecheckDue({ ...base, lastScanAt: '2026-06-20T00:00:00Z' }, now), false);
  // 31 Tage her → fällig.
  assert.equal(annualRecheckDue({ ...base, lastScanAt: '2026-06-02T00:00:00Z' }, now), true);
  // Kein lastScanAt → createdAt zählt.
  assert.equal(annualRecheckDue({ ...base, createdAt: '2026-05-01T00:00:00Z' }, now), true);
  assert.equal(annualRecheckDue({ ...base, createdAt: '2026-06-25T00:00:00Z' }, now), false);
  // Monats-Abo wird NICHT vom Ticker angefasst (invoice.paid liefert den Takt).
  assert.equal(annualRecheckDue({ ...base, pkg: 'abo', lastScanAt: '2026-01-01T00:00:00Z' }, now), false);
  // Nicht-aktive Subscription (PAST_DUE/CANCELLED) → kein Re-Check.
  assert.equal(annualRecheckDue({ ...base, status: 'PAST_DUE', lastScanAt: '2026-01-01T00:00:00Z' }, now), false);
});
