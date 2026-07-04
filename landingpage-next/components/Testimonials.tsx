"use client";

import * as motion from "motion/react-client";
import { GaugeIcon, MicroscopeIcon, SparklesIcon, WalletIcon } from "lucide-react";

import { DIFFERENTIATORS } from "@/lib/config";

import { AmbientGlow } from "./fx/AmbientGlow";
import { GlowCard } from "./fx/GlowCard";
import { Reveal } from "./fx/Reveal";
import { ScrollScrub } from "./fx/ScrollScrub";
import { TiltCard } from "./fx/TiltCard";
import { SectionKicker } from "./SectionKicker";

// Pro Differentiator ein Icon (schneller/tiefer/günstiger).
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
      className="mt-5 w-full overflow-hidden rounded-xl border border-brand-orange/15 bg-brand-deepest/80 p-3.5 font-mono text-[11.5px] leading-relaxed"
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
// Dark-Glow-Redesign (Scroll-Story, Spec §6): drei .glow-card-Glas-Karten mit
// Kicker-Pill und Fredoka-Titel, scroll-gekoppelt gestaffelt eingeblendet
// (ScrollScrub) und mit 3D-Cursor-Neigung (TiltCard) auf near-black Grund.
export function Testimonials() {
  return (
    <section
      aria-labelledby="why-heading"
      className="relative overflow-hidden border-y border-border/60 bg-brand-deeper"
    >
      <AmbientGlow toneClassName="opacity-60" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionKicker icon={SparklesIcon} label="Warum der BFSG-Fuchs" tone="on-deep" />
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
        </Reveal>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {DIFFERENTIATORS.map((item, i) => {
            const Icon = ICONS[i] ?? GaugeIcon;
            return (
              <li key={item.title} className="flex">
                {/* Scroll-gekoppelter Aufbau, gestaffelt über fromX 0/20/40;
                    TiltCard fängt nur pointermove — Inhalte bleiben klickbar. */}
                <ScrollScrub from={64} fromX={i * 20} className="flex w-full">
                  <TiltCard max={5} className="flex w-full">
                    <GlowCard className="card-lift flex w-full flex-col items-center p-7 text-center md:items-start md:text-left">
                      {/* Kicker-Pill der Karte (Marken-Orange, Icon je Argument). */}
                      <SectionKicker icon={Icon} label={item.kicker} />
                      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-balance">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                        {item.desc}
                      </p>
                      {i === 1 && <DiffSnippet />}
                    </GlowCard>
                  </TiltCard>
                </ScrollScrub>
              </li>
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
