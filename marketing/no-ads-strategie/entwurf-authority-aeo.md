# Strategie-Entwurf: Content-Authority + AEO — BFSG-Fuchs

**Erstellt:** 08.07.2026 · **Blickwinkel:** Senior-Growth-Stratege, Schwerpunkt Content-Authority + Answer-Engine-Optimization (AEO/GEO)
**Grundlage:** `marketing/no-ads-strategie/synthese.md` + Research-Reports `seo-aeo-geo.md`, `distribution-as-product.md`, `wettbewerber-teardown.md` (alle Stand 08.07.2026)
**Rahmen:** Solo-Founder, ~600 €/Monat freies Budget, Google/Microsoft Ads dauerhaft gesperrt, harte UWG-Verbote (kein Cold-Outreach, keine Fremd-DMs, keine "BFSG-konform"-Werbung)

---

## 1. Positionierung / Story

**These:** BFSG-Fuchs wird nicht die x-te Scanner-Website unter zehn fast identischen Wettbewerbern (Finding 13, Synthese), sondern **die Quelle, die sowohl Menschen als auch KI-Suchsysteme zitieren, wenn es um BFSG-Pflichten in Deutschland geht** — belegt mit eigenen Daten statt mit Behauptungen.

Drei tragende Elemente:

1. **Beweis statt Behauptung.** Der Gratis-Scan-Mechanismus ist Kategorie-Standard geworden (Finding 13) — kein Differenzierungsmerkmal mehr. Was kein Wettbewerber hat: anonymisierte Auswertungen aus den eigenen Scan-Ergebnissen (Skill `scan-dataset-aggregat`). "Die 10 häufigsten WCAG-Verstöße auf deutschen KMU-Websites (Auswertung von N Scans)" ist ein zitierfähiges Asset, das eRecht24 und AccessGO so nicht bieten — beide verkaufen Meinung, wir liefern Messwerte.
2. **Aktualität als Vorsprung.** Die MLBF-Kontrollphase (seit 05.01.2026) und Abmahnwelle 2 (seit Februar 2026) sind laut Finding 8 (seo-aeo-geo) exakt der Content-Typ, den KI-Suchsysteme bevorzugt zitieren, wenn er regelmäßig aktualisiert wird (+28 % Zitierungen bei <2 Monate altem Content). Statischere Wettbewerber-Inhalte haben diesen Vorteil nicht automatisch. Wir pflegen bestehende MLBF-/Abmahn-Seiten aktiv, statt nur neue anzulegen.
3. **Filo als Gesicht, nicht als Gimmick.** Die Higgsfield-Videos (kostenfreie Credits) transportieren dieselben Datenpunkte in Kurzform für YouTube/Shorts/LinkedIn — nicht als Werbespot, sondern als "Erklärstück zur aktuellen Rechtslage". Zweck: Marken-Suchvolumen erhöhen, das laut Finding 1 (seo-aeo-geo) der stärkste Einzelprädiktor für KI-Markenempfehlungen ist (Korrelation 0,334).

**Kurzformel:** *Nicht mehr Content produzieren als die anderen — belegbareren Content produzieren, aktueller halten als die anderen, und ihn dahin bringen, wo KI-Systeme tatsächlich zitieren (Directories, Reviews, strukturierte Antworten), nicht nur dahin, wo Google klassisch rankt.*

---

## 2. Kern-Kanäle mit konkreten Taktiken

### Kanal 1 — Programmatic-SEO-Ausbau (Branchen × Pflicht-Cluster)
**Rolle:** Traffic-Skalierungsmotor, mittelfristig.

- Muster "[Pflicht] + [Branche] + [Kontext]" nach Finding 6 (seo-aeo-geo): z. B. "BFSG für Zahnarztpraxen", "BFSG für Steuerkanzleien", "BFSG für Online-Shops in Bayern" — verankert an den bestehenden ~21 Landingpage-Routen (`landingpage-next/app/`) als Pillar-Struktur.
- **Pflicht pro Seite (kein Variable-Swap):** ein branchenspezifischer Risiko-Absatz (typische Fehlerquellen dieser Branche laut eigenen Scan-Daten), eine branchenspezifische FAQ, ein Abmahnkosten-Bezug — sonst straft Google Helpful-Content-Update thin/templatete Seiten ab (explizit in Finding 6 gewarnt).
- Priorisierung nach echtem Suchvolumen (nicht nach Bauchgefühl) — Long-Tail-Keywords mit geringem, aber nicht-null Volumen ranken schneller als Head-Terms.
- Jede Seite bekommt einen kontextuellen Gratis-Scan-CTA ("Prüfen Sie jetzt Ihre Zahnarztpraxis-Website"), nicht den generischen Homepage-CTA — erhöht Funnel-Relevanz.
- Kadenz: 3–5 neue Seiten/Monat, von Claude entworfen, vom Owner fachlich/rechtlich freigegeben (§ 6 UWG-Grenzen bei Vergleichsaussagen beachten).

### Kanal 2 — AEO/GEO-Content-Engineering (bestehende + neue Seiten)
**Rolle:** Zitier-Wahrscheinlichkeit in ChatGPT/Perplexity/AI-Overviews erhöhen — unabhängig vom klassischen Google-Ranking (Finding 7: nur 17–38 % Overlap zwischen Google-Top-10 und AI-Overview-Zitaten).

- Jede H2 als Frage formulieren, Direktantwort <60 Wörter sofort danach (bevorzugtes Extraktionsmuster, Finding 3).
- Abschnittslänge 120–180 Wörter zwischen Überschriften (+70 % Zitierungen laut Studienlage).
- Vergleichstabellen statt Fließtext, wo sachlich möglich (z. B. "WCAG 2.1 AA-Kriterium vs. typischer Umsetzungsfehler") — 2,5× mehr Zitierungen.
- Schema-Markup gezielt, nicht flächendeckend: `SoftwareApplication` auf der Produkt-/Landingpage, `FAQPage` auf Ratgeberseiten (Finding 4) — `llms.txt` existiert bereits (`landingpage-next/public/llms.txt`), aber laut Finding 2 ohne belegten Zitier-Effekt (97 % der Dateien erhalten keine Anfragen) → nur pflegen, wenn ohnehin am Code gearbeitet wird, keine eigene Priorität.
- Statistiken/Quellenangaben/Experten-Einschätzung (vom Owner, nicht generisch) einbauen — Quellenangaben bringen bei Seiten mittlerer Autorität +115 % Sichtbarkeit (Finding 9).
- `dateModified` konsequent pflegen; MLBF-/Abmahnwelle-Seiten monatlich mit neuen Zahlen refreshen statt neue Duplikate anzulegen.

### Kanal 3 — Digitale PR & eigene Daten-Studien
**Rolle:** Backlink-Aufbau + zeitkritische Themenführerschaft + PR-Hook für Kanal 4.

- Monatliche PR-Meldung über openPR/firmenpresse/PresseBox (kostenlose Basisversion, 1× Premium-Distribution/Monat aus Budget), jeweils an einen eigenen Datenpunkt gekoppelt: "1 Jahr BFSG-Pflicht: Auswertung von N automatisierten Scans zeigt die 5 häufigsten Verstöße" (Skill `scan-dataset-aggregat` liefert die Rohbasis, strikt anonymisiert, keine Kunden-URLs).
- Direktes Gegenstück zu AccessGO's "1-Jahr-BFSG"-PR (30.06.2026, Finding 19) — wir liefern Messdaten statt Meinungsstück, das ist der Differenzierungspunkt.
- Zusätzlich: das "Overlay funktioniert nicht"-Cluster besetzen (Finding 15, Synthese) — ein Pillar-Artikel gestützt auf Bund+16-Länder-Stellungnahme (2022), DBSV-Warnung (2024), FTC-Strafe gegen AccessiBe (Januar 2025) — bisher unbesetzte Lücke bei uns, während mehrere Wettbewerber dort bereits ranken.
- Ein Fachmedien-Gastbeitrag pro Quartal (Zielmedien: BITMi, Shopware-Blog, Shopanbieter.de) als dauerhafter Backlink + Trust-Signal (Finding 5, Synthese).
- Filo-Video als PR-Begleitmaterial: jede Daten-Studie bekommt eine 60–90-Sek.-Higgsfield-Erklärvideo-Version für YouTube Shorts/LinkedIn — kostet nahezu nichts (Guthaben vorhanden), erhöht Teilbarkeit der PR-Meldung.

### Kanal 4 — Off-Site-Autorität (Directories, Reviews, organische Reddit/LinkedIn-Präsenz)
**Rolle:** Trust-Signal + Zitier-Multiplikator — laut Finding 1 (seo-aeo-geo) der **stärkste** Einzelhebel (41 % Gewichtung autoritative Listen-Erwähnungen), stärker als zusätzlicher On-Site-Content.

- Vorhandene G2-/SaaSHub-Profile vervollständigen, aktiv 3–4 echte 5-Sterne-Reviews/Monat einsammeln (Post-Kauf-E-Mail via Brevo-Automation), jede kritische Review persönlich beantworten.
- Platzierung in "Beste Accessibility-Tools Deutschland"-Listen anfragen (0-Cash, E-Mail-Anfrage an Listen-Betreiber ist keine Cold-Outreach im UWG-Sinn, da B2B-Content-Kooperation, kein Werbe-Ansprache an Privatperson — im Zweifel Wortlaut vom Owner gegenlesen lassen).
- Organische, deklarierte Beiträge (Disclosure "Ich bin der Gründer") in thematisch passenden Threads (r/de, r/Selbstständig, Agentur-Foren), wenn sich die Gelegenheit ergibt — **kein aktiver Community-Aufbau**, da laut Synthese die DACH-B2B-Zielgruppe dort schwach vertreten ist; Zweck ist ausschließlich das GEO-Signal (~4× höhere ChatGPT-Zitierwahrscheinlichkeit bei Reddit/Quora-Präsenz, Finding 5).
- LinkedIn-Founder-Content, 1–2 Posts/Woche, organisch, MLBF-/Abmahnwelle-Themen mit persönlicher Einordnung des Owners (LinkedIn treibt laut Finding 5 ~11 % aller KI-Zitierungen).

---

## 3. Funnel-Logik: Traffic → Gratis-Scan → Kauf → Abo

```
Programmatic-SEO-Seite / AEO-optimierte Ratgeberseite / PR-Backlink / AI-Zitat
                    │
                    ▼
   Kontextueller Gratis-Scan-CTA (branchenspezifisch, nicht generisch)
                    │
                    ▼
        Score + Teaser + E-Mail (Double-Opt-in, bestehender Mechanismus)
                    │
                    ▼
     Brevo-Nurture-Automation (Welcome/Nurture, bereits vorhanden)
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   Kauf: Basis 129 €      Kauf: Profi 399 € / Cookie-Checks
   (Direktkauf-CTA in    (Upsell aus Report-Flow /
    Nurture-Sequenz)      Multi-Page-Bedarf)
        │                       │
        └───────────┬───────────┘
                     ▼
         Re-Check-Abo (24,99 €/Monat oder 249 €/Jahr)
         Trigger: 14-Tage-Post-Kauf-Check (Skill `upsell-trigger`)
```

**Zwei Besonderheiten dieses Kanals gegenüber dem bisherigen Funnel:**

1. **Daten-Studien wirken doppelt** — als PR-/Backlink-Hook (Kanal 3) UND als eigenständige Landingpage, die selbst konvertiert (Vertrauen durch Messwerte statt Marketing-Sprache).
2. **Jede Programmatic-Seite braucht einen eigenen CTA-Kontext.** Ein Besucher auf "BFSG für Zahnarztpraxen" soll nicht denselben CTA sehen wie auf der Homepage — das ist der Unterschied zwischen einer echten Programmatic-Seite und einer thin Variable-Swap-Seite (siehe Kanal 1).

---

## 4. Budget-Allokation (600 €/Monat)

| Position | Kanal-Bezug | €/Monat | Begründung |
|---|---|---:|---|
| AI-Zitier-Tracking (z. B. Otterly.AI / Peec AI, Einstiegs-Tier) | Kanal 2 + 4 (Messung) | 90 € | Ohne Tracking kein Beleg, ob AEO/GEO überhaupt wirkt — Google-Ranking und KI-Zitierung sind laut Finding 7 nur zu 17–38 % deckungsgleich, brauchen getrennte Messung |
| SEO-/Keyword-Tool für Cluster-Priorisierung | Kanal 1 | 129 € | Verhindert Produktion nach Bauchgefühl; entfällt, sobald der vorhandene Ahrefs-MCP-Connector vom Owner autorisiert ist (dann Position auf 0 € reduzierbar) |
| Premium-PR-Distribution (1×/Monat, Basisversionen bei openPR/firmenpresse bleiben kostenlos) | Kanal 3 | 100 € | Erhöht Reichweite für zeitkritische Meldungen (MLBF-Kontrollphase, Abmahnwelle 2) |
| Freelance-Unterstützung Content-Produktion (Fact-Checking/Korrektorat, ca. 6–8 h) | Kanal 1 + 2 | 180 € | Solo-Founder-Zeit ist der eigentliche Engpass; externe Qualitätssicherung senkt das Thin-Content-Risiko bei Skalierung auf 3–5 Seiten/Monat |
| Puffer (Directory-Premium-Listing, kleiner Nischen-Newsletter-Test, Preispuffer) | flexibel | 101 € | Nur bei Bedarf abrufen, keine Fixbindung |
| **Summe** | | **600 €** | |

Die 25 €/Monat aus dem bestehenden Tool-Budget (AGB-Generator, Buchhaltung) sind hiervon unabhängig und bereits an anderer Stelle verplant (siehe `CLAUDE.md`).

---

## 5. Aufwandsplan (h/Woche)

| Rolle | Aufwand | Tätigkeiten |
|---|---|---|
| **Owner (Matthias)** | 2–3 h/Woche | Fachliche/rechtliche Freigabe neuer Seiten (§ 6 UWG-Grenzen), echte Zitate/Experteneinschätzungen liefern (Finding 9: Experten-Zitate +37 % Sichtbarkeit — das kann Claude nicht authentisch faken), PR-Rückfragen beantworten, LinkedIn-Posts final autorisieren/posten, GEO-Tracking-Tool-Reports einmal/Woche querlesen |
| **Claude** | 6–10 h/Woche (Session-Äquivalent) | Programmatic-Seiten entwerfen, AEO-Restrukturierung bestehender Seiten, Schema-Markup umsetzen, PR-Texte + Daten-Studien aus Skill `scan-dataset-aggregat` aufbereiten, Perplexity-Recherche für Aktualität/Quellenbelege, Directory-Profile pflegen, Higgsfield-Video-Skripte für Filo erstellen |

**Kritischer Pfad:** Der Owner ist Flaschenhals bei Freigabe + Experten-Zitaten, nicht bei Produktion. Batching (mehrere Seiten/Woche gesammelt zur Freigabe) hält den Owner-Aufwand im 2–3 h-Rahmen.

---

## 6. Erwartete Lead-/Sales-Trajektorie (nur dieser Kanal-Beitrag)

**Wichtiger Vorbehalt:** Es liegen in dieser Analyse keine Google-Search-Console-/GA-Baseline-Daten vor — alle Zahlen sind Richtwerte, konservativ herunterskaliert aus den zitierten Case Studies (die für deutlich größere, besser ressourcierte Teams über längere Zeiträume gelten), nicht Prognosen. Empfehlung: Owner gibt Search-Console-/GA-Zugriff frei, um echte Baseline + Ist-Tracking zu ermöglichen.

| Zeitpunkt | Was ist live | Leads/Woche (Zuwachs, Schätzung) | Sales/Monat (kumulierter Beitrag dieses Kanals, Schätzung) | Begründung |
|---|---|---:|---:|---|
| **Woche 2** | 1 PR-Meldung + Higgsfield-Video live, 5–8 bestehende Seiten AEO-refresht, GEO-Tracking-Baseline gemessen | +1–3 | 0–1 | SEO/AEO-Effekte brauchen laut Finding 8 mindestens 4–8 Wochen, um sichtbar zu werden. Frühe Sales in dieser Phase stammen überwiegend aus bereits bestehendem organischem Bestand, nicht aus neuer Arbeit — dieser Kanal liefert in Woche 2 primär Backlinks/Reichweite, keine Sales |
| **Woche 4** | Alle ~21 bestehenden Seiten AEO-umgebaut, 3–5 neue Programmatic-Seiten indexiert (noch nicht rankend), 2. PR-Meldung, 5–8 neue Reviews eingesammelt | +5–10 | 1–3 (kumulativ) | Freshness-Effekt (+28 % Zitierungen bei <2-Monate-Content, Finding 8) beginnt bei bestehenden Seiten zu wirken; neue Programmatic-Seiten liefern noch keinen Traffic (Google-Indexierung + erstes Ranking dauert typischerweise 4–8 Wochen) |
| **Woche 8** | 10–15 neue Programmatic-Seiten live, erste beginnen für Long-Tail-Begriffe zu ranken, 15+ Reviews auf G2/SaaSHub, erste AI-Zitierungen im Tracking-Tool messbar, 1 Fachmedien-Gastbeitrag | +15–30 | 3–6 (kumulativ) | Long-Tail-Rankings setzen typischerweise ab Monat 2 ein; Off-Site-Autorität (Kanal 4) beginnt laut Finding 1 zu wirken, da Review-/Directory-Aufbau seit Woche 1 läuft |
| **Woche 12** | 20–30 neue Programmatic-Seiten (Cluster reift), Overlay-Pillar-Artikel + 3. PR-Meldung live, Marken-Suchvolumen messbar gestiegen (Filo-Video-Distribution), AI-Zitierrate im Tracking-Tool etabliert | +30–60 | 6–12 (kumulativ) | Entspricht dem Größenordnungs-Zeitfenster der zitierten Case Studies (Omnius: signifikanter Sprung erst nach Monat 3, nicht Monat 1); dieser Kanal wäre bei Erreichen der oberen Spanne der Haupttreiber für das übergeordnete Monat-3-Ziel von 8–15 Sales/Monat |

**Einordnung:** Dieser Kanal ist bewusst kein Schnellstarter — er ist der **Compounding-Hebel**, der ab Monat 2–3 überproportional zu tragen beginnt (deckt sich mit der "sehr hoch"-Compounding-Bewertung von Kanal 1 in der Synthese-Shortlist). Für die ersten 14 Tage nach Umsetzungsstart liefert er primär Backlinks/Reichweite, nicht Sales — schnelle erste Sales müssen aus anderen, bereits vorhandenen Quellen kommen (bestehender organischer Bestand, Directory-Traffic).

---

## 7. Top-Risiken + Gegenmaßnahmen

| # | Risiko | Gegenmaßnahme |
|---|---|---|
| 1 | **Thin-Content-Abwertung.** Programmatic-Seiten ohne echten Mehrwert werden von Google-Helpful-Content-Updates abgestraft (explizit in Finding 6 gewarnt) | Pflicht-Review-Gate vor jeder Publikation: eigener Risiko-Absatz + eigene FAQ + Datenbezug pro Seite, keine reine Variable-Swap-Vorlage; Freelance-Fact-Checking-Budget (Position 4, Budget-Tabelle) als zweite Kontrolle |
| 2 | **UWG-Risiko bei Vergleichstabellen/Wettbewerbervergleichen** (§ 6 UWG vergleichende Werbung) | Nur objektiv messbare, quellenbelegte Kriterien (WCAG-Kriterien, Bußgeldrahmen), keine Herabsetzung von Wettbewerbern; Pflicht-Sprache aus `docs/legal-templates/disclaimer-footer.md` konsequent verwenden; Owner-Freigabe vor Publikation |
| 3 | **GEO ist eine junge, instabile Messkategorie.** Zitierlogik von ChatGPT/Perplexity kann sich ändern, Tracking-Tools selbst sind neue Produktkategorie mit Ungenauigkeiten | Nicht auf eine einzelne KPI-Quelle verlassen — Google Search Console (klassisches Ranking), AI-Zitier-Tool (GEO) und Directory-Referral-Traffic parallel messen; Entscheidungen erst bei über mehrere Wochen konsistentem Trend treffen |
| 4 | **Wettbewerbsdruck.** eRecht24 (Bestandsreichweite) und AccessGO (aktive PR-Strategie, eigenes Overlay-Cluster) besetzen ähnliche Themen bereits (Finding 13/15/19) | Differenzierung konsequent über eigene Scan-Datenpunkte (kein Wettbewerber hat vergleichbares Datenvolumen) und Branchen-Tiefe (Programmatic-Cluster), nicht über Themen-Breite konkurrieren |
| 5 | **Zeitverzug bis Wirkung** (SEO/AEO braucht laut Trajektorie 8–12+ Wochen für spürbare Sales-Beiträge) — Risiko, dass der Kanal vor Wirkung als "funktioniert nicht" abgebrochen wird | Sofort-Priorität-Quick-Wins parallel fahren (PR-Meldung, AEO-Refresh bestehender Seiten, Review-Sammlung) — liefern bereits in Woche 2–4 sichtbare, wenn auch kleine Fortschritte, damit der Kanal nicht isoliert an Sales-Zahlen von Woche 2 gemessen wird |
| 6 | **Zu geringes Scan-Volumen für glaubwürdige Daten-Studien.** Eine "Top-10-Fehler"-Studie mit zu wenigen Scans wirkt nicht zitierfähig, sondern beliebig | Vor jeder Studien-Publikation Volumen-Check via Skill `scan-dataset-aggregat`; bei zu geringem Eigenvolumen mit öffentlich zugänglichen Referenzstudien (z. B. WebAIM Million-Analog-Studien) kombinieren, bis Eigenvolumen ausreicht |
| 7 | **Fehlende Baseline-Daten für diese Analyse** (kein GA-/Search-Console-Zugriff) — alle Trajektorie-Zahlen in Abschnitt 6 sind Richtwerte, keine belastbaren Prognosen | Owner gibt Search-Console-/GA-Zugriff frei (Skill-Loading, keine Kosten); danach Trajektorie mit echter Baseline neu kalibrieren statt auf Case-Study-Analogien zu vertrauen |

---

## 8. Nicht in diesem Entwurf vertieft (bewusst ausgeklammert)

- **Agentur-/White-Label-Partnerprogramm (Kanal #9, Synthese-Shortlist)** — eigener Vertriebs-, nicht Content-/AEO-Kanal; siehe Synthese Teil 3.
- **WordPress-Plugin / BFSG-Score-Badge** — Distributions-, nicht primär Authority-Kanal; unterstützt diesen Entwurf nur indirekt (jede Kundenseite mit Badge = zusätzlicher Backlink für Kanal 4), aber eigener Bau-Aufwand außerhalb dieses Auftrags.
- **Chrome-Extension** — laut Synthese explizit zurückgestellt bis Traktion von leichteren Assets vorliegt, kein Bestandteil dieses Kanal-Fokus.
