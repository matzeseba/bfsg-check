// Generiert einen Entwurf der gesetzlich geforderten "Erklärung zur
// Barrierefreiheit" (Pflichtbestandteil nach BFSG / BITV). Liefert ein
// vorausgefülltes Gerüst, das der Seitenbetreiber finalisieren muss.

import { computeScore } from './report.js';

export function renderStatement(scan, { company = '[Unternehmen]', email = '[E-Mail-Adresse]' } = {}) {
  const { score } = computeScore(scan.violations);
  const status =
    score >= 90
      ? 'weitgehend konform'
      : score >= 50
        ? 'teilweise konform'
        : 'nicht konform';
  const today = new Date().toLocaleDateString('de-DE');

  return `# Erklärung zur Barrierefreiheit

**${company}** ist bemüht, die Website ${scan.url} im Einklang mit dem
Barrierefreiheitsstärkungsgesetz (BFSG) und der Barrierefreie-Informationstechnik-
Verordnung (BITV 2.0) barrierefrei zugänglich zu machen.

## Stand der Vereinbarkeit mit den Anforderungen

Diese Website ist mit den Anforderungen der WCAG 2.1 auf Stufe AA **${status}**.

Grundlage dieser Einschätzung ist eine automatisierte Prüfung vom ${today}
(Konformitäts-Score: ${score}/100), ergänzungsbedürftig durch eine manuelle
Bewertung.

## Nicht barrierefreie Inhalte

Die nachstehenden Inhalte sind aus folgenden Gründen noch nicht barrierefrei:

${scan.violations.length === 0
  ? '- Es wurden in der automatisierten Prüfung keine Verstöße festgestellt. Eine manuelle Prüfung steht aus.'
  : scan.violations
      .slice(0, 12)
      .map((v) => `- ${v.help} (WCAG-Bezug: ${(v.tags || []).filter((t) => t.startsWith('wcag')).join(', ') || 'n/a'})`)
      .join('\n')}

## Erstellung dieser Erklärung

Diese Erklärung wurde am ${today} erstellt. Die Bewertung beruht auf einer
automatisierten Selbstprüfung.

## Feedback und Kontakt

Sind Ihnen Mängel beim barrierefreien Zugang aufgefallen? Kontaktieren Sie uns:
**${email}**

## Durchsetzungsverfahren

Sollten wir auf Ihre Meldung nicht zufriedenstellend reagieren, können Sie sich
an die zuständige Schlichtungs- bzw. Marktüberwachungsstelle wenden.

---
*Entwurf, erstellt durch automatisierte Vorprüfung. Vor Veröffentlichung durch
den Seitenbetreiber zu prüfen und zu vervollständigen. Keine Rechtsberatung.*
`;
}
