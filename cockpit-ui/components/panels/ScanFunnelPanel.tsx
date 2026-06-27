'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  funnel: CockpitSummary['funnel'];
}

const DEFAULT_STAGES = ['Scan', 'Teaser', 'Checkout', 'Kauf'];

export function ScanFunnelPanel({ funnel }: Props) {
  const isEmpty = !funnel || funnel.length === 0;

  const stages = isEmpty
    ? DEFAULT_STAGES.map((s) => ({ stage: s, count: 0 }))
    : funnel;

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Scan-Funnel
      </h2>

      {isEmpty ? (
        <p className="text-[var(--text-muted)] text-xs">Scan-Daten werden aggregiert...</p>
      ) : null}

      <div className="flex flex-col gap-2 flex-1 justify-center">
        {stages.map((stage, i) => {
          const width = isEmpty ? 80 - i * 15 : (stage.count / maxCount) * 100;
          const convRate =
            i > 0 && stages[i - 1].count > 0
              ? ((stage.count / stages[i - 1].count) * 100).toFixed(0)
              : null;

          return (
            <div key={stage.stage}>
              {convRate !== null && (
                <p className="text-[var(--text-muted)] text-xs text-center mb-0.5" aria-label={`Conversion von ${stages[i-1].stage} zu ${stage.stage}: ${convRate} Prozent`}>
                  ↓ {convRate}%
                </p>
              )}
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: `${(100 - width) / 2}%`, paddingRight: `${(100 - width) / 2}%` }}
              >
                <div
                  className="flex-1 rounded py-1.5 px-2 text-center"
                  style={{
                    background: `rgba(0, 212, 255, ${0.1 + (stages.length - i) * 0.07})`,
                    border: `1px solid rgba(0, 212, 255, ${0.2 + (stages.length - i) * 0.1})`,
                  }}
                >
                  <span className="text-xs text-[var(--text-primary)] font-medium">{stage.stage}</span>
                  {stage.count > 0 && (
                    <span className="ml-2 text-xs text-[var(--text-muted)]">{stage.count.toLocaleString('de-DE')}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
