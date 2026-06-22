"use client";

import * as motion from "motion/react-client";
import { GaugeIcon, MicroscopeIcon, WalletIcon } from "lucide-react";

import { DIFFERENTIATORS } from "@/lib/config";

const EASE = [0.22, 1, 0.36, 1] as const;

// Pro Differentiator ein Icon (schneller/tiefer/guenstiger).
const ICONS = [GaugeIcon, MicroscopeIcon, WalletIcon] as const;

// "Warum BFSG-Check" — Anchoring gegen die drei Alternativen (Kanzlei,
// Gratis-Tool, Beratung). Bewusst KEINE Fake-Testimonials.
export function Testimonials() {
  return (
    <section
      aria-labelledby="why-heading"
      className="relative overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-medium tracking-[0.2em] text-brand-indigo uppercase dark:text-brand-mint">
            Warum BFSG-Check
          </p>
          <h2
            id="why-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            Schneller als die Kanzlei.{" "}
            <span className="italic gradient-text">Tiefer als Gratis-Tools.</span>{" "}
            Günstiger als Beratung.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Drei Gründe, warum mittelständische Website-Betreiber bei uns landen —
            und nicht beim Stundensatz-Marathon.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {DIFFERENTIATORS.map((item, i) => {
            const Icon = ICONS[i] ?? GaugeIcon;
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
                className="group/diff relative flex flex-col items-center overflow-hidden rounded-3xl border border-border/70 bg-card/85 p-7 text-center shadow-card-soft backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-mint/40 hover:shadow-card-hover md:items-start md:text-left"
              >
                {/* Spotlight-Glow beim Hover. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 size-44 rounded-full bg-brand-mint/0 blur-3xl transition-colors duration-500 group-hover/diff:bg-brand-mint/15"
                />
                <span className="relative inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-deep text-on-deep shadow-glow-mint">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="relative mt-5 font-mono text-xs font-semibold tracking-[0.16em] text-brand-indigo uppercase dark:text-brand-mint">
                  {item.kicker}
                </p>
                <h3 className="relative mt-2 font-display text-xl font-semibold tracking-tight text-balance">
                  {item.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {item.desc}
                </p>
              </motion.li>
            );
          })}
        </ul>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
          Echte Kunden-Stimmen folgen nach Launch — bis dahin zeigen wir lieber
          harte Differentiators als Pseudo-Quotes.
        </p>
      </div>
    </section>
  );
}
