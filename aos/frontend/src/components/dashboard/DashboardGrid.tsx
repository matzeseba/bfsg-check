"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GridLayout, { WidthProvider, type Layout } from "react-grid-layout";
import {
  dashboardApi,
  inboxApi,
  agentsApi,
  notificationsApi,
  type DashboardSummary,
  type InboxItem,
  type Agent,
  type AppNotification,
} from "@/lib/api";
import { Widget, KpiTile } from "@/components/ui/Widget";
import { Sparkline } from "@/components/ui/Sparkline";
import { Badge, DemoBadge, PriorityBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Loading, ErrorNote } from "@/components/ui/States";
import { eur, num, relativeTime } from "@/lib/format";

const Grid = WidthProvider(GridLayout);
const STORAGE_KEY = "aos_dashboard_layout_v1";

const DEFAULT_LAYOUT: Layout[] = [
  { i: "kpi-revenue", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-inbox", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-leads", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-system", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "sparkline", x: 0, y: 2, w: 6, h: 3, minW: 3, minH: 3 },
  { i: "health", x: 6, y: 2, w: 3, h: 3, minW: 2, minH: 3 },
  { i: "agents", x: 9, y: 2, w: 3, h: 3, minW: 2, minH: 3 },
  { i: "inbox", x: 0, y: 5, w: 6, h: 5, minW: 3, minH: 3 },
  { i: "leads", x: 6, y: 5, w: 6, h: 5, minW: 3, minH: 3 },
];

function loadLayout(): Layout[] {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw) as Layout[];
    // Sicherstellen, dass alle bekannten Widgets vorhanden sind.
    const ids = new Set(parsed.map((l) => l.i));
    const merged = [...parsed];
    for (const def of DEFAULT_LAYOUT) {
      if (!ids.has(def.i)) merged.push(def);
    }
    return merged;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

interface DashData {
  summary: DashboardSummary | null;
  inbox: InboxItem[];
  agents: Agent[];
  leads: AppNotification[];
}

export function DashboardGrid() {
  const [layout, setLayout] = useState<Layout[]>(DEFAULT_LAYOUT);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashData>({
    summary: null,
    inbox: [],
    agents: [],
    leads: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLayout(loadLayout());
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [summaryR, inboxR, agentsR, notifR] = await Promise.allSettled([
        dashboardApi.summary(),
        inboxApi.list({ status: "open" }),
        agentsApi.list(),
        notificationsApi.list(false),
      ]);
      if (!active) return;

      const next: DashData = { summary: null, inbox: [], agents: [], leads: [] };
      if (summaryR.status === "fulfilled") next.summary = summaryR.value;
      if (inboxR.status === "fulfilled") {
        // Prioritaet 1 = hoechste → aufsteigend sortieren, damit die Top 5
        // (wichtigsten) Anfragen zuerst erscheinen.
        next.inbox = [...inboxR.value.items]
          .sort((a, b) => a.priority - b.priority)
          .slice(0, 5);
      }
      if (agentsR.status === "fulfilled") next.agents = agentsR.value.agents;
      if (notifR.status === "fulfilled") {
        next.leads = notifR.value.items
          .filter((n) => n.level === "lead")
          .slice(0, 6);
      }

      if (summaryR.status === "rejected") {
        setError("Dashboard-Daten konnten nicht geladen werden.");
      } else {
        setError(null);
      }
      setData(next);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  function onLayoutChange(next: Layout[]) {
    setLayout(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }

  function resetLayout() {
    setLayout(DEFAULT_LAYOUT);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const summary = data.summary;
  const sparkValues = useMemo(
    () => (summary?.sparkline_30d ?? []).map((p) => p.eur),
    [summary],
  );

  if (!mounted) return <Loading />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <p className="micro" style={{ margin: 0 }}>
          Widgets frei verschiebbar &amp; skalierbar · Layout wird lokal gespeichert
        </p>
        <button type="button" className="btn" onClick={resetLayout}>
          <Icon name="reset" size={16} />
          Layout zurücksetzen
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12 }}>
          <ErrorNote message={error} />
        </div>
      )}

      {loading && !summary ? (
        <Loading />
      ) : (
        <Grid
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          margin={[12, 12]}
          isBounded
          draggableHandle=".aos-widget-head"
          onLayoutChange={onLayoutChange}
        >
          <div key="kpi-revenue">
            <Widget title="Umsatz 30 Tage" action={<DemoBadge show={summary?.revenue_source === "demo"} />}>
              <KpiTile
                label="Brutto"
                value={eur(summary?.revenue_30d_eur ?? 0)}
                accent
              />
            </Widget>
          </div>

          <div key="kpi-inbox">
            <Widget title="Offene Anfragen">
              <KpiTile label="Posteingang" value={num(summary?.open_inbox ?? 0)} />
            </Widget>
          </div>

          <div key="kpi-leads">
            <Widget title="Leads heute">
              <KpiTile label="Neu" value={num(summary?.leads_today ?? 0)} />
            </Widget>
          </div>

          <div key="kpi-system">
            <Widget title="System-Status">
              <KpiTile
                label="Dienste online"
                value={`${summary?.services_ok ?? 0}/${summary?.services_total ?? 0}`}
                accent={
                  !!summary &&
                  summary.services_total > 0 &&
                  summary.services_ok < summary.services_total
                }
              />
            </Widget>
          </div>

          <div key="sparkline">
            <Widget title="Umsatz-Verlauf (30 Tage)">
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Sparkline
                  values={sparkValues}
                  width={520}
                  height={110}
                  ariaLabel="Umsatzverlauf der letzten 30 Tage"
                />
              </div>
            </Widget>
          </div>

          <div key="health">
            <Widget title="System-Monitor">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <span className="micro">Dienste</span>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>
                    {summary?.services_ok ?? 0}
                    <span style={{ color: "var(--muted)" }}>
                      /{summary?.services_total ?? 0}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="micro">Agenten-Läufe heute</span>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>
                    {num(summary?.agent_runs_today ?? 0)}
                  </div>
                </div>
                <Link href="/health" className="micro" style={{ color: "var(--accent)" }}>
                  Details ansehen →
                </Link>
              </div>
            </Widget>
          </div>

          <div key="agents">
            <Widget title="Agenten">
              {data.agents.length === 0 ? (
                <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.agents.map((a) => (
                    <li
                      key={a.key}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 13, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.name}
                      </span>
                      <Badge tone={a.enabled ? "accent" : "muted"}>
                        {a.enabled ? "aktiv" : "aus"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Widget>
          </div>

          <div key="inbox">
            <Widget
              title="Posteingang · Top 5 nach KI-Priorität"
              action={
                <Link href="/inbox" className="micro" style={{ color: "var(--accent)" }}>
                  Alle →
                </Link>
              }
            >
              {data.inbox.length === 0 ? (
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                  Keine offenen Anfragen.
                </span>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {data.inbox.map((it) => (
                    <li
                      key={it.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <PriorityBadge priority={it.priority} reason={it.priority_reason} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link
                          href={`/inbox?open=${it.id}`}
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {it.subject}
                        </Link>
                        <span className="micro" style={{ color: "var(--muted)" }}>
                          {it.sender}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Widget>
          </div>

          <div key="leads">
            <Widget title="Lead-Feed">
              {data.leads.length === 0 ? (
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                  Noch keine Lead-Meldungen.
                </span>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {data.leads.map((n) => (
                    <li
                      key={n.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <Badge tone="ok">Lead</Badge>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong style={{ fontSize: 13 }}>{n.title}</strong>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                          {n.body}
                        </p>
                        <span className="micro" style={{ color: "var(--muted)" }}>
                          {relativeTime(n.ts)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Widget>
          </div>
        </Grid>
      )}
    </div>
  );
}
