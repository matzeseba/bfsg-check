"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, TimerIcon } from "lucide-react";

import { AmbientGlow } from "@/components/fx/AmbientGlow";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { SectionKicker } from "@/components/SectionKicker";
import { Button } from "@/components/ui/button";
import { DEADLINE, HERO } from "@/lib/config";
import { EASE } from "@/lib/motion";

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
          transition={{ duration: 0.6, ease: EASE }}
          // Grosses Glow-Card-Band (Dark-Glow-Redesign): dunkle Glas-Flaeche mit
          // Orange-Verlaufs-Rahmen + Innen-Glimmen (.glow-card, globals.css).
          className="glow-card relative grid items-center gap-8 overflow-hidden px-6 py-14 sm:px-12 sm:py-20 lg:grid-cols-[1.45fr_0.8fr]"
        >
          {/* Sektions-Ambiente: warmer Orange-Radial + Glut-Partikel (einziger
              Blur-Layer des Bands) + statisches Dot-Grid mit radialer Maske. */}
          <AmbientGlow embers className="z-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 dot-bg-dark mask-radial"
          />

          <div className="relative z-10 text-center lg:text-left">
            {/* Einheitliche Kicker-Pill (Spec §5: jede Sektion Kicker→Headline→Subline). */}
            <SectionKicker
              icon={TimerIcon}
              label="60 Sekunden bis zur ersten Fährte"
              tone="on-deep"
            />

            <h2
              id="cta-heading"
              className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-balance text-on-deep sm:text-[2.75rem] sm:leading-[1.05]"
            >
              Lassen Sie den Fuchs ran — bevor andere{" "}
              <span className="italic gradient-text">zuschnappen</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-foreground/70 text-pretty lg:mx-0 sm:text-lg">
              Kostenloser Sofort-Check, Ergebnis in 60 Sekunden. Keine Anmeldung,
              keine generische Tool-Rohliste — sondern priorisierte Mängel mit
              Fix.
            </p>

            {/* Amber Urgency-Pill mit verstrichenen Tagen (rose Puls-Punkt). Pill-
                TEXT light-mode-AA: dunkles Burnt-Amber auf hell, helles Amber im
                Dark. Punkt/Rahmen bleiben dekorativ (brand-amber/brand-rose). */}
            <p className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-brand-amber/25 bg-brand-amber/10 px-4 py-1.5 text-[13px] text-brand-amber">
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
              {/* Grosser Orange-3D-Haupt-CTA, magnetisch (Dark-Glow-Motion). */}
              <MagneticButton>
                <Link href="/#scan" className="btn-cta h-13 px-7 text-lg">
                  {HERO.cta}
                  <ArrowRightIcon className="size-4.5" />
                </Link>
              </MagneticButton>
              {/* Creme sekundärer CTA. */}
              <Button
                size="lg"
                variant="ghost"
                className="h-12 gap-1.5 rounded-xl border border-foreground/20 bg-foreground/[0.06] px-5 text-base font-medium text-on-deep hover:bg-foreground/10 hover:text-on-deep"
                render={<Link href="/#pakete" />}
              >
                {HERO.ctaSecondary}
              </Button>
            </div>

            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-foreground/70">
              <ShieldCheckIcon className="size-3.5 text-brand-mint" />
              Sichere Zahlung über Stripe · Rechnung sofort per E-Mail
            </p>
          </div>

          {/* Filo (Daumen hoch, Neo-Glow-Render) rechts im Band — nur ab md
              (mobil traegt der Text). Schwarzer PNG-Grund wird per Radial-Maske
              in die dunkle Glas-Flaeche eingeblendet; schwebt sanft (transform-
              only). Dekorativ → aria-hidden, pointer-events-none. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-4 bottom-0 z-0 hidden items-end md:flex lg:right-4"
          >
            <Image
              src="/filo-thumbsup-neo.png"
              alt=""
              width={821}
              height={1100}
              loading="lazy"
              className="h-auto w-60 animate-float-slow lg:w-72 [mask-image:radial-gradient(ellipse_75%_78%_at_50%_48%,black_52%,transparent_76%)]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
