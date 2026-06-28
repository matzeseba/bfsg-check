// Report-/Umlaut-Tests: stellt sicher, dass die user-sichtbaren deutschen Strings
// echte Umlaute (ä/ö/ü/ß) statt ASCII-Ersatz (ae/oe/ue/ss) verwenden.
// Regression-Schutz gegen den Live-Teaser-Bug ("Luecken", "ausserhalb", "Loesung").

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReport, renderTeaser, computeScore, statusForScore } from '../lib/report.js';
import { renderStatement } from '../lib/statement.js';
import { RULES_DE, COOKIE_RULES, ruleInfo } from '../lib/rules-de.js';

function scanStub(violations = [], opts = {}) {
  return {
    url: 'https://beispiel.de',
    scannedAt: new Date().toISOString(),
    meta: { title: 'Test' },
    violations,
    passes: opts.passes ?? 7,
    incomplete: opts.incomplete ?? 2
  };
}
function viol(id, impact = 'serious', nodeCount = 2) {
  return {
    id, impact, help: id, tags: ['wcag2aa'],
    nodes: Array.from({ length: nodeCount }, (_, i) => ({ target: ['#n' + i] }))
  };
}

// Liste der typischen ASCII-Umlaut-Artefakte, die NICHT mehr in user-sichtbaren
// deutschen Strings vorkommen dürfen.
const ASCII_ARTIFACTS = [
  'Luecke', 'Luecken', 'Loesung', 'Maengel', 'Maengeln', 'Pruefung', 'Pruefnorm',
  'Erstpruefung', 'Verstoesse', 'noetig', 'koennen', 'muessen', 'ausserhalb',
  'Konformitaets', 'gehoerlose', 'Vergroess', 'unterdrueckt', 'Schaltflaech',
  'verknuepf', 'ungueltig', 'aussagekraeftig', 'zugaenglich', 'ergaenz',
  'zustaendig', 'Marktueber', 'vervollstaend', 'bemueht', 'Einschaetzung',
  'Gruenden', 'Erklaerung', 'Barrierefreiheitsstaerkung', 'staerkung'
];

function assertNoAsciiArtifacts(text, where) {
  const found = ASCII_ARTIFACTS.filter((a) => text.includes(a));
  assert.equal(found.length, 0, `${where}: ASCII-Umlaut-Artefakte gefunden: ${found.join(', ')}`);
}

test('rules-de: alle title/why/fix ohne ASCII-Umlaut-Artefakte', () => {
  for (const [id, r] of Object.entries(RULES_DE)) {
    assertNoAsciiArtifacts(`${r.title} ${r.why} ${r.fix}`, `RULES_DE[${id}]`);
  }
  for (const [id, r] of Object.entries(COOKIE_RULES)) {
    assertNoAsciiArtifacts(`${r.title} ${r.why} ${r.fix}`, `COOKIE_RULES[${id}]`);
  }
});

test('rules-de: konkrete Umlaute vorhanden (Stichprobe)', () => {
  assert.match(RULES_DE['image-alt'].fix, /aussagekräftiges/);
  assert.match(RULES_DE['color-contrast'].why, /Sehschwäche/);
  assert.match(RULES_DE['button-name'].title, /Schaltflächen/);
  assert.match(RULES_DE['heading-order'].title, /Überschriften/);
});

test('renderReport: HTML ohne ASCII-Umlaut-Artefakte, mit echten Umlauten', () => {
  const html = renderReport(
    scanStub([viol('color-contrast', 'critical', 4), viol('label', 'serious', 1)]),
    { company: 'Müller GmbH' }
  );
  assertNoAsciiArtifacts(html, 'renderReport');
  assert.match(html, /Lösung:/);
  assert.match(html, /Prüfnorm/);
  assert.match(html, /Konformitäts-Score/);
  assert.match(html, /Bestandene Prüfungen/);
});

test('renderReport: leere Violations zeigt korrekten Umlaut-Text', () => {
  const html = renderReport(scanStub([]), {});
  assert.match(html, /keine.{0,30}Verstöße/i);
  assertNoAsciiArtifacts(html, 'renderReport(leer)');
});

test('renderReport (SF13): Cookie-Pfad nutzt TDDDG-neutrales Label + Verdikt, KEIN Konformitäts-Score', () => {
  // Cookie-Report darf keine BFSG-„konform"-Aussage treffen (keine Konformitätsgarantie).
  const html = renderReport(scanStub([]), {
    scoreLabel: 'Consent-Hygiene-Score',
    verdictText: 'Technische Einzelmessung, keine Konformitätsaussage.'
  });
  assert.match(html, /Consent-Hygiene-Score/);
  assert.doesNotMatch(html, /Konformitäts-Score/);
  assert.match(html, /keine Konformitätsaussage/);
  // BFSG-Verdikt darf NICHT erscheinen.
  assert.doesNotMatch(html, /Weitgehend konform/);
});

test('renderReport: BFSG-Pfad behält „Konformitäts-Score" (Default-Label)', () => {
  const html = renderReport(scanStub([viol('label', 'serious', 1)]), { company: 'X GmbH' });
  assert.match(html, /Konformitäts-Score/);
});

test('renderReport: notices (TLS-Hinweis) als eigener Abschnitt, OHNE Score/Erklärung zu beeinflussen', () => {
  const notice = { title: 'TLS-Zertifikat der Website fehlerhaft', severity: 'moderate', text: 'Das Zertifikat ist abgelaufen. Keine WCAG-Barriere.' };
  // Identischer Scan, einmal mit und einmal ohne notice → Score-Block muss identisch sein.
  const withNotice = renderReport(scanStub([viol('label', 'serious', 2)]), { notices: [notice] });
  const without = renderReport(scanStub([viol('label', 'serious', 2)]), {});
  assert.match(withNotice, /Weitere technische Hinweise/);
  assert.match(withNotice, /TLS-Zertifikat der Website fehlerhaft/);
  assert.match(withNotice, /abgelaufen/);
  // Ohne notices: kein Hinweis-Abschnitt.
  assert.doesNotMatch(without, /Weitere technische Hinweise/);
  // Der Score-/Verdikt-Block ist identisch (notice fließt NICHT in den Score ein).
  const scoreLine = (s) => (s.match(/Konformitäts-Score: (\d+)\/100/) || [])[1];
  assert.equal(scoreLine(withNotice), scoreLine(without), 'Score darf durch den TLS-Hinweis nicht sinken');
  assertNoAsciiArtifacts(withNotice, 'renderReport(notices)');
});

test('statusForScore (SF12): einheitliche Schwellen, identisch zur Erklärung', () => {
  assert.equal(statusForScore(95), 'weitgehend konform');
  assert.equal(statusForScore(90), 'weitgehend konform');
  assert.equal(statusForScore(70), 'teilweise konform');
  assert.equal(statusForScore(50), 'teilweise konform');
  assert.equal(statusForScore(49), 'nicht konform');
  assert.equal(statusForScore(0), 'nicht konform');
  // Kopplung: die Barrierefreiheitserklärung muss exakt dieselbe Aussage rendern.
  // Score 50–74 war der gemeldete Widerspruch (Report-Note C vs. Erklärung).
  const md = renderStatement(scanStub([viol('color-contrast', 'critical', 6), viol('label', 'serious', 4)]));
  const { score } = computeScore([viol('color-contrast', 'critical', 6), viol('label', 'serious', 4)]);
  assert.match(md, new RegExp(statusForScore(score)));
});

test('renderStatement: Markdown ohne ASCII-Umlaut-Artefakte', () => {
  const md = renderStatement(scanStub([viol('image-alt', 'serious', 3)]), {
    company: 'Bäckerei Schöll', email: 'info@beispiel.de'
  });
  assertNoAsciiArtifacts(md, 'renderStatement');
  assert.match(md, /Erklärung zur Barrierefreiheit/);
  assert.match(md, /Barrierefreiheitsstärkungsgesetz/);
  assert.match(md, /zuständige/);
});

test('renderTeaser: topIssues-Titel ohne ASCII-Artefakte', () => {
  const teaser = renderTeaser(scanStub([viol('button-name', 'critical', 2), viol('color-contrast', 'serious', 5)]));
  for (const t of teaser.topIssues) assertNoAsciiArtifacts(t, 'teaser.topIssue');
  assert.ok(teaser.score >= 0 && teaser.score <= 100);
});

test('computeScore: verdict-Texte ohne ASCII-Artefakte über alle Stufen', () => {
  // 0 Violations -> Grade A; viele kritische -> Grade D
  const verdicts = [
    computeScore([]).verdict,
    computeScore([viol('a', 'critical', 10), viol('b', 'critical', 10), viol('c', 'critical', 10), viol('d', 'critical', 10)]).verdict
  ];
  for (const v of verdicts) assertNoAsciiArtifacts(v, 'computeScore.verdict');
});

test('ruleInfo: Fallback für unbekannte Regel bleibt funktional', () => {
  const info = ruleInfo({ id: 'unknown-rule-xyz', help: 'Hilfetext', description: 'Beschreibung', helpUrl: 'https://x' });
  assert.equal(info.title, 'Hilfetext');
  assert.match(info.fix, /axe-core/);
});
