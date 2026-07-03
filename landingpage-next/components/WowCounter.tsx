import { CheckIcon, GaugeIcon } from "lucide-react";

import { CountUp } from "./CountUp";
import { GlowCard } from "./fx/GlowCard";
import { Reveal } from "./fx/Reveal";
import { SectionKicker } from "./SectionKicker";

// Proof-Höhepunkt im Dark-Glow-Stil: ein grosses GlowCard-Panel mit EINER
// EHRLICHEN, animierten Kennzahl. Bewusst KEINE erfundene Aggregat-Zahl
// (UWG §5) — "80+" = die tatsächliche Prüfregel-Tiefe nach EN 301 549.
// Der frühere helle Invers-Block ist auf die dunkle Glas-Fläche gedreht
// (Owner-Entscheid Dark-only): Orange-Leitzahl mit Text-Glow auf near-black.
const TRUST = ["WCAG 2.1 AA", "EN 301 549", "Menschlich gesichtet"] as const;

export function WowCounter() {
  return (
    <section
      aria-labelledby="scope-heading"
      className="relative isolate overflow-hidden bg-background py-20 sm:py-24"
    >
      {/* Einziger Blur-Layer der Sektion: Orange-Schein hinterm Panel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-80 w-[42rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-orange/10 blur-[80px]"
      />
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal variant="scale">
          <GlowCard
            ring
            className="relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12 sm:py-20"
          >
            <SectionKicker icon={GaugeIcon} label="Der Prüfumfang" />
            <h2
              id="scope-heading"
              className="mx-auto mt-5 max-w-2xl font-display text-2xl font-semibold tracking-tight text-balance sm:text-[2.4rem] sm:leading-[1.06]"
            >
              Mehr als ein{" "}
              <span className="italic gradient-text">Schnelltest</span>.
            </h2>

            <div className="mt-8 flex flex-col items-center">
              {/* Die Leitzahl "80+" glüht im Marken-Orange (#ff7a1a ≈ 7:1 auf
                  #0e0d10 — AA-sicher, Display-Grösse ohnehin Large Text). */}
              <p className="font-display text-[clamp(3.5rem,12vw,8rem)] leading-none font-bold tracking-tight tabular-nums text-brand-orange text-glow">
                <CountUp value={80} suffix="+" />
              </p>
              <span
                aria-hidden
                className="mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-soft"
              />
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                automatisierte WCAG-2.1-AA-Einzelprüfungen nach EN 301 549 — pro
                geprüfter Seite. Anschließend sichtet ein Mensch jeden Report,
                bevor er rausgeht.
              </p>
            </div>

            <ul className="mx-auto mt-9 flex max-w-xl flex-wrap items-center justify-center gap-2.5">
              {TRUST.map((t) => (
                <li
                  key={t}
                  className="glow-border inline-flex items-center gap-1.5 rounded-full bg-card/70 px-3 py-1 text-xs font-medium text-foreground/85"
                >
                  <CheckIcon
                    className="size-3.5 text-brand-mint"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {t}
                </li>
              ))}
            </ul>
          </GlowCard>
        </Reveal>
      </div>
    </section>
  );
}
