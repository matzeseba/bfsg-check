// Persistente Bestell-Nachverfolgung + Idempotenz.
// Append-only JSONL: jede bezahlte Bestellung wird SOFORT festgehalten, bevor
// der Report erzeugt wird. So geht keine Zahlung verloren, Doppel-Webhooks werden
// erkannt, und fehlgeschlagene Erfüllungen sind manuell nachlieferbar (resend.js).

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

// Zahlung festhalten (Status PAID), bevor irgendetwas erzeugt wird.
export async function recordPaid({ eventId, sessionId, email, url, pkg, amount }) {
  await ensureLoaded();
  processedEvents.add(eventId);
  const rec = { eventId, sessionId, email, url, pkg, amount, status: 'PAID' };
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
