// Cookie-/Consent-Scan (§ 25 TDDDG): lädt die Seite OHNE Banner-Interaktion und
// misst, welche Dritt-Tracker + Cookies bereits VOR einer Einwilligung feuern.
// Ergebnis ist axe-kompatibel (report.js rendert es).
//
// Ehrliche Mess-Philosophie (nach Review): HARTES Signal = gesetzte Tracking-Cookies.
// Beobachtete Tracker-Requests sind ein WEICHES Signal (Consent Mode v2 kann
// cookielos/zulässig sein) → niedrigere Schwere + verifizieren-Formulierung.

import { chromium } from 'playwright';
import { assertPublicHttpUrl, verifyNoDnsRebinding, installSsrfGuard, pinnedHostResolverArg } from './url-guard.js';

// Bekannte Tracking-/Werbe-HOSTS (host-genau, keine nackten Substrings).
const TRACKER_HOSTS = [
  'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
  'googleadservices.com', 'googlesyndication.com', 'connect.facebook.net',
  'static.hotjar.com', 'hotjar.com', 'clarity.ms', 'ads.linkedin.com',
  'snap.licdn.com', 'analytics.tiktok.com', 'ct.pinterest.com',
  'static.criteo.net', 'taboola.com', 'outbrain.com', 'cdn.segment.com',
  'mixpanel.com', 'amplitude.com', 'bat.bing.com', 'fullstory.com'
];
// Pfad-Pattern (bewusst, nicht host-genau).
const TRACKER_PATHS = ['facebook.com/tr'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// Eindeutige Tracking-Cookie-Präfixe (startsWith).
const TRACKING_COOKIE_PREFIX = ['_ga', '_gid', '_gat', '_gcl', '_fbp', '_hj', '_uet', '_clck', '_clsk', '_pin_'];
// Mehrdeutige Namen → nur EXAKTE Gleichheit.
const TRACKING_COOKIE_EXACT = ['fr', 'IDE', 'NID', 'ANID', 'MUID', 'test_cookie', 'personalization_id'];

function reqHost(url) {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}
function regDomain(host) {
  const p = String(host).split('.').filter(Boolean);
  return p.length <= 2 ? host : p.slice(-2).join('.');
}
function hostInList(host, list) {
  return list.find((h) => host === h || host.endsWith('.' + h));
}

export async function scanCookie(url, { timeout = 45000, lenientTls = false, maxPages = 1 } = {}) {
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  // SSRF + Rebinding-Pin
  const safe = await assertPublicHttpUrl(url);
  url = safe.url;
  // IP-Pin: Chromium-Resolver auf die geprüfte öffentliche IP zwingen (SSRF C1).
  // Schließt das TOCTOU-Restfenster zwischen verifyNoDnsRebinding und Chromiums
  // eigener Auflösung (1:1 wie scanUrl/scanSite in scan.js).
  const pinArg = pinnedHostResolverArg(new URL(safe.url).hostname, safe.addresses);
  const siteReg = regDomain(reqHost(url));
  const origin = new URL(url).origin;
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage', ...(pinArg ? [pinArg] : [])]
  });
  const context = await browser.newContext({
    locale: 'de-DE',
    // lenientTls (env SCAN_PAID_LENIENT_TLS, via fulfill.js) — analog scan.js. Cookie-
    // Pakete sind bezahlte Produkte und dürfen an Zertifikats-Eigenheiten nicht still
    // scheitern. SSRF-/Rebinding-Schutz bleibt unberührt (separater DNS-/IP-Check).
    ignoreHTTPSErrors: lenientTls || process.env.SCAN_IGNORE_HTTPS === 'true'
  });
  const page = await context.newPage();
  await installSsrfGuard(page);

  const trackerHits = new Set();
  const fontHits = new Set();
  page.on('request', (req) => {
    const u = req.url();
    const host = reqHost(u);
    if (!host) return;
    // Erst-Partei (gleiche registrierbare Domain) NICHT als Dritt-Tracker werten.
    const isThirdParty = regDomain(host) !== siteReg;
    if (isThirdParty) {
      const t = hostInList(host, TRACKER_HOSTS) || TRACKER_PATHS.find((p) => u.toLowerCase().includes(p));
      if (t) trackerHits.add(t);
    }
    const f = hostInList(host, FONT_HOSTS);
    if (f) fontHits.add(f);
  });

  // F19: schlankes same-origin Multi-Page (Startseite + bis zu maxPages-1 auf der
  // Startseite gefundene interne Links, sequentiell in DERSELBEN Page/Browser-Context
  // — Cookies akkumulieren im selben Cookie-Jar wie bei einem echten Website-Besuch,
  // Tracker-Requests werden über den bereits registrierten 'request'-Listener über
  // ALLE Navigationen hinweg mitgezählt). Kein voller BFS-Crawl wie scanSite: das
  // Consent-Signal ist praxisnah site-weit ähnlich, ein tiefer Crawl lohnt hier nicht.
  maxPages = Math.max(1, Math.min(10, Number(maxPages) || 1));
  const targets = [url];
  const visited = new Set();
  let bannerPresent = false;
  let title = '';

  try {
    for (let i = 0; i < targets.length && visited.size < maxPages; i++) {
      const target = targets[i];
      if (visited.has(target)) continue;
      // Jedes Ziel frisch gegen SSRF/DNS-Rebinding prüfen (analog scanSite) —
      // same-origin heißt nicht zwingend gleiche IP über die Zeit.
      let safeTarget;
      try {
        safeTarget = i === 0 ? safe : await assertPublicHttpUrl(target);
      } catch {
        continue; // Ziel nicht erreichbar/erlaubt — überspringen, Rest weiterlaufen lassen.
      }
      visited.add(target);
      // Rebinding-Verify VOR dem try — darf nicht vom networkidle-Fallback
      // verschluckt werden (sonst Rebinding-/SSRF-Schutz umgangen).
      await verifyNoDnsRebinding(safeTarget.url, safeTarget.addresses);
      let resp;
      try {
        resp = await page.goto(safeTarget.url, { waitUntil: 'networkidle', timeout });
      } catch {
        // networkidle kann auf Tracking-lastigen Seiten nie eintreten → Fallback.
        resp = await page.goto(safeTarget.url, { waitUntil: 'domcontentloaded', timeout });
      }
      // F5: HTTP-Fehlerstatus (4xx/5xx) NICHT als sauberen Cookie-Scan werten
      // (analog scan.js) — sonst liefert eine 404-/WAF-Seite ein "sauberes"
      // bezahltes Cookie-Ergebnis. Auf der Startseite fatal, auf einer Folgeseite
      // wird nur diese Seite übersprungen (Startseiten-Messung bleibt gültig).
      if (resp && resp.status() >= 400) {
        if (i === 0) throw new Error(`http-status-${resp.status()}`);
        continue;
      }
      // Scroll-getriggerte/lazy Tags anstoßen, dann setteln lassen.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
      await page.waitForTimeout(4000);

      // Banner-/CMP-Erkennung: bekannte CMP-Signaturen + voller Text + Shadow-Roots.
      const bannerInfo = await page.evaluate(() => {
        const CMP_SELECTORS = ['#usercentrics-root', '#CybotCookiebotDialog', '#onetrust-banner-sdk',
          '[id*="cookie"]', '[class*="consent"]', '[class*="cookie"]', '[aria-label*="ookie"]'];
        if (CMP_SELECTORS.some((s) => document.querySelector(s))) return { present: true };
        const rx = /(cookie|consent|datenschutz|zustimm|akzeptier|einwillig)/i;
        const scan = (root) => Array.from(root.querySelectorAll('div,section,aside,dialog,[role="dialog"]'))
          .some((e) => {
            const r = e.getBoundingClientRect ? e.getBoundingClientRect() : { height: 99, width: 999 };
            return rx.test(e.textContent || '') && r.height > 30 && r.width > 180;
          });
        if (scan(document)) return { present: true };
        // Best-effort Shadow-DOM
        const hosts = Array.from(document.querySelectorAll('*')).filter((e) => e.shadowRoot).slice(0, 50);
        for (const h of hosts) { try { if (scan(h.shadowRoot)) return { present: true }; } catch {} }
        return { present: false };
      });
      if (bannerInfo.present) bannerPresent = true;
      if (i === 0) title = await page.title();

      // Folge-Links nur auf der Startseite sammeln (same-origin, ohne Fragment/Mailto/JS).
      if (i === 0 && targets.length < maxPages) {
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
          if (!targets.includes(l)) targets.push(l);
        }
      }
    }

    const cookies = await context.cookies();
    const preConsentCookies = cookies
      .map((c) => c.name)
      .filter((n) =>
        TRACKING_COOKIE_PREFIX.some((p) => n.startsWith(p)) ||
        TRACKING_COOKIE_EXACT.includes(n)
      );

    const violations = [];
    // HARTES Signal: nicht-notwendige Cookies vor Consent.
    if (preConsentCookies.length) {
      violations.push({
        id: 'cookie-before-consent', impact: 'serious',
        help: 'Nicht-notwendige Cookies vor Einwilligung',
        description: 'Tracking-Cookies wurden ohne Einwilligung gesetzt.',
        tags: ['TDDDG-25'], nodes: preConsentCookies.map((n) => ({ target: [n] }))
      });
    }
    // WEICHES Signal: Tracker-Requests beobachtet (Consent Mode v2 ggf. zulässig).
    if (trackerHits.size) {
      violations.push({
        id: 'tracker-before-consent', impact: 'moderate',
        help: 'Tracker-Request vor Einwilligung beobachtet',
        description: 'Anfrage an Tracking-/Werbe-Host vor Einwilligung.',
        tags: ['TDDDG-25'], nodes: [...trackerHits].map((h) => ({ target: [h] }))
      });
    }
    // no-cookie-banner nur, wenn Tracker UND definitiv kein Banner/CMP.
    if (trackerHits.size && !bannerPresent) {
      violations.push({
        id: 'no-cookie-banner', impact: 'moderate',
        help: 'Kein Consent-Banner erkennbar',
        description: 'Tracker beobachtet, aber kein Banner/CMP gefunden (bitte manuell verifizieren).',
        tags: ['TDDDG-25'], nodes: [{ target: ['document'] }]
      });
    }
    if (fontHits.size) {
      violations.push({
        id: 'google-fonts-hotlink', impact: 'moderate',
        help: 'Google Fonts dynamisch geladen',
        description: 'Schriften von Google-Servern (IP-Transfer USA).',
        tags: ['DSGVO'], nodes: [...fontHits].map((h) => ({ target: [h] }))
      });
    }

    let passes = 0;
    if (!trackerHits.size) passes++;
    if (!preConsentCookies.length) passes++;
    if (bannerPresent) passes++;
    if (!fontHits.size) passes++;

    return {
      url, scannedAt: new Date().toISOString(), reportKind: 'cookie',
      meta: { title, bannerPresent, trackerCount: trackerHits.size, cookieCount: cookies.length },
      pagesScanned: visited.size,
      violations, passes, incomplete: 0
    };
  } finally {
    await browser.close();
  }
}
