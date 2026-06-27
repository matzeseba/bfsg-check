'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { LogEntry, JobStatus } from './types';
import { getStreamUrl } from './api';

export interface ApprovalRequired {
  summary: string;
  sideEffects: string[];
}

export interface AgentStreamState {
  logs: LogEntry[];
  status: JobStatus | null;
  result: unknown;
  costUsd: number | null;
  approvalRequired: ApprovalRequired | null;
}

export function useAgentStream(jobId: string | null): AgentStreamState {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [costUsd, setCostUsd] = useState<number | null>(null);
  const [approvalRequired, setApprovalRequired] = useState<ApprovalRequired | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback((id: string) => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const url = getStreamUrl(id);
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data as string) as {
          type: string;
          data: unknown;
        };

        if (parsed.type === 'log') {
          setLogs((prev) => [...prev, parsed.data as LogEntry]);
        } else if (parsed.type === 'status') {
          const d = parsed.data as { status: JobStatus };
          setStatus(d.status);
        } else if (parsed.type === 'result') {
          const d = parsed.data as { result: unknown; costUsd?: number };
          setResult(d.result);
          if (d.costUsd !== undefined) setCostUsd(d.costUsd);
        } else if (parsed.type === 'approval_required') {
          const d = parsed.data as { summary: string; sideEffects: string[] };
          setApprovalRequired(d);
          setStatus('awaiting_approval');
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Reconnect after 3 seconds if job not terminal
      reconnectTimerRef.current = setTimeout(() => {
        if (
          status !== 'completed' &&
          status !== 'failed' &&
          status !== 'cancelled'
        ) {
          connect(id);
        }
      }, 3000);
    };
  }, [status]);

  useEffect(() => {
    if (!jobId) return;

    // Reset state for new job
    setLogs([]);
    setStatus(null);
    setResult(null);
    setCostUsd(null);
    setApprovalRequired(null);

    connect(jobId);

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { logs, status, result, costUsd, approvalRequired };
}
