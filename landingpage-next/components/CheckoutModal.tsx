"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PACKAGES,
  COOKIE_PACKAGES,
  ABO_ANNUAL,
  ABO_BUSINESS_ANNUAL,
  ABO_PRO_ANNUAL,
  RECHECK_PACKAGES,
  RECHECK_TIERS_VISIBLE,
  STARTPAKET_PACKAGES,
  type PackageId,
} from "@/lib/config";
import { useCheckout } from "@/lib/checkout-context";
import { cn } from "@/lib/utils";

type CustomerType = "consumer" | "business";

// Reihenfolge im Selector: Hauptangebot zuerst, dann Abo (Monat + Jahr), dann Cookie.
// ABO_ANNUAL macht 'abo-jahr' hier auflösbar (packageFor) UND direkt im Modal wählbar
// — z.B. wenn der Jahres-Toggle der Pricing-Karten den Checkout mit 'abo-jahr' öffnet.
// Tier-/Startpaket-Pakete (agent-01) kommen NUR dazu, wenn die Tier-Sektion live ist
// (RECHECK_TIERS_VISIBLE) — vor dem Launch erscheinen sie nicht einmal deaktiviert.
const ALL_PACKAGES = [
  ...PACKAGES,
  ...(RECHECK_TIERS_VISIBLE ? RECHECK_PACKAGES : []),
  ABO_ANNUAL,
  ...(RECHECK_TIERS_VISIBLE ? [ABO_PRO_ANNUAL, ABO_BUSINESS_ANNUAL] : []),
  ...(RECHECK_TIERS_VISIBLE ? STARTPAKET_PACKAGES : []),
  ...COOKIE_PACKAGES,
];

// Wählbare Re-Check-Tiers beim Startpaket (Backend-Feld `tier`, Default Starter
// 'abo' — scanner/app.js STARTPAKET_TIERS). Quelle = RECHECK_PACKAGES (SSOT).
const STARTPAKET_TIER_OPTIONS = RECHECK_PACKAGES.filter((p) =>
  ["abo", "abo-pro", "abo-business"].includes(p.id),
);

function isStartpaket(id: PackageId | null | undefined) {
  return id === "startpaket-basis" || id === "startpaket-profi";
}

function packageFor(id: PackageId | null) {
  return ALL_PACKAGES.find((p) => p.id === id) ?? null;
}

// Sinnvollster Default, wenn der Aufrufer kein Paket vorgibt (z.B. Hero-CTA ohne Kontext).
const DEFAULT_PKG: PackageId = "profi";

export function CheckoutModal() {
  const { state, closeCheckout, setUrl: pushUrl } = useCheckout();

  // Lokale Auswahl im Modal: wird beim Open mit dem vom Aufrufer gewuenschten
  // Paket seeded (oder DEFAULT_PKG), kann aber im Modal frei gewechselt werden.
  // setState-during-render-Pattern (dokumentiert in React 19,
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders),
  // weil Next 16 setState in useEffect verbietet und ref-write im Render ebenfalls.
  const [selectedPkgId, setSelectedPkgId] = React.useState<PackageId>(
    state.pkg ?? DEFAULT_PKG,
  );
  const [email, setEmail] = React.useState("");
  const [customerType, setCustomerType] = React.useState<CustomerType | null>(
    null,
  );
  const [consent, setConsent] = React.useState(false);
  const [company, setCompany] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  // Re-Check-Tier beim Startpaket (agent-01, d4: „Tier Ihrer Wahl"). Default
  // Starter — das Backend validiert gegen STARTPAKET_TIERS.
  const [selectedTier, setSelectedTier] = React.useState<PackageId>("abo");

  const [lastOpen, setLastOpen] = React.useState(state.open);
  if (state.open !== lastOpen) {
    setLastOpen(state.open);
    if (state.open) {
      // Frischer Vorgang: Auswahl seeden UND personenbezogene Felder leeren,
      // damit keine E-Mail/Kundentyp/Einwilligung aus einem vorigen Öffnen
      // (ggf. anderes Paket/anderer Vorgang) stehen bleibt (stale Consent).
      setSelectedPkgId(state.pkg ?? DEFAULT_PKG);
      setEmail("");
      setCustomerType(null);
      setConsent(false);
      setCompany("");
      setSelectedTier("abo");
    }
  }

  const pkg = packageFor(selectedPkgId);

  // URL ist die Quelle der Wahrheit im Checkout-Context — kein lokales Mirror-State.
  const url = state.url;
  const setUrl = pushUrl;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pkg) return;
    if (pkg.available === false) {
      toast.error(`${pkg.name} ist noch nicht buchbar — wir informieren Sie zum Start.`);
      return;
    }
    if (!url) {
      toast.error("Bitte Website-Adresse angeben.");
      return;
    }
    if (!email) {
      toast.error("Bitte E-Mail-Adresse angeben.");
      return;
    }
    if (!customerType) {
      toast.error("Bitte wählen: Verbraucher oder Unternehmer.");
      return;
    }
    if (customerType === "consumer" && !consent) {
      toast.error(
        "Bitte bestätigen Sie die Zustimmung zur sofortigen Ausführung (Widerruf erlischt).",
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          pkg: pkg.id,
          email,
          customerType,
          consent,
          company: customerType === "business" ? company.trim() : "",
          // Startpaket (agent-01, d10.2): gewähltes Re-Check-Tier mitschicken —
          // das Backend baut daraus die Tier-Subscription (30 Tage Trial).
          ...(isStartpaket(pkg.id) ? { tier: selectedTier } : {}),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(data.error || "Bezahlung derzeit nicht möglich.");
    } catch {
      toast.error("Verbindung fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) closeCheckout();
      }}
    >
      {/* Dunkles Glas-Panel (bg-popover) mit Orange-Verlaufs-Rahmen (.glow-border)
          — nur Optik, Dialog-Verhalten (Fokus-Trap, ESC, Overlay) unveraendert. */}
      <DialogContent className="glow-border bg-popover sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bestellung abschließen</DialogTitle>
          <DialogDescription>
            Wählen Sie Ihr Paket. Sie erhalten nach Zahlung automatisch Ihren
            menschlich geprüften Fix-Plan (PDF) per E-Mail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          {/* Plan-Selector — alle Pakete im Modal wechselbar, sinnvollster vorausgewaehlt */}
          <fieldset className="grid gap-2">
            <legend className="mb-1.5 text-sm font-medium">Paket</legend>
            <RadioGroup
              value={selectedPkgId}
              onValueChange={(value) => setSelectedPkgId(value as PackageId)}
              className="grid gap-2"
            >
              {ALL_PACKAGES.map((p) => {
                const isSelected = p.id === selectedPkgId;
                const isDisabled = p.available === false;
                return (
                  <Label
                    key={p.id}
                    htmlFor={`pkg-${p.id}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      // Selected-State in Marken-Orange (Dark-Glow-Vorlagen) statt
                      // Mint — Auswahl-Logik unveraendert.
                      isSelected
                        ? "border-brand-orange/60 bg-brand-orange/10"
                        : "border-border hover:border-brand-orange/30 hover:bg-muted/40",
                      isDisabled && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <RadioGroupItem
                      id={`pkg-${p.id}`}
                      value={p.id}
                      disabled={isDisabled}
                      className="mt-0.5"
                    />
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <div className="grid gap-0.5">
                        <span className="text-sm font-medium leading-tight">
                          {p.name}
                          {p.featured && !isDisabled && (
                            <span className="ml-1.5 text-xs font-semibold uppercase tracking-wide text-brand-orange">
                              · Empfohlen
                            </span>
                          )}
                          {isDisabled && (
                            <span className="ml-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              · Bald verfügbar
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground leading-snug">
                          {p.description}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                        {p.price}
                        {p.priceSuffix && (
                          <span className="text-xs font-normal text-muted-foreground">
                            {p.priceSuffix}
                          </span>
                        )}
                      </span>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          </fieldset>

          {/* Tier-Auswahl beim Startpaket (agent-01, d4): „1. Re-Check-Monat
              inklusive (Tier Ihrer Wahl; danach zum jeweiligen Monatspreis)".
              Nur sichtbar, wenn ein Startpaket gewählt ist. */}
          {isStartpaket(selectedPkgId) && (
            <fieldset className="grid gap-2 rounded-md border border-border p-3">
              <legend className="px-1 text-xs text-muted-foreground">
                Ihr Re-Check-Tier (1. Monat inklusive, danach monatlich)
              </legend>
              <RadioGroup
                value={selectedTier}
                onValueChange={(value) => setSelectedTier(value as PackageId)}
                className="grid gap-2"
              >
                {STARTPAKET_TIER_OPTIONS.map((tier) => (
                  <Label
                    key={tier.id}
                    htmlFor={`tier-${tier.id}`}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors",
                      tier.id === selectedTier
                        ? "border-brand-orange/60 bg-brand-orange/10"
                        : "border-border hover:border-brand-orange/30 hover:bg-muted/40",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <RadioGroupItem id={`tier-${tier.id}`} value={tier.id} />
                      <span className="text-sm font-medium leading-tight">
                        {tier.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                      {tier.price}
                      <span className="text-xs font-normal text-muted-foreground">
                        {tier.priceSuffix ?? "/Monat"}
                      </span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Ab Monat 2 zum jeweiligen Monatspreis, jederzeit zum Monatsende
                kündbar.
              </p>
            </fieldset>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="co-url">Zu prüfende Website-Adresse</Label>
            <Input
              id="co-url"
              type="url"
              inputMode="url"
              required
              placeholder="https://ihre-website.de"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="co-email">E-Mail für die Zustellung</Label>
            <Input
              id="co-email"
              type="email"
              required
              autoComplete="email"
              placeholder="ihre@email.de"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <fieldset className="grid gap-2 rounded-md border border-border p-3">
            <legend className="px-1 text-xs text-muted-foreground">
              Ich bestelle als
            </legend>
            <RadioGroup
              value={customerType ?? undefined}
              onValueChange={(value) =>
                setCustomerType(value as CustomerType)
              }
              className="gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="co-consumer" value="consumer" />
                <Label htmlFor="co-consumer" className="font-normal">
                  Verbraucher (privat)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="co-business" value="business" />
                <Label htmlFor="co-business" className="font-normal">
                  Unternehmer (gewerblich)
                </Label>
              </div>
            </RadioGroup>
          </fieldset>

          {customerType === "business" && (
            <div className="grid gap-1.5">
              <Label htmlFor="co-company" className="font-normal">
                Firma <span className="text-muted-foreground">(für die Rechnung, optional)</span>
              </Label>
              <Input
                id="co-company"
                type="text"
                autoComplete="organization"
                placeholder="Musterfirma GmbH"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>
          )}

          {customerType === "consumer" && (
            <div className="rounded-md border border-border bg-muted/50 p-3 text-xs">
              {/* Kein htmlFor: das Label umschließt das Control bereits
                  (implizite Assoziation) — ein zusätzliches htmlFor auf den
                  Base-UI-Button erzeugte eine doppelte Label-Zuordnung. */}
              <Label className="items-start gap-2 font-normal leading-snug">
                <Checkbox
                  id="co-consent"
                  checked={consent}
                  onCheckedChange={(value) => setConsent(value === true)}
                  className="mt-0.5"
                />
                <span>
                  Ich verlange ausdrücklich, dass mit der Erstellung des
                  Fix-Plans sofort, vor Ablauf der 14-tägigen Widerrufsfrist,
                  begonnen wird. Mir ist bekannt, dass mein Widerrufsrecht mit
                  vollständiger Vertragserfüllung erlischt.
                </span>
              </Label>
            </div>
          )}

          {/* Submit als oranger 3D-Haupt-CTA (.btn-cta) — type/disabled/Inhalt
              und damit der gesamte Bestell-Flow bleiben identisch. */}
          <button
            type="submit"
            className="btn-cta min-h-11 w-full px-4 py-2 text-sm whitespace-normal"
            disabled={submitting || pkg?.available === false}
          >
            {submitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Weiterleitung...
              </>
            ) : pkg?.available === false ? (
              "Bald verfügbar"
            ) : (
              `Zahlungspflichtig bestellen · ${pkg?.price ?? ""}${pkg?.priceSuffix ?? ""}`
            )}
          </button>

          <p className="text-xs text-muted-foreground">
            Mit der Bestellung akzeptieren Sie die{" "}
            <a href="/agb" className="underline underline-offset-2">
              AGB
            </a>{" "}
            und die{" "}
            <a
              href="/widerrufsbelehrung"
              className="underline underline-offset-2"
            >
              Widerrufsbelehrung
            </a>
            . Datenverarbeitung gemäß{" "}
            <a href="/datenschutz" className="underline underline-offset-2">
              Datenschutzerklärung
            </a>
            .
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
