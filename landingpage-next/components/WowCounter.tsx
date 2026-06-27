"use client";

import * as motion from "motion/react-client";
import { CheckIcon, GaugeIcon } from "lucide-react";

import { CountUp } from "./CountUp";
import { SectionKicker } from "./SectionKicker";

// Heller Invers-Block (Proof-Höhepunkt, kiberatung-DNA): bricht den dunklen Flow
// mit einer EHRLICHEN, animierten Kennzahl. Bewusst KEINE erfundene Aggregat-Zahl
// (UWG §5) — "80+" = die tatsächliche Prüfregel-Tiefe nach EN 301 549.
//
// A11y-KRITISCH: Der Block bleibt auch im Dark-Theme hell (cremefarben). Deshalb
// hier NUR block-lokale, helle-Hintergrund-sichere Farben (text-brand-deep, Indigo)
// und KEINE dark:-Varianten / keine oklch(0.97…)-Textliterale aus StatsBar/Cta.
const TRUST = ["WCAG 2.1 AA", "EN 301 549", "Menschlich gesichtet"] as const;

export function WowCounter() {
  return (
    <section
      aria-labelledby="scope-heading"
      className="relative isolate overflow-hidden bg-background py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="border-gradient relative overflow-hidden rounded-[2rem] bg-[oklch(0.97_0.004_95)] px-6 py-14 text-center text-brand-deep shadow-elevated sm:px-12 sm:py-20"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-mint/70 to-transparent"
          />
          <SectionKicker
            icon={GaugeIcon}
            label="Der Prüfumfang"
            tone="on-light"
          />
          <h2
            id="scope-heading"
            className="mx-auto mt-5 max-w-2xl font-display text-2xl font-semibold tracking-tight text-balance sm:text-[2.4rem] sm:leading-[1.06]"
          >
            Mehr als ein <span className="italic">Schnelltest</span>.
          </h2>

          <div className="mt-8 flex flex-col items-center">
            <p className="font-display text-[clamp(3.5rem,12vw,8rem)] leading-none font-bold tracking-tight tabular-nums">
              <CountUp value={80} suffix="+" />
            </p>
            <span
              aria-hidden
              className="mt-4 block h-1 w-16 rounded-full bg-brand-mint"
            />
            {/* /85 statt /75: im erzwungenen Dark-Theme lösen die Tokens zu ihren
                Dark-Werten auf — brand-deep/75 auf Creme wäre nur 3,42:1 (sub-AA
                für 14px). /85 ≈ 5:1 (WCAG 1.4.3 AA). Dogfood-kritisch. */}
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-deep/85">
              automatisierte WCAG-2.1-AA-Einzelprüfungen nach EN 301 549 — pro
              geprüfter Seite. Anschließend sichtet ein Mensch jeden Report,
              bevor er rausgeht.
            </p>
          </div>

          <ul className="mx-auto mt-9 flex max-w-xl flex-wrap items-center justify-center gap-2.5">
            {TRUST.map((t) => (
              <li
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-deep/15 bg-brand-deep/[0.04] px-3 py-1 text-xs font-medium text-brand-deep"
              >
                <CheckIcon
                  className="size-3.5 text-brand-indigo"
                  strokeWidth={3}
                  aria-hidden
                />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
