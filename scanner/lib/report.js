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
  const score = Math.max(0, Math.round(100 - penalty));
  let grade, verdict;
  if (score >= 90) {
    grade = 'A';
    verdict = 'Weitgehend konform — nur Feinschliff noetig.';
  } else if (score >= 75) {
    grade = 'B';
    verdict = 'Solide Basis, aber relevante Luecken mit Handlungsbedarf.';
  } else if (score >= 50) {
    grade = 'C';
    verdict = 'Deutliche Maengel — Handlungsbedarf.';
  } else {
    grade = 'D';
    verdict = 'Kritisch — viele Maengel, dringender Handlungsbedarf.';
  }
  return { score, grade, verdict };
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

export function renderReport(
  scan,
  {
    company = '',
    logo = '',
    reportTitle = 'BFSG-Fix-Plan & Barrierefreiheits-Report',
    pruefnorm = 'WCAG 2.1 A/AA (EN 301 549)',
    introTitle = 'Was das BFSG fuer Sie bedeutet',
    introHtml = '<p>Das Barrierefreiheitsstaerkungsgesetz (BFSG) ist seit dem 28.06.2025 in Kraft. Betroffene Unternehmen muessen ihre Websites und Online-Shops barrierefrei gestalten. Dieser Fix-Plan zeigt die konkreten technischen Maengel Ihrer Seite, nach Dringlichkeit priorisiert.</p>',
    legalHtml = '<strong>Wichtiger Hinweis:</strong> Dieser Fix-Plan ist eine automatisierte technische Erstpruefung auf Basis von axe-core (WCAG 2.1), KI-gestuetzt erstellt und vor Auslieferung menschlich geprueft. Er ist <strong>keine Rechtsberatung</strong> und keine Garantie fuer BFSG-Konformitaet. Automatisierte Tests erkennen erfahrungsgemaess rund 30&ndash;50&nbsp;% aller Barrieren; Aspekte wie Tastaturbedienung im Detail, Vorlese-Logik und Verstaendlichkeit erfordern eine manuelle Ergaenzung. Fuer eine rechtsverbindliche Bewertung ziehen Sie bitte fachkundige Beratung hinzu.'
  } = {}
) {
  const { score, grade, verdict } = computeScore(scan.violations);
  const counts = countByImpact(scan.violations);
  const order = ['critical', 'serious', 'moderate', 'minor'];
  const sorted = [...scan.violations].sort(
    (a, b) => order.indexOf(a.impact) - order.indexOf(b.impact)
  );

  const findings = sorted
    .map((v, idx) => {
      const info = ruleInfo(v);
      const examples = v.nodes
        .slice(0, 3)
        .map((n) => `<code>${esc(n.target.join(' '))}</code>`)
        .join('<br>');
      return `
      <div class="finding ${v.impact}">
        <div class="finding-head">
          <span class="rank">#${idx + 1}</span>
          <span class="badge ${v.impact}">${IMPACT_DE[v.impact] || v.impact}</span>
          <h3>${esc(info.title)}</h3>
          <span class="count">${v.nodes.length}&times; betroffen</span>
        </div>
        <p class="why"><strong>Warum kritisch:</strong> ${esc(info.why)}</p>
        <p class="fix"><strong>Loesung:</strong> ${esc(info.fix)}</p>
        <details><summary>Betroffene Stellen (Beispiele)</summary>${examples}</details>
      </div>`;
    })
    .join('\n');

  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>BFSG-Barrierefreiheits-Report${company ? ' — ' + esc(company) : ''}</title>
<style>
  :root{--ink:#0f172a;--mut:#64748b;--line:#e2e8f0;--crit:#dc2626;--ser:#ea580c;--mod:#ca8a04;--min:#0891b2;--ok:#16a34a;--accent:#1d4ed8;}
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
  details{margin-top:8px;font-size:13px;color:var(--mut)} code{background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:12px}
  .checklist{list-style:none;padding:0;margin:10px 0}
  .checklist li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line);font-size:14px}
  .checklist .box{font-size:18px;line-height:1.2;color:var(--accent)}
  .legalbox{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 18px;margin:28px 0;font-size:13px}
  footer{margin-top:40px;padding-top:18px;border-top:1px solid var(--line);font-size:12px;color:var(--mut)}
  @media print{.wrap{padding:24px}}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div>
      <h1>${esc(reportTitle)}</h1>
      <div class="sub">${company ? '<strong>' + esc(company) + '</strong> &middot; ' : ''}${esc(scan.url)}</div>
      <div class="sub">Erstellt am ${today} &middot; Pruefnorm: ${esc(pruefnorm)}</div>
    </div>
    ${logo ? `<img src="${esc(logo)}" alt="" style="max-height:48px">` : ''}
  </header>

  <div class="scorecard">
    <div class="grade ${grade}">${grade}</div>
    <div class="scoremeta">
      <h2>Konformitaets-Score: ${score}/100</h2>
      <p>${esc(verdict)}</p>
    </div>
  </div>

  <div class="kpis">
    <div class="kpi critical"><b>${counts.critical}</b><span>Kritisch</span></div>
    <div class="kpi serious"><b>${counts.serious}</b><span>Schwerwiegend</span></div>
    <div class="kpi moderate"><b>${counts.moderate}</b><span>Mittel</span></div>
    <div class="kpi minor"><b>${counts.minor}</b><span>Gering</span></div>
    <div class="kpi"><b>${scan.passes}</b><span>Bestandene Pruefungen</span></div>
  </div>

  <h2 class="section">${esc(introTitle)}</h2>
  ${introHtml}

  <h2 class="section">Befunde nach Dringlichkeit (${scan.violations.length})</h2>
  ${findings || '<p>Keine automatisiert erkennbaren Verstoesse gefunden. Eine manuelle Pruefung wird dennoch empfohlen.</p>'}

  <h2 class="section">Umsetzungs-Checkliste (zum Abarbeiten)</h2>
  <p>Diese Punkte koennen Ihre Entwickler direkt abarbeiten — nach Dringlichkeit sortiert.</p>
  <ul class="checklist">
  ${
    sorted.length
      ? sorted
          .map((v) => {
            const info = ruleInfo(v);
            return `<li><span class="box">&#9744;</span><span><strong>${esc(info.title)}</strong> (${v.nodes.length}&times;, ${IMPACT_DE[v.impact] || v.impact}) &mdash; ${esc(info.fix)}</span></li>`;
          })
          .join('\n')
      : '<li>Keine automatisiert erkannten Punkte. Manuelle Pruefung empfohlen.</li>'
  }
  </ul>

  <div class="legalbox">${legalHtml}</div>

  <footer>
    BFSG-Audit &middot; Automatisierte Barrierefreiheits-Pruefung &middot;
    Bestandene Pruefungen: ${scan.passes} &middot; Unklare Punkte (manuell pruefen): ${scan.incomplete}
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
