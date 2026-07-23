// supertest-Harness gegen die ECHTE HTTP-Route POST /api/checkout (app.js) —
// Abo-Tier-Modell „Fuchs Re-Check" (agent-01, 23.07.2026): Report-Gate +
// Startpaket, hier mit ABO_TIERS_ENABLED=true (Flag AN). Stripe wird über die
// DI-Naht services.createCheckoutSession gestubbt (kein Netz-Call), die Gate-
// Entscheidung läuft gegen die ECHTE orders.js-Persistenz (recordPaid-Seeding).
//
// Abgedeckt:
//   Report-Gate (d10.1):  abo/abo-jahr/abo-pro OHNE bezahlten Erst-Report → 409
//                         + reason 'report_required' + KEIN Stripe-Call.
//                         MIT bezahltem basis-Report (gleiche E-Mail) → 200.
//   Neue Tier-Pakete:     abo-pro (6900/month), abo-pro-jahr (69000/year).
//   Startpaket (d10.2):   OHNE Report buchbar; 2 Line-Items (Report einmalig +
//                         Tier recurring), trial_period_days=30, metadata.tier;
//                         ungültiges tier → Default 'abo'.
//   hasPaidReportFor:     Cookie-Kauf zählt NICHT als Report; E-Mail-Match ist
//                         case-insensitiv; PKG_CONFIG der neuen Pakete (d10.4).
//
// Budget: max. 10 Checkout-Requests (Rate-Limit der Route) — dieser Test nutzt 9.

import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// --- Umgebung VOR dem Import von app.js fixieren (Tiers + Gate AN) ---
const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-abo-tiers-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
process.env.STRIPE_SECRET_KEY = 'sk_test_00000000000000000000000000'; // konstruiert nur den Client (kein Netz)
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.ENABLE_ABO = 'true';
process.env.ABO_TIERS_ENABLED = 'true';
process.env.ADMIN_TOKEN = '0123456789abcdef0123456789abcdef01';

const request = (await import('supertest')).default;
const { app, services } = await import('../app.js');
const { recordPaid, hasPaidReportFor } = await import('../lib/orders.js');
const { PKG_CONFIG } = await import('../lib/fulfill.js');

const REAL = { ...services };
after(() => Object.assign(services, REAL));

let captured;
beforeEach(() => {
  captured = null;
  services.createCheckoutSession = async (params) => {
    captured = params;
    return { url: 'https://checkout.stripe.test/cs_test_tiers' };
  };
});

// Kunde MIT bezahltem Erst-Report (wird in den Gate-Tests unten geseedet).
const REPORT_EMAIL = 'report-kunde@example.com';
await recordPaid({
  eventId: 'evt_seed_report_1', sessionId: 'cs_seed_report_1',
  email: REPORT_EMAIL, url: 'https://example.com', pkg: 'basis', amount: 12900
});

function postCheckout(body) {
  return request(app)
    .post('/api/checkout')
    .set('Content-Type', 'application/json')
    .send({
      url: 'https://example.com',
      email: 'neukunde@example.com',
      customerType: 'business',
      company: 'Test GmbH',
      ...body
    });
}

// --- Report-Gate (d10.1) -------------------------------------------------------
test("Gate: 'abo' ohne bezahlten Erst-Report → 409 + Hinweis, kein Stripe-Call", async () => {
  const res = await postCheckout({ pkg: 'abo', email: 'ohne-report@example.com' });
  assert.equal(res.status, 409, JSON.stringify(res.body));
  assert.equal(res.body.reason, 'report_required');
  assert.match(res.body.error, /Erst-Report/);
  assert.match(res.body.error, /Startpaket/);
  assert.equal(captured, null, 'Stripe darf bei abgelehntem Gate nicht aufgerufen werden');
});

test("Gate: 'abo-jahr' und 'abo-pro' ohne Erst-Report → ebenfalls 409", async () => {
  const jahr = await postCheckout({ pkg: 'abo-jahr', email: 'ohne-report@example.com' });
  assert.equal(jahr.status, 409);
  assert.equal(jahr.body.reason, 'report_required');
  const pro = await postCheckout({ pkg: 'abo-pro', email: 'ohne-report@example.com' });
  assert.equal(pro.status, 409);
  assert.equal(pro.body.reason, 'report_required');
  assert.equal(captured, null);
});

test("Gate: 'abo' MIT bezahltem basis-Report (gleiche E-Mail) → 200, unveränderte Params", async () => {
  const res = await postCheckout({ pkg: 'abo', email: REPORT_EMAIL });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const pd = captured.line_items[0].price_data;
  assert.equal(pd.unit_amount, 2499);
  assert.equal(pd.recurring.interval, 'month');
});

// --- Neue Tier-Pakete (d2/d7: Einführungspreise) --------------------------------
test("Tier: 'abo-pro' mit Report → 200, 6900 Cent/month, Name 'Fuchs Re-Check Pro'", async () => {
  const res = await postCheckout({ pkg: 'abo-pro', email: REPORT_EMAIL });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const pd = captured.line_items[0].price_data;
  assert.equal(pd.unit_amount, 6900, 'Einführungspreis Pro 69 € = 6900 Cent');
  assert.equal(pd.recurring.interval, 'month');
  assert.equal(pd.product_data.name, 'Fuchs Re-Check Pro');
  assert.equal(captured.mode, 'subscription');
});

test("Tier: 'abo-pro-jahr' mit Report → 200, 69000 Cent/year", async () => {
  const res = await postCheckout({ pkg: 'abo-pro-jahr', email: REPORT_EMAIL });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const pd = captured.line_items[0].price_data;
  assert.equal(pd.unit_amount, 69000, 'Einführungspreis Pro Jahr 690 € = 69000 Cent');
  assert.equal(pd.recurring.interval, 'year');
});

// --- Startpaket (d1 Szenario E, d10.2) -------------------------------------------
test("Startpaket: OHNE Erst-Report buchbar — Report einmalig + Tier recurring + 30 Tage Trial", async () => {
  const res = await postCheckout({ pkg: 'startpaket-basis', email: 'einsteiger@example.com' });
  assert.equal(res.status, 200, JSON.stringify(res.body));

  assert.equal(captured.mode, 'subscription');
  assert.equal(captured.line_items.length, 2, 'Startpaket = Report-Position + Tier-Subscription');

  // Position 1: Erst-Report EINMALIG (kein recurring!), heute fällig.
  const reportItem = captured.line_items[0].price_data;
  assert.equal(reportItem.unit_amount, 12900);
  assert.equal(reportItem.product_data.name, 'BFSG-Report Basis');
  assert.equal(reportItem.recurring, undefined, 'Report-Position darf nicht recurring sein');

  // Position 2: Tier-Subscription (Default Starter 'abo') — ab Monat 2.
  const tierItem = captured.line_items[1].price_data;
  assert.equal(tierItem.unit_amount, 2499);
  assert.equal(tierItem.recurring.interval, 'month');

  // 1. Re-Check-Monat inklusive = 30 Tage Trial; Subscription trägt das TIER.
  assert.equal(captured.subscription_data.trial_period_days, 30);
  assert.equal(captured.subscription_data.metadata.pkg, 'abo');
  assert.equal(captured.metadata.pkg, 'startpaket-basis');
  assert.equal(captured.metadata.tier, 'abo');
});

test("Startpaket: 'startpaket-profi' mit tier='abo-business' → 39900 einmalig + 12900/month", async () => {
  const res = await postCheckout({ pkg: 'startpaket-profi', tier: 'abo-business', email: 'einsteiger@example.com' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const reportItem = captured.line_items[0].price_data;
  assert.equal(reportItem.unit_amount, 39900);
  assert.equal(reportItem.product_data.name, 'BFSG-Report Profi');
  const tierItem = captured.line_items[1].price_data;
  assert.equal(tierItem.unit_amount, 12900, 'Business-Einführungspreis 129 € = 12900 Cent');
  assert.equal(tierItem.recurring.interval, 'month');
  assert.equal(captured.subscription_data.metadata.pkg, 'abo-business');
  assert.equal(captured.metadata.tier, 'abo-business');
  assert.equal(captured.subscription_data.trial_period_days, 30);
});

test("Startpaket: ungültiges tier → Default Starter 'abo' (defensiv)", async () => {
  const res = await postCheckout({ pkg: 'startpaket-basis', tier: 'abo-quatsch', email: 'einsteiger@example.com' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const tierItem = captured.line_items[1].price_data;
  assert.equal(tierItem.unit_amount, 2499);
  assert.equal(captured.subscription_data.metadata.pkg, 'abo');
  assert.equal(captured.metadata.tier, 'abo');
});

// --- hasPaidReportFor (Gate-Grundlage, ohne HTTP) --------------------------------
test('hasPaidReportFor: Cookie-Kauf zählt NICHT als Erst-Report; E-Mail-Match case-insensitiv', async () => {
  // Cookie-Käufer bleiben draußen (kein WCAG-Baseline-Report; agent-01 d6).
  await recordPaid({
    eventId: 'evt_seed_cookie_1', sessionId: 'cs_seed_cookie_1',
    email: 'cookie@example.com', url: 'https://example.com', pkg: 'cookie-profi', amount: 6900
  });
  assert.equal(await hasPaidReportFor('cookie@example.com'), false);

  // Basis-Report zählt — Schreibweise der E-Mail egal.
  assert.equal(await hasPaidReportFor(REPORT_EMAIL.toUpperCase()), true);

  // Startpaket zählt als bezahlter Erst-Report (Report ist darin inklusive).
  await recordPaid({
    eventId: 'evt_seed_sp_1', sessionId: 'cs_seed_sp_1',
    email: 'sp@example.com', url: 'https://example.com', pkg: 'startpaket-profi', amount: 39900
  });
  assert.equal(await hasPaidReportFor('sp@example.com'), true);

  assert.equal(await hasPaidReportFor('unbekannt@example.com'), false);
  assert.equal(await hasPaidReportFor(''), false);
});

// --- PKG_CONFIG der neuen Pakete (d10.4) ------------------------------------------
test('PKG_CONFIG: Tiers mit Tier-Scan-Tiefe (40/50), Startpakete auf Report-Niveau', () => {
  assert.equal(PKG_CONFIG['abo-pro'].maxPages, 40);
  assert.equal(PKG_CONFIG['abo-pro'].emailKind, 'recheck');
  assert.equal(PKG_CONFIG['abo-pro'].withStatement, true);
  assert.equal(PKG_CONFIG['abo-pro-jahr'].maxPages, 40);
  assert.equal(PKG_CONFIG['abo-business'].maxPages, 50);
  assert.equal(PKG_CONFIG['abo-business-jahr'].maxPages, 50);
  // Startpaket = Erst-Report-Fulfillment (bfsg-Anschreiben, Basis-/Profi-Tiefe).
  assert.equal(PKG_CONFIG['startpaket-basis'].maxPages, 8);
  assert.equal(PKG_CONFIG['startpaket-basis'].emailKind, 'bfsg');
  assert.equal(PKG_CONFIG['startpaket-profi'].maxPages, 40);
  assert.equal(PKG_CONFIG['startpaket-profi'].emailKind, 'bfsg');
  // Bestand unberührt (Grandfathering d8): 'abo'/'abo-jahr' unverändert.
  assert.equal(PKG_CONFIG.abo.maxPages, 25);
  assert.equal(PKG_CONFIG['abo-jahr'].maxPages, 25);
});
