// Adapter-Schicht für externe Datenquellen. v1: NUR Präsenz-Check von Env-Vars — keine
// echten API-Calls (siehe ARCHITECTURE.md §2: keine Live-API-Calls). Spätere echte
// Anbindungen (Stripe/Brevo/Google Ads/Bing Ads) docken hinter diesem Interface an,
// ohne dass Aufrufer (api.js) angepasst werden müssen.
import { demoMeta } from './demo.js';

const INTEGRATION_ENV = {
  stripe: 'STRIPE_API_KEY',
  brevo: 'BREVO_API_KEY',
  googleAds: 'GOOGLE_ADS_TOKEN',
  bingAds: 'BING_ADS_TOKEN',
};

/** Präsenz-Check je Integration (kein Netzwerk-Call). */
export function integrationsStatus(env = process.env) {
  const out = {};
  for (const [key, envVar] of Object.entries(INTEGRATION_ENV)) {
    out[key] = { connected: Boolean(env[envVar] && String(env[envVar]).trim()) };
  }
  return out;
}

// "demo" | "real" | "none" (Kontrakt: dashboard/src/types.ts DataSourceOrigin). Ein einzelner
// demo:true-Treffer reicht für "demo" — konservativ, damit ein gemischter Datensatz nicht
// fälschlich als vollständig "real" angezeigt wird (Team B kennt keinen "gemischt"-Zustand).
export function sourceLabel(items) {
  const { demoCount, totalCount } = demoMeta(items);
  if (totalCount === 0) return 'none';
  return demoCount > 0 ? 'demo' : 'real';
}

/** Gesamtbild: woher kommen kpis/leads gerade, welche Integrationen sind konfiguriert. */
export async function datasourcesSnapshot(store, env = process.env) {
  const [kpis, leads] = await Promise.all([store.readKpis(), store.readLeads()]);
  return {
    kpis: { source: sourceLabel(kpis) },
    leads: { source: sourceLabel(leads) },
    integrations: integrationsStatus(env),
  };
}
