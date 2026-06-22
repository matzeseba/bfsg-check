"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import {
  ArrowRightIcon,
  CheckIcon,
  FileTextIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";

import { HERO_VISUAL } from "@/lib/config";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

// Das Hero-Audit-Report-Visual: ein stilisiertes App-Fenster, das ein
// Beispiel-Scan-Ergebnis zeigt (Score-Gauge, Findings, Before/After-Kontrast,
// Fix-Plan-Teaser). Rein dekorativ → aria-hidden; alle Aussagen stehen als
// Text im Hero. Reines SVG/CSS/React, kein Bild-Asset.
export function HeroVisual() {
  const reduced = usePrefersReducedMotion();
  const v = HERO_VISUAL;

  return (
    <div className="group/visual relative" aria-hidden>
      {/* Spotlight-Halo dahinter (dezenter als ein klassischer Blob). */}
      <div className="pointer-events-none absolute -inset-8 -z-10">
        <div className="absolute left-1/2 top-1/3 size-[80%] -translate-x-1/2 rounded-full bg-brand-mint/20 blur-[80px]" />
        <div className="absolute right-0 bottom-0 size-[55%] rounded-full bg-brand-violet/20 blur-[80px]" />
      </div>

      {/* Schwebende Akzent-Badges (Layering/Tiefe). */}
      <FloatBadge
        className="-left-3 top-16 sm:-left-8"
        delay={0.9}
        reduced={reduced}
        slow
      >
        <SparklesIcon className="size-3.5 text-brand-mint" />
        EN 301 549
      </FloatBadge>
      <FloatBadge
        className="-right-3 bottom-24 sm:-right-6"
        delay={1.1}
        reduced={reduced}
      >
        <FileTextIcon className="size-3.5 text-brand-violet" />
        PDF-Report
      </FloatBadge>

      {/* Karte mit Border-Gradient + tiefem Mint-getoenten Schatten. */}
      <div className="border-gradient relative overflow-hidden rounded-[1.7rem] bg-card/90 p-1.5 shadow-elevated backdrop-blur-sm">
        {/* Scan-Beam-Sweep + feine Scanlines (nur ohne reduced-motion sichtbar). */}
        {!reduced && (
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[1.7rem]">
            <div className="absolute inset-x-0 top-0 h-24 animate-scan-beam bg-gradient-to-b from-transparent via-brand-mint/25 to-transparent" />
          </div>
        )}

        {/* App-Chrome */}
        <div className="flex items-center gap-2 rounded-t-[1.4rem] border-b border-border/60 bg-muted/60 px-4 py-3">
          <span className="size-2.5 rounded-full bg-brand-rose/60" />
          <span className="size-2.5 rounded-full bg-brand-amber/70" />
          <span className="size-2.5 rounded-full bg-brand-mint/80" />
          <div className="mx-auto inline-flex items-center gap-2 rounded-lg bg-background/80 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex size-1.5 rounded-full bg-brand-mint" />
            bfsg-fix.de/{v.reportPath}
          </div>
        </div>

        <div className="relative grid gap-4 p-4 sm:p-5">
          {/* Kopf: Score-Gauge + Verdikt */}
          <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/60 p-4">
            <ScoreGauge value={v.score} reduced={reduced} />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                <span className="inline-flex size-1.5 animate-pulse-soft rounded-full bg-brand-mint" />
                Audit abgeschlossen
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

          {/* Findings-Liste (gestaffelt) */}
          <ul className="grid gap-2">
            {v.findings.map((f, i) => (
              <motion.li
                key={f.title}
                initial={reduced ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 rounded-xl border border-border/55 bg-card/70 px-3 py-2.5"
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
                        : "bg-brand-mint/15 text-brand-mint")
                  }
                >
                  {f.severity}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Before/After-Kontrast-Mini-Demo */}
          <div className="grid grid-cols-2 gap-2">
            <ContrastSample
              variant="before"
              ratio={v.contrast.before.ratio}
              label={v.contrast.before.label}
            />
            <ContrastSample
              variant="after"
              ratio={v.contrast.after.ratio}
              label={v.contrast.after.label}
            />
          </div>

          {/* Fix-Plan-Teaser */}
          <a
            href="#pakete"
            tabIndex={-1}
            className="flex items-center justify-between gap-3 rounded-xl border border-brand-mint/40 bg-gradient-to-r from-brand-mint/12 to-brand-violet/10 px-4 py-3"
          >
            <p className="text-[13px] font-medium text-foreground">
              + priorisierter Fix-Plan &amp; Entwurf der Erklärung
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-deep px-2.5 py-1.5 text-[11px] font-semibold text-on-deep">
              Pakete
              <ArrowRightIcon className="size-3" />
            </span>
          </a>
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
        : "bg-brand-mint";
  // tone="high" (kritisch) pulst dezent → "Live-Scan"-Anmutung; sonst statisch.
  const pulse = tone === "high" ? "animate-pulse-soft" : "";
  return (
    <span
      className={`inline-flex size-2.5 shrink-0 rounded-full ${cls} ${pulse}`}
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
    <div
      className={
        "rounded-xl border p-3 " +
        (fail
          ? "border-brand-rose/30 bg-brand-rose/8"
          : "border-brand-mint/40 bg-brand-mint/10")
      }
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
        {fail ? (
          <XIcon className="size-3 text-brand-rose" />
        ) : (
          <CheckIcon className="size-3 text-brand-mint" strokeWidth={3} />
        )}
      </div>
      {/* Beispiel-Button im jeweiligen Kontrast. */}
      <div
        className={
          "mt-2 rounded-md px-2 py-1.5 text-center text-[11px] font-semibold " +
          (fail
            ? "bg-[oklch(0.78_0.02_270)] text-[oklch(0.72_0.02_270)]"
            : "bg-brand-deep text-[oklch(0.98_0.004_95)]")
        }
      >
        Jetzt kaufen
      </div>
      <p
        className={
          "mt-1.5 font-mono text-[11px] font-semibold tabular-nums " +
          (fail ? "text-brand-rose" : "text-brand-mint")
        }
      >
        {ratio}
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
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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

// SVG-Score-Gauge: 3/4-Ring, faerbt sich nach Score, zaehlt + fuellt animiert.
function ScoreGauge({ value, reduced }: { value: number; reduced: boolean }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  // 3/4-Kreis (270deg) sieht "messgeraet-haft" aus.
  const arc = 0.75;
  const dash = circumference * arc;
  const progress = Math.max(0, Math.min(100, value)) / 100;
  const filled = dash * progress;

  // counted wird nur asynchron (rAF/Timeout) gesetzt, nie synchron im Effect-Body.
  const [counted, setCounted] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const duration = 1300;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCounted(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    // kleiner Vorlauf, passend zum Beam.
    const id = window.setTimeout(
      () => (raf = requestAnimationFrame(tick)),
      350,
    );
    return () => {
      window.clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [value, reduced]);

  const display = reduced ? value : counted;

  // Score < 55 rose, < 70 amber, sonst mint.
  const color =
    value < 55
      ? "var(--brand-rose)"
      : value < 70
        ? "var(--brand-amber)"
        : "var(--brand-mint)";

  return (
    <div className="relative size-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="size-[72px]">
        {/* Track: 3/4-Ring, um 135deg gedreht damit die Luecke unten ist. */}
        <g transform="rotate(135 36 36)">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className="stroke-muted"
            strokeDasharray={`${dash} ${circumference}`}
          />
          <motion.circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            stroke={color}
            strokeDasharray={`${filled} ${circumference}`}
            initial={reduced ? false : { strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${filled} ${circumference}` }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          />
        </g>
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-xl font-bold tabular-nums">
          {display}
        </span>
      </span>
    </div>
  );
}
