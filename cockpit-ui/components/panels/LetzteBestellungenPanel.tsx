'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  recentOrders: CockpitSummary['recentOrders'];
}

function statusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    PAID: { cls: 'text-[var(--accent-success)] bg-green-900/30 border-green-500/30', label: 'Bezahlt' },
    FULFILLED: { cls: 'text-[var(--accent-primary)] bg-cyan-900/30 border-cyan-500/30', label: 'Erfüllt' },
    FAILED: { cls: 'text-red-400 bg-red-900/30 border-red-500/30', label: 'Fehlgeschlagen' },
    PENDING: { cls: 'text-[var(--accent-warn)] bg-yellow-900/30 border-yellow-500/30', label: 'Ausstehend' },
  };
  const entry = map[status] ?? { cls: 'text-[var(--text-muted)] bg-white/5 border-white/10', label: status };
  return (
    <span className={`badge border ${entry.cls}`}>{entry.label}</span>
  );
}

function formatRelative(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return new Date(ts).toLocaleDateString('de-DE');
}

export function LetzteBestellungenPanel({ recentOrders }: Props) {
  const isEmpty = !recentOrders || recentOrders.length === 0;

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Letzte Bestellungen
      </h2>

      {isEmpty ? (
        <p className="text-[var(--text-muted)] text-sm">Noch keine Bestellungen</p>
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs" aria-label="Letzte Bestellungen">
            <thead>
              <tr className="text-[var(--text-muted)] border-b border-white/5">
                <th className="text-left pb-1 font-medium">Domain</th>
                <th className="text-left pb-1 font-medium">Paket</th>
                <th className="text-right pb-1 font-medium">Betrag</th>
                <th className="text-right pb-1 font-medium">Status</th>
                <th className="text-right pb-1 font-medium">Zeit</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-1.5 text-[var(--text-secondary)] truncate max-w-[120px]" title={order.domain}>
                    {order.domain}
                  </td>
                  <td className="py-1.5 text-[var(--text-secondary)]">{order.pkg}</td>
                  <td className="py-1.5 text-right text-[var(--text-primary)] font-medium">
                    {order.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="py-1.5 text-right">{statusBadge(order.status)}</td>
                  <td className="py-1.5 text-right text-[var(--text-muted)]">
                    <time dateTime={order.ts}>{formatRelative(order.ts)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
