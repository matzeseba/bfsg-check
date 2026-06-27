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
  // Beibehalten als öffentliche API (Aufrufer setzen variant="hero"); das Layout
  // ist aktuell für beide Varianten identisch, daher hier nicht ausgewertet.
  variant?: "hero" | "inline";
};

// Grobe Fehlerkategorie aus der Backend-Antwort (Feld `reason`) → ehrliche,
// kategorie-spezifische deutsche Meldung. KEINE erfundenen Score-Zahlen mehr.
const REASON_MESSAGES: Record<string, string> = {
  timeout:
    "Die Seite hat zu lange zum Laden gebraucht. Bitte erneut versuchen.",
  tls: "Das Sicherheitszertifikat der Seite konnte nicht überprüft werden.",
  dns: "Die Seite war nicht erreichbar. Bitte die Adresse prüfen.",
  blocked:
    "Die Seite hat die automatisierte Prüfung blockiert. Eine manuelle Analyse ist trotzdem möglich.",
  // Rate-Limit (HTTP 429): NICHT als "Server nicht erreichbar" beschriften — der
  // Server ist gesund, der Nutzer hat nur zu schnell hintereinander geprüft.
  rate_limit:
    "Zu viele Prüfungen in kurzer Zeit. Bitte einen Moment warten und erneut versuchen.",
  // Server ausgelastet (HTTP 503): alle Scan-Slots belegt + Warteschlange voll.
  busy: "Der Live-Scan ist gerade stark ausgelastet. Bitte in ein paar Sekunden erneut versuchen.",
};

const GENERIC_ERROR =
  "Der Live-Scan ist gerade nicht erreichbar. Bitte in einem Moment erneut versuchen.";

export function ScanForm({ initialUrl = "" }: ScanFormProps) {
  const [url, setUrl] = React.useState(initialUrl);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { setUrl: pushUrl } = useCheckout();

  async function runScan(target: string) {
    if (!target) return;
    setLoading(true);
    setError(null);
    setResult(null);
    pushUrl(target);

    try {
      const response = await fetch(
        `/api/scan?url=${encodeURIComponent(target)}`,
        { method: "GET", headers: { Accept: "application/json" } },
      );
      const data = (await response.json().catch(() => null)) as
        | (ScanResult & { reason?: string; error?: string; retryAfter?: number })
        | null;
      if (!response.ok || !data || typeof data.score !== "number") {
        // Ehrlicher Fehlerpfad: kategorie-spezifische Meldung, KEINE erfundenen
        // Zahlen. Die Score-Anzeige bleibt leer, bis ein echtes Ergebnis vorliegt.
        // 429 (rate_limit) und 503 (busy) liefern jetzt ein `reason` -> echte
        // Meldung statt der generischen "nicht erreichbar"-Sammelmeldung.
        const reason = data?.reason;
        const base = (reason && REASON_MESSAGES[reason]) || GENERIC_ERROR;
        const retryAfter =
          typeof data?.retryAfter === "number" ? data.retryAfter : null;
        setError(
          retryAfter && retryAfter > 1 ? `${base} (in ca. ${retryAfter} s)` : base,
        );
        return;
      }
      setResult(data);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runScan(url);
  }

  // Variant beeinflusst das Layout aktuell nicht — eine Konstante statt eines
  // Ternaries mit identischen Zweigen (toter Code).
  const inputWrapper = "flex flex-col gap-1.5 sm:flex-row sm:items-center";

  // Genau EINE Live-Region: Lade-/Ergebnis-/Fehlerstatus wird in derselben
  // persistenten sr-only-role=status-Region angesagt (zwei konkurrierende
  // Live-Regions können sich gegenseitig überschreiben/doppelt ansagen).
  const liveStatus = loading
    ? "Prüfung läuft…"
    : error
      ? error
      : result
        ? `Prüfung abgeschlossen: ${result.score} von 100 Punkten, ${result.totalIssues} Funde.`
        : "";

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Persistente Live-Region: existiert immer im DOM, damit Screenreader den
          Statuswechsel ansagen (eine erst mit Inhalt gemountete Region wird oft
          nicht vorgelesen). */}
      <p className="sr-only" role="status" aria-live="polite">
        {liveStatus}
      </p>
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
      {/* Ehrlicher Fehlerzustand: klare Meldung + "Erneut versuchen". KEINE
          erfundenen Demo-Score-Zahlen. Die Ansage für Screenreader erfolgt über
          die einzige Live-Region oben (hier nur visuell). */}
      {error && !loading && (
        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => runScan(url)}
            disabled={!url}
            className="shrink-0 rounded-lg"
          >
            Erneut versuchen
          </Button>
        </div>
      )}
      {result && <ResultCard result={result} />}
    </div>
  );
}
