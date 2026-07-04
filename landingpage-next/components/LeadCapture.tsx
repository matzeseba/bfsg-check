"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, MailIcon } from "lucide-react";

import { MagneticButton } from "@/components/fx/MagneticButton";
import { Input } from "@/components/ui/input";
import { useCheckout } from "@/lib/checkout-context";
import type { ScanCounts } from "./ResultCard";

type LeadCaptureProps = {
  score: number;
  totalIssues: number;
  // Fuer die Value-Mail (PR2): alle Befund-Kategorien + Top-3-Prioritaeten,
  // damit die E-Mail exakt das im Formular versprochene Paket liefert.
  counts?: ScanCounts;
  // readonly: ScanResult.topIssues (ResultPanel) ist readonly — akzeptiert
  // sowohl API-Daten als auch as-const-Beispieldaten.
  topIssues?: readonly string[];
};

// Value-first-Lead-Magnet: NACH dem ungated Score + Top-Befunden, VOR dem Kauf.
// Holt die E-Mail gegen eine erweiterte Befund-Uebersicht + Aktionsplan-Vorschau
// (klar WENIGER als der bezahlte Vollreport — keine Copy-Paste-Fixes, kein
// Erklaerungs-Entwurf). Versand laeuft ueber das Backend /api/lead via Brevo
// Double-Opt-in (§7 UWG/DSGVO): Erfolg = Bestaetigungsmail unterwegs, NICHT bereits
// eingetragen. Der gescannte URL + Score gehen als Kontext mit, damit die Nurture
// das Ergebnis personalisieren kann. Faellt ehrlich auf "gerade nicht verfuegbar"
// zurueck, solange das Brevo-Setup (Liste/Template) noch nicht steht (503).
export function LeadCapture({
  score,
  totalIssues,
  counts,
  topIssues,
}: LeadCaptureProps) {
  const { state } = useCheckout();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "sending" | "pending" | "unavailable" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          url: state.url,
          score,
          totalIssues,
          counts,
          topIssues,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus("pending");
        setEmail("");
      } else if (res.status === 503) {
        // Brevo-Setup noch nicht scharf → ehrlich, kein Fake-Erfolg.
        setStatus("unavailable");
      } else {
        setErrorMsg(data.error || "Versand derzeit nicht möglich.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Verbindung fehlgeschlagen. Bitte später erneut.");
      setStatus("error");
    }
  }

  const statusText =
    status === "pending"
      ? "Fast geschafft — bitte bestätigen Sie den Link in der E-Mail (auch den Spam-Ordner prüfen)."
      : status === "unavailable"
        ? "Der E-Mail-Versand ist gerade nicht verfügbar. Sie sehen Ihr Ergebnis oben weiterhin vollständig."
        : status === "error"
          ? errorMsg
          : "";

  return (
    // Dunkle Glas-Optik (Dark-Glow): Orange-Verlaufs-Rahmen statt Voll-Border,
    // zarte Orange-Tönung auf der Kartenfläche. Inhalt/Logik unverändert.
    <div className="glow-border mx-5 mb-4 rounded-xl bg-brand-orange/[0.05] px-4 py-4 backdrop-blur">
      <p className="font-display text-sm font-semibold tracking-tight">
        {totalIssues > 0
          ? "Den vollständigen Befund-Überblick per E-Mail"
          : "Erstprüfung schriftlich per E-Mail"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {totalIssues > 0 ? (
          <>
            Alle gefundenen Befund-Kategorien, eine Aktionsplan-Vorschau und die
            Einordnung Ihres WCAG-Scores — kostenlos per E-Mail. Der Vollreport
            mit jeder Fundstelle und Umsetzungsdetails bleibt den
            kostenpflichtigen Paketen vorbehalten.
          </>
        ) : (
          <>
            Lassen Sie sich die automatisierte WCAG-2.1-AA-Erstprüfung als
            Übersicht per E-Mail zusenden — mit Hinweisen zur manuellen Prüfung.
          </>
        )}
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        aria-label="Befund-Übersicht per E-Mail anfordern"
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending"}
          />
        </div>
        {/* Magnetischer CTA: nur der Wrapper folgt dem Cursor, Submit-/
            Disabled-Logik des Buttons bleibt unverändert. */}
        <MagneticButton className="w-full shrink-0 sm:w-auto">
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-cta h-11 w-full px-4 text-sm"
          >
            {status === "sending" ? "Sende…" : "Übersicht anfordern"}
            <ArrowRightIcon className="size-3.5" />
          </button>
        </MagneticButton>
      </form>

      {/* Persistente Live-Region (WCAG 4.1.3): immer im DOM, damit Screenreader
          den Statuswechsel ansagen. */}
      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-4 text-xs text-muted-foreground"
      >
        {status === "pending" ? (
          <span className="text-brand-indigo dark:text-brand-mint">
            {statusText}
          </span>
        ) : (
          statusText
        )}
      </p>

      <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">
        Double-Opt-in. Kein Spam, jederzeit abbestellbar. Mehr in der{" "}
        <Link href="/datenschutz" className="underline hover:text-foreground">
          Datenschutzerklärung
        </Link>
        .
      </p>
    </div>
  );
}
