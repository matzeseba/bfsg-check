"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  inboxApi,
  type InboxItem,
  type InboxItemDetail,
  type InboxStatus,
} from "@/lib/api";
import { Drawer } from "@/components/ui/Drawer";
import {
  Badge,
  DemoBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Loading, ErrorNote, Empty } from "@/components/ui/States";
import { dateTime } from "@/lib/format";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Alle" },
  { value: "open", label: "Offen" },
  { value: "drafted", label: "Entwurf" },
  { value: "replied", label: "Beantwortet" },
  { value: "closed", label: "Geschlossen" },
];

const CHANNEL_LABEL: Record<string, string> = {
  email: "E-Mail",
  form: "Formular",
  support: "Support",
};

const NEXT_STATUS: { value: InboxStatus; label: string }[] = [
  { value: "open", label: "Offen" },
  { value: "replied", label: "Beantwortet" },
  { value: "closed", label: "Geschlossen" },
];

export function InboxView() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<InboxItemDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inboxApi.list({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Posteingang nicht ladbar.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await inboxApi.get(id);
      setSelected(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Detail nicht ladbar.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Deep-Link ?open=<id> (z.B. vom Dashboard)
  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) {
      const id = Number(openId);
      if (Number.isFinite(id)) void openDetail(id);
    }
    // nur beim ersten Rendern des Query auswerten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patchLocal(updated: InboxItem) {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? { ...it, ...updated } : it)));
  }

  async function onDraft() {
    if (!selected) return;
    setDrafting(true);
    try {
      const res = await inboxApi.draft(selected.id);
      setSelected({ ...selected, draft: res.draft, status: "drafted" });
      patchLocal({ ...selected, status: "drafted" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Entwurf fehlgeschlagen.");
    } finally {
      setDrafting(false);
    }
  }

  async function onStatus(status: InboxStatus) {
    if (!selected) return;
    setSavingStatus(true);
    try {
      const updated = await inboxApi.setStatus(selected.id, status);
      setSelected({ ...selected, status: updated.status });
      patchLocal(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status-Änderung fehlgeschlagen.");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div>
      {/* Filterleiste */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
          marginBottom: 16,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="micro">Status</span>
          <select
            className="input mono"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 160 }}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="micro">Priorität min.</span>
          <select
            className="input mono"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="">Alle</option>
            {[5, 4, 3, 2, 1].map((p) => (
              <option key={p} value={String(p)}>
                ≥ P{p}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" onClick={() => void load()}>
          <Icon name="reset" size={16} />
          Aktualisieren
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12 }}>
          <ErrorNote message={error} />
        </div>
      )}

      {loading ? (
        <Loading label="Lade Posteingang …" />
      ) : items.length === 0 ? (
        <Empty>Keine Anfragen für diesen Filter.</Empty>
      ) : (
        <div className="panel" style={{ overflow: "hidden" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => void openDetail(it.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    padding: "12px 16px",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    color: "var(--text)",
                  }}
                >
                  <PriorityBadge priority={it.priority} reason={it.priority_reason} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {it.subject}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {it.sender} · {it.preview}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flex: "0 0 auto" }}>
                    <Badge tone="muted">{CHANNEL_LABEL[it.channel] ?? it.channel}</Badge>
                    <StatusBadge status={it.status} />
                    <DemoBadge show={it.source === "demo"} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detail-Drawer */}
      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? "Anfrage"}
      >
        {detailLoading || !selected ? (
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <PriorityBadge priority={selected.priority} />
              <StatusBadge status={selected.status} />
              <Badge tone="muted">{CHANNEL_LABEL[selected.channel] ?? selected.channel}</Badge>
              <DemoBadge show={selected.source === "demo"} />
            </div>

            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              <div>
                <span className="micro">Von</span> {selected.sender}
              </div>
              <div>
                <span className="micro">Eingang</span> {dateTime(selected.created_at)}
              </div>
              {selected.priority_reason && (
                <div style={{ marginTop: 6 }}>
                  <span className="micro">KI-Priorität</span> {selected.priority_reason}
                </div>
              )}
            </div>

            <div>
              <span className="micro">Nachricht</span>
              <div
                className="panel"
                style={{ padding: 14, marginTop: 6, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6 }}
              >
                {selected.body}
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span className="micro">KI-Antwortentwurf</span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void onDraft()}
                  disabled={drafting}
                  style={{ padding: "6px 12px" }}
                >
                  <Icon name="bot" size={16} />
                  {drafting ? "Erstelle …" : selected.draft ? "Neu erstellen" : "Entwurf erstellen"}
                </button>
              </div>
              {selected.draft ? (
                <div
                  className="panel"
                  style={{
                    padding: 14,
                    whiteSpace: "pre-wrap",
                    fontSize: 13,
                    lineHeight: 1.6,
                    borderColor: "var(--accent)",
                  }}
                >
                  {selected.draft}
                </div>
              ) : (
                <Empty>Noch kein Entwurf. „Entwurf erstellen" generiert eine Antwort.</Empty>
              )}
            </div>

            <div>
              <span className="micro">Status ändern</span>
              <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                {NEXT_STATUS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className="btn"
                    onClick={() => void onStatus(s.value)}
                    disabled={savingStatus || selected.status === s.value}
                    aria-pressed={selected.status === s.value}
                    style={
                      selected.status === s.value
                        ? { borderColor: "var(--accent)", color: "var(--accent)" }
                        : undefined
                    }
                  >
                    <Icon name="check" size={15} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
