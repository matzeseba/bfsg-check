import { HERO_VISUAL } from "@/lib/config";

import { ResultPanel } from "./ResultPanel";

// Hero-Vorschau des Sofort-Ergebnisses: rendert DIESELBE ResultPanel-Komponente
// wie das echte Scan-Ergebnis (ResultCard) — mit klar als „Beispiel"
// gestempelten, in sich konsistenten Beispieldaten aus HERO_VISUAL.sample.
// Vorschau == echtes Ergebnis per Konstruktion; die frühere Fantasie-Demo
// (Before/After-Kontrast, Fix-Plan-Teaser) entfällt ersatzlos.
// Deko-Teile (Halo, App-Chrome-Dots) bleiben aria-hidden, der Beispiel-Inhalt
// selbst bleibt zugänglich (Screenreader lesen dieselbe Übersicht wie Sehende).
export function HeroVisual() {
  const v = HERO_VISUAL;

  return (
    <div className="relative w-full min-w-0">
      {/* Spotlight-Halo dahinter (Fox-Design: orange-getönt). Auf Mobile
          billiger: kleinerer Blur-Radius, größerer erst ab md. */}
      <div aria-hidden className="pointer-events-none absolute -inset-8 -z-10">
        <div className="absolute left-1/2 top-1/3 size-[80%] -translate-x-1/2 rounded-full bg-brand-orange/20 blur-[40px] md:blur-[80px]" />
      </div>

      {/* Dokument-Rahmen (App-Chrome-Fenster) um das ResultPanel. */}
      <div className="border-gradient relative overflow-hidden rounded-[1.7rem] bg-card/90 p-1.5 shadow-elevated shadow-glow-orange backdrop-blur-sm">
        {/* Kopfleiste: Ampel-Dots (dekorativ) + deutlich sichtbarer
            „Beispiel"-Chip + neutrale Demo-URL (Kunden-Perspektive). */}
        <div className="flex items-center gap-2 rounded-t-[1.4rem] border-b border-border/60 bg-muted/60 px-4 py-3">
          <span aria-hidden className="size-2.5 rounded-full bg-brand-rose/80" />
          <span aria-hidden className="size-2.5 rounded-full bg-brand-amber/80" />
          <span aria-hidden className="size-2.5 rounded-full bg-brand-mint/80" />
          <span className="shrink-0 rounded-md border border-brand-orange/30 bg-brand-orange/12 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-brand-orange uppercase">
            {v.sampleLabel}
          </span>
          <div className="mx-auto flex min-w-0 items-center gap-2 rounded-lg bg-background/80 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <span
              aria-hidden
              className="inline-flex size-1.5 shrink-0 rounded-full bg-brand-mint"
            />
            <span className="min-w-0 truncate">
              ihre-website.de/{v.reportPath}
            </span>
          </div>
        </div>

        {/* Das echte Ergebnis-Format — gleiche Komponente wie ResultCard. */}
        <ResultPanel result={v.sample} />

        {/* Fußzeile: wahrer Hinweis auf die DOI-Mail nach dem Gratis-Check. */}
        <p className="rounded-b-[1.4rem] border-t border-border/60 bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
          {v.footnote}
        </p>
      </div>
    </div>
  );
}
