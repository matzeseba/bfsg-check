import { CookieSection } from "@/components/CookieSection";
import { CtaSection } from "@/components/CtaSection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Hero } from "@/components/Hero";
import { HomeJsonLd } from "@/components/JsonLd";
import { HowItWorks } from "@/components/HowItWorks";
import { LogoCloud } from "@/components/LogoCloud";
import { PricingCards } from "@/components/PricingCards";
import { RiskBand } from "@/components/RiskBand";
import { StatsBar } from "@/components/StatsBar";
import { Testimonials } from "@/components/Testimonials";
import { TrustSection } from "@/components/TrustSection";
import { WowCounter } from "@/components/WowCounter";

// Conversion-Dramaturgie: Schmerz (RiskBand) → Mechanismus (HowItWorks) →
// Anchoring/Differenzierung (Testimonials) → Autorität (StatsBar) → Proof-
// Höhepunkt (WowCounter) → Risk-Reversal (TrustSection, direkt vor dem Preis) →
// Entscheidung (Pricing) → Cross-Sell (Cookie) → Resteinwände (FAQ) → Final-CTA.
export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <Hero />
      <LogoCloud />
      <RiskBand />
      <HowItWorks />
      <Testimonials />
      <StatsBar />
      <WowCounter />
      <TrustSection />
      <PricingCards />
      <CookieSection />
      <FAQAccordion />
      <CtaSection />
    </>
  );
}
