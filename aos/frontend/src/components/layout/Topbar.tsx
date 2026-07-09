"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { titleForPath } from "./nav";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { auth, notificationsApi, type AppNotification } from "@/lib/api";
import { relativeTime } from "@/lib/format";

const LEVEL_TONE: Record<string, "info" | "warn" | "lead"> = {
  info: "info",
  warn: "warn",
  lead: "lead",
};

function levelColor(level: string): string {
  if (level === "warn") return "var(--accent)";
  if (level === "lead") return "var(--ok)";
  return "var(--muted)";
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = titleForPath(pathname);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const unread = items.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    try {
      const res = await notificationsApi.list(false);
      setItems(res.items);
    } catch {
      /* stiller Fehlschlag im Poll */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 30000);
    return () => clearInterval(id);
  }, [load]);

  // Klick ausserhalb schliesst Dropdown
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const ids = items.filter((n) => !n.read).map((n) => n.id);
      // optimistisch
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await notificationsApi.markRead(ids);
      } catch {
        void load();
      }
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    try {
      await auth.logout();
    } catch {
      /* egal — Cookie evtl. schon weg */
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header
      style={{
        gridArea: "topbar",
        height: 60,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Notification-Bell */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="btn"
            onClick={toggleOpen}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label={`Benachrichtigungen${unread > 0 ? `, ${unread} ungelesen` : ""}`}
            style={{ position: "relative", padding: "8px 10px" }}
          >
            <Icon name="bell" size={18} />
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="mono"
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "var(--accent)",
                  color: "var(--accent-ink)",
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                  display: "grid",
                  placeItems: "center",
                  padding: "0 4px",
                }}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>

          {open && (
            <div
              role="menu"
              aria-label="Benachrichtigungen"
              className="panel"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 340,
                maxHeight: 420,
                overflowY: "auto",
                zIndex: 30,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--border)",
                }}
                className="micro"
              >
                Benachrichtigungen
              </div>
              {items.length === 0 ? (
                <div style={{ padding: 20, color: "var(--muted)", fontSize: 13 }}>
                  Keine Benachrichtigungen.
                </div>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {items.map((n) => (
                    <li
                      key={n.id}
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          marginTop: 5,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: levelColor(n.level),
                          flex: "0 0 auto",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 2,
                          }}
                        >
                          <strong style={{ fontSize: 13 }}>{n.title}</strong>
                          <Badge
                            tone={
                              n.level === "warn"
                                ? "accent"
                                : n.level === "lead"
                                  ? "ok"
                                  : "muted"
                            }
                          >
                            {LEVEL_TONE[n.level] ?? n.level}
                          </Badge>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: "var(--muted)",
                          }}
                        >
                          {n.body}
                        </p>
                        <span
                          className="micro"
                          style={{ color: "var(--muted)" }}
                        >
                          {relativeTime(n.ts)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          className="btn"
          onClick={onLogout}
          disabled={loggingOut}
          aria-label="Abmelden"
          style={{ padding: "8px 12px" }}
        >
          <Icon name="logout" size={18} />
          <span>Abmelden</span>
        </button>
      </div>
    </header>
  );
}
