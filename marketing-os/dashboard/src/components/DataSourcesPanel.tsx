import type { ReactNode } from 'react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { AsyncBoundary } from './StateViews';
import type { DataSourceStatus, IntegrationStatus } from '../types';

function sourceLabel(status: DataSourceStatus): string {
  if (status.source === 'real') return 'Echte Daten';
  if (status.source === 'demo') return 'Demo-Daten';
  return 'Keine Daten';
}

function sourceDotClass(status: DataSourceStatus): string {
  if (status.source === 'real') return 'ds-dot ds-dot-real';
  if (status.source === 'demo') return 'ds-dot ds-dot-demo';
  return 'ds-dot ds-dot-none';
}

function IntegrationRow({ name, status }: { name: string; status: IntegrationStatus }): ReactNode {
  return (
    <div className="ds-row">
      <span className={`ds-dot ${status.connected ? 'ds-dot-real' : 'ds-dot-none'}`} />
      <span className="ds-row-name">{name}</span>
      <span className="muted">{status.connected ? 'Verbunden' : 'Nicht verbunden'}</span>
    </div>
  );
}

// Zeigt ehrlich, woher Zahlen kommen und welche Integrationen tatsächlich angebunden sind.
export function DataSourcesPanel(): ReactNode {
  const { data, error, loading, reload } = useFetch(() => api.getDataSources(), []);

  return (
    <div className="card" id="datenquellen">
      <h2 className="card-title">Datenquellen</h2>
      <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload}>
        {(ds) => (
          <div className="ds-grid">
            <div className="ds-row">
              <span className={sourceDotClass(ds.kpis)} />
              <span className="ds-row-name">KPIs</span>
              <span className="muted">{sourceLabel(ds.kpis)}</span>
            </div>
            <div className="ds-row">
              <span className={sourceDotClass(ds.leads)} />
              <span className="ds-row-name">Leads</span>
              <span className="muted">{sourceLabel(ds.leads)}</span>
            </div>
            <IntegrationRow name="Stripe" status={ds.integrations.stripe} />
            <IntegrationRow name="Brevo" status={ds.integrations.brevo} />
            <IntegrationRow name="Google Ads" status={ds.integrations.googleAds} />
            <IntegrationRow name="Bing Ads" status={ds.integrations.bingAds} />
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
