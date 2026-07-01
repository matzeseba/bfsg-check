// PR4-Tests: KI-Report-QA-Agent. DI-Seam (injizierbarer Client) → Unit-Tests mit
// gemocktem Anthropic-Response, OHNE echtes SDK/Netzwerk. Prüft: FP-Filter greift,
// Refusal/Fehler/keine-Findings → null (STRIKT fail-open), deterministischer
// Forbidden-Claims-Post-Check, sowie renderReport(qaOverrides) (Score/Texte/Notes).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  qaReport, buildQaInput, buildQaPrompt, sanitizeQaOutput, QA_TOOL_NAME, FORBIDDEN_CLAIM
} from '../lib/report-qa.js';
import { anthropicQaEnabled } from '../lib/anthropic-client.js';
import { renderReport, computeScore } from '../lib/report.js';

function viol(id, impact = 'serious', nodeCount = 2) {
  return {
    id, impact, help: id, tags: ['wcag2aa'],
    nodes: Array.from({ length: nodeCount }, (_, i) => ({ target: ['#n' + i] }))
  };
}
function scanStub(violations = []) {
  return { url: 'https://beispiel.de', scannedAt: '2026-07-01T00:00:00Z', meta: {}, violations, passes: 7, incomplete: 2 };
}

// Mock-Client: messages.stream(...).finalMessage() → das übergebene Message-Objekt.
function mockClient(finalMsg) {
  return { messages: { stream: () => ({ finalMessage: async () => finalMsg }) } };
}
function toolMsg(input) {
  return { stop_reason: 'tool_use', content: [{ type: 'tool_use', name: QA_TOOL_NAME, input }] };
}

test('anthropicQaEnabled: nur bei REPORT_QA_ENABLED=true UND gesetztem Key', () => {
  assert.equal(anthropicQaEnabled({}), false);
  assert.equal(anthropicQaEnabled({ REPORT_QA_ENABLED: 'true' }), false);           // Key fehlt
  assert.equal(anthropicQaEnabled({ ANTHROPIC_API_KEY: 'sk-x' }), false);           // Flag fehlt
  assert.equal(anthropicQaEnabled({ REPORT_QA_ENABLED: 'true', ANTHROPIC_API_KEY: 'sk-x' }), true);
});

test('buildQaInput: kompakt, max 5 Selektoren, KEIN HTML', () => {
  const input = buildQaInput(scanStub([viol('color-contrast', 'serious', 9)]), { pkg: 'profi' });
  assert.equal(input.pkg, 'profi');
  assert.equal(input.findings.length, 1);
  assert.equal(input.findings[0].nodeTargets.length, 5);   // auf 5 gekappt
  assert.ok(!JSON.stringify(input).includes('<'));         // kein HTML im Prompt-Input
});

test('buildQaPrompt: Rubrik + UWG-§5-Verbot + Tool-Name im Prompt', () => {
  const { system, user } = buildQaPrompt(buildQaInput(scanStub([viol('label')])));
  assert.match(system, /False Positives/);
  assert.match(system, /BFSG-konform/);       // als Verbot benannt
  assert.match(system, /rechtssicher/);
  assert.match(user, new RegExp(QA_TOOL_NAME));
});

test('qaReport: FP-Filter + Overrides über gemockten Client (forceEnabled)', async () => {
  const scan = scanStub([viol('image-alt'), viol('color-contrast')]);
  const client = mockClient(toolMsg({
    verdict: 'revised',
    falsePositiveIds: ['color-contrast'],
    findingOverrides: [{ id: 'image-alt', why: 'Konkret: fehlendes alt an #logo', fix: 'alt-Text ergänzen' }],
    additionalNotices: [{ title: 'Tastaturbedienung', text: 'Manuell prüfen.', severity: 'moderate' }],
    reasoning: 'ok'
  }));
  const out = await qaReport({ scan, pkg: 'basis' }, { forceEnabled: true, client });
  assert.deepEqual(out.falsePositiveIds, ['color-contrast']);
  assert.equal(out.findingOverrides[0].id, 'image-alt');
  assert.equal(out.additionalNotices.length, 1);
});

test('qaReport: Refusal → null (fail-open)', async () => {
  const client = mockClient({ stop_reason: 'refusal', content: [] });
  const out = await qaReport({ scan: scanStub([viol('image-alt')]) }, { forceEnabled: true, client });
  assert.equal(out, null);
});

test('qaReport: Client-Fehler → null (fail-open)', async () => {
  const client = { messages: { stream: () => ({ finalMessage: async () => { throw new Error('429'); } }) } };
  const out = await qaReport({ scan: scanStub([viol('image-alt')]) }, { forceEnabled: true, client });
  assert.equal(out, null);
});

test('qaReport: keine Findings → null (nichts zu prüfen)', async () => {
  const out = await qaReport({ scan: scanStub([]) }, { forceEnabled: true, client: mockClient(toolMsg({})) });
  assert.equal(out, null);
});

test('qaReport: deaktiviert (kein forceEnabled, keine Env) → null', async () => {
  const out = await qaReport({ scan: scanStub([viol('image-alt')]) });
  assert.equal(out, null);
});

test('sanitizeQaOutput: verbotene Claims werden hart gefiltert (§5 UWG)', () => {
  const out = sanitizeQaOutput({
    falsePositiveIds: ['x'],
    findingOverrides: [
      { id: 'a', why: 'sachlich', fix: 'Macht die Seite BFSG-konform.' },   // verboten → raus
      { id: 'b', why: 'sachlich', fix: 'aria-label ergänzen' }              // ok
    ],
    additionalNotices: [
      { title: 'Garantie', text: 'rechtssicher garantiert', severity: 'minor' }, // verboten → raus
      { title: 'Hinweis', text: 'Manuell prüfen', severity: 'moderate' }          // ok
    ],
    reasoning: 'r'
  });
  assert.deepEqual(out.findingOverrides.map((o) => o.id), ['b']);
  assert.equal(out.additionalNotices.length, 1);
  assert.equal(out.additionalNotices[0].title, 'Hinweis');
});

// Regressionsschutz: die gehärtete Claim-Liste (Legal-Audit) MUSS jede dieser
// verbotenen Formulierungen fangen — vorher rutschten 46/54 durch.
test('FORBIDDEN_CLAIM: fängt alle verbotenen §5-Formulierungen', () => {
  const forbidden = [
    'BFSG-konform', 'BFSG konform', 'BFSG-Konformität', 'BFSG-compliant',
    'Die Seite entspricht dem BFSG.', 'entspricht vollständig den Anforderungen',
    'gesetzeskonform', 'WCAG-konform', 'normkonform', 'rechtskonform',
    'konform mit dem BFSG', 'WCAG 2.1 AA konform',
    'erfüllt die Anforderungen des BFSG', 'erfüllt alle gesetzlichen Vorgaben',
    'die Anforderungen sind vollständig erfüllt',
    'rechtssicher', 'rechtssichere Umsetzung', 'abmahnsicher', 'haftungssicher',
    'rechtlich auf der sicheren Seite', 'wir garantieren die Barrierefreiheit',
    'garantiert barrierefrei', 'eine Garantie', 'wir gewährleisten die Konformität',
    'ohne Gewähr entfällt', 'das ist zugesichert',
    'TÜV-geprüft', 'DEKRA', 'zertifiziert barrierefrei', 'Zertifikat für Barrierefreiheit',
    'amtlich geprüft',
    'voll barrierefrei', 'vollständig barrierefrei', 'komplett barrierefrei',
    'hundertprozentig barrierefrei', '100% barrierefrei', 'zu 100 % barrierefrei',
    'Ihre Seite ist barrierefrei', 'die Website ist barrierefrei', 'ist nun barrierefrei',
    'keine Barrieren mehr vorhanden', 'keine Mängel mehr', 'fehlerfrei',
    'alle Barrieren erkannt',
    'Ihre Seite wird damit barrierefrei sein.', 'macht die Seite barrierefrei'
  ];
  const missed = forbidden.filter((s) => !FORBIDDEN_CLAIM.test(s));
  assert.deepEqual(missed, [], `Diese verbotenen Claims rutschen durch: ${missed.join(' | ')}`);
});

test('FORBIDDEN_CLAIM: KEINE False Positives auf legitime Report-/Befundtexte', () => {
  const legit = [
    'weitgehend konform', 'teilweise konform', 'nicht konform',
    'barrierefreie Nutzung', 'Der Farbkontrast ist zu gering.',
    'Fügen Sie ein aria-label hinzu.', 'Alternativtexte fehlen an mehreren Bildern.',
    'Die Tastaturbedienung sollte manuell geprüft werden.',
    'Diese automatisierte Analyse ersetzt keine manuelle Prüfung.',
    'Formularfelder ohne zugeordnetes Label.',
    'Der Shop ist an dieser Stelle nicht barrierefrei.'
  ];
  const falsePos = legit.filter((s) => FORBIDDEN_CLAIM.test(s));
  assert.deepEqual(falsePos, [], `Legitime Texte fälschlich geblockt: ${falsePos.join(' | ')}`);
});

test('renderReport(qaOverrides): FP-gefilterter Score >= ungefilterter; Notes angehängt', () => {
  const scan = scanStub([viol('image-alt', 'critical', 4), viol('color-contrast', 'serious', 3), viol('label', 'moderate', 2)]);
  const baseScore = computeScore(scan.violations).score;
  const html = renderReport(scan, {
    qaOverrides: {
      falsePositiveIds: ['color-contrast'],
      findingOverrides: [{ id: 'image-alt', why: 'W-OVERRIDE', fix: 'F-OVERRIDE' }],
      additionalNotices: [{ title: 'QA-Hinweis', text: 'Tastaturtest empfohlen.', severity: 'moderate' }]
    }
  });
  // FP raus → weniger Abzug → Score darf nicht kleiner sein.
  const filteredScore = computeScore(scan.violations.filter((v) => v.id !== 'color-contrast')).score;
  assert.ok(filteredScore >= baseScore);
  assert.match(html, new RegExp(`Score: ${filteredScore}/100`));
  // Override-Texte im HTML, FP-Regel raus, Zusatz-Hinweis da.
  assert.match(html, /F-OVERRIDE/);
  assert.match(html, /QA-Hinweis/);
  assert.doesNotMatch(html, /color-contrast/);  // gefilterte Regel taucht nicht mehr auf
});

test('renderReport ohne qaOverrides: unverändertes Verhalten (Default-Pfad)', () => {
  const scan = scanStub([viol('image-alt')]);
  const a = renderReport(scan);
  const b = renderReport(scan, {});
  assert.equal(a, b);
});
