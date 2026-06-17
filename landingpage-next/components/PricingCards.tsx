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
};

export function PricingCards({
  packages = PACKAGES,
  title = "Pakete, die zur Pflicht passen — nicht zur Beratungsrechnung.",
  subtitle = "Pauschalpreise, klare Lieferung. Einmalig prüfen oder dauerhaft absichern.",
  kicker = "Pakete & Preise",
  id = "pakete",
  showAnnualToggle = true,
}: PricingCardsProps) {
  const { openCheckout } = useCheckout();
  const [annual, setAnnual] = React.useState(false);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative isolate overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.18em] text-brand-indigo uppercase">
            {kicker}
          </p>
          <h2
            id={`${id}-heading`}
            className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            {subtitle}
          </p>

          {showAnnualToggle && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/70 p-1 shadow-card-soft backdrop-blur">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                aria-pressed={!annual}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                  !annual
                    ? "bg-brand-deep text-primary-foreground"
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
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                  annual
                    ? "bg-brand-deep text-primary-foreground"
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
              transition={{
                duration: 0.55,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "relative",
                pkg.featured && "md:-my-4",
              )}
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
          Alle Preise inkl. ges. USt. · Stripe-Checkout (Karte, SEPA, Apple/Google
          Pay) · Rechnung automatisch per E-Mail · 30 Tage Geld-zurück bei
          berechtigter Reklamation.
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
  const monthly = pkg.amountCents / 100;
  const yearly = Math.round(monthly * 10);
  const displayedPrice = isSub && annual ? `${yearly} €` : pkg.price;
  const displayedSuffix = isSub
    ? annual
      ? "/Jahr"
      : (pkg.priceSuffix ?? "/Monat")
    : pkg.priceSuffix;

  return (
    <div
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card/90 p-7 backdrop-blur transition-all duration-300",
        pkg.featured
          ? "border-brand-mint/60 shadow-card-hover ring-1 ring-brand-mint/40 md:scale-[1.03]"
          : "border-border/70 shadow-card-soft hover:-translate-y-1 hover:shadow-card-hover",
      )}
    >
      {pkg.featured && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-brand-mint/25 blur-3xl"
          />
          <Badge
            className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 bg-brand-mint px-3 py-1 text-[11px] font-bold tracking-wide text-brand-deep uppercase shadow-glow-mint"
            variant="default"
          >
            <SparklesIcon className="size-3" />
            Meistgewählt
          </Badge>
        </>
      )}

      <div className="relative">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-indigo uppercase">
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
          <p className="mt-1 text-xs text-brand-mint">
            Spart 98 € im Vergleich zur Monatszahlung
          </p>
        )}
        {!isSub && (
          <p className="mt-1 text-xs text-muted-foreground">einmalig, inkl. USt.</p>
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
                  : "bg-brand-indigo/10 text-brand-indigo",
              )}
            >
              <CheckIcon className="size-3" strokeWidth={3} />
            </span>
            <span className="text-foreground/85">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-8 grid gap-3">
        <Button
          onClick={onSelect}
          size="lg"
          className={cn(
            "h-11 w-full gap-1.5 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.015]",
            pkg.featured
              ? "bg-brand-mint text-brand-deep hover:bg-brand-mint/85"
              : "bg-brand-deep text-primary-foreground hover:bg-brand-indigo",
          )}
        >
          {isSub ? "Abo starten" : "Paket wählen"}
          <ArrowRightIcon className="size-4" />
        </Button>
        {pkg.moneyBack && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheckIcon className="size-3.5 text-brand-mint" />
            {pkg.moneyBack}
          </p>
        )}
      </div>
    </div>
  );
}
