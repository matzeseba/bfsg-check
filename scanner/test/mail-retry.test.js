// Mail-Retry-Tests (Audit P1#3): transiente SMTP-/Brevo-Störungen werden mit
// Backoff wiederholt, permanente Fehler (ungültiger Empfänger, harte Ablehnung)
// NICHT. Testet die entkoppelte Retry-Schleife sendWithRetry + die Fehler-
// Klassifikation isTransientMailError direkt — ohne echten SMTP-Transport.

import { test } from 'node:test';
import assert from 'node:assert/strict';

// Kein SMTP → Modul lädt im Dry-Run, aber sendWithRetry ist transport-unabhängig.
delete process.env.SMTP_HOST;
delete process.env.SMTP_USER;
delete process.env.SMTP_PASS;

const { sendWithRetry, isTransientMailError } = await import('../lib/mailer.js');

// Hilfs-Fehler: Code/responseCode wie nodemailer sie setzt.
function mailErr(message, { code, responseCode } = {}) {
  const e = new Error(message);
  if (code) e.code = code;
  if (responseCode) e.responseCode = responseCode;
  return e;
}

test('isTransientMailError: Netzwerk-/Timeout-Codes sind transient', () => {
  assert.equal(isTransientMailError(mailErr('x', { code: 'ETIMEDOUT' })), true);
  assert.equal(isTransientMailError(mailErr('x', { code: 'ECONNRESET' })), true);
  assert.equal(isTransientMailError(mailErr('x', { code: 'ESOCKET' })), true);
  assert.equal(isTransientMailError(mailErr('x', { code: 'EAI_AGAIN' })), true);
});

test('isTransientMailError: temporäre SMTP-4xx + Greylisting sind transient', () => {
  assert.equal(isTransientMailError(mailErr('try later', { responseCode: 421 })), true);
  assert.equal(isTransientMailError(mailErr('mailbox busy', { responseCode: 450 })), true);
  assert.equal(isTransientMailError(mailErr('temp local', { responseCode: 451 })), true);
  assert.equal(isTransientMailError(mailErr('greylisted, try again later')), true);
});

test('isTransientMailError: harte Ablehnung / ungültiger Empfänger ist permanent', () => {
  assert.equal(isTransientMailError(mailErr('550 no such user', { responseCode: 550 })), false);
  assert.equal(isTransientMailError(mailErr('553 invalid recipient', { responseCode: 553 })), false);
  assert.equal(isTransientMailError(mailErr('535 auth failed', { responseCode: 535 })), false);
  assert.equal(isTransientMailError(mailErr('irgendwas ohne Code')), false);
  assert.equal(isTransientMailError(null), false);
});

test('sendWithRetry: transient → Retry → Erfolg (2. Versuch)', async () => {
  let calls = 0;
  const send = async () => {
    calls++;
    if (calls < 2) throw mailErr('connection reset', { code: 'ECONNRESET' });
    return { messageId: 'ok-123' };
  };
  const res = await sendWithRetry(send, { to: 'k@b.de', backoffBaseMs: 0 });
  assert.equal(calls, 2, 'genau 2 Versuche: 1 Fehlschlag + 1 Erfolg');
  assert.equal(res.attempts, 2);
  assert.equal(res.info.messageId, 'ok-123');
});

test('sendWithRetry: transient → 3× Fehlschlag → wirft (kein Endlos-Retry)', async () => {
  let calls = 0;
  const send = async () => {
    calls++;
    throw mailErr('greylisted, try again later', { responseCode: 451 });
  };
  await assert.rejects(
    () => sendWithRetry(send, { to: 'k@b.de', backoffBaseMs: 0 }),
    /greylisted/
  );
  assert.equal(calls, 3, 'exakt 3 Versuche (MAX_MAIL_ATTEMPTS), dann Abbruch');
});

test('sendWithRetry: permanenter Fehler → KEIN Retry (genau 1 Versuch)', async () => {
  let calls = 0;
  const send = async () => {
    calls++;
    throw mailErr('550 invalid recipient', { responseCode: 550 });
  };
  await assert.rejects(
    () => sendWithRetry(send, { to: 'kaputt@nirgends.de', backoffBaseMs: 0 }),
    /invalid recipient/
  );
  assert.equal(calls, 1, 'permanenter Fehler darf NICHT wiederholt werden');
});

test('sendWithRetry: Erfolg im 1. Versuch → keine Wiederholung', async () => {
  let calls = 0;
  const res = await sendWithRetry(async () => { calls++; return { messageId: 'first' }; }, { to: 'k@b.de', backoffBaseMs: 0 });
  assert.equal(calls, 1);
  assert.equal(res.attempts, 1);
});
