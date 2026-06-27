'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  budget: CockpitSummary['budget'];
  kpis: CockpitSummary['kpis'];
}

const ADS_BUDGET_MONTH = 600;

export function AdsBurnRatePanel({ budget, kpis }: Props) {
  const { adsSpentMonth, adsBudgetMonth } = budget;
  const { revenueMonth } = kpis;
  const effectiveBudget = adsBudgetMonth || ADS_BUDGET_MONTH;

  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const dailyAvg = dayOfMonth > 0 ? adsSpentMonth / dayOfMonth : 0;
  const projectedMonthEnd = dailyAvg * daysInMonth;
  const budgetPct = Math.min((adsSpentMonth / effectiveBudget) * 100, 100);
  const breakEvenReached = revenueMonth >= adsSpentMonth;

  const fillClass =
    budgetPct > 90
      ? 'progress-bar-fill-error'
      : budgetPct > 70
      ? 'progress-bar-fill-warn'
      : 'progress-bar-fill-primary';

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Ads Burn Rate
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xl font-bold text-[var(--accent-primary)]" aria-label={`Täglicher Durchschnitt: ${dailyAvg.toFixed(2)} Euro`}>
            {dailyAvg.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[var(--text-muted)] text-xs">Ø täglich</p>
        </div>
        <div>
          <p
            className={`text-xl font-bold ${projectedMonthEnd > effectiveBudget ? 'text-red-400' : 'text-[var(--text-primary)]'}`}
            aria-label={`Hochrechnung Monatsende: ${projectedMonthEnd.toFixed(2)} Euro`}
          >
            {projectedMonthEnd.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[var(--text-muted)] text-xs">Hochrechnung</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-[var(--text-muted)]">Budget verbraucht</span>
          <span className="text-xs text-[var(--text-secondary)]">
            {adsSpentMonth.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / {effectiveBudget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={budgetPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Ads Budget: ${budgetPct.toFixed(0)} Prozent verbraucht`}
        >
          <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${budgetPct}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span
          className={`status-dot ${breakEvenReached ? 'status-dot-success' : 'status-dot-warn'}`}
          aria-hidden="true"
        />
        <span className={breakEvenReached ? 'text-[var(--accent-success)]' : 'text-[var(--accent-warn)]'}>
          Break-Even: {breakEvenReached ? 'erreicht' : 'noch nicht erreicht'}
        </span>
        <span className="text-[var(--text-muted)]">
          (Umsatz {revenueMonth.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} vs. Ads {adsSpentMonth.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})
        </span>
      </div>
    </div>
  );
}
