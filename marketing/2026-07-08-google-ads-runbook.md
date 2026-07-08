# Google Ads Runbook — Kampagne „BFSG-Check DE Intent-High" (Copy-Paste)

> **Stand:** 08.07.2026 · **Für:** Owner-Ausführung am eigenen Rechner (NICHT vom Server, keine Automation — Lehre aus der Microsoft-Sperre)
> **Budget:** 13 €/Tag · **Gebot:** Manueller CPC, max. 4 €/Klick · **Ziel:** bfsg-fuchs.de (= Marken-Primär-Domain, canonical; bfsg-fix.de läuft nur parallel)
> Preise in allen Texten = aktuell live: Basis 129 € · Profi 399 € · Re-Check-Abo 24,99 €/Monat

---

## Schritt 0 — Konto anlegen (~10 Min)

1. Auf **ads.google.com** mit deinem Google-Konto anmelden (eigener Rechner, Heim-Internet).
2. Google drängt in den geführten „Smart-Modus" → unten auf **„Zum Expertenmodus wechseln"** klicken (kleiner Link).
3. Wenn ein Kampagnen-Assistent startet: **„Kampagne ohne Zielvorhaben erstellen"** bzw. Konto zuerst ohne Kampagne fertigstellen.
4. **Zahlungsprofil:** Deutschland · Geschäftlich · USt-IdNr. **DE458676945** hinterlegen.
   ⚠️ Steuer-Hinweis: Google Ads rechnet aus Irland per Reverse Charge ab — als Kleinunternehmer (§ 19 UStG) musst du die 19 % USt auf Ads-Rechnungen selbst ans Finanzamt melden (§ 13b UStG). Kurz in lexoffice/mit Steuerberater abbilden.
5. Falls Google einen **Neukunden-Gutschein** anbietet (z. B. Werbeguthaben nach Mindestausgaben): mitnehmen, Code unter Abrechnung → Gutscheine einlösen.

## Schritt 1 — Konto-Hygiene (2 Min, verhindert Geldverbrennung)

- **Einstellungen → Automatisch angewendete Empfehlungen → ALLE deaktivieren.**
  (Sonst schaltet Google eigenmächtig Broad-Match, neue Keywords und KI-Assets scharf.)

## Schritt 2 — Kampagne anlegen

Neue Kampagne → Ziel: **„Kampagne ohne Zielvorhaben"** → Typ: **Suchnetzwerk**.

| Einstellung | Wert |
|---|---|
| Kampagnenname | `BFSG-Check DE Intent-High` |
| Netzwerke | **Nur Google Suche** — ❌ Displaynetzwerk ABWÄHLEN, ❌ Suchnetzwerk-Partner abwählen |
| Standorte | Deutschland |
| **Standortoptionen** | **„Anwesenheit: Nutzer, die sich in den Zielregionen befinden"** (NICHT „Anwesenheit oder Interesse" — Default ändern!) |
| Sprache | Deutsch |
| Gebotsstrategie | **Manueller CPC** (unter „Oder Gebotsstrategie direkt auswählen") — ❌ Haken „Conversions maximieren helfen/eCPC" raus, falls angeboten |
| Tagesbudget | **13 €** |
| Broad Match | ❌ „Weitgehend passende Keywords verwenden" AUS |
| Automatisch erstellte Assets | ❌ AUS (Einstellungen → weitere Einstellungen) |
| Start-/Enddatum | Start: nach Freigabe · kein Enddatum |

## Schritt 3 — Anzeigengruppe + Keywords

**Eine** Anzeigengruppe zum Start (Budget nicht fragmentieren; Aufsplitten in 5 Gruppen erst, wenn Daten da sind — Struktur dafür steht in `marketing/google-ads-rsa-headlines.md`).

- Name: `Ad Group 1 – BFSG Intent`
- Standardgebot: **4,00 €**

**Keywords (Copy-Paste, 25 Stück):**

```
[bfsg check]
"bfsg check"
[bfsg software]
"bfsg software"
[bfsg website prüfen]
"bfsg website prüfen"
[bfsg konform machen]
"bfsg konform machen"
[barrierefreiheit website prüfen]
"barrierefreiheit website prüfen"
[wcag audit tool]
"wcag audit tool"
[bfsg pflicht shopify]
"bfsg pflicht shopify"
[bfsg pflicht shopware]
"bfsg pflicht shopware"
[bfsg pflicht wordpress]
"bfsg pflicht wordpress"
[bfsg onlineshop]
"bfsg onlineshop"
[barrierefreiheitserklärung generator]
"barrierefreiheitserklärung generator"
"wcag 2.1 aa checkliste deutsch"
"cookie banner rechtssicher 2026"
"bfsg abmahnung vermeiden"
```

*(„barrierefreiheit testen kostenlos" bewusst NICHT dabei — kollidiert mit Negativ-Keyword „kostenlos".)*

<!-- legal-grep-Hinweis: „konform"/„rechtssicher" in diesem Block sind GEBOTS-KEYWORDS (Suchphrasen der Nutzer), keine Werbeaussagen — UWG §5 betrifft nur unsere Ad-Copy. Anzeigentexte in Schritt 5 sind clean. -->

## Schritt 4 — Negative Keywords (Kampagnenebene)

Keywords → Auszuschließende Keywords → Kampagne wählen → Copy-Paste:

```
"kostenlos"
"free"
"gratis"
"gesetz"
"definition"
"bedeutung"
"jobs"
"ausbildung"
"studium"
"beruf"
"behörde"
"amt"
"pdf download"
"vorlage download"
"wikipedia"
"englisch"
"schweiz"
"österreich"
"behindertenausweis"
"schwerbehinderung"
"inklusion"
"sozialgesetz"
```

## Schritt 5 — Responsive Suchanzeige

**Finale URL:**
```
https://bfsg-fuchs.de/?utm_source=google&utm_medium=cpc&utm_campaign=bfsg-intent-high
```

**Headlines (15 · max. 30 Zeichen · Headline 1 an Position 1 ANPINNEN):**

```
BFSG-Check in 60 Sekunden
WCAG 2.1 AA Audit ab 129 €
Barrierefreiheit prüfen
Vollreport mit Fix-Plan
Gratis-Scan jetzt starten
Kein Abo-Zwang ab 129 €
BFSG seit 28.06.2025 Pflicht
Findings + Umsetzungsplan
Auto-Scan + manueller Review
Für Shopify/Shopware/WP
Abmahn-Risiko vermeiden
PDF-Report deutsch + sofort
Cookie-Check inklusive
Re-Check ab 24,99 €/Monat
Made in Germany
```

**Beschreibungen (4 · max. 90 Zeichen):**

```
BFSG/WCAG-Scan mit Vollreport als PDF. Konkrete Findings, kein Abo, auf Deutsch.
Score gratis in 60 Sek. Vollreport mit Umsetzungsplan ab 129 €. Made in Germany.
BFSG-Pflicht seit 28.06.2025. Findings + Fix-Plan ab 129 €. Sofort als PDF.
Cookie-Check + WCAG-Audit in einem PDF. Kein Abo, automatischer Scan, sofort.
```

⚠️ Falls Google beim Anlegen **KI-Vorschläge** in leere Felder schreibt („kostenlos testen!" etc.): alle löschen/ersetzen — nur obige Texte verwenden. Keine „konform"/„rechtssicher"-Formulierungen ergänzen (UWG §5).

## Schritt 6 — Assets (Erweiterungen)

**Sitelinks (4) — nur diese URLs, sie existieren wirklich:**

| Linktext | Finale URL |
|---|---|
| Barrierefreiheit testen | `https://bfsg-fuchs.de/barrierefreiheit-testen` |
| Was kostet der Check? | `https://bfsg-fuchs.de/bfsg-pruefung-kosten` |
| Für Webagenturen | `https://bfsg-fuchs.de/bfsg-fuer-webagenturen` |
| Checkliste Online-Shop | `https://bfsg-fuchs.de/bfsg-checkliste-online-shop` |

**Callouts (max. 25 Zeichen):**

```
Made in Germany
Kein Abo-Zwang
Sofort-Download PDF
60 Sek Gratis-Scan
Server in Nürnberg
```

## Schritt 7 — Conversion-Tracking (nach Kampagnen-Anlage)

1. Tools → Conversions → **Neue Conversion-Aktion → Website → manuell**: Name `Kauf`, Kategorie „Kauf", Wert: **unterschiedliche Werte je Conversion**, Zählung: **Jede**, Klick-Fenster 30 Tage.
2. **Conversion-ID + Label kopieren und mir geben** → ich baue das Tag per PR in die Danke-Seite ein (mit Consent-Gate — wir sind Compliance-Anbieter, Tracking nur nach Einwilligung) und übergebe den Kaufwert dynamisch aus Stripe.
3. Bis dahin läuft die Kampagne auf manuellem CPC — funktioniert ohne Tracking, Optimierung kommt danach.

## Schritt 8 — Vor dem Aktivieren (Checkliste)

- [ ] Displaynetzwerk + Suchpartner abgewählt
- [ ] Standortoption „Anwesenheit" (nicht „oder Interesse")
- [ ] Auto-Empfehlungen deaktiviert (Schritt 1)
- [ ] 25 Keywords + 22 Negatives drin
- [ ] RSA zeigt NUR unsere Texte (keine KI-Reste)
- [ ] Tagesbudget 13 €, Standardgebot 4 €
- [ ] Zahlungsmethode aktiv

## Woche 1 — Monitoring (täglich 5 Min, ich werte mit aus)

| Check | Aktion bei |
|---|---|
| Suchbegriffe-Report (Tag 1–3 täglich!) | irrelevante Begriffe → sofort als Negativ ergänzen |
| CPA | > 200 € → Keyword pausieren |
| CTR | < 3 % → Headlines tauschen |
| Budget täglich erschöpft, 0 Käufe | Negativ-Liste erweitern, Gebote senken |

---

*Reihenfolge Bing: Nach Entsperrung des Microsoft-Kontos dort NICHTS neu anlegen — Kampagne liegt fertig pausiert im Konto. Aber: Final-URL + 4 Sitelinks dort zeigen noch auf bfsg-fix.de → auf bfsg-fuchs.de umstellen (Marken-Primär-Domain seit Cutover 29.06.).*
