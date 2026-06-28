// Cookie-/Consent-Scan (§ 25 TDDDG): lädt die Seite OHNE Banner-Interaktion und
// misst, welche Dritt-Tracker + Cookies bereits VOR einer Einwilligung feuern.
// Ergebnis ist axe-kompatibel (report.js rendert es).
//
// Ehrliche Mess-Philosophie (nach Review): HARTES Signal = gesetzte Tracking-Cookies.
// Beobachtete Tracker-Requests sind ein WEICHES Signal (Consent Mode v2 kann
// cookielos/zulässig sein) → niedrigere Schwere + verifizieren-Formulierung.

import { chromium } from 'playwright';
import { assertPublicHttpUrl, verifyNoDnsRebinding, installSsrfGuard } from './url-guard.js';

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

export async function scanCookie(url, { timeout = 45000, lenientTls = false } = {}) {
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  // SSRF + Rebinding-Pin
  const safe = await assertPublicHttpUrl(url);
  url = safe.url;
  const siteReg = regDomain(reqHost(url));
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
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

  try {
    // Rebinding-Verify VOR dem try — darf nicht vom networkidle-Fallback
    // verschluckt werden (sonst Rebinding-/SSRF-Schutz umgangen).
    await verifyNoDnsRebinding(url, safe.addresses);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout });
    } catch {
      // networkidle kann auf Tracking-lastigen Seiten nie eintreten → Fallback.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    }
    // Scroll-getriggerte/lazy Tags anstoßen, dann setteln lassen.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await page.waitForTimeout(4000);

    const cookies = await context.cookies();
    const preConsentCookies = cookies
      .map((c) => c.name)
      .filter((n) =>
        TRACKING_COOKIE_PREFIX.some((p) => n.startsWith(p)) ||
        TRACKING_COOKIE_EXACT.includes(n)
      );

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
    const bannerPresent = bannerInfo.present;
    const title = await page.title();

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
      violations, passes, incomplete: 0
    };
  } finally {
    await browser.close();
  }
}
