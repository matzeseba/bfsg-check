// Tests fürs DOI-Gate des Gratis-Reports (02.07.): Signatur-Token (7-Tage-Gültigkeit
// über expiresAt), durable Pending-Lead-Queue + atomarer Claim, sowie der Confirm-
// Endpoint gegen die ECHTE Express-App (supertest). Seit 07.07. versendet Confirm
// NICHTS mehr (die Übersicht kommt allein über die Brevo-Automation) — er markiert
// den Lead nur terminal SENT; die Queue läuft echt gegen eine tmp-JSONL.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { existsSync, rmSync, mkdtempSync } from 'node:fs';

// WICHTIG: Pfade + Secret VOR dem Import der Module fixieren (FILE/Secret werden beim
// Modul-Laden aus der Env gelesen).
const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-lead-gate-'));
const LEADS_FILE = path.join(tmp, `pending-leads-${process.pid}.jsonl`);
process.env.PENDING_LEADS_FILE = LEADS_FILE;
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending-reports.jsonl');
process.env.ADMIN_TOKEN = '0123456789abcdef0123456789abcdef01'; // >= 16 → leadTokenConfigured
delete process.env.STRIPE_SECRET_KEY; // kein Live → keine Fail-Fast-Seiteneffekte beim Import

const leadQueue = await import('../lib/lead-queue.js');
const { signLead, verifyLead, leadTokenConfigured } = await import('../lib/lead-token.js');

const day = 24 * 60 * 60 * 1000;
const future = () => new Date(Date.now() + 7 * day).toISOString();
const past = () => new Date(Date.now() - 60_000).toISOString();

function baseLead(id, expiresAt = future()) {
  return {
    id, to: 'lead@example.com', url: 'https://example.com', score: 42,
    counts: { critical: 1, serious: 1, moderate: 1, minor: 0 },
    topIssues: ['Kontrast zu schwach', 'Alt-Texte fehlen', 'Labels fehlen'],
    totalIssues: 7, createdAt: new Date().toISOString(), expiresAt
  };
}

beforeEach(() => {
  leadQueue._resetForTests();
  if (existsSync(LEADS_FILE)) rmSync(LEADS_FILE);
});

// --- Lead-Token -------------------------------------------------------------
test('lead-token: sign/verify Roundtrip mit gesetztem Secret', () => {
  const env = { ADMIN_TOKEN: 'x'.repeat(32) };
  const t = signLead('lead_1', env);
  assert.ok(t.length >= 32);
  assert.equal(leadTokenConfigured(env), true);
  assert.equal(verifyLead('lead_1', t, env), true);
});

test('lead-token: falscher Token + fehlendes Secret werden abgelehnt', () => {
  const env = { ADMIN_TOKEN: 'x'.repeat(32) };
  assert.equal(verifyLead('lead_1', 'deadbeef', env), false);
  assert.equal(verifyLead('lead_1', signLead('lead_2', env), env), false); // Token für andere ID
  assert.equal(leadTokenConfigured({}), false);
  assert.equal(signLead('lead_1', {}), '');
  assert.equal(verifyLead('lead_1', 'irgendwas', {}), false);
});

// --- Queue ------------------------------------------------------------------
test('queue: enqueue → PENDING, getLead liefert Payload', async () => {
  await leadQueue.enqueue(baseLead('q_1'));
  const rec = await leadQueue.getLead('q_1');
  assert.equal(rec.status, 'PENDING');
  assert.equal(rec.to, 'lead@example.com');
  assert.equal(rec.attempts, 0);
});

test('queue: claimForSend ist atomar (zweiter Claim = null)', async () => {
  await leadQueue.enqueue(baseLead('q_2'));
  const first = leadQueue.claimForSend('q_2');
  const second = leadQueue.claimForSend('q_2');
  assert.ok(first);
  assert.equal(second, null);
});

test('queue: requeue setzt zurück auf PENDING + zählt attempts hoch', async () => {
  await leadQueue.enqueue(baseLead('q_3'));
  leadQueue.claimForSend('q_3');
  const r = await leadQueue.requeue('q_3', { error: 'smtp down' });
  assert.equal(r.status, 'PENDING');
  assert.equal(r.attempts, 1);
});

test('queue: markSent ist terminal, claimForSend danach = null', async () => {
  await leadQueue.enqueue(baseLead('q_4'));
  leadQueue.claimForSend('q_4');
  await leadQueue.markSent('q_4');
  assert.equal((await leadQueue.getLead('q_4')).status, 'SENT');
  assert.equal(leadQueue.claimForSend('q_4'), null);
});

test('queue: Pending-Persistenz überlebt Neuladen aus der Datei', async () => {
  await leadQueue.enqueue(baseLead('q_5'));
  leadQueue._resetForTests(); // „Neustart" simulieren
  const rec = await leadQueue.getLead('q_5');
  assert.ok(rec);
  assert.equal(rec.status, 'PENDING'); // In-Memory-SENDING wird NICHT persistiert → wieder PENDING
});

// --- Confirm-Endpoint (supertest gegen die echte App) -----------------------
// Confirm versendet keine Mail mehr (kein Mock nötig): gültiger Token markiert
// den Lead terminal als SENT und redirectet auf /anmeldung-bestaetigt.
const request = (await import('supertest')).default;
const { app } = await import('../app.js');

const confirm = (id, token) => request(app).get(`/api/lead/confirm?id=${id}&token=${token}`);

test('confirm: gültiger Token → 302 auf /anmeldung-bestaetigt + Lead terminal SENT (kein Versand)', async () => {
  const id = 'c_ok';
  await leadQueue.enqueue(baseLead(id));

  const res = await confirm(id, signLead(id));
  assert.equal(res.status, 302);
  assert.match(res.headers.location, /\/anmeldung-bestaetigt$/);
  assert.equal((await leadQueue.getLead(id)).status, 'SENT');

  // Doppelklick: idempotent, Status bleibt terminal SENT.
  const res2 = await confirm(id, signLead(id));
  assert.equal(res2.status, 302);
  assert.match(res2.headers.location, /\/anmeldung-bestaetigt$/);
  assert.equal((await leadQueue.getLead(id)).status, 'SENT');
});

test('confirm: parallele Klicks → beide 302, Record genau 1× terminal SENT (atomarer Claim)', async () => {
  const id = 'c_race';
  await leadQueue.enqueue(baseLead(id));

  const [a, b] = await Promise.all([confirm(id, signLead(id)), confirm(id, signLead(id))]);
  assert.deepEqual([a.status, b.status].sort(), [302, 302]);
  assert.equal((await leadQueue.getLead(id)).status, 'SENT');
});

test('confirm: ungültiger Token → 302 ?status=abgelaufen, kein markSent', async () => {
  const id = 'c_bad';
  await leadQueue.enqueue(baseLead(id));
  const res = await confirm(id, 'deadbeef');
  assert.equal(res.status, 302);
  assert.match(res.headers.location, /status=abgelaufen/);
  assert.equal((await leadQueue.getLead(id)).status, 'PENDING');
});

test('confirm: abgelaufener Record (expiresAt < now) → 302 ?status=abgelaufen, kein markSent', async () => {
  const id = 'c_exp';
  await leadQueue.enqueue(baseLead(id, past()));
  const res = await confirm(id, signLead(id));
  assert.equal(res.status, 302);
  assert.match(res.headers.location, /status=abgelaufen/);
  assert.equal((await leadQueue.getLead(id)).status, 'PENDING');
});
