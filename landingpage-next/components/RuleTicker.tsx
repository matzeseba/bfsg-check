import { RULE_TICKER } from "@/lib/config";

// Endlos-Ticker der WCAG-Kriterien, die der Scanner prueft (Design-Signatur).
// Rein dekorativ → der gesamte Streifen ist aria-hidden (die Kriterien stehen
// als echter Text in HowItWorks/FAQ). reduced-motion stoppt den Lauf
// (animate-ticker steht in der globalen reduced-motion-Regel in globals.css).
// Inhalt zweimal gerendert → nahtloser -50%-Loop (animate-ticker = marquee).
// Dark-Glow-Optik: mono, Orange-Punkt-Trenner, feine Glow-Hairlines oben+unten,
// Mask-Fade an den Seiten (Maske liegt auf dem STATISCHEN Wrapper, nicht auf dem
// translatierenden Element — sonst wandert die Maske mit).
export function RuleTicker() {
  const items = RULE_TICKER.rules;
  return (
    <div
      aria-hidden
      className="relative z-[2] flex h-12 items-center overflow-hidden bg-[var(--brand-deepest)] text-foreground"
    >
      {/* Feine Orange-Glow-Hairlines oben + unten (Vorlagen-Signatur). */}
      <span className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--brand-orange),transparent_45%),transparent)]" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--brand-orange),transparent_45%),transparent)]" />

      {/* Festes Label mit pulsierendem Orange-Punkt (Marken-Glow). Überdeckt den
          Loop-Anfang mit eigenem Hintergrund. */}
      <div className="absolute left-5 z-[4] flex h-full items-center gap-2 bg-[var(--brand-deepest)] pr-4">
        <span className="inline-flex size-1.5 rounded-full bg-brand-orange shadow-[0_0_8px_var(--brand-orange)] animate-pulse-soft" />
        <span className="font-mono text-[11px] tracking-[0.08em] text-brand-orange-soft uppercase">
          {RULE_TICKER.label}
        </span>
      </div>

      {/* Statischer Mask-Wrapper: weiches Ein-/Ausblenden an beiden Kanten. */}
      <div className="h-full w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex h-full w-max animate-ticker items-center">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex h-full shrink-0 items-center gap-8 pr-8 pl-8 font-mono text-[12.5px] text-muted-foreground"
            >
              {items.map((rule) => (
                <li
                  key={rule}
                  className="flex items-center gap-8 whitespace-nowrap"
                >
                  {rule}
                  {/* Orange-Punkt-Trenner mit dezentem Glow. */}
                  <span className="inline-flex size-1 shrink-0 rounded-full bg-brand-orange shadow-[0_0_6px_var(--brand-orange)]" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
