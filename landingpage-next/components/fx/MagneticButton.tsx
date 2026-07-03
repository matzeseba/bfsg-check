"use client";

import type { ReactNode } from "react";

import { useMagnetic } from "@/lib/use-magnetic";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Auslenkungs-Faktor (0.15 dezent … 0.35 kraeftig). */
  strength?: number;
}

// Magnetischer Wrapper fuer CTAs (Dark-Glow-Redesign): das INNERE Element
// (Button/Link) bleibt unveraendert fokussier- und klickbar; nur der Wrapper
// folgt dem Cursor. Maus-only + reduced-motion-sicher (lib/use-magnetic.ts).
export function MagneticButton({ children, className, strength = 0.22 }: MagneticButtonProps) {
  const { ref, onPointerMove, onPointerLeave } = useMagnetic<HTMLDivElement>(strength);
  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("inline-block will-change-transform", className)}
    >
      {children}
    </div>
  );
}
