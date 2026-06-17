import { CookieSection } from "@/components/CookieSection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Hero } from "@/components/Hero";
import { PricingCards } from "@/components/PricingCards";
import { TrustSection } from "@/components/TrustSection";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustSection />
      <PricingCards />
      <CookieSection />
      <FAQAccordion />
    </>
  );
}
