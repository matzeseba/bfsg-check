/**
 * Connector-Aggregator: führt alle Datenquellen zusammen und berechnet KPIs.
 *
 * KPI-Formeln (Stand: Architektur-Contract):
 *   revenueToday      = Stripe: Umsatz heute (EUR, netto nach Refunds)
 *   revenueMonth      = Stripe: Umsatz MTD (EUR, netto)
 *   revenuePrevMonth  = Stripe: Vormonats-Umsatz (EUR, netto)
 *   salesToday        = Stripe: Anzahl erfolgreicher Charges heute
 *   salesMonth        = Stripe: Anzahl Charges MTD
 *   mrr               = Stripe Analytics API (0 wenn Abo deaktiviert)
 *   aov               = revenueMonth / salesMonth (oder stripe.aov wenn vorhanden)
 *   cac               = adsSpendMonth / salesMonth (null wenn keine Ads-Daten)
 *   cacCeiling        = config-Wert (Standard: 177 EUR)
 *   roas              = revenueMonth / adsSpendMonth (null wenn kein Spend)
 *   convRate          = kaufCount / scans_today × 100 (null wenn kein Scan-Log)
 *   adsSpentMonth     = Summe Ads-Spend aller Quellen (Google + Bing)
 *   adsBudgetMonth    = config-Wert (Standard: 600 EUR)
 *
 * Cache: In-Memory + Filesystem (out/kpi-cache.json).
 * settled(): kein Connector-Fehler darf den Aggregator crashen.
 */
import fs from 'node:fs';
import { config } from '../config.js';
import { log } from '../log.js';
import { fetchHealth } from './health.js';
import { fetchOrders } from './orders.js';
import { fetchStripe } from './stripe.js';
import { fetchGithub } from './github.js';
import { fetchAds } from './ads.js';

// ── Cache ─────────────────────────────────────────────────────────────────────

let cache = null;

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

/**
 * Führt ein Promise aus; bei Fehler → Warn-Log + Fallback-Wert.
 * Kein Connector-Fehler soll refreshSummary() zum Absturz bringen.
 */
const settled = (p, fallback) =>
  p.then((v) => v).catch((e) => {
    log.warn({ err: String(e?.message || e) }, 'connector failed');
    return fallback;
  });

/**
 * Rundet auf 2 Nachkommastellen.
 */
const r2 = (n) => Math.round(n * 100) / 100;

// ── Aggregator ────────────────────────────────────────────────────────────────

export async function refreshSummary() {
  // Alle Quellen parallel — ein Fehler in einer Quelle blockiert die anderen nicht
  const [health, ordersRes, stripe, github, ads] = await Promise.all([
    settled(fetchHealth(), {
      ok: false, stripe: false, live: false, mailer: false,
      aboEnabled: false, reachable: false,
      checkedAt: new Date().toISOString(),
    }),
    settled(fetchOrders(), { configured: false, orders: [], kaufCount: 0 }),
    settled(fetchStripe(), {
      configured: false,
      revenueToday: 0, revenueMonth: 0, revenuePrevMonth: 0,
      salesToday: 0, salesMonth: 0, mrr: 0, aov: 0,
      packageSplit: [],
    }),
    settled(fetchGithub(), {
      configured: false,
      deploy: { status: 'unbekannt', sha: null, at: null, runUrl: null },
      uptime: { pct7d: null, pct30d: null },
    }),
    settled(fetchAds(), [
      {
        source: 'google', configured: false,
        spendToday: 0, spendMonth: 0, clicks: 0, impressions: 0, conversions: 0,
        roas: null, campaigns: [],
      },
    ]),
  ]);

  // ── Revenue & Sales ──────────────────────────────────────────────────────────

  const revenueToday    = stripe.revenueToday    ?? 0;
  const revenueMonth    = stripe.revenueMonth    ?? 0;
  const revenuePrevMonth = stripe.revenuePrevMonth ?? 0;
  const salesToday      = stripe.salesToday      ?? 0;
  // salesMonth: Stripe-Wert bevorzugen; Fallback auf Anzahl normalisierter Orders
  const salesMonth      = (stripe.salesMonth > 0)
    ? stripe.salesMonth
    : (ordersRes.kaufCount ?? 0);
  const mrr             = stripe.mrr             ?? 0;

  // ── AOV ──────────────────────────────────────────────────────────────────────
  // Stripe liefert bereits ein vorberechnetes aov wenn vorhanden
  const aov = stripe.aov > 0
    ? stripe.aov
    : (salesMonth > 0 ? r2(revenueMonth / salesMonth) : 0);

  // ── Ads-Daten ─────────────────────────────────────────────────────────────────

  const adsArray = Array.isArray(ads) ? ads : [ads];
  const adsSpendMonth  = r2(adsArray.reduce((s, a) => s + (a.spendMonth  || 0), 0));
  const adsSpendToday  = r2(adsArray.reduce((s, a) => s + (a.spendToday  || 0), 0));

  // ── CAC ──────────────────────────────────────────────────────────────────────
  // CAC = Ads-Spend MTD / Sales MTD (nur wenn beide Werte vorhanden und > 0)
  const cac = (adsSpendMonth > 0 && salesMonth > 0)
    ? r2(adsSpendMonth / salesMonth)
    : null;

  // ── ROAS ─────────────────────────────────────────────────────────────────────
  // ROAS = revenueMonth / adsSpendMonth (Stripe-Umsatz als Ground-Truth)
  const roas = (adsSpendMonth > 0 && revenueMonth > 0)
    ? r2(revenueMonth / adsSpendMonth)
    : null;

  // ── Conversion Rate ───────────────────────────────────────────────────────────
  // convRate = kaufCount / scan_count × 100
  // scan_count ist erst messbar, sobald Scan-Logging aktiviert ist (siehe Setup-Doku).
  // Bis dahin: null (Frontend zeigt "—")
  const convRate = null; // TODO: aus Scanner-Logs befüllen (10-daten-setup.md § 4)

  // ── Funnel ───────────────────────────────────────────────────────────────────

  const kaufCount = ordersRes.kaufCount ?? salesMonth;
  const funnel = [
    { stage: 'Scan gestartet',    count: null },      // benötigt Scanner-Log (TODO)
    { stage: 'Teaser gesehen',    count: null },      // nicht tracked
    { stage: 'Checkout geöffnet', count: null },      // nicht tracked
    { stage: 'Kauf',              count: kaufCount },
  ];

  // ── recentOrders (max. 10, jüngste zuerst) ───────────────────────────────────

  const orders = ordersRes.orders || [];
  // Sortierung: neueste ts zuerst
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 10);

  // ── Sources-Flags ────────────────────────────────────────────────────────────

  const sources = {
    stripe:  stripe.configured  ?? false,
    orders:  ordersRes.configured ?? false,
    github:  github.configured  ?? false,
    ads:     adsArray.some((a) => a.configured),
  };

  // ── Zusammenbauen ─────────────────────────────────────────────────────────────

  cache = {
    generatedAt: new Date().toISOString(),
    kpis: {
      revenueToday,
      revenueMonth,
      revenuePrevMonth,
      salesToday,
      salesMonth,
      mrr,
      aboEnabled:   !!health.aboEnabled,
      aov,
      cac,
      cacCeiling:   config.cacCeiling,  // 177 EUR hard ceiling
      roas,
      convRate,
    },
    health,
    packageSplit:  stripe.packageSplit || [],
    recentOrders,
    ads: adsArray,
    funnel,
    uptime:  github.uptime  || { pct7d: null, pct30d: null },
    deploy:  github.deploy  || { status: 'unbekannt' },
    budget: {
      adsSpentMonth:  adsSpendMonth,
      adsBudgetMonth: config.adsBudgetMonth,
      adsSpentToday:  adsSpendToday,
    },
    sources,
  };

  // Filesystem-Cache (best-effort — Fehler beim Schreiben darf nicht crashen)
  try {
    fs.writeFileSync(config.paths.kpiCache, JSON.stringify(cache, null, 2), 'utf8');
  } catch (e) {
    log.warn({ err: String(e?.message || e) }, 'kpi-cache write failed');
  }

  return cache;
}

export function getSummary() {
  return cache;
}
