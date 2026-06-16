"use client";

import * as React from "react";
import { Loader2Icon, SearchIcon } from "lucide-react";

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

  return (
    <div className="flex w-full flex-col gap-4">
      <form
        onSubmit={onSubmit}
        className={
          variant === "hero"
            ? "flex flex-col gap-3 sm:flex-row"
            : "flex flex-col gap-2 sm:flex-row"
        }
        noValidate
      >
        <div className="flex-1">
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
            className="h-12 text-base"
            autoComplete="url"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !url}
          className="h-12 px-6 text-base"
        >
          {loading ? (
            <>
              <Loader2Icon className="animate-spin" />
              Prüfe...
            </>
          ) : (
            <>
              <SearchIcon />
              {HERO.cta}
            </>
          )}
        </Button>
      </form>
      {error && (
        <p className="text-xs text-muted-foreground" role="status">
          {error}
        </p>
      )}
      {result && <ResultCard result={result} />}
    </div>
  );
}
