"use client";

import Image from "next/image";
import { CheckCircle2Icon, GlobeIcon, ScanLineIcon } from "lucide-react";

import { HOW_IT_WORKS } from "@/lib/config";

import { AmbientGlow } from "./fx/AmbientGlow";
import { GlowCard } from "./fx/GlowCard";
import { Reveal } from "./fx/Reveal";
import { SectionKicker } from "./SectionKicker";

const ICON_BY_KEY = {
  globe: GlobeIcon,
  scan: ScanLineIcon,
  check: CheckCircle2Icon,
} as const;

// Prozess-Sektion im Dark-Glow-Stil (Vorlage "Dein Weg zur digitalen
// Barrierefreiheit"): drei Glas-Karten mit großer Orange-Schrittnummer,
// verbunden durch eine Fortschrittslinie mit Lauflicht. Texte unverändert
// aus lib/config.ts (HOW_IT_WORKS, UWG-geprüft).
export function HowItWorks() {
  return (
    <section
      id="ablauf"
      aria-labelledby="how-heading"
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Ambiente: warmer Orange-Radial oben + Punktraster (einziger Blur-Layer
          der Sektion). Rein dekorativ. */}
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

        <div className="relative mt-14">
          {/* Filo-Begleiter (zeigt nach oben Richtung Schritte). Schwarzer
              PNG-Grund verschwimmt per Radial-Maske in den Seitengrund.
              Nur ab lg; Section overflow-hidden clippt sauber. */}
          <Image
            src="/filo-pointing.png"
            alt=""
            aria-hidden
            width={821}
            height={1100}
            loading="lazy"
            className="pointer-events-none absolute -right-12 -bottom-6 z-20 hidden h-auto lg:block lg:w-44 [mask-image:radial-gradient(ellipse_72%_72%_at_50%_45%,black_52%,transparent_76%)]"
          />
          {/* Fortschrittslinie (Design-Signatur): Orange-Verlauf mit Lauflicht-
              Punkt, der von links nach rechts wandert (animate-travel-dot,
              reduced-motion-gated). Verbindet 01 → 02 → 03. Nur Desktop (md+),
              aria-hidden, rein dekorativ. */}
          <div
            aria-hidden
            className="absolute top-16 right-[12%] left-[12%] hidden h-px overflow-visible rounded-full bg-gradient-to-r from-brand-orange/10 via-brand-orange/45 to-brand-orange/10 md:block"
          >
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
                  <Reveal index={i} className="flex w-full">
                    <GlowCard
                      className={
                        "group/step card-lift relative flex w-full flex-col p-7 " +
                        // Karte 3 laesst rechts Platz fuer den Filo-Begleiter,
                        // der daneben steht (Text weicht aus, keine Verdeckung).
                        (i === 2 ? "lg:pr-24" : "")
                      }
                    >
                      <div className="flex w-full items-start justify-between gap-4">
                        {/* Grosse Schrittnummer (Vorlagen-Signatur 01/02/03) —
                            dekorativ, Reihenfolge traegt die <ol>. */}
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
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
