// Auftrags-Erfüllung: aus {url, company, email, pkg, prevSnapshot?} wird automatisch
// der vollständige Report (HTML + PDF) erzeugt. Bei BFSG-Paketen zusätzlich die
// Barrierefreiheitserklärung; bei Cookie-Paketen kein BFSG-Statement.
// Multi-Page-Crawl wird per pkg-Konfiguration angesteuert (5 Seiten Basis,
// 25 Profi, 1 Cookie-Basis, 5 Cookie-Profi).
//
// Wird nach erfolgreicher Stripe-Zahlung vom Webhook aufgerufen, und ebenso bei
// jedem invoice.paid (subscription_cycle) des Re-Check-Abos.

import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { scanUrl, scanSite } from './scan.js';
import { scanCookie } from './scan-cookie.js';
import { renderReport } from './report.js';
import { renderStatement } from './statement.js';
import { diff, snapshot } from './diff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pro Paket: welche Engine, wie viele Seiten, welche Report-Optionen, welches
// Anschreiben (siehe mailer.js#sendReportFor). Single Source of Truth, damit
// app.js und subscriptions.js dieselbe Konfiguration nutzen.
export const PKG_CONFIG = {
  basis:        { kind: 'bfsg',   maxPages: 5,  withStatement: true,  emailKind: 'bfsg'   },
  profi:        { kind: 'bfsg',   maxPages: 25, withStatement: true,  emailKind: 'bfsg'   },
  // Abo: withStatement:true → jeder Monats-Re-Check liefert eine FRISCH erzeugte
  // Erklärung zur Barrierefreiheit mit (Owner-Wunsch). Diff zeigt die Änderungen,
  // die Erklärung spiegelt den aktuellen Stand.
  abo:          { kind: 'bfsg',   maxPages: 25, withStatement: true,  emailKind: 'recheck'},
  'cookie-basis': { kind: 'cookie', maxPages: 1,  withStatement: false, emailKind: 'cookie' },
  'cookie-profi': { kind: 'cookie', maxPages: 5,  withStatement: false, emailKind: 'cookie' }
};

const COOKIE_REPORT_OPTS = {
  reportTitle: 'Cookie- & Consent-Report (§ 25 TDDDG)',
  pruefnorm: '§ 25 TDDDG / DSGVO (technische Messung)',
  introTitle: 'Worum es geht',
  introHtml:
    '<p>Nach § 25 TDDDG dürfen nicht technisch notwendige Cookies und Tracking-/Werbe-Dienste erst NACH einer aktiven Einwilligung des Besuchers geladen werden. Dieser Report misst automatisiert, welche Dienste bereits VOR einer Einwilligung feuern. Es handelt sich um eine technische Messung, keine Rechtsberatung.</p>',
  legalHtml:
    '<strong>Wichtiger Hinweis:</strong> Dies ist eine automatisierte technische Einzelmessung (§ 25 TDDDG / DSGVO) OHNE Banner-Interaktion zu einem Zeitpunkt. Sie erfasst interaktions-/scroll-getriggerte Tags nicht garantiert vollständig. Beobachtete Tracker-Requests können bei korrektem Consent Mode v2 cookielos und zulässig sein — bitte manuell verifizieren. <strong>Keine Rechtsberatung, keine Konformitätsgarantie.</strong>'
};

function slugify(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_');
  } catch {
    return 'site';
  }
}

async function runScan(url, cfg) {
  if (cfg.kind === 'cookie') {
    // Cookie-Multi-Page derzeit sequentiell same-origin (Engine erweiterbar);
    // V1: scannt nur Startseite (klares 1-Tier-Signal). 'cookie-profi' bekommt
    // Multi-Page erst in v2 — Aufpreis rechtfertigt sich aktuell durch tiefere
    // manuelle Prüfung im Backend.
    return await scanCookie(url, { timeout: 45000 });
  }
  if (cfg.maxPages > 1) {
    return await scanSite(url, { maxPages: cfg.maxPages, perPageTimeout: 30000 });
  }
  return await scanUrl(url, { timeout: 45000 });
}

export async function fulfillOrder({ url, company = '', email = '', pkg = 'basis', prevSnapshot = null, outDir }) {
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const cfg = PKG_CONFIG[pkg] || PKG_CONFIG.basis;
  outDir = outDir || path.join(__dirname, '..', 'out', 'orders');
  await mkdir(outDir, { recursive: true });

  const slug = `${slugify(url)}-${Date.now()}`;
  const scan = await runScan(url, cfg);

  // Plausibilitäts-Check: kein leerer/kaputter Report verkaufen.
  if (!scan || (scan.violations.length === 0 && scan.passes === 0)) {
    throw new Error('Scan lieferte kein verwertbares Ergebnis (Seite blockiert/leer/nicht erreichbar)');
  }

  // Diff (für Re-Check-Abo) — first scan, falls prevSnapshot null.
  const scanDiff = diff(scan, prevSnapshot);

  const reportOpts = cfg.kind === 'cookie'
    ? { company, ...COOKIE_REPORT_OPTS }
    : { company, diff: scanDiff, pagesScanned: scan.pagesScanned };

  const html = renderReport(scan, reportOpts);
  const htmlPath = path.join(outDir, `${slug}-report.html`);
  await writeFile(htmlPath, html);

  let stmtPath = null;
  if (cfg.withStatement) {
    const statement = renderStatement(scan, {
      company: company || '[Unternehmen]',
      email: email || '[E-Mail-Adresse]'
    });
    stmtPath = path.join(outDir, `${slug}-barrierefreiheitserklaerung.md`);
    await writeFile(stmtPath, statement);
  }

  // PDF rendern
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let pdfPath;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    pdfPath = path.join(outDir, `${slug}-report.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' }
    });
  } finally {
    await browser.close();
  }

  return {
    url, pkg, slug, pdfPath, htmlPath, stmtPath, scan,
    diff: scanDiff,
    snapshot: snapshot(scan),
    emailKind: cfg.emailKind
  };
}
