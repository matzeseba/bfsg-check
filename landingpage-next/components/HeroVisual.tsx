"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import {
  CheckIcon,
  FileTextIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";

import { HERO_VISUAL } from "@/lib/config";
import { EASE } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

// Das Hero-Audit-Report-Visual: ein stilisiertes App-Fenster, das ein
// Beispiel-Scan-Ergebnis zeigt (Grade-Badge, Findings, Before/After-Kontrast,
// Fix-Plan-Teaser). Rein dekorativ → aria-hidden; alle Aussagen stehen als
// Text im Hero. Reines SVG/CSS/React, kein Bild-Asset.
// Fox-Design: warme Card-Fläche, Marken-ORANGE für Akzent/Scan-Beam/Glow,
// MINT bleibt Erfolgs-/Action-Farbe (Haken, „nachher").
export function HeroVisual() {
  const reduced = usePrefersReducedMotion();
  const v = HERO_VISUAL;

  return (
    <div className="group/visual relative w-full min-w-0" aria-hidden>
      {/* Spotlight-Halo dahinter (Fox-Design: orange-getönt). Auf Mobile billiger:
          erster Halo kleinerer Blur-Radius, zweiter erst ab md. */}
      <div className="pointer-events-none absolute -inset-8 -z-10">
        <div className="absolute left-1/2 top-1/3 size-[80%] -translate-x-1/2 rounded-full bg-brand-orange/20 blur-[40px] md:blur-[80px]" />
        <div className="absolute right-0 bottom-0 hidden size-[55%] rounded-full bg-brand-amber/10 blur-[80px] md:block" />
      </div>

      {/* Schwebende Akzent-Badges (Layering/Tiefe). Erst ab sm sichtbar: der
          negative Ueberhang (-left/-right) wuerde auf sehr schmalen Screens vom
          overflow-hidden der Section abgeschnitten und horizontalen Overflow
          erzeugen. Ab sm ist genug Rand fuer den Float-Effekt da. */}
      <FloatBadge
        className="top-16 -left-8 hidden sm:block"
        delay={0.9}
        reduced={reduced}
        slow
      >
        <SparklesIcon className="size-3.5 text-brand-orange" />
        EN 301 549
      </FloatBadge>
      <FloatBadge
        className="bottom-24 -right-6 hidden sm:block"
        delay={1.1}
        reduced={reduced}
      >
        <FileTextIcon className="size-3.5 text-brand-mint" />
        PDF-Report
      </FloatBadge>

      {/* Report-Card (Design: App-Chrome). border-gradient ist auf die Orange-
          Familie remapped (brand-indigo/violet → orange) → Marken-Verlaufskante.
          shadow-elevated trägt jetzt die Orange-Tönung; zusätzlich ein dezenter
          Orange-Glow-Ring (shadow-glow-orange) für die Marken-Anmutung. */}
      <div className="border-gradient relative overflow-hidden rounded-[1.7rem] bg-card/90 p-1.5 shadow-elevated shadow-glow-orange backdrop-blur-sm">
        {/* Scan-Beam-Sweep in Marken-Orange (nur ohne reduced-motion sichtbar). */}
        {!reduced && (
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[1.7rem]">
            <div className="absolute inset-x-0 top-0 h-24 animate-scan-beam bg-gradient-to-b from-transparent via-brand-orange/25 to-transparent" />
          </div>
        )}

        {/* App-Chrome: Ampel-Dots (rose/amber/mint) + Beispiel-Chip + URL-Bar. */}
        <div className="flex items-center gap-2 rounded-t-[1.4rem] border-b border-border/60 bg-muted/60 px-4 py-3">
          <span className="size-2.5 rounded-full bg-brand-rose/80" />
          <span className="size-2.5 rounded-full bg-brand-amber/80" />
          <span className="size-2.5 rounded-full bg-brand-mint/80" />
          <span className="shrink-0 rounded-md border border-brand-orange/30 bg-brand-orange/12 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-brand-orange uppercase">
            {v.sampleLabel}
          </span>
          <div className="mx-auto flex min-w-0 items-center gap-2 rounded-lg bg-background/80 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex size-1.5 shrink-0 rounded-full bg-brand-mint" />
            {/* Neutrale Demo-Host-URL (reine Chrome, kein Link): zeigt die Kunden-
                Perspektive statt der Host-Domain. SITE.url bleibt unverändert. */}
            <span className="min-w-0 truncate">ihre-website.de/{v.reportPath}</span>
          </div>
        </div>

        <div className="relative grid gap-4 p-4 sm:p-5">
          {/* Kopf: „C"-Grade-Badge (amber) + Verdikt */}
          <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/60 p-4">
            <GradeBadge grade={v.grade} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                <span className="inline-flex size-1.5 animate-pulse-soft rounded-full bg-brand-orange" />
                BFSG-Audit fertig
              </div>
              <p className="mt-1 font-display text-lg font-semibold tracking-tight">
                Note {v.grade} ·{" "}
                <span className="font-mono tabular-nums">
                  {v.totalFindings}
                </span>{" "}
                Funde
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                davon{" "}
                <span className="font-medium text-brand-rose">
                  {v.criticalCount} kritisch
                </span>{" "}
                — erhöhtes Beschwerderisiko.
              </p>
            </div>
          </div>

          {/* Findings-Liste (gestaffelt). min-w-0 auf ul UND li nötig: die Flex-
              Zeile (truncate-Titel + shrink-0-Badge) erzwingt sonst eine min-
              content-Breite, die die Grid-Spalte der Karte ~14px zu breit macht →
              alle inneren Kästen rutschen nach rechts. Linke Severity-Kante je
              Befund (Design: border-left in der Fund-Farbe). */}
          <ul className="grid min-w-0 gap-2">
            {v.findings.map((f, i) => (
              <motion.li
                key={f.title}
                initial={reduced ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                className={
                  "flex min-w-0 items-center gap-3 rounded-xl border border-l-2 border-border/55 bg-card/70 px-3 py-2.5 " +
                  (f.tone === "high"
                    ? "border-l-brand-rose"
                    : f.tone === "mid"
                      ? "border-l-brand-amber"
                      : "border-l-muted-foreground/60")
                }
              >
                <SeverityDot tone={f.tone} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {f.title}
                </span>
                <span
                  className={
                    "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide uppercase " +
                    (f.tone === "high"
                      ? "bg-brand-rose/12 text-brand-rose"
                      : f.tone === "mid"
                        ? "bg-brand-amber/15 text-brand-amber"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  {f.severity}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Before/After-Kontrast-Mini-Demo (rot → mint) */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-border/55 bg-background/60 p-3">
            <ContrastSample
              variant="before"
              ratio={v.contrast.before.ratio}
              label={v.contrast.before.label}
            />
            <span className="text-lg text-muted-foreground" aria-hidden>
              →
            </span>
            <ContrastSample
              variant="after"
              ratio={v.contrast.after.ratio}
              label={v.contrast.after.label}
            />
          </div>

          {/* Fix-Plan-Teaser — dekorativ (Teil des aria-hidden Visuals). Marken-
              Orange-getönte Kante/Fläche statt mint. */}
          <p className="pointer-events-none rounded-xl border border-brand-orange/30 bg-gradient-to-r from-brand-orange/10 to-brand-amber/8 py-3 pl-4 pr-14 text-center text-[13px] font-medium text-muted-foreground">
            + priorisierter Fix-Plan &amp; Entwurf der Barrierefreiheitserklärung
          </p>
        </div>
      </div>
    </div>
  );
}

function SeverityDot({ tone }: { tone: string }) {
  const cls =
    tone === "high"
      ? "bg-brand-rose"
      : tone === "mid"
        ? "bg-brand-amber"
        : "bg-muted-foreground/70";
  // tone="high" (kritisch) pulst dezent → "Live-Scan"-Anmutung; sonst statisch.
  const pulse = tone === "high" ? "animate-pulse-soft" : "";
  return (
    <span
      className={`inline-flex size-2 shrink-0 rounded-full ${cls} ${pulse}`}
    />
  );
}

function ContrastSample({
  variant,
  ratio,
  label,
}: {
  variant: "before" | "after";
  ratio: string;
  label: string;
}) {
  const fail = variant === "before";
  return (
    <div className="min-w-0 text-center">
      <p className="mb-1.5 font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      {/* Beispiel-Button im jeweiligen Kontrast (vorher: zu schwach, nachher: AA). */}
      <div
        className={
          "rounded-md px-2 py-1.5 text-center text-[11px] font-semibold " +
          // „vorher/fail" bewusst LOW-CONTRAST (Demo des Kontrast-Mangels), aber
          // warm/neutral statt kühlem Hue 270 — passt zur warmen Fox-Palette.
          (fail
            ? "bg-[oklch(0.4_0.01_60)] text-[oklch(0.55_0.01_60)]"
            : "border border-brand-mint/30 bg-brand-deep text-brand-mint")
        }
      >
        Jetzt kaufen
      </div>
      <p
        className={
          "mt-1.5 inline-flex items-center justify-center gap-1 font-mono text-[11px] font-semibold tabular-nums " +
          (fail ? "text-brand-rose" : "text-brand-mint")
        }
      >
        {ratio}
        {fail ? (
          <XIcon className="size-3" />
        ) : (
          <CheckIcon className="size-3" strokeWidth={3} />
        )}
      </p>
    </div>
  );
}

function FloatBadge({
  children,
  className,
  delay,
  reduced,
  slow,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  reduced: boolean;
  slow?: boolean;
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      className={`absolute z-30 ${className ?? ""}`}
    >
      <div
        className={
          "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/90 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-card-hover backdrop-blur " +
          (reduced ? "" : slow ? "animate-float-slow" : "animate-float")
        }
      >
        {children}
      </div>
    </motion.div>
  );
}

// „C"-Grade-Badge im Fox-Design: amber getöntes Quadrat mit großem Buchstaben
// (statt des bisherigen SVG-Score-Gauge — das Design zeigt eine Noten-Kachel).
function GradeBadge({ grade }: { grade: string }) {
  return (
    <div className="grid size-[52px] shrink-0 place-items-center rounded-xl border border-brand-amber/30 bg-brand-amber/12 font-display text-2xl font-extrabold text-brand-amber">
      {grade}
    </div>
  );
}
