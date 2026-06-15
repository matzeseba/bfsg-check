// Diff zwischen zwei Scan-Ergebnissen (für das Re-Check-Abo).
// Wir vergleichen auf Regel-Ebene: gleiche Regel-ID = gleicher Mangel-Typ.
// nodeCount transportiert „mehr oder weniger Stellen betroffen?".
// Ausgabe: { resolved, newly, changed, unchanged, prevScore, score }.

import { ruleInfo } from './rules-de.js';
import { computeScore } from './report.js';

// Reduziert ein Scan-Ergebnis auf die für den Diff nötige Form.
export function snapshot(scan) {
  const rules = {};
  for (const v of scan.violations || []) {
    rules[v.id] = {
      impact: v.impact,
      nodeCount: (v.nodes || []).length,
      help: v.help,
      tags: v.tags || []
    };
  }
  const { score } = computeScore(scan.violations || []);
  return {
    url: scan.url,
    scannedAt: scan.scannedAt,
    score,
    passes: scan.passes,
    rules
  };
}

// Vergleicht den aktuellen Scan mit dem vorherigen Snapshot.
// Wenn kein Vor-Snapshot existiert (prev = null), gilt alles als „unchanged"
// und das Diff signalisiert „erster Scan".
export function diff(currentScan, prev) {
  const curr = snapshot(currentScan);
  if (!prev) {
    return {
      firstScan: true,
      prevScore: null,
      score: curr.score,
      resolved: [],
      newly: [],
      changed: [],
      unchanged: Object.keys(curr.rules).map((id) => ({ id, ...curr.rules[id] }))
    };
  }
  const resolved = [];
  const newly = [];
  const changed = [];
  const unchanged = [];

  const prevIds = new Set(Object.keys(prev.rules || {}));
  const currIds = new Set(Object.keys(curr.rules));

  for (const id of prevIds) {
    if (!currIds.has(id)) {
      const r = prev.rules[id];
      const info = ruleInfo({ id, help: r.help });
      resolved.push({ id, impact: r.impact, nodeCount: r.nodeCount, title: info.title });
    }
  }
  for (const id of currIds) {
    const c = curr.rules[id];
    const info = ruleInfo({ id, help: c.help });
    if (!prevIds.has(id)) {
      newly.push({ id, impact: c.impact, nodeCount: c.nodeCount, title: info.title });
    } else {
      const p = prev.rules[id];
      if (p.nodeCount !== c.nodeCount) {
        changed.push({
          id, title: info.title, impact: c.impact,
          before: p.nodeCount, after: c.nodeCount,
          direction: c.nodeCount < p.nodeCount ? 'improved' : 'worsened'
        });
      } else {
        unchanged.push({ id, impact: c.impact, nodeCount: c.nodeCount, title: info.title });
      }
    }
  }
  return {
    firstScan: false,
    prevScore: prev.score,
    score: curr.score,
    resolved,
    newly,
    changed,
    unchanged
  };
}

// Kurzfassung als Plaintext für die E-Mail.
export function diffSummaryText(d) {
  if (d.firstScan) {
    return `Erster Scan im Re-Check-Abo. Score: ${d.score}/100. ` +
      `Ab nächstem Monat erhalten Sie eine Veränderungs-Übersicht.`;
  }
  const lines = [];
  lines.push(`Score: ${d.score}/100 (vorher ${d.prevScore}/100, Differenz ${d.score - d.prevScore >= 0 ? '+' : ''}${d.score - d.prevScore}).`);
  lines.push('');
  if (d.resolved.length) {
    lines.push(`Behoben (${d.resolved.length}):`);
    for (const r of d.resolved) lines.push(`  - ${r.title}`);
    lines.push('');
  }
  if (d.newly.length) {
    lines.push(`Neu (${d.newly.length}):`);
    for (const n of d.newly) lines.push(`  - ${n.title} (${n.nodeCount}x)`);
    lines.push('');
  }
  if (d.changed.length) {
    const better = d.changed.filter((c) => c.direction === 'improved');
    const worse = d.changed.filter((c) => c.direction === 'worsened');
    if (better.length) {
      lines.push(`Weniger Stellen betroffen (${better.length}):`);
      for (const c of better) lines.push(`  - ${c.title}: ${c.before} -> ${c.after}`);
      lines.push('');
    }
    if (worse.length) {
      lines.push(`Mehr Stellen betroffen (${worse.length}):`);
      for (const c of worse) lines.push(`  - ${c.title}: ${c.before} -> ${c.after}`);
      lines.push('');
    }
  }
  if (!d.resolved.length && !d.newly.length && !d.changed.length) {
    lines.push('Keine Veränderungen seit dem letzten Scan.');
  }
  return lines.join('\n');
}
