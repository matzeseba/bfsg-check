"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav";
import { Icon } from "@/components/ui/Icon";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hauptnavigation"
      style={{
        gridArea: "sidebar",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Wordmark oben */}
      <div
        style={{
          padding: "20px 18px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Image
          src="/brand/bfsg-fuchs-wordmark.svg"
          alt="BFSG-Fuchs"
          width={150}
          height={32}
          priority
          style={{ height: 26, width: "auto" }}
        />
        <div className="micro" style={{ marginTop: 6 }}>
          Betriebssystem
        </div>
      </div>

      {/* Navigation */}
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${active ? "var(--border)" : "transparent"}`,
                  background: active ? "var(--surface-2)" : "transparent",
                  color: active ? "var(--text)" : "var(--muted)",
                  fontWeight: active ? 700 : 500,
                  borderLeft: active
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                }}
              >
                <span style={{ color: active ? "var(--accent)" : "inherit" }}>
                  <Icon name={item.icon} size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Maskottchen klein unten */}
      <div
        style={{
          padding: 16,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Image
          src="/brand/bfsg-fuchs-mascot-final.png"
          alt=""
          width={36}
          height={36}
          style={{ width: 36, height: 36, objectFit: "contain" }}
        />
        <div className="micro" style={{ lineHeight: 1.4 }}>
          BFSG-Fuchs
          <br />
          <span style={{ color: "var(--muted)" }}>v1.0.0</span>
        </div>
      </div>
    </nav>
  );
}
