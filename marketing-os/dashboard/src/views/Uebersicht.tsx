import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { usePolling } from '../hooks/usePolling';
import { AsyncBoundary } from '../components/StateViews';
import { JobDrawer } from '../components/JobDrawer';
import { StatusBadge } from '../components/StatusBadge';
import { DemoBanner, DemoTag } from '../components/DemoBanner';
import { DataSourcesPanel } from '../components/DataSourcesPanel';
import { channelLabel, formatEur, formatNumber, relativeTime } from '../lib/format';
import type { Funnel, Job, WithMeta } from '../types';

function isWithinDays(iso: string | null | undefined, days: number): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const diffMs = Date.now() - d.getTime();
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

interface CoreTileProps {
  label: string;
  value: string;
  hint?: string;
  to?: string;
  anchor?: string;
}

function CoreTile({ label, value, hint, to, anchor }: CoreTileProps): ReactNode {
  const body = (
    <>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {hint ? <div className="kpi-hint">{hint}</div> : null}
    </>
  );
  if (to) {
    return (
      <Link to={to} className="card kpi-tile kpi-tile-link">
        {body}
      </Link>
    );
  }
  if (anchor) {
    return (
      <a href={anchor} className="card kpi-tile kpi-tile-link">
        {body}
      </a>
    );
  }
  return <div className="card kpi-tile">{body}</div>;
}

function NextSteps({ jobs, onOpen }: { jobs: Job[]; onOpen: (job: Job) => void }): ReactNode {
  const pending = jobs.filter((j) => j.status === 'review' || j.status === 'approved');
  return (
    <div className="card stack-gap">
      <h2 className="card-title">Nächste Schritte für dich</h2>
      {pending.length === 0 ? (
        <p className="muted">Nichts offen — alles erledigt.</p>
      ) : (
        <div className="next-steps-list">
          {pending.map((job) => (
            <button
              key={job.id}
              type="button"
              className="next-step-row"
              onClick={() => onOpen(job)}
            >
              <div className="next-step-main">
                <span className="next-step-title">{job.title}</span>
                <span className="job-meta">
                  <span className="chip chip-channel">{channelLabel(job.channel)}</span>
                  <StatusBadge status={job.status} />
                </span>
              </div>
              <span className="muted">{relativeTime(job.updatedAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FunnelSection({
  funnelData,
  includeDemo,
  onToggleDemo,
}: {
  funnelData: WithMeta<Funnel> | null;
  includeDemo: boolean;
  onToggleDemo: () => void;
}): ReactNode {
  return (
    <AsyncBoundary loading={funnelData === null} error={null} data={funnelData}>
      {(wrapped) => {
        const funnel = wrapped.data;
        const t = funnel.totals;
        const showDemoTag = wrapped.meta.hasDemo;
        const demoControls = wrapped.meta.hasDemo ? (
          <DemoBanner
            demoCount={wrapped.meta.demoCount}
            showingDemo={includeDemo}
            onToggle={onToggleDemo}
          />
        ) : !includeDemo ? (
          <div className="demo-toggle-hint">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onToggleDemo}>
              Demo-Daten anzeigen
            </button>
          </div>
        ) : null;

        if (!includeDemo && wrapped.meta.totalCount === 0) {
          return (
            <>
              {demoControls}
              <div className="card stack-gap">
                <p className="muted">
                  Noch keine echten Daten erfasst — Leads/KPIs kannst du per Import oder
                  API-Anbindung erfassen.
                </p>
              </div>
            </>
          );
        }

        return (
          <>
            {demoControls}

            <div className="kpi-grid stack-gap">
              {[
                { label: 'Leads (7 Tage)', value: formatNumber(t.leads7d) },
                { label: 'Leads (30 Tage)', value: formatNumber(t.leads30d) },
                { label: 'Veröffentlicht (30 Tage)', value: formatNumber(t.published30d) },
                { label: 'Umsatz (30 Tage)', value: formatEur(t.salesValue30d), accent: true },
              ].map((tile) => (
                <div key={tile.label} className="card kpi-tile">
                  <div className="kpi-label">
                    {tile.label} {showDemoTag ? <DemoTag /> : null}
                  </div>
                  <div className={`kpi-value${tile.accent ? ' kpi-accent' : ''}`}>{tile.value}</div>
                </div>
              ))}
            </div>

            <div className="two-col">
              <div className="card">
                <h2 className="card-title">Funnel {showDemoTag ? <DemoTag /> : null}</h2>
                <div className="funnel">
                  {[
                    { label: 'Leads (30 Tage)', value: t.leads30d, cls: 'bar-leads' },
                    { label: 'Jobs in Prüfung', value: t.jobsInReview, cls: 'bar-review' },
                    { label: 'Veröffentlicht (30 Tage)', value: t.published30d, cls: 'bar-published' },
                  ].map((s) => {
                    const max = Math.max(1, t.leads30d, t.jobsInReview, t.published30d);
                    return (
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
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <h2 className="card-title">Kanäle {showDemoTag ? <DemoTag /> : null}</h2>
                {funnel.byChannel.length === 0 ? (
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
                        {[...funnel.byChannel]
                          .sort((a, b) => b.leads - a.leads)
                          .map((row) => (
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
            </div>
          </>
        );
      }}
    </AsyncBoundary>
  );
}

export function Uebersicht(): ReactNode {
  const { data: jobs, error: jobsError, loading: jobsLoading, reload: reloadJobs } = useFetch(
    () => api.getJobs(),
    [],
  );
  usePolling(reloadJobs, 15000);

  const { data: campaigns } = useFetch(() => api.getAdsCampaigns(), []);

  const [includeDemo, setIncludeDemo] = useState(false);
  const { data: funnel, reload: reloadFunnel } = useFetch(
    () => api.getFunnel(includeDemo),
    [includeDemo],
  );
  usePolling(reloadFunnel, 15000);

  const [openJob, setOpenJob] = useState<Job | null>(null);

  const waitingForApproval = useMemo(
    () => (jobs ?? []).filter((j) => j.status === 'review').length,
    [jobs],
  );
  const publishedThisWeek = useMemo(
    () =>
      (jobs ?? []).filter(
        (j) => j.status === 'published' && isWithinDays(j.publishedAt ?? j.updatedAt, 7),
      ).length,
    [jobs],
  );
  const liveCampaigns = useMemo(
    () => (campaigns ?? []).filter((c) => c.status === 'live').length,
    [campaigns],
  );
  const totalCampaigns = campaigns?.length ?? 0;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Übersicht</h1>
          <p className="page-subtitle">Was jetzt zu tun ist — auf einen Blick (Auto-Refresh 15 s)</p>
        </div>
      </header>

      <AsyncBoundary loading={jobsLoading} error={jobsError} data={jobs} onRetry={reloadJobs}>
        {(jobList) => (
          <>
            <div className="kpi-grid">
              <CoreTile
                label="Wartet auf Freigabe"
                value={formatNumber(waitingForApproval)}
                hint="Zum Content-Review"
                to="/review"
              />
              <CoreTile
                label="Veröffentlicht diese Woche"
                value={formatNumber(publishedThisWeek)}
                hint="Zur Pipeline"
                to="/pipeline"
              />
              <CoreTile
                label="Datenquellen"
                value="Status prüfen"
                hint="Wer liefert echte Zahlen?"
                anchor="#datenquellen"
              />
              <CoreTile
                label="Ads"
                value={`${formatNumber(liveCampaigns)} live von ${formatNumber(totalCampaigns)}`}
                hint="Zu Paid Ads"
                to="/ads"
              />
            </div>

            <NextSteps jobs={jobList} onOpen={setOpenJob} />
          </>
        )}
      </AsyncBoundary>

      <div className="two-col">
        <DataSourcesPanel />
        <div className="card">
          <h2 className="card-title">Hinweis</h2>
          <p className="muted">
            Zahlen unten (Leads, Umsatz, Kanäle) sind nur dann sichtbar, wenn echte Daten
            vorliegen — Demo-Daten werden klar gekennzeichnet und sind standardmäßig
            ausgeblendet.
          </p>
        </div>
      </div>

      <FunnelSection
        funnelData={funnel ?? null}
        includeDemo={includeDemo}
        onToggleDemo={() => setIncludeDemo((v) => !v)}
      />

      {openJob ? (
        <JobDrawer key={openJob.id} job={openJob} onClose={() => setOpenJob(null)} onChanged={reloadJobs} />
      ) : null}
    </div>
  );
}
