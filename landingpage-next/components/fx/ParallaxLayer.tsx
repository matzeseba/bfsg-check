"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

interface ParallaxLayerProps {
  children: ReactNode;
  /** Gesamthub in px über die Sichtbarkeits-Strecke (positiv = startet unterhalb). */
  distance?: number;
  className?: string;
}

// Scroll-Parallax (Scroll-Story-Modus): das Element wandert scroll-gekoppelt
// von +distance nach -distance, während es durch den Viewport zieht. Läuft
// als MotionValue direkt auf dem Compositor (kein React-Re-Render pro Frame).
// reduced-motion → statisch (y=0).
export function ParallaxLayer({ children, distance = 40, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} style={{ y: prefersReduced ? 0 : y }} className={className}>
      {children}
    </motion.div>
  );
}
