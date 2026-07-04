import { CookieIcon } from "lucide-react";

import { COOKIE_PACKAGES } from "@/lib/config";

import { ScrollScrub } from "./fx/ScrollScrub";
import { PricingCards } from "./PricingCards";
import { SectionKicker } from "./SectionKicker";

export function CookieSection() {
  return (
    <section
      id="cookie"
      aria-labelledby="cookie-heading"
      // Dunklere Alt-Sektion (Design: Cookie-Block sitzt auf brand-deeper
      // #0b0807 mit warmen creme-Hairlines oben/unten — „Pflicht-Baustelle Nr. 2").
      // Scoped Dark (`dark` + `text-foreground`): Flaeche ist in beiden Themes
      // dunkel → Kinder-Tokens (inkl. eingebetteter PricingCards) muessen die
      // Dark-Palette nutzen, sonst dunkel-auf-dunkel im Light-Mode (WCAG 1.4.3).
      className="dark relative overflow-hidden border-y border-border bg-brand-deeper text-foreground"
    >
      {/* Amber-Ambiente (Pflicht-Baustelle-Nr.-2-Signatur): warmer Radial-Schein
          oben mittig — rein dekorativ, ein einzelner Blur-Layer. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[360px] w-[680px] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand-amber),transparent_86%),transparent_65%)] blur-2xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 pt-20 sm:px-6 sm:pt-24">
        {/* Scroll-Story (Spec §6): Headline-Block baut sich scroll-gekoppelt
            auf. Die Karten darunter (eingebettete PricingCards) laufen bereits
            über ScrollScrub + TiltCard. */}
        <ScrollScrub className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionKicker
            icon={CookieIcon}
            label="Pflicht-Baustelle Nr. 2"
            tone="warn"
          />
          {/* Bewusst kleiner als die Haupt-Sektionen (Cross-Sell, nicht Kernangebot). */}
          <h2
            id="cookie-heading"
            className="mt-4 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl sm:leading-[1.12]"
          >
            Cookie &amp; Consent — die{" "}
            <span className="italic gradient-text">zweite</span> Abmahn-Front.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            §25 TDDDG ist der zwillingsstarke Bruder des BFSG: nicht-essenzielle
            Tracker und Cookies dürfen erst NACH aktiver Einwilligung laden. Wir
            messen technisch, ob Ihre Seite das einhält — statt zu raten.
          </p>
        </ScrollScrub>
      </div>
      <PricingCards
        id="cookie-pakete"
        packages={COOKIE_PACKAGES}
        title="Zwei Pakete — eine technische Wahrheit."
        subtitle="Welche Tracker feuern wirklich vor Consent? Was setzt Cookies? Wir prüfen mit echtem Browser und liefern Belege."
        kicker="Cookie-Check"
        showAnnualToggle={false}
        // Cookie-Featured-Karte (Cookie-Profi) in Amber statt Orange —
        // „Pflicht-Baustelle Nr. 2"-Signatur des Designs (Rahmen, Pill, CTA amber).
        accent="amber"
        embedded
      />
      <p className="mx-auto mt-12 max-w-2xl px-6 pb-20 text-center text-xs text-muted-foreground sm:pb-24">
        Beobachtete Tracker-Requests können bei korrektem Consent Mode v2
        cookielos und zulässig sein — wir markieren diese Fälle ehrlich als
        &bdquo;manuell verifizieren&ldquo;. Keine Rechtsberatung.
      </p>
    </section>
  );
}
