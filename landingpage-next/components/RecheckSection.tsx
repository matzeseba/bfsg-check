"use client";

import * as React from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  InfoIcon,
  ShieldCheckIcon,
} from "lucide-react";

import {
  RECHECK_BANNER,
  RECHECK_GATE_NOTE,
  RECHECK_PACKAGES,
  RECHECK_SECTION,
  RECHECK_STARTPAKET_CARD,
  STARTPAKET_PACKAGES,
} from "@/lib/config";
import { useCheckout } from "@/lib/checkout-context";

import { PricingCards } from "./PricingCards";

// Re-Check-Tier-Sektion (agent-01, d4): Banner + 3 Tier-Karten (Starter/Pro/
// Business, Jahres-Toggle) + sachlicher Gate-Hinweis + optisch abgesetzte
// Startpaket-Karte. Wird auf der Startseite NUR bei RECHECK_TIERS_VISIBLE=true
// gerendert (Launch-Schalter in lib/config.ts, spiegelt Server-Flag
// ABO_TIERS_ENABLED) — vor dem Launch ändert sich am Live-Auftritt nichts.
export function RecheckSection() {
  const { openCheckout } = useCheckout();
  // Verfügbarkeit der Startpaket-Karte = Verfügbarkeit der transaktionalen
  // Einträge (beide hängen am selben Server-Flag → gleicher Wert, Preis-Sync-CI).
  const startpaket = STARTPAKET_PACKAGES[0];
  const comingSoon = startpaket?.available === false;

  return (
    <PricingCards
      id="recheck"
      packages={RECHECK_PACKAGES}
      kicker={RECHECK_SECTION.kicker}
      title={RECHECK_SECTION.title}
      titleAccent={RECHECK_SECTION.titleAccent}
      subtitle={RECHECK_SECTION.subline}
      banner={RECHECK_BANNER.text}
      showPlanFinder={false}
      showAnchor={false}
    >
      {/* Gate-Hinweis (d4, sachlich): das Backend erzwingt dieselbe Regel per
          Report-Gate (HTTP 409 → Startpaket), sobald ABO_TIERS_ENABLED=true. */}
      <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-2xl border border-border/60 bg-card/60 px-5 py-4">
        <InfoIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-orange" />
        <p className="text-sm text-foreground/85">{RECHECK_GATE_NOTE.text}</p>
      </div>

      {/* Startpaket-Karte (d4, exakt): EINE optisch abgesetzte Karte für beide
          Report-Varianten. Gestalt bewusst schlichter als die Tier-Karten
          (dashed Rahmen statt Glow) — „vierte, abgesetzte Karte" (d4). */}
      <div className="mx-auto mt-6 max-w-3xl">
        <div className="relative flex h-full flex-col rounded-3xl border-2 border-dashed border-brand-mint/40 bg-card/70 p-7">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-brand-mint">
            Einstieg ohne bisherigen Report
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
            {RECHECK_STARTPAKET_CARD.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {RECHECK_STARTPAKET_CARD.tagline}
          </p>
          <p className="mt-4 font-mono text-2xl font-bold tracking-tight tabular-nums">
            {RECHECK_STARTPAKET_CARD.priceLine}
          </p>
          <ul className="mt-6 grid flex-1 gap-3 text-sm">
            {RECHECK_STARTPAKET_CARD.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-mint/15 text-brand-mint"
                >
                  <CheckIcon className="size-3" strokeWidth={3} />
                </span>
                <span className="text-foreground/85">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3">
            {comingSoon ? (
              <button
                type="button"
                disabled
                aria-label={`${RECHECK_STARTPAKET_CARD.name} — bald verfügbar`}
                className="h-11 w-full cursor-not-allowed rounded-xl border border-border/70 bg-muted text-sm font-semibold text-muted-foreground opacity-90"
              >
                Bald verfügbar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openCheckout("startpaket-basis")}
                className="btn-cta h-11 w-full text-sm"
              >
                {RECHECK_STARTPAKET_CARD.cta}
                <ArrowRightIcon className="size-4" />
              </button>
            )}
            <p className="inline-flex items-center gap-1.5 rounded-lg bg-brand-mint/8 px-2.5 py-1.5 text-xs text-muted-foreground">
              <ShieldCheckIcon className="size-3.5 shrink-0 text-brand-mint" />
              Sichere Zahlung über Stripe · Rechnung sofort per E-Mail
            </p>
          </div>
        </div>
      </div>
    </PricingCards>
  );
}
