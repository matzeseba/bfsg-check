# Referenz-Analyse: kiberatung.de (Design-DNA)

> Erfasst 27.06.2026 via Browser (1440×900 + Scroll-Durchlauf). Zweck: Vorlage für den
> Conversion-Redesign der BFSG-Check-Landingpage. **Wir übernehmen die STRUKTUR & DYNAMIK,
> NICHT die Farbe** — unsere Brand-Farben (Mint/Violet/Indigo auf tiefem Indigo-Schwarz)
> bleiben. kiberatung nutzt Gold/Champagne als einzigen Akzent; bei uns ist das Mint/Violet.

## 1. Gesamteindruck
Premium, editorial, „teuer". Near-Black-Canvas, ein einziger warmer Akzent, viel Negativraum,
ruhige aber durchgehende Mikro-Animation. Wirkt wie eine High-End-Agentur, nicht wie ein Tool.

## 2. Farbsystem (ihres → unser Äquivalent)
- **Canvas:** near-black `#0a0a0a` mit sehr subtilem Blueprint-Grid + weichen radialen Akzent-Glows
  hinter Hero/Sektions-Zentren. → Unser `--background` Dark (`oklch(0.155 0.025 278)`) ist schon
  passend; Grid + Glows existieren (`grid-bg-dark`, Hero-Blobs).
- **Akzent:** EIN Gold-Ton, extrem sparsam (Pills, große Stat-Zahlen, Italic-Akzentwort, CTA-Buttons,
  Severity-Bars, Sterne, Mikro-Underlines). → Bei uns **Mint** als Primär-Akzent, **Violet** als
  Sekundär-Glow, **Amber/Rose** nur für Severity. Disziplin: nicht mehr als 1 Akzent pro Fläche.
- **Text:** Headlines reinweiß, Body in gedämpftem Grau (`muted-foreground`).

## 3. Typografie
- **Sans bold** für Headlines + Body (geometrisch). Bei uns: Geist (Sans).
- **Serif-Italic** für GENAU EIN Akzentwort pro Headline (das „teure" Editorial-Signal):
  „wachsen *schneller*", „zum *Problem werden*", „*Zeit und Geld?*". → Bei uns bereits Fraunces-Italic
  in der Hero-H1. **Lernpunkt: dieses Muster auf JEDE Sektions-Headline ausweiten** (Konsistenz-Rhythmus).
- Logo in Serif (EVERLAST®) — Kontrast zur Sans.

## 4. Sektions-Skelett (DER Schlüssel — jede Sektion identisch aufgebaut)
1. **Kicker-Pill**: Icon + UPPERCASE, getrackter Kleinschrift-Text, akzent-gefärbt, rounded-full,
   dezenter Akzent-Border/Glow. (z. B. „DER MARKT VERÄNDERT SICH", „ERFAHRUNGSWERTE", „UNSERE LÖSUNGEN".)
2. **Große Headline** mit 1 Italic-Akzentwort.
3. **Subline** (gedämpft).
4. **Content** (Karten / Mini-Visuals).
→ Dieser immer gleiche Dreiklang erzeugt den ruhigen, premium „Rhythmus". **Unser stärkster Hebel:
   dieses Skelett konsequent über ALLE Sektionen ziehen** (aktuell uneinheitlich).

## 5. „Dynamik" = Mini-Visuals pro Karte (nicht globale Effekte)
Jede Service-/Inhaltskarte hat ein eigenes kleines, illustratives Widget:
- **KI-Strategie-Karte:** 4-Schritt-Stepper (ANALYSE → STRATEGIE → PILOTIERUNG → SKALIERUNG) mit Icons
  + Fortschrittslinie.
- **Automatisierung-Karte:** Mini-Flow „Eingabe ✓ → Analyse [Progress-Bar] → Aktion" (Pipeline-Anmutung).
- **Software-Entwicklung-Karte:** syntax-gehighlightetes Code-Snippet + „✓ Build successful 1.2s".
- **Schulung-Karte:** Feature-Liste mit Icon-Badges.
- **Markt-Stat-Karten (89% / 45% / 29%):** große Akzent-Zahl, Akzent-Underline/Progress, Quellen-Zeile klein.
- **Problem-Karten (PROBLEM 01…06):** Icon, Titel, Text, farbiger **Severity-Bar (KRITISCH/HOCH/MITTEL)**,
  Tag-Chips (Datensilos, ETL-Prozesse …).
→ Unser HeroVisual macht das bereits exemplarisch. **Lernpunkt: das Prinzip „jede Sektion hat ihr eigenes
   kleines Live-Element" ausweiten** (HowItWorks-Stepper, Risk-Band-Count-ups, ein Flow-/Code-Mini-Widget).

## 6. Inverted „Wow"-Panel (Kontrast-Bruch + Proof-Höhepunkt)
Ein **cremefarbenes (helles) Panel** mitten im dunklen Flow mit einem **riesigen animierten Counter**
(„13.832 → **73.858+** Arbeitstage gespart", zählt live hoch) + 3 Service-Summary-Karten + Trust-Badges
(AZAV, kununu Top Company, GDD/BvD, FOCUS Top Arbeitgeber). → Durchbricht die Dunkel-Monotonie, setzt
EINEN visuellen Höhepunkt. **Für uns: ein heller Akzent-Block mit EHRLICHER, animierter Kennzahl**
(z. B. „80+ WCAG-Prüfregeln" oder aggregierte, belegbare Scan-Zahl — KEINE erfundenen Werte, UWG-konform).

## 7. Proof-Stacking-Reihenfolge (Conversion-Dramaturgie)
Hero → Logo-Cloud (Marquee „Unternehmen, die auf uns vertrauen") → Markt-Stats (mit Quellen) →
**Problem**-Karten (Schmerz, Severity) → **Lösungs**-/Service-Karten → großer gesparte-Zeit-Counter →
Trust-Badges → **Testimonial-Carousel** (Avatar-Initialen, 5 Sterne, Zitat, hervorgehobener Metrik-Chip
„80% weniger Routinezeit", Name+Rolle) → Case-Studies mit Pagination („1/10", „2.100+ Kunden") → Final-CTA.

## 8. Layout-Muster
- **Sticky-Left + Scrolling-Right**: Problems & Solutions = linke Spalte mit Sticky-Headline, rechts
  scrollende Karten. Erzeugt Fokus + Tiefe.
- **Persistenter Top-Right-CTA** in der Nav („Analysegespräch buchen", akzent-gefüllt) — immer sichtbar.
- Großzügige vertikale Abstände, breite max-width, zentrierte Sektions-Köpfe.

## 9. Mikro-Interaktionen
- Rotierendes/typendes Hero-Akzentwort.
- Count-ups bei Stats + dem großen Counter.
- Hover-Glows auf Karten (Akzent-Schimmer am Rand).
- Scan-/Progress-Bars in den Mini-Visuals.
- Sanfte Entrance-Stagger beim In-View-Scrollen.

## 10. Direkt übertragbare Maßnahmen für BFSG-Check
A. **Dark als Default** (= der Look aus dem Screenshot). [Owner-Hauptwunsch]
B. **Sektions-Skelett vereinheitlichen** (Kicker-Pill → Italic-Headline → Subline) auf allen Sektionen.
C. **Mehr Mini-Visuals** (HowItWorks-Stepper, Risk-Band/Markt-Stats als Count-up-Karten mit Akzent-Underline,
   1 Flow-/Code-Micro-Widget) — Dynamik ohne Performance-Risiko.
D. **Ein heller „Wow"-Proof-Block** mit ehrlicher animierter Kennzahl.
E. **Persistenter Header-CTA** „Jetzt kostenlos prüfen" (immer sichtbar).
F. **Testimonial-Metrik-Chips** + Sterne-Styling schärfen.
G. **Severity-Tag-Chips** (wie Problem-Karten) für unsere Befund-Darstellung.
H. **Italic-Akzentwort konsequent** in jeder Sektions-Headline.

## Guardrails (nicht verhandelbar)
- **Farben bleiben** (Mint/Violet/Indigo), kein Gold.
- **Keine erfundenen Zahlen/Logos** (UWG §5 / Schleichwerbung) — nur belegbare/ehrliche Kennzahlen.
- **Legal-Pflichtsprache** beibehalten („automatisierte technische Analyse", kein „BFSG-konform/garantiert").
- **A11y im Dark-Mode**: Kontraste ≥ WCAG AA, Fokus-Ringe sichtbar (wir verkaufen Barrierefreiheit — Dogfood!).
- **Performance/LCP**: Hero-H1 ohne opacity-Entrance; Mobile keine teuren Full-Viewport-Blurs.
