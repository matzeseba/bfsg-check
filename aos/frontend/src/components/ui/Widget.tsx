import type { ReactNode } from "react";

/** Brutalistische Widget-Huelle mit UPPERCASE-Kopfzeile. */
export function Widget({
  title,
  action,
  children,
  noPad,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  noPad?: boolean;
}) {
  return (
    <section
      className="panel"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <header
        className="aos-widget-head"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          cursor: "grab",
        }}
      >
        <span className="micro">{title}</span>
        {action}
      </header>
      <div
        style={{
          padding: noPad ? 0 : 14,
          flex: 1,
          overflow: "auto",
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function KpiTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <span className="micro">{label}</span>
      <span
        className="mono"
        style={{
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1,
          color: accent ? "var(--accent)" : "var(--text)",
        }}
      >
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{sub}</span>
      )}
    </div>
  );
}
