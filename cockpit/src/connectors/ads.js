/**
 * Ads-Connector (Google Ads / Bing Ads — graceful).
 *
 * Google Ads:
 *   - Benötigt alle 5 GOOGLE_ADS_*-Variablen UND das npm-Paket "google-ads-api".
 *   - Import ist DYNAMISCH + optional (try/catch): das Backend startet ohne das Paket.
 *   - Falls das Paket fehlt → {configured:false} mit erklärendem setupNote.
 *   - Falls das Paket vorhanden und Credentials gesetzt → GAQL-Abfrage für
 *     heutigen und monatlichen Spend, Impressions, Clicks, Conversions.
 *
 * Bing Ads:
 *   - Noch kein offizieller Node.js-Client. Placeholder mit {configured:false}.
 *   - TODO(v2): Microsoft Advertising REST API (OAuth2, BING_ADS_*-Variablen).
 *
 * HARTE REGEL: Keine schweren Dependencies, die den Build brechen.
 *   - "google-ads-api" wird dynamisch importiert.
 *   - Fehlt das Paket → graceful degradation, kein throw.
 *
 * TODO(optional): npm install google-ads-api  (nach Antrag und Genehmigung des
 *   Google Ads Developer Tokens, Genehmigungsdauer ca. 2-5 Werktage bei Google).
 *   Danach GAQL-Queries für spendToday, spendMonth, clicks, impressions, conversions.
 */
import { config, googleAdsConfigured } from '../config.js';

// ── GAQL-Abfrage (Heute) ──────────────────────────────────────────────────────

const GAQL_TODAY = `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.campaign_budget,
    metrics.cost_micros,
    metrics.impressions,
    metrics.clicks,
    metrics.conversions,
    metrics.all_conversions_value
  FROM campaign
  WHERE segments.date DURING TODAY
  ORDER BY metrics.cost_micros DESC
`;

const GAQL_MONTH = `
  SELECT
    metrics.cost_micros,
    metrics.impressions,
    metrics.clicks,
    metrics.conversions,
    metrics.all_conversions_value
  FROM campaign
  WHERE segments.date DURING THIS_MONTH
`;

// ── Google Ads Abruf (dynamischer Import) ────────────────────────────────────

async function fetchGoogleAds() {
  // Schritt 1: Paket dynamisch laden — schlägt graceful fehl wenn nicht installiert
  let GoogleAdsApi;
  try {
    const mod = await import('google-ads-api');
    GoogleAdsApi = mod.GoogleAdsApi;
    if (!GoogleAdsApi) throw new Error('GoogleAdsApi-Export nicht gefunden');
  } catch {
    return {
      source: 'google',
      configured: false,
      setupNote: 'Paket "google-ads-api" nicht installiert. Führe "npm install google-ads-api" aus und stelle sicher, dass ein genehmigter Developer Token vorliegt.',
      spendToday: 0, spendMonth: 0, clicks: 0, impressions: 0, conversions: 0,
      roas: null, campaigns: [],
    };
  }

  // Schritt 2: Client initialisieren
  const g = config.googleAds;
  const client = new GoogleAdsApi({
    client_id: g.clientId,
    client_secret: g.clientSecret,
    developer_token: g.developerToken,
  });

  const customer = client.Customer({
    customer_id: g.customerId,
    refresh_token: g.refreshToken,
  });

  // Schritt 3: Queries parallel ausführen
  const [todayRows, monthRows] = await Promise.all([
    customer.query(GAQL_TODAY.trim()),
    customer.query(GAQL_MONTH.trim()),
  ]);

  // Heute: Kampagnen-Breakdown
  let spendToday = 0, clicksToday = 0, impressionsToday = 0, conversionsToday = 0;
  const campaigns = [];

  for (const row of (todayRows || [])) {
    const costEur = (row.metrics?.cost_micros || 0) / 1_000_000;
    spendToday += costEur;
    clicksToday += row.metrics?.clicks || 0;
    impressionsToday += row.metrics?.impressions || 0;
    conversionsToday += row.metrics?.conversions || 0;

    campaigns.push({
      name: row.campaign?.name || 'Unbekannte Kampagne',
      status: (row.campaign?.status || 'UNKNOWN').toLowerCase(),
      budget: 0, // Budget-Abfrage erfordert separate resource-Anfrage — TODO(v2)
      spend: Math.round(costEur * 100) / 100,
    });
  }

  // Monat: Gesamt-Aggregat
  let spendMonth = 0, clicksMonth = 0, impressionsMonth = 0, conversionsMonth = 0;
  for (const row of (monthRows || [])) {
    spendMonth += (row.metrics?.cost_micros || 0) / 1_000_000;
    clicksMonth += row.metrics?.clicks || 0;
    impressionsMonth += row.metrics?.impressions || 0;
    conversionsMonth += row.metrics?.conversions || 0;
  }

  // ROAS = Umsatz / Spend (hier approximiert über all_conversions_value wenn vorhanden)
  // Echter ROAS kommt aus index.js (Stripe-Umsatz / Ads-Spend)
  const roas = spendMonth > 0
    ? Math.round((conversionsMonth / spendMonth) * 100) / 100
    : null;

  return {
    source: 'google',
    configured: true,
    spendToday: Math.round(spendToday * 100) / 100,
    spendMonth: Math.round(spendMonth * 100) / 100,
    clicks: clicksMonth,
    impressions: impressionsMonth,
    conversions: conversionsMonth,
    roas,
    campaigns,
  };
}

// ── Bing Ads Placeholder ──────────────────────────────────────────────────────
// TODO(v2): Microsoft Advertising REST API
// Benötigt: BING_ADS_CLIENT_ID, BING_ADS_CLIENT_SECRET, BING_ADS_REFRESH_TOKEN, BING_ADS_ACCOUNT_ID
// API: https://learn.microsoft.com/en-us/advertising/guides/

function bingAdsFallback() {
  return {
    source: 'bing',
    configured: false,
    setupNote: 'Microsoft Ads noch nicht konfiguriert. Siehe docs/ai-os-research/10-daten-setup.md.',
    spendToday: 0, spendMonth: 0, clicks: 0, impressions: 0, conversions: 0,
    roas: null, campaigns: [],
  };
}

// ── Haupt-Export ──────────────────────────────────────────────────────────────

export async function fetchAds() {
  const googleResult = googleAdsConfigured()
    ? await fetchGoogleAds().catch((e) => ({
        source: 'google',
        configured: true,
        error: String(e.message || e),
        spendToday: 0, spendMonth: 0, clicks: 0, impressions: 0, conversions: 0,
        roas: null, campaigns: [],
      }))
    : {
        source: 'google',
        configured: false,
        setupNote: 'GOOGLE_ADS_*-Variablen nicht vollständig gesetzt. Alle 5 Werte benötigt.',
        spendToday: 0, spendMonth: 0, clicks: 0, impressions: 0, conversions: 0,
        roas: null, campaigns: [],
      };

  return [googleResult, bingAdsFallback()];
}
