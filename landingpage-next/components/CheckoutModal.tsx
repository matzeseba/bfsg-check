"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { PACKAGES, COOKIE_PACKAGES, type PackageId } from "@/lib/config";
import { useCheckout } from "@/lib/checkout-context";

type CustomerType = "consumer" | "business";

const ALL_PACKAGES = [...PACKAGES, ...COOKIE_PACKAGES];

function packageFor(id: PackageId | null) {
  return ALL_PACKAGES.find((p) => p.id === id) ?? null;
}

export function CheckoutModal() {
  const { state, closeCheckout, setUrl: pushUrl } = useCheckout();
  const pkg = packageFor(state.pkg);

  const [email, setEmail] = React.useState("");
  const [customerType, setCustomerType] = React.useState<CustomerType | null>(
    null,
  );
  const [consent, setConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // URL ist die Quelle der Wahrheit im Checkout-Context — kein lokales Mirror-State.
  const url = state.url;
  const setUrl = pushUrl;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pkg) return;
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bestellung abschließen</DialogTitle>
          <DialogDescription>
            {pkg
              ? `${pkg.name} — ${pkg.price}${pkg.priceSuffix ?? ""}`
              : "Paket auswählen"}
            . Sie erhalten nach Zahlung automatisch Ihren menschlich geprüften
            Fix-Plan (PDF) + Vorlage der Barrierefreiheitserklärung per E-Mail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
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

          {customerType === "consumer" && (
            <div className="rounded-md border border-border bg-muted/50 p-3 text-xs">
              <Label
                htmlFor="co-consent"
                className="items-start gap-2 font-normal leading-snug"
              >
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

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Weiterleitung...
              </>
            ) : (
              "Zahlungspflichtig bestellen"
            )}
          </Button>

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
