// supertest-Harness gegen die ECHTE Express-App (app.js) — schließt die Coverage-Lücke,
// dass kein Test den Resend-Handler (POST /api/resend/:sessionId) tatsächlich aufruft.
//
// Gemockt wird ausschließlich der teure, nebenwirkungsbehaftete Fulfillment-Kern über die
// DI-Naht `services` (fulfillOrder/sendReportFor/generateInvoicePdf) — kein echter Browser,
// kein SMTP, kein PDF. orders.js läuft ECHT gegen eine tmp-JSONL (ORDERS_FILE), sodass die
// realen Status-Übergänge des Handlers verifiziert werden.
//
// Abgedeckt:
//   SF2    — In-Flight-Lock: 2 parallele Resends → genau 1×200 + 1×409.
//   SF1    — Rollback: wirft fulfillOrder/sendReportFor → READY_NOT_MAILED (mit pdfPath)
//            bzw. FAILED (ohne), niemals hängend RESENDING.
//   MF6    — Empfänger-Override: gültige req.body.email wird recipient; ungültige fällt
//            auf order.email zurück.
//   CORR-1 — GoBD: Voll-Resend persistiert die Rechnungsnummer (INVOICED) VOR sendReportFor;
//            ein Mailfehler verbrennt sie nicht — der Folge-Resend nutzt dieselbe Nummer.

import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// --- Umgebung VOR dem Import von app.js/orders.js fixieren ---
const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-resend-api-'));
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
process.env.PENDING_REPORTS_FILE = path.join(tmp, 'pending.jsonl'); // PR5-Release-Queue in tmp
const TOKEN = '0123456789abcdef0123456789abcdef01'; // >= 32 Zeichen (admin-auth-Pflicht)
process.env.ADMIN_TOKEN = TOKEN;
delete process.env.STRIPE_SECRET_KEY; // nicht live → keine Fail-Fast-/Listen-Seiteneffekte beim Import

const request = (await import('supertest')).default;
const { app, services } = await import('../app.js');
const orders = await import('../lib/orders.js');

// Echte Implementierungen nach dem Lauf zurückspielen (Hygiene, falls weitere Files folgen).
const REAL = { ...services };
after(() => Object.assign(services, REAL));

let seq = 0;
const sid = () => `cs_test_${Date.now()}_${seq++}`;
const authPost = (id) => request(app).post(`/api/resend/${id}`).set('Authorization', `Bearer ${TOKEN}`);

async function seedOrder({ sessionId, status = 'PAID', email = 'kunde@example.com', url = 'https://example.com', pkg = 'basis', amount = 12900, extra = {} }) {
  await orders.recordPaid({ eventId: `evt_${sessionId}`, sessionId, email, url, pkg, amount });
  if (status !== 'PAID' || Object.keys(extra).length) await orders.markStatus(sessionId, status, extra);
  return sessionId;
}

beforeEach(() => {
  // Defensiv: jede nicht explizit gemockte Fulfillment-Funktion knallt laut, statt
  // unbemerkt den echten (Browser/SMTP/PDF) Pfad zu treffen.
  services.fulfillOrder = async () => { throw new Error('TEST: fulfillOrder nicht gemockt'); };
  services.sendReportFor = async () => { throw new Error('TEST: sendReportFor nicht gemockt'); };
  services.generateInvoicePdf = async () => { throw new Error('TEST: generateInvoicePdf nicht gemockt'); };
});

// --- PR5: Resend während eines offenen Freigabe-Fensters (RELEASE_SCHEDULED) ---
// Muss den Queue-Job konsumieren (kein späterer Doppelversand) UND den Mail-only-Fastpath
// nehmen (kein unnötiger, kostenpflichtiger Voll-Rescan des bereits fertigen Reports).
test('Resend bei RELEASE_SCHEDULED: konsumiert Queue-Job + Mail-only (kein Rescan)', async () => {
  const reportQueue = await import('../lib/report-queue.js');
  const id = sid();
  await seedOrder({ sessionId: id, status: 'RELEASE_SCHEDULED', extra: { pdfPath: '/tmp/r.pdf', invoiceNumber: 'RE-9' } });
  await reportQueue.enqueue({
    sessionId: id, to: 'kunde@example.com', company: '', url: 'https://example.com', pkg: 'basis',
    emailKind: 'bfsg', pdfPath: '/tmp/r.pdf', stmtPath: null, diffText: '',
    invoicePdfPath: null, invoiceNumber: 'RE-9', customerType: '', consentTs: '',
    releaseAt: new Date(Date.now() + 90 * 60_000).toISOString()
  });
  let sent = 0;
  services.sendReportFor = async () => { sent += 1; };
  services.fulfillOrder = async () => { throw new Error('TEST: darf im Freigabe-Fenster NICHT rescannen'); };
  const res = await authPost(id);
  assert.equal(res.status, 200);
  assert.equal(res.body.mode, 'mail-only');   // kein Voll-Rescan
  assert.equal(sent, 1);
  assert.equal((await reportQueue.getJob(id)).status, 'RELEASED'); // Job konsumiert → kein Zweitversand
});

// --- Vorbedingungen: Auth-Gate (sonst sagen Folgetests nichts aus) ---
test('Auth: ohne Bearer-Token → 401', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'READY_NOT_MAILED', extra: { pdfPath: '/tmp/r.pdf', emailKind: 'bfsg' } });
  const res = await request(app).post(`/api/resend/${id}`).send({});
  assert.equal(res.status, 401);
});

test('Unbekannte Session → 404', async () => {
  const res = await authPost('cs_does_not_exist').send({});
  assert.equal(res.status, 404);
});

test('Bereits ausgelieferte Order (MAILED) → 409', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'MAILED', extra: { pdfPath: '/tmp/r.pdf' } });
  const res = await authPost(id).send({});
  assert.equal(res.status, 409);
});

// --- SF2: In-Flight-Lock ---
test('SF2: zwei parallele Resends → genau 1×200 + 1×409 (In-Flight-Lock)', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'READY_NOT_MAILED', extra: { pdfPath: '/tmp/r.pdf', emailKind: 'bfsg' } });

  let release;
  const gate = new Promise((r) => { release = r; });
  let sends = 0;
  services.sendReportFor = async () => { sends += 1; await gate; return { dryRun: true }; };

  // Beide Requests starten (Promise.allSettled triggert das Senden der supertest-Tests).
  const settled = Promise.allSettled([authPost(id).send({}), authPost(id).send({})]);
  // Kurz warten: beide Handler durchlaufen den Lock-Check (einer gewinnt + blockiert in
  // sendReportFor, einer bekommt 409), dann den Gewinner durchlassen.
  await new Promise((r) => setTimeout(r, 80));
  release();
  const results = await settled;

  const codes = results.map((r) => r.value.status).sort((a, b) => a - b);
  assert.deepEqual(codes, [200, 409], 'genau eine Auslieferung, ein In-Flight-Konflikt');
  assert.equal(sends, 1, 'sendReportFor lief nur einmal (der Verlierer brach vor dem Versand ab)');
  assert.equal((await orders.getOrder(id)).status, 'RESENT');
});

// --- SF1: Rollback statt hängendem RESENDING ---
test('SF1: Voll-Resend mit werfendem fulfillOrder → FAILED (kein pdfPath), nicht RESENDING', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'FAILED', extra: { error: 'erster Versuch' } });
  services.fulfillOrder = async () => { throw new Error('Scan kaputt'); };

  const res = await authPost(id).send({});
  assert.equal(res.status, 500);
  const order = await orders.getOrder(id);
  assert.equal(order.status, 'FAILED', 'ohne fertiges PDF → FAILED');
  assert.notEqual(order.status, 'RESENDING', 'darf NICHT im RESENDING hängenbleiben');
});

test('SF1: mailOnly-Resend mit werfendem sendReportFor → READY_NOT_MAILED (pdfPath da), nicht RESENDING', async () => {
  const id = await seedOrder({
    sessionId: sid(), status: 'READY_NOT_MAILED',
    extra: { pdfPath: '/tmp/r.pdf', emailKind: 'bfsg', invoiceNumber: 'RE-2026-0007' }
  });
  services.sendReportFor = async () => { throw new Error('SMTP tot'); };

  const res = await authPost(id).send({});
  assert.equal(res.status, 500);
  const order = await orders.getOrder(id);
  assert.equal(order.status, 'READY_NOT_MAILED', 'mit fertigem PDF → zurück auf READY_NOT_MAILED');
  assert.notEqual(order.status, 'RESENDING');
  assert.equal(order.invoiceNumber, 'RE-2026-0007', 'Rechnungsnummer bleibt erhalten');
});

// --- MF6: Empfänger-Override ---
test('MF6: gültige Override-E-Mail wird Empfänger', async () => {
  const id = await seedOrder({
    sessionId: sid(), status: 'READY_NOT_MAILED', email: 'alt@kunde.de',
    extra: { pdfPath: '/tmp/r.pdf', emailKind: 'bfsg' }
  });
  let captured;
  services.sendReportFor = async ({ to }) => { captured = to; return { dryRun: true }; };

  const res = await authPost(id).send({ email: 'neu@kunde.de' });
  assert.equal(res.status, 200);
  assert.equal(captured, 'neu@kunde.de', 'gültige Override-Adresse überschreibt order.email');
  assert.equal(res.body.email, 'neu@kunde.de');
});

test('MF6: ungültige Override-E-Mail → Fallback auf order.email', async () => {
  const id = await seedOrder({
    sessionId: sid(), status: 'READY_NOT_MAILED', email: 'alt@kunde.de',
    extra: { pdfPath: '/tmp/r.pdf', emailKind: 'bfsg' }
  });
  let captured;
  services.sendReportFor = async ({ to }) => { captured = to; return { dryRun: true }; };

  const res = await authPost(id).send({ email: 'kein-email' });
  assert.equal(res.status, 200);
  assert.equal(captured, 'alt@kunde.de', 'ungültige Override-Adresse → Fallback order.email');
  assert.equal(res.body.email, 'alt@kunde.de');
});

// --- Korrigierte Ziel-URL: optionaler req.body.url (analog overrideEmail) ---
test('URL-Override: gültige korrigierte URL → voller Re-Scan mit NEUER URL, correctedUrl persistiert', async () => {
  // READY_NOT_MAILED (hätte sonst mail-only ausgelöst) — die korrigierte URL muss den
  // Fastpath überspringen und einen vollen Re-Scan gegen die neue URL erzwingen.
  const id = await seedOrder({
    sessionId: sid(), status: 'READY_NOT_MAILED', url: 'https://kaputt.example.com',
    extra: { pdfPath: '/tmp/alt.pdf', emailKind: 'bfsg' }
  });
  let scannedUrl;
  services.fulfillOrder = async ({ url }) => {
    scannedUrl = url;
    return { pdfPath: '/tmp/neu.pdf', stmtPath: null, emailKind: 'bfsg', diff: { firstScan: true, score: 90 } };
  };
  services.generateInvoicePdf = async () => ({ invoiceNumber: 'RE-2026-0042', pdfPath: '/tmp/RE-2026-0042.pdf', date: '2026-06-28' });
  services.sendReportFor = async () => ({ dryRun: true });

  const res = await authPost(id).send({ url: 'https://example.com/korrigiert' });
  assert.equal(res.status, 200);
  assert.equal(scannedUrl, 'https://example.com/korrigiert', 'fulfillOrder lief mit der korrigierten URL (nicht order.url, kein mail-only)');
  const order = await orders.getOrder(id);
  assert.equal(order.status, 'RESENT');
  assert.equal(order.correctedUrl, 'https://example.com/korrigiert', 'korrigierte URL nachvollziehbar persistiert');
});

test('URL-Override: interne/ungültige URL → 400, kein fulfillOrder, Lock sauber freigegeben', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'FAILED', extra: { error: 'erster Versuch' } });
  let fulfillCalls = 0;
  services.fulfillOrder = async () => { fulfillCalls += 1; throw new Error('darf nicht laufen'); };

  const res = await authPost(id).send({ url: 'http://169.254.169.254/' });
  assert.equal(res.status, 400, 'interne Cloud-Metadaten-IP wird abgelehnt');
  assert.equal(fulfillCalls, 0, 'kein Scan bei abgelehnter URL');

  // Lock-Beweis: ein Folge-Resend darf NICHT 409 „läuft bereits" bekommen.
  services.fulfillOrder = async () => ({ pdfPath: '/tmp/r.pdf', stmtPath: null, emailKind: 'bfsg', diff: { firstScan: true, score: 90 } });
  services.generateInvoicePdf = async () => ({ invoiceNumber: 'RE-2026-0043', pdfPath: '/tmp/RE-2026-0043.pdf', date: '2026-06-28' });
  services.sendReportFor = async () => ({ dryRun: true });
  const res2 = await authPost(id).send({});
  assert.notEqual(res2.status, 409, 'Lock wurde auf dem 400-Pfad nicht geleakt');
  assert.equal(res2.status, 200);
});

test('URL-Override: ohne url → bestehendes Verhalten unverändert (mail-only, kein correctedUrl)', async () => {
  const id = await seedOrder({
    sessionId: sid(), status: 'READY_NOT_MAILED',
    extra: { pdfPath: '/tmp/r.pdf', emailKind: 'bfsg' }
  });
  let fulfillCalls = 0;
  services.fulfillOrder = async () => { fulfillCalls += 1; throw new Error('mail-only → kein Scan'); };
  services.sendReportFor = async () => ({ dryRun: true });

  const res = await authPost(id).send({});
  assert.equal(res.status, 200);
  assert.equal(res.body.mode, 'mail-only', 'ohne Override greift weiterhin der mail-only-Fastpath');
  assert.equal(fulfillCalls, 0, 'kein Re-Scan ohne Override');
  const order = await orders.getOrder(id);
  assert.equal(order.correctedUrl, undefined, 'ohne Override keine correctedUrl im Record');
});

// --- CORR-1: GoBD-Rechnungsnummer VOR Mailversand persistieren + Reuse ---
test('CORR-1: Nummer wird VOR sendReportFor persistiert + vom Folge-Resend wiederverwendet', async () => {
  const id = await seedOrder({ sessionId: sid(), status: 'FAILED', extra: { error: 'erster Versuch' } });

  let invoiceCalls = 0;
  services.generateInvoicePdf = async () => {
    invoiceCalls += 1;
    return { invoiceNumber: 'RE-2026-0001', pdfPath: '/tmp/RE-2026-0001.pdf', date: '2026-06-28' };
  };
  services.fulfillOrder = async () => ({
    pdfPath: '/tmp/report.pdf', stmtPath: null, emailKind: 'bfsg', diff: { firstScan: true, score: 90 }
  });

  // 1. Resend: Nummer vergeben + persistiert, DANN scheitert der Mailversand.
  let atMailTime;
  services.sendReportFor = async () => {
    // Beweis "INVOICED VOR sendReportFor": die Nummer steht zum Mailzeitpunkt schon im Record.
    const cur = await orders.getOrder(id);
    atMailTime = { status: cur.status, invoiceNumber: cur.invoiceNumber };
    throw new Error('SMTP tot');
  };

  const res1 = await authPost(id).send({});
  assert.equal(res1.status, 500);
  assert.equal(atMailTime.status, 'INVOICED', 'markStatus(INVOICED) lief VOR sendReportFor');
  assert.equal(atMailTime.invoiceNumber, 'RE-2026-0001');

  const afterFail = await orders.getOrder(id);
  assert.equal(afterFail.invoiceNumber, 'RE-2026-0001', 'Nummer bleibt nach Mailfehler im Record (nicht verbrannt)');
  assert.equal(afterFail.status, 'FAILED', 'kein pdfPath im Vorzustand → SF1-Rollback nach FAILED');

  // 2. Resend: Mail klappt — es darf KEINE zweite Nummer gezogen werden.
  services.sendReportFor = async () => ({ dryRun: true });
  const res2 = await authPost(id).send({});
  assert.equal(res2.status, 200);
  assert.equal(invoiceCalls, 1, 'Folge-Resend zieht KEINE zweite Rechnungsnummer (Reuse)');
  const done = await orders.getOrder(id);
  assert.equal(done.status, 'RESENT');
  assert.equal(done.invoiceNumber, 'RE-2026-0001', 'dieselbe GoBD-Nummer wiederverwendet');
});
