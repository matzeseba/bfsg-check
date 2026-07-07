// Fuehrt den eigentlichen Barrierefreiheits-Scan aus:
// laedt die Seite headless, injiziert axe-core und sammelt zusaetzlich
// einfache Seiten-Metadaten (Sprache, Titel, Bildanzahl ...).
//
// scanUrl(url)            — Einzelseite (Teaser / Gratis-Check)
// scanSite(url, {maxPages}) — same-origin BFS-Crawl, Befunde aggregiert

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { assertPublicHttpUrl, verifyNoDnsRebinding, installSsrfGuard, pinnedHostResolverArg } from './url-guard.js';
import { classifyScanError } from './scan-error.js';
import { wwwFallbackCandidate } from './www-fallback.js';

// Lädt eine Seite robust + schnell: PRIMÄR domcontentloaded (zuverlässig, auch
// auf Tracking-/Long-Poll-lastigen Seiten erreichbar), DANN eine KURZE, begrenzte
// Settle-Phase auf networkidle, deren eigener Timeout den Scan NICHT abbricht
// (best effort — wenn die Seite nie ruhig wird, scannen wir trotzdem den geladenen
// DOM). Vorher (networkidle mit vollem Budget zuerst) verbrannten tracking-lastige
// Seiten das gesamte Timeout, ohne je networkidle zu erreichen.
// Wichtig: das Rebinding-Verify steht VOR den Navigationen, darf NICHT verschluckt
// werden (sonst SSRF-/Rebinding-Schutz umgangen).
// Settle-Budget: max. 1/3 des Gesamt-Budgets, gedeckelt 6–8 s.
// Exportiert für den Unit-Test (test/goto-resilient.test.js): ein 4xx/5xx-Status muss
// werfen (HTTP-Fehlerseite/WAF-Interstitial ist KEIN verwertbarer Scan), 2xx/null nicht.
// PR3: Gemeinsamer axe-Regelsatz für Gratis-Teaser UND bezahlten Scan. Neuzugang
// gegenüber vorher: 'wcag22aa' (WCAG 2.2 AA) — einziger sinnvoller Zuwachs.
// 'experimental' bewusst NICHT (zu viel Rauschen/False Positives). Ein einzelner
// Aufruf kann via axeTags-Option überschreiben; Default = dieser Satz.
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

export async function gotoResilient(page, safeUrl, addresses, timeout, settleMs = 12000) {
  await verifyNoDnsRebinding(safeUrl, addresses);
  // Zuverlässiger Primärladevorgang. Wirft (z.B. TLS/DNS/Connection) wird durch
  // an den Aufrufer durchgereicht — dort greift der Retry / die Klassifizierung.
  const resp = await page.goto(safeUrl, { waitUntil: 'domcontentloaded', timeout });
  // HTTP-Fehlerstatus (4xx/5xx) NICHT als erfolgreichen Scan werten: page.goto wirft
  // nur bei Netzwerk-/TLS-/DNS-Fehlern. Eine 403/404/500/503-Fehlerseite ODER ein
  // WAF-/Bot-Interstitial mit Status >= 400 würde sonst von axe als "echtes Ergebnis"
  // gescannt → falscher Score auf einer Seite, die der Kunde gar nicht gemeint hat.
  // resp ist null bei about:blank/Sonder-Navigationen — dann nichts zu prüfen.
  if (resp && resp.status() >= 400) {
    throw new Error(`http-status-${resp.status()}`);
  }
  // Kurze, gekappte Netzwerk-Ruhe-Phase. Eigenes kleines Budget; ein Timeout hier
  // ist KEIN Fehler (axe läuft danach trotzdem auf dem geladenen DOM). Obergrenze
  // via settleMs (PR3: 12s statt 8s → JS-lastige Seiten werden ruhiger, bevor axe
  // läuft), immer noch auf 1/3 des Gesamt-Timeouts gedeckelt.
  const settleBudget = Math.max(2000, Math.min(settleMs, Math.floor(timeout / 3)));
  await page
    .waitForLoadState('networkidle', { timeout: settleBudget })
    .catch(() => { /* Seite wird nie ganz ruhig (Tracking/Polling) — bewusst ignoriert. */ });
}

// Apex↔www-Fallback (W1-F): scheitert der Scan mit „nicht erreichbar/404"
// (Fehlerklasse dns via classifyScanError) und existiert eine www-/Apex-
// Schwester-URL, folgt GENAU EIN zweiter Versuch damit. Der Options-Guard
// _noFallback verhindert Ping-Pong (www→apex→www→…).
// SSRF-KRITISCH: der zweite Versuch läuft komplett durch scanUrlAttempt →
// assertPublicHttpUrl + FRISCHER IP-Pin (pinnedHostResolverArg) für den NEUEN
// Host. Gepinnte Adressen des alten Hosts werden nie wiederverwendet.
// Das Ergebnis trägt die tatsächlich gescannte URL im url-Feld (Report zeigt
// sonst die tote Adresse). Schlägt auch der Fallback fehl, wird der ORIGINAL-
// Fehler geworfen — der Kunde hat DIESE URL eingegeben.
export async function scanUrl(url, opts = {}) {
  try {
    return await scanUrlAttempt(url, opts);
  } catch (err) {
    const alt = opts._noFallback ? null : wwwFallbackCandidate(url, err?.message);
    if (!alt) throw err;
    try {
      return await scanUrl(alt, { ...opts, _noFallback: true });
    } catch {
      throw err; // Originalfehler durchreichen (für Klassifizierung/Logging).
    }
  }
}

async function scanUrlAttempt(url, { timeout = 60000, lenientTls = false, settleMs = 12000, axeTags = AXE_TAGS } = {}) {
  // SSRF-Schutz + Rebinding-Pin: erst Adressen auflösen + verifizieren.
  const safe = await assertPublicHttpUrl(/^https?:\/\//i.test(url) ? url : 'https://' + url);
  // IP-Pin: Chromium-Resolver auf die geprüfte öffentliche IP zwingen (SSRF C1).
  const pinArg = pinnedHostResolverArg(new URL(safe.url).hostname, safe.addresses);
  // browser AUSSERHALB des try deklarieren + launch INNERHALB: wirft newContext/
  // newPage/installSsrfGuard, schliesst das finally den Browser-Prozess trotzdem
  // (sonst Zombie-Chromium + FD-Leak im Fehlerfall, der unter Last den Host mitreisst).
  let browser;
  try {
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-dev-shm-usage', ...(pinArg ? [pinArg] : [])]
    });
    const context = await browser.newContext({
      locale: 'de-DE',
      // Produktion: TLS-Fehler standardmäßig NICHT ignorieren (echte Kundenseiten
      // haben gültiges TLS). Übersteuerbar via SCAN_IGNORE_HTTPS=true (Testumgebung)
      // ODER pro Aufruf via lenientTls=true: der Gratis-Teaser nutzt SCAN_TEASER_LENIENT_TLS,
      // der bezahlte Pfad SCAN_PAID_LENIENT_TLS (beide env-gated, Default aus, s. app.js +
      // fulfill.js). Der SSRF-/Rebinding-Schutz bleibt davon UNBERÜHRT (separater DNS-/IP-Check),
      // ignoreHTTPSErrors lockert ausschließlich die Zertifikatsprüfung des Ziel-Hops.
      ignoreHTTPSErrors: lenientTls || process.env.SCAN_IGNORE_HTTPS === 'true',
      userAgent:
        'Mozilla/5.0 (compatible; BFSG-Audit/1.0; +https://example.com/bfsg-check)'
    });
    const page = await context.newPage();
    // SSRF-Guard: jede (auch redirect-ausgelöste) Navigation gegen interne IPs prüfen.
    await installSsrfGuard(page);

    // Rebinding-Detection + robustes Laden (domcontentloaded + kurze Settle-Phase).
    // Ein leichter Retry bei transientem Navigationsfehler — jeder Versuch läuft
    // über gotoResilient(), d.h. verifyNoDnsRebinding() greift bei JEDEM Versuch
    // erneut (SSRF-/Rebinding-Schutz wird durch den Retry NICHT umgangen).
    // KEIN Retry bei Timeout: dann ist die Seite nur langsam — ein zweiter voller
    // Versuch verdoppelt nur die Wartezeit und riskiert, das HTTP-/Proxy-Budget zu
    // sprengen. classifyScanError ist die einzige Quelle des Timeout-Kriteriums.
    try {
      await gotoResilient(page, safe.url, safe.addresses, timeout, settleMs);
    } catch (firstErr) {
      // KEIN Retry bei Timeout (Seite ist nur langsam) ODER bei deterministischem
      // HTTP-Fehlerstatus (404/403/5xx ändert sich beim Sofort-Retry nicht — ein
      // zweiter Chromium-Lauf wäre reine Zeit-/Budget-Verschwendung).
      const reason = classifyScanError(firstErr?.message).reason;
      if (reason === 'timeout' || /^http-status-/.test(firstErr?.message || '')) throw firstErr;
      await gotoResilient(page, safe.url, safe.addresses, timeout, settleMs).catch(() => {
        throw firstErr; // Originalfehler durchreichen (für die Klassifizierung).
      });
    }

    // axe-core nach WCAG 2.1/2.2 A + AA und Best-Practices laufen lassen.
    const results = await new AxeBuilder({ page })
      .withTags(axeTags)
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
    await browser?.close().catch(() => {});
  }
}

// Same-Origin-Crawl: scannt die Startseite + bis zu (maxPages-1) interne Folgeseiten.
// Aggregation: gleiche Regel-IDs werden über alle Seiten zusammengeführt, nodes
// werden gemerged (Pro-Seiten-Stellen multiplizieren sich nicht, doppelte Stellen
// werden deduped). passes ist die Summe der bestandenen Regeln, incomplete dito.
// Fehler einzelner Seiten brechen den Lauf NICHT ab (resilient).
//
// Apex↔www-Fallback (W1-F), analog zu scanUrl: GENAU EIN zweiter Versuch mit
// der Schwester-URL, _noFallback verhindert Ping-Pong. Zwei Scheiter-Formen:
// 1. Throw (z. B. Start-Host nicht auflösbar → assertPublicHttpUrl wirft),
// 2. KEIN Throw, aber 0 gescannte Seiten (toter Start-URL-Fehler landet nur
//    in errors[] — z. B. http-status-404 auf der Startseite).
// SSRF-KRITISCH: der Retry läuft komplett durch scanSiteAttempt → dort werden
// assertPublicHttpUrl + IP-Pin (pinnedHostResolverArg) FRISCH für den neuen
// Host berechnet; nichts vom alten Host wird wiederverwendet. Der Retry wird
// nur übernommen, wenn er tatsächlich Seiten geliefert hat — sonst bleibt
// Originalfehler bzw. Original-Ergebnis erhalten (kein Verhaltens-Downgrade).
export async function scanSite(startUrl, opts = {}) {
  let result;
  try {
    result = await scanSiteAttempt(startUrl, opts);
  } catch (err) {
    const alt = opts._noFallback ? null : wwwFallbackCandidate(startUrl, err?.message);
    if (alt) {
      try {
        const retry = await scanSite(alt, { ...opts, _noFallback: true });
        if (retry.pagesScanned > 0) return retry;
      } catch { /* Originalfehler unten werfen. */ }
    }
    throw err;
  }
  if (!opts._noFallback && result.pagesScanned === 0 && result.errors.length > 0) {
    const alt = wwwFallbackCandidate(startUrl, result.errors[0].error);
    if (alt) {
      try {
        const retry = await scanSite(alt, { ...opts, _noFallback: true });
        if (retry.pagesScanned > 0) return retry;
      } catch { /* Original-Ergebnis behalten. */ }
    }
  }
  return result;
}

// Aggregation auf Regel-Ebene über alle gescannten Unterseiten. Exportiert als
// reine Funktion (kein Browser nötig) für den Unit-Test (test/scan-aggregate.test.js).
// F2/F7: jede Node bekommt die Quell-Seiten-URL (n._page) angeheftet, damit der
// Report Fundstellen einer Unterseite zuordnen kann. F14: Dedupe-Key läuft über
// Seite+Selektor statt nur Selektor — derselbe kaputte Selektor auf mehreren
// Seiten (Template-Fehler, der Normalfall) zählt dadurch weiterhin je Seite,
// statt sich auf 1× zu kollabieren.
export function aggregatePageResults(pageResults) {
  const ruleMap = new Map(); // id -> { ...v, nodes: deduped, je Node mit _page }
  let passes = 0;
  let incomplete = 0;
  for (const pr of pageResults) {
    passes += pr.passes;
    incomplete += pr.incomplete;
    for (const v of pr.violations) {
      const existing = ruleMap.get(v.id);
      const taggedNodes = (v.nodes || []).map((n) => ({ ...n, _page: pr.url }));
      if (!existing) {
        ruleMap.set(v.id, { ...v, nodes: taggedNodes });
      } else {
        const seen = new Set(existing.nodes.map((n) => `${n._page || ''}|${(n.target || []).join(' ')}`));
        for (const n of taggedNodes) {
          const key = `${n._page || ''}|${(n.target || []).join(' ')}`;
          if (!seen.has(key)) { existing.nodes.push(n); seen.add(key); }
        }
      }
    }
  }
  return { violations: [...ruleMap.values()], passes, incomplete };
}

async function scanSiteAttempt(startUrl, { maxPages = 5, perPageTimeout = 45000, lenientTls = false, settleMs = 12000, axeTags = AXE_TAGS } = {}) {
  if (!/^https?:\/\//i.test(startUrl)) startUrl = 'https://' + startUrl;
  const origin = new URL(startUrl).origin;
  // Adress-Cache pro Hostname für DNS-Rebinding-Pin im Crawl-Loop (Erstauflösung).
  const addrCache = new Map();
  const safeRoot = await assertPublicHttpUrl(startUrl);
  addrCache.set(new URL(safeRoot.url).hostname, safeRoot.addresses);
  maxPages = Math.max(1, Math.min(50, Number(maxPages) || 5));

  // IP-Pin: der Crawl bleibt same-origin (ein Host), daher genügt der Root-Host-Pin.
  // Redirects auf ANDERE Hosts fängt installSsrfGuard pro Request ab (SSRF C1).
  const pinArg = pinnedHostResolverArg(new URL(safeRoot.url).hostname, safeRoot.addresses);
  const visited = new Set();
  const queue = [startUrl];
  const pageResults = [];
  const errors = [];

  // browser AUSSERHALB des try deklarieren + launch INNERHALB -> finally schliesst
  // den Prozess auch dann, wenn newContext/newPage werfen (kein Zombie-/FD-Leak).
  let browser;
  try {
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-dev-shm-usage', ...(pinArg ? [pinArg] : [])]
    });
    const context = await browser.newContext({
      locale: 'de-DE',
      // lenientTls (env SCAN_PAID_LENIENT_TLS, via fulfill.js) erlaubt dem bezahlten
      // Multi-Page-Crawl, Seiten mit Zertifikats-Eigenheiten (Hostname-Mismatch,
      // unvollständige Kette) zu prüfen — sonst besteht der Gratis-Teaser, der Kauf
      // scheitert aber. SSRF-/Rebinding-Pin bleibt aktiv (orthogonal zu ignoreHTTPSErrors).
      ignoreHTTPSErrors: lenientTls || process.env.SCAN_IGNORE_HTTPS === 'true',
      userAgent: 'Mozilla/5.0 (compatible; BFSG-Audit/1.0; +https://example.com/bfsg-check)'
    });

    while (queue.length && visited.size < maxPages) {
      const target = queue.shift();
      if (visited.has(target)) continue;
      visited.add(target);

      // SSRF-Schutz auch für entdeckte Links (DNS-Auflösung jeder URL).
      let safeTarget;
      try {
        safeTarget = await assertPublicHttpUrl(target);
        addrCache.set(new URL(safeTarget.url).hostname, safeTarget.addresses);
      } catch (e) {
        errors.push({ url: target, error: 'url-guard: ' + e.message });
        continue;
      }

      const page = await context.newPage();
      await installSsrfGuard(page);
      try {
        // Rebinding-Pin + robustes Laden (networkidle → domcontentloaded-Fallback).
        await gotoResilient(page, safeTarget.url, safeTarget.addresses, perPageTimeout, settleMs);
        const results = await new AxeBuilder({ page })
          .withTags(axeTags)
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
    await browser?.close().catch(() => {});
  }

  const { violations, passes, incomplete } = aggregatePageResults(pageResults);

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
