// Durable Queue für DOI-gegatete Gratis-Report-Mails (Teaser, 02.07.).
//
// Der Gratis-Report wird nach POST /api/lead NICHT sofort gemailt, sondern hier
// durabel eingequeut. Erst der Klick auf den Brevo-Double-Opt-in-Bestätigungslink
// (→ Redirect auf GET /api/lead/confirm?id=…&token=…) löst den Versand aus. So kann
// niemand einen fremden Posteingang mit angeforderten Reports zuspammen, und die
// DOI-Bestätigung liegt VOR der ersten Inhalts-Mail (Owner-Vorgabe 02.07.).
//
// Append-only-JSONL im bfsg_data-Volume (/app/out) — dasselbe Muster wie
// report-queue.js/orders.js: überlebt Redeploys. Anders als das Owner-Release-Gate
// braucht der Teaser KEINE Crash-in-doubt-Behandlung: ein doppelter Teaser ist
// harmlos (keine Rechnung, kein § 14-Beleg), ein nach Crash-Recovery erneuter
// Versuch ist die sichere Wahl. Idempotenz gegen Doppelklick liefert der terminale
// SENT-Status plus der atomare In-Memory-Claim.

import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = process.env.PENDING_LEADS_FILE || path.join(__dirname, '..', 'out', 'pending-leads.jsonl');

// id -> letzter Record. Status: PENDING (wartet auf DOI-Klick) → SENDING (in-flight,
// bewusst NUR In-Memory — nicht persistiert, damit ein Crash mitten im Versand beim
// Neuladen wieder als PENDING erscheint und der nächste Klick erneut sendet) →
// SENT (terminal) | SEND_FAILED (terminal, permanenter Mailfehler).
const leads = new Map();
let loadPromise = null;

// Promise-basiert (nicht bool): alle Aufrufer awaiten dieselbe Ladephase, keine Race
// mit zwei parallelen ersten Zugriffen (analog report-queue.js).
function ensureLoaded() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    if (!existsSync(FILE)) return;
    try {
      const txt = await readFile(FILE, 'utf8');
      for (const line of txt.split('\n')) {
        if (!line.trim()) continue;
        const rec = JSON.parse(line);
        if (rec.id) leads.set(rec.id, rec);
      }
    } catch {
      /* defekte Zeilen ignorieren */
    }
  })();
  return loadPromise;
}

async function write(rec) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, JSON.stringify({ ...rec, ts: new Date().toISOString() }) + '\n');
}

/**
 * Neuen Pending-Lead persistieren. `lead` trägt die Gratis-Scan-Übersicht
 * (to, url, score, counts, topIssues, totalIssues) plus createdAt/expiresAt.
 * @returns {Promise<object>} der persistierte Record
 */
export async function enqueue(lead) {
  await ensureLoaded();
  const rec = { ...lead, status: 'PENDING', attempts: 0 };
  leads.set(lead.id, rec);
  await write(rec);
  return rec;
}

export async function getLead(id) {
  await ensureLoaded();
  return leads.get(id) || null;
}

/**
 * Atomarer Claim gegen Doppelversand (analog claimForRelease/report-queue.js):
 * check-then-set in EINEM synchronen Block (kein await dazwischen) ist im
 * Single-Thread-Eventloop atomar. Zwei parallele Confirm-Klicks können nicht beide
 * denselben Lead beanspruchen.
 * @returns {object|null} den beanspruchten Job oder null (schon vergeben/terminal).
 */
export function claimForSend(id) {
  const rec = leads.get(id);
  if (!rec || rec.status !== 'PENDING') return null;
  rec.status = 'SENDING'; // nur In-Memory (siehe Kopf) — bewusst nicht persistiert
  return rec;
}

/** Transienter Mailfehler → zurück auf PENDING, damit der nächste Klick erneut sendet. */
export async function requeue(id, { error = '' } = {}) {
  await ensureLoaded();
  const rec = leads.get(id);
  if (!rec) return null;
  rec.status = 'PENDING';
  rec.attempts = (rec.attempts || 0) + 1;
  if (error) rec.lastError = error;
  await write(rec);
  return rec;
}

/** Erfolgreich versendet → terminal SENT (idempotenter Doppelklick sendet nicht erneut). */
export async function markSent(id, info = {}) {
  await ensureLoaded();
  const prev = leads.get(id) || { id };
  const rec = { ...prev, status: 'SENT', sentAt: new Date().toISOString(), ...info };
  leads.set(id, rec);
  await write(rec);
  return rec;
}

/** Permanenter Mailfehler → terminal SEND_FAILED (Owner wird separat alarmiert). */
export async function markFailed(id, { error = '' } = {}) {
  await ensureLoaded();
  const prev = leads.get(id) || { id };
  const rec = { ...prev, status: 'SEND_FAILED', lastError: error };
  leads.set(id, rec);
  await write(rec);
  return rec;
}

// Test-Hilfe: In-Memory-Zustand zurücksetzen (die Datei bleibt unangetastet).
export function _resetForTests() {
  leads.clear();
  loadPromise = null;
}
