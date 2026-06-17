import { COOKIE_PACKAGES } from "@/lib/config";

import { PricingCards } from "./PricingCards";

export function CookieSection() {
  return (
    <div className="w-full bg-muted/40">
      <PricingCards
        id="cookie"
        packages={COOKIE_PACKAGES}
        title="Cookie- & Consent-Check (§ 25 TDDDG)"
        subtitle="Pflichtbaustelle Nr. 2 neben dem BFSG: laden Tracker und nicht notwendige Cookies erst NACH Einwilligung? Wir messen es technisch — statt zu raten."
      />
      <p className="mx-auto max-w-3xl px-6 pb-12 text-center text-xs text-muted-foreground">
        Beobachtete Tracker-Requests können bei korrektem Consent Mode v2
        cookielos und zulässig sein — wir markieren diese Fälle ehrlich als
        &bdquo;manuell verifizieren&ldquo;. Keine Rechtsberatung.
      </p>
    </div>
  );
}
