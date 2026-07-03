"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ScoreDonutProps {
  score: number;
  /** Schulnoten-Label (z. B. "C") — optional unter dem Score. */
  grade?: string;
  /** Aussendurchmesser in px (Default 168). */
  size?: number;
  /** Text unter der Zahl (Default "/ 100"). */
  label?: string;
  className?: string;
}

// Score-Donut (Vorlagen-Signatur): Orange-Glow-Ring, der beim Scroll-Reveal
// auf den Score-Anteil aufzieht, waehrend die Zahl hochzaehlt. reduced-motion
// rendert sofort den Endzustand. A11y: die Grafik ist dekorativ (aria-hidden),
// der Wert steht als Text im DOM.
export function ScoreDonut({
  score,
  grade,
  size = 168,
  label = "/ 100",
  className,
}: ScoreDonutProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();
  // Initial IMMER 0: useReducedMotion ist serverseitig null → ein von der
  // Praeferenz abhaengiger Initialwert wuerde beim Hydrate mismatchen. Den
  // reduced-motion-Endzustand stellt der Effect unten synchron her.
  const [display, setDisplay] = useState(0);

  const stroke = 10;
  const r = (size - stroke) / 2 - 6;
  const circumference = 2 * Math.PI * r;
  const target = circumference * (1 - clamped / 100);

  // Zahl hochzaehlen, sobald der Donut sichtbar wird (einmalig, ~1.2s).
  // reduced-motion: Endwert sofort setzen (kein Count-up, kein Mismatch).
  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) {
      // Legitime Ausnahme: prefers-reduced-motion ist erst clientseitig bekannt
      // (Server rendert 0) — der Endwert wird hier einmalig ohne Kaskade gesetzt.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(clamped);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic — passend zur EASE-Kurve der Ring-Animation.
      setDisplay(Math.round(clamped * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, clamped, prefersReduced]);

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in oklch, var(--brand-orange), transparent 88%)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--brand-orange)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: "drop-shadow(0 0 8px color-mix(in oklch, var(--brand-orange), transparent 35%))" }}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: target } : undefined}
          // reduced-motion: Ring springt sofort auf den Endstand (MotionConfig
          // deckt SVG-Paint-Attribute nicht ab → explizit duration 0).
          transition={{ duration: prefersReduced ? 0 : 1.2, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold tabular-nums text-glow">{display}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
        {grade ? (
          <span className="mt-1 rounded-full border border-border-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            Note {grade}
          </span>
        ) : null}
      </div>
    </div>
  );
}
