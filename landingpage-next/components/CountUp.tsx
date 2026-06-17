"use client";

import * as React from "react";
import { useInView } from "motion/react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type CountUpProps = {
  /** Endzahl (numerischer Teil). */
  value: number;
  /** Text vor der Zahl, z. B. "EN ". */
  prefix?: string;
  /** Text nach der Zahl, z. B. " %" oder " Sek.". */
  suffix?: string;
  /** Nachkommastellen (z. B. WCAG 2.1 → 1). */
  decimals?: number;
  durationMs?: number;
  className?: string;
};

// Zaehlt beim Sichtbarwerden von 0 auf `value` hoch (einmalig).
// Respektiert prefers-reduced-motion: dann sofort der Endwert.
// tabular-nums verhindert Layout-Springen waehrend des Zaehlens.
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  durationMs = 1400,
  className,
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = usePrefersReducedMotion();
  // progress 0..1 — wird ausschliesslich asynchron (rAF) gesetzt, nie synchron
  // im Effect-Body (react-hooks/set-state-in-effect).
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutExpo fuer einen satten, abbremsenden Lauf.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, durationMs]);

  // Bei reduced-motion oder noch nicht im View: Endwert bzw. 0 direkt ableiten.
  const shown = reduced ? value : value * progress;
  const formatted = shown.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tabular-nums">{formatted}</span>
      {suffix}
    </span>
  );
}
