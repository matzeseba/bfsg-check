// Zentrale Motion-Atome (framer-motion/`motion`). Eine Quelle fuer die Easing-
// Kurve + die drei wiederkehrenden Reveal-/Stagger-Varianten, damit die 11 zuvor
// lokal duplizierten EASE-Literale nicht auseinanderdriften. Rein mechanisch —
// keine visuelle Aenderung (identische Kurve/Timings wie bisher). Reduced-Motion
// ist global via <MotionConfig reducedMotion="user"> (layout.tsx) geloest.

export const EASE = [0.22, 1, 0.36, 1] as const;

export const revealUp = (index = 0, y = 18, duration = 0.5) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration, delay: index * 0.08, ease: EASE },
});

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
} as const;

// Dark-Glow-Redesign (04.07.2026): zwei zusaetzliche Reveal-Varianten fuer die
// kinetische Sektions-Sprache. Gleiche EASE-Kurve, once:true — kein Re-Trigger.
export const revealScale = (index = 0, duration = 0.55) => ({
  initial: { opacity: 0, scale: 0.94 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration, delay: index * 0.08, ease: EASE },
});

export const revealSide = (from: "left" | "right", index = 0, duration = 0.55) => ({
  initial: { opacity: 0, x: from === "left" ? -28 : 28 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration, delay: index * 0.08, ease: EASE },
});
