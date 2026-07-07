import type { ReactNode } from 'react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { usePolling } from '../hooks/usePolling';
import { AsyncBoundary } from '../components/StateViews';
import { channelLabel, formatEur, formatNumber } from '../lib/format';
import type { Funnel } from '../types';

interface Tile {
  label: string;
  value: string;
  accent?: boolean;
}

function KpiTiles({ funnel }: { funnel: Funnel }): ReactNode {
  const t = funnel.totals;
  const tiles: Tile[] = [
    { label: 'Leads (7 Tage)', value: formatNumber(t.leads7d) },
    { label: 'Leads (30 Tage)', value: formatNumber(t.leads30d) },
    { label: 'Jobs in Prüfung', value: formatNumber(t.jobsInReview) },
    { label: 'Veröffentlicht (30 Tage)', value: formatNumber(t.published30d) },
    { label: 'Umsatz (30 Tage)', value: formatEur(t.salesValue30d), accent: true },
  ];
  return (
    <div className="kpi-grid">
      {tiles.map((tile) => (
        <div key={tile.label} className="card kpi-tile">
          <div className="kpi-label">{tile.label}</div>
          <div className={`kpi-value${tile.accent ? ' kpi-accent' : ''}`}>{tile.value}</div>
        </div>
      ))}
    </div>
  );
}

function FunnelBars({ funnel }: { funnel: Funnel }): ReactNode {
  const t = funnel.totals;
  const stages = [
    { label: 'Leads (30 Tage)', value: t.leads30d, cls: 'bar-leads' },
    { label: 'Jobs in Prüfung', value: t.jobsInReview, cls: 'bar-review' },
    { label: 'Veröffentlicht (30 Tage)', value: t.published30d, cls: 'bar-published' },
  ];
  const max = Math.max(1, ...stages.map((s) => s.value));
  return (
    <div className="card">
      <h2 className="card-title">Funnel</h2>
      <div className="funnel">
        {stages.map((s) => (
          <div key={s.label} className="funnel-row">
            <div className="funnel-label">{s.label}</div>
            <div className="funnel-track">
              <div
                className={`funnel-bar ${s.cls}`}
                style={{ width: `${Math.max(4, (s.value / max) * 100)}%` }}
              />
            </div>
            <div className="funnel-value">{formatNumber(s.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelTable({ funnel }: { funnel: Funnel }): ReactNode {
  const rows = [...funnel.byChannel].sort((a, b) => b.leads - a.leads);
  return (
    <div className="card">
      <h2 className="card-title">Kanäle</h2>
      {rows.length === 0 ? (
        <p className="muted">Noch keine Kanal-Daten.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kanal</th>
                <th className="num">Leads</th>
                <th className="num">Veröffentlicht</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.channel}>
                  <td>{channelLabel(row.channel)}</td>
                  <td className="num">{formatNumber(row.leads)}</td>
                  <td className="num">{formatNumber(row.published)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Uebersicht(): ReactNode {
  const { data, error, loading, reload } = useFetch(() => api.getFunnel(), []);
  usePolling(reload, 15000);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Übersicht</h1>
          <p className="page-subtitle">Kennzahlen der Organic-Growth-Engine (Auto-Refresh 15 s)</p>
        </div>
      </header>

      <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload}>
        {(funnel) => (
          <>
            <KpiTiles funnel={funnel} />
            <div className="two-col">
              <FunnelBars funnel={funnel} />
              <ChannelTable funnel={funnel} />
            </div>
          </>
        )}
      </AsyncBoundary>
    </div>
  );
}
