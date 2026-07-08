# Daten-Machbarkeit für Mass-/Programmatic-Content bei BFSG-Fuchs

> Rolle: Machbarkeits-Analyst (Daten). Stand: 09.07.2026. Prüft NUR die Datenlage — nicht Legal-/SEO-Policy-Risiken (dazu paralleles Dokument `machbarkeit-risiko.md` im selben Ordner, hier ungelesen/nicht verändert).
> Methode: Code-Inspektion (`scanner/`, `landingpage-next/`) + Bash/Glob/Grep gegen den echten Repo-Zustand, keine Perplexity-Recherche nötig (Frage ist repo-intern beantwortbar). Kein bestehendes Strategie-Dokument in `marketing/no-ads-strategie/` verändert.

---

## Ergebnis vorab (TL;DR für den Owner)

**Der Datensatz, auf dem die gesamte Mass-Content-Idee aufbauen soll, existiert nicht.** `scanner/out/scans.jsonl` — die Datei, die der bestehende Skill `scan-dataset-aggregat` voraussetzt und auf die sich mehrere Research-Dokumente in diesem Ordner ("echte anonymisierte Scan-Ergebnisse aus scanner/out/") als Wettbewerbsvorteil berufen — wird von **keinem** Produktivcode-Pfad geschrieben. Es gibt aktuell keine strukturierte, auswertbare Sammlung von Scan-Ergebnissen (Score, Violations, Branche, CMS) — weder lokal noch nachweisbar auf dem Server. Was tatsächlich existiert, ist ein einziger echter, nutzbarer Datensatz: der kuratierte deutsche WCAG/axe-Regel-Katalog (104 Einträge) in `scanner/lib/rules-de.js`. Der trägt vielleicht 50–100 echte Ratgeberseiten, aber keine 1.000 und keine Branchen-/Städte-Matrix.

**Realistische Grössenordnung mit echtem Unique-Value heute: 50–80 Seiten. Mit erheblichem Vorlauf (Monate) und neuem Code: vielleicht 150–250. 1.000 Seiten sind mit der aktuellen und der absehbaren Datenlage nicht seriös zu befüllen — das wäre reine Kombinatorik ohne Substanz, exakt das Muster, das laut `research/scaled-abuse-penalties.md` und `research/1000-pages-claim.md` abgestraft wird.**

---

## 1. Was tatsächlich an Daten existiert (verifiziert per Code-Inspektion, 09.07.2026)

### 1.1 Der WCAG/axe-Regel-Katalog — der einzige echte strukturierte Datensatz

`scanner/lib/rules-de.js`, 894 Zeilen, **104 kuratierte Regel-Einträge**. Pro Eintrag: `title` (verständlicher Name), `why` (Geschäftsrisiko/BFSG-Bezug), `fix` (konkrete Lösung), `effort` (S/M/L), `category`, `norm` (WCAG-Erfolgskriterium). Verteilt auf 9 Kategorien: Bilder & Medien, Farbe/Kontrast & Darstellung, Links/Schaltflächen & Bedienelemente, Formulare & Eingabe, Struktur & Navigation, Tabellen, ARIA & Technik, Cookies & Tracking, Weitere Befunde.

**Bewertung:** Das ist ein echtes, von Menschen kuratiertes Asset mit fachlicher Tiefe (Norm-Zuordnung + Aufwandsschätzung + Praxis-Fix) — kein reiner Datenbank-Dump. Es deckt sich strukturell mit dem, was die Recherchen als funktionierendes Muster beschreiben (`research/pseo-right.md`, Finding 8: "Original-Daten/Statistiken werden bevorzugt zitiert"; `research/seo-2026.md`, Finding 4: First-Hand-Signale). **Aber:** 104 Regeln sind kein "1000-Seiten-Datensatz". Mehrere Regeln überschneiden sich stark (z. B. 5 verschiedene "ohne Alternativtext"-Varianten), sodass nach Deduplizierung/Bündelung eher 60–90 wirklich eigenständige Themen bleiben.

### 1.2 Was NICHT existiert (verifiziert, nicht nur vermutet)

- **`scanner/out/scans.jsonl` (Score, Violations, WCAG-Level pro Scan) — existiert nicht.** Grep über `scanner/lib/*.js` nach `scans.jsonl`, `violations[`, persistenter Scan-Speicherung: kein Treffer ausserhalb des CLI-Tools `audit.js`. Der Free-Scan-Endpoint `/api/scan` (app.js:839) ruft `scanUrl()` auf, rendert einen Teaser, hält ihn nur **In-Memory** im Response-Cache (`cache.set`) — **keine Persistenz, kein Log.** Der bezahlte Fulfillment-Pfad (`fulfill.js`) schreibt HTML-Report + Barrierefreiheitserklärung + PDF pro Bestellung, aber **keine** strukturierte `scan.json` mit dem Violations-Array in einen auswertbaren Datenspeicher — nur die fertigen Kunden-Dokumente. Persistiert wird ausschliesslich `out/orders.jsonl` (Transaktionsdaten: E-Mail, URL, Paket, Betrag, Status) — **keine A11y-Inhalte.**
- **CMS-/Shop-System-Erkennung — existiert nicht.** `scanner/lib/scan.js` (345 Zeilen) enthält keinerlei Technologie-Fingerprinting (kein Wappalyzer-artiges Muster, kein Meta-Generator-Parsing, kein Shopify/WordPress/Wix-Header-Sniffing). Der Scanner prüft A11y (axe-core) und TLS, aber klassifiziert die gescannte Seite nicht nach CMS.
- **Branchen-Klassifizierung — existiert nicht.** Weder beim Free-Scan noch beim Checkout wird eine Branche erfasst (kein Formularfeld, kein Code-Pfad dafür gefunden). Der `scan-dataset-aggregat`-Skill sieht Branchen-Auswertung selbst nur als "optional, falls strukturiert erfasst" vor — sie ist es nicht.
- **Städte-/Regional-Daten — kein Bezug.** BFSG ist Bundesrecht; es gibt keinen fachlichen Unterschied zwischen "BFSG-Prüfung München" und "BFSG-Prüfung Köln". Einzige real existierende Regional-Differenzierung: die 16 Bundesländer haben je **eigene Marktüberwachungsstelle** (unterschiedliche Behörde, Adresse, Zuständigkeit) — das ist ein kleiner, aber echter Datenpunkt (siehe 3.4).
- **Abmahn-/MLBF-Fall-Datenbank — existiert nicht als eigener Datensatz.** Es gibt Kontext-Wissen (Kontrollphase seit 05.01.2026, Abmahnwelle seit Feb. 2026, ~2.700 €/Fall laut Business-Kontext), aber keine strukturierte, mit Quellen belegte Fallliste im Repo, die pro Seite variierbar wäre — das wäre 1–3 gute Artikel, kein Seiten-Generator.

**Konsequenz für die Owner-Anfrage:** Die im Auftrag genannten Kandidaten "Branchen × CMS/Shop-Systeme × BFSG-Themen × ggf. Städte" sowie "anonymisierte reale Scan-Ergebnisse aus scanner/out/" sind **zu 4 von 5 Dimensionen nicht mit echten Daten hinterlegt** — sie existieren nur als Idee/Skill-Beschreibung, nicht als Code-Realität. Das ist der zentrale Gatekeeper-Befund dieser Analyse.

---

## 2. Selbst wenn der Datensatz gebaut würde: Volumen-Problem

Angenommen, man baut heute (a) einen anonymisierten `scans.jsonl`-Logger, (b) einfaches CMS-Fingerprinting, (c) ein Branchen-Dropdown im Funnel — dann fehlt immer noch die **Menge**. Aus dem Business-Kontext: realistisches Ziel sind 2–6 Sales in 14 Tagen, 8–15 Sales/Monat bis Monat 3. Selbst wenn man **jeden** Free-Scan mitzählt (deutlich mehr Volumen als bezahlte Scans, aber unbekannte Grössenordnung — kein Tracking dafür im Code gefunden), bräuchte man laut der eigenen DSGVO-Regel im `scan-dataset-aggregat`-Skill **mindestens 10 Einträge pro Gruppe** (Score-Bucket) bzw. **≥5 pro Branche**, um überhaupt aggregiert zu publizieren.

Bei z. B. 8 Branchen × 4 CMS-Typen × 6 Themen = 192 Zellen bräuchte man **mind. 960–1.920 klassifizierte Datenpunkte**, um jede Zelle auch nur am unteren Anonymisierungs-Limit zu befüllen — bei einem Unternehmen, das in Monat 3 bei 8–15 bezahlten Sales/Monat steht. Selbst mit grosszügiger Schätzung von Free-Scans (Faktor 10–20× der Sales, unbelegt) wären das Monate bis über ein Jahr, bis die Matrix seriös befüllbar wäre — und das nur, wenn Branche/CMS ab sofort mitprotokolliert würden, was heute nicht passiert.

**Ehrlichkeits-Check gegen Survivorship-Bias:** Genau dieses Muster — Erfolgsgeschichte zuerst zeigen ("13.000 Seiten in 3 Stunden"), Scheitern erst im Kleingedruckten — ist in `research/1000-pages-claim.md` Finding 1 selbst als Falle benannt (der Solanki/Ward-Case liefert im selben Post einen −86 %-Absturz einer Vorgänger-Kampagne mit). Für BFSG-Fuchs gilt: die Datenbasis für eine "wir haben X Websites gescannt"-Story ist heute so klein und unstrukturiert, dass jede Prozentangabe ("60 % der Shopify-Shops haben Kontrastfehler") derzeit **erfunden** wäre, nicht datenbasiert — das wäre zugleich ein UWG-§5-Risiko (`multidomain-pbn-legal.md`, Finding 8: KI-generierte Falschaussagen haften voll dem Betreiber).

---

## 3. Bewertung pro Seiten-Idee (Nachfragesignal aus `research/` × echter Unique-Value)

### 3.1 WCAG-/Fehlertyp-Ratgeberseiten (aus `rules-de.js`) — **einzig sofort machbarer Kandidat mit echtem Datenfundament**
- **Datenbasis:** real, 60–90 eigenständige Themen nach Dedup.
- **Nachfrage:** laut `research/seo-2026.md` (Finding 4, 9) genau der Content-Typ, der bei E-E-A-T/AI-Overview-Zitierfähigkeit punktet (Definitions-Block + Praxis-Fix + Norm-Bezug).
- **Aber:** jede Seite braucht **redaktionelle Ausarbeitung über die 5 Katalog-Felder hinaus** (Code-Beispiele, Screenshots, FAQ, evtl. ein reales — nicht erfundenes — Kunden-Beispiel mit Erlaubnis), sonst bleibt es bei ~150 Wörtern Katalog-Text pro Seite = zu dünn für ein YMYL-nahes Thema (`research/seo-2026.md`, Finding 3).
- **Grössenordnung: 50–80 Seiten**, gestaffelt publiziert (Batches à 10–15 mit QA, analog `research/pseo-right.md` Finding 5).

### 3.2 Branchen × CMS/Shop-Systeme (die im Auftrag genannte Matrix) — **nicht machbar ohne Neubau + Wartezeit**
- **Datenbasis:** keine (siehe Abschnitt 1.2 + 2).
- Ohne echte Statistik pro Zelle wäre jede Seite ("BFSG für Shopify-Shops im Einzelhandel") reiner Template-Text mit Keyword-Austausch — exakt Googles "Scaled Content Abuse"-Definition (`research/scaled-abuse-penalties.md`, Abschnitt 1: "viele nahezu identische Seiten mit minimaler Variation").
- **Grössenordnung heute: 0.** Nur denkbar nach (a) Logger-Neubau, (b) CMS-Detection-Neubau, (c) 6–18 Monaten Datensammlung — und selbst dann nur für die Zellen mit ausreichendem Volumen (vermutlich <20 der 192 möglichen Kombinationen realistisch befüllbar).

### 3.3 Branchen-Ratgeberseiten OHNE Statistik-Anspruch (generisches Fachwissen, z. B. "BFSG für Zahnarztpraxen")
- **Datenbasis:** kein Zahlen-Datensatz, aber echtes, recherchierbares Fachwissen (branchentypische Website-Muster, typische Buchungs-/Terminformulare, häufige Fehlerquellen laut Erfahrung des Scanners — qualitativ, nicht quantitativ belegbar).
- Machbar als **redaktionelle** Ratgeberseiten (kein pSEO im engeren Sinn), wenn pro Branche wirklich eigenständig recherchiert statt templatiert wird.
- **Grössenordnung: 10–20 Branchen**, wenn echte Redaktionszeit investiert wird — nicht 100+.

### 3.4 Bundesländer-Marktüberwachungsstellen (16 Behörden) — **kleiner, aber echter Datenpunkt, bisher nicht identifiziert**
- **Datenbasis:** real und öffentlich recherchierbar (jedes Bundesland hat eine eigene BFSG-Marktüberwachungsstelle mit eigenem Namen/Kontakt/Zuständigkeit).
- **Grössenordnung: max. 16 Seiten** ("BFSG-Marktüberwachung in [Bundesland]: zuständige Stelle, Kontakt, bisherige Praxis") — echt differenziert, aber ein Nischen-Zusatzbaustein, kein Volumentreiber. Eher als Ergänzung zur bereits geplanten MLBF-Prüfstrategie-Seite (PR #139) sinnvoll als als eigene Content-Säule.

### 3.5 Städte-Landingpages ("BFSG-Prüfung Berlin", "... München", ...) — **explizit NICHT empfohlen**
- **Datenbasis:** keine. BFSG kennt keine kommunale Differenzierung.
- Reinstes Beispiel für Doorway-/Thin-Content-Muster ohne jeden Unique-Value — genau das Gegenteil dessen, was `research/aeo-2026.md` (Finding 4, 97-%-Organic-Overlap) und `research/scaled-abuse-penalties.md` als sicheren Weg beschreiben.
- **Grössenordnung: 0 empfohlen.**

### 3.6 Anonymisierte Scan-Statistik-Aggregat-Seite/-PR (der `scan-dataset-aggregat`-Skill selbst)
- **Datenbasis:** aktuell **null**, weil die Logging-Infrastruktur fehlt (siehe 1.2). Der Skill ist vollständig lauffähig konzipiert (DSGVO-Regeln, Format-Templates), aber die Voraussetzung ("Scan-Log lesen") ist unerfüllt — `cat scanner/out/scans.jsonl` würde heute mit "Datei nicht gefunden" fehlschlagen.
- **Empfehlung, unabhängig vom pSEO-Volumen-Thema:** Falls diese Daten-Story weiterverfolgt werden soll, ist der **erste** Schritt ein kleiner Code-Task (anonymisierter Append-Logger im Scan-Pfad, PII-frei: nur `score`, `violations[].id`, `wcag_level`, `timestamp`), gefolgt von einer Wartezeit, bis ≥50–100 Datenpunkte für eine seriöse Aggregat-Aussage vorliegen (die eigene ≥10/Gruppe-Regel des Skills als unterste Grenze).

---

## 4. Wo beginnt die Dünn-Content-Zone (Kriterium, nicht nur Meinung)

Basierend auf `research/1000-pages-claim.md` (Finding 6, "Überlebens-Bedingungen") und `research/pseo-right.md` (Finding 8) lässt sich eine klare, für BFSG-Fuchs anwendbare Grenze ziehen:

Eine Seite ist **dünn**, wenn mindestens eines zutrifft:
1. Ihr einziger Unterschied zu einer Nachbarseite ist ein ausgetauschter Platzhalter (Stadt-, Branchen- oder CMS-Name) ohne dahinterliegende echte Daten.
2. Eine quantitative Aussage ("X % der Websites in Branche Y haben Fehler Z") steht auf der Seite, ohne dass eine reale, ausreichend grosse Stichprobe (≥10, DSGVO-/Skill-eigene Grenze) dahintersteht.
3. Der redaktionelle Mehrwert pro Seite liegt unter dem, was ein einzelner Katalog-Eintrag aus `rules-de.js` (5 Felder, ~80 Wörter) bereits liefert — dann ist die Seite reine Verpackung ohne Zusatznutzen.

Nach diesem Massstab: **3.2 (Branchen×CMS-Matrix) und 3.5 (Städte) fallen sofort in die Dünn-Content-Zone.** 3.1 (WCAG-Fehlertyp-Seiten) und 3.4 (Bundesländer-Behörden) bleiben ausserhalb, **wenn** redaktionell nachgearbeitet wird und keine erfundenen Prozentzahlen ergänzt werden.

---

## 5. Realistische Gesamt-Grössenordnung (Antwort auf die Kernfrage)

| Grössenordnung | Erreichbar? | Basis |
|---|---|---|
| **~50 Seiten** | **Ja, heute, mit echtem Unique-Value** | WCAG-/Fehlertyp-Katalog (3.1) allein trägt das, ggf. + 10-16 Branchen/Bundesländer-Seiten mit echter Redaktion (3.3, 3.4) |
| **~200 Seiten** | **Nur mit erheblichem Zusatzaufwand, nicht rein aus Daten** | Erfordert 3.1 voll ausgeschöpft (max. ~90) + 3.3 aggressiv ausgebaut (viele Branchen, echte Recherche pro Seite, kein Templating) + neue redaktionelle Formate (Vergleiche, Muster-Dokumente wie `barrierefreiheitserklaerung-muster` bereits zeigt). Kein Datenprojekt mehr, sondern ein Redaktionsprojekt. |
| **~1.000 Seiten** | **Nein, nicht mit echtem Unique-Value, weder heute noch in den nächsten 6–12 Monaten** | Würde zwingend auf Kombinatorik (3.2, 3.5) zurückfallen, weil kein Datensatz existiert, der 1.000 eigenständige Fakten liefern könnte. Genau das Muster, das `research/scaled-abuse-penalties.md` und `research/1000-pages-claim.md` als Hochrisiko/unbelegten Erfolgsmythos einordnen. |

---

## 6. Konkrete Handlungsempfehlung (Daten-Perspektive, keine Entscheidung über Legal/SEO-Policy-Fragen — dazu das parallele Dokument)

1. **Sofort machbar, ohne neue Infrastruktur:** 50–80 Fehlertyp-Ratgeberseiten aus `rules-de.js` in Batches von 10–15 ausbauen (Definitions-Absatz zuerst, FAQ-Block, keine erfundenen Statistiken) — deckt sich mit dem einzigen Kandidaten, der die Skalierungs-Kriterien aus `research/1000-pages-claim.md` (Finding 6) tatsächlich erfüllt.
2. **Falls die "echte Scan-Daten"-Story strategisch wichtig bleibt:** zuerst den Logger bauen (klein, anonymisiert, PII-frei) — das ist ein Code-Task, kein Content-Task — und dann Monate warten, bevor daraus Content wird. Nicht umgekehrt.
3. **Branchen×CMS-Matrix, Städte-Seiten: nicht bauen**, solange keine echte Datenbasis existiert. Das ist der Punkt, an dem "viele Seiten schnell" objektiv in Dünn-Content kippt.
4. **Bundesländer-Behörden-Seiten (16 Stück)** als kleiner, aber echter Zusatzbaustein einplanen — passt thematisch zur laufenden MLBF-Prüfstrategie-Seite (PR #139).

---

## Quellen / Grundlage dieser Analyse

- Code-Inspektion (09.07.2026): `scanner/lib/rules-de.js`, `scanner/lib/scan.js`, `scanner/lib/fulfill.js`, `scanner/lib/orders.js`, `scanner/audit.js`, `scanner/app.js`, `scanner/.gitignore`, `.claude/skills/scan-dataset-aggregat/SKILL.md`, Verzeichnisstruktur `landingpage-next/app/`.
- Gelesene Research-Dokumente (Zitate/Findings referenziert): `research/aeo-2026.md`, `research/seo-2026.md`, `research/pseo-right.md`, `research/scaled-abuse-penalties.md`, `research/1000-pages-claim.md`, `research/multidomain-pbn-legal.md` (alle 09.07.2026, Perplexity-recherchiert, siehe dortige Quellenlisten).
- Business-Kontext (Sales-Ziele, Scan-Volumen-Grössenordnung): Prompt-Kontext + `CLAUDE.md`.
