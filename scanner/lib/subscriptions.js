// Persistente Subscription-Nachverfolgung für das Re-Check-Abo.
// Append-only JSONL: pro Subscription wird der letzte Scan-Snapshot festgehalten,
// damit der nächste Monatsscan einen Diff bilden kann. Wir speichern absichtlich
// NUR die für den Diff nötige Mini-Form (siehe diff.js#snapshot) — kein PII außer
// E-Mail/URL, die ohnehin im Auftrag stehen.

import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = process.env.SUBS_FILE || path.join(__dirname, '..', 'out', 'subscriptions.jsonl');

const subs = new Map(); // subscriptionId -> letzter Stand
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
      if (rec.subscriptionId) subs.set(rec.subscriptionId, rec);
    }
  } catch {
    /* defekte Zeilen ignorieren */
  }
}

async function write(rec) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, JSON.stringify({ ...rec, ts: new Date().toISOString() }) + '\n');
}

// Wird beim ersten Checkout (Subscription-Mode) aufgerufen.
export async function recordSubscription({ subscriptionId, customerId, email, url, company, pkg }) {
  await ensureLoaded();
  const rec = {
    subscriptionId, customerId, email, url, company: company || '', pkg,
    status: 'ACTIVE', createdAt: new Date().toISOString(),
    lastSnapshot: null
  };
  subs.set(subscriptionId, rec);
  await write(rec);
  return rec;
}

// Snapshot aktualisieren (nach jedem erfolgreich ausgelieferten Re-Scan).
export async function saveSnapshot(subscriptionId, snap) {
  await ensureLoaded();
  const prev = subs.get(subscriptionId);
  if (!prev) return null;
  const rec = { ...prev, lastSnapshot: snap, lastScanAt: new Date().toISOString() };
  subs.set(subscriptionId, rec);
  await write(rec);
  return rec;
}

export async function getSubscription(subscriptionId) {
  await ensureLoaded();
  return subs.get(subscriptionId) || null;
}

export async function markCancelled(subscriptionId, info = {}) {
  await ensureLoaded();
  const prev = subs.get(subscriptionId);
  if (!prev) return null;
  const rec = { ...prev, status: 'CANCELLED', cancelledAt: new Date().toISOString(), ...info };
  subs.set(subscriptionId, rec);
  await write(rec);
  return rec;
}

// Liefert alle Subscriptions (letzter Status pro ID) — für Admin-Dashboard.
export async function listSubscriptions({ status = null } = {}) {
  await ensureLoaded();
  const all = [...subs.values()].reverse();
  return status ? all.filter((s) => s.status === status) : all;
}
