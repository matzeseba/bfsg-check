"use client";

import * as motion from "motion/react-client";
import { GaugeIcon, MicroscopeIcon, SparklesIcon, WalletIcon } from "lucide-react";

import { DIFFERENTIATORS } from "@/lib/config";

import { SectionKicker } from "./SectionKicker";

const EASE = [0.22, 1, 0.36, 1] as const;

// Pro Differentiator ein Icon (schneller/tiefer/guenstiger).
const ICONS = [GaugeIcon, MicroscopeIcon, WalletIcon] as const;

// Mini-Terminal für die "Tiefer als Gratis-Tools"-Karte: zeigt streng technisch,
// was eine kuratierte Prüfung leistet (axe-Lauf → Fix → Fuchs-Sichtung).
// Reine Pflichtsprache, keine Claims. aria-hidden (dekorativ, Aussage steht im Text).
const SNIPPET = [
  { code: "axe.run()", meta: "→ 17 Funde", tone: "mint" },
  { code: "Kontrast 1.9:1", meta: "→ Fix #0b3d2e (7.4:1)", tone: "mint" },
  { code: "✓ vom Fuchs gesichtet", meta: "", tone: "mint" },
] as const;

function DiffSnippet() {
  return (
    <motion.div
      aria-hidden
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
      }}
      className="mt-5 w-full overflow-hidden rounded-xl border border-border/60 bg-brand-deepest/80 p-3.5 font-mono text-[11.5px] leading-relaxed"
    >
      {/* Klar als Beispiel-Auszug gekennzeichnet (analog Hero-Report-Visual) —
          kein echtes Kundenergebnis, spiegelt die HERO_VISUAL-Demodaten. */}
      <div className="mb-1.5 text-[10px] tracking-[0.12em] text-muted-foreground/70 uppercase">
        {"// Auszug"}
      </div>
      {SNIPPET.map((l) => (
        <motion.div
          key={l.code}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          className="flex flex-wrap items-center gap-1.5 text-foreground/75"
        >
          <span className="text-brand-mint">{l.code}</span>
          {l.meta && <span className="text-brand-mint/90">{l.meta}</span>}
        </motion.div>
      ))}
      <span
        aria-hidden
        className="mt-1 inline-block h-3 w-1.5 animate-pulse-soft bg-brand-orange align-middle"
      />
    </motion.div>
  );
}

// "Warum der BFSG-Fuchs" — Anchoring gegen die drei Alternativen (Kanzlei,
// Gratis-Tool, Beratung). Bewusst KEINE Fake-Testimonials.
// Design "BFSG-Fuchs": Alt-Sektion auf brand-deeper, orange-getoente Icon-Tiles,
// Karten heben beim Hover mit orange Kante an (card-lift).
export function Testimonials() {
  return (
    <section
      aria-labelledby="why-heading"
      className="relative overflow-hidden border-y border-border/60 bg-brand-deeper"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionKicker icon={SparklesIcon} label="Warum der BFSG-Fuchs" />
          <h2
            id="why-heading"
            className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            Schneller als die Kanzlei.{" "}
            <span className="italic gradient-text">Tiefer</span> als Gratis-Tools.
            Günstiger als Beratung.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Drei Gründe, warum mittelständische Website-Betreiber den Fuchs
            losschicken — statt in den Stundensatz-Marathon zu starten.
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
                className="group/diff card-lift relative flex flex-col items-center overflow-hidden rounded-3xl border border-border/70 bg-card p-7 text-center shadow-card-soft backdrop-blur dark:ring-1 dark:ring-white/5 md:items-start md:text-left"
              >
                {/* Spotlight-Glow beim Hover (Marken-Orange). */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 size-44 rounded-full bg-brand-orange/0 blur-3xl transition-colors duration-500 group-hover/diff:bg-brand-orange/15"
                />
                {/* Orange-getoentes Icon-Tile (Design: rgba(237,106,51,.13)-Kachel). */}
                <span className="relative inline-flex size-11 items-center justify-center rounded-2xl border border-brand-orange/25 bg-brand-orange/12 text-brand-orange">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="relative mt-5 font-mono text-xs font-semibold tracking-[0.16em] text-brand-orange uppercase">
                  {item.kicker}
                </p>
                <h3 className="relative mt-2 font-display text-xl font-semibold tracking-tight text-balance">
                  {item.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {item.desc}
                </p>
                {i === 1 && <DiffSnippet />}
              </motion.li>
            );
          })}
        </ul>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
          Der Fuchs zeigt lieber prüfbare Fakten als gekaufte Sternebewertungen —
          jeder Befund im Report ist belegbar.
        </p>
      </div>
    </section>
  );
}
