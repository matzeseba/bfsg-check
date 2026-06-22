"use client";

import * as motion from "motion/react-client";
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  GavelIcon,
  ScaleIcon,
} from "lucide-react";

import { RISK_BAND } from "@/lib/config";

const EASE = [0.22, 1, 0.36, 1] as const;

// Pro Risk-Point ein passendes Icon (Reihenfolge = RISK_BAND.points):
// Stichtag · geforderter Standard · Klagebefugnis.
const POINT_ICONS = [CalendarClockIcon, ScaleIcon, GavelIcon] as const;

// Soft-Urgency-Band: faktenbasierter Kontext zur BFSG-Frist. Bewusst KEINE
// Drohung, KEIN UWG-Versprechen — nur "die Frist ist da, jetzt in Ruhe handeln".
export function RiskBand() {
  return (
    <section
      id="risiko"
      aria-labelledby="risk-heading"
      className="relative isolate overflow-hidden border-y border-border/60 bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 -z-10 size-72 -translate-y-1/2 rounded-full bg-brand-amber/10 blur-[80px]"
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-amber/40 bg-brand-amber/10 px-3 py-1 text-xs font-medium text-foreground">
            <AlertTriangleIcon className="size-3.5 text-brand-amber" />
            {RISK_BAND.kicker}
          </span>
          <h2
            id="risk-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.6rem] sm:leading-[1.05]"
          >
            {RISK_BAND.title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
            {RISK_BAND.desc}
          </p>
        </motion.div>

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
              className="group/risk flex items-center gap-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-card-soft backdrop-blur transition-colors hover:border-brand-amber/40"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-amber/12 text-brand-amber">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-tight tabular-nums">
                  {p.value}
                </p>
                <p className="text-sm text-muted-foreground">{p.label}</p>
              </div>
            </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
