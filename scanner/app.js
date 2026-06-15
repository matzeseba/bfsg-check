#!/usr/bin/env node
// BFSG-Audit — Produktions-Server (gehärtet nach Pre-Launch-Review).
// Landingpage + Gratis-Scan + Stripe-Verkauf + automatischer, nachverfolgbarer
// Report-Versand. Schutz: SSRF-Guard, Rate-Limit, Concurrency-Cap, Webhook-
// Idempotenz, persistente Bestell-States, Betreiber-Alarm, Fail-fast bei Live.

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';
import { scanUrl } from './lib/scan.js';
import { renderTeaser } from './lib/report.js';
import { fulfillOrder } from './lib/fulfill.js';
import { sendReport, sendAlert, mailerStatus, requireMailerOrExit } from './lib/mailer.js';
import { assertPublicHttpUrl } from './lib/url-guard.js';
import { rateLimit, concurrencyGate } from './lib/limits.js';
import { alreadyProcessed, recordPaid, markStatus } from './lib/orders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const ENABLE_ABO = process.env.ENABLE_ABO === 'true'; // Abo standardmäßig AUS (Subscription-Lifecycle fehlt)

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Fail-fast: Live-Stripe ohne SMTP würde bezahlte Reports stillschweigend nicht ausliefern.
requireMailerOrExit();

const PACKAGES = {
  basis: { name: 'BFSG-Report Basis', amount: 19900, mode: 'payment' },
  profi: { name: 'BFSG-Report Profi', amount: 49900, mode: 'payment' },
  ...(ENABLE_ABO
    ? { abo: { name: 'BFSG Re-Check Abo', amount: 4900, mode: 'subscription', interval: 'month' } }
    : {})
};

// max. 2 gleichzeitige Headless-Browser server-weit (verhindert OOM).
const scanGate = concurrencyGate(Number(process.env.MAX_CONCURRENT_SCANS || 2));

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// --- Stripe-Webhook: roher Body VOR express.json ---
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).send('Stripe nicht konfiguriert');
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] Signatur ungültig:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') return res.json({ received: true });

  const s = event.data.object;
  // Nur tatsächlich bezahlte Sessions erfüllen (SEPA u.a. können 'unpaid' melden).
  if (s.payment_status && s.payment_status !== 'paid') {
    console.warn(`[webhook] Session ${s.id} payment_status=${s.payment_status} — keine Erfüllung.`);
    return res.json({ received: true });
  }

  // Idempotenz: doppelte Webhooks nicht erneut verarbeiten.
  if (await alreadyProcessed(event.id)) {
    return res.json({ received: true, duplicate: true });
  }

  const meta = s.metadata || {};
  const email = s.customer_details?.email || s.customer_email || meta.email;
  const pkg = PACKAGES[meta.pkg] ? meta.pkg : 'basis';

  // Zahlung SOFORT persistieren — bevor irgendetwas erzeugt wird.
  await recordPaid({ eventId: event.id, sessionId: s.id, email, url: meta.url, pkg, amount: s.amount_total });

  res.json({ received: true }); // Webhook sofort quittieren, dann asynchron erfüllen.

  try {
    await assertPublicHttpUrl(meta.url); // SSRF-Schutz auch im bezahlten Pfad
    await markStatus(s.id, 'FULFILLING');
    const order = await scanGate(() =>
      fulfillOrder({ url: meta.url, company: meta.company || '', email: email || '', pkg })
    );
    await sendReport({ to: email, company: meta.company || '', pdfPath: order.pdfPath, stmtPath: order.stmtPath });
    await markStatus(s.id, 'MAILED', { pdfPath: order.pdfPath });
    console.log(`[webhook] Report ausgeliefert: ${s.id} -> ${email}`);
  } catch (err) {
    await markStatus(s.id, 'FAILED', { error: err.message });
    await sendAlert(
      `Bezahlt, aber Erfüllung fehlgeschlagen: ${email}`,
      `Session: ${s.id}\nURL: ${meta.url}\nPaket: ${pkg}\nFehler: ${err.message}\n\nManuell nachliefern: node resend.js ${s.id}`
    );
    console.error('[webhook] ERFÜLLUNG FEHLGESCHLAGEN', s.id, err.message);
  }
});

app.use(express.json({ limit: '16kb' }));

// Sicherheits-Header (leichtgewichtig, ohne extra Dependency).
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'no-referrer');
  next();
});

// --- Gratis-Teaser-Scan (rate-limitiert + SSRF-geschützt + concurrency-begrenzt) ---
const cache = new Map();
const TTL = 5 * 60 * 1000;
const CACHE_MAX = 500;

app.get('/api/scan', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  let target = req.query.url;
  if (!target) return res.status(400).json({ error: 'Parameter url fehlt' });
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;

  let safe;
  try {
    safe = await assertPublicHttpUrl(target);
  } catch (e) {
    return res.status(400).json({ error: 'URL nicht erlaubt: ' + e.message });
  }

  try {
    const cached = cache.get(safe.url);
    if (cached && Date.now() - cached.t < TTL) return res.json(cached.data);
    const scan = await scanGate(() => scanUrl(safe.url, { timeout: 30000 }));
    const teaser = renderTeaser(scan);
    if (cache.size >= CACHE_MAX) cache.clear();
    cache.set(safe.url, { t: Date.now(), data: teaser });
    res.json(teaser);
  } catch (err) {
    console.error('[scan] Fehler:', err.message);
    res.status(502).json({ error: 'Scan fehlgeschlagen. Bitte später erneut versuchen.' });
  }
});

// --- Checkout starten ---
app.post('/api/checkout', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Zahlung noch nicht konfiguriert' });
  const { url, pkg = 'basis', company = '', email = '', customerType = '', consent = false } = req.body || {};
  const p = PACKAGES[pkg];
  if (!p) return res.status(400).json({ error: 'Ungültiges Paket' });
  if (!url) return res.status(400).json({ error: 'url erforderlich' });
  if (customerType !== 'consumer' && customerType !== 'business')
    return res.status(400).json({ error: 'Bitte Verbraucher oder Unternehmer wählen' });
  // Verbraucher: Sofort-Erfüllung erfordert ausdrückliche Widerrufs-Verzicht-Zustimmung (§ 356 IV/V BGB).
  if (customerType === 'consumer' && consent !== true)
    return res.status(400).json({ error: 'Zustimmung zur sofortigen Ausführung und Kenntnis des Widerrufs-Erlöschens erforderlich' });
  let safe;
  try {
    safe = await assertPublicHttpUrl(/^https?:\/\//i.test(url) ? url : 'https://' + url);
  } catch (e) {
    return res.status(400).json({ error: 'URL nicht erlaubt: ' + e.message });
  }

  try {
    const recurring = p.mode === 'subscription' ? { recurring: { interval: p.interval } } : {};
    const session = await stripe.checkout.sessions.create({
      mode: p.mode,
      line_items: [
        { price_data: { currency: 'eur', product_data: { name: p.name }, unit_amount: p.amount, ...recurring }, quantity: 1 }
      ],
      customer_email: email || undefined,
      metadata: {
        url: safe.url,
        pkg,
        company: String(company).slice(0, 120),
        customerType,
        consent: consent ? 'ja' : 'nein',
        consentTs: new Date().toISOString()
      },
      submit_type: p.mode === 'payment' ? 'pay' : undefined,
      success_url: `${PUBLIC_URL}/danke.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_URL}/?abbruch=1`
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Fehler:', err.message);
    res.status(500).json({ error: 'Checkout fehlgeschlagen' });
  }
});

app.get('/health', (req, res) => {
  const live = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live');
  const mailerOk = mailerStatus().startsWith('aktiv');
  res.json({ ok: !(live && !mailerOk), stripe: !!stripe, live, mailer: mailerStatus(), aboEnabled: ENABLE_ABO });
});

// Widerrufs-Funktion (§ 356e BGB, Pflicht ab 19.06.2026) — leitet die Erklärung an den Betreiber.
app.post('/api/widerruf', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  const { name = '', email = '', vertrag = '', datum = '' } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name und E-Mail erforderlich' });
  await sendAlert(
    `Widerruf eingegangen: ${String(name).slice(0, 80)}`,
    `Name: ${name}\nE-Mail: ${email}\nVertrag/Bestellung: ${vertrag}\nDatum: ${datum}\nEingang: ${new Date().toISOString()}`
  );
  res.json({ ok: true });
});

// Kündigungs-Funktion (§ 312k BGB) für das Abo.
app.post('/api/kuendigung', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  const { name = '', email = '', vertrag = '' } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name und E-Mail erforderlich' });
  await sendAlert(
    `Kündigung eingegangen: ${String(name).slice(0, 80)}`,
    `Name: ${name}\nE-Mail: ${email}\nVertrag: ${vertrag}\nEingang: ${new Date().toISOString()}`
  );
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, '..', 'landingpage')));

// Globale Fehler-Handler + Graceful Shutdown.
process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));

const server = app.listen(PORT, () => {
  console.log(`BFSG-Audit-Server auf ${PUBLIC_URL}`);
  console.log(`  Stripe:  ${stripe ? 'konfiguriert' : 'NICHT konfiguriert'} | Abo: ${ENABLE_ABO ? 'an' : 'aus'}`);
  console.log(`  Mailer:  ${mailerStatus()}`);
});
process.on('SIGTERM', () => server.close(() => process.exit(0)));
