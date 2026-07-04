"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, TimerIcon } from "lucide-react";

import { AmbientGlow } from "@/components/fx/AmbientGlow";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { ParallaxLayer } from "@/components/fx/ParallaxLayer";
import { ScrollScrub } from "@/components/fx/ScrollScrub";
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
          // min-h ab md: der freigestellte Filo (bis 400px + Parallax-Hub) darf
          // oben nie angeschnitten werden (Maskottchen-Regeln v2).
          className="glow-card relative overflow-hidden px-6 py-14 sm:px-12 sm:py-20 md:min-h-[27.5rem]"
        >
          {/* Sektions-Ambiente: warmer Orange-Radial + Glut-Partikel + statisches
              Dot-Grid mit radialer Maske. (Blur-Budget des Bands: dieser Radial +
              der Fuchs-Glow unten = genau 2 Blur-Layer.) */}
          <AmbientGlow embers className="z-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 dot-bg-dark mask-radial"
          />

          {/* Filo (Daumen hoch, freigestelltes PNG — KEINE Maske mehr) steht
              gross und unverdeckt rechts im Band, bottom-buendig wie in den
              Vorlagen; der Content reserviert den Platz per pr (unten). Der
              Glow kommt als CSS-Ebenen HINTER dem Fuchs: radialer Orange-Schein
              + rotierende .orbit-trails (Maskottchen-Regeln v2). Scroll-Parallax
              via ParallaxLayer + sanftes Float. Dekorativ → aria-hidden. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden items-end justify-end pr-3 md:flex lg:pr-10"
          >
            {/* Radialer Orange-Schein hinter dem Fuchs (2. Blur-Layer des Bands). */}
            <div className="absolute right-2 bottom-8 size-72 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--brand-orange),transparent_70%),transparent_72%)] blur-2xl lg:size-80" />
            {/* Orbitale Licht-Trails (globals.css, reduced-motion-still). */}
            <div className="orbit-trails right-0 bottom-12 size-60 lg:size-72" />
            <ParallaxLayer distance={24} className="relative">
              <Image
                src="/filo-thumbsup-neo.png"
                alt=""
                width={598}
                height={1100}
                loading="lazy"
                className="h-[22.5rem] w-auto animate-float-slow lg:h-[25rem]"
              />
            </ParallaxLayer>
          </div>

          {/* Headline-Block scroll-gekoppelt (Scroll-Story); pr ab md reserviert
              die Buehne fuer den unverdeckten Fuchs. */}
          <ScrollScrub className="relative z-10 text-center md:pr-56 md:text-left lg:pr-72">
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
            <p className="mx-auto mt-5 max-w-xl text-base text-foreground/70 text-pretty md:mx-0 sm:text-lg">
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

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
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
          </ScrollScrub>
        </motion.div>
      </div>
    </section>
  );
}
