// Wandelt das Scan-Ergebnis in einen verkaufsfertigen HTML-Report (deutsch).
// Aus dem HTML laesst sich per Playwright/Chromium direkt ein PDF drucken.

import { ruleInfo, IMPACT_WEIGHT, IMPACT_DE, CATEGORY_ORDER } from './rules-de.js';

// Domain-SSOT: Marke/Domain auf Cover und Footer des Kunden-Reports.
// Default = Marken-Primär bfsg-fuchs.de (Kontakt-E-Mail bleibt info@bfsg-fix.de,
// das Postfach @bfsg-fuchs.de existiert noch nicht).
const PUBLIC_HOST = (process.env.PUBLIC_URL || 'https://bfsg-fuchs.de')
  .replace(/^https?:\/\//, '').replace(/\/+$/, '');

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

// URL-/ID-sicherer Anker-Slug (fuer TOC-Sprungmarken je Kategorie). Deutsche
// Umlaute werden transliteriert statt entfernt, damit unterschiedliche
// Kategorien nicht auf denselben Slug kollabieren.
function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function countByImpact(violations) {
  const c = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const v of violations) c[v.impact] = (c[v.impact] || 0) + 1;
  return c;
}

// Kurze Themen-Beschreibung je Kategorie (Report-Präsentation, nicht Teil der
// Regel-Fachdaten in rules-de.js).
const CATEGORY_DESC = {
  'Bilder & Medien': 'Alternativtexte und Medieninhalte, die Screenreader nicht erreichen.',
  'Formulare & Eingabe': 'Eingabefelder und Formularsteuerung ohne eindeutige Beschriftung.',
  'Farbe, Kontrast & Darstellung': 'Kontraste, Zoom und visuelle Darstellung, die Sehbehinderte ausschließen.',
  'Links, Schaltflächen & Bedienelemente': 'Bedienelemente ohne erkennbaren Zweck für Tastatur und Screenreader.',
  'Struktur & Navigation': 'Seitenstruktur und Navigation, die die Orientierung erschwert.',
  'ARIA & Technik': 'Technische ARIA-Auszeichnung, die assistive Technik falsch interpretiert.',
  'Tabellen': 'Tabellenstruktur, die beim Vorlesen zu falscher Spalten-/Zeilenzuordnung führt.',
  'Cookies & Tracking': 'Tracker und Cookies, die vor einer aktiven Einwilligung geladen werden.',
  'Weitere Befunde': 'Automatisiert erkannte Verstöße ohne feste Kategoriezuordnung.'
};

// Gruppiert eine bereits nach Dringlichkeit sortierte Violations-Liste nach
// Themen-Kategorie (F3-Feedback: "alle Mängel unter der Kategorie", keine
// Top-N-Kappung). Die Sortierung je Kategorie bleibt erhalten (stabiler Filter).
function groupByCategory(sortedViolations, infoFor) {
  const buckets = new Map();
  for (const v of sortedViolations) {
    const info = infoFor(v);
    const cat = info.category || 'Weitere Befunde';
    if (!buckets.has(cat)) buckets.set(cat, []);
    buckets.get(cat).push({ v, info });
  }
  const ordered = [];
  for (const cat of CATEGORY_ORDER) {
    if (buckets.has(cat)) {
      ordered.push({ category: cat, items: buckets.get(cat) });
      buckets.delete(cat);
    }
  }
  // Defensiv: Kategorien außerhalb der kanonischen Reihenfolge (sollte bei
  // vollständiger rules-de.js-Abdeckung nicht vorkommen) hängen ans Ende.
  for (const [cat, items] of buckets) ordered.push({ category: cat, items });
  return ordered;
}

// F15/F6/F16: vollständige Fundstellenliste DIREKT unter dem jeweiligen Befund
// (kein separater Anhang mehr, s. Owner-Feedback #3). Die ersten DETAIL_LIMIT
// Stellen zeigen Seite + HTML-Kontext + Fehlermeldung; alle weiteren werden
// kompakt als Selektor-Chips gruppiert — vollständig, aber lesbar (Feedback #2).
const DETAIL_LIMIT = 5;

function renderExamples(nodes) {
  const shown = nodes.slice(0, DETAIL_LIMIT);
  const rest = nodes.slice(DETAIL_LIMIT);
  const detailed = shown
    .map((n) => {
      const pageTag = n._page ? `<div class="ex-page">Seite: ${esc(n._page)}</div>` : '';
      const htmlSnippet = n.html
        ? `<code class="ex-html">${esc(String(n.html).slice(0, 200))}</code>`
        : '';
      const failure = n.failureSummary ? `<div class="ex-fail">${esc(n.failureSummary)}</div>` : '';
      return `<div class="example"><code>${esc(n.target.join(' '))}</code>${pageTag}${htmlSnippet}${failure}</div>`;
    })
    .join('');
  let restHtml = '';
  if (rest.length) {
    const chips = rest
      .map((n) => {
        const pageTag = n._page ? ` <span class="ex-page-inline">(${esc(n._page)})</span>` : '';
        return `<span class="ex-chip"><code>${esc(n.target.join(' '))}</code>${pageTag}</span>`;
      })
      .join('');
    restHtml = `<div class="ex-more"><div class="ex-more-label">+ ${rest.length} weitere ${rest.length === 1 ? 'Stelle' : 'Stellen'} (alle Selektoren, ohne Kürzung):</div><div class="ex-more-list">${chips}</div></div>`;
  }
  return `<div class="examples-open"><div class="examples-label">Fundstellen (${nodes.length}):</div>${detailed}${restHtml}</div>`;
}

// F2/F7: Tabelle "Befunde je Unterseite" — nur bei tatsächlichem Multi-Page-Scan
// (scan.pages von scanSite) sinnvoll; bei 0/1 Seite entfällt sie (redundant zur
// "Geprüfte Unterseiten"-Zeile im Deckblatt).
function renderPagesTable(pages) {
  if (!Array.isArray(pages) || pages.length < 2) return '';
  const rows = pages
    .map((p) => `<tr><td>${esc(p.url)}</td><td>${esc(p.title || '—')}</td><td>${p.violationCount}</td></tr>`)
    .join('');
  return `
  <section id="seiten-uebersicht">
  <h2 class="section">Befunde je Unterseite</h2>
  <table class="pages-table">
    <thead><tr><th>Seite</th><th>Titel</th><th>Befunde</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  </section>`;
}

// F1: Priorisierter Umsetzungsplan (nur Profi/Abo — siehe fulfill.js `plan`-Option).
// Wirkung = Impact-Gewicht × Fundstellenzahl (gedeckelt), grob in hoch/mittel/gering
// gebündelt. Ehrlich bleiben: automatisiert erstellte Priorisierung, KEINE Stunden-
// oder Kostenschätzung. Die ausführliche Handlungsanleitung je Befund steht bereits
// in der Umsetzungs-Checkliste — der Plan ist bewusst die knappe Reihenfolge dazu.
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
      return `<h3 class="plan-phase">${esc(PLAN_PHASE_LABEL[key])}</h3><ul class="plan-list">${rows}</ul>`;
    })
    .join('');
  return `
  <section id="plan">
  <h2 class="section">Priorisierter Umsetzungsplan</h2>
  <p>Automatisiert nach Aufwandsklasse und geschätzter Wirkung sortiert — eine Priorisierungshilfe für Ihre Entwickler, keine Stunden- oder Kostenschätzung. Die konkrete Handlungsanleitung je Befund steht in der Umsetzungs-Checkliste.</p>
  ${body || '<p>Keine automatisiert erkannten Punkte für einen Umsetzungsplan.</p>'}
  </section>`;
}

// F4: Umsetzungs-Checkliste — ausführlich statt einer schlichten Aufzählung
// (Owner-Feedback #4): pro Punkt Priorität (aus dem axe-Impact), grobe
// Aufwandsklasse, WCAG-/Norm-Referenz und die konkrete Handlungsanleitung.
const PRIORITY_LABEL = { critical: 'Hoch', serious: 'Hoch', moderate: 'Mittel', minor: 'Niedrig' };
const PRIORITY_CLASS = { Hoch: 'prio-hoch', Mittel: 'prio-mittel', Niedrig: 'prio-niedrig' };
const EFFORT_LABEL_CAP = { S: 'Gering', M: 'Mittel', L: 'Hoch' };

// Label vor der Begründung je Befund, abhängig vom axe-Impact (QA-Fix: vorher
// stand statisch "Warum kritisch:" auch bei Mittel/Gering-Befunden — wirkte
// inkonsistent, siehe renderCategorySections).
const WHY_LABEL = {
  critical: 'Warum kritisch',
  serious: 'Warum schwerwiegend',
  moderate: 'Warum relevant',
  minor: 'Warum relevant'
};

function renderChecklist(sorted, infoFor) {
  if (!sorted.length) {
    return '<p>Keine automatisiert erkannten Punkte. Manuelle Prüfung empfohlen.</p>';
  }
  return sorted
    .map((v) => {
      const info = infoFor(v);
      const prio = PRIORITY_LABEL[v.impact] || 'Mittel';
      const prioCls = PRIORITY_CLASS[prio] || 'prio-mittel';
      return `
      <div class="check-item ${prioCls}">
        <div class="check-top">
          <span class="box">&#9744;</span>
          <h4>${esc(info.title)}</h4>
          <span class="pill ${prioCls}">Priorität: ${esc(prio)}</span>
        </div>
        <div class="check-meta">
          <span class="chip">Aufwand: ${esc(EFFORT_LABEL_CAP[info.effort] || 'Mittel')}</span>
          <span class="chip">Norm: ${esc(info.norm)}</span>
          <span class="chip">${v.nodes.length}&times; betroffen</span>
        </div>
        <p class="check-action"><strong>Was zu tun ist:</strong> ${esc(info.fix)}</p>
      </div>`;
    })
    .join('\n');
}

// F3: Befunde vollständig nach Kategorie gegliedert (kein "Top-N + Rest im
// Anhang" mehr). Jede Kategorie zeigt ALLE ihre Befunde inkl. aller Fundstellen.
function renderCategorySections(categoryGroups) {
  if (!categoryGroups.length) {
    return '<p>Keine automatisiert erkennbaren Verstöße gefunden. Eine manuelle Prüfung wird dennoch empfohlen.</p>';
  }
  return categoryGroups
    .map(({ category, items }) => {
      const desc = CATEGORY_DESC[category];
      const findingsHtml = items
        .map(({ v, info }) => `
      <div class="finding ${v.impact}">
        <div class="finding-head">
          <span class="badge ${v.impact}">${IMPACT_DE[v.impact] || v.impact}</span>
          <h4>${esc(info.title)}</h4>
          <span class="count">${v.nodes.length}&times; betroffen</span>
        </div>
        <div class="finding-meta"><span class="chip">Norm: ${esc(info.norm)}</span></div>
        <p class="why"><strong>${esc(WHY_LABEL[v.impact] || 'Warum relevant')}:</strong> ${esc(info.why)}</p>
        <p class="fix"><strong>Lösung:</strong> ${esc(info.fix)}</p>
        ${renderExamples(v.nodes)}
      </div>`)
        .join('\n');
      return `
      <div class="category" id="cat-${slug(category)}">
        <div class="category-head">
          <h3 class="cat-title">${esc(category)}</h3>
          <span class="cat-count">${items.length} ${items.length === 1 ? 'Befund' : 'Befunde'}</span>
        </div>
        ${desc ? `<p class="cat-desc">${esc(desc)}</p>` : ''}
        ${findingsHtml}
      </div>`;
    })
    .join('\n');
}

// Deckblatt-Score-Ring (SVG, statisch — kein Animations-Bedarf im PDF). Ring-
// Geometrie angelehnt an die Hero-Section (ScoreDonut.tsx), als Designrichtung
// für den Score-Bereich (Owner-Feedback #5).
function scoreRing(score, grade) {
  const size = 168;
  const stroke = 12;
  const r = (size - stroke) / 2 - 4;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference * (1 - clamped / 100);
  return `
  <div class="score-ring" style="width:${size}px;height:${size}px" aria-hidden="true">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,122,26,0.18)" stroke-width="${stroke}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#ff7a1a" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
        transform="rotate(-90 ${size / 2} ${size / 2})" />
    </svg>
    <div class="score-ring-inner">
      <span class="score-num">${clamped}</span>
      <span class="score-of">/ 100</span>
      <span class="score-grade ${grade}">Note ${grade}</span>
    </div>
  </div>`;
}

// Inhaltsübersicht: dynamisch aus den Abschnitten gebaut, die tatsächlich
// gerendert werden (Diff/Plan/Hinweise sind bedingt). Kategorien erscheinen
// als Unterpunkte unter "Befunde nach Kategorie".
function renderToc(entries) {
  const rows = entries
    .map((e) => {
      const sub = e.sub && e.sub.length
        ? `<ul class="toc-sub">${e.sub.map((s) => `<li><a href="#${s.href}">${esc(s.label)}</a></li>`).join('')}</ul>`
        : '';
      return `<li class="toc-row"><a href="#${e.href}">${esc(e.label)}</a></li>${sub}`;
    })
    .join('');
  return `<ol class="toc-list">${rows}</ol>`;
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
  // behalten) + Aufwandsklasse/Kategorie/Norm (F1/F3/F4).
  const infoFor = (v) => {
    const base = ruleInfo(v);
    const ov = overrideById.get(v.id);
    return {
      title: base.title,
      why: (ov && ov.why) || base.why,
      fix: (ov && ov.fix) || base.fix,
      effort: ['S', 'M', 'L'].includes(base.effort) ? base.effort : 'M',
      category: base.category || 'Weitere Befunde',
      norm: base.norm || 'Nicht klassifiziert'
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
  const categoryGroups = groupByCategory(sorted, infoFor);

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
    <div class="diffcard" id="aenderungen">
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

  const pagesTableHtml = renderPagesTable(pages);
  const planHtml = plan ? renderPlan(sorted, infoFor) : '';
  const categorySectionsHtml = renderCategorySections(categoryGroups);
  const checklistHtml = renderChecklist(sorted, infoFor);

  // Inhaltsübersicht: nur Abschnitte listen, die tatsächlich gerendert werden.
  const tocEntries = [
    { href: 'einleitung', label: introTitle },
    ...(diffHtml ? [{ href: 'aenderungen', label: 'Veränderungen seit letztem Scan' }] : []),
    ...(pagesTableHtml ? [{ href: 'seiten-uebersicht', label: 'Befunde je Unterseite' }] : []),
    {
      href: 'befunde',
      label: `Befunde nach Kategorie (${effectiveViolations.length})`,
      sub: categoryGroups.map((g) => ({ href: `cat-${slug(g.category)}`, label: `${g.category} (${g.items.length})` }))
    },
    { href: 'checkliste', label: 'Umsetzungs-Checkliste' },
    ...(plan ? [{ href: 'plan', label: 'Priorisierter Umsetzungsplan' }] : []),
    ...(allNotices && allNotices.length ? [{ href: 'hinweise', label: 'Weitere technische Hinweise' }] : []),
    { href: 'rechtliches', label: 'Rechtlicher Hinweis' }
  ];

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
  a{color:inherit}
  h2.section{margin:36px 0 14px;font-size:19px;border-left:4px solid var(--accent);padding-left:10px;break-after:avoid}
  h3.plan-phase{margin:20px 0 8px;font-size:15px;color:var(--accent)}

  /* ===== Deckblatt (Dark-Glow-Designrichtung, angelehnt an die Hero-Section) =====
     .cover-page ist eine eigene Druckseite (break-after:page) und zentriert die
     Karte vertikal statt sie auf eine geschätzte Px-/vh-Höhe zu strecken — vh
     bezieht sich beim Playwright-PDF-Druck auf den Browser-Viewport, nicht auf
     das tatsächliche A4-Zielformat, ein exaktes Vollflächen-Fuellen ist damit
     nicht zuverlässig steuerbar. Zentrierte Karte + gleichmäßiger Rand liest
     sich als bewusste Gestaltung statt als abgeschnittenes/leeres Deckblatt. */
  .cover-page{min-height:100vh;display:flex;align-items:center;justify-content:center;break-after:page;page-break-after:always;padding:24px 0}
  .cover{
    width:100%;
    max-width:860px;
    margin:0 auto;
    background:
      radial-gradient(ellipse 120% 55% at 12% -12%, rgba(255,122,26,0.18), transparent 55%),
      radial-gradient(ellipse 90% 50% at 105% 0%, rgba(245,177,61,0.12), transparent 55%),
      linear-gradient(160deg,#0b0908 0%,#050506 65%);
    color:#f5f2ee;
    border-radius:22px;
    padding:40px 40px 32px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    gap:22px;
  }
  .cover-top{display:flex;align-items:center;gap:16px}
  .cover-logo{height:104px;width:auto;display:block}
  .cover-brand{font-size:15px;font-weight:700;letter-spacing:.02em;color:#ffb066}
  .cover-title{font-size:29px;font-weight:800;letter-spacing:-.01em;margin:6px 0 0;color:#f5f2ee}
  .cover-subtitle{font-size:14px;color:#d8cfc6;margin:2px 0 0;word-break:break-word}
  .cover-meta{display:grid;gap:7px;font-size:13px;color:#cdc2b8;border-top:1px solid rgba(255,176,102,0.16);border-bottom:1px solid rgba(255,176,102,0.16);padding:14px 0}
  .cover-score{display:flex;align-items:center;gap:26px;margin-top:2px;flex-wrap:wrap}
  .score-ring{position:relative;flex-shrink:0}
  .score-ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .score-num{font-size:38px;font-weight:800;color:#f5f2ee;line-height:1;font-variant-numeric:tabular-nums}
  .score-of{font-size:12px;color:#b3a99f;margin-top:2px}
  .score-grade{margin-top:7px;font-size:11px;font-weight:700;border:1px solid rgba(255,176,102,0.35);border-radius:20px;padding:2px 10px}
  .score-grade.A,.score-grade.B{color:#34d99a;border-color:rgba(52,217,154,0.4)}
  .score-grade.C{color:#f5b13d;border-color:rgba(245,177,61,0.4)}
  .score-grade.D{color:#ff8a80;border-color:rgba(248,85,75,0.4)}
  .cover-score-text{flex:1;min-width:220px}
  .cover-score-line{font-size:17px;font-weight:700;color:#f5f2ee;margin:0 0 6px}
  .cover-verdict{font-size:13.5px;color:#d8cfc6;margin:0}
  .cover-kpis{display:flex;gap:10px;flex-wrap:wrap;margin-top:auto}
  .cover-kpi{flex:1;min-width:96px;background:rgba(255,255,255,0.045);border:1px solid rgba(255,176,102,0.14);border-radius:12px;padding:11px;text-align:center}
  .cover-kpi b{display:block;font-size:21px;font-weight:800}
  .cover-kpi span{font-size:10.5px;color:#b3a99f}
  .cover-kpi.crit b{color:#ff8a80}.cover-kpi.ser b{color:#ff9440}.cover-kpi.mod b{color:#f5b13d}.cover-kpi.min b{color:#7dd3fc}.cover-kpi.ok b{color:#34d99a}
  .cover-foot{font-size:11px;color:#8a8078;margin-top:2px}

  /* ===== Inhaltsübersicht ===== */
  .toc-page{break-after:page;page-break-after:always;min-height:200px}
  .toc-list{list-style:none;margin:18px 0 0;padding:0;counter-reset:toc}
  .toc-row{counter-increment:toc;padding:10px 0 4px;border-bottom:1px dashed var(--line);font-size:14px}
  .toc-row>a{font-weight:700;color:var(--ink);text-decoration:none}
  .toc-row>a::before{content:counter(toc) ". ";color:var(--accent)}
  .toc-sub{list-style:none;margin:4px 0 8px;padding:0 0 4px 20px}
  .toc-sub li{font-size:12.5px;color:var(--mut);padding:2px 0}
  .toc-sub a{color:var(--mut);text-decoration:none}

  /* ===== Score-KPI-Leiste (nur noch fuer den Diff-Bereich relevant) ===== */
  .kpi{border:1px solid var(--line);border-radius:10px;padding:14px;text-align:center}

  /* ===== Kategorien ===== */
  .category{margin:28px 0}
  .category-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;border-bottom:2px solid var(--accent);padding-bottom:6px;margin-bottom:2px;break-after:avoid}
  .cat-title{font-size:18px;margin:0}
  .cat-count{font-size:12px;color:var(--mut);white-space:nowrap}
  .cat-desc{color:var(--mut);font-size:13px;margin:6px 0 14px}

  /* ===== Einzelner Befund ===== */
  .finding{border:1px solid var(--line);border-left-width:5px;border-radius:10px;padding:16px 18px;margin:12px 0;break-inside:avoid;page-break-inside:avoid}
  .finding.critical{border-left-color:var(--crit)} .finding.serious{border-left-color:var(--ser)}
  .finding.moderate{border-left-color:var(--mod)} .finding.minor{border-left-color:var(--min)}
  .finding-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .finding-head h4{margin:0;font-size:16px;flex:1}
  .badge{font-size:11px;font-weight:700;color:#fff;border-radius:20px;padding:3px 10px}
  .badge.critical{background:var(--crit)} .badge.serious{background:var(--ser)} .badge.moderate{background:var(--mod)} .badge.minor{background:var(--min)}
  .count{font-size:12px;color:var(--mut)}
  .finding-meta{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 0}
  .chip{display:inline-block;font-size:11px;font-weight:600;color:var(--mut);background:#f1f5f9;border-radius:6px;padding:2px 8px}
  .why,.fix{margin:8px 0 0;font-size:14px} .fix{color:#065f46}
  code{background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:12px}
  .examples-open{margin-top:10px;font-size:13px;color:var(--mut)}
  .examples-label{font-weight:600;color:var(--ink);margin-bottom:4px}
  .example{margin:0 0 8px;padding-bottom:6px;border-bottom:1px dashed var(--line)}
  .example:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
  .ex-page{font-size:11px;color:var(--mut);margin-top:2px}
  .ex-html{display:block;margin-top:3px;white-space:pre-wrap;word-break:break-all}
  .ex-fail{font-size:12px;color:var(--mut);margin-top:2px}
  .ex-more{margin-top:8px;font-size:12px;color:var(--mut)}
  .ex-more-label{font-weight:600;color:var(--ink);margin-bottom:4px}
  .ex-more-list{display:flex;flex-wrap:wrap;gap:6px}
  .ex-chip{display:inline-flex;align-items:center;gap:4px;background:#f8fafc;border:1px solid var(--line);border-radius:6px;padding:2px 6px;font-size:11px}
  .ex-page-inline{color:var(--mut)}

  .pages-table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0 20px}
  .pages-table th,.pages-table td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left}
  .pages-table th{color:var(--mut);font-weight:600;font-size:12px}

  /* ===== Umsetzungs-Checkliste (ausführlich) ===== */
  .check-item{border:1px solid var(--line);border-left-width:5px;border-radius:10px;padding:14px 16px;margin:10px 0;break-inside:avoid;page-break-inside:avoid}
  .check-item.prio-hoch{border-left-color:var(--crit)}
  .check-item.prio-mittel{border-left-color:var(--mod)}
  .check-item.prio-niedrig{border-left-color:var(--min)}
  .check-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .check-top .box{font-size:18px;line-height:1.2;color:var(--accent)}
  .check-top h4{margin:0;font-size:15px;flex:1}
  .pill{font-size:11px;font-weight:700;border-radius:20px;padding:3px 10px;color:#fff;white-space:nowrap}
  .pill.prio-hoch{background:var(--crit)}
  .pill.prio-mittel{background:var(--mod)}
  .pill.prio-niedrig{background:var(--min)}
  .check-meta{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
  .check-action{margin:4px 0 0;font-size:13.5px}

  /* ===== Umsetzungsplan (knapp — Details stehen in der Checkliste) ===== */
  .plan-list{list-style:none;padding:0;margin:10px 0}
  .plan-list li{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line);font-size:13.5px;break-inside:avoid;page-break-inside:avoid}
  .plan-list .box{font-size:17px;line-height:1.2;color:var(--accent)}

  .legalbox{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 18px;margin:28px 0;font-size:13px;break-inside:avoid;page-break-inside:avoid}
  footer{margin-top:40px;padding-top:18px;border-top:1px solid var(--line);font-size:12px;color:var(--mut)}
  .diffcard{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 20px;margin:24px 0;break-inside:avoid;page-break-inside:avoid}
  .diffhead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
  .diffhead h2{margin:0;font-size:17px}
  .diffgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
  .diffcol h4{margin:0 0 6px;font-size:14px}
  .diffcol h4.ok{color:var(--ok)} .diffcol h4.bad{color:var(--crit)} .diffcol h4.mut{color:var(--mut)}
  .diffcol ul{margin:0;padding-left:18px;font-size:13px;color:var(--mut)}
  @media print{.wrap{padding:24px}}
</style>
</head>
<body>
  <div class="cover-page">
  <div class="cover">
    <div class="cover-top">
      ${logo ? `<img class="cover-logo" src="${esc(logo)}" alt="BFSG-Fuchs Logo">` : ''}
      <div class="cover-brand">BFSG-Fuchs</div>
    </div>
    <div>
      <h1 class="cover-title">${esc(reportTitle)}</h1>
      <p class="cover-subtitle">${company ? esc(company) + ' &middot; ' : ''}${esc(scan.url)}</p>
    </div>
    <div class="cover-meta">
      <div>Erstellt am: ${today}</div>
      <div>Prüfnorm: ${esc(pruefnorm)}</div>
      ${pagesScanned != null ? `<div>Geprüfte Unterseiten: ${pagesScanned}</div>` : ''}
    </div>
    <div class="cover-score">
      ${scoreRing(score, grade)}
      <div class="cover-score-text">
        <p class="cover-score-line">${esc(scoreLabel)}: ${score}/100</p>
        <p class="cover-verdict">${esc(verdict)}</p>
      </div>
    </div>
    <div class="cover-kpis">
      <div class="cover-kpi crit"><b>${counts.critical}</b><span>Kritisch</span></div>
      <div class="cover-kpi ser"><b>${counts.serious}</b><span>Schwerwiegend</span></div>
      <div class="cover-kpi mod"><b>${counts.moderate}</b><span>Mittel</span></div>
      <div class="cover-kpi min"><b>${counts.minor}</b><span>Gering</span></div>
      <div class="cover-kpi ok"><b>${scan.passes}</b><span>Bestandene Prüfungen</span></div>
    </div>
    <p class="cover-foot">${PUBLIC_HOST} &middot; automatisierte technische Analyse, keine Rechtsberatung</p>
  </div>
  </div>

<div class="wrap">

  <div class="toc-page">
    <h2 class="section">Inhaltsübersicht</h2>
    ${renderToc(tocEntries)}
  </div>

  <section id="einleitung">
  <h2 class="section">${esc(introTitle)}</h2>
  ${introHtml}
  </section>

  ${diffHtml}

  ${pagesTableHtml}

  <section id="befunde">
  <h2 class="section">Befunde nach Kategorie (${effectiveViolations.length})</h2>
  <p>Die folgenden Befunde sind nach Themenbereich gruppiert und je Kategorie vollständig aufgeführt, innerhalb einer Kategorie nach Dringlichkeit sortiert.</p>
  ${categorySectionsHtml}
  </section>

  <section id="checkliste">
  <h2 class="section">Umsetzungs-Checkliste (zum Abarbeiten)</h2>
  <p>Diese Punkte können Ihre Entwickler direkt abarbeiten — mit Priorität, grober Aufwandsklasse und der einschlägigen Norm je Befund.</p>
  ${checklistHtml}
  </section>

  ${planHtml}

  ${allNotices && allNotices.length ? `
  <section id="hinweise">
  <h2 class="section">Weitere technische Hinweise</h2>
  ${allNotices.map((n) => `
      <div class="finding ${n.severity || 'moderate'}">
        <div class="finding-head">
          <span class="badge ${n.severity || 'moderate'}">Hinweis</span>
          <h4>${esc(n.title)}</h4>
        </div>
        <p class="why">${esc(n.text)}</p>
      </div>`).join('\n')}
  </section>
  ` : ''}

  <div class="legalbox" id="rechtliches">${legalHtml}</div>

  <footer>
    BFSG-Fuchs &middot; ${PUBLIC_HOST} &middot; info@bfsg-fix.de &middot; Anbieter: Matthias Seba<br>
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
