// Persistente Bestell-Nachverfolgung + Idempotenz.
// Append-only JSONL: jede bezahlte Bestellung wird SOFORT festgehalten, bevor
// der Report erzeugt wird. So geht keine Zahlung verloren, Doppel-Webhooks werden
// erkannt, und fehlgeschlagene Erfüllungen sind manuell nachlieferbar
// (POST /api/resend/:sessionId mit Admin-Bearer-Token, siehe app.js).

import { appendFile, mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = process.env.ORDERS_FILE || path.join(__dirname, '..', 'out', 'orders.jsonl');

const processedEvents = new Set();
const orders = new Map(); // sessionId -> letzter Status
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  if (!existsSync(FILE)) return;
  try {
    const txt = await readFile(FILE, 'utf8');
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      const rec = JSON.parse(line);
      if (rec.eventId) processedEvents.add(rec.eventId);
      if (rec.sessionId) orders.set(rec.sessionId, rec);
    }
  } catch {
    /* defekte Zeilen ignorieren */
  }
}

async function write(rec) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, JSON.stringify({ ...rec, ts: new Date().toISOString() }) + '\n');
}

export async function alreadyProcessed(eventId) {
  await ensureLoaded();
  return processedEvents.has(eventId);
}

// Atomarer Claim gegen nebenläufige Webhook-Duplikate (Code-Review F1):
// check-then-act in EINEM synchronen Block (kein await dazwischen) ist im
// Single-Thread-Eventloop atomar → zwei gleichzeitige Stripe-Retries desselben
// event.id können nicht beide true bekommen. Gibt true zurück, wenn DIESER
// Aufruf das Event erstmalig beansprucht hat.
export async function claimEvent(eventId) {
  await ensureLoaded();
  if (!eventId) return true; // ohne ID kein Dedup möglich → durchlassen
  if (processedEvents.has(eventId)) return false;
  processedEvents.add(eventId); // synchroner Claim (check-then-act ohne await = atomar im Event-Loop)
  return true;
  // Bewusst KEIN separater durabler Claim-Write hier: erfüllte Events sind durabel
  // dedupliziert, weil recordPaid/markStatus die event.id mitschreiben (ensureLoaded
  // lädt sie beim Start zurück in processedEvents). Ein durabler Claim VOR der Order-
  // Persistenz würde bei einem Crash im schmalen Fenster davor das Event für immer
  // deduplizieren (bezahlt, nichts geliefert, kein Alarm) — siehe app.js prePersist.
}

// Gibt einen In-Memory-Claim wieder frei. Nur nötig, wenn die durable Vor-Persistenz
// im Webhook fehlschlägt und wir NICHT quittieren → Stripes Redelivery muss den Claim
// erneut beanspruchen können (sonst bliebe das Event für immer „verarbeitet").
export function releaseEvent(eventId) {
  if (eventId) processedEvents.delete(eventId);
}

// Zahlung festhalten (Status PAID), bevor irgendetwas erzeugt wird.
// customerId (Stripe) wird mitgespeichert, falls vorhanden — für Kundenverwaltung,
// Doppelkauf-Erkennung und spätere Customer-Portal-Anbindung.
export async function recordPaid({ eventId, sessionId, email, url, pkg, amount, customerId = null, customerType = '', consentTs = '' }) {
  await ensureLoaded();
  processedEvents.add(eventId);
  // customerType/consentTs mitschreiben (SF8): so kann der Resend die §356-V-BGB-
  // Widerrufs-Verzicht-Bestätigung für Verbraucher mitsenden (geht sonst beim
  // Mail-only-Resend verloren).
  const rec = { eventId, sessionId, email, customerId, url, pkg, amount, customerType, consentTs, status: 'PAID' };
  orders.set(sessionId, rec);
  await write(rec);
  return rec;
}

export async function markStatus(sessionId, status, info = {}) {
  await ensureLoaded();
  const prev = orders.get(sessionId) || { sessionId };
  const rec = { ...prev, status, ...info };
  orders.set(sessionId, rec);
  await write(rec);
  return rec;
}

export async function getOrder(sessionId) {
  await ensureLoaded();
  return orders.get(sessionId) || null;
}

// --- DSGVO Art. 17: echte PII-Redaction -------------------------------------------
// Redigiert die PII (E-Mail, URL, Firma, Billing-Anschrift, Stripe-customerId) in
// ALLEN historischen Zeilen dieser E-Mail — per atomarem Datei-Rewrite (tmp+rename)
// UND in der In-Memory-Map (sonst lieferte /admin/orders die PII bis zum Neustart
// weiter aus). Transaktionsdaten (sessionId, eventId, pkg, amount, status,
// invoiceNumber, ts) bleiben erhalten: Aufbewahrungspflicht §147 AO/GoBD ist eine
// Ausnahme nach Art. 17 Abs. 3 lit. b DSGVO. Rechnungs-PDFs (invoices/) fallen
// vollständig unter diese Aufbewahrungspflicht und bleiben unangetastet.

const PII_REDACTED = '[geloescht-dsgvo]';

function redactOrderRec(rec, emailHash) {
  const email = String(rec.email || '');
  const out = { ...rec, emailHash, piiRedactedAt: new Date().toISOString() };
  for (const f of ['email', 'url', 'company', 'customerId', 'resentTo', 'correctedUrl']) {
    if (out[f]) out[f] = PII_REDACTED;
  }
  if (out.billing) out.billing = PII_REDACTED;
  // Fehlermeldungen können die Adresse zitieren („Empfängeradresse ungültig: x@y").
  if (email && typeof out.error === 'string' && out.error.includes(email)) {
    out.error = out.error.split(email).join(PII_REDACTED);
  }
  return out;
}

export async function redactOrdersByEmail(email, emailHash) {
  await ensureLoaded();
  const norm = String(email).toLowerCase().trim();
  const matches = (rec) => String(rec.email || '').toLowerCase().trim() === norm;
  const redactedSessions = new Set();
  if (existsSync(FILE)) {
    const txt = await readFile(FILE, 'utf8');
    const outLines = [];
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      let rec;
      try { rec = JSON.parse(line); } catch { outLines.push(line); continue; }
      if (matches(rec)) {
        rec = redactOrderRec(rec, emailHash);
        if (rec.sessionId) redactedSessions.add(rec.sessionId);
      }
      outLines.push(JSON.stringify(rec));
    }
    const tmp = FILE + '.redact.tmp';
    await writeFile(tmp, outLines.join('\n') + '\n');
    await rename(tmp, FILE);
  }
  // In-Memory-Map nachziehen (auch Sessions erwischen, deren letzte Zeile schon im
  // Speicher, aber evtl. nicht in der Datei stand — defensiv über matches()).
  for (const [sid, rec] of orders) {
    if (matches(rec)) {
      orders.set(sid, redactOrderRec(rec, emailHash));
      redactedSessions.add(sid);
    }
  }
  return redactedSessions.size;
}

// Liefert alle Orders (letzter Status pro Session) — für Admin-Dashboard.
// Neueste zuerst (Map-Iteration-Order ist Insertion-Order in JS).
export async function listOrders({ limit = 100, status = null } = {}) {
  await ensureLoaded();
  const all = [...orders.values()].reverse();
  const filtered = status ? all.filter((o) => o.status === status) : all;
  return filtered.slice(0, limit);
}
