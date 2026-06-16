#!/usr/bin/env node
// BFSG-Audit — Produktions-Server (gehärtet nach Pre-Launch-Review).
// Landingpage + Gratis-Scan + Stripe-Verkauf + automatischer, nachverfolgbarer
// Report-Versand. Schutz: SSRF-Guard, Rate-Limit, Concurrency-Cap, Webhook-
// Idempotenz, persistente Bestell-States, Betreiber-Alarm, Fail-fast bei Live.
//
// Welle 2: Re-Check-Abo (invoice.paid → Re-Scan + Diff;
//          customer.subscription.deleted → Bestätigung),
//          Cookie-Scan-Produkt, Multi-Page-Crawl.

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';
import { scanUrl } from './lib/scan.js';
import { renderTeaser } from './lib/report.js';
import { fulfillOrder, PKG_CONFIG } from './lib/fulfill.js';
import {
  sendReportFor, sendAlert, sendCancellationConfirmation,
  mailerStatus, requireMailerOrExit, isStripeLive
} from './lib/mailer.js';
import { requireAdminAuth } from './lib/admin-auth.js';
import { exportUserData, deleteUserData, requestDsgvoToken, consumeDsgvoToken } from './lib/dsgvo.js';
import { diffSummaryText } from './lib/diff.js';
import { assertPublicHttpUrl } from './lib/url-guard.js';
import { rateLimit, concurrencyGate } from './lib/limits.js';
import { alreadyProcessed, recordPaid, markStatus } from './lib/orders.js';
import {
  recordSubscription, saveSnapshot, getSubscription, markCancelled
} from './lib/subscriptions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const ENABLE_ABO = process.env.ENABLE_ABO === 'true'; // Abo standardmäßig AUS, bis Webhook-Endpoint aktiv getestet.

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Fail-fast: Live-Stripe ohne SMTP würde bezahlte Reports stillschweigend nicht ausliefern.
requireMailerOrExit();

const PACKAGES = {
  basis:          { name: 'BFSG-Report Basis',         amount: 19900, mode: 'payment' },
  profi:          { name: 'BFSG-Report Profi',         amount: 49900, mode: 'payment' },
  'cookie-basis': { name: 'Cookie-Check (§25 TDDDG)',  amount:  4900, mode: 'payment' },
  'cookie-profi': { name: 'Cookie-Check Profi',        amount:  7900, mode: 'payment' },
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

  // Idempotenz für alle Event-Typen (gilt auch für invoice.paid Duplikate).
  if (await alreadyProcessed(event.id)) {
    return res.json({ received: true, duplicate: true });
  }

  // Webhook SOFORT quittieren — Stripe-Retry vermeidet sich, asynchron arbeiten wir.
  res.json({ received: true });

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event);
    } else if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
      await handleInvoicePaid(event);
    } else if (event.type === 'customer.subscription.deleted') {
      await handleSubscriptionDeleted(event);
    }
  } catch (err) {
    console.error('[webhook] Event-Handling Fehler:', event.type, err.message);
  }
});

async function handleCheckoutCompleted(event) {
  const s = event.data.object;
  if (s.payment_status && s.payment_status !== 'paid') {
    console.warn(`[webhook] Session ${s.id} payment_status=${s.payment_status} — keine Erfüllung.`);
    return;
  }
  const meta = s.metadata || {};
  const email = s.customer_details?.email || s.customer_email || meta.email;
  const pkg = PACKAGES[meta.pkg] ? meta.pkg : 'basis';
  const isSub = s.mode === 'subscription' && !!s.subscription;

  // Zahlung SOFORT persistieren — bevor irgendetwas erzeugt wird.
  await recordPaid({ eventId: event.id, sessionId: s.id, email, url: meta.url, pkg, amount: s.amount_total });

  // Bei Subscription: Subscription-Eintrag anlegen (Snapshot kommt nach Erstausführung).
  if (isSub) {
    await recordSubscription({
      subscriptionId: s.subscription,
      customerId: s.customer || null,
      email,
      url: meta.url,
      company: meta.company || '',
      pkg
    });
  }

  try {
    await assertPublicHttpUrl(meta.url);
    await markStatus(s.id, 'FULFILLING');
    const order = await scanGate(() =>
      fulfillOrder({ url: meta.url, company: meta.company || '', email: email || '', pkg })
    );
    // Subject/Anschreiben passend zum Paket (BFSG / Cookie / Re-Check).
    const emailKind = isSub ? PKG_CONFIG[pkg]?.emailKind || 'bfsg' : order.emailKind;
    await sendReportFor({
      to: email, company: meta.company || '',
      pdfPath: order.pdfPath, stmtPath: order.stmtPath,
      emailKind,
      diffText: diffSummaryText(order.diff)
    });
    if (isSub) {
      await saveSnapshot(s.subscription, order.snapshot);
    }
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
}

async function handleInvoicePaid(event) {
  const inv = event.data.object;
  // Erste Rechnung läuft bereits über checkout.session.completed — sonst Doppel-Scan.
  if (inv.billing_reason && inv.billing_reason !== 'subscription_cycle') {
    return;
  }
  if (!inv.subscription) return;

  const sub = await getSubscription(inv.subscription);
  if (!sub) {
    console.warn(`[webhook] invoice.paid für unbekannte Subscription ${inv.subscription} — übersprungen.`);
    return;
  }
  if (sub.status !== 'ACTIVE') {
    console.warn(`[webhook] invoice.paid für Subscription ${inv.subscription} mit Status ${sub.status} — übersprungen.`);
    return;
  }

  try {
    await assertPublicHttpUrl(sub.url);
    const order = await scanGate(() =>
      fulfillOrder({
        url: sub.url, company: sub.company || '', email: sub.email,
        pkg: sub.pkg || 'abo',
        prevSnapshot: sub.lastSnapshot || null
      })
    );
    await sendReportFor({
      to: sub.email, company: sub.company || '',
      pdfPath: order.pdfPath,
      emailKind: 'recheck',
      diffText: diffSummaryText(order.diff)
    });
    await saveSnapshot(sub.subscriptionId, order.snapshot);
    console.log(`[webhook] Re-Check ausgeliefert: sub=${sub.subscriptionId} -> ${sub.email}`);
  } catch (err) {
    await sendAlert(
      `Re-Check fehlgeschlagen: ${sub.email}`,
      `Subscription: ${sub.subscriptionId}\nURL: ${sub.url}\nFehler: ${err.message}`
    );
    console.error('[webhook] RE-CHECK FEHLGESCHLAGEN', sub.subscriptionId, err.message);
  }
}

async function handleSubscriptionDeleted(event) {
  const sub = event.data.object;
  const local = await markCancelled(sub.id);
  if (local && local.email) {
    try {
      await sendCancellationConfirmation({ to: local.email, company: local.company });
    } catch (err) {
      console.error('[webhook] Cancellation-Mail Fehler:', err.message);
    }
  }
  console.log(`[webhook] Subscription gekündigt: ${sub.id}`);
}

app.use(express.json({ limit: '16kb' }));

// Sicherheits-Header (Defense-in-Depth zu Caddy-Headern).
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (req.secure || req.get('x-forwarded-proto') === 'https') {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // CSP nur auf reine API-/JSON-Routes — statische HTML braucht Inline-Skripte.
  if (req.path.startsWith('/api/') || req.path.startsWith('/admin/') || req.path === '/health' || req.path === '/webhook') {
    res.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  }
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
    const baseMeta = {
      url: safe.url,
      pkg,
      company: String(company).slice(0, 120),
      customerType,
      consent: consent ? 'ja' : 'nein',
      consentTs: new Date().toISOString()
    };
    // Subscription-Metadata: damit invoice.paid die Bestellung wiederfindet.
    const subscription_data = p.mode === 'subscription'
      ? { metadata: { url: safe.url, pkg, company: baseMeta.company, email: email || '' } }
      : undefined;
    const session = await stripe.checkout.sessions.create({
      mode: p.mode,
      line_items: [
        { price_data: { currency: 'eur', product_data: { name: p.name }, unit_amount: p.amount, ...recurring }, quantity: 1 }
      ],
      customer_email: email || undefined,
      metadata: baseMeta,
      subscription_data,
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
  const live = isStripeLive();
  const mailerOk = mailerStatus().startsWith('aktiv');
  res.json({ ok: !(live && !mailerOk), stripe: !!stripe, live, mailer: mailerStatus(), aboEnabled: ENABLE_ABO });
});

// --- DSGVO Art. 15 (Export) / Art. 17 (Löschung) ---
// Token-basierter Doppel-Opt-in: User fordert Export/Delete via E-Mail an,
// bekommt Token-Link, klickt zur Bestätigung → JSON-Download bzw. Tombstone.
app.post('/api/dsgvo/request', rateLimit({ windowMs: 60_000, max: 3 }), async (req, res) => {
  const { email = '', action = 'export' } = req.body || {};
  if (!['export', 'delete'].includes(action)) return res.status(400).json({ error: 'action muss "export" oder "delete" sein' });
  try {
    const { token, expiresAt } = await requestDsgvoToken({ email, action });
    const link = `${PUBLIC_URL}/api/dsgvo/confirm?token=${encodeURIComponent(token)}`;
    await sendAlert(
      `DSGVO-${action}-Anfrage von ${email}`,
      `User-Aktion: ${action}\nE-Mail: ${email}\nToken: ${token}\nLink (24h gültig): ${link}\nExpires: ${expiresAt}`
    );
    res.status(202).json({ ok: true, message: 'Bestätigungs-Mail wird an angegebene Adresse gesendet, falls dort Daten existieren.', expiresAt });
  } catch (err) {
    console.error('[dsgvo] request error:', err.message);
    res.status(500).json({ error: 'Anfrage konnte nicht verarbeitet werden' });
  }
});

app.get('/api/dsgvo/confirm', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  const token = String(req.query.token || '');
  if (!token) return res.status(400).json({ error: 'token fehlt' });
  try {
    const { email, action } = await consumeDsgvoToken(token);
    if (action === 'export') {
      const data = await exportUserData(email);
      res.set('Content-Disposition', `attachment; filename="bfsg-dsgvo-export-${Date.now()}.json"`);
      res.json(data);
    } else if (action === 'delete') {
      const result = await deleteUserData(email);
      res.json({ ok: true, action: 'delete', ...result });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Admin-Endpoints (Bearer-Token via ADMIN_TOKEN env) ---
app.get('/admin/orders', requireAdminAuth, async (req, res) => {
  try {
    const { listOrders } = await import('./lib/orders.js');
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const orders = await listOrders({ limit });
    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/subscriptions', requireAdminAuth, async (req, res) => {
  try {
    const { listSubscriptions } = await import('./lib/subscriptions.js');
    const subs = await listSubscriptions();
    res.json({ count: subs.length, subscriptions: subs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend-Endpoint: bei Fulfillment-Fehler Report nochmal ausliefern.
app.post('/api/resend/:sessionId', requireAdminAuth, async (req, res) => {
  const { sessionId } = req.params;
  try {
    const { getOrder, markStatus } = await import('./lib/orders.js');
    const order = await getOrder(sessionId);
    if (!order) return res.status(404).json({ error: 'Session nicht gefunden' });
    if (order.status === 'MAILED' || order.status === 'RESENT') {
      return res.status(409).json({ error: `Order Status ${order.status} — bereits ausgeliefert. Nutze ?force=true.` });
    }
    await markStatus(sessionId, 'RESENDING');
    const result = await scanGate(() =>
      fulfillOrder({ url: order.url, company: order.company || '', email: order.email, pkg: order.pkg || 'basis' })
    );
    await sendReportFor({
      to: order.email, company: order.company || '',
      pdfPath: result.pdfPath, stmtPath: result.stmtPath,
      emailKind: result.emailKind || 'bfsg',
      diffText: diffSummaryText(result.diff)
    });
    await markStatus(sessionId, 'RESENT', { pdfPath: result.pdfPath });
    res.json({ ok: true, sessionId, email: order.email, status: 'RESENT' });
  } catch (err) {
    console.error('[resend] Fehler:', err.message);
    res.status(500).json({ error: err.message });
  }
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
