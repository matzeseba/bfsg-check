"use client";

import * as React from "react";
import { ArrowRightIcon, Loader2Icon, ScanLineIcon } from "lucide-react";

import { MagneticButton } from "@/components/fx/MagneticButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HERO } from "@/lib/config";
import { useCheckout } from "@/lib/checkout-context";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

import { ResultCard, type ScanResult } from "./ResultCard";

// Dekorative „Der Fuchs schnüffelt"-Phasen für den Scan-Lauf-Zustand. Rein
// kosmetisch (der echte Scan ist ein einzelner Fetch ohne Fortschritts-Stream);
// die verbindliche Statusansage für Screenreader läuft über die sr-only
// Live-Region ("Prüfung läuft…"), NICHT über diese rotierenden Labels.
const SCAN_PHASES = [
  "Seite laden & rendern",
  "DOM-Baum kartieren",
  "Farbkontraste beschnuppern",
  "Alt-Texte aufspüren",
  "Tastatur-Fokus erschnüffeln",
  "Fokus-Reihenfolge prüfen",
  "Formular-Labels abgleichen",
  "Überschriften-Fährte verfolgen",
  "ARIA-Rollen inspizieren",
  "Landmarks abstecken",
  "Link-Bezeichnungen lesen",
  "Sprach-Attribut checken",
  "Tabellen-Struktur prüfen",
  "Bilder & Medien sichten",
  "Ergebnisse zusammentragen",
] as const;

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
  const reduced = usePrefersReducedMotion();

  async function runScan(target: string) {
    if (!target) return;
    setLoading(true);
    setError(null);
    setResult(null);
    pushUrl(target);

    // Mindest-Anzeigedauer: der echte Teaser-Scan ist oft in ~5 s durch. Fuer
    // einen glaubwuerdigen Tiefen-Eindruck wird der Ergebnis-Reveal auf ~15-18 s
    // sichtbare Pruef-Animation gehoben (der Scan laeuft ehrlich weiter, das
    // Ergebnis wird nur zurueckgehalten). Bei Fehler KEIN kuenstlicher Delay
    // (schnelle, ehrliche Meldung). Reduced-Motion: sofortiger Reveal, damit
    // niemand ohne Bewegungs-Feedback vor einem still stehenden Panel wartet.
    const minRevealMs = reduced ? 0 : 15000 + Math.floor(Math.random() * 3000);
    const startedAt = Date.now();

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
      const elapsed = Date.now() - startedAt;
      if (elapsed < minRevealMs) {
        await new Promise((r) => window.setTimeout(r, minRevealMs - elapsed));
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
        className="group/scan relative rounded-2xl border border-border/70 bg-card/85 p-1.5 shadow-card-soft backdrop-blur transition-all focus-within:border-brand-orange/60 focus-within:shadow-glow-orange"
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
          {/* Magnetischer CTA (Dark-Glow): nur der Wrapper folgt dem Cursor,
              Submit-/Disabled-Logik des Buttons bleibt unverändert. */}
          <MagneticButton className="w-full shrink-0 sm:w-auto">
            <button
              type="submit"
              disabled={loading || !url}
              className="btn-cta h-12 w-full rounded-xl px-5 text-base"
            >
              {loading ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  <span>Prüfe…</span>
                </>
              ) : (
                <>
                  <span>{HERO.scanCta}</span>
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </MagneticButton>
        </div>
      </form>
      <p className="px-1 text-xs text-muted-foreground">
        Kostenlos · ohne Anmeldung · ohne Tracker. Bei Bestellung Stripe-Checkout.
      </p>
      {/* Scan-Lauf-Zustand (Fox-Design): oranger Spinner + animierte orange
          Progress-Bar + bar-eq-Equalizer. Dekorativ (aria-hidden) — die
          verbindliche Ansage läuft über die sr-only Live-Region oben. Alle
          Animationen sind reduced-motion-gated (CSS @media + reduced-Flag). */}
      {loading && <ScanningPanel reduced={reduced} />}
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

// Oranger Scan-Lauf-Panel im Fox-Design. Vollständig dekorativ (aria-hidden):
// kein konkurrierender Live-Status, kein eigener role. Zeigt einen rotierenden
// „Fuchs schnüffelt"-Phasenhinweis + eine sanft pulsierende Progress-Bar +
// einen Equalizer. Bei prefers-reduced-motion stehen Spinner/Equalizer still
// und die Phase bleibt auf der ersten stehen (kein Auto-Wechsel).
function ScanningPanel({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(
      () => setPhase((p) => (p + 1) % SCAN_PHASES.length),
      1050,
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-brand-orange/25 bg-card/85 p-4 shadow-card-soft backdrop-blur"
    >
      <div className="flex items-center gap-3">
        {/* Oranger Lauf-Ring (Design: 3px-Ring, top in Marken-Orange). */}
        <span
          className={
            "size-9 shrink-0 rounded-full border-[3px] border-brand-orange/25 border-t-brand-orange " +
            (reduced ? "" : "animate-spin")
          }
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold tracking-tight">
            Der Fuchs schnüffelt…
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {SCAN_PHASES[phase]}
          </p>
        </div>
      </div>

      {/* Orange Progress-Bar (indeterminate: füllt + pulst, da der echte Scan
          keinen Fortschritts-Stream liefert). */}
      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-brand-orange/12">
        <div
          className={
            "h-full w-2/3 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-soft shadow-glow-orange " +
            (reduced ? "" : "animate-pulse-soft")
          }
        />
      </div>

      {/* bar-eq-Equalizer (7 Balken, gestaffelte Verzögerung). */}
      <div className="mt-4 flex h-7 items-end gap-1">
        {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((delay, i) => (
          <span
            key={i}
            className={
              "flex-1 origin-bottom rounded-sm bg-brand-orange/40 " +
              (reduced ? "h-1/2" : "h-full animate-bar-eq")
            }
            style={reduced ? undefined : { animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      <p className="mt-3 font-mono text-xs text-muted-foreground">
        › Kontraste, Alt-Texte, Fokus-Reihenfolge, Labels…
      </p>
    </div>
  );
}
