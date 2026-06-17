"use client";

import * as motion from "motion/react-client";

import { STATS } from "@/lib/config";

import { CountUp } from "./CountUp";

// Dark-Inversion mit Blueprint-Grid + Glow. Authority-Section: dieselben Normen
// wie Behoerden/Kanzleien. Zahlen zaehlen beim Scroll hoch (Aufmerksamkeit).
export function StatsBar() {
  return (
    <section
      aria-labelledby="stats-heading"
      className="relative isolate overflow-hidden bg-brand-deeper text-[oklch(0.97_0.004_95)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 grid-bg-dark opacity-40 mask-radial"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-24 -z-10 size-[40rem] rounded-full bg-brand-mint/12 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 -z-10 size-[40rem] rounded-full bg-brand-violet/30 blur-[100px]"
      />

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-medium tracking-[0.2em] text-brand-mint uppercase">
            Belastbar geprüft
          </p>
          <h2
            id="stats-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            Audit-Methodik, die vor Gericht standhält.
          </h2>
          <p className="mt-4 text-base text-[oklch(0.97_0.004_95)]/70 text-pretty">
            Wir scannen nach den gleichen Normen, auf die sich Aufsichtsbehörden
            und abmahnende Kanzleien berufen — und liefern in einer Sprache, die
            Ihr Entwickler-Team direkt umsetzen kann.
          </p>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-14 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="border-l border-[oklch(0.97_0.004_95)]/15 pl-5"
            >
              <dt className="font-display text-4xl font-bold tracking-tight tabular-nums text-brand-mint sm:text-5xl">
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
              <dd className="mt-2 text-sm leading-snug text-[oklch(0.97_0.004_95)]/70">
                {stat.label}
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
