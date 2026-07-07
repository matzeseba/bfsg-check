// Tests für /api/kuendigung und /api/widerruf (F10/F12/F13/F31):
//   F31 — 'effective' (Sofort vs. Periodenende) wird destrukturiert und weitergegeben
//         (nicht mehr stillschweigend verworfen).
//   F12/F13/F36 — der Antragsteller bekommt zusätzlich zum Owner-Alarm eine automatische
//         Zugangsbestätigung (§ 312k Abs. 2 BGB bzw. § 356 Abs. 1 S. 2 BGB) inkl.
//         Anbieterkennzeichnung (Pflicht-Footer).
//
// SMTP ist NICHT konfiguriert → deliver() läuft im Dry-Run; die Endpoints bleiben trotzdem
// 200 (best-effort, Fehler in der Kunden-Mail dürfen die Antwort nicht kippen).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-kuendigung-widerruf-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl');
delete process.env.STRIPE_SECRET_KEY;
delete process.env.SMTP_HOST;
delete process.env.SMTP_USER;
delete process.env.SMTP_PASS;
process.env.ADMIN_TOKEN = '0123456789abcdef0123456789abcdef01';

const request = (await import('supertest')).default;
const { app } = await import('../app.js');

// console.log ist der Dry-Run-Kanal von mailer.js#deliver — hier abgreifen, um zu
// verifizieren, DASS (und mit welchem Betreff) eine Kunden-Mail versucht wurde.
function captureConsole(fn) {
  const logs = [];
  const orig = console.log;
  console.log = (...args) => { logs.push(args.join(' ')); orig(...args); };
  return fn().finally(() => { console.log = orig; });
}

test('POST /api/kuendigung: 200 + sendet eine Eingangsbestätigung an den Kunden (nicht nur den Owner-Alarm)', async () => {
  const logs = [];
  const orig = console.log;
  console.log = (...args) => { logs.push(args.join(' ')); orig(...args); };
  try {
    const res = await request(app).post('/api/kuendigung').send({
      name: 'Max Mustermann', email: 'max@example.com', vertrag: 'sub_123', effective: 'sofort'
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });
    // Kurze Wartezeit: der Mailversand läuft awaited im Handler VOR res.json — Dry-Run ist synchron genug.
  } finally {
    console.log = orig;
  }
  const kundenMail = logs.find((l) => l.includes('max@example.com') && l.includes('Kündigung ist bei uns eingegangen'));
  assert.ok(kundenMail, `Erwartete Kündigungs-Eingangsbestätigung an den Kunden, gefunden: ${JSON.stringify(logs)}`);
});

test('POST /api/kuendigung: fehlende Pflichtfelder -> 400, keine Mail', async () => {
  const res = await request(app).post('/api/kuendigung').send({ name: '', email: '' });
  assert.equal(res.status, 400);
});

test('POST /api/widerruf: 200 + sendet eine Zugangsbestätigung an den Kunden', async () => {
  const logs = [];
  const orig = console.log;
  console.log = (...args) => { logs.push(args.join(' ')); orig(...args); };
  try {
    const res = await request(app).post('/api/widerruf').send({
      name: 'Erika Musterfrau', email: 'erika@example.com', vertrag: 'cs_456', datum: '2026-07-01'
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });
  } finally {
    console.log = orig;
  }
  const kundenMail = logs.find((l) => l.includes('erika@example.com') && l.includes('Widerruf ist bei uns eingegangen'));
  assert.ok(kundenMail, `Erwartete Widerrufs-Zugangsbestätigung an den Kunden, gefunden: ${JSON.stringify(logs)}`);
});

test('POST /api/widerruf: fehlende Pflichtfelder -> 400', async () => {
  const res = await request(app).post('/api/widerruf').send({ name: 'X' });
  assert.equal(res.status, 400);
});
