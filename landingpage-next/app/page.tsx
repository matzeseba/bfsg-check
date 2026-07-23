import { Comparison } from "@/components/Comparison";
import { CookieSection } from "@/components/CookieSection";
import { CtaSection } from "@/components/CtaSection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FounderSection } from "@/components/FounderSection";
import { Hero } from "@/components/Hero";
import { HomeJsonLd } from "@/components/JsonLd";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingCards } from "@/components/PricingCards";
import { RecheckSection } from "@/components/RecheckSection";
import { RiskBand } from "@/components/RiskBand";
import { RuleTicker } from "@/components/RuleTicker";
import { StatsBar } from "@/components/StatsBar";
import { Testimonials } from "@/components/Testimonials";
import { RECHECK_TIERS_VISIBLE } from "@/lib/config";

// Conversion-Dramaturgie (PAS — Problem, Agitate, Solve): Hero → Schmerz/Frist
// (RiskBand + Countdown) → Trust-Strip (StatsBar) → Live-Regel-Ticker als schmales
// Band darunter → Mechanismus (HowItWorks) → sachlicher Direktvergleich
// (Comparison) → Warum wir (Testimonials) → Entscheidung (Pricing + Plan-Finder) →
// Cross-Sell (Cookie) → Resteinwände (FAQ) → Final-CTA. Die Frist traegt allein die
// AnnouncementBar + RiskBand (Hero-Pill = Produktwert). Alle Funktionen (Scan,
// Checkout, JsonLd) bleiben 1:1 in den Komponenten.
export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <Hero />
      {/* Ticker direkt unter dem Hero (Owner-Wunsch 04.07.): der laufende
          WCAG-Streifen entschärft den harten Übergang zwischen Hero-Grid-Muster
          und schwarzem Grund. Komponente ist aria-hidden + id-frei → die zweite
          Instanz weiter unten (nach StatsBar) bleibt unverändert bestehen. */}
      <RuleTicker />
      <RiskBand />
      <StatsBar />
      <RuleTicker />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <FounderSection />
      <PricingCards />
      {/* Re-Check-Tier-Sektion (agent-01, ENTWURF): erst beim Launch sichtbar
          (RECHECK_TIERS_VISIBLE in lib/config.ts = Spiegel des Server-Flags
          ABO_TIERS_ENABLED). Vorher bleibt die Seite exakt wie bisher. */}
      {RECHECK_TIERS_VISIBLE ? <RecheckSection /> : null}
      <CookieSection />
      <FAQAccordion />
      <CtaSection />
    </>
  );
}
