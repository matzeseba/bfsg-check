"use client";

import * as motion from "motion/react-client";
import Image from "next/image";
import { CheckCircle2Icon, GlobeIcon, ScanLineIcon } from "lucide-react";

import { HOW_IT_WORKS } from "@/lib/config";
import { EASE } from "@/lib/motion";

import { SectionKicker } from "./SectionKicker";

const ICON_BY_KEY = {
  globe: GlobeIcon,
  scan: ScanLineIcon,
  check: CheckCircle2Icon,
} as const;

export function HowItWorks() {
  return (
    <section
      id="ablauf"
      aria-labelledby="how-heading"
      className="relative isolate overflow-hidden bg-muted/40"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 dot-bg opacity-50 mask-radial dark:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden dot-bg-dark opacity-50 mask-radial dark:block"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionKicker icon={ScanLineIcon} label="Wie es funktioniert" />
          <h2
            id="how-heading"
            className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            Drei Schritte vom Verdacht zum{" "}
            <span className="italic gradient-text">Fix-Plan</span>.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Kein Beratungstermin nötig. Kein Workshop. Sie geben die URL ein —
            wir liefern eine sortierte Mängelliste mit Lösungs-Snippets.
          </p>
        </div>

        <div className="relative mt-14">
          {/* Lupen-Fuchs-Guide: haengt am GRID-Wrapper (max-w-6xl-Bezug), damit er
              bei JEDER Breite rechts neben Karte 3 bleibt (statt an den Viewport-Rand
              zu driften). Nur ab lg; Section overflow-hidden clippt sauber. */}
          <Image
            src="/mascot-full.png"
            alt=""
            aria-hidden
            width={680}
            height={1329}
            loading="lazy"
            className="pointer-events-none absolute -bottom-2 -right-14 z-20 hidden h-auto opacity-100 drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] lg:block lg:w-44"
          />
          {/* Ablauf-Linie (Design-Signatur): warmer Orange-Verlauf mit Lauflicht-
              Punkt, der von links nach rechts wandert (animate-travel-dot, reduced-
              motion-gated). Markiert visuell den Fortschritt URL → Scan → Fix-Plan.
              Nur Desktop (md+); aria-hidden, rein dekorativ. */}
          <div
            aria-hidden
            className="absolute top-14 right-[12%] left-[12%] hidden h-0.5 overflow-visible rounded-full bg-gradient-to-r from-brand-orange/10 via-brand-orange/40 to-brand-orange/10 md:block"
          >
            <span
              aria-hidden
              className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-brand-orange shadow-[0_0_16px_2px_var(--brand-orange)] animate-travel-dot"
            />
          </div>

          <ol className="relative grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = ICON_BY_KEY[step.icon as keyof typeof ICON_BY_KEY];
              const featured = i === 1;
              return (
                <motion.li
                  key={step.step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                  className={
                    "group/step card-lift relative flex flex-col items-center rounded-3xl p-6 text-center backdrop-blur md:items-start md:text-left " +
                    // Karte 3 bekommt rechts Platz fuer den grossen Lupen-Fuchs, der
                    // rechts daneben steht (Text weicht aus, keine Verdeckung).
                    (i === 2 ? "lg:pr-28 " : "") +
                    (featured
                      ? "border-gradient bg-card shadow-card-hover"
                      : "border border-border/70 bg-card/85 shadow-card-soft dark:ring-1 dark:ring-white/5")
                  }
                >
                  <div className="flex w-full items-center justify-center md:justify-between">
                    <span
                      aria-hidden
                      className="font-mono text-xs font-bold tracking-[0.2em] text-brand-orange"
                    >
                      {step.step}
                    </span>
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 mx-3 bg-gradient-to-r from-brand-orange/40 to-transparent md:block"
                    />
                  </div>
                  {/* Step-Badge (Design): Kreis mit warmem Orange-Glow + Orange-
                      Rahmen, Icon im Marken-Orange. Mint bleibt Action/Erfolg → die
                      Schritt-Marker tragen den dekorativen Marken-Akzent (Orange). */}
                  <div className="relative mt-5 flex size-12 items-center justify-center rounded-2xl border border-brand-orange/45 bg-gradient-to-br from-brand-orange/15 to-brand-deep text-brand-orange shadow-glow-orange transition-transform duration-300 group-hover/step:scale-110">
                    {/* Dezent pulsierender Ring → "live"-Anmutung, gestaffelt. */}
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-2xl ring-1 ring-brand-orange/40 animate-pulse-soft"
                      style={{ animationDelay: `${i * 0.4}s` }}
                    />
                    {Icon ? <Icon className="relative size-5" /> : null}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
