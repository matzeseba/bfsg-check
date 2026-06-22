"use client";

import * as motion from "motion/react-client";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

import { HERO } from "@/lib/config";

import { HeroVisual } from "./HeroVisual";
import { ScanForm } from "./ScanForm";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section
      id="scan"
      className="relative isolate overflow-hidden border-b border-border/60"
    >
      {/* Hintergrund: weicher Wash + Spotlight oben + Blueprint-Grid mit Maske. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/30"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[120%] grid-bg-fine opacity-[0.4] mask-fade-y dark:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 hidden h-[120%] grid-bg-dark opacity-[0.5] mask-fade-y dark:block"
      />
      {/* Spotlight statt freischwebender Blobs — wirkt intentionaler. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-30%] -z-10 size-[80vw] max-w-5xl -translate-x-1/2 rounded-full bg-brand-mint/10 blur-[70px]"
      />
      {/* Zweiter Glow nur ab md+: zwei gestapelte Großradius-Blur-Layer hinter
          dem LCP-Element sind auf Mobile ein teurer GPU-Blur-Pass. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[-10%] -z-10 hidden size-[45vw] rounded-full bg-brand-violet/15 blur-[70px] md:block"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
        {/* Linke Spalte: Text + Scan-Form. Mobile zentriert (eigenstaendige Saeule),
            Desktop links (Teil der 2-Spalten-Komposition mit Hero-Visual). */}
        <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex"
          >
            <a
              href="#risiko"
              className="group/pill inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-card-soft backdrop-blur transition-all hover:border-brand-mint/60 hover:text-foreground"
            >
              <span
                aria-hidden
                className="inline-flex size-1.5 rounded-full bg-brand-mint animate-pulse-soft"
              />
              <span className="font-semibold text-brand-indigo dark:text-brand-mint">
                {HERO.pillFlag}
              </span>
              <span>{HERO.pill}</span>
              <ArrowRightIcon className="size-3 -translate-x-0.5 opacity-0 transition-all group-hover/pill:translate-x-0 group-hover/pill:opacity-100" />
            </a>
          </motion.div>

          {/* Editorial-Headline: Fraunces-Serif, betontes Wort als Serif-Italic.
              Bewusst OHNE Entrance-Animation: die H1 ist das LCP-Element — ein
              opacity:0-Start würde den Largest Contentful Paint künstlich um die
              Animationsdauer verzögern (relevant für paid-Ads-Quality-Score). */}
          <h1 className="mt-6 font-display text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[0.98] font-semibold tracking-[-0.025em] text-balance">
            <span className="block gradient-text-soft">{HERO.headlineLead}</span>
            <span className="block italic gradient-text">
              {HERO.headlineEmph}
            </span>
            <span className="mt-1 block font-sans text-[0.4em] font-medium tracking-tight text-muted-foreground not-italic">
              {HERO.headlineTail}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {HERO.subline}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className="mt-8 w-full max-w-xl"
          >
            <ScanForm variant="hero" />
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
            }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start"
          >
            {HERO.badges.map((badge) => (
              <motion.li
                key={badge}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                className="inline-flex items-center gap-1.5"
              >
                <CheckCircle2Icon
                  className="size-4 text-brand-mint"
                  aria-hidden
                />
                <span>{badge}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Mini-Trust-Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.55 }}
            className="mt-9 grid w-full grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4"
          >
            {HERO.trust.map((item) => (
              <div key={item.label} className="text-center lg:text-left">
                <p className="font-mono text-xl font-bold tracking-tight tabular-nums text-foreground">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.sub}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Rechte Spalte: Audit-Report-Visual */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="relative"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
