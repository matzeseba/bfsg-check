# Dark-Glow-Redesign — Design-Spezifikation (SSOT für alle Umbau-Agenten)

> Stand 04.07.2026. Quelle: Owner-Vorlagen in `design-inputs-landingpage/` (16 Higgsfield-Renders).
> Entscheidungen des Owners: (1) Startseite komplett + globales Token-System, (2) **Dark-only, Light-Toggle entfernen**, (3) Founder-Sektion mit Higgsfield-Soul-Portrait, (4) voll-dynamisch aber LCP-schonend.

## 1. Zielbild („same vibe, different result")

Dark-Premium-Look der Vorlagen: tiefes Schwarz, Orange-Glow, Licht-Trails, Glas-Cards mit
leuchtenden Borders, Score-Donut, 3D-Filo-Maskottchen im schwarzen Tech-Suit mit
Orange-Neon-Linien. Cinematisch, energetisch, hochwertig — aber technisch schlank.

## 2. Token-System (bereits in `app/globals.css` umgesetzt — NICHT ändern!)

Die `.dark`-Palette (Dark ist erzwungen, `<html class="dark">`):

| Token | Wert | Verwendung |
|---|---|---|
| `--background` | `#050506` | Seitengrund (near-black, kühl-neutral) |
| `--card` | `#0e0d10` | Kartenflächen |
| `--brand-orange` | `#ff7a1a` | Marken-Glow, Akzente, Borders |
| `--brand-orange-soft` | `#ffb066` | Verlaufs-Enden, Hover |
| `--primary` | `#f4641e` | CTA-Buttons (Text `#2b1206`) |
| `--brand-mint` | `#34d99a` | Erfolg/„Sehr gut"/Checkmarks |
| `--brand-amber` | `#f5b13d` | Warnstufe „Schwerwiegend" |
| `--brand-rose` | `#F8554B` | Kritisch |
| `--foreground` | `#f5f2ee` | Primärtext (warmes Weiß) |
| `--muted-foreground` | `#b3a99f` | Sekundärtext (AA auf #050506) |

**Neue Utilities (globals.css, fertig):**
- `.glow-card` — Glas-Card: dunkle Fläche + Orange-Gradient-Border (mask-composite) + inneres Glühen. Standard-Karte des Redesigns.
- `.glow-border` — nur der Orange-Verlaufs-Rahmen (für bestehende Karten).
- `.glow-ring` — weicher Orange-Außenschein (`box-shadow`) für hervorgehobene Flächen.
- `.text-glow` — dezenter Orange-Text-Schein für Akzentzahlen.
- `.orbit-trails` — dekorative Licht-Trail-Ellipsen (CSS, `aria-hidden`), fürs Hero/Sektions-Ambiente.
- `.ember-field` — Partikel-„Funken" (CSS radial-gradients, animiert, reduced-motion-still).
- `.btn-cta` — bleibt der 3D-Orange-CTA, bekommt zusätzlich Glow-Halo.
- `.gradient-text` — Headline-Akzent: jetzt Orange→Orange-soft Verlauf.

**Motion-Atome (`lib/motion.ts`, fertig):** `EASE`, `revealUp()`, `staggerContainer()`,
`staggerItem`, NEU: `revealScale()`, `revealSide()`. Magnetic-Hover: `lib/use-magnetic.ts`
(`useMagnetic(strength)` → ref+Handler für magnetische Buttons, Pointer-fine only).

**Fertige FX-Primitive (`components/fx/`):**
- `GlowCard` — `<GlowCard tone="orange|mint|amber|rose" as="div">` Glas-Card mit Glow-Border.
- `ScoreDonut` — animierter SVG-Score-Ring (`score`, `grade`, `size`, `label`), zählt beim
  Scroll-Reveal hoch, `aria`-beschriftet, reduced-motion = statisch.
- `Reveal` — Scroll-Reveal-Wrapper (`variant="up|scale|left|right"`, `delay`).
- `MagneticButton` — Wrapper, macht Kinder magnetisch (Pointer-fine, reduced-motion aus).
- `AmbientGlow` — Sektions-Hintergrund (Orange-Radial + optional Trails/Ember), `aria-hidden`.

## 3. Assets (in `landingpage-next/public/`, fertig)

| Datei | Inhalt | Einsatz |
|---|---|---|
| `filo-arms-crossed.png` | Filo stehend, Arme verschränkt (1100px H, schwarzer BG) | Hero rechts |
| `filo-running.png` | Filo sprintend mit Licht-Trails | „Schnelligkeit"-Kontext (RiskBand/CTA) |
| `filo-pointing.png` | Filo zeigt nach oben | HowItWorks/Features |
| `filo-thumbsup-neo.png` | Filo Daumen hoch mit Glow-Swirls | Pricing/FinalCTA |
| `logo-fox-glow.png` | Eckiger Fuchskopf mit Orange-Glow (512px) | Header/Footer-Logo |
| `founder-matthias.jpg` | Business-Portrait Owner (Higgsfield Soul) | FounderSection |
| `mascot-*.png`, `logo-fox.png` | Alt-Assets | werden ersetzt/können bleiben |

**Wichtig:** Die Filo-PNGs haben SCHWARZE Hintergründe (nicht transparent). Auf dem
near-black Seitengrund per CSS-Maske einblenden: `[mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,black_55%,transparent_78%)]`
(Tailwind-Arbitrary) o. ä. — Ränder verschwimmen in den Seitengrund. `next/image` mit
festen `width/height`, `alt=""` (dekorativ) oder sprechendem Alt, `loading="lazy"` außer im Hero
(`priority` NUR fürs Hero-Bild, falls above-the-fold).

## 4. Text-/Claim-Regeln (NICHT VERHANDELBAR — UWG §5, CLAUDE.md)

Alle Texte kommen aus `lib/config.ts` (SSOT) und sind bereits UWG-sauber. **Texte NICHT
durch Vorlagen-Texte ersetzen!** Die Vorlagen enthalten verbotene Claims:

| Vorlage (VERBOTEN) | Stattdessen (aus config.ts) |
|---|---|
| „RECHTSSICHER", „Rechtskonform", „100 % DSGVO-konform" | „DSGVO-konform · TLS 1.3" (Selbst-Tatsachen), LEGAL_NOTE-Disclaimer |
| „1.247+ Unternehmen", „96 % zufrieden", „4,9/5 ★" | 80+ Prüfregeln · 60 Sek. · DE-Hosting (STATS) |
| Fremdlogos Siemens/BOSCH/SAP/Allianz/t3n/OMR | Norm-Badges: WCAG 2.1 AA · EN 301 549 · BITV 2.0 · BFSG · § 25 TDDDG (LOGO_CLOUD) |
| Fake-Kundenstimme „Martina K." | Differentiators (DIFFERENTIATORS) — echte Produkt-Argumente |
| „Konform sein"-Schritt | „Fix-Plan vom Experten kuratiert" (HOW_IT_WORKS) |

Score-Beispiel bleibt `HERO_VISUAL.sample` (62/100, Note C) und ist als „Beispiel" gekennzeichnet.

## 5. Verbindliche Handwerks-Regeln

- **TypeScript strict**, echte Umlaute (ä/ö/ü/ß — ESLint-Regel), keine `console.log`.
- Bestehende **Funktionalität unangetastet**: ScanForm-API-Calls, CheckoutModal-Flow,
  JsonLd, LeadCapture, Cookie-Consent-Logik (2-Button-Gleichgewicht!), Skip-Link, `id`-Anker
  (`#pakete`, `#ablauf`, `#cookie`, `#faq`, `#risiko`) MÜSSEN erhalten bleiben.
- **A11y:** Kontraste ≥ 4.5:1 für Text (gegen #050506/#0e0d10 prüfen), Fokus-Ringe sichtbar
  (globale Regel vorhanden), Heading-Hierarchie (1 H1), dekorative FX `aria-hidden`,
  `prefers-reduced-motion` überall respektiert (MotionConfig global + CSS-Regel vorhanden).
- **Performance:** Hero-H1 + CTA ohne Einstiegs-Animation (LCP), keine `background-attachment:fixed`,
  Blur-Layer sparsam (max. 2 pro Viewport), Animationen nur `transform`/`opacity`.
- **Motion-Sprache:** Sektionen mit `Reveal`, Karten `card-lift`, Zahlen zählen hoch (CountUp
  existiert), CTAs magnetisch + Glow-Pulse, Score-Donut animiert.
- Jede Sektion: Kicker-Pill (`SectionKicker`, tone="on-deep") → Headline (weiß, GENAU EIN
  Akzentwort in `.gradient-text.italic`) → Subline (`text-muted-foreground`).

## 6. Dynamik 2.0 — Scroll-Story (Owner-Entscheid 04.07., 2. Runde)

Der Owner hat das Dynamik-Level auf **„Scroll-Story (Scrubbing)"** angehoben und
**reduced-motion = respektieren** bestätigt. Neue Primitive (fertig, `components/fx/`):

- `ScrollScrub` — scroll-GEKOPPELTE Einblendung (`from`/`fromX` px): Element baut sich
  beim Scrollen sichtbar auf, Rückwärts-Scrollen spult zurück. ERSETZT `Reveal` für die
  Haupt-Bausteine der Sektionen (Karten, Panels, Headlines-Blöcke). `Reveal` bleibt für
  Kleinkram ok.
- `ParallaxLayer` — scroll-gekoppelter Tiefenversatz (`distance` px) für Deko/Bilder.
- `MouseParallax` + `MouseLayer` — Cursor-Tiefenebenen (`depth` px): Hero-Panel ~8,
  Maskottchen ~18, Float-Chips ~28, Trails ~12. Nur Maus, gefedert.
- `TiltCard` — 3D-Neigung zum Cursor (`max` 5–7°) für Glow-Cards (Pricing, Vergleich,
  Differentiators, Cookie).

**Regeln:** Alles läuft über MotionValues (kein Re-Render/Frame), nur transform/opacity,
KEIN Scroll-Jacking (natives Scrollen bleibt), Hero-H1+CTA weiterhin OHNE Einstiegs-
Animation (LCP), reduced-motion rendert überall den statischen Endzustand (die
Primitive tun das bereits selbst).

## 7. Maskottchen-Regeln v2 (Owner-Findings 04.07.)

Die 4 Filo-PNGs sind jetzt ECHT FREIGESTELLT (transparenter Hintergrund, getrimmt,
Higgsfield remove_background). Konsequenzen:
- **Alle `[mask-image:...]`-Arbitrary-Masken auf Filo-Bildern ENTFERNEN** (sie würden
  jetzt den Fuchs selbst anschneiden).
- Filo darf (und soll) GROSS und UNVERDECKT stehen — Vorlagen-Referenz: Fuchs steht
  NEBEN dem Inhalt, nie dahinter versteckt, nie von Karten/Chips überdeckt. Inhalt
  reserviert Platz (Grid-Spalte oder padding), statt den Fuchs zu überlagern.
- Den früheren Bild-Glow ersetzen CSS-Ebenen HINTER dem Fuchs: radialer Orange-Schein
  (AmbientGlow/eigenes div) + `.orbit-trails` + ggf. `.ember-field` — nichts davon
  über dem Fuchs.
- Positionierungs-Falle: `bottom-*` auf absolut positionierten Chips/Deko innerhalb
  von Panels löste gegen falsche Referenzen auf — top-basierte Werte bevorzugen und
  im Browser verifizieren.
- Badges/Pills, die auf `glow-card`-Kanten sitzen, brauchen `z-10` (der `::after`-
  Glow-Rahmen malt sonst über sie).
