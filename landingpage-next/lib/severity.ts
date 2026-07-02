// Schweregrad-Logik des Gratis-Scan-Ergebnisses.
//
// SPIEGELUNG von scanner/lib/mailer.js (SEVERITY_ORDER / SEVERITY_LABEL /
// SEVERITY_COLOR / SEVERITY_TEXT / severitySequence, Zeilen ~292–314):
// DOI-Mail und Website müssen dieselbe Schwere-Zuordnung und dieselben Farben
// zeigen. Bei Änderungen dort → hier nachziehen.

export const SEVERITY_ORDER = [
  "critical",
  "serious",
  "moderate",
  "minor",
] as const;

export type Severity = (typeof SEVERITY_ORDER)[number];

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Kritisch",
  serious: "Schwerwiegend",
  moderate: "Mittel",
  minor: "Gering",
};

// Solide Füll-Farben — identisch zu SEVERITY_COLOR/SEVERITY_TEXT der Mail.
// Kontraststark in hellen UND dunklen Umgebungen (keine hellgrau-auf-weiß-
// Chips, die im Dark-Mode verschwinden). WCAG 1.4.3 (AA, Normaltext 4,5:1):
// Weiß auf Rot/Orange/Amber läge nur bei ~3,3:1 / ~3,1:1 / ~1,9:1 → dunkler
// Text #2b1206 auf den hellen Flächen (Kritisch 5,36:1, Schwerwiegend 5,63:1,
// Mittel ~7:1); nur Gering (#6b7280) trägt weißen Text (4,54:1).
export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#F8554B",
  serious: "#ED6A33",
  moderate: "#f5b13d",
  minor: "#6b7280",
};

export const SEVERITY_TEXT: Record<Severity, string> = {
  critical: "#2b1206",
  serious: "#2b1206",
  moderate: "#2b1206",
  minor: "#ffffff",
};

export type SeverityCounts = Partial<Record<Severity, number>>;

// Leitet je Top-Befund den Schweregrad her: renderTeaser (scanner/lib/report.js)
// sortiert die Befunde streng nach IMPACT_WEIGHT absteigend
// (critical > serious > moderate > minor) und schickt die Top-3. Genau diese
// Reihenfolge entsteht, wenn man die counts in derselben Schwere-Ordnung
// expandiert — der i-te Top-Befund trägt also die i-te Schwere dieser Sequenz.
// Gleiche Herleitung wie in der Mail → Seite und Mail widersprechen sich nie.
export function severitySequence(counts?: SeverityCounts): Severity[] {
  const seq: Severity[] = [];
  for (const sev of SEVERITY_ORDER) {
    const n = Math.max(0, Number(counts?.[sev]) || 0);
    for (let i = 0; i < n; i++) seq.push(sev);
  }
  return seq;
}
