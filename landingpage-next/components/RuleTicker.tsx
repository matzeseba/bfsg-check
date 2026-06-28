import { RULE_TICKER } from "@/lib/config";

// Endlos-Ticker der WCAG-Kriterien, die der Scanner prueft (Design-Signatur).
// Rein dekorativ → der gesamte Streifen ist aria-hidden (die Kriterien stehen
// als echter Text in HowItWorks/FAQ). reduced-motion stoppt den Lauf
// (animate-ticker steht in der globalen reduced-motion-Regel in globals.css).
// Inhalt zweimal gerendert → nahtloser -50%-Loop (animate-ticker = marquee).
export function RuleTicker() {
  const items = RULE_TICKER.rules;
  return (
    <div
      aria-hidden
      className="relative z-[2] flex h-12 items-center overflow-hidden border-y border-border/60 bg-[var(--brand-deeper)]"
    >
      {/* Kanten-Masken links/rechts (weiches Ein-/Ausblenden). */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-24 bg-gradient-to-r from-[var(--brand-deeper)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-24 bg-gradient-to-l from-[var(--brand-deeper)] to-transparent" />

      {/* Festes Label (ueberdeckt den Loop-Anfang mit eigenem Hintergrund). */}
      <div className="absolute left-5 z-[4] flex h-full items-center gap-2 bg-[var(--brand-deeper)] pr-4">
        <span className="inline-flex size-1.5 rounded-full bg-brand-mint shadow-[0_0_8px_var(--brand-mint)] animate-pulse-soft" />
        <span className="font-mono text-[11px] tracking-[0.16em] text-brand-mint uppercase">
          {RULE_TICKER.label}
        </span>
      </div>

      <div className="flex w-max animate-ticker">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center gap-8 pr-8 pl-8 font-mono text-[12.5px] text-muted-foreground"
          >
            {items.map((rule) => (
              <li
                key={rule}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                {rule}
                <span className="text-brand-mint">✓</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
