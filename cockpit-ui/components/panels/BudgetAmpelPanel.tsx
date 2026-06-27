'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  kpis: CockpitSummary['kpis'];
  budget: CockpitSummary['budget'];
}

const ADS_BUDGET_MONTH = 600;

function cacColor(cac: number | null, ceiling: number) {
  if (cac === null) return 'progress-bar-fill-primary';
  if (cac < 100) return 'progress-bar-fill-success';
  if (cac <= ceiling) return 'progress-bar-fill-warn';
  return 'progress-bar-fill-error';
}

function cacLabel(cac: number | null, ceiling: number) {
  if (cac === null) return { text: 'Keine Daten', color: 'text-[var(--text-muted)]' };
  if (cac < 100) return { text: 'Gut', color: 'text-[var(--accent-success)]' };
  if (cac <= ceiling) return { text: 'Grenzwertig', color: 'text-[var(--accent-warn)]' };
  return { text: 'Kritisch', color: 'text-red-400' };
}

export function BudgetAmpelPanel({ kpis, budget }: Props) {
  const { cac, cacCeiling } = kpis;
  const { adsSpentMonth, adsBudgetMonth } = budget;
  const effectiveBudget = adsBudgetMonth || ADS_BUDGET_MONTH;

  const cacPct = cac !== null ? Math.min((cac / cacCeiling) * 100, 100) : 0;
  const budgetPct = Math.min((adsSpentMonth / effectiveBudget) * 100, 100);
  const cacInfo = cacLabel(cac, cacCeiling);

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Budget-Ampel
      </h2>

      {/* CAC */}
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-[var(--text-muted)]">CAC vs. Ceiling ({cacCeiling} €)</span>
          <span className={`text-xs font-semibold ${cacInfo.color}`}>
            {cac !== null ? cac.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '—'}
            <span className="ml-1 font-normal text-[var(--text-muted)]">({cacInfo.text})</span>
          </span>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={cacPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`CAC: ${cac !== null ? cac + ' Euro' : 'keine Daten'} von ${cacCeiling} Euro Ceiling`}
        >
          <div
            className={`progress-bar-fill ${cacColor(cac, cacCeiling)}`}
            style={{ width: `${cacPct}%` }}
          />
        </div>
      </div>

      {/* Ads-Budget */}
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-[var(--text-muted)]">Ads-Budget Monat</span>
          <span className="text-xs text-[var(--text-secondary)]">
            {adsSpentMonth.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / {effectiveBudget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            <span className="ml-1 text-[var(--text-muted)]">({budgetPct.toFixed(0)}%)</span>
          </span>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={budgetPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Ads-Budget: ${budgetPct.toFixed(0)} Prozent verbraucht`}
        >
          <div
            className={`progress-bar-fill ${budgetPct > 90 ? 'progress-bar-fill-error' : budgetPct > 70 ? 'progress-bar-fill-warn' : 'progress-bar-fill-primary'}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
