import { CookieSection } from "@/components/CookieSection";
import { CtaSection } from "@/components/CtaSection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LogoCloud } from "@/components/LogoCloud";
import { PricingCards } from "@/components/PricingCards";
import { StatsBar } from "@/components/StatsBar";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <LogoCloud />
      <HowItWorks />
      <StatsBar />
      <PricingCards />
      <Testimonials />
      <CookieSection />
      <FAQAccordion />
      <CtaSection />
    </>
  );
}
