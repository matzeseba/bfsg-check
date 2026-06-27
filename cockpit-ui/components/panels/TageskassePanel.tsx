'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  kpis: CockpitSummary['kpis'];
}

const MOCK_SPARKLINE = [120, 80, 200, 150, 320, 250, 0];
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function TageskassePanel({ kpis }: Props) {
  const { revenueToday, salesToday, aov, stripe } = {
    ...kpis,
    stripe: true,
  };

  const notConfigured = revenueToday === 0 && salesToday === 0 && aov === 0;
  const maxVal = Math.max(...MOCK_SPARKLINE, 1);

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Tageskasse
      </h2>

      {notConfigured ? (
        <p className="text-[var(--text-muted)] text-sm">Nicht konfiguriert</p>
      ) : (
        <>
          <div className="flex-1">
            <p
              className="text-4xl font-bold text-[var(--accent-success)]"
              aria-label={`Umsatz heute: ${revenueToday.toFixed(2)} Euro`}
            >
              {revenueToday.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-[var(--text-muted)] text-xs mt-1">Umsatz heute</p>
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <p
                className="font-semibold text-[var(--text-primary)]"
                aria-label={`Sales heute: ${salesToday}`}
              >
                {salesToday}
              </p>
              <p className="text-[var(--text-muted)] text-xs">Sales</p>
            </div>
            <div>
              <p
                className="font-semibold text-[var(--text-primary)]"
                aria-label={`Durchschnittlicher Bestellwert: ${aov.toFixed(2)} Euro`}
              >
                {aov.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-[var(--text-muted)] text-xs">AOV</p>
            </div>
          </div>

          {/* Sparkline */}
          <div className="flex items-end gap-1 h-10" aria-hidden="true">
            {MOCK_SPARKLINE.map((val, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-0.5">
                <div
                  className="w-full rounded-sm bg-[var(--accent-primary)] opacity-60"
                  style={{ height: `${(val / maxVal) * 100}%`, minHeight: '2px' }}
                />
                <span className="text-[8px] text-[var(--text-muted)]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
