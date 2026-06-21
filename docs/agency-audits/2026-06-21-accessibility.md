# Accessibility-Audit — BFSG-Check Landingpage (`landingpage-next/`)

**Produkt:** bfsg-fix.de Marketing-Site (Next.js 16 · Tailwind v4 · shadcn/base-ui)
**Standard:** WCAG 2.1 AA (EN 301 549 / BFSG-Baseline) — plus relevante 2.2-Kriterien (2.5.8 Target Size, 2.4.11 Focus Not Obscured)
**Datum:** 2026-06-21
**Auditor:** AccessibilityAuditor (Agency-Agent)
**Methode:** Statische Code-Analyse der `.tsx`/`.css`-Quellen. **KEIN** Live-axe-core/Lighthouse/Screenreader-Lauf möglich (Read-only-Auftrag, Site nicht gebaut/gestartet).
**Scope:** `app/*/page.tsx` (inkl. Legal), `app/layout.tsx`, `app/globals.css`, alle `components/*.tsx`, `components/ui/*.tsx`.

> **WARUM EXISTENZIELL:** Wir verkaufen automatisierte WCAG-Audits. Ein Interessent WIRD axe/Lighthouse auf uns laufen lassen. Eigene AA-Verstöße = Glaubwürdigkeits- und UWG-§5-Risiko (implizite Accessibility-Behauptung, die wir nicht halten). Die Latte liegt hier höher als „compliant".

---

## Executive Summary

### Pass/Fail je WCAG-Prinzip (POUR)

| Prinzip | Status | Begründung (Kurz) |
|---|---|---|
| **Perceivable** | ⚠️ PARTIAL | Landmarks/Headings/Alt sehr sauber. Offene Punkte: Kontrast einiger Mint-auf-hell-Flächen, Grade-Farbe als einziger Bedeutungsträger (1.4.1), Score-Gauge ohne Textäquivalent ist OK (aria-hidden + Textdoppelung). |
| **Operable** | ⚠️ PARTIAL | Skip-Link, sichtbarer Focus-Ring, 44px-Targets in Forms ✅. Offen: `prefers-reduced-motion` greift NICHT für 35 JS-Animationen (Framer Motion); Default-Button-Größe 32px (nur intern genutzt); kein `<Esc>`-Test möglich (base-ui liefert es i.d.R., live verifizieren). |
| **Understandable** | ✅ PASS (code-verifizierbar) | `lang="de"`, konsistente Nav, klare Labels, Fehler als Toast — aber Toast-Errors sind nicht feld-assoziiert (3.3.1, siehe A-07). |
| **Robust** | ✅ PASS (code-verifizierbar) | Semantische Primitives (base-ui Dialog/Radio/Accordion/Checkbox), korrekte ARIA. Live-Verifikation der base-ui-internen ARIA empfohlen. |

**Gesamt:** PARTIALLY CONFORMS. Keine Blocker, die einen Screenreader-User komplett aussperren — aber mehrere Major-Punkte, die ein axe/manueller Lauf findet und die für genau dieses Produkt rufschädigend sind.

### Top 3 Must-Fix vor (Marketing-)Launch

1. **A-01 — `prefers-reduced-motion` deckt die JS-Animationen nicht ab (WCAG 2.3.3 / Spirit 2.2.2).** 35 Framer-Motion-Entry-Animationen (Hero, RiskBand-Stagger, PricingCards, StatsBar …) ignorieren die System-Präferenz. Die CSS-`@media`-Regel in `globals.css` stillt nur CSS-`@keyframes`, nicht `motion/react`. **Fix:** Global `<MotionConfig reducedMotion="user">` in `layout.tsx`. ~1 Zeile, killt das Problem für alle Komponenten.
2. **A-02 — Cookie-Banner: 2-Button-Ungleichgewicht (WCAG 1.4.1 + UWG/TDDDG).** „Alle akzeptieren" ist Primary (gefüllt, mint), „Nur notwendige" ist `outline` (zurückhaltend). Rechtlich (2-Button-Gleichgewicht) UND visuell muss „Ablehnen" gleich prominent sein. **Fix:** beide Buttons gleicher visueller Rang.
3. **A-03 — Farbe als einziger Bedeutungsträger bei Findings/Score (WCAG 1.4.1).** `SeverityDot`, `ResultCard`-Tonfarben und der Score-Gauge transportieren Schwere ausschließlich über Farbe (Rose/Amber/Mint), ohne Text/Form-Differenzierung in der Live-Resultatansicht. Für ein A11y-Produkt besonders heikel. **Fix:** Severity-Wort/Icon je Zeile (ResultCard hat nur einen generischen roten Punkt für alle 3 Issues).

### „Code-verifizierbar jetzt" vs. „braucht Live-axe/Screenreader"

- **Jetzt aus Code belegt:** A-01, A-02, A-03, A-05 (Button-Default-Size), A-07 (Toast-Fehler nicht assoziiert), A-08 (FAQ-Filter ohne aria-live), A-09 (Newsletter-Erfolg ohne Live-Region), A-11 (LogoCloud-Heading-Semantik), A-12 (`reason`-Textarea ohne sichtbares „optional"-Programm-Mapping minimal).
- **Braucht Live-Lauf:** Exakte Kontrast-Ratios aller `oklch`-Token-Paarungen (A-04 — ich nenne die verdächtigen Paare, aber ein Pixel-Messer/axe muss bestätigen), Focus-Trap & Esc & Focus-Restore im Dialog (A-06 — base-ui implementiert das, Verhalten muss real getestet werden), tatsächliche Screenreader-Ansage der base-ui-Komponenten.

---

## Verifikation der bisherigen PRs (Handover: Touch-Targets 2.5.5 + Mobile)

**Bestätigt umgesetzt (hält im aktuellen Code):**
- ✅ Touch-Targets in Forms/CTAs: `min-h-11` (44px) konsequent gesetzt — CheckoutModal-Submit (`min-h-11`), CookieBanner-Buttons (`min-h-11`), Footer-Cookie-Button (`min-h-11`), PricingCards-Pseudo-Toggle (`min-h-11`), Header-Mobile-Burger (`size-11`), ThemeToggle (`size-11`), Footer-Social-Links (`size-11`), ResultCard-CTA (`min-h-11`). Sauber.
- ✅ Skip-Link (`layout.tsx:124` — `sr-only focus:not-sr-only`, springt zu `#main`).
- ✅ `lang="de"` (`layout.tsx:113`), `colorScheme`/`themeColor` korrekt im viewport-Export.
- ✅ Landmark-Struktur: `<header>`/`<main id="main">`/`<footer>` in layout; Sektionen mit `aria-labelledby`.
- ✅ Dekoratives durchgehend `aria-hidden` (Hero-Blobs, HeroVisual komplett, Icons mit `aria-hidden`).
- ✅ CountUp + HeroVisual respektieren `prefers-reduced-motion` (via `usePrefersReducedMotion`).

**NEUE Lücken, die die alten PRs NICHT abdeckten:** A-01 (JS-Motion), A-03 (Farbcodierung), A-05 (Button-Default h-8=32px), und die aria-live/Fehler-Assoziations-Punkte unten.

---

## Befunde

> Severity-Skala: **Blocker** (sperrt User aus) · **Major** (echte Barriere/Workaround nötig, axe/Screenreader findet es) · **Minor** (Reibung, kein Blocker).

---

### A-01 — `prefers-reduced-motion` greift nicht für JS-Animationen
- **WCAG SC:** 2.3.3 Animation from Interactions (AAA) + 2.2.2 Pause/Stop/Hide (A, Spirit) — und Selbstanspruch des Produkts.
- **Severity:** Major
- **Location:** Global. `app/globals.css:408-426` (CSS-`@media`-Block) deckt nur `@keyframes` ab. Betroffen die `motion/react`-Nutzungen in: `Hero.tsx` (12×), `HeroVisual.tsx` (6×, teils gegated), `RiskBand.tsx` (3×, **x-Achsen-Stagger**), `PricingCards.tsx`, `StatsBar.tsx`, `Testimonials.tsx`, `HowItWorks.tsx`, `CtaSection.tsx`, `TrustSection.tsx`, `ResultCard.tsx` — 35 Treffer in 10 Dateien.
- **Problem:** Framer Motion animiert über inline-Style/JS (`transform`, `opacity`), nicht über CSS-Animationen. Die globale `@media (prefers-reduced-motion: reduce)`-Regel stillt diese NICHT. Ein User mit aktivierter Reduzierte-Bewegung-Präferenz sieht weiterhin alle Einfahr-/Stagger-/Scale-Effekte. Der Code-Kommentar in `globals.css` („alle dekorativen Endlos-Animationen ruhigstellen") suggeriert fälschlich vollständige Abdeckung.
- **Fix (1 Stelle, global):** In `app/layout.tsx` den `children`-Baum mit base-ui-/motion-Config umschließen:
  ```tsx
  import { MotionConfig } from "motion/react";
  // ...
  <MotionConfig reducedMotion="user">
    {/* Header/main/Footer/Modals */}
  </MotionConfig>
  ```
  `reducedMotion="user"` lässt Motion `transform`/`layout`-Animationen automatisch überspringen, wenn die OS-Präferenz gesetzt ist. Erledigt alle 10 Komponenten auf einen Schlag. (CountUp/HeroVisual-Eigengating kann bleiben.)
- **Testverifikation:** OS-Reduce-Motion aktivieren → Page neu laden → keine Einfahr-/Float-/Beam-Bewegung; Inhalte sofort an Endposition.

---

### A-02 — Cookie-Banner: „Ablehnen" nicht gleichrangig zu „Akzeptieren"
- **WCAG SC:** 1.4.1 Use of Color (A) (visuelle Hierarchie) — primär aber **§ 25 TDDDG / DSGVO-Gleichgewicht** (steht so auch in `CLAUDE.md` als Pflicht).
- **Severity:** Major (Recht **und** A11y/Kognition)
- **Location:** `components/CookieBanner.tsx:167-185`.
- **Problem:** „Nur notwendige" = `variant="outline"` (dezent, transparent). „Alle akzeptieren" = Default-Primary (gefüllt). Der ablehnende Pfad ist visuell schwächer → Dark-Pattern-Verdacht. Das Projekt fordert in `CLAUDE.md` explizit „2-Button-Gleichgewicht (Ablehnen muss gleich sichtbar)".
- **Fix:** Beide Buttons gleicher Rang. Konkret entweder beide `variant="outline"` oder beide gefüllt mit gleicher Sättigung. Z. B.:
  ```tsx
  // statt: Akzeptieren = default (primary), Ablehnen = outline
  <Button variant="secondary" size="lg" className="min-h-11" onClick={() => setConsent(false)}>Nur notwendige</Button>
  <Button variant="secondary" size="lg" className="min-h-11" onClick={() => setConsent(true)}>Alle akzeptieren</Button>
  ```
  (Gleicher visueller Gewicht; ggf. „Nur notwendige" sogar zuerst — ist es bereits.)
- **Hinweis Robust:** `role="dialog"` + `aria-modal="false"` ist hier korrekt gewählt (nicht-modaler Cookie-Hinweis, kein Fokus-Trap erzwungen — richtig, da er Seiteninteraktion nicht blockiert).
- **Testverifikation:** Visuell beide Buttons gleich prominent; axe „color-contrast" auf beiden grün.

---

### A-03 — Farbe als einziger Bedeutungsträger (Findings-Schwere / Score)
- **WCAG SC:** 1.4.1 Use of Color (A).
- **Severity:** Major (für ein A11y-Produkt besonders sichtbar)
- **Location:**
  - `components/ResultCard.tsx:126-133` — alle drei Top-Issues bekommen denselben generischen roten Punkt (`bg-brand-rose`); keine Schwere-Differenzierung, Bedeutung „Problem" nur via Farbe.
  - `components/ResultCard.tsx:75-99` — Header-Tonfarbe (good/warn/bad) + Shield-Icon tragen Verdikt; Verdikt-Text ist vorhanden (gut), aber der farbige Tonwechsel selbst ist nur Farbe.
  - `HeroVisual.tsx` `SeverityDot`/Badges — `aria-hidden`, daher unkritisch (rein dekoratives Visual).
- **Problem:** In der **live** ausgelieferten `ResultCard` (das ist echter Content, kein Deko-Visual) wird die rote Markierung der Issues ausschließlich über Farbe transportiert. Rot-Grün-Schwäche/Monochrom-User verlieren die „das ist ein Mangel"-Information am Punkt.
- **Fix:** Punkt durch ein bedeutungstragendes Icon ersetzen oder Text voranstellen (z. B. „Mangel:"). Minimal:
  ```tsx
  <AlertCircleIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brand-rose" />
  ```
  Da der Listentext den Mangel beschreibt, ist das Icon ausreichend (Form + Farbe statt nur Farbe). Für den Score zusätzlich die bereits vorhandene `Note A–D` + `verdict`-Prosa — die ist da, also Score ist OK.
- **Testverifikation:** Graustufen-Screenshot der ResultCard → Mangel-Status bleibt erkennbar.

---

### A-04 — Kontrast: verdächtige Mint/Amber-auf-hell-Paarungen (live messen)
- **WCAG SC:** 1.4.3 Contrast (Minimum) (AA, 4.5:1 Text / 3:1 große Schrift & UI) · 1.4.11 Non-text Contrast (AA, 3:1).
- **Severity:** Major (falls bestätigt) — **braucht Live-axe/Pixel-Messung**, da `oklch`-Token nur gerechnet werden können.
- **Location / Verdächtige Paare:**
  1. `brand-mint` (`oklch(0.72 0.18 158)`) als **Text** auf hellem `card`/`background` — z. B. Footer „Danke …"-Erfolgstext (`Footer.tsx:117` `text-brand-mint`), PricingCards „Spart 98 €" (`text-brand-mint`), diverse `text-brand-mint`-Kicker. Mint bei L≈0.72 auf Weiß liegt **grenzwertig unter 4.5:1** für normalen Text. **Hoch verdächtig.**
  2. **Mint-Button-Text:** `bg-brand-mint text-brand-deep` (Header-CTA, ScanForm-Submit, ResultCard-CTA). `brand-deep` (L≈0.18) auf Mint (L≈0.72) ist vermutlich OK (>4.5:1), aber Grenzbereich — messen.
  3. `text-brand-amber` auf hell (RiskBand-Icon, CookieSection-Badge) — Amber L≈0.78, als **Text** sehr wahrscheinlich < 4.5:1. Wird hier meist nur für Icons/große Zahlen genutzt (3:1-Schwelle) → wahrscheinlich grenzwertig.
  4. `text-muted-foreground` (`oklch(0.46 0.022 270)`) auf `background` (L≈0.987): L≈0.46 vs 0.987 → grob ~5–6:1, **wahrscheinlich OK** für Text. Aber `text-[11px]`/`text-[10px]`-Microcopy (Footer `LEGAL_NOTE`, PricingCards-Badges) in `muted-foreground` ist klein → AA gilt voll (4.5:1), knapp.
  5. Placeholder `placeholder:text-muted-foreground` in Inputs — Placeholder ist kein „Label", aber wenn als einzige Hilfe genutzt, muss Kontrast stimmen (hier sind echte `<Label>` vorhanden → unkritisch).
- **Problem:** Mehrere Akzentfarben mit hoher Lightness (Mint 0.72, Amber 0.78) werden teils als kleiner Text auf hellem Grund verwendet. Das ist die Klasse Fehler, die axe sofort als „color-contrast" meldet — und ausgerechnet bei uns peinlich.
- **Fix:** Für **Text** (nicht Icon/Deko) eine dunklere Mint-/Amber-Variante einführen (z. B. `--brand-mint-text: oklch(0.52 0.16 158)`) und `text-brand-mint`-Textstellen darauf umstellen; im Dark-Mode ist Mint (L≈0.8) auf dunklem Grund unkritisch. Amber-Text → `text-brand-amber` durch `text-foreground` + Amber nur als Icon.
- **Testverifikation:** axe-core `color-contrast` 0 Treffer; manuelle Messung der genannten 5 Paare mit Contrast-Checker (Light **und** Dark).

---

### A-05 — Button-Default-Größe 32px (unter 24px-Minimum erfüllt, aber unter 44px-Ziel)
- **WCAG SC:** 2.5.8 Target Size (Minimum) (2.2 AA, 24px) — **erfüllt**; 2.5.5 (AAA, 44px) — Ziel laut Projekt-PR.
- **Severity:** Minor (aktuell), Watch-Item.
- **Location:** `components/ui/button.tsx:23-33`. `size: default → h-8` (32px), `sm → h-7` (28px), `icon → size-8` (32px), `icon-sm → size-7` (28px).
- **Problem:** Die Default-/sm-Buttongrößen liegen unter dem 44px-Ziel. **Im aktuellen Seiten-Code wird das gemildert**, weil sichtbare CTAs explizit `size="lg"` + `h-11/h-12`/`min-h-11` setzen. Aber: Der Dialog-Close-Button nutzt `size="icon-sm"` (28px!) — `components/ui/dialog.tsx:68`. Das ist ein real sichtbarer, interaktiver 28px-Klickpunkt im CheckoutModal.
- **Fix:** Dialog-Close auf `size="icon"` (32px) + `min-h-11 min-w-11` oder Padding hochziehen; generell `default`-Size-Höhe auf `h-9`/`h-10` anheben wäre design-systemweit sauberer. Mindestens den Close-Button:
  ```tsx
  // dialog.tsx — Close-Button
  <Button variant="ghost" className="absolute top-2 right-2 size-11" size="icon" />
  ```
- **Testverifikation:** Close-Target ≥ 44×44 (oder ≥24px mit ausreichend Abstand) — DevTools-Box messen.

---

### A-06 — Dialog Focus-Trap / Esc / Focus-Restore (live verifizieren)
- **WCAG SC:** 2.4.3 Focus Order (A) · 2.1.2 No Keyboard Trap (A) · 2.4.11 Focus Not Obscured (2.2 AA).
- **Severity:** Major **falls** base-ui es nicht liefert — sonst PASS. **Braucht Live-Test.**
- **Location:** `components/CheckoutModal.tsx` + `components/ui/dialog.tsx` (base-ui `Dialog.Popup`/`Portal`/`Backdrop`).
- **Problem/Status:** base-ui `Dialog` implementiert standardmäßig Focus-Trap, Esc-to-close, Focus-Restore auf den Trigger und `aria-modal`. Der Code nutzt die Primitives korrekt (`DialogTitle`/`DialogDescription` vorhanden → benamt). **Aber:** Der CheckoutModal wird nicht über einen `DialogTrigger` geöffnet, sondern via Context (`openCheckout`) — d. h. der **Focus-Restore-Anker** ist unklar. Wenn der auslösende Button (z. B. PricingCards „Paket wählen") nach dem Schließen keinen Fokus zurückbekommt, landet der Fokus am Seitenanfang/`body`.
- **Fix/Prüfauftrag:** Live testen: Modal per Tastatur über „Paket wählen" öffnen → Tab bleibt im Modal → Esc schließt → **Fokus zurück auf „Paket wählen"**? Falls nicht, in `openCheckout` den auslösenden Trigger merken und `finalFocus`/`initialFocus`-Prop von base-ui setzen.
- **Testverifikation:** Keyboard-only-Durchlauf + NVDA/VoiceOver.

---

### A-07 — Formular-Fehler nur als Toast, nicht feld-assoziiert
- **WCAG SC:** 3.3.1 Error Identification (A) · 3.3.3 Error Suggestion (AA) · 4.1.3 Status Messages (AA).
- **Severity:** Major
- **Location:** `components/CheckoutModal.tsx:71-92` (alle `toast.error(...)`), analog `DsgvoForm.tsx`, `KuendigungForm.tsx`, `WiderrufForm.tsx` (Fehler ausschließlich via `toast.error`). Forms sind durchgehend `noValidate` → Browser-Validierung aus, Eigenvalidierung nur über Toast.
- **Problem:** Bei Fehler („Bitte E-Mail angeben", „Verbraucher/Unternehmer wählen") wird kein `aria-invalid` am betroffenen Feld gesetzt und keine `aria-describedby`-Fehlermeldung am Feld verankert. Sonner-Toasts sind zwar i. d. R. `aria-live`, aber (a) sie verschwinden, (b) sie sagen nicht, *welches* Feld, (c) Fokus springt nicht zum Fehlerfeld. Screenreader-User wissen nicht, wo der Fehler sitzt. `noValidate` entfernt zusätzlich das native Required-Feedback.
- **Fix:** Bei Validierungsfehler `aria-invalid={true}` + `aria-describedby` mit Inline-Fehlertext am jeweiligen Feld setzen und Fokus aufs erste fehlerhafte Feld (`element.focus()`). Die `ui/form.tsx`-Primitives (FormControl setzt `aria-invalid`/`aria-describedby` bereits korrekt!) existieren — werden in CheckoutModal/Forms aber **nicht** genutzt. Migration auf `FormField`/`FormMessage` löst es strukturell.
- **Testverifikation:** Leeres Pflichtfeld absenden → Screenreader nennt Feld + Fehler, Fokus landet dort.

---

### A-08 — FAQ-Suchergebnis-Anzahl ohne Live-Region
- **WCAG SC:** 4.1.3 Status Messages (AA).
- **Severity:** Minor
- **Location:** `components/FAQAccordion.tsx:74-78` (`{filtered.length} von {FAQ_ITEMS.length} Treffern`) und `:81-84` („Keine Treffer").
- **Problem:** Beim Tippen in die FAQ-Suche ändert sich die Trefferzahl/Liste, aber die Status-Zeile ist keine `aria-live`-Region. Screenreader-User bekommt nicht angesagt, dass/wieviele Treffer übrig sind.
- **Fix:** Status-`<p>` mit `role="status"` / `aria-live="polite"` versehen:
  ```tsx
  <p role="status" aria-live="polite" className="mt-2 px-1 text-xs text-muted-foreground">
    {filtered.length} von {FAQ_ITEMS.length} Treffern
  </p>
  ```
- **Testverifikation:** Tippen → SR sagt „3 von 12 Treffern".

---

### A-09 — Newsletter-„Danke"-Bestätigung ohne Live-Region
- **WCAG SC:** 4.1.3 Status Messages (AA).
- **Severity:** Minor
- **Location:** `components/Footer.tsx:116-124`. `submitted`-Toggle tauscht den Hinweistext, ohne `aria-live`.
- **Problem:** Nach Absenden erscheint „Danke — wir melden uns …", wird aber Screenreadern nicht angekündigt (kein Fokuswechsel, keine Live-Region). (Anmerkung: Form ist ohnehin UI-only/kein Backend — niedrige Prio.)
- **Fix:** Den umschaltenden Hinweistext-Container mit `aria-live="polite"` und stabiler DOM-Position versehen (nicht conditional zwischen zwei `<p>` wechseln, sondern denselben Knoten updaten).
- **Testverifikation:** Absenden → SR liest Bestätigung.

---

### A-10 — ScanForm: `role="status"` umschließt nicht das eigentliche Ergebnis
- **WCAG SC:** 4.1.3 Status Messages (AA) · 1.4.1.
- **Severity:** Minor
- **Location:** `components/ScanForm.tsx:122-127`. Der Fehlerhinweis trägt `role="status"` (gut). Das `ResultCard` (`ScanForm.tsx:127`) hat selbst `role="region" aria-live="polite"` (`ResultCard.tsx:71-73`) — **gut**. Aber: `aria-live` auf einem Element, das beim ersten Render **neu eingefügt** wird, wird von manchen Screenreadern nicht zuverlässig angesagt (Live-Region muss idealerweise schon im DOM existieren, bevor Inhalt einzieht).
- **Problem:** Das Scan-Ergebnis (Score/Funde) ist die Kernfunktion. Wenn die Live-Region erst mit dem Resultat ins DOM kommt, ist die Ansage unzuverlässig. Zusätzlich: `role="region"` braucht einen Accessible Name (`aria-label`), sonst ist es eine namenlose Region.
- **Fix:** Persistente Live-Region (leerer Wrapper mit `aria-live="polite"` immer gerendert), Ergebnis hineinrendern; `ResultCard`-Region einen Namen geben: `aria-label="Scan-Ergebnis"`. `<Loader2Icon>`-Ladezustand zusätzlich als Text in die Live-Region („Prüfe…" ist aktuell nur im Button).
- **Testverifikation:** Scan auslösen → SR sagt „Scan-Ergebnis, Note B, 17 Funde".

---

### A-11 — LogoCloud: Sektions-Überschrift ist visuell ein Label, semantisch via `aria-labelledby` ok
- **WCAG SC:** 1.3.1 Info and Relationships (A) · 2.4.6 Headings and Labels (AA).
- **Severity:** Minor (Heading-Order-Hinweis)
- **Location:** `components/LogoCloud.tsx:4-15`. Die Section nutzt `aria-labelledby="logocloud-heading"`, der Anker ist aber ein `<p>` (kein `<h2>`). Gleiches Muster bei `TrustSection` (nutzt `aria-label`, gar keine sichtbare Heading — das ist OK).
- **Problem:** Kein echter Fehler (eine `<section>` darf via `aria-labelledby` auf ein `<p>` zeigen), aber die **Heading-Outline** der Seite hat dadurch „Löcher": zwischen den `<h2>`-Sektionen liegt die LogoCloud ohne Heading-Level in der Outline. Für Screenreader-Heading-Navigation (H-Taste) fehlt der Sprungpunkt. Konsistenz: alle anderen Sektionen haben `<h2>`.
- **Fix:** `<p id="logocloud-heading">` → bleibt sichtbar als Kicker, aber als `<h2 className="sr-only">`-Heading zusätzlich für die Outline, ODER das `<p>` zu einem visuell unauffälligen `<h2>` machen. Niedrige Prio.
- **Testverifikation:** Heading-Outline (z. B. HeadingsMap) zeigt lückenlose H2-Reihe.

---

### A-12 — Optionale Felder nicht programmatisch als „optional" ausgewiesen
- **WCAG SC:** 3.3.2 Labels or Instructions (A).
- **Severity:** Minor
- **Location:** `WiderrufForm.tsx:105` („Grund (optional)"), `DsgvoForm.tsx:93` („Anmerkung (optional)"), `KuendigungForm.tsx:87` („Abo-ID (falls bekannt)"). „optional" steht im sichtbaren Label-Text → das ist **ausreichend** (im Accessible Name enthalten). Kein Fix nötig; nur dokumentiert zur Vollständigkeit. ✅
- Pflichtfelder tragen `required` (nativ) — gut. Da Forms `noValidate` sind, wird `required` nicht vom Browser erzwungen, aber das `required`-Attribut bleibt im Accessibility-Tree (`aria-required`) → Screenreader sagt „erforderlich". OK.

---

## Was gut funktioniert (bewahren!)

- **Skip-Link** sauber implementiert (sr-only → focus-sichtbar, Sprung zu `#main`).
- **Landmark-Hygiene:** ein `<main id="main">`, `<header>`, `<footer>`, Sektionen mit `aria-labelledby`/`aria-label`. Vorbildlich.
- **Heading-Hierarchie:** jede Legal-Page startet mit genau einem `<h1>`, dann `<h2>`. Homepage: Hero-`<h1>`, Sektionen `<h2>`, Karten `<h3>`. Konsistent.
- **Dekoratives durchgehend `aria-hidden`** (Hero-Blobs, gesamtes `HeroVisual`, alle Lucide-Icons via `aria-hidden`). Das ist die häufigste Fehlerquelle — hier sauber.
- **Icon-only-Buttons benannt:** Burger (`aria-label` toggelt offen/zu + `aria-expanded`), ThemeToggle (`aria-label`, Mount-sicher), FAQ-Clear (`aria-label="Suche zurücksetzen"`), Dialog-Close (`<span class="sr-only">Close</span>`), Social-Links (`aria-label`). Vollständig.
- **Focus-Indikatoren:** base-ui-Primitives + globales `outline-ring/50` + `focus-visible:ring-3 ring-ring/50` durchgängig. ThemeToggle/Buttons/Inputs alle mit sichtbarem Ring.
- **`prefers-reduced-motion`** für die rechenintensiven Effekte (CountUp-Zähler, Score-Gauge, Scan-Beam, Float-Badges) korrekt gegated.
- **Forms:** jedes `<Input>` hat ein programmatisch zugeordnetes `<Label htmlFor>` (auch die sr-only-Variante in ScanForm). `<fieldset>`/`<legend>` für Radio-Gruppen. `autoComplete` gesetzt. RadioGroup/Checkbox via base-ui (korrekte Rollen).
- **`lang="de"`**, sinnvolle `<title>`/`description` je Route, `robots: noindex` auf Account/Form-Seiten.

---

## Empfohlene nächste Schritte (priorisiert)

**Sofort (vor Launch / vor erstem fremden axe-Lauf):**
1. A-01 — `<MotionConfig reducedMotion="user">` in `layout.tsx` (1 Zeile, größter Hebel).
2. A-02 — Cookie-Banner-Buttons gleichrangig (Recht + A11y).
3. A-04 — Live-axe-core + Pixel-Kontrast-Messung der 5 genannten Mint/Amber-Paare (Light **und** Dark); dunklere Text-Token einführen wo < 4.5:1.
4. A-03 — ResultCard-Issues: Icon statt nur Farbpunkt.

**Kurzfristig (nächster Sprint):**
5. A-07 — Form-Fehler feld-assoziiert (`aria-invalid` + Inline-`FormMessage` + Fokus aufs Fehlerfeld) statt nur Toast. `ui/form.tsx` ist schon da.
6. A-05 — Dialog-Close-Button + Button-`default`-Size auf ≥ 44px-Ziel.
7. A-06 — **Live** Focus-Trap/Esc/Focus-Restore im CheckoutModal verifizieren (Trigger-Restore via Context absichern).

**Laufend / Minor:**
8. A-08/A-09/A-10 — Live-Regionen für FAQ-Filter, Newsletter-Danke, Scan-Ergebnis.
9. A-11 — LogoCloud-Heading in die Outline aufnehmen.

**Prozess:** axe-core in CI gegen den gebauten `landingpage-next`-Build hängen (es gibt bereits `@axe-core/cli` in der Toolbox laut Persona-Workflow). Ein A11y-Vendor ohne A11y-Gate in der eigenen Pipeline ist das eigentliche Risiko. Re-Audit (inkl. echtem Screenreader-Lauf NVDA + VoiceOver) nach Fix von A-01..A-07.

---

## Methodik-Disclaimer

Dieser Audit ist eine **statische Code-Analyse**. Automatisierte Tools + Code-Review erkennen ~30–50 % der Barrieren. Nicht abgedeckt mangels Live-Umgebung: reale Screenreader-Ansagen (NVDA/JAWS/VoiceOver), tatsächliche gerenderte Kontrast-Ratios, Fokus-Verhalten zur Laufzeit, Zoom 200/400 %, Forced-Colors-Modus. Die mit „Live verifizieren" markierten Punkte (A-04, A-06, base-ui-ARIA) **müssen** vor einer Konformitätsaussage real getestet werden.
