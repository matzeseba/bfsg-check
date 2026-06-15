# Skalierungs-Roadmap — Low-Effort-Erweiterungen

**Stand:** 15.06.2026 · Quelle: 4-Agenten-Analyse (Adjacent-Scans, Upsell/MRR, Distribution, Engine-as-Product), bewertet auf **Wiederverwendung der vorhandenen Engine** + **Pre-Mortem-Lehren** (kein Cold-Mail, keine Konformitäts-/Abmahnsicher-Garantie, kein Overlay-Widget).

## Priorisierte Hebel (wenig Aufwand → viel Wirkung)

| # | Hebel | Aufwand | Wirkung | Risiko | Warum |
|---|---|---|---|---|---|
| 1 | **Monitoring-/Re-Audit-Abo reaktivieren** (49 €/Mon, Diff-Report) | sehr gering | **MRR** | gering | Konzept existiert schon (`ENABLE_ABO`); einziger echter Recurring-Schalter — macht aus Einmal-Verkauf planbaren Umsatz |
| 2 | **Cookie/Tracker-vor-Consent-Scan** (§25 TDDDG) als 2. Produkt | ~5 Tage (75 % Reuse) | hoch | mittel | Playwright misst Laufzeit-Verhalten (Tracker feuert vor Consent?) — das können Gratis-HTML-Scanner NICHT → echter Moat; faktisch formulierbar = haftungsärmer als BFSG |
| 3 | **Multi-Page-/Whole-Site-Crawl** als Premium-Stufe (399–499 €) | gering–mittel | höherer Bestellwert | gering | reiner Preis-Tier auf bestehender Engine; NICHT als „vollständig geprüft" bewerben |
| 4 | **„Done-with-you"-Umsetzungs-Pack** (Order-Bump 49–99 €) | gering (einmalig) | höherer ARPU | gering | Code-/Video-Vorlagen pro Top-Mangel; einmal gebaut, unendlich verkaufbar |
| 5 | **Embeddable Widget** („Check deine Seite") | 4–6 Tage (80 % Reuse) | Lead-Quelle | gering | füttert den Report-Verkauf; faceless; KEIN Overlay (meidet accessiBe-/FTC-Klagerisiko) |
| 6 | **White-Label-/Agentur-Reseller (B2B2C)** + **Steuerberater/Anwalt-Empfehlungsprogramm** | mittel | hoch (Multiplikator) | gering | Agentur/Kanzlei hat die Kunden schon → warme Beziehung, kein UWG-Cold-Mail; 1 Partner = viele Endkunden |

## Bündelung
- **„Website-Pflichten-Quickcheck"**: BFSG + Cookie + Impressum-/Datenschutz-*Vorhandensein* (rein „vorhanden/nicht gefunden", kein Werturteil → RDG-sauber) als ein PDF. Maximaler Reuse, ein Funnel.
- **SEO/Lighthouse-Audit** (haftungsfrei, Lighthouse läuft auf demselben Chromium) als günstiger Tripwire/Bundle-Partner.

## Bewusst NICHT (oder erst später)
- ❌ **„Barrierefrei-geprüft"-Badge/Siegel** — Irreführungs-/Abmahnrisiko (§ 3/5 UWG), Auto-Scan deckt nur 25–40 %. Falls überhaupt: nur neutrales „Letzter Scan: TT.MM.JJJJ".
- ❌ **Programmatische SEO im großen Stil** — Google März/Mai-2026-Updates gegen „Scaled Content" (−60–90 %). Nur 20–40 echte, datenreiche Seiten ok.
- ❌ **Public API / WordPress-Plugin** — Commodity (axe ist Open Source) bzw. Support-Falle (Widerspruch zu zero-contact).
- ❌ **Voll-SaaS/White-Label als „nebenbei"** — höchstes MRR, aber hohe Support-Last → bricht faceless/zero-contact. Erst als bewusster Pivot, nachdem der Report-Verkauf 1 Monat stabil läuft.
- ❌ **Cold-Mail** in jeder Form (UWG-Blocker).

## Empfohlene Reihenfolge
1. **Jetzt:** Monitoring-Abo reaktivieren (#1) — Recurring einschalten.
2. **Welle 2:** Cookie/Consent-Scan (#2) + Multi-Page-Premium (#3) + Order-Bump (#4) — gleiche Engine, mehr Umsatz pro Kunde + 2. Pflichtmarkt.
3. **Welle 3:** Embeddable Widget (#5) + Agentur-/Kanzlei-Partner (#6) — Reichweite/Multiplikator.

Alles erst **nach** dem rechtssicheren Live-Gang des Kernprodukts (siehe `REVIEW-PRE-MORTEM.md`).
