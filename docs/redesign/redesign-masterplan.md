# BFSG-Check Landingpage — Conversion-Redesign-Masterplan

> **Synthese aus 7 Audits (CRO, UI, Motion, Copy, A11y, Mobile/Perf, Brand) — gegen den ECHTEN Codebase-Stand (27.06.2026) abgeglichen.**
> **Wichtige Reconciliation:** Mehrere als „P0" gemeldete Befunde sind im Code **bereits umgesetzt** (die Audits liefen gegen einen älteren Snapshot). Konkret: Dark-Default (`ThemeProvider` `defaultTheme="dark"` + `enableSystem={false}`), `viewport.themeColor: "#0d0e1a"`, Light-Ring auf Indigo gedreht, `MotionConfig reducedMotion="user"`, `ScoreGauge`/`CountUp` reduced-safe, mobile-gegatete Glows, `text-on-deep`-Token. **Diese Punkte sind im Plan als „VERIFY" markiert, nicht als Neubau.** Der reale Arbeitsumfang konzentriert sich auf: Sektions-Skelett-Vereinheitlichung, Mini-Visuals, Wow-Block, persistenter Mobile-CTA, ResultCard-Personalisierung, die 2 Owner-Fixes und Italic-/Kicker-Disziplin.

---

## 0. Design-Prinzipien (dark-first, unsere Farben)

1. **Dark ist die Bühne, nicht eine Option.** Der near-black Indigo-Canvas (`--background` Dark `oklch(0.155 0.025 278)`) ist der garantierte First Paint. Jede neue Fläche wird zuerst im Dark designt und geprüft; Light bleibt funktional, ist aber nicht der Kalibrierungs-Kontext.
2. **EIN Akzent pro Fläche.** Mint = Primär (Headline-Akzentwort, CTA, Frei-Signale). Violet = ausschließlich Tiefen-Glow hinter dunklen Panels, **immer schwächer** als der Mint-Glow derselben Fläche. Amber/Rose = nur Severity/Frist. Nie drei konkurrierende Glows in einem Viewport.
3. **Dynamik kommt aus Mini-Visuals pro Karte, nicht aus mehr Blur.** Stepper-Progress, Stat-Underlines, Severity-Bars, ein Code-Snippet — transform/opacity/SVG-stroke, GPU-billig. Keine neuen Full-Viewport-Blurs, kein `background-attachment:fixed`, kein scroll-gekoppeltes `setState`.
4. **Editorial-Herzschlag: GENAU EIN Fraunces-Italic-Akzentwort pro Headline.** Nicht null (flach), nicht drei (unruhig). Das ist der „teuer"-Trigger und muss über alle Sektionen identisch schlagen.
5. **Sektions-Dreiklang als Pflicht-Skelett:** Kicker-Pill (Icon + UPPERCASE) → Italic-Akzent-Headline → gedämpfte Subline. Eine zentrale Komponente, kein Per-Sektion-Restyle.
6. **Dogfood-A11y ist nicht verhandelbar.** Wir verkaufen Barrierefreiheit — ein abgeschnittenes „?", ein unsichtbarer Fokus-Ring oder ein Sub-AA-Kontrast ist Gegenwerbung. Jeder neue Block wird gegen seinen tatsächlichen Hintergrund auf ≥ AA geprüft.
7. **Der erste Eindruck ist heilig (LCP).** Die Hero-H1 bleibt ohne `opacity`-Entrance. Neue Elemente above-the-fold dürfen weder LCP-Kandidat werden noch CLS erzeugen.

---

## 1. Theme & Foundation (`globals.css` + `ThemeProvider`)

### 1.1 Dark-Default — VERIFY (bereits implementiert)
Der Owner-Hauptwunsch ist **schon im Code**:
- `ThemeProvider.tsx`: `defaultTheme="dark"`, `enableSystem={false}`, `disableTransitionOnChange`, Toggle bleibt funktional.
- `layout.tsx`: `viewport.themeColor: "#0d0e1a"`, `colorScheme: "dark light"`, `suppressHydrationWarning` gesetzt.

**Verbleibende Härtung (klein, empfohlen):**
- **FOUC-Backstop:** Da `enableSystem={false}` und `defaultTheme="dark"`, setzt next-themes die `.dark`-Klasse via Inline-Script vor Hydration. Das ist FOUC-sicher. **Optionaler Gürtel-und-Hosenträger-Schritt:** in `layout.tsx` am `<html>` zusätzlich `className="... dark"` als statische Startklasse — schadet nicht (next-themes überschreibt konsistent) und garantiert auch bei deaktiviertem JS einen dunklen ersten Paint. Nur ergänzen, wenn ein realer Hell-Flash messbar ist; sonst nicht anfassen (Cache/Churn vermeiden).
- **KEINE Änderung** an `enableSystem` — die Owner-Vorgabe „dauerhafter Standard" ist mit `false` korrekt abgebildet.

### 1.2 Neue/zu härtende Tokens & Utilities

**(a) `--border-card` Dark-Härtung.** Aktuell `--border: oklch(1 0 0 / 12%)` ist im Dark grenzwertig unsichtbar auf card-nahen Flächen. Neuen Token + Utility ergänzen:
```css
.dark { --border-card: oklch(1 0 0 / 16%); }   /* neben den bestehenden .dark-Tokens */
:root { --border-card: var(--border); }
```
Auf den drei Differentiator-Karten und HowItWorks-Steps zusätzlich `dark:ring-1 dark:ring-white/5` als sichtbare Kante (statt nur `/12%`-Border).

**(b) `.gradient-text` rechtsseitige Clip-Box-Härtung (löst Owner-Bug 4 zentral — s. §4b):**
```css
.gradient-text {
  /* …bestehend… */
  padding-bottom: 0.1em;
  padding-right: 0.08em;     /* NEU: Italic-Überhang des letzten Glyphs */
  margin-right: -0.08em;     /* NEU: Layout-Breite neutralisieren (kein Shift) */
}
```

**(c) `.gradient-text-on-deep` (neue Utility) für Mint-Akzentwörter auf near-black Panels.** Der bestehende Mint→Violet-Verlauf verliert auf `brand-deeper` den Violet-Anteil unter AA. Saubere Alternative:
```css
.gradient-text-on-deep {
  background-image: linear-gradient(135deg,
    var(--brand-mint) 0%,
    var(--brand-mint-soft) 100%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent; padding-bottom: 0.1em; padding-right: 0.08em; margin-right: -0.08em;
}
```
**Regel:** `.gradient-text` (Mint→Violet) NUR auf `bg-background`/`bg-muted`/`bg-card`. Auf `brand-deeper`/`brand-deep` (StatsBar, CtaSection, Wow-Block-Kicker) → solid `text-brand-mint` ODER `.gradient-text-on-deep`. Diese Regel als Kommentar in `globals.css` über `.gradient-text` verankern.

**(d) `SectionKicker`-Komponente** (s. §2) — ersetzt 4 inkonsistente Kicker-Varianten. Kein neuer CSS-Token nötig, nutzt bestehende Border/Card/Mono-Klassen.

**(e) Neue Keyframe `severity-grow` + Eintrag in die reduced-motion-Liste** (für Severity-Bars/Stat-Underlines, falls als CSS statt motion/react gebaut — empfohlen ist motion/react `whileInView scaleX`, dann KEIN neuer Keyframe nötig). Wenn doch CSS: in `@media (prefers-reduced-motion)` die `animate-none`-Aufzählung (Z448–456) um den neuen Namen erweitern.

### 1.3 Fokus-Ring-Härtung Dark (P0 — real, bestätigt)
`button.tsx` nutzt `focus-visible:ring-ring/50` → im Dark = **Mint-Ring auf Mint-Button** (Hero-CTA, Header-CTA, ScanForm-Submit, featured Pricing) ≈ 1:1 Kontrast, Fokus praktisch unsichtbar (WCAG 2.4.7/2.4.11).
**Fix:** Mint-gefüllte Buttons bekommen einen kontrastierenden Ring. An den konkreten mint-CTAs die Klasse ergänzen:
```
focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background
```
(Hero-Submit `ScanForm.tsx` Z144, Header-CTA `Header.tsx` Z133/181, CtaSection `Z65`, featured PricingCard `Z270`.) `ring-offset-background` ist dunkel — gegen den Mint-Button trennt der dunkle Ring sauber. Im hellen Wow-Block (§3) Block-lokal `focus-visible:ring-brand-deep` + heller Offset (s. dort).

---

## 2. Sektions-Skelett-System

**Neue Komponente:** `components/SectionKicker.tsx` — das Single-Source-Pattern für ALLE Sektionsköpfe.

```tsx
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionKicker({
  icon: Icon, label, tone = "default",
}: { icon: LucideIcon; label: string; tone?: "default" | "warn" | "on-deep" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.18em] shadow-card-soft backdrop-blur",
      tone === "warn"
        ? "border-brand-amber/40 bg-brand-amber/10 text-foreground"
        : tone === "on-deep"
          ? "border-[oklch(0.97_0.004_95)]/20 bg-[oklch(0.97_0.004_95)]/5 text-brand-mint"
          : "border-border/70 bg-card/60 text-brand-indigo dark:text-brand-mint",
    )}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
```

**Header-Block-Norm (mit Komponente):** Kicker → `mt-4` Headline → `mt-4` Subline. Sektions-Standard `py-20 sm:py-24` (Bänder LogoCloud/TrustSection bewusst schmaler, als „Band"-Variante kommentieren).

**Anwendung (Icon-Zuordnung je Sektion):**

| Sektion | Kicker-Label (UPPERCASE) | Icon | tone |
|---|---|---|---|
| LogoCloud | GEPRÜFT NACH ANERKANNTEN STANDARDS | `ShieldCheck` | default |
| RiskBand | SEIT 28.06.2025 IN KRAFT | `AlertTriangle` | **warn** |
| HowItWorks | WIE ES FUNKTIONIERT | `ScanLine` | default |
| StatsBar | GEPRÜFT NACH ANERKANNTEN NORMEN | `ShieldCheck` | **on-deep** |
| Testimonials | WARUM BFSG-CHECK | `Sparkles` | default |
| WowCounter (neu) | DER PRÜFUMFANG | `Gauge` | default (heller Block → Indigo-Text, s. §3) |
| PricingCards | PAKETE & PREISE | `Tag` | default |
| CookieSection | PFLICHT-BAUSTELLE NR. 2 | `Cookie` | **warn** |
| FAQ | FAQ | `HelpCircle` | default |

CtaSection-Kicker bleibt inline (dunkles Panel, eigene `on-deep`-Anmutung — kann optional auf `SectionKicker tone="on-deep"` migriert werden).

---

## 3. Sektion-für-Sektion-Plan

### Reihenfolge in `app/page.tsx` (CRO-P0: Risk-Reversal vor Preis + Wow-Peak)
**Alt:** Hero → LogoCloud → RiskBand → HowItWorks → StatsBar → Testimonials → PricingCards → TrustSection → CookieSection → FAQ → CtaSection
**Neu:**
```
Hero → LogoCloud → RiskBand → HowItWorks → Testimonials → StatsBar
  → WowCounter (NEU) → TrustSection → PricingCards → CookieSection → FAQ → CtaSection
```
Begründung: Schmerz (RiskBand) → Mechanismus (HowItWorks) → Lösung/Anchoring (Testimonials) → Authority (StatsBar) → **Proof-Höhepunkt (WowCounter)** → Risk-Reversal (TrustSection) → **Entscheidung (Pricing)** → Cross-Sell (Cookie) → Resteinwände (FAQ) → Final-CTA. TrustSection wandert VOR Pricing (Kauf-Angst-Reduktion direkt vor der Preisentscheidung).

---

**Header** (`Header.tsx`)
- **CTA-Wording vereinheitlichen:** Desktop Z136 + Mobile Z184 „Gratis prüfen" → **„Kostenlos prüfen"** (kanonisch, s. §5). Sekundär „Konto" (Z130) → **„Konto verwalten"** (Angleich an Mobile).
- **Wortmarke:** „Check" (Z90) als Fraunces-**Italic** setzen (`italic`) — Editorial-Kohärenz, hebt die Marke vom Body ab.
- **Mint-CTA Fokus-Ring** härten (§1.3).
- **Mobile-Perf:** `backdrop-blur-md` → `max-md:backdrop-blur-sm` (auf 360px visuell gleichwertig, billigeres Sampling).

**Persistenter Mobile-Sticky-CTA (NEU, CRO-P0)** — neue Komponente `components/MobileStickyCta.tsx`, in `layout.tsx` nach `<Footer/>` einhängen:
```tsx
// fixed inset-x-0 bottom-0 z-40 md:hidden, einblenden ab scrollY > ~Hero-Höhe (600px),
// bg-background/90 backdrop-blur-md border-t pb-[env(safe-area-inset-bottom)]
// Mint-Button "Kostenlos prüfen" → href="/#scan". Einblenden via opacity/translateY-Transition,
// reduced-motion: sofort sichtbar. Kein Dauer-Blur-Layer, kein Pulsieren.
```

---

**Hero** (`Hero.tsx`) — beide Owner-Fixes hier, Details in §4
- Preview-Heading hochstufen (§4a).
- „?"-Clipping fixen (§4b).
- H1 bleibt **ohne** Entrance (LCP). Pill, Form, Preview-Heading dürfen animieren.
- **Pill-Ziel (CRO-P2):** `href="#risiko"` → **`href="#scan"`** (Urgency direkt in den Free-Scan leiten statt in eine Info-Sektion). Alternativ Pill auf `#risiko` belassen UND RiskBand einen eigenen CTA geben (s. RiskBand).

**HeroVisual** (`HeroVisual.tsx`) — bereits stark (ScoreGauge, Scan-Beam, Findings, Severity-Dots mit Textlabel = WCAG-1.4.1-konform).
- **Optional (Motion-P2):** `ScoreGauge` von `setTimeout`-on-Mount auf `useInView`-Trigger umstellen (wie `CountUp`), damit der Effekt below-the-fold re-triggert. Niedrige Prio.
- **Mobile-Blur-Budget:** die zwei `blur-[80px]`-Halos (Z28/29) auf Mobile reduzieren — zweiten Halo (`blur-[80px]` violet, Z29) `md:block` gaten + ersten auf `max-md:blur-[40px]`.

---

**LogoCloud** (`LogoCloud.tsx`)
- `SectionKicker` (tone default, Icon `ShieldCheck`) statt nacktem Mono-Text.
- **KEIN Marquee auf Mobile** (Mobile-P0). Falls Marquee gewünscht: `md:` gegatet, `translate3d`, duplizierte Liste mit `aria-hidden`-Klon, IntersectionObserver-`will-change`. Empfehlung: bei der statischen `flex-wrap`-Chip-Liste bleiben (lesbarer auf 360px) — Marquee ist optional und niedrig priorisiert.

---

**RiskBand** (`RiskBand.tsx`)
- `SectionKicker tone="warn"` (Icon `AlertTriangle`).
- **Italic-Akzentwort:** Headline-Copy in config kürzen (s. §5), ein Wort als `italic gradient-text` (z.B. „verstrichen").
- **Mini-Visual (Motion-P1):** pro Point eine dünne amber **Severity-Bar** unter dem Wert, beim In-View `scaleX 0→1` (origin-left). Stichtags-Item (i===0) Icon-Badge `animate-pulse-soft`. **KEIN Countdown-Timer** (Frist ist verstrichen — sachlich falsch + UWG-nah).
- **CTA (CRO-P2):** Button „In 60 Sek. prüfen" → `#scan` ans Ende des Text-Blocks (Urgency nicht in Sackgasse enden lassen).
- `card-lift`-Hover vereinheitlichen (s.u.).

---

**HowItWorks** (`HowItWorks.tsx`)
- `SectionKicker` (Icon `ScanLine`). Italic ist schon korrekt (1 Wort „Fix-Plan" — nach Copy-Straffung, s. §5).
- **Mini-Visual (Motion-P0):** die statische dotted-Line (Z51–58) als Track behalten, darüber eine `motion.div` `whileInView={{scaleX:1}} initial={{scaleX:0}}` (origin-left, `h-px`, `bg-gradient-to-r from-brand-mint via-brand-violet to-transparent`, duration ~1.1s). Pro Step-Icon dezent pulsierender Ring (`animate-pulse-soft`, `delay=i*0.25`). Nur `md:` (Pfad ist `md:block`).
- Mittlerer Step (i===1) als **Schlüsselkarte** mit `border-gradient`.

---

**Testimonials / Differentiators** (`Testimonials.tsx`)
- `SectionKicker` (Icon `Sparkles`).
- **Italic auf 1 Wort reduzieren** (aktuell ganzer Satz „Tiefer als Gratis-Tools." italic) → Copy-Straffung §5, nur „tiefer" italic.
- **Mini-Visual (Motion-P1):** in die „Tiefer als Gratis-Tools"-Karte ein **Mono-Snippet-Widget** (gestaffelter `opacity`-Einlauf der Zeilen, `delay i*0.15`, mint Cursor-Blink `animate-pulse-soft`). Streng technische Pflichtsprache:
  `axe.run() → 17 violations` / `contrast 1.9:1 → fix #0b3d2e (7.4:1)` / `✓ Report kuratiert`
- **Disclaimer-Microcopy umdrehen (Copy-P2):** „Echte Kunden-Stimmen folgen nach Launch…" → „Wir zeigen lieber prüfbare Fakten als gekaufte Sternebewertungen — jeder Befund im Report ist belegbar."
- **KEIN Fake-Testimonial-Carousel.** Der ehrliche Differentiator-Block bleibt der UWG-saubere Ersatz.

---

**StatsBar** (`StatsBar.tsx`) — dunkles `brand-deeper`-Panel
- `SectionKicker tone="on-deep"` (Icon `ShieldCheck`).
- **Italic-Akzentwort:** „…Behörden und **Kanzleien**." → `italic text-brand-mint` (NICHT `gradient-text` — Violet fällt auf near-black unter AA).
- **Stat-Underline (Motion-P0/Brand-P2):** unter jede `<dt>` eine 2px-Akzent-Underline, `motion.span scaleX 0→1` origin-left, `bg-gradient-to-r from-brand-mint to-transparent`, `delay i*0.07`. Auch für statische Items (Konsistenz).
- **Akzent-Sparsamkeit (Brand-P1):** violet Glow (Z27) von `/30` → `/18`, kleiner/weiter in die Ecke.

---

**WowCounter (NEU)** — `components/WowCounter.tsx`, heller Inverted-Block, Proof-Höhepunkt
- **Position:** zwischen StatsBar und TrustSection.
- **Look:** `bg-[oklch(0.97_0.004_95)]` (creme, invers zum Dark-Flow), `text-brand-deep`, `rounded-[2rem]`, `border-gradient`.
- **Counter:** bestehendes `<CountUp>`, **ehrliche Kennzahl `80` suffix `+`** (Prüfregeln EN 301 549) — KEINE erfundene Aggregat-Zahl (UWG §5, größter Compliance-Risikopunkt). `font-display text-[clamp(3.5rem,12vw,8rem)] tabular-nums`. **Counter-Farbe `text-brand-deep`** (Mint auf creme ≈ 2,2:1 = FAIL), Mint nur als dekorative Underline (`block h-1 w-16 rounded-full bg-brand-mint`).
- `CountUp` `min-w` an Endwert anpassen (3-stellig reicht für „80").
- **Darunter:** 3 Mini-Trust-Chips (WCAG 2.1 AA / EN 301 549 / DE-Hosting) — alle belegbar.
- **A11y-Block-lokal:** Kicker `text-brand-indigo`, Subline `text-foreground/70` NUR weil bg hell; Fokus-Ringe falls interaktiv `ring-brand-deep` + heller Offset. Keine `text-[oklch(0.97…)]`-Literale aus StatsBar/Cta kopieren (würden auf creme unsichtbar).
- **Perf:** heller bg als flat color/gradient, KEIN zusätzlicher Blur-Blob. Glows (falls) `md:` gegatet.

---

**TrustSection** (`TrustSection.tsx`) — wandert VOR PricingCards
- `card-lift`-Hover vereinheitlichen. Optional `SectionKicker` (ist aktuell ein Band ohne Header — kann so bleiben, als „Band" kommentieren).

---

**PricingCards** (`PricingCards.tsx`)
- `SectionKicker` (Icon `Tag`).
- **Italic-Akzentwort** im default title: „Ein **Festpreis** statt Stundensatz…" (config, §5).
- **Kauf-CTA (Copy-P0):** „Jetzt bestellen" (Z274) → **„Paket kaufen"** (konkreter Objektbezug; Abo bleibt „Abo starten"). Trennt das Register gratis(prüfen)/kauf(en).
- featured-Karte hat bereits `border-gradient` — als EINE Schlüsselkarte beibehalten.
- Mint-Button Fokus-Ring härten (§1.3).

---

**CookieSection** (`CookieSection.tsx`) — als Cross-Sell subordinieren (CRO-P1)
- `SectionKicker tone="warn"` (Icon `Cookie`), Label „PFLICHT-BAUSTELLE NR. 2".
- **Italic auf 1 Wort:** „die **zweite** Abmahn-Front." (nur „zweite" italic, Copy §5).
- **Visuell subordinieren:** kleinere Headline (`sm:text-3xl` statt `sm:text-[2.75rem]`), kompaktere Preis-Typo im embedded PricingCards. Keine Preis-/Feature-Änderung (Guardrail) — nur Hierarchie. Position (nach Pricing, vor FAQ) ist bereits korrekt.

---

**FAQAccordion** (`FAQAccordion.tsx`)
- `SectionKicker` (Icon `HelpCircle`).
- **Italic-Akzentwort:** „Häufige Fragen — **ehrlich** beantwortet." → `italic gradient-text` auf „ehrlich".

---

**CtaSection** (`CtaSection.tsx`) — dunkles Panel
- Italic „bevor andere es tun?" ist `text-brand-mint` (korrekt für dunkles Panel) — beibehalten ODER auf 1 Wort straffen.
- CTA „Kostenlos prüfen" ist bereits kanonisch — gut.
- **Akzent-Sparsamkeit:** violet Glow (Z30) `/35` → `/22`.
- Mint-CTA Fokus-Ring härten (§1.3).

---

**ResultCard** (`ResultCard.tsx`) — Aktivierungs-Moment personalisieren (CRO-P0, höchster Conversion-Hebel)
- **Footer-Copy dynamisch** statt generisch „Vollreport mit jedem Mangel…":
  - tone `bad`/`warn`: „Ihre Seite hat **{totalIssues} Funde**. Der Vollreport zeigt jede Stelle + Copy-Paste-Fix."
  - score ≥ 75 (positive): Framing drehen → „Lassen Sie sich die saubere WCAG-Erstprüfung **schriftlich bestätigen**." (Dokumentations-Nutzen statt Angst).
- **Button-Wording score-abhängig:** statt statisch „Vollreport sichern" → „Alle **{totalIssues}** Mängel beheben" (bei Funden).
- **URL + Score in den Checkout durchreichen:** `openCheckout("profi")` → zusätzlich `setUrl`/Score via `checkout-context`, damit das Modal die geprüfte URL + Mini-Zusammenfassung („Bestellung für ihre-website.de · 17 Funde") zeigt. Schließt die Personalisierungs-Schleife bis zum Bezahl-Button.
- Severity bleibt doppelt codiert (Icon + Farbe — ist schon korrekt, Z127ff.).

---

**Globaler Hover (Motion-P2):** `@utility card-lift` in `globals.css`:
`hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-mint/40 transition-all duration-300` — auf ALLE Karten-Sektionen (auch RiskBand/TrustSection, die aktuell nur Border wechseln). `-translate-y-1` statt `-1.5` wirkt ruhiger/teurer.

---

## 4. Die 2 konkreten Owner-Fixes

### 4a) Preview-Heading vergrößern + als Sub-Überschrift

**Datei:** `Hero.tsx` Z178–186. **Bleibt `<p>`** (KEIN `<h2>` — visuelle Größe ≠ Heading-Semantik, sonst springt die Screenreader-Outline, WCAG 1.3.1). Chip-Charakter („Beispiel") bleibt (Legal-Transparenz).

**Alt:**
```tsx
<p className="mb-4 flex items-center justify-center gap-2 text-center text-sm font-semibold tracking-tight text-foreground lg:justify-start lg:text-left">
  <span … >Beispiel</span>
  <span>{HERO_VISUAL.previewHeading}</span>
</p>
```
**Neu (zweizeilige Komposition: Chip-Zeile + Sub-Headline):**
```tsx
<div className="mb-5 text-center lg:text-left">
  <span aria-hidden className="inline-flex shrink-0 items-center rounded-md bg-brand-amber px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-brand-deep uppercase">
    Beispiel
  </span>
  <motion.p
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.15 }}
    className="mt-2 font-display text-[clamp(1.05rem,2.4vw,1.35rem)] font-semibold leading-snug tracking-tight text-foreground text-balance"
  >
    Ihr <span className="italic gradient-text">Sofort-Ergebnis</span> — in 60 Sekunden
  </motion.p>
</div>
```
- `font-display` + Italic-Akzentwort „Sofort-Ergebnis" → Editorial-Kohärenz, klar als Vorschau lesbar, **klar kleiner als H1** (max ~1.35rem → kein LCP-Kandidat, kein Hierarchie-Kipp).
- `previewHeading` in config kürzen (§5).
- Mobile bewusst klein halten (sitzt unter dem Hero-Text — Fold nicht aufblähen). Fester `line-height` gegen Font-Swap-CLS.

### 4b) BFSG-„?"-Clipping

**Root-Cause (4 zusammenwirkende Ursachen, bestätigt im Code):**
1. `Hero.tsx` Z81: `<span className="block italic gradient-text">{HERO.headlineEmph}</span>` — `headlineEmph = "bereit fürs BFSG?"`.
2. `.gradient-text` (`globals.css` Z268) nutzt `background-clip:text` und hat **nur `padding-bottom`**, kein `padding-right` → der Fraunces-**Italic-Überhang** des „?" liegt außerhalb der Clip-Box.
3. H1 `tracking-[-0.025em]` (Z77, negativ) zieht das letzte Glyph zusätzlich an den Rand.
4. `section overflow-hidden` (Z17, nötig für Glow-/Float-Badge-Eindämmung) kappt den Überhang hart.

**Fix (layout-neutral, ZWEI Maßnahmen — Defense in Depth):**

**(1) Zentral in `.gradient-text`** (deckt auch HowItWorks/Testimonials/Cookie-Italic-Headlines mit ab):
```css
.gradient-text {
  /* …bestehend… */
  padding-right: 0.08em;
  margin-right: -0.08em;   /* Layout-Breite neutralisieren → kein Shift, kein CLS */
}
```
**(2) Satzzeichen aus dem Italic ziehen** (sauberste Lösung an der Wurzel) — `Hero.tsx` Z81–83:
```tsx
<span className="block">
  <span className="italic gradient-text">{HERO.headlineEmph}</span>
  <span className="not-italic gradient-text">?</span>
</span>
```
und `headlineEmph` in config von `"bereit fürs BFSG?"` → `"bereit fürs BFSG"` (das „?" wandert ins separate `not-italic`-Span). Das „?" hat ohne Italic keinen Rechts-Überhang → Clipping verschwindet an der Quelle; das `padding-right` ist der Backstop.

**NICHT tun:** `overflow-hidden` der Section entfernen (bricht Float-Badge/Beam-Clipping + erzeugt horizontalen Scroll auf Mobile, WCAG 1.4.10) · `letter-spacing` global ändern (verschiebt das ganze H1-Grid) · `transform: translateX` (Layout-Shift).
**Verifikation:** Playwright bei 320/360/390/414px + 200%/400% Zoom — kein Clipping, kein horizontaler Scroll.

---

## 5. Copy-Änderungen (`lib/config.ts`) — legal-konform

| Ort | Alt | Neu | Grund |
|---|---|---|---|
| `HERO.headlineEmph` | `bereit fürs BFSG?` | `bereit fürs BFSG` | „?" wandert in separates `not-italic`-Span (§4b). Bereitschafts-FRAGE bleibt (kein „BFSG-konform"). |
| `HERO.cta` | `Jetzt kostenlos prüfen` | `Kostenlos prüfen` | Kanonische Free-Scan-CTA (kürzer, imperativ). Wirkt auf ScanForm-Submit. |
| `HERO_VISUAL.previewHeading` | `So sieht Ihr kostenloses Sofort-Ergebnis aus` | `Ihr Sofort-Ergebnis — in 60 Sekunden` | Kürzer, Italic-Akzentwort, Sub-Headline-tauglich (§4a). „Beispiel"-Chip bleibt = Legal-Transparenz. |
| `RISK_BAND.title` | `Die BFSG-Frist ist seit dem 28. Juni 2025 verstrichen — und die ersten Abmahnungen sind da.` | `Die BFSG-Frist ist <i>verstrichen</i> — und die ersten Abmahnungen sind da.` (Stichtag in Kicker/Subline, ist dort schon) | 1 Italic-Wort, bessere Scanbarkeit. |
| `Header.tsx` Z136/184 | `Gratis prüfen` | `Kostenlos prüfen` | CTA-Konsistenz. |
| `Header.tsx` Z130 | `Konto` | `Konto verwalten` | Angleich an Mobile, beseitigt Login-Erwartungslücke. |
| `PricingCards.tsx` Z274 | `Jetzt bestellen` | `Paket kaufen` | Kauf-Register getrennt von Prüf-Register. |
| `Testimonials.tsx` Z30–33 | `Schneller als die Kanzlei. <i>Tiefer als Gratis-Tools.</i> Günstiger als Beratung.` | `Schneller als die Kanzlei, <i>tiefer</i> als jedes Gratis-Tool.` | 1 Italic-Wort statt ganzer Satz. |
| `Testimonials.tsx` Z74–77 | `Echte Kunden-Stimmen folgen nach Launch — …Pseudo-Quotes.` | `Wir zeigen lieber prüfbare Fakten als gekaufte Sternebewertungen — jeder Befund im Report ist belegbar.` | Vertrauens-Leck → Anti-Fake-Statement (UWG-sauber). |
| `HowItWorks.tsx` Z40–42 | `…vom Verdacht zum <i>handfesten Fix-Plan</i>.` | `…vom Verdacht zum <i>Fix-Plan</i>.` | 1 Italic-Wort. |
| `CookieSection.tsx` Z24–27 | `…die <i>zweite Front</i> der Abmahn-Welle.` | `Cookie & Consent — die <i>zweite</i> Abmahn-Front.` | 1 Italic-Wort. |
| `StatsBar.tsx` Z39 | `Dieselben Normen wie Behörden und Kanzleien.` | `Dieselben Normen wie Behörden und <i>Kanzleien</i>.` (italic **text-brand-mint**, nicht gradient) | 1 Italic-Wort, AA auf dunklem Panel. |
| `FAQAccordion.tsx` Z42 | `Häufige Fragen — ehrlich beantwortet.` | `Häufige Fragen — <i>ehrlich</i> beantwortet.` | 1 Italic-Wort. |
| `PricingCards.tsx` Z32 (default title) | `Ein Festpreis statt Stundensatz — …` | `Ein <i>Festpreis</i> statt Stundensatz — …` | 1 Italic-Wort. |
| `ResultCard.tsx` Z163–179 | generischer Footer + „Vollreport sichern" | score-/fund-abhängig (§3 ResultCard) | Personalisierter Aktivierungs-CTA. |

**Verboten (Guardrail-Recap):** kein „BFSG-konform/rechtssicher/garantiert/TÜV/DEKRA"; Italic-Akzentwort nie auf legal heikle Wörter; Preise/Features/Money-Back/§-19-/§-25-/FAQ-Antworten **inhaltlich unverändert** (nur Darstellung). **Pflicht:** vor PR-Merge `legal-copy-grep`-Skill laufen lassen.

---

## 6. Motion-Inventar (performant, reduced-motion-safe)

| Sektion | Animation | Technik | Guard |
|---|---|---|---|
| Hero H1 | **keine** (LCP) | — | — |
| Hero Preview-Heading | `opacity/y` Entrance, `delay 0.15` | motion/react | MotionConfig |
| HowItWorks | Progress-Line `scaleX 0→1` (md), Step-Ring `pulse-soft` gestaffelt | `whileInView` + CSS-keyframe | MotionConfig + @media-Liste |
| StatsBar | Stat-Underline `scaleX 0→1`, `delay i*0.07` | `whileInView` motion.span | MotionConfig |
| RiskBand | Severity-Bar `scaleX 0→1`, Stichtags-Icon `pulse-soft` | `whileInView` + CSS | beide geguardet |
| Testimonials | Mono-Snippet Zeilen-`opacity` gestaffelt, Cursor `pulse-soft` | motion.li + CSS | beide |
| WowCounter | `CountUp` (rAF, `useInView`, reduced→Endwert sofort) | bestehende Komponente | bereits reduced-safe |
| HeroVisual | Scan-Beam, Float-Badges, ScoreGauge (rAF) | bestehend | `!reduced`-Gate + MotionConfig |
| Alle Karten | `card-lift` Hover + In-View-Stagger (`once:true`) | CSS transition + motion | MotionConfig |

**Harte Regeln:** jedes neue rAF/Count-up MUSS `usePrefersReducedMotion()` + `if (reduced) return` + statischen Endwert (Muster aus `ScoreGauge`/`CountUp`). Jeder neue Endlos-Keyframe MUSS in die `animate-none`-Liste (`globals.css` Z448–456). Keine neuen Full-Viewport-Blurs, kein `background-attachment:fixed`, kein scroll-gekoppeltes `setState`. Mobile-Stagger kürzen / `viewport.margin` großzügiger, damit Sektionen nicht „halb-leer" einscrollen.

---

## 7. A11y- & Performance-Guardrails (Zielwerte)

**Dark-Kontrast (gegen tatsächlichen Sektions-bg messen, ≥ WCAG AA):**
- Body/UI-Text ≥ `text-foreground/70` bzw. `text-muted-foreground` (8,46:1). `/60` nur ≥18px, `/50` **verboten**.
- `.gradient-text` (Mint→Violet) nur auf `bg-background/muted/card` und nur ab ~24px (large text, AA 3:1). Auf near-black Panels → solid `text-brand-mint` oder `.gradient-text-on-deep`.
- WowCounter-Block (hell): Counter `text-brand-deep` (≈12:1 auf creme), Mint NUR dekorativ. Trust-Badges ≥3:1.
- **Fokus-Ring:** Mint-Buttons → `ring-brand-deep/70` (§1.3). Heller Block → `ring-brand-deep` + heller Offset. Jeder der 4 Flächentypen (Dark-Canvas, Card, Mint-Button, heller Block) durchklicken: ≥3:1 Ring-zu-Nachbar + sichtbarer Offset.
- **Severity immer doppelt codieren** (Icon/Textlabel + Farbe, WCAG 1.4.1).
- Neue interaktive Mikro-Controls (Sticky-CTA, etwaige Dots) ≥44px Hit-Area.

**Performance/LCP:**
- H1 ohne `opacity`-Entrance (bestehend, beibehalten).
- Pro Sektion **max. 1 großer Blur-Blob** auf Mobile; zweite Glows `md:` gegatet, `max-md:blur-[40px]`.
- Preview-Heading ≤1.35rem (kein LCP-Kandidat). CountUp mit `min-w`/`tabular-nums` (CLS=0).
- Grain/Glows bleiben `md+`-gegatet (bestehend). Sticky-CTA: einfache `fixed`-Leiste, `backdrop-blur-md`, Einblenden via Scroll-Threshold, `pb-[env(safe-area-inset-bottom)]`.

---

## 8. Umsetzungs-Reihenfolge + Risiko-/Build-Hinweise

> **Build-Verify-Regel (Memory `build-verify-before-merge`):** Kein PR-CI — Merge auf `main` deployt live. **Vor jedem PR lokal `npm run build` + `npm run lint` im `landingpage-next/` Worktree** (TypeScript-Strict, ESLint-No-ASCII-Umlaute → echte ä/ö/ü/ß). **`legal-copy-grep`-Skill** vor Merge. **AGENTS.md beachten:** „This is NOT the Next.js you know" — bei Next-API-Fragen `node_modules/next/dist/docs/` konsultieren.

**Schritt 1 — Foundation (risikoarm, hohe Hebelwirkung).**
`globals.css`: `.gradient-text` padding-right/margin-right, `.gradient-text-on-deep`, `--border-card`, `card-lift`-Utility, Kontrast-Regel-Kommentar. → Sofort die 2 Owner-Fixes (§4a/§4b) in `Hero.tsx` + config. **Risiko:** minimal, layout-neutral. **Verify:** Playwright-Overflow-Check 320–414px.

**Schritt 2 — Dark-Default verifizieren** (kein Neubau): `npm run dev`, First Paint = Dark prüfen, Toggle funktioniert, kein FOUC. Nur falls Flash messbar: statische `dark`-Klasse am `<html>` ergänzen.

**Schritt 3 — `SectionKicker` + Fokus-Ring-Härtung.** Komponente bauen, auf alle 9 Sektionsköpfe ziehen, Mint-Button-Ringe härten. **Risiko:** mittel (viele Dateien) — pro Sektion einzeln testen.

**Schritt 4 — Copy + Italic-Disziplin** (§5). Alle Headline-Spans auf 1 Italic-Wort, config-Strings. `legal-copy-grep`. **Risiko:** niedrig.

**Schritt 5 — `page.tsx`-Reihenfolge** (TrustSection vor Pricing) + `WowCounter` bauen und einhängen. **Risiko:** mittel — WowCounter-Kontraste (heller Block!) separat gegen creme prüfen, Counter-Zahl `80+` (KEINE erfundene Aggregat-Zahl — größter UWG-Risikopunkt).

**Schritt 6 — Mini-Visuals** (HowItWorks-Progress, StatsBar-Underline, RiskBand-Severity-Bar, Testimonials-Snippet). Jede Animation gegen reduced-motion testen (DevTools „Emulate prefers-reduced-motion"). **Risiko:** mittel (Motion-Bugs) — eins nach dem anderen.

**Schritt 7 — Persistenter Mobile-Sticky-CTA + ResultCard-Personalisierung** (CRO-P0). Sticky-CTA Scroll-Threshold + safe-area testen. ResultCard score-abhängiges Wording + URL/Score in Checkout-Context durchreichen (`CheckoutModal` read-only URL mit „Ändern"-Link + Trust-Mikro-Zeile). **Risiko:** mittel — Checkout-Flow ist Geld-Pfad; ScanForm→ResultCard→Modal end-to-end testen, keine Score-Felder erfinden, nur echte Scan-Daten.

**Schritt 8 — Politur:** `card-lift` flächendeckend, Akzent-Glow-Sparsamkeit (StatsBar/Cta violet runter), CookieSection subordinieren, HeroVisual-Blur-Budget, Wortmarke-Italic. **Risiko:** niedrig.

**Globale Risiken:**
- **UWG (höchstes):** WowCounter-Zahl + alle neuen Count-ups nur belegbar (80+ Prüfregeln, WCAG 2.1 AA, EN 301 549, DE-Hosting). Keine Fake-Logos/Testimonials/Scarcity.
- **A11y-Regression (Dogfood):** jeder neue Block gegen seinen echten bg auf AA; Fokus auf allen 4 Flächentypen.
- **Cache (Memory `prompt-caching-rule`):** kein Mid-Session-Modellwechsel; CLAUDE.md/`.claude/agents/` nicht mitten im Task ändern.
- **Branch-Lag (Memory `working-branch-lags-main`):** vor Start `git fetch` + `origin/main` lesen — der Code ist hier bereits weiter als die Audit-Snapshots.

---

**Relevante Dateien (absolut):**
`C:\Users\Administrator\bfsg-check\landingpage-next\app\globals.css` · `…\app\page.tsx` · `…\app\layout.tsx` · `…\components\ThemeProvider.tsx` · `…\components\Hero.tsx` · `…\components\HeroVisual.tsx` · `…\components\Header.tsx` · `…\components\StatsBar.tsx` · `…\components\HowItWorks.tsx` · `…\components\RiskBand.tsx` · `…\components\Testimonials.tsx` · `…\components\PricingCards.tsx` · `…\components\CookieSection.tsx` · `…\components\TrustSection.tsx` · `…\components\FAQAccordion.tsx` · `…\components\CtaSection.tsx` · `…\components\ResultCard.tsx` · `…\components\ScanForm.tsx` · `…\components\CountUp.tsx` · `…\components\ui\button.tsx` · `…\lib\config.ts`
**Neu anzulegen:** `…\components\SectionKicker.tsx` · `…\components\WowCounter.tsx` · `…\components\MobileStickyCta.tsx`