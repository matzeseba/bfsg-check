"use client";

import * as motion from "motion/react-client";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/lib/checkout-context";
import { cn } from "@/lib/utils";

export type ScanResult = {
  score: number;
  totalIssues: number;
  topIssues?: string[];
};

function gradeFor(score: number): {
  grade: string;
  variant: "default" | "secondary" | "destructive";
  verdict: string;
  tone: "good" | "warn" | "bad";
} {
  // Frontend-Teaser-Note aus dem Score abgeleitet (A>=90, B>=75, C>=50, sonst D),
  // angelehnt an die Backend-Stufen in scanner/lib/report.js. Der Scan-Endpoint
  // liefert im aktuellen ScanResult-Vertrag keine grade/verdict-Felder; sobald er
  // das tut, hier direkt rendern statt neu berechnen.
  if (score >= 90) {
    return {
      grade: "A",
      variant: "default",
      verdict: "Solide Basis — wenige Restpunkte zu klären.",
      tone: "good",
    };
  }
  if (score >= 75) {
    return {
      grade: "B",
      variant: "secondary",
      verdict: "Solide Basis, aber Handlungsbedarf.",
      tone: "warn",
    };
  }
  if (score >= 50) {
    return {
      grade: "C",
      variant: "secondary",
      verdict: "Mehrere Mängel — erhöhtes Beschwerderisiko.",
      tone: "warn",
    };
  }
  return {
    grade: "D",
    variant: "destructive",
    verdict: "Deutliche Mängel — erhöhtes Abmahnrisiko.",
    tone: "bad",
  };
}

export function ResultCard({ result }: { result: ScanResult }) {
  const { score, totalIssues, topIssues } = result;
  const { grade, variant, verdict, tone } = gradeFor(score);
  const { openCheckout } = useCheckout();
  const positive = score >= 75;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      role="region"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-card-soft backdrop-blur"
    >
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-4",
          tone === "good"
            ? "bg-brand-mint/10"
            : tone === "warn"
              ? "bg-brand-amber/10"
              : "bg-brand-rose/8",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-xl",
            positive
              ? "bg-brand-mint/20 text-brand-mint"
              : "bg-brand-rose/15 text-brand-rose",
          )}
        >
          {positive ? (
            <ShieldCheckIcon className="size-5" />
          ) : (
            <ShieldAlertIcon className="size-5" />
          )}
        </span>
        <div className="flex-1">
          <p className="font-display text-lg font-semibold tracking-tight">
            <span className="font-mono tabular-nums">{score}/100</span> · Note{" "}
            {grade}
          </p>
          <p className="text-xs text-muted-foreground">{verdict}</p>
        </div>
        <Badge variant={variant} className="font-medium tabular-nums">
          {totalIssues} Funde
        </Badge>
      </div>
      <div className="grid gap-3 px-5 py-4">
        {totalIssues > 0 ? (
          <>
            <p className="text-sm font-medium">
              Top-Befunde aus der Sofort-Prüfung
            </p>
            {topIssues && topIssues.length > 0 ? (
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {topIssues.slice(0, 3).map((issue) => (
                  <li key={issue} className="flex items-start gap-2">
                    {/* WCAG 1.4.1: Bedeutung nicht allein über Farbe — Icon je Befund,
                        Farbe bleibt zusätzlich (rot = Mangel). */}
                    <AlertTriangleIcon
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-brand-rose"
                    />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              // Befunde vorhanden, aber keine Titel im Teaser — KEINE erfundenen
              // Beispiele, sondern eine ehrliche Zusammenfassung.
              <p className="text-sm text-muted-foreground">
                {totalIssues} {totalIssues === 1 ? "Befund" : "Befunde"} erkannt —
                die einzelnen Stellen stehen im Vollreport.
              </p>
            )}
          </>
        ) : (
          // 0 echte Funde: positiver Klartext statt hartcodierter Platzhalter-Mängel
          // (Score 100/„0 Funde" darf sich nicht selbst widersprechen).
          <div className="flex items-start gap-2">
            <CheckCircle2Icon
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-brand-mint"
            />
            <p className="text-sm text-muted-foreground">
              Keine automatisiert erkennbaren Verstöße gefunden. Automatisierte Tests
              decken rund 30–50 % der Barrieren ab — eine manuelle Prüfung wird dennoch
              empfohlen.
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col items-stretch gap-3 border-t border-border/60 bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Vollreport mit jedem Mangel + fertiger Erklärung. Paket im Checkout
          wählbar.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/#pakete"
            className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Alle Pakete vergleichen
          </Link>
          <Button
            onClick={() => openCheckout("profi")}
            className="h-11 gap-1.5 rounded-xl bg-brand-mint text-sm font-semibold text-brand-deep hover:bg-brand-mint/85"
          >
            Vollreport sichern
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
