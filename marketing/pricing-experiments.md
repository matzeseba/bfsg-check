# Pricing-Experimente — 5 A/B-Tests (Q3/Q4 2026)

> **Ziel:** Preis-Elastizität, Bundle-Wirkung und Payment-Mix mit echten Kunden empirisch klären, nicht nur raten.
> **Globale Regeln:**
> - Max. 2 Tests parallel (sonst zerfasern die Cohorts).
> - Min. Laufzeit pro Test: 4 Wochen oder bis 95 % statistische Signifikanz erreicht (was zuerst eintritt).
> - Mindest-Sample pro Variante: 200 Sessions (sonst kein Test-Stop).
> - Tracking-Source-of-Truth: Stripe-Transaktionen (Posthog liefert das Funnel-Vorfeld, aber finale Kauf-Entscheidung wird in Stripe gemessen).
> - Vor Test-Start: Hypothese + Erfolgs-Kriterium + Roll-back-Plan **in dieser Datei** ergänzen (Update-Disziplin).

---

## Experiment 1 — Basis-Report: 199 € vs. 249 €

- **Hypothese:** „Eine Erhöhung auf 249 € reduziert die Conversion um maximal 15 %, erhöht aber den Net-Revenue pro Besucher (RPV) um mindestens 10 %."
- **Variante A (Kontrolle):** 199 €
- **Variante B (Test):** 249 €
- **Erfolgs-Kriterium:**
  - Primär: Net-Revenue-per-Visitor (Variante B) > 1,10 × Variante A bei 95 % Konfidenz.
  - Sekundär: Conversion-Drop < 15 %.
- **Tooling:**
  - Posthog Feature Flag `pricing.basis = 'A'|'B'` mit 50/50-Split.
  - Vercel-Edge-Middleware liest Flag und liefert passende Stripe-Price-ID.
  - Stripe-Webhook taggt Bestellung mit Variant (`metadata.variant`).
- **Tracking-Setup:**
  - Event `pricing_view` mit Property `variant`
  - Event `checkout_started` mit `variant`
  - Event `purchase_completed` (aus Stripe-Webhook) mit `variant` + `amount`
  - Auswertung in Looker Studio: Funnel pro Variante + RPV-Kalkulation.
- **Laufzeit:** 4 Wochen ab Start.
- **Roll-back-Plan:** Wenn Variante B nach 14 Tagen > 25 % Conversion-Drop hat → Sofort-Stop, Roll-back auf A.

---

## Experiment 2 — Profi-Report: 499 € vs. 599 €

- **Hypothese:** „Premium-Käufer reagieren weniger preissensitiv. 599 € verliert maximal 10 % der Conversion, erhöht aber den AOV um 20 %."
- **Variante A:** 499 €
- **Variante B:** 599 €
- **Erfolgs-Kriterium:**
  - Net-Revenue-per-Visitor (B) > 1,15 × A bei 95 % Konfidenz.
  - Refund-Rate < 5 % in beiden Varianten (sonst preis-induzierte Enttäuschung).
- **Tooling:**
  - Gleiche Posthog/Stripe-Architektur wie Exp. 1, Flag `pricing.profi`.
  - Eigener Stripe-Price-ID-Set für 499 / 599.
- **Tracking-Setup:** identisch zu Exp. 1, zusätzlich Event `refund_requested` mit `variant`.
- **Laufzeit:** 6 Wochen (Profi hat weniger Volumen → längere Sample-Aufbauzeit).
- **Roll-back-Plan:** Refund-Rate > 8 % bei B → Sofort-Stop; AOV-Wirkung dann nicht real.

---

## Experiment 3 — Bundle „BFSG + Cookie" 229 € vs. Einzel 248 €

- **Hypothese:** „Ein Bundle-Preis 229 € (statt 199 € + 49 € = 248 € einzeln) erhöht Cross-Sell-Take-Rate von < 5 % auf > 25 %, sodass der absolute Umsatz pro Bundle-Käufer steigt."
- **Variante A (Kontrolle):** Basis 199 € + separate Cookie-Buchung 49 € (Cross-Sell-Banner im Checkout).
- **Variante B (Test):** Bundle „BFSG + Cookie" 229 € als zusätzliche Option im Checkout-Step 1.
- **Erfolgs-Kriterium:**
  - Bundle-Take-Rate ≥ 25 % aller Basis-Käufer.
  - Net-Revenue pro Besucher (B) > 1,08 × A bei 95 % Konfidenz.
- **Tooling:**
  - Posthog Flag `bundle.basis_cookie = 'on'|'off'`.
  - Stripe-Price-ID für Bundle vorbereitet (Composite-Item mit beiden SKUs).
  - Checkout-Component liest Flag und rendert Bundle-Card oder Separat-Cross-Sell.
- **Tracking-Setup:** Event `bundle_view`, `bundle_added`, `purchase_completed` mit `items: ['basis','cookie']`.
- **Laufzeit:** 6 Wochen.
- **Roll-back-Plan:** Wenn Bundle-Take-Rate < 10 % → kein signifikanter Effekt, Bundle wieder deaktivieren.

---

## Experiment 4 — Abo: 49 €/Mo vs. 39 €/Mo + 5 € Setup

- **Hypothese:** „Der niedrigere Monatspreis senkt psychologische Eintrittsschwelle. Setup-Fee deckt Bonitäts-/Onboarding-Risiko ab. Brutto-Abo-Conversion steigt um > 30 %, ohne dass LTV-pro-Kunde sinkt."
- **Variante A (Kontrolle):** 49 €/Mo, kein Setup-Fee.
- **Variante B (Test):** 39 €/Mo + 5 € einmaliges Setup-Fee.
- **Erfolgs-Kriterium:**
  - Sign-up-Rate (B) > 1,3 × A bei 95 % Konfidenz.
  - 6-Monats-LTV (B) ≥ 0,95 × A (Variante B darf maximal 5 % LTV-Reduktion bringen).
- **Tooling:**
  - Posthog Flag `abo.pricing = 'A'|'B'`.
  - Stripe Subscription mit zwei Plänen + One-time Item für Setup.
  - LTV-Modell: Stripe-Revenue/Kunde über 6 Mo, gewichtet nach Cohort.
- **Tracking-Setup:** Events `abo_view`, `abo_signed`, monatliches Snapshot der Cohort-Retention.
- **Laufzeit:** 12 Wochen (Subscription braucht Zeit für LTV-Aussage).
- **Roll-back-Plan:** Wenn Churn nach Monat 2 in Variante B > Variante A + 5 pp → Sofort-Stop.

---

## Experiment 5 — Payment-Mix: Stripe-only vs. Stripe + Klarna + PayPal

- **Hypothese:** „Zusätzliche Payment-Methoden (Klarna Rechnung B2B, PayPal Express B2C) erhöhen Checkout-Completion-Rate um > 20 % im B2C-Segment."
- **Variante A (Kontrolle):** nur Stripe-Karte + SEPA.
- **Variante B (Test):** Stripe-Karte + SEPA + Klarna Rechnung (B2B) + PayPal (B2C).
- **Erfolgs-Kriterium:**
  - Checkout-Completion-Rate (B) > 1,2 × A bei 95 % Konfidenz.
  - Stripe-Gebühren-Mehrkosten < 1 pp Marge.
- **Tooling:**
  - Posthog Flag `payment.methods = 'minimal'|'extended'`.
  - Stripe Payment Element mit dynamischer Methoden-Liste.
  - PayPal/Klarna im Stripe-Dashboard aktiviert.
- **Tracking-Setup:** Events `checkout_started`, `checkout_method_selected` (mit `method`), `purchase_completed` (mit `method` + `fee_eur`).
- **Laufzeit:** 4 Wochen.
- **Roll-back-Plan:** Wenn Klarna-Rückbuchungsquote > 3 % → Klarna allein deaktivieren, PayPal behalten.

---

## Auswertungs-Vorlage (für alle Tests)

Nach Test-Ende für jedes Experiment dokumentieren:

```markdown
## Ergebnis Experiment N

- **Start:** YYYY-MM-DD · **Ende:** YYYY-MM-DD
- **Sample-Größe Variante A:** XXX Sessions, YY Käufe
- **Sample-Größe Variante B:** XXX Sessions, YY Käufe
- **Primärmetrik A vs B:** XX,X% vs XX,X% (Konfidenz: XX %)
- **Sekundärmetrik:** ...
- **Entscheidung:** Variante A / Variante B / Inkonklusiv → neuer Test geplant
- **Roll-out-Datum:** YYYY-MM-DD
- **Learnings (3 Punkte):**
  1. ...
  2. ...
  3. ...
```

---

## Statistik-Hinweise

- **Signifikanz-Berechnung:** Zwei-Proportion-Z-Test (für Conversion) oder Mann-Whitney-U (für AOV/RPV).
- **Sequenzielle Tests:** Da wir früh stoppen wollen, verwende **Sequential Probability Ratio Test (SPRT)** oder Bayes-A/B (Posthog hat eingebaute Bayes-Auswertung).
- **Multiple-Comparison:** Wenn mehr als 2 Varianten getestet werden, Bonferroni-Korrektur (Alpha auf 0,05/n).
- **Saisonale Effekte:** Tests nicht in Hauptsaison (Black-Friday, Weihnachten) starten, sonst verzerrt.
- **Cohort-Trennung:** Pro Test ein separates UTM-Set, damit Channel-Mix nicht in einen Test reinrutscht (z. B. Brand-Suche hat andere Preiselastizität als Cold Ads).
