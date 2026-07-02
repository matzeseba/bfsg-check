# Pricing-Experimente — 5 A/B-Tests (Q3/Q4 2026)

> ⚠️ **Preis-Sync 02.07.2026:** Die Live-Preise sind seit 27.06.2026 **Basis 129 € · Profi 399 € · Cookie 39/69 € · Abo 24,99 €/Mo** (marktbasierte Senkung). Die Experiment-Baselines unten wurden entsprechend aktualisiert — Kontrolle = jeweils aktueller Live-Preis.
>
> **Ziel:** Preis-Elastizität, Bundle-Wirkung und Payment-Mix mit echten Kunden empirisch klären, nicht nur raten.
>
> **Test-Priorisierung (nach Wettbewerbsanalyse, siehe `docs/PRICING-STRATEGY.md` §6):**
> 1. **Exp. 4 — Abo-Jahresoption** (größter strategischer Hebel: Monats-Abo 24,99 € vs. Jahresplan ~249 €/Jahr)
> 2. **Exp. 3 — Bundle BFSG+Cookie** (umsetzungsreifer AOV-Hebel, niedriges Risiko)
> 3. **Exp. 1 — Basis 129 € vs. 169 €** (Margen-Hebel auf Volumen-Produkt)
> 4. **Exp. 2 — Profi 399 € vs. 499 €** (niedriges Volumen → später)
> 5. **Exp. 5 — Payment-Mix** (preisunabhängig, jederzeit parallel)
> Plus neu: **Exp. 6 (Anchoring-Tier)** und **Exp. 7 (Jahresrabatt-Frame)** — siehe unten.
>
> **Globale Regeln:**
> - Max. 2 Tests parallel (sonst zerfasern die Cohorts).
> - Min. Laufzeit pro Test: 4 Wochen oder bis 95 % statistische Signifikanz erreicht (was zuerst eintritt).
> - Mindest-Sample pro Variante: 200 Sessions (sonst kein Test-Stop).
> - Tracking-Source-of-Truth: Stripe-Transaktionen (Posthog liefert das Funnel-Vorfeld, aber finale Kauf-Entscheidung wird in Stripe gemessen).
> - Vor Test-Start: Hypothese + Erfolgs-Kriterium + Roll-back-Plan **in dieser Datei** ergänzen (Update-Disziplin).

---

## Experiment 1 — Basis-Report: 129 € vs. 169 €

- **Hypothese:** „Eine Erhöhung auf 169 € reduziert die Conversion um maximal 15 %, erhöht aber den Net-Revenue pro Besucher (RPV) um mindestens 10 %."
- **Variante A (Kontrolle):** 129 € (Live-Preis)
- **Variante B (Test):** 169 €
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

## Experiment 2 — Profi-Report: 399 € vs. 499 €

- **Hypothese:** „Premium-Käufer reagieren weniger preissensitiv. 499 € verliert maximal 10 % der Conversion, erhöht aber den AOV um 20 %."
- **Variante A:** 399 € (Live-Preis)
- **Variante B:** 499 €
- **Erfolgs-Kriterium:**
  - Net-Revenue-per-Visitor (B) > 1,15 × A bei 95 % Konfidenz.
  - Refund-Rate < 5 % in beiden Varianten (sonst preis-induzierte Enttäuschung).
- **Tooling:**
  - Gleiche Posthog/Stripe-Architektur wie Exp. 1, Flag `pricing.profi`.
  - Eigener Stripe-Price-ID-Set für 399 / 499.
- **Tracking-Setup:** identisch zu Exp. 1, zusätzlich Event `refund_requested` mit `variant`.
- **Laufzeit:** 6 Wochen (Profi hat weniger Volumen → längere Sample-Aufbauzeit).
- **Roll-back-Plan:** Refund-Rate > 8 % bei B → Sofort-Stop; AOV-Wirkung dann nicht real.

---

## Experiment 3 — Bundle „BFSG + Cookie" 149 € vs. Einzel 168 €

- **Hypothese:** „Ein Bundle-Preis 149 € (statt 129 € + 39 € = 168 € einzeln) erhöht Cross-Sell-Take-Rate von < 5 % auf > 25 %, sodass der absolute Umsatz pro Bundle-Käufer steigt."
- **Variante A (Kontrolle):** Basis 129 € + separate Cookie-Buchung 39 € (Cross-Sell-Banner im Checkout).
- **Variante B (Test):** Bundle „BFSG + Cookie" 149 € als zusätzliche Option im Checkout-Step 1.
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

## Experiment 4 — Abo: 24,99 €/Mo vs. 24,99 €/Mo + Jahresoption 249 €/Jahr ⭐ PRIO 1 · **IN UMSETZUNG**

> **Angepasst (07/2026):** Live-Monatspreis ist bereits 24,99 € (Senkung 27.06.). Der Hebel ist jetzt nicht mehr die Monatspreis-Senkung, sondern die **Jahresoption** (Cashflow + LTV-Lock-in, „Audit + 12 Monate Überwachung"-Framing aus dem 02.07.-Audit).
>
> **Status IN UMSETZUNG (03.07.2026, W1-G):** Variante B ist technisch gebaut — Backend-Paket `'abo-jahr'` (249 €/Jahr, inline `price_data`, `interval:'year'`), Jahres-Toggle in `PricingCards.tsx`, AGB § 5 (Erstlaufzeit 12 Monate, § 309 Nr. 9 BGB), monatlicher Re-Check-Ticker fürs Jahres-Abo. Ersparnis-Auslobung „spart 50,88 €" (aus den festen Preisen abgeleitet, PAngV-transparent). Posthog-Flag/A-B-Split noch NICHT verdrahtet — aktuell sehen alle Besucher die Jahresoption (de facto Variante B für 100 %).

- **Hypothese:** „Eine Jahresoption 249 €/Jahr (≈ 2 Monate gratis) erhöht Cashflow + LTV, erreicht ≥ 20 % Jahresplan-Anteil und senkt die Report→Abo-Überführungsrate nicht."
- **Variante A (Kontrolle):** 24,99 €/Mo, keine Jahresoption.
- **Variante B (Test):** 24,99 €/Mo **+ Jahresoption 249 €/Jahr** („2 Monate gratis").
- **Erfolgs-Kriterium:**
  - Sign-up-/Überführungs-Rate (B) > 1,3 × A bei 95 % Konfidenz.
  - 6-Monats-LTV (B) ≥ 0,95 × A (max. 5 % LTV-Reduktion; Jahresabschlüsse zählen anteilig).
  - Sekundär: Jahresplan-Anteil ≥ 20 % der B-Abschlüsse (Cashflow-Effekt).
- **Tooling:**
  - Posthog Flag `abo.pricing = 'A'|'B'`.
  - Stripe Subscription: Plan 2499/Mo (A) bzw. 2499/Mo + 24900/Jahr (B).
  - LTV-Modell: Stripe-Revenue/Kunde über 6 Mo, gewichtet nach Cohort, Jahresumsatz auf 12 Mo verteilt.
- **Tracking-Setup:** Events `abo_view`, `abo_signed` (mit `plan: monthly|yearly`), monatliches Snapshot der Cohort-Retention.
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

## Experiment 6 — Anchoring: Pakete-Grid mit vs. ohne Agentur-Tier

> **Neu (06/2026, `docs/PRICING-STRATEGY.md` §3.4 + §6).** Testet, ob ein sichtbarer High-Anchor („Agentur ab 990 €") den Produkt-Mix Richtung Profi verschiebt.

- **Hypothese:** „Ein sichtbares Agentur-Tier (ab 990 €) im/über dem Pakete-Grid wirkt als Preis-Anker und erhöht den Profi-Anteil (Mix-Shift Basis→Profi), sodass der AOV um ≥ 8 % steigt — ohne die Gesamt-Conversion zu senken."
- **Variante A (Kontrolle):** Pakete-Grid nur Basis/Profi/Abo (Agentur nur auf separater `/agentur`-Seite).
- **Variante B (Test):** Zusätzlich „Agentur ab 990 €"-Karte als vierter, optisch abgesetzter Anker im Grid.
- **Erfolgs-Kriterium:**
  - AOV (B) > 1,08 × A bei 95 % Konfidenz.
  - Gesamt-Conversion (B) ≥ 0,97 × A (Anker darf KMU nicht abschrecken).
  - Sekundär: Profi-Anteil an allen Report-Käufen (B) > A.
- **Tooling:** Posthog Flag `grid.anchor = 'off'|'on'`; Pakete-Component rendert vierte Karte je nach Flag.
- **Tracking-Setup:** Events `pricing_view` (mit `variant`), `package_selected` (mit `package`), `purchase_completed` (mit `package` + `amount`).
- **Laufzeit:** 4 Wochen.
- **Roll-back-Plan:** Wenn Gesamt-Conversion (B) > 5 % unter A → Anker raus aus Grid (zurück auf separate Seite).

---

## Experiment 7 — Abo-Jahresrabatt: „2 Monate gratis" vs. „20 % Rabatt"

> **Neu (06/2026, `docs/PRICING-STRATEGY.md` §6).** Frame-Test bei (nahezu) gleichem effektivem Rabatt.

- **Hypothese:** „Der Frame ‚2 Monate gratis' (390 €/Jahr) konvertiert besser als ‚20 % Rabatt' (374 €/Jahr) — trotz minimal höherem Preis, weil ‚gratis' stärker zieht als ein Prozent-Rabatt."
- **Variante A:** Jahresplan beworben als „20 % sparen" → 374 €/Jahr.
- **Variante B:** Jahresplan beworben als „2 Monate gratis" → 390 €/Jahr.
- **Erfolgs-Kriterium:**
  - Jahresplan-Take-Rate (B) ≥ A bei 95 % Konfidenz (B gewinnt schon bei Gleichstand, da höherer Preis = mehr Umsatz/Abschluss).
  - Net-Revenue pro Abo-Abschluss (B) > A.
- **Tooling:** Posthog Flag `abo.annual_frame = 'percent'|'free_months'`; Stripe-Price 37400 (A) vs. 39000 (B) für Jahresplan.
- **Tracking-Setup:** Events `abo_view`, `abo_signed` (mit `plan` + `frame` + `amount`).
- **Laufzeit:** 8 Wochen (Jahresabschlüsse sind seltener → längere Sample-Zeit).
- **Roll-back-Plan:** Wenn Jahres-Take-Rate in beiden Varianten < 10 % → Jahresplan-Bewerbung überdenken (nicht der Frame, sondern das Angebot ist das Problem).
- **Abhängigkeit:** Erst starten, wenn Exp. 4 die Jahresoption grundsätzlich validiert hat.

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
