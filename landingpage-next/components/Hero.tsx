"use client";

import Image from "next/image";
import * as motion from "motion/react-client";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

import { AmbientGlow } from "@/components/fx/AmbientGlow";
import { MouseLayer, MouseParallax } from "@/components/fx/MouseParallax";
import { ParallaxLayer } from "@/components/fx/ParallaxLayer";
import { HERO, HERO_VISUAL } from "@/lib/config";
import { EASE } from "@/lib/motion";

import { HeroVisual } from "./HeroVisual";
import { ScanForm } from "./ScanForm";

// Schwebende Befund-Chips um das Report-Panel (Vorlage „Interaktive Prüfung"):
// Texte kommen 1:1 aus HERO_VISUAL.sample.topIssues (ehrliche Beispieldaten) und
// stehen bereits lesbar IM Panel → die Chips sind redundant-dekorativ (aria-hidden).
// Dot-Farben spiegeln die Schwere-Sequenz des Beispiels (2× Kritisch).
// Bewusst nur ZWEI Chips: ein dritter verdeckte auf 1440px exakt die Panel-
// Zeile mit demselben Text (redundant + Lesbarkeitsverlust). top-basiert —
// eine bottom-Referenz loeste gegen die Panel-Oberkante auf und schob den
// Chip in die Vorschau-Überschrift. Beide Chips ankern an der LINKEN Panel-
// Kante: rechts steht jetzt der freigestellte Filo, und den duerfen keine
// Chips ueberdecken (Maskottchen-Regeln v2).
// Bewusst nur EIN Chip: Das Panel ist seit dem Filo-Umbau schmal und die
// Spaltenluecke ~50px — ein zweiter Chip kollidierte auf 1440px wahlweise
// mit der Hero-Subline (links) oder den Severity-Badges (im Panel).
// Der eine Chip an der linken Panel-Oberkante traegt die Vorlagen-Optik.
const FLOAT_CHIPS = [
  { pos: "-left-20 top-14", float: "animate-float", dot: "bg-brand-rose", delay: "0s" },
] as const;

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
      {/* Hintergrund (Dark-Glow): tiefer Grund + Blueprint-Grid mit Maske. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/30"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[120%] grid-bg-dark opacity-[0.5] mask-fade-y"
      />
      {/* Sektions-Ambiente: warmer Orange-Radial-Schein + Glut-Partikel
          (AmbientGlow ist aria-hidden + reduced-motion-still). Der einzige
          Blur-Layer neben dem Panel-Halo im HeroVisual (Budget: max 2 —
          der Fuchs-Glow rechts ist deshalb bewusst blur-frei). */}
      <AmbientGlow
        embers
        className="-z-10"
        toneClassName="h-[520px] w-[920px]"
      />

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
            {/* Produktwert-Badge, NICHT die Frist — daher bewusst nicht-klickbar
                (<span>, kein href, kein Hover-Pfeil), damit es nicht als Link/CTA
                missverstanden wird. Dot + Flag-Wort in brand-orange. */}
            <span className="glow-border inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 font-mono text-xs font-medium tracking-[0.01em] text-foreground/80">
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

          {/* Dark-Glow-Headline: Fredoka-Display, Lead creme-weiss, das Akzentwort
              „BFSG" leuchtet upright im Orange-Verlauf (gradient-text + Shimmer).
              Bewusst OHNE Entrance-Animation: die H1 ist das LCP-Element — ein
              opacity:0-Start würde den Largest Contentful Paint künstlich um die
              Animationsdauer verzögern (relevant für paid-Ads-Quality-Score). */}
          {/* EIN fließender Textfluss (kein erzwungener block-Umbruch): der Browser
              bricht via text-balance natürlich um, sodass „bereit fürs BFSG?"
              zusammenbleibt. Unterlängen-/Glyph-Überhang-Schutz (g/j/ß, „?") sitzt
              in .gradient-text → kein Clipping, kein CLS. Shimmer wird bei
              prefers-reduced-motion stillgestellt. */}
          <h1 className="mt-6 font-display text-[clamp(2.05rem,6.7vw,4.6rem)] leading-[1.05] font-bold tracking-[-0.025em] text-balance text-foreground">
            {HERO.headlineLead}{" "}
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

          {/* ScanForm bewusst OHNE Entrance-Animation: der CTA-Button gehört zum
              LCP-kritischen Above-the-fold-Kern (Spec: Hero-H1 + CTA statisch). */}
          <div className="mt-8 w-full max-w-xl">
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
                className="inline-flex items-center gap-1 font-medium text-foreground/80 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-brand-orange"
              >
                Beispiel-Report ansehen
                <ArrowRightIcon className="size-3" aria-hidden />
              </a>
              <span className="ml-1.5">
                — anonymisiertes Muster einer automatisierten WCAG-2.1-AA-Analyse
                (PDF)
              </span>
            </p>
          </div>

          {/* HERO.badges als kleine Glow-Border-Chips (Vorlagen-Optik). */}
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
            }}
            className="mt-7 flex flex-wrap items-center justify-center gap-2.5 text-sm text-muted-foreground lg:justify-start"
          >
            {HERO.badges.map((badge) => (
              <motion.li
                key={badge}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                className="glow-border inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5"
              >
                <CheckCircle2Icon
                  className="size-4 text-brand-mint"
                  aria-hidden
                />
                <span>{badge}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Rechte Spalte: schwebendes Report-Panel (Glas + Glow) mit Filo GROSS
            daneben (Maskottchen-Regeln v2: PNG echt freigestellt → keine Maske,
            unverdeckt NEBEN dem Inhalt statt dahinter). Der Inhalt reserviert
            dem Fuchs Platz via md:pr-40/xl:pr-52 auf dem MouseParallax-Wrapper;
            nur die Panel-KANTE wird minimal ueberlappt (z-20, GlowCard-Rahmen +
            ResultPanel-px-5 fangen die ~25px ab — kein Inhalt verdeckt).
            min-w-0 laesst die Spalte unter ihre min-content-Breite schrumpfen;
            mx-auto + max-w-md zentriert auf Mobile, md:max-w-2xl gibt der
            Komposition auf md Breite fuer Panel + Fuchs-Zone. Der Entrance
            bleibt (Owner-ok): LCP-Element ist die H1 links, nicht das Panel. */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="relative mx-auto w-full min-w-0 max-w-md md:max-w-2xl lg:max-w-none"
        >
          {/* Cursor-Tiefenebenen (Dynamik 2.0): MouseParallax normalisiert die
              Mausposition auf dem gesamten Kompositions-Wrapper, die MouseLayer
              staffeln Panel (8) / Glow+Trails (12) / Fuchs (18) / Chips (28) in
              die Tiefe. Nur Feinzeiger (Maus), gefedert, reduced-motion-still —
              alles im Primitiv selbst geregelt, MotionValues statt State. */}
          {/* lg:pr-48: bei 1024–1279px waechst der Fuchs auf 400px (~187px Einzug),
              md:pr-40 (160px) liesse ihn ~27px in den Panel-Inhalt ragen
              (Review-Fund) — 192px Reserve schliesst die Luecke. */}
          <MouseParallax className="relative md:pr-40 lg:pr-48 xl:pr-52">
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

            {/* Glow-Ebenen HINTER dem Fuchs (Maskottchen-Regeln v2): radialer
                Orange-Schein als reines radial-gradient — bewusst KEIN
                filter-blur, das Sektions-Budget (max 2) ist durch AmbientGlow +
                Panel-Halo belegt (Konvention wie RiskBand) — plus der
                .orbit-trails-Ring. Grob auf den Fuchs-Torso zentriert; -z-10 →
                liegt hinter Panel UND Fuchs, nie darueber. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -bottom-4 -z-10 hidden size-80 md:block lg:-right-32 lg:size-[440px] xl:size-[490px]"
            >
              <MouseLayer depth={12} className="relative h-full w-full">
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--brand-orange),transparent_72%),transparent_68%)]" />
                <span className="orbit-trails inset-8" />
              </MouseLayer>
            </div>

            <div className="relative">
              {/* Report-Panel: Maus-Tiefe 8 + scroll-gekoppeltes Treiben
                  (ParallaxLayer 18, Scroll-Story) — beides reine Compositor-
                  Transforms via MotionValues, kein Re-Render pro Frame. */}
              <MouseLayer depth={8}>
                <ParallaxLayer distance={18}>
                  <HeroVisual />
                </ParallaxLayer>
              </MouseLayer>

              {/* Schwebende Befund-Chips (redundant-dekorativ, Texte stehen im
                  Panel selbst → aria-hidden; animate-float ist reduced-motion-
                  gated). md+ only, damit auf Mobile nichts überlappt. Maus-Tiefe
                  28 + eigenes Scroll-Treiben (distance 24 ≠ Panel 18 → leichte
                  Relativ-Drift der Chips gegen das Panel beim Scrollen). */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 hidden md:block"
              >
                <ParallaxLayer distance={24} className="absolute inset-0">
                  <MouseLayer depth={28} className="absolute inset-0">
                    {HERO_VISUAL.sample.topIssues.slice(0, 3).map((issue, i) => {
                      const chip = FLOAT_CHIPS[i];
                      if (!chip) return null;
                      return (
                        <span
                          key={issue}
                          style={{ animationDelay: chip.delay }}
                          className={`glow-border absolute inline-flex max-w-60 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium text-foreground/90 shadow-glow-orange ${chip.pos} ${chip.float}`}
                        >
                          <span
                            className={`inline-flex size-1.5 shrink-0 rounded-full ${chip.dot}`}
                          />
                          <span className="truncate">{issue}</span>
                        </span>
                      );
                    })}
                  </MouseLayer>
                </ParallaxLayer>
              </div>
            </div>

            {/* Filo GROSS neben dem Panel (freigestelltes PNG 537×1100 — keine
                CSS-Maske mehr noetig): bottom-buendig mit der Panel-Unterkante,
                z-20 → VOR der Panel-Kante, dank reserviertem pr-* aber ohne
                Panel-Inhalt zu verdecken. Maus-Tiefe 18. Auf md kleiner neben
                dem Panel, auf Mobile hidden. */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 -right-2 z-20 hidden md:block"
            >
              <MouseLayer depth={18}>
                <Image
                  src="/filo-arms-crossed.png"
                  alt=""
                  width={537}
                  height={1100}
                  // KEIN priority: dekorativ + auf Mobile via CSS versteckt — ein
                  // Preload wuerde dort gegen das echte LCP-Element konkurrieren.
                  loading="lazy"
                  className="h-[300px] w-auto lg:h-[400px] xl:h-[460px]"
                />
              </MouseLayer>
            </div>
          </MouseParallax>
        </motion.div>
      </div>
    </section>
  );
}
