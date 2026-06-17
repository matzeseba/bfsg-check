# Pricing-Entscheidung (umgesetzt 17.06.2026)

Basierend auf `docs/PRICING-STRATEGY.md` (Wettbewerbsanalyse) + Pre-Mortem-Leitlinie
„Unit Economics zuerst beweisen, dann skalieren". Eigentümer hat die Entscheidung delegiert.

## Umgesetzt ✅

| Produkt | Vorher | Jetzt | Begründung |
|---|--:|--:|---|
| Re-Check-Abo | 49 €/Mo | **39 €/Mo** | BFSGuard liegt bei 19,99 €/Mo; 39 € senkt die Einstiegshürde, hält aber Premium-Abstand. Jahres-Anzeige (390 €) liefert der bestehende Pricing-Toggle automatisch. Abo bleibt vorerst „Bald verfügbar" (Backend `ENABLE_ABO=false`). |
| Basis-Report | 199 € | **199 €** (gehalten) | Sitzt perfekt in der Lücke Gratis-Tools (0 €) ↔ Agentur-Audits (1.500 €+). |
| Profi-Report | 499 € | **499 €** (gehalten) | Sauberer Anchor. 497-Charm-Pricing brachte zu wenig für die Unruhe. |
| Cookie 49/79 € | — | unverändert | Solider Tripwire. |

**Geänderte Dateien:** `scanner/app.js` (PACKAGES.abo 4900→3900), `landingpage-next/lib/config.ts` (abo 49→39 €, 3900).

## Bewusst aufgeschoben (Trigger-ready, NACH erstem Verkauf) 📋

### Bundle „BFSG-Report Basis + Cookie-Check" — 229 €
- **Warum spec statt sofort:** Ein Bundle ist kein reiner Preis — `fulfill.js` liefert pro Order EINEN Report. Das Bundle braucht **kombinierte Fulfillment-Logik** (BFSG-Scan + Cookie-Scan + 2 PDFs + kombinierte Mail).
- **Implementierungs-Spec:**
  1. `scanner/app.js PACKAGES`: `'bundle-basis-cookie': { name: 'BFSG-Report Basis + Cookie-Check', amount: 22900, mode: 'payment' }`
  2. `handleCheckoutCompleted`: bei `pkg==='bundle-basis-cookie'` → `fulfillOrder(basis)` + `fulfillOrder(cookie-basis)` sequentiell (Concurrency-Gate beachten), beide PDFs sammeln.
  3. `mailer.js`: neue Variante `sendBundleReport` ODER `sendReport` um zweites Report-PDF erweitern (BFSG-Report + Cookie-Report + Erklärung + Rechnung).
  4. `landingpage-next/lib/config.ts`: Bundle-Card (Ersparnis ggü. 248 € Einzelpreis ausweisen).
  5. Test: `fulfill`-Roundtrip Bundle liefert 2 PDFs.
- **Value:** AOV-Hebel (+15 % ggü. Einzelkauf), reiner payment-mode (kein Stripe-Dashboard-Setup nötig — inline price_data).

### Agentur / White-Label — 990 € (5 Sites) / 1.790 € (10 Sites)
- **Warum spec statt sofort:** Braucht **Geschäftsprozess**, nicht nur Preis: Multi-Site-Auftragsabwicklung, White-Label-PDF (Agentur-Logo statt BFSG-Check), Wiederverkäufer-Vertrag/Rechnung, ggf. Sammel-Reporting. Ein 990-€-Tier ohne sauberen Liefer- + Vertragsprozess wirkt unseriös.
- **Implementierungs-Spec:**
  1. `scanner/app.js PACKAGES`: `'agentur-5'` (99000), `'agentur-10'` (179000), payment-mode, eigene `AGENCY_PACKAGES`-Konstante (NICHT ins KMU-Grid mischen).
  2. Eigene `/agentur`-Landingpage (B2B-Pitch, White-Label-Nutzen, Margen-Tabelle, Kontakt/Demo-CTA) — eigener Funnel.
  3. Fulfillment: Multi-Site-Credit-System (Kunde reicht N URLs ein) ODER manueller Operator-Flow v1.
  4. White-Label: `report.js` `reportTitle`/Logo-Parameter (existiert teils) sauber parametrisieren + Logo-Upload.
  5. Vertrag/AGB-Zusatz für Wiederverkauf (Anwalt).
- **Value:** Größte unbesetzte Marktlücke (kontert BFSGuards 199 €/Mo White-Label mit Einmal-Paketen passend zum Solo-Setup). Höchster Deal-Wert.

## Trigger-Kriterium für die aufgeschobenen Punkte
Sobald **≥ 3 zahlende Erstkunden** über den Basis/Profi-Funnel da sind (Funnel validiert),
zuerst **Bundle** (kleiner, schneller ROI), dann **Agentur-Tier** (größerer Build) umsetzen.

## A/B-Test-Empfehlung (aus pricing-experiments.md)
Erst nach Funnel-Validierung: Basis 199 € vs. 249 € (Margen-Hebel, nicht Conversion-Killer).
