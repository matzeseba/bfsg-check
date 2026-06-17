import { CookieIcon } from "lucide-react";

import { COOKIE_PACKAGES } from "@/lib/config";

import { PricingCards } from "./PricingCards";

export function CookieSection() {
  return (
    <section
      id="cookie"
      aria-labelledby="cookie-heading"
      className="relative overflow-hidden bg-muted/40"
    >
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-0 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-amber/40 bg-brand-amber/10 px-3 py-1 text-xs font-medium text-brand-indigo">
            <CookieIcon className="size-3.5 text-brand-amber" />
            Pflicht-Baustelle Nr. 2
          </span>
          <h2
            id="cookie-heading"
            className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          >
            Cookie &amp; Consent — die{" "}
            <span className="gradient-text">zweite Front</span> der
            Abmahn-Welle.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            §25 TDDDG ist der zwillingsstarke Bruder des BFSG: nicht-essenzielle
            Tracker und Cookies dürfen erst NACH aktiver Einwilligung laden. Wir
            messen technisch, ob Ihre Seite das einhält — statt zu raten.
          </p>
        </div>
      </div>
      <PricingCards
        id="cookie-pakete"
        packages={COOKIE_PACKAGES}
        title="Zwei Pakete — eine technische Wahrheit."
        subtitle="Welche Tracker feuern wirklich vor Consent? Was setzt Cookies? Wir prüfen mit echtem Browser und liefern Belege."
        kicker="Cookie-Check"
        showAnnualToggle={false}
      />
      <p className="mx-auto max-w-3xl px-6 pb-16 text-center text-xs text-muted-foreground">
        Beobachtete Tracker-Requests können bei korrektem Consent Mode v2
        cookielos und zulässig sein — wir markieren diese Fälle ehrlich als
        &bdquo;manuell verifizieren&ldquo;. Keine Rechtsberatung.
      </p>
    </section>
  );
}
