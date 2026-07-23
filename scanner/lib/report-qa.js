// KI-Report-QA-Agent (PR4): prüft jeden erzeugten Report vor Auslieferung.
//
// Aufgabe des Agenten:
//  1. False Positives konservativ entfernen (nur bei hoher Sicherheit).
//  2. Generische `fix`/`why`-Texte auf die konkreten Fundstellen (Selektoren)
//     beziehen — OHNE Fakten zu erfinden.
//  3. Lücken als gekennzeichnete Hinweise ergänzen (kein „Verstoß").
//  4. Deutsche WCAG-2.1/2.2-Fachsprache.
//  5. UWG §5: NIEMALS „BFSG-konform / rechtssicher / garantiert / TÜV / DEKRA".
//
// STRIKT FAIL-OPEN: jeder Fehler / Timeout / Refusal / fehlender Key / fehlende
// SDK-Installation → `qaReport()` gibt `null` zurück → der Report geht
// UNVERÄNDERT raus (Owner-Regel „nie ohne Report"). Läuft im Delay-Fenster
// (PR5), nicht im Webhook-Antwortpfad. Kosten ~$0,01–0,25/Report.
// Provider-Abstraktion (PR-P3a): Anthropic oder OpenAI-kompatibel, siehe
// docs/LLM-PROVIDER.md. Prompt und Claim-Regex-Katalog sind provider-neutral.

import { anthropicQaEnabled, callReportQa } from './anthropic-client.js';
import { ruleInfo } from './rules-de.js';

const QA_TOOL_NAME = 'submit_report_qa';

// Verbotene Marketing-Claims (UWG §5 / CLAUDE.md). Deterministischer Post-Check:
// der LLM darf KEINE dieser Formulierungen in den verkauften Report schleusen.
// Als Array (statt Monster-Literal) für Reviewbarkeit; per '|' zu einer i-Regex
// verbunden. Bewusst NICHT geblockt: nacktes „konform" (Report-Verdikte
// „weitgehend/teilweise/nicht konform" kommen aus report.js, nicht vom LLM) und
// „barrierefrei" allein — sonst würden legitime Sätze zerschossen. Bei Treffer
// wird das ganze Override/Notice verworfen → in report.js greift der Basistext
// (fail-closed). Getestet gegen 53 verbotene + 19 legitime Formulierungen.
const FORBIDDEN_PATTERNS = [
  // „BFSG-konform" + Synonym-Konformität (mit/ohne Bindestrich, diverse Normen)
  'BFSG[- ]?konform',
  '\\b(?:gesetzes|norm|richtlinien|rechts|wcag|bfsg|barrierefreiheits)[- ]?konform\\w*\\b',
  '\\bwcag\\b[\\s\\d.aA]{0,15}?konform\\w*\\b',
  '\\bkonform(?:it(?:ä|ae)t)?\\s+(?:mit|zu|zur|zum|nach)\\s+(?:dem\\s+|der\\s+|den\\s+)?(?:bfsg|wcag|en\\s*301|gesetz|norm|richtlinie)',
  '\\bBFSG[- ]?compliant\\b',
  '\\bBFSG-Konformit(?:ä|ae)t\\b',
  // Rechtssicherheit / Haftung / Gewähr / Garantie (inkl. Verb-Flexion)
  '\\brechtssicher\\w*\\b',
  '\\brechtskonform\\w*\\b',
  '\\babmahn(?:ungs)?sicher\\w*\\b',
  '\\bhaftungssicher\\w*\\b',
  '\\brechtlich\\s+(?:auf der\\s+)?sicher',
  '\\bgarant(?:iert|ie|ieren)\\b',
  '\\bgew(?:ä|ae)hrleist\\w*\\b',
  '\\bGew(?:ä|ae)hr\\b',
  '\\bzugesichert\\b',
  // Siegel / Zertifizierung ohne echte Zertifizierung
  '\\bT[ÜU]V\\b',
  '\\bDEKRA\\b',
  '\\bzertifizier\\w*\\b',
  '\\bZertifikat\\b',
  '\\b(?:amtlich|offiziell)\\s+gepr(?:ü|ue)ft\\b',
  // Konformitäts-/Erfüllungs-Aussagen
  '\\berf(?:ü|ue)llt\\s+(?:alle\\s+|die\\s+|s(?:ä|ae)mtliche\\s+)?(?:gesetzlich\\w*\\s+)?(?:anforderung\\w*|vorgab\\w*|kriteri\\w*|vorschrift\\w*)',
  '\\banforderung\\w*\\s+(?:sind|ist|werden|wurden)\\s+(?:vollst(?:ä|ae)ndig\\s+)?erf(?:ü|ue)llt',
  '\\bentspricht\\s+(?:vollst(?:ä|ae)ndig\\s+)?(?:dem\\s+|den\\s+|der\\s+)?(?:bfsg|wcag|gesetz\\w*|norm\\w*|vorgab\\w*|richtlinie\\w*|kriteri\\w*|anforderung\\w*)',
  // Voll-/100%-Barrierefreiheit + „Seite ist barrierefrei"
  '\\b(?:voll|vollst(?:ä|ae)ndig|komplett|vollumf(?:ä|ae)nglich|hundertprozentig|g(?:ä|ae)nzlich)\\s+(?:und ganz\\s+)?barrierefrei\\b',
  '\\b100\\s*%?\\s*barrierefrei\\b',
  '\\b(?:zu\\s+)?100\\s*(?:%|prozent)\\s+barrierefrei\\b',
  '\\b(?:seite|website|webseite|shop|auftritt)\\s+(?:ist|sind|wird|war)\\s+barrierefrei\\b',
  '\\bist\\s+(?:nun\\s+|jetzt\\s+|damit\\s+)?barrierefrei\\b',
  '\\b(?:ist|sind|wird|war|nun|jetzt|damit)\\s+(?:die\\s+|ihre\\s+|der\\s+)?(?:seite|website|webseite|shop|auftritt)\\s+barrierefrei\\b',
  // Füllwort-tolerant: „(Seite/Website/Shop) … barrierefrei" (Zustands-/Zukunfts-
  // aussage) bzw. „macht … barrierefrei" — Negativ-Lookahead schützt „… nicht/
  // keine barrierefrei" (legitime Befund-Negation).
  '\\b(?:seite|website|webseite|shop|auftritt|online[- ]?shop)\\b(?:\\s+(?!nicht\\b|kein\\w*\\b|nie\\b|nur\\b)\\w+){0,3}\\s+barrierefrei\\b',
  '\\bmach(?:t|en)\\b(?:\\s+(?!nicht\\b|kein\\w*\\b)\\w+){0,4}\\s+barrierefrei\\b',
  // Fehlerfreiheit / Vollständigkeits-Ergebnis
  '\\b(?:alle|aller|s(?:ä|ae)mtliche[rn]?)\\s+barrieren\\b',
  '\\bkeine\\s+barrieren\\s+(?:mehr\\s+)?(?:vorhanden|gefunden|verbleib\\w*)',
  '\\bkeine\\s+m(?:ä|ae)ngel\\s+mehr\\b',
  '\\bfehlerfrei\\b'
];
const FORBIDDEN_CLAIM = new RegExp(FORBIDDEN_PATTERNS.join('|'), 'i');

// Strict-JSON-Schema für die Tool-Ausgabe. Keine numerischen/String-Längen-
// Constraints (von Structured Outputs nicht unterstützt); additionalProperties
// überall false; alle Felder required.
const QA_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    verdict: { type: 'string', enum: ['ok', 'revised'] },
    falsePositiveIds: { type: 'array', items: { type: 'string' } },
    findingOverrides: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          why: { type: 'string' },
          fix: { type: 'string' }
        },
        required: ['id', 'why', 'fix']
      }
    },
    additionalNotices: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          text: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'serious', 'moderate', 'minor'] }
        },
        required: ['title', 'text', 'severity']
      }
    },
    reasoning: { type: 'string' }
  },
  required: ['verdict', 'falsePositiveIds', 'findingOverrides', 'additionalNotices', 'reasoning']
};

// Kompakter Input pro Violation (KEIN HTML in den Prompt). Max 5 Selektoren.
export function buildQaInput(scan, { pkg = '' } = {}) {
  const violations = Array.isArray(scan?.violations) ? scan.violations : [];
  const findings = violations.map((v) => {
    const info = ruleInfo(v);
    const nodeTargets = (Array.isArray(v.nodes) ? v.nodes : [])
      .slice(0, 5)
      .map((n) => (Array.isArray(n?.target) ? n.target.join(' ') : String(n?.target || '')))
      .filter(Boolean);
    return {
      id: String(v.id || ''),
      impact: String(v.impact || 'moderate'),
      help: String(v.help || info.title || v.id || ''),
      nodeTargets,
      genericWhy: String(info.why || ''),
      genericFix: String(info.fix || '')
    };
  });
  return { pkg, url: String(scan?.url || ''), findings };
}

// System-Prompt + User-Prompt aus dem kompakten Input.
export function buildQaPrompt(input) {
  const system = `Du bist ein deutschsprachiger Barrierefreiheits-QA-Prüfer (WCAG 2.1/2.2 AA, EN 301 549).
Du prüfst einen automatisiert erzeugten Report VOR dem Verkauf und gibst dein Ergebnis AUSSCHLIESSLICH über das Werkzeug "${QA_TOOL_NAME}" zurück.

Rubrik (konservativ, keine erfundenen Fakten):
1. False Positives: Setze eine Regel-ID nur dann auf falsePositiveIds, wenn du dir SEHR sicher bist, dass es kein echter Verstoß ist. Im Zweifel: NICHT entfernen.
2. findingOverrides: Für Regeln mit generischem Text, den du konkreter machen kannst, formuliere "why" (warum kritisch) und "fix" (konkrete Lösung) fundstellen-spezifisch anhand der gegebenen Selektoren — OHNE Fakten zu erfinden, die nicht aus den Daten hervorgehen. Nur Regeln überarbeiten, die es wirklich verbessert; sonst weglassen.
3. additionalNotices: Ergänze höchstens 3 kurze, klar als "Hinweis" gekennzeichnete Punkte für Lücken automatischer Tests (z. B. Tastaturbedienung, Vorlese-Logik) — als Hinweis, NICHT als "Verstoß".
4. Sprache: deutsche WCAG-Fachsprache, sachlich, keine Werbung.
5. PFLICHT (UWG §5): Verwende NIEMALS die Wörter "BFSG-konform", "rechtssicher", "garantiert"/"Garantie", "TÜV", "DEKRA", "zertifiziert" oder "100% barrierefrei" und triff KEINE Vollständigkeits- oder Konformitätsaussage (automatisierte Tests erkennen nur ~30–50 % der Barrieren). Formuliere NIE "die Seite ist barrierefrei", "entspricht dem BFSG" oder "erfüllt die Anforderungen". Der Report ist eine automatisierte technische Analyse, KEINE Konformitätsgarantie.

Wenn nichts zu verbessern ist: verdict "ok", leere Arrays.`;

  const user = `Report-Kontext:
- Paket: ${input.pkg || '(unbekannt)'}
- URL: ${input.url || '(unbekannt)'}
- Befunde (${input.findings.length}):
${JSON.stringify(input.findings, null, 2)}

Prüfe die Befunde gemäß Rubrik und gib das Ergebnis über das Werkzeug "${QA_TOOL_NAME}" zurück.`;

  return { system, user };
}

// Deterministischer Post-Check: filtert alles aus dem LLM-Output, das einen
// verbotenen Claim enthält (fail-closed gegen §5-UWG-Leaks im verkauften
// Report). Rückgabe ist eine bereinigte, defensiv normalisierte Struktur.
export function sanitizeQaOutput(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const clean = (s) => (typeof s === 'string' ? s : '');
  const dropped = [];

  const falsePositiveIds = (Array.isArray(raw.falsePositiveIds) ? raw.falsePositiveIds : [])
    .filter((x) => typeof x === 'string' && x.trim())
    .map((x) => x.trim());

  const findingOverrides = (Array.isArray(raw.findingOverrides) ? raw.findingOverrides : [])
    .filter((o) => o && typeof o === 'object' && typeof o.id === 'string' && o.id.trim())
    .map((o) => ({ id: o.id.trim(), why: clean(o.why), fix: clean(o.fix) }))
    .filter((o) => {
      if (FORBIDDEN_CLAIM.test(o.why) || FORBIDDEN_CLAIM.test(o.fix)) { dropped.push(`override:${o.id}`); return false; }
      return o.why || o.fix;
    });

  const additionalNotices = (Array.isArray(raw.additionalNotices) ? raw.additionalNotices : [])
    .filter((n) => n && typeof n === 'object')
    .map((n) => ({
      title: clean(n.title),
      text: clean(n.text),
      severity: ['critical', 'serious', 'moderate', 'minor'].includes(n.severity) ? n.severity : 'moderate'
    }))
    .filter((n) => {
      if (FORBIDDEN_CLAIM.test(n.title) || FORBIDDEN_CLAIM.test(n.text)) { dropped.push('notice'); return false; }
      return n.title && n.text;
    })
    .slice(0, 3);

  if (dropped.length) {
    console.warn(`[report-qa] verbotene Claims aus QA-Output gefiltert: ${dropped.join(', ')}`);
  }
  // WICHTIG: `reasoning` wird BEWUSST verworfen (nicht durchgereicht) — es fließt
  // NICHT in den verkauften Report (renderReport nutzt es nirgends). Nicht später
  // „hilfreich" wieder aufnehmen: es unterläge sonst demselben §5-Claim-Risiko.
  return { falsePositiveIds, findingOverrides, additionalNotices };
}

// Orchestrator. Rückgabe: bereinigte Overrides-Struktur oder null (fail-open).
// `deps` injiziert Client/Model/forceEnabled für Tests.
export async function qaReport({ scan, pkg = '' } = {}, deps = {}) {
  if (!(deps.forceEnabled || anthropicQaEnabled())) return null;
  try {
    const input = buildQaInput(scan, { pkg });
    if (!input.findings.length) return null; // nichts zu prüfen
    const { system, user } = buildQaPrompt(input);
    const res = await callReportQa(
      { system, user, toolName: QA_TOOL_NAME, toolSchema: QA_SCHEMA },
      deps
    );
    if (!res || res.refused || !res.data) return null; // fail-open
    return sanitizeQaOutput(res.data);
  } catch (err) {
    console.warn(`[report-qa] QA fehlgeschlagen (fail-open, Report geht unverändert raus): ${err?.message || err}`);
    return null;
  }
}

export { QA_TOOL_NAME, QA_SCHEMA, FORBIDDEN_CLAIM };
