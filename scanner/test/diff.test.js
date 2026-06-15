// Offline-Tests für die Welle-2-Bausteine: Diff-Logik, Snapshot, Subscriptions,
// Report-Rendering mit Diff-Block. Keine Netz-/Browser-Abhängigkeit.
//
// Start: node --test test/

import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshot, diff, diffSummaryText } from '../lib/diff.js';
import { renderReport } from '../lib/report.js';
import { recordSubscription, saveSnapshot, getSubscription, markCancelled } from '../lib/subscriptions.js';
import path from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';

// Hilfsfunktion: minimaler axe-kompatibler Scan-Stub.
function scanStub(violations, opts = {}) {
  return {
    url: 'https://example.de',
    scannedAt: new Date().toISOString(),
    meta: { title: 'Test' },
    violations,
    passes: opts.passes ?? 10,
    incomplete: 0
  };
}
function viol(id, impact, nodeCount = 1) {
  return {
    id, impact, help: id, tags: ['wcag2a'],
    nodes: Array.from({ length: nodeCount }, (_, i) => ({ target: ['#n' + i] }))
  };
}

test('snapshot reduziert Scan auf Regel-Map mit Score', () => {
  const s = snapshot(scanStub([viol('image-alt', 'serious', 3), viol('color-contrast', 'serious', 2)]));
  assert.equal(typeof s.score, 'number');
  assert.equal(Object.keys(s.rules).length, 2);
  assert.equal(s.rules['image-alt'].nodeCount, 3);
});

test('diff: firstScan wenn kein Vor-Snapshot', () => {
  const d = diff(scanStub([viol('image-alt', 'serious')]), null);
  assert.equal(d.firstScan, true);
  assert.equal(d.resolved.length, 0);
  assert.equal(d.newly.length, 0);
  assert.equal(d.unchanged.length, 1);
});

test('diff: resolved/newly/changed/unchanged korrekt klassifiziert', () => {
  const prev = snapshot(scanStub([
    viol('image-alt', 'serious', 3),     // wird komplett behoben
    viol('color-contrast', 'serious', 5),// bleibt unverändert
    viol('label', 'critical', 2)         // wird verschlechtert
  ]));
  const curr = scanStub([
    viol('color-contrast', 'serious', 5),// unchanged
    viol('label', 'critical', 4),        // worsened (2 -> 4)
    viol('link-name', 'serious', 1)      // newly
  ]);
  const d = diff(curr, prev);
  assert.equal(d.firstScan, false);
  assert.equal(d.resolved.length, 1);
  assert.equal(d.resolved[0].id, 'image-alt');
  assert.equal(d.newly.length, 1);
  assert.equal(d.newly[0].id, 'link-name');
  assert.equal(d.changed.length, 1);
  assert.equal(d.changed[0].id, 'label');
  assert.equal(d.changed[0].direction, 'worsened');
  assert.equal(d.unchanged.length, 1);
  assert.equal(d.unchanged[0].id, 'color-contrast');
});

test('diff: changed.direction "improved" bei weniger Nodes', () => {
  const prev = snapshot(scanStub([viol('label', 'critical', 5)]));
  const curr = scanStub([viol('label', 'critical', 2)]);
  const d = diff(curr, prev);
  assert.equal(d.changed[0].direction, 'improved');
  assert.equal(d.changed[0].before, 5);
  assert.equal(d.changed[0].after, 2);
});

test('diffSummaryText: enthält Score-Differenz und Listen', () => {
  const prev = snapshot(scanStub([viol('image-alt', 'serious', 3)]));
  const curr = scanStub([viol('label', 'critical', 1)]);
  const d = diff(curr, prev);
  const txt = diffSummaryText(d);
  assert.match(txt, /Score:/);
  assert.match(txt, /Behoben/);
  assert.match(txt, /Neu/);
});

test('renderReport rendert Diff-Block ohne zu werfen', () => {
  const prev = snapshot(scanStub([viol('image-alt', 'serious', 3)]));
  const curr = scanStub([viol('label', 'critical', 1)]);
  const d = diff(curr, prev);
  const html = renderReport(curr, { diff: d, pagesScanned: 5, company: 'ACME GmbH' });
  assert.match(html, /Veränderungen seit letztem Scan/);
  assert.match(html, /Geprüfte Unterseiten: 5/);
  assert.match(html, /ACME GmbH/);
});

test('renderReport zeigt keinen Diff-Block beim Erst-Scan', () => {
  const d = diff(scanStub([viol('image-alt', 'serious', 3)]), null);
  const html = renderReport(scanStub([viol('image-alt', 'serious', 3)]), { diff: d });
  assert.doesNotMatch(html, /Veränderungen seit letztem Scan/);
});

test('subscriptions: record -> snapshot -> cancel Lifecycle', async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'bfsg-subs-'));
  process.env.SUBS_FILE = path.join(tmp, 'subs.jsonl');
  // Modul neu importieren, damit die FILE-Konstante mit dem Env greift.
  const mod = await import('../lib/subscriptions.js?ts=' + Date.now());
  await mod.recordSubscription({
    subscriptionId: 'sub_TEST1', customerId: 'cus_TEST1',
    email: 'kunde@example.de', url: 'https://example.de',
    company: 'ACME', pkg: 'abo'
  });
  let s = await mod.getSubscription('sub_TEST1');
  assert.equal(s.status, 'ACTIVE');
  assert.equal(s.lastSnapshot, null);

  await mod.saveSnapshot('sub_TEST1', { url: 'https://example.de', score: 80, rules: {} });
  s = await mod.getSubscription('sub_TEST1');
  assert.equal(s.lastSnapshot.score, 80);

  await mod.markCancelled('sub_TEST1');
  s = await mod.getSubscription('sub_TEST1');
  assert.equal(s.status, 'CANCELLED');

  rmSync(tmp, { recursive: true, force: true });
  delete process.env.SUBS_FILE;
});
