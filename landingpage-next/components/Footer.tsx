"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MailIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { BRAND, LEGAL_NOTE, SITE } from "@/lib/config";

import { resetConsent } from "./CookieBanner";

const COLUMNS = [
  {
    title: "Produkt",
    links: [
      { href: "/#pakete", label: "BFSG-Pakete" },
      { href: "/#cookie", label: "Cookie-Check" },
      { href: "/#ablauf", label: "Wie es funktioniert" },
      { href: "/#faq", label: "FAQ" },
      { href: "/partner", label: "Partnerprogramm für Agenturen" },
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
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "sending" | "pending" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      // Double-Opt-in über Brevo (Backend /api/newsletter). Erfolg = Bestätigungs-
      // mail verschickt, NICHT bereits abonniert — daher "pending", keine
      // (rechtlich unzulässige) Sofort-Erfolgsmeldung ohne Bestätigung.
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus("pending");
        setEmail("");
      } else {
        setErrorMsg(data.error || "Anmeldung derzeit nicht möglich.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Verbindung fehlgeschlagen. Bitte später erneut.");
      setStatus("error");
    }
  }

  return (
    // Scoped Dark: Footer-Flaeche ist fest dunkel (tiefstes Schwarz des
    // Dark-Glow-Redesigns) → `dark` haelt Spalten-Titel/Links/Input auf den
    // Dark-Tokens, auch falls je wieder ein Light-Kontext existiert.
    <footer className="dark relative overflow-hidden bg-brand-deepest text-foreground">
      {/* Feine Glow-Oberkante (Vorlagen-Signatur): Orange-Hairline + warmes
          Glimmen, das nach unten ins tiefste Schwarz auslaeuft. Dekorativ. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-px bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-32 bg-gradient-to-b from-brand-orange/[0.06] to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-10 text-center lg:grid-cols-[1.2fr_2fr] lg:text-left">
          {/* Brand + Newsletter */}
          <div className="flex flex-col items-center lg:items-start">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 py-2 font-display text-lg font-bold tracking-tight"
              aria-label={`${SITE.name} Startseite`}
            >
              {/* Offizielles Fuchs-Wappen (dekorativ → leeres alt, Wortmarke traegt
                  den Namen). Glow ist im Asset selbst eingebrannt, daher kein
                  zusaetzlicher CSS-Drop-Shadow (wie im Header). */}
              <Image
                src="/logo-fuchs-wappen.png"
                alt=""
                width={217}
                height={256}
                loading="lazy"
                className="h-10 w-auto shrink-0 rounded-md"
              />
              <span className="flex items-baseline gap-0.5">
                <span>BFSG</span>
                <span className="text-brand-orange">·</span>
                <span>Fuchs</span>
                <span className="text-[0.78em] font-semibold text-muted-foreground">
                  .de
                </span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {BRAND.tagline}. {BRAND.promise}.
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
                  className="h-11 rounded-xl bg-card/80 pl-9 text-sm backdrop-blur"
                  aria-label="E-Mail-Adresse"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "sending"}
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-cta h-11 px-4 text-sm"
              >
                {status === "sending" ? "Sende…" : "Abonnieren"}
                <ArrowRightIcon className="size-3.5" />
              </button>
            </form>
            {/* Persistente Live-Region: existiert dauerhaft im DOM, damit der
                Statuswechsel von Screenreadern angesagt wird (WCAG 4.1.3). */}
            <p
              role="status"
              aria-live="polite"
              className="mt-2 text-xs text-muted-foreground"
            >
              {status === "pending" ? (
                <span className="text-brand-mint">
                  Fast geschafft — bitte bestätige den Link in der E-Mail, die wir
                  dir gerade geschickt haben.
                </span>
              ) : status === "error" ? (
                <span className="text-destructive">{errorMsg}</span>
              ) : (
                "Monatliche Compliance-News. Kein Spam, jederzeit abbestellbar."
              )}
            </p>
          </div>

          {/* Link-Spalten */}
          {/* 1 Spalte mobil, ab schmalem Viewport 3 Spalten — vermeidet, dass
              die dritte Spalte ("Konto") allein in einer zweiten Reihe hängt
              (kein eigenes xs-Breakpoint in dieser Tailwind-v4-Config definiert). */}
          <div className="grid grid-cols-1 gap-8 min-[480px]:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title} className="text-center sm:text-left">
                <p className="font-mono text-xs font-semibold tracking-[0.18em] text-foreground uppercase">
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

        <div className="mt-12 flex flex-col gap-4 border-t border-brand-orange/10 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name} ·{" "}
            {SITE.url.replace("https://", "")} · Made in Germany 🇩🇪
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetConsent}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cookie-Einstellungen
            </button>
          </div>
        </div>

        {/* Disclaimer bewusst gut lesbar: text-xs statt 11px, muted-foreground
            (#b3a99f) ist AA-sicher auf dem tiefschwarzen Grund. */}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {LEGAL_NOTE}
        </p>
      </div>
    </footer>
  );
}
