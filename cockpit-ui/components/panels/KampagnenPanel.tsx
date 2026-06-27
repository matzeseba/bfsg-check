'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  ads: CockpitSummary['ads'];
}

function statusInfo(status: string) {
  if (status === 'ENABLED') return { dot: 'status-dot-success', label: 'Aktiv' };
  if (status === 'PAUSED') return { dot: 'status-dot-warn', label: 'Pausiert' };
  if (status === 'REMOVED') return { dot: 'status-dot-error', label: 'Entfernt' };
  return { dot: 'status-dot-info', label: status };
}

export function KampagnenPanel({ ads }: Props) {
  const allCampaigns = ads.flatMap((a) =>
    a.campaigns.map((c) => ({ ...c, source: a.source }))
  );

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Kampagnen
      </h2>

      {allCampaigns.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm">Keine aktiven Kampagnen</p>
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs" aria-label="Kampagnen-Übersicht">
            <thead>
              <tr className="text-[var(--text-muted)] border-b border-white/5">
                <th className="text-left pb-1 font-medium">Name</th>
                <th className="text-center pb-1 font-medium">Status</th>
                <th className="text-right pb-1 font-medium">Budget</th>
                <th className="text-right pb-1 font-medium">Ausgaben</th>
              </tr>
            </thead>
            <tbody>
              {allCampaigns.map((c, i) => {
                const info = statusInfo(c.status);
                return (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-1.5 text-[var(--text-secondary)] max-w-[120px] truncate" title={c.name}>
                      {c.name}
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <span className={`status-dot ${info.dot}`} aria-hidden="true" />
                        <span>{info.label}</span>
                      </span>
                    </td>
                    <td className="py-1.5 text-right text-[var(--text-primary)]">
                      {c.budget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="py-1.5 text-right text-[var(--accent-primary)]">
                      {c.spend.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
