'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  kpis: CockpitSummary['kpis'];
}

export function UnitEconomicsPanel({ kpis }: Props) {
  const { cac, cacCeiling, roas, aov } = kpis;

  if (cac === null) {
    return (
      <div className="glass-card p-4 h-full flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Unit Economics
        </h2>
        <p className="text-[var(--text-muted)] text-sm">Werbeausgaben noch nicht konfiguriert</p>
        <p className="text-[var(--text-muted)] text-xs">Verbinde Google Ads oder Bing Ads, um CAC und ROAS zu berechnen.</p>
      </div>
    );
  }

  const ltv = aov * 1.3;
  const ltvCacRatio = cac > 0 ? ltv / cac : null;
  const stripeFee = aov * 0.014 + 0.25;
  const grossMargin = aov - stripeFee;

  const cacOk = cac < 100;
  const cacWarn = cac >= 100 && cac <= cacCeiling;

  const cacColor = cacOk ? 'text-[var(--accent-success)]' : cacWarn ? 'text-[var(--accent-warn)]' : 'text-red-400';
  const ltvRatioColor = ltvCacRatio !== null && ltvCacRatio >= 3 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-warn)]';

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Unit Economics
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={`text-xl font-bold ${cacColor}`} aria-label={`CAC: ${cac.toFixed(2)} Euro`}>
            {cac.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[var(--text-muted)] text-xs">CAC (Ceiling: {cacCeiling} €)</p>
        </div>
        <div>
          <p className="text-xl font-bold text-[var(--accent-secondary)]" aria-label={`ROAS: ${roas !== null ? roas.toFixed(1) + 'x' : 'nicht verfügbar'}`}>
            {roas !== null ? `${roas.toFixed(1)}x` : '—'}
          </p>
          <p className="text-[var(--text-muted)] text-xs">ROAS</p>
        </div>
        <div>
          <p className="text-xl font-bold text-[var(--accent-primary)]" aria-label={`LTV geschätzt: ${ltv.toFixed(2)} Euro`}>
            {ltv.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[var(--text-muted)] text-xs">LTV (AOV × 1,3)</p>
        </div>
        <div>
          <p className={`text-xl font-bold ${ltvRatioColor}`} aria-label={`LTV zu CAC Verhältnis: ${ltvCacRatio !== null ? ltvCacRatio.toFixed(1) : 'nicht verfügbar'}`}>
            {ltvCacRatio !== null ? `${ltvCacRatio.toFixed(1)}:1` : '—'}
          </p>
          <p className="text-[var(--text-muted)] text-xs">LTV:CAC (Ziel 3:1)</p>
        </div>
      </div>

      <div className="border-t border-white/5 pt-2">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">Gross Margin (nach Stripe)</span>
          <span className="text-[var(--text-primary)] font-medium">
            {grossMargin.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>
    </div>
  );
}
