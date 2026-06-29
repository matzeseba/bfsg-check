"use client";

import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  GavelIcon,
  ScaleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RISK_BAND } from "@/lib/config";

import { DeadlineCounter } from "./DeadlineCounter";
import { SectionKicker } from "./SectionKicker";

const EASE = [0.22, 1, 0.36, 1] as const;

// Pro Risk-Point ein passendes Icon (Reihenfolge = RISK_BAND.points):
// Stichtag · geforderter Standard · Klagebefugnis.
const POINT_ICONS = [CalendarClockIcon, ScaleIcon, GavelIcon] as const;

// Soft-Urgency-Band: faktenbasierter Kontext zur BFSG-Frist. Bewusst KEINE
// Drohung, KEIN UWG-Versprechen — nur "die Frist ist da, jetzt in Ruhe handeln".
export function RiskBand() {
  const [titlePre, titlePost] = RISK_BAND.title.split(RISK_BAND.titleAccent);

  return (
    <section
      id="risiko"
      aria-labelledby="risk-heading"
      className="relative isolate overflow-hidden bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 -z-10 size-72 -translate-y-1/2 rounded-full bg-brand-amber/10 blur-[80px]"
      />
      {/* Warmes Amber→Rosé-Gradient-Panel (Design-Signatur Risiko-Sektion): die
          gesamte Sektion sitzt in EINEM Panel mit amber-getönter Kante. */}
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="relative overflow-visible rounded-3xl border border-brand-amber/20 bg-gradient-to-br from-brand-amber/[0.07] to-brand-rose/[0.05] p-6 sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <SectionKicker
            icon={AlertTriangleIcon}
            label={RISK_BAND.kicker}
            tone="warn"
          />
          <h2
            id="risk-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.6rem] sm:leading-[1.05]"
          >
            {titlePre}
            <span className="italic gradient-text">{RISK_BAND.titleAccent}</span>
            {titlePost}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
            {RISK_BAND.desc}
          </p>
          <Button
            size="lg"
            className="mt-6 gap-1.5 rounded-xl bg-brand-mint text-brand-deep shadow-glow-mint transition-transform hover:scale-[1.015] hover:bg-brand-mint/85 focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            render={<Link href="/#scan" />}
          >
            In 60 Sekunden prüfen
            <ArrowRightIcon className="size-4" />
          </Button>
        </motion.div>

        <div className="relative grid gap-4">
        {/* Fuchs-Logo oben rechts angeschnitten (Design): lugt über die Kante der
            Countdown-Karte. Dekorativ → alt="" (der Fuchs ist hier reine Marken-
            Signatur, keine Information). Lazy: nicht LCP-relevant. */}
        <Image
          src="/logo-fox.png"
          alt=""
          width={116}
          height={116}
          aria-hidden
          className="pointer-events-none absolute -top-12 right-2 z-10 h-20 w-auto drop-shadow-[0_12px_22px_rgba(0,0,0,0.6)] sm:-top-16 sm:h-28"
        />
        {/* Live-Countdown der seit dem Stichtag verstrichenen Zeit (Design-Signatur). */}
        <DeadlineCounter />
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
          className="grid gap-3"
        >
          {RISK_BAND.points.map((p, i) => {
            const Icon = POINT_ICONS[i] ?? AlertTriangleIcon;
            return (
              <motion.li
                key={p.label}
                variants={{
                  hidden: { opacity: 0, x: 16 },
                  show: { opacity: 1, x: 0 },
                }}
                className="group/risk card-lift flex items-center gap-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-card-soft backdrop-blur dark:ring-1 dark:ring-white/5"
              >
                <span
                  className={
                    "grid size-12 shrink-0 place-items-center rounded-xl bg-brand-amber/12 text-brand-amber " +
                    (i === 0 ? "animate-pulse-soft" : "")
                  }
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold tracking-tight tabular-nums">
                    {p.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{p.label}</p>
                  {/* Severity-Bar: skaliert beim In-View ein (origin-left).
                      Reine transform-Animation → GPU-billig, reduced-motion-safe. */}
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.7,
                      delay: 0.25 + i * 0.1,
                      ease: EASE,
                    }}
                    className="mt-2 block h-0.5 origin-left rounded-full bg-gradient-to-r from-brand-amber to-brand-amber/15"
                  />
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
        </div>
        </div>
        </div>
      </div>
    </section>
  );
}
