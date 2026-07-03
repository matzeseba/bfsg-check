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

import { RISK_BAND } from "@/lib/config";
import { EASE } from "@/lib/motion";

import { DeadlineCounter } from "./DeadlineCounter";
import { GlowCard } from "./fx/GlowCard";
import { MagneticButton } from "./fx/MagneticButton";
import { SectionKicker } from "./SectionKicker";

// Pro Risk-Point ein passendes Icon (Reihenfolge = RISK_BAND.points):
// Stichtag · geforderter Standard · Klagebefugnis.
const POINT_ICONS = [CalendarClockIcon, ScaleIcon, GavelIcon] as const;

// Soft-Urgency-Band: faktenbasierter Kontext zur BFSG-Frist. Bewusst KEINE
// Drohung, KEIN UWG-Versprechen — nur "die Frist ist da, jetzt in Ruhe handeln".
// Dark-Glow-Optik: die gesamte Sektion sitzt in EINEM grossen Amber-GlowCard-
// Panel; die drei Punkte sind Glow-Border-Chips, der Countdown glimmt in Mono.
export function RiskBand() {
  const [titlePre, titlePost] = RISK_BAND.title.split(RISK_BAND.titleAccent);

  return (
    <section
      id="risiko"
      aria-labelledby="risk-heading"
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Einziger Blur-Layer der Sektion (Amber-Schein links, Performance-Budget). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 -z-10 size-72 -translate-y-1/2 rounded-full bg-brand-amber/10 blur-[80px]"
      />
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <GlowCard
          tone="amber"
          className="relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:p-12"
        >
          {/* Filo sprintet am rechten Panel-Rand (Schnelligkeits-Kontext). PNG hat
              schwarzen BG → Radial-Maske blendet die Raender in den Panel-Grund.
              Rein dekorativ (aria-hidden, alt="") + lazy, nur lg+. Liegt UNTER dem
              Content-Grid (z-Reihenfolge unten). */}
          <Image
            src="/filo-running.png"
            alt=""
            width={821}
            height={1100}
            loading="lazy"
            aria-hidden
            className="pointer-events-none absolute -right-10 -bottom-16 z-0 hidden w-56 opacity-60 [mask-image:radial-gradient(ellipse_62%_62%_at_50%_45%,black_50%,transparent_75%)] lg:block"
          />
          <div className="relative z-[1] grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
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
                className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.6rem] sm:leading-[1.05]"
              >
                {titlePre}
                <span className="italic gradient-text">{RISK_BAND.titleAccent}</span>
                {titlePost}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
                {RISK_BAND.desc}
              </p>
              <MagneticButton className="mt-6">
                <Link
                  href="/#scan"
                  className="btn-cta h-12 rounded-xl px-6 text-base"
                >
                  In 60 Sekunden prüfen
                  <ArrowRightIcon className="size-4" />
                </Link>
              </MagneticButton>
            </motion.div>

            <div className="grid gap-4">
              {/* Live-Countdown der seit dem Stichtag verstrichenen Zeit. */}
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
                      className="glow-border card-lift flex items-center gap-4 rounded-2xl bg-card/80 p-4 backdrop-blur"
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
        </GlowCard>
      </div>
    </section>
  );
}
