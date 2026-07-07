import { useCallback, useState, type ReactNode } from 'react';
import { api, ApiError } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useToast } from './Toast';
import { GateBadge } from './GateBadge';
import { GateFindings } from './GateFindings';
import { Markdown } from './Markdown';
import { StatusBadge } from './StatusBadge';
import { LoadingView } from './StateViews';
import {
  channelLabel,
  formatDateTime,
  publishActionTypeLabel,
} from '../lib/format';
import type { Job } from '../types';

// Zeigt an, wie/wo ein Job veröffentlicht wird — im Klartext, nicht nur als Code.
function PublishActionBox({ job }: { job: Job }): ReactNode {
  if (!job.publishAction) {
    return (
      <div className="drawer-section publish-box publish-box-pending">
        <h3 className="drawer-section-title">So wird veröffentlicht</h3>
        <p className="muted">Noch nicht festgelegt.</p>
      </div>
    );
  }
  return (
    <div className="drawer-section publish-box">
      <h3 className="drawer-section-title">So wird veröffentlicht</h3>
      <p className="publish-box-type">{publishActionTypeLabel(job.publishAction.type)}</p>
      {job.publishAction.instructions ? (
        <p className="publish-box-instructions">{job.publishAction.instructions}</p>
      ) : null}
    </div>
  );
}

function PublishedInfo({ job }: { job: Job }): ReactNode {
  return (
    <div className="drawer-section publish-box publish-box-done">
      <h3 className="drawer-section-title">Veröffentlichung bestätigt</h3>
      <p>
        Veröffentlicht am <strong>{formatDateTime(job.publishedAt ?? job.updatedAt)}</strong>
      </p>
      {job.publishedUrl ? (
        <a href={job.publishedUrl} target="_blank" rel="noreferrer noopener">
          {job.publishedUrl}
        </a>
      ) : (
        <p className="muted">Kein Link hinterlegt.</p>
      )}
    </div>
  );
}

function ArtifactPreview({ job }: { job: Job }): ReactNode {
  const { data, error, loading } = useFetch(() => api.getJobOutput(job.id), [job.id]);

  if (loading) return <LoadingView label="Inhalt wird geladen …" />;
  if (error) {
    const noContentYet = job.status === 'queued' || job.status === 'running';
    return (
      <p className="muted">
        {noContentYet ? 'Inhalt noch nicht verfügbar — Job läuft noch.' : error}
      </p>
    );
  }
  if (!data || data.trim() === '') {
    return <p className="muted">Kein Artefakt-Inhalt vorhanden.</p>;
  }
  return <Markdown content={data} />;
}

interface JobDrawerProps {
  job: Job;
  onClose: () => void;
  onChanged: () => void;
}

export function JobDrawer({ job, onClose, onChanged }: JobDrawerProps): ReactNode {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [publishUrl, setPublishUrl] = useState('');

  const runAction = useCallback(
    async (action: 'approve' | 'reject' | 'publish') => {
      setBusy(true);
      try {
        if (action === 'approve') {
          await api.approveJob(job.id);
          toast(`„${job.title}" freigegeben`, 'success');
        } else if (action === 'reject') {
          await api.rejectJob(job.id);
          toast(`„${job.title}" abgelehnt`, 'success');
        } else {
          await api.publishJob(job.id, publishUrl);
          toast(`„${job.title}" als veröffentlicht bestätigt`, 'success');
        }
        onChanged();
        onClose();
      } catch (err) {
        toast(err instanceof ApiError ? err.message : 'Aktion fehlgeschlagen', 'error');
      } finally {
        setBusy(false);
      }
    },
    [job.id, job.title, onChanged, onClose, publishUrl, toast],
  );

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={job.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <h2 className="drawer-title">{job.title}</h2>
            <div className="job-meta">
              <StatusBadge status={job.status} />
              <span className="chip">{job.agent}</span>
              <span className="chip chip-channel">{channelLabel(job.channel)}</span>
              <GateBadge gate={job.gate} />
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm drawer-close" onClick={onClose}>
            Schließen ✕
          </button>
        </div>

        <div className="drawer-dates muted">
          <span>Erstellt: {formatDateTime(job.createdAt)}</span>
          <span>Aktualisiert: {formatDateTime(job.updatedAt)}</span>
        </div>

        {job.status === 'failed' && job.error ? (
          <div className="drawer-section job-error">{job.error}</div>
        ) : null}

        <GateFindings gate={job.gate} />

        {job.status === 'published' ? <PublishedInfo job={job} /> : <PublishActionBox job={job} />}

        <div className="drawer-section">
          <h3 className="drawer-section-title">Inhalt</h3>
          <div className="artifact card">
            <ArtifactPreview job={job} />
          </div>
        </div>

        <div className="drawer-actions">
          {job.status === 'review' ? (
            <>
              <button
                type="button"
                className="btn btn-approve"
                disabled={busy}
                onClick={() => runAction('approve')}
              >
                Inhalt freigeben
              </button>
              <button
                type="button"
                className="btn btn-reject"
                disabled={busy}
                onClick={() => runAction('reject')}
              >
                Ablehnen
              </button>
            </>
          ) : null}

          {job.status === 'approved' ? (
            <div className="publish-confirm">
              <label className="field" htmlFor="job-published-url">
                <span className="field-label">Veröffentlicht unter (optional)</span>
                <input
                  id="job-published-url"
                  name="publishedUrl"
                  type="url"
                  className="text-input"
                  placeholder="https://…"
                  value={publishUrl}
                  onChange={(e) => setPublishUrl(e.target.value)}
                  disabled={busy}
                />
              </label>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => runAction('publish')}
              >
                Als veröffentlicht bestätigen
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
