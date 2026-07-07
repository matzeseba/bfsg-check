import { useState, type ReactNode } from 'react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { AsyncBoundary } from '../components/StateViews';
import { GateBadge } from '../components/GateBadge';
import { JobDrawer } from '../components/JobDrawer';
import { channelLabel, relativeTime } from '../lib/format';
import type { Job } from '../types';

export function ContentReview(): ReactNode {
  const { data, error, loading, reload } = useFetch(() => api.getJobs('review'), []);
  const [openJob, setOpenJob] = useState<Job | null>(null);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Content-Review</h1>
          <p className="page-subtitle">
            Artefakte prüfen und freigeben — Zeile anklicken, um Inhalt und Freigabe-Aktionen zu
            öffnen
          </p>
        </div>
      </header>

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(jobs) => jobs.length === 0}
        emptyMessage="Keine Jobs in Prüfung — alles abgearbeitet."
      >
        {(jobs) => (
          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Titel</th>
                    <th>Kanal</th>
                    <th>Gate</th>
                    <th>Aktualisiert</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="clickable-row" onClick={() => setOpenJob(job)}>
                      <td>
                        <div className="job-title">{job.title}</div>
                        <span className="muted">{job.agent}</span>
                      </td>
                      <td>
                        <span className="chip chip-channel">{channelLabel(job.channel)}</span>
                      </td>
                      <td>
                        <GateBadge gate={job.gate} />
                      </td>
                      <td className="muted">{relativeTime(job.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AsyncBoundary>

      {openJob ? (
        <JobDrawer
          key={openJob.id}
          job={openJob}
          onClose={() => setOpenJob(null)}
          onChanged={reload}
        />
      ) : null}
    </div>
  );
}
