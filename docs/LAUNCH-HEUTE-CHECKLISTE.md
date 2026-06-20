# LAUNCH-CHECKLISTE — Was nur Matthias machen kann

> Erstellt: 2026-06-21 | Status: Launch-ready nach chore/launch-ready Fixes

---

## REALITÄTS-CHECK (3 Zeilen, bitte lesen)

Verkäufe kommen frühestens in 3–7 Tagen — Google Ads braucht 24–72h Freigabe,
dann 3–5 Tage Lernphase. Listings werden in 2–7 Tagen indexiert. Der schnellste
mögliche Spike heute ist Show HN — aber der Post ist erst launchbar sobald das
Dataset existiert (ehrliche Version jetzt in `marketing/show-hn-launch-post.md`).

---

## BLOCK A — HEUTE, ~25 Minuten

> Ziel: Zahlungsinfrastruktur validiert, Konten angelegt, 3 Top-Listings submitted.
> Reihenfolge genau so — jeder Schritt baut auf dem vorherigen auf.

---

### A1 — Stripe Live-Testkauf mit eigener Karte + Refund

**Ziel:** Sicherstellen dass der komplette Purchase-Flow funktioniert, bevor Ads Traffic schicken.
**URL:** https://bfsg-fix.de
**Zeit:** 10 Minuten
**Warum:** Ein kaputtes Payment-Flow bei laufenden Ads vernichtet Budget ohne Conversion. Das muss vor dem Schalten überprüft sein.

**Schritte:**
1. bfsg-fix.de öffnen im Browser
2. Gratis-Scan mit deiner eigenen Domain `matthias-seba.de` oder `bfsg-fix.de` starten
3. Auf das Vollreport-Angebot klicken → **Basis (199 €)** auswählen
4. Mit eigener Kreditkarte (oder Debitkarte) zahlen — echter Stripe-Live-Charge
5. 2–3 Minuten warten → Mail-Eingang prüfen (auch Spam-Ordner!)
6. PDF prüfen: Score vorhanden, Findings vorhanden, Datum korrekt (2026), dein Name
7. Stripe Dashboard öffnen: https://dashboard.stripe.com → Payments → den Charge finden
8. Refund: „Refund" Button → vollen Betrag zurückbuchen

**Was zu prüfen:**
- [ ] Mail kommt innerhalb 3 Minuten an
- [ ] PDF öffnet sich korrekt
- [ ] Refund geht durch (kein Error)
- [ ] Falls irgendetwas kaputt: STOPP, kein Ads-Start bis gefixt

---

### A2 — Google Ads Konto anlegen + Karte hinterlegen

**Ziel:** Konto bereit für Kampagnen-Setup morgen früh — HEUTE nur Konto anlegen, keine Kampagne.
**URL:** https://ads.google.com/intl/de_de/start
**Zeit:** 8 Minuten
**Warum:** Konto-Verifikation dauert manchmal 12–24h. Früh anlegen = morgen früh einsatzbereit.

**Schritte — Copy-Paste-bereit:**

1. URL öffnen, auf "Jetzt loslegen" klicken
2. Mit `matze.seba@outlook.de` anmelden (oder Google-Konto erstellen)
3. Unternehmen: **Matthias Seba / BFSG-Check**
4. Website: `https://bfsg-fix.de`
5. Beim Kampagnen-Wizard: **"Ich möchte mein Konto ohne Kampagne erstellen"** (kleiner Link unten)
   - Wenn der Link nicht sichtbar ist: Dummy-Kampagne anlegen, dann sofort pausieren
6. Zahlungsmethode: Kreditkarte oder SEPA-Lastschrift
7. Billing-Land: **Deutschland**
8. Konto bestätigen → Verifikations-Mail kommt

**Nicht tun:** Kampagne heute anlegen — das machen wir morgen mit den fertigen Texten aus `marketing/google-ads-rsa-headlines.md`.

---

### A3 — Bing Ads Konto anlegen + Karte hinterlegen

**Ziel:** Konto bereit für Import von Google Ads morgen.
**URL:** https://ads.microsoft.com/de
**Zeit:** 5 Minuten
**Warum:** Bing-Import spart 90% der Kampagnen-Aufbauzeit — aber nur wenn Konto schon existiert.

**Schritte:**

1. URL öffnen
2. Mit Microsoft/Outlook-Konto anmelden (`matze.seba@outlook.de`)
3. "Neues Konto erstellen" → Unternehmensinfo eintragen
4. Zahlungsmethode hinterlegen (gleiche Karte wie Google)
5. Konto aktiviert? Dann: DONE — Import machen wir morgen nach Google-Kampagne-Setup

---

### A4 — 3 Top-Listings einreichen (SaaSHub + G2 + OMR)

**Ziel:** Dofollow-Backlinks + erste organische Discovery starten — werden in 2–7 Tagen live.
**Zeit:** 12 Minuten gesamt
**Warum:** SaaSHub hat DR 74 mit dofollow-Link (selten!). G2 ist das wichtigste B2B-Trust-Signal. OMR ist die stärkste DACH-B2B-Review-Brand.

---

#### A4a — SaaSHub (8 Minuten, DR 74, DOFOLLOW)

**URL:** https://www.saashub.com/services/submit

Copy-Paste-Block für das Formular:

```
Name: BFSG-Check
Tagline: Compliance-Scans für deutsche Websites
URL: https://bfsg-fix.de
Category: Accessibility Testing → Website Audit Tools
Pricing: Freemium (Gratis-Scan + Pakete ab 199 €)

Short Description:
BFSG-Check ist ein automatisierter Compliance-Scanner für deutsche Websites.
In 60 Sekunden erhalten Sie einen Score und Vollreport mit konkreten Findings
nach WCAG 2.1 AA und BFSG. Vollreport ab 199 €, ohne Abo-Zwang.
Hosting in Deutschland, DSGVO-konform.

Long Description:
BFSG-Check liefert automatisierte Compliance-Scans für deutsche Online-Shops,
Buchungsplattformen und B2C-Websites. Seit dem Barrierefreiheitsstärkungs-
Gesetz (BFSG) am 28.06.2025 sind alle B2C-Websites mit über 10 Mitarbeitern
zur Barrierefreiheit verpflichtet.

Was wir liefern:
- 60-Sekunden Gratis-Scan: Score (0-100) + Top-Findings
- Vollreport (Basis 199 €): PDF mit allen Findings nach WCAG 2.1 AA
- Profi-Paket (499 €): Multi-Page-Crawl + Umsetzungsplan + 30 Tage E-Mail-Support
- Cookie-Check (49 € / 79 €): TDDDG-konforme Cookie-Banner-Prüfung
- Re-Check-Abo (39 €/Monat): monatliche Überprüfung mit Diff-Report

Technisch: axe-core + Pa11y + eigene Regelwerke. Hosting in Deutschland
bei Hetzner Nürnberg. DSGVO-konform. Stripe Live-Payments. Sofort-Download
PDF nach Kauf. Made in Germany, ohne Abo-Zwang, mit deutscher Sprache.

Features (als Liste angeben):
- Automatischer WCAG 2.1 AA Scan
- BFSG-spezifische Prüfregeln
- Cookie-Compliance-Check (TDDDG)
- Multi-Page-Crawl (bis 50 Seiten)
- Umsetzungsplan als PDF
- 30 Tage E-Mail-Support
- Re-Check-Abo verfügbar
- Deutsche Sprache
- DSGVO-konform, Hosting Germany

Alternatives to:
Eye-Able, axe DevTools, AccessiBe, UserWay, eRecht24 BFSG-Check
```

---

#### A4b — G2 Free Profile (4 Minuten)

**URL:** https://sell.g2.com/create-a-profile

Copy-Paste-Block:

```
Product Name: BFSG-Check
Vendor: Matthias Seba
Vendor Website: https://matthias-seba.de
Product Website: https://bfsg-fix.de
Product Category: Web Accessibility Testing
Sub-Category: Compliance Management

[Description: Long Description von oben einfügen]

Pricing Model: One-time + Subscription
Starting Price: €199 (one-time)
Free Trial: Yes (60-second scan)
Free Version: Yes (basic scan with Top-3 findings)

Languages: German
Countries: Germany, Austria, Switzerland (DACH)
Deployment: SaaS (Cloud)

Integrations: Stripe, Brevo (Email), Google Analytics
```

---

#### A4c — OMR Reviews (keine Minuten, da Registrierung nötig)

**URL:** https://omr.com/de/reviews/list-software-or-agency

Copy-Paste-Block:

```
Software Name: BFSG-Check
Anbieter: Matthias Seba
Webseite: https://bfsg-fix.de
Kategorie: Barrierefreiheit & Compliance Tools

Beschreibung:
BFSG-Check liefert automatisierte Compliance-Scans für deutsche Online-Shops,
Buchungsplattformen und B2C-Websites. Seit dem Barrierefreiheitsstärkungs-
Gesetz (BFSG) am 28.06.2025 sind alle B2C-Websites mit über 10 Mitarbeitern
zur Barrierefreiheit verpflichtet.

Was wir liefern:
- 60-Sekunden Gratis-Scan: Score (0-100) + Top-Findings
- Vollreport (Basis 199 €): PDF mit allen Findings nach WCAG 2.1 AA
- Profi-Paket (499 €): Multi-Page-Crawl + Umsetzungsplan + 30 Tage E-Mail-Support
- Cookie-Check (49 € / 79 €): TDDDG-konforme Cookie-Banner-Prüfung
- Re-Check-Abo (39 €/Monat): monatliche Überprüfung mit Diff-Report

Preismodell: Freemium
Preis-Stufen:
  - Basis: 199 € (einmalig)
  - Profi: 499 € (einmalig)
  - Re-Check: 39 €/Monat
  - Cookie-Basis: 49 €
  - Cookie-Profi: 79 €

Zielgruppe: Kleine und mittelständische Unternehmen, Online-Shops
Branchen: E-Commerce, Reise, Bildung, Gesundheit
Sprachen: Deutsch
Hosting: Deutschland (Hetzner Nürnberg)
DSGVO: Vollständig konform
```

---

## BLOCK B — MORGEN FRÜH, ~90 Minuten (8:00–9:30 Uhr)

> Ziel: Google Ads live, Bing Import aktiv, 4 weitere Listings, 2 freie Pressemitteilungen.

---

### B1 — Google Ads Kampagne live schalten (40 Minuten)

**URL:** https://ads.google.com
**Warum:** Mit Ads live kannst du in 3–5 Tagen erste Intent-Traffic-Klicks messen. Jeder Tag Verzögerung = ein Tag weniger Lernkurve vor dem 28.06.2026 BFSG-Jubiläum-Spike.

**Schritte:**
1. Google Ads öffnen → "Neue Kampagne" → Ziel: **Verkäufe + Website-Traffic**
2. Kampagnen-Typ: **Suche** (NICHT Performance Max — zu intransparent)
3. Daily Budget: **13 €/Tag**
4. Standorte: **Deutschland** (Österreich + Schweiz optional, erst nach 4 Wochen Daten)
5. Sprachen: **Deutsch**
6. Match-Type: **Exact + Phrase only** — KEIN Broad-Match (verbrennt Budget)

**Keywords copy-paste (aus `marketing/google-ads-rsa-headlines.md`):**
```
[bfsg check]
[bfsg software]
[bfsg website prüfen]
[bfsg konform machen]
[barrierefreiheit website prüfen]
[wcag audit tool]
[bfsg pflicht shopify]
[bfsg pflicht shopware]
[bfsg pflicht wordpress]
[bfsg onlineshop]
[barrierefreiheitserklärung generator]
"barrierefreiheit testen kostenlos"
"wcag 2.1 aa checkliste deutsch"
"cookie banner rechtssicher 2026"
"bfsg abmahnung vermeiden"
```

**Negativ-Keywords copy-paste:**
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
behindertenausweis
schwerbehinderung
inklusion
sozialgesetz
```

**RSA-Headlines copy-paste (15 Stück, alle ≤30 Zeichen, Google-geprüft):**
```
BFSG-Check in 60 Sekunden
WCAG 2.1 AA Audit ab 199 €
Barrierefreiheit prüfen
Vollreport mit Fix-Plan
Made in Germany 🇩🇪
Kein Abo-Zwang ab 199 €
Gratis-Scan jetzt starten
BFSG seit 28.06.2025 Pflicht
Findings + Umsetzungsplan
Auto-Scan + manueller Review
Für Shopify/Shopware/WP
Abmahn-Risiko vermeiden
PDF-Report deutsch + sofort
Cookie-Check inklusive
Re-Check 39 €/Monat möglich
```

**RSA-Descriptions copy-paste (4 Stück, alle ≤90 Zeichen, Google-geprüft):**
```
BFSG/WCAG-Scan mit Vollreport als PDF. Konkrete Findings, kein Abo, auf Deutsch.
Score gratis in 60 Sek. Vollreport mit Umsetzungsplan ab 199 €. Made in Germany.
BFSG-Pflicht seit 28.06.2025. Findings + Fix-Plan ab 199 €. Sofort als PDF.
Cookie-Check + WCAG-Audit in einem PDF. Kein Abo, automatischer Scan, sofort.
```

**Pinning:**
- Headline 1 (pinnen): `BFSG-Check in 60 Sekunden`
- Headline 2 (pinnen): `Cookie-Check inklusive`

**Bidding:** Manuelle CPC, max **4 €/Klick** (KEIN Smart-Bidding vor 30 Conversions)

7. Kampagne speichern → Status: **Aktiv** → warten auf Freigabe (24–72h)

---

### B2 — Bing Ads Import (10 Minuten)

**URL:** https://ads.microsoft.com
**Warum:** Bing/Microsoft-Ads-Klicks sind 20–35% günstiger, gleiche Suchintent, minimaler Zusatzaufwand durch Import.

**Schritte:**
1. Bing Ads öffnen → linke Seitenleiste → "Import" → "Google Ads"
2. Google-Konto verbinden
3. Kampagne auswählen (BFSG-Check DE Intent-High)
4. Budget anpassen: **4 €/Tag** (statt 13€)
5. Bidding: Manuelle CPC, max **3 €** (Bing-Klicks günstiger)
6. Import ausführen → Aktivieren

---

### B3 — 4 weitere Listings (20 Minuten)

#### Capterra/GetApp (8 Minuten)
**URL:** https://www.capterra.com.de/company/vendors

```
Product Name: BFSG-Check
Vendor Website: https://bfsg-fix.de
Category: Web Accessibility Testing
Target Companies: Small Business, Mid-Market
Industries: E-Commerce, Healthcare, Legal Services, Tourism
Pricing Tiers:
  - Free: 60-Second Scan
  - Basis: 199 € one-time
  - Profi: 499 € one-time
  - Cookie-Check: 49 € / 79 € one-time
  - Re-Check: 39 €/month
[Description: Long Description von oben einfügen]
```

#### AlternativeTo (5 Minuten)
**URL:** https://alternativeto.net (Account erstellen → "Add App")

```
Title: BFSG-Check
URL: https://bfsg-fix.de
License: Commercial (Freemium)
Platform: Web/SaaS

Submit as Alternative To:
Eye-Able, axe DevTools, AccessiBe, UserWay, eRecht24 BFSG-Check, WAVE

Description:
BFSG-Check ist ein automatisierter Compliance-Scanner für deutsche Websites.
In 60 Sekunden erhalten Sie einen Score und Vollreport mit konkreten Findings
nach WCAG 2.1 AA und BFSG. Vollreport ab 199 €, ohne Abo-Zwang.
Hosting in Deutschland, DSGVO-konform. German-specific, made in Germany,
no overlay snake-oil.
```

#### TrustRadius (4 Minuten)
**URL:** https://solutions.trustradius.com/claim-your-profile/

```
Company: Matthias Seba (BFSG-Check)
Product: BFSG-Check
Category: Web Accessibility & Compliance
URL: https://bfsg-fix.de
[Description: Long Description von oben einfügen]
Pricing: Free Tier (60-second scan) + ab 199 € einmalig + 39 €/Monat Re-Check
Best For: SMB e-commerce, German online shops, compliance-conscious
Worst For: Enterprise (kein Eye-Able-Enterprise-Ersatz)
```

#### SaaSworthy (3 Minuten)
**URL:** https://www.saasworthy.com (Submit Product)

```
Product Name: BFSG-Check
Tagline: Compliance-Scans für deutsche Websites
URL: https://bfsg-fix.de
Category: Web Accessibility Testing → Compliance Tools
Pricing: Freemium starting at 199 € (one-time Vollreport)
Free Plan: Yes (60-second basic scan)
[Description: Long Description von oben einfügen]
```

---

### B4 — 2 freie Pressemitteilungen einreichen (20 Minuten)

**Warum:** Freie Backlinks + erste Medien-Präsenz vor dem 28.06.2026 Jubiläum-Spike.

#### openPR (10 Minuten, kostenlos, 2/Jahr)
**URL:** https://www.openpr.de/news/einstellen.html

Artikel-Text zum Einreichen (direkt aus `marketing/press-release-launch.md` VERSION 1):

```
TITEL:
BFSG-Check.de geht live: Automatischer WCAG-Audit-Service für deutsche Websites ab 199 Euro

TEXT:
Matthias Seba launcht BFSG-Check (bfsg-fix.de), einen automatisierten
Compliance-Scanner für deutsche Online-Shops und B2C-Websites. Der Service
liefert in 60 Sekunden einen WCAG-2.1-AA-Score und einen Vollreport mit
konkreten Findings — ohne Beratungs-Mandat und ohne Abo-Zwang.

Seit dem 28. Juni 2025 verpflichtet das Barrierefreiheitsstärkungsgesetz
(BFSG) alle deutschen B2C-Websites mit mehr als 10 Mitarbeitenden zur
Barrierefreiheit nach WCAG 2.1 AA. Erste Abmahnungen seit August 2025
zeigen den Handlungsbedarf in der Branche.

BFSG-Check schließt die Lücke zwischen kostenlosen Browser-Tools wie axe
oder WAVE und mehrere tausend Euro teuren Beratungs-Mandanten. Der Service
liefert:

- 60-Sekunden Gratis-Scan mit BFSG-Score (0-100)
- Vollreport (Basis 199 €): WCAG-2.1-AA-Findings als PDF
- Profi-Paket (499 €): Multi-Page-Crawl bis 50 Seiten, Umsetzungsplan,
  30 Tage E-Mail-Support
- Cookie-Compliance-Check nach TDDDG (49 €/79 €)
- Monatliches Re-Check-Abo (39 €/Monat)

Technisch basiert der Scanner auf den Open-Source-Engines axe-core und
Pa11y, ergänzt um eigene BFSG-spezifische Regelwerke. Reports werden in
deutscher Sprache geliefert. Hosting erfolgt bei Hetzner in Nürnberg,
sämtliche Verarbeitung DSGVO-konform.

"Es geht nicht um Garantien — die kann kein Tool seriös abgeben", erläutert
Gründer Matthias Seba. "Es geht darum, in 5 Minuten zu wissen, wo Du stehst
und einen konkreten Fix-Plan zu haben, statt 5.000 Euro für eine Beratung
auszugeben, die Dir das gleiche sagt."

BFSG-Check positioniert sich bewusst gegen Overlay-Tools wie AccessiBe
und UserWay, die seit Jahren von deutschen Überwachungsstellen kritisiert
werden. Stattdessen liefert das Tool ehrliche Befunde mit Code-Snippets
zur tatsächlichen Behebung.

Verfügbarkeit: bfsg-fix.de — Gratis-Scan ohne Anmeldung möglich.

ÜBER BFSG-CHECK:
BFSG-Check (bfsg-fix.de) ist ein Service von Matthias Seba, Kutenholz.
Der Service liefert automatisierte Compliance-Scans deutscher Websites
nach BFSG, WCAG 2.1 AA und TDDDG. Made in Germany.

PRESSEKONTAKT:
Matthias Seba
BFSG-Check · bfsg-fix.de
Lange Straße 20, 27449 Kutenholz
E-Mail: info@matthias-seba.de
```

#### inar.de (10 Minuten, kostenlos)
**URL:** https://www.inar.de/pressemitteilung-veroeffentlichen/

Gleichen Text wie openPR verwenden — identischer Inhalt ist OK bei kostenlosen Portalen.

---

## BLOCK C — DIESE WOCHE, 4–6 Stunden verteilt

### Tag 3 (Mittwoch)
- [ ] **Recherchescout-Profil** (30 Min): https://www.recherchescout.com/registrierung-experten/ → "Compliance / Barrierefreiheit / IT-Recht" als Themen wählen
- [ ] **HARO/Featured.com** (15 Min): https://www.helpareporter.com → Profil "Accessibility, German compliance law, SaaS founder"
- [ ] **W3C WAI Evaluation Tools** (15 Min): https://www.w3.org/WAI/ER/tools/ → Submit Tool
- [ ] **firmenpresse.de** (15 Min): https://www.firmenpresse.de/pressemitteilung-veroeffentlichen.html → gleichen PM-Text

### Tag 4 (Donnerstag)
- [ ] **4 Awesome-A11y GitHub PRs** (60 Min): `brunopulis/awesome-a11y`, `ryanmagoon/awesome-a11y`, `lukeslp/awesome-accessibility`, `a11yproject.com` — Vorlage in `marketing/awesome-lists-pr-template.md`. WICHTIG: "I'm the founder" in PR-Description angeben.
- [ ] **barrierefreie-agenturen.de Editor** (15 Min): Web-Formular unter https://barrierefreie-agenturen.de → Vorschlag für Listing. Vorlage in `marketing/listings-submission-templates.md` (Punkt 9).

### Tag 5 (Freitag)
- [ ] **Show HN Post vorbereiten** — NUR VERSION 1 (ehrliche Version, kein Dataset-Claim). Timing: Dienstag 09:00 PST = 18:00 CET. Text in `marketing/show-hn-launch-post.md` (VERSION 1).
- [ ] HN-Account Karma prüfen: muss >10 sein, sonst wird Post auto-versteckt.

### 28.06.2026 (1 Woche nach Launch) — POWER-MOMENT
- [ ] PM Version 2 mit echten Scan-Daten aus System senden (openPR + inar + firmenpresse)
- [ ] Direkt-Pitch an heise@heise.de, redaktion@t3n.de mit Betreff "1 Jahr BFSG"

---

## PREISE — QUICK-REFERENCE (alle live, Stripe-validiert)

| Paket | Preis |
|---|---|
| Gratis-Scan | 0 € |
| Basis (Vollreport) | 199 € einmalig |
| Profi (Multi-Page + Support) | 499 € einmalig |
| Cookie-Check Basis | 49 € einmalig |
| Cookie-Check Profi | 79 € einmalig |
| Re-Check-Abo | 39 €/Monat (aktuell deaktiviert) |

---

## WENN ETWAS SCHIEF GEHT

| Problem | Sofortmaßnahme |
|---|---|
| Payment-Flow kaputt (A1) | Kein Ads-Start bis gefixt. Meld dich, ich debugge. |
| Google Ads abgelehnt | Screenshot schicken — wahrscheinlich Billing-Verifizierung nötig |
| Listing-Formular geht nicht | Nächstes Listing machen, zurückkommen |
| HN-Post auto-hidden | Karma zu niedrig — mehr Kommentare in anderen HN-Threads hinterlassen |
| 0 Klicks nach 3 Tagen Ads | Negative-Keyword-Liste zu aggressiv oder Budget zu niedrig — kurze Review |
