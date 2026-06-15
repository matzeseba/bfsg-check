// Auftrags-Erfüllung: aus {url, company, email, pkg} wird automatisch der
// vollständige Report (HTML + PDF) + die Barrierefreiheitserklärung erzeugt.
// Wird nach erfolgreicher Stripe-Zahlung vom Webhook aufgerufen.

import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { scanUrl } from './scan.js';
import { renderReport } from './report.js';
import { renderStatement } from './statement.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function slugify(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_');
  } catch {
    return 'site';
  }
}

export async function fulfillOrder({ url, company = '', email = '', pkg = 'basis', outDir }) {
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  outDir = outDir || path.join(__dirname, '..', 'out', 'orders');
  await mkdir(outDir, { recursive: true });

  const slug = `${slugify(url)}-${Date.now()}`;
  const scan = await scanUrl(url, { timeout: 45000 });

  // Plausibilitäts-Check: kein leerer/kaputter Report verkaufen.
  // Eine funktionierende Seite liefert entweder Verstöße ODER bestandene Checks.
  if (!scan || (scan.violations.length === 0 && scan.passes === 0)) {
    throw new Error('Scan lieferte kein verwertbares Ergebnis (Seite blockiert/leer/nicht erreichbar)');
  }

  const html = renderReport(scan, { company });
  const htmlPath = path.join(outDir, `${slug}-report.html`);
  await writeFile(htmlPath, html);

  const statement = renderStatement(scan, {
    company: company || '[Unternehmen]',
    email: email || '[E-Mail-Adresse]'
  });
  const stmtPath = path.join(outDir, `${slug}-barrierefreiheitserklaerung.md`);
  await writeFile(stmtPath, statement);

  // PDF rendern
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    var pdfPath = path.join(outDir, `${slug}-report.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' }
    });
  } finally {
    await browser.close();
  }

  return { url, pkg, slug, pdfPath, htmlPath, stmtPath, scan };
}
