"use client";

import * as motion from "motion/react-client";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { useCheckout } from "@/lib/checkout-context";
import { EASE } from "@/lib/motion";

import { LeadCapture } from "./LeadCapture";
import { ResultPanel, type ScanResult } from "./ResultPanel";

// Typen leben jetzt in ResultPanel (gemeinsame Darstellung von echtem Ergebnis
// und Hero-Vorschau); Re-Export hält bestehende Importe (ScanForm, LeadCapture)
// stabil.
export type { ScanCounts, ScanResult } from "./ResultPanel";

// Dünner Wrapper um das gemeinsame ResultPanel: ergänzt Lead-Capture und
// Kauf-Leiste. Die Ergebnis-Darstellung selbst (Note, Severity-Zähler,
// Top-Befunde, Sperrzeile) rendert ResultPanel — dieselbe Komponente wie die
// Hero-Vorschau (HeroVisual), damit Vorschau und Realität nie auseinanderlaufen.
export function ResultCard({ result }: { result: ScanResult }) {
  const { totalIssues } = result;
  const { openCheckout } = useCheckout();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      role="region"
      aria-live="polite"
      className="glow-card overflow-hidden rounded-2xl backdrop-blur"
    >
      <ResultPanel result={result} />
      {/* Value-first-Lead-Capture: erweiterte Befund-Übersicht gegen E-Mail
          (Double-Opt-in), sitzt zwischen ungated Befunden und Kauf-CTA. */}
      <LeadCapture
        score={result.score}
        totalIssues={totalIssues}
        counts={result.counts}
        topIssues={result.topIssues}
      />
      <div className="flex flex-col items-stretch gap-3 border-t border-border/60 bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Personalisiert auf das echte Ergebnis — KEINE erfundenen Zahlen.
            Mit Funden: konkrete Fund-Zahl + Fix-Versprechen. Ohne Funde: das
            Dokumentations-Argument (saubere Erstprüfung schriftlich). */}
        <p className="text-xs text-muted-foreground">
          {totalIssues > 0 ? (
            <>
              Ihre Seite hat{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {totalIssues} {totalIssues === 1 ? "Fund" : "Funde"}
              </span>
              . Der Vollreport zeigt jede Stelle — mit Copy-Paste-Fix und Entwurf
              der Erklärung.
            </>
          ) : (
            <>
              Lassen Sie sich die saubere WCAG-2.1-AA-Erstprüfung schriftlich
              bestätigen — inkl. Entwurf der Barrierefreiheitserklärung.
            </>
          )}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/#pakete"
            className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Alle Pakete vergleichen
          </Link>
          {/* Einstiegs-Anker: kostenloser Scan → Basis-Report (129 €), nicht direkt
              Profi (399 €). Preis am Button sichtbar (Reibung senken). Ruhiger
              Schwebeeffekt + Hintergrundschimmer wie der "Abonnieren"-Button im
              Footer (Owner-Feedback 08.07.: kein magnetischer Cursor-Effekt mehr). */}
          <button
            type="button"
            onClick={() => openCheckout("basis")}
            className="btn-cta h-11 w-full gap-1.5 rounded-xl text-sm sm:w-auto"
          >
            {totalIssues > 0
              ? "Vollreport sichern — 129 €"
              : "Bestätigung sichern — 129 €"}
            <ArrowRightIcon className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
