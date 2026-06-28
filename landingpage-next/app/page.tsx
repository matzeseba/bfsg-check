import { Comparison } from "@/components/Comparison";
import { CookieSection } from "@/components/CookieSection";
import { CtaSection } from "@/components/CtaSection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Hero } from "@/components/Hero";
import { HomeJsonLd } from "@/components/JsonLd";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingCards } from "@/components/PricingCards";
import { RiskBand } from "@/components/RiskBand";
import { RuleTicker } from "@/components/RuleTicker";
import { StatsBar } from "@/components/StatsBar";
import { Testimonials } from "@/components/Testimonials";

// Conversion-Dramaturgie (neues Design): Hero → Trust-Strip (StatsBar) →
// Live-Regel-Ticker → Schmerz/Frist (RiskBand + Countdown) → Mechanismus
// (HowItWorks) → Warum wir (Testimonials) → sachlicher Direktvergleich
// (Comparison) → Entscheidung (Pricing + Plan-Finder) → Cross-Sell (Cookie) →
// Resteinwände (FAQ) → Final-CTA. Alle Funktionen (Scan, Checkout, JsonLd) bleiben
// 1:1 in den Komponenten.
export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <Hero />
      <StatsBar />
      <RuleTicker />
      <RiskBand />
      <HowItWorks />
      <Testimonials />
      <Comparison />
      <PricingCards />
      <CookieSection />
      <FAQAccordion />
      <CtaSection />
    </>
  );
}
