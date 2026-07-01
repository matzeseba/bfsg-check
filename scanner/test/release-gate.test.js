// Tests fürs Owner-Release-Gate (PR5): Signatur-Token, durable Queue + atomarer
// Claim (kein Doppelversand), Auto-Release-Scheduler mit Retry/Fail-Pfaden.
// Reiner Logik-Test — kein Browser, kein SMTP, kein Stripe.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { existsSync, rmSync } from 'node:fs';

// WICHTIG: Queue-Datei auf einen Temp-Pfad legen, BEVOR report-queue.js importiert wird
// (FILE wird beim Modul-Laden aus der Env gelesen).
const QUEUE_FILE = path.join(os.tmpdir(), `bfsg-pending-reports-test-${process.pid}.jsonl`);
process.env.PENDING_REPORTS_FILE = QUEUE_FILE;

const reportQueue = await import('../lib/report-queue.js');
const { releaseJob, releaseDue, recoverInDoubt } = await import('../lib/scheduler.js');
const { signRelease, verifyRelease, releaseTokenConfigured } = await import('../lib/release-token.js');

const past = () => new Date(Date.now() - 60_000).toISOString();
const future = () => new Date(Date.now() + 60 * 60_000).toISOString();

function baseJob(sessionId, releaseAt) {
  return {
    sessionId, to: 'kunde@example.com', company: 'ACME', url: 'https://acme.example',
    pkg: 'basis', emailKind: 'bfsg', pdfPath: '/tmp/r.pdf', stmtPath: null,
    diffText: '', invoicePdfPath: null, invoiceNumber: 'RE-1', customerType: '', consentTs: '',
    releaseAt
  };
}

// Recording-Stubs für die Scheduler-Abhängigkeiten.
function makeDeps({ sendImpl } = {}) {
  const calls = { sent: [], status: [], alerts: [] };
  return {
    deps: {
      reportQueue,
      sendReportFor: async (args) => { calls.sent.push(args); if (sendImpl) return sendImpl(args); },
      markStatus: async (id, status, info) => { calls.status.push({ id, status, info }); },
      sendAlert: async (subject, body) => { calls.alerts.push({ subject, body }); },
      isTransientMailError: (err) => !!err && err.transient === true,
      via: 'auto'
    },
    calls
  };
}

beforeEach(() => {
  reportQueue._resetForTests();
  if (existsSync(QUEUE_FILE)) rmSync(QUEUE_FILE);
});

// --- Release-Token -----------------------------------------------------------
test('release-token: sign/verify Roundtrip mit gesetztem Secret', () => {
  const env = { ADMIN_TOKEN: 'x'.repeat(32) };
  const t = signRelease('sess_1', env);
  assert.ok(t.length >= 32);
  assert.equal(releaseTokenConfigured(env), true);
  assert.equal(verifyRelease('sess_1', t, env), true);
});

test('release-token: falscher Token + fehlendes Secret werden abgelehnt', () => {
  const env = { ADMIN_TOKEN: 'x'.repeat(32) };
  assert.equal(verifyRelease('sess_1', 'deadbeef', env), false);
  assert.equal(verifyRelease('sess_1', signRelease('sess_2', env), env), false); // Token für andere Session
  assert.equal(releaseTokenConfigured({}), false);
  assert.equal(signRelease('sess_1', {}), '');
  assert.equal(verifyRelease('sess_1', 'irgendwas', {}), false);
});

// --- Queue -------------------------------------------------------------------
test('queue: enqueue → SCHEDULED, listDue respektiert releaseAt', async () => {
  await reportQueue.enqueue(baseJob('due_1', past()));
  await reportQueue.enqueue(baseJob('later_1', future()));
  const due = await reportQueue.listDue();
  assert.deepEqual(due.map((j) => j.sessionId), ['due_1']);
  const pending = await reportQueue.listPending();
  assert.equal(pending.length, 2);
});

test('queue: claimForRelease ist atomar (zweiter Claim = null)', async () => {
  await reportQueue.enqueue(baseJob('c_1', past()));
  const first = reportQueue.claimForRelease('c_1');
  const second = reportQueue.claimForRelease('c_1');
  assert.ok(first);
  assert.equal(second, null);
});

test('queue: requeue setzt zurück auf SCHEDULED + zählt attempts hoch', async () => {
  await reportQueue.enqueue(baseJob('rq_1', past()));
  reportQueue.claimForRelease('rq_1');
  const r = await reportQueue.requeue('rq_1', { error: 'boom' });
  assert.equal(r.status, 'SCHEDULED');
  assert.equal(r.attempts, 1);
});

// --- Scheduler / releaseJob --------------------------------------------------
test('releaseJob: versendet, markiert MAILED + RELEASED', async () => {
  await reportQueue.enqueue(baseJob('ok_1', past()));
  const { deps, calls } = makeDeps();
  const res = await releaseJob('ok_1', { ...deps, via: 'owner' });
  assert.equal(res.released, true);
  assert.equal(calls.sent.length, 1);
  assert.equal(calls.sent[0].to, 'kunde@example.com');
  assert.equal(calls.sent[0].invoiceNumber, 'RE-1');
  assert.ok(calls.status.some((s) => s.status === 'MAILED'));
  const job = await reportQueue.getJob('ok_1');
  assert.equal(job.status, 'RELEASED');
  assert.equal(job.releasedBy, 'owner');
});

test('releaseJob: kein Doppelversand bei parallelen Auslösern (Owner-Klick + Auto-Tick)', async () => {
  await reportQueue.enqueue(baseJob('dbl_1', past()));
  const { deps, calls } = makeDeps();
  const [a, b] = await Promise.all([
    releaseJob('dbl_1', { ...deps, via: 'owner' }),
    releaseJob('dbl_1', { ...deps, via: 'auto' })
  ]);
  assert.equal(calls.sent.length, 1); // GENAU eine Mail — kein Doppelversand, keine Doppelrechnung
  assert.equal([a, b].filter((r) => r.released).length, 1);
});

test('releaseJob: transienter Mailfehler → Requeue (nicht terminal), keine MAILED-Markierung', async () => {
  await reportQueue.enqueue(baseJob('tr_1', past()));
  const { deps, calls } = makeDeps({ sendImpl: () => { const e = new Error('smtp down'); e.transient = true; throw e; } });
  const res = await releaseJob('tr_1', deps);
  assert.equal(res.released, false);
  assert.equal(res.reason, 'transient');
  const job = await reportQueue.getJob('tr_1');
  assert.equal(job.status, 'SCHEDULED'); // zurück in der Queue
  assert.ok(!calls.status.some((s) => s.status === 'MAILED'));
});

test('releaseJob: permanenter Fehler → RELEASE_FAILED + READY_NOT_MAILED + Owner-Alarm', async () => {
  await reportQueue.enqueue(baseJob('pm_1', past()));
  const { deps, calls } = makeDeps({ sendImpl: () => { throw new Error('invalid recipient'); } }); // transient=false
  const res = await releaseJob('pm_1', deps);
  assert.equal(res.released, false);
  assert.equal(res.reason, 'permanent');
  const job = await reportQueue.getJob('pm_1');
  assert.equal(job.status, 'RELEASE_FAILED');
  assert.ok(calls.status.some((s) => s.status === 'READY_NOT_MAILED'));
  assert.equal(calls.alerts.length, 1);
});

// --- Crash-Idempotenz (CRITICAL-Fix): Claim persistiert, kein Auto-Zweitversand -------
test('persistClaim: schreibt RELEASING durabel (überlebt Neuladen als in-doubt)', async () => {
  await reportQueue.enqueue(baseJob('crash_1', past()));
  reportQueue.claimForRelease('crash_1');            // In-Memory-Claim
  await reportQueue.persistClaim('crash_1');         // vor dem Send persistieren
  // „Crash" simulieren: In-Memory-State verwerfen, aus der Datei neu laden.
  reportQueue._resetForTests();
  const job = await reportQueue.getJob('crash_1');
  assert.equal(job.status, 'RELEASING');             // NICHT auf SCHEDULED zurückgesetzt
  const due = await reportQueue.listDue();
  assert.equal(due.length, 0);                       // wird NICHT automatisch erneut versendet
  const inDoubt = await reportQueue.listInDoubt();
  assert.deepEqual(inDoubt.map((j) => j.sessionId), ['crash_1']);
});

test('recoverInDoubt: meldet in-doubt-Jobs beim Start + markiert sie terminal', async () => {
  await reportQueue.enqueue(baseJob('id_1', past()));
  reportQueue.claimForRelease('id_1');
  await reportQueue.persistClaim('id_1');
  reportQueue._resetForTests();
  const { deps, calls } = makeDeps();
  const n = await recoverInDoubt(deps);
  assert.equal(n, 1);
  assert.equal(calls.alerts.length, 1);              // Owner-Alarm (kein Auto-Zweitversand)
  assert.equal((await reportQueue.getJob('id_1')).status, 'RELEASE_IN_DOUBT');
  // Zweiter Start alarmiert nicht erneut (terminal).
  reportQueue._resetForTests();
  const { deps: d2, calls: c2 } = makeDeps();
  await recoverInDoubt(d2);
  assert.equal(c2.alerts.length, 0);
});

test('releaseDue: gibt nur fällige Jobs frei', async () => {
  await reportQueue.enqueue(baseJob('d_a', past()));
  await reportQueue.enqueue(baseJob('d_b', future()));
  const { deps, calls } = makeDeps();
  const summary = await releaseDue(deps);
  assert.equal(summary.due, 1);
  assert.equal(summary.released, 1);
  assert.equal(calls.sent.length, 1);
  assert.equal(calls.sent[0].to, 'kunde@example.com');
  assert.equal((await reportQueue.getJob('d_b')).status, 'SCHEDULED'); // noch nicht fällig
});
