// Wandelt das Scan-Ergebnis in einen verkaufsfertigen HTML-Report (deutsch).
// Aus dem HTML laesst sich per Playwright/Chromium direkt ein PDF drucken.

import { ruleInfo, IMPACT_WEIGHT, IMPACT_DE } from './rules-de.js';

export function computeScore(violations) {
  // Punktabzug nach Impact und Anzahl betroffener Stellen, gedeckelt.
  let penalty = 0;
  for (const v of violations) {
    const w = IMPACT_WEIGHT[v.impact] ?? 2;
    const nodes = Math.min(v.nodes.length, 10); // Diminishing returns
    penalty += w * (1 + Math.log2(nodes + 1));
  }
  // Degressive Formel (D2) statt linearem Abzug: bei vielen aggregierten Regel-
  // Typen (typisch bei Multi-Page-Scans, siehe scan.js) türmte 100-penalty die
  // Strafe schnell über 100 auf → Score 0/100 neben hunderten bestandenen
  // Prüfungen, obwohl die Seite nicht "komplett kaputt" ist. exp(-penalty/k)
  // nähert sich 0 nur asymptotisch — 0/100 bleibt echten Katastrophenfällen
  // vorbehalten. k=80 kalibriert an: 0 Befunde -> 100, ein einzelner leichter
  // Befund -> ~85-95 (siehe report.test.js), der alte Beispiel-Report-Fall
  // (4 Befunde, Penalty ~44) bleibt nahe am bisherigen ~56/100.
  const score = Math.max(0, Math.round(100 * Math.exp(-penalty / 80)));
  let grade, verdict;
  if (score >= 90) {
    grade = 'A';
    verdict = 'Weitgehend konform — nur Feinschliff nötig.';
  } else if (score >= 75) {
    grade = 'B';
    verdict = 'Solide Basis, aber relevante Lücken mit Handlungsbedarf.';
  } else if (score >= 50) {
    grade = 'C';
    verdict = 'Deutliche Mängel — Handlungsbedarf.';
  } else {
    grade = 'D';
    verdict = 'Kritisch — viele Mängel, dringender Handlungsbedarf.';
  }
  return { score, grade, verdict };
}

// Einheitliche Konformitäts-Aussage je Score — EINE Quelle für Report UND
// Barrierefreiheitserklärung (statement.js), damit derselbe Auftrag nie zwei
// widersprüchliche Aussagen erhält (SF12). Schwellen: >=90 weitgehend, 50–89
// teilweise, <50 nicht konform.
export function statusForScore(score) {
  if (score >= 90) return 'weitgehend konform';
  if (score >= 50) return 'teilweise konform';
  return 'nicht konform';
}

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function countByImpact(violations) {
  const c = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const v of violations) c[v.impact] = (c[v.impact] || 0) + 1;
  return c;
}

// F2/F7: Tabelle "Befunde je Unterseite" — nur bei tatsächlichem Multi-Page-Scan
// (scan.pages von scanSite) sinnvoll; bei 0/1 Seite entfällt sie (redundant zur
// "Geprüfte Unterseiten"-Zeile im Kopf).
function renderPagesTable(pages) {
  if (!Array.isArray(pages) || pages.length < 2) return '';
  const rows = pages
    .map((p) => `<tr><td>${esc(p.url)}</td><td>${esc(p.title || '—')}</td><td>${p.violationCount}</td></tr>`)
    .join('');
  return `
  <h2 class="section">Befunde je Unterseite</h2>
  <table class="pages-table">
    <thead><tr><th>Seite</th><th>Titel</th><th>Befunde</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// F15: vollständige Fundstellenliste (kein Kappen mehr auf 3/5 Beispiele) als
// eigener Anhang — PDF-Länge ist unkritisch, ein stiller Verlust von Fundorten
// dagegen schon (der Kunde bezahlt für genau diese Liste).
function renderAppendix(sorted, infoFor) {
  if (!sorted.length) return '';
  const rows = sorted
    .map((v) => {
      const info = infoFor(v);
      const items = v.nodes
        .map((n) => {
          const pageTag = n._page ? ` <span class="ex-page">(${esc(n._page)})</span>` : '';
          return `<li><code>${esc(n.target.join(' '))}</code>${pageTag}</li>`;
        })
        .join('');
      return `<div class="appendix-rule"><h4>${esc(info.title)} (${v.nodes.length}&times;)</h4><ul class="appendix-list">${items}</ul></div>`;
    })
    .join('');
  return `
  <h2 class="section">Anhang: Vollständige Fundstellenliste</h2>
  <p>Alle automatisiert erkannten Fundstellen je Befund — ohne Kürzung, inkl. Seiten-Zuordnung bei Multi-Page-Scans.</p>
  ${rows}`;
}

// F1: Priorisierter Umsetzungsplan (nur Profi/Abo — siehe fulfill.js `plan`-Option).
// Wirkung = Impact-Gewicht × Fundstellenzahl (gedeckelt), grob in hoch/mittel/gering
// gebündelt. Ehrlich bleiben: automatisiert erstellte Priorisierung, KEINE Stunden-
// oder Kostenschätzung.
function planWirkung(v) {
  const raw = (IMPACT_WEIGHT[v.impact] ?? 2) * Math.min(v.nodes.length, 10);
  if (raw >= 30) return 'hoch';
  if (raw >= 10) return 'mittel';
  return 'gering';
}

const PLAN_PHASE_LABEL = {
  S: 'Phase 1 — Quick-Wins (geringer Aufwand)',
  M: 'Phase 2 — mittlerer Aufwand',
  L: 'Phase 3 — größerer Aufwand'
};
const PLAN_EFFORT_LABEL = { S: 'gering', M: 'mittel', L: 'hoch' };

function renderPlan(sorted, infoFor) {
  const phases = { S: [], M: [], L: [] };
  for (const v of sorted) {
    const info = infoFor(v);
    phases[info.effort].push({ v, info, wirkung: planWirkung(v) });
  }
  const wirkungOrder = { hoch: 0, mittel: 1, gering: 2 };
  for (const key of ['S', 'M', 'L']) {
    phases[key].sort((a, b) => wirkungOrder[a.wirkung] - wirkungOrder[b.wirkung]);
  }
  const body = ['S', 'M', 'L']
    .map((key) => {
      const items = phases[key];
      if (!items.length) return '';
      const rows = items
        .map(
          ({ v, info, wirkung }) =>
            `<li><span class="box">&#9744;</span><span><strong>${esc(info.title)}</strong> &mdash; Aufwand: ${PLAN_EFFORT_LABEL[key]}, Wirkung: ${wirkung} (${v.nodes.length}&times; betroffen)</span></li>`
        )
        .join('');
      return `<h3 class="plan-phase">${esc(PLAN_PHASE_LABEL[key])}</h3><ul class="checklist">${rows}</ul>`;
    })
    .join('');
  return `
  <h2 class="section">Priorisierter Umsetzungsplan</h2>
  <p>Automatisiert nach Aufwandsklasse und geschätzter Wirkung sortiert — eine Priorisierungshilfe für Ihre Entwickler, keine Stunden- oder Kostenschätzung.</p>
  ${body || '<p>Keine automatisiert erkannten Punkte für einen Umsetzungsplan.</p>'}`;
}

export function renderReport(
  scan,
  {
    company = '',
    logo = '',
    reportTitle = 'BFSG-Fix-Plan & Barrierefreiheits-Report',
    pruefnorm = 'WCAG 2.1 A/AA (EN 301 549)',
    introTitle = 'Was das BFSG für Sie bedeutet',
    introHtml = '<p>Das Barrierefreiheitsstärkungsgesetz (BFSG) ist seit dem 28.06.2025 in Kraft. Betroffene Unternehmen müssen ihre Websites und Online-Shops barrierefrei gestalten. Dieser Fix-Plan zeigt die konkreten technischen Mängel Ihrer Seite, nach Dringlichkeit priorisiert.</p>',
    legalHtml = '<strong>Wichtiger Hinweis:</strong> Dieser Fix-Plan ist eine automatisierte technische Erstprüfung auf Basis von axe-core (WCAG 2.1), KI-gestützt erstellt und vor Auslieferung menschlich geprüft. Er ist <strong>keine Rechtsberatung</strong> und keine Garantie für BFSG-Konformität. Automatisierte Tests erkennen erfahrungsgemäß rund 30&ndash;50&nbsp;% aller Barrieren; Aspekte wie Tastaturbedienung im Detail, Vorlese-Logik und Verständlichkeit erfordern eine manuelle Ergänzung. Für eine rechtsverbindliche Bewertung ziehen Sie bitte fachkundige Beratung hinzu.',
    diff = null,
    pagesScanned = null,
    // F2/F7: Pro-Seite-Aufschlüsselung (scan.pages von scanSite) — nur gesetzt bei
    // Multi-Page-Scans, rendert eine eigene Tabelle "Befunde je Unterseite".
    pages = null,
    // Score-Beschriftung + Verdikt-Text überschreibbar, damit der Cookie-Report ein
    // TDDDG-neutrales Label/Verdikt nutzen kann statt der BFSG-„konform"-Aussage (SF13).
    scoreLabel = 'Konformitäts-Score',
    verdictText = null,
    // Zusätzliche technische Hinweise (z. B. fehlerhaftes TLS-Zertifikat, nicht
    // erreichbare Unterseiten), die KEINE WCAG-Verstöße sind — eigener Abschnitt,
    // fließen NICHT in Score/Erklärung ein.
    notices = [],
    // PR4: optionale KI-QA-Overrides { falsePositiveIds[], findingOverrides[{id,why,fix}],
    // additionalNotices[{title,text,severity}] }. Default null = unverändertes Verhalten.
    qaOverrides = null,
    // F1: Profi-/Abo-Pakete bekommen einen priorisierten Umsetzungsplan zusätzlich
    // zur Checkliste (siehe fulfill.js PLAN_PACKAGES).
    plan = false
  } = {}
) {
  // PR4: KI-QA anwenden — False Positives rausfiltern (Score/Counts/Findings
  // laufen danach über die gefilterte Liste → konsistent zu statement.js),
  // generische why/fix je Regel-ID überschreiben, Zusatz-Hinweise anhängen.
  const fpIds = new Set(Array.isArray(qaOverrides?.falsePositiveIds) ? qaOverrides.falsePositiveIds : []);
  const overrideById = new Map(
    (Array.isArray(qaOverrides?.findingOverrides) ? qaOverrides.findingOverrides : []).map((o) => [o.id, o])
  );
  const effectiveViolations = fpIds.size
    ? scan.violations.filter((v) => !fpIds.has(v.id))
    : scan.violations;
  // ruleInfo() plus optionalem Override je Regel-ID (leere Override-Felder = Basis
  // behalten) + Aufwandsklasse (F1). effort kommt künftig aus rules-de.js
  // (ruleInfo().effort); bis dahin/bei unbekannter Regel greift der Fallback 'M'.
  const infoFor = (v) => {
    const base = ruleInfo(v);
    const ov = overrideById.get(v.id);
    return {
      title: base.title,
      why: (ov && ov.why) || base.why,
      fix: (ov && ov.fix) || base.fix,
      effort: ['S', 'M', 'L'].includes(base.effort) ? base.effort : 'M'
    };
  };
  const extraNotices = Array.isArray(qaOverrides?.additionalNotices) ? qaOverrides.additionalNotices : [];
  const allNotices = extraNotices.length ? [...notices, ...extraNotices] : notices;

  const { score, grade, verdict: gradeVerdict } = computeScore(effectiveViolations);
  const verdict = verdictText != null ? verdictText : gradeVerdict;
  const counts = countByImpact(effectiveViolations);
  const order = ['critical', 'serious', 'moderate', 'minor'];
  const sorted = [...effectiveViolations].sort(
    (a, b) => order.indexOf(a.impact) - order.indexOf(b.impact)
  );

  const findings = sorted
    .map((v, idx) => {
      const info = infoFor(v);
      // F6: nicht mehr in einem zugeklappten <details> verstecken (Chromium
      // rendert das im PDF geschlossen — die Fundorte waren praktisch unsichtbar).
      // F15: nur die ersten 5 offen zeigen, der Rest steht vollständig im Anhang.
      // F16: Code-Kontext (HTML-Snippet + failureSummary) je Beispiel mitgeben.
      const shown = v.nodes.slice(0, 5);
      const examples = shown
        .map((n) => {
          const pageTag = n._page ? `<div class="ex-page">Seite: ${esc(n._page)}</div>` : '';
          const htmlSnippet = n.html
            ? `<code class="ex-html">${esc(String(n.html).slice(0, 200))}</code>`
            : '';
          const failure = n.failureSummary ? `<div class="ex-fail">${esc(n.failureSummary)}</div>` : '';
          return `<div class="example"><code>${esc(n.target.join(' '))}</code>${pageTag}${htmlSnippet}${failure}</div>`;
        })
        .join('');
      const moreCount = v.nodes.length - shown.length;
      return `
      <div class="finding ${v.impact}">
        <div class="finding-head">
          <span class="rank">#${idx + 1}</span>
          <span class="badge ${v.impact}">${IMPACT_DE[v.impact] || v.impact}</span>
          <h3>${esc(info.title)}</h3>
          <span class="count">${v.nodes.length}&times; betroffen</span>
        </div>
        <p class="why"><strong>Warum kritisch:</strong> ${esc(info.why)}</p>
        <p class="fix"><strong>Lösung:</strong> ${esc(info.fix)}</p>
        <div class="examples-open">
          <div class="examples-label">Betroffene Stellen (Beispiele${moreCount > 0 ? `, ${shown.length} von ${v.nodes.length}` : ''}):</div>
          ${examples}
          ${moreCount > 0 ? `<div class="ex-more">… ${moreCount} weitere Stelle${moreCount === 1 ? '' : 'n'} in der vollständigen Fundstellenliste im Anhang.</div>` : ''}
        </div>
      </div>`;
    })
    .join('\n');

  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Diff-Block (nur im Re-Check-Abo gefüllt) — listet Veränderungen seit dem Vor-Scan.
  let diffHtml = '';
  if (diff && !diff.firstScan) {
    const delta = diff.score - diff.prevScore;
    const deltaSign = delta >= 0 ? '+' : '';
    const deltaCol = delta > 0 ? 'var(--ok)' : delta < 0 ? 'var(--crit)' : 'var(--mut)';
    const block = (title, items, cls) => items.length
      ? `<div class="diffcol"><h4 class="${cls}">${esc(title)} (${items.length})</h4><ul>${items.slice(0, 8).map((i) => `<li>${esc(i.title)}${i.before != null ? ' (' + i.before + ' &rarr; ' + i.after + ')' : ''}</li>`).join('')}${items.length > 8 ? `<li>… und ${items.length - 8} weitere</li>` : ''}</ul></div>`
      : '';
    diffHtml = `
    <div class="diffcard">
      <div class="diffhead">
        <h2>Veränderungen seit letztem Scan</h2>
        <span style="color:${deltaCol};font-weight:700">Score ${deltaSign}${delta}</span>
      </div>
      <div class="diffgrid">
        ${block('Behoben', diff.resolved, 'ok')}
        ${block('Neu', diff.newly, 'bad')}
        ${block('Veränderte Häufigkeit', diff.changed, 'mut')}
      </div>
      ${(!diff.resolved.length && !diff.newly.length && !diff.changed.length) ? '<p>Keine Veränderungen seit dem letzten Scan.</p>' : ''}
    </div>`;
  }

  // F3: IMMER rendern, sobald der Aufrufer eine Seitenzahl mitgibt (auch bei N=1) —
  // vorher wurde die Zeile bei genau 1 geprüfter Seite unterdrückt, wodurch ein
  // gescheiterter Multi-Page-Crawl (Profi-Kauf, aber nur Startseite erreichbar)
  // für den Kunden unsichtbar blieb.
  const pagesHtml = pagesScanned != null
    ? `<div class="sub">Geprüfte Unterseiten: ${pagesScanned}</div>`
    : '';
  const pagesTableHtml = renderPagesTable(pages);
  const planHtml = plan ? renderPlan(sorted, infoFor) : '';
  const appendixHtml = renderAppendix(sorted, infoFor);

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>BFSG-Barrierefreiheits-Report${company ? ' — ' + esc(company) : ''}</title>
<style>
  :root{--ink:#0f172a;--mut:#64748b;--line:#e2e8f0;--crit:#dc2626;--ser:#c2410c;--mod:#854d0e;--min:#155e75;--ok:#16a34a;--accent:#f4641e;}
  *{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--ink);margin:0;line-height:1.55;font-size:15px}
  .wrap{max-width:860px;margin:0 auto;padding:48px 40px}
  header.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid var(--accent);padding-bottom:20px;margin-bottom:8px}
  h1{font-size:26px;margin:0 0 4px}
  .sub{color:var(--mut);font-size:14px}
  .scorecard{display:flex;gap:24px;align-items:center;background:#f8fafc;border:1px solid var(--line);border-radius:14px;padding:24px;margin:28px 0}
  .grade{font-size:64px;font-weight:800;line-height:1;width:120px;text-align:center}
  .grade.A,.grade.B{color:var(--ok)} .grade.C{color:var(--ser)} .grade.D{color:var(--crit)}
  .scoremeta h2{margin:0 0 6px;font-size:20px}
  .scoremeta p{margin:0;color:var(--mut)}
  .kpis{display:flex;gap:12px;margin:20px 0 8px;flex-wrap:wrap}
  .kpi{flex:1;min-width:120px;border:1px solid var(--line);border-radius:10px;padding:14px;text-align:center}
  .kpi b{display:block;font-size:24px}
  .kpi.critical b{color:var(--crit)} .kpi.serious b{color:var(--ser)} .kpi.moderate b{color:var(--mod)} .kpi.minor b{color:var(--min)}
  .kpi span{font-size:12px;color:var(--mut)}
  h2.section{margin:36px 0 14px;font-size:19px;border-left:4px solid var(--accent);padding-left:10px}
  h3.plan-phase{margin:20px 0 8px;font-size:15px;color:var(--accent)}
  .finding{border:1px solid var(--line);border-left-width:5px;border-radius:10px;padding:16px 18px;margin:12px 0}
  .finding.critical{border-left-color:var(--crit)} .finding.serious{border-left-color:var(--ser)}
  .finding.moderate{border-left-color:var(--mod)} .finding.minor{border-left-color:var(--min)}
  .finding-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .finding-head h3{margin:0;font-size:16px;flex:1}
  .rank{color:var(--mut);font-weight:700}
  .badge{font-size:11px;font-weight:700;color:#fff;border-radius:20px;padding:3px 10px}
  .badge.critical{background:var(--crit)} .badge.serious{background:var(--ser)} .badge.moderate{background:var(--mod)} .badge.minor{background:var(--min)}
  .count{font-size:12px;color:var(--mut)}
  .why,.fix{margin:8px 0 0;font-size:14px} .fix{color:#065f46}
  code{background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:12px}
  .examples-open{margin-top:10px;font-size:13px;color:var(--mut)}
  .examples-label{font-weight:600;color:var(--ink);margin-bottom:4px}
  .example{margin:0 0 8px;padding-bottom:6px;border-bottom:1px dashed var(--line)}
  .example:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
  .ex-page{font-size:11px;color:var(--mut);margin-top:2px}
  .ex-html{display:block;margin-top:3px;white-space:pre-wrap;word-break:break-all}
  .ex-fail{font-size:12px;color:var(--mut);margin-top:2px}
  .ex-more{font-size:12px;color:var(--mut);margin-top:4px;font-style:italic}
  .pages-table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0 20px}
  .pages-table th,.pages-table td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left}
  .pages-table th{color:var(--mut);font-weight:600;font-size:12px}
  .appendix-rule{margin:14px 0}
  .appendix-rule h4{margin:0 0 4px;font-size:13px}
  .appendix-list{margin:0;padding-left:18px;font-size:12px;color:var(--mut)}
  .appendix-list li{margin-bottom:2px}
  .checklist{list-style:none;padding:0;margin:10px 0}
  .checklist li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line);font-size:14px}
  .checklist .box{font-size:18px;line-height:1.2;color:var(--accent)}
  .legalbox{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 18px;margin:28px 0;font-size:13px}
  footer{margin-top:40px;padding-top:18px;border-top:1px solid var(--line);font-size:12px;color:var(--mut)}
  .diffcard{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 20px;margin:24px 0}
  .diffhead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
  .diffhead h2{margin:0;font-size:17px}
  .diffgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
  .diffcol h4{margin:0 0 6px;font-size:14px}
  .diffcol h4.ok{color:var(--ok)} .diffcol h4.bad{color:var(--crit)} .diffcol h4.mut{color:var(--mut)}
  .diffcol ul{margin:0;padding-left:18px;font-size:13px;color:var(--mut)}
  /* D3: Karten/Zeilen nicht mitten im PDF-Seitenumbruch zerreißen. */
  .finding,.diffcard,.legalbox,.kpi,.scorecard,.checklist li,.appendix-rule{break-inside:avoid;page-break-inside:avoid}
  h2.section{break-after:avoid}
  @media print{.wrap{padding:24px}}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div>
      <h1>${esc(reportTitle)}</h1>
      <div class="sub">${company ? '<strong>' + esc(company) + '</strong> &middot; ' : ''}${esc(scan.url)}</div>
      <div class="sub">Erstellt am ${today} &middot; Prüfnorm: ${esc(pruefnorm)}</div>
      ${pagesHtml}
    </div>
    ${logo ? `<img src="${esc(logo)}" alt="" style="max-height:48px">` : ''}
  </header>

  ${diffHtml}

  <div class="scorecard">
    <div class="grade ${grade}">${grade}</div>
    <div class="scoremeta">
      <h2>${esc(scoreLabel)}: ${score}/100</h2>
      <p>${esc(verdict)}</p>
    </div>
  </div>

  <div class="kpis">
    <div class="kpi critical"><b>${counts.critical}</b><span>Kritisch</span></div>
    <div class="kpi serious"><b>${counts.serious}</b><span>Schwerwiegend</span></div>
    <div class="kpi moderate"><b>${counts.moderate}</b><span>Mittel</span></div>
    <div class="kpi minor"><b>${counts.minor}</b><span>Gering</span></div>
    <div class="kpi"><b>${scan.passes}</b><span>Bestandene Prüfungen</span></div>
  </div>

  ${pagesTableHtml}

  <h2 class="section">${esc(introTitle)}</h2>
  ${introHtml}

  <h2 class="section">Befunde nach Dringlichkeit (${effectiveViolations.length})</h2>
  ${findings || '<p>Keine automatisiert erkennbaren Verstöße gefunden. Eine manuelle Prüfung wird dennoch empfohlen.</p>'}

  <h2 class="section">Umsetzungs-Checkliste (zum Abarbeiten)</h2>
  <p>Diese Punkte können Ihre Entwickler direkt abarbeiten — nach Dringlichkeit sortiert.</p>
  <ul class="checklist">
  ${
    sorted.length
      ? sorted
          .map((v) => {
            const info = infoFor(v);
            return `<li><span class="box">&#9744;</span><span><strong>${esc(info.title)}</strong> (${v.nodes.length}&times;, ${IMPACT_DE[v.impact] || v.impact}) &mdash; ${esc(info.fix)}</span></li>`;
          })
          .join('\n')
      : '<li>Keine automatisiert erkannten Punkte. Manuelle Prüfung empfohlen.</li>'
  }
  </ul>

  ${planHtml}

  ${allNotices && allNotices.length ? `
  <h2 class="section">Weitere technische Hinweise</h2>
  ${allNotices.map((n) => `
      <div class="finding ${n.severity || 'moderate'}">
        <div class="finding-head">
          <span class="badge ${n.severity || 'moderate'}">Hinweis</span>
          <h3>${esc(n.title)}</h3>
        </div>
        <p class="why">${esc(n.text)}</p>
      </div>`).join('\n')}
  ` : ''}

  <div class="legalbox">${legalHtml}</div>

  ${appendixHtml}

  <footer>
    BFSG-Fuchs &middot; bfsg-fix.de &middot; info@bfsg-fix.de &middot; Anbieter: Matthias Seba<br>
    Bestandene Prüfungen: ${scan.passes} &middot; Unklare Punkte (manuell prüfen): ${scan.incomplete}
  </footer>
</div>
</body>
</html>`;
}

// Kurzversion fuer den kostenlosen Teil-Scan (Lead-Magnet auf der Landingpage).
export function renderTeaser(scan) {
  const { score, grade, verdict } = computeScore(scan.violations);
  const counts = countByImpact(scan.violations);
  return {
    url: scan.url,
    score,
    grade,
    verdict,
    counts,
    totalIssues: scan.violations.length,
    topIssues: scan.violations
      .sort(
        (a, b) =>
          (IMPACT_WEIGHT[b.impact] || 0) - (IMPACT_WEIGHT[a.impact] || 0)
      )
      .slice(0, 3)
      .map((v) => ruleInfo(v).title)
  };
}
