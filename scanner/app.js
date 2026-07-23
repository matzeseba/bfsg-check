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
  sendLeadTeaser, sendOwnerReview, sendOrderReceived, sendKuendigungEingang, sendWiderrufEingang, isTransientMailError,
  mailerStatus, requireMailerOrExit, isStripeLive, isEmail,
  sendSequenceStep, isOnboardingWerbungEnabled
} from './lib/mailer.js';
import * as reportQueue from './lib/report-queue.js';
import * as leadQueue from './lib/lead-queue.js';
import { startScheduler, releaseJob, recoverInDoubt } from './lib/scheduler.js';
import { scheduleTrack, cancelBySource, processDue, startOnboardingTicker } from './lib/onboarding.js';
import { signRelease, verifyRelease, releaseTokenConfigured } from './lib/release-token.js';
import { signLead, verifyLead, leadTokenConfigured } from './lib/lead-token.js';
import { randomBytes } from 'node:crypto';
import { requireAdminAuth } from './lib/admin-auth.js';
import { exportUserData, deleteUserData, requestDsgvoToken, consumeDsgvoToken } from './lib/dsgvo.js';
import { diffSummaryText } from './lib/diff.js';
import { generateInvoicePdf, invoiceConfigStatus } from './lib/invoice.js';
import { assertPublicHttpUrl } from './lib/url-guard.js';
import { rateLimit, concurrencyGate } from './lib/limits.js';
import { claimEvent, releaseEvent, recordPaid, markStatus, hasPaidReportFor } from './lib/orders.js';
import {
  recordSubscription, saveSnapshot, getSubscription, markCancelled, markSubscriptionStatus,
  listSubscriptions
} from './lib/subscriptions.js';
import logger, { httpLog } from './lib/logger.js';
import sentry from './lib/sentry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const ENABLE_ABO = process.env.ENABLE_ABO === 'true'; // Abo standardmäßig AUS, bis Webhook-Endpoint aktiv getestet.
// Abo-Tier-Modell „Fuchs Re-Check" (ENTWURF, marketing/swarm-2026-07-23/agent-01-pricing-offer.md):
// Starter/Pro/Business + Report-Gate + Startpaket. Default AUS — ohne dieses Flag
// ändert sich am Live-Verhalten NICHTS: 'abo'/'abo-jahr' bleiben frei buchbar
// (kein Gate), und die neuen Paket-IDs existieren im Checkout gar nicht.
const ABO_TIERS_ENABLED = process.env.ABO_TIERS_ENABLED === 'true';

// Onboarding- & Dunning-Sequenzen (agent-09, marketing/swarm-2026-07-23/
// agent-09-retention-moat.md): Onboarding-Mails an Käufer (Track A = Report,
// Track B = Abo) + Kunden-Dunning bei Zahlungsausfall (D1–D3, bisher nur
// Owner-Alert). Default AUS — Scharfschaltung ist ein Owner-Entscheid.
// Exportiert für den Flag-Default-Test (test/onboarding.test.js).
// Werbliche Mails (A5, Jahres-Absatz in B5, § 7 Abs. 3 UWG) hängen am
// separaten Flag ONBOARDING_WERBUNG_ENABLED (mailer.js, Default ebenfalls AUS).
export const ONBOARDING_ENABLED = process.env.ONBOARDING_ENABLED === 'true';

// PR5 Owner-Release-Gate: fertige Reports werden vor Auslieferung dem Owner zur
// Freigabe gemailt (1-Klick-Link) und bei Ablauf des Fensters automatisch versendet.
// Default AN (Owner-Wunsch: jeder Report wird gesichtet). Flag=false → sofortiger
// Auto-Versand wie zuvor (dann müssen die „menschlich geprüft"-Claims wahr formuliert sein).
const RELEASE_GATE_ENABLED = process.env.REPORT_RELEASE_GATE_ENABLED !== 'false';
// Auto-Release-Fenster in Minuten (Owner-Vorgabe: 90 Min nach Versand der Freigabe-Mail).
const RELEASE_DELAY_MIN = Math.max(0, Number(process.env.RELEASE_DELAY_MIN) || 90);

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
// createCheckoutSession gehört mit in die Naht: so testet test/checkout.api.test.js die
// echte /api/checkout-Route (Paket-/Consent-Validierung, price_data, interval) ohne
// Netz-Call zu Stripe.
export const services = {
  fulfillOrder, sendReportFor, generateInvoicePdf, sendOwnerReview, sendOrderReceived, sendLeadTeaser, reportQueue,
  createCheckoutSession: (params) => stripe.checkout.sessions.create(params)
};

// Gebündelte Abhängigkeiten für den Release-Scheduler + den /api/release-Endpoint.
// Beide Wege (Auto-Release bei Ablauf, Owner-Klick) laufen durch dieselbe releaseJob-
// Logik → atomarer Claim → genau ein Versand. services.X wird zur Laufzeit gelesen
// (Test-Überschreibung wirkt sofort).
function releaseDeps(via = 'auto') {
  return {
    reportQueue: services.reportQueue,
    sendReportFor: (args) => services.sendReportFor(args),
    markStatus,
    sendAlert,
    isTransientMailError,
    logger,
    via,
    // Onboarding Track A: Anker ist die AUSLIEFERUNG (Tag 1 danach), nicht die
    // Zahlung — der Hook feuert erst nach erfolgreichem Report-Versand.
    onDelivered: maybeScheduleTrackA
  };
}

// --- Onboarding/Dunning: Verdrahtung der Sequenz-Engine (lib/onboarding.js) --
// Track A nur für BFSG-Erstreports (basis/profi/startpaket-*): die agent-09-
// Texte beziehen sich auf den WCAG-Report + Erklärungs-Vorlage. Cookie-Reports
// und Abo-Re-Checks (emailKind 'cookie'/'recheck') bekommen KEINE A-Sequenz.
function maybeScheduleTrackA({ sessionId, to, company = '', emailKind }) {
  if (!ONBOARDING_ENABLED || emailKind !== 'bfsg' || !isEmail(to)) return Promise.resolve(false);
  return scheduleTrack({ track: 'A', email: to, company, sourceId: sessionId })
    .then((r) => r.scheduled)
    .catch((err) => {
      logger.warn({ sessionId, err: err.message }, 'Onboarding-Plan (Track A) nicht angelegt');
      return false;
    });
}

// Laufzeit-Deps für processDue/startOnboardingTicker. sendStep geht über die
// mailer-Fassade (dispatcht A/B/D-Builder); der Werbungs-Flag wird pro Versand
// gelesen (kein Load-Capture); der Dunning-Guard prüft den lokalen Sub-Status.
function onboardingDeps() {
  return {
    sendStep: ({ record, step }) => sendSequenceStep({
      to: record.email,
      company: record.company || '',
      step,
      werbung: isOnboardingWerbungEnabled(),
      abbuchungsZeile: record.abbuchungsZeile || '',
      // Sicherer Aktualisierungs-Link (z. B. Stripe Customer Portal) existiert
      // noch nicht — Fallback im Mailtext: Reply-Satz (agent-09-Vorgabe).
      zahlungsLink: process.env.DUNNING_PAYMENT_LINK || ''
    }),
    isDunningActive: async (record) => {
      const sub = await getSubscription(record.sourceId);
      return !!sub && sub.status === 'PAST_DUE';
    },
    sendAlert,
    logger
  };
}

// Intervall-/Betragsphrase für Dunning-Mail D1 — aus PACKAGES[pkg] gebaut,
// damit Jahres-Abos (249 €) und künftige Tiers keinen falschen Monatsbetrag
// nennen (agent-09-Text geht vom Starter-Monatsabo aus).
function abbuchungsZeileFor(pkg) {
  const cfg = PACKAGES[pkg];
  if (!cfg) return '';
  const betrag = (cfg.amount / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  return cfg.interval === 'year'
    ? `die jährliche Abbuchung für Ihren Re-Check (${betrag})`
    : `die monatliche Abbuchung für Ihren Re-Check (${betrag})`;
}

// Fertigen Report zur Freigabe einqueuen + Owner-Review-Mail (best-effort) senden.
// Gemeinsam für den Erstkauf (handleCheckoutCompleted) und den Abo-Re-Check
// (handleInvoicePaid). Wirft NIE — der Report ist bereits durabel persistiert.
async function enqueueForRelease({ sessionId, to, company = '', url = '', pkg = '', order, invoice = null, emailKind, customerType = '', consentTs = '', sendReceipt = false }) {
  const releaseAt = new Date(Date.now() + RELEASE_DELAY_MIN * 60_000).toISOString();
  try {
    await services.reportQueue.enqueue({
      sessionId,
      to,
      company,
      url,
      pkg,
      emailKind,
      pdfPath: order.pdfPath,
      stmtPath: order.stmtPath || null,
      diffText: diffSummaryText(order.diff),
      invoicePdfPath: invoice?.pdfPath || null,
      invoiceNumber: invoice?.invoiceNumber || null,
      customerType,
      consentTs,
      releaseAt
    });
    await markStatus(sessionId, 'RELEASE_SCHEDULED', {
      // F25: email mitschreiben — für Abo-Re-Check-Zyklen (sessionId=cycleKey) ist dies
      // der EINZIGE Schreibpfad, der order.email setzt (kein recordPaid für Zyklen). Ohne
      // sie liefert der dokumentierte Recovery-Befehl /api/resend/<sessionId> mit
      // "Ungültige Empfängeradresse: undefined" einen 500er.
      email: to,
      pdfPath: order.pdfPath,
      invoiceNumber: invoice?.invoiceNumber || null,
      releaseAt
    });
  } catch (err) {
    // Enqueue/Persistenz fehlgeschlagen (z. B. Volume voll/EACCES): der Report ist erzeugt,
    // liegt aber NICHT in der Freigabe-Queue. SOFORT alarmieren (nicht erst beim Neustart)
    // + READY_NOT_MAILED, damit /api/resend ihn Mail-only nachliefern kann.
    logger.error({ sessionId, err: err.message }, 'Report-Enqueue fehlgeschlagen');
    sentry.captureException(err, { stage: 'enqueueForRelease', session_id: sessionId });
    try {
      await markStatus(sessionId, 'READY_NOT_MAILED', {
        error: `enqueue: ${err.message}`,
        email: to, // F25: siehe Kommentar oben (RELEASE_SCHEDULED)
        pdfPath: order.pdfPath,
        stmtPath: order.stmtPath || null,
        emailKind,
        invoiceNumber: invoice?.invoiceNumber || null,
        invoicePdfPath: invoice?.pdfPath || null
      });
    } catch { /* Persistenz-Folgefehler nur best-effort */ }
    await sendAlert(
      `Report-Enqueue fehlgeschlagen: ${to}`,
      `Session: ${sessionId}\nFehler: ${err.message}\n\nReport + Rechnung liegen vor. NUR Mail erneut senden (kein Neuscan):\n` +
      `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/resend/${sessionId}`
    );
    return;
  }
  // Owner-Freigabe-Mail (best-effort; scheitert sie, greift trotzdem der Auto-Release).
  try {
    const token = signRelease(sessionId);
    const releaseUrl = releaseTokenConfigured() ? `${PUBLIC_URL}/api/release/${encodeURIComponent(sessionId)}?token=${token}` : '';
    await services.sendOwnerReview({
      sessionId, customerEmail: to, url, company, pkg,
      summary: order.scan ? `Befunde: ${order.scan.violations?.length ?? '?'} · Seiten: ${order.scan.pagesScanned ?? 1}` : '',
      releaseUrl, releaseAt,
      pdfPath: order.pdfPath, stmtPath: order.stmtPath || null, invoicePdfPath: invoice?.pdfPath || null
    });
  } catch (err) {
    logger.warn({ sessionId, err: err.message }, 'Owner-Review-Mail nicht gesendet (Auto-Release bleibt aktiv)');
  }
  // Kunden-Eingangsbestätigung (nur Erstkauf; Abo-Re-Checks brauchen keine).
  if (sendReceipt) {
    try { await services.sendOrderReceived({ to, company }); }
    catch (err) { logger.warn({ sessionId, err: err.message }, 'Eingangsbestätigung nicht gesendet'); }
  }
}

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
    ? {
        abo: { name: 'BFSG Re-Check Abo', amount: 2499, mode: 'subscription', interval: 'month' },
        // Jahresoption (Owner-Entscheidung 249 €/Jahr, Exp. 4): gleiche Leistung wie 'abo',
        // nur jährliche Abrechnung. inline price_data → keine Stripe-Dashboard-Aktion nötig.
        'abo-jahr': { name: 'BFSG Re-Check Abo (jährlich)', amount: 24900, mode: 'subscription', interval: 'year' }
      }
    : {}),
  // --- Fuchs-Re-Check-Tiers Pro/Business + Startpakete (agent-01, d2/d7) ---------
  // EINFÜHRUNGSPREISE bis 30.09.2026 (Starter 24,99 € = 'abo' oben, unverändert —
  // Grandfathering d8: Bestands-Subscriptions in Stripe bleiben unangetastet).
  // Reguläre Preise ab 01.10.2026 (Starter 29/290 €, Pro 79/790 €, Business
  // 149/1.490 €) kommen in einem separaten Preis-Umstellungs-PR (bindende Frist,
  // Owner-Kalender 25.09.2026) — die Preis-Sync-CI erzwingt die config.ts-Spiegelung.
  ...(ENABLE_ABO && ABO_TIERS_ENABLED
    ? {
        'abo-pro':           { name: 'Fuchs Re-Check Pro',                    amount:  6900, mode: 'subscription', interval: 'month' },
        'abo-pro-jahr':      { name: 'Fuchs Re-Check Pro (jährlich)',         amount: 69000, mode: 'subscription', interval: 'year' },
        'abo-business':      { name: 'Fuchs Re-Check Business',               amount: 12900, mode: 'subscription', interval: 'month' },
        'abo-business-jahr': { name: 'Fuchs Re-Check Business (jährlich)',    amount: 129000, mode: 'subscription', interval: 'year' },
        // Startpaket (agent-01, d1 Szenario E + d10.2): Erst-Report + 1. Re-Check-
        // Monat inklusive. amount = REPORT-Preis (einmalig, heute fällig); das
        // Tier-Abo startet mit 30 Tagen Trial (= 1. Monat inklusive) und läuft ab
        // Monat 2 zum Tier-Preis. reportName = Produktname der Einmalposition.
        'startpaket-basis':  { name: 'Startpaket: BFSG-Report Basis + 1. Re-Check-Monat', reportName: 'BFSG-Report Basis', amount: 12900, mode: 'subscription', interval: 'month', startpaket: true },
        'startpaket-profi':  { name: 'Startpaket: BFSG-Report Profi + 1. Re-Check-Monat', reportName: 'BFSG-Report Profi', amount: 39900, mode: 'subscription', interval: 'month', startpaket: true }
      }
    : {})
};

// Optionale Stripe-Preis-IDs für die neuen Tier-/Startpaket-Pakete (ENTWURF).
// Standard: inline price_data aus PACKAGES (wie bei 'abo' — KEINE Stripe-Dashboard-
// Vorarbeit nötig; Preis-SSOT bleibt diese Datei ↔ landingpage-next/lib/config.ts,
// die Preis-Sync-CI wacht über die Spiegelung).
// TODO: Owner legt Stripe-Produkte/-Preise an (Tabelle im PR) und trägt die IDs in
// der Server-.env ein — eine gesetzte ID ersetzt dann die inline price_data beim
// Checkout (Vorbereitung für Portal-Tier-Wechsel Starter→Pro→Business, d4-FAQ).
const STRIPE_PRICE = {
  'abo-pro':           process.env.STRIPE_PRICE_ABO_PRO_MONTH      || null, // TODO: Owner legt Stripe-Produkt an
  'abo-pro-jahr':      process.env.STRIPE_PRICE_ABO_PRO_YEAR       || null, // TODO: Owner legt Stripe-Produkt an
  'abo-business':      process.env.STRIPE_PRICE_ABO_BUSINESS_MONTH || null, // TODO: Owner legt Stripe-Produkt an
  'abo-business-jahr': process.env.STRIPE_PRICE_ABO_BUSINESS_YEAR  || null, // TODO: Owner legt Stripe-Produkt an
  // Einmalpositionen der Startpaket-Reports (die Tier-Subscriptions nutzen die IDs oben).
  'startpaket-basis':  process.env.STRIPE_PRICE_STARTPAKET_BASIS   || null, // TODO: Owner legt Stripe-Produkt an
  'startpaket-profi':  process.env.STRIPE_PRICE_STARTPAKET_PROFI   || null  // TODO: Owner legt Stripe-Produkt an
};

// Report-Gate (agent-01, d10.1): diese Pakete setzen einen bezahlten Erst-Report
// (basis/profi, ggf. via Startpaket) auf derselben E-Mail voraus — alle Re-Check-
// Abo-Varianten inkl. 'abo'/'abo-jahr' (= Starter). NICHT enthalten: die
// Startpakete selbst (sie sind der Einstieg OHNE Report — der Report ist inklusive).
const REPORT_GATE_PACKAGES = new Set(['abo', 'abo-jahr', 'abo-pro', 'abo-pro-jahr', 'abo-business', 'abo-business-jahr']);
// Wählbare Tiers beim Startpaket (Body-Feld/metadata.tier; Default Starter 'abo').
const STARTPAKET_TIERS = new Set(['abo', 'abo-pro', 'abo-business']);

// Baut das Stripe-Line-Item für ein Paket: eine gesetzte Stripe-Preis-ID
// (STRIPE_PRICE oben) schlägt die inline price_data; Default ist inline (wie 'abo').
function lineItemFor(pkgKey) {
  const p = PACKAGES[pkgKey];
  if (STRIPE_PRICE[pkgKey]) return { price: STRIPE_PRICE[pkgKey], quantity: 1 };
  const recurring = p.mode === 'subscription' ? { recurring: { interval: p.interval } } : {};
  return { price_data: { currency: 'eur', product_data: { name: p.name }, unit_amount: p.amount, ...recurring }, quantity: 1 };
}

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
    // F8: checkout.session.async_payment_succeeded ist das Pendant zu .completed für
    // asynchrone Zahlarten (SEPA-Lastschrift, „Sofort"-Varianten) — bei denen feuert
    // .completed zuerst MIT payment_status='unpaid' (prePersistCheckout tut dann noch
    // nichts), und erst der spätere async_payment_succeeded-Event trägt payment_status
    // 'paid'. Dieselbe Vor-Persistenz wie beim Sync-Pfad, sonst bleibt die Zahlung spurlos.
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
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
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await handleCheckoutCompleted(event);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      await handleAsyncPaymentFailed(event);
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
  // F24: gegen PKG_CONFIG validieren (immer alle 6 Pakete), NICHT gegen das
  // ENABLE_ABO-gefilterte PACKAGES — sonst koerziert ein zwischenzeitlich gekipptes
  // ENABLE_ABO ein bezahltes Abo still auf 'basis'.
  const pkg = PKG_CONFIG[meta.pkg] ? meta.pkg : 'basis';
  const isSub = s.mode === 'subscription' && !!s.subscription;
  await recordPaid({ eventId: event.id, sessionId: s.id, email, url: meta.url, pkg, amount: s.amount_total, customerId: s.customer || null, customerType: meta.customerType || '', consentTs: meta.consentTs || '' });
  if (isSub) {
    // Startpaket (Abo-Tiers): die Subscription läuft auf dem GEWÄHLTEN TIER
    // (session-metadata.tier), nicht auf dem Startpaket-Kürzel — der lokale
    // Subscription-Datensatz steuert Scan-Tiefe (PKG_CONFIG) und Rechnungstext
    // aller Re-Check-Zyklen ab Monat 2. Der Order-Record (recordPaid oben) bleibt
    // beim Verkaufskürzel 'startpaket-*' (buchhalterische Wahrheit: Report-Verkauf).
    const subPkg = meta.pkg && meta.pkg.startsWith('startpaket')
      ? (STARTPAKET_TIERS.has(meta.tier) ? meta.tier : 'abo')
      : pkg;
    await recordSubscription({
      subscriptionId: s.subscription, customerId: s.customer || null,
      email, url: meta.url, company: meta.company || '', pkg: subPkg
    });
    // Onboarding Track B (agent-09): Anker = Abo-Start (Tag 0). Best-effort —
    // ein Fehler hier darf die Zahlungs-/Subscription-Persistenz nie kippen.
    if (ONBOARDING_ENABLED && isEmail(email)) {
      scheduleTrack({ track: 'B', email, company: meta.company || '', sourceId: s.subscription })
        .catch((err) => logger.warn({ subscriptionId: s.subscription, err: err.message }, 'Onboarding-Plan (Track B) nicht angelegt'));
    }
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
  if (meta.pkg && !PKG_CONFIG[meta.pkg]) {
    // F24: unbekanntes Paket-Kuerzel NICHT still auf 'basis' koerzieren, ohne es zu
    // melden (z. B. wenn ENABLE_ABO zwischen Checkout und Webhook-Zustellung kippt).
    // Fulfillment laeuft trotzdem als 'basis' (Kunde geht nicht leer aus), der Owner
    // muss die Fehlkonfiguration aber sehen.
    await sendAlert(
      `Unbekanntes Paket "${meta.pkg}" bei Session ${s.id} — als Basis erfüllt`,
      `Session: ${s.id}\nPaket laut Metadata: ${meta.pkg}\nBezahlter Betrag: ${s.amount_total}\n` +
      `PKG_CONFIG kennt dieses Paket nicht. Fulfillment läuft als 'basis' — bitte prüfen, ob das dem gekauften Leistungsumfang entspricht.`
    );
    logger.error({ sessionId: s.id, pkg: meta.pkg }, 'Unbekanntes Paket-Kürzel — als basis erfüllt');
  }
  const pkg = PKG_CONFIG[meta.pkg] ? meta.pkg : 'basis';
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
      `Session: ${s.id}\nURL: ${meta.url}\nPaket: ${pkg}\nFehler: ${err.message}\n\nManuell nachliefern: curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/resend/${s.id}` +
      tlsRetryHint(err, s.id)
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

  // Phase 2: Auslieferung. Subject/Anschreiben passend zum Paket (BFSG / Cookie / Re-Check).
  const emailKind = isSub ? PKG_CONFIG[pkg]?.emailKind || 'bfsg' : order.emailKind;

  // PR5 Owner-Release-Gate: statt sofort zu mailen, den fertigen Report zur Freigabe
  // einqueuen (Owner-Mail + 90-Min-Auto-Release). So wird jeder Report vor Auslieferung
  // gesichtet (Claim „menschlich geprüft" bleibt wahr). Idempotenz: der Report ist über
  // INVOICED durabel; enqueue schreibt den Job, der Scheduler/Owner-Klick versendet.
  if (RELEASE_GATE_ENABLED) {
    await enqueueForRelease({
      sessionId: s.id, to: email, company: meta.company || '', url: meta.url, pkg,
      order, invoice, emailKind,
      customerType: meta.customerType || '', consentTs: meta.consentTs || '',
      sendReceipt: true
    });
    logger.info({ sessionId: s.id, pkg, releaseInMin: RELEASE_DELAY_MIN }, 'Report zur Owner-Freigabe eingequeut');
    return;
  }

  // Gate aus: sofortiger Mailversand (sendReportFor → deliver mit 3× Retry/Backoff).
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
    // Onboarding Track A (Gate-AUS-Pfad): Anker = Auslieferung (Tag 1 danach).
    await maybeScheduleTrackA({ sessionId: s.id, to: email, company: meta.company || '', emailKind });
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

// F8: SEPA/„Sofort"-Zahlarten können statt eines Erfolgs mit .async_payment_failed
// scheitern — der Kunde wurde NICHT belastet, also gibt es nichts zu erfüllen. Nur den
// Owner informieren (z. B. um bei wiederholten Fehlschlägen die aktivierten Payment-
// Methods im Stripe-Dashboard zu prüfen).
async function handleAsyncPaymentFailed(event) {
  const s = event.data.object;
  const meta = s.metadata || {};
  const email = s.customer_details?.email || s.customer_email || meta.email;
  await sendAlert(
    `Asynchrone Zahlung fehlgeschlagen: ${email || s.id}`,
    `Session: ${s.id}\nURL: ${meta.url || '?'}\nPaket: ${meta.pkg || '?'}\n` +
    `Die Zahlung (z. B. SEPA-Lastschrift) ist fehlgeschlagen — der Kunde wurde nicht belastet, keine Erfüllung nötig.`
  );
  logger.warn({ sessionId: s.id }, 'Asynchrone Zahlung fehlgeschlagen');
}

// F22: TLS-/Zertifikatsfehler im bezahlten Scan-Pfad sind oft per lenientTls-Override
// im Resend nachlieferbar (Admin-only) — Hinweis im Owner-Alarm ergänzen, statt nur auf
// das globale SCAN_PAID_LENIENT_TLS-Env zu verweisen.
function tlsRetryHint(err, resendId) {
  if (classifyScanError(err.message).reason !== 'tls') return '';
  return `\n\nHinweis: TLS-/Zertifikatsfehler erkannt — Nachlieferung ggf. mit gelockerter TLS-Prüfung möglich:\n` +
    `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"lenientTls":true}' ${PUBLIC_URL}/api/resend/${resendId}`;
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

  let sub = await getSubscription(subId);
  if (!sub) {
    // NICHT still verschlucken (F9) — der Kunde wurde abgebucht, bekäme aber keinen Re-Check.
    await sendAlert(
      `invoice.paid für unbekannte Subscription: ${subId}`,
      `Invoice: ${inv.id}\nSubscription: ${subId}\nKeine lokale Subscription gefunden — Re-Check wurde NICHT ausgelöst. Bitte manuell prüfen.`
    );
    logger.error({ subscriptionId: subId, invoiceId: inv.id }, 'invoice.paid für unbekannte Subscription');
    return;
  }
  if (sub.status !== 'ACTIVE') {
    // F9: invoice.paid ist der Zahlungsbeweis — bei Dunning-Recovery (past_due -> Zahlung
    // klappt wieder) kann dieses Event VOR customer.subscription.updated(active) eintreffen
    // (keine garantierte Reihenfolge). Den lokalen Status auf Basis der bezahlten Rechnung
    // synchronisieren, statt den bezahlten Zyklus gegen einen ggf. veralteten Spiegel-Status
    // stillschweigend zu verwerfen.
    sub = (await markSubscriptionStatus(subId, 'active')) || sub;
    if (sub.status !== 'ACTIVE') {
      await sendAlert(
        `invoice.paid trotz nicht aktivierbarer Subscription: ${subId}`,
        `Invoice: ${inv.id}\nLokaler Status: ${sub.status}\nRe-Check wurde NICHT ausgelöst. Bitte manuell prüfen.`
      );
      logger.error({ subscriptionId: subId, status: sub.status }, 'invoice.paid: Subscription bleibt nicht-aktiv nach Sync-Versuch');
      return;
    }
  }

  // Queue-Key = Invoice-ID (pro Zyklus eindeutig; Abo-Zyklen liegen nicht in orders.js).
  const cycleKey = inv.id || `${sub.subscriptionId}-${Date.now()}`;
  // Zyklus-Rechnung fürs Abo (§ 14 UStG) — Betrag aus der Stripe-Invoice. Läuft NACH
  // erfolgreichem Scan (wie zuvor: kein Rechnungs-/Nummernverbrauch bei Scan-Fehler).
  const makeInvoice = () => safeGenerateInvoice({
    orderId: inv.id || sub.subscriptionId, email: sub.email, company: sub.company || '',
    pkg: sub.pkg || 'abo', amount: inv.amount_paid ?? inv.total ?? 0
  });

  try {
    // F21: event.id durchreichen — runSubscriptionRecheck persistiert ihn VOR dem Scan
    // durabel (RECHECK_STARTED), damit eine invoice.paid-Redelivery nach einem Neustart
    // (claimEvent ist nur in-memory dedupliziert) nicht erneut scannt/rechnet/mailt.
    await runSubscriptionRecheck(sub, { cycleKey, eventId: event.id, makeInvoice });
  } catch (err) {
    await markStatus(cycleKey, 'RECHECK_FAILED', { error: err.message }).catch(() => {});
    // Alle Monats-Varianten haben den Retry-Pfad; Jahres-Pakete ('*-jahr', jetzt
    // auch abo-pro-jahr/abo-business-jahr) laufen über den Ticker-Fallback.
    const isMonthly = !String(sub.pkg || '').endsWith('-jahr');
    await sendAlert(
      `Re-Check fehlgeschlagen: ${sub.email}`,
      `Subscription: ${sub.subscriptionId}\nURL: ${sub.url}\nFehler: ${err.message}` +
      tlsRetryHint(err, cycleKey) +
      (isMonthly ? `\n\nAutomatischer Retry in ~${Math.round(MONTHLY_RECHECK_RETRY_MS / 60000)} Min.` : '')
    );
    // MF5: auch beim Abo-Re-Check den zahlenden Kunden nicht im Schweigen lassen.
    try {
      if (isEmail(sub.email)) await sendDelayNotice({ to: sub.email, company: sub.company || '' });
    } catch (noticeErr) {
      logger.warn({ subscriptionId: sub.subscriptionId, err: noticeErr.message }, 'Abo-Verzögerungs-Notiz nicht gesendet');
    }
    sentry.captureException(err, { webhook_event: 'invoice.paid', subscription_id: sub.subscriptionId });
    logger.error({ subscriptionId: sub.subscriptionId, err: err.message }, 'RE-CHECK FEHLGESCHLAGEN');
    // F27: Monats-Abo hat (anders als 'abo-jahr') keinen eigenen Ticker-Fallback —
    // GENAU EIN automatischer Retry, danach Owner-Alarm mit funktionierendem Re-Trigger.
    if (isMonthly) scheduleMonthlyRecheckRetry(sub, { cycleKey, makeInvoice });
  }
}

// Gemeinsamer Re-Check-Kern für BEIDE Auslöser: invoice.paid (Monats-Abo: monatlich;
// Jahres-Abo: die eine Jahresrechnung) und den Jahres-Abo-Ticker (siehe unten).
// makeInvoice ist optional — der Ticker erzeugt KEINE Rechnung (es gibt keine Zahlung
// im Zwischenmonat; die Jahresrechnung entsteht beim invoice.paid der Jahreszahlung).
async function runSubscriptionRecheck(sub, { cycleKey, makeInvoice = null, eventId = null }) {
  await assertPublicHttpUrl(sub.url);
  // F20/F26/F21: durable Spur VOR dem (minutenlangen) Scan schreiben. Überlebt ein
  // Crash/Deploy mitten im Re-Check, bleibt der Order-Record auf RECHECK_STARTED stehen —
  // der Reconcile-Sweeper (reconcileOnStartup) meldet das beim nächsten Start (nach einer
  // Karenzzeit). Zusätzlich persistiert eine übergebene event.id (invoice.paid) durabel:
  // ensureLoaded liest jedes rec.eventId beim Neustart zurück in claimEvent's Dedup-Set,
  // sodass eine Stripe-Redelivery desselben invoice.paid keinen zweiten Scan/keine zweite
  // Rechnungsnummer/Mail mehr auslösen kann.
  await markStatus(cycleKey, 'RECHECK_STARTED', {
    ...(eventId ? { eventId } : {}),
    email: sub.email, url: sub.url, pkg: sub.pkg || 'abo', subscriptionId: sub.subscriptionId
  });
  const order = await paidScanGate(() =>
    services.fulfillOrder({
      url: sub.url, company: sub.company || '', email: sub.email,
      pkg: sub.pkg || 'abo',
      prevSnapshot: sub.lastSnapshot || null
    })
  );
  const invoice = makeInvoice ? await makeInvoice() : null;
  // Snapshot SOFORT sichern (unabhängig vom Auslieferungszeitpunkt): er ist die
  // Diff-Basis für den nächsten Monats-Re-Check und darf nicht am Release-Fenster hängen.
  await saveSnapshot(sub.subscriptionId, order.snapshot);

  // PR5: Auch der Abo-Re-Check läuft durch das Owner-Release-Gate („jeder Report").
  if (RELEASE_GATE_ENABLED) {
    await enqueueForRelease({
      sessionId: cycleKey, to: sub.email, company: sub.company || '', url: sub.url, pkg: sub.pkg || 'abo',
      order, invoice, emailKind: 'recheck', sendReceipt: false
    });
    logger.info({ subscriptionId: sub.subscriptionId, cycleKey, releaseInMin: RELEASE_DELAY_MIN }, 'Re-Check zur Owner-Freigabe eingequeut');
    return;
  }

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
  await markStatus(cycleKey, 'RECHECK_DONE', { pdfPath: order.pdfPath, invoiceNumber: invoice?.invoiceNumber || null });
  logger.info({ subscriptionId: sub.subscriptionId, invoiceNumber: invoice?.invoiceNumber || null }, 'Re-Check ausgeliefert');
}

// F27: fürs MONATLICHE Abo (kein eigener Ticker wie 'abo-jahr') GENAU EIN automatischer
// Retry-Versuch, wenn der Re-Check am Scan scheitert — danach Owner-Alarm mit einem
// tatsächlich funktionierenden Re-Trigger-Befehl (POST /api/recheck/:subscriptionId).
// Non-durable (In-Memory-Timer): ein Prozess-Crash in der Zwischenzeit wird trotzdem
// nicht stumm — der RECHECK_STARTED/RECHECK_FAILED-Trail (s. o.) fängt ihn über den
// Reconcile-Sweeper beim nächsten Start ab.
const MONTHLY_RECHECK_RETRY_MS = Math.max(60_000, Number(process.env.MONTHLY_RECHECK_RETRY_MS) || 30 * 60_000);
const monthlyRetryScheduled = new Set(); // subscriptionId -> verhindert Doppel-Retry pro Ausfall

function scheduleMonthlyRecheckRetry(sub, { cycleKey, makeInvoice }) {
  if (monthlyRetryScheduled.has(sub.subscriptionId)) return;
  monthlyRetryScheduled.add(sub.subscriptionId);
  const handle = setTimeout(async () => {
    monthlyRetryScheduled.delete(sub.subscriptionId);
    try {
      const fresh = await getSubscription(sub.subscriptionId);
      if (!fresh || fresh.status !== 'ACTIVE') return; // zwischenzeitlich gekündigt/pausiert
      await runSubscriptionRecheck(fresh, { cycleKey: `${cycleKey}-retry`, makeInvoice });
      logger.info({ subscriptionId: sub.subscriptionId }, 'Monats-Re-Check-Retry erfolgreich');
    } catch (err) {
      await markStatus(`${cycleKey}-retry`, 'RECHECK_FAILED', { error: err.message }).catch(() => {});
      await sendAlert(
        `Re-Check endgültig fehlgeschlagen (nach Retry): ${sub.email}`,
        `Subscription: ${sub.subscriptionId}\nURL: ${sub.url}\nFehler: ${err.message}\n\n` +
        `Der automatische Retry ist ebenfalls fehlgeschlagen. Manuell erneut anstoßen:\n` +
        `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/recheck/${sub.subscriptionId}`
      );
      sentry.captureException(err, { stage: 'monthlyRecheckRetry', subscription_id: sub.subscriptionId });
      logger.error({ subscriptionId: sub.subscriptionId, err: err.message }, 'MONATS-RE-CHECK-RETRY FEHLGESCHLAGEN');
    }
  }, MONTHLY_RECHECK_RETRY_MS);
  handle.unref?.();
}

// --- Jahres-Abo-Ticker ('abo-jahr') ------------------------------------------------
// Stripe stellt bei interval:'year' nur EINE Rechnung pro Jahr → invoice.paid
// (subscription_cycle) feuert jährlich. Verkaufter Leistungsinhalt ist aber der
// MONATLICHE Re-Check (identisch zum Monats-Abo). Diesen Takt liefert der Ticker:
// er stößt für aktive Jahres-Abos denselben Re-Check-Kern an, sobald der letzte
// Scan ≥ 30 Tage zurückliegt. Der bezahlte invoice.paid-Scan aktualisiert lastScanAt
// mit — im Verlängerungsmonat gibt es dadurch keinen Doppel-Scan.
const ANNUAL_RECHECK_DUE_MS = 30 * 24 * 3600_000;
const ANNUAL_RECHECK_TICK_MS = Math.max(60_000, Number(process.env.ANNUAL_RECHECK_TICK_MS) || 6 * 3600_000);
// Fehlversuche frühestens nach 20 h wiederholen (sonst alarmiert jeder 6-h-Tick erneut).
const ANNUAL_RECHECK_RETRY_MS = 20 * 3600_000;
const annualAttemptAt = new Map(); // subscriptionId -> letzter Versuch (in-flight-Guard + Retry-Bremse)

// Pure Fälligkeits-Logik, exportiert für den Unit-Test (test/config.test.js).
// Gilt für ALLE Jahres-Varianten ('abo-jahr', 'abo-pro-jahr', 'abo-business-jahr'):
// Stripe stellt bei interval:'year' nur 1 Rechnung/Jahr, der monatliche Takt kommt
// vom Ticker.
export function annualRecheckDue(sub, now = Date.now()) {
  if (!sub || sub.status !== 'ACTIVE' || !String(sub.pkg || '').endsWith('-jahr')) return false;
  const last = Date.parse(sub.lastScanAt || sub.createdAt || '');
  if (Number.isNaN(last)) return true; // kein Zeitstempel → lieber prüfen als still auslassen
  return now - last >= ANNUAL_RECHECK_DUE_MS;
}

// Ein Ticker-Durchlauf — exportiert für den Orchestrierungs-Test
// (test/annual-recheck.test.js). `now` steuert Fälligkeit UND Retry-Bremse
// konsistent (kein Mix aus Fake- und Echtzeit im Test).
// WICHTIG: pro Tick wird höchstens EINE fällige Subscription abgearbeitet — der
// Ticker teilt sich paidScanGate (Default-Concurrency 1) mit zahlenden Erstkäufen;
// eine Serie gleichzeitig fälliger Jahres-Abos würde den Slot sonst minutenlang am
// Stück blockieren. Bei 30-Tage-Fälligkeit ist das Warten unkritisch: der Rest wird
// über die folgenden 6-h-Ticks aufgeholt.
export async function annualRecheckTick(now = Date.now()) {
  const active = await listSubscriptions({ status: 'ACTIVE' });
  for (const sub of active) {
    if (!annualRecheckDue(sub, now)) continue;
    const lastTry = annualAttemptAt.get(sub.subscriptionId) || 0;
    if (now - lastTry < ANNUAL_RECHECK_RETRY_MS) continue;
    annualAttemptAt.set(sub.subscriptionId, now);
    // Queue-Key pro Kalendermonat → idempotent gegen Doppel-Ticks nach Neustart.
    const monthKey = new Date(now).toISOString().slice(0, 7);
    const cycleKey = `${sub.subscriptionId}-m-${monthKey}`;
    try {
      await runSubscriptionRecheck(sub, { cycleKey });
    } catch (err) {
      await markStatus(cycleKey, 'RECHECK_FAILED', { error: err.message }).catch(() => {});
      await sendAlert(
        `Jahres-Abo-Re-Check fehlgeschlagen: ${sub.email}`,
        `Subscription: ${sub.subscriptionId}\nURL: ${sub.url}\nFehler: ${err.message}` +
        tlsRetryHint(err, cycleKey) + `\n\nNächster automatischer Versuch in ~20 h.`
      );
      sentry.captureException(err, { stage: 'annualRecheck', subscription_id: sub.subscriptionId });
      logger.error({ subscriptionId: sub.subscriptionId, err: err.message }, 'JAHRES-ABO-RE-CHECK FEHLGESCHLAGEN');
    }
    return; // max. 1 Sub pro Tick (paidScanGate-Fairness, siehe oben)
  }
}

function startAnnualRecheckTicker() {
  const tick = () =>
    annualRecheckTick().catch((err) => logger.error({ err: err.message }, 'Jahres-Abo-Ticker Fehler'));
  tick(); // Start-Tick fängt nach Redeploy überfällige Re-Checks sofort
  const handle = setInterval(tick, ANNUAL_RECHECK_TICK_MS);
  handle.unref?.();
  return handle;
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
    // Kunden-Dunning (agent-09 Paket 2.4): bisher ging NUR der Owner-Alert raus,
    // der Kunde erfuhr nichts. D1 (Tag 0) wird hier direkt angestoßen; D2 (Tag 3)
    // und D3 (Tag 10) über den Onboarding-Ticker — jeweils nur, wenn die
    // Subscription weiterhin PAST_DUE ist (Guard in processDue). Idempotent pro
    // Episode: cycleKey enthält den Statuswechsel-Zeitstempel (statusChangedAt),
    // eine NEUE past_due-Episode nach Recovery startet einen frischen Plan.
    if (ONBOARDING_ENABLED && isEmail(updated.email)) {
      try {
        const cycleKey = `${sub.id}:${updated.statusChangedAt || Date.now()}`;
        await scheduleTrack({
          track: 'D', email: updated.email, company: updated.company || '',
          sourceId: sub.id, cycleKey,
          startedAt: updated.statusChangedAt || undefined,
          abbuchungsZeile: abbuchungsZeileFor(updated.pkg)
        });
        await processDue(onboardingDeps()); // D1 ist sofort fällig (Tag 0)
      } catch (err) {
        logger.warn({ subscriptionId: sub.id, err: err.message }, 'Dunning-Sequenz nicht angestoßen (Owner-Alert ist raus)');
      }
    }
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
  // Onboarding/Dunning: offene Sequenzen dieser Subscription abbrechen —
  // ein gekündigter Kunde bekommt keine weiteren Onboarding-/Mahn-Mails.
  if (ONBOARDING_ENABLED) {
    cancelBySource(sub.id, 'subscription-deleted')
      .catch((err) => logger.warn({ subscriptionId: sub.id, err: err.message }, 'Onboarding-Abbruch nach Kündigung fehlgeschlagen'));
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

  // Report-Gate (agent-01, d1 Szenario E + d10.1; hinter ABO_TIERS_ENABLED):
  // Re-Check-Abos setzen einen BEZAHLTEN Erst-Report (basis/profi, ggf. via
  // Startpaket) auf derselben E-Mail voraus — der Re-Check ist ein Delta-Dienst
  // auf dieser Baseline. Schließt das Kündigungs-Loophole (24,99 € kauften sonst
  // sofort einen ~399-€-Vollreport, Kündigung zum Monatsende reichte).
  // Flag AUS = bisheriges Verhalten ('abo'/'abo-jahr' frei buchbar) — unverändert.
  if (ABO_TIERS_ENABLED && REPORT_GATE_PACKAGES.has(pkg)) {
    if (!cleanEmail) {
      return res.status(400).json({
        error: 'Bitte E-Mail-Adresse angeben — das Re-Check-Abo wird Ihrem Erst-Report zugeordnet.'
      });
    }
    const hasReport = await hasPaidReportFor(cleanEmail);
    if (!hasReport) {
      return res.status(409).json({
        error: 'Für den Fuchs Re-Check brauchen Sie zuerst einen Erst-Report (Basis oder Profi): Er legt die Baseline, der Re-Check dokumentiert die Entwicklung. Noch kein Report? Das Startpaket kombiniert Ihren Erst-Report mit dem ersten Re-Check-Monat — der erste Monat ist inklusive.',
        reason: 'report_required'
      });
    }
  }

  let safe;
  try {
    safe = await assertPublicHttpUrl(/^https?:\/\//i.test(url) ? url : 'https://' + url);
  } catch (e) {
    return res.status(400).json({ error: 'URL nicht erlaubt: ' + e.message });
  }

  try {
    // Startpaket (agent-01, d10.2): Report-Einmalposition (heute fällig) +
    // Tier-Subscription mit trial_period_days=30 (= „1. Re-Check-Monat inklusive";
    // erste Abbuchung des Tier-Preises ab Monat 2, dann monatlich kündbar).
    // tier = gewähltes Re-Check-Tier aus dem Checkout (Default: Starter 'abo').
    let tier = null;
    if (p.startpaket) {
      tier = STARTPAKET_TIERS.has(req.body?.tier) ? req.body.tier : 'abo';
      if (!PACKAGES[tier]) {
        return res.status(400).json({ error: 'Gewähltes Re-Check-Tier ist derzeit nicht buchbar' });
      }
    }
    // Betroffenheits-Check (CheckoutModal Schritt 0, Asset D1 aus
    // marketing/swarm-2026-07-23/agent-02-funnel-website.md): Ergebnis nur als
    // Kontext zur Bestellung (ehrliche Verkaufsdoku / Nicht-Betroffenen-Analyse)
    // — KEIN Gate, keine Kauf-Validierung. Whitelist statt Freitext; fehlende
    // oder unbekannte Werte werden verworfen (ältere Clients bleiben kompatibel).
    const eligibility = ['affected', 'unaffected_override', 'unsure'].includes(req.body?.eligibility)
      ? req.body.eligibility
      : undefined;
    const baseMeta = {
      url: safe.url,
      pkg,
      company: String(company).slice(0, 120),
      customerType,
      consent: consent ? 'ja' : 'nein',
      consentTs: new Date().toISOString(),
      ...(tier ? { tier } : {}),
      ...(eligibility ? { eligibility } : {})
    };
    // Line-Items: Startpaket = [Report EINMALIG (kein recurring!), Tier recurring];
    // alle anderen Pakete = 1 Item. STRIPE_PRICE-ID (falls vom Owner gesetzt)
    // schlägt die inline price_data (siehe lineItemFor oben).
    const line_items = p.startpaket
      ? [
          STRIPE_PRICE[pkg]
            ? { price: STRIPE_PRICE[pkg], quantity: 1 }
            : { price_data: { currency: 'eur', product_data: { name: p.reportName }, unit_amount: p.amount }, quantity: 1 },
          lineItemFor(tier)
        ]
      : [lineItemFor(pkg)];
    // Subscription-Metadata: damit invoice.paid die Bestellung wiederfindet.
    // Beim Startpaket trägt die Subscription das TIER als pkg (Re-Check-Zyklen
    // scannen mit Tier-Tiefe) — das Verkaufskürzel bleibt in metadata.pkg.
    const subscription_data = p.mode === 'subscription'
      ? {
          metadata: { url: safe.url, pkg: tier || pkg, company: baseMeta.company, email: cleanEmail || '' },
          ...(p.startpaket ? { trial_period_days: 30 } : {})
        }
      : undefined;
    const session = await services.createCheckoutSession({
      mode: p.mode,
      line_items,
      customer_email: cleanEmail || undefined,
      // Name + Rechnungsanschrift erheben → landet in session.customer_details.{name,address}
      // (§ 14 UStG: Profi 399 € > 250 € erfordert Empfänger-Name+Anschrift). 'required'
      // erzwingt das Adressformular im Checkout fuer ALLE Pakete (einheitlich).
      billing_address_collection: 'required',
      metadata: baseMeta,
      subscription_data,
      submit_type: p.mode === 'payment' ? 'pay' : undefined,
      // pkg in der success_url: danke.html blendet damit den Upsell-Block des
      // soeben gekauften Produkts aus (pkg ist whitelist-validiert, s. o.).
      success_url: `${PUBLIC_URL}/danke.html?session_id={CHECKOUT_SESSION_ID}&pkg=${pkg}`,
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

// --- Scan-Lead-Capture via Brevo Double-Opt-in (Value-first-Funnel) ---
// Wie /api/newsletter, aber mit SCAN-KONTEXT: uebergibt die gescannte URL + Score
// als Brevo-Kontakt-Attribute (SCAN_URL/SCAN_SCORE/SCAN_ISSUES), damit die
// Nurture-Sequenz das Ergebnis personalisieren kann ("Ihre Seite: 68/100").
// Erfolg = Bestaetigungsmail verschickt (DOI), NICHT bereits eingetragen (§7 UWG/DSGVO).
// Env-gated: aktiv, sobald BREVO_API_KEY + BREVO_LEAD_LIST_ID + (BREVO_LEAD_DOI_TEMPLATE_ID
// ODER als Fallback BREVO_DOI_TEMPLATE_ID) gesetzt sind UND in Brevo eine Scan-Leads-Liste,
// ein aktives DOI-Template sowie die 3 Kontakt-Attribute (SCAN_URL/SCAN_SCORE/SCAN_ISSUES)
// existieren. Fehlen die Attribute, wird der Lead trotzdem ohne Attribute eingetragen.
// Defensives Parsen des client-gelieferten Scan-Kontexts fuer die Value-Mail
// (PR2). Nie vertrauen: counts → nicht-negative Ganzzahlen; topIssues → max 3
// bereinigte Strings. Spoofing ist vernachlaessigbar (die Mail geht an die selbst
// angegebene Adresse), ein Re-Scan waere teuer/unnoetig.
function parseImpactCounts(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const clamp = (v) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n > 0 ? n : 0; };
  return { critical: clamp(src.critical), serious: clamp(src.serious), moderate: clamp(src.moderate), minor: clamp(src.minor) };
}
function parseTopIssues(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x) => typeof x === 'string' && x.trim()).slice(0, 3).map((x) => x.trim().slice(0, 160));
}

app.post('/api/lead', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  const email = String(req.body?.email || '').trim().slice(0, 200);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' });

  // Scan-Kontext defensiv aufbereiten (best-effort, niemals harte Pflicht).
  const rawUrl = String(req.body?.url || '').trim().slice(0, 300);
  const score = Number(req.body?.score);
  const issues = Number(req.body?.totalIssues);
  const leadCounts = parseImpactCounts(req.body?.counts);
  const leadTopIssues = parseTopIssues(req.body?.topIssues);

  // DOI-Gate (02.07.): Der Gratis-Report wird NICHT mehr sofort gesendet, sondern
  // durabel eingequeut und erst nach dem Brevo-Double-Opt-in-Klick ausgeliefert
  // (GET /api/lead/confirm). Vorteil: die Bestätigung liegt vor der ersten
  // Inhalts-Mail und niemand kann fremde Postfächer mit Reports zuspammen. Der
  // Confirm-Link (mit HMAC-Token) wird zur Brevo-redirectionUrl — kein Webhook nötig.
  // Voraussetzung: ein Token-Secret (LEAD_TOKEN_SECRET/RELEASE_TOKEN_SECRET/ADMIN_TOKEN,
  // in Prod gesetzt). Fehlt es, greift der alte, ungegatete Redirect als Fallback.
  let redirectionUrl = `${PUBLIC_URL}/?lead=bestaetigt`;
  if (leadTokenConfigured()) {
    const leadId = randomBytes(16).toString('hex');
    const token = signLead(leadId);
    const now = Date.now();
    try {
      await leadQueue.enqueue({
        id: leadId,
        to: email,
        url: rawUrl,
        score: Number.isFinite(score) ? Math.round(score) : null,
        counts: leadCounts,
        topIssues: leadTopIssues,
        totalIssues: Number.isFinite(issues) ? Math.round(issues) : null,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 Tage
      });
      redirectionUrl = `${PUBLIC_URL}/api/lead/confirm?id=${leadId}&token=${token}`;
    } catch (err) {
      // Enqueue-Fehler (z. B. Volume nicht schreibbar) darf den Lead nicht kippen:
      // ohne Gate weiter, damit die DOI-Bestätigung trotzdem läuft (Report entfällt).
      logger.error({ err: err.message }, 'Lead-Queue enqueue fehlgeschlagen — Fallback ohne DOI-Gate');
    }
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LEAD_LIST_ID);
  const templateId = Number(process.env.BREVO_LEAD_DOI_TEMPLATE_ID || process.env.BREVO_DOI_TEMPLATE_ID);
  if (!apiKey || !listId || !templateId) {
    logger.warn('Lead-Anfrage, aber Brevo-DOI nicht konfiguriert (BREVO_API_KEY/_LEAD_LIST_ID/_LEAD_DOI_TEMPLATE_ID).');
    return res.status(503).json({ error: 'Der Versand per E-Mail ist gerade nicht verfügbar. Bitte später erneut versuchen.' });
  }

  const attributes = {};
  if (rawUrl) attributes.SCAN_URL = rawUrl;
  if (Number.isFinite(score)) attributes.SCAN_SCORE = Math.round(score);
  if (Number.isFinite(issues)) attributes.SCAN_ISSUES = Math.round(issues);
  const hasAttrs = Object.keys(attributes).length > 0;

  const doiCall = (withAttrs) =>
    fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        email,
        ...(withAttrs && hasAttrs ? { attributes } : {}),
        includeListIds: [listId],
        templateId,
        redirectionUrl
      })
    });

  try {
    let r = await doiCall(true);
    // Sind die Attribute im Brevo-Konto (noch) nicht angelegt, lehnt Brevo mit 400 ab.
    // Dann den Lead trotzdem retten: einmal OHNE Attribute wiederholen.
    if (r.status === 400 && hasAttrs) {
      const b = await r.text().catch(() => '');
      logger.warn({ status: 400, body: b.slice(0, 200) }, 'Lead-DOI mit Attributen abgelehnt — Retry ohne Attribute');
      r = await doiCall(false);
    }
    if (r.status === 201 || r.status === 204) return res.json({ ok: true, status: 'pending' });
    const body = await r.text().catch(() => '');
    logger.error({ status: r.status, body: body.slice(0, 300) }, 'Brevo-Lead-DOI fehlgeschlagen');
    return res.status(502).json({ error: 'Versand derzeit nicht möglich. Bitte später erneut.' });
  } catch (err) {
    logger.error({ err: err.message }, 'Lead-Endpoint Fehler');
    return res.status(502).json({ error: 'Versand derzeit nicht möglich.' });
  }
});

// --- DOI-Bestätigung des Gratis-Reports (02.07.; Backend-Teaser restauriert 19.07.) ---
// Ziel der Brevo-Double-Opt-in-redirectionUrl: Der Klick auf den Bestätigungslink
// löst den Versand der datenreichen Backend-Übersicht aus (sendLeadTeaser: Note,
// Schwere-Zähler, Top-3-Prioritäten — restauriert nach dem Fehlgriff in PR #132, der
// die reichere der beiden Doppel-Mails entfernt hatte, siehe Memory merge-forensik-0719).
// ⚠️ VORAUSSETZUNG: Der Mail-Schritt der Brevo-Automation (Template #8, „Deine
// Barrierefreiheits-Übersicht ist da") muss in der Brevo-UI deaktiviert sein, sonst
// kommt die Doppel-Mail zurück. Idempotenz über SENT-Status + atomaren Claim →
// Doppelklick sendet nur 1×. Immer freundlicher 302-Redirect auf die Bestätigungsseite —
// Fehler werden über den ?status-Parameter signalisiert (abgelaufen = ungültiger/
// abgelaufener Token, verzoegert = Versand hakt).
app.get('/api/lead/confirm', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  const base = `${PUBLIC_URL}/anmeldung-bestaetigt`;
  const id = String(req.query.id || '').trim().slice(0, 120);
  const token = String(req.query.token || '').trim().slice(0, 200);

  // Ungültiger/fehlender Token → wie abgelaufen behandeln (keine Enumeration).
  if (!leadTokenConfigured() || !id || !token || !verifyLead(id, token)) {
    return res.redirect(302, `${base}?status=abgelaufen`);
  }
  const lead = await leadQueue.getLead(id);
  if (!lead || !lead.expiresAt || Date.parse(lead.expiresAt) < Date.now()) {
    return res.redirect(302, `${base}?status=abgelaufen`);
  }
  // Bereits versendet → idempotenter Erfolg (kein Zweitversand).
  if (lead.status === 'SENT') return res.redirect(302, base);

  // Atomarer Claim: nur der Gewinner sendet. Verlierer eines parallelen Klicks
  // (oder ein bereits terminaler Record) landet hier mit null.
  const claimed = leadQueue.claimForSend(id);
  if (!claimed) {
    const cur = await leadQueue.getLead(id);
    return res.redirect(302, cur?.status === 'SENT' ? base : `${base}?status=verzoegert`);
  }

  try {
    await services.sendLeadTeaser({
      to: lead.to, url: lead.url, score: lead.score,
      counts: lead.counts, topIssues: lead.topIssues, totalIssues: lead.totalIssues
    });
    await leadQueue.markSent(id);
    return res.redirect(302, base);
  } catch (err) {
    if (isTransientMailError(err)) {
      // Transient → PENDING lassen, nächster Klick versucht erneut. Freundliche Seite.
      await leadQueue.requeue(id, { error: err.message });
      logger.warn({ err: err.message, id }, 'Lead-Confirm: transienter Mailfehler — requeued');
      return res.redirect(302, `${base}?status=verzoegert`);
    }
    // Permanent → terminal markieren + Owner alarmieren (angeforderter Report ging verloren).
    await leadQueue.markFailed(id, { error: err.message });
    logger.error({ err: err.message, id }, 'Lead-Confirm: permanenter Mailfehler');
    try { await sendAlert('Gratis-Report-Versand fehlgeschlagen', `Lead ${id} (${lead.to}): ${err.message}`); } catch { /* best-effort */ }
    return res.redirect(302, `${base}?status=verzoegert`);
  }
});

app.get('/health', (req, res) => {
  const live = isStripeLive();
  const mailerOk = mailerStatus().startsWith('aktiv');
  res.json({ ok: !(live && !mailerOk), stripe: !!stripe, live, mailer: mailerStatus(), aboEnabled: ENABLE_ABO, sentry: sentry.enabled });
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
app.get('/admin/orders', rateLimit({ windowMs: 60_000, max: 30 }), requireAdminAuth, async (req, res) => {
  try {
    const { listOrders } = await import('./lib/orders.js');
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const orders = await listOrders({ limit });
    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/subscriptions', rateLimit({ windowMs: 60_000, max: 30 }), requireAdminAuth, async (req, res) => {
  try {
    const { listSubscriptions } = await import('./lib/subscriptions.js');
    const subs = await listSubscriptions();
    res.json({ count: subs.length, subscriptions: subs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// F27: manueller Re-Trigger fuer einen fehlgeschlagenen Abo-Re-Check (der bisher in den
// Owner-Alarmen referenzierte Recovery-Weg existierte fuer Rechecks nicht wirklich).
// Erzeugt bewusst KEINE neue Rechnung (der Zyklus wurde bereits bezahlt/abgerechnet) —
// ruft denselben Re-Check-Kern wie der Jahres-Abo-Ticker auf (ohne makeInvoice).
app.post('/api/recheck/:subscriptionId', rateLimit({ windowMs: 60_000, max: 10 }), requireAdminAuth, async (req, res) => {
  const { subscriptionId } = req.params;
  const sub = await getSubscription(subscriptionId);
  if (!sub) return res.status(404).json({ error: 'Subscription nicht gefunden' });
  if (sub.status !== 'ACTIVE') return res.status(409).json({ error: `Subscription-Status ${sub.status} — Re-Check nicht ausgeführt` });
  try {
    await runSubscriptionRecheck(sub, { cycleKey: `${subscriptionId}-manual-${Date.now()}` });
    res.json({ ok: true, subscriptionId });
  } catch (err) {
    logger.error({ subscriptionId, err: err.message }, 'Manueller Re-Check fehlgeschlagen');
    res.status(500).json({ error: err.message });
  }
});

// Resend-Endpoint: bei Fulfillment-/Mail-Fehler Report nochmal ausliefern.
// SF2: atomarer In-Memory-Lock gegen parallele Doppel-Auslieferung (zwei Resends
// würden sonst doppelt mailen + zwei GoBD-Rechnungsnummern ziehen).
const resendInFlight = new Set();
// RESEND_RATE_MAX defensiv parsen: ein Tippfehler-Wert ergäbe NaN, und `count > NaN`
// ist immer false → der Limiter wäre still deaktiviert. Ungültig ⇒ Default 10.
const RESEND_RATE_MAX = (() => { const n = Number(process.env.RESEND_RATE_MAX); return Number.isFinite(n) && n > 0 ? n : 10; })();
app.post('/api/resend/:sessionId', rateLimit({ windowMs: 60_000, max: RESEND_RATE_MAX }), requireAdminAuth, async (req, res) => {
  const { sessionId } = req.params;
  const { getOrder, markStatus } = await import('./lib/orders.js');
  // order = Snapshot von VOR dem RESENDING-Write (für mailOnly-Entscheidung + SF1-Rollback).
  // let: wird beim Konsum eines offenen Freigabe-Jobs (PR5) auf den READY_NOT_MAILED-Stand neu geladen.
  let order = await getOrder(sessionId);
  if (!order) return res.status(404).json({ error: 'Session nicht gefunden' });
  // W3: force = admin-gewollter Neu-Versand einer bereits ausgelieferten Order. Liefert
  // NUR den vorhandenen Report + die vorhandene GoBD-Rechnungsnummer erneut (mail-only) —
  // NIEMALS ein Voll-Rescan (der zöge für einen abgeschlossenen Verkauf eine zweite
  // Rechnungsnummer, §14 UStG/GoBD). Ohne fertiges Report-PDF gibt es nichts nachzusenden.
  const force = req.body?.force === true;
  if ((order.status === 'MAILED' || order.status === 'RESENT') && !force) {
    return res.status(409).json({ error: `Order Status ${order.status} — bereits ausgeliefert.` });
  }
  if (force && !order.pdfPath) {
    return res.status(409).json({ error: 'force nicht möglich: kein fertiger Report (pdfPath) vorhanden — ein Voll-Rescan würde eine neue Rechnungsnummer ziehen.' });
  }
  if (force && req.body?.url) {
    return res.status(400).json({ error: 'force und korrigierte URL schließen sich aus: force liefert den vorhandenen Report neu (kein Rescan).' });
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

  // PR5: Existiert für diese Session noch ein offener Freigabe-Job (Report ist im 90-Min-
  // Fenster eingequeut), muss der Resend ihn KONSUMIEREN — sonst versendet der Scheduler
  // oder ein späterer Owner-Klick den Report ein ZWEITES Mal (Doppelversand/Doppelrechnung,
  // §14/GoBD). Atomar claimen + terminal markieren. Läuft die Auto-Freigabe gerade selbst
  // (RELEASING), lässt sich der Job nicht claimen → Resend mit 409 ablehnen (kurz warten).
  // Eigenes try/catch: die Disk-Writes hier liegen VOR dem Haupt-try/finally → Lock würde
  // bei einem Schreibfehler sonst lecken. Danach den Order-Status mit den Queue-Artefakten
  // auf READY_NOT_MAILED syncen, damit der Resend den Mail-only-Fastpath nimmt (KEIN
  // unnötiger Voll-Rescan des bereits fertig gescannten Reports).
  try {
    const queueJob = await reportQueue.getJob(sessionId);
    if (queueJob && (queueJob.status === 'SCHEDULED' || queueJob.status === 'RELEASING')) {
      const claimed = reportQueue.claimForRelease(sessionId);
      if (!claimed) {
        resendInFlight.delete(sessionId);
        return res.status(409).json({ error: 'Report wird gerade automatisch freigegeben — bitte in ~1 Minute erneut versuchen.' });
      }
      await reportQueue.markJobStatus(sessionId, 'RELEASED', { releasedBy: 'resend' });
      await markStatus(sessionId, 'READY_NOT_MAILED', {
        pdfPath: queueJob.pdfPath,
        stmtPath: queueJob.stmtPath || null,
        emailKind: queueJob.emailKind || 'bfsg',
        invoiceNumber: queueJob.invoiceNumber || null,
        invoicePdfPath: queueJob.invoicePdfPath || null,
        customerType: queueJob.customerType || '',
        consentTs: queueJob.consentTs || ''
      });
      order = await getOrder(sessionId); // frischer READY_NOT_MAILED-Stand für die mailOnly-Prüfung
    }
  } catch (err) {
    resendInFlight.delete(sessionId);
    logger.error({ sessionId, err: err.message }, 'Queue-Konsum im Resend fehlgeschlagen');
    return res.status(500).json({ error: 'Resend fehlgeschlagen (Freigabe-Queue).' });
  }

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
    // W3: MAILED/RESENT hier zugelassen (force-Pfad oben abgesichert: kein overrideUrl,
    // pdfPath vorhanden) → force liefert den fertigen Report + vorhandene Nummer mail-only neu.
    const mailOnly = !overrideUrl && ['READY_NOT_MAILED', 'MAILED', 'RESENT'].includes(order.status) && order.pdfPath;
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

    // F22: admin-authentifizierter lenientTls-Override — liefert einen an TLS-Eigenheiten
    // der Zielseite gescheiterten bezahlten Scan nach, ohne das globale
    // SCAN_PAID_LENIENT_TLS-Env fuer ALLE bezahlten Scans umschalten zu muessen.
    // Nur explizites true/false uebersteuert; sonst greift fulfillOrder's eigener Default.
    const lenientTlsOverride = typeof req.body?.lenientTls === 'boolean' ? req.body.lenientTls : undefined;
    const result = await paidScanGate(() =>
      services.fulfillOrder({ url: overrideUrl || order.url, company: order.company || '', email: recipient, pkg: order.pkg || 'basis', lenientTls: lenientTlsOverride })
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
  const receivedAt = new Date();
  await sendAlert(
    `Widerruf eingegangen: ${String(name).slice(0, 80)}`,
    `Name: ${name}\nE-Mail: ${email}\nVertrag/Bestellung: ${vertrag}\nDatum: ${datum}\nEingang: ${receivedAt.toISOString()}`
  );
  // F13/F36: § 356 Abs. 1 S. 2 BGB verlangt eine unverzuegliche Zugangsbestaetigung an
  // den Verbraucher — best-effort (Owner-Alarm oben ist der verlaessliche Kanal; ein
  // Mailfehler hier darf die Erfolgsantwort an den Antragsteller nicht verhindern).
  try {
    if (isEmail(email)) await sendWiderrufEingang({ to: email, name, vertrag, receivedAt });
  } catch (err) {
    logger.warn({ err: err.message }, 'Widerrufs-Zugangsbestätigung nicht gesendet');
  }
  res.json({ ok: true });
});

// Kündigungs-Funktion (§ 312k BGB) für das Abo.
app.post('/api/kuendigung', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  // F31: 'effective' (Sofort vs. Periodenende) wird vom Formular mitgesendet, aber
  // bisher stillschweigend verworfen — jetzt mit destrukturieren + weitergeben.
  const { name = '', email = '', vertrag = '', effective = '' } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name und E-Mail erforderlich' });
  const receivedAt = new Date();
  await sendAlert(
    `Kündigung eingegangen: ${String(name).slice(0, 80)}`,
    `Name: ${name}\nE-Mail: ${email}\nVertrag: ${vertrag}\nWunschzeitpunkt: ${effective || '(nicht angegeben)'}\nEingang: ${receivedAt.toISOString()}`
  );
  // F12/F36: § 312k Abs. 2 BGB verlangt eine unverzuegliche Zugangsbestaetigung
  // (Inhalt + Datum/Uhrzeit) an den Verbraucher — best-effort, siehe /api/widerruf.
  try {
    if (isEmail(email)) await sendKuendigungEingang({ to: email, name, vertrag, effective, receivedAt });
  } catch (err) {
    logger.warn({ err: err.message }, 'Kündigungs-Eingangsbestätigung nicht gesendet');
  }
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

// PR5: 1-Klick-Freigabe aus der Owner-Review-Mail. KEIN Admin-Bearer (der Link kommt
// aus einer Mail), stattdessen HMAC-Token-Verifikation (release-token.js) gegen
// Enumeration. Owner-Klick und Auto-Release laufen durch dieselbe releaseJob-Logik
// (atomarer Claim → genau ein Versand). Antwortet mit einer kleinen HTML-Seite.
function releasePage(msg, ok) {
  const safe = String(msg).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>Report-Freigabe</title><body style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;text-align:center;color:#1a1a1a">` +
    `<div style="font-size:44px">${ok ? '&#9989;' : '&#9888;&#65039;'}</div>` +
    `<p style="font-size:18px">${safe}</p>` +
    `<p style="color:#888;font-size:13px">BFSG-Fuchs &middot; Report-Freigabe</p></body>`;
}

const attrEsc = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

// Bestätigungsseite (GET macht KEINE Zustandsänderung): E-Mail-Sicherheitsgateways
// (z. B. Outlook Safe Links) prefetchen Links per GET/HEAD — dürften sie damit direkt
// freigeben, würde der „vor Auslieferung gesichtet"-Anspruch unterlaufen. Deshalb gibt
// erst der bewusste POST (Button-Klick) frei; Scanner posten nicht.
function confirmPage(sessionId, token, jobInfo = null) {
  const action = `/api/release/${encodeURIComponent(sessionId)}?token=${encodeURIComponent(token)}`;
  const meta = jobInfo ? `<p style="color:#555;font-size:14px">Kunde: <strong>${attrEsc(jobInfo.to || '—')}</strong>${jobInfo.url ? ` · ${attrEsc(jobInfo.url)}` : ''}</p>` : '';
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>Report freigeben</title><body style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;text-align:center;color:#1a1a1a">` +
    `<div style="font-size:44px">&#129418;</div><h2 style="margin:8px 0">Report freigeben?</h2>${meta}` +
    `<form method="post" action="${action}" style="margin-top:24px">` +
    `<button type="submit" style="background:#e8590c;color:#fff;border:0;font-weight:600;padding:14px 28px;border-radius:10px;font-size:16px;cursor:pointer">Freigeben &amp; senden &rarr;</button></form>` +
    `<p style="color:#888;font-size:13px;margin-top:20px">Tust du nichts, wird der Report am Ende des Fensters automatisch versendet.</p>` +
    `<p style="color:#aaa;font-size:12px">BFSG-Fuchs &middot; Report-Freigabe</p></body>`;
}

app.get('/api/release/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const token = req.query.token || '';
  if (!verifyRelease(sessionId, token)) {
    return res.status(403).type('html').send(releasePage('Ungültiger Freigabe-Link.', false));
  }
  const job = await services.reportQueue.getJob(sessionId);
  if (job && job.status === 'RELEASED') {
    return res.type('html').send(releasePage('Dieser Report wurde bereits versendet.', true));
  }
  return res.type('html').send(confirmPage(sessionId, token, job));
});

app.post('/api/release/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const token = req.query.token || '';
  if (!verifyRelease(sessionId, token)) {
    return res.status(403).type('html').send(releasePage('Ungültiger Freigabe-Link.', false));
  }
  try {
    const result = await releaseJob(sessionId, releaseDeps('owner'));
    if (result.released) {
      return res.type('html').send(releasePage('Report freigegeben und an den Kunden gesendet.', true));
    }
    if (result.reason === 'not-claimable') {
      const job = await services.reportQueue.getJob(sessionId);
      const already = !!job && job.status === 'RELEASED';
      return res.type('html').send(releasePage(
        already ? 'Dieser Report wurde bereits versendet.' : 'Freigabe gerade nicht möglich (läuft evtl. schon).',
        already
      ));
    }
    return res.status(502).type('html').send(releasePage('Versand fehlgeschlagen — bitte später erneut versuchen.', false));
  } catch (err) {
    logger.error({ sessionId, err: err.message }, 'Release-Endpoint fehlgeschlagen');
    return res.status(500).type('html').send(releasePage('Interner Fehler bei der Freigabe.', false));
  }
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
    // F20/F26/F27: RECHECK_FAILED ist bereits an den Owner alarmiert worden (bei Scan-
    // Fehlschlag bzw. nach dem einmaligen Retry) → hier ausgelassen, sonst Alarm-Spam bei
    // jedem Neustart (gleiches Prinzip wie FAILED).
    const TERMINAL = new Set(['MAILED', 'RESENT', 'CANCELLED', 'FAILED', 'RELEASED', 'RECHECK_FAILED']);
    // PR5: RELEASE_SCHEDULED mit noch offenem Queue-Job ist ERWARTET (Scheduler-Start-Tick
    // gibt überfällige Jobs sofort frei) → nicht alarmieren. Nur ein RELEASE_SCHEDULED OHNE
    // Queue-Job wäre ein echtes Loch (Job verloren) und bleibt als „hängend" sichtbar.
    const pendingIds = new Set((await reportQueue.listPending()).map((j) => j.sessionId));
    // F20/F26: ein RECHECK_STARTED ist beim Start eines laufenden (nicht abgestürzten) Scans
    // ERWARTET — erst wenn er die Karenzzeit überschreitet, ist das Fenster (typische
    // Scan-Dauer: Minuten) plausibel abgelaufen und der Zyklus vermutlich verloren.
    const RECHECK_STARTED_GRACE_MS = 2 * 3600_000;
    const stuck = all
      .filter((o) => o.status && !TERMINAL.has(o.status))
      .filter((o) => !(o.status === 'RELEASE_SCHEDULED' && pendingIds.has(o.sessionId)))
      .filter((o) => !(o.status === 'RECHECK_STARTED' && Date.now() - Date.parse(o.ts || 0) < RECHECK_STARTED_GRACE_MS))
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
      { publicUrl: PUBLIC_URL, stripe: !!stripe, abo: ENABLE_ABO, mailer: mailerStatus(), sentry: sentry.enabled },
      `BFSG-Audit-Server auf ${PUBLIC_URL}`
    );
    // Nicht-blockierend: Server ist sofort bereit, Reconcile läuft im Hintergrund.
    reconcileOnStartup();
    // PR5: Release-Scheduler starten (sofortiger Tick fängt beim Redeploy überfällige
    // Jobs → crash-safe; danach im Intervall). Nur bei aktivem Gate.
    if (RELEASE_GATE_ENABLED) {
      // Zuerst beim Absturz mitten im Versand hängengebliebene Jobs melden (in-doubt,
      // KEIN Auto-Zweitversand), DANN den Scheduler starten (der nur SCHEDULED-Jobs auto-released).
      recoverInDoubt(releaseDeps('auto'));
      startScheduler(releaseDeps('auto'));
      logger.info({ delayMin: RELEASE_DELAY_MIN, tokenReady: releaseTokenConfigured() }, 'Owner-Release-Gate aktiv');
    }
    // Jahres-Abos (alle '*-jahr'-Varianten): monatlicher Re-Check unabhängig vom
    // jährlichen Stripe-Billing-Zyklus (siehe startAnnualRecheckTicker).
    if (ENABLE_ABO) {
      startAnnualRecheckTicker();
      logger.info({ tickMs: ANNUAL_RECHECK_TICK_MS }, 'Jahres-Abo-Re-Check-Ticker aktiv');
    }
    // Onboarding-/Dunning-Sequenzen (agent-09): Ticker versendet fällige Steps
    // (B/D sowie A nach Auslieferung). Default AUS — Owner-Entscheid; Werbliches
    // (A5/B5-Jahresabsatz) zusätzlich hinter ONBOARDING_WERBUNG_ENABLED.
    if (ONBOARDING_ENABLED) {
      startOnboardingTicker(onboardingDeps());
      logger.info({ werbung: isOnboardingWerbungEnabled() }, 'Onboarding-/Dunning-Ticker aktiv');
    }
  });
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}
