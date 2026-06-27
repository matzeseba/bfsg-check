'use client';

import { GitCommit, CheckCircle, XCircle, Loader } from 'lucide-react';
import type { CockpitSummary } from '@/lib/types';

interface Props {
  deploy: CockpitSummary['deploy'];
}

function deployInfo(status: string) {
  const s = status.toLowerCase();
  if (s === 'success') return {
    Icon: CheckCircle,
    color: 'var(--accent-success)',
    label: 'Erfolgreich',
    badge: 'badge-completed',
  };
  if (s === 'failure' || s === 'failed') return {
    Icon: XCircle,
    color: '#ef4444',
    label: 'Fehlgeschlagen',
    badge: 'badge-failed',
  };
  if (s === 'in_progress' || s === 'running') return {
    Icon: Loader,
    color: 'var(--accent-primary)',
    label: 'In Bearbeitung',
    badge: 'badge-running',
  };
  return {
    Icon: GitCommit,
    color: 'var(--text-muted)',
    label: status,
    badge: 'badge-queued',
  };
}

export function DeployStatusPanel({ deploy }: Props) {
  const isEmpty = !deploy || !deploy.status;

  if (isEmpty) {
    return (
      <div className="glass-card p-4 h-full flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Deploy-Status
        </h2>
        <p className="text-[var(--text-muted)] text-sm">Kein Deploy-Status</p>
      </div>
    );
  }

  const info = deployInfo(deploy.status);
  const sha = deploy.sha ? deploy.sha.slice(0, 7) : '—';
  const at = deploy.at ? new Date(deploy.at) : null;

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Deploy-Status
      </h2>

      <div className="flex items-center gap-3" role="status" aria-label={`Deploy-Status: ${info.label}`}>
        <info.Icon
          className="w-8 h-8"
          style={{ color: info.color }}
          aria-hidden="true"
        />
        <div>
          <p className="text-lg font-bold" style={{ color: info.color }}>
            {info.label}
          </p>
          <span className={`badge ${info.badge}`}>{deploy.status}</span>
        </div>
      </div>

      <div className="flex gap-4 text-xs">
        <div>
          <p className="text-[var(--text-muted)]">Commit</p>
          <p className="font-mono text-[var(--accent-primary)] font-medium">{sha}</p>
        </div>
        {at && (
          <div>
            <p className="text-[var(--text-muted)]">Zeitpunkt</p>
            <p className="text-[var(--text-secondary)]">
              <time dateTime={deploy.at}>
                {at.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </time>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
