"use client";

import { CheckIcon, GitCompareArrowsIcon } from "lucide-react";

import { COMPARISON } from "@/lib/config";
import { cn } from "@/lib/utils";

import { GlowCard } from "./fx/GlowCard";
import { ScrollScrub } from "./fx/ScrollScrub";
import { TiltCard } from "./fx/TiltCard";
import { SectionKicker } from "./SectionKicker";

// Direktvergleich — UWG-§5/§6-sauber: qualitativer, sachlicher Vergleich
// OHNE erfundene Score-Zahlen/Balken, OHNE "Bester"-Superlativ, OHNE
// herabsetzende Wertung. Dark-Glow-Redesign: Mittelspalte als Glow-Card
// mit Orange-Aussenschein hervorgehoben (rein visuell, Texte unveraendert
// aus config.COMPARISON), Aussenspalten als ruhige dunkle Karten.
// Scroll-Story-Modus: Spalten bauen sich scroll-gekoppelt gestaffelt auf
// (ScrollScrub) und neigen sich dem Cursor entgegen (TiltCard, Feinzeiger,
// reduced-motion-still — die Primitive gaten das selbst).
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
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Dezenter Orange-Schein hinter der hervorgehobenen Mittelspalte
          (einziger Blur-Layer der Sektion, rein dekorativ). */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[420px] w-[560px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand-orange),transparent_88%),transparent_65%)] blur-2xl"
      />
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionKicker
            icon={GitCompareArrowsIcon}
            label={COMPARISON.kicker}
            tone="on-deep"
          />
          <h2
            id="compare-heading"
            className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
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
          {COMPARISON.columns.map((col, i) => {
            const inner = (
              <>
                {col.highlight && (
                  /* z-10: der ::after-Glow-Rahmen der glow-card malt in der
                     Paint-Order sonst ÜBER den Badge — die Orange-Linie schien
                     durch die Pill (Owner-Finding 04.07.). */
                  <span className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-amber px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-brand-deep uppercase shadow-glow-orange">
                    <span aria-hidden>★</span>
                    Unser Ansatz
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {col.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{col.sub}</p>

                <dl
                  className={cn(
                    "mt-5 mb-5 grid gap-3 border-t pt-5",
                    col.highlight ? "border-brand-orange/20" : "border-border-card",
                  )}
                >
                  {col.attrs.map((a) => (
                    <div key={a.label} className="grid gap-0.5">
                      <dt className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                        {a.label}
                      </dt>
                      <dd
                        className={cn(
                          "flex items-start gap-1.5 text-sm",
                          a.strong
                            ? "font-medium text-foreground"
                            : "text-muted-foreground",
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
                    "mt-auto border-t pt-4 text-xs",
                    col.highlight
                      ? "border-brand-orange/20 font-medium text-foreground/85"
                      : "border-border-card text-muted-foreground",
                  )}
                >
                  {col.note}
                </p>
              </>
            );
            return (
              <ScrollScrub
                key={col.name}
                from={56}
                fromX={i * 16}
                className="flex"
              >
                <TiltCard max={col.highlight ? 6 : 5} className="flex w-full">
                  {col.highlight ? (
                    // Hervorgehobene Fuchs-Spalte: Glas-Card mit Orange-Glow-
                    // Rahmen + weichem Aussenschein (KEIN neuer Text-Superlativ).
                    <GlowCard
                      ring
                      className="card-lift relative flex w-full flex-col p-7"
                    >
                      {inner}
                    </GlowCard>
                  ) : (
                    <div className="card-lift relative flex w-full flex-col rounded-3xl border border-border-card bg-card p-7 shadow-card-soft">
                      {inner}
                    </div>
                  )}
                </TiltCard>
              </ScrollScrub>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          {COMPARISON.footnote}
        </p>
      </div>
    </section>
  );
}
