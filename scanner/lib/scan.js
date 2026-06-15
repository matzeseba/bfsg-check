// Fuehrt den eigentlichen Barrierefreiheits-Scan aus:
// laedt die Seite headless, injiziert axe-core und sammelt zusaetzlich
// einfache Seiten-Metadaten (Sprache, Titel, Bildanzahl ...).
//
// scanUrl(url)            — Einzelseite (Teaser / Gratis-Check)
// scanSite(url, {maxPages}) — same-origin BFS-Crawl, Befunde aggregiert

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { assertPublicHttpUrl } from './url-guard.js';

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

// Same-Origin-Crawl: scannt die Startseite + bis zu (maxPages-1) interne Folgeseiten.
// Aggregation: gleiche Regel-IDs werden über alle Seiten zusammengeführt, nodes
// werden gemerged (Pro-Seiten-Stellen multiplizieren sich nicht, doppelte Stellen
// werden deduped). passes ist die Summe der bestandenen Regeln, incomplete dito.
// Fehler einzelner Seiten brechen den Lauf NICHT ab (resilient).
export async function scanSite(startUrl, { maxPages = 5, perPageTimeout = 30000 } = {}) {
  if (!/^https?:\/\//i.test(startUrl)) startUrl = 'https://' + startUrl;
  const origin = new URL(startUrl).origin;
  maxPages = Math.max(1, Math.min(50, Number(maxPages) || 5));

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext({
    locale: 'de-DE',
    ignoreHTTPSErrors: process.env.SCAN_IGNORE_HTTPS === 'true',
    userAgent: 'Mozilla/5.0 (compatible; BFSG-Audit/1.0; +https://example.com/bfsg-check)'
  });

  const visited = new Set();
  const queue = [startUrl];
  const pageResults = [];
  const errors = [];

  try {
    while (queue.length && visited.size < maxPages) {
      const target = queue.shift();
      if (visited.has(target)) continue;
      visited.add(target);

      // SSRF-Schutz auch für entdeckte Links (DNS-Auflösung jeder URL).
      try {
        await assertPublicHttpUrl(target);
      } catch (e) {
        errors.push({ url: target, error: 'url-guard: ' + e.message });
        continue;
      }

      const page = await context.newPage();
      try {
        await page.goto(target, { waitUntil: 'networkidle', timeout: perPageTimeout });
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
          .analyze();
        const title = await page.title().catch(() => null);

        // Folge-Links sammeln (nur same-origin, ohne Fragment/Mailto/JS).
        if (visited.size < maxPages) {
          const links = await page.evaluate((org) => {
            const out = new Set();
            for (const a of document.querySelectorAll('a[href]')) {
              try {
                const u = new URL(a.getAttribute('href'), location.href);
                if (u.origin !== org) continue;
                if (!/^https?:$/.test(u.protocol)) continue;
                u.hash = '';
                out.add(u.toString());
              } catch { /* ignore */ }
            }
            return [...out];
          }, origin);
          for (const l of links) {
            if (!visited.has(l) && !queue.includes(l)) queue.push(l);
          }
        }

        pageResults.push({
          url: target, title,
          violations: results.violations,
          passes: results.passes.length,
          incomplete: results.incomplete.length
        });
      } catch (e) {
        errors.push({ url: target, error: e.message });
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    await browser.close();
  }

  // Aggregation auf Regel-Ebene.
  const ruleMap = new Map(); // id -> { ...v, nodes: deduped }
  let passes = 0;
  let incomplete = 0;
  for (const pr of pageResults) {
    passes += pr.passes;
    incomplete += pr.incomplete;
    for (const v of pr.violations) {
      const existing = ruleMap.get(v.id);
      if (!existing) {
        ruleMap.set(v.id, { ...v, nodes: [...(v.nodes || [])] });
      } else {
        const seen = new Set(existing.nodes.map((n) => (n.target || []).join(' ')));
        for (const n of v.nodes || []) {
          const key = (n.target || []).join(' ');
          if (!seen.has(key)) { existing.nodes.push(n); seen.add(key); }
        }
      }
    }
  }

  const violations = [...ruleMap.values()];
  // Erste Seite stellt die Meta (Sprache, Titel etc.) — kompatibel zu scanUrl().
  const firstUrl = pageResults[0]?.url || startUrl;
  return {
    url: firstUrl,
    scannedAt: new Date().toISOString(),
    meta: { title: pageResults[0]?.title || null },
    violations,
    passes,
    incomplete,
    pagesScanned: pageResults.length,
    pages: pageResults.map((p) => ({ url: p.url, title: p.title, violationCount: p.violations.length })),
    errors
  };
}
