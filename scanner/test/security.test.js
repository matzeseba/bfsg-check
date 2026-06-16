// Security-Tests: SSRF-Guard + DNS-Rebinding-Schutz + Live-Flag + Admin-Auth.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicHttpUrl, verifyNoDnsRebinding } from '../lib/url-guard.js';
import { isStripeLive, isEmail } from '../lib/mailer.js';

test('SSRF: rejects localhost, private, link-local, IPv6-ULA', async () => {
  for (const bad of [
    'http://localhost/',
    'http://127.0.0.1/',
    'http://10.0.0.1/',
    'http://192.168.1.1/',
    'http://169.254.169.254/latest/meta-data/', // AWS-Metadata
    'http://[::1]/',
    'http://[fc00::1]/',
    'ftp://example.com/',
    'file:///etc/passwd',
    'http://user:pw@example.com/'
  ]) {
    await assert.rejects(() => assertPublicHttpUrl(bad), { message: /.+/ }, `Sollte blockieren: ${bad}`);
  }
});

test('SSRF: accepts public hostnames, returns addresses', async () => {
  const safe = await assertPublicHttpUrl('https://example.com/');
  assert.equal(typeof safe.url, 'string');
  assert.ok(Array.isArray(safe.addresses));
  assert.ok(safe.addresses.length > 0);
});

test('DNS-Rebinding-Check: kein Throw bei stabilen IPs', async () => {
  const safe = await assertPublicHttpUrl('https://example.com/');
  // Pre-Mortem: erstes Lookup OK, zweites mit gleichen IPs muss durchgehen.
  await assert.doesNotReject(() => verifyNoDnsRebinding(safe.url, safe.addresses));
});

test('DNS-Rebinding-Check: wirft wenn alle erwarteten IPs verschwunden', async () => {
  // Simuliere: expected enthält nur Fake-IPs, die nicht in der echten Auflösung sind.
  await assert.rejects(
    () => verifyNoDnsRebinding('https://example.com/', ['203.0.113.99']),
    /Rebinding/i
  );
});

test('isStripeLive: erkennt sk_live + rk_live, NICHT sk_test/leer', () => {
  const orig = process.env.STRIPE_SECRET_KEY;
  try {
    process.env.STRIPE_SECRET_KEY = 'sk_live_abc123';
    assert.equal(isStripeLive(), true);
    process.env.STRIPE_SECRET_KEY = 'rk_live_xyz789';
    assert.equal(isStripeLive(), true);
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    assert.equal(isStripeLive(), false);
    process.env.STRIPE_SECRET_KEY = 'rk_test_xxx';
    assert.equal(isStripeLive(), false);
    delete process.env.STRIPE_SECRET_KEY;
    assert.equal(isStripeLive(), false);
  } finally {
    if (orig === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = orig;
  }
});

test('isEmail: akzeptiert gängige Adressen, lehnt offensichtliche Fehler ab', () => {
  for (const ok of ['a@b.de', 'user.name+tag@sub.example.co.uk', 'test_123-abc@example.com']) {
    assert.equal(isEmail(ok), true, `sollte ok sein: ${ok}`);
  }
  for (const bad of ['', 'plainstring', 'a@', '@b.de', 'a@b', 'a@b.', 'a b@c.de', 'a@b@c.de']) {
    assert.equal(isEmail(bad), false, `sollte abgelehnt: "${bad}"`);
  }
});
