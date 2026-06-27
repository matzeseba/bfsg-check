/**
 * Stripe-Connector: Umsatz, Sales, AOV, MRR, Vormonat, Refunds.
 *
 * Gibt bei fehlendem STRIPE_API_KEY sauber {configured:false} zurück — kein Crash.
 * Pagination: max. 10 Seiten à 100 Charges (= max. 1.000 Charges) pro Zeitraum.
 * Timeout: 10 s pro Request (AbortSignal).
 * Refunds: only count charges where refunded === false (schließt vollständige Rückerstattungen aus).
 * Partial-Refunds: amount_refunded > 0 wird als netto (amount - amount_refunded) gewertet.
 */
import { config } from '../config.js';

// ── Zeithelfer ──────────────────────────────────────────────────────────────

function startOfTodayUnix() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function startOfMonthUnix(offsetMonths = 0) {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  if (offsetMonths !== 0) {
    d.setMonth(d.getMonth() + offsetMonths);
  }
  return Math.floor(d.getTime() / 1000);
}

function endOfPrevMonthUnix() {
  // letzter Moment des Vormonats = eine Sekunde vor Monatsbeginn heute
  return startOfMonthUnix(0) - 1;
}

// ── Stripe-Fetch-Primitiv ────────────────────────────────────────────────────

async function stripeGet(path, params = {}) {
  const url = new URL(`https://api.stripe.com/v1/${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      authorization: `Bearer ${config.stripeApiKey}`,
      'stripe-version': '2024-06-20',
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    let msg = `Stripe HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg += `: ${j?.error?.message || JSON.stringify(j)}`;
    } catch { /* Ignore parse errors */ }
    throw new Error(msg);
  }
  return res.json();
}

// ── Paginator ─────────────────────────────────────────────────────────────────

async function listCharges(sinceUnix, untilUnix = undefined) {
  const out = [];
  let startingAfter;
  for (let page = 0; page < 10; page++) {
    const params = {
      limit: '100',
      'created[gte]': String(sinceUnix),
    };
    if (untilUnix !== undefined) params['created[lte]'] = String(untilUnix);
    if (startingAfter) params.starting_after = startingAfter;

    const j = await stripeGet('charges', params);
    const data = j.data || [];
    out.push(...data);
    if (!j.has_more || data.length === 0) break;
    startingAfter = data[data.length - 1]?.id;
  }
  return out;
}

// ── Stripe Analytics API (MRR) ────────────────────────────────────────────────
// Nur verfügbar mit Preview-API-Version. Schlägt graceful fehl → mrr = 0.

async function fetchMrr() {
  try {
    const now = new Date();
    const res = await fetch('https://api.stripe.com/v1/data/metric_queries', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.stripeApiKey}`,
        'stripe-version': '2026-04-22.preview',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'metric[id]': 'revenue.mrr',
        'time_range[start_time]': String(Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000)),
        'time_range[end_time]': String(Math.floor(now.getTime() / 1000)),
        'granularity': 'day',
      }).toString(),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return 0;
    const j = await res.json();
    // Analytics-API gibt Werte in Cents zurück — letzten Datenpunkt nehmen
    const results = j?.data?.results || [];
    if (results.length === 0) return 0;
    const last = results[results.length - 1];
    return (last?.value ?? 0) / 100;
  } catch {
    return 0;
  }
}

// ── Aggregation ───────────────────────────────────────────────────────────────

function aggregateCharges(charges, fromTs) {
  let revenue = 0;
  let countSales = 0;
  let countToday = 0;
  let revenueToday = 0;
  const split = new Map();

  for (const c of charges) {
    // Vollständig rückerstattet → ignorieren
    if (c.refunded === true) continue;
    // Netto-Betrag (nach partieller Erstattung)
    const net = (c.amount - (c.amount_refunded || 0)) / 100;
    if (net <= 0) continue;

    revenue += net;
    countSales++;

    if (c.created >= fromTs) {
      revenueToday += net;
      countToday++;
    }

    const pkg = c.metadata?.pkg || c.metadata?.package || 'unbekannt';
    const cur = split.get(pkg) || { pkg, count: 0, revenue: 0 };
    cur.count++;
    cur.revenue = Math.round((cur.revenue + net) * 100) / 100;
    split.set(pkg, cur);
  }

  return {
    revenue: Math.round(revenue * 100) / 100,
    countSales,
    revenueToday: Math.round(revenueToday * 100) / 100,
    countToday,
    packageSplit: [...split.values()],
  };
}

// ── Haupt-Export ──────────────────────────────────────────────────────────────

export async function fetchStripe() {
  if (!config.stripeApiKey) {
    return {
      configured: false,
      revenueToday: 0, revenueMonth: 0, revenuePrevMonth: 0,
      salesToday: 0, salesMonth: 0,
      mrr: 0, aov: 0,
      packageSplit: [],
    };
  }

  try {
    const monthStart = startOfMonthUnix(0);
    const prevMonthStart = startOfMonthUnix(-1);
    const prevMonthEnd = endOfPrevMonthUnix();
    const todayStart = startOfTodayUnix();

    // Alle drei Abrufe parallel — schneller und weniger API-Calls blockieren sich gegenseitig
    const [monthCharges, prevCharges, mrr] = await Promise.all([
      listCharges(monthStart).then((c) => c.filter((ch) => ch.paid && ch.status === 'succeeded')),
      listCharges(prevMonthStart, prevMonthEnd).then((c) => c.filter((ch) => ch.paid && ch.status === 'succeeded')),
      fetchMrr(),
    ]);

    const month = aggregateCharges(monthCharges, todayStart);
    const prev = aggregateCharges(prevCharges, 0);

    const salesMonth = month.countSales;
    const aov = salesMonth > 0 ? Math.round((month.revenue / salesMonth) * 100) / 100 : 0;

    return {
      configured: true,
      revenueToday: month.revenueToday,
      revenueMonth: month.revenue,
      revenuePrevMonth: prev.revenue,
      salesToday: month.countToday,
      salesMonth,
      mrr,
      aov,
      packageSplit: month.packageSplit,
    };
  } catch (e) {
    return {
      configured: true,
      error: String(e.message || e),
      revenueToday: 0, revenueMonth: 0, revenuePrevMonth: 0,
      salesToday: 0, salesMonth: 0,
      mrr: 0, aov: 0,
      packageSplit: [],
    };
  }
}
