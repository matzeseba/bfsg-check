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

test('computeScore (D2): degressiv statt bodenlos — wenige leichte Befunde bleiben hoch, ein realistischer Multi-Page-Scan mit vielen Regel-Typen fällt nicht auf 0', () => {
  // Ein einzelner leichter (serious, 1 Node) Befund: Score bleibt hoch (85-95),
  // nicht linear "bestraft" wie bei der alten 100-penalty-Formel.
  const light = computeScore([viol('label', 'serious', 1)]);
  assert.ok(light.score >= 85 && light.score <= 95, `Score ${light.score} außerhalb 85-95`);

  // 13 aggregierte Regel-Typen (typisch bei einem Multi-Page-Scan über viele
  // Unterseiten) trieben die alte Formel über 100 Punkte Abzug -> 0/100 neben
  // hunderten bestandenen Prüfungen. Die neue Formel bleibt > 0.
  const manyRuleTypes = Array.from({ length: 13 }, (_, i) =>
    viol('rule-' + i, ['critical', 'serious', 'moderate', 'minor'][i % 4], 8)
  );
  const heavy = computeScore(manyRuleTypes);
  assert.ok(heavy.score > 0, `Score darf bei realistischem Multi-Page-Scan nicht auf 0 fallen (war ${heavy.score})`);

  // 0 Befunde bleibt weiterhin 100/100.
  assert.equal(computeScore([]).score, 100);
});

test('renderReport (F6/F16): Fundstellen offen sichtbar (kein <details>), mit Seiten-Tag/HTML-Snippet/failureSummary', () => {
  const v = viol('image-alt', 'critical', 2);
  v.nodes[0]._page = 'https://beispiel.de/unterseite';
  v.nodes[0].html = '<img class="banner">';
  v.nodes[0].failureSummary = 'Fix: alt-Attribut ergänzen.';
  const html = renderReport(scanStub([v]));
  assert.doesNotMatch(html, /<details/);
  assert.match(html, /examples-open/);
  assert.match(html, /Seite: https:\/\/beispiel\.de\/unterseite/);
  assert.match(html, /&lt;img class=&quot;banner&quot;&gt;/);
  assert.match(html, /Fix: alt-Attribut ergänzen\./);
});

test('renderReport (F15): ab dem 6. Beispiel wandert der Rest in den Anhang "Vollständige Fundstellenliste"', () => {
  const v = viol('image-alt', 'serious', 7);
  const html = renderReport(scanStub([v]));
  assert.match(html, /Anhang: Vollständige Fundstellenliste/);
  // Alle 7 Selektoren müssen irgendwo im Dokument vorkommen (5 offen + Rest im Anhang).
  for (let i = 0; i < 7; i++) assert.match(html, new RegExp(`#n${i}`));
  assert.match(html, /weitere Stelle/);
});

test('renderReport (F1): plan=true rendert Umsetzungsplan mit Phasen, plan=false/Default nicht', () => {
  const withPlan = renderReport(scanStub([viol('label', 'serious', 1)]), { plan: true });
  const withoutPlan = renderReport(scanStub([viol('label', 'serious', 1)]));
  assert.match(withPlan, /Priorisierter Umsetzungsplan/);
  assert.match(withPlan, /Phase \d/);
  assert.doesNotMatch(withoutPlan, /Priorisierter Umsetzungsplan/);
});

test('renderReport (F2/F7): pages-Option rendert "Befunde je Unterseite"-Tabelle ab 2 Seiten', () => {
  const pages = [
    { url: 'https://beispiel.de/', title: 'Start', violationCount: 3 },
    { url: 'https://beispiel.de/kontakt', title: 'Kontakt', violationCount: 1 }
  ];
  const html = renderReport(scanStub([viol('label')]), { pages });
  assert.match(html, /Befunde je Unterseite/);
  assert.match(html, /beispiel\.de\/kontakt/);
  // Bei nur 1 Seite (oder ohne pages) keine Tabelle.
  const single = renderReport(scanStub([viol('label')]), { pages: [pages[0]] });
  assert.doesNotMatch(single, /Befunde je Unterseite/);
});

test('renderReport (F3): "Geprüfte Unterseiten" wird auch bei genau 1 Seite gerendert', () => {
  const html = renderReport(scanStub([viol('label')]), { pagesScanned: 1 });
  assert.match(html, /Geprüfte Unterseiten: 1/);
});

test('renderReport (D5): Fußzeile trägt Marke + Kontakt statt generischem "BFSG-Audit"', () => {
  const html = renderReport(scanStub([]));
  assert.match(html, /BFSG-Fuchs/);
  assert.match(html, /bfsg-fix\.de/);
  assert.match(html, /info@bfsg-fix\.de/);
  assert.doesNotMatch(html, /BFSG-Audit &middot; Automatisierte/);
});

test('renderReport (D6): Badge-Hintergründe erreichen mindestens 4,5:1-Kontrast (dunklere Töne statt der alten zu hellen)', () => {
  const html = renderReport(scanStub([]));
  assert.match(html, /--ser:#c2410c/);
  assert.match(html, /--mod:#854d0e/);
  assert.match(html, /--min:#155e75/);
  assert.doesNotMatch(html, /--ser:#ea580c/);
  assert.doesNotMatch(html, /--mod:#ca8a04/);
  assert.doesNotMatch(html, /--min:#0891b2/);
});
