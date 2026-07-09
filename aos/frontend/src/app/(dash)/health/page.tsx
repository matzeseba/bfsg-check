"use client";

import { useCallback, useEffect, useState } from "react";
import {
  healthApi,
  type HealthService,
  type HealthHost,
  type HealthHistoryPoint,
} from "@/lib/api";
import { Widget } from "@/components/ui/Widget";
import { Badge } from "@/components/ui/Badge";
import { Loading, ErrorNote } from "@/components/ui/States";
import { num, pct, relativeTime } from "@/lib/format";

const POLL_MS = 30000;

function LatencyHistory({ points }: { points: HealthHistoryPoint[] }) {
  if (points.length === 0) {
    return (
      <span className="micro" style={{ color: "var(--muted)" }}>
        keine Historie
      </span>
    );
  }
  const width = 180;
  const height = 32;
  const max = Math.max(...points.map((p) => p.latency_ms), 1);
  const barW = width / points.length;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Latenz-Verlauf"
      style={{ display: "block" }}
    >
      {points.map((p, i) => {
        const h = Math.max(2, (p.latency_ms / max) * (height - 2));
        return (
          <rect
            key={i}
            x={i * barW}
            y={height - h}
            width={Math.max(1, barW - 1)}
            height={h}
            fill={p.ok ? "var(--accent)" : "var(--err)"}
            opacity={p.ok ? 0.8 : 1}
          />
        );
      })}
    </svg>
  );
}

function meterColor(pctUsed: number): string {
  if (pctUsed >= 85) return "var(--err)";
  if (pctUsed >= 65) return "var(--accent)";
  return "var(--ok)";
}

function Meter({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const p = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="micro">{label}</span>
        <span className="mono" style={{ fontSize: 12 }}>
          {num(Math.round(used))} / {num(Math.round(total))} {unit}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${p}%`, height: "100%", background: meterColor(p) }} />
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [services, setServices] = useState<HealthService[]>([]);
  const [host, setHost] = useState<HealthHost | null>(null);
  const [history, setHistory] = useState<Record<string, HealthHistoryPoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  const load = useCallback(async () => {
    try {
      const [svcR, hostR] = await Promise.allSettled([
        healthApi.services(),
        healthApi.host(),
      ]);

      let svcList: HealthService[] = [];
      if (svcR.status === "fulfilled") {
        svcList = svcR.value.services;
        setServices(svcList);
        setError(null);
      } else {
        setError("Dienst-Status nicht abrufbar.");
      }
      if (hostR.status === "fulfilled") setHost(hostR.value);

      // Historie je Dienst nachladen (best effort)
      if (svcList.length > 0) {
        const entries = await Promise.allSettled(
          svcList.map((s) => healthApi.history(s.key, 24)),
        );
        const map: Record<string, HealthHistoryPoint[]> = {};
        entries.forEach((res, idx) => {
          if (res.status === "fulfilled") map[svcList[idx].key] = res.value.points;
        });
        setHistory(map);
      }
      setLastUpdate(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  if (loading && services.length === 0) return <Loading label="Prüfe Systemzustand …" />;

  const okCount = services.filter((s) => s.ok).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Badge tone={okCount === services.length ? "ok" : "accent"}>
            {okCount}/{services.length} online
          </Badge>
          <span className="micro" style={{ color: "var(--muted)" }}>
            Aktualisiert {relativeTime(lastUpdate)} · Auto-Refresh 30 s
          </span>
        </div>
      </div>

      {error && <ErrorNote message={error} />}

      {/* Host-Metriken */}
      {host && (
        <Widget title="Host-Metriken">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            <div>
              <span className="micro">CPU-Auslastung</span>
              <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: meterColor(host.cpu_pct) }}>
                {pct(host.cpu_pct)}
              </div>
            </div>
            <Meter label="Arbeitsspeicher" used={host.mem_used_mb} total={host.mem_total_mb} unit="MB" />
            <div>
              <span className="micro">Festplatte</span>
              <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: meterColor(host.disk_used_pct) }}>
                {pct(host.disk_used_pct)}
              </div>
            </div>
          </div>

          {host.containers && host.containers.length > 0 && (
            <div style={{ marginTop: 16, overflowX: "auto" }}>
              <span className="micro">Container</span>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6, fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                    <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>Name</th>
                    <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>Status</th>
                    <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>RAM</th>
                  </tr>
                </thead>
                <tbody>
                  {host.containers.map((c) => (
                    <tr key={c.name}>
                      <td className="mono" style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>{c.name}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>{c.status}</td>
                      <td className="mono" style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                        {num(Math.round(c.mem_mb))} MB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Widget>
      )}

      {/* Service-Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 12,
        }}
      >
        {services.map((s) => (
          <article
            key={s.key}
            className="panel"
            style={{
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderLeft: `3px solid ${s.ok ? "var(--ok)" : "var(--err)"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{s.name}</h3>
              <Badge tone={s.ok ? "ok" : "err"}>{s.ok ? "OK" : "AUSFALL"}</Badge>
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", wordBreak: "break-all" }}>
              {s.url}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <span className="micro">Latenz</span>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>
                  {s.ok ? `${num(s.latency_ms)} ms` : "—"}
                </div>
              </div>
              <LatencyHistory points={history[s.key] ?? []} />
            </div>
            {s.detail && (
              <div style={{ fontSize: 12, color: s.ok ? "var(--muted)" : "var(--err)" }}>{s.detail}</div>
            )}
            <span className="micro" style={{ color: "var(--muted)" }}>
              geprüft {relativeTime(s.checked_at)}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
