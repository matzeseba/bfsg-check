# Pre-Launch Conversion + UX Audit — Landingpage (`landingpage-next/`)

> **Datum:** 2026-06-21 · **Autoren:** ArchitectUX (UX-Struktur) + Growth Hacker (Funnel/CRO)
> **Scope:** Read-only Audit des Conversion-Funnels für kaltes Paid-Traffic (Google Ads 13 €/Tag + Bing 4 €/Tag).
> **Ziel-KPIs (aus `marketing/STRATEGY-2026.md`):** Scan→Purchase 3 %, AOV 350 €, CAC < 150–177 €, Landing→Scan ≥ 40 %.
> **Methodik:** Code- + Copy-Analyse aller Funnel-Komponenten. Kein Live-Render. Backend-Verdrahtung gegen `scanner/app.js` + `deployment/Caddyfile` verifiziert.

---

## Funnel-Status: technisch sauber verdrahtet

Bevor die Findings kommen, die gute Nachricht — der Kern-Mechanismus funktioniert **echt**, nicht als Fassade:

- `/api/scan` (Caddy → `app:8080`, `scanner/app.js:288`) liefert einen **echten Teaser** (`renderTeaser`, `scanner/lib/report.js:237`): `{ score, grade, verdict, totalIssues, topIssues }`. Shape passt exakt auf den `ScanResult`-Typ der Landing (`ResultCard.tsx:15`). Der „Oh-nein"-Moment ist real.
- Demo-Fallback (`ScanForm.tsx:45-59`) greift nur bei Netzwerk-/Backend-Fehler — sauber gelöst, hält die Page auch offline anschaulich.
- Checkout (`/api/checkout`, `app.js:315`) → Stripe-Redirect ist verdrahtet, B2C/B2B + Widerruf-Consent korrekt abgefragt.
- Preise auf der Page (`config.ts`) sind **identisch mit dem Backend** (`scanner/app.js:47-52`): Basis 199 €, Profi 499 €, Cookie-Basis 49 €, Cookie-Profi 79 €, Abo 39 €/Mo. Keine Preis-Drift auf der Seite selbst.

> **Hinweis (kein Page-Bug):** Der Auftrags-Brief nennt Cookie-Basis 99 €/Cookie-Profi 249 € und `marketing/OFFER.md`/`STRATEGY-2026.md` nennen Abo 49 €/Mo. Beides weicht vom Live-Stand ab. Die **Landingpage ist die korrekte Quelle** (deckt sich mit Backend + `docs/PRICING-DECISION.md`). Marketing-Docs sind veraltet — separat nachziehen, nicht an der Page ändern.

Das eigentliche Problem ist nicht die Mechanik, sondern **die Brücke vom kostenlosen Ergebnis zum Kauf** und **die Glaubwürdigkeit für kalten Traffic, der die Marke in Sekunde 1 nicht kennt.**

---

## Executive Summary — Top 3 Conversion-Hebel

### 1. Die Wertbrücke „Problem → Kauf" ist zu schwach — das ResultCard verkauft nicht
Der gesamte Funnel ist darauf gebaut, dass der Gratis-Scan den Schmerz erzeugt. Aber das `ResultCard` (`ResultCard.tsx`) zeigt nur **3 generische Top-Befunde** und springt direkt auf „Vollreport sichern" (hart auf `profi`/499 €). Es fehlt: (a) der **Preis-Anker gegen das Risiko** (eine Abmahnung kostet 3.500–20.000 € — steht in `OFFER.md`, aber nirgends im Conversion-Moment), (b) eine **konkrete Vorschau dessen, was im Vollreport zusätzlich steckt** (Lock-Effekt: „17 Befunde gefunden — 3 siehst du, 14 sind im Report"), (c) ein **Einstiegspreis-Pfad** (direkt 499 € ist für kalten Traffic der falsche erste Klick; Basis 199 € fehlt als Option im Card-CTA). Das ist der höchste Einzel-Hebel.

### 2. Trust-Signale sind überwiegend hohl oder gefährlich — für kalten Traffic der #1-Conversion-Killer
- **`LogoCloud`** zeigt „TechCrunch DE, t3n, OMR, heise, Computerwoche" unter „**Bald** berichtet in" mit Untertitel „Platzhalter". Das ist nicht nur conversion-schwach, es ist ein **konkretes UWG-§5-Risiko** (Irreführung durch Schein-Pressereferenzen) — selbst mit „Bald"-Disclaimer wirken die Logos wie Endorsements. **Vor Paid-Launch entfernen oder ersetzen.**
- **`HERO.trust` / `StatsBar`**: „5.247 Websites geprüft" (`config.ts:43`) ist eine **unbelegte Zahl** vor dem ersten echten Kunden. Auch UWG-Risiko + Vertrauensbruch, wenn jemand nachfragt.
- **`StatsBar`-Headline „Audit-Methodik, die vor Gericht standhält"** ist eine implizite Rechtssicherheits-Behauptung — kollidiert mit dem eigenen Disclaimer („keine Rechtsberatung") und der No-Go-Liste in `CLAUDE.md`.
- Positiv: `Testimonials.tsx` verzichtet bewusst auf Fake-Quotes (gut), `TrustSection` ist real (SSL/DSGVO/DE-Hosting). Die **echten** Trust-Anker (DE-Hosting, menschliche Sichtung, 30-Tage-Geld-zurück, Stripe) sind da — sie müssen nur **lauter** als die hohlen werden.

### 3. Mobile-First-Realität verschenkt — kein persistenter Kauf-Pfad, langer Scroll zwischen Schmerz und Preis
Die meisten Ad-Klicks sind mobil. Auf Mobile gibt es **keinen Sticky-CTA** (`Header.tsx` hat nur Logo + Burger, der „Gratis prüfen"-Button ist im Burger-Menü versteckt). Zwischen ResultCard (im Hero) und den Pakketen liegen 5 volle Sektionen (`LogoCloud → RiskBand → HowItWorks → StatsBar → Testimonials → PricingCards`). Wer nach dem Scan kaufen will, muss scrollen oder den kleinen `#pakete`-Link treffen. Ein **persistenter „Vollreport sichern"-Bar nach Scan** und/oder ein direkter Paket-Auswahl-Schritt im ResultCard schließt diese Lücke.

---

## Priorisierte Findings (ICE)

ICE = Impact × Confidence × Ease, je 1–10. Sortiert nach Score (Ø der drei).

| # | Finding | Ort | I | C | E | ICE | Konkrete Änderung |
|---|---------|-----|--:|--:|--:|----:|-------------------|
| 1 | LogoCloud = Schein-Presse, UWG-Risiko + hohl | `LogoCloud.tsx:1-33`, `config.ts:156-165` | 8 | 9 | 10 | **9.0** | Komponente aus `page.tsx:17` entfernen. Ersetzen durch echte Anker-Leiste: „Stripe-Checkout · Hosting in DE · WCAG 2.1 / EN 301 549 · 30 Tage Geld-zurück". Keine erfundenen Medien-Logos. |
| 2 | ResultCard ohne Wertbrücke/Risiko-Anker/Preis-Staffel | `ResultCard.tsx:141-161` | 9 | 8 | 7 | **8.0** | Lock-Teaser ergänzen: „**{totalIssues} Befunde gefunden — 3 sichtbar, {totalIssues−3} im Vollreport.**" + Risiko-Satz „Eine Abmahnung kostet meist 3.500–20.000 €." Zwei CTAs: „Basis 199 €" (primär für kalt) **und** „Profi 499 €", statt nur `openCheckout('profi')`. |
| 3 | Unbelegte „5.247 geprüft"-Zahl | `config.ts:43-44`, `Hero.tsx:136-145` | 7 | 9 | 9 | **8.3** | Zahl entfernen, bis echt belegbar. Ersetzen durch verifizierbare Anker: „60 Sek. bis Ergebnis · WCAG 2.1 AA · DE-Hosting · Menschlich geprüft". |
| 4 | Kein Sticky-CTA auf Mobile | `Header.tsx:139-151` | 8 | 7 | 7 | **7.3** | Mobile: persistenten Bottom-Bar oder sichtbaren Header-CTA „Gratis prüfen" (nicht nur im Burger). Nach Scan: Bar wechselt zu „Vollreport sichern". |
| 5 | „Vor Gericht standhält" = implizites Rechtssicherheits-Versprechen | `StatsBar.tsx:39` | 6 | 9 | 10 | **8.3** | Headline ändern zu „Geprüft nach den Normen, auf die sich Behörden und Kanzleien berufen." Faktisch, keine Garantie-Implikation. |
| 6 | Hero-CTA-Microcopy verschenkt Einwand-Abbau | `config.ts:63`, `ScanForm.tsx:119-121` | 6 | 7 | 9 | **7.3** | CTA „Jetzt kostenlos prüfen" ok. Sub-Microcopy ist gut („Kostenlos · ohne Anmeldung · ohne Tracker"). Ergänzen: „Ergebnis bleibt bei Ihnen — keine E-Mail nötig für den Scan." (senkt Eingabe-Angst). |
| 7 | Frontend- vs. Backend-Grade-Schwellen inkonsistent | `ResultCard.tsx:28-57` vs. `scanner/lib/report.js:16-26` | 5 | 9 | 8 | **7.3** | Schwellen angleichen (Backend: A≥90, B≥75, C≥50). Sonst zeigt Page „Note C", PDF/HeroVisual „Note B" für denselben Score → Vertrauensbruch. |
| 8 | Pricing-Anchoring sub-optimal: Profi featured, aber kein Wert-Pro-Euro-Anker | `PricingCards.tsx`, `config.ts:184-201` | 7 | 6 | 6 | **6.3** | Auf Profi-Karte Mini-Anker ergänzen: „Anwalt-Audit ab 1.500 € — hier 499 € pauschal." Macht „Meistgewählt" rational statt nur visuell. |
| 9 | Annual-Toggle sichtbar, obwohl einziges Abo „Bald verfügbar" + nicht im Grid | `PricingCards.tsx:59-91` | 5 | 8 | 7 | **6.7** | Auf der Haupt-`#pakete`-Sektion `showAnnualToggle={false}` (es gibt dort kein kaufbares Abo). Toggle ohne Funktion = Verwirrung/Decision-Friction. |
| 10 | RiskBand vor HowItWorks: Schmerz ohne sofortige Lösung daneben | `page.tsx:18-19` | 6 | 5 | 6 | **5.7** | Reihenfolge testen (siehe A/B #3). RiskBand erzeugt Angst, aber der nächste Block ist erst „Wie es funktioniert" — die Pakete kommen 4 Sektionen später. |
| 11 | CheckoutModal: Paket-Wechsel + URL + E-Mail + Typ + Consent = viel Friktion in einem Schritt | `CheckoutModal.tsx:139-293` | 6 | 5 | 4 | **5.0** | URL ist nach Scan schon bekannt (`state.url`) — vorbelegt, gut. Consent-Checkbox nur für Verbraucher zeigen (ist so) — gut. Optimierung: Trust-Zeile „Stripe · SSL · Rechnung automatisch" direkt über dem Bezahl-Button, nicht nur AGB-Kleingedrucktes darunter. |
| 12 | Headline-Tail als 0.4em-Mini-Zeile schwer lesbar mobil | `Hero.tsx:79-81` | 4 | 5 | 7 | **5.3** | „In 60 Sekunden wissen Sie es." ist die stärkste Value-Zeile, aber als 0.4em fast unsichtbar. Auf ≥ `text-base` anheben (mobil). |
| 13 | Kein E-Mail-/Lead-Capture-Zwischenschritt (Strategie sieht ihn vor) | Funnel-weit, vgl. `STRATEGY-2026.md` Z.79-83 | 7 | 4 | 3 | **4.7** | Strategie plant „Voller Befund gegen E-Mail (Double-Opt-in)". Aktuell: Scan → direkt Kauf, kein Lead-Capture für Nurture. Bewusst aufschieben (Build-Aufwand), aber als Lücke dokumentiert: ohne Lead-Capture verpufft jeder Nicht-Sofort-Käufer. |

---

## 3 A/B-Test-Vorschläge

### A/B-Test 1 — ResultCard: Risiko-Anker + Lock-Teaser + Doppel-CTA (höchster Erwartungswert)
- **Hypothese:** Wenn das ResultCard (a) die Anzahl versteckter Befunde nennt, (b) das Abmahn-Risiko in Euro beziffert und (c) Basis (199 €) als ersten Einstieg anbietet, steigt die Scan→Checkout-Click-Rate.
- **Ort:** `ResultCard.tsx:141-161`.
- **Control:** aktuell (3 Befunde, ein CTA → Profi 499 €).
- **Variante:** „**{totalIssues} Befunde — Sie sehen 3, {totalIssues−3} stehen im Vollreport.** Eine Abmahnung kostet meist 3.500–20.000 €." + zwei Buttons: „Vollreport ab 199 €" (öffnet Checkout mit `basis` vorgewählt) und sekundär „Profi-Paket ansehen".
- **Primär-Metrik:** Click auf einen Kauf-CTA / Scan-Ergebnis (Proxy für Scan→Checkout-Start).
- **Sekundär:** AOV (Risiko: Basis-First senkt AOV — beobachten gegen 350 €-Ziel).
- **Mindest-Sample:** bei ~13 €/Tag dünn — min. 2–3 Wochen oder bis ~300 Scans/Arm. Bis dahin als „starke Quick-Win"-Variante hart ausspielen.

### A/B-Test 2 — Hero-Trust-Bar: hohle Zahl vs. verifizierbare Anker
- **Hypothese:** Verifizierbare Anker (DE-Hosting, menschlich geprüft, 30-Tage-Geld-zurück) konvertieren kalten Traffic besser — und schalten das UWG-Risiko ab — als die unbelegte „5.247 geprüft"-Zahl.
- **Ort:** `config.ts:71-76` (`HERO.trust`) + `LogoCloud` (`page.tsx:17`).
- **Control:** „5.247 geprüft · DSGVO · DE · 60 Sek." + LogoCloud „Bald berichtet in".
- **Variante:** „Menschlich geprüft · DE-Hosting · 30 Tage Geld-zurück · Stripe-Checkout", LogoCloud entfernt.
- **Primär-Metrik:** Landing→Scan-Start-Rate (`scan_started`).
- **Note:** Variante ist gleichzeitig die rechtlich sichere — bei Gleichstand trotzdem auf Variante gehen.

### A/B-Test 3 — Sektions-Reihenfolge: Pakete näher an den Schmerz
- **Hypothese:** Pakete direkt nach dem Schmerz-/Lösungs-Block (statt 4 Sektionen später) erhöhen die Scroll-to-Pricing- und Kauf-Rate.
- **Ort:** `page.tsx:16-27`.
- **Control:** `Hero → LogoCloud → RiskBand → HowItWorks → StatsBar → Testimonials → PricingCards → …`
- **Variante:** `Hero → RiskBand → HowItWorks → PricingCards → Testimonials/Why → StatsBar → TrustSection → Cookie → FAQ → CTA` (Pakete von Position 7 auf 4).
- **Primär-Metrik:** Scroll-Tiefe bis `#pakete` + Checkout-Open-Rate.
- **Sekundär:** Bounce-Rate (Risiko: zu früher Preis schreckt ab — beobachten).

---

## Quick-Wins (heute ausspielbar, kein A/B nötig)

Reihenfolge = ICE-absteigend. Alle innerhalb der Legal-Guardrails (keine verbotenen Claims, nur echte Proof).

1. **LogoCloud entfernen** (`page.tsx:17`). Schein-Presse raus, bevor der erste Ad-Klick kommt. *(UWG-Risiko + hohl)*
2. **„5.247 geprüft" entfernen** (`config.ts:43-44`, referenziert in `HERO.trust` + `BRAND.scansValue`). Durch verifizierbaren Anker ersetzen. *(UWG-Risiko)*
3. **StatsBar-Headline entschärfen** (`StatsBar.tsx:39`): „vor Gericht standhält" → „Normen, auf die sich Behörden und Kanzleien berufen". *(Garantie-Implikation raus)*
4. **Grade-Schwellen angleichen** (`ResultCard.tsx:28-57` an `scanner/lib/report.js:16-26`). Verhindert „Note C auf Page, Note B im PDF". *(Konsistenz/Vertrauen)*
5. **Annual-Toggle auf `#pakete` aus** (`PricingCards.tsx` Aufruf, `showAnnualToggle={false}`), da dort kein kaufbares Abo liegt. *(Decision-Friction raus)*
6. **Hero-Tail-Zeile lesbar machen** (`Hero.tsx:79`): 0.4em → mobil ≥ `text-base`. „In 60 Sekunden wissen Sie es." ist die beste Zeile — sichtbar machen.
7. **ResultCard: Risiko-Satz + versteckte-Befunde-Teaser** als Sofort-Copy-Edit (`ResultCard.tsx:142-145`), auch ohne den vollen Doppel-CTA-Test.
8. **Mobile-Header-CTA sichtbar** (`Header.tsx:139`): „Gratis prüfen" aus dem Burger in die sichtbare Top-Bar holen.

---

## Was bewusst NICHT geändert werden sollte (gut so)

- **Keine Fake-Testimonials** (`Testimonials.tsx:74-77`) — bewusst und richtig. Ehrlicher „Stimmen folgen nach Launch"-Hinweis ist UWG-sauber.
- **RiskBand-Tonalität** — faktenbasiert, keine Drohung, kein Garantie-Versprechen (`config.ts:98-108`). Genau richtig zwischen Urgency und Legal-Cap.
- **Checkout-Consent-Logik** — Widerruf-Consent nur für Verbraucher, B2B ohne. Sauber (`CheckoutModal.tsx:255-275`).
- **Demo-Fallback im ScanForm** — hält die Page robust, ehrlich als „Demo-Werte" markiert.
- **Pflicht-Sprache** — „automatisierte technische Analyse", „WCAG 2.1 / EN 301 549", „keine Rechtsberatung" durchgängig korrekt verwendet.

---

## Anhang: verifizierte Datenflüsse

- `ScanForm.onSubmit` → `GET /api/scan?url=` → Caddy `/api/*` → `app:8080` (`Caddyfile:26-27`) → `scanner/app.js:288` → `renderTeaser` → `ResultCard`. **Real, kein Mock.**
- `openCheckout(pkg)` → `CheckoutModal` → `POST /api/checkout` → `scanner/app.js:315` → Stripe-Session → Redirect. **Verdrahtet.**
- Preis-Quelle der Wahrheit: `scanner/app.js:47-52`. `config.ts` deckt sich. Marketing-Docs (`OFFER.md`, `STRATEGY-2026.md`) sind veraltet (Cookie-Preise, Abo 49 vs. 39) — Page korrekt.
