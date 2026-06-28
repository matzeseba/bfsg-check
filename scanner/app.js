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
import { fileURLToPath, pathToFileURL } from 'node:url';
import Stripe from 'stripe';
import { scanUrl } from './lib/scan.js';
import { classifyScanError } from './lib/scan-error.js';
import { renderTeaser } from './lib/report.js';
import { fulfillOrder, PKG_CONFIG } from './lib/fulfill.js';
import {
  sendReportFor, sendAlert, sendCancellationConfirmation, sendDsgvoToken, sendDelayNotice,
  mailerStatus, requireMailerOrExit, isStripeLive, isEmail
} from './lib/mailer.js';
import { requireAdminAuth } from './lib/admin-auth.js';
import { exportUserData, deleteUserData, requestDsgvoToken, consumeDsgvoToken } from './lib/dsgvo.js';
import { diffSummaryText } from './lib/diff.js';
import { generateInvoicePdf, invoiceConfigStatus } from './lib/invoice.js';
import { assertPublicHttpUrl } from './lib/url-guard.js';
import { rateLimit, concurrencyGate } from './lib/limits.js';
import { claimEvent, releaseEvent, recordPaid, markStatus } from './lib/orders.js';
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

// Wird diese Datei direkt gestartet (`node app.js`, Produktion) oder nur importiert
// (Test-Harness via supertest)? Nur im Direkt-Start die Start-Checks fahren + den
// Server binden — sonst startet ein `import './app.js'` ungewollt einen Listener und
// würde im Test mit requireMailerOrExit ggf. den Prozess beenden.
const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

// --- DI-Seam (Test-Naht) ---------------------------------------------------------
// Die teuren, nebenwirkungsbehafteten Fulfillment-Bausteine (Headless-Browser-Scan,
// PDF-Rechnung, SMTP-Versand) hinter einem austauschbaren Objekt bündeln. Produktion
// nutzt die echten Implementierungen; die supertest-Harness (test/resend.api.test.js)
// überschreibt einzelne Funktionen, um Webhook-/Resend-Handler ohne echten Browser,
// SMTP oder PDF gegen die ECHTE Express-App zu testen. Aufrufer lesen services.X zur
// Laufzeit (kein Capture beim Modul-Laden), daher wirkt eine Test-Überschreibung sofort.
export const services = { fulfillOrder, sendReportFor, generateInvoicePdf };

if (isMain) {
  // Fail-fast: Live-Stripe ohne SMTP würde bezahlte Reports stillschweigend nicht ausliefern.
  requireMailerOrExit();

  // MF3/SF6: Im Live-Betrieb müssen die Rechnungs-Pflichtangaben (§14 UStG: Anbieter-
  // Anschrift; §33/34a UStDV: Steuer-/USt-IdNr.) gesetzt sein. KEIN Fail-Fast (würde die
  // Auslieferung des bezahlten Reports blockieren), aber ein lauter Alarm + Log, damit
  // keine formfehlerhafte Rechnung still rausgeht.
  const invCfg = invoiceConfigStatus();
  if (isStripeLive() && !invCfg.ok) {
    logger.error({ missing: invCfg.missing }, 'Rechnungs-Pflichtangaben fehlen im Live-Betrieb (§14 UStG)');
    sendAlert(
      'Rechnungs-Pflichtangaben fehlen (§14 UStG)',
      `Im Live-Betrieb sind folgende ENV-Variablen NICHT gesetzt: ${invCfg.missing.join(', ')}.\n` +
      `Rechnungen können dadurch formfehlerhaft sein (fehlende Anbieter-Anschrift/Steuernummer).\n` +
      `Bitte im Server-.env (/opt/bfsg-check/deployment/.env) ergänzen und neu deployen.`
    ).catch(() => {});
  }
}

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
  // Atomarer In-Memory-Claim schließt die Race zwischen parallelen Stripe-Retries (F1).
  if (!(await claimEvent(event.id))) {
    return res.json({ received: true, duplicate: true });
  }

  // Order-erzeugende Events VOR der Quittung durabel festhalten: so hinterlässt ein
  // Crash NACH der Quittung immer eine reconcilebare PAID-Spur (statt bezahlt-aber-
  // spurlos). Schlägt schon die Persistenz fehl, NICHT quittieren + Claim freigeben →
  // Stripe stellt erneut zu (sonst bliebe das Event dauerhaft „verarbeitet").
  try {
    if (event.type === 'checkout.session.completed') {
      await prePersistCheckout(event);
    }
  } catch (err) {
    releaseEvent(event.id);
    logger.error({ eventType: event.type, err: err.message }, 'webhook Vor-Persistenz fehlgeschlagen — kein Ack, Stripe-Retry');
    sentry.captureException(err, { webhook_event: event.type, stage: 'prePersist' });
    return res.status(500).send('persist failed');
  }

  // Quittieren — ab hier ist die zahlungsrelevante Order durabel; weiter asynchron.
  res.json({ received: true });

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event);
    } else if (event.type === 'invoice.paid') {
      // MF2: NUR invoice.paid verarbeiten. invoice.payment_succeeded ist ein zweites
      // Event (eigene event.id → claimEvent dedupliziert es NICHT) für denselben Zyklus
      // und würde sonst 2× Scan + 2× GoBD-Rechnungsnummer + 2× Mail erzeugen.
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

// Persistiert Zahlung (+ ggf. Subscription) eines abgeschlossenen Checkouts durabel,
// BEVOR der Webhook quittiert. Duplikate sind durch claimEvent bereits abgefangen, das
// läuft pro Event also genau einmal. recordPaid schreibt die event.id mit → erfüllte
// Bestellungen sind nach einem Restart durabel dedupliziert (ensureLoaded).
async function prePersistCheckout(event) {
  const s = event.data.object;
  if (s.payment_status && s.payment_status !== 'paid') return; // unbezahlt → nichts zu sichern
  const meta = s.metadata || {};
  const email = s.customer_details?.email || s.customer_email || meta.email;
  const pkg = PACKAGES[meta.pkg] ? meta.pkg : 'basis';
  const isSub = s.mode === 'subscription' && !!s.subscription;
  await recordPaid({ eventId: event.id, sessionId: s.id, email, url: meta.url, pkg, amount: s.amount_total, customerId: s.customer || null, customerType: meta.customerType || '', consentTs: meta.consentTs || '' });
  if (isSub) {
    await recordSubscription({
      subscriptionId: s.subscription, customerId: s.customer || null,
      email, url: meta.url, company: meta.company || '', pkg
    });
  }
}

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
  // Rechnungsempfaenger-Daten aus dem Stripe-Checkout (billing_address_collection).
  // name/address sind leer, falls Stripe sie (noch) nicht geliefert hat → der Renderer
  // faellt dann defensiv auf company/email zurueck (keine Dopplung mehr).
  const billing = buildBillingRecipient(s, meta);

  // Zahlung + Subscription wurden bereits in prePersistCheckout (vor der Quittung)
  // durabel festgehalten. Hier startet direkt die Erfüllung.

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
      services.fulfillOrder({ url: meta.url, company: meta.company || '', email: email || '', pkg })
    );
    // Eigene Rechnung (§ 14 UStG) erzeugen — Fallback zur Stripe-Receipt-Mail.
    // Schlägt sie fehl, darf das die Report-Auslieferung NICHT blockieren.
    invoice = await safeGenerateInvoice({ orderId: s.id, email, company: meta.company || '', pkg, amount: s.amount_total, billing });
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
    // MF5: Den zahlenden Kunden NICHT im Schweigen lassen — Best-Effort-Eingangs-/
    // Verzögerungs-Notiz (kein PDF im FAILED-Fall). Eigener try/catch: ein Mail-Fehler
    // hier darf den Handler nicht kippen, Status bleibt FAILED. Gegen Doppelversand schützt
    // bereits die Webhook-Idempotenz (claimEvent) — dieser Handler läuft pro Event genau
    // einmal; customerNoticeSent ist nur eine sichtbare Markierung im Order-Record.
    try {
      if (isEmail(email)) {
        await sendDelayNotice({ to: email, company: meta.company || '' });
        await markStatus(s.id, 'FAILED', { customerNoticeSent: true });
      }
    } catch (noticeErr) {
      logger.warn({ sessionId: s.id, err: noticeErr.message }, 'Kunden-Verzögerungs-Notiz nicht gesendet');
    }
    sentry.captureException(err, { webhook_event: 'checkout.session.completed', session_id: s.id });
    logger.error({ sessionId: s.id, err: err.message }, 'ERFÜLLUNG FEHLGESCHLAGEN');
    return;
  }

  // Phase 2: Mailversand (sendReportFor → deliver mit 3× Retry/Backoff bei transienten Fehlern).
  // Subject/Anschreiben passend zum Paket (BFSG / Cookie / Re-Check).
  const emailKind = isSub ? PKG_CONFIG[pkg]?.emailKind || 'bfsg' : order.emailKind;
  try {
    await services.sendReportFor({
      to: email, company: meta.company || '',
      pdfPath: order.pdfPath, stmtPath: order.stmtPath,
      emailKind,
      diffText: diffSummaryText(order.diff),
      invoicePdfPath: invoice?.pdfPath || null,
      invoiceNumber: invoice?.invoiceNumber || null,
      customerType: meta.customerType || '',
      consentTs: meta.consentTs || ''
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
    // MF6: Bei ungültiger Adresse würde ein simpler Resend mit derselben Adresse erneut
    // werfen — daher hier eine spezifische Handlungsanweisung (Resend MIT korrigierter
    // Adresse) statt der generischen „nur Mail erneut senden"-Notiz.
    const badAddr = !isEmail(email);
    await sendAlert(
      badAddr
        ? `Bezahlt, Report fertig — Empfängeradresse ungültig: ${email}`
        : `Bezahlt, Report fertig — aber Mailversand fehlgeschlagen: ${email}`,
      badAddr
        ? `Session: ${s.id}\nURL: ${meta.url}\nPaket: ${pkg}\n` +
          `Die Adresse "${email}" ist nicht automatisch zustellbar. Report + Rechnung liegen vor.\n` +
          `Mit KORRIGIERTER Adresse erneut senden (kein Neuscan):\n` +
          `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"email":"KORREKTE@ADRESSE"}' ${PUBLIC_URL}/api/resend/${s.id}`
        : `Session: ${s.id}\nURL: ${meta.url}\nPaket: ${pkg}\nFehler: ${err.message}\n\n` +
          `Report + Rechnung liegen vor. NUR Mail erneut senden (kein Neuscan):\n` +
          `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/resend/${s.id}`
    );
    sentry.captureException(err, { webhook_event: 'checkout.session.completed', session_id: s.id, stage: 'mail' });
    logger.error({ sessionId: s.id, err: err.message }, 'MAILVERSAND FEHLGESCHLAGEN (Report fertig, READY_NOT_MAILED)');
  }
}

// Baut den Rechnungsempfaenger aus der Stripe-Checkout-Session. customer_details.name +
// .address sind gesetzt, sobald billing_address_collection:'required' im Checkout aktiv
// ist. Felder, die Stripe nicht liefert, bleiben leer — invoice.js rendert nur die
// vorhandenen Zeilen. company (Firmenname) kommt aus dem eigenen Checkout-Feld (Metadata).
function buildBillingRecipient(session, meta = {}) {
  const d = session.customer_details || {};
  const a = d.address || {};
  return {
    company: (meta.company || '').trim(),
    name: (d.name || '').trim(),
    line1: (a.line1 || '').trim(),
    line2: (a.line2 || '').trim(),
    postalCode: (a.postal_code || '').trim(),
    city: (a.city || '').trim(),
    country: (a.country || '').trim(),
    customerType: meta.customerType || ''
  };
}

// Rechnungs-Generierung gekapselt: Fehler werden geloggt + gemeldet, aber
// niemals propagiert — die Report-Auslieferung (das bezahlte Produkt) hat Vorrang.
async function safeGenerateInvoice({ orderId, email, company, pkg, amount, billing = null }) {
  try {
    return await services.generateInvoicePdf({ orderId, email, company, pkg, amount, billing });
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

// MF4: Stripe hat Invoice.subscription (Top-Level) ab API 2025-03-31 (Basil) entfernt.
// Die Subscription-ID kann seitdem an mehreren Stellen liegen. Diese reine, seiteneffekt-
// freie Funktion zieht sie robust aus allen bekannten Pfaden (oder null, falls keine da
// ist → handleInvoicePaid alarmiert dann statt still ins Leere zu laufen: Kunde wurde
// abgebucht, bekäme aber keinen Re-Check). Exportiert für den Unit-Test
// (test/resolve-subscription-id.test.js) gegen Basil-Fixtures.
export function resolveSubscriptionId(inv) {
  if (!inv) return null;
  return inv.subscription
    || inv.parent?.subscription_details?.subscription
    || inv.lines?.data?.[0]?.parent?.subscription_item_details?.subscription
    || null;
}

async function handleInvoicePaid(event) {
  const inv = event.data.object;
  // Erste Rechnung läuft bereits über checkout.session.completed — sonst Doppel-Scan.
  if (inv.billing_reason && inv.billing_reason !== 'subscription_cycle') {
    return;
  }
  // MF4: Subscription-ID robust aus mehreren möglichen Stellen beziehen, sonst läuft jeder
  // subscription_cycle bei neuer API-Version still ins Leere (Kunde abgebucht, kein Re-Check).
  const subId = resolveSubscriptionId(inv);
  if (!subId) {
    // NICHT still verschlucken — der Kunde wurde abgebucht, bekäme aber keinen Re-Check.
    await sendAlert(
      `invoice.paid ohne auffindbare Subscription-ID: ${inv.id || '?'}`,
      `Invoice: ${inv.id}\nbilling_reason: ${inv.billing_reason}\nRe-Check wurde NICHT ausgelöst — bitte manuell prüfen (ggf. Stripe-API-Version des Webhook-Endpoints pinnen).`
    );
    logger.error({ invoiceId: inv.id }, 'invoice.paid ohne auffindbare Subscription-ID');
    return;
  }

  const sub = await getSubscription(subId);
  if (!sub) {
    console.warn(`[webhook] invoice.paid für unbekannte Subscription ${subId} — übersprungen.`);
    return;
  }
  if (sub.status !== 'ACTIVE') {
    console.warn(`[webhook] invoice.paid für Subscription ${subId} mit Status ${sub.status} — übersprungen.`);
    return;
  }

  try {
    await assertPublicHttpUrl(sub.url);
    const order = await paidScanGate(() =>
      services.fulfillOrder({
        url: sub.url, company: sub.company || '', email: sub.email,
        pkg: sub.pkg || 'abo',
        prevSnapshot: sub.lastSnapshot || null
      })
    );
    // Monatsrechnung fürs Abo (§ 14 UStG) — Betrag aus der Stripe-Invoice.
    const cycleAmount = inv.amount_paid ?? inv.total ?? 0;
    const invoice = await safeGenerateInvoice({ orderId: inv.id || sub.subscriptionId, email: sub.email, company: sub.company || '', pkg: sub.pkg || 'abo', amount: cycleAmount });
    await services.sendReportFor({
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
    // MF5: auch beim Abo-Re-Check den zahlenden Kunden nicht im Schweigen lassen.
    try {
      if (isEmail(sub.email)) await sendDelayNotice({ to: sub.email, company: sub.company || '' });
    } catch (noticeErr) {
      logger.warn({ subscriptionId: sub.subscriptionId, err: noticeErr.message }, 'Abo-Verzögerungs-Notiz nicht gesendet');
    }
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
  // MF6: dieselbe (strengere) Validierung wie der Mailer (isEmail) — sonst passieren
  // Adressen den Checkout, die später beim Versand hart als „ungültig" werfen und das
  // bezahlte Produkt unzustellbar machen.
  if (cleanEmail && !isEmail(cleanEmail))
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
      // Name + Rechnungsanschrift erheben → landet in session.customer_details.{name,address}
      // (§ 14 UStG: Profi 399 € > 250 € erfordert Empfänger-Name+Anschrift). 'required'
      // erzwingt das Adressformular im Checkout fuer ALLE Pakete (einheitlich).
      billing_address_collection: 'required',
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

// Resend-Endpoint: bei Fulfillment-/Mail-Fehler Report nochmal ausliefern.
// SF2: atomarer In-Memory-Lock gegen parallele Doppel-Auslieferung (zwei Resends
// würden sonst doppelt mailen + zwei GoBD-Rechnungsnummern ziehen).
const resendInFlight = new Set();
app.post('/api/resend/:sessionId', requireAdminAuth, async (req, res) => {
  const { sessionId } = req.params;
  const { getOrder, markStatus } = await import('./lib/orders.js');
  // order = Snapshot von VOR dem RESENDING-Write (für mailOnly-Entscheidung + SF1-Rollback).
  const order = await getOrder(sessionId);
  if (!order) return res.status(404).json({ error: 'Session nicht gefunden' });
  if (order.status === 'MAILED' || order.status === 'RESENT') {
    return res.status(409).json({ error: `Order Status ${order.status} — bereits ausgeliefert.` });
  }
  // Optionale, admin-korrigierte Ziel-URL (analog overrideEmail): liefert eine bezahlte
  // Bestellung aus, deren bestellte URL kaputt ist (z. B. Apex 404/Cert-Fehler, echte
  // Seite www.*). SSRF-PFLICHT: über assertPublicHttpUrl validieren. BEWUSST VOR dem
  // Lock-Claim — schlägt die Validierung fehl, gibt es kein 400 mit gehaltenem Lock.
  let overrideUrl = null;
  if (req.body && req.body.url) {
    try {
      const safe = await assertPublicHttpUrl(String(req.body.url));
      overrideUrl = safe.url;
    } catch (e) {
      return res.status(400).json({ error: 'Korrigierte URL nicht erlaubt: ' + e.message });
    }
  }
  // Atomarer Claim: check-then-add OHNE await dazwischen ist im Single-Thread-Eventloop
  // atomar → zwei parallele Resends können nicht beide den Lock bekommen.
  if (resendInFlight.has(sessionId)) {
    return res.status(409).json({ error: 'Resend läuft bereits für diese Session' });
  }
  resendInFlight.add(sessionId);

  // MF6: optionale, admin-authentifizierte korrigierte Empfängeradresse — liefert eine
  // bezahlte Bestellung trotz im Checkout vertippter/unzustellbarer Adresse aus.
  const overrideEmail = (req.body && isEmail(req.body.email)) ? String(req.body.email).trim() : null;
  const recipient = overrideEmail || order.email;

  try {
    await markStatus(sessionId, 'RESENDING');

    // READY_NOT_MAILED (P1#3): Scan + Report + Rechnung sind bereits FERTIG, nur die
    // Mail kam nicht raus. Dann NUR die Mail erneut senden — kein Neuscan, keine neue
    // Rechnungsnummer. Alle nötigen Artefakt-Pfade liegen am Order-Record. Fällt ein
    // Pfad (z. B. nach Server-Neustart mit verlorenem out/-Volume), greift unten der
    // Voll-Resend-Fallback.
    // Bei korrigierter URL den mail-only-Fastpath erzwingen-überspringen: der vorhandene
    // Report gilt für die falsche/kaputte URL → voller Re-Scan gegen die neue URL.
    const mailOnly = !overrideUrl && order.status === 'READY_NOT_MAILED' && order.pdfPath;
    if (mailOnly) {
      await services.sendReportFor({
        to: recipient, company: order.company || '',
        pdfPath: order.pdfPath, stmtPath: order.stmtPath || null,
        emailKind: order.emailKind || 'bfsg',
        // Diff nicht persistiert; Re-Check-Mail zeigt dann „keine Veränderungen" — bei
        // Erstkäufen (basis/profi/cookie) ohnehin irrelevant, da kein Diff verwendet wird.
        diffText: '',
        invoicePdfPath: order.invoicePdfPath || null,
        invoiceNumber: order.invoiceNumber || null,
        // SF8: §356-V-BGB-Widerrufs-Verzicht-Bestätigung auch beim Resend mitschicken.
        customerType: order.customerType || '',
        consentTs: order.consentTs || ''
      });
      await markStatus(sessionId, 'RESENT', { pdfPath: order.pdfPath, invoiceNumber: order.invoiceNumber || null, resendMode: 'mail-only', resentTo: overrideEmail || undefined });
      return res.json({ ok: true, sessionId, email: recipient, status: 'RESENT', mode: 'mail-only' });
    }

    const result = await paidScanGate(() =>
      services.fulfillOrder({ url: overrideUrl || order.url, company: order.company || '', email: recipient, pkg: order.pkg || 'basis' })
    );
    // Rechnung nachreichen, falls bei der fehlgeschlagenen Erst-Auslieferung noch keine erzeugt wurde.
    const invoice = order.invoiceNumber
      ? null
      : await safeGenerateInvoice({ orderId: sessionId, email: recipient, company: order.company || '', pkg: order.pkg || 'basis', amount: order.amount });
    // GoBD (CORR-1): die frisch vergebene Rechnungsnummer SOFORT persistieren — VOR dem
    // Mailversand (spiegelt den INVOICED-Checkpoint des Haupt-Pfads, app.js handleCheckoutCompleted).
    // Sonst verbrennt ein Mail-Fehler die Nummer: der SF1-Rollback schreibt sie nicht in den
    // Order-Record, und der nächste Resend zöge eine ZWEITE Nummer für denselben Verkauf
    // (übersprungene/doppelte GoBD-Nummer). markStatus merget gegen den persistierten Record,
    // sodass die Nummer auch den anschließenden Rollback-Write übersteht.
    if (invoice?.invoiceNumber) {
      await markStatus(sessionId, 'INVOICED', { invoiceNumber: invoice.invoiceNumber, invoicePdfPath: invoice.pdfPath || null });
    }
    await services.sendReportFor({
      to: recipient, company: order.company || '',
      pdfPath: result.pdfPath, stmtPath: result.stmtPath,
      emailKind: result.emailKind || 'bfsg',
      diffText: diffSummaryText(result.diff),
      // Bereits erzeugte Rechnung (Nummer + PDF) wiederverwenden statt neu zu ziehen.
      invoicePdfPath: invoice?.pdfPath || order.invoicePdfPath || null,
      invoiceNumber: invoice?.invoiceNumber || order.invoiceNumber || null,
      customerType: order.customerType || '',
      consentTs: order.consentTs || ''
    });
    await markStatus(sessionId, 'RESENT', { pdfPath: result.pdfPath, invoiceNumber: invoice?.invoiceNumber || order.invoiceNumber || null, resentTo: overrideEmail || undefined, correctedUrl: overrideUrl || undefined });
    return res.json({ ok: true, sessionId, email: recipient, status: 'RESENT' });
  } catch (err) {
    // SF1: Status NICHT in RESENDING hängen lassen — auf den fachlich korrekten
    // Vorzustand zurücksetzen (READY_NOT_MAILED wenn ein fertiges Report-PDF vorlag,
    // sonst FAILED), damit ein erneuter Resend wieder greift + der Reconcile-Sweeper
    // nicht bei jedem Neustart Alarm schlägt.
    try { await markStatus(sessionId, order.pdfPath ? 'READY_NOT_MAILED' : 'FAILED', { error: err.message }); } catch { /* Persistenz-Fehler nur loggen */ }
    logger.error({ sessionId, err: err.message }, 'resend Fehler');
    sentry.captureException(err, { stage: 'resend', session_id: sessionId });
    return res.status(500).json({ error: err.message });
  } finally {
    resendInFlight.delete(sessionId);
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

// Reconcile-Sweeper: beim Start nicht-terminale Bestellungen aufspüren und den
// Operator alarmieren. Schließt das Restart-Loch (Webhook quittiert nach durabler
// Order-Persistenz, arbeitet dann asynchron — ein Crash mitten in der Erfüllung
// hinterlässt eine PAID/FULFILLING/READY_NOT_MAILED-Order, die hier sichtbar wird).
// BEWUSST nur Alarm, KEIN Auto-Resend: ein automatischer Wiederversand könnte mit dem
// manuellen Resend-Endpoint oder einer real bereits zugestellten Mail kollidieren und
// eine zweite Rechnungs-Mail (§14) erzeugen. Recovery läuft über /api/resend (mit
// eigenem RESENDING-Guard; Mail-only bei READY_NOT_MAILED). FAILED ist beim Fehler
// bereits alarmiert worden → hier ausgelassen, sonst Alarm-Spam bei jedem Neustart.
async function reconcileOnStartup() {
  if (!isStripeLive()) return; // nur im Live-Betrieb relevant
  try {
    const { listOrders } = await import('./lib/orders.js');
    const all = await listOrders({ limit: 1000 });
    const TERMINAL = new Set(['MAILED', 'RESENT', 'CANCELLED', 'FAILED']);
    const stuck = all
      .filter((o) => o.status && !TERMINAL.has(o.status))
      .map((o) => `${o.sessionId} — ${o.status} (${o.email || '?'}, ${o.url || '?'})`);
    if (stuck.length) {
      await sendAlert(
        `Reconcile beim Start: ${stuck.length} haengende Bestellung(en)`,
        `Diese Bestellungen sind NICHT im Endzustand (MAILED/RESENT/CANCELLED) und brauchen Aufmerksamkeit:\n\n` +
        stuck.join('\n') +
        `\n\nNachliefern je Session (Resend-Endpoint waehlt automatisch Mail-only bei READY_NOT_MAILED, sonst Voll-Resend):\n` +
        `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/resend/<sessionId>`
      );
      logger.warn({ stuck: stuck.length }, 'Reconcile: haengende Bestellungen gemeldet');
    }
  } catch (err) {
    logger.error({ err: err.message }, 'Reconcile-Sweeper fehlgeschlagen (Start wird fortgesetzt)');
  }
}

// Export für die Test-Harness (supertest greift die echte App ab, ohne zu binden).
export { app };

// Nur im Direkt-Start (`node app.js`) den Listener binden — beim Import (Tests) nicht.
if (isMain) {
  const server = app.listen(PORT, () => {
    logger.info(
      { publicUrl: PUBLIC_URL, stripe: !!stripe, abo: ENABLE_ABO, mailer: mailerStatus() },
      `BFSG-Audit-Server auf ${PUBLIC_URL}`
    );
    // Nicht-blockierend: Server ist sofort bereit, Reconcile läuft im Hintergrund.
    reconcileOnStartup();
  });
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}
