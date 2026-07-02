# Design-Richtung „Das Gutachten" — Warm Editorial / Prüfbericht-Ästhetik

> **Verbindliche Referenz** für alle Frontend-PRs des Juli-2026-Redesigns (FE-PR 2–4).
> Stand: 03.07.2026 · Basis: Plan „Doppel-Workflow" (WORKFLOW 2), FE-PR 2 (Token-Fundament).

## Design-These

**Das Produkt IST ein Dokument.** Der BFSG-Fuchs verkauft einen Prüfbericht (PDF-Report, Note,
Befunde) — also spricht die Website die Design-Sprache eines hochwertigen Prüfgutachtens:
warmes Papier, Tinten-Typografie, Präzisions-Details (Hairlines, Tabellen, Severity-Chips,
Stempel/Siegel), Orange als Marker-/Siegelfarbe, Filo als sichtbarer „Prüfer". Der Wettbewerb
(bfsguard/bf-check/barrierefrei-scanner) besetzt generisches SaaS-Blau bzw. Dark-Dashboards —
„Editorial-Gutachten mit Charakter" ist unbesetzt. **Light (Creme-Papier) ist Default**, Dark
bleibt vollwertig; StatsBar + Final-CTA bleiben dunkle Inseln (Scoped-Dark).

## Die 7 verbindlichen Prinzipien

1. **Wahrheit vor Wow** — Vorschau == echtes Ergebnis (ResultPanel), keine Fantasie-Demos.
2. **Papier & Präzision** — eine ruhige Papier-Fläche, Hairlines, flache Tinten-Schatten;
   kein Glass/Aurora/Grid/Noise-Dekor.
3. **Orange sparsam** — max. 1 Akzent pro Viewport; Severity-Farben = exakt `lib/severity.ts`
   (Spiegel der DOI-Mail, nie anfassen).
4. **Filo = Prüfer-Persona** an definierten Momenten (FE-PR 4: genau 5 Auftritte), nicht als
   Deko-Konfetti.
5. **Motion = einmalige Zustands-Animationen** — H1 animationsfrei (LCP); als Loops überleben
   nur `pulse-soft` + `marquee`.
6. **AA überall** (eigenes Dogfood): Fokus-Ringe, ≥4,5:1 Text, ≥3:1 UI-Grenzen, reduced-motion.
7. **Pflicht-Sprache + `scripts/legal-grep.mjs` PASS** — nie „BFSG-konform"/„rechtssicher"/„garantiert".

## Token-Tabelle (Name → Wert → Verwendung)

### Farben (Light = Default / Dark)

| Token | Light | Dark | Verwendung |
|---|---|---|---|
| `--background` | `oklch(0.975 0.008 85)` | `#0f0b09` | Papier-Creme-Grundfläche / warmes Braun-Schwarz |
| `--foreground` | `oklch(0.22 0.02 50)` | `#f7f1ea` | Tinte / Creme-Text |
| `--card` | `oklch(0.99 0.005 90)` | `#171009` | Dokument-Karten (weiß-warm) |
| `--primary` / `--accent` | `#f4641e` | `#f4641e` | CTA-Orange — **unverändert, konvertierender Bestand** |
| `--primary-foreground` | `#2b1206` | `#2b1206` | dunkler CTA-Text (≈4,9:1 AA) |
| `--muted-foreground` | `oklch(0.45 0.022 55)` | `#b6a89d` | Sekundärtext, AA-sicher |
| `--border` | `oklch(0.87 0.015 75)` | `rgba(255,228,205,.09)` | Hairlines |
| `--border-card` | = `--border` | `rgba(255,228,205,.12)` | Karten-Hairlines |
| `--input` | `oklch(0.58 0.03 60)` | `#7a6a59` | Feldgrenzen (≥3:1, WCAG 1.4.11) |
| `--ring` | `oklch(0.52 0.17 42)` | `#34d99a` | Fokus-Ring (Burnt-Orange / Mint) |
| `--brand-orange` | `oklch(0.55 0.18 42)` | `#ED6A33` | **Marker/Siegel**: Akzentwörter, Kicker, Stempel. Light = AA-abgedunkelt für Text-auf-Creme |
| `--brand-orange-soft` | `oklch(0.64 0.17 38)` | `#FFB07A` | weiche Orange-Verläufe (ScrollProgress) |
| `--brand-orange-press` | `#b8430e` | `#b8430e` | 3D-Unterkante des `.btn-cta` |
| `--brand-mint` | `oklch(0.6 0.16 160)` | `#34d99a` | **NUR Erfolg** (Haken, „konform", Fokus-Ring Dark) |
| `--brand-amber` | `oklch(0.66 0.15 70)` | `#f5b13d` | Frist-/Warn-Kontext |
| `--brand-rose` | `oklch(0.55 0.2 28)` | `#F8554B` | Risiko-Punkte |
| `--brand-deep/-deeper/-deepest` | `#0f0b09/#0b0807/#0a0705` | identisch | Scoped-Dark-Inseln, Schatten-Tinte, Skip-Link |
| Severity-Farben | — | — | **exakt `lib/severity.ts`** (`#F8554B/#ED6A33/#f5b13d/#6b7280`), nicht in CSS dupliziert |

### Typografie

| Token | Schrift | Verwendung |
|---|---|---|
| `--font-display` | **Fraunces** (variable, normal + italic, swap) | H1–H3, Akzent-Italic-Wörter (Gutachten-Serife) |
| `--font-brand` | **Fredoka** (variable, swap) | NUR Marken-/Filo-Momente: Logo-Wortmarke (Header/Footer), `.btn-cta` |
| `--font-sans` | Hanken Grotesk | Body/UI, H4 |
| `--font-mono` | JetBrains Mono | Zahlen, Scores, Report-IDs, Ticker, Stempel |

### Form & Schatten

| Token | Wert | Verwendung |
|---|---|---|
| `--radius` | `0.5rem` | Radius-Basis (sm…4xl skalieren davon) |
| `--shadow-card-soft` | 2-stufig, `brand-deep`-getönt, flach | Ruhelage der Papier-Karten |
| `--shadow-card-hover` | 2-stufig, etwas tiefer | Hover/hervorgehobene Karten |

Genau **zwei** Schatten. Glow-/Elevated-Schatten existieren nicht mehr.

### Loop-Animationen (einzige erlaubte)

| Token | Verwendung |
|---|---|
| `--animate-pulse-soft` | Status-/Live-Punkte, Scan-Balken |
| `--animate-marquee` / `--animate-ticker` | RuleTicker |

### Signatur-Utilities (neu)

| Klasse | Zweck |
|---|---|
| `.paper-card` | Dokument-Karte: `--card`-Fläche + Hairline + `--shadow-card-soft` + `--radius-xl` |
| `.marker-underline` | oranger Textmarker-Strich hinter der unteren Textkante (statisch; drawIn kommt mit FE-PR 4) |
| `.stamp` | Siegel/„Beispiel"-Stempel: Mono-Uppercase, 2px-currentColor-Rahmen, −2° verkantet |
| `.rule-row` | Hairline-Tabellenzeile (Befund-/Leistungslisten) |
| `.gradient-text` | Akzentwort-Tinte (Name aus Bestand): solide `--brand-orange`, theme-sicher |
| `.text-on-deep` | konstant heller Text auf always-dark Flächen (Scoped-Dark) |
| `.card-lift` | ruhiger Karten-Hover (−0.25rem + `--shadow-card-hover`) |

## Do / Don't

**Do**
- Light-Default denken: jede neue Fläche zuerst auf Papier-Creme entwerfen, dann Dark prüfen.
- Orange als Marker einsetzen (1 Akzent/Viewport) — Akzentwort, Kicker, Stempel, Siegel.
- Hairlines + `.rule-row` für Listen/Tabellen statt Karten-in-Karten.
- Zahlen/Scores in `--font-mono` mit `tabular-nums`.
- `.btn-cta` unangetastet lassen (3D-Signatur, Fredoka, #f4641e/#2b1206).
- Scoped-Dark-Inseln (`dark`-Klasse auf der Sektion) für StatsBar/Final-CTA beibehalten.
- reduced-motion-Block + globale Fokus-Ring-Regeln bei jedem globals.css-Edit erhalten.

**Don't**
- Keine neuen Dauer-Loops (aurora/float/shimmer/… sind entfernt und bleiben es).
- Kein Glass/Blur-Morphismus, keine Grid-/Dot-/Noise-Hintergründe, keine Border-Gradients.
- Keine Glow-Schatten; nur die zwei Tinten-Schatten.
- Kein helles `#ED6A33` als Fließtext auf Creme (Light nutzt die Burnt-Variante).
- Mint nie als Deko — ausschließlich Erfolg/Bestanden.
- Severity-Farben nie von `lib/severity.ts` abweichen lassen (Mail == Seite).
- Keine Preis-/Legal-Textänderungen in Design-PRs; Pflicht-Sprache beachten.
- H1 nie mit Entrance-Animation belegen (LCP).

## Offene Punkte für Folge-PRs

- **FE-PR 3 (Sektions-Architektur):** Zahlen-Typo konsequent auf `--font-mono` umziehen
  (StatsBar/Pricing/DeadlineCounter tragen noch `font-display`); Gutachten-Tabellen-Re-Skin
  mit `.rule-row`; `.paper-card` flächig einsetzen.
- **FE-PR 4 (Filo + Motion):** drawIn für `.marker-underline`, countUp/resultReveal in
  `lib/motion.ts`, 5 definierte Filo-Auftritte, Wappen von Pricing-Karten entfernen.
- CtaSection ist eine always-dark Insel ohne `dark`-Scoping — Akzentwort dort prüfen,
  wenn FE-PR 3 die Sektion anfasst.
