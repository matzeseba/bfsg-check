#!/usr/bin/env node
// Erzeugt den anonymisierten BEISPIEL-REPORT (Conversion-Asset fuer die Landingpage)
// ueber den BESTEHENDEN Report-Renderpfad — identisch zu `audit.js --pdf`:
//   renderReport(scan) -> HTML -> Playwright page.pdf()
//
// Quelle der Befunde: ein synthetisches, ABER realistisches axe-core-Scan-Objekt
// fuer eine FIKTIVE Seite "beispielshop.de". STRIKT ANONYM — keine echte Kunden-URL,
// keine reale Domain/Marke, keine identifizierenden Daten. Die Befunde spiegeln die
// haeufigsten WCAG-2.1-AA-Verstoesse typischer ungeprueffter Shops wider.
//
// Ablage: landingpage-next/public/beispiel-report.pdf
//
// Nutzung:  node scripts/generate-beispiel-report.mjs

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderReport } from '../lib/report.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hilfsfunktion: erzeugt axe-core-kompatible nodes (nur target wird im Report genutzt).
const node = (target) => ({
  target: Array.isArray(target) ? target : [target],
  html: '',
  failureSummary: ''
});

// Realistisches, anonymisiertes Scan-Ergebnis. Struktur = Rueckgabe von scanUrl():
// { url, scannedAt, meta, violations[], passes, incomplete }
// Die violations folgen der axe-core-Form: { id, impact, nodes[] }.
const scan = {
  url: 'https://www.beispielshop.de',
  scannedAt: new Date().toISOString(),
  meta: {
    title: 'Beispielshop — Online-Shop (anonymisiertes Muster)',
    lang: 'de',
    imgTotal: 28,
    imgMissingAlt: 2,
    h1Count: 1,
    hasMain: true,
    hasSkipLink: false,
    formFields: 5
  },
  // Realistische, gemischte Befundlage eines typischen ungeprueften Shops:
  // ein kritischer Befund, einige schwerwiegende, dazu mittlere/geringe. Ergibt
  // ueber den ECHTEN computeScore() einen glaubwuerdigen C-Score (~56/100), nicht
  // den extremen Worst-Case. Alle vier Schweregrade sind vertreten, damit der
  // Beispiel-Report die volle Bandbreite der Darstellung zeigt.
  violations: [
    {
      // Kritisch: Bilder ohne Alternativtext
      id: 'image-alt',
      impact: 'critical',
      nodes: [node('.hero img.banner')]
    },
    {
      // Schwerwiegend: zu geringer Farbkontrast
      id: 'color-contrast',
      impact: 'serious',
      nodes: [node('.hero .subline'), node('footer .legal-links a')]
    },
    {
      // Mittel: Ueberschriften nicht in logischer Reihenfolge
      id: 'heading-order',
      impact: 'moderate',
      nodes: [node('.sidebar h4.widget-title')]
    },
    {
      // Gering: doppelte ID-Attribute
      id: 'duplicate-id',
      impact: 'minor',
      nodes: [node('#submit'), node('#email')]
    }
  ],
  passes: 47,
  incomplete: 6
};

async function main() {
  const html = renderReport(scan, {
    company: 'Beispielshop (anonymisiertes Muster)'
  });

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdfPath = path.resolve(
      __dirname,
      '..',
      '..',
      'landingpage-next',
      'public',
      'beispiel-report.pdf'
    );
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' }
    });
    console.error(`[Beispiel-Report] PDF erzeugt: ${pdfPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[Beispiel-Report] Fehler:', err.message);
  process.exit(1);
});
