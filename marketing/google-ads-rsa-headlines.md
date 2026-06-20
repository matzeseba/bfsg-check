# Google Ads RSA Headlines + Keyword-Setup

> **Budget:** 13 €/Tag · **Match-Type:** Exact + Phrase nur · **Bidding:** Manuelle CPC max 4 €/Klick

---

## Top-15 Intent-High Keywords (Exact + Phrase)

| # | Keyword | Match | Geschätzte CPC | Intent |
|---|---|---|---|---|
| 1 | bfsg check | exact, phrase | 2-5 € | transactional |
| 2 | bfsg software | exact, phrase | 3-6 € | transactional |
| 3 | bfsg website prüfen | exact, phrase | 2-4 € | transactional |
| 4 | bfsg konform machen | exact, phrase | 3-5 € | transactional |
| 5 | barrierefreiheit website prüfen | exact, phrase | 2-4 € | transactional |
| 6 | wcag audit tool | exact, phrase | 3-6 € | transactional |
| 7 | bfsg pflicht shopify | exact, phrase | 1-3 € | qualifier |
| 8 | bfsg pflicht shopware | exact, phrase | 1-3 € | qualifier |
| 9 | bfsg pflicht wordpress | exact, phrase | 1-3 € | qualifier |
| 10 | bfsg onlineshop | exact, phrase | 2-4 € | transactional |
| 11 | barrierefreiheitserklärung generator | exact, phrase | 1-3 € | tool |
| 12 | barrierefreiheit testen kostenlos | phrase | 1-2 € | top-funnel |
| 13 | wcag 2.1 aa checkliste deutsch | phrase | 1-2 € | informational |
| 14 | cookie banner rechtssicher 2026 | phrase | 1-3 € | adjacent |
| 15 | bfsg abmahnung vermeiden | phrase | 2-4 € | fear-driven |

---

## Negative Keywords (CRITICAL — verhindert Geldverbrennung)

```
kostenlos
free
gratis
gesetz
definition
bedeutung
jobs
ausbildung
studium
beruf
behörde
amt
pdf download
vorlage download
wikipedia
englisch
osten
schweiz (wenn nur DE-Target)
österreich (wenn nur DE-Target)
behindertenausweis
schwerbehinderung
inklusion
sozialgesetz
```

---

## RSA-Headlines (15 Headlines, Google rotiert die besten 3)

> **Regel:** Keine „BFSG-konform"-Garantien (UWG §5 Irreführung)! Stattdessen „Check", „Audit", „Prüfung".

### Headlines (30 Zeichen Max)
1. `BFSG-Check in 60 Sekunden`
2. `WCAG 2.1 AA Audit ab 199 €`
3. `Barrierefreiheit prüfen`
4. `Vollreport mit Fix-Plan`
5. `Made in Germany 🇩🇪`
6. `Kein Abo-Zwang ab 199 €`
7. `Gratis-Scan jetzt starten`
8. `BFSG seit 28.06.2025 Pflicht`
9. `Findings + Umsetzungsplan`
10. `Auto-Scan + manueller Review`
11. `Für Shopify/Shopware/WP`
12. `Abmahn-Risiko vermeiden`
13. `PDF-Report deutsch + sofort`
14. `Cookie-Check inklusive`
15. `Re-Check 39 €/Monat möglich`

### Descriptions (90 Zeichen Max)
<!-- GEPRÜFT: alle ≤90 Zeichen (Google-Limit) -->
1. `BFSG/WCAG-Scan mit Vollreport als PDF. Konkrete Findings, kein Abo, auf Deutsch.`
2. `Score gratis in 60 Sek. Vollreport mit Umsetzungsplan ab 199 €. Made in Germany.`
3. `BFSG-Pflicht seit 28.06.2025. Findings + Fix-Plan ab 199 €. Sofort als PDF.`
4. `Cookie-Check + WCAG-Audit in einem PDF. Kein Abo, automatischer Scan, sofort.`

### Pinned Headlines
- Headline 1 (immer pinnen): `BFSG-Check in 60 Sekunden`
- Headline 2 (pinnen wenn Cookie-Sortiment): `Cookie-Check inklusive`

---

## Sitelink-Extensions (4 Stück)

| Sitelink | URL | Description |
|---|---|---|
| Gratis-Scan starten | `bfsg-fix.de/` | 60-Sek-Test mit Score-Ergebnis |
| Pakete & Preise | `bfsg-fix.de/preise` | Basis 199 €, Profi 499 €, Re-Check 39 €/Mo |
| Was prüft BFSG-Check? | `bfsg-fix.de/methodik` | WCAG-Kriterien + Cookie-Regeln |
| Für Agenturen | `bfsg-fix.de/agenturen` | White-Label-Bundle ab 1.490 € |

---

## Callout-Extensions (6 Stück, max 25 Zeichen)

- ✅ Made in Germany
- ✅ Kein Abo-Zwang
- ✅ DSGVO-konform
- ✅ Sofort-Download PDF
- ✅ 60 Sek Gratis-Scan
- ✅ Server in Nürnberg

---

## Conversion-Tracking Setup

### Stripe-Webhook → Tag Manager → GA4

```javascript
// scanner/app.js (Webhook-Handler) — schon implementiert
// Sendet nach Stripe-Success-Event:
fetch('https://www.google-analytics.com/mp/collect?...', {
  method: 'POST',
  body: JSON.stringify({
    client_id: stripeSession.client_reference_id,
    events: [{
      name: 'purchase',
      params: {
        currency: 'EUR',
        value: amountInEuro,
        transaction_id: stripeSession.id,
        items: [{ item_name: pkg, price: amountInEuro }]
      }
    }]
  })
});
```

### Google Ads Conversion-Action

1. Google Ads → Tools → Conversions → „+ Neue Conversion-Aktion"
2. Source: **Import → Google Analytics 4 → purchase**
3. Wert: **Tatsächlicher Wert pro Conversion**
4. Zählung: **Jede Conversion** (statt nur einer)
5. Klick-Conversion-Window: **30 Tage**

---

## Kampagnen-Struktur (1 Kampagne, 5 Ad-Groups)

```
Campaign: BFSG-Check DE Intent-High
├── Ad Group 1: BFSG-Brand
│   └── Keywords: bfsg check, bfsg-check, bfsg-fix
├── Ad Group 2: BFSG-Pflicht-High-Intent
│   └── Keywords: bfsg software, bfsg konform machen, bfsg website prüfen
├── Ad Group 3: WCAG/Barrierefreiheit
│   └── Keywords: wcag audit tool, barrierefreiheit website prüfen
├── Ad Group 4: Platform-spezifisch (Shopify/Shopware/WP)
│   └── Keywords: bfsg pflicht shopify, bfsg pflicht wordpress
└── Ad Group 5: Cookie-Compliance (Cross-Sell)
    └── Keywords: cookie banner rechtssicher 2026, tdddg cookie banner
```

---

## Bing Ads Import (10 Min nach Google Live)

1. Bing Ads UI → „Import campaigns" → „Google Ads"
2. Auswählen: alle 5 Ad Groups
3. **Budget anpassen: 4 €/Tag**
4. **Bidding behalten:** Manuelle CPC, max 3 € (Bing-Klicks sind 20-35% günstiger)
5. Aktivieren

---

## Wöchentliches Review (15 Min jeden Montag)

| Check | Wo | Aktion bei |
|---|---|---|
| CPA pro Kampagne | Google Ads Dashboard | > 200 € → Keyword pausieren |
| CTR pro RSA | Google Ads → Anzeigen | < 3% → Headlines neu schreiben |
| Quality Score | Google Ads → Keywords | < 5 → Landing-Page-Match prüfen |
| Conversion-Rate | GA4 → Akquisition | < 1% → Landing-Hero-CTA testen |
| Negativ-Keywords | Search Terms Report | Neue irrelevante hinzufügen |

---

## Red Flags (Stop-Loss)

| Trigger | Action |
|---|---|
| 14 Tage 0 Conversions trotz 100+ Klicks | Headlines komplett neu schreiben |
| CPA > 300 € über 7 Tage | Pause, Match-Type-Review |
| Budget täglich erschöpft, 0 Conversions | Negativ-Liste erweitern |
| Quality Score 1-4 für 80% der Keywords | Landing-Page-Content schärfen |
