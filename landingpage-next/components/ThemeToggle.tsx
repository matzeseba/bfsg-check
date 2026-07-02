"use client";

import { MoonStarIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

// Dark-Mode-Umschalter. Vor dem Mount rendern wir einen neutralen Platzhalter
// (gleiche Groesse) — verhindert Hydration-Mismatch, da der tatsaechliche Theme-
// Wert erst clientseitig feststeht.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        mounted
          ? isDark
            ? "Zu hellem Design wechseln"
            : "Zu dunklem Design wechseln"
          : "Design umschalten"
      }
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-foreground/70 backdrop-blur transition-all hover:border-brand-mint/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-brand-mint",
        className,
      )}
    >
      {/* Beide Icons gestapelt, sanfter Cross-Fade via Scale/Opacity. */}
      <SunIcon
        aria-hidden
        className={cn(
          "absolute size-4.5 transition-all duration-300",
          mounted && !isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <MoonStarIcon
        aria-hidden
        className={cn(
          "absolute size-4.5 transition-all duration-300",
          mounted && isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
