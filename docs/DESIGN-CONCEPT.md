# Design-Konzept — Conversion-Iteration 2 (Premium)

Stand: 17.06.2026 · Branch `feat/design-iteration-2` · Stack: Next.js 16 + React 19 + Tailwind v4 + base-nova/shadcn + motion + lucide

Eigentümer-Feedback zur Iteration 1: „Farbwahl gut, Design in Ordnung und professionell,
aber NICHT überragend." Dieses Konzept beschreibt den **Generationssprung** — eine Elevation,
kein Rebuild. Farbfamilie (Navy-Indigo + Mint) und Logik (Scan → Checkout → DSGVO-Forms)
bleiben. Was sich ändert: visuelle Sprache, Hero-Visual, Conversion-Dramaturgie, Typo-System,
Tiefe/Politur und ein bewusster Dark-Mode.

---

## 1. Warum die Iteration 1 nur „ok" wirkt — ehrliche Diagnose

Die bestehenden Components sind sauber gebaut (oklch-Tokens, glow-Shadows, `whileInView`,
korrekte A11y-Grundlagen). Trotzdem wirkt das Ganze austauschbar. Drei konkrete Gründe:

1. **Template-DNA ist sichtbar.** Aurora-Blobs (`blur-3xl` Farbkreise) + Glass-Cards +
   `Inter`/`Inter Tight` + zentrierte Section-Header mit Uppercase-Kicker = exakt der
   Default-Look tausender shadcn/Vercel-Klone. Nichts ist *falsch* — aber nichts ist
   *unverwechselbar*. Es fehlt eine eigene visuelle Signatur.

2. **Der Hero verkauft das Produkt nicht visuell genug.** Die rechte Preview-Karte ist
   ordentlich, aber statisch-flach: ein Score, vier Findings, ein CTA-Strip. Sie zeigt nicht
   den *Aha-Moment* („genau DAS Dokument bekomme ich"). Kein Gefühl von „der Scanner arbeitet
   gerade", keine sichtbare Tiefe des Reports (Kategorien, Before/After, Fix-Plan).

3. **Flache Hierarchie, gleichförmiger Rhythmus.** Fast jede Section ist `max-w-6xl`,
   Padding `py-20/24`, dieselbe Card-Optik, dieselbe Headline-Größe (`text-3xl/4xl`). Es gibt
   kein Display-Moment, keine Dramaturgie der „Oh-nein → Aha → Vertrauen → Angebot"-Reise.
   Preise nutzen `tabular-nums`, aber das Typo-System hat keine echte Display-Scale.

Dazu kleinere Lücken: `TrustSection.tsx` existiert, wird aber **gar nicht** eingebunden.
Kein Dark-Mode-Toggle trotz vorhandener `next-themes`-Dependency und `.dark`-Tokens.
`scroll-behavior: smooth` ohne das in Next 16 nötige `data-scroll-behavior`-Attribut.

---

## 2. Die neue visuelle Sprache — „Audit-Instrument", nicht „SaaS-Template"

Leitidee: **BFSG-Check sieht aus wie ein präzises Mess-Instrument für Barrierefreiheit** —
editorial-seriös (wir reden über Recht & Pflicht) und gleichzeitig technisch-scharf
(wir scannen Code). Vier Bausteine erzeugen die Differenzierung:

### a) Editorial-Serif als Display-Font (der größte Differenzierungs-Hebel)
- **Display/Headlines: `Fraunces`** (optischer Serif, `opsz`-Achse) — warm, autoritär,
  selten im B2B-SaaS. Ein Serif auf einer Compliance-Plattform liest sofort „Substanz,
  Kanzlei-Niveau, kein 0815-Tool". Das ist der Linear/Stripe-Move ins Editorial.
- **Body/UI: `Geist`** (Vercels Grotesk) — technischer und neutraler als Inter, signalisiert
  „modernes Dev-Werkzeug". Der Kontrast Serif-Display ↔ Grotesk-Body erzeugt Spannung &
  Premium-Wirkung, die ein reines Inter/Inter-Tight nie hat.
- **Zahlen/Technik: `Geist Mono`** (`tabular-nums`) für Scores, Preise, Findings-Counts,
  Report-IDs, Code-Snippets — verstärkt das „Mess-Instrument"-Gefühl.
- Alle via `next/font/google` (self-hosted, `display: "swap"`, `latin-ext` für Umlaute).

### b) Signatur-Motiv „Scan-Beam" & Blueprint-Grid
- Eine wiederkehrende **Scanline/Scan-Beam** (animierter mint-Gradient, der über das
  Hero-Visual sweept) als Marken-Geste — taucht subtil im Hero auf und als statisches
  Detail in Section-Akzenten. `prefers-reduced-motion` schaltet sie ab.
- **Blueprint-Grid** statt generischem Raster: feineres, technisch wirkendes Liniengitter
  mit Radial-Maske, dezent als „technischer Untergrund". Nicht überall — gezielt im Hero,
  Stats und CTA.

### c) Tiefe & Politur (gegen den flachen Eindruck)
- **Grain/Noise-Overlay** (inline-SVG `feTurbulence`, `mix-blend-soft-light`, ~3–4 % Opazität)
  global über `body` — nimmt den „digital-flachen" Look, gibt Print-/Papier-Haptik.
- **Border-Gradients** auf Schlüssel-Karten (Hero-Visual, Featured-Pricing) via
  `mask-composite`-Technik statt flacher 1px-Border.
- **Color-tinted Shadows** (bestehende `--shadow-card-*` mit Indigo-Tint) werden konsequenter
  + ein neuer `--shadow-elevated` für das Hero-Visual mit Mint-Glow.
- **Spotlight-Hover** auf Cards (cursor-folgender Radial-Glow) wo es Mehrwert bringt.

### d) Schärferes Typo- & Spacing-System
- Display-Scale per `clamp()`: Hero bis ~5rem, Section-H2 bis ~3.25rem mit `-0.03em`
  Tracking und `text-balance`. Klare Stufen H1 ≫ H2 > H3 > Lead > Body > Meta.
- Konsistenter vertikaler Rhythmus, aber **bewusst variierte** Section-Backgrounds
  (hell → getönt → dark-Inversion bei Stats/CTA) für Dramaturgie statt Monotonie.

### e) Dark-Mode als Premium-Feature
- `next-themes` + Toggle im Header (Sonne/Mond, `aria-label`, no-flash via `suppressHydrationWarning`
  am `<html>`). Die `.dark`-Tokens existieren bereits — wir machen sie nutzbar und feilen sie nach.

---

## 3. Conversion-Dramaturgie (Section-für-Section, mit Prinzipien)

Die Seite folgt bewusst einer psychologischen Reise. Cialdini-Prinzipien & Conversion-Heuristiken
sind je Section benannt. **Keine Fake-Testimonials, keine Konformitäts-Garantie (UWG).**

| # | Section | Conversion-Job | Prinzip |
|---|---------|----------------|---------|
| 1 | **Hero** | „In 60 Sek. Klarheit" + sofort sichtbares Produkt-Visual + Gratis-Scan-Eingabe | Reziprozität (gratis), Aha-Visual, geringe Eintrittshürde |
| 2 | **Live-Scan-Ergebnis** (nach Eingabe) | Der „Oh-nein"-Moment: ehrlich-alarmierendes, aber faires Score-Resultat | Loss Aversion, Konkretheit |
| 3 | **LogoCloud / Presse** | „andere nehmen das ernst" — ehrlich als *Platzhalter* markiert | Social Proof (ehrlich) |
| 4 | **„Die Uhr läuft" / Risiko-Kontext** (NEU) | Sanfte Urgency: BFSG seit 28.06.2025 in Kraft, Abmahn-Mechanik erklärt | Urgency-soft, Authority |
| 5 | **HowItWorks** | Friktions-Abbau: 3 Schritte, kein Workshop, kein Termin | Commitment-Leiter, Klarheit |
| 6 | **Stats / Methodik** (dark) | Authority: dieselben Normen wie Behörden/Kanzleien; Number-Count-up | Authority, Konkretheit |
| 7 | **Differentiators** (statt „Testimonials") | „schneller/tiefer/günstiger" als die 3 Alternativen | Anchoring vs. Alternativen |
| 8 | **Pricing** | Klare Pakete, Profi als Anchor (featured), Risk-Reversal sichtbar | Anchoring, Risk-Reversal, Decoy |
| 9 | **Cookie-Section** | Cross-Sell / zweite Pflicht-Baustelle (Tripwire 49/79 €) | Bündelung, Foot-in-the-door |
| 10 | **FAQ** | Letzte Einwände entkräften (Recht, USt, Widerruf, Daten) + Suche | Einwand-Behandlung |
| 11 | **Final-CTA** (dark) | Letzter klarer Handlungsaufruf + Garantie-Reminder | Risk-Reversal, Klarheit |

Konkrete Conversion-Hebel, die NEU oder verstärkt werden:

- **„Oh-nein"-Moment im Hero-Visual selbst** (nicht erst nach Scan): Das Mock-Report zeigt
  ein realistisches **62/100 · Note C** mit roten kritischen Funden — der Betrachter denkt
  sofort „und wie sieht meine Seite aus?". Loss Aversion noch vor der Interaktion.
- **Before/After-Mikro-Demo** im Hero-Visual (ein Kontrast-Beispiel rot→grün), das den
  *konkreten Nutzen* eines Fixes zeigt — nicht nur „ihr habt ein Problem", sondern „so sieht
  die Lösung aus". (Konkretheit + Reziprozität.)
- **Risk-Reversal prominent**: „30 Tage Geld-zurück bei berechtigter Reklamation" wird vom
  Kleingedruckten zu einem sichtbaren Trust-Element an jeder Kauf-Stelle.
- **Anchoring-Trio in Pricing**: Profi (499 €, featured) zwischen Basis (199 €) und
  Abo (39 €/Mo, „Bald verfügbar") — der visuelle Fokus liegt klar auf Profi.
- **Authority-Zahlen mit Count-up** (Stats): `60 Sek.`, `WCAG 2.1`, `EN 301 549`, `100 %`
  zählen beim Scroll hoch — Bewegung lenkt Aufmerksamkeit auf die Methodik-Substanz.
- **Trust-Leiste** (aus der bisher ungenutzten `TrustSection` weiterentwickelt) als
  durchgehendes Vertrauens-Band: SSL, DSGVO, EN 301 549, Made in Germany.
- **Mikro-Texte gegen Kauf-Angst** an jeder CTA: „ohne Anmeldung · ohne Tracker · Stripe".

Ehrlichkeits-Leitplanken (bewusst, weil wir ein A11y-/Compliance-Produkt sind):
- LogoCloud & „Kundenstimmen folgen" bleiben **explizit als Platzhalter** gekennzeichnet.
- Keine erfundenen Testimonials, keine „abmahnsicher"-Versprechen, keine Garantie der
  Konformität. Titel bleibt „BFSG-konform?" (Frage), nicht „abmahnsicher".

---

## 4. Hero-Visual — der „Aha, DAS bekomme ich"-Moment (reines CSS/SVG/React)

Kein Stock-Foto, kein Raster-Asset. Ein **stilisiertes „BFSG-Audit-Report"-App-Fenster**,
vollständig als React + SVG + Tailwind, das in einem Bild das gesamte Wertversprechen zeigt:

1. **Browser-/App-Chrome** mit Ampel-Punkten und Report-URL (`bfsg-fix.de/report/4f2a`).
2. **Animierter Score-Gauge** (SVG-Halbkreis/Ring): zählt beim Mount von 0 auf **62** hoch,
   der Arc füllt sich (mint→amber-Verlauf je nach Score), darunter „Note C · 17 Funde".
   `Geist Mono`, `tabular-nums`. Bei `reduced-motion`: Endzustand sofort.
3. **Scan-Beam-Overlay**: ein dünner mint-Gradient-Streifen sweept einmalig vertikal über
   die Karte („der Scanner arbeitet") und kommt dann zur Ruhe. Pure CSS-Keyframe.
4. **Kategorisierte Findings** mit echten Severity-Chips (Kritisch/Mittel/Hinweis) und
   Icons — gestaffelt eingeblendet (Wahrnehmung von „Live-Ergebnis").
5. **Before/After-Kontrast-Mini-Demo**: zwei kleine Button-Sample, links „1.9:1 ✗" (rot),
   rechts „7.4:1 ✓" (grün) — zeigt den konkreten Fix.
6. **Fix-Plan-Teaser-Strip**: „+ priorisierter Fix-Plan & Entwurf der Barrierefreiheits-
   erklärung" mit CTA zu `#pakete`.
7. **Schwebende Akzent-Badges** an den Ecken (z. B. „EN 301 549", „PDF-Report") mit dezenter
   Float-Animation — gibt Tiefe/Layering.
8. Rahmen mit **Border-Gradient + Mint-Glow-Shadow**, dahinter ein weicher Aurora-Halo (dezenter
   als bisher, mehr „Spotlight" als „Blob").

Das Visual ist `aria-hidden` für Screenreader (rein dekorativ; alle Infos stehen als Text im
Hero), respektiert `prefers-reduced-motion`, und ist mobile (375px) als kompaktere, aber
vollständige Karte unter dem Text gestapelt.

---

## 5. Section-Plan: bleibt / neu / fliegt — mit Begründung

| Section | Entscheidung | Was konkret |
|---|---|---|
| **Header** | Elevation | + Dark-Mode-Toggle, + aktiver Scroll-Spy-Indikator, schärferes Glass, Serif-Wortmarke |
| **Hero** | Großer Umbau | Neues Audit-Report-Visual (s. o.), Display-Serif-Headline, klarere CTA-Hierarchie |
| **ScanForm / ResultCard** | Logik bleibt 1:1 | Nur visuelles Polish (Beam-Border beim Fokus, Severity-Farben). Backend-Contract `/api/scan` unverändert |
| **LogoCloud** | Bleibt (ehrlich) | Polish; bleibt als Platzhalter markiert |
| **Risiko-/Urgency-Band** | **NEU** | Schmale Section: „BFSG seit 28.06.2025 · so funktioniert die Abmahn-Mechanik" — soft urgency, faktenbasiert |
| **HowItWorks** | Elevation | Stärkere Step-Visualisierung, Connector-Linie als „Scan-Pfad", Serif-Headline |
| **StatsBar** | Elevation | Number-Count-up (`whileInView`), dark mit Blueprint-Grid + Grain |
| **Differentiators** (heißt UI „Warum") | Elevation | Bleibt 3-Spalten, aber als „vs. Alternative"-Anchoring klarer; Spotlight-Hover |
| **TrustSection** | **Reaktiviert** | War ungenutzt → wird zur Trust-Leiste (SSL/DSGVO/EN 301 549/Made in Germany) |
| **Pricing** | Elevation | Featured-Profi mit Border-Gradient + Glow, `Geist Mono`-Preise, Risk-Reversal sichtbar, Toggle behalten |
| **CookieSection** | Bleibt | Nutzt Pricing-Component weiter; Polish |
| **FAQ** | Bleibt | Suche bleibt (Logik unverändert), Polish des Accordions |
| **CtaSection** | Elevation | Dark, Border-Gradient, Scan-Beam-Detail, Garantie-Reminder |
| **Footer** | Elevation | Polish, Serif-Wortmarke, Newsletter-UI (UI-only bleibt) |
| **CookieBanner** | Logik bleibt 1:1 | `useSyncExternalStore`-Consent unverändert, nur Optik |
| **CheckoutModal** | Logik bleibt 1:1 | B2C/B2B-Consent, `/api/checkout`-Contract, `available:false`→„Bald verfügbar" unverändert |

Nichts „fliegt raus" im Sinne von Funktionalität — alle Logik bleibt. Entfernt wird nur
*generische Optik* zugunsten der neuen Signatur.

---

## 6. Performance & A11y (wir SIND ein A11y-Produkt — Vorbild-Pflicht)

- **Motion**: `motion/react-client` (RSC-safe), `whileInView` + `viewport={{ once: true }}`,
  keine Layout-verschiebenden Animationen → **kein CLS**. Count-up & Beam respektieren
  `prefers-reduced-motion` (Hook + CSS-Media-Query).
- **Fonts**: `next/font/google`, `display: "swap"`, `latin-ext`-Subset → keine FOIT, keine
  externen Requests, stabile Metriken.
- **Bilder**: ausschließlich SVG/CSS — keine Raster-Assets, kein `next/image`-Overhead.
- **Kontraste WCAG 2.1 AA**: mint-on-deep & alle Text/BG-Paare geprüft; Mint wird auf hellem
  Grund nie als dünner Text auf Weiß eingesetzt (immer auf dark/tinted oder als Akzentfläche).
- **Semantik & Landmarks**: `header/main/footer/nav/section` mit `aria-labelledby`, korrekte
  Heading-Hierarchie (genau ein `h1`), `aria-hidden` für dekorative Visuals.
- **Fokus**: sichtbarer Fokus-Ring (base-nova-Default + verstärkt), Tab-Reihenfolge logisch,
  Skip-Link zum Hauptinhalt (NEU).
- **Dark-Mode**: no-flash, `color-scheme` gesetzt, Kontraste in beiden Modi AA.

---

## 7. Selbst-QA (Phase 3, vor PR)

1. `npm run lint` → 0 (inkl. Umlaut-Regel: ausschließlich echte ä/ö/ü/ß).
2. `npx tsc --noEmit` → 0.
3. `npm run build` → 0, alle 14 Routen.
4. **Playwright-Render-Audit** (eigenes Script): alle Hauptrouten @375px & @1440px,
   light + dark + `prefers-reduced-motion` → 0 console-errors, 0 pageerror,
   0 Hydration-Mismatch, 0 tote Anchors, **axe-core 0 critical/serious**. Screenshots
   zur Selbstkontrolle.

Akzeptanzkriterium: Wenn der erste Eindruck nicht „WOW, das ist eine Liga höher" ist →
nachbessern vor dem PR. Lieber wenige Sections perfekt als viele mittelmäßig.
