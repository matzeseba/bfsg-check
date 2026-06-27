// Zentrale Konfiguration. Lädt .env, leitet Pfade ab.
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const COCKPIT_ROOT = path.resolve(__dirname, '..');     // cockpit/
export const REPO_ROOT = path.resolve(COCKPIT_ROOT, '..');     // bfsg-check/
export const OUT_DIR = path.join(COCKPIT_ROOT, 'out');
fs.mkdirSync(OUT_DIR, { recursive: true });

const num = (v, d) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? d : Number(v));
const bool = (v, d) => (v === undefined ? d : v === 'true' || v === '1');

export const config = {
  host: process.env.COCKPIT_HOST || '127.0.0.1',
  port: num(process.env.COCKPIT_PORT, 4317),

  claudeBin: process.env.CLAUDE_BIN || 'claude',
  claudeMaxTurns: num(process.env.CLAUDE_MAX_TURNS, 12),
  jobConcurrency: num(process.env.JOB_CONCURRENCY, 2),

  stripeApiKey: process.env.STRIPE_API_KEY || '',
  prodBaseUrl: process.env.PROD_BASE_URL || 'https://bfsg-fix.de',
  adminToken: process.env.ADMIN_TOKEN || '',
  githubToken: process.env.GITHUB_TOKEN || '',
  githubRepo: process.env.GITHUB_REPO || 'matzeseba/bfsg-check',
  googleAds: {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || '',
  },

  sttUrl: process.env.STT_URL || 'http://127.0.0.1:5301',
  ttsUrl: process.env.TTS_URL || 'http://127.0.0.1:5302',
  voiceEnabled: bool(process.env.VOICE_ENABLED, true),

  cacCeiling: num(process.env.CAC_CEILING, 177),
  adsBudgetMonth: num(process.env.ADS_BUDGET_MONTH, 600),

  paths: {
    out: OUT_DIR,
    jobsLog: path.join(OUT_DIR, 'cockpit-jobs.jsonl'),
    auditLog: path.join(OUT_DIR, 'cockpit-actions.jsonl'),
    kpiCache: path.join(OUT_DIR, 'kpi-cache.json'),
  },
};

export function googleAdsConfigured() {
  const g = config.googleAds;
  return !!(g.clientId && g.clientSecret && g.refreshToken && g.developerToken && g.customerId);
}
