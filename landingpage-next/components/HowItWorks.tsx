"use client";

import * as motion from "motion/react-client";
import { CheckCircle2Icon, GlobeIcon, ScanLineIcon } from "lucide-react";

import { HOW_IT_WORKS } from "@/lib/config";

const ICON_BY_KEY = {
  globe: GlobeIcon,
  scan: ScanLineIcon,
  check: CheckCircle2Icon,
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

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
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-medium tracking-[0.2em] text-brand-indigo uppercase dark:text-brand-mint">
            Wie es funktioniert
          </p>
          <h2
            id="how-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            Drei Schritte vom Verdacht zum{" "}
            <span className="italic gradient-text">handfesten Fix-Plan</span>.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Kein Beratungstermin nötig. Kein Workshop. Sie geben die URL ein —
            wir liefern eine sortierte Mängelliste mit Lösungs-Snippets.
          </p>
        </div>

        <div className="relative mt-14">
          {/* Scan-Pfad: animierte Verbindungslinie auf Desktop. */}
          <div
            aria-hidden
            className="absolute top-14 right-[12%] left-[12%] hidden h-px md:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, color-mix(in oklch, var(--brand-mint), transparent 55%) 0 6px, transparent 6px 14px)",
            }}
          />

          <ol className="relative grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = ICON_BY_KEY[step.icon as keyof typeof ICON_BY_KEY];
              return (
                <motion.li
                  key={step.step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                  className="group/step relative flex flex-col items-center rounded-3xl border border-border/70 bg-card/85 p-6 text-center shadow-card-soft backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover md:items-start md:text-left"
                >
                  <div className="flex w-full items-center justify-center md:justify-between">
                    <span
                      aria-hidden
                      className="font-mono text-xs font-bold tracking-[0.2em] text-brand-indigo dark:text-brand-mint"
                    >
                      {step.step}
                    </span>
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 mx-3 bg-gradient-to-r from-brand-mint/40 to-transparent md:block"
                    />
                  </div>
                  <div className="relative mt-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-deep text-primary-foreground shadow-glow-mint transition-transform duration-300 group-hover/step:scale-110">
                    {Icon ? <Icon className="size-5" /> : null}
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
