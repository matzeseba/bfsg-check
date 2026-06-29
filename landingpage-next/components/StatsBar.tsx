"use client";

import * as motion from "motion/react-client";

import { STATS } from "@/lib/config";

import { CountUp } from "./CountUp";

const EASE = [0.22, 1, 0.36, 1] as const;

// Kompakter Trust-Strip auf brand-deeper (Design Z.217-224): ein schmales Band aus
// 4 Kennzahlen mit Count-up — KEIN großer Sektions-Kopf (kein Kicker-Pill, keine
// H2, kein Erklär-Absatz). Ein dezentes Mono-Label bleibt als leise Einordnung.
// Zahlen zählen beim Scroll hoch (Aufmerksamkeit). dl/dt/dd-Semantik beibehalten.
export function StatsBar() {
  return (
    <section
      aria-label="Prüfgrundlage in Zahlen"
      className="relative isolate overflow-hidden bg-brand-deeper text-[oklch(0.97_0.004_95)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 grid-bg-dark opacity-30 mask-radial"
      />
      {/* Ein dezenter Orange-Glow (kein zweiter Blob → schmales Band, Mobile-leicht). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 -z-10 size-[28rem] -translate-y-1/2 rounded-full bg-brand-orange/10 blur-[48px] md:blur-[64px]"
      />

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        {/* Dezentes Mono-Label (kein Sektions-Kopf): leise Einordnung des Bands. */}
        <p className="text-center font-mono text-[11px] font-medium tracking-[0.18em] text-[oklch(0.97_0.004_95)]/55 uppercase">
          Geprüft nach anerkannten Normen
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {STATS.map((stat, i) => {
            // Design: nur die Leitkennzahl "80+" (erste Stat) leuchtet im Marken-
            // Orange; die übrigen (DSGVO, DE, 60 Sek.) stehen ruhig in Creme/
            // Foreground. Orange = dekorativer Akzent, kein Action-Mint.
            const accent = i === 0;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="text-center md:border-l md:border-[oklch(0.97_0.004_95)]/15 md:pl-5 md:text-left [&:nth-child(4n+1)]:md:border-l-0 [&:nth-child(4n+1)]:md:pl-0"
              >
                <dt
                  className={
                    "font-display text-3xl font-bold tracking-tight tabular-nums sm:text-4xl " +
                    (accent
                      ? "text-brand-orange"
                      : "text-[oklch(0.97_0.004_95)]")
                  }
                >
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
                {/* Akzent-Underline: skaliert beim In-View ein (Konsistenz, kiberatung-DNA).
                    Orange unter der Leitkennzahl, gedämpft unter den übrigen. */}
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease: EASE }}
                  className={
                    "mx-auto mt-2 block h-0.5 w-10 origin-left rounded-full bg-gradient-to-r to-transparent md:mx-0 " +
                    (accent ? "from-brand-orange" : "from-[oklch(0.97_0.004_95)]/35")
                  }
                />
                <dd className="mt-2 text-sm leading-snug text-[oklch(0.97_0.004_95)]/70">
                  {stat.label}
                </dd>
              </motion.div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
