import type { CSSProperties, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

// Farbton → CSS-Variable der Glow-Utility (globals.css .glow-card).
const TONE_COLOR: Record<GlowTone, string> = {
  orange: "var(--brand-orange)",
  mint: "var(--brand-mint)",
  amber: "var(--brand-amber)",
  rose: "var(--brand-rose)",
};

export type GlowTone = "orange" | "mint" | "amber" | "rose";

interface GlowCardProps {
  children: ReactNode;
  tone?: GlowTone;
  as?: ElementType;
  className?: string;
  /** Zusaetzlicher Aussenschein (.glow-ring) fuer hervorgehobene Karten. */
  ring?: boolean;
}

// Standard-Karte des Dark-Glow-Redesigns: Glas-Flaeche + Verlaufs-Glow-Rahmen.
// Rein visuell (Server-Component-faehig); Interaktion/Motion macht der Caller.
export function GlowCard({
  children,
  tone = "orange",
  as: Tag = "div",
  className,
  ring = false,
}: GlowCardProps) {
  return (
    <Tag
      className={cn("glow-card", ring && "glow-ring", className)}
      style={{ "--glow-color": TONE_COLOR[tone] } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
