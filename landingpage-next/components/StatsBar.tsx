"use client";

import * as motion from "motion/react-client";
import { ShieldCheckIcon } from "lucide-react";

import { STATS } from "@/lib/config";

import { CountUp } from "./CountUp";
import { SectionKicker } from "./SectionKicker";

const EASE = [0.22, 1, 0.36, 1] as const;

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
        className="pointer-events-none absolute -left-32 -top-24 -z-10 size-[40rem] rounded-full bg-brand-mint/12 blur-[40px] md:blur-[64px]"
      />
      {/* Zweiter (Violet-)Blob erst ab md: auf Mobile bleibt nur EIN großer Blur
          (Guardrail "max. 1 großer Blur pro Viewport auf Mobile", analog HeroVisual). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-40 -z-10 hidden size-[34rem] rounded-full bg-brand-violet/18 blur-[64px] md:block"
      />

      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionKicker
            icon={ShieldCheckIcon}
            label="Geprüft nach anerkannten Normen"
            tone="on-deep"
          />
          <h2
            id="stats-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            Dieselben Normen wie Behörden und{" "}
            <span className="italic text-brand-mint">Kanzleien</span>.
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
              className="text-center md:border-l md:border-[oklch(0.97_0.004_95)]/15 md:pl-5 md:text-left [&:nth-child(4n+1)]:md:border-l-0 [&:nth-child(4n+1)]:md:pl-0"
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
              {/* Akzent-Underline: skaliert beim In-View ein (Konsistenz, kiberatung-DNA). */}
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease: EASE }}
                className="mx-auto mt-2 block h-0.5 w-10 origin-left rounded-full bg-gradient-to-r from-brand-mint to-transparent md:mx-0"
              />
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
