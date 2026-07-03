import { Comparison } from "@/components/Comparison";
import { CookieSection } from "@/components/CookieSection";
import { CtaSection } from "@/components/CtaSection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FounderSection } from "@/components/FounderSection";
import { Hero } from "@/components/Hero";
import { HomeJsonLd } from "@/components/JsonLd";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingCards } from "@/components/PricingCards";
import { RiskBand } from "@/components/RiskBand";
import { RuleTicker } from "@/components/RuleTicker";
import { StatsBar } from "@/components/StatsBar";
import { Testimonials } from "@/components/Testimonials";

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
      <RiskBand />
      <StatsBar />
      <RuleTicker />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <FounderSection />
      <PricingCards />
      <CookieSection />
      <FAQAccordion />
      <CtaSection />
    </>
  );
}
