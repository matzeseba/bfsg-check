"use client";

import * as React from "react";
import Link from "next/link";
import {
  AccessibilityIcon,
  ArrowRightIcon,
  MailIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LEGAL_NOTE, SITE } from "@/lib/config";

import { resetConsent } from "./CookieBanner";

const COLUMNS = [
  {
    title: "Produkt",
    links: [
      { href: "/#pakete", label: "BFSG-Pakete" },
      { href: "/#cookie", label: "Cookie-Check" },
      { href: "/#ablauf", label: "Wie es funktioniert" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/agb", label: "AGB" },
      { href: "/widerruf", label: "Widerruf" },
      { href: "/widerrufsbelehrung", label: "Widerrufsbelehrung" },
    ],
  },
  {
    title: "Konto",
    links: [
      { href: "/kuendigen", label: "Vertrag kündigen" },
      { href: "/datenschutz/anfrage", label: "Datenauskunft" },
    ],
  },
] as const;

export function Footer() {
  const [submitted, setSubmitted] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // UI-only: kein Backend angebunden.
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <footer className="relative border-t border-border/60 bg-card/40">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-brand-mint/5 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand + Newsletter */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display text-base font-bold tracking-tight"
            >
              <span
                aria-hidden
                className="relative inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-indigo to-brand-deep text-primary-foreground shadow-glow-mint"
              >
                <AccessibilityIcon className="size-4.5" />
                <span className="pointer-events-none absolute -right-1 -bottom-1 size-2.5 rounded-full bg-brand-mint ring-2 ring-card" />
              </span>
              <span className="flex items-baseline gap-1">
                <span>BFSG</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-brand-mint">Check</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Automatisierte Barrierefreiheits-Prüfung nach WCAG 2.1 / EN 301
              549. Premium-Audit ohne Kanzlei-Honorar.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-6 flex max-w-sm flex-col gap-2 sm:flex-row"
              aria-label="Newsletter abonnieren"
            >
              <div className="relative flex-1">
                <MailIcon
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="email"
                  required
                  placeholder="ihre@firma.de"
                  className="h-11 rounded-xl bg-card pl-9 text-sm"
                  aria-label="E-Mail-Adresse"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 gap-1 rounded-xl bg-brand-deep px-4 text-sm font-semibold text-primary-foreground hover:bg-brand-indigo"
              >
                Abonnieren
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </form>
            {submitted ? (
              <p className="mt-2 text-xs text-brand-mint">
                Danke — wir melden uns mit Updates zum Launch.
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Monatliche Compliance-News. Kein Spam, jederzeit abbestellbar.
              </p>
            )}
          </div>

          {/* Link-Spalten */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold tracking-[0.18em] text-foreground uppercase">
                  {col.title}
                </p>
                <ul className="mt-4 grid gap-2 text-sm">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name} ·{" "}
            {SITE.url.replace("https://", "")} · Made in Germany 🇩🇪
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetConsent}
              className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cookie-Einstellungen
            </button>
            <a
              href="https://www.linkedin.com/company/bfsg-check"
              aria-label="BFSG-Check auf LinkedIn"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
                className="size-4"
              >
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43c-1.14 0-2.07-.93-2.07-2.07s.93-2.07 2.07-2.07 2.07.93 2.07 2.07-.93 2.07-2.07 2.07zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
              </svg>
            </a>
            <a
              href="https://x.com/bfsgcheck"
              aria-label="BFSG-Check auf X"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
                className="size-3.5"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          {LEGAL_NOTE}
        </p>
      </div>
    </footer>
  );
}
