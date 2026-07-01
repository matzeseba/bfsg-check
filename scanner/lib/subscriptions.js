// Persistente Subscription-Nachverfolgung für das Re-Check-Abo.
// Append-only JSONL: pro Subscription wird der letzte Scan-Snapshot festgehalten,
// damit der nächste Monatsscan einen Diff bilden kann. Wir speichern absichtlich
// NUR die für den Diff nötige Mini-Form (siehe diff.js#snapshot) — kein PII außer
// E-Mail/URL, die ohnehin im Auftrag stehen.

import { appendFile, mkdir, readFile, writeFile, rename } from 'node:fs/promises';
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

// Spiegelt einen Stripe-Subscription-Status (active/past_due/unpaid/...) in den
// lokalen Status. Nur ACTIVE-Subscriptions lösen Re-Checks aus (siehe app.js),
// past_due/unpaid pausiert damit automatisch, bis die Zahlung wieder klappt.
// Stripe-Status -> lokaler Status.
const STRIPE_STATUS_MAP = {
  active: 'ACTIVE',
  trialing: 'ACTIVE',
  past_due: 'PAST_DUE',
  unpaid: 'PAST_DUE',
  paused: 'PAST_DUE',
  canceled: 'CANCELLED',
  incomplete: 'PAST_DUE',
  incomplete_expired: 'CANCELLED'
};

export async function markSubscriptionStatus(subscriptionId, stripeStatus) {
  await ensureLoaded();
  const prev = subs.get(subscriptionId);
  if (!prev) return null;
  const mapped = STRIPE_STATUS_MAP[stripeStatus] || prev.status;
  if (mapped === prev.status) return prev; // kein Wechsel → kein Log-Spam
  const rec = { ...prev, status: mapped, stripeStatus, statusChangedAt: new Date().toISOString() };
  subs.set(subscriptionId, rec);
  await write(rec);
  return rec;
}

// --- DSGVO Art. 17: echte PII-Redaction (analog orders.js#redactOrdersByEmail) ------
// Redigiert E-Mail/URL/Firma/customerId in allen historischen Zeilen der passenden
// Subscriptions — Datei-Rewrite (tmp+rename) + In-Memory-Map. AUSNAHME: Subscriptions,
// deren letzter Status ACTIVE/PAST_DUE ist (laufender Vertrag) — deren Daten sind für
// die Vertragserfüllung (Monats-Re-Check) erforderlich (Art. 17 Abs. 3 lit. b / Art.
// 6 Abs. 1 lit. b DSGVO); der Kunde muss zuerst kündigen. lastSnapshot enthält keine
// PII (Mini-Diff-Form, siehe diff.js#snapshot) und bleibt unangetastet.

const PII_REDACTED = '[geloescht-dsgvo]';

function redactSubRec(rec, emailHash) {
  const out = { ...rec, emailHash, piiRedactedAt: new Date().toISOString() };
  for (const f of ['email', 'url', 'company', 'customerId']) {
    if (out[f]) out[f] = PII_REDACTED;
  }
  return out;
}

export async function redactSubsByEmail(email, emailHash) {
  await ensureLoaded();
  const norm = String(email).toLowerCase().trim();
  const matches = (rec) => String(rec.email || '').toLowerCase().trim() === norm;
  // Entscheidungsbasis = LETZTER Status je Subscription (In-Memory-Map).
  const redactIds = new Set();
  let skippedActive = 0;
  for (const [id, rec] of subs) {
    if (!matches(rec)) continue;
    if (rec.status === 'ACTIVE' || rec.status === 'PAST_DUE') { skippedActive += 1; continue; }
    redactIds.add(id);
  }
  if (redactIds.size && existsSync(FILE)) {
    const txt = await readFile(FILE, 'utf8');
    const outLines = [];
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      let rec;
      try { rec = JSON.parse(line); } catch { outLines.push(line); continue; }
      if (rec.subscriptionId && redactIds.has(rec.subscriptionId)) rec = redactSubRec(rec, emailHash);
      outLines.push(JSON.stringify(rec));
    }
    const tmp = FILE + '.redact.tmp';
    await writeFile(tmp, outLines.join('\n') + '\n');
    await rename(tmp, FILE);
    for (const id of redactIds) {
      const cur = subs.get(id);
      if (cur) subs.set(id, redactSubRec(cur, emailHash));
    }
  }
  return { redacted: redactIds.size, skippedActive };
}

// Liefert alle Subscriptions (letzter Status pro ID) — für Admin-Dashboard.
export async function listSubscriptions({ status = null } = {}) {
  await ensureLoaded();
  const all = [...subs.values()].reverse();
  return status ? all.filter((s) => s.status === status) : all;
}
