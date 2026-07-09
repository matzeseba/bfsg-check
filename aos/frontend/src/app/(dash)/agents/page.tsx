"use client";

import { useCallback, useEffect, useState } from "react";
import {
  agentsApi,
  type Agent,
  type AgentRun,
} from "@/lib/api";
import { Widget } from "@/components/ui/Widget";
import { Drawer } from "@/components/ui/Drawer";
import { Markdown } from "@/components/ui/Markdown";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Loading, ErrorNote, Empty } from "@/components/ui/States";
import { dateTime, relativeTime } from "@/lib/format";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState<Record<string, boolean>>({});

  const [history, setHistory] = useState<Record<string, AgentRun[]>>({});
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [openRun, setOpenRun] = useState<AgentRun | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentsApi.list();
      setAgents(res.agents);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Agenten nicht ladbar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAgent(key: string) {
    setRunning((r) => ({ ...r, [key]: true }));
    setError(null);
    try {
      await agentsApi.run(key);
      // Nach dem Start kurz warten und Liste + Historie aktualisieren.
      setTimeout(() => {
        void load();
        if (openHistory === key) void loadHistory(key);
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Start fehlgeschlagen.");
    } finally {
      setTimeout(() => setRunning((r) => ({ ...r, [key]: false })), 1500);
    }
  }

  const loadHistory = useCallback(async (key: string) => {
    setHistoryLoading(true);
    try {
      const res = await agentsApi.results(key, 20);
      setHistory((h) => ({ ...h, [key]: res.runs }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Historie nicht ladbar.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  function toggleHistory(key: string) {
    const next = openHistory === key ? null : key;
    setOpenHistory(next);
    if (next && !history[next]) void loadHistory(next);
  }

  if (loading) return <Loading label="Lade Agenten …" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <ErrorNote message={error} />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 12,
        }}
      >
        {agents.map((a) => {
          const busy = running[a.key];
          const lastOk = a.last_run?.ok;
          return (
            <article
              key={a.key}
              className="panel"
              style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{a.name}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
                    {a.description}
                  </p>
                </div>
                <Badge tone={a.enabled ? "accent" : "muted"}>
                  {a.enabled ? "aktiv" : "aus"}
                </Badge>
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <span className="micro">Zeitplan</span>
                  <div className="mono" style={{ fontSize: 12 }}>{a.schedule_human}</div>
                </div>
                <div>
                  <span className="micro">Letzter Lauf</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {a.last_run ? (
                      <>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: lastOk ? "var(--ok)" : "var(--err)",
                          }}
                        />
                        <span className="mono" style={{ fontSize: 12 }}>
                          {relativeTime(a.last_run.ts)}
                        </span>
                      </>
                    ) : (
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                        noch nie
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {a.last_run?.summary && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--text)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "8px 10px",
                  }}
                >
                  {a.last_run.summary}
                </p>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void runAgent(a.key)}
                  disabled={busy}
                  style={{ flex: 1 }}
                >
                  <Icon name="play" size={15} />
                  {busy ? "Läuft …" : "Jetzt ausführen"}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => toggleHistory(a.key)}
                  aria-expanded={openHistory === a.key}
                >
                  Historie
                </button>
              </div>

              {openHistory === a.key && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  {historyLoading && !history[a.key] ? (
                    <Loading label="Lade Historie …" />
                  ) : !history[a.key] || history[a.key].length === 0 ? (
                    <Empty>Noch keine Läufe.</Empty>
                  ) : (
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      {history[a.key].map((run) => (
                        <li key={run.id}>
                          <button
                            type="button"
                            onClick={() => setOpenRun(run)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius)",
                              padding: "8px 10px",
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                              color: "var(--text)",
                            }}
                          >
                            <Badge tone={run.ok ? "ok" : "err"}>{run.ok ? "OK" : "Fehler"}</Badge>
                            <span style={{ fontSize: 12, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {run.summary || "(ohne Zusammenfassung)"}
                            </span>
                            <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                              {relativeTime(run.started_at)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {agents.length === 0 && <Empty>Keine Agenten registriert.</Empty>}

      {/* Run-Detail-Drawer mit output_md */}
      <Drawer
        open={openRun !== null}
        onClose={() => setOpenRun(null)}
        title="Agenten-Ergebnis"
        width={640}
      >
        {openRun && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Badge tone={openRun.ok ? "ok" : "err"}>{openRun.ok ? "Erfolgreich" : "Fehler"}</Badge>
              <span className="micro" style={{ color: "var(--muted)" }}>
                Start {dateTime(openRun.started_at)}
                {openRun.finished_at ? ` · Ende ${dateTime(openRun.finished_at)}` : ""}
              </span>
            </div>
            {openRun.summary && (
              <p style={{ margin: 0, fontSize: 13 }}>{openRun.summary}</p>
            )}
            {openRun.output_md ? (
              <div className="panel" style={{ padding: 16 }}>
                <Markdown source={openRun.output_md} />
              </div>
            ) : (
              <Empty>Kein Ausgabetext für diesen Lauf.</Empty>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
