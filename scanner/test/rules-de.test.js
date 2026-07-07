// Tests für die deutsche Regel-Abdeckung (F4): jede aktive axe-core-Regel muss
// einen vollständigen deutschen title/why/fix/effort-Eintrag haben, keine
// verbotenen Rechtsformulierungen enthalten, und der Fallback für unbekannte
// Regeln muss deutschen Text liefern.
//
// Start: node --test test/rules-de.test.js

import test from 'node:test';
import assert from 'node:assert/strict';
import axe from 'axe-core';
import { RULES_DE, COOKIE_RULES, ruleInfo } from '../lib/rules-de.js';

// Dieselben Tags wie im Scanner (scan.js: AXE_TAGS).
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const ACTIVE_RULE_IDS = axe.getRules(AXE_TAGS).map((r) => r.ruleId);

const FORBIDDEN_PATTERNS = [/BFSG-konform/i, /rechtssicher/i, /garantiert/i];
const VALID_EFFORTS = new Set(['S', 'M', 'L']);

test('jede aktive axe-core-Regel hat einen deutschen RULES_DE-Eintrag mit title/why/fix/effort', () => {
  assert.ok(ACTIVE_RULE_IDS.length > 0, 'axe-core sollte aktive Regeln liefern');
  const missing = [];
  for (const id of ACTIVE_RULE_IDS) {
    const entry = RULES_DE[id];
    if (!entry) {
      missing.push(id);
      continue;
    }
    assert.ok(typeof entry.title === 'string' && entry.title.trim().length > 0, `${id}: title fehlt/leer`);
    assert.ok(typeof entry.why === 'string' && entry.why.trim().length > 0, `${id}: why fehlt/leer`);
    assert.ok(typeof entry.fix === 'string' && entry.fix.trim().length > 0, `${id}: fix fehlt/leer`);
    assert.ok(VALID_EFFORTS.has(entry.effort), `${id}: effort ungültig (${entry.effort})`);
  }
  assert.deepEqual(missing, [], `Fehlende deutsche Einträge für aktive axe-Regeln: ${missing.join(', ')}`);
});

test('kein toter "duplicate-id"-Eintrag mehr, stattdessen aktives "duplicate-id-aria"', () => {
  assert.equal('duplicate-id' in RULES_DE, false, 'axe 4.10 kennt nur noch duplicate-id-aria');
  assert.ok(RULES_DE['duplicate-id-aria'], 'duplicate-id-aria muss übersetzt sein');
});

test('keine verbotenen Rechtsformulierungen in RULES_DE/COOKIE_RULES-Texten', () => {
  const allEntries = { ...RULES_DE, ...COOKIE_RULES };
  for (const [id, entry] of Object.entries(allEntries)) {
    const text = [entry.title, entry.why, entry.fix].join(' ');
    for (const pattern of FORBIDDEN_PATTERNS) {
      assert.doesNotMatch(text, pattern, `${id}: verbotene Formulierung (${pattern}) gefunden`);
    }
  }
});

test('ruleInfo() liefert effort auch für Einträge ohne eigenes effort-Feld', () => {
  const info = ruleInfo({ id: 'image-alt' });
  assert.equal(info.effort, 'S');
  assert.equal(info.title, 'Bilder ohne Alternativtext');
});

test('ruleInfo()-Fallback für unbekannte Regel liefert deutschen why/fix-Text (kein Rohtext-Durchreichen)', () => {
  const info = ruleInfo({
    id: 'noch-nicht-uebersetzte-regel',
    help: 'Some english help text',
    description: 'Some english description that must not leak into why',
    helpUrl: 'https://example.com/rules/x'
  });
  assert.ok(info.why.includes('WCAG'), 'why sollte auf WCAG verweisen');
  assert.doesNotMatch(info.why, /Some english description/, 'englischer axe-Rohtext darf nicht in why landen');
  assert.match(info.fix, /axe-core/);
  assert.equal(info.effort, 'M');
  for (const pattern of FORBIDDEN_PATTERNS) {
    assert.doesNotMatch(info.why + ' ' + info.fix, pattern);
  }
});

test('ruleInfo()-Fallback ohne helpUrl bricht nicht und bleibt deutsch', () => {
  const info = ruleInfo({ id: 'ganz-unbekannt' });
  assert.equal(info.title, 'ganz-unbekannt');
  assert.ok(info.why.length > 0);
  assert.ok(info.fix.length > 0);
  assert.equal(info.effort, 'M');
});
