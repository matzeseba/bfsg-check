// Brevo-API-Fallback-Tests (Prod-Vorfall 07/2026): scheitert SMTP mit einem
// PERMANENTEN Auth-Fehler (535, z. B. gelöschter SMTP-Schlüssel im Brevo-Konto),
// wird EINMALIG die Brevo-Transactional-API versucht (fetch-Stub, kein Netz).
// Transiente Fehler, fehlender BREVO_API_KEY und der Kill-Switch
// MAILER_API_FALLBACK=false lassen das bisherige Verhalten unberührt.
// Getestet wird sendWithFallback direkt — der Produktions-Codepfad, den
// deliver() nutzt (gleiche Seam wie mail-retry.test.js für sendWithRetry).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Kein SMTP → Modul lädt ohne echten Transport. FROM-/Reply-Defaults
// deterministisch halten (werden beim Modul-Load gelesen).
delete process.env.SMTP_HOST;
delete process.env.SMTP_USER;
delete process.env.SMTP_PASS;
delete process.env.FROM_EMAIL;
delete process.env.FROM_NAME;
delete process.env.REPLY_TO;
delete process.env.INVOICE_CONTACT_EMAIL;

const { sendWithFallback, sendViaBrevoApi, isPermanentAuthError } = await import('../lib/mailer.js');

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-fallback-'));
const invoicePdf = path.join(tmp, 'rechnung.pdf');
writeFileSync(invoicePdf, '%PDF-1.4 rechnung-inhalt');

// SMTP-Fehler wie nodemailer sie wirft (Prod-Wortlaut Brevo-Relay).
function authErr() {
  const e = new Error('535 Authentication failed: ungueltige Zugangsdaten');
  e.responseCode = 535;
  return e;
}

// fetch-Stub: sammelt Aufrufe, antwortet mit konfigurierbarem Status.
function stubFetch({ status = 201, body = { messageId: 'api-msg-1' } } = {}) {
  const calls = [];
  global.fetch = async (url, opts) => {
    calls.push({ url, opts });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body)
    };
  };
  return calls;
}

// Env + global.fetch pro Test sauber setzen/zurücksetzen.
async function withEnv({ apiKey, killSwitch } = {}, fn) {
  const realFetch = global.fetch;
  const prevKey = process.env.BREVO_API_KEY;
  const prevSwitch = process.env.MAILER_API_FALLBACK;
  if (apiKey === undefined) delete process.env.BREVO_API_KEY;
  else process.env.BREVO_API_KEY = apiKey;
  if (killSwitch === undefined) delete process.env.MAILER_API_FALLBACK;
  else process.env.MAILER_API_FALLBACK = killSwitch;
  try {
    await fn();
  } finally {
    global.fetch = realFetch;
    if (prevKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = prevKey;
    if (prevSwitch === undefined) delete process.env.MAILER_API_FALLBACK;
    else process.env.MAILER_API_FALLBACK = prevSwitch;
  }
}

test('isPermanentAuthError: 535/auth = ja; transient + harte Nicht-Auth-Fehler = nein', () => {
  assert.equal(isPermanentAuthError(authErr()), true);
  const authText = new Error('Invalid login: authentication failed');
  assert.equal(isPermanentAuthError(authText), true);
  const transient = new Error('connection reset');
  transient.code = 'ECONNRESET';
  assert.equal(isPermanentAuthError(transient), false);
  const hardReject = new Error('550 no such user');
  hardReject.responseCode = 550;
  assert.equal(isPermanentAuthError(hardReject), false);
  assert.equal(isPermanentAuthError(null), false);
});

test('(a) SMTP 535 + API 201 → zugestellt via Brevo-API, fetch 1× mit korrektem Payload', async () => {
  await withEnv({ apiKey: 'test-key' }, async () => {
    const calls = stubFetch();
    let smtpCalls = 0;
    const res = await sendWithFallback(async () => { smtpCalls++; throw authErr(); }, {
      to: 'kunde@beispiel.de',
      subject: 'Ihr BFSG-Report',
      text: 'Hallo, Ihr Report haengt an.',
      attachments: [
        { filename: 'BFSG-Report.pdf', content: Buffer.from('%PDF-1.4 report-inhalt') },
        { filename: 'Rechnung-RE-2026-0001.pdf', path: invoicePdf } // path-Variante (sendOwnerReview)
      ],
      headers: { 'List-Unsubscribe': '<mailto:info@bfsg-fix.de?subject=unsubscribe>' },
      backoffBaseMs: 0
    });
    assert.equal(smtpCalls, 1, 'permanenter Fehler → kein SMTP-Retry');
    assert.equal(res.fallback, 'brevo-api');
    assert.equal(res.info.messageId, 'api-msg-1');
    assert.equal(calls.length, 1, 'genau EIN API-Call');
    assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(calls[0].opts.method, 'POST');
    assert.equal(calls[0].opts.headers['api-key'], 'test-key');
    const payload = JSON.parse(calls[0].opts.body);
    assert.deepEqual(payload.sender, { name: 'BFSG-Check', email: 'no-reply@bfsg-check.de' });
    assert.deepEqual(payload.to, [{ email: 'kunde@beispiel.de' }]);
    assert.equal(payload.subject, 'Ihr BFSG-Report');
    assert.equal(payload.textContent, 'Hallo, Ihr Report haengt an.');
    assert.equal(payload.htmlContent, undefined, 'kein HTML uebergeben → Feld fehlt');
    assert.deepEqual(payload.replyTo, { email: 'info@bfsg-fix.de' });
    assert.equal(payload.attachment.length, 2);
    assert.equal(payload.attachment[0].name, 'BFSG-Report.pdf');
    assert.equal(payload.attachment[0].content, Buffer.from('%PDF-1.4 report-inhalt').toString('base64'));
    assert.equal(payload.attachment[1].name, 'Rechnung-RE-2026-0001.pdf');
    assert.equal(payload.attachment[1].content, Buffer.from('%PDF-1.4 rechnung-inhalt').toString('base64'));
    assert.equal(payload.headers['List-Unsubscribe'], '<mailto:info@bfsg-fix.de?subject=unsubscribe>');
  });
});

test('(b) SMTP 535 + KEIN BREVO_API_KEY → wirft wie bisher, kein API-Call', async () => {
  await withEnv({ apiKey: undefined }, async () => {
    const calls = stubFetch();
    await assert.rejects(
      () => sendWithFallback(async () => { throw authErr(); }, { to: 'kunde@beispiel.de', backoffBaseMs: 0 }),
      /535 Authentication failed/
    );
    assert.equal(calls.length, 0, 'ohne Key darf die API nicht angefasst werden');
  });
});

test('(c) transienter Fehler → Retry-Pfad unberührt, KEIN API-Call', async () => {
  await withEnv({ apiKey: 'test-key' }, async () => {
    const calls = stubFetch();
    let smtpCalls = 0;
    await assert.rejects(
      () => sendWithFallback(async () => {
        smtpCalls++;
        const e = new Error('connection reset');
        e.code = 'ECONNRESET';
        throw e;
      }, { to: 'kunde@beispiel.de', backoffBaseMs: 0 }),
      /connection reset/
    );
    assert.equal(smtpCalls, 3, 'bestehender Retry (3 Versuche) bleibt unveraendert');
    assert.equal(calls.length, 0, 'transient → kein Fallback');
  });
});

test('(d) Kill-Switch MAILER_API_FALLBACK=false → kein API-Call, wirft wie bisher', async () => {
  await withEnv({ apiKey: 'test-key', killSwitch: 'false' }, async () => {
    const calls = stubFetch();
    await assert.rejects(
      () => sendWithFallback(async () => { throw authErr(); }, { to: 'kunde@beispiel.de', backoffBaseMs: 0 }),
      /535 Authentication failed/
    );
    assert.equal(calls.length, 0);
  });
});

test('(e) API-Fallback scheitert (401) → URSPRÜNGLICHER SMTP-Fehler wird geworfen', async () => {
  await withEnv({ apiKey: 'test-key' }, async () => {
    const calls = stubFetch({ status: 401, body: { message: 'Key not found' } });
    await assert.rejects(
      () => sendWithFallback(async () => { throw authErr(); }, { to: 'kunde@beispiel.de', backoffBaseMs: 0 }),
      /535 Authentication failed/
    );
    assert.equal(calls.length, 1, 'genau ein API-Versuch, dann Original-Fehler');
  });
});

test('sendViaBrevoApi: ohne Anhänge fehlt das attachment-Feld komplett', async () => {
  await withEnv({ apiKey: 'test-key' }, async () => {
    const calls = stubFetch();
    const res = await sendViaBrevoApi({ to: 'kunde@beispiel.de', subject: 'S', text: 'T', html: '<p>H</p>' });
    assert.equal(res.messageId, 'api-msg-1');
    const payload = JSON.parse(calls[0].opts.body);
    assert.equal(payload.attachment, undefined, 'kein attachment-Feld ohne Anhänge');
    assert.equal(payload.htmlContent, '<p>H</p>');
  });
});
