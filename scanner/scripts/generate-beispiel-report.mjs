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
import { readFile } from 'node:fs/promises';
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
      // Gering: doppelte ID in ARIA-Referenz/Label (axe 4.10: 'duplicate-id' wurde
      // durch 'duplicate-id-aria' ersetzt, s. rules-de.test.js — die alte, tote
      // Regel-ID hier hätte im Report nur den "Weitere Befunde"-Fallback gezeigt).
      id: 'duplicate-id-aria',
      impact: 'minor',
      nodes: [node('#submit'), node('#email')]
    }
  ],
  passes: 47,
  incomplete: 6
};

async function main() {
  // D5: dasselbe Logo wie im echten Kunden-Report (fulfill.js) — das öffentliche
  // Marketing-Muster soll nicht weniger Branding zeigen als das echte Produkt.
  let logo = '';
  try {
    const buf = await readFile(path.join(__dirname, '..', 'assets', 'logo-fuchs-wappen.png'));
    logo = `data:image/png;base64,${buf.toString('base64')}`;
  } catch { /* Logo fehlt (anderes Deploy-Layout) — Report ohne Logo, kein Abbruch. */ }

  const html = renderReport(scan, {
    company: 'Beispielshop (anonymisiertes Muster)',
    logo
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
      margin: { top: '12mm', bottom: '18mm', left: '10mm', right: '10mm' },
      // D4: Seitenzahlen — konsistent zum echten Report (fulfill.js).
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="width:100%;font-size:8px;color:#94a3b8;text-align:center;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">bfsg-fix.de &middot; Seite <span class="pageNumber"></span> von <span class="totalPages"></span></div>'
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
