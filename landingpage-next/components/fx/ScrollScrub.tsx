"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

interface ScrollScrubProps {
  children: ReactNode;
  /** Start-Versatz in px (Element gleitet scroll-gekoppelt auf 0). */
  from?: number;
  /** Horizontaler Start-Versatz in px (optional, z. B. für Seiten-Einläufe). */
  fromX?: number;
  className?: string;
}

// Scroll-Scrubbing (Scroll-Story-Modus): statt eines einmaligen Reveals ist
// die Einblendung DIREKT an die Scroll-Position gekoppelt — das Element baut
// sich sichtbar auf, während es von der Viewport-Unterkante zur Mitte wandert
// (und bleibt danach stehen). Rückwärts-Scrollen spult die Animation zurück.
// reduced-motion → sofort sichtbar, keine Bewegung.
export function ScrollScrub({ children, from = 56, fromX = 0, className }: ScrollScrubProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    // 0 = Oberkante des Elements erreicht die Viewport-Unterkante,
    // 1 = Element ist ~35% vor der Viewport-Mitte → Aufbau endet früh genug,
    // dass nichts "halb fertig" im Fokus steht.
    offset: ["start end", "start 0.65"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [from, 0]);
  const x = useTransform(scrollYProgress, [0, 1], [fromX, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 1], [0, 0.35, 1]);

  if (prefersReduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
  return (
    <motion.div ref={ref} style={{ y, x, opacity }} className={className}>
      {children}
    </motion.div>
  );
}
