"use client";

import * as motion from "motion/react-client";
import { QuoteIcon } from "lucide-react";

import { DIFFERENTIATORS } from "@/lib/config";

export function Testimonials() {
  return (
    <section
      aria-labelledby="why-heading"
      className="relative overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.18em] text-brand-indigo uppercase">
            Warum BFSG-Check
          </p>
          <h2
            id="why-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          >
            Schneller als die Kanzlei.{" "}
            <span className="gradient-text">Tiefer als Gratis-Tools.</span>{" "}
            Günstiger als Beratung.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Drei Gründe, warum mittelständische Website-Betreiber bei uns
            landen — und nicht beim Stundensatz-Marathon.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {DIFFERENTIATORS.map((item, i) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group/diff relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 p-7 shadow-card-soft backdrop-blur transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <QuoteIcon
                aria-hidden
                className="absolute -top-2 -right-2 size-24 text-brand-mint/8 rotate-180"
              />
              <p className="relative text-xs font-semibold tracking-[0.18em] text-brand-mint uppercase">
                {item.kicker}
              </p>
              <h3 className="relative mt-3 font-display text-xl font-semibold tracking-tight text-balance">
                {item.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.desc}
              </p>
            </motion.li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
          Echte Kunden-Stimmen folgen nach Launch — bis dahin zeigen wir
          lieber harte Differentiators als Pseudo-Quotes.
        </p>
      </div>
    </section>
  );
}
