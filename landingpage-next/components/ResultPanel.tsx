import { CheckCircle2Icon, LockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  SEVERITY_ORDER,
  SEVERITY_TEXT,
  severitySequence,
} from "@/lib/severity";
import { cn } from "@/lib/utils";

export type ScanCounts = {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
};

export type ScanResult = {
  score: number;
  totalIssues: number;
  // readonly: erlaubt sowohl die mutable API-Antwort (ScanForm) als auch die
  // as-const-Beispieldaten aus lib/config.ts (HERO_VISUAL.sample).
  topIssues?: readonly string[];
  // Vom /api/scan-Teaser (renderTeaser) mitgeliefert; zur Laufzeit bereits
  // vorhanden (setResult speichert die volle Antwort). Fuer die Value-Mail (PR2)
  // an LeadCapture durchgereicht.
  counts?: ScanCounts;
  grade?: string;
};

function gradeFor(score: number): {
  grade: string;
  variant: "default" | "secondary" | "destructive";
  verdict: string;
  tone: "good" | "warn" | "bad";
} {
  // Frontend-Teaser-Note aus dem Score abgeleitet (A>=90, B>=75, C>=50, sonst D),
  // angelehnt an die Backend-Stufen in scanner/lib/report.js. Liefert der
  // Scan-Endpoint eine grade mit, hat sie Vorrang (s. ResultPanel).
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

// Kleiner solider Schwere-Chip — Farben identisch zur DOI-Mail (lib/severity.ts).
// Label steht immer als Text im Chip → Bedeutung nie allein über Farbe (WCAG 1.4.1).
function SeverityChip({
  severity,
  count,
}: {
  severity: keyof typeof SEVERITY_LABEL;
  count?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide uppercase tabular-nums"
      style={{
        backgroundColor: SEVERITY_COLOR[severity],
        color: SEVERITY_TEXT[severity],
      }}
    >
      {SEVERITY_LABEL[severity]}
      {typeof count === "number" && <span>{count}</span>}
    </span>
  );
}

// Reines Darstellungs-Panel des Sofort-Ergebnisses: Noten-Kachel + Verdict,
// Severity-Zähler-Leiste, Top-Befunde mit Schwere-Chip, „+N weitere"-Sperrzeile.
// Props-only, KEINE Hooks (kein Checkout, kein Lead) — damit rendern die
// Hero-Vorschau (HeroVisual, Beispieldaten) und das echte Ergebnis (ResultCard)
// per Konstruktion DIESELBE Komponente und können nicht auseinanderlaufen.
export function ResultPanel({
  result,
  className,
}: {
  result: ScanResult;
  className?: string;
}) {
  const { score, totalIssues, topIssues, counts } = result;
  const derived = gradeFor(score);
  // Backend-Note hat Vorrang; verdict/tone bleiben score-basiert (der
  // Scan-Endpoint liefert im aktuellen Vertrag kein verdict-Feld).
  const grade = result.grade || derived.grade;
  const { variant, verdict, tone } = derived;
  const sevSeq = severitySequence(counts);
  const shownIssues = (topIssues ?? []).slice(0, 3);

  return (
    <div className={className}>
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
        {/* Noten-Kachel im Fox-Report-Stil: großer Buchstabe, getönt nach
            Tonalität (mint/amber/rose). Dekorativ → aria-hidden, die Note
            steht zusätzlich als Text rechts. */}
        <span
          aria-hidden
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl border font-display text-xl font-extrabold",
            tone === "good"
              ? "border-brand-mint/30 bg-brand-mint/15 text-brand-mint"
              : tone === "warn"
                ? "border-brand-amber/30 bg-brand-amber/15 text-brand-amber"
                : "border-brand-rose/30 bg-brand-rose/15 text-brand-rose",
          )}
        >
          {grade}
        </span>
        <div className="min-w-0 flex-1">
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
            {/* Severity-Zähler-Leiste: alle 4 Befund-Kategorien mit Zahl —
                dieselbe Aufschlüsselung wie die Zähler-Tabelle der DOI-Mail. */}
            {counts && (
              <ul className="flex flex-wrap items-center gap-1.5">
                {SEVERITY_ORDER.map((sev) => (
                  <li key={sev} className="inline-flex">
                    <SeverityChip severity={sev} count={counts[sev]} />
                  </li>
                ))}
              </ul>
            )}
            <p className="text-sm font-medium">
              Top-Befunde aus der Sofort-Prüfung
            </p>
            {shownIssues.length > 0 ? (
              <>
                <ul className="grid min-w-0 gap-2 text-sm text-muted-foreground">
                  {shownIssues.map((issue, i) => {
                    // Schwere je Befund aus severitySequence hergeleitet —
                    // identisch zur Mail. Chip trägt das Label als Text
                    // (nie nur Farbe, WCAG 1.4.1).
                    const sev = sevSeq[i];
                    return (
                      <li key={issue} className="flex min-w-0 items-start gap-2">
                        {sev ? <SeverityChip severity={sev} /> : null}
                        <span className="min-w-0">{issue}</span>
                      </li>
                    );
                  })}
                </ul>
                {/* Value-Gate: die weiteren Funde bleiben dem Vollreport vorbehalten
                    (shown = angezeigte Top-Befunde). Ehrlich formuliert, keine
                    erfundenen Zahlen — totalIssues kommt aus dem echten Teaser. */}
                {totalIssues > shownIssues.length && (
                  <p className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <LockIcon
                      aria-hidden
                      className="mt-0.5 size-3.5 shrink-0 text-brand-amber"
                    />
                    <span>
                      +{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {totalIssues - shownIssues.length}
                      </span>{" "}
                      weitere Stellen erst im Vollreport aufgeschlüsselt — je mit
                      Copy-Paste-Fix.
                    </span>
                  </p>
                )}
              </>
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
    </div>
  );
}
