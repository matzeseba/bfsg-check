'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { CockpitSummary } from '@/lib/types';

interface Props {
  ads: CockpitSummary['ads'];
}

export function GoogleAdsPanel({ ads }: Props) {
  const googleAds = ads.find((a) => a.source === 'google');

  if (!googleAds) {
    return (
      <div className="glass-card p-4 h-full flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Google Ads
        </h2>
        <p className="text-[var(--text-muted)] text-sm">Google Ads nicht konfiguriert</p>
        <p className="text-[var(--text-muted)] text-xs">
          Verbinde dein Google Ads-Konto, um Performance-Daten zu sehen.
        </p>
      </div>
    );
  }

  const campaignData = googleAds.campaigns.map((c) => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
    Ausgaben: c.spend,
    Budget: c.budget,
  }));

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Google Ads
      </h2>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-lg font-bold text-[var(--text-primary)]" aria-label={`Ausgaben heute: ${googleAds.spendToday.toFixed(2)} Euro`}>
            {googleAds.spendToday.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[var(--text-muted)] text-xs">Heute</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[var(--text-primary)]" aria-label={`Ausgaben Monat: ${googleAds.spendMonth.toFixed(2)} Euro`}>
            {googleAds.spendMonth.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[var(--text-muted)] text-xs">Monat</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[var(--accent-secondary)]" aria-label={`ROAS: ${googleAds.roas !== null ? googleAds.roas.toFixed(1) + 'x' : 'nicht verfügbar'}`}>
            {googleAds.roas !== null ? `${googleAds.roas.toFixed(1)}x` : '—'}
          </p>
          <p className="text-[var(--text-muted)] text-xs">ROAS</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]" aria-label={`Klicks: ${googleAds.clicks}`}>{googleAds.clicks.toLocaleString('de-DE')}</p>
          <p className="text-[var(--text-muted)] text-xs">Klicks</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]" aria-label={`Impressionen: ${googleAds.impressions}`}>{googleAds.impressions.toLocaleString('de-DE')}</p>
          <p className="text-[var(--text-muted)] text-xs">Impressionen</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--accent-success)]" aria-label={`Conversions: ${googleAds.conversions}`}>{googleAds.conversions}</p>
          <p className="text-[var(--text-muted)] text-xs">Conversions</p>
        </div>
      </div>

      {campaignData.length > 0 && (
        <div className="flex-1 min-h-[80px]" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0d1117', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '6px', color: '#e2e8f0', fontSize: '11px' }}
              />
              <Bar dataKey="Ausgaben" fill="#00d4ff" opacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Budget" fill="#475569" opacity={0.4} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
