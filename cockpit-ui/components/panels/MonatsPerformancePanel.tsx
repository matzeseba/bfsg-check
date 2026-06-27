'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  kpis: CockpitSummary['kpis'];
}

const MONATSZIEL = 2000;

export function MonatsPerformancePanel({ kpis }: Props) {
  const { revenueMonth, revenuePrevMonth, salesMonth, mrr, aboEnabled } = kpis;
  const progress = Math.min((revenueMonth / MONATSZIEL) * 100, 100);
  const diff = revenuePrevMonth > 0 ? ((revenueMonth - revenuePrevMonth) / revenuePrevMonth) * 100 : null;

  const barColor =
    progress >= 100
      ? 'progress-bar-fill-success'
      : progress >= 50
      ? 'progress-bar-fill-warn'
      : 'progress-bar-fill-primary';

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Monats-Performance
      </h2>

      <div className="flex gap-4">
        <div className="flex-1">
          <p
            className="text-2xl font-bold text-[var(--text-primary)]"
            aria-label={`Umsatz Monat: ${revenueMonth.toFixed(2)} Euro`}
          >
            {revenueMonth.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-[var(--text-muted)] text-xs">Umsatz MTD</p>
        </div>
        {diff !== null && (
          <div className="text-right">
            <p
              className={`text-sm font-semibold ${diff >= 0 ? 'text-[var(--accent-success)]' : 'text-red-400'}`}
              aria-label={`Vergleich Vormonat: ${diff >= 0 ? '+' : ''}${diff.toFixed(1)} Prozent`}
            >
              {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
            </p>
            <p className="text-[var(--text-muted)] text-xs">vs. Vormonat</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--text-muted)]">Ziel: {MONATSZIEL.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          <span className="text-[var(--text-secondary)]">{progress.toFixed(0)}%</span>
        </div>
        <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Monatsziel-Fortschritt">
          <div className={`progress-bar-fill ${barColor}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          <p className="font-semibold text-[var(--text-primary)]" aria-label={`Sales Monat: ${salesMonth}`}>{salesMonth}</p>
          <p className="text-[var(--text-muted)] text-xs">Sales MTD</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)]" aria-label={`MRR: ${mrr.toFixed(2)} Euro`}>
            {mrr.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            {!aboEnabled && <span className="text-[var(--text-muted)] text-xs ml-1">(Abo deaktiviert)</span>}
          </p>
          <p className="text-[var(--text-muted)] text-xs">MRR</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--text-muted)] text-xs">Vormonat</p>
          <p className="text-[var(--text-primary)] text-sm">{revenuePrevMonth.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
        </div>
      </div>
    </div>
  );
}
