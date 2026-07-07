import { useCallback, useState, type ReactNode } from 'react';
import { api, ApiError } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { usePolling } from '../hooks/usePolling';
import { AsyncBoundary } from '../components/StateViews';
import { GateBadge } from '../components/GateBadge';
import { useToast } from '../components/Toast';
import { channelLabel, relativeTime, statusLabel } from '../lib/format';
import type { Job, JobStatus } from '../types';

const MAIN_COLUMNS: JobStatus[] = ['queued', 'running', 'review', 'approved', 'published'];
const SECONDARY: JobStatus[] = ['failed', 'skipped'];

type Action = 'approve' | 'reject' | 'published';

function JobCard({
  job,
  busy,
  onAction,
}: {
  job: Job;
  busy: boolean;
  onAction: (action: Action, job: Job) => void;
}): ReactNode {
  return (
    <div className="job-card">
      <div className="job-card-head">
        <span className="job-title">{job.title}</span>
        <GateBadge gate={job.gate} />
      </div>
      <div className="job-meta">
        <span className="chip">{job.agent}</span>
        <span className="chip chip-channel">{channelLabel(job.channel)}</span>
      </div>
      <div className="job-time">{relativeTime(job.updatedAt)}</div>
      {job.status === 'failed' && job.error ? (
        <div className="job-error">{job.error}</div>
      ) : null}

      {job.status === 'review' ? (
        <div className="job-actions">
          <button
            type="button"
            className="btn btn-approve"
            disabled={busy}
            onClick={() => onAction('approve', job)}
          >
            Freigeben
          </button>
          <button
            type="button"
            className="btn btn-reject"
            disabled={busy}
            onClick={() => onAction('reject', job)}
          >
            Ablehnen
          </button>
        </div>
      ) : null}

      {job.status === 'approved' ? (
        <div className="job-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => onAction('published', job)}
          >
            Als veröffentlicht markieren
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Column({
  status,
  jobs,
  busyIds,
  onAction,
}: {
  status: JobStatus;
  jobs: Job[];
  busyIds: Set<string>;
  onAction: (action: Action, job: Job) => void;
}): ReactNode {
  return (
    <div className="kanban-col">
      <div className="kanban-col-head">
        <span>{statusLabel(status)}</span>
        <span className="count-pill">{jobs.length}</span>
      </div>
      <div className="kanban-col-body">
        {jobs.length === 0 ? (
          <div className="kanban-empty">—</div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              busy={busyIds.has(job.id)}
              onAction={onAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function Pipeline(): ReactNode {
  const { data, error, loading, reload } = useFetch(() => api.getJobs(), []);
  usePolling(reload, 15000);
  const toast = useToast();

  const [optimistic, setOptimistic] = useState<Record<string, JobStatus>>({});
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const runAction = useCallback(
    async (action: Action, job: Job) => {
      const nextStatus: JobStatus =
        action === 'approve' ? 'approved' : action === 'reject' ? 'skipped' : 'published';

      setOptimistic((prev) => ({ ...prev, [job.id]: nextStatus }));
      setBusyIds((prev) => new Set(prev).add(job.id));

      try {
        if (action === 'approve') await api.approveJob(job.id);
        else if (action === 'reject') await api.rejectJob(job.id);
        else await api.publishJob(job.id);
        toast(`„${job.title}" → ${statusLabel(nextStatus)}`, 'success');
        reload();
      } catch (err) {
        setOptimistic((prev) => {
          const copy = { ...prev };
          delete copy[job.id];
          return copy;
        });
        const msg = err instanceof ApiError ? err.message : 'Aktion fehlgeschlagen';
        toast(msg, 'error');
      } finally {
        setBusyIds((prev) => {
          const copy = new Set(prev);
          copy.delete(job.id);
          return copy;
        });
      }
    },
    [reload, toast],
  );

  const applyOptimistic = (jobs: Job[]): Job[] =>
    jobs.map((job) => {
      const override = optimistic[job.id];
      return override ? { ...job, status: override } : job;
    });

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Pipeline</h1>
          <p className="page-subtitle">
            Job-Kanban nach Status · Freigabe nur durch Owner (Auto-Refresh 15 s)
          </p>
        </div>
      </header>

      <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload}>
        {(rawJobs) => {
          const jobs = applyOptimistic(rawJobs);
          const byStatus = (status: JobStatus): Job[] =>
            jobs.filter((j) => j.status === status);
          const secondaryJobs = jobs.filter((j) => SECONDARY.includes(j.status));

          return (
            <>
              <div className="kanban">
                {MAIN_COLUMNS.map((status) => (
                  <Column
                    key={status}
                    status={status}
                    jobs={byStatus(status)}
                    busyIds={busyIds}
                    onAction={runAction}
                  />
                ))}
              </div>

              {secondaryJobs.length > 0 ? (
                <div className="card secondary-jobs">
                  <h2 className="card-title">Fehlgeschlagen / Abgelehnt</h2>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Titel</th>
                          <th>Status</th>
                          <th>Kanal</th>
                          <th>Zeit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {secondaryJobs.map((job) => (
                          <tr key={job.id}>
                            <td>{job.title}</td>
                            <td>
                              <span className={`status-pill status-${job.status}`}>
                                {statusLabel(job.status)}
                              </span>
                            </td>
                            <td>{channelLabel(job.channel)}</td>
                            <td className="muted">{relativeTime(job.updatedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
