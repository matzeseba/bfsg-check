import { ShieldCheckIcon } from "lucide-react";

import { LOGO_CLOUD } from "@/lib/config";

// Trust-Band direkt unter dem Hero: die anerkannten Normen, gegen die wir
// prüfen. Bewusst KEINE erfundenen Presse-Logos (UWG §5a/§5) — nur belegbare,
// wahre Standards als ruhige, technische Chips.
export function LogoCloud() {
  return (
    <section
      aria-labelledby="logocloud-heading"
      className="border-y border-border/50 bg-card/40"
    >
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <p
          id="logocloud-heading"
          className="flex items-center justify-center gap-2 text-center font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
        >
          <ShieldCheckIcon
            aria-hidden
            className="size-4 text-brand-indigo dark:text-brand-mint"
          />
          {LOGO_CLOUD.kicker}
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {LOGO_CLOUD.logos.map((norm) => (
            <li key={norm.name}>
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/60 px-4 py-1.5 font-display text-sm font-semibold tracking-tight text-foreground/80 shadow-card-soft backdrop-blur transition-colors hover:border-brand-mint/50 hover:text-foreground">
                {norm.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
