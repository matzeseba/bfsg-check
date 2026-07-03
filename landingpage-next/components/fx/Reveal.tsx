"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { revealScale, revealSide, revealUp } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  variant?: "up" | "scale" | "left" | "right";
  /** Stagger-Index — verzoegert um index * 0.08s. */
  index?: number;
  className?: string;
}

// Einheitlicher Scroll-Reveal-Wrapper (Dark-Glow-Redesign). Kapselt die
// motion-Atome aus lib/motion.ts; reduced-motion global via MotionConfig.
export function Reveal({ children, variant = "up", index = 0, className }: RevealProps) {
  const props =
    variant === "scale"
      ? revealScale(index)
      : variant === "left" || variant === "right"
        ? revealSide(variant, index)
        : revealUp(index);
  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}
