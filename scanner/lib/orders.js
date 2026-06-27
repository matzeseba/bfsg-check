// Persistente Bestell-Nachverfolgung + Idempotenz.
// Append-only JSONL: jede bezahlte Bestellung wird SOFORT festgehalten, bevor
// der Report erzeugt wird. So geht keine Zahlung verloren, Doppel-Webhooks werden
// erkannt, und fehlgeschlagene Erfüllungen sind manuell nachlieferbar
// (POST /api/resend/:sessionId mit Admin-Bearer-Token, siehe app.js).

import { appendFile, mkdir, readFile } from 'node:fs/promises';
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
  // Claim SOFORT durabel auf Disk schreiben: überlebt einen Prozess-Restart,
  // sodass ein Stripe-Redelivery NACH einem Crash dedupliziert wird (vorher nur
  // In-Memory → nach Neustart wäre der Claim verloren gewesen). Der Claim-Datensatz
  // trägt nur eventId (kein sessionId) → landet in processedEvents, nicht in der
  // orders-Map (ensureLoaded überspringt sessionId-lose Records dort).
  await write({ eventId, status: 'EVENT_CLAIMED' });
  return true;
}

// Zahlung festhalten (Status PAID), bevor irgendetwas erzeugt wird.
// customerId (Stripe) wird mitgespeichert, falls vorhanden — für Kundenverwaltung,
// Doppelkauf-Erkennung und spätere Customer-Portal-Anbindung.
export async function recordPaid({ eventId, sessionId, email, url, pkg, amount, customerId = null }) {
  await ensureLoaded();
  processedEvents.add(eventId);
  const rec = { eventId, sessionId, email, customerId, url, pkg, amount, status: 'PAID' };
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

// Liefert alle Orders (letzter Status pro Session) — für Admin-Dashboard.
// Neueste zuerst (Map-Iteration-Order ist Insertion-Order in JS).
export async function listOrders({ limit = 100, status = null } = {}) {
  await ensureLoaded();
  const all = [...orders.values()].reverse();
  const filtered = status ? all.filter((o) => o.status === status) : all;
  return filtered.slice(0, limit);
}
