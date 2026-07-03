import { cn } from "@/lib/utils";

interface AmbientGlowProps {
  className?: string;
  /** Glut-Partikel-Ebene zuschalten (Hero/Final-CTA — sparsam einsetzen). */
  embers?: boolean;
  /** Position/Groesse des Radial-Glows via className steuerbar. */
  toneClassName?: string;
}

// Sektions-Ambiente des Dark-Glow-Redesigns: warmer Orange-Radial-Schein +
// optionale Glut-Partikel. Rein dekorativ (aria-hidden), absolut positioniert —
// Caller gibt dem Parent `relative overflow-hidden`.
export function AmbientGlow({ className, embers = false, toneClassName }: AmbientGlowProps) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <div
        className={cn(
          "absolute left-1/2 top-0 h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full",
          "bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand-orange),transparent_82%),transparent_65%)]",
          "blur-2xl",
          toneClassName,
        )}
      />
      {embers ? <div className="ember-field inset-0" /> : null}
    </div>
  );
}
