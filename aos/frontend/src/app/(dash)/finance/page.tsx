"use client";

import { useEffect, useState } from "react";
import {
  financeApi,
  type FinanceSummary,
  type InvoiceList,
  type Thresholds,
} from "@/lib/api";
import { Widget, KpiTile } from "@/components/ui/Widget";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Loading, ErrorNote, Empty } from "@/components/ui/States";
import { eur, num, pct, dateShort } from "@/lib/format";

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [invoices, setInvoices] = useState<InvoiceList | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [sumR, invR, thrR] = await Promise.allSettled([
        financeApi.summary(),
        financeApi.invoices(50),
        financeApi.thresholds(),
      ]);
      if (!active) return;
      if (sumR.status === "fulfilled") setSummary(sumR.value);
      else setError("Finanzdaten konnten nicht geladen werden.");
      if (invR.status === "fulfilled") setInvoices(invR.value);
      if (thrR.status === "fulfilled") setThresholds(thrR.value);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading label="Lade Finanzen …" />;

  const demo = summary?.source === "demo";
  const ku = thresholds?.kleinunternehmer;
  const kuPct = ku ? Math.min(100, ku.pct_used) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {demo && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DemoBadge show />
          <span className="micro" style={{ color: "var(--muted)" }}>
            Es werden Demo-Zahlen angezeigt (kein Live-Stripe-Zugriff).
          </span>
        </div>
      )}

      {error && <ErrorNote message={error} />}

      {/* KPI-Kacheln */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <div className="panel" style={{ padding: 16, height: 110 }}>
            <KpiTile label="Brutto 30 Tage" value={eur(summary.gross_30d)} accent sub={`Netto ${eur(summary.net_30d)}`} />
          </div>
          <div className="panel" style={{ padding: 16, height: 110 }}>
            <KpiTile label="Gebühren 30 Tage" value={eur(summary.fees_30d)} />
          </div>
          <div className="panel" style={{ padding: 16, height: 110 }}>
            <KpiTile label="MRR" value={eur(summary.mrr)} sub={`${num(summary.active_subs)} aktive Abos`} />
          </div>
          <div className="panel" style={{ padding: 16, height: 110 }}>
            <KpiTile
              label="Rückerstattungsquote"
              value={pct(summary.refund_rate_pct)}
              accent={summary.refund_rate_pct >= 5}
            />
          </div>
        </div>
      )}

      {/* §19-Schwellen-Progressbar */}
      {ku && (
        <Widget
          title="Kleinunternehmer-Schwelle (§ 19 UStG)"
          action={ku.warn ? <Badge tone="accent">Warnung</Badge> : <Badge tone="ok">im Rahmen</Badge>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: ku.warn ? "var(--accent)" : "var(--text)" }}>
                {eur(ku.ytd_revenue)}
              </span>
              <span className="micro" style={{ color: "var(--muted)" }}>
                von {eur(ku.limit_current_year)} · Prognose Jahresende {eur(ku.projected_year_end)}
              </span>
            </div>
            <div
              style={{
                height: 14,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
              }}
              role="progressbar"
              aria-valuenow={Math.round(kuPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Auslastung der Kleinunternehmer-Schwelle"
            >
              <div
                style={{
                  width: `${kuPct}%`,
                  height: "100%",
                  background: ku.warn ? "var(--accent)" : "var(--ok)",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="micro">Vorjahres-Grenze: {eur(ku.limit_prev_year)}</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
                {pct(ku.pct_used)} ausgeschöpft
              </span>
            </div>
          </div>
        </Widget>
      )}

      {/* Paket-Split */}
      {summary && summary.by_package.length > 0 && (
        <Widget title="Umsatz nach Paket (30 Tage)">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>Paket</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>Anzahl</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>Umsatz</th>
                </tr>
              </thead>
              <tbody>
                {summary.by_package.map((p) => (
                  <tr key={p.name}>
                    <td style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>{p.name}</td>
                    <td className="mono" style={{ padding: "8px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                      {num(p.count)}
                    </td>
                    <td className="mono" style={{ padding: "8px", borderBottom: "1px solid var(--border)", textAlign: "right", fontWeight: 700 }}>
                      {eur(p.eur)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Widget>
      )}

      {/* Rechnungsliste */}
      <Widget title="Rechnungen">
        {!invoices || invoices.invoices.length === 0 ? (
          <Empty>Keine Rechnungen im Zeitraum.</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>Datum</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>Nr.</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>Kunde</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>Paket</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>Status</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>Betrag</th>
                </tr>
              </thead>
              <tbody>
                {invoices.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="mono" style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
                      {dateShort(inv.date)}
                    </td>
                    <td className="mono" style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>{inv.id}</td>
                    <td className="mono" style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>{inv.customer_masked}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>{inv.package}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
                      <Badge tone={inv.status === "paid" || inv.status === "bezahlt" ? "ok" : "muted"}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="mono" style={{ padding: "8px", borderBottom: "1px solid var(--border)", textAlign: "right", fontWeight: 700 }}>
                      {eur(inv.amount_eur)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Widget>
    </div>
  );
}
