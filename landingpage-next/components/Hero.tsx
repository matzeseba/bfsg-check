"use client";

import * as motion from "motion/react-client";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

import { HERO, HERO_VISUAL } from "@/lib/config";
import { EASE } from "@/lib/motion";

import { HeroVisual } from "./HeroVisual";
import { ScanForm } from "./ScanForm";

export function Hero() {
  // Vorschau-Überschrift am Akzentwort splitten → genau EIN Fraunces-Italic-Wort
  // (echter Fraunces-Kursiv-Schnitt via --font-display-italic, s. layout.tsx).
  // indexOf-Guard: fehlt das Akzentwort mal (künftige Config-Edits), wird die
  // Überschrift ungesplittet ohne Italic gerendert statt das Wort doppelt zu zeigen.
  const pvIdx = HERO_VISUAL.previewHeading.indexOf(HERO_VISUAL.previewAccent);
  const pvPre =
    pvIdx >= 0
      ? HERO_VISUAL.previewHeading.slice(0, pvIdx)
      : HERO_VISUAL.previewHeading;
  const pvPost =
    pvIdx >= 0
      ? HERO_VISUAL.previewHeading.slice(
          pvIdx + HERO_VISUAL.previewAccent.length,
        )
      : "";
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
      {/* Aurora-Spots mit langsamer Drift (Design-Signatur; animate-aurora/float
          sind reduced-motion-gated). */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-30%] -z-10 size-[80vw] max-w-5xl -translate-x-1/2 rounded-full bg-brand-orange/10 blur-[70px] animate-aurora"
      />
      {/* Ambient-Reduktion: der zweite (Violett-)Blob entfaellt — der primaere
          Orange-Aurora reicht als Marken-Wash und spart einen teuren GPU-Blur-Pass
          hinter dem LCP-Element (v.a. Mobile). */}

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:grid-cols-2 lg:gap-12">
        {/* Linke Spalte: Text + Scan-Form. Mobile zentriert (eigenstaendige Saeule),
            Desktop links (Teil der 2-Spalten-Komposition mit Hero-Visual).
            min-w-0: eine 1fr-Grid-Spalte hat min-content als Mindestbreite — ohne
            min-w-0 wuerde sie auf Mobile breiter als der Viewport, der zentrierte
            Text saesse dann in einer zu breiten Spalte (wirkt nach links verschoben). */}
        <div className="relative flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex"
          >
            {/* Fox-Design: Pill ist die Marken-Akzent-Fläche (orange). Produktwert-
                Badge, NICHT die Frist — daher bewusst nicht-klickbar (<span>, kein
                href, kein Hover-Pfeil), damit es nicht als Link/CTA missverstanden
                wird. Dot + Flag-Wort in brand-orange. Mint bleibt Action/CTA. */}
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-orange/26 bg-brand-orange/[0.09] px-3 py-1.5 font-mono text-xs font-medium tracking-[0.01em] text-foreground/80 shadow-card-soft backdrop-blur">
              <span
                aria-hidden
                className="inline-flex size-1.5 rounded-full bg-brand-orange animate-pulse-soft"
              />
              <span className="font-semibold text-brand-orange">
                {HERO.pillFlag}
              </span>
              <span>{HERO.pill}</span>
            </span>
          </motion.div>

          {/* Editorial-Headline: Fredoka-Display; das Akzentwort „BFSG" leuchtet
              upright im Orange-Verlauf (gradient-text, kein Italic hier).
              Bewusst OHNE Entrance-Animation: die H1 ist das LCP-Element — ein
              opacity:0-Start würde den Largest Contentful Paint künstlich um die
              Animationsdauer verzögern (relevant für paid-Ads-Quality-Score). */}
          {/* EIN fließender Textfluss (kein erzwungener block-Umbruch): der Browser
              bricht via text-balance natürlich um, sodass „bereit fürs BFSG?"
              zusammenbleibt (Design: „Schlau wie ein Fuchs — bereit fürs BFSG?").
              Lead inline in gradient-text-soft, gefolgt von Space + Akzent-Span.
              Design-Signatur: das Akzentwort „BFSG" leuchtet im Orange-Verlauf und
              shimmert sanft (gradient-text-shimmer). Unterlängen-/Glyph-Überhang-
              Schutz (g/j/ß, „?") sitzt in .gradient-text → kein Clipping, kein CLS.
              Shimmer wird bei prefers-reduced-motion stillgestellt. */}
          <h1 className="mt-6 font-display text-[clamp(2.05rem,6.7vw,4.6rem)] leading-[1.05] font-bold tracking-[-0.025em] text-balance">
            <span className="gradient-text-soft">{HERO.headlineLead}</span>{" "}
            <span className="gradient-text gradient-text-shimmer">
              {HERO.headlineEmph}?
            </span>
            {/* Tail-Guard: nur rendern, wenn nicht leer — sonst kein leeres
                Block-Element mit Margin. */}
            {HERO.headlineTail && (
              <span className="mt-1 block font-sans text-[0.4em] font-medium tracking-tight text-muted-foreground not-italic">
                {HERO.headlineTail}
              </span>
            )}
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
            {/* Dezenter Conversion-Anker: anonymisierter Muster-Report als PDF.
                Senkt die "Was bekomme ich eigentlich?"-Reibung vor dem Kauf.
                Root-relativ, neuer Tab, rel=noopener. Bewusst neutrales Wording
                ("Beispiel", "automatisierte WCAG-2.1-AA-Analyse") im Rahmen der
                zulaessigen Pflicht-Sprache laut CLAUDE.md. */}
            <p className="mt-3 px-1 text-xs text-muted-foreground">
              <a
                href="/beispiel-report.pdf"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 font-medium text-foreground/80 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-brand-mint"
              >
                Beispiel-Report ansehen
                <ArrowRightIcon className="size-3" aria-hidden />
              </a>
              <span className="ml-1.5">
                — anonymisiertes Muster einer automatisierten WCAG-2.1-AA-Analyse
                (PDF)
              </span>
            </p>
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

          {/* Mini-Trust-Bar entfaellt: die 4 Kennzahlen stehen jetzt im eigenen
              Trust-Strip-Band (StatsBar) direkt unter dem Hero (Design-Aufbau). */}
        </div>

        {/* Rechte Spalte: Audit-Report-Visual. min-w-0 laesst die Spalte unter
            ihre min-content-Breite schrumpfen; mx-auto + max-w-md zentriert das
            Visual auf Mobile sauber mittig, ohne Desktop (lg+) zu beeinflussen. */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="relative mx-auto w-full min-w-0 max-w-md lg:max-w-none"
        >
          {/* Vorschau-Kopf: eigene Sub-Überschrift über dem Report-Visual.
              Bewusst ein <p> (kein <h2>): visuelle Größe ≠ Heading-Semantik, sonst
              kippt die Screenreader-Outline (WCAG 1.3.1). Klar kleiner als die H1
              (max ~1.6rem → kein LCP-Kandidat), aber deutlich als Vorschau erkennbar
              (Chip "Vorschau" + "Beispiel"-Kennzeichnung im Report selbst). */}
          <div className="mb-5 text-center lg:text-left">
            <span
              aria-hidden
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-amber px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.16em] text-brand-deep uppercase"
            >
              <span className="inline-flex size-1.5 rounded-full bg-brand-deep/70" />
              Vorschau
            </span>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-2.5 font-display text-[clamp(1.2rem,2.7vw,1.6rem)] leading-snug font-semibold tracking-tight text-foreground text-balance"
            >
              {pvPre}
              {pvIdx >= 0 && (
                <span className="italic gradient-text">
                  {HERO_VISUAL.previewAccent}
                </span>
              )}
              {pvPost}
            </motion.p>
          </div>

          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
