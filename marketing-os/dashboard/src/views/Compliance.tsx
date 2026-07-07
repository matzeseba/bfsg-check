import type { ReactNode } from 'react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { AsyncBoundary } from '../components/StateViews';
import { channelLabel, formatDateTime } from '../lib/format';

export function Compliance(): ReactNode {
  const { data, error, loading, reload } = useFetch(() => api.getCompliance(), []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Compliance</h1>
          <p className="page-subtitle">Legal-Gate — verbotene Muster, Kanäle, letzte Findings</p>
        </div>
      </header>

      <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload}>
        {({ policy, recentFindings }) => (
          <>
            <div className="card policy-meta">
              <div>
                <span className="policy-meta-label">Version</span> {policy.version}
              </div>
              <div>
                <span className="policy-meta-label">Stand</span> {policy.updatedAt}
              </div>
              <div>
                <span className="policy-meta-label">Auto-Publish</span>{' '}
                {policy.publishing.autoPublish ? 'aktiv' : 'deaktiviert (Owner-Approval nötig)'}
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Pflichtsprache</h2>
              <p className="policy-hint">{policy.language.disclaimerHint}</p>
              <div className="tag-row">
                {policy.language.required.map((r) => (
                  <span key={r} className="tag tag-required">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Verbotene Muster ({policy.forbiddenPatterns.length})</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Muster</th>
                      <th>Schweregrad</th>
                      <th>Hinweis / sichere Alternative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policy.forbiddenPatterns.map((p) => (
                      <tr key={p.pattern}>
                        <td className="mono">{p.pattern}</td>
                        <td>
                          <span className={`sev-pill sev-${p.severity}`}>
                            {p.severity === 'block' ? 'Block' : 'Warnung'}
                          </span>
                        </td>
                        <td>{p.hint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="two-col">
              <div className="card">
                <h2 className="card-title">Erlaubte Kanäle</h2>
                <div className="tag-row">
                  {policy.allowedChannels.map((c) => (
                    <span key={c} className="tag tag-allowed">
                      {channelLabel(c)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="card-title">Verbotene Kanäle</h2>
                <ul className="reason-list">
                  {policy.forbiddenChannels.map((c) => (
                    <li key={c.channel}>
                      <span className="tag tag-forbidden">{c.channel}</span>
                      <span className="reason-text">{c.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Letzte Gate-Findings</h2>
              {recentFindings.length === 0 ? (
                <p className="muted">Keine aktuellen Findings — sauber.</p>
              ) : (
                <div className="recent-findings">
                  {recentFindings.map((f) => (
                    <div key={`${f.jobId}-${f.at}`} className="recent-finding">
                      <div className="recent-finding-head">
                        <span className="recent-finding-title">{f.title}</span>
                        <span className="muted">{formatDateTime(f.at)}</span>
                      </div>
                      <ul className="findings-list">
                        {f.findings.map((finding, idx) => (
                          <li key={`${finding.pattern}-${idx}`}>
                            <span className={`sev-pill sev-${finding.severity}`}>
                              {finding.severity === 'block' ? 'Block' : 'Warnung'}
                            </span>
                            <span className="findings-match">
                              „{finding.match}"
                            </span>
                            <span className="findings-hint">{finding.hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </AsyncBoundary>
    </div>
  );
}
