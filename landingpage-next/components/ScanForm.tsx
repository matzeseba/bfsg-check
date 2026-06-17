"use client";

import * as React from "react";
import { ArrowRightIcon, Loader2Icon, ScanLineIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HERO } from "@/lib/config";
import { useCheckout } from "@/lib/checkout-context";

import { ResultCard, type ScanResult } from "./ResultCard";

export type ScanFormProps = {
  initialUrl?: string;
  variant?: "hero" | "inline";
};

export function ScanForm({ initialUrl = "", variant = "hero" }: ScanFormProps) {
  const [url, setUrl] = React.useState(initialUrl);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { setUrl: pushUrl } = useCheckout();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);
    pushUrl(url);

    try {
      const response = await fetch(
        `/api/scan?url=${encodeURIComponent(url)}`,
        { method: "GET", headers: { Accept: "application/json" } },
      );
      if (!response.ok) {
        throw new Error(`api ${response.status}`);
      }
      const data = (await response.json()) as ScanResult;
      setResult(data);
    } catch {
      // Demo-Fallback ohne Backend, damit die Page auch offline anschaulich bleibt.
      const fallback: ScanResult = {
        score: Math.floor(40 + Math.random() * 45),
        totalIssues: Math.floor(5 + Math.random() * 30),
        topIssues: [
          "Fehlende Alt-Texte bei Bildern",
          "Unzureichende Farbkontraste",
          "Formularfelder ohne sichtbares Label",
        ],
        fallback: true,
      };
      setResult(fallback);
      setError(
        "Live-Scan derzeit nicht erreichbar — beispielhafte Ergebnisse werden gezeigt.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputWrapper =
    variant === "hero"
      ? "flex flex-col gap-1.5 sm:flex-row sm:items-center"
      : "flex flex-col gap-1.5 sm:flex-row sm:items-center";

  return (
    <div className="flex w-full flex-col gap-4">
      <form
        onSubmit={onSubmit}
        className="group/scan relative rounded-2xl border border-border/70 bg-card/85 p-1.5 shadow-card-soft backdrop-blur transition-all focus-within:border-brand-mint/60 focus-within:shadow-glow-mint"
        noValidate
      >
        <div className={inputWrapper}>
          <div className="flex flex-1 items-center gap-2 px-3">
            <ScanLineIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <Label htmlFor="scan-url" className="sr-only">
              Website-Adresse
            </Label>
            <Input
              id="scan-url"
              name="url"
              type="url"
              inputMode="url"
              required
              placeholder={HERO.placeholder}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="h-12 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
              autoComplete="url"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || !url}
            className="h-12 shrink-0 gap-1.5 rounded-xl bg-brand-mint px-5 text-base font-semibold text-brand-deep shadow-glow-mint transition-transform hover:bg-brand-mint/85 hover:scale-[1.015] disabled:opacity-60 disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2Icon className="animate-spin" />
                <span>Prüfe…</span>
              </>
            ) : (
              <>
                <span>{HERO.cta}</span>
                <ArrowRightIcon className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
      <p className="px-1 text-xs text-muted-foreground">
        Kostenlos · ohne Anmeldung · ohne Tracker. Bei Bestellung Stripe-Checkout.
      </p>
      {error && (
        <p className="text-xs text-muted-foreground" role="status">
          {error}
        </p>
      )}
      {result && <ResultCard result={result} />}
    </div>
  );
}
