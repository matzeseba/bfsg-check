// Tests für die selbstgebauten Schutzmechanismen (Rate-Limit + Concurrency-Gate).
// Sichern die Incident-relevanten Fixes:
//  - 429-Antwort traegt jetzt reason:'rate_limit' + retryAfter (sonst zeigt das FE
//    faelschlich "Live-Scan nicht erreichbar" statt "kurz warten").
//  - concurrencyGate(maxQueued) macht bei vollem Stau Fast-Fail (QUEUE_FULL) statt
//    unbegrenzt wachsender Warteschlange.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit, concurrencyGate } from '../lib/limits.js';

// Minimaler Express-res/req-Mock.
function mockReqRes(ip = '1.2.3.4') {
  const headers = {};
  let statusCode = 200;
  let body;
  const res = {
    set(k, v) { headers[k] = v; return res; },
    status(c) { statusCode = c; return res; },
    json(b) { body = b; return res; },
  };
  return {
    req: { ip, socket: { remoteAddress: ip } },
    res,
    get statusCode() { return statusCode; },
    get body() { return body; },
    get headers() { return headers; },
  };
}

test('rateLimit: 429 traegt reason=rate_limit + retryAfter + Retry-After-Header', () => {
  const mw = rateLimit({ windowMs: 60_000, max: 2 });
  // Erste 2 Anfragen passieren (next() aufgerufen), 3. wird geblockt.
  let nextCalls = 0;
  const next = () => { nextCalls++; };

  const a = mockReqRes();
  mw(a.req, a.res, next);
  const b = mockReqRes();
  mw(b.req, b.res, next);
  assert.equal(nextCalls, 2, 'erste zwei Anfragen passieren');

  const c = mockReqRes();
  mw(c.req, c.res, next);
  assert.equal(nextCalls, 2, '3. Anfrage wird NICHT durchgelassen');
  assert.equal(c.statusCode, 429);
  assert.equal(c.body.reason, 'rate_limit', 'reason-Feld vorhanden -> FE zeigt echte Meldung');
  assert.equal(typeof c.body.retryAfter, 'number');
  assert.ok(c.body.retryAfter > 0);
  assert.ok(c.headers['Retry-After'], 'Retry-After-Header gesetzt');
});

test('concurrencyGate: maxQueued -> Fast-Fail mit code QUEUE_FULL statt unbegrenztem Stau', async () => {
  // 1 gleichzeitig, Queue-Cap 1. Erster Task laeuft, zweiter wartet (Queue=1),
  // dritter ueberschreitet das Cap -> sofortiges QUEUE_FULL.
  const gate = concurrencyGate(1, { maxQueued: 1 });
  let release;
  const blocker = new Promise((r) => { release = r; });

  const p1 = gate(() => blocker);        // belegt den einzigen Slot
  const p2 = gate(() => Promise.resolve('queued')); // wartet in der Queue (Laenge 1)
  const p3 = gate(() => Promise.resolve('overflow')); // Queue voll -> reject

  await assert.rejects(p3, (err) => err.code === 'QUEUE_FULL');

  release('done');
  assert.equal(await p1, 'done');
  assert.equal(await p2, 'queued');
});

test('concurrencyGate: ohne maxQueued bleibt das bisherige Verhalten (kein Reject)', async () => {
  const gate = concurrencyGate(1); // maxQueued = Infinity (Default)
  const results = await Promise.all([
    gate(() => Promise.resolve(1)),
    gate(() => Promise.resolve(2)),
    gate(() => Promise.resolve(3)),
  ]);
  assert.deepEqual(results, [1, 2, 3]);
});

test('paidScanGate-Verhalten: ungekapptes Gate weist auch bei Burst NIE ab (Umsatzschutz)', async () => {
  // Bezahltes Gate (concurrencyGate(1) ohne maxQueued): viele gleichzeitige
  // fulfillOrder-Aufrufe duerfen sich stauen, aber keiner darf mit QUEUE_FULL
  // scheitern (sonst FAILED-Order trotz Zahlung).
  const gate = concurrencyGate(1);
  let release;
  const blocker = new Promise((r) => { release = r; });
  const first = gate(() => blocker); // belegt den Slot, alle anderen warten
  const rest = Array.from({ length: 20 }, (_, i) => gate(() => Promise.resolve(i)));
  release('ok');
  assert.equal(await first, 'ok');
  assert.deepEqual(await Promise.all(rest), Array.from({ length: 20 }, (_, i) => i));
});
