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
import { ParallaxLayer } from "./fx/ParallaxLayer";
import { ScrollScrub } from "./fx/ScrollScrub";
import { SectionKicker } from "./SectionKicker";

// Pro Risk-Point ein passendes Icon (Reihenfolge = RISK_BAND.points):
// Stichtag · geforderter Standard · Klagebefugnis.
const POINT_ICONS = [CalendarClockIcon, ScaleIcon, GavelIcon] as const;

// Gestaffelter Seiten-Einlauf der drei Chips: ScrollScrub hat keinen
// index-Parameter, die Staffelung entsteht über wachsenden fromX-Versatz.
const CHIP_FROM_X = [-24, -36, -48] as const;

// Soft-Urgency-Band: faktenbasierter Kontext zur BFSG-Frist. Bewusst KEINE
// Drohung, KEIN UWG-Versprechen — nur "die Frist ist da, jetzt in Ruhe handeln".
// Dark-Glow-Optik: die gesamte Sektion sitzt in EINEM grossen Amber-GlowCard-
// Panel. Scroll-Story: Headline-Block und Chips bauen sich scroll-gekoppelt
// auf (ScrollScrub), Filo sprintet mit Parallax-Tiefe am rechten Panel-Rand.
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
          {/* Filo sprintet freigestellt (transparentes PNG, 848x1100) am rechten
              Panel-Rand: gross, vertikal mittig, UNVERDECKT — das Content-Grid
              reserviert ihm Platz via lg:pr (Maskottchen-Regeln v2, keine Maske
              mehr). Glow-Ebenen liegen HINTER dem Fuchs: radialer Orange-Schein
              (reines radial-gradient, kein zusätzlicher Blur-Layer) + Licht-
              Trails. Rein dekorativ (aria-hidden), nur lg+, leichte Lauf-Neigung. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-3 z-0 hidden lg:flex lg:items-center"
          >
            <ParallaxLayer distance={30} className="relative">
              <span className="absolute left-1/2 top-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-orange),transparent_72%),transparent_68%)]" />
              <span className="orbit-trails -inset-5" />
              <Image
                src="/filo-running.png"
                alt=""
                // 907x1100 = Masse nach der Schwanz-Reparatur (Luma-Restore
                // aus dem Original, 04.07.) — der wiederhergestellte Schwanz
                // verbreitert die Bounding-Box gegenueber dem Remover-Cut.
                width={907}
                height={1100}
                loading="lazy"
                className="relative h-[330px] w-auto -rotate-2"
              />
            </ParallaxLayer>
          </div>

          <div className="relative z-[1] grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:pr-[260px]">
            <ScrollScrub from={40}>
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
              {/* Ruhiger Schwebeeffekt + Hintergrundschimmer wie der
                  "Abonnieren"-Button im Footer (Owner-Feedback 08.07.: kein
                  magnetischer Cursor-Effekt mehr). */}
              <Link
                href="/#scan"
                className="btn-cta mt-6 h-12 rounded-xl px-6 text-base"
              >
                Kostenlos prüfen
                <ArrowRightIcon className="size-4" />
              </Link>
            </ScrollScrub>

            <div className="grid gap-4">
              {/* Live-Countdown der seit dem Stichtag verstrichenen Zeit. */}
              <DeadlineCounter />
              <ul className="grid gap-3">
                {RISK_BAND.points.map((p, i) => {
                  const Icon = POINT_ICONS[i] ?? AlertTriangleIcon;
                  return (
                    <li key={p.label}>
                      <ScrollScrub from={36} fromX={CHIP_FROM_X[i] ?? -24}>
                        {/* Kein backdrop-blur: die Chips sind scroll-gescrubbt —
                            ein bewegtes backdrop-filter-Element wuerde den Grund
                            pro Scroll-Frame neu filtern (Review-Fund). bg-card/95
                            ist auf dem dunklen Panel optisch gleichwertig. */}
                        <div className="glow-border card-lift flex items-center gap-4 rounded-2xl bg-card/95 p-4">
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
                        </div>
                      </ScrollScrub>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </GlowCard>
      </div>
    </section>
  );
}
