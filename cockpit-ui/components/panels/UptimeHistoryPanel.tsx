'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  uptime: CockpitSummary['uptime'];
}

function uptimeColor(pct: number | null) {
  if (pct === null) return 'text-[var(--text-muted)]';
  if (pct >= 99.9) return 'text-[var(--accent-success)]';
  if (pct >= 99) return 'text-[var(--accent-warn)]';
  return 'text-red-400';
}

function uptimeLabel(pct: number | null) {
  if (pct === null) return 'Wird berechnet...';
  if (pct >= 99.9) return 'Exzellent';
  if (pct >= 99) return 'Gut';
  return 'Kritisch';
}

export function UptimeHistoryPanel({ uptime }: Props) {
  const { pct7d, pct30d } = uptime;

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Uptime
      </h2>

      <div className="flex gap-4 flex-1 items-center">
        <div className="flex-1 text-center">
          <p
            className={`text-3xl font-bold tabular-nums ${uptimeColor(pct7d)}`}
            aria-label={`Uptime 7 Tage: ${pct7d !== null ? pct7d.toFixed(1) + ' Prozent' : 'wird berechnet'}`}
          >
            {pct7d !== null ? `${pct7d.toFixed(1)}%` : '—'}
          </p>
          <p className="text-[var(--text-muted)] text-xs mt-1">7 Tage</p>
          <p className={`text-xs font-medium mt-0.5 ${uptimeColor(pct7d)}`}>
            {uptimeLabel(pct7d)}
          </p>
        </div>

        <div className="w-px h-12 bg-white/10" aria-hidden="true" />

        <div className="flex-1 text-center">
          <p
            className={`text-3xl font-bold tabular-nums ${uptimeColor(pct30d)}`}
            aria-label={`Uptime 30 Tage: ${pct30d !== null ? pct30d.toFixed(1) + ' Prozent' : 'wird berechnet'}`}
          >
            {pct30d !== null ? `${pct30d.toFixed(1)}%` : '—'}
          </p>
          <p className="text-[var(--text-muted)] text-xs mt-1">30 Tage</p>
          <p className={`text-xs font-medium mt-0.5 ${uptimeColor(pct30d)}`}>
            {uptimeLabel(pct30d)}
          </p>
        </div>
      </div>
    </div>
  );
}
