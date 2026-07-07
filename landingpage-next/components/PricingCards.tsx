"use client";

import * as React from "react";
import Image from "next/image";
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
import { MagneticButton } from "@/components/fx/MagneticButton";
import { ScrollScrub } from "@/components/fx/ScrollScrub";
import { TiltCard } from "@/components/fx/TiltCard";
import {
  PACKAGES,
  PLAN_FINDER,
  PRICING_ANCHOR,
  type PackageConfig,
  type PackageId,
} from "@/lib/config";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/lib/checkout-context";

import { SectionKicker } from "./SectionKicker";

// Cent-Betrag → deutsches Preisformat ("50,88 €"). Nur für ABGELEITETE Angaben
// (Ersparnis aus zwei festen Config-Preisen) — Paketpreise selbst kommen IMMER
// als fertige Strings aus lib/config.ts.
function formatEur(cents: number): string {
  return `${(cents / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

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
  subtitle = "Pauschalpreis, Lieferung in der Regel innerhalb weniger Stunden — jeder Report wird vor dem Versand persönlich geprüft. Einmal prüfen — oder mit dem Re-Check dauerhaft absichern.",
  kicker = "Pakete & Preise",
  kickerIcon = TagIcon,
  id = "pakete",
  // AN seit W1-G: Das Backend rechnet die Jahresoption echt ab (scanner/app.js
  // 'abo-jahr', interval:'year', 249 €/Jahr) — der Toggle zeigt also einen real
  // buchbaren Preis. Historie: war aus, solange nur interval:'month' existierte
  // (ein rein kosmetischer Toggle hätte einen nie abgerechneten Rabatt vorgegaukelt).
  // Alle Anzeige-Preise kommen aus lib/config.ts (annualPrice) — NIE berechnen.
  showAnnualToggle = true,
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

  // Der Monatlich/Jaehrlich-Toggle ergibt nur Sinn, wenn ein KAUFBARES Abo MIT
  // Jahresoption angezeigt wird. Bei reinen Einmal-Paketen (Basis/Profi/Cookie)
  // tut er nichts und wirkt mit einem Rabatt-Badge sogar irrefuehrend. Ist das
  // Abo deaktiviert (available:false) oder ohne annual*-Config, bleibt er aus.
  const subWithAnnual = packages.find(
    (p) =>
      p.mode === "subscription" &&
      p.available !== false &&
      p.annualId != null &&
      p.annualAmountCents != null &&
      p.annualPrice != null,
  );
  const showToggle = showAnnualToggle && !!subWithAnnual;
  // Ersparnis = Differenz der beiden FESTEN Config-Preise (12 Monatsbeiträge vs.
  // Jahrespreis), de-DE-formatiert — kein frei erfundener Rabatt (UWG/PAngV).
  const annualSavings = subWithAnnual?.annualAmountCents
    ? formatEur(subWithAnnual.amountCents * 12 - subWithAnnual.annualAmountCents)
    : null;

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
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          {/* Kicker im Marken-Akzent: Standard-Glow-Pill (tone=default), im
              Amber-Kontext (Cookie-Pflicht) die Warn-Variante. */}
          <SectionKicker
            icon={kickerIcon}
            label={kicker}
            tone={accent === "amber" ? "warn" : "default"}
          />
          <h2
            id={`${id}-heading`}
            className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
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

          {/* Desktop-Instanz des Toggles: zentriert über allen 3 Karten — dort
              ist die Abo-Karte im md:grid-cols-3 gleichzeitig sichtbar. Mobil
              (einspaltig, Abo-Karte zuletzt) sähe man hier keinen Effekt →
              zweite Instanz direkt über der Abo-Karte (s. Karten-Loop unten). */}
          {showToggle && (
            <BillingToggle
              annual={annual}
              setAnnual={setAnnual}
              savings={annualSavings}
              className="mt-6 hidden md:inline-flex"
            />
          )}
        </motion.div>

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
            // Scroll-Story (Spec §6): Karten bauen sich scroll-gekoppelt auf
            // (ScrollScrub, gestaffelt über fromX 0/20/40) und neigen sich dem
            // Cursor entgegen (TiltCard — fängt nur pointermove, die Checkout-
            // Buttons in der Karte bleiben voll klickbar).
            <ScrollScrub
              key={pkg.id}
              from={64}
              fromX={i * 20}
              className="relative"
            >
              {/* Mobil-Instanz des Toggles: direkt über der Abo-Karte, deren
                  Preis er umschaltet (Desktop-Instanz sitzt im Header, beide
                  teilen denselben annual-State). */}
              {showToggle && pkg.id === subWithAnnual?.id && (
                <div className="md:hidden mb-4 flex justify-center">
                  <BillingToggle
                    annual={annual}
                    setAnnual={setAnnual}
                    savings={annualSavings}
                  />
                </div>
              )}
              <TiltCard max={pkg.featured ? 6 : 5} className="h-full">
                <PricingCard
                  pkg={pkg}
                  annual={annual}
                  accent={accent}
                  // Jahres-Toggle aktiv + Paket hat eine Jahres-Variante → das
                  // Backend-Paket 'abo-jahr' in den Checkout geben, sonst wie gehabt.
                  onSelect={() =>
                    openCheckout(annual && pkg.annualId ? pkg.annualId : pkg.id)
                  }
                />
              </TiltCard>
            </ScrollScrub>
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

// Monatlich/Jährlich-Pill. Wird ZWEIMAL gerendert (EIN gemeinsamer annual-State
// in PricingCards): Desktop im Sektions-Header, mobil direkt über der Abo-Karte
// — Markup/Verhalten identisch, nur die Position unterscheidet sich per
// Breakpoint (className). Ein Klick wirkt in beiden Instanzen.
function BillingToggle({
  annual,
  setAnnual,
  savings,
  className,
}: {
  annual: boolean;
  setAnnual: (v: boolean) => void;
  savings: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/70 p-1 shadow-card-soft backdrop-blur",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setAnnual(false)}
        aria-pressed={!annual}
        className={cn(
          "inline-flex min-h-11 items-center rounded-full px-5 text-xs font-medium transition-colors",
          // Aktiver Zustand im Orange-Selected-State (Dark-Glow-Vorlagen);
          // #2b1206 auf #f4641e ist AA (~4.9:1).
          !annual
            ? "bg-primary text-primary-foreground"
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
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Jährlich
        {savings && (
          <span className="rounded-full bg-brand-mint px-1.5 py-0.5 text-[10px] font-semibold text-brand-deep">
            spart {savings}
          </span>
        )}
      </button>
    </div>
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
    // Plan-Finder-Panel als Glas-Card mit Orange-Glow-Rahmen (.glow-card =
    // Standard-Kartensprache des Dark-Glow-Redesigns). Logik unveraendert.
    <div className="glow-card mx-auto mt-10 grid max-w-3xl gap-6 rounded-3xl p-6 sm:grid-cols-[1.5fr_1fr] sm:items-center sm:gap-8">
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
          // Track deutlich sichtbar (bg-muted war im Light-Mode fast unsichtbar,
          // WCAG 1.4.11-Risiko): foreground-Alpha kontrastiert in beiden Themes.
          className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/20 accent-brand-orange"
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
        <MagneticButton className="mt-3 w-full">
          <button
            type="button"
            onClick={() => openCheckout(recId)}
            className="btn-cta min-h-11 w-full text-sm"
          >
            {recName} wählen
            <ArrowRightIcon className="size-4" />
          </button>
        </MagneticButton>
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
  // Annual-Toggle ist nur fuer Subscriptions MIT konfigurierter Jahres-Variante
  // relevant. Der Jahrespreis kommt als FESTER String aus der Config (annualPrice,
  // z.B. "249 €") — frueher stand hier Math.round(monthly*10), was 250 € angezeigt
  // haette: Anzeige-Preise werden NIE berechnet (Quelle: scanner/app.js 'abo-jahr').
  const isSub = pkg.mode === "subscription";
  // available === false → beworben, aber noch nicht kaufbar (z.B. Abo-Gate Backend).
  const comingSoon = pkg.available === false;
  const hasAnnual =
    isSub && pkg.annualPrice != null && pkg.annualAmountCents != null;
  const showAnnual = hasAnnual && annual;
  const displayedPrice = showAnnual ? pkg.annualPrice : pkg.price;
  const displayedSuffix = isSub
    ? showAnnual
      ? "/Jahr"
      : (pkg.priceSuffix ?? "/Monat")
    : pkg.priceSuffix;
  // Ersparnis ggü. 12 Monatsbeiträgen — abgeleitet aus den beiden festen
  // Config-Preisen, de-DE-formatiert (kein roher Float wie "50.88000000000001").
  const annualSavings =
    showAnnual && pkg.annualAmountCents != null
      ? formatEur(pkg.amountCents * 12 - pkg.annualAmountCents)
      : null;

  // Marken-Akzent-Klassen pro Tone (rein optisch). Orange = Haupt-Pricing,
  // Amber = Cookie. Die Kartenflaeche ist jetzt einheitlich die .glow-card
  // (Glas + Verlaufs-Rahmen) — der Tone steuert nur noch --glow-color, Tag-/
  // Preis-Farbe, Puls-Ring und Badge. Haken sind IMMER Mint (Erfolgsfarbe).
  const isAmber = accent === "amber";
  const A = isAmber
    ? {
        tag: "text-brand-amber",
        price: "text-brand-amber",
        ring: "border-brand-amber",
        pill: "bg-brand-amber text-brand-deep",
        glowColor: "var(--brand-amber)",
      }
    : {
        tag: "text-brand-orange",
        price: "text-brand-orange",
        ring: "border-brand-orange",
        // Empfohlen-Badge = Amber (Design Z.459: #ffb454) — dunkler Text darauf ist
        // AA-sicher (orange-Fläche wäre zu kontrastarm).
        pill: "bg-brand-amber text-brand-deep",
        glowColor: "var(--brand-orange)",
      };

  return (
    // Aeusserer Wrapper OHNE overflow-hidden, damit die "Empfohlen"-Pill + der
    // Warn-Puls-Ring oben/aussen ueberstehen duerfen. Die Card selbst clippt
    // (overflow-hidden) nur ihre dekorativen Inneren (Glow + Verlaufskante).
    // Featured-Karte steht leicht groesser/hoeher im Raster (Premium-Pricing-
    // Geste der Vorlagen) — transform-only, kein Layout-Shift.
    <div
      className={cn(
        "relative h-full",
        // .glow-ring liegt auf dem Wrapper (nicht der Card), damit der
        // card-lift-Hover-Schatten den Orange-Aussenschein nicht ueberschreibt.
        pkg.featured &&
          "glow-ring rounded-3xl md:-translate-y-1 md:scale-[1.03]",
      )}
    >
      {/* Schwebendes Fuchs-Wappen oben rechts (dekorativ). Ragt leicht über die
          Kartenkante, sitzt rechts → überlappt NICHT die zentrale „Empfohlen"-
          Badge. Featured-Karte etwas größer. animate-float-slow ist
          reduced-motion-gated. */}
      <Image
        src="/logo-fox.png"
        alt=""
        aria-hidden
        width={96}
        height={144}
        loading="lazy"
        className={cn(
          "pointer-events-none absolute -top-5 right-4 z-20 h-auto animate-float-slow drop-shadow-[0_8px_14px_rgba(0,0,0,0.5)]",
          pkg.featured ? "w-16 sm:w-20" : "w-14 sm:w-16",
        )}
      />
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
      {/* Kartenflaeche = .glow-card (Glas + Orange-/Amber-Verlaufs-Rahmen),
          Hover via .card-lift; Featured zusaetzlich mit .glow-ring-Aussenschein. */}
      <div
        style={{ "--glow-color": A.glowColor } as React.CSSProperties}
        className="glow-card card-lift group/card relative flex h-full flex-col overflow-hidden rounded-3xl p-7"
      >
        {pkg.featured && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
              isAmber ? "via-brand-amber/60" : "via-brand-orange/60",
            )}
          />
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
          {/* Preis in Mono gross (Vorlagen-Typo); Featured-Preis leuchtet
              zusaetzlich per .text-glow (Akzentzahl, kein Fliesstext). */}
          <span
            className={cn(
              "font-mono text-5xl font-bold tracking-tight tabular-nums",
              pkg.featured ? cn(A.price, "text-glow") : "text-foreground",
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
        {annualSavings && (
          <p className="mt-1 text-xs font-medium text-brand-orange">
            Sie sparen {annualSavings} im Vergleich zur Monatszahlung
          </p>
        )}
        {!isSub && (
          <p className="mt-1 text-xs text-muted-foreground">
            einmalig · keine USt (§ 19 UStG)
          </p>
        )}
        {/* Mengen-Anker (z.B. Profi): rahmt den Pauschalpreis als Preis-pro-Seite. */}
        {pkg.anchorNote && (
          <p className="mt-1.5 font-mono text-xs tabular-nums text-brand-orange/90">
            {pkg.anchorNote}
          </p>
        )}
      </div>

      <ul className="relative mt-8 grid flex-1 gap-3 text-sm">
        {(showAnnual && pkg.annualFeatures
          ? pkg.annualFeatures
          : pkg.features
        ).map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            {/* Feature-Haken einheitlich in Mint (Erfolgsfarbe) — auch in der
                Featured- und Amber-Karte. */}
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
        ) : pkg.featured ? (
          // Featured-Karte: orange 3D-Haupt-CTA (.btn-cta), magnetisch.
          <MagneticButton className="w-full">
            <button
              type="button"
              onClick={onSelect}
              className="btn-cta h-11 w-full text-sm"
            >
              {isSub ? "Abo starten" : "Paket kaufen"}
              <ArrowRightIcon className="size-4" />
            </button>
          </MagneticButton>
        ) : (
          // Nicht-Featured: creme-getoenter Outline-Button (Design: dezente
          // Sekundaer-Aktion, kein Mint-/Orange-Vollton).
          <Button
            onClick={onSelect}
            size="lg"
            className="h-11 w-full gap-1.5 rounded-xl border border-foreground/15 bg-foreground/[0.06] text-sm font-semibold text-foreground transition-transform hover:scale-[1.015] hover:bg-foreground/10 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {isSub ? "Abo starten" : "Paket kaufen"}
            <ArrowRightIcon className="size-4" />
          </Button>
        )}
        {pkg.moneyBack && (
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-brand-mint/8 px-2.5 py-1.5 text-xs text-muted-foreground">
            <ShieldCheckIcon className="size-3.5 shrink-0 text-brand-mint" />
            {/* Jahres-Ansicht: Kündigungs-Konditionen des Jahres-Abos (§ 309 Nr. 9
                BGB), nicht die "zum Monatsende"-Zusage des Monats-Abos. */}
            {showAnnual ? (pkg.annualMoneyBack ?? pkg.moneyBack) : pkg.moneyBack}
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
