// Generiert einen Entwurf der gesetzlich geforderten "Erklaerung zur
// Barrierefreiheit" (Pflichtbestandteil nach BFSG / BITV). Liefert ein
// vorausgefuelltes Geruest, das der Seitenbetreiber finalisieren muss.

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

  return `# Erklaerung zur Barrierefreiheit

**${company}** ist bemueht, die Website ${scan.url} im Einklang mit dem
Barrierefreiheitsstaerkungsgesetz (BFSG) und der Barrierefreie-Informationstechnik-
Verordnung (BITV 2.0) barrierefrei zugaenglich zu machen.

## Stand der Vereinbarkeit mit den Anforderungen

Diese Website ist mit den Anforderungen der WCAG 2.1 auf Stufe AA **${status}**.

Grundlage dieser Einschaetzung ist eine automatisierte Pruefung vom ${today}
(Konformitaets-Score: ${score}/100), ergaenzungsbeduerftig durch eine manuelle
Bewertung.

## Nicht barrierefreie Inhalte

Die nachstehenden Inhalte sind aus folgenden Gruenden noch nicht barrierefrei:

${scan.violations.length === 0
  ? '- Es wurden in der automatisierten Pruefung keine Verstoesse festgestellt. Eine manuelle Pruefung steht aus.'
  : scan.violations
      .slice(0, 12)
      .map((v) => `- ${v.help} (WCAG-Bezug: ${(v.tags || []).filter((t) => t.startsWith('wcag')).join(', ') || 'n/a'})`)
      .join('\n')}

## Erstellung dieser Erklaerung

Diese Erklaerung wurde am ${today} erstellt. Die Bewertung beruht auf einer
automatisierten Selbstpruefung.

## Feedback und Kontakt

Sind Ihnen Maengel beim barrierefreien Zugang aufgefallen? Kontaktieren Sie uns:
**${email}**

## Durchsetzungsverfahren

Sollten wir auf Ihre Meldung nicht zufriedenstellend reagieren, koennen Sie sich
an die zustaendige Schlichtungs- bzw. Marktueberwachungsstelle wenden.

---
*Entwurf, erstellt durch automatisierte Vorpruefung. Vor Veroeffentlichung durch
den Seitenbetreiber zu pruefen und zu vervollstaendigen. Keine Rechtsberatung.*
`;
}
