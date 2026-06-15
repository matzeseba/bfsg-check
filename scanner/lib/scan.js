// Fuehrt den eigentlichen Barrierefreiheits-Scan aus:
// laedt die Seite headless, injiziert axe-core und sammelt zusaetzlich
// einfache Seiten-Metadaten (Sprache, Titel, Bildanzahl ...).

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

export async function scanUrl(url, { timeout = 45000 } = {}) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext({
    locale: 'de-DE',
    // Produktion: TLS-Fehler NICHT ignorieren (echte Kundenseiten haben gültiges TLS).
    // Nur für Testumgebungen via SCAN_IGNORE_HTTPS=true übersteuerbar.
    ignoreHTTPSErrors: process.env.SCAN_IGNORE_HTTPS === 'true',
    userAgent:
      'Mozilla/5.0 (compatible; BFSG-Audit/1.0; +https://example.com/bfsg-check)'
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout });

    // axe-core nach WCAG 2.1 A + AA und Best-Practices laufen lassen.
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    // Leichtgewichtige Zusatz-Checks direkt aus dem DOM.
    const meta = await page.evaluate(() => {
      const lang = document.documentElement.getAttribute('lang');
      return {
        title: document.title || null,
        lang: lang || null,
        imgTotal: document.querySelectorAll('img').length,
        imgMissingAlt: Array.from(document.querySelectorAll('img')).filter(
          (i) => !i.hasAttribute('alt')
        ).length,
        h1Count: document.querySelectorAll('h1').length,
        hasMain: !!document.querySelector('main'),
        hasSkipLink: !!document.querySelector('a[href^="#"]'),
        formFields: document.querySelectorAll('input, select, textarea').length
      };
    });

    return {
      url,
      scannedAt: new Date().toISOString(),
      meta,
      violations: results.violations,
      passes: results.passes.length,
      incomplete: results.incomplete.length
    };
  } finally {
    await browser.close();
  }
}
