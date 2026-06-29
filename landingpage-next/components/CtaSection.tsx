"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEADLINE, HERO } from "@/lib/config";

// Verstrichene Tage seit dem BFSG-Stichtag (faktische Angabe, keine Drohung).
// Hydration-sicher: Start ohne Wert, Berechnung erst clientseitig (gleiche Logik
// wie DeadlineCounter.tsx — Datum aus DEADLINE.date in config).
function elapsedDays(): number {
  const dl = new Date(DEADLINE.date).getTime();
  const diff = Math.max(0, (Date.now() - dl) / 1000);
  return Math.floor(diff / 86400);
}

export function CtaSection() {
  const [days, setDays] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Bewusst client-only nach Mount berechnet (Start = null): der Stichtags-Abstand
    // haengt von Date.now() ab → auf dem Server vorgerendert wuerde er beim Hydrate
    // abweichen (Tageswechsel) und einen Hydration-Mismatch ausloesen. Daher legitime
    // Ausnahme von set-state-in-effect (kein Cascading-Render-Problem, einmalig).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(elapsedDays());
  }, []);

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          // Warmes Orange-Gradient-Panel (Design: #2a1408 → #16110e). Token-
          // getrieben via color-mix aus brand-orange über brand-deeper (kein
          // roher Hex), feine Orange-Kante.
          className="relative grid items-center gap-8 overflow-hidden rounded-[1.5rem] border border-brand-orange/25 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand-orange)_18%,var(--brand-deeper)),var(--brand-deeper)_70%)] px-6 py-14 shadow-elevated sm:px-12 sm:py-20 lg:grid-cols-[1.45fr_0.8fr]"
        >
          {/* Orange-Glow oben + Dot-Grid mit radialer Maske (Design). */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-[30%] size-[34rem] -translate-x-1/2 rounded-full bg-brand-orange/20 blur-[60px] animate-float"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 dot-bg-dark mask-radial"
          />

          <div className="relative text-center lg:text-left">
            {/* Orange Mono-Kicker (kein Pill — Design: nackte Marken-Linie). */}
            <p className="font-mono text-xs tracking-[0.12em] text-brand-orange uppercase">
              60 Sekunden bis zur ersten Fährte
            </p>

            <h2
              id="cta-heading"
              className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-balance text-foreground sm:text-[2.75rem] sm:leading-[1.05]"
            >
              Lassen Sie den Fuchs ran —{" "}
              <span className="italic gradient-text">bevor andere zuschnappen.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground text-pretty lg:mx-0 sm:text-lg">
              Kostenloser Sofort-Check, Ergebnis in 60 Sekunden. Keine Anmeldung,
              kein generischer Lighthouse-Dump — sondern priorisierte Mängel mit
              Fix.
            </p>

            {/* Amber Urgency-Pill mit verstrichenen Tagen (rose Puls-Punkt). Pill-
                TEXT light-mode-AA: dunkles Burnt-Amber auf hell, helles Amber im
                Dark. Punkt/Rahmen bleiben dekorativ (brand-amber/brand-rose). */}
            <p className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-brand-amber/25 bg-brand-amber/10 px-4 py-1.5 text-[13px] text-[oklch(0.5_0.13_70)] dark:text-brand-amber">
              <span
                aria-hidden
                className="inline-flex size-1.5 rounded-full bg-brand-rose shadow-[0_0_8px_var(--brand-rose)] animate-pulse-soft"
              />
              {days === null ? (
                <span>Seit dem Stichtag vergeht jeder Tag — das Risiko steigt</span>
              ) : (
                <span>
                  Bereits {days} Tage seit dem Stichtag — jeder Tag erhöht das
                  Risiko
                </span>
              )}
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              {/* Mint Haupt-CTA (Action-Farbe). */}
              <Button
                size="lg"
                className="h-12 gap-1.5 rounded-xl bg-brand-mint px-6 text-base font-semibold text-primary-foreground transition-transform hover:bg-brand-mint/85 hover:scale-[1.02] focus-visible:ring-brand-mint/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deeper"
                render={<Link href="/#scan" />}
              >
                {HERO.cta}
                <ArrowRightIcon className="size-4" />
              </Button>
              {/* Creme sekundärer CTA. */}
              <Button
                size="lg"
                variant="ghost"
                className="h-12 gap-1.5 rounded-xl border border-border bg-foreground/[0.04] px-5 text-base font-medium text-foreground hover:bg-foreground/10 hover:text-foreground"
                render={<Link href="/#pakete" />}
              >
                {HERO.ctaSecondary}
              </Button>
            </div>

            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheckIcon className="size-3.5 text-brand-mint" />
              Sichere Zahlung über Stripe · Rechnung sofort per E-Mail
            </p>
          </div>

          {/* Maskottchen rechts — schwebt sanft (foxBob via animate-float),
              unten weich ausgeblendet (mask-fade-b). Dekorativ neben dem CTA. */}
          <div className="relative hidden items-end justify-center lg:flex">
            <div className="animate-float">
              <Image
                src="/mascot-fox.png"
                alt="BFSG-Fuchs Maskottchen mit Tablet"
                width={324}
                height={435}
                loading="lazy"
                sizes="324px"
                className="h-auto w-[18rem] mask-fade-b drop-shadow-[0_24px_40px_rgba(0,0,0,0.6)] xl:w-[20rem]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
