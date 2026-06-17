// DSGVO-Tests: Token-Roundtrip + Export-Filter + Delete-Tombstone.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-dsgvo-'));
process.env.DSGVO_TOKENS_FILE = path.join(tmp, 'tokens.jsonl');
process.env.ORDERS_FILE = path.join(tmp, 'orders.jsonl');
process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');

// Seed: 2 Orders zu user@test.de, 1 fremd, 1 Subscription zu user@test.de
writeFileSync(process.env.ORDERS_FILE,
  JSON.stringify({ sessionId: 'cs_1', email: 'user@test.de', url: 'https://a.de', pkg: 'basis', amount: 19900, status: 'MAILED', ts: '2026-06-01T00:00:00Z' }) + '\n' +
  JSON.stringify({ sessionId: 'cs_2', email: 'user@test.de', url: 'https://b.de', pkg: 'profi', amount: 49900, status: 'MAILED', ts: '2026-06-05T00:00:00Z' }) + '\n' +
  JSON.stringify({ sessionId: 'cs_3', email: 'other@test.de', url: 'https://c.de', pkg: 'basis', amount: 19900, status: 'MAILED', ts: '2026-06-10T00:00:00Z' }) + '\n'
);
writeFileSync(process.env.SUBS_FILE,
  JSON.stringify({ subscriptionId: 'sub_1', email: 'user@test.de', url: 'https://a.de', pkg: 'abo', status: 'ACTIVE', createdAt: '2026-06-01T00:00:00Z' }) + '\n'
);

const { requestDsgvoToken, consumeDsgvoToken, exportUserData, deleteUserData } = await import('../lib/dsgvo.js');

test('Token-Roundtrip: request → consume mit korrekter E-Mail+Action', async () => {
  const { token, expiresAt } = await requestDsgvoToken({ email: 'user@test.de', action: 'export' });
  assert.equal(typeof token, 'string');
  assert.ok(token.length >= 32);
  assert.ok(new Date(expiresAt) > new Date());
  const { email, action } = await consumeDsgvoToken(token);
  assert.equal(email, 'user@test.de');
  assert.equal(action, 'export');
});

test('Token kann nicht doppelt verwendet werden', async () => {
  const { token } = await requestDsgvoToken({ email: 'user@test.de', action: 'delete' });
  await consumeDsgvoToken(token);
  await assert.rejects(() => consumeDsgvoToken(token), /Token/i);
});

test('Token wirft bei ungültigem Wert', async () => {
  await assert.rejects(() => consumeDsgvoToken('nonexistent-token-12345'), /Token/i);
});

test('requestDsgvoToken: ungültige E-Mail/action wirft', async () => {
  await assert.rejects(() => requestDsgvoToken({ email: 'no-at-sign', action: 'export' }), /E-Mail/);
  await assert.rejects(() => requestDsgvoToken({ email: 'a@b.de', action: 'wat' }), /action/);
});

test('exportUserData: liefert NUR Records dieser E-Mail', async () => {
  const data = await exportUserData('user@test.de');
  assert.equal(data.orderCount, 2);
  assert.equal(data.subscriptionCount, 1);
  for (const o of data.orders) assert.equal(o.email, 'user@test.de');
});

test('deleteUserData: schreibt Tombstone-Eintrag, exportUserData findet ihn nicht mehr', async () => {
  const r = await deleteUserData('other@test.de');
  assert.equal(typeof r.emailHash, 'string');
  assert.ok(r.emailHash.length >= 8);
  const after = await exportUserData('other@test.de');
  // Tombstone hat keinen email-Match (PII redacted) → 0 Treffer
  assert.equal(after.orderCount, 0);
});
