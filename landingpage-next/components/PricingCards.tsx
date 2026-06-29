"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import {
  ArrowRightIcon,
  CheckIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TagIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PACKAGES,
  PLAN_FINDER,
  PRICING_ANCHOR,
  type PackageConfig,
  type PackageId,
} from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/lib/checkout-context";

import { SectionKicker } from "./SectionKicker";

// Marken-Akzent der Featured-Karte/Highlights (rein optisch):
//  - "orange" = Haupt-Pricing (Profi) — Marken-Akzentfarbe.
//  - "amber"  = Cookie-Sektion (Cookie-Profi) — Pflicht-Baustelle-Nr.-2-Signatur.
// Die Action-CTA der Featured-Karte folgt: orange-Theme → Mint-CTA,
// amber-Theme → Amber-CTA (gemäß Design). Steuert NUR Klassen, keine Logik.
type AccentTone = "orange" | "amber";

type PricingCardsProps = {
  packages?: PackageConfig[];
  title?: string;
  // Optionales Italic-Akzentwort in der Headline (Editorial-Rhythmus). Wird nur
  // kursiv gesetzt, wenn es im title vorkommt.
  titleAccent?: string;
  subtitle?: string;
  kicker?: string;
  kickerIcon?: LucideIcon;
  id?: string;
  showAnnualToggle?: boolean;
  // true = innerhalb einer Sektion mit eigenem Header gerendert (z.B. CookieSection).
  // Dann kein eigenes Top-Padding, damit der Vertikalrhythmus symmetrisch bleibt.
  embedded?: boolean;
  // Optischer Marken-Akzent der Featured-Karte (siehe AccentTone). Default Orange.
  accent?: AccentTone;
};

export function PricingCards({
  packages = PACKAGES,
  title = "Ein Festpreis statt Stundensatz — Mängel finden, bevor es teuer wird.",
  titleAccent = "Festpreis",
  subtitle = "Pauschalpreis, feste Lieferung binnen weniger Stunden. Einmal prüfen — oder mit dem Re-Check dauerhaft absichern.",
  kicker = "Pakete & Preise",
  kickerIcon = TagIcon,
  id = "pakete",
  // Standardmäßig AUS: Das Backend bietet nur monatliche Abrechnung (interval:'month');
  // der Jahres-Toggle wäre rein kosmetisch und würde einen nie abgerechneten
  // Jahrespreis/Rabatt vorgaukeln (Dark-Pattern). Erst auf true setzen, wenn es ein
  // echtes Jahres-Abo im Stripe-Checkout gibt.
  showAnnualToggle = false,
  embedded = false,
  accent = "orange",
}: PricingCardsProps) {
  const { openCheckout } = useCheckout();
  const [annual, setAnnual] = React.useState(false);

  // Headline am Akzentwort splitten (erstes Vorkommen) → genau ein Italic-Wort.
  const accentIdx = titleAccent ? title.indexOf(titleAccent) : -1;
  const titlePre = accentIdx >= 0 ? title.slice(0, accentIdx) : title;
  const titlePost =
    accentIdx >= 0 ? title.slice(accentIdx + titleAccent.length) : "";

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
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* Kicker im Marken-Akzent. Orange-Theme: tone="on-light" rendert
              Icon+Text in brand-indigo (auf die Orange-Familie remapped → orange
              in BEIDEN Themes, ohne dark: auf Mint zu kippen). Amber-Theme
              (Cookie): tone="warn" = Amber-Akzent. */}
          <SectionKicker
            icon={kickerIcon}
            label={kicker}
            tone={accent === "amber" ? "warn" : "on-light"}
          />
          <h2
            id={`${id}-heading`}
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            {accentIdx >= 0 ? (
              <>
                {titlePre}
                <span className="italic gradient-text">{titleAccent}</span>
                {titlePost}
              </>
            ) : (
              title
            )}
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

        {/* „Welches Paket passt?"-Slider (nur Hauptpakete, nicht eingebettet bei
            Cookie). Reine Kaufhilfe — die echte Auswahl/der Kauf laeuft ueber den
            Checkout (openCheckout), nichts wird umgangen. */}
        {!embedded && <PlanFinder packages={packages} />}

        {/* Spaltenzahl folgt der Paketanzahl: 2 Pakete (Cookie) → zentriertes 2er-
            Grid (statt linksbuendig im 3er-Raster), 3 Pakete → volles 3er-Grid. */}
        <div
          className={`mt-12 grid items-stretch gap-6 ${
            packages.length === 2
              ? "mx-auto max-w-3xl md:grid-cols-2"
              : "md:grid-cols-3"
          }`}
        >
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
                accent={accent}
                onSelect={() => openCheckout(pkg.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Preis-Anker: faktisch + hedged („meist") — keine Garantie/Drohung. */}
        {!embedded && (
          <div className="mx-auto mt-12 flex max-w-3xl items-center gap-4 rounded-2xl border border-brand-amber/20 bg-brand-amber/[0.06] px-5 py-4">
            <ScaleIcon
              aria-hidden
              className="size-6 shrink-0 text-brand-amber"
            />
            <p className="text-sm text-foreground/85">
              {PRICING_ANCHOR.text}{" "}
              <span className="font-medium text-foreground">
                {PRICING_ANCHOR.emph}
              </span>
            </p>
          </div>
        )}

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          Alle Preise sind Gesamtpreise (keine USt-Ausweisung gem. § 19 UStG) ·
          Stripe-Checkout (Karte, SEPA, Apple/Google Pay) · Rechnung automatisch
          per E-Mail · keine versteckten Kosten.
        </p>
      </div>
    </section>
  );
}

// „Welches Paket passt?"-Slider. Empfehlung leitet sich aus den Seiten-Limits ab
// (Basis ≤5, Profi ≤25, darueber Profi + Re-Check-Hinweis). Der CTA oeffnet den
// echten Checkout fuer das empfohlene Paket (openCheckout) — keine erfundenen
// Preise: alle Werte kommen aus PACKAGES/config.ts.
function PlanFinder({ packages }: { packages: PackageConfig[] }) {
  const { openCheckout } = useCheckout();
  const [pages, setPages] = React.useState<number>(PLAN_FINDER.default);

  const basis = packages.find((p) => p.id === "basis");
  const profi = packages.find((p) => p.id === "profi");
  const isBasis = pages <= 5;
  const rec = isBasis ? (basis ?? profi) : profi;
  const recName = rec?.name ?? "BFSG-Report Profi";
  const recId = (rec?.id ?? "profi") as PackageId;
  const recSub = isBasis
    ? `Bis 5 Unterseiten · ${basis?.price ?? "129 €"} einmalig`
    : pages <= 25
      ? `Bis 25 Unterseiten · ${profi?.price ?? "399 €"} einmalig`
      : "Profi (25 Seiten) + Re-Check fürs laufende Monitoring";

  return (
    // Plan-Finder-Panel im Marken-Orange (Design: orange-getoenter Verlauf +
    // orange Hairline). bg via brand-orange/[0.06] auf der Card-Flaeche.
    <div className="mx-auto mt-10 grid max-w-3xl gap-6 rounded-3xl border border-brand-orange/20 bg-gradient-to-br from-brand-orange/[0.08] to-card/70 p-6 shadow-card-soft backdrop-blur sm:grid-cols-[1.5fr_1fr] sm:items-center sm:gap-8 dark:ring-1 dark:ring-brand-orange/10">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="plan-finder"
            className="font-display text-base font-semibold tracking-tight"
          >
            {PLAN_FINDER.kicker}
          </label>
          {/* „N Unterseiten"-Chip in Orange (Design-Akzent, nicht Action). */}
          <span className="rounded-md border border-brand-orange/30 bg-brand-orange/10 px-2.5 py-1 font-mono text-xs font-medium text-brand-orange tabular-nums">
            {pages}
            {pages >= PLAN_FINDER.max ? "+" : ""} {PLAN_FINDER.unit}
          </span>
        </div>
        <input
          id="plan-finder"
          type="range"
          min={PLAN_FINDER.min}
          max={PLAN_FINDER.max}
          value={pages}
          onChange={(e) => setPages(Number(e.target.value))}
          aria-valuetext={`${pages} ${PLAN_FINDER.unit} — Empfehlung: ${recName}`}
          className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-brand-orange"
        />
        <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>1</span>
          <span>20</span>
          <span>40+</span>
        </div>
      </div>
      <div className="sm:border-l sm:border-brand-orange/15 sm:pl-8">
        <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
          {PLAN_FINDER.recommendationLabel}
        </p>
        {/* Empfohlener Paketname in Marken-Orange (Design: rec in #ED6A33). */}
        <p className="mt-1 font-display text-lg font-semibold tracking-tight text-brand-orange">
          {recName}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{recSub}</p>
        <Button
          onClick={() => openCheckout(recId)}
          size="sm"
          className="mt-3 h-10 w-full gap-1.5 rounded-xl bg-brand-mint text-sm font-semibold text-brand-deep hover:bg-brand-mint/85 focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {recName} wählen
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function PricingCard({
  pkg,
  annual,
  accent,
  onSelect,
}: {
  pkg: PackageConfig;
  annual: boolean;
  accent: AccentTone;
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

  // Marken-Akzent-Klassen pro Tone (rein optisch). Orange = Haupt-Pricing,
  // Amber = Cookie. Die Featured-Action-CTA folgt dem Design: Orange-Theme →
  // Mint-CTA (Profi), Amber-Theme → Amber-CTA (Cookie-Profi).
  const isAmber = accent === "amber";
  const A = isAmber
    ? {
        tag: "text-brand-amber",
        price: "text-brand-amber",
        border: "border-[1.5px] border-brand-amber/40",
        gradient: "bg-gradient-to-b from-brand-amber/[0.08] to-card",
        glow: "bg-brand-amber/20",
        ring: "border-brand-amber",
        pill: "bg-brand-amber text-brand-deep",
        check: "bg-brand-amber/15 text-brand-amber",
        cta: "bg-brand-amber text-brand-deep hover:bg-brand-amber/85 focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
      }
    : {
        tag: "text-brand-orange",
        price: "text-brand-orange",
        border: "border-[1.5px] border-brand-orange/40",
        gradient: "bg-gradient-to-b from-brand-orange/10 to-card",
        glow: "bg-brand-orange/20",
        ring: "border-brand-orange",
        pill: "bg-brand-orange text-brand-deep",
        // Haken bleiben Mint (Erfolgsfarbe) auch in der Featured-Karte.
        check: "bg-brand-mint/20 text-brand-mint",
        cta: "bg-brand-mint text-brand-deep hover:bg-brand-mint/85 focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      };

  return (
    // Aeusserer Wrapper OHNE overflow-hidden, damit die "Empfohlen"-Pill + der
    // Warn-Puls-Ring oben/aussen ueberstehen duerfen. Die Card selbst clippt
    // (overflow-hidden) nur ihre dekorativen Inneren (Glow + Verlaufskante).
    <div className="relative h-full">
      {/* Warn-Puls-Ring um die Featured-Karte (Design-Signatur, dekorativ →
          reduced-motion stellt animate-warn-pulse still). */}
      {pkg.featured && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-[-2px] z-10 rounded-[calc(var(--radius-3xl)+2px)] border-2 opacity-70 animate-warn-pulse",
            A.ring,
          )}
        />
      )}
      {pkg.featured && (
        <Badge
          className={cn(
            "absolute -top-3 left-1/2 z-20 -translate-x-1/2 gap-1 px-3 py-1 text-[11px] font-bold tracking-wide uppercase shadow-card-soft",
            A.pill,
          )}
          variant="default"
        >
          <SparklesIcon className="size-3" />
          Empfohlen
        </Badge>
      )}
      <div
        className={cn(
          "group/card relative flex h-full flex-col overflow-hidden rounded-3xl p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1.5",
          pkg.featured
            ? cn(A.border, A.gradient, "shadow-elevated hover:shadow-elevated")
            : "border border-border/70 bg-card/85 shadow-card-soft hover:shadow-card-hover",
        )}
      >
        {pkg.featured && (
          <>
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-24 -right-24 size-64 rounded-full blur-[70px]",
                A.glow,
              )}
            />
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
                isAmber ? "via-brand-amber/60" : "via-brand-orange/60",
              )}
            />
          </>
        )}

        <div className="relative">
        <p
          className={cn(
            "font-mono text-xs font-semibold tracking-[0.18em] uppercase",
            pkg.featured ? A.tag : "text-muted-foreground",
          )}
        >
          {pkg.tag}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
          {pkg.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>

        <div className="mt-6 flex items-baseline gap-1">
          <span
            className={cn(
              "font-display text-5xl font-bold tracking-tight tabular-nums",
              pkg.featured ? A.price : "text-foreground",
            )}
          >
            {displayedPrice}
          </span>
          {displayedSuffix && (
            <span className="text-sm font-medium text-muted-foreground">
              {displayedSuffix}
            </span>
          )}
        </div>
        {isSub && annual && (
          <p className="mt-1 text-xs font-medium text-brand-orange">
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
                  ? A.check
                  : "bg-brand-mint/15 text-brand-mint",
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
                ? A.cta
                : // Nicht-Featured: creme-getoenter Outline-Button (Design:
                  // dezente Sekundaer-Aktion, kein Mint-/Orange-Vollton).
                  "border border-[oklch(0.97_0.004_95)]/12 bg-[oklch(0.97_0.004_95)]/[0.06] text-foreground hover:bg-[oklch(0.97_0.004_95)]/10 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            )}
          >
            {isSub ? "Abo starten" : "Paket kaufen"}
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
