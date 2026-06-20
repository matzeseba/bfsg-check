import { CookieSection } from "@/components/CookieSection";
import { CtaSection } from "@/components/CtaSection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingCards } from "@/components/PricingCards";
import { RiskBand } from "@/components/RiskBand";
import { StatsBar } from "@/components/StatsBar";
import { Testimonials } from "@/components/Testimonials";
import { TrustSection } from "@/components/TrustSection";

export default function Home() {
  return (
    <>
      <Hero />
      <RiskBand />
      <HowItWorks />
      <StatsBar />
      <Testimonials />
      <PricingCards />
      <TrustSection />
      <CookieSection />
      <FAQAccordion />
      <CtaSection />
    </>
  );
}
