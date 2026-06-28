"use client";

import * as motion from "motion/react-client";
import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SectionKicker } from "./SectionKicker";

export function CtaSection() {
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
          className="border-gradient relative overflow-hidden rounded-[2rem] bg-brand-deeper px-6 py-14 text-center text-[oklch(0.97_0.004_95)] shadow-elevated sm:px-10 sm:py-20"
        >
          {/* Aurora-Spots + Blueprint-Grid + Scanlines-Detail */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-0 size-72 rounded-full bg-brand-mint/25 blur-[90px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-0 size-80 rounded-full bg-brand-violet/22 blur-[90px]"
          />
          <div
            aria-hidden
            className="absolute inset-0 grid-bg-dark opacity-30 mask-radial"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 scanlines opacity-40 mask-fade-b"
          />

          <div className="relative">
            <SectionKicker
              icon={SparklesIcon}
              label="60 Sekunden bis zum ersten Befund"
              tone="on-deep"
            />

            <h2
              id="cta-heading"
              className="mx-auto mt-6 max-w-3xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-[3.25rem] sm:leading-[1.04]"
            >
              Bereit, Mängel zu finden{" "}
              <span className="italic text-brand-mint">
                bevor andere es tun?
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-[oklch(0.97_0.004_95)]/75 text-pretty sm:text-lg">
              Kostenloser Sofort-Check, Ergebnis in 60 Sekunden. Keine
              Anmeldung, keine Verpflichtung — und kein generischer
              Lighthouse-Dump, sondern priorisierte Mängel mit Fix.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 gap-1.5 rounded-xl bg-brand-mint px-6 text-base font-semibold text-brand-deep transition-transform hover:bg-brand-mint/85 hover:scale-[1.02] focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deeper"
                render={<Link href="/#scan" />}
              >
                Kostenlos prüfen
                <ArrowRightIcon className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-12 gap-1.5 rounded-xl px-5 text-base font-medium text-[oklch(0.97_0.004_95)] hover:bg-[oklch(0.97_0.004_95)]/10 hover:text-[oklch(0.97_0.004_95)]"
                render={<Link href="/#pakete" />}
              >
                Pakete ansehen
              </Button>
            </div>

            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-[oklch(0.97_0.004_95)]/60">
              <ShieldCheckIcon className="size-3.5 text-brand-mint" />
              Sichere Zahlung über Stripe · Rechnung sofort per E-Mail
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
