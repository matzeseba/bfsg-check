"use client";

import * as motion from "motion/react-client";
import { CheckIcon, GitCompareArrowsIcon } from "lucide-react";

import { COMPARISON } from "@/lib/config";
import { cn } from "@/lib/utils";

import { SectionKicker } from "./SectionKicker";

const EASE = [0.22, 1, 0.36, 1] as const;

// Direktvergleich — UWG-§5/§6-sauber: qualitativer, sachlicher Vergleich
// OHNE erfundene Score-Zahlen, OHNE "Bester"-Superlativ, OHNE herabsetzende
// Wertung. Unsere Karte ist hervorgehoben ("Unser Ansatz", kein Superlativ).
// A11y: Werte als Text (nicht nur Farbe/Balken), Haekchen aria-hidden.
export function Comparison() {
  const accentIdx = COMPARISON.title.indexOf(COMPARISON.titleAccent);
  const pre =
    accentIdx >= 0 ? COMPARISON.title.slice(0, accentIdx) : COMPARISON.title;
  const post =
    accentIdx >= 0
      ? COMPARISON.title.slice(accentIdx + COMPARISON.titleAccent.length)
      : "";

  return (
    <section
      aria-labelledby="compare-heading"
      className="relative overflow-hidden bg-muted/40"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionKicker icon={GitCompareArrowsIcon} label={COMPARISON.kicker} />
          <h2
            id="compare-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            {pre}
            {accentIdx >= 0 && (
              <span className="italic gradient-text">
                {COMPARISON.titleAccent}
              </span>
            )}
            {post}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:items-stretch">
          {COMPARISON.columns.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
              className={cn(
                "relative flex flex-col rounded-3xl p-7 backdrop-blur",
                col.highlight
                  ? "border-gradient bg-card shadow-elevated"
                  : "border border-border/70 bg-card/80 shadow-card-soft dark:ring-1 dark:ring-white/5",
              )}
            >
              {col.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-mint px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-brand-deep uppercase shadow-glow-mint">
                  Unser Ansatz
                </span>
              )}
              <h3
                className={cn(
                  "font-display text-lg font-semibold tracking-tight",
                  col.highlight && "text-brand-indigo dark:text-brand-mint",
                )}
              >
                {col.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{col.sub}</p>

              <dl className="mt-5 grid gap-3 border-t border-border/50 pt-5">
                {col.attrs.map((a) => (
                  <div key={a.label} className="grid gap-0.5">
                    <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      {a.label}
                    </dt>
                    <dd
                      className={cn(
                        "flex items-start gap-1.5 text-sm",
                        a.strong
                          ? "font-medium text-foreground"
                          : "text-foreground/80",
                      )}
                    >
                      {a.strong && (
                        <CheckIcon
                          aria-hidden
                          className="mt-0.5 size-3.5 shrink-0 text-brand-mint"
                          strokeWidth={3}
                        />
                      )}
                      <span>{a.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>

              <p
                className={cn(
                  "mt-5 border-t border-border/50 pt-4 text-xs",
                  col.highlight ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {col.note}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          {COMPARISON.footnote}
        </p>
      </div>
    </section>
  );
}
