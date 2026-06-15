#!/usr/bin/env node
// BFSG-Audit — Orchestrator / CLI
// Nutzung:
//   node audit.js <url> [--company "Name GmbH"] [--email kontakt@x.de] [--out ./out] [--pdf] [--teaser]
//
// Erzeugt: <out>/<host>-report.html, <out>/<host>-scan.json,
//          <out>/<host>-barrierefreiheitserklaerung.md
//   --pdf     zusaetzlich PDF des Reports (via Chromium)
//   --teaser  nur kompakter JSON-Teaser (fuer kostenlosen Landingpage-Scan)

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { scanUrl } from './lib/scan.js';
import { renderReport, renderTeaser } from './lib/report.js';
import { renderStatement } from './lib/statement.js';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pdf' || a === '--teaser') args[a.slice(2)] = true;
    else if (a.startsWith('--')) args[a.slice(2)] = argv[++i];
    else args._.push(a);
  }
  return args;
}

function hostSlug(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_');
  } catch {
    return 'site';
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let url = args._[0];
  if (!url) {
    console.error('Fehler: Bitte eine URL angeben. Beispiel:\n  node audit.js https://example.de');
    process.exit(1);
  }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const outDir = args.out || './out';
  const slug = hostSlug(url);

  console.error(`[BFSG-Audit] Scanne ${url} ...`);
  const scan = await scanUrl(url);
  console.error(`[BFSG-Audit] ${scan.violations.length} Regel-Verstoesse, ${scan.passes} bestanden.`);

  if (args.teaser) {
    process.stdout.write(JSON.stringify(renderTeaser(scan), null, 2));
    return;
  }

  await mkdir(outDir, { recursive: true });

  const scanPath = path.join(outDir, `${slug}-scan.json`);
  await writeFile(scanPath, JSON.stringify(scan, null, 2));

  const html = renderReport(scan, { company: args.company || '' });
  const htmlPath = path.join(outDir, `${slug}-report.html`);
  await writeFile(htmlPath, html);

  const statement = renderStatement(scan, {
    company: args.company || '[Unternehmen]',
    email: args.email || '[E-Mail-Adresse]'
  });
  const stmtPath = path.join(outDir, `${slug}-barrierefreiheitserklaerung.md`);
  await writeFile(stmtPath, statement);

  if (args.pdf) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdfPath = path.join(outDir, `${slug}-report.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' } });
    await browser.close();
    console.error(`[BFSG-Audit] PDF: ${pdfPath}`);
  }

  console.error(`[BFSG-Audit] Fertig:\n  ${htmlPath}\n  ${stmtPath}\n  ${scanPath}`);
}

main().catch((err) => {
  console.error('[BFSG-Audit] Fehler:', err.message);
  process.exit(1);
});
