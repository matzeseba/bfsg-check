# Scaled-Content-Plan: Finale Entscheidung + Umsetzung (Mass-Content-Frage BFSG-Fuchs)

> Rolle: Head of Growth (finale Synthese, korrigiert durch adversariale Skeptiker-Prüfung). Stand: 09.07.2026.
> Grundlage: `urteil.md` + `machbarkeit-daten.md` + `machbarkeit-risiko.md` + `machbarkeit-technik.md` + `research/*.md` (alle 09.07.2026) — plus eine Skeptiker-Runde, die 19 konkrete Schwachstellen im ursprünglichen Urteil identifiziert hat. Diese Datei korrigiert das Urteil an den Stellen, wo der Skeptiker recht hatte, statt es unverändert zu übernehmen. Bestehender `90-tage-plan.md` wurde gelesen, nicht verändert.
> Keine neue Web-Recherche in diesem Dokument — reine Synthese/Korrektur der vorliegenden, bereits Perplexity-recherchierten Befunde. Keine Erfolgsgarantien, keine erfundenen Zahlen.

---

## 1. Finale Empfehlung

**Bedingtes Go für ein kleineres, langsameres, strenger geprüftes Content-Programm — ~55–85 Seiten statt der ursprünglich vorgeschlagenen 75–115, über 9–15 Monate statt 6–12, mit Start nicht vor September 2026, Vollprüfung statt Stichprobe, und ausdrücklich nicht als Priorität vor dem schnelleren, kostenlosen Reddit/UGC-Hebel.**

### Warum niedriger als das ursprüngliche Urteil

Das ursprüngliche `urteil.md` kam bereits zu einem soliden Grundverdikt (No-Go für 1.000 Seiten, Go für einen datengetriebenen Kern) — die Skeptiker-Runde hat daran nicht gerüttelt, aber neun Stellen gefunden, an denen das Urteil sich selbst zu sicher war:

1. **Die Kernquelle für "S1 ist sicher" ist schwächer belegt als dargestellt.** Der zitierte Positiv-Case (1ClickReport, 26 Artikel/30 Tage, keine Penalty) stammt von einem Anbieter, der KI-Content-Tools verkauft und ein finanzielles Interesse daran hat, dass Leser "Skalierung ist sicher" glauben — ein unabhängig unverifizierter Selbst-Testimonial-Blogpost, kein Search-Console-Beleg. Er wird im Urteil aber wie eine tragende Stütze behandelt. **Korrektur:** als schwaches, nicht als tragendes Argument einordnen — die eigentliche Absicherung kommt aus der Qualitätsgate-Logik, nicht aus diesem Einzelfall.
2. **50–80 Fehlertyp-Seiten sind in ihrer eigenen Definition ein Templating-Programm.** Identische Struktur (Definitions-Block + Code-Beispiel + FAQ + Praxis-Kontext + Schema + Autoren-Block), erzeugt im selben Batch von einem Solo-Founder mit KI-Operator — das ist strukturell das SpamBrain-Signal aus `scaled-abuse-penalties.md`, nur mit mehr Boilerplate pro Seite getarnt. Keine quantitative Ähnlichkeitsmessung zwischen den fertigen Seiten war vorgesehen. **Korrektur:** automatisierte Ähnlichkeits-Prüfung als hartes Gate (siehe 2.4), Konsolidierung schwach differenzierter Themen vor Rollout (siehe 2.1).
3. **"Human-Review-Stichprobe" widerspricht der eigenen roten Linie 7** ("keine Seite ohne Human-Review"). Bei einem 2–4-h/Tag-Solo-Founder und 15–20 redaktionell tiefen Seiten pro Batch ist eine ehrliche Vollprüfung unrealistisch — Stichprobe bedeutet real, dass Seiten ungeprüft durchrutschen. **Korrektur:** Batch-Größe runter (5–8 zu Beginn), Review-Pflicht rauf (100 % aller Rechtsaussagen-Passagen, nicht nur Stil-Stichprobe).
4. **Legal-Grep gibt falsche Sicherheit.** Der Skill ist ein Regex-Scanner gegen bekannte Verbotswörter, prüft aber nicht, ob eine Frist, ein Schwellenwert oder eine Zuständigkeitsangabe inhaltlich stimmt — genau das ist bei skaliertem Compliance-Content das eigentliche UWG-/RDG-Risiko. **Korrektur:** zusätzliches inhaltliches Fakten-Gate (siehe 2.4, Punkt 5).
5. **Timing-Kollision:** Das Urteil warnt vor Publish-Batches kurz vor dem für Juni–August 2026 prognostizierten Core-Update — der heutige Tag (09.07.2026) liegt *innerhalb* dieses Fensters, und ohne expliziten Start-Termin würde die Empfehlung faktisch als "jetzt anfangen" gelesen. **Korrektur:** harter Start-Termin nicht vor September 2026 (siehe 2.6).
6. **Junge-Domain-Risiko wird diagnostiziert, aber nicht dosiert.** Das Urteil erkennt an, dass eine junge, autoritätslose Domain härter geprüft wird, senkt daraufhin aber weder Batch-Größe noch Gesamtvolumen. **Korrektur:** Start-Batches auf 5–8 senken (statt 15–20), erst nach mehreren sauberen Zyklen hochfahren.
7. **Bundesländer-Seiten (Archetyp B) sind im Kern dasselbe Muster wie die explizit verbotenen Städte-Seiten** — nur auf Landesebene. 16 Einzelseiten für eine bundeseinheitliche Gesetzeslage ist eine seitenzahl-treibende Entscheidung ohne SEO-Notwendigkeit. **Korrektur:** eine Übersichtsseite mit Tabelle statt 16 Einzelseiten (siehe 2.2).
8. **Kategorie-Fehler:** Googles Policy ist intent-/value-basiert, nicht an einer absoluten Seitenzahl festgemacht. Relativ zum bestehenden Seitenbestand (~15–23 Seiten) bedeutet der ursprüngliche Korridor (75–115) eine 5–7-fache Vervielfachung mit derselben Produktionspipeline — das eigentlich relevante Homogenitäts-Signal, das nirgends berechnet wurde. **Korrektur:** Ratio-Ziel zusätzlich zur absoluten Zahl (max. ~3–4× über den Planungszeitraum, siehe 2.8).
9. **Keine Zeit-/Kostenschätzung.** Drei Machbarkeits-Achsen (Daten, Technik, Risiko) wurden geprüft, die vierte — Owner-Stunden — fehlt komplett, obwohl die Qualitätsgates (Code-Beispiel, FAQ, ggf. Kundenbeispiel) echte Redaktionsarbeit sind. **Korrektur:** explizite (selbst geschätzte, im Pilot-Batch zu verifizierende) Stunden-Kalkulation, siehe 2.6 und Abschnitt 4.

Zusätzlich übernommen, ohne das Grundgerüst zu ändern: RDG-nahe FAQ-Formulierungen als eigene rote Linie (2.4/2.3), ein eigener WCAG-Selbstscan jeder neuen Seite als Reputationsschutz-Gate (2.4), Streichung der "echtes Kundenbeispiel"-Pflicht für die Masse der Seiten (2.1/2.4), und eine explizite Opportunitätskosten-Abwägung gegen Reddit/UGC (Abschnitt 3/4).

### Was unverändert bleibt

- **1.000 Seiten bleiben No-Go** — daran ändert die Korrektur nichts, sie macht den kleineren Go-Bereich nur nochmal vorsichtiger.
- **Nur bfsg-fuchs.de, keine Zweit-Domain** — dieser Punkt wurde vom Skeptiker nicht angegriffen und bleibt aus denselben Gründen bestehen (PBN-/Doorway-Risiko trifft die Ziel-Domain, zusätzliche Impressumspflicht pro Domain, kein Marketing-Nutzen).
- **Branchen×CMS-Matrix und Städte-Seiten: weiterhin nicht bauen.**
- **Kein kurzfristiger Sales-Beitrag zu erwarten** — das Programm bleibt ein mittelfristiger Compounding-Baustein, kein Ersatz für die schnelleren Hebel der bestehenden Strategie.

---

## 2. Detaillierter Umsetzungsplan

### 2.1 Datenmodell / Datenquellen

| Quelle | Status | Nutzung |
|---|---|---|
| `scanner/lib/rules-de.js` (104 Regeln) | Real, kuratiert, sofort nutzbar | Primäre Datenbasis für Archetyp A |
| 16 Bundesländer-Marktüberwachungsstellen | Real, öffentlich recherchierbar | Eine Übersichtsseite (nicht 16 Einzelseiten), siehe 2.2 |
| Branchentypisches Fachwissen (Websitemuster, Formulare, Fehlerquellen) | Real, aber qualitativ, nicht quantitativ belegbar | Archetyp C, nur mit echter Redaktionszeit |
| `scanner/out/scans.jsonl` (anonymisierte Scan-Ergebnisse) | **Existiert nicht** (kein Produktivpfad schreibt es, siehe `machbarkeit-daten.md` Abschnitt 1.2) | Nicht Teil dieses Plans. Falls die Scan-Daten-Story später verfolgt wird: eigener Code-Task (PII-freier Append-Logger: `score`, `violations[].id`, `wcag_level`, `timestamp`) + Wartezeit auf ≥50–100 Datenpunkte, **getrennt** von diesem Content-Programm budgetiert |
| Branchen×CMS-Matrix | **Existiert nicht**, nicht befüllbar in <6–18 Monaten | Nicht bauen |

**Vorbereitender Merge-Pass (neu gegenüber `urteil.md`, vor Batch 1 Pflicht):** Die 60–90 nach Dedup verbliebenen Themen aus `rules-de.js` werden vor Rollout-Start ein zweites Mal durchgesehen: Themen, die sich nur durch das betroffene HTML-Element unterscheiden (z. B. mehrere "kein Alt-Text"-Varianten für Bild/Icon/Hintergrundbild), werden zu **einer** Seite mit mehreren Unterabschnitten zusammengelegt statt als Einzelseiten multipliziert. Ziel: 45–70 wirklich eigenständige Seiten aus Archetyp A, nicht 50–80 roh gezählte.

### 2.2 Seiten-Archetypen mit Beispiel-Slugs

Bestehende URL-Konvention in `landingpage-next/app/` ist **flach, ohne Kategorie-Präfix** (z. B. `/bfsg-frist`, `/cookie-banner-fehler`, `/mobile-barrierefreiheit`, `/pdf-barrierefrei-machen`). Neue Seiten übernehmen dieses Muster — **kein** `/ratgeber/[kategorie]/[slug]`-Pfad, sondern ein einzelnes dynamisches Segment `app/[slug]/page.tsx` mit `generateStaticParams()`, Kategorie als Frontmatter-Feld (treibt Hub-Seiten/Interlinking, nicht die URL). Das erhält bestehende Linkequity und vermeidet einen unnötigen Strukturbruch.

| Archetyp | Zielzahl (korrigiert) | Beispiel-Slugs | Datenbasis |
|---|---|---|---|
| **A — Fehlertyp-Ratgeberseiten** | **45–70** (nach Merge-Pass) | `/alt-text-bilder-barrierefreiheit`, `/farbkontrast-mindestwert-wcag`, `/tastaturbedienung-formulare`, `/aria-labels-screenreader`, `/tabellen-barrierefreiheit-header` | `rules-de.js`, konsolidiert |
| **B — Marktüberwachung** | **1 Seite** (statt 16) | `/marktueberwachung-bundeslaender-bfsg` (Tabelle + Anker je Bundesland, verlinkt mit bestehender `/mlbf-pruefstrategie`) | Real, öffentlich, konsolidiert |
| **C — Branchen-Ratgeber ohne Statistik** | **8–15** (statt 10–20) | `/bfsg-zahnarztpraxis-website`, `/bfsg-online-shop-checkliste` (bereits vorhanden — als Muster verwenden), `/bfsg-handwerksbetrieb-website` | Qualitativ recherchiert, kein Templating |
| **D — Branchen×CMS-Matrix, Städte-Seiten** | **0** | — | Nicht bauen |

**Optionale spätere Einzel-Auskopplung aus B:** Falls für ein einzelnes Bundesland (z. B. dort, wo tatsächlich dokumentierte Prüfpraxis-Fälle bekannt werden) echter eigenständiger Mehrwert entsteht, kann später eine Einzelseite ausgekoppelt werden — das ist keine Standard-Vorgabe, sondern eine spätere Owner-Entscheidung mit konkretem Anlass.

**Neue Gesamt-Zielspanne: ~55–85 Seiten** (45–70 + 1 + 8–15), addiert auf den bestehenden Bestand von ~15–23 Seiten. Das entspricht einer Verdopplung bis Verdreifachung des Bestands über 9–15 Monate — bewusst niedriger als die 5–7-fache Vervielfachung, die der ursprüngliche 75–115-Korridor bedeutet hätte (siehe Punkt 8 in Abschnitt 1).

### 2.3 Template-/Uniqueness-Regeln

1. **Kein Variable-Swap-Template.** Jede Seite braucht einen eigenständigen Fakt/eine eigenständige Regel/einen echten Datenpunkt, der über den Austausch eines Platzhalters hinausgeht.
2. **Automatisierte Ähnlichkeitsmessung vor Publish (neu).** Vor Live-Schaltung eines Batches: einfacher Text-Ähnlichkeits-Check (z. B. n-Gram-/Jaccard-Vergleich) zwischen den neuen Seiten und dem bestehenden Bestand. Schwellenwert: **max. 40 % strukturelle/inhaltliche Übereinstimmung** zwischen zwei beliebigen Seiten außerhalb der gemeinsamen Boilerplate (Header/Footer/Disclaimer). Dieses Tooling existiert noch nicht — Bau ist ein eigener, kleiner Vorlauf-Task (siehe 2.6, "Technischer Vorlauf").
3. **RDG-Grenze: keine individualisierenden Formulierungen (neu, rote Linie).** Verboten in FAQ-/Fließtext auf jeder Seite: Formulierungen, die eine Einzelfall-Einschätzung suggerieren, z. B. *"Ist Ihre Website/Branche betroffen?"*, *"Sie brauchen/brauchen keinen Audit, weil…"*, *"In Ihrem Fall gilt…"*. Zulässig sind nur generisch-informative Formulierungen (*"Für Websites, die X anbieten, gilt grundsätzlich…"*, mit Disclaimer-Verweis auf Einzelfallprüfung).
4. **Keine erfundenen Statistiken.** Jede Prozent-/Häufigkeitsangabe braucht eine reale Stichprobe ≥10 (bestehende DSGVO-/Skill-Regel) — sonst raus. Gilt auch für **qualitative** Verallgemeinerungen ohne Stichprobe (z. B. *"in Branche X kommt Fehler Y häufig vor"* ohne Beleg — neu gegenüber dem ursprünglichen Urteil, das nur Prozentzahlen verbot).
5. **Definitions-Block in den ersten 150–200 Wörtern** (Ski-Ramp-Effekt, unverändert aus `urteil.md`).
6. **"Echtes Kundenbeispiel mit Erlaubnis" ist kein Pflichtfeld mehr für die Masse der Seiten** (Korrektur gegenüber `machbarkeit-daten.md` 3.1) — nur optional für 2–3 spätere Flaggschiff-Seiten, wo ohnehin eine Kundenbeziehung mit Erlaubnis besteht. Für die Regel-Seiten reicht Code-Beispiel + Screenshot + Praxis-Kontext ohne Kundenbezug.

### 2.4 Qualitätsgate-Checkliste pro Seite (verschärft gegenüber `urteil.md` 2.5)

Eine Seite darf erst live gehen, wenn **alle** Punkte erfüllt sind:

1. **Echter Unique-Value** + Ähnlichkeits-Check bestanden (siehe 2.3, Punkt 2).
2. **Redaktionelle Tiefe:** Code-Beispiel, ggf. Screenshot, FAQ-Block, Praxis-Kontext — über die 5 Katalog-Felder aus `rules-de.js` hinaus.
3. **Definitions-Block** in den ersten 150–200 Wörtern.
4. **Keine erfundenen Statistiken/Verallgemeinerungen** ohne reale Stichprobe ≥10.
5. **Faktenprüfung Rechtsaussagen (neu, zusätzlich zu Legal-Grep):** jede konkrete Rechtsaussage (Frist, Schwellenwert, Bußgeldrahmen, Zuständigkeit, Norm-Referenz) wird einzeln gegen eine Primärquelle (Gesetzestext BFSG/BFSGV/WCAG, MLBF-Angaben) geprüft — nicht nur wortfilter-geprüft. Diese Prüfung ist **Pflicht pro Seite**, nicht Stichprobe.
6. **Legal-Grep-Skill grün** (Wortfilter-Ebene: "BFSG-konform"/"rechtssicher"/"garantiert" etc.).
7. **RDG-Grenze eingehalten** (siehe 2.3, Punkt 3) — manuell gegengeprüft, da Legal-Grep das nicht erkennt.
8. **FAQ-/Article-Schema** gesetzt.
9. **Autoren-Attribution** (Person-Schema Matthias Seba) — **nur** auf Seiten mit tatsächlich persönlich durchgeführter Prüfung, oder alternativ transparent gekennzeichnet: *"Mit KI-Unterstützung erstellt, fachlich freigegeben von Matthias Seba"* (Korrektur gegenüber unbegrenzter Autoren-Zuschreibung).
10. **Eigener WCAG-2.1-AA-Selbstscan der neuen Seite/des Templates (neu).** Vor Publish: die Seite selbst durch den eigenen Scanner laufen lassen. Eine unzugängliche eigene Ratgeberseite ist für einen Compliance-Anbieter ein direkter Reputationsschaden, schwerer zu heilen als ein Rankingverlust.
11. **Human-Review = 100 % der Rechtsaussagen-Passagen, nicht Stichprobe** (Korrektur gegenüber `urteil.md` 2.3) — bei den kleineren Batch-Größen aus 2.6 ist das für den Owner realistisch leistbar.

### 2.5 Ziel-Domain-Entscheidung

**Ausschließlich bfsg-fuchs.de.** Begründung unverändert aus `urteil.md` 2.4: das bestehende Setup (bfsg-fix.de kanonisiert bereits sauber) ist der risikoarme Weg; eine Zweit-Domain würde laut PBN-Enforcement-Mustern potenziell die Ziel-Domain (den einzigen Umsatzträger) mit treffen; zusätzliche Impressumspflicht pro Domain (§5 DDG) ohne Marketing-Nutzen. Dieser Punkt wurde von der Skeptiker-Runde nicht angegriffen.

### 2.6 Rollout-Kadenz (korrigiert)

| Phase | Zeitraum | Batch-Größe | Was passiert |
|---|---|---|---|
| **Vorlauf** | Juli–August 2026 | — | Technischer Vorlauf (dynamische Route, `sitemap.ts` datengetrieben, Ähnlichkeits-Check-Tooling bauen), Merge-Pass Archetyp A (2.1), Redaktion Pilot-Batch — **kein Publish neuer Themenseiten in diesem Fenster** (liegt im prognostizierten Core-Update-Zeitraum Juni–August 2026) |
| **Pilot-Batch (Batch 1)** | **September 2026** (nicht früher) | **5–8 Seiten** | Erster Live-Batch, volle Gate-Prüfung, **Owner-Stundenaufwand wird gemessen** (siehe Abschnitt 4) — kalibriert alle folgenden Schätzungen |
| **Beobachtung nach Batch 1** | 4–6 Wochen | — | Search-Console-Monitoring (2.8), kein neuer Batch währenddessen |
| **Batch 2–3** | Ende Okt. – Dez. 2026 | **5–8 Seiten** | Erst starten, wenn Batch-1-Signale sauber sind (kein Abuse-Flag, Indexierung normal) |
| **Batch 4+** | ab Q1 2027, falls 2–3 saubere Zyklen bestätigt | **10–15 Seiten** (nicht 15–20) | Moderate Hochskalierung, weiterhin mit 4–6 Wochen Pause zwischen Batches |
| **Gesamtlaufzeit für ~55–85 Seiten** | **9–15 Monate** (nicht 6–12) | — | Ende realistisch Q2–Q4 2027, abhängig von Batch-1-Kalibrierung |

**Warum langsamer als `urteil.md`:** kleinere Start-Batches (Punkt 3/6 aus Abschnitt 1), späterer Start (Punkt 5), und die Pause zwischen Batches wird auf 4–6 statt 2–4 Wochen verlängert, weil eine junge Domain laut allen drei Machbarkeits-Dokumenten mehr Zeit für belastbare Signale braucht.

**Technischer Vorlauf (aus `machbarkeit-technik.md` 5A übernommen, unverändert notwendig):** dynamische Route + `generateStaticParams()`, `sitemap.ts` datengetrieben, `timeout-minutes` im Deploy-Workflow vorsichtshalber auf 25–30 erhöhen. Bis ~300–500 Seiten bleibt das bestehende Deploy-Muster (Build auf Live-Server) vertretbar, wenn nach jedem Batch Deploy-Dauer und Server-RAM beobachtet werden — bei einer Zielgröße von 55–85 Seiten wird diese Schwelle in diesem Plan nicht erreicht, ein CI-Build-Auslagern (5B) ist **nicht** Voraussetzung für diesen Plan, aber sinnvoll, falls später über 85 hinaus ausgebaut wird.

### 2.7 Indexierungs-Strategie

- `sitemap.ts` von hartcodiertem Array auf denselben datengetriebenen Slug-Datensatz umstellen wie `generateStaticParams()`.
- **Hub-and-Spoke-Interlinking:** ein Fehlertyp-Hub (Kategorie-Übersicht, aus Frontmatter-Kategorie generiert) verlinkt zu 5–10 verwandten Einzelseiten; jede Einzelseite verlinkt zurück zum Hub + 2–3 thematisch nahen Nachbarseiten. Keine Orphan-Pages.
- Neue Seiten werden in die bestehende interne Verlinkung der 15–23 Bestandsseiten eingehängt (v. a. von `/bfsg-checkliste-online-shop`, `/mlbf-pruefstrategie`, `/bfsg-fuer-webagenturen` aus, da diese die höchste thematische Nähe haben).
- Backlinks: keine neue eigene Taktik nötig — läuft über die bereits im 90-Tage-Plan verankerten Kanäle (PR, Directory-Listings, Partner), siehe Abschnitt 4.
- Sitemap-Größe, robots.txt, Crawl-Budget: bei 55–85 Seiten technisch bedeutungslos (bestätigt in `machbarkeit-technik.md` Abschnitt 6).

### 2.8 Monitoring + Frühwarn-Metriken

| Metrik | Prüf-Rhythmus | Schwelle für Reaktion |
|---|---|---|
| Search-Console-Meldung "Scaled content abuse" / "Spammy automatically generated content" | Laufend (Alert) | **Sofort-Stopp** aller neuen Publikationen, unabhängig vom Batch-Kalender |
| Anteil "Discovered – currently not indexed" im letzten Batch | 4–6 Wochen nach jedem Batch | >30 % des Batches → Publish-Stopp, Differenzierung pro Seite erhöhen, bevor weiter publiziert wird |
| Organischer Traffic Woche-vor/Woche-nach einem Google-Update | Nach jedem bekannten Update-Termin | >30 % Einbruch → 1 Woche abwarten (keine Panik-Löschung), dann Ursachenprüfung: korreliert der Einbruch zeitlich mit einem eigenen Batch? |
| Publish-Velocity | Pro Batch | Batch-Größe hält sich an 2.6 (kein 10×-Spike) |
| **Ratio neue Seiten / Bestand (neu)** | Quartalsweise | Ziel: max. **3–4×** Wachstum des Bestands über den gesamten Planungszeitraum (nicht nur absolute Seitenzahl beobachten) |
| **Owner-Stunden pro Seite (neu)** | Nach jedem Batch | Falls Ist-Aufwand > 1,5 h/Seite im Schnitt über Batch 1 → Kadenz verlangsamen (siehe Abschnitt 4), nicht Qualitätsgates kürzen |
| RDG-/UWG-Fehlerquote (interne Stichproben-Nachprüfung, unabhängig vom Ersteller) | Pro Batch, 100 % laut 2.4 Punkt 11 | Jede gefundene Falschaussage → Seite sofort korrigieren + alle Seiten mit demselben Textbaustein prüfen |
| Eigener WCAG-Selbstscan-Score neuer Seiten | Pro Seite vor Publish | Score unter dem eigenen Live-Standard → nicht publizieren, bis behoben |

**Einschränkung, ehrlich benannt (aus `machbarkeit-risiko.md` übernommen):** Google liefert keine öffentliche Basisrate. Alle Frühwarnindikatoren sind reaktiv, nicht präventiv-quantifizierbar — die Grenze ist nicht im Voraus exakt kalibrierbar. Das ist der Grund für die konservativeren Batch-Größen und längeren Pausen in diesem Plan.

### 2.9 Not-Aus/Rollback-Plan

| Trigger | Sofortmaßnahme |
|---|---|
| Search-Console-Abuse-Warnung | Publish-Stopp aller neuen Seiten. Reconsideration erst nach echter Qualitätsnacharbeit, keine kosmetische Korrektur. |
| >30 % Traffic-Einbruch, zeitlich mit eigenem Batch korreliert (nach 1 Woche Beobachtung bestätigt) | Niedrigwertigste Seiten des letzten Batches zuerst depublizieren/noindex (nicht das ganze Programm), dann beobachten, ob sich der Rest stabilisiert. |
| Einzelne RDG-/UWG-Falschaussage entdeckt (Owner, User oder externe Meldung) | Betroffene Seite sofort korrigieren oder offline nehmen; alle Seiten mit demselben Textbaustein/Template gegenprüfen — nicht nur die eine Seite. |
| Owner-Stundenbudget aus Pilot-Batch überschritten (>1,5 h/Seite) | Kadenz strecken (kleinere Batches, 6–8 statt 4–6 Wochen Pause) — **Zeit wird gestreckt, Qualität nicht gesenkt.** |
| 3 aufeinanderfolgende Batches unter 20 organischen Sessions/Monat pro Seite nach 8 Wochen (aligned mit bestehendem Kill-Kriterium im 90-Tage-Plan) | Neue Seitenproduktion einfrieren, verbleibende Owner-Stunden zu Reddit/UGC + Vertiefung bestehender Seiten umschichten (siehe Abschnitt 4). |
| Gesamt-Reißleine | Owner kann das Programm an jedem Batch-Grenzpunkt vollständig pausieren, ohne Sunk-Cost-Zwang — jeder bereits publizierte Batch bleibt unabhängig vom nächsten bestehen (keine Abhängigkeitskette, die einen Abbruch technisch erschwert). |

---

## 3. AEO-/SEO-Zusatztaktiken (unabhängig vom Content-Volumen)

Unverändert aus `urteil.md` Abschnitt 4 übernommen, mit einer Priorisierungs-Korrektur (Punkt 1):

1. **Reddit/UGC — höchste Priorität, nicht nachrangig zum Content-Programm.** Reddit ist laut Profound-Analyse Domain #1 über alle KI-Suchmaschinen hinweg. Kostenlos, kein Volumen-Risiko, sofort startbar, schnelleres Signal als das 9–15-Monats-Content-Programm. **Korrektur gegenüber der impliziten Reihenfolge im ursprünglichen Plan:** Dieser Kanal ist im bestehenden `90-tage-plan.md` aktuell **nicht enthalten** — echte Lücke, die Priorität vor der Content-Skalierung verdient, weil er um dieselben knappen Owner-Stunden konkurriert und schneller Belege liefert (siehe Abschnitt 4).
2. **Klassisches SEO bleibt Torwächter für AEO.** 97 % der Google-AI-Overview-Zitate stammen aus Top-20-Organic-Rankings. Priorität: bestehende 15–23 Ratgeberseiten + MLBF-Seite zuerst auf echtes Ranking bringen, bevor AEO-Feintuning wirkt.
3. **Definitions-Block/TL;DR in den ersten 150–200 Wörtern** — für jede neue **und bestehende** Seite.
4. **Content-Aktualität als KPI.** Quartals-Updates auf Kern-Ratgeberseiten, sichtbares "Stand [Monat] 2026".
5. **Autoren-/Entitäts-Signale:** Person-Schema, konsistente sameAs-Links, Google Business Profile — mit der Einschränkung aus 2.4 Punkt 9 (nur bei echter persönlicher Prüfung, sonst transparent als KI-unterstützt gekennzeichnet).
6. **Digital-PR via echte Scan-Statistiken — erst nach Logger-Bau.** Eigenes, getrenntes Vorhaben, nicht Teil dieses Content-Plans (siehe 2.1).
7. **llms.txt:** kein Ressourcenaufwand über die 10-Minuten-Basisdatei hinaus.
8. **Schema.org als Pflicht-Hygiene**, nicht als Wachstumshebel verkaufen.
9. **Hub-and-Spoke-Interlinking** je Kategorie, siehe 2.7.

---

## 4. Konkrete Integration in den bestehenden 90-Tage-Plan

> Bezug: `marketing/no-ads-strategie/90-tage-plan.md` (nur gelesen, nicht verändert). Der bestehende Plan enthält bereits die Zeile *"Programmatic-SEO-Branchenseiten (3–5/Monat)"* (Säule A, Prio 2, Start Woche 2, mit Kill-Kriterium *"<20 organische Sessions/Monat auf neuen Branchenseiten bis Gate 4 (W8)"*). Diese Integration **ersetzt/präzisiert diese Zeile**, sie stapelt keine zusätzlichen Owner-Stunden obendrauf — die ursprüngliche Kadenz war ohnehin auf Basis dieses Zusatzdokuments noch nicht final spezifiziert.

### 4.1 Änderungen an bestehenden Wochen

| Woche(n) | Bisherige Planzeile | Änderung durch diesen Plan | Wer |
|---|---|---|---|
| **Woche 1–2** | AEO-Refresh bestehender Ratgeberseiten (unverändert gut) | **Zusatz, neu:** Reddit/UGC-Start — 3–5 relevante Subreddits identifizieren (r/de, r/Startup_Germany, Barrierefreiheits-/Gründerforen), erste 2–3 authentische, hilfreiche Antworten mit klarer Founder-Disclosure | 🤖 identifiziert Threads/entwirft Antworten, 🦊 postet + autorisiert Disclosure (~30–45 Min) |
| **Woche 2–8** | *"Programmatic-SEO-Branchenseiten (3–5/Monat)"*, laufend | **Ersetzt durch:** Vorlauf-Phase (kein neuer Themenseiten-Publish, siehe 2.6) — stattdessen technischer Vorlauf + Merge-Pass + Ähnlichkeits-Tooling + Pilot-Batch-Redaktion. Grund: Core-Update-Fenster Juni–August 2026, siehe Punkt 5 in Abschnitt 1 | 🤖 Technik + Redaktion, 🦊 Freigabe pro Seite (100 % laut 2.4 Punkt 11) |
| **Woche 1–8 (laufend)** | — | **Zusatz, neu:** Reddit/UGC-Kadenz fortsetzen (~1–2 Beiträge/Antworten pro Woche), parallel zu LinkedIn | 🦊 (~30 Min/Woche) |
| **Woche 9 (02.–08.09.2026)** | *"Trigger-Check WordPress-Plugin/Chrome-Extension"* (bleibt bestehen) | **Zusatz:** **Pilot-Batch (Batch 1, 5–8 Seiten) live schalten**, Owner-Stundenaufwand ab hier messen | 🤖 Publish-Vorbereitung, 🦊 finale 100-%-Review + Publish-Freigabe |
| **Woche 9–14 (~Sept.–Okt. 2026)** | — | **Zusatz:** Beobachtungsfenster 4–6 Wochen (kein Batch 2 in dieser Zeit), Search-Console-Monitoring gemäß 2.8 | 🤖 Monitoring-Report, 🦊 Entscheidung |
| **~Ende Okt. 2026** | — | **Neues Gate (Gate 4b, außerhalb des ursprünglichen 90-Tage-Fensters):** Auswertung Pilot-Batch — Owner-Stunden/Seite, Indexierungsquote, organische Sessions. Entscheidet über Batch-2-Start und Batch-Größe für Batch 2–3 | 🤖 Auswertung, 🦊 Entscheidung |
| **Woche 13 (30.09.–06.10.2026)** | *"Gesamt-90-Tage-Review"* | **Zusatz zur Review-Notiz:** Content-Scale-Programm läuft explizit über den 90-Tage-Horizont hinaus (9–15 Monate Gesamtlaufzeit) — im Review als **laufendes Mehr-Quartals-Vorhaben** kennzeichnen, nicht als abgeschlossen bewerten | 🦊 |

### 4.2 Neue/angepasste KPI-Gates und Kill-Kriterien (Ergänzung zu Abschnitt 4 im 90-Tage-Plan, nicht Ersatz)

| Gate/Kriterium | Zeitpunkt | Schwelle | Konsequenz |
|---|---|---|---|
| **Bestehendes Kill-Kriterium "<20 Sessions/Monat, Gate 4 (W8)"** | **Verschoben** auf Gate 4b (~Ende Okt. 2026, 6–8 Wochen nach Pilot-Publish statt W8-Kalenderdatum) | unverändert <20 organische Sessions/Monat pro Seite | Neue Seitenproduktion pausieren, technisches SEO-Audit vor Fortsetzung |
| **Neu: Owner-Stunden-Gate** | Gate 4b | Ist-Aufwand Pilot-Batch >1,5 h/Seite im Schnitt | Kadenz verlangsamen (Batch-Pause 6–8 statt 4–6 Wochen), Qualitätsgates bleiben unverändert |
| **Neu: Abuse-Flag-Gate** | Laufend, jederzeit | Jede Search-Console-Meldung "Scaled content abuse"/"Spammy automatically generated content" | Sofort-Stopp aller neuen Publikationen, unabhängig vom Kalender-Gate |
| **Neu: Reddit/UGC-Signal-Gate** | Gate 4 (W8, wie bisher für LinkedIn) | 0 messbare Referral-Traffic/positive Erwähnungen aus Reddit-Aktivität | Kadenz auf 1×/2 Wochen senken, Zeit zurück zu Programmatic-Content oder Directories umschichten — **nicht** komplett einstellen, da Kosten praktisch null sind |
| **Bestehende Reißleine** (Sales kumuliert <2 bis Gate 4) | unverändert | unverändert | unverändert — Content-Scale-Programm ist ohnehin nicht als Quelle für diese Zahl eingeplant |

### 4.3 Owner-Zeit-Realitäts-Check (Ergänzung zu 90-Tage-Plan Abschnitt 3.1)

Die bestehende Wochenstunden-Tabelle im 90-Tage-Plan weist für Säule A in Woche 5–8 bereits 2–3 h/Woche für "laufende Content-Produktion" aus, ohne die hier verschärfte 100-%-Review-Pflicht einzupreisen. Mit den neuen Gates:

- **Pilot-Batch (5–8 Seiten, September):** geschätzt (nicht belegt, im Pilot zu verifizieren) ~45–90 Min Owner-Vollprüfung pro Seite (Rechtsaussagen-Fakten-Check + RDG-Grenze + finale Freigabe) → **~6–12 Owner-Stunden**, verteilt über 2–3 Wochen im September, zusätzlich zu bereits laufenden Aufgaben.
- Das liegt innerhalb der im 90-Tage-Plan ausgewiesenen Kapazitätsreserve (Puffer zwischen 3,5–7 h/Woche Marketing-Bedarf und 14–28 h/Woche verfügbarer Zeit), **muss aber explizit als eigener Zeitblock im September eingeplant werden**, da er in der ursprünglichen Wochenstunden-Tabelle noch nicht enthalten war.
- Reddit/UGC-Zusatz (~30–45 Min/Woche) ist im bestehenden Puffer unkritisch.

---

## Quellen

Basiert auf `urteil.md`, `machbarkeit-daten.md`, `machbarkeit-risiko.md`, `machbarkeit-technik.md` und den sechs Research-Dateien in `research/` (alle 09.07.2026, Perplexity-recherchiert, Quellenlisten dort), plus einer strukturierten Skeptiker-Prüfung (19 Einwände, 09.07.2026) und einer Lesung von `marketing/no-ads-strategie/90-tage-plan.md` sowie `landingpage-next/app/` (Code-Inspektion der bestehenden URL-Konvention, 09.07.2026). Keine neue Web-Recherche in diesem Dokument.
