// Paid-Ads-Domäne: Kampagnen-Factory, Job-Kanal-Mapping, Metrik-Upsert + Summary.
// Reine lokale Persistenz (data/ads.json, data/ads-metrics.json) — KEINE echten
// Google-/Bing-Ads-API-Calls (siehe ARCHITECTURE.md §2).
import { ymd } from './util.js';

// campaign.channel ("google"|"bing") -> job.channel (Legal-Gate-Whitelist in policy/compliance.json)
const CAMPAIGN_TO_JOB_CHANNEL = { google: 'paid_ads_google', bing: 'paid_ads_bing' };

export function jobChannelFor(campaignChannel) {
  return CAMPAIGN_TO_JOB_CHANNEL[campaignChannel] || null;
}

export function nextCampaignId(existingCampaigns = [], now = new Date()) {
  const prefix = `camp_${ymd(now)}_`;
  let max = 0;
  for (const c of existingCampaigns) {
    if (c && typeof c.id === 'string' && c.id.startsWith(prefix)) {
      const n = Number.parseInt(c.id.slice(prefix.length), 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

/** Baut eine neue Kampagne im Status "review" (Job-Ausarbeitung läuft noch). */
export function makeCampaign({
  existingCampaigns = [],
  name,
  channel,
  goal,
  budgetPerDay,
  notes = '',
  jobId = null,
  now = new Date(),
}) {
  const id = nextCampaignId(existingCampaigns, now);
  return {
    id,
    name: name || `${goal} (${channel})`,
    channel,
    goal,
    budgetPerDay,
    notes: notes || '',
    status: 'review',
    jobId,
    createdAt: now.toISOString(),
    liveAt: null,
    liveUrl: null,
  };
}

/** Prompt-Text für den ads-campaign-builder-Agenten aus den Owner-Parametern. */
export function buildAdsPromptTemplate({ goal, channel, budgetPerDay, notes }) {
  const channelLabel = channel === 'google' ? 'Google Ads' : 'Microsoft/Bing Ads';
  const notesLine = notes ? `\nZusätzliche Hinweise: ${notes}` : '';
  return [
    `Erarbeite eine vollständige ${channelLabel}-Kampagne für {product} ({domain}), Stand {date}.`,
    `Kampagnen-Ziel: ${goal}`,
    `Tagesbudget: ${budgetPerDay} € (Kanal: ${channel})${notesLine}`,
    'Liefere: 15 RSA-Headlines (max. 30 Zeichen), 4 Descriptions (max. 90 Zeichen), eine ' +
      'Keyword-Liste (Exact+Phrase) inkl. Negativ-Keywords, eine Anzeigengruppen-Struktur, eine ' +
      'Budget-Aufteilung je Anzeigengruppe basierend auf dem Tagesbudget sowie eine ' +
      'Landingpage-Empfehlung. Stil-Referenz: marketing/google-ads-rsa-headlines.md.',
  ].join('\n');
}

/** Upsert per campaignId+date (neuester Import gewinnt), gibt neue Liste zurück (immutable). */
export function upsertMetric(metrics, entry) {
  const idx = metrics.findIndex((m) => m.campaignId === entry.campaignId && m.date === entry.date);
  if (idx === -1) return [...metrics, entry];
  const next = [...metrics];
  next[idx] = entry;
  return next;
}

/** Metrik-Einträge einer Kampagne, aufsteigend nach Datum (für GET .../:id/metrics). */
export function metricsForCampaign(metrics, campaignId) {
  return metrics
    .filter((m) => m.campaignId === campaignId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function safeDiv(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : null;
}

function emptyAgg() {
  return { spend: 0, impressions: 0, clicks: 0, conversions: 0 };
}

function addAgg(agg, m) {
  agg.spend += m.costEur;
  agg.impressions += m.impressions;
  agg.clicks += m.clicks;
  agg.conversions += m.conversions;
}

function withRates(agg) {
  return {
    ...agg,
    cpc: safeDiv(agg.spend, agg.clicks),
    ctr: safeDiv(agg.clicks, agg.impressions),
    cac: safeDiv(agg.spend, agg.conversions),
  };
}

/** { perCampaign, totals, timeseries } je Kampagne + gesamt + Tageszeitreihe. */
export function summarize(campaigns, metrics, { from, to } = {}) {
  const inRange = metrics.filter((m) => {
    if (from && m.date < from) return false;
    if (to && m.date > to) return false;
    return true;
  });

  const byCampaign = new Map();
  for (const c of campaigns) {
    byCampaign.set(c.id, { campaignId: c.id, name: c.name, channel: c.channel, ...emptyAgg() });
  }

  const byDay = new Map();
  for (const m of inRange) {
    let bucket = byCampaign.get(m.campaignId);
    if (!bucket) {
      bucket = { campaignId: m.campaignId, name: null, channel: null, ...emptyAgg() };
      byCampaign.set(m.campaignId, bucket);
    }
    addAgg(bucket, m);

    const day = byDay.get(m.date) || { date: m.date, ...emptyAgg() };
    addAgg(day, m);
    byDay.set(m.date, day);
  }

  const perCampaign = [...byCampaign.values()].map((b) => {
    const { campaignId, name, channel, ...agg } = b;
    return { campaignId, name, channel, ...withRates(agg) };
  });

  const totalAgg = perCampaign.reduce((acc, c) => {
    acc.spend += c.spend;
    acc.impressions += c.impressions;
    acc.clicks += c.clicks;
    acc.conversions += c.conversions;
    return acc;
  }, emptyAgg());

  const timeseries = [...byDay.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, ...withRates(d) }));

  return { perCampaign, totals: withRates(totalAgg), timeseries };
}
