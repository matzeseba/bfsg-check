import Image from "next/image";
import { CheckIcon, MapPinIcon, UserRoundIcon } from "lucide-react";

import { AmbientGlow } from "./fx/AmbientGlow";
import { GlowCard } from "./fx/GlowCard";
import { ParallaxLayer } from "./fx/ParallaxLayer";
import { ScrollScrub } from "./fx/ScrollScrub";
import { SectionKicker } from "./SectionKicker";

// Drei ehrliche Selbst-Tatsachen (keine erfundenen Kundenzahlen/Titel) —
// decken sich mit den Aussagen in DIFFERENTIATORS/config.ts.
const FOUNDER_POINTS = [
  "Menschliche Sichtung vor jeder Auslieferung",
  "Direkter Draht: Antwort per E-Mail, kein Ticket-System",
  "Betrieb & Hosting vollständig in Deutschland",
] as const;

// Portrait-Karte (GlowCard mit Bild + Name/Rolle/Ort) — als Mini-Komponente,
// damit sie zweimal gerendert werden kann: Desktop links im Grid, mobil
// zwischen Intro-Text und Zitat. next/image lädt das Asset nur 1×; die per
// display:none versteckte Instanz löst keinen Zweit-Download aus.
function FounderPhotoCard() {
  return (
    <GlowCard ring className="p-3">
      <Image
        src="/founder-matthias.jpg"
        alt="Porträt von Matthias Seba, Gründer des BFSG-Fuchs"
        width={675}
        height={900}
        loading="lazy"
        className="h-auto w-full rounded-xl object-cover"
      />
      <div className="px-2 pt-4 pb-2">
        <p className="font-display text-lg font-semibold">Matthias Seba</p>
        <p className="mt-0.5 text-sm font-medium text-brand-orange">
          Gründer &amp; Inhaber, BFSG-Fuchs
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
          Kutenholz, Niedersachsen
        </p>
      </div>
    </GlowCard>
  );
}

// "Wer dahintersteht" — Founder-Sektion (Dark-Glow-Redesign, Spec §1/§5/§6).
// Server-Component; Motion kommt ausschließlich aus den fertigen fx-Primitiven
// (ParallaxLayer fürs Portrait, ScrollScrub für die Zitat-Spalte), das Portrait
// sitzt in einer GlowCard mit .glow-ring.
export function FounderSection() {
  return (
    <section
      aria-labelledby="founder-heading"
      className="relative overflow-hidden bg-background"
    >
      <AmbientGlow toneClassName="opacity-60" />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* Links (nur Desktop): Portrait-Karte mit Name, Rolle, Standort —
            subtiler scroll-gekoppelter Tiefenversatz (Scroll-Story, Spec §6).
            Mobil wird die Karte stattdessen unten zwischen Intro und Zitat
            gerendert (Quellreihenfolge: Pill → Headline → Intro → Foto →
            Zitat → Checkliste). */}
        <ParallaxLayer
          distance={26}
          className="mx-auto hidden w-full max-w-sm lg:block"
        >
          <FounderPhotoCard />
        </ParallaxLayer>

        {/* Rechts: Kicker → Headline → Zitat → ehrliche Checkliste — baut sich
            scroll-gekoppelt von rechts auf. */}
        <ScrollScrub fromX={32}>
          <SectionKicker icon={UserRoundIcon} label="Wer dahintersteht" tone="on-deep" />
          <h2
            id="founder-heading"
            className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            Hinter jedem Report steht ein{" "}
            <span className="italic gradient-text">Mensch</span>.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            BFSG-Fuchs ist ein Unternehmen aus Niedersachsen — Scan,
            Sichtung und Support kommen aus einer Hand.
          </p>
          {/* Mobile Instanz der Portrait-Karte: erscheint einspaltig zwischen
              Intro-Text und Zitat; ab lg übernimmt die Desktop-Instanz links. */}
          <ParallaxLayer
            distance={26}
            className="lg:hidden mt-8 mx-auto w-full max-w-sm"
          >
            <FounderPhotoCard />
          </ParallaxLayer>
          <blockquote className="mt-8 border-l-2 border-brand-orange/50 pl-5">
            <p className="[font-family:var(--font-display-italic),Georgia,serif] text-2xl leading-snug text-foreground italic sm:text-[1.75rem]">
              „Wir prüfen jeden Report persönlich, bevor er rausgeht.“
            </p>
          </blockquote>
          <ul className="mt-8 space-y-3.5">
            {FOUNDER_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-brand-mint/30 bg-brand-mint/12 text-brand-mint">
                  <CheckIcon className="size-3.5" aria-hidden />
                </span>
                <span className="text-sm leading-relaxed text-foreground/90">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </ScrollScrub>
      </div>
    </section>
  );
}
