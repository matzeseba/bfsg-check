import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Single-Source-Pattern für ALLE Sektionsköpfe (Dark-Glow-Redesign 04.07.2026):
// Glow-Pill mit Orange-Verlaufs-Rahmen (.glow-border, globals.css), leuchtendem
// Punkt, Icon und mono-uppercase-Label. API/Props unverändert — alle Sektionen
// nutzen diese Komponente weiter wie bisher.
//
// tone:
//  - default : Standard-Pill, Orange-Akzent + Glow-Border (Marken-Signatur)
//  - warn    : Frist-/Pflicht-Kontext, Amber-Akzent
//  - on-deep : auf near-black Panels (StatsBar/CtaSection) — im Dark-only-Design
//              identisch zur Orange-Glow-Pill (Grund ist ohnehin near-black)
//  - on-light: auf hellen Invers-Blöcken (WowCounter) — dunkles Burnt-Orange
//              OHNE Glow-Border, da der Block hell bleibt (Orange-Glow auf Creme
//              wäre kontrastschwach)
export function SectionKicker({
  icon: Icon,
  label,
  tone = "default",
  className,
}: {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "warn" | "on-deep" | "on-light";
  className?: string;
}) {
  const isGlow = tone === "default" || tone === "on-deep";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1 font-mono text-[11px] font-medium tracking-[0.18em] uppercase backdrop-blur",
        isGlow
          ? "glow-border bg-card/70 text-brand-orange shadow-card-soft"
          : tone === "warn"
            ? "border border-brand-amber/40 bg-brand-amber/10 text-foreground shadow-card-soft"
            : "border border-brand-indigo/25 bg-brand-indigo/8 text-brand-indigo shadow-card-soft",
        className,
      )}
    >
      {/* Leuchtender Akzent-Punkt (Vorlagen-Signatur), rein dekorativ. */}
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          isGlow
            ? "bg-brand-orange shadow-[0_0_8px_var(--brand-orange)]"
            : tone === "warn"
              ? "bg-brand-amber shadow-[0_0_8px_var(--brand-amber)]"
              : "bg-brand-indigo",
        )}
      />
      <Icon
        className={cn(
          "size-3.5",
          isGlow
            ? "text-brand-orange"
            : tone === "warn"
              ? "text-brand-amber"
              : "text-brand-indigo",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
