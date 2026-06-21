# Marketing-Strategie 2026 — BFSG-Check

> **Stand:** 16.06.2026 · **Geltungsbereich:** DACH · **Verantwortlich:** Owner (Solo)
> Aufbauend auf dem Produkt-Pivot aus `docs/REVIEW-PRE-MORTEM.md` (Section C):
> Gratis-Scan = **Lead-Magnet**, verkauft wird der **kuratierte Fix-Plan** + Barrierefreiheitserklärung-Vorlage.

---

## 1. Executive Summary (5 Bullets)

- **Pivot vom Produkt zum Service-Layer:** Der Auto-Scan ist Gratis-Commodity (axe, WAVE, Lighthouse, BFSGuard liefern denselben Befund). Verkauft wird der **Fix-Plan** (technisches Briefing pro Befund, priorisiert, mit Code-Snippets) und die **Barrierefreiheitserklärungs-Vorlage** — beides liefern Gratis-Tools nicht.
- **Search-First, kein Cold-Outreach:** Google-Ads (Such-Intent „bfsg website prüfen", „barrierefreiheit shop") + SEO (Long-Tail-Ratgeber) sind die einzigen DSGVO/UWG-sauberen Kanäle für ein Solo-Setup. Cold-Mail ist nach § 7 UWG **gesperrt** (Abmahnrisiko 1.000–5.000 € pro Mail). Influencer/Affiliates nur als warmer Partner-Kanal (Web-Agenturen, IT-Kanzleien).
- **Preise validiert, aber nicht final:** Basis 199 €, Profi 499 €, Cookie-Basis 49 €, Cookie-Profi 79 €, Re-Check-Abo 39 €/Mo. Fünf strukturierte A/B-Tests (siehe `pricing-experiments.md`) klären in den ersten 90 Tagen, ob Preise nach oben oder unten gehören.
- **Stufenweises Budget:** Start mit 300 €/Mo (Bootstrap) → 1 k€ (Validierung nach erster 3 % Conversion) → 3 k€ (Skalierung) → 10 k€ (max. profitabler CPA). Jede Stufe braucht **Trigger-KPIs**, sonst kein Hochschalten.
- **Monetarisierungs-Realität:** Ziel-AOV 350 € (Mischung Basis/Profi/Cookie), Ziel-Scan→Purchase 3 %, Ziel-MRR-Wachstum +10 %/Monat ab Monat 4. Bei CAC > 150 € pro Verkauf wird neu bewertet.

---

## 2. Channel-Mix

### Priorität 1 — Google Ads (Such-Intent)
**Warum #1:** Aktiver Suchintent („wie BFSG prüfen") = höchste Kaufbereitschaft, DSGVO-/UWG-sauber, sofort skalierbar, klare ROAS-Messung.

- **Kampagnen-Typ:** Suchkampagnen mit RSAs (Responsive Search Ads), kein Display, kein Performance Max in der Lernphase (intransparent).
- **Ad-Groups:** Brand · Intent-High (Pflicht/Abmahnung-Vermeidung) · Intent-Mid (technisches WCAG-Wissen) · Cookie-Compliance (zweites Produkt) · Re-Check (Retargeting + Abo).
- **Match-Types:** PHRASE als Standard, EXACT für Gewinner-Keywords, BROAD nur mit aggressivem Negativ-Set und Smart-Bidding-Vergleich.
- **Conversion-Tracking:** Micro = „Gratis-Scan gestartet"; Macro = „Report-Kauf" (via Stripe-Webhook → Tag-Manager-Event). Server-Side-GA4 empfohlen, weil Browser-Tracking durch CMP-Opt-out ausgedünnt wird.
- **Budget-Anteil:** 60 % des Marketing-Budgets in Bootstrap-/Validierungs-Phase, 50 % ab Skalierungs-Stufe (Rest fliesst in SEO-Content + Partner-Programm).

### Priorität 2 — SEO (Content + Programmatic)
**Warum #2:** Long-Tail-Suchbegriffe (z. B. „barrierefreiheitserklärung muster shop") kosten ab Monat 3 nichts pro Klick und stützen Ads (höhere QS-Scores durch konsistenten Landing-Content).

- **Cluster 1 — Ratgeber/Pillar:** 10 Artikel im Quartal, jeweils 1.500–2.500 Wörter, mit Schema-Markup (`Article`, `FAQ`, `HowTo`). Outline-Plan siehe `seo-content-plan.md`.
- **Cluster 2 — Tool/Programmatic:** `bfsg-fix.de/check/<domain>` — automatisch generierte Mini-Berichts-Snapshots der Top-1000 deutschen Shops. Jeder Snapshot ist eine indexierbare Seite mit CTA „kompletter Report 199 €". Achtung: nur eigene Scans bekannter Shops, kein Massen-Spam, robots.txt-konform.
- **Cluster 3 — Tools-Glossar:** Pages zu „axe vs Lighthouse", „BFSG-Checkliste PDF", „WCAG 2.1 vs 2.2" — fangen vergleichende Recherche ab.
- **Backlinks:** Gastartikel auf Marketing-/Webdesign-Blogs (`drweb.de`, `t3n.de`, `kulturbanause.de`), HARO-DACH-Anfragen, IHK-Newsletter-Beiträge.

### Priorität 3 — LinkedIn Owner-Content (Authority-Building)
**Warum #3:** Solo-Owner-Profil baut Vertrauen für B2B-Käufer (Geschäftsführer, IT-Leiter) auf, ohne dass Werbung läuft. Reiner Organic-Push, kein bezahltes Ad-Set (LinkedIn-Ads-CPC ist im DACH-B2B-Umfeld 8–15 € — nicht profitabel bei 199 € AOV).

- **Posting-Rhythmus:** 2 Posts/Woche, 1× Eigenstory („Was wir bei 50 Audits gelernt haben"), 1× Edu („5 BFSG-Stolperfallen in WooCommerce").
- **Format-Mix:** 60 % Text-Posts, 30 % Karussell-PDFs, 10 % Video-Walkthroughs (Loom-Aufnahmen aus dem Scanner).
- **Lead-Capture:** Pinned-Post mit Link auf Gratis-Check; in jedem Post am Ende dezenter CTA (kein hard sell).
- **DMs nur warm:** Antworten auf Kommentare/Connections; **keine Mass-Outreach-DMs** (auch das fällt unter Werbung ohne Einwilligung, wenn unaufgefordert).

### Priorität 4 — Partner / Affiliate (Web-Agenturen + IT-Kanzleien)
**Warum #4:** Skalierbar via warmem Empfehlungsweg, kein UWG-Konflikt (Geschäftspartner-Anfrage ≠ Werbung an Endkunden), höhere AOV (Agentur-Kunden zahlen oft +20 % Aufschlag).

- **Modelle:** Affiliate 20 % wiederkehrend / 15 % Einmal · White-Label (Bundle 1.490 € für 10 Reports) · reine Empfehlung mit Co-Marketing.
- **Targets:** Siehe `partner-targets.md` — 60 Targets (30 DACH-Web-Agenturen + 30 IT-Anwaltskanzleien).
- **Ansprache:** LinkedIn-DM + Kontaktformular auf Agentur-Website, personalisiert mit konkretem Audit-Beispiel ihrer eigenen Kunden-Page (siehe `partner-outreach.md`).
- **Tracking:** Pro Partner UTM-Link `?ref=<partner-slug>`, Stripe-Coupon `PARTNER10` als Bonus für Endkunde.

### Explizit ausgeschlossene Kanäle
- **Cold-E-Mail an Endkunden:** UWG § 7 — gesperrt im Tool (siehe `outreach.js`-Sperre nach Review).
- **Bezahlte Influencer:** Im B2B-Compliance-Markt nicht relevant, hohe Streuverluste, schlechte Conversion.
- **Meta-Ads (Facebook/Instagram):** Falsche Demografie für GmbH-Geschäftsführer und Shop-Owner, hoher CPM ohne Intent.
- **TikTok/YouTube-Shorts:** Kein Such-Intent für ein 199 €-B2B-Produkt; ROI bei Solo-Setup nicht darstellbar.

---

## 3. Funnel (End-to-End)

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOFU — Awareness                                                   │
│  Google Ads (Intent-High/Mid) · SEO-Ratgeber · LinkedIn-Posts ·     │
│  Partner-Empfehlung                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼  Klick → bfsg-fix.de Landingpage
┌─────────────────────────────────────────────────────────────────────┐
│  MOFU — Engagement                                                  │
│  Gratis-Scan (URL-Eingabe) → 60-Sek-Ergebnis (Score + Anz. Mängel)  │
│  Conversion-Event: "scan_started"                                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼  Vorschau-Report mit Teaser-Befunden
┌─────────────────────────────────────────────────────────────────────┐
│  Lead-Capture                                                       │
│  Voller Befund + Fix-Plan-Vorschau gegen E-Mail (Double-Opt-in)     │
│  Conversion-Event: "lead_captured"                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼  E-Mail-Nurture-Sequenz (5 Mails / 14 T)
┌─────────────────────────────────────────────────────────────────────┐
│  BOFU — Purchase                                                    │
│  Stripe-Checkout (zahlungspflichtig bestellen, B2C/B2B-Abfrage,     │
│  Widerruf-Consent) → Report-Auslieferung per Mail                   │
│  Conversion-Event: "purchase" (Stripe-Webhook)                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼  Up-Sell nach 14 Tagen
┌─────────────────────────────────────────────────────────────────────┐
│  Retention / MRR                                                    │
│  Re-Check-Abo 49 €/Mo · Cookie-Banner-Audit als Cross-Sell ·        │
│  Empfehlungs-Bonus (10 % Credit für nächste Bestellung)             │
└─────────────────────────────────────────────────────────────────────┘
```

**Nurture-Sequenz Inhalte (5 Mails / 14 Tage):**
1. **Tag 0:** Voller Befund-Bericht (PDF-Vorschau) + Erklärung „Was findet ein Auto-Scan, was nicht".
2. **Tag 2:** Use-Case-Story „So hat Shop X 17 Mängel in 5 Tagen behoben".
3. **Tag 5:** FAQ + Preis-Vergleich (Anwalt 1.500 € vs. Fix-Plan 199 €).
4. **Tag 8:** Limitierter Bonus (z. B. „bis Sonntag: Cookie-Audit gratis bei Basis-Buchung").
5. **Tag 14:** Letzter Anstoß + „Wenn nicht jetzt, dann gar nicht"-CTA.

---

## 4. Conversion-Ziele

| Stage | Metrik | Ziel | Kritisch (Trigger-Wert) |
|---|---|--:|--:|
| Ad → Landing | CTR (Search-Ads) | ≥ 6 % | < 3 % = neue Headlines |
| Landing → Scan | Start-Rate | ≥ 40 % | < 20 % = Hero-CTA testen |
| Scan → Lead | E-Mail-Capture | ≥ 25 % | < 10 % = Lead-Magnet schwach |
| Lead → Purchase | Sales-Conversion | ≥ 12 % | < 5 % = Preise / Trust-Signale prüfen |
| **Scan → Purchase (Composite)** | **Hauptziel** | **3 %** | < 1 % = Pivot-Frage |
| AOV | Mix Basis/Profi/Cookie | 350 € | < 220 € = Profi-Push nötig |
| MRR-Wachstum | Re-Check-Abo | +10 %/Mo | < +3 % = Onboarding broken |
| Refund-Rate | nach 30 Tagen | < 4 % | > 8 % = Liefer-/Versprechen-Mismatch |

---

## 5. Budget-Stufen (Bootstrap → Skalierung)

### Stufe A — Bootstrap (Monat 0–2): **300 €/Mo Ads-Spend**
**Ziel:** Beweisen, dass überhaupt jemand für den Fix-Plan zahlt.
- Aufteilung: 250 € Google Ads (Intent-High Keywords only) + 50 € Tooling (Posthog Free, Brevo Free, GSC, Looker Studio).
- KPI-Tor: ≥ 5 Verkäufe in 60 Tagen oder Pivot/Pause.
- Manuelle Gebote (keine Smart-Bidding-Strategie ohne Datengrundlage).

### Stufe B — Validierung (Monat 3–4): **1.000 €/Mo Ads-Spend**
**Ziel:** Conversion-Rate ≥ 2 %, CAC < 120 €.
- Aufteilung: 700 € Google Ads (alle 5 Ad-Groups) + 200 € SEO (Content-Briefings extern) + 100 € Tools (Ahrefs Lite oder Sistrix).
- Smart-Bidding (Maximize Conversions) aktivieren, sobald 30+ Conversions im Konto.
- KPI-Tor: ROAS ≥ 2,5× oder Channel-Mix prüfen.

### Stufe C — Skalierung (Monat 5–8): **3.000 €/Mo Ads-Spend**
**Ziel:** Profitabel skalieren, MRR-Basis aufbauen.
- Aufteilung: 1.800 € Google Ads + 600 € LinkedIn Sponsored Updates (Test) + 400 € SEO + 200 € Partner-Anreize (Provisionen, Test-Reports).
- A/B-Tests aus `pricing-experiments.md` laufen parallel (max. 2 gleichzeitig, sonst keine Aussagekraft).
- KPI-Tor: MRR > 1.000 € oder LinkedIn-Ads stoppen.

### Stufe D — Profitable Skalierung (Monat 9+): **10.000 €/Mo Ads-Spend**
**Ziel:** Markt-Anteil im DACH-A11y-Audit-Segment.
- Aufteilung: 6.000 € Google Ads + 2.000 € SEO (Pillar-Pages, Programmatic) + 1.000 € Partner-Programm + 1.000 € Owned-Tools (Newsletter-Sponsorships, Webinare).
- Voraussetzungen: Stabile 3 % Scan→Purchase, < 4 % Refund, MRR > 3.000 €, Lieferung skaliert (ggf. zweite Person Teilzeit).

---

## 6. KPIs pro Channel + Reporting-Rhythmus

| Channel | Primär-KPI | Sekundär-KPI | Frequenz |
|---|---|---|---|
| Google Ads | CPA (Cost-per-Purchase) | CTR · QS · ROAS | wöchentlich |
| SEO | organische Scans/Monat | Top-10-Rankings · DR-Wachstum | monatlich |
| LinkedIn Organic | Profil-Views → Scan-Klicks | Post-Impressions · Saves | 14-tägig |
| Partner | Verkäufe via Ref-Link | Aktive Partner · Provisions-€ | monatlich |
| E-Mail-Nurture | Lead→Purchase-Rate | Open-Rate · Click-Rate | wöchentlich |
| Abo (MRR) | Net-MRR-Δ | Churn % · Expansion-MRR | wöchentlich |

**Reporting-Rhythmus:**
- **Täglich** (automatisiert): Looker-Studio-Dashboard zieht Stripe + Google-Ads + GA4. Trigger-Alarm bei CPA > 200 € oder Tagesumsatz = 0 € an Werktagen.
- **Wöchentlich (Mo, 30 Min):** Snapshot-Review — Top-3-Keywords, Conversion-Funnel, Refund-Liste. Notiz in `marketing/_logs/weekly-YYYY-WW.md` (kurzes Markdown).
- **Monatlich (1. Werktag, 2 Std):** Channel-Review, Budget-Reallokation, A/B-Test-Auswertung, Quartals-Ausblick. Ergebnis-Dokument in `marketing/_logs/monthly-YYYY-MM.md`.
- **Quartalsweise:** Strategie-Check gegen diese Datei — Anpassung der Channel-Priorisierung wenn Annahmen brechen.

---

## 7. Tooling-Stack (Solo-tauglich)

| Funktion | Tool | Kosten/Mo | Warum |
|---|---|--:|---|
| Web-Analytics | GA4 + Posthog Cloud (Free) | 0 € | DSGVO-konform mit CMP, Events Server-Side möglich |
| Ads | Google Ads Editor (Desktop) | 0 € | Bulk-Edit ohne Web-UI-Latenz |
| SEO | GSC + Sistrix Smart (49 €) oder Ahrefs Lite (108 €) | 49–108 € | Rank-Tracking & Wettbewerb |
| E-Mail | Brevo (Free bis 300/Tag → Lite 25 €) | 0–25 € | Double-Opt-in, Transactional + Marketing in einer Plattform |
| Dashboards | Looker Studio | 0 € | Stripe + GA + Ads in einem Bord |
| CRM (Leads) | Notion oder Airtable Free | 0 € | Solo-Tracker, kein Hubspot-Overhead |
| A/B-Tests | Posthog Feature Flags + Stripe Test Mode | 0 € | Edge-Pricing-Tests ohne Backend-Deploy |
| **Summe Bootstrap** | | **~50 €/Mo** | bewusst lean |

---

## 8. Risiken & Mitigations

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| **UWG-Abmahnung** durch zu aggressive Ad-Copy (z. B. verbotene Heils-/Garantieversprechen) | mittel | hoch (5–15 k€ Abmahnung + Tool-Pause) | Ad-Texte aus genehmigten Bausteinen, monatlicher `grep` auf verbotene Phrasen, Anwalts-Freigabe der Top-10 RSA-Headlines |
| **CAC > LTV** (Google-Ads-CPC steigt schneller als AOV) | hoch | mittel (Cashflow-Problem) | Strenges CPA-Limit (Bootstrap 80 €, Validierung 120 €, Skalierung 150 €), 60-Tage-Pause-Regel pro Keyword bei ROAS < 1,5× |
| **Konkurrenz durch etablierte Tools** (axe-DevTools, Eye-Able, Siteimprove) bietet Fix-Plan kostenlos an | mittel | hoch (Pricing-Kollaps) | Differenzierung über deutschen Sprach-Output, BFSG-spezifische Vorlagen, Branchen-Templates (Shopify/WooCommerce), persönlicher Review |
| **Refund-Welle** wegen unklarer Erwartung („ich dachte das ist die fertige Lösung") | mittel | mittel | Klare Erwartungs-Sprache auf Checkout & im Report-Cover, 14-Tage-Widerruf aktiv kommunizieren, NPS-Mail nach 7 Tagen |
| **Google-Ads-Account-Suspension** (Healthcare/Legal-ähnliche Compliance-Themen werden manchmal geblockt) | niedrig | hoch (Hauptkanal weg) | Zweites Konto vorbereitet, Landing-Page mit klaren Disclaimern, kein „Heilversprechen", Backup-Kanal SEO + Partner aufbauen |
| **DSGVO-/Cookie-CMP-Fehlkonfiguration** (Conversion-Tracking ohne Consent) | mittel | mittel (Datenverlust + Bußgeld-Risiko) | Server-Side-Tracking mit Consent-Mode v2, monatlicher CMP-Audit, externe Prüfung vor Skalierungs-Stufe C |
| **EU AI Act (ab 02.08.2026)** zwingt Kennzeichnung KI-generierter Texte | hoch | niedrig | „KI-erstellt, menschlich geprüft" als Footer-Label, Review-Log dokumentieren |
| **Owner-Burnout** durch zu viele Channels gleichzeitig | hoch | hoch | Strikte Priorisierung: max. 1 neuer Channel pro 8 Wochen, kein Skalieren bevor vorheriger Channel stabil profitabel |

---

## 9. Quartals-Ausblick (Q3/Q4 2026)

- **Q3 2026:** Bootstrap + Validierung abschliessen. Ziel: 30 Verkäufe, MRR 300 €, 2 aktive Partner.
- **Q4 2026:** Skalierungs-Stufe C. Ziel: 100 Verkäufe/Monat, MRR 1.500 €, 8 Partner, 3 SEO-Artikel in Top-10.
- **Q1 2027:** Skalierungs-Stufe D oder Stop-Loss-Entscheidung anhand 90-Tage-MRR-Trend.

---

## 10. Anhänge / verwandte Dokumente

- `marketing/google-ads-keywords.csv` — 50+ Keywords mit Match-Type & Bid-Schätzung
- `marketing/google-ads-negatives.csv` — Negativ-Liste
- `marketing/seo-content-plan.md` — 10 Artikel-Outlines
- `marketing/partner-targets.md` — 60 Partner-Targets
- `marketing/pricing-experiments.md` — 5 A/B-Tests
- `marketing/google-ads.md` — Kampagnen-Bauplan (vorherige Iteration, bleibt als Referenz)
- `marketing/OFFER.md` — Preisstruktur & Value-Ladder
- `docs/REVIEW-PRE-MORTEM.md` — Begründung Pivot (Section C)
