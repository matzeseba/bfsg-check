'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { useAgentStream } from '@/lib/useAgentStream';
import { approveJob, cancelJob } from '@/lib/api';

interface Props {
  jobId: string;
  onClose: () => void;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
  awaiting_approval: AlertTriangle,
};

export function AgentJobPanel({ jobId, onClose }: Props) {
  const { logs, status, result, costUsd, approvalRequired } = useAgentStream(jobId);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [approving, setApproving] = useState(false);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveJob(jobId);
    } catch (err) {
      console.error('Failed to approve job', err);
    } finally {
      setApproving(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelJob(jobId);
    } catch (err) {
      console.error('Failed to cancel job', err);
    }
    onClose();
  };

  const StatusIcon = status ? STATUS_ICONS[status] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="glass-card p-4 mt-4"
        role="dialog"
        aria-label="Agent-Job-Fortschritt"
        aria-modal="false"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Job
            </span>
            <code className="text-[10px] font-mono text-[var(--accent-primary)] bg-white/5 px-1.5 py-0.5 rounded">
              {jobId}
            </code>
          </div>

          <div className="flex items-center gap-2">
            {status && (
              <div className="flex items-center gap-1.5">
                {StatusIcon && (
                  <StatusIcon
                    className="w-4 h-4"
                    aria-hidden="true"
                    style={{
                      color:
                        status === 'completed'
                          ? 'var(--accent-success)'
                          : status === 'failed' || status === 'cancelled'
                          ? '#ef4444'
                          : status === 'awaiting_approval'
                          ? 'var(--accent-secondary)'
                          : 'var(--accent-primary)',
                    }}
                  />
                )}
                <span className={`badge badge-${status}`}>{status}</span>
              </div>
            )}
            {costUsd !== null && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <DollarSign className="w-3 h-3" aria-hidden="true" />
                {costUsd.toFixed(4)}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Job-Panel schliessen"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Approval Modal */}
        {approvalRequired && status === 'awaiting_approval' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 p-3 rounded-lg border border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/10"
            role="alertdialog"
            aria-label="Freigabe erforderlich"
          >
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-[var(--accent-secondary)] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[var(--accent-secondary)]">Freigabe erforderlich</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{approvalRequired.summary}</p>
              </div>
            </div>

            {approvalRequired.sideEffects.length > 0 && (
              <div className="mt-2 mb-3">
                <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">Auswirkungen:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {approvalRequired.sideEffects.map((effect, i) => (
                    <li key={i} className="text-xs text-[var(--text-secondary)]">{effect}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex-1 py-1.5 px-3 rounded text-xs font-semibold bg-[var(--accent-success)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent-success)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
                aria-label="Job freigeben"
              >
                {approving ? 'Wird freigegeben...' : 'Freigeben'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-1.5 px-3 rounded text-xs font-semibold bg-white/10 text-[var(--text-primary)] hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
                aria-label="Job abbrechen"
              >
                Abbrechen
              </button>
            </div>
          </motion.div>
        )}

        {/* Logs */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Job-Protokoll"
          className="log-output bg-black/30 rounded-lg p-3 max-h-64 overflow-y-auto border border-white/5"
        >
          {logs.length === 0 && (
            <span className="text-[var(--text-muted)]">Warte auf Ausgabe...</span>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 py-0.5">
              <time
                dateTime={log.ts}
                className="text-[var(--text-muted)] flex-shrink-0 text-[10px] tabular-nums pt-px"
              >
                {new Date(log.ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </time>
              <span className={`log-${log.level} flex-1 break-all`}>{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Result */}
        {result !== null && result !== undefined && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--accent-success)]/10 border border-[var(--accent-success)]/20">
            <p className="text-xs font-semibold text-[var(--accent-success)] mb-1">Ergebnis:</p>
            <pre className="text-xs text-[var(--text-secondary)] overflow-auto max-h-32 font-mono whitespace-pre-wrap break-all">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
