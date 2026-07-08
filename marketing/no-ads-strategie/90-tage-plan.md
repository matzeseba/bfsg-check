# 90-Tage-Plan: No-Ads-Marketingstrategie BFSG-Fuchs

**Erstellt:** 08.07.2026 · **Rolle:** Chief Marketing Officer (finale Synthese)
**Grundlage:** Sieger-Entwurf `entwurf-partner-channel.md` + Jury-Feedback (3 Juroren) + übernehmenswerte Ideen aus `entwurf-authority-aeo.md` und `entwurf-product-led.md` + `synthese.md` (20 belegte Findings, Stand 08.07.2026)
**Zeitraum:** Woche 1 (08.–14.07.2026) bis Woche 13 (30.09.–06.10.2026)
**Rahmen:** Solo-Founder, ~600 €/Monat freies Budget, ~2–4 h/Tag Owner-Zeit für Marketing, Google/Microsoft Ads dauerhaft gesperrt, harte UWG-Verbote (kein Cold-Mail, keine Fremd-DMs, keine „BFSG-konform"-Werbung)

> **Warum Partner & Channel als Grundlage, aber nicht als alleiniger Motor:** Der Sieger-Entwurf ist im Jury-Feedback selbst der ehrlichste zur eigenen Geschwindigkeit — er sagt explizit „0 Partner-generierte Sales in Woche 2", weil Agentur-/Partner-Vertrauen laut 3-Phasen-Modell erst ab Monat 2–3 zu tragen beginnt (Quelle: saaswelt.de/artikel/saas-marketing-ki-aera, 2026). Diese finale Strategie übernimmt die Partner-Channel-Architektur (Provisionslogik, Owner-Zeit-Disziplin, Rechts-Sorgfalt) vollständig, **stellt ihr aber von Woche 1 an einen schnelleren Motor zur Seite** — Content-Authority/AEO/PR (im Jury-Schnitt der am höchsten bewertete Entwurf, ⌀ 6,67 von 3 Juroren) —, weil sonst das Ziel „erste Sales in 14 Tagen" strukturell unerreichbar wäre. Beide Entwürfe waren sich in dieser Einschätzung bereits einig, bevor diese Synthese sie zusammenführt.

---

## 1. Strategie-Kern (1 Seite)

**Positionierung:** BFSG-Fuchs ist nicht der elfte fast identische Gratis-Scanner (der Mechanismus selbst ist laut Wettbewerber-Teardown inzwischen Kategorie-Standard, mind. 10 direkte Konkurrenten inkl. eRecht24-Scanner seit 01.08.2025), sondern **die Quelle mit eigenen Messdaten, die zur richtigen Zeit zitiert wird — und der stille technische Partner im Rücken von Agenturen und Beratern, die BFSG nicht selbst prüfen wollen.** Zwei Differenzierungsachsen, ein Produkt:

1. **Content-Autorität mit eigenen Daten statt Meinung.** Scan-Dataset-Auswertungen ("Die 10 häufigsten WCAG-Verstöße auf deutschen KMU-Websites") sind ein zitierfähiges Asset, das kein Wettbewerber hat — weder eRecht24 noch AccessGO verkaufen Messwerte, beide verkaufen Meinungsstücke.
2. **Kanal statt Kontakt.** Agenturen, Compliance-Anbieter und Verbände bringen wiederkehrend Kunden, ohne dass wir je einen Cold-Contact brauchen — Partner kommen über Content-Inbound, nicht über Ansprache (Quelle: `research/partner-channel.md` Finding 17).

**Zielgruppe:** Primär deutsche BFSG-pflichtige KMU (seit 28.06.2025 pflichtig), sekundär Webagenturen/Compliance-Berater als Multiplikatoren. Preissegment bewusst **unterhalb** von AccessiWay (Enterprise/Konzernkunden, Hamburg-Büro seit 08/2025) — wir bedienen das KMU-/Kleinagentur-Segment mit 129–399 €-Einmalprodukten, wo ein Konzern-Anbieter strukturell nicht wirtschaftlich spielt. *Einschränkung, ehrlich benannt:* Wie groß dieses Marktsegment tatsächlich ist, ist nicht mit Marktgrößen-Daten belegt — das ist eine plausible, aber unbewiesene Annahme, kein Fakt.

**Funnel (unverändert, bestehend):** Traffic (Content/PR/Partner/Directory) → Gratis-Scan (URL + E-Mail, DOI) → Brevo-Nurture → Kauf (Basis/Profi/Cookie-Check) → `upsell-trigger`-Skill (14 Tage) → Re-Check-Abo. Neu ist nur, **woher** der Traffic kommt und dass Partner-Provisionen parallel im Affiliate-Tool mitlaufen.

**Warum diese Kanal-Mischung (vier Säulen, kein Einzelkanal-Wette):**

| Säule | Rolle | Speed-to-Cash | Warum jetzt |
|---|---|---|---|
| **A — Content-Authority/AEO/PR** | Schnellstart, trägt die 14-Tage-Erwartung | Tage bis Wochen | MLBF-Kontrollphase (seit 05.01.2026) + Abmahnwelle 2 (seit 02/2026) sind laut Finding 7 (`seo-aeo-geo.md`) exakt der Content-Typ, den KI-Suchsysteme bei Aktualität bevorzugt zitieren (+28 % Zitierungen bei <2 Monate altem Content) — ein Zeitfenster-Vorteil, den ältere Wettbewerber-Inhalte nicht automatisch haben. PM ist bereits fertig (`marketing/2026-07-08-pm-mlbf-kontrollphase.md`). |
| **B — Partner & Channel** | Compounding-Motor ab Monat 2 | Monate | Provisionsbasiert, kein Cash-Vorschuss, wiederkehrende Provision auf das Abo amortisiert sich selbst. Von keinem kleineren deutschen Anbieter außer AccessiWay besetzt (Finding 14). |
| **C — Directory/Reviews** | Trust-Fundament für A und B | Wochen | Laut Finding 4 (`seo-aeo-geo.md`) der **stärkste** Einzelhebel für KI-Markenempfehlungen (41 % Gewichtung) — günstiger als jede weitere Content-Produktion. Accounts bei SaaSHub + G2 bereits vorhanden. |
| **D — Produkt-Distribution (leicht, redesignt)** | Späterer, günstiger Zusatzhebel | Monate | Nur der Status-Widget-Kern aus dem Product-Led-Entwurf, **bewusst nicht als Siegel/Badge**, sondern als reine Statuszeile (siehe Risiko-Register, Punkt 9) — WordPress-Plugin und Chrome-Extension bleiben trigger-basiert zurückgestellt. |

**Prinzip, das durch alle vier Säulen läuft (aus dem Jury-Feedback verallgemeinert):** Jede Bau- oder Cash-Entscheidung braucht einen **Trigger statt ein Kalenderdatum** — z. B. "Extension erst bei 2 von 3 Nachfrage-Schwellen", übertragen auf jede Ausgabe in diesem Plan (siehe Budget-Tabelle, Abschnitt 2, und Kill-Kriterien, Abschnitt 4).

---

## 2. Kanal-Portfolio: Prioritäten & Budget-Split (600 €/Monat)

### 2.1 Priorisierung

| Prio | Kanal | Säule | Start | Cash-Bedarf | Owner-Kernaufgabe |
|---|---|---|---|---|---|
| 1 | PR mit fertiger MLBF-PM | A | Woche 1 | 0 € | Formulare ausfüllen (Account nötig) |
| 1 | Directory-Listings SaaSHub/G2 live schalten | C | Woche 1 | 0 € | Account-Freischaltung, Text-Review |
| 1 | AEO-Refresh bestehender 15+ Ratgeberseiten | A | Woche 1–2 | 0 € | Stichproben-Freigabe |
| 2 | LinkedIn-Founder-Content (1–2×/Woche) | A | Woche 1–2 | 0 € | Posten, Ton autorisieren |
| 2 | Overlay-Kritik-Pillar-Artikel (Content-Lücke) | A | Woche 2–3 | 0 € | Rechtliche Freigabe |
| 2 | Programmatic-SEO-Branchenseiten (3–5/Monat) | A | Woche 2, laufend | 0 € | Stichproben-Freigabe |
| 3 | Review-Ask-Automation (Brevo) | C | Woche 2 | 0 € | — |
| 3 | Affiliate-Programm (Tool-Setup) | B | Woche 3–4 | ~49 €/Monat ab Woche 4 | Account/Zahlungsmittel, Provisions-Freigabe |
| 3 | Agentur-/White-Label-Partnerprogramm-Landingpage | B | Woche 3–4 | 0 € | Konditionen final freigeben |
| 4 | Scan-Dataset-PR-Studie ("1 Jahr BFSG", eigene Datenpunkte) | A | Woche 5–6 | 0–100 € (optionaler Premium-Boost) | Freigabe Datenauswertung |
| 4 | Status-Widget (redesignt, kein Siegel) | D | Woche 5–8 | 0–50 € (optional Design) | Design-Freigabe, Testing 2–3 Domains |
| 5 | Co-Marketing-Pitch (Shopware-Blog u. ä.) | B | Woche 6–8 | 0 € | Einreichung/Absender |
| 5 (optional, konservativ) | IHK/Verbände-Content-Anfragen | B | Woche 6, einmalig | 0 € | Anfrage-Versand, persönlicher Ton |
| 6 (nur bei Reserve + Nachweis) | Newsletter-Sponsoring-Test | A | Monat 3 | 400–600 € einmalig | Freigabe |
| Trigger-basiert, **nicht** Teil des 90-Tage-Kernplans | WordPress-Plugin, Chrome-Extension | D | erst bei 2 von 3 Schwellen (s. Abschnitt 4) | — | — |

### 2.2 Budget-Split — adaptiv mit Freigabe-Triggern, kein Fixplan

Der CFO-Kritikpunkt an den Einzel-Entwürfen war identisch: unklare oder "kosmetische" Restbudgets. Deshalb hier **explizite Freigabe-Regeln statt eines starren Plans**:

| Posten | Betrag | Ausgelöst durch | Wenn Trigger nicht erfüllt |
|---|---|---|---|
| Affiliate-Tracking-Tool (FirstPromoter/Rewardful/Reditus) | ~45–49 €/Monat | Standardmäßig ab Woche 4 (Aufwand-arm, geringes Risiko) | Bei <3 aktiven Affiliates bis Woche 8 → kündigen, zurück auf manuelles Spreadsheet-Tracking |
| PR-Premium-Distribution (1×) | ~100 € | Nur zur Scan-Dataset-Studie (Woche 5–6), wenn Basis-PM (Woche 1) mind. 1 Backlink/Erwähnung erzeugt hat | Sonst: kostenlose Basisversion (openPR/inar/firmenpresse) reicht |
| AI-Zitier-Tracking (Otterly.AI/Peec AI) | ~90 €/Monat | **Nicht ab Tag 1** (CFO-Kritik: reine Mess-Ausgabe ohne Umsatzhebel bei vorumsatzstarkem Solo-Business) — erst ab Woche 8, wenn manuelle ChatGPT/Perplexity-Stichproben (kostenlos, 1×/Woche) bereits sichtbare Zitierungen zeigen | Bleibt aus, manuelle Stichprobenprüfung reicht weiter |
| Freelance Fact-Checking/Korrektorat | 0–180 €/Monat | Nur wenn Programmatic-SEO auf >5 Seiten/Monat skaliert **und** Owner-Zeit dafür nicht reicht | Bleibt bei 0 €, solange 3–5 Seiten/Monat vom Owner selbst stichprobengeprüft werden können |
| Status-Widget Design-Politur | 0–50 € einmalig | Nur falls In-House-Design (Filo-Branding, bestehende Assets) nicht ausreicht | — |
| Newsletter-Sponsoring-Test | 400–600 € einmalig | Nur Monat 3, nur wenn **mindestens 1 nachweisbarer Sale aus einem kostenlosen Kanal** (Beleg für Funnel-Funktionsfähigkeit vor Cash-Test) | Entfällt ersatzlos, Budget bleibt Reserve |
| SEO-/Keyword-Tool | 0 € (Standard) / 129 € (Fallback) | Nur falls Ahrefs-MCP-Connector vom Owner **nicht** autorisiert wird | Bei Autorisierung: 0 € |
| **Laufende Fix-Untergrenze** | **~49 €/Monat** ab Woche 4 | | |
| **Realistische Obergrenze bei Volleinsatz aller Trigger** | **~370 €/Monat** in Monat 2–3 | | |
| **Nicht gebundene Reserve** | **≥230 €/Monat** | bleibt bewusst ungebunden für kurzfristige Chancen (z. B. spontane Fachmedien-Anzeige, Konferenz-Ticket) — wird **nicht** automatisch verplant | |

Diese Reserve ist explizit **kein** "übrig gelassenes" Geld wie in der CFO-Kritik am Product-Led-Entwurf — sie hat eine Regel: Sie wird nur gegen einen der oben genannten Trigger oder eine begründete Ad-hoc-Entscheidung mit dem Owner freigegeben, nie automatisch verplant.

### 2.3 CAC-Rechnung (Lücke aus dem Jury-Feedback geschlossen)

| Kanal | CAC-Mechanismus | Ziel: <177 € | Rechnung |
|---|---|---|---|
| Säule A (PR/AEO/SEO/LinkedIn) | Cash-CAC ≈ 0 € (nur Zeitkosten) | ✅ per Definition | Jeder Sale aus dieser Säule liegt unter dem CAC-Ziel, sobald die Content-Produktion steht |
| Säule C (Directories) | Cash-CAC ≈ 0 € | ✅ | analog |
| Säule B — Affiliate/Partner, Basis-Produkt (129 €) | 20 % einmalig | 25,80 € | deutlich unter 177 € |
| Säule B — Affiliate/Partner, Profi-Produkt (399 €) | 25 % einmalig | 99,75 € | unter 177 € |
| Säule B — Abo-Recurring (24,99 €/Monat bzw. 249 €/Jahr) | 20 % recurring | ~5,00 €/Monat laufend | **kein Einmal-CAC-Vergleich sinnvoll** — das ist ein laufender Margenanteil, kein Akquisekosten-Ereignis; muss gegen Bruttomarge des Abos geprüft werden, nicht gegen die 177-€-Schwelle |

**Wichtige Korrektur gegenüber dem Sieger-Entwurf (Provisionsstruktur):** Der Sieger-Entwurf setzte 30 % auf das Basis-Produkt an. Diese Synthese senkt das auf **20 % auf Basis (129 € → 25,80 €)**, **25 % auf Profi (399 € → 99,75 €)**, **20 % recurring auf Abo** — bewusst gestaffelt margenschwach/-stark, wie in den übernehmenswerten Ideen empfohlen. **Harte Abhängigkeit vor Go-Live (Woche 3, siehe Abschnitt 3):** Die tatsächlichen Stückkosten (Server-/Playwright-Laufzeit, PDF-Generierung, Support-Zeit pro Report) sind in dieser Analyse **nicht bekannt** und müssen vom Owner vor Aktivierung des Partnerprogramms gegengerechnet werden — die obigen Prozentsätze sind eine begründete Annahme, keine bestätigte Zahl. Ohne diese Prüfung wird das Partnerprogramm **nicht** live geschaltet (Kill-Gate, siehe Abschnitt 4).

---

## 3. Woche-für-Woche-Plan (W1–W13)

**Legende:** 🦊 Owner · 🤖 Claude Code · 🔗 Abhängigkeit

### Woche 1 (08.–14.07.2026) — Sofort-Start

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| PM „MLBF-Kontrollphase" bei openPR einreichen (Account + FREE-Tarif) | 🦊 (~1 h, Runbook liegt vor) | Live-PM + Backlink | fertiger Text `marketing/2026-07-08-pm-mlbf-kontrollphase.md` |
| Dieselbe PM bei inar.de + firmenpresse.de einreichen | 🦊 (~1 h) | 2 weitere Backlinks | — |
| SaaSHub-Listing live schalten (Text copy-paste-fertig) | 🦊 (~20 Min) | Live-Listing | `marketing/2026-07-08-saashub-listing-final.md` |
| G2-Listing ausfüllen (Template vorhanden) | 🤖 bereitet finalen Text auf, 🦊 trägt ein (~30–45 Min) | Live-Listing | `marketing/listings-submission-templates.md` |
| AEO-Refresh: MLBF-Prüfstrategie-Seite (bereits live) auf Q&A-Format, Schema, Freshness-Datum | 🤖 | aktualisierte Live-Seite | — |
| AEO-Restrukturierung 5–8 weitere bestehende Ratgeberseiten (H2-Fragen, 120–180-Wort-Absätze, `dateModified`) | 🤖, 🦊 Stichprobe | 5–8 überarbeitete Seiten | — |
| LinkedIn-Post #1 vorbereiten (MLBF-Kontrollphase-Einordnung, persönlicher Ton) | 🤖 Entwurf, 🦊 postet | 1 Post live | 🔗 PM |
| Review-Ask-Automation als Brevo-Draft anlegen (noch nicht scharf, da noch kaum Neukunden diese Woche) | 🤖 | Draft in Brevo | — |
| Baseline-Messung: GA/Search-Console-Zugriff vom Owner freigeben lassen | 🦊 (~15 Min) | Zugriff erteilt | notwendig für alle späteren KPI-Gates |

**Woche-1-Ziel:** Alle Quick-Wins aus fertigen Assets sind live. Keine Sales-Erwartung diese Woche — reine Sichtbarkeits-/Backlink-Woche.

### Woche 2 (15.–21.07.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Restliche bestehende Ratgeberseiten AEO-restrukturieren (Rest von ~15+) | 🤖, 🦊 Stichprobe | alle Bestandsseiten aktualisiert | — |
| Overlay-Kritik-Pillar-Artikel entwerfen (Bund+16-Länder-Stellungnahme 2022, DBSV-Warnung 2024, FTC-Strafe AccessiBe 01/2025) | 🤖 Entwurf, 🦊 rechtliche Freigabe | Artikel-Entwurf | § 6 UWG-Grenzen prüfen |
| Erste 2 Programmatic-SEO-Branchenseiten (Muster „BFSG + Branche") mit branchenspezifischem Risiko-Absatz + FAQ | 🤖, 🦊 Freigabe | 2 Live-Seiten | Pflicht-Review-Gate gegen Thin-Content |
| LinkedIn-Post #2 | 🤖 Entwurf, 🦊 postet | 1 Post live | — |
| G2/SaaSHub-Profile mit Screenshots/Funktionsbeschreibung vervollständigen | 🤖 | vollständige Profile | — |
| **KPI-Gate 1 vorbereiten** (Messung Ende Woche 2, siehe Abschnitt 4) | 🤖 | Kurzreport | — |

### Woche 3 (22.–28.07.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Overlay-Kritik-Artikel final + publizieren | 🤖, 🦊 | Live-Artikel | — |
| 2–3 weitere Programmatic-SEO-Seiten | 🤖, 🦊 Freigabe | Live-Seiten | — |
| **Stückkosten-Gegenrechnung Partnerprogramm** (Server/Playwright/Support pro Report) | 🦊 mit 🤖-Aufbereitung | bestätigte oder korrigierte Provisionssätze | 🔗 Gate vor Kanal B |
| Affiliate-Tool auswählen + Account anlegen (FirstPromoter/Rewardful/Reditus) | 🦊 (Zahlungsmittel), 🤖 (Vergleich/Konfiguration) | Tool-Account aktiv | 🔗 Stückkosten-Check muss zuerst grün sein |
| Agentur-Partnerprogramm-Landingpage (`/agentur-partner`) texten | 🤖, 🦊 Freigabe Konditionen | Entwurf fertig | 🔗 Provisionssätze bestätigt |
| LinkedIn-Post #3 | 🤖, 🦊 | 1 Post live | — |

### Woche 4 (29.07.–04.08.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Affiliate-Programm scharf schalten (Provisionslogik, Tracking-Test) | 🤖 Konfiguration, 🦊 Freigabe | Live-Programm | 🔗 Woche 3 |
| Agentur-Partnerprogramm-Landingpage live | 🤖, 🦊 | Live-Seite | — |
| Content-Stück „Wie Webagenturen die BFSG-Pflicht für Kunden lösen, ohne selbst WCAG-Experte zu werden" | 🤖 Entwurf, 🦊 Freigabe | Live-Artikel, verlinkt zur Partnerseite | — |
| Affiliate-Programm im Footer + Danke-Seite + Newsletter bewerben (Bestandskunden als erste Kohorte) | 🤖 Umsetzung | Live-Platzierung | — |
| OMR-Reviews- und Partnerfy-Listung anmelden | 🤖 vorbereitet, 🦊 verifiziert | Listungen live | — |
| 2–3 weitere Programmatic-SEO-Seiten | 🤖, 🦊 | Live-Seiten | — |
| **KPI-Gate 2** (Ende Woche 4) | 🤖 | Kurzreport | — |

### Woche 5 (05.–11.08.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Scan-Dataset-Auswertung starten (Skill `scan-dataset-aggregat`, Volumen-Check zuerst) | 🤖, 🦊 Freigabe Datenauswertung | Rohdaten-Studie | 🔗 Volumen-Check muss ausreichend sein, sonst Referenzstudien ergänzen |
| Status-Widget-Konzept entwerfen (**redesignt**: reine „Zuletzt geprüft am [Datum]"-Statuszeile, kein Siegel/Ampel/Haken) | 🤖 Entwurf, 🦊 Design-Freigabe | Mockup | 🔗 muss durch `legal-copy-grep` |
| Affiliate-Erstkohorte betreuen (Bestandskunden-Sign-ups) | 🦊 (~0,5 h) | — | — |
| LinkedIn-Post #4–5 | 🤖, 🦊 | 2 Posts live | — |
| Co-Marketing-Content-Vorlage „Rechtstexte reichen nicht" entwerfen | 🤖 | Gastbeitrags-Entwurf | — |

### Woche 6 (12.–18.08.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Scan-Dataset-PR-Meldung „1 Jahr BFSG" fertigstellen + einreichen | 🤖 Entwurf, 🦊 Freigabe + Einreichung | Live-PM #2 | 🔗 Woche 5 |
| Premium-PR-Distribution buchen (nur wenn Trigger erfüllt, siehe Budget-Tabelle) | 🦊 | ggf. gebuchte Distribution | 🔗 Backlink-Nachweis PM #1 |
| Status-Widget bauen (Embed-JS + API-Endpoint, bestehender Scanner-Stack) | 🤖 | funktionsfähiger Prototyp | — |
| IHK/Verbände-Content-Anfragen versenden (4 Stellen, **konservativ formuliert, kein Verkaufsangebot**, siehe Risiko-Register Punkt 8) | 🦊 versendet, 🤖 bereitet Entwürfe vor | 4 Anfragen raus | eigenständige Owner-Entscheidung, ob dieser Kanal überhaupt gefahren wird |
| Shopware-Blog-Pitch einreichen | 🤖 Entwurf, 🦊 Einreichung | Pitch raus | — |
| **KPI-Gate 3** (Ende Woche 6) | 🤖 | Kurzreport inkl. erste Affiliate-Zahlen | — |

### Woche 7 (19.–25.08.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Status-Widget in Post-Kauf-Mail-Flow einhängen, Testing auf 2–3 echten Kundenseiten | 🤖, 🦊 Testing/Freigabe | Live-Feature | — |
| 2–3 weitere Programmatic-SEO-Seiten | 🤖, 🦊 | Live-Seiten | — |
| Review-Ask-Automation scharf schalten (jetzt genug Neukunden-Basis) | 🤖 | Live-Automation | — |
| LinkedIn-Post #6–7 | 🤖, 🦊 | 2 Posts live | — |

### Woche 8 (26.08.–01.09.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Manuelle AI-Zitier-Stichprobe auswerten (ChatGPT/Perplexity, seit Woche 1 wöchentlich) → Entscheidung: AI-Tracking-Tool aktivieren? | 🤖 Auswertung, 🦊 Entscheidung | Go/No-Go dokumentiert | 🔗 Budget-Trigger |
| Status-Widget-Adoption prüfen (wie viele Kunden binden es ein?) | 🤖 | Kurzreport | Kill-Kriterium Abschnitt 4 |
| 2–3 weitere Programmatic-SEO-Seiten | 🤖, 🦊 | Live-Seiten | — |
| Fachmedien-Gastbeitrag Q3 einreichen (BITMi/Shopware-Blog/Shopanbieter.de, je nach Rückmeldung Woche 6) | 🤖, 🦊 | Beitrag eingereicht/live | 🔗 Woche 6 |
| **KPI-Gate 4** (Ende Woche 8, wichtigstes Gate — Monat-2-Review) | 🤖 | ausführlicher Report | — |

### Woche 9 (02.–08.09.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Trigger-Check WordPress-Plugin/Chrome-Extension (siehe Abschnitt 4) — reine Bestandsaufnahme, kein Bau-Start | 🤖 | Trigger-Report | — |
| Agentur-Partner-Gespräche führen, falls Inbound-Anfragen vorliegen | 🦊 (1–2 h) | ggf. erste Partner aktiv | 🔗 Woche 4 Landingpage |
| 2–3 weitere Programmatic-SEO-Seiten | 🤖, 🦊 | Live-Seiten | — |
| LinkedIn-Post #8–9 | 🤖, 🦊 | 2 Posts live | — |

### Woche 10 (09.–15.09.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Kill-Kriterien-Review für alle Kanäle (siehe Abschnitt 4) | 🤖 Auswertung, 🦊 Entscheidung | Dokumentierte Entscheidungen | — |
| Co-Marketing-Bundle-Idee mit kleinerem Nischen-Tool prüfen (nicht die Großen zuerst) | 🤖 Recherche, 🦊 Entscheidung | Go/No-Go | — |
| 2–3 weitere Programmatic-SEO-Seiten | 🤖, 🦊 | Live-Seiten | — |
| **KPI-Gate 5** (Ende Woche 10) | 🤖 | Kurzreport | — |

### Woche 11 (16.–22.09.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Newsletter-Sponsoring-Test prüfen (Kill-Kriterium: mind. 1 belegter Sale aus kostenlosem Kanal, siehe Budget-Tabelle) | 🦊 Entscheidung | Go/No-Go | 🔗 kumulierte Sales-Daten |
| Bei Go: Nischen-Newsletter buchen | 🦊 | gebuchter Slot | — |
| 2–3 weitere Programmatic-SEO-Seiten | 🤖, 🦊 | Live-Seiten | — |
| LinkedIn-Post #10–11 | 🤖, 🦊 | 2 Posts live | — |

### Woche 12 (23.–29.09.2026)

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Newsletter-Sponsoring-Placement (falls gebucht) | 🦊 | Live-Placement | 🔗 Woche 11 |
| Quartals-PR-Meldung #3 (Datenupdate) | 🤖 Entwurf, 🦊 Freigabe | Live-PM | — |
| Finaler Trigger-Check WP-Plugin/Extension für Monat 4 | 🤖 | Empfehlung für nächste Phase | — |
| **KPI-Gate 6** (Ende Woche 12, Monat-3-Review) | 🤖 | ausführlicher Report | — |

### Woche 13 (30.09.–06.10.2026) — Puffer & Strategie-Review

| Aufgabe | Wer | Deliverable | 🔗 |
|---|---|---|---|
| Rückstände aus W1–12 nachholen (typ. 1–2 Programmatic-Seiten, 1 Review-Antwort-Rückstand) | 🤖, 🦊 | — | — |
| Gesamt-90-Tage-Review: welche Kanäle in Q4 skalieren, welche killen | 🤖 Auswertung, 🦊 Entscheidung | Strategie-Update für Monat 4+ | alle KPI-Gates |
| Owner-Zeit-Realitäts-Check: hat sich der Stundenaufwand aus Abschnitt 3.1 bestätigt? | 🦊 | ggf. Kapazitätsanpassung | — |

### 3.1 Konsolidierter Owner-Zeit-Bedarf (adressiert Jury-Kritik „Owner-Zeit-Konflikt zwischen Kanälen")

Anders als in den Einzel-Entwürfen (die je Kanal isoliert 2–5 h/Woche ansetzen, ohne gegeneinander zu rechnen) hier die **Summe über alle vier Säulen**, verglichen mit der verfügbaren Kapazität:

| Phase | Säule A (Content/PR/LinkedIn) | Säule B (Partner/Affiliate) | Säule C (Directories) | Säule D (Widget) | **Summe/Woche** | Verfügbare Owner-Marketing-Zeit |
|---|---:|---:|---:|---:|---:|---:|
| Woche 1–2 (Setup) | 3–4 h | 0 h | 1–1,5 h | 0 h | **4–5,5 h** | 14–28 h/Woche (2–4 h/Tag) |
| Woche 3–4 (Partner-Setup) | 2–3 h | 1–1,5 h | 0,5 h | 0 h | **3,5–5 h** | — |
| Woche 5–8 (Ausbau) | 2–3 h | 1–2 h | 0,5–1 h | 0,5–1 h (nur Woche 5, 7) | **4–7 h** | — |
| Woche 9–13 (Laufbetrieb) | 2 h | 1–2 h | 0,5 h | 0 h | **3,5–4,5 h** | — |

**Ergebnis:** Selbst in der arbeitsintensivsten Phase (Woche 5–8, max. ~7 h/Woche) bleibt deutlich Puffer zur unteren Owner-Kapazitätsgrenze (14 h/Woche bei 2 h/Tag) — der Plan ist **nicht** überkommittiert, anders als die Kritik an einer naiven Kanal-für-Kanal-Summierung befürchten ließe. Der Puffer dient explizit als Reserve für Produktbetrieb/Support/Störfälle (siehe Memory: SMTP-Ausfälle, Backup-Lücken kamen vor) — nicht für zusätzliche Marketing-Kanäle.

---

## 4. KPI-Gates alle 2 Wochen + Kill-/Pivot-Kriterien je Kanal

> **Wichtiger Vorbehalt zu allen Korridoren:** Es liegt keine GA-/Search-Console-Baseline vor (Woche-1-Aufgabe schließt diese Lücke für zukünftige Gates). Die folgenden Korridore sind **Richtwerte**, konservativ aus den zitierten Case Studies abgeleitet (`entwurf-authority-aeo.md` Abschnitt 6, `entwurf-product-led.md` Trajektorie-Tabelle, `entwurf-partner-channel.md` Teil 6) und **um Doppelzählungen bereinigt**, keine belastbaren Prognosen. Zahlen der Gesamt-Unternehmenstrajektorie stammen aus dem Business-Kontext-Zielkorridor ("14 Tage: 2–6 Sales; Monat 3: 8–15 Sales/Monat").

### 4.1 KPI-Korridore

| Gate | Zeitpunkt | Website-Traffic (Sessions/Woche, Zuwachs) | Gratis-Scans/Leads (Zuwachs/Woche) | Sales (kumuliert seit Start) | MRR (Abo) |
|---|---|---:|---:|---:|---:|
| **Gate 1** | Ende W2 (21.07.) | +5–15 % ggü. Baseline | +1–5 | 0–2 | 0–25 € |
| **Gate 2** | Ende W4 (04.08.) | +10–25 % | +5–15 | 2–6 | 25–75 € |
| **Gate 3** | Ende W6 (18.08.) | +15–35 % | +10–25 | 3–8 | 50–125 € |
| **Gate 4** | Ende W8 (01.09.) | +20–50 % | +20–40 | 5–12 | 100–250 € |
| **Gate 5** | Ende W10 (15.09.) | +30–70 % | +25–55 | 7–16 | 175–375 € |
| **Gate 6** | Ende W12 (29.09.) | +40–100 % | +35–80 | 8–15/Monat (laufend) | 250–500 € |

**Warum die Korridore so breit sind:** Ohne Baseline ist jede engere Spanne falsche Präzision. Enger werden die Korridore erst ab Gate 3, sobald echte Such-Console-Daten vorliegen — dann wird diese Tabelle mit Ist-Werten neu kalibriert, nicht stur fortgeschrieben.

### 4.2 Kill-/Pivot-Kriterien je Kanal

| Kanal | Kill-/Pivot-Kriterium | Konsequenz |
|---|---|---|
| **PR (Säule A)** | 0 Backlinks/Erwähnungen aus PM #1+#2 zusammen bis Gate 3 (W6) | Keine weitere Premium-Distribution buchen, nur kostenlose Basistarife weiterlaufen lassen |
| **Programmatic-SEO** | <20 organische Sessions/Monat auf neuen Branchenseiten bis Gate 4 (W8) | Neue Seitenproduktion pausieren, stattdessen technisches SEO-Audit (Indexierung, Crawling) vor Fortsetzung |
| **AEO/AI-Zitierungen** | 0 nachweisbare Zitierungen in manuellen Stichproben bis Gate 4 (W8) | Kein AI-Tracking-Tool aktivieren (Budget bleibt bei 0 €), Fokus zurück auf klassisches SEO |
| **Affiliate-Programm** | <3 aktive Affiliates bis Gate 4 (W8) | Tool-Abo kündigen (~49 €/Monat sparen), zurück auf manuelles Tracking oder Kanal ruhen lassen |
| **Agentur-Partnerprogramm** | 0 Inbound-Partner-Sign-ups bis Gate 5 (W10) | Kein weiterer Content-Aufwand, Landingpage bleibt passiv online, kein aktives Nachfassen |
| **IHK/Verbände** | Keine Rückmeldung von allen 4 Stellen bis Gate 3 (W6) | **Nicht nachfassen** (vermeidet Nähe zu Drängeln/Cold-Outreach-Optik), als „ruhend" markieren, frühestens Q4 2026 erneut prüfen |
| **LinkedIn-Founder-Content** | <500 Impressionen/Post im Schnitt über 8 Posts (Gate 4, W8) | Kadenz auf 1×/2 Wochen senken, Zeit zu Programmatic-SEO umschichten |
| **Status-Widget (Säule D)** | <5 Kunden binden das Widget bis Gate 5 (W10) ein | Keine Weiterentwicklung (keine Live-Status-Erweiterung), bestehende Version bleibt einfach online |
| **Newsletter-Sponsoring** | Kein belegter Sale aus einem kostenlosen Kanal bis Monatsende 2 | Test entfällt ersatzlos, Budget bleibt Reserve |
| **WordPress-Plugin** | Bau erst bei **2 von 3**: (a) Status-Widget auf ≥15 Kundenseiten aktiv, (b) ≥5 unaufgeforderte Nutzeranfragen nach Plugin, (c) Affiliate-/Partner-Kanal liefert bereits ≥10 Sales/Monat (Kapazitäts-Freigabe) | Vor Erreichen: kein Entwicklungsstart |
| **Chrome-Extension** | Bau erst bei **2 von 3**: (a) Status-Widget auf ≥15 Kundenseiten, (b) WordPress-Plugin ≥50 Installs, (c) ≥5 unaufgeforderte Nutzeranfragen | Vor Erreichen: kein Entwicklungsstart |
| **Gesamtstrategie (Reißleine)** | Sales kumuliert <2 bis Gate 4 (W8) trotz vollständig umgesetzter Woche 1–8-Aufgaben | Vollständiger Strategie-Review mit Owner: Funnel-Konversion (DOI-Rate, Nurture-Öffnungsraten) prüfen, bevor weitere Kanäle skaliert werden — Ursache könnte am Funnel liegen, nicht an den Kanälen |

---

## 5. Quick-Wins der ersten 7 Tage (fertige Assets nutzen)

Diese Aufgaben brauchen **keinen** neuen Content — nur Freischaltung/Einreichung bereits fertiger Assets:

1. **PM „MLBF-Kontrollphase" bei openPR/inar/firmenpresse einreichen.** Text + Einreichungs-Runbook liegen vollständig vor (`marketing/2026-07-08-pm-mlbf-kontrollphase.md`, `marketing/2026-07-08-pm-einreichung-runbook.md`). Reine Owner-Ausführung, ca. 2 h für alle 3 Portale. Kostenlos.
2. **SaaSHub-Listing live schalten.** Copy-paste-fertiger Text vorhanden (`marketing/2026-07-08-saashub-listing-final.md`), dofollow-Backlink laut Synthese (Finding 19-Kontext) besonders wertvoll. ~20 Minuten.
3. **G2-Listing ausfüllen.** Template vorhanden (`marketing/listings-submission-templates.md`), Account bereits frisch angelegt laut Business-Kontext. ~30–45 Minuten.
4. **MLBF-Prüfstrategie-Seite AEO-aktualisieren.** Seite ist bereits live (`landingpage-next` Route `mlbf-pruefstrategie`) — nur Freshness-Datum, Q&A-Struktur und Schema-Markup nachziehen, kein Neubau.
5. **Erster LinkedIn-Post zur MLBF-PM.** Direkt an die PR-Meldung gekoppelt, maximale thematische Aktualität in der ersten Woche.

**Bewusst nicht in dieser Woche:** Affiliate-Programm, Partnerprogramm-Landingpage, Status-Widget — diese brauchen die Stückkosten-Klärung (Woche 3) bzw. Konzeptarbeit (Woche 5) und würden die Sieben-Tage-Frist nur mit unfertiger Qualität erzwingen.

---

## 6. Risiken-Register

| # | Risiko | Gegenmaßnahme |
|---|---|---|
| 1 | **Thin-Content-Abwertung** bei Programmatic-SEO-Seiten ohne echten Mehrwert (Google Helpful-Content-Update) | Pflicht-Review-Gate: eigener Risiko-Absatz + eigene FAQ + Datenbezug pro Seite, keine Variable-Swap-Vorlage; Owner-Stichprobenfreigabe vor jeder Publikation |
| 2 | **UWG-Risiko bei Vergleichsaussagen** (§ 6 UWG) in Wettbewerbsvergleichen (z. B. AccessiWay-Positionierung, Overlay-Kritik) | Nur objektiv messbare, quellenbelegte Kriterien, keine Herabsetzung; Pflicht-Sprache aus `docs/legal-templates/disclaimer-footer.md`; jeder Text vor Publikation durch `legal-copy-grep`-Skill |
| 3 | **Provisions-/CAC-Fehlkalkulation:** angenommene Stückkosten für das Partnerprogramm könnten von der Realität abweichen und die Marge drücken | Harte Abhängigkeit: Partnerprogramm geht **erst** nach Owner-Stückkosten-Gegenrechnung (Woche 3) live, nicht vorher — kein Soft-Launch mit unbestätigten Zahlen |
| 4 | **Owner-Zeit-Überkommittierung** durch parallel laufende Kanäle | Konsolidierte Wochenstunden-Tabelle (Abschnitt 3.1) zeigt Puffer zur Kapazitätsgrenze; bei Abweichung in Woche 13 Kapazitäts-Realitäts-Check |
| 5 | **Affiliate-Kennzeichnungspflicht** (UWG/TTDSG) — fehlerhafte Link-Kennzeichnung ist abmahnfähig, nicht nur Empfehlung | Kennzeichnungspflicht („Werbung"/„Anzeige" direkt am Link) vertraglich in jeden Partnervertrag; Datenschutzerklärung vor Launch um Tracking-Partner-Hinweis ergänzen; `legal-copy-grep`-Skill um Partner-Content erweitern |
| 6 | **IHK-Direktanfrage bleibt rechtliche Grauzone**, trotz „Funktionsadresse"-Argumentation (Jury-Kritik: könnte von einer Wettbewerbszentrale anders bewertet werden als hier angenommen) | Kanal bewusst niedrig priorisiert (Prio 5, optional), keine Eskalation/kein Nachfassen bei Nichtantwort, kurze sachliche Anfrage mit klarem Content-/Kooperationsbezug statt Verkaufsabsicht; bei Unsicherheit vor Versand kurze Rückfrage an Anwalt aus dem Trigger-Kalender (`docs/LEGAL-REALITY-CHECK-2026.md`) |
| 7 | **Status-Widget als verdecktes Gütesiegel missverstanden** (UWG-Irreführungsrisiko, analog FTC-Strafe gegen AccessiBe, 01/2025) | Bewusst **kein** Ampel-/Haken-/Siegel-Design, sondern reine „Zuletzt geprüft am [Datum]"-Statuszeile ohne Zertifizierungs-Optik; Copy läuft vor Launch durch `legal-copy-grep`-Skill; niemals „barrierefrei" oder „konform" im Widget-Text |
| 8 | **Wettbewerbsdruck** (eRecht24-Bestandsreichweite, AccessGO-PR-Aktivität, AccessiWay-Partnerprogramm) besetzt ähnliche Themen bereits | Differenzierung konsequent über eigene Scan-Datenpunkte (kein Wettbewerber hat vergleichbares Datenvolumen) und KMU-/Kleinagentur-Preissegment statt Themen-Breite |
| 9 | **Zeitverzug bis Wirkung** — SEO/AEO/Partner brauchen laut allen drei Entwürfen 6–12+ Wochen für spürbare Sales-Beiträge; Risiko vorzeitigen Abbruchs durch Owner-Ungeduld | Quick-Wins (Abschnitt 5) liefern bereits Woche 1 sichtbare, wenn auch kleine Fortschritte; KPI-Gates (Abschnitt 4) sind der vereinbarte Bewertungsrhythmus, nicht tägliche/wöchentliche Ad-hoc-Urteile |
| 10 | **Fehlende Baseline-Daten** (kein GA-/Search-Console-Zugriff bei Planerstellung) — alle KPI-Korridore sind Richtwerte | Woche-1-Aufgabe: Owner gibt Zugriff frei; Korridore werden ab Gate 3 mit echten Ist-Daten neu kalibriert |
| 11 | **Zu geringes Scan-Volumen** für glaubwürdige Scan-Dataset-PR-Studie | Vor Publikation Volumen-Check via Skill `scan-dataset-aggregat`; bei zu geringem Eigenvolumen mit öffentlich zugänglichen Referenzstudien kombinieren, als Kombi-Quelle kennzeichnen |
| 12 | **GEO/AI-Zitier-Tracking ist eine junge, instabile Messkategorie** — Tools und Zitierlogik können sich ändern | Kein Tool-Invest vor Gate 4 (siehe Budget-Trigger); danach nicht auf eine einzelne Metrik verlassen, sondern Search Console + manuelle Stichproben + Directory-Referral-Traffic parallel messen |
| 13 | **Newsletter-Sponsoring verbrennt Budget ohne Konversionsnachweis** | Kill-Kriterium (Abschnitt 4): nur bei mind. 1 belegtem Sale aus kostenlosem Kanal, sonst entfällt der Test ersatzlos |

---

## Anhang: Was aus dieser Synthese bewusst NICHT übernommen wurde (mit Begründung)

- **30 % Provision auf Basis-Produkt** (Sieger-Entwurf-Original) → auf 20 % gesenkt, siehe Abschnitt 2.3.
- **AI-Zitier-Tracking-Tool ab Tag 1** (90 €/Monat, aus `entwurf-authority-aeo.md`) → auf Trigger nach Gate 4 verschoben, siehe Budget-Tabelle 2.2.
- **Score-Badge als Siegel/Ampel-Design** (aus `entwurf-product-led.md`) → zu „Zuletzt geprüft am [Datum]"-Statuszeile redesignt, siehe Risiko 7.
- **WordPress-Plugin und Chrome-Extension im 90-Tage-Kernplan** (aus `entwurf-product-led.md`) → bleiben trigger-basiert außerhalb des Plans, siehe Abschnitt 4.2.
- **Freelance-Fact-Checking-Budget fix eingeplant** (180 €/Monat, aus `entwurf-authority-aeo.md`) → nur bei nachgewiesenem Bedarf (>5 Seiten/Monat), siehe Budget-Tabelle 2.2.
