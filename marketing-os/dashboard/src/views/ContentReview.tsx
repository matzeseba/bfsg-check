import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { AsyncBoundary, EmptyView, ErrorView, LoadingView } from '../components/StateViews';
import { GateFindings } from '../components/GateFindings';
import { GateBadge } from '../components/GateBadge';
import { Markdown } from '../components/Markdown';
import { useToast } from '../components/Toast';
import { channelLabel, relativeTime } from '../lib/format';
import type { Job } from '../types';

function ArtifactViewer({
  job,
  onDone,
}: {
  job: Job;
  onDone: () => void;
}): ReactNode {
  const toast = useToast();
  const { data, error, loading } = useFetch(() => api.getJobOutput(job.id), [job.id]);
  const [busy, setBusy] = useState(false);

  const act = useCallback(
    async (kind: 'approve' | 'reject') => {
      setBusy(true);
      try {
        if (kind === 'approve') await api.approveJob(job.id);
        else await api.rejectJob(job.id);
        toast(
          kind === 'approve' ? `„${job.title}" freigegeben` : `„${job.title}" abgelehnt`,
          'success',
        );
        onDone();
      } catch (err) {
        toast(err instanceof ApiError ? err.message : 'Aktion fehlgeschlagen', 'error');
        setBusy(false);
      }
    },
    [job.id, job.title, onDone, toast],
  );

  return (
    <div className="review-detail">
      <div className="review-detail-head">
        <div>
          <h2 className="review-detail-title">{job.title}</h2>
          <div className="job-meta">
            <span className="chip">{job.agent}</span>
            <span className="chip chip-channel">{channelLabel(job.channel)}</span>
            <GateBadge gate={job.gate} />
          </div>
        </div>
        <div className="review-actions">
          <button
            type="button"
            className="btn btn-approve"
            disabled={busy}
            onClick={() => act('approve')}
          >
            Freigeben
          </button>
          <button
            type="button"
            className="btn btn-reject"
            disabled={busy}
            onClick={() => act('reject')}
          >
            Ablehnen
          </button>
        </div>
      </div>

      <GateFindings gate={job.gate} />

      <div className="artifact card">
        {loading ? (
          <LoadingView label="Artefakt wird geladen …" />
        ) : error ? (
          <ErrorView message={error} />
        ) : data && data.trim() !== '' ? (
          <Markdown content={data} />
        ) : (
          <p className="muted">Kein Artefakt-Inhalt vorhanden.</p>
        )}
      </div>
    </div>
  );
}

export function ContentReview(): ReactNode {
  const { data, error, loading, reload } = useFetch(() => api.getJobs('review'), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auswahl automatisch auf ersten Job setzen bzw. gültig halten.
  useEffect(() => {
    if (!data) return;
    if (data.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => {
      if (current && data.some((j) => j.id === current)) return current;
      return data[0]?.id ?? null;
    });
  }, [data]);

  const handleDone = useCallback(() => {
    setSelectedId(null);
    reload();
  }, [reload]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Content-Review</h1>
          <p className="page-subtitle">Artefakte prüfen und freigeben (Status „Prüfung")</p>
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
        {(jobs) => {
          const selected = jobs.find((j) => j.id === selectedId) ?? null;
          return (
            <div className="review-layout">
              <div className="review-list card">
                <div className="review-list-head">{jobs.length} zu prüfen</div>
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    className={`review-list-item${
                      job.id === selectedId ? ' review-list-active' : ''
                    }`}
                    onClick={() => setSelectedId(job.id)}
                  >
                    <div className="review-item-title">{job.title}</div>
                    <div className="review-item-meta">
                      <span>{channelLabel(job.channel)}</span>
                      <span className="muted">{relativeTime(job.updatedAt)}</span>
                    </div>
                    <div className="review-item-gate">
                      <GateBadge gate={job.gate} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="review-main">
                {selected ? (
                  <ArtifactViewer key={selected.id} job={selected} onDone={handleDone} />
                ) : (
                  <EmptyView message="Job links auswählen." />
                )}
              </div>
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
