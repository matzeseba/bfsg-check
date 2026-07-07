import { useCallback, useState, type ReactNode } from 'react';
import { api, ApiError } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { AsyncBoundary } from '../components/StateViews';
import { useToast } from '../components/Toast';
import { cadenceLabel, channelLabel, formatDateTime } from '../lib/format';
import type { PlaybookWithState } from '../types';

export function Playbooks(): ReactNode {
  const { data, error, loading, reload } = useFetch(() => api.getPlaybooks(), []);
  const toast = useToast();
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const setBusy = useCallback((id: string, on: boolean) => {
    setBusyIds((prev) => {
      const copy = new Set(prev);
      if (on) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  }, []);

  const onToggle = useCallback(
    async (pb: PlaybookWithState) => {
      setBusy(pb.id, true);
      try {
        const updated = await api.togglePlaybook(pb.id);
        toast(
          `„${pb.name}" ${updated.enabled ? 'aktiviert' : 'deaktiviert'}`,
          'success',
        );
        reload();
      } catch (err) {
        toast(err instanceof ApiError ? err.message : 'Umschalten fehlgeschlagen', 'error');
      } finally {
        setBusy(pb.id, false);
      }
    },
    [reload, setBusy, toast],
  );

  const onRunNow = useCallback(
    async (pb: PlaybookWithState) => {
      setBusy(pb.id, true);
      try {
        const job = await api.runPlaybookNow(pb.id);
        toast(`Job gestartet: „${job.title}"`, 'success');
        reload();
      } catch (err) {
        toast(err instanceof ApiError ? err.message : 'Start fehlgeschlagen', 'error');
      } finally {
        setBusy(pb.id, false);
      }
    },
    [reload, setBusy, toast],
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Playbooks</h1>
          <p className="page-subtitle">Automatisierte Growth-Prozesse steuern</p>
        </div>
      </header>

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(pbs) => pbs.length === 0}
        emptyMessage="Keine Playbooks registriert."
      >
        {(playbooks) => (
          <div className="card">
            <div className="table-wrap">
              <table className="data-table playbooks-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Kanal</th>
                    <th>Agent</th>
                    <th>Kadenz</th>
                    <th>Letzter Lauf</th>
                    <th>Nächster Lauf</th>
                    <th>Aktiv</th>
                    <th className="num">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {playbooks.map((pb) => {
                    const busy = busyIds.has(pb.id);
                    return (
                      <tr key={pb.id}>
                        <td>
                          <div className="pb-name">{pb.name}</div>
                          <div className="pb-goal muted">{pb.goal}</div>
                        </td>
                        <td>{channelLabel(pb.channel)}</td>
                        <td className="mono">{pb.agent}</td>
                        <td>{cadenceLabel(pb.cadence)}</td>
                        <td className="muted">{formatDateTime(pb.lastRun)}</td>
                        <td className="muted">{formatDateTime(pb.nextRun)}</td>
                        <td>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={pb.enabled}
                            aria-label={`${pb.name} ${pb.enabled ? 'deaktivieren' : 'aktivieren'}`}
                            className={`toggle${pb.enabled ? ' toggle-on' : ''}`}
                            disabled={busy}
                            onClick={() => onToggle(pb)}
                          >
                            <span className="toggle-knob" />
                          </button>
                        </td>
                        <td className="num">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={busy}
                            onClick={() => onRunNow(pb)}
                          >
                            Jetzt ausführen
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
