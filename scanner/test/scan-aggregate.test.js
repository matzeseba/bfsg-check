// Unit-Tests für die Multi-Page-Aggregation (F2/F7/F14): reine Funktion, kein
// Browser nötig. Prüft, dass Nodes ihre Quell-Seiten-URL behalten und dass ein
// identischer Selektor auf mehreren Seiten NICHT mehr zu einem einzigen Treffer
// kollabiert (der alte Dedupe-Key lief nur über den Selektor).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregatePageResults } from '../lib/scan.js';

function pageResult(url, title, violations, passes = 1, incomplete = 0) {
  return { url, title, violations, passes, incomplete };
}
function viol(id, impact, targets) {
  return { id, impact, help: id, tags: ['wcag2a'], nodes: targets.map((t) => ({ target: [t] })) };
}

test('aggregatePageResults: taggt jede Node mit der Quell-Seiten-URL (F2/F7)', () => {
  const pages = [
    pageResult('https://beispiel.de/', 'Start', [viol('image-alt', 'critical', ['.hero img'])]),
    pageResult('https://beispiel.de/kontakt', 'Kontakt', [viol('label', 'serious', ['#email'])])
  ];
  const { violations } = aggregatePageResults(pages);
  const imageAlt = violations.find((v) => v.id === 'image-alt');
  const label = violations.find((v) => v.id === 'label');
  assert.equal(imageAlt.nodes[0]._page, 'https://beispiel.de/');
  assert.equal(label.nodes[0]._page, 'https://beispiel.de/kontakt');
});

test('aggregatePageResults (F14): derselbe Selektor auf mehreren Seiten zählt je Seite, statt auf 1 zu kollabieren', () => {
  const pages = [
    pageResult('https://beispiel.de/', 'Start', [viol('color-contrast', 'serious', ['footer .legal a'])]),
    pageResult('https://beispiel.de/ueber-uns', 'Über uns', [viol('color-contrast', 'serious', ['footer .legal a'])]),
    pageResult('https://beispiel.de/kontakt', 'Kontakt', [viol('color-contrast', 'serious', ['footer .legal a'])])
  ];
  const { violations } = aggregatePageResults(pages);
  const cc = violations.find((v) => v.id === 'color-contrast');
  // Gleicher Selektor, aber 3 verschiedene Seiten -> 3 Nodes, nicht 1.
  assert.equal(cc.nodes.length, 3);
  const pagesSeen = new Set(cc.nodes.map((n) => n._page));
  assert.equal(pagesSeen.size, 3);
});

test('aggregatePageResults: identischer Selektor auf DERSELBEN Seite bleibt dedupliziert', () => {
  const pages = [
    pageResult('https://beispiel.de/', 'Start', [
      viol('image-alt', 'critical', ['.hero img']),
      viol('image-alt', 'critical', ['.hero img', '.sidebar img'])
    ])
  ];
  const { violations } = aggregatePageResults(pages);
  const imageAlt = violations.find((v) => v.id === 'image-alt');
  // '.hero img' kommt zweimal auf derselben Seite vor -> dedupliziert auf 2 Nodes gesamt.
  assert.equal(imageAlt.nodes.length, 2);
});

test('aggregatePageResults: passes/incomplete werden über alle Seiten summiert', () => {
  const pages = [
    pageResult('https://beispiel.de/', 'Start', [], 10, 2),
    pageResult('https://beispiel.de/kontakt', 'Kontakt', [], 5, 1)
  ];
  const { passes, incomplete } = aggregatePageResults(pages);
  assert.equal(passes, 15);
  assert.equal(incomplete, 3);
});
