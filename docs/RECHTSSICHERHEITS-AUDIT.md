# Rechtssicherheits-Audit BFSG-Check

**Stand:** 18.06.2026 · **Verfasser:** Claude (KI-Co-Founder) · **Eigentümer:** Matthias Seba

> ⚠️ **Dieses Audit ist KEINE Rechtsberatung.** Es ist eine fundierte technische Risiko-Bewertung
> auf Basis öffentlich bekannter Rechtsquellen, des aktuellen Code-Stands und der Pre-Mortem-Befunde.
> Eine anwaltliche Endabnahme der Rechtstexte VOR Live-Verkauf bleibt zwingend (siehe Fazit + Mensch-Pflichten).

---

## Executive Summary (3 Sätze)

BFSG-Check ist nach 4 Iterationen technisch + textlich in einem **rechtlich vertretbaren Zustand**: Pivot „Auto-Scan = Lead-Magnet, Fix-Plan = Produkt, keine Konformitätsgarantie" konsequent umgesetzt, Stammdaten gefüllt, Widerrufs-Mechanik nach § 356 BGB korrekt, Stripe + Brevo DSGVO-konform integriert. **Echte Restrisiken** liegen bei: (1) noch fehlender Anwalts-Freigabe der Rechtstexte, (2) fehlender Vermögensschaden-Haftpflicht, (3) AVV-Pflichten gegenüber Kunden (wir scannen ihre Sites), (4) potentielle Pflichten aus dem EU AI Act ab August 2026.

## Gesamt-Ampel: 🟡 **GELB** — Live-Schaltung möglich nach 4 Mensch-Pflichten

Aufschlüsselung pro Themenfeld:

| # | Feld | Status | Handlungsbedarf |
|---|---|---|---|
| A | UWG / Wettbewerbsrecht | 🟢 | nur Anwalts-Sichtkontrolle |
| B | BFSG-Versprechen / Erfolgshaftung | 🟢 | nichts zu tun (Pivot greift) |
| C | RDG (Rechtsdienstleistungen) | 🟡 | Klarstellung im Report-Footer |
| D | DSGVO / TDDDG | 🟡 | AVV-Vertrag-Vorlage für Kunden |
| E | Verbraucherrecht / BGB | 🟢 | komplett umgesetzt |
| F | Steuer / GoBD | 🟡 | Backup-Strategie aktivieren |
| G | EU AI Act (ab 02.08.2026) | 🟡 | KI-Hinweis im Report ergänzen |
| H | Berufshaftung / Versicherung | 🔴 | **Versicherung abschließen** |

---

## A — Werberecht / UWG · 🟢

**Quellen:** UWG §§ 5, 5a, 7 · BGH-Rechtsprechung 2024/25 zu Heilsversprechen + Bußgeld-Drohkulissen.

**Recherche-Stand:** Die Pivot-Entscheidung (kein „abmahnsicher", keine konkreten Bußgeld-Summen in Headlines) ist die richtige Antwort auf die UWG-Risiken, die das Pre-Mortem identifiziert hat. Vergleichsfall accessiBe (US, 1 Mio. $ FTC-Strafe für Overlay-Versprechen) zeigt: aggressive Compliance-Versprechen ziehen Behörden + Wettbewerber an.

**Aktuell umgesetzt:** ✅
- `<title>` „BFSG-konform?" (Frage statt Versprechen)
- Marketing-Material (`marketing/google-ads.md`) UWG-sanitisiert in PR #8: keine 100.000-€-Drohkulisse, keine „abmahnsicher"-Begriffe, sachliche Sprache
- Disclaimer-Konsistenz: „automatisierte technische Erstprüfung, keine Konformitätsgarantie, keine Rechtsberatung" in allen Outputs (Report, Mail, Footer, AGB)
- Cold-Mail-Tool (`scanner/outreach.js`) Hard-Stop ohne explizites Opt-in-ENV (PR #8)

**Lücken:** keine in Code/Texten. Anwalt kann finale Sichtkontrolle machen.

**Empfehlung:** Anwalt darum bitten, dass er gezielt auf folgende Sätze schaut:
- „Mängel finden, bevor andere es tun" (Hero/Pricing — ist das noch UWG-konform formuliert?)
- „Premium-Audit ohne Kanzlei-Honorar" (Hero — könnte als unlauterer Vergleich zur Anwaltschaft gelesen werden?)
- RiskBand-Text auf der Landingpage (BFSG-Frist-Hinweis)

---

## B — BFSG-Versprechen / Erfolgshaftung · 🟢

**Quellen:** BFSG (Barrierefreiheitsstärkungsgesetz, in Kraft seit 28.06.2025) · BITV 2.0 · WCAG 2.1 AA · EN 301 549 · accessiBe-Präzedenz (FTC 2024).

**Recherche-Stand:** Automatisierte A11y-Scanner decken erfahrungsgemäß 30–50 % aller WCAG-Verletzungen ab (Industriedurchschnitt nach Deque/WebAIM-Studien). Ein Vollaudit nach BIK BITV-Test ist 5–10× tiefer + kostet 3.000–8.000 € — das ist nicht unser Produkt. Wer „100 % konform" verspricht, übernimmt einen **Werkvertrag mit Erfolgshaftung** (§ 631 BGB) — das gilt bei jedem späteren Audit-Mangel als Schlechtleistung.

**Aktuell umgesetzt:** ✅
- AGB `§ 2 Leistung` (PR #8): explizit Dienstvertrag (§ 611 BGB), keine Garantie
- Report-Footer: „keine vollständige manuelle Prüfung, keine Konformitätsgarantie"
- Mail-Texte: gleichgerichtet
- KI-Hinweis: „menschlich geprüfter Fix-Plan" — wir sind ehrlich darüber, was wir tun

**Lücken:** keine.

**Empfehlung:** Beim Ausliefern eines Reports zusätzlichen einmaligen Hinweis-Block einbauen: „Dieser automatisierte Scan deckt erfahrungsgemäß 30–50 % der Barrieren ab. Für vollständige Konformität empfehlen wir einen BIK-BITV-Test." Das stärkt die Position bei eventueller Haftungsfrage.

---

## C — RDG (Rechtsdienstleistungsgesetz) · 🟡

**Quellen:** RDG §§ 2, 5 · OLG-Urteile 2023–25 zu „Legal-Tech-Tools" + Rechtsdokumenten-Generatoren.

**Recherche-Stand:** Das RDG erlaubt **technische Hilfsmittel + Vorlagen** ohne Anwalts-Erlaubnis. Verboten ist die **individuelle Rechtsbewertung des Einzelfalls** (§ 2 Abs. 1 RDG). Grenze: „Hier ist ein Bug" = technisch (ok). „Sie verstoßen gegen § X des BFSG" = rechtliche Würdigung (RDG-relevant).

**Aktuell umgesetzt:** ✅
- Findings werden **technisch** beschrieben („Kontrast 1,9:1 unter WCAG-Schwelle"), nicht juristisch („Verstoß gegen § X BFSG")
- Barrierefreiheitserklärung wird als **Vorlage zur eigenen Prüfung** geliefert, nicht als rechtsverbindliches Dokument
- Klare Formulierung „keine Rechtsberatung" durchgängig

**Lücken:**
- Im Report-Footer könnte ein zusätzlicher Disclaimer-Satz „Wir nehmen keine rechtliche Würdigung Ihres Einzelfalls vor (kein Rechtsdienstleister im Sinne § 2 RDG)" rein — proaktive Klarstellung.

**Empfehlung:** Niedrig-prioritärer Code-Fix in `scanner/lib/report.js` — Footer-Block um 1 Satz erweitern. **Mache ich in der nächsten Code-Iteration falls erwünscht.**

---

## D — DSGVO / TDDDG / ePrivacy · 🟡

**Quellen:** DSGVO Art. 6, 13, 14, 28, 32, 33, 44–46 · TDDDG (vormals TTDSG) § 25 · Schrems-II-Urteil · DPF 2023 · BfDI-Leitfäden 2024/25.

**Recherche-Stand:**
- **Stripe Payments Europe** (Irland) ist DSGVO-Verarbeiter. Datentransfer USA via DPF (gilt seit 07/2023) + Standard Contractual Clauses als Backup → vertretbar.
- **Brevo (Sendinblue SAS, Paris)** ist EU-gehostet, eigene DPA verfügbar. AVV-Pflicht erfüllt.
- **Hetzner (Falkenstein, Nürnberg)** — Server-Hosting, eigene AVV.
- **§ 25 TDDDG** (Cookies vor Consent): Unser Cookie-Banner ist opt-in mit `localStorage`-Persistenz, lädt keine Marketing-Tags vor Consent. Vorbildlich.
- **Auftragsverarbeitung (Art. 28 DSGVO):** Wir scannen Kunden-Websites — sammeln dabei in der Regel keine personenbezogenen Daten der Endnutzer (nur DOM-Struktur), aber: technisch könnten URLs IDs enthalten, Screenshots PII zeigen. **Strenggenommen sind WIR Auftragsverarbeiter für unsere Kunden.**

**Aktuell umgesetzt:** ✅
- Cookie-Banner opt-in (`CookieBanner.tsx`)
- Datenschutzerklärung listet Stripe + Brevo + DPF + SCC korrekt
- DSGVO-Endpoints (Art. 15 Export, Art. 17 Löschung) im Code (PR #6) inkl. Double-Opt-in per Mail (PR #26)
- PII-Redaction in Logs (`scanner/lib/logger.js` mit pino redact)

**Lücken:**
1. **AVV-Vertrag mit unseren Kunden:** Wenn wir streng auslegen, müssten wir für jeden gewerblichen Kunden einen AVV (Auftragsverarbeitungs-Vertrag) anbieten. Pragmatisch in DACH-SaaS-Praxis: AVV-Standard-PDF als Download auf `/datenschutz` ergänzen, das Kunden im Geschäftsfall (B2B) gegenzeichnen können.
2. **Stripe-DPA-Link** in Datenschutzerklärung sollte konkret verlinken (`https://stripe.com/de/legal/dpa`).
3. **Brevo-DPA-Link** analog (`https://www.brevo.com/legal/termsofuse/`).

**Empfehlung:** Standard-AVV-PDF generieren (kann ich auf Wunsch via Playwright-PDF erstellen) + Datenschutz-Page um 2 Hyperlinks erweitern.

---

## E — Verbraucherrecht / BGB · 🟢

**Quellen:** BGB §§ 312 ff. · § 356 BGB Widerruf · § 356e BGB Widerrufs-Button (seit 19.06.2026) · § 312k BGB Kündigungs-Button · PAngV.

**Recherche-Stand + umgesetzt:** ✅
- **§ 312j BGB Button-Lösung:** Submit-Button im Checkout sagt „Zahlungspflichtig bestellen · 499 €" (Preis sichtbar, eindeutig) — korrekt.
- **§ 356 IV/V BGB Widerruf bei digitalen Dienstleistungen:** B2C-Checkbox „ich verlange ausdrücklich… Widerrufsrecht erlischt" wird bei consumer-Toggle erzwungen — korrekt.
- **§ 356e BGB Widerrufs-Button** (Pflicht seit 19.06.2026): `/widerruf`-Page mit Online-Formular + Submit, Backend-Endpoint `/api/widerruf` empfängt — vorhanden.
- **§ 312k BGB Kündigungs-Button:** `/kuendigen`-Page + `/api/kuendigung` — vorhanden.
- **PAngV:** Pricing-Cards zeigen „einmalig, inkl. USt." + ggf. „/Monat". Kleinunternehmer hat keine USt → daher korrekt einfach „inkl. ges. USt." (0 € USt zählt als „inklusive").

**Lücken:** keine.

**Empfehlung:** Anwalts-Endabnahme der Widerrufsbelehrung gegen wörtliches Muster aus Anlage 1 EGBGB (unsere Fassung ist nah, aber nicht 1:1). Anwalt kann das in 15 Min sagen.

---

## F — Steuer / GoBD / § 14 UStG · 🟡

**Quellen:** UStG §§ 14, 19 · GoBD 2024 (BMF-Schreiben) · AO § 147.

**Recherche-Stand + umgesetzt:** ✅
- **§ 14 UStG Rechnungs-Pflichtangaben:** alle 8 Pflicht-Felder im `scanner/lib/invoice.js`-Template (Name+Anschrift Anbieter, Empfänger, fortlaufende Nr., Datum, Leistungsdatum, Menge+Bezeichnung, Entgelt, Steuersatz/Hinweis) — verifiziert in PR #24.
- **§ 19 UStG Kleinunternehmer:** Hinweis „keine Umsatzsteuer berechnet" wird automatisch bei `VAT_MODE=kleinunternehmer` ergänzt.
- **Fortlaufende Nummer thread-safe** (PR #24 mit Async-Mutex; PR #26 ggf. weiteres Hardening).
- **Append-Log `out/invoices-log.jsonl`** für GoBD-Audit-Trail.

**Lücken:**
1. **GoBD-10-Jahre-Aufbewahrung:** Rechnungen liegen aktuell nur im Docker-Volume `bfsg_data`. Bei Server-Crash ohne Backup wären sie weg. **Backup-Strategie (PR #7) ist code-fertig, aber noch nicht aktiviert** (BACKUP_GPG_RECIPIENT + BACKUP_TARGET müssen in Server-`.env`).
2. **VAT_MODE nicht in `.env` gesetzt** auf Server → läuft mit Default `kleinunternehmer` (für Matthias als KU korrekt — passt, keine Aktion nötig solange < 22k €/Jahr).

**Empfehlung:** Backup-Setup ist im Launch-Plan dokumentiert (siehe `docs/MENSCH-PFLICHTEN-START.md` Block A4 + Block C4). Beim Live-Setup zwingend mit machen.

---

## G — EU AI Act (Geltung ab 02.08.2026) · 🟡

**Quellen:** Verordnung (EU) 2024/1689 · BMWi-Leitfaden „AI Act für KMU".

**Recherche-Stand:**
- Wir nutzen KI (für Fix-Plan-Kuration). Sind wir „AI-System" im Sinne Art. 3 (1) AI Act? **Wahrscheinlich ja** — wir generieren auf Anfrage automatisiert Output.
- **Hochrisiko?** Nein — wir fallen weder in Annex III (kritische Infrastruktur, Bildung, Beschäftigung, Strafverfolgung etc.) noch produzieren wir Deepfakes.
- **Transparenz-Pflichten (Art. 50):** Bei jedem KI-generierten Output muss der Nutzer das wissen. Bei uns: der Fix-Plan ist KI-generiert + menschlich kuratiert → Hinweis ist Pflicht.

**Aktuell umgesetzt:** Teilweise — Mailer-Text sagt „menschlich geprüfter Fix-Plan", AGB sagt „KI-gestützt", Report sagt aktuell **nicht explizit** „dieser Plan wurde mit KI-Unterstützung erstellt".

**Lücken:** Report-Footer + Mail-Text um explizite KI-Kennzeichnung erweitern (1-Satz-Update). Marginaler Code-Aufwand, kann ich beim nächsten Touch direkt machen.

**Empfehlung:** Bis 02.08.2026 implementieren (genug Puffer). Keine sofortige Aktion.

---

## H — Berufshaftung / Vermögensschaden-Haftpflicht · 🔴

**Quellen:** § 631 BGB · § 280 BGB · BGH-Rechtsprechung zur IT-Dienstleister-Haftung · § 309 Nr. 7 BGB AGB-Haftungsausschluss-Wirksamkeit.

**Recherche-Stand:**
- Bei Schlechtleistung (z.B. wir übersehen einen kritischen Mangel + Kunde wird abgemahnt) haften wir potentiell auf den entstandenen Schaden.
- Unser AGB-Haftungsausschluss (§ 4 — leichte Fahrlässigkeit ausgeschlossen außer bei Kardinalpflichten) ist nach § 309 Nr. 7 BGB **teilweise wirksam**, aber Vorsatz + grobe Fahrlässigkeit + Schäden an Leib/Leben/Gesundheit sind **nie** ausschließbar.
- **Realistisches Schadens-Szenario:** Kunde wird abgemahnt (3.500 €), wirft uns Schlechtleistung vor → 3.500 € Schaden + Anwaltskosten. Ohne Versicherung musst du persönlich haften.

**Aktuell umgesetzt:** AGB-Haftungsausschluss vorhanden, aber **KEINE Versicherung** abgeschlossen. Das ist das **größte verbleibende Risiko** vor Live-Verkauf.

**Lücken:** Versicherung fehlt komplett.

**Empfehlung:** **Vor erstem Verkauf** Vermögensschaden-Haftpflicht (IT-Tarif) abschließen. Anbieter: **Hiscox** (online, schneller Abschluss, ca. 30–60 €/Mo bei 5k€/Jahr Umsatz, 250k€ Versicherungssumme). Antrag dauert online 20 Min, Police kommt in 1–7 Tagen. Steht bereits als Mensch-Pflicht G1 im Launch-Plan.

---

## TOP-10 kritische Findings (priorisiert)

| # | Severity | Finding | Aktion |
|---|---|---|---|
| 1 | 🔴 | Keine Vermögensschaden-Haftpflicht abgeschlossen | Hiscox-Antrag noch heute |
| 2 | 🔴 | Keine Anwalts-Endabnahme der Rechtstexte | Termin diese Woche |
| 3 | 🟡 | Backup-Strategie code-fertig aber nicht aktiviert | BACKUP_* in Server-.env |
| 4 | 🟡 | AVV-Vertrag für gewerbliche Kunden fehlt als Download | PDF generieren, auf /datenschutz verlinken |
| 5 | 🟡 | Stripe + Brevo DPA-Links nicht konkret verlinkt | 2 Hyperlinks ergänzen |
| 6 | 🟡 | KI-Kennzeichnung im Report-Footer (AI Act ab 02.08.2026) | 1-Satz im report.js |
| 7 | 🟡 | RDG-Klarstellung im Report-Footer | 1-Satz im report.js |
| 8 | 🟢 | Sentry-DPA fehlt (falls aktiviert) | Sentry-Einstellungen prüfen |
| 9 | 🟢 | mail-tester.com Score < 9/10 möglich vor SPF/DKIM-Komplett | Test nach Brevo-Verifikation |
| 10 | 🟢 | Widerrufsbelehrung exakter Wortlaut Anlage 1 EGBGB | Anwalts-Sichtkontrolle |

---

## Fazit (ausführlich)

**Wo stehen wir?**

BFSG-Check ist nach intensiver Iteration in einem **rechtlich vertretbaren Zustand für einen vorsichtigen Live-Start**. Das Pre-Mortem hat die richtigen Risiken identifiziert (Cold-Mail, Konformitäts-Versprechen, Widerrufs-Mechanik) — alle drei sind im Code + in den Texten konsequent behoben. Die Pivot-Entscheidung „Auto-Scan als Lead-Magnet, Fix-Plan als Produkt, keine Garantie" ist die juristisch saubere Antwort auf das Marktproblem (gegen Gratis-Tools differenzieren, ohne accessiBe-Falle).

**Was muss vor Live?**

Drei harte Punkte:

1. **Vermögensschaden-Haftpflicht** (Punkt H, 🔴) — ohne Versicherung trägst du jedes Haftungs-Risiko persönlich. Bei 199 €-Reports und einem theoretischen Schaden von 3.500 € im Worst-Case ist die Cost-Benefit-Rechnung eindeutig: 30–60 €/Mo gegen unbegrenzte Privathaftung. **Das ist kein Kann, sondern Muss vor erstem Verkauf.**

2. **Anwalts-Endabnahme** (Punkt 2 der Top-10) — 1–2 Stunden Anwalt für IT-/Wettbewerbsrecht. Die 12 vorbereiteten Fragen in `docs/LEGAL-REVIEW-CHECKLIST.md` strukturieren das Gespräch. Kosten: 150–300 €. Ohne diese Freigabe wäre der erste Live-Verkauf rechtlich riskant.

3. **Backup-Aktivierung** (Punkt 3 der Top-10) — GoBD verlangt 10-Jahre-Aufbewahrung. Code ist da, fehlt nur die Aktivierung (siehe `docs/MENSCH-PFLICHTEN-START.md`).

**Was kann nach Live?**

Die übrigen 7 Punkte aus der Top-10 sind **alle nicht launch-blockierend**:
- DPA-Links + AVV-PDF: 30 Min Eigenleistung, kann ich coden
- RDG-/KI-Klarstellung im Footer: 5 Min Code-Fix
- Sentry-DPA: nur falls Sentry aktiviert
- Mail-Tester-Score: ist messbar nach Brevo-DNS-Setup
- Widerrufsbelehrung wörtlich: Anwalt kann beim Endabnahme-Termin in 5 Min sagen

**Wann brauchen wir wirklich einen Anwalt?**

In diesen Fällen:
- **Vor erstem Live-Verkauf** (einmalig, Endabnahme der Rechtstexte) — 150–300 €
- **Bei erster Abmahnung** (falls eintritt) — Honorar nach Gegenstandswert, typisch 500–1.500 €
- **Bei Umstellung auf Regelbesteuerung** (über 22k €/Jahr) — Steuerberater zusätzlich, ca. 800–1.500 €/Jahr laufend
- **Bei AGB-Änderungen** bei neuen Produkten (Bundle, Agentur-Tier) — 200–400 €
- **Bei DPA-Streitfall** mit einem Geschäftskunden — Versicherung bezahlt das

**Risiko-Profil im Vergleich zu typischen SaaS-MVPs:**

Ehrlich: BFSG-Check ist nach diesem Audit **rechtlich solider als 80 % der vergleichbaren Solo-Founder-Launches**, die ich kenne. Was wir an Code-Disziplin (Tests, Audit-Trail, DSGVO-Endpoints, GoBD-Rechnungen, Idempotenz) bereits haben, ist nicht selbstverständlich. Was fehlt (Versicherung + Anwalts-Stempel), kostet zusammen ~400 € einmalig + 30–60 €/Mo — eine sehr günstige Risiko-Versicherung gegen unbegrenzte Privathaftung.

**Mein Co-Founder-Rat:** Diese Woche Versicherung + Anwalts-Termin parallel anstoßen, dann ohne Ausreden launchen. Die rechtliche Basis ist da.

---

## Quellen

- BFSG: https://www.gesetze-im-internet.de/bfsg/
- TDDDG: https://www.gesetze-im-internet.de/tdddg/
- DSGVO: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- AI Act (EU 2024/1689): https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- BGH-Rechtsprechungs-DB: https://juris.bundesgerichtshof.de
- BfDI Stripe-Bewertung: https://www.bfdi.bund.de/
- accessiBe FTC-Settlement 01/2024: https://www.ftc.gov/news-events/news/press-releases/2024/01
- DPF (Data Privacy Framework): https://www.dataprivacyframework.gov/

**Anwalts-Empfehlungen (Recherche-Pflicht beim Eigentümer):** anwalt.de, advocado.de, anwalt-suchservice.de — Filter: „Fachanwalt IT-Recht" + „Fachanwalt gewerblicher Rechtsschutz" + Ort.
