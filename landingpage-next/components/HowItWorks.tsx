"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { CheckCircle2Icon, GlobeIcon, ScanLineIcon } from "lucide-react";

import { HOW_IT_WORKS } from "@/lib/config";

import { AmbientGlow } from "./fx/AmbientGlow";
import { GlowCard } from "./fx/GlowCard";
import { ScrollScrub } from "./fx/ScrollScrub";
import { SectionKicker } from "./SectionKicker";

const ICON_BY_KEY = {
  globe: GlobeIcon,
  scan: ScanLineIcon,
  check: CheckCircle2Icon,
} as const;

// Prozess-Sektion im Dark-Glow-Stil (Vorlage "Dein Weg zur digitalen
// Barrierefreiheit"): drei Glas-Karten mit großer Orange-Schrittnummer,
// verbunden durch eine Fortschrittslinie, die sich scroll-gekoppelt füllt
// (Scroll-Story-Modus). Rechts daneben steht Filo (freigestelltes PNG) groß
// und unverdeckt in einer eigenen Grid-Spalte — Inhalt reserviert Platz,
// statt den Fuchs zu überlagern (Owner-Finding 04.07.). Texte unverändert
// aus lib/config.ts (HOW_IT_WORKS, UWG-geprüft).
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();
  // Scroll-gekoppelte Füllung der Fortschrittslinie: füllt sich orange von
  // links nach rechts, während die Sektion durch den Viewport wandert.
  // Läuft als MotionValue auf scaleX (Compositor, kein Re-Render pro Frame).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.5"],
  });
  const lineScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="ablauf"
      aria-labelledby="how-heading"
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Ambiente: warmer Orange-Radial oben + Punktraster (Blur-Layer 1 von
          max. 2 der Sektion). Rein dekorativ. */}
      <AmbientGlow className="-z-10" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 dot-bg-dark opacity-40 mask-radial"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionKicker
            icon={ScanLineIcon}
            label="Wie es funktioniert"
            tone="on-deep"
          />
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

        {/* Auf xl+ reserviert eine rechte Grid-Spalte (~280px) echten Platz
            für Filo — der Fuchs steht NEBEN den Karten, nie darüber, nichts
            wird verdeckt oder abgeschnitten. Unter xl ist er ausgeblendet. */}
        <div className="mt-14 xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-8">
          <div className="relative">
            {/* Fortschrittslinie (Design-Signatur): dezenter Track, der sich
                scroll-gekoppelt orange von links nach rechts füllt (scaleX,
                transform-origin left; reduced-motion = statisch voll gefüllt).
                Das Lauflicht-Pünktchen (animate-travel-dot, reduced-motion-
                gated) läuft zusätzlich darüber. Verbindet 01 → 02 → 03.
                Nur Desktop (md+), aria-hidden, rein dekorativ. */}
            <div
              aria-hidden
              className="absolute top-16 right-[12%] left-[12%] hidden h-px overflow-visible rounded-full bg-gradient-to-r from-brand-orange/10 via-brand-orange/25 to-brand-orange/10 md:block"
            >
              <motion.span
                aria-hidden
                style={{ scaleX: prefersReduced ? 1 : lineScaleX }}
                className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-brand-orange/15 via-brand-orange/70 to-brand-orange will-change-transform"
              />
              <span
                aria-hidden
                className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-brand-orange shadow-[0_0_16px_2px_var(--brand-orange)] animate-travel-dot"
              />
            </div>

            <ol className="relative grid gap-6 md:grid-cols-3">
              {HOW_IT_WORKS.map((step, i) => {
                const Icon = ICON_BY_KEY[step.icon as keyof typeof ICON_BY_KEY];
                return (
                  <li key={step.step} className="flex">
                    <ScrollScrub
                      from={56}
                      fromX={i * 16}
                      className="flex w-full"
                    >
                      <GlowCard className="group/step card-lift relative flex w-full flex-col p-7">
                        <div className="flex w-full items-start justify-between gap-4">
                          {/* Große Schrittnummer (Vorlagen-Signatur 01/02/03) —
                              dekorativ, Reihenfolge trägt die <ol>. */}
                          <span
                            aria-hidden
                            className="font-mono text-4xl font-bold tracking-tight text-brand-orange text-glow"
                          >
                            {step.step}
                          </span>
                          {/* Icon im kleinen Glow-Ring. */}
                          <span className="glow-ring flex size-11 shrink-0 items-center justify-center rounded-2xl border border-brand-orange/40 bg-brand-orange/10 text-brand-orange transition-transform duration-300 group-hover/step:scale-110">
                            {Icon ? (
                              <Icon aria-hidden className="size-5" />
                            ) : null}
                          </span>
                        </div>
                        <span
                          aria-hidden
                          className="mt-4 h-px w-full bg-gradient-to-r from-brand-orange/40 to-transparent"
                        />
                        <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {step.desc}
                        </p>
                      </GlowCard>
                    </ScrollScrub>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Filo-Begleiter (freigestelltes PNG, zeigt nach oben Richtung
              Schritte): steht groß und unverdeckt in der reservierten Spalte,
              beginnt leicht unterhalb der Kartenoberkante (pt-12) — nichts
              wird abgeschnitten, KEIN overflow-hidden an diesem Container.
              CSS-Glow-Ebenen liegen HINTER dem Fuchs (DOM-Reihenfolge):
              radialer Orange-Schein (Blur-Layer 2 von 2) + .orbit-trails. */}
          <div
            aria-hidden
            className="pointer-events-none relative hidden xl:block xl:pt-12"
          >
            <div className="absolute top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--brand-orange),transparent_78%),transparent_70%)] blur-2xl" />
            <span className="orbit-trails top-24 left-1/2 h-64 w-64 -translate-x-1/2" />
            <Image
              src="/filo-pointing.png"
              alt=""
              width={704}
              height={1100}
              loading="lazy"
              className="relative mx-auto h-auto w-64"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
