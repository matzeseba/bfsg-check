// SF10: gotoResilient lädt eine Seite und wertet den HTTP-Status der Top-Level-Antwort.
// Ein Fehlerstatus (>= 400) — z. B. eine 403/404/5xx-Fehlerseite oder ein WAF-/Bot-
// Interstitial — darf NICHT als verwertbarer Scan durchgehen, sondern muss werfen
// (http-status-NNN), damit axe nicht eine Seite scannt, die der Kunde nie gemeint hat.
// 2xx (echte Seite) und null (about:blank/Sonder-Navigation) dürfen NICHT werfen.
//
// Getestet wird die reine Entscheidungslogik mit einem Fake-Page-Mock (Muster aus
// ssrf-redirect.test.js) — ohne echten Browser. Das Ziel ist eine direkte öffentliche
// IP, damit verifyNoDnsRebinding sofort zurückkehrt (kein DNS, keine private Adresse)
// und der Test ausschließlich die Status-Logik prüft.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gotoResilient } from '../lib/scan.js';

const TARGET = 'http://93.184.216.34/';
const ADDR = ['93.184.216.34'];

// Minimaler Page-Mock: nur die zwei von gotoResilient genutzten Methoden. goto liefert
// die simulierte Response (oder null); waitForLoadState löst auf (Settle-Phase).
function makePage(resp) {
  const calls = { goto: 0, waitForLoadState: 0 };
  return {
    calls,
    goto: async () => { calls.goto += 1; return resp; },
    waitForLoadState: async () => { calls.waitForLoadState += 1; }
  };
}
const resp = (status) => ({ status: () => status });

test('Status 403 wirft (http-status-403)', async () => {
  const page = makePage(resp(403));
  await assert.rejects(() => gotoResilient(page, TARGET, ADDR, 30000), /http-status-403/);
  assert.equal(page.calls.waitForLoadState, 0, 'bei Fehlerstatus keine Settle-Phase mehr');
});

test('Status 400 wirft (http-status-400)', async () => {
  const page = makePage(resp(400));
  await assert.rejects(() => gotoResilient(page, TARGET, ADDR, 30000), /http-status-400/);
});

test('Status 500 wirft (jede >= 400 ist ein Fehlerstatus)', async () => {
  const page = makePage(resp(500));
  await assert.rejects(() => gotoResilient(page, TARGET, ADDR, 30000), /http-status-500/);
});

test('Status 200 wirft nicht (echte Seite → Settle-Phase läuft)', async () => {
  const page = makePage(resp(200));
  await assert.doesNotReject(() => gotoResilient(page, TARGET, ADDR, 30000));
  assert.equal(page.calls.goto, 1);
  assert.equal(page.calls.waitForLoadState, 1, 'nach erfolgreichem Laden folgt die Settle-Phase');
});

test('Status 204/304 wirft nicht (< 400 = ok)', async () => {
  await assert.doesNotReject(() => gotoResilient(makePage(resp(204)), TARGET, ADDR, 30000));
  await assert.doesNotReject(() => gotoResilient(makePage(resp(304)), TARGET, ADDR, 30000));
});

test('null-Response wirft nicht (about:blank/Sonder-Navigation)', async () => {
  const page = makePage(null);
  await assert.doesNotReject(() => gotoResilient(page, TARGET, ADDR, 30000));
  assert.equal(page.calls.waitForLoadState, 1, 'auch ohne Response läuft die Settle-Phase');
});
