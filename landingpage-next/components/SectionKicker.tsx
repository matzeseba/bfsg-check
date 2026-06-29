import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Single-Source-Pattern für ALLE Sektionsköpfe (kiberatung-DNA: einheitlicher
// Kicker-Pill → Italic-Headline → Subline). Ersetzt vier zuvor inkonsistente
// Kicker-Varianten (nackter Mono-Text vs. Pill mit/ohne Icon).
//
// tone:
//  - default : neutrale Karten-Pill, Akzent = ORANGE (Marken-Akzent) in BEIDEN
//              Themes. brand-indigo ist in globals.css auf die Orange-Familie
//              remapped → der Default-Kicker leuchtet im Fox-Orange (#ED6A33 Dark,
//              dunkles Burnt-Orange Light), wie im "BFSG-Fuchs"-Design. Orange ist
//              der dekorative Akzent; Mint bleibt Action/Erfolg (Buttons/Haken).
//  - warn    : Frist-/Pflicht-Kontext, Amber-Akzent
//  - on-deep : auf near-black Panels (StatsBar/CtaSection) — Mint auf Dunkel
//  - on-light: auf hellen Invers-Blöcken (WowCounter) — Indigo/Orange OHNE
//              dark:-Varianten, da der Block auch im Dark-Theme hell bleibt
//              (sonst heller Akzent auf Creme = FAIL)
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] font-medium tracking-[0.18em] uppercase shadow-card-soft backdrop-blur",
        tone === "warn"
          ? "border-brand-amber/40 bg-brand-amber/10 text-foreground"
          : tone === "on-deep"
            ? "border-[oklch(0.97_0.004_95)]/20 bg-[oklch(0.97_0.004_95)]/8 text-brand-mint"
            : tone === "on-light"
              ? "border-brand-indigo/25 bg-brand-indigo/8 text-brand-indigo"
              : "border-brand-orange/25 bg-brand-orange/8 text-brand-orange",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-3.5",
          tone === "warn"
            ? "text-brand-amber"
            : tone === "on-deep"
              ? "text-brand-mint"
              : tone === "on-light"
                ? "text-brand-indigo"
                : "text-brand-orange",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
