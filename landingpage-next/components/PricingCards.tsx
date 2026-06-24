"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import {
  ArrowRightIcon,
  CheckIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PACKAGES, type PackageConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/lib/checkout-context";

type PricingCardsProps = {
  packages?: PackageConfig[];
  title?: string;
  subtitle?: string;
  kicker?: string;
  id?: string;
  showAnnualToggle?: boolean;
  // true = innerhalb einer Sektion mit eigenem Header gerendert (z.B. CookieSection).
  // Dann kein eigenes Top-Padding, damit der Vertikalrhythmus symmetrisch bleibt.
  embedded?: boolean;
};

export function PricingCards({
  packages = PACKAGES,
  title = "Ein Festpreis statt Stundensatz — Mängel finden, bevor es teuer wird.",
  subtitle = "Pauschalpreis, feste Lieferung binnen weniger Stunden. Einmal prüfen — oder mit dem Re-Check dauerhaft absichern.",
  kicker = "Pakete & Preise",
  id = "pakete",
  showAnnualToggle = true,
  embedded = false,
}: PricingCardsProps) {
  const { openCheckout } = useCheckout();
  const [annual, setAnnual] = React.useState(false);

  // Der Monatlich/Jaehrlich-Toggle ergibt nur Sinn, wenn ein KAUFBARES Abo
  // angezeigt wird. Bei reinen Einmal-Paketen (Basis/Profi/Cookie) tut er nichts
  // und wirkt mit "-2 Monate" sogar irrefuehrend. Solange das Abo deaktiviert ist
  // (available:false), blenden wir ihn aus — und zeigen ihn automatisch wieder,
  // sobald ein Abo kaufbar wird.
  const hasEnabledSub = packages.some(
    (p) => p.mode === "subscription" && p.available !== false,
  );
  const showToggle = showAnnualToggle && hasEnabledSub;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative isolate overflow-hidden",
        embedded ? "bg-transparent" : "bg-background",
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-6xl px-5 sm:px-6",
          embedded ? "pt-10 pb-0" : "py-20 sm:py-24",
        )}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-medium tracking-[0.2em] text-brand-indigo uppercase dark:text-brand-mint">
            {kicker}
          </p>
          <h2
            id={`${id}-heading`}
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            {title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            {subtitle}
          </p>

          {showToggle && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/70 p-1 shadow-card-soft backdrop-blur">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                aria-pressed={!annual}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-5 text-xs font-medium transition-colors",
                  !annual
                    ? "bg-brand-deep text-on-deep"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Monatlich
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                aria-pressed={annual}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-xs font-medium transition-colors",
                  annual
                    ? "bg-brand-deep text-on-deep"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Jährlich
                <span className="rounded-full bg-brand-mint px-1.5 py-0.5 text-[10px] font-semibold text-brand-deep">
                  −2 Monate
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <PricingCard
                pkg={pkg}
                annual={annual}
                onSelect={() => openCheckout(pkg.id)}
              />
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          Alle Preise sind Gesamtpreise (keine USt-Ausweisung gem. § 19 UStG) ·
          Stripe-Checkout (Karte, SEPA, Apple/Google Pay) · Rechnung automatisch
          per E-Mail · 30 Tage Geld-zurück bei berechtigter Reklamation.
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  pkg,
  annual,
  onSelect,
}: {
  pkg: PackageConfig;
  annual: boolean;
  onSelect: () => void;
}) {
  // Annual-Toggle ist nur fuer Subscriptions relevant — kosmetischer Rabatt.
  const isSub = pkg.mode === "subscription";
  // available === false → beworben, aber noch nicht kaufbar (z.B. Abo-Gate Backend).
  const comingSoon = pkg.available === false;
  const monthly = pkg.amountCents / 100;
  const yearly = Math.round(monthly * 10);
  const displayedPrice = isSub && annual ? `${yearly} €` : pkg.price;
  const displayedSuffix = isSub
    ? annual
      ? "/Jahr"
      : (pkg.priceSuffix ?? "/Monat")
    : pkg.priceSuffix;

  return (
    // Aeusserer Wrapper OHNE overflow-hidden, damit die "Meistgewaehlt"-Badge
    // oben ueberstehen darf. Die Card selbst clippt (overflow-hidden) nur ihre
    // dekorativen Inneren (Glow + Border-Gradient).
    <div className="relative h-full">
      {pkg.featured && (
        <Badge
          className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 gap-1 bg-brand-mint px-3 py-1 text-[11px] font-bold tracking-wide text-brand-deep uppercase shadow-glow-mint"
          variant="default"
        >
          <SparklesIcon className="size-3" />
          Empfohlen
        </Badge>
      )}
      <div
        className={cn(
          "group/card relative flex h-full flex-col overflow-hidden rounded-3xl p-7 backdrop-blur transition-all duration-300",
          pkg.featured
            ? "border-gradient bg-card shadow-elevated hover:-translate-y-1.5 hover:shadow-elevated"
            : "border border-border/70 bg-card/85 shadow-card-soft hover:-translate-y-1.5 hover:shadow-card-hover",
        )}
      >
        {pkg.featured && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-brand-mint/20 blur-[70px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-mint/60 to-transparent"
            />
          </>
        )}

        <div className="relative">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-brand-indigo uppercase dark:text-brand-mint">
          {pkg.tag}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
          {pkg.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>

        <div className="mt-6 flex items-baseline gap-1">
          <span className="font-display text-5xl font-bold tracking-tight tabular-nums text-foreground">
            {displayedPrice}
          </span>
          {displayedSuffix && (
            <span className="text-sm font-medium text-muted-foreground">
              {displayedSuffix}
            </span>
          )}
        </div>
        {isSub && annual && (
          <p className="mt-1 text-xs font-medium text-brand-indigo dark:text-brand-mint">
            Spart {monthly * 12 - yearly} € im Vergleich zur Monatszahlung
          </p>
        )}
        {!isSub && (
          <p className="mt-1 text-xs text-muted-foreground">
            einmalig · keine USt (§ 19 UStG)
          </p>
        )}
      </div>

      <ul className="relative mt-8 grid flex-1 gap-3 text-sm">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className={cn(
                "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                pkg.featured
                  ? "bg-brand-mint/20 text-brand-mint"
                  : "bg-brand-indigo/10 text-brand-indigo dark:bg-brand-mint/15 dark:text-brand-mint",
              )}
            >
              <CheckIcon className="size-3" strokeWidth={3} />
            </span>
            <span className="text-foreground/85">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-8 grid gap-3">
        {comingSoon ? (
          <Button
            type="button"
            disabled
            size="lg"
            aria-label={`${pkg.name} — bald verfügbar`}
            className="h-11 w-full cursor-not-allowed gap-1.5 rounded-xl border border-border/70 bg-muted text-sm font-semibold text-muted-foreground opacity-90"
          >
            Bald verfügbar
          </Button>
        ) : (
          <Button
            onClick={onSelect}
            size="lg"
            className={cn(
              "h-11 w-full gap-1.5 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.015]",
              pkg.featured
                ? "bg-brand-mint text-brand-deep hover:bg-brand-mint/85"
                : "bg-brand-deep text-on-deep hover:bg-brand-indigo",
            )}
          >
            {isSub ? "Abo starten" : "Jetzt bestellen"}
            <ArrowRightIcon className="size-4" />
          </Button>
        )}
        {pkg.moneyBack && (
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-brand-mint/8 px-2.5 py-1.5 text-xs text-muted-foreground">
            <ShieldCheckIcon className="size-3.5 shrink-0 text-brand-mint" />
            {pkg.moneyBack}
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
