import type { ReactNode } from "react";

type BadgeTone = "accent" | "ok" | "err" | "muted" | "neutral";

const toneStyle: Record<BadgeTone, { bg: string; color: string; border: string }> = {
  accent: { bg: "var(--accent)", color: "var(--accent-ink)", border: "var(--accent)" },
  ok: { bg: "transparent", color: "var(--ok)", border: "var(--ok)" },
  err: { bg: "transparent", color: "var(--err)", border: "var(--err)" },
  muted: { bg: "transparent", color: "var(--muted)", border: "var(--border)" },
  neutral: { bg: "var(--surface-2)", color: "var(--text)", border: "var(--border)" },
};

export function Badge({
  children,
  tone = "neutral",
  title,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  title?: string;
}) {
  const s = toneStyle[tone];
  return (
    <span
      title={title}
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "2px 7px",
        borderRadius: 3,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** Prioritaets-Badge 1-5 — hoehere Prioritaet = Signalgelb (Spec §3/§4). */
export function PriorityBadge({ priority, reason }: { priority: number; reason?: string }) {
  const clamped = Math.min(5, Math.max(1, priority));
  const high = clamped >= 4;
  return (
    <Badge tone={high ? "accent" : "muted"} title={reason}>
      P{clamped}
    </Badge>
  );
}

/** Gelbes DEMO-Badge, wenn Adapter-Daten aus dem Demo-Fallback stammen. */
export function DemoBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <Badge tone="accent" title="Demo-Daten (kein Live-Key / nicht erreichbar)">
      DEMO
    </Badge>
  );
}

const statusLabel: Record<string, string> = {
  open: "Offen",
  drafted: "Entwurf",
  replied: "Beantwortet",
  closed: "Geschlossen",
};

export function StatusBadge({ status }: { status: string }) {
  const tone: BadgeTone =
    status === "open" ? "accent" : status === "closed" ? "muted" : "neutral";
  return <Badge tone={tone}>{statusLabel[status] ?? status}</Badge>;
}
