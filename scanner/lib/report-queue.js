// Durable Queue für zeitversetzt freizugebende Reports (Owner-Release-Gate, PR5).
//
// Nach Scan + PDF + Rechnung wird der fertige Report NICHT sofort an den Kunden
// gemailt, sondern hier durabel eingequeut. Der Owner bekommt eine Freigabe-Mail
// (mailer.sendOwnerReview) mit 1-Klick-Link; der Scheduler (scheduler.js) gibt den
// Report bei `releaseAt` automatisch frei, falls der Owner nichts tut (90-Min-
// Auto-Release). So bleibt der Marketing-Claim „jeder Report wird vor Auslieferung
// gesichtet" wahr, ohne die Auslieferung unbegrenzt zu blockieren.
//
// Append-only-JSONL im bfsg_data-Volume (/app/out) — 1:1 das Muster von orders.js:
// überlebt Redeploys, der Scheduler-Start-Tick fängt beim Neustart überfällige Jobs.

import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = process.env.PENDING_REPORTS_FILE || path.join(__dirname, '..', 'out', 'pending-reports.jsonl');

// Job-Status: SCHEDULED (wartet auf Owner/Auto-Release) → RELEASING (in-flight,
// atomar beansprucht) → RELEASED (versendet, terminal) | RELEASE_FAILED (terminal,
// nach permanentem Mailfehler; Owner-Alarm + manueller /api/resend).
const jobs = new Map(); // sessionId -> letzter Job-Record
let loadPromise = null;

// Promise-basiert (nicht bool): verhindert die Race, dass zwei parallele Aufrufe
// (Scheduler-Start-Tick + reconcileOnStartup) beide vor dem readFile durchlaufen und
// eine leere Job-Map sehen. Alle Aufrufer awaiten dieselbe Ladephase.
function ensureLoaded() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    if (!existsSync(FILE)) return;
    try {
      const txt = await readFile(FILE, 'utf8');
      for (const line of txt.split('\n')) {
        if (!line.trim()) continue;
        const rec = JSON.parse(line);
        if (rec.sessionId) jobs.set(rec.sessionId, rec);
      }
    } catch {
      /* defekte Zeilen ignorieren */
    }
    // RELEASING wird beim Laden BEWUSST NICHT auf SCHEDULED zurückgesetzt: ein solcher
    // Job war beim Absturz mitten im Versand — ob die Mail rausging, ist ungewiss. Ein
    // Auto-Reset würde ihn erneut versenden (Doppelversand-Risiko, §14/GoBD). Stattdessen
    // bleibt er RELEASING (listDue liefert nur SCHEDULED → kein Auto-Retry) und wird beim
    // Start über listInDoubt dem Owner gemeldet (manueller Resend bei Bedarf).
  })();
  return loadPromise;
}

async function write(rec) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, JSON.stringify({ ...rec, ts: new Date().toISOString() }) + '\n');
}

/**
 * Neuen Freigabe-Job persistieren. `job` enthält alles, was sendReportFor braucht,
 * damit die Freigabe (Scheduler oder Owner-Klick) self-contained ohne erneuten
 * fulfillOrder läuft.
 * @param {object} job
 * @returns {Promise<object>} der persistierte Record
 */
export async function enqueue(job) {
  await ensureLoaded();
  const rec = { ...job, status: 'SCHEDULED', attempts: 0 };
  jobs.set(job.sessionId, rec);
  await write(rec);
  return rec;
}

export async function getJob(sessionId) {
  await ensureLoaded();
  return jobs.get(sessionId) || null;
}

/** Alle noch offenen (SCHEDULED) Jobs — für den Reconcile-Abgleich. */
export async function listPending() {
  await ensureLoaded();
  return [...jobs.values()].filter((j) => j.status === 'SCHEDULED');
}

/** Fällige, noch offene Jobs (releaseAt <= now). */
export async function listDue(now = Date.now()) {
  await ensureLoaded();
  return [...jobs.values()].filter(
    (j) => j.status === 'SCHEDULED' && Date.parse(j.releaseAt) <= now
  );
}

/**
 * Atomarer Claim gegen Doppelversand (analog claimEvent in orders.js):
 * check-then-set in EINEM synchronen Block (kein await dazwischen) ist im
 * Single-Thread-Eventloop atomar. Zwei gleichzeitige Auslöser (Scheduler-Tick +
 * Owner-Klick) können nicht beide denselben Job beanspruchen.
 * @returns {object|null} den beanspruchten Job oder null, wenn schon vergeben/terminal.
 */
export function claimForRelease(sessionId) {
  const rec = jobs.get(sessionId);
  if (!rec || rec.status !== 'SCHEDULED') return null;
  rec.status = 'RELEASING'; // synchroner In-Memory-Claim (noch nicht persistiert)
  return rec;
}

// Persistiert den RELEASING-Claim VOR dem Sendeversuch (Crash-Idempotenz): stürzt der
// Prozess zwischen erfolgreichem Versand und dem RELEASED-Status-Write ab, steht der Job
// beim Neustart auf RELEASING (in-doubt) statt SCHEDULED → KEIN automatischer Zweitversand
// (listDue liefert nur SCHEDULED). Wird stattdessen über listInDoubt gemeldet.
export async function persistClaim(sessionId) {
  await ensureLoaded();
  const rec = jobs.get(sessionId);
  if (!rec) return null;
  rec.status = 'RELEASING';
  await write(rec);
  return rec;
}

// Jobs, die beim letzten Absturz mitten im Versand standen (RELEASING) — beim Start
// dem Owner melden, damit er den Kunden-Posteingang prüft und ggf. manuell nachliefert.
export async function listInDoubt() {
  await ensureLoaded();
  return [...jobs.values()].filter((j) => j.status === 'RELEASING');
}

/** Einen zuvor beanspruchten Job wieder freigeben (transienter Mailfehler → Retry). */
export async function requeue(sessionId, { error = '' } = {}) {
  await ensureLoaded();
  const rec = jobs.get(sessionId);
  if (!rec) return null;
  rec.status = 'SCHEDULED';
  rec.attempts = (rec.attempts || 0) + 1;
  if (error) rec.lastError = error;
  await write(rec);
  return rec;
}

/** Job final markieren (RELEASED terminal, RELEASE_FAILED terminal). */
export async function markJobStatus(sessionId, status, info = {}) {
  await ensureLoaded();
  const prev = jobs.get(sessionId) || { sessionId };
  const rec = { ...prev, status, ...info };
  jobs.set(sessionId, rec);
  await write(rec);
  return rec;
}

// Test-Hilfe: In-Memory-Zustand zurücksetzen (die Datei bleibt unangetastet).
export function _resetForTests() {
  jobs.clear();
  loadPromise = null;
}
