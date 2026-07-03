import { STATS } from "@/lib/config";

import { CountUp } from "./CountUp";
import { GlowCard } from "./fx/GlowCard";
import { Reveal } from "./fx/Reveal";

// Kompakte KPI-Leiste im Vorlagen-Stil (Dark-Glow): EIN flaches GlowCard-Band
// mit 4 EHRLICHEN Kennzahlen aus config.STATS (keine erfundenen Kundenzahlen,
// UWG §5). Grosse Mono-Zahlen in Orange mit Text-Glow + Count-up, Labels muted,
// zwischen den Zellen feine Orange-Hairlines (nur md+, mobil 2-spaltig ohne
// Trenner). KEIN grosser Sektions-Kopf — nur das leise Mono-Label.
// dl/dt/dd-Semantik beibehalten.
export function StatsBar() {
  return (
    <section
      aria-label="Prüfgrundlage in Zahlen"
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Einziger Blur-Layer der Sektion: mittiger Orange-Schein hinterm Band. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-orange/10 blur-[80px]"
      />

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <Reveal variant="up">
          <GlowCard className="px-6 py-8 sm:px-10 sm:py-10">
            {/* Dezentes Mono-Label (kein Sektions-Kopf): leise Einordnung. */}
            <p className="text-center font-mono text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Geprüft nach anerkannten Normen
            </p>

            <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-0 md:divide-x md:divide-brand-orange/15">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center md:px-6">
                  {/* Grosse Kennzahl: Mono, Marken-Orange, dezenter Glow (~7:1
                      auf #0e0d10 → AA auch fuer Normaltext). */}
                  <dt className="font-mono text-3xl font-bold tracking-tight tabular-nums text-brand-orange text-glow sm:text-4xl">
                    {stat.num === null ? (
                      stat.value
                    ) : (
                      <CountUp
                        value={stat.num}
                        prefix={"prefix" in stat ? stat.prefix : ""}
                        suffix={"suffix" in stat ? stat.suffix : ""}
                        decimals={"decimals" in stat ? stat.decimals : 0}
                      />
                    )}
                  </dt>
                  <dd className="mt-2 text-sm leading-snug text-muted-foreground">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </GlowCard>
        </Reveal>
      </div>
    </section>
  );
}
