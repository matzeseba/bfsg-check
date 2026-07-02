"use client";

import * as React from "react";

import { DEADLINE } from "@/lib/config";

const CELLS = [
  { key: "days", label: "Tage" },
  { key: "hours", label: "Std" },
  { key: "mins", label: "Min" },
  { key: "secs", label: "Sek" },
] as const;

type Elapsed = { days: string; hours: string; mins: string; secs: string };
const PLACEHOLDER: Elapsed = { days: "–", hours: "–", mins: "–", secs: "–" };

function compute(): Elapsed {
  const dl = new Date(DEADLINE.date).getTime();
  let diff = Math.max(0, (Date.now() - dl) / 1000);
  const days = Math.floor(diff / 86400);
  diff -= days * 86400;
  const hours = Math.floor(diff / 3600);
  diff -= hours * 3600;
  const mins = Math.floor(diff / 60);
  const secs = Math.floor(diff - mins * 60);
  const p2 = (n: number) => String(n).padStart(2, "0");
  return { days: String(days), hours: p2(hours), mins: p2(mins), secs: p2(secs) };
}

// Live-Countdown der seit dem BFSG-Stichtag verstrichenen Zeit (faktische Angabe,
// keine Drohung). Start mit Placeholder (kein Hydration-Mismatch), dann sekuendlich.
// Das Ticken ist NUR visuell → Zellen aria-hidden; die Kernaussage steht einmalig
// als sr-only-Text fuer Screenreader (sonst Dauer-Geplapper, WCAG 4.1.3).
export function DeadlineCounter() {
  const [el, setEl] = React.useState<Elapsed>(PLACEHOLDER);

  React.useEffect(() => {
    // Client-only nach Mount (Start = PLACEHOLDER): der Live-Countdown haengt von
    // Date.now() ab → Server-Prerender wuerde beim Hydrate abweichen (Sekundentakt).
    // Legitime Ausnahme von set-state-in-effect (gewollter Tick, kein Cascading-Bug).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEl(compute());
    const id = window.setInterval(() => setEl(compute()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-amber/25 bg-card/80 p-5 shadow-card-soft backdrop-blur dark:ring-1 dark:ring-white/5">
      {/* Amber-Shimmer-Linie am oberen Rand (Design-Signatur): wandernder Verlauf,
          reduced-motion-gated (.animate-shimmer steht in der globalen Regel). */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,transparent,var(--brand-amber),transparent)] bg-[length:200%_100%] animate-shimmer"
      />
      {/* Kicker-TEXT light-mode-AA: dunkles Burnt-Amber auf hell, helles Amber im
          Dark (analog CtaSection-Urgency-Pill). Puls-Punkt bleibt dekorativ. */}
      <div className="mb-4 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-[oklch(0.5_0.13_70)] dark:text-brand-amber uppercase">
        <span
          aria-hidden
          className="inline-flex size-1.5 rounded-full bg-brand-rose shadow-[0_0_8px_var(--brand-rose)] animate-pulse-soft"
        />
        {DEADLINE.kicker}
      </div>
      <p className="sr-only">
        Der BFSG-Stichtag (28.06.2025) liegt bereits{" "}
        {el.days === "–" ? "viele" : el.days} Tage zurück.
      </p>
      <div aria-hidden className="grid grid-cols-4 gap-2">
        {CELLS.map((c) => {
          const accent = c.key === "secs";
          return (
            <div
              key={c.key}
              // Scoped Dark: Zellen sind in beiden Themes near-black — Ziffern/
              // Labels muessen die Dark-Tokens nutzen (Light-Mode war unlesbar).
              className={
                "dark rounded-xl border bg-[var(--brand-deeper)] px-1 py-3 text-center " +
                (accent ? "border-brand-amber/30" : "border-border/60")
              }
            >
              <div
                className={
                  "font-display text-2xl leading-none font-bold tabular-nums " +
                  (accent ? "text-brand-amber" : "text-foreground")
                }
              >
                {el[c.key]}
              </div>
              <div className="mt-1.5 text-[10px] tracking-[0.05em] text-muted-foreground uppercase">
                {c.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
