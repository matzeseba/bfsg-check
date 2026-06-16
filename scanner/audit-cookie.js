#!/usr/bin/env node
// Cookie-/Consent-Audit (§ 25 TDDDG) — CLI.
// node audit-cookie.js <url> [--company "Name"] [--pdf] [--teaser]

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { scanCookie } from './lib/scan-cookie.js';
import { renderReport, renderTeaser } from './lib/report.js';

const COOKIE_OPTS = {
  reportTitle: 'Cookie- & Consent-Report (§ 25 TDDDG)',
  pruefnorm: '§ 25 TDDDG / DSGVO (technische Messung)',
  introTitle: 'Worum es geht',
  introHtml:
    '<p>Nach § 25 TDDDG duerfen nicht technisch notwendige Cookies und Tracking-/Werbe-Dienste erst NACH einer aktiven Einwilligung des Besuchers geladen werden. Dieser Report misst automatisiert, welche Dienste bereits VOR einer Einwilligung feuern. Es handelt sich um eine technische Messung, keine Rechtsberatung.</p>',
  legalHtml:
    '<strong>Wichtiger Hinweis:</strong> Dies ist eine automatisierte technische Einzelmessung (§ 25 TDDDG / DSGVO) OHNE Banner-Interaktion zu einem Zeitpunkt. Sie erfasst interaktions-/scroll-getriggerte Tags nicht garantiert vollstaendig. Beobachtete Tracker-Requests koennen bei korrektem Consent Mode v2 cookielos und zulaessig sein — bitte manuell verifizieren. <strong>Keine Rechtsberatung, keine Konformitaetsgarantie.</strong>'
};

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--pdf' || x === '--teaser') a[x.slice(2)] = true;
    else if (x.startsWith('--')) a[x.slice(2)] = argv[++i];
    else a._.push(x);
  }
  return a;
}
function slug(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_'); }
  catch { return 'site'; }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let url = args._[0];
  if (!url) { console.error('Nutzung: node audit-cookie.js <url> [--pdf] [--teaser]'); process.exit(1); }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  console.error(`[Cookie-Audit] Scanne ${url} ...`);
  const scan = await scanCookie(url);
  console.error(`[Cookie-Audit] ${scan.violations.length} Befunde, Banner erkannt: ${scan.meta.bannerPresent}`);

  if (args.teaser) { process.stdout.write(JSON.stringify(renderTeaser(scan), null, 2)); return; }

  const outDir = args.out || './out';
  await mkdir(outDir, { recursive: true });
  const s = slug(url);
  const html = renderReport(scan, { company: args.company || '', ...COOKIE_OPTS });
  const htmlPath = path.join(outDir, `${s}-cookie-report.html`);
  await writeFile(htmlPath, html);
  await writeFile(path.join(outDir, `${s}-cookie-scan.json`), JSON.stringify(scan, null, 2));

  if (args.pdf) {
    const { chromium } = await import('playwright');
    const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const p = await b.newPage();
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.pdf({ path: path.join(outDir, `${s}-cookie-report.pdf`), format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' } });
    await b.close();
  }
  console.error(`[Cookie-Audit] Fertig: ${htmlPath}`);
}
main().catch((e) => { console.error('[Cookie-Audit] Fehler:', e.message); process.exit(1); });
