'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CockpitSummary } from '@/lib/types';

interface Props {
  packageSplit: CockpitSummary['packageSplit'];
}

const COLORS = ['#00d4ff', '#ff6b35', '#00ff88', '#ffb800', '#a78bfa', '#f472b6'];

export function PaketSplitPanel({ packageSplit }: Props) {
  const isEmpty = !packageSplit || packageSplit.length === 0;

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Paket-Split
      </h2>

      {isEmpty ? (
        <p className="text-[var(--text-muted)] text-sm flex-1 flex items-center">Noch keine Verkäufe</p>
      ) : (
        <>
          <div className="h-32" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={packageSplit}
                  dataKey="revenue"
                  nameKey="pkg"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={2}
                >
                  {packageSplit.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '6px', color: '#e2e8f0' }}
                  formatter={(value: number) => [value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }), 'Umsatz']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-xs" aria-label="Paket-Aufschlüsselung">
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-white/5">
                  <th className="text-left pb-1 font-medium">Paket</th>
                  <th className="text-right pb-1 font-medium">Anzahl</th>
                  <th className="text-right pb-1 font-medium">Umsatz</th>
                </tr>
              </thead>
              <tbody>
                {packageSplit.map((row, i) => (
                  <tr key={row.pkg} className="border-b border-white/5">
                    <td className="py-1 flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                        aria-hidden="true"
                      />
                      {row.pkg}
                    </td>
                    <td className="text-right text-[var(--text-secondary)]">{row.count}</td>
                    <td className="text-right text-[var(--text-primary)]">
                      {row.revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
