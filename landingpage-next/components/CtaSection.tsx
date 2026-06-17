"use client";

import * as motion from "motion/react-client";
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

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
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-brand-deep px-6 py-14 text-center text-primary-foreground shadow-card-hover sm:px-10 sm:py-20"
        >
          {/* Aurora-Spots */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-0 size-72 rounded-full bg-brand-mint/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-0 size-80 rounded-full bg-brand-indigo/40 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-0 grid-bg-dark opacity-30 mask-radial"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-medium text-primary-foreground/80 backdrop-blur">
              <SparklesIcon className="size-3.5 text-brand-mint" />
              60 Sekunden bis zum ersten Befund
            </span>

            <h2
              id="cta-heading"
              className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl"
            >
              Bereit, Mängel zu finden{" "}
              <span className="text-brand-mint">bevor andere es tun?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-primary-foreground/75 text-pretty sm:text-lg">
              Kostenloser Sofort-Check. Vollreport bei Bedarf. Keine
              Verpflichtung, keine Anmeldung — und kein generischer
              Lighthouse-Dump.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 gap-1.5 rounded-xl bg-brand-mint px-6 text-base font-semibold text-brand-deep transition-transform hover:bg-brand-mint/85 hover:scale-[1.02]"
                render={<a href="#scan" />}
              >
                Kostenlos prüfen
                <ArrowRightIcon className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-12 gap-1.5 rounded-xl bg-primary-foreground/0 px-5 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                render={<a href="#pakete" />}
              >
                Pakete ansehen
              </Button>
            </div>

            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-primary-foreground/60">
              <ShieldCheckIcon className="size-3.5 text-brand-mint" />
              30 Tage Geld-zurück bei berechtigter Reklamation
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
