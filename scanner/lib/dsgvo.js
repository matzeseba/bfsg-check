// DSGVO Art. 15 (Export) / Art. 17 (Löschung).
// Token-basierter Doppel-Opt-in (24h gültig). Tombstone-Lösung statt physisch
// löschen — Records bleiben für GoBD-Pflichtaufbewahrung, PII wird gehasht.
//
// Speicher: out/dsgvo-tokens.jsonl (Append-Only, beim Consume neuer Status-Eintrag)

import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const TOKENS_FILE = process.env.DSGVO_TOKENS_FILE || './out/dsgvo-tokens.jsonl';
const ORDERS_FILE = process.env.ORDERS_FILE || './out/orders.jsonl';
const SUBS_FILE   = process.env.SUBS_FILE   || './out/subscriptions.jsonl';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readJsonl(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data.split('\n').filter(Boolean).map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function appendJsonl(filePath, obj) {
  await ensureDir(filePath);
  await fs.appendFile(filePath, JSON.stringify(obj) + '\n');
}

function hashEmail(email) {
  return crypto.createHash('sha256').update(String(email).toLowerCase().trim()).digest('hex').slice(0, 16);
}

function redactUrl(url) {
  try { return new URL(url).hostname; } catch { return '[redacted]'; }
}

function emailMatches(record, email) {
  const norm = String(email).toLowerCase().trim();
  return String(record.email || '').toLowerCase().trim() === norm;
}

export async function requestDsgvoToken({ email, action }) {
  if (!email || !email.includes('@')) throw new Error('Ungültige E-Mail');
  if (!['export', 'delete'].includes(action)) throw new Error('Ungültige action');

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const entry = {
    type: 'request',
    token,
    email: String(email).toLowerCase().trim(),
    action,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + TOKEN_TTL_MS).toISOString(),
    status: 'PENDING'
  };
  await appendJsonl(TOKENS_FILE, entry);
  return { token, expiresAt: entry.expiresAt };
}

export async function consumeDsgvoToken(token) {
  const all = await readJsonl(TOKENS_FILE);
  // Letzter Eintrag pro Token (FIFO durch Append, LIFO durch Reverse)
  const tokens = new Map();
  for (const e of all) {
    if (e.type === 'request' && !tokens.has(e.token)) {
      tokens.set(e.token, e);
    }
    if (e.type === 'consume' && tokens.has(e.token)) {
      tokens.delete(e.token); // bereits verbraucht
    }
  }
  const req = tokens.get(token);
  if (!req) throw new Error('Token ungültig oder bereits verwendet');
  if (Date.now() > new Date(req.expiresAt).getTime()) throw new Error('Token abgelaufen');

  await appendJsonl(TOKENS_FILE, {
    type: 'consume',
    token,
    email: req.email,
    action: req.action,
    consumedAt: new Date().toISOString()
  });
  return { email: req.email, action: req.action };
}

// Prüft, ob für diese E-Mail bereits ein Tombstone (DELETED-Marker) existiert.
// Tombstones haben type:'DELETED' + emailHash. Wir hashen die Anfrage-E-Mail und vergleichen.
function isTombstoned(records, email) {
  const hash = hashEmail(email);
  return records.some((r) => r.type === 'DELETED' && r.emailHash === hash);
}

export async function exportUserData(email) {
  const allOrders = await readJsonl(ORDERS_FILE);
  const allSubs = await readJsonl(SUBS_FILE);
  // Wenn jemals gelöscht: leeres Export-Ergebnis (DSGVO Art. 17 Pflicht).
  if (isTombstoned(allOrders, email) || isTombstoned(allSubs, email)) {
    return {
      requestedAt: new Date().toISOString(),
      email,
      orderCount: 0,
      orders: [],
      subscriptionCount: 0,
      subscriptions: [],
      notice: 'Für diese E-Mail wurde eine Löschanfrage nach DSGVO Art. 17 verarbeitet. Aktive Records sind nicht mehr abrufbar.'
    };
  }
  const orders = allOrders.filter((r) => emailMatches(r, email));
  const subscriptions = allSubs.filter((r) => emailMatches(r, email));
  return {
    requestedAt: new Date().toISOString(),
    email,
    orderCount: orders.length,
    orders,
    subscriptionCount: subscriptions.length,
    subscriptions,
    notice: 'Diese Daten umfassen alle in BFSG-Check persistierten Records zu Ihrer E-Mail. Stripe-Daten + E-Mail-Versand-Logs (Brevo) müssen separat angefragt werden.'
  };
}

export async function deleteUserData(email) {
  // ECHTE Löschung (Art. 17): PII wird in allen historischen Zeilen von orders.jsonl/
  // subscriptions.jsonl redigiert (Datei-Rewrite + In-Memory-Map — sonst lieferte
  // /admin/orders die Klartext-PII bis zum Neustart weiter aus). Transaktionsdaten
  // (Beträge, Rechnungsnummern, Status) + Rechnungs-PDFs bleiben: Aufbewahrungspflicht
  // §147 AO/GoBD = Ausnahme nach Art. 17 Abs. 3 lit. b DSGVO. Aktive/pausierte Abos
  // sind vertragsnotwendig ausgenommen (erst kündigen). Tombstone bleibt als Marker
  // für exportUserData (leeres Ergebnis nach Löschung).
  const hash = hashEmail(email);
  const { redactOrdersByEmail } = await import('./orders.js');
  const { redactSubsByEmail } = await import('./subscriptions.js');
  const ordersRedacted = await redactOrdersByEmail(email, hash);
  const { redacted: subsRedacted, skippedActive } = await redactSubsByEmail(email, hash);
  const tombstone = {
    type: 'DELETED',
    deletedAt: new Date().toISOString(),
    emailHash: hash,
    reason: 'DSGVO Art. 17 Löschanfrage'
  };
  await appendJsonl(ORDERS_FILE, tombstone);
  await appendJsonl(SUBS_FILE, tombstone);
  return {
    deletedAt: tombstone.deletedAt,
    emailHash: hash,
    ordersRedacted,
    subsRedacted,
    skippedActive,
    notice: 'PII wurde aus allen gespeicherten Bestell-/Abo-Records entfernt (redigiert). ' +
      'Rechnungsdaten unterliegen der gesetzlichen Aufbewahrungspflicht (§147 AO) und bleiben gespeichert (Art. 17 Abs. 3 lit. b DSGVO).' +
      (skippedActive ? ' Hinweis: Ein laufendes Abo wurde nicht gelöscht — bitte zuerst kündigen.' : '')
  };
}
