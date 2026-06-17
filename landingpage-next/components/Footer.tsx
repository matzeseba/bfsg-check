"use client";

import Link from "next/link";

import { LEGAL_NOTE, SITE } from "@/lib/config";
import { resetConsent } from "./CookieBanner";

const LINKS = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
  { href: "/kuendigen", label: "Vertrag kündigen" },
] as const;

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">{SITE.name}</p>
            <p className="mt-1 text-xs">
              Automatisierte Barrierefreiheits-Prüfung nach WCAG 2.1 / EN
              301 549
            </p>
          </div>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-4 gap-y-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={resetConsent}
              className="text-left hover:text-foreground hover:underline"
            >
              Cookie-Einstellungen
            </button>
          </nav>
        </div>
        <p className="text-xs">© {new Date().getFullYear()} {SITE.name} — {SITE.url.replace("https://", "")}</p>
        <p className="text-xs">{LEGAL_NOTE}</p>
      </div>
    </footer>
  );
}
