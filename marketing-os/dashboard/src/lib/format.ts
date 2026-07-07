// Formatierungs- und Label-Helfer. Deutsche Texte mit echten Umlauten (ä/ö/ü/ß).

import type { AdCampaignStatus, AdChannel, Cadence, JobStatus, KpiMetric, PublishActionType } from '../types';

const WEEKDAYS = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
];

const CHANNEL_LABELS: Record<string, string> = {
  seo_pillar: 'SEO-Pillar',
  aeo_answer: 'AEO-Antwort',
  comparison_page: 'Vergleichsseite',
  pr_free: 'Presse (frei)',
  listings: 'Listings',
  haro_recherchescout: 'HARO / Recherchescout',
  show_hn: 'Show HN',
  awesome_lists: 'Awesome-Lists',
  newsletter_brevo: 'Newsletter (Brevo)',
  badge_distribution: 'Badge-Distribution',
  social_own_channels: 'Eigene Social-Kanäle',
  analytics_internal: 'Interne Analytics',
};

const STATUS_LABELS: Record<JobStatus, string> = {
  queued: 'Entwurf',
  running: 'Läuft',
  review: 'Wartet auf Freigabe',
  approved: 'Freigegeben — noch nicht veröffentlicht',
  published: 'Veröffentlicht',
  failed: 'Fehler',
  skipped: 'Übersprungen',
};

const STATUS_TOOLTIPS: Record<JobStatus, string> = {
  queued: 'Job wurde angelegt, die Erstellung läuft noch nicht.',
  running: 'Der Agent erstellt gerade den Inhalt.',
  review: 'Inhalt ist fertig und wartet auf deine Freigabe im Content-Review.',
  approved: 'Von dir freigegeben, aber noch nicht als veröffentlicht bestätigt.',
  published: 'Von dir als veröffentlicht bestätigt — inkl. Datum und ggf. Link.',
  failed: 'Bei der Erstellung ist ein Fehler aufgetreten.',
  skipped: 'Abgelehnt bzw. übersprungen — wird nicht veröffentlicht.',
};

export function statusTooltip(status: JobStatus): string {
  return STATUS_TOOLTIPS[status] ?? '';
}

const PUBLISH_ACTION_LABELS: Record<PublishActionType, string> = {
  'manual-browser': 'Manuell im Browser veröffentlichen',
  'repo-pr': 'Per Pull-Request im Repo veröffentlichen',
  none: 'Keine gesonderte Veröffentlichung nötig',
};

export function publishActionTypeLabel(type: PublishActionType): string {
  return PUBLISH_ACTION_LABELS[type] ?? type;
}

const AD_CAMPAIGN_STATUS_LABELS: Record<AdCampaignStatus, string> = {
  entwurf: 'Entwurf',
  review: 'Wartet auf Freigabe',
  freigegeben: 'Freigegeben',
  live: 'Live',
  pausiert: 'Pausiert',
};

export function adCampaignStatusLabel(status: AdCampaignStatus): string {
  return AD_CAMPAIGN_STATUS_LABELS[status] ?? status;
}

const AD_CHANNEL_LABELS: Record<AdChannel, string> = {
  google: 'Google Ads',
  bing: 'Bing Ads',
};

export function adChannelLabel(channel: AdChannel): string {
  return AD_CHANNEL_LABELS[channel] ?? channel;
}

const METRIC_LABELS: Record<KpiMetric, string> = {
  visits: 'Besuche',
  impressions: 'Impressionen',
  clicks: 'Klicks',
  leads: 'Leads',
  sales_eur: 'Umsatz (€)',
};

export function channelLabel(channel: string): string {
  return CHANNEL_LABELS[channel] ?? channel;
}

export function statusLabel(status: JobStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function metricLabel(metric: KpiMetric): string {
  return METRIC_LABELS[metric] ?? metric;
}

export const METRIC_ORDER: KpiMetric[] = [
  'leads',
  'visits',
  'impressions',
  'clicks',
  'sales_eur',
];

export function cadenceLabel(cadence: Cadence): string {
  const hour = typeof cadence.hour === 'number' ? String(cadence.hour).padStart(2, '0') : '06';
  switch (cadence.type) {
    case 'daily':
      return `Täglich um ${hour}:00 Uhr`;
    case 'weekly': {
      const day = typeof cadence.weekday === 'number' ? WEEKDAYS[cadence.weekday] ?? '' : '';
      return `Wöchentlich${day ? ` (${day})` : ''} um ${hour}:00 Uhr`;
    }
    case 'interval':
      return `Alle ${cadence.everyHours ?? '?'} Stunden`;
    case 'once':
      return 'Einmalig';
    default:
      return cadence.type;
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

export function todayISO(): string {
  return isoDate(new Date());
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())} Uhr`;
}

export function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
  if (diffSec < 0) return 'gerade eben';
  if (diffSec < 60) return 'vor wenigen Sekunden';
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `vor ${min} Min.`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
  return formatDateTime(iso);
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value);
}

/** Rendert null/undefined als „—" statt einer irreführenden 0. */
export function formatOrDash(
  value: number | null | undefined,
  formatter: (v: number) => string = formatNumber,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return formatter(value);
}

/**
 * Formatiert einen Anteil als Prozentzahl. Erwartet einen Bruch (0–1, z. B. 0,05 = 5 %) —
 * passend zur Engine-Konvention (siehe engine/src/ads.js: safeDiv(clicks, impressions)).
 * Übergib niemals einen bereits skalierten 0–100-Wert.
 */
export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(value * 100)} %`;
}
