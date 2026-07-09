import type { ReactNode } from "react";

export function Loading({ label = "Lade Daten …" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "var(--muted)",
        padding: 24,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 14,
          height: 14,
          border: "2px solid var(--border)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
          display: "inline-block",
          animation: "aos-spin 0.7s linear infinite",
        }}
      />
      <span className="micro">{label}</span>
      <style>{`@keyframes aos-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="panel"
      style={{
        padding: 16,
        borderColor: "var(--err)",
        color: "var(--err)",
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span aria-hidden="true">⚠</span>
      <span>{message}</span>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 32,
        textAlign: "center",
        color: "var(--muted)",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      {children}
    </div>
  );
}
