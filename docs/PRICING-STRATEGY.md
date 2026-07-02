# Pricing-Strategy — Wettbewerbsanalyse + konkrete Preisempfehlung

> **Stand:** 17.06.2026 · **Geltungsbereich:** DACH (DE/AT/CH) · **Segment:** KMU + Web-Agenturen (B2B)
> **Geschäftsmodell-Basis:** Gratis-Scan = Lead-Magnet. Verkauft wird der **menschlich kuratierte Fix-Plan** + Barrierefreiheitserklärungs-Entwurf. **Keine Konformitätsgarantie, keine Rechtsberatung.**
> **Verwandte Docs:** `marketing/OFFER.md` (Value-Ladder), `marketing/pricing-experiments.md` (A/B-Tests), `marketing/STRATEGY-2026.md` (Channel-Mix), `marketing/partner-outreach.md` (Partner-Modelle)

---

## 0. TL;DR — Kern-Empfehlung

| Produkt | Heute | Empfehlung | Begründung (Kurz) |
|---|--:|--:|---|
| Basis-Report | 199 € | **199 € behalten** (A/B gegen 249 €) | Psychologischer Anker unter 200 €, schlägt Free-Tools sauber. Lässt etwas Marge liegen — per Test prüfen. |
| Profi-Report ⭐ | 499 € | **497 € behalten** (Charm-Pricing) | Sitzt sauber unter dem Agentur-Floor (490–1.200 €). Mehr Marge über Anchoring statt über Listenpreis. |
| Re-Check-Abo | 49 €/Mo | **39 €/Mo + Jahresoption 390 €/Jahr** | 49 € ist gegen BFSGuard (19,99 €) zu teuer als Solo-Abo. Re-Positionierung als „menschlich geprüftes" Premium-Abo nötig. |
| Cookie-Basis | 49 € | **49 € behalten** | Solider Tripwire/Cross-Sell-Preis. |
| Cookie-Profi | 79 € | **79 € behalten** | Passt. |
| **NEU: Agentur/White-Label** | — | **990 € für 5er-Report-Paket** (198 €/Report) | Größte unbesetzte Lücke. BFSGuard hat ein 199 €/Mo White-Label — wir kontern mit Einmal-Paketen statt Abo-Lock-in. |
| **NEU: Bundle BFSG+Cookie** | — | **229 €** (statt 248 € einzeln) | Cross-Sell-Hebel, +30 € AOV pro Bundle-Käufer. |

**Zentrale These:** Die Einmal-Report-Preise (199/497) sind **richtig positioniert** und sollten gehalten (nicht gesenkt) werden — sie besetzen exakt die Lücke zwischen Gratis-Tools und Agentur-Audit. Der **Handlungsbedarf liegt beim Abo** (zu teuer vs. BFSGuard) und bei **fehlenden Tiers nach oben** (Agentur/White-Label, Bundle). Die Marge holen wir über **Anchoring + 4. Tier + Bundle**, nicht über pauschale Listenpreis-Erhöhung.

---

## 1. Wettbewerbs-Matrix

### 1a. Direkte & indirekte Wettbewerber

| Anbieter | Leistung | Preis (EUR) | Positionierung | Unsere Differenzierung |
|---|---|---|---|---|
| **WAVE / axe DevTools / Lighthouse** | Automatischer A11y-Scan (Browser-Plugin), Rohdaten | **0 €** | Developer-Tools, kein Output für Laien | Wir liefern **kuratierten, priorisierten Fix-Plan** + Erklärungs-Entwurf — keine Rohdaten-Wüste |
| **BFSGuard** (DE) ⚠️ | Multi-Scanner (axe+Pa11y+Lighthouse), Auto-Fix-Widget, §14-Generator, Monitoring | **0 € Free · 19,99 €/Mo Starter (3 Sites) · 69 €/Mo Business · 199 €/Mo Agency/White-Label · Custom Report 299 € · Komplett-Service 499 €** | **Vollautomatisiert, Abo-getrieben, Overlay-Ansatz** | Wir: **menschliche Sichtung** vor Auslieferung, kein Overlay (rechtlich umstritten), Einmal-Kauf statt Abo-Zwang |
| **accessiBe** (accessWidget) | KI-Overlay-Widget, Auto-Remediation | **ab ~59 $/Mo (~55 €)** | Overlay, international, umstritten | Kein Overlay; echte Fix-Anleitung statt Widget-Pflaster |
| **UserWay** | A11y-Overlay-Widget | **49 $/Mo (klein) · 149 $/Mo (mittel)** | Overlay, traffic-basiert | s.o. |
| **musnuss.de** | Fixpreis-Audit, modular | **190 € Startseite + 35 €/Seite + 20 €/Re-Audit-Seite** | Manuell, Solo/Klein-Agentur, Baukasten | Wir: sofortiger Scan-Start, Lieferung in Stunden statt 5+ Werktagen, klarer Paketpreis |
| **Expert-Kurzanalyse (Agenturen)** | Manuelle Sichtung Kernseiten, priorisierte Findings | **490 – 1.200 €** | Agentur-Beratung | Wir: gleiche Tiefe für KMU bei 199–497 €, ohne Termin-Koordination |
| **Voll-WCAG-Audit (Agenturen)** | Komplettprüfung alle Seitentypen | **1.500 – 8.000 €** | Enterprise/Mittelstand | Wir bedienen das Segment **darunter** — „genug für die Pflicht ohne Overengineering" |
| **BIK BITV-Test (zertifiziert)** | Offizielles DE-Prüfverfahren, 92 Prüfschritte, Siegel | **3.000 – 8.000 €** (komplex: 8.000–20.000 €) | Behörden, große Sites, Siegel-Bedarf | Wir sind **explizit kein** Ersatz für BITV-Siegel — wir sind die schnelle Vorprüfung davor |
| **Re-Audit / jährl. Monitoring (Agentur)** | Wiederholungsprüfung | **490 – 2.500 €/Jahr** | Agentur-Wartung | Unser Abo (39 €/Mo = 468 €/Jahr) unterbietet das deutlich |

⚠️ = **Haupt-Wettbewerber**, siehe Section 2.

### 1b. Cookie-Consent-Tools (Kontext für unser Cookie-Produkt)

> **Wichtig:** Diese Tools sind **CMP-Software** (laufendes Consent-Banner), wir verkaufen ein **einmaliges Tracker-Audit**. Andere Kategorie — wir konkurrieren nicht direkt, sondern liefern die Vorprüfung („feuert vor Consent etwas?"), die diese Tools nicht als Report ausgeben.

| Anbieter | Leistung | Preis (EUR/Mo) | Hinweis |
|---|---|--:|---|
| **Usercentrics** | CMP (Banner) | Free (1k Sessions) · 7 € Essential · 15 € Plus · 30 € Pro (3 Domains) · 50 € Business (10 Domains) | Marktführer DACH |
| **Cookiebot** (by Usercentrics) | CMP | Free (≤50 Subpages) · ~30 €/Domain (seit 08/2025 verdoppelt) · bis 90 €/Domain | Preis nach Subpages, nicht Traffic |
| **CookieFirst** | CMP | ab 9 € | Günstig-Einstieg |

**Implikation für unser Cookie-Audit:** Unser Einmal-Audit (49/79 €) ist **kein Abo-Konkurrent** zu diesen Tools, sondern ein komplementärer **Tripwire** — günstiger Erstkontakt, der zum BFSG-Report führt. Preise sind passend (kein Änderungsbedarf).

---

## 2. Preis-Lücken-Analyse — wo sitzt BFSG-Check?

```
PREIS-LANDKARTE (Einmal-Deliverable, DACH, logarithmisch)

 0 €        50 €      199 €    497 €    1.200 €         8.000 €        20.000 €
  │          │          │        │         │               │              │
  ▼          ▼          ▼        ▼         ▼               ▼              ▼
┌──────────┐ ┌────────┐ ┌──────────────────┐ ┌───────────┐ ┌──────────────────────┐
│ Gratis-  │ │Cookie- │ │   >> BFSG-CHECK <<│ │ Expert-   │ │ Voll-WCAG-Audit /    │
│ Tools    │ │Audit   │ │  Basis 199 /      │ │ Kurz-     │ │ BIK BITV-Test        │
│ (WAVE,   │ │ (uns)  │ │  Profi 497        │ │ analyse   │ │ (zertifiziert,Siegel)│
│ axe,     │ │ 49/79  │ │  kuratierter      │ │ 490–1.200 │ │                      │
│ LH)      │ │        │ │  Fix-Plan         │ │ (Agentur) │ │                      │
└──────────┘ └────────┘ └──────────────────┘ └───────────┘ └──────────────────────┘
   ▲                          ▲                                      ▲
   │                          │                                      │
 KEIN Fix-Plan,         DIE LÜCKE:                            Zu teuer/langsam
 keine Erklärung,       „Fix-Plan ohne                        für KMU, die nur
 keine DE-Vorlagen      Kanzlei-Honorar"                      die Pflicht erfüllen
                        — schnell, pauschal,                  wollen
                        menschlich geprüft
```

**Die Lücke ist real und groß:** Zwischen „kostenlos, aber unbrauchbar für Laien" (0 €) und „gründlich, aber 1.500 €+ und wochenlang" klafft ein Loch. Genau dort sitzt der Wert: ein **priorisierter, umsetzbarer Fix-Plan + Erklärungs-Entwurf zum Pauschalpreis, geliefert in Stunden**.

**Aber:** Die Lücke wird enger. **BFSGuard greift von unten an** (19,99 €/Mo Abo + 299 € Einmal-Report) und versucht, die Lücke mit Automatisierung zu schließen. Unsere Verteidigung ist **nicht der Preis, sondern das Differenzierungs-Versprechen**:
1. **Menschliche Sichtung** vor Auslieferung (kein reiner Auto-Output).
2. **Kein Overlay** — wir empfehlen echte Fixes, kein rechtlich umstrittenes Widget-Pflaster (Overlays werden in DE/EU zunehmend kritisch gesehen und schützen nicht vor Abmahnung).
3. **Einmal-Kauf statt Abo-Zwang** für die Erst-Compliance — niedrigere Eintrittsschwelle für KMU, die „einmal richtig machen" wollen.

---

## 3. Konkrete Preisempfehlung

### 3.1 Basis-Report: 199 € — **behalten, gegen 249 € testen**

- **Verdikt:** Richtig positioniert. Liegt unter der psychologischen 200-€-Schwelle und schlägt den BFSGuard-Einmal-Report (299 €) im Preis, während es gegenüber Free-Tools klaren Mehrwert (Fix-Plan + Erklärung) bietet.
- **Marge:** Bei ~98 % Marge (KI + kurze menschliche Sichtung) ist 199 € **eher zu billig als zu teuer** — die Gefahr ist nicht Conversion-Killer, sondern liegengelassene Marge.
- **Empfehlung:** 199 € als Kontrolle halten, **Experiment 1 (199 vs. 249 €)** aus `pricing-experiments.md` priorisiert fahren. Wenn der Net-Revenue-per-Visitor bei 249 € hält → dauerhaft auf 249 €. **Nicht** auf 197 € senken (kein Grund, gegen Free zu konkurrieren — wir sind eine andere Kategorie).
- **Psychologie:** 199 € ist ein etablierter Charm-Preis. Falls erhöht: **249 €** (nicht 229 €) — größerer Sprung lohnt den Conversion-Test eher.

### 3.2 Profi-Report: 499 € → **497 € (Charm) — halten, Anchoring verstärken**

- **Verdikt:** Hervorragend positioniert. Sitzt **direkt unter dem Agentur-Floor** (Expert-Kurzanalyse startet bei 490 €) — Botschaft: „Agentur-Tiefe zum Einstiegspreis der Agentur, aber sofort".
- **Mikro-Optimierung:** **497 €** statt 499 € (linke-Ziffer-Effekt minimal, aber 497 wirkt „kalkuliert" statt „aufgerundet"). Optional — Effekt klein, daher nur mitnehmen, wenn ohnehin Code angefasst wird.
- **Anchoring:** Der Profi-Report ist das **FEATURED**-Tier und dient als Anker, der Basis (199 €) günstig erscheinen lässt. **Diesen Anchoring-Effekt verstärken**, indem das neue Agentur-Tier (siehe 3.4) darüber sitzt → Profi wird zur „vernünftigen Mitte".
- **Experiment 2 (499 vs. 599 €)** bleibt valide, aber **niedrigere Priorität** als das Abo-Re-Pricing. Erst fahren, wenn Profi-Volumen für Signifikanz reicht (Profi hat weniger Volumen → langsamer Test).

### 3.3 Re-Check-Abo: 49 €/Mo → **39 €/Mo + Jahresoption 390 €/Jahr** ⚠️ HANDLUNGSBEDARF

> **UMGESETZT (Stand 07/2026, W1-G):** Der Live-Monatspreis ist inzwischen **24,99 €/Mo** (Senkung 27.06.), die Jahresoption ist per Owner-Entscheidung mit **249 €/Jahr** live (Backend-Paket `'abo-jahr'`, Ersparnis 50,88 € ggü. 12 × 24,99 € = 299,88 €). Die 39-€-/390-€-Zahlen unten sind der historische Analysestand und NICHT mehr die gültigen Preise.

- **Verdikt:** **Hier liegt das größte Pricing-Problem.** 49 €/Mo ist im direkten Vergleich zu **BFSGuard Starter (19,99 €/Mo für 3 Sites, inkl. Auto-Fix + Monitoring)** schwer zu verteidigen, wenn der Kunde nur „Überwachung" wahrnimmt. 49 € entspricht fast dem BFSGuard-**Business**-Tier (69 €/Mo, 10 Sites, tägliches Monitoring).
- **Problem:** Ein reines „Re-Check"-Abo ist eine schwache Wertstory gegen automatisierte Dauer-Monitoring-Tools, die dasselbe billiger und häufiger (täglich vs. monatlich) tun.
- **Zwei Optionen:**

  **Option A (empfohlen) — Preis senken + Jahres-Lock-in:**
  - **39 €/Mo** (psychologisch unter 40 €) ODER **390 €/Jahr** (= 2 Monate gratis, spiegelt BFSGuards „2 Monate gratis"-Jahresrabatt).
  - Senkt die Eintrittsschwelle, bleibt aber klar über BFSGuard (Premium-Aufschlag für menschliche Quartals-Sichtung gerechtfertigt).
  - Deckt sich mit **Experiment 4** (49 vs. 39 € + Setup) — aber **ohne** Setup-Fee (Setup-Fee erhöht Reibung; Jahresrabatt ist der bessere Hebel).

  **Option B — Wert erhöhen statt Preis senken (bei 49 € bleiben):**
  - Nur wenn das Abo klar als **„menschlich geprüftes" Quartals-Audit** (nicht nur Auto-Re-Scan) repositioniert wird: 1× pro Quartal echte Sichtung statt rein automatisch. Dann ist 49 €/Mo gegen Agentur-Re-Audits (490–2.500 €/Jahr) ein Schnäppchen.

- **Konkrete Empfehlung:** **Option A** — auf **39 €/Mo** gehen UND **Jahresoption 390 €/Jahr** anbieten. Begründung: Das Abo ist der MRR-Motor (Ziel: jeden Report-Käufer überführen). Eine niedrigere Schwelle maximiert die Überführungsrate; der Jahresplan sichert LTV + Cashflow. Die Differenzierung („menschlich geprüft, kein Overlay") rechtfertigt den Aufschlag gegenüber BFSGuards 19,99 €.
- **Jahresrabatt-Standard:** **„2 Monate gratis bei Jahreszahlung"** (= ~17 % Rabatt) ist im DACH-SaaS-Markt der Konvention (Usercentrics, BFSGuard nutzen das). Übernehmen.

### 3.4 NEU: 4. Tier — **Agentur / White-Label** ⚠️ EMPFOHLEN

- **Verdikt:** **Klare Lücke. BFSGuard hat ein Agency/White-Label-Tier (199 €/Mo, 50 Sites). Wir haben nichts Vergleichbares im Produkt** (nur in `partner-outreach.md` als Idee: „10er-Bundle 1.490 € statt 1.990 €").
- **Strategie:** Statt eines Abo-White-Labels (BFSGuards Modell) → **Einmal-Report-Pakete für Wiederverkäufer.** Das passt besser zum Solo-/Zero-Contact-Setup (kein laufender Account-Management-Aufwand) und differenziert.
- **Konkretes Tier:**
  - **„Agentur-Paket 5er": 990 €** (= 198 €/Report, ~50 % unter Profi-Einzelpreis, knapp unter Basis-Einzel) → Agentur verkauft mit Aufschlag weiter (UVP-Empfehlung an Endkunde: 299–499 €, Agentur-Marge 100–300 €/Report).
  - **„Agentur-Paket 10er": 1.790 €** (= 179 €/Report) — spiegelt die `partner-outreach.md`-Idee, leicht aggressiver.
  - **White-Label-Aufschlag:** Report mit Agentur-Logo (technisch laut `partner-outreach.md` via `renderReport({logo})` vorbereitet) — im 10er-Paket inklusive, im 5er optional +99 €.
- **Wo:** Eigene Sektion auf der Landingpage (`/agentur` oder `/partner`) — **nicht** im normalen Pakete-Grid (würde KMU-Käufer verwirren). Verkauf eher über Partner-Outreach (siehe `partner-outreach.md`) als über Selbstbedienung.
- **Anchoring-Bonus:** Das Tier zeigt im Pakete-Grid (falls als „ab 990 €" gelistet) einen hohen Anker → Profi (497 €) wirkt günstiger.

### 3.5 NEU: Bundle BFSG + Cookie — **229 €** ⚠️ EMPFOHLEN

- **Verdikt:** Cross-Sell-Hebel mit klarem Vorteil. Aktuell sind BFSG (199 €) und Cookie (49 €) getrennte Käufe; Cross-Sell-Take-Rate ist erfahrungsgemäß < 5 %.
- **Bundle:** **„BFSG + Cookie Komplett-Check": 229 €** (statt 199 € + 49 € = 248 € einzeln → **19 € Ersparnis**, ~8 % Bundle-Rabatt).
- **Effekt:** Hebt die Cookie-Take-Rate von < 5 % auf Ziel > 25 % → +30 € durchschnittlicher Mehrumsatz pro Basis-Käufer, der das Bundle nimmt. AOV-Hebel ohne Listenpreis-Erhöhung.
- **Deckt sich exakt mit Experiment 3** in `pricing-experiments.md` — dort schon spezifiziert (229 € Bundle vs. 248 € einzeln). **Umsetzungsreif.**
- **Profi-Variante optional:** „Profi + Cookie-Profi": 549 € (statt 497 + 79 = 576 €) — erst nach Validierung des Basis-Bundles.

### 3.6 Cookie-Produkte: 49 / 79 € — **behalten**

- Beide passen. 49 € ist ein idealer Tripwire (niedrige Schwelle, führt zum BFSG-Report). 79 € Profi mit menschlicher Sichtung ist gegenüber CMP-Abos (7–50 €/Mo laufend) als Einmal-Audit fair. **Kein Änderungsbedarf.**

---

## 4. Agentur / Partner-Modell (Wiederverkäufer-Marge)

> Vertieft `marketing/partner-outreach.md` (dort: Affiliate 20 %/15 %, White-Label 10er 1.490 €). Hier die **konsolidierte Preis-/Margen-Logik**.

| Modell | Partner-Preis | Endkunden-UVP | Partner-Marge | Für wen |
|---|--:|--:|--:|---|
| **Affiliate (Einmal-Report)** | — | 199 / 497 € | **15 % Provision** (~30–75 €/Report) | Unverbindlicher Einstieg, kein Vorab-Kauf |
| **Affiliate (Abo)** | — | 39 €/Mo | **20 % wiederkehrend** (~7,80 €/Mo/Kunde) | Agenturen, die Bestand ins Abo bringen |
| **Agentur-Paket 5er** | **990 €** (198 €/Report) | 299–499 € | **100–300 €/Report** | Web-Agenturen mit 5+ BFSG-Kunden |
| **Agentur-Paket 10er + White-Label** | **1.790 €** (179 €/Report) | 299–499 € | **120–320 €/Report** | Agenturen, die als eigene Leistung verkaufen |

**Warum Einmal-Pakete statt Abo-White-Label (wie BFSGuard 199 €/Mo)?**
- Passt zum Zero-Contact-/Solo-Filter (kein Account-Management, keine Seat-Verwaltung).
- Niedrigere Schwelle für Agenturen („990 € testen" < „199 €/Mo committen").
- Reseller behält volle Preishoheit beim Endkunden → höhere wahrgenommene Marge.

**Tracking:** UTM `?ref=<partner-slug>` + Stripe-Coupon `PARTNER10` (Endkunden-Bonus) — bereits in `STRATEGY-2026.md`/`partner-outreach.md` vorgesehen.

**Affiliate-Provision realistisch?** 15 % einmal / 20 % wiederkehrend liegt im branchenüblichen DACH-SaaS-Korridor (10–30 %). Bei ~98 % Marge gut tragbar. Beibehalten.

---

## 5. Value-Metric — wonach skaliert der Preis?

**Frage:** Pricing nach Seitenzahl, Domains oder Re-Check-Frequenz?

| Value-Metric | Bewertung | Empfehlung |
|---|---|---|
| **Seitenzahl** (aktuell: Basis ≤5, Profi ≤25 Seiten) | ✅ **Beste primäre Metrik** | **Beibehalten.** Intuitiv, korreliert mit Aufwand + Wert, etabliert (musnuss.de, Agenturen rechnen per Seite). Klare Differenzierung Basis/Profi. |
| **Domains** | Für Einmal-Report ungeeignet (1 Kauf = 1 Domain), **aber zentrale Metrik für Abo + Agentur-Tier** | Abo: 1 Domain inklusive, jede weitere +X €. Agentur-Paket: Anzahl Reports (= faktisch Domains). |
| **Re-Check-Frequenz** | Differenzierungs-Hebel **innerhalb** des Abos | Standard monatlich; Premium-Abo-Upsell „wöchentlich + Quartals-Sichtung" denkbar (später). |

**Konkret:**
- **Einmal-Reports:** primäre Value-Metric = **Seitenzahl** (≤5 / ≤25). So lassen wie es ist. Optional später ein „Enterprise-Report ≤100 Seiten" auf Anfrage (Preis individuell, kein Listenpreis).
- **Abo:** Value-Metric = **Domains** (1 inkl., weitere kostenpflichtig) + optional Frequenz.
- **Agentur:** Value-Metric = **Report-Volumen** (5er/10er-Staffel). Mengenrabatt = klassische B2B-Logik.

**Nicht** auf Traffic/Page-Views umstellen (wie accessiBe/UserWay) — das passt zu Overlay-Widgets, nicht zu einem Einmal-Audit-Deliverable und ist für KMU intransparent.

---

## 6. A/B-Test-Empfehlungen (Priorisierung)

> Ergänzt `marketing/pricing-experiments.md`. Die 5 dort definierten Experimente bleiben gültig; hier die **Reihenfolge** auf Basis der Wettbewerbsanalyse + zwei **neue** Tests.

**Empfohlene Test-Reihenfolge (max. 2 parallel, lt. globaler Regel):**

| Rang | Test | Quelle | Warum zuerst |
|---|---|---|---|
| **1** | **Abo: 49 € vs. 39 € (+ Jahresoption)** | Exp. 4 (anpassen: Jahresplan statt Setup-Fee) | Größter strategischer Hebel — Abo ist gegen BFSGuard am schwächsten positioniert, MRR ist das Geschäftsmodell-Herz. |
| **2** | **Bundle BFSG+Cookie 229 € vs. einzeln** | Exp. 3 | AOV-Hebel, umsetzungsreif, niedriges Risiko, direkt messbarer Cross-Sell-Lift. |
| **3** | **Basis 199 € vs. 249 €** | Exp. 1 | Margen-Hebel auf das Volumen-Produkt. Erst nach Bundle (sonst überlappende Checkout-Varianten). |
| **4** | **Profi 497 € vs. 599 €** | Exp. 2 | Niedrigeres Volumen → längere Sample-Zeit, später. |
| **5** | **Payment-Mix (Klarna/PayPal)** | Exp. 5 | Conversion-Hebel unabhängig vom Preis — jederzeit parallel-fähig. |

**NEU — zwei zusätzliche Tests (in `pricing-experiments.md` ergänzt):**

- **Experiment 6 — Anchoring durch Agentur-Tier:** Pakete-Grid **mit** vs. **ohne** sichtbares „Agentur ab 990 €"-Tier. Hypothese: Sichtbarer High-Anchor erhöht den Profi-Anteil (Mix-Shift Basis→Profi), AOV +≥ 8 %.
- **Experiment 7 — Abo-Jahresrabatt:** „2 Monate gratis" (390 €/Jahr) vs. „20 % Rabatt" (374 €/Jahr) als Jahresangebot. Hypothese: Die „2 Monate gratis"-Frame konvertiert besser bei gleichem effektivem Rabatt (Frame-Effekt).

---

## 7. Konkrete Umsetzungs-Liste für den Hauptagenten

> **Achtung:** Preise sind an **zwei** Stellen Source-of-Truth — beide synchron halten:
> 1. `scanner/app.js` → `const PACKAGES` (Z. 42–50) — **Stripe-Beträge in Cent**, maßgeblich für Checkout.
> 2. `landingpage-next/lib/config.ts` → `PACKAGES` / `COOKIE_PACKAGES` (Z. 113–201) — Anzeige-Strings + `amountCents`.
>
> `scanner/app.js` ist laut Header-Kommentar in `config.ts` die „Quelle der Wahrheit" — dort zuerst ändern, dann `config.ts` spiegeln. **Stripe-Price-IDs** müssen für jeden geänderten/neuen Preis im Stripe-Dashboard neu angelegt werden (alte Preise nicht löschen → laufende Abos/Links nicht brechen).

### A) Sofort umsetzbar (klare Empfehlung, niedriges Risiko)

**A1 — Abo 49 € → 39 €/Mo:**
- `scanner/app.js` Z. 48: `abo: { ... amount: 4900 ... }` → `amount: 3900`
- `landingpage-next/lib/config.ts` Z. 152–153: `price: "49 €"` → `"39 €"`; Z. 156: `amountCents: 4900` → `3900`
- Stripe: neue Subscription-Price `price_abo_3900_monthly` anlegen.

**A2 — Abo-Jahresoption (UMGESETZT 07/2026 mit 249 €/Jahr statt der hier alten 390 €):**
- ✅ `scanner/app.js` `PACKAGES`: `'abo-jahr': { name: 'BFSG Re-Check Abo (jährlich)', amount: 24900, mode: 'subscription', interval: 'year' }` (hinter `ENABLE_ABO`).
- ✅ `scanner/lib/fulfill.js` `PKG_CONFIG['abo-jahr']` identisch zu `abo` (25 Seiten, Statement, emailKind `recheck`) — ohne den Eintrag griffe der basis-Fallback.
- ✅ `landingpage-next/lib/config.ts`: `PackageId` um `"abo-jahr"` erweitert; Abo-Eintrag trägt `annualId`/`annualAmountCents: 24900`/`annualPrice: "249 €"`; `ABO_ANNUAL`-Paket fürs CheckoutModal; Jahres-Toggle in `PricingCards.tsx` aktiv.
- ✅ Kein Stripe-Dashboard-Schritt nötig: Checkout nutzt inline `price_data` (kein persistenter Price).
- ✅ Monats-Re-Check-Takt fürs Jahres-Abo: `startAnnualRecheckTicker` in `scanner/app.js` (invoice.paid feuert bei `interval:'year'` nur jährlich).

**A3 — Bundle „BFSG + Cookie" 229 € (NEU):**
- `scanner/app.js` `PACKAGES`: neuer Key
  `'bundle-basis-cookie': { name: 'BFSG + Cookie Komplett-Check', amount: 22900, mode: 'payment' }`
- `landingpage-next/lib/config.ts`: neues Paket-Objekt (eigene Konstante `BUNDLE_PACKAGES` oder in `PACKAGES` mit Hinweis-Tag „Bundle · spart 19 €"), `price: "229 €"`, `amountCents: 22900`, Features = Basis + Cookie-Basis kombiniert.
- `PackageId`-Type um `"bundle-basis-cookie"` erweitern.
- Stripe: Payment-Price 22900 Cent.

### B) Empfohlen, etwas mehr Aufwand (neue Landingpage-Sektion)

**B1 — Agentur-Tier (NEU):**
- `scanner/app.js` `PACKAGES`: zwei Keys
  `'agentur-5': { name: 'Agentur-Paket 5 Reports', amount: 99000, mode: 'payment' }`
  `'agentur-10': { name: 'Agentur-Paket 10 Reports + White-Label', amount: 179000, mode: 'payment' }`
- `landingpage-next/lib/config.ts`: eigene Konstante `AGENCY_PACKAGES` (nicht ins KMU-`PACKAGES`-Grid mischen). Felder: 5er `price: "990 €"` / `amountCents: 99000`; 10er `price: "1.790 €"` / `amountCents: 179000`.
- `PackageId`-Type um `"agentur-5" | "agentur-10"` erweitern.
- Neue Landingpage-Route/Sektion `/agentur` (Hinweis: Next-Version in diesem Repo weicht von Standard ab — vor Implementierung `node_modules/next/dist/docs/` lesen, lt. `landingpage-next/AGENTS.md`).
- Stripe: zwei Payment-Prices.

### C) Optional / Mikro (nur mitnehmen, wenn ohnehin im Code)

**C1 — Profi 499 € → 497 € (Charm):**
- `scanner/app.js` Z. 44: `amount: 49900` → `49700`
- `config.ts` Z. 136: `"499 €"` → `"497 €"`; Z. 137: `49900` → `49700`
- Stripe: neue Price 49700. **Niedrige Priorität** — Effekt klein, Stripe-Aufwand real. Eher im Rahmen von Experiment 2 testen als blind umsetzen.

**C2 — Basis 199 € (NICHT ändern, nur testen):** Kein Code-Change ohne Experiment 1. Bei Test-Sieg von 249 €: Z. 43 `19900` → `24900`, config.ts Z. 118/121 analog.

### D) Texte/Copy (nur Marketing, kein Preis-Code)

- `marketing/OFFER.md` Value-Ladder: Abo 49 → 39 €, Bundle + Agentur-Tier ergänzen (kann der Hauptagent oder ich übernehmen — habe es hier in der Strategie dokumentiert, OFFER.md aber nicht geändert, um Konflikte zu vermeiden).
- **UWG-Hinweis für alle Preis-Copy:** Bundle-/Rabatt-Auslobung muss den Referenzpreis korrekt nennen („statt 248 € einzeln"). Keine Angst-/Garantie-Argumente. Bei „2 Monate gratis" den effektiven Jahrespreis transparent zeigen (PAngVO).

---

## 8. UWG-/Recht-Leitplanken für Pricing-Kommunikation

- **Keine Angst-Pricing-Argumente** („sonst 100.000 € Bußgeld") als Verkaufsdruck — sachliche Risiko-Einordnung ist ok, Drohkulisse nicht (irreführend/aggressive Geschäftspraktik, § 4a UWG). Hinweis: Die Risiko-Formulierung in `marketing/OFFER.md` Z. 38 („eine Abmahnung kostet 3.500–20.000 €…") ist als interne Verkaufs-Begründung grenzwertig — in der **öffentlichen** Copy entschärfen.
- **Streichpreise/Rabatte** nur mit echtem, zuvor verlangtem Referenzpreis (§ 11 PAngV).
- **Abo-Transparenz:** Kündigungsbutton, klare Laufzeit/Frequenz, bei Jahresplan effektiver Monats-/Jahrespreis sichtbar.
- **Keine Konformitätsgarantie** in keiner Preis-Stufe — durchgängig konsistent mit `LEGAL_NOTE` (config.ts Z. 268).
- **B2B vs. B2C:** Agentur-/White-Label-Preise sind netto (B2B), KMU-Endkundenpreise inkl. Hinweis auf USt-Behandlung (vgl. FAQ in config.ts).

---

## 9. Quellen (Recherche 06/2026)

- **Audit-Preise DACH (Übersicht):** barrierefix.de — https://www.barrierefix.de/de/blog/was-kostet-accessibility-audit-preise-2026
- **BFSG-Kosten + Förderung:** barrierefreie-agenturen.de — https://barrierefreie-agenturen.de/ratgeber/bfsg-kosten/
- **BFSGuard (Haupt-Wettbewerber, Tiers):** https://bfsguard.de/
- **Fixpreis-Audit (modular):** musnuss.de — https://musnuss.de/website-barrierefreiheits-audit/
- **BIK BITV-Test Kosten:** barrierefreiheit-umsetzen.de — https://barrierefreiheit-umsetzen.de/bik-bitv-test/
- **Eye-Able (Overlay/Assist):** https://eye-able.com/
- **UserWay Pricing:** https://userway.org/pricing/
- **accessiBe accessWidget Pricing:** https://accessibe.com/pricing/accesswidget
- **Usercentrics CMP Pricing:** https://usercentrics.com/de/pricing/
- **Cookiebot Pricing:** https://www.cookiebot.com/us/pricing/
- **CookieFirst (Preis-Einstieg):** via prinzip-e.de Vergleich — https://www.prinzip-e.de/blog-posts/kostenfreies-consent-management
- **Free-Tools (WAVE/axe/Lighthouse, ~30–40 % Abdeckung):** Deque axe DevTools — https://www.deque.com/axe/devtools/ ; WebAIM WAVE — https://wave.webaim.org/

---

## 10. Zusammenfassung der Empfehlung (eine Seite)

1. **Einmal-Reports (199/497) halten** — sie besetzen die Lücke perfekt. Marge über Anchoring + Bundle + Agentur-Tier holen, **nicht** über Listenpreis-Senkung. Basis optional auf 249 € testen.
2. **Abo von 49 → 39 €/Mo senken + Jahresoption 390 €/Jahr** — einziger echter Schwachpunkt gegen BFSGuard (19,99 €/Mo). MRR-Überführung priorisieren.
3. **Bundle BFSG+Cookie (229 €) einführen** — sofortiger AOV-Hebel, umsetzungsreif.
4. **Agentur/White-Label-Tier (990 €/5er, 1.790 €/10er) einführen** — größte unbesetzte Lücke, kontert BFSGuards 199 €/Mo White-Label mit Einmal-Paketen (passt zum Solo-Setup).
5. **Cookie-Produkte (49/79) unverändert** — solide Tripwire.
6. **Test-Reihenfolge:** Abo-Pricing → Bundle → Basis → Profi → Payment-Mix. Plus zwei neue Tests (Anchoring-Tier, Jahresrabatt-Frame).
