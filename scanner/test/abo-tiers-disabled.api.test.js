// Gegenstück zu test/abo-tiers-gate.api.test.js: ABO_TIERS_ENABLED ist hier
// NICHT gesetzt (Default AUS = Produktions-Default nach dem Merge). Erwartung:
// das Live-Verhalten bleibt EXAKT wie bisher — 'abo' ist ohne Erst-Report frei
// buchbar (kein Gate), und die neuen Paket-IDs existieren im Checkout gar nicht.
//
// Abgedeckt:
//   pkg=abo OHNE Report          → 200 (altes Verhalten, kein Gate)
//   pkg=abo-pro / abo-business-jahr / startpaket-basis → 400 (unbekanntes Paket)

import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-abo-tiers-off-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
process.env.STRIPE_SECRET_KEY = 'sk_test_00000000000000000000000000';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.ENABLE_ABO = 'true';
process.env.ADMIN_TOKEN = '0123456789abcdef0123456789abcdef01';
// ABO_TIERS_ENABLED bewusst NICHT gesetzt → Default AUS.

const request = (await import('supertest')).default;
const { app, services } = await import('../app.js');

const REAL = { ...services };
after(() => Object.assign(services, REAL));

let captured;
beforeEach(() => {
  captured = null;
  services.createCheckoutSession = async (params) => {
    captured = params;
    return { url: 'https://checkout.stripe.test/cs_test_off' };
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

test("Flag AUS: 'abo' bleibt OHNE Erst-Report frei buchbar (kein Gate, altes Verhalten)", async () => {
  const res = await postCheckout({ pkg: 'abo', email: 'ohne-report@example.com' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const pd = captured.line_items[0].price_data;
  assert.equal(pd.unit_amount, 2499);
  assert.equal(pd.recurring.interval, 'month');
});

test("Flag AUS: neue Tier-/Startpaket-IDs existieren nicht → 400, kein Stripe-Call", async () => {
  for (const pkg of ['abo-pro', 'abo-business-jahr', 'startpaket-basis']) {
    const res = await postCheckout({ pkg });
    assert.equal(res.status, 400, `${pkg} darf bei ausgeschaltetem Flag nicht buchbar sein`);
  }
  assert.equal(captured, null, 'Stripe darf bei unbekannten Paketen nicht aufgerufen werden');
});
