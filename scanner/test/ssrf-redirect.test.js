// Regressionstest SSRF C1: ein 30x-Redirect-Ziel auf eine interne Adresse
// (127.0.0.1 / 169.254.169.254 / RFC1918) muss vom Browser-Route-Guard
// abgebrochen werden — page.goto() folgt Redirects intern, ohne dass
// assertPublicHttpUrl pro Hop greift. installSsrfGuard schliesst die Luecke.
//
// Getestet wird die Entscheidungslogik des Guards mit einem Mock-Route-Objekt
// (ohne echten Browser): genauso, wie Chromium den Hook pro Navigation aufruft.
// Zusaetzlich: der IP-Pin (pinnedHostResolverArg) erzeugt das erwartete
// --host-resolver-rules-Launch-Arg fuer den geprueften Host.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installSsrfGuard, pinnedHostResolverArg } from '../lib/url-guard.js';

// Minimaler Page-Mock: faengt den von installSsrfGuard registrierten
// page.route-Handler ab, damit wir ihn mit einzelnen Requests aufrufen koennen.
function makePageMock() {
  let handler = null;
  return {
    route: async (_pattern, fn) => { handler = fn; },
    invoke: (request) => {
      const calls = { continue: 0, abort: 0, abortReason: null };
      const route = {
        request: () => request,
        continue: () => { calls.continue += 1; return Promise.resolve(); },
        abort: (reason) => { calls.abort += 1; calls.abortReason = reason || null; return Promise.resolve(); }
      };
      return Promise.resolve(handler(route)).then(() => calls);
    }
  };
}

function req(url, resourceType = 'document') {
  return { url: () => url, resourceType: () => resourceType };
}

test('SSRF-Redirect: Dokument-Navigation auf 127.0.0.1 wird abgebrochen', async () => {
  const page = makePageMock();
  await installSsrfGuard(page);
  // Simuliert den durch ein 302 ausgeloesten Folge-Request auf den Loopback.
  const calls = await page.invoke(req('http://127.0.0.1:8080/latest/meta-data/'));
  assert.equal(calls.abort, 1, '127.0.0.1-Navigation muss abgebrochen werden');
  assert.equal(calls.continue, 0);
});

test('SSRF-Redirect: Cloud-Metadaten 169.254.169.254 wird abgebrochen', async () => {
  const page = makePageMock();
  await installSsrfGuard(page);
  const calls = await page.invoke(req('http://169.254.169.254/latest/meta-data/iam/'));
  assert.equal(calls.abort, 1, 'Metadaten-IP muss abgebrochen werden');
  assert.equal(calls.continue, 0);
});

test('SSRF-Redirect: RFC1918-Ziel (10.x) wird abgebrochen', async () => {
  const page = makePageMock();
  await installSsrfGuard(page);
  const calls = await page.invoke(req('http://10.0.0.5/'));
  assert.equal(calls.abort, 1, 'RFC1918-IP muss abgebrochen werden');
});

test('SSRF-Redirect: oeffentliche Direkt-IP-Navigation laeuft durch', async () => {
  const page = makePageMock();
  await installSsrfGuard(page);
  // 93.184.216.34 ist oeffentlich (example.com-Bereich) — keine DNS-Aufloesung noetig.
  const calls = await page.invoke(req('http://93.184.216.34/'));
  assert.equal(calls.continue, 1, 'oeffentliche IP muss durchgelassen werden');
  assert.equal(calls.abort, 0);
});

test('SSRF-Redirect: nicht-http(s)-Schema wird abgebrochen', async () => {
  const page = makePageMock();
  await installSsrfGuard(page);
  const calls = await page.invoke(req('file:///etc/passwd'));
  assert.equal(calls.abort, 1, 'file:-Schema muss abgebrochen werden');
});

test('SSRF-Redirect: Subressourcen (Bild/CSS) werden nicht re-validiert (durchgelassen)', async () => {
  const page = makePageMock();
  await installSsrfGuard(page);
  // Nur Navigationen sind der Redirect-Vektor; Subressourcen durchlassen (DNS-Last).
  const calls = await page.invoke(req('http://127.0.0.1/tracker.png', 'image'));
  assert.equal(calls.continue, 1, 'Subressource wird ohne IP-Check weitergereicht');
});

test('IP-Pin: pinnedHostResolverArg mappt geprueften Host auf die verifizierte IP', () => {
  const arg = pinnedHostResolverArg('example.com', ['93.184.216.34']);
  assert.equal(arg, '--host-resolver-rules=MAP example.com 93.184.216.34');
});

test('IP-Pin: direkte IP oder fehlende Adresse erzeugt keinen Pin (null)', () => {
  assert.equal(pinnedHostResolverArg('93.184.216.34', ['93.184.216.34']), null, 'direkte IP braucht kein Mapping');
  assert.equal(pinnedHostResolverArg('example.com', []), null, 'ohne Adresse kein Pin');
  assert.equal(pinnedHostResolverArg('', ['1.2.3.4']), null, 'ohne Host kein Pin');
});

test('IP-Pin: Host mit Leerzeichen/Quotes wird defensiv abgelehnt (kein gebrochenes Arg)', () => {
  assert.equal(pinnedHostResolverArg('evil host', ['1.2.3.4']), null);
  assert.equal(pinnedHostResolverArg('a"b', ['1.2.3.4']), null);
});
