#!/usr/bin/env node
// BFSG-Audit — Produktions-Server (gehärtet nach Pre-Launch-Review).
// Landingpage + Gratis-Scan + Stripe-Verkauf + automatischer, nachverfolgbarer
// Report-Versand. Schutz: SSRF-Guard, Rate-Limit, Concurrency-Cap, Webhook-
// Idempotenz, persistente Bestell-States, Betreiber-Alarm, Fail-fast bei Live.
//
// Welle 2: Re-Check-Abo (invoice.paid → Re-Scan + Diff;
//          customer.subscription.deleted → Bestätigung),
//          Cookie-Scan-Produkt, Multi-Page-Crawl.

import './lib/sentry.js'; // Sentry früh initialisieren (no-op ohne SENTRY_DSN).
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';
import { scanUrl } from './lib/scan.js';
import { classifyScanError } from './lib/scan-error.js';
import { renderTeaser } from './lib/report.js';
import { fulfillOrder, PKG_CONFIG } from './lib/fulfill.js';
import {
  sendReportFor, sendAlert, sendCancellationConfirmation, sendDsgvoToken,
  mailerStatus, requireMailerOrExit, isStripeLive
} from './lib/mailer.js';
import { requireAdminAuth } from './lib/admin-auth.js';
import { exportUserData, deleteUserData, requestDsgvoToken, consumeDsgvoToken } from './lib/dsgvo.js';
import { diffSummaryText } from './lib/diff.js';
import { generateInvoicePdf } from './lib/invoice.js';
import { assertPublicHttpUrl } from './lib/url-guard.js';
import { rateLimit, concurrencyGate } from './lib/limits.js';
import { claimEvent, recordPaid, markStatus } from './lib/orders.js';
import {
  recordSubscription, saveSnapshot, getSubscription, markCancelled, markSubscriptionStatus
} from './lib/subscriptions.js';
import logger, { httpLog } from './lib/logger.js';
import sentry from './lib/sentry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const ENABLE_ABO = process.env.ENABLE_ABO === 'true'; // Abo standardmäßig AUS, bis Webhook-Endpoint aktiv getestet.

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Fail-fast: Live-Stripe ohne SMTP würde bezahlte Reports stillschweigend nicht ausliefern.
requireMailerOrExit();

const PACKAGES = {
  basis:          { name: 'BFSG-Report Basis',         amount: 12900, mode: 'payment' },
  profi:          { name: 'BFSG-Report Profi',         amount: 39900, mode: 'payment' },
  'cookie-basis': { name: 'Cookie-Check (§25 TDDDG)',  amount:  3900, mode: 'payment' },
  'cookie-profi': { name: 'Cookie-Check Profi',        amount:  6900, mode: 'payment' },
  ...(ENABLE_ABO
    ? { abo: { name: 'BFSG Re-Check Abo', amount: 2499, mode: 'subscription', interval: 'month' } }
    : {})
};

// max. 2 gleichzeitige Headless-Browser server-weit (verhindert OOM).
// Gratis-Teaser-Gate: begrenzte Concurrency + Warteschlangen-Cap. Bei vollem Stau
// lieber sofort ehrlich 503 ("ausgelastet") als unbegrenzt wachsende Queue +
// haengende Verbindungen unter Traffic-Spitzen.
const scanGate = concurrencyGate(Number(process.env.MAX_CONCURRENT_SCANS || 2), {
  maxQueued: Number(process.env.SCAN_QUEUE_MAX || 40)
});
// SEPARATES Gate fuer den BEZAHLTEN Pfad (fulfillOrder): eigener Concurrency-Slot,
// KEIN Queue-Cap. So kann ein Gratis-Teaser-Ansturm die Auslieferung bezahlter
// Bestellungen weder verdraengen (Head-of-Line) noch mit 503 abweisen (Umsatzschutz).
// Default 1 (bezahlte Scans sind selten + duerfen serialisiert werden) haelt die
// RAM-Spitze klein; auf 4-GB-Hosts ggf. MAX_CONCURRENT_SCANS=1 setzen, um die
// Gesamt-Browser-Spitze bei 2 zu halten.
const paidScanGate = concurrencyGate(Number(process.env.MAX_CONCURRENT_PAID_SCANS || 1));

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(httpLog()); // Structured Request-Logs (Pino, no-op-Fallback ohne pino-http).

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
    logger.error({ err: err.message }, 'webhook Signatur ungültig');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotenz für alle Event-Typen (gilt auch für invoice.paid Duplikate).
  // Atomarer Claim schließt die Race zwischen parallelen Stripe-Retries (F1).
  if (!(await claimEvent(event.id))) {
    return res.json({ received: true, duplicate: true });
  }

  // Webhook SOFORT quittieren — Stripe-Retry vermeidet sich, asynchron arbeiten wir.
  res.json({ received: true });

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event);
    } else if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
      await handleInvoicePaid(event);
    } else if (event.type === 'customer.subscription.updated') {
      await handleSubscriptionUpdated(event);
    } else if (event.type === 'customer.subscription.deleted') {
      await handleSubscriptionDeleted(event);
    }
  } catch (err) {
    logger.error({ eventType: event.type, err: err.message }, 'webhook Event-Handling Fehler');
    sentry.captureException(err, { webhook_event: event.type });
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
  // Stripe-Customer-ID mitspeichern (Kundenverwaltung / Doppelkauf / Portal).
  await recordPaid({ eventId: event.id, sessionId: s.id, email, url: meta.url, pkg, amount: s.amount_total, customerId: s.customer || null });

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

  // Erfüllung in ZWEI getrennte Phasen geteilt (P1#3):
  //  Phase 1 — teuer + nicht idempotent: Scan + PDF + Rechnung (mit Nummern-Vergabe).
  //  Phase 2 — billig + wiederholbar: nur der Mailversand.
  // So zieht eine transiente SMTP-/Brevo-Störung NICHT das fertige Produkt in FAILED
  // (was beim Resend einen Komplett-Neuscan + ggf. Doppelrechnung auslöste). Stattdessen
  // landet die Order in READY_NOT_MAILED — der Resend-Pfad sendet dann NUR die Mail neu
  // (kein Neuscan, keine neue Rechnungsnummer: er übernimmt die persistierte Nummer).
  let order;
  let invoice;
  try {
    await assertPublicHttpUrl(meta.url);
    await markStatus(s.id, 'FULFILLING');
    order = await paidScanGate(() =>
      fulfillOrder({ url: meta.url, company: meta.company || '', email: email || '', pkg })
    );
    // Eigene Rechnung (§ 14 UStG) erzeugen — Fallback zur Stripe-Receipt-Mail.
    // Schlägt sie fehl, darf das die Report-Auslieferung NICHT blockieren.
    invoice = await safeGenerateInvoice({ orderId: s.id, email, company: meta.company || '', pkg, amount: s.amount_total });
    // Rechnungsnummer SOFORT persistieren (vor Mailversand): schlägt der Versand
    // fehl oder crasht der Prozess zwischen Rechnung und Mail, kennt der Order-Record
    // die bereits vergebene fortlaufende GoBD-Nummer. Sonst zöge ein Resend eine
    // ZWEITE Rechnungsnummer für denselben Verkauf (GoBD-Lücke/Doppelrechnung).
    if (invoice?.invoiceNumber) {
      await markStatus(s.id, 'INVOICED', { invoiceNumber: invoice.invoiceNumber, invoicePdfPath: invoice.pdfPath || null });
    }
    if (isSub) {
      await saveSnapshot(s.subscription, order.snapshot);
    }
  } catch (err) {
    // Phase-1-Fehler: Scan/Report/Rechnung kamen NICHT zustande → echtes FAILED.
    // Der Resend MUSS hier neu scannen (es liegt kein fertiges Produkt vor).
    await markStatus(s.id, 'FAILED', { error: err.message });
    await sendAlert(
      `Bezahlt, aber Erfüllung fehlgeschlagen: ${email}`,
      `Session: ${s.id}\nURL: ${meta.url}\nPaket: ${pkg}\nFehler: ${err.message}\n\nManuell nachliefern: curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/resend/${s.id}`
    );
    sentry.captureException(err, { webhook_event: 'checkout.session.completed', session_id: s.id });
    logger.error({ sessionId: s.id, err: err.message }, 'ERFÜLLUNG FEHLGESCHLAGEN');
    return;
  }

  // Phase 2: Mailversand (sendReportFor → deliver mit 3× Retry/Backoff bei transienten Fehlern).
  // Subject/Anschreiben passend zum Paket (BFSG / Cookie / Re-Check).
  const emailKind = isSub ? PKG_CONFIG[pkg]?.emailKind || 'bfsg' : order.emailKind;
  try {
    await sendReportFor({
      to: email, company: meta.company || '',
      pdfPath: order.pdfPath, stmtPath: order.stmtPath,
      emailKind,
      diffText: diffSummaryText(order.diff),
      invoicePdfPath: invoice?.pdfPath || null,
      invoiceNumber: invoice?.invoiceNumber || null
    });
    await markStatus(s.id, 'MAILED', { pdfPath: order.pdfPath, invoiceNumber: invoice?.invoiceNumber || null });
    logger.info({ sessionId: s.id, pkg, amount: s.amount_total, invoiceNumber: invoice?.invoiceNumber || null }, 'Report ausgeliefert');
  } catch (err) {
    // Report + Rechnung sind FERTIG, nur die Mail ging nach allen Retries nicht raus.
    // NICHT FAILED setzen (Resend würde sonst neu scannen + neue Rechnung ziehen),
    // sondern READY_NOT_MAILED: der Resend-Pfad sendet dann nur die Mail erneut und
    // übernimmt die bereits persistierten Artefakte (PDF/Statement/Rechnung) — kein
    // Neuscan, keine neue Rechnungsnummer (Idempotenz gewahrt). Pfade mitpersistieren,
    // damit der Mail-only-Resend self-contained ohne erneuten fulfillOrder läuft.
    await markStatus(s.id, 'READY_NOT_MAILED', {
      error: err.message,
      pdfPath: order.pdfPath,
      stmtPath: order.stmtPath || null,
      emailKind,
      invoiceNumber: invoice?.invoiceNumber || null,
      invoicePdfPath: invoice?.pdfPath || null
    });
    await sendAlert(
      `Bezahlt, Report fertig — aber Mailversand fehlgeschlagen: ${email}`,
      `Session: ${s.id}\nURL: ${meta.url}\nPaket: ${pkg}\nFehler: ${err.message}\n\n` +
      `Report + Rechnung liegen vor. NUR Mail erneut senden (kein Neuscan):\n` +
      `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/resend/${s.id}`
    );
    sentry.captureException(err, { webhook_event: 'checkout.session.completed', session_id: s.id, stage: 'mail' });
    logger.error({ sessionId: s.id, err: err.message }, 'MAILVERSAND FEHLGESCHLAGEN (Report fertig, READY_NOT_MAILED)');
  }
}

// Rechnungs-Generierung gekapselt: Fehler werden geloggt + gemeldet, aber
// niemals propagiert — die Report-Auslieferung (das bezahlte Produkt) hat Vorrang.
async function safeGenerateInvoice({ orderId, email, company, pkg, amount }) {
  try {
    return await generateInvoicePdf({ orderId, email, company, pkg, amount });
  } catch (err) {
    logger.error({ orderId, err: err.message }, 'Rechnungs-Generierung fehlgeschlagen (Report wird trotzdem zugestellt)');
    sentry.captureException(err, { stage: 'invoice', order_id: orderId });
    await sendAlert(
      `Rechnung konnte nicht erzeugt werden: ${email}`,
      `Order: ${orderId}\nPaket: ${pkg}\nBetrag: ${amount}\nFehler: ${err.message}\n\nRechnung manuell nachreichen (Stripe-Receipt bleibt gültig).`
    );
    return null;
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
    const order = await paidScanGate(() =>
      fulfillOrder({
        url: sub.url, company: sub.company || '', email: sub.email,
        pkg: sub.pkg || 'abo',
        prevSnapshot: sub.lastSnapshot || null
      })
    );
    // Monatsrechnung fürs Abo (§ 14 UStG) — Betrag aus der Stripe-Invoice.
    const cycleAmount = inv.amount_paid ?? inv.total ?? 0;
    const invoice = await safeGenerateInvoice({ orderId: inv.id || sub.subscriptionId, email: sub.email, company: sub.company || '', pkg: sub.pkg || 'abo', amount: cycleAmount });
    await sendReportFor({
      to: sub.email, company: sub.company || '',
      pdfPath: order.pdfPath,
      // Aktualisierte Erklärung zur Barrierefreiheit pro Monats-Re-Check mitsenden
      // (Owner-Anforderung; abo.withStatement ist jetzt true → order.stmtPath gesetzt).
      stmtPath: order.stmtPath,
      emailKind: 'recheck',
      diffText: diffSummaryText(order.diff),
      invoicePdfPath: invoice?.pdfPath || null,
      invoiceNumber: invoice?.invoiceNumber || null
    });
    await saveSnapshot(sub.subscriptionId, order.snapshot);
    logger.info({ subscriptionId: sub.subscriptionId, invoiceNumber: invoice?.invoiceNumber || null }, 'Re-Check ausgeliefert');
  } catch (err) {
    await sendAlert(
      `Re-Check fehlgeschlagen: ${sub.email}`,
      `Subscription: ${sub.subscriptionId}\nURL: ${sub.url}\nFehler: ${err.message}`
    );
    sentry.captureException(err, { webhook_event: 'invoice.paid', subscription_id: sub.subscriptionId });
    logger.error({ subscriptionId: sub.subscriptionId, err: err.message }, 'RE-CHECK FEHLGESCHLAGEN');
  }
}

// Zahlungsausfall-Resilienz: Stripe meldet Status-Wechsel (active -> past_due ->
// unpaid) via customer.subscription.updated. Wir spiegeln den Status lokal; nur
// ACTIVE-Subscriptions lösen Re-Checks aus (siehe handleInvoicePaid), past_due
// pausiert damit automatisch, ACTIVE-Recovery nimmt den Betrieb wieder auf.
async function handleSubscriptionUpdated(event) {
  const sub = event.data.object;
  const updated = await markSubscriptionStatus(sub.id, sub.status);
  if (updated && updated.status === 'PAST_DUE') {
    await sendAlert(
      `Abo-Zahlung ausstehend (past_due/unpaid): ${updated.email || sub.id}`,
      `Subscription: ${sub.id}\nStripe-Status: ${sub.status}\nRe-Checks pausiert bis Zahlung wieder eingeht.`
    );
    logger.warn({ subscriptionId: sub.id, stripeStatus: sub.status }, 'Abo past_due — Re-Checks pausiert');
  } else if (updated && updated.status === 'ACTIVE') {
    logger.info({ subscriptionId: sub.id }, 'Abo wieder aktiv');
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

// max: 15/min/IP — hoch genug, dass ein ungeduldiger Nutzer (oder geteiltes
// Buero-/NAT-IP) nicht versehentlich blockiert wird, niedrig genug als Kosten-/DoS-
// Schutz (jeder Scan startet Chromium). Bei Ueberschreitung jetzt ehrliche
// "kurz warten"-Meldung statt "nicht erreichbar".
app.get('/api/scan', rateLimit({ windowMs: 60_000, max: Number(process.env.SCAN_RATE_MAX || 15) }), async (req, res) => {
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
    // TLS-Toleranz NUR für den Gratis-Teaser, env-gated (Default aus = striktes
    // Verhalten unverändert). Der bezahlte Scan-Pfad bleibt immer strikt.
    const lenientTls = process.env.SCAN_TEASER_LENIENT_TLS === 'true';
    const scan = await scanGate(() => scanUrl(safe.url, { timeout: 30000, lenientTls }));
    const teaser = renderTeaser(scan);
    // LRU-artige Eviction: nur den AELTESTEN Eintrag entfernen statt den GESAMTEN
    // Cache zu leeren (cache.clear() erzeugte Saegezahn-Hit-Rate + Last-Spike, sobald
    // 500 distinct URLs erreicht waren). Map haelt Insertion-Order -> keys().next() = aeltester.
    while (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(safe.url, { t: Date.now(), data: teaser });
    res.json(teaser);
  } catch (err) {
    // Server ausgelastet (Warteschlange voll): ehrliches Fast-Fail mit Retry-After
    // statt haengender Verbindung. Muss VOR classifyScanError stehen.
    if (err && err.code === 'QUEUE_FULL') {
      res.set('Retry-After', '20');
      return res.status(503).json({
        error: 'Der Live-Scan ist gerade ausgelastet. Bitte in ein paar Sekunden erneut versuchen.',
        reason: 'busy',
        retryAfter: 20
      });
    }
    // Echte Ursache server-seitig loggen, dem Client nur die grobe Kategorie +
    // deutsche Klartextmeldung geben (keine Interna/Hosts/IPs leaken).
    console.error('[scan] Fehler:', err.message);
    const { reason, status, message } = classifyScanError(err.message);
    res.status(status).json({ error: message, reason });
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
  // E-Mail validieren: eine fehlerhafte Adresse macht das bezahlte Produkt
  // unzustellbar (Geld kassiert, Report kommt nie an).
  const cleanEmail = String(email).trim().slice(0, 200);
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben' });
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
      ? { metadata: { url: safe.url, pkg, company: baseMeta.company, email: cleanEmail || '' } }
      : undefined;
    const session = await stripe.checkout.sessions.create({
      mode: p.mode,
      line_items: [
        { price_data: { currency: 'eur', product_data: { name: p.name }, unit_amount: p.amount, ...recurring }, quantity: 1 }
      ],
      customer_email: cleanEmail || undefined,
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

// --- Newsletter-Anmeldung via Brevo Double-Opt-in (§7 UWG/DSGVO-konform) ---
// Erfolg = Bestätigungsmail verschickt (DOI), NICHT bereits abonniert. Aktiv, sobald
// BREVO_API_KEY + BREVO_NEWSLETTER_LIST_ID + BREVO_DOI_TEMPLATE_ID gesetzt sind UND
// in Brevo eine Newsletter-Liste + ein aktives DOI-Template existieren.
app.post('/api/newsletter', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  const email = String(req.body?.email || '').trim().slice(0, 200);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' });

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
  const redirectionUrl = process.env.BREVO_DOI_REDIRECT_URL || `${PUBLIC_URL}/?newsletter=bestaetigt`;
  if (!apiKey || !listId || !templateId) {
    logger.warn('Newsletter-Anfrage, aber Brevo-DOI nicht konfiguriert (BREVO_API_KEY/_NEWSLETTER_LIST_ID/_DOI_TEMPLATE_ID).');
    return res.status(503).json({ error: 'Newsletter ist gerade nicht verfügbar. Bitte später erneut versuchen.' });
  }

  try {
    const r = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ email, includeListIds: [listId], templateId, redirectionUrl })
    });
    if (r.status === 201 || r.status === 204) return res.json({ ok: true, status: 'pending' });
    const body = await r.text().catch(() => '');
    logger.error({ status: r.status, body: body.slice(0, 300) }, 'Brevo-DOI fehlgeschlagen');
    return res.status(502).json({ error: 'Anmeldung derzeit nicht möglich. Bitte später erneut.' });
  } catch (err) {
    logger.error({ err: err.message }, 'Newsletter-Endpoint Fehler');
    return res.status(502).json({ error: 'Anmeldung derzeit nicht möglich.' });
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
    // Token-Link an den ANTRAGSTELLER (Double-Opt-in, F3). Operator bekommt nur
    // eine token-freie Notiz für den Audit-Trail.
    await sendDsgvoToken({ to: email, action, link, expiresAt });
    await sendAlert(
      `DSGVO-${action}-Anfrage von ${email}`,
      `User-Aktion: ${action}\nE-Mail: ${email}\nBestätigungs-Mail mit Token wurde an den Antragsteller gesendet.\nExpires: ${expiresAt}`
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

    // READY_NOT_MAILED (P1#3): Scan + Report + Rechnung sind bereits FERTIG, nur die
    // Mail kam nicht raus. Dann NUR die Mail erneut senden — kein Neuscan, keine neue
    // Rechnungsnummer. Alle nötigen Artefakt-Pfade liegen am Order-Record. Fällt ein
    // Pfad (z. B. nach Server-Neustart mit verlorenem out/-Volume), greift unten der
    // Voll-Resend-Fallback.
    const mailOnly = order.status === 'READY_NOT_MAILED' && order.pdfPath;
    if (mailOnly) {
      await sendReportFor({
        to: order.email, company: order.company || '',
        pdfPath: order.pdfPath, stmtPath: order.stmtPath || null,
        emailKind: order.emailKind || 'bfsg',
        // Diff nicht persistiert; Re-Check-Mail zeigt dann „keine Veränderungen" — bei
        // Erstkäufen (basis/profi/cookie) ohnehin irrelevant, da kein Diff verwendet wird.
        diffText: '',
        invoicePdfPath: order.invoicePdfPath || null,
        invoiceNumber: order.invoiceNumber || null
      });
      await markStatus(sessionId, 'RESENT', { pdfPath: order.pdfPath, invoiceNumber: order.invoiceNumber || null, resendMode: 'mail-only' });
      return res.json({ ok: true, sessionId, email: order.email, status: 'RESENT', mode: 'mail-only' });
    }

    const result = await paidScanGate(() =>
      fulfillOrder({ url: order.url, company: order.company || '', email: order.email, pkg: order.pkg || 'basis' })
    );
    // Rechnung nachreichen, falls bei der fehlgeschlagenen Erst-Auslieferung noch keine erzeugt wurde.
    const invoice = order.invoiceNumber
      ? null
      : await safeGenerateInvoice({ orderId: sessionId, email: order.email, company: order.company || '', pkg: order.pkg || 'basis', amount: order.amount });
    await sendReportFor({
      to: order.email, company: order.company || '',
      pdfPath: result.pdfPath, stmtPath: result.stmtPath,
      emailKind: result.emailKind || 'bfsg',
      diffText: diffSummaryText(result.diff),
      // Bereits erzeugte Rechnung (Nummer + PDF) wiederverwenden statt neu zu ziehen.
      invoicePdfPath: invoice?.pdfPath || order.invoicePdfPath || null,
      invoiceNumber: invoice?.invoiceNumber || order.invoiceNumber || null
    });
    await markStatus(sessionId, 'RESENT', { pdfPath: result.pdfPath, invoiceNumber: invoice?.invoiceNumber || order.invoiceNumber || null });
    res.json({ ok: true, sessionId, email: order.email, status: 'RESENT' });
  } catch (err) {
    logger.error({ sessionId, err: err.message }, 'resend Fehler');
    sentry.captureException(err, { stage: 'resend', session_id: sessionId });
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
process.on('unhandledRejection', (e) => {
  logger.error({ err: e?.message || e }, 'unhandledRejection');
  sentry.captureException(e instanceof Error ? e : new Error(String(e)), { source: 'unhandledRejection' });
});
process.on('uncaughtException', (e) => {
  logger.error({ err: e?.message || e }, 'uncaughtException');
  sentry.captureException(e instanceof Error ? e : new Error(String(e)), { source: 'uncaughtException' });
});

// Reconcile-Sweeper: beim Start nicht-terminale Bestellungen aufspüren und retten.
// Schließt das Restart-Loch (Webhook quittiert sofort, arbeitet asynchron — ein
// Crash mitten in der Erfüllung hinterließe sonst eine bezahlte, aber nicht
// ausgelieferte Bestellung ohne Wiederanlauf). Strategie:
//  - READY_NOT_MAILED (Report + Rechnung fertig, nur Mail offen) → automatischer
//    Mail-only-Resend (idempotent: kein Neuscan, keine neue Rechnungsnummer).
//  - PAID/FULFILLING/INVOICED/RESENDING (mitten im Flow abgebrochen) → EIN
//    konsolidierter Operator-Alarm mit Resend-Befehl (kein Auto-Rescan, um
//    Doppel-Auslieferung/-aufwand zu vermeiden). FAILED ist bereits alarmiert
//    worden → hier ausgelassen, sonst Alarm-Spam bei jedem Neustart.
async function reconcileOnStartup() {
  if (!isStripeLive()) return; // nur im Live-Betrieb relevant
  try {
    const { listOrders, markStatus } = await import('./lib/orders.js');
    const all = await listOrders({ limit: 1000 });
    const TERMINAL = new Set(['MAILED', 'RESENT', 'CANCELLED', 'FAILED', 'EVENT_CLAIMED']);
    const pending = all.filter((o) => o.status && !TERMINAL.has(o.status));
    let remailed = 0;
    const stuck = [];
    for (const o of pending) {
      if (o.status === 'READY_NOT_MAILED' && o.pdfPath) {
        try {
          await sendReportFor({
            to: o.email, company: o.company || '',
            pdfPath: o.pdfPath, stmtPath: o.stmtPath || null,
            emailKind: o.emailKind || 'bfsg', diffText: '',
            invoicePdfPath: o.invoicePdfPath || null, invoiceNumber: o.invoiceNumber || null
          });
          await markStatus(o.sessionId, 'RESENT', { resendMode: 'mail-only', resentBy: 'reconcile' });
          remailed++;
        } catch (err) {
          stuck.push(`${o.sessionId} — READY_NOT_MAILED, Remail-Fehler: ${err.message}`);
        }
      } else {
        stuck.push(`${o.sessionId} — ${o.status} (${o.email || '?'}, ${o.url || '?'})`);
      }
    }
    if (remailed) logger.info({ remailed }, 'Reconcile: READY_NOT_MAILED automatisch erneut versendet');
    if (stuck.length) {
      await sendAlert(
        `Reconcile beim Start: ${stuck.length} haengende Bestellung(en)`,
        `Diese Bestellungen sind NICHT im Endzustand (MAILED/RESENT/CANCELLED) und brauchen Aufmerksamkeit:\n\n` +
        stuck.join('\n') +
        `\n\nManuell nachliefern je Session:\n` +
        `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/resend/<sessionId>`
      );
      logger.warn({ stuck: stuck.length }, 'Reconcile: haengende Bestellungen gemeldet');
    }
  } catch (err) {
    logger.error({ err: err.message }, 'Reconcile-Sweeper fehlgeschlagen (Start wird fortgesetzt)');
  }
}

const server = app.listen(PORT, () => {
  logger.info(
    { publicUrl: PUBLIC_URL, stripe: !!stripe, abo: ENABLE_ABO, mailer: mailerStatus() },
    `BFSG-Audit-Server auf ${PUBLIC_URL}`
  );
  // Nicht-blockierend: Server ist sofort bereit, Reconcile läuft im Hintergrund.
  reconcileOnStartup();
});
process.on('SIGTERM', () => server.close(() => process.exit(0)));
