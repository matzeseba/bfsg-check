import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConfig } from '../src/config.js';
import { createGate } from '../src/gate.js';

const cfg = createConfig(); // nutzt die echte policy/compliance.json
const gate = createGate(cfg);
const DISCLAIMER = 'Automatisierte technische Analyse — ersetzt keine Rechtsberatung.';

test('gate: block bei verbotenem Muster (BFSG-konform)', async () => {
  const r = await gate.check(`Unser Service macht Ihre Seite BFSG-konform. ${DISCLAIMER}`, { channel: 'seo_pillar' });
  assert.equal(r.passed, false);
  assert.ok(r.findings.some((f) => f.severity === 'block' && /BFSG/i.test(f.pattern)));
});

test('gate: case-insensitiv (BFSG-KONFORM in Großbuchstaben)', async () => {
  const r = await gate.check(`ALLES BFSG-KONFORM! ${DISCLAIMER}`, { channel: 'seo_pillar' });
  assert.equal(r.passed, false);
});

test('gate: warn-Muster blockt nicht, erzeugt aber Finding', async () => {
  const r = await gate.check(`Wir sind zertifiziert. ${DISCLAIMER}`, { channel: 'seo_pillar' });
  assert.equal(r.passed, true, 'warn blockt nicht');
  assert.ok(r.findings.some((f) => f.severity === 'warn'));
});

test('gate: unbekannter Kanal => block', async () => {
  const r = await gate.check(`Sauberer Text. ${DISCLAIMER}`, { channel: 'cold_email' });
  assert.equal(r.passed, false);
  assert.ok(r.findings.some((f) => f.pattern === 'channel-not-allowed'));
});

test('gate: Disclaimer-Pflicht-Kanal ohne Disclaimer => block', async () => {
  const r = await gate.check('Reiner Fliesstext ohne Pflichthinweis.', { channel: 'pr_free' });
  assert.equal(r.passed, false);
  assert.ok(r.findings.some((f) => f.pattern === 'disclaimer-missing'));
});

test('gate: sauberer Text auf erlaubtem Kanal mit Disclaimer => passed', async () => {
  const r = await gate.check(`WCAG-2.1-AA-Audit Ergebnisse. ${DISCLAIMER}`, { channel: 'seo_pillar' });
  assert.equal(r.passed, true);
  assert.equal(r.findings.length, 0);
});

test('gate: Kanal ohne Disclaimer-Pflicht braucht keinen Disclaimer', async () => {
  const r = await gate.check('Interne Notiz ohne Disclaimer.', { channel: 'analytics_internal' });
  assert.equal(r.passed, true);
});
