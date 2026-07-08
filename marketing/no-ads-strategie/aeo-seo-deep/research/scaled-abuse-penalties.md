# Google "Scaled Content Abuse" — Spam-Policy, Durchsetzung & dokumentierte Straf-Fälle (2024–2026)

> Adversarial-Recherche für BFSG-Fuchs. Frage: Wie definiert und bestraft Google Massen-/AI-Content-Missbrauch, und welche realen Sites wurden dafür abgestraft/deindexiert?
> Quellen: Perplexity Deep-Research + Ask (Sonar Pro, web-grounded), Stand der Abfrage: 09.07.2026. Alle Aussagen mit Quelle+Datum markiert.

---

## Kernbefund vorweg

Googles Politik ist **methodenagnostisch**: nicht "KI-generiert" wird bestraft, sondern **Masse + geringer Nutzerwert + Ranking-Manipulationsabsicht** — unabhängig davon, ob Mensch, KI, Scraping oder Template die Quelle ist (Google Search Central, Spam Policies for Google Web Search, 05.03.2024). Für BFSG-Fuchs heisst das: Das Risiko liegt nicht in "KI genutzt", sondern in **hohem Publish-Tempo bei niedriger Differenzierung pro Seite** (z. B. 100+ nahezu identische Stadt-Landingpages ohne echten lokalen Mehrwert).

---

## 1. Exakte Definition (Google, offiziell)

> „Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users." — Google, *Spam Policies for Google Web Search*, developers.google.com/search/docs/essentials/spam-policies (Stand-Snapshot Juli 2026, Policy eingeführt 05.03.2024).

Von Google explizit als Scaled Content Abuse genannte Praktiken (Quelle: dieselbe Google-Doku, zitiert 09.07.2026):
- Generative-AI-/Automatisierungs-Tools nutzen, um viele Seiten **ohne Mehrwert** zu erzeugen
- Scraping von Feeds/Suchergebnissen inkl. Synonymisierung/reiner Übersetzung ohne Zusatznutzen
- „Stitching"/Kombinieren von Fremdinhalten ohne echten Mehrwert
- Viele nahezu identische Websites, um die Skalierung zu verschleiern
- Seiten mit kaum sinnvollem Text, aber Keyword-Dichte zur Ranking-Manipulation

**Relevanz für BFSG-Fuchs: HOCH.** Wir planen laut Owner-Anfrage-Kontext ("Mass-Content-Idee") potenziell viele programmatische Seiten (z. B. Branchen×Region-Kombinationen für BFSG-Pflichten). Genau dieses Muster ("viele nahezu identische Seiten mit minimaler Variation") ist die zentrale Zieldefinition der Policy.

---

## 2. Einführung & Timeline

- **05.03.2024:** Ankündigung im Rahmen des March 2024 Core Update + neue Spam-Policies, inkl. Scaled Content Abuse, Expired Domain Abuse, Site Reputation Abuse (blog.google, „New ways we're tackling spammy, low-quality content on Search", 05.03.2024).
- **März–April 2024:** Rollout des zugehörigen Spam-Updates, laut Google-Blog **45 % weniger unoriginellen/unhilfreichen Content** in den SERPs nach Abschluss (blog.google, 05.03.2024).
- **05.05.2024:** Google nennt dieses Datum explizit als Start der verschärften Durchsetzung für Site Reputation Abuse (2 Monate Übergangsfrist nach Ankündigung) — analog dazu lief die algorithmische Durchsetzung von Scaled Content Abuse bereits ab März 2024 an (Google Search Central Blog, 05.03.2024).
- **24.–25.03.2026:** Neues, sehr schnelles globales "March 2026 Spam Update" (< 20 Stunden Rollout, 24.03.2026 12:00 PT bis 25.03.2026 07:30 PT) — keine neue Policy, sondern SpamBrain-Nachschärfung der bestehenden Kategorien inkl. Scaled Content Abuse (Search Engine Journal, 24.03.2026; status.search.google.com Incident-Log).
- **27.03.–08.04.2026:** Direkt anschliessendes March 2026 Core Update — Praktiker-Konsens: Spam-Update räumt zuerst Policy-Verstösse weg, Core-Update kalibriert danach die Rankings neu (ClickRank-Analyse, 2026; ohne Google-Primärquelle, als Sekundärsignal zu werten).

**Relevanz: HOCH.** Zeigt, dass die Durchsetzung nicht ein einmaliges Ereignis 2024 war, sondern **aktiv und wiederkehrend bis in die Gegenwart (März 2026)** verschärft wird — die Policy ist kein "totes" Risiko, sondern ein laufendes.

---

## 3. Erkennung: SpamBrain + Signale

Google nennt keine vollständige technische Spezifikation, aber bestätigt:
- **SpamBrain** = Googles KI-basiertes Spam-Erkennungssystem (seit 2018 intern, öffentlich benannt), kombiniert algorithmische Erkennung mit menschlichen Reviewer:innen für manuelle Massnahmen (Google Search Central Doku „Spam updates", Stand 2026-Snapshot).
- Typische Signalmuster laut Google-Policy-Text + konsistenten SEO-Sekundärquellen (Search Engine Land, Search Engine Journal, div. SEO-Tool-Blogs, 2024–2026): templatisierte Massenseiten mit nur Orts-/Produktnamen-Austausch, Doorway-Muster, unnatürliche Keyword-Dichte ohne Kontext, gleichförmiges Layout in grosser Zahl, schwache/fehlende Autoren-Identität, hohe Publish-Frequenz ohne redaktionelle Kontrolle.

**Relevanz: MITTEL.** Wichtig für die *Bauweise* geplanter Programmatic-Pages (echte Differenzierung pro Seite, keine reinen Platzhalter-Templates), aber kein neuer Fakt, der die Grundstrategie in Frage stellt.

---

## 4. Strafen — Schweregrad

Zwei Ebenen, beide für Scaled Content Abuse einschlägig (Google Spam-Policies-Doku + Search-Engine-Land-Analysen des März-2024-Updates):

**Algorithmisch (automatisch, ohne menschliche Prüfung):**
- Ranking-Abstufung einzelner Seiten/Verzeichnisse
- Neutralisierung ausgehender/eingehender Signale
- Partielle bis vollständige Deindexierung betroffener URL-Muster
- Beobachtete Praxis-Range 2024: **70–100 % Sichtbarkeitsverlust** bei betroffenen Scaled-Content-Sites (SEO-Analysen zu Gabe/Ray-Reporting, März 2024)

**Manuell (Manual Action durch Google-Reviewer):**
- Sichtbar in der Search Console unter „Spammy automatically generated content" / heute unter „Scaled content abuse" subsumiert
- Bleibt aktiv bis Bereinigung + erfolgreicher Reconsideration Request
- Kann sich auf ganze Domain oder nur betroffene Segmente/Subfolder beschränken

**Wichtige Einschränkung (Ehrlichkeits-Check):** Google veröffentlicht **keine granularen Statistiken** dazu, wie viele Manual Actions oder Deindexierungen konkret der Kategorie "Scaled Content Abuse" zuzurechnen sind — weder für 2024 noch für das März-2026-Update. Alle Zahlen zu betroffenen Sites/Traffic-Drops stammen aus **Sekundärquellen (SEO-Blogs, Reddit, LinkedIn, YouTube)**, nicht aus Google-Primärstatistiken. Das ist wichtig gegen Survivorship-Bias und Übertreibung zu sagen.

**Relevanz: HOCH.** Das Risiko ist real und potenziell existenzbedrohend für eine Domain (bis zu 100 % Traffic-Verlust dokumentiert), aber die genaue Trefferquote/Wahrscheinlichkeit ist nicht quantifizierbar — Google liefert keine Basisrate.

---

## 5. Dokumentierter Härtefall: HouseFresh (2024)

- **HouseFresh**, eine unabhängige Review-Site, berichtete einen **91 % Traffic-Einbruch** nach dem March-2024-Core-Update (housefresh.com, „How Google Decimated HouseFresh", 2024; bestätigt/zitiert von Search Engine Land, „Review site's Google traffic plummets amid affiliate SEO content", 2024).
- Konkrete Zahl: Rückgang von ca. **4.000 auf ca. 200 organische Google-Besucher/Tag** seit Oktober 2023, wobei die verbliebenen Besucher grossteils direkt nach dem Markennamen suchten (housefresh.com, 2024).
- **Wichtige Einordnung:** HouseFresh selbst ist **kein** Scaled-Content-Abuse-Täter, sondern das Gegenteil — eine kleine, unabhängige Site, die argumentierte, von grösseren Content-Farmen/Affiliate-Massenproduzenten aus den SERPs verdrängt worden zu sein. Der Fall zeigt die **Kollateral-Dynamik** des Updates (Verdrängungswettbewerb), nicht direkt eine Bestrafung von HouseFresh selbst.

**Relevanz: MITTEL.** Zeigt die Marktdynamik (grosse skalierte Content-Player verdrängen kleine "echte" Publisher kurzfristig), ist aber kein Beispiel für eine bestrafte Scaled-Content-Site mit Namen. Für BFSG-Fuchs eher eine Mahnung, dass Google-Volatilität auch seriöse kleine Sites treffen kann — kein Blankoscheck fürs Gegenteil.

---

## 6. Muster-Fälle bei Scaled-Content-Sites selbst (März 2024, weniger namentlich belegt)

- Laut SEO-Kommentator-Berichten (zusammengefasste Sekundärquelle zu Glenn Gabe/Lily Ray, März 2024) publizierten betroffene Sites oft **hunderte KI-Artikel pro Monat mit minimaler menschlicher Bearbeitung**, zielten auf kommerzielle Keywords mit flachem Content und erlebten **70–100 % Sichtbarkeitsverlust**.
- Lily Ray (Substack, März 2024, zitiert via Perplexity-Recherche) bestätigte die Verknüpfung des Updates mit der neu formalisierten Scaled-Content-Abuse-Policy und Googles Ziel, unoriginellen/unhilfreichen Content in den SERPs um 45 % zu reduzieren.
- **Einschränkung:** In den verfügbaren Quellen wurden **keine einzelnen Domain-Namen von tatsächlich bestraften Massen-KI-Content-Farmen** konsistent genannt (im Unterschied zu HouseFresh als Opfer-Beispiel) — die Berichterstattung bleibt hier bei Mustern/Aggregatzahlen, nicht bei Einzelfall-Namen mit Beleg.

**Relevanz: HOCH.** Das ist der ehrlichste und wichtigste Punkt für den Owner: Die dramatischsten Einzelfall-Zahlen (91 %, 70–100 %) sind belegt, aber die **konkreten Täternamen der bestraften Massen-Content-Farmen fehlen in der öffentlichen Berichterstattung** weitgehend — vermutlich weil betroffene Betreiber ihre Domain selten öffentlich als Scaled-Content-Abuse-Opfer outen. Das relativiert nicht das Risiko, macht es aber schwerer, 1:1-Blaupausen zu vergleichen.

---

## 7. März-2026-Update: aktuellster Beleg für fortlaufende Verschärfung

- Rollout **24.–25.03.2026**, < 20 Stunden, global, alle Sprachen/Regionen (Search Engine Journal, 24.03.2026; Google Search Status Dashboard Incident-Log).
- Keine neue Policy, sondern **SpamBrain-Nachschärfung** der bestehenden Kategorien — explizit fokussiert auf „mass-produced/programmatic thin content", „parasite SEO", **nicht** primär auf klassischen Linkspam (Reddit r/DigitalMarketing Praktiker-Analyse, 2026; als Sekundärquelle zu werten, nicht Google-Primärtext).
- Beobachtete Spannweite: **~50 % Traffic-Verlust bei betroffenen Sites**, teils bis zu Verdreifachung bei Gewinnern (Konkurrenz-Verdrängung), **20–35 % Traffic-Drops** in der Kombi-Woche Spam+Core-Update bei ca. 55 % der beobachteten Sites (ClickRank-Analyse 2026; SEO-Tool-Sekundärquelle, keine Google-Primärzahl).
- Google nennt **keine** öffentlichen Site-Namen und **keine** aggregierten Opferzahlen für dieses Update (durchgängig bestätigt über alle abgefragten Quellen).

**Relevanz: HOCH.** Das ist der stärkste Beleg dafür, dass das Thema **nicht 2024 abgeschlossen** ist — Google verschärft aktiv bis in den März 2026 hinein weiter. Für eine Planung im Juli 2026 heisst das: Das Risiko ist aktuell, nicht historisch.

---

## 8. Was Google *nicht* bestraft (Gegenprobe)

- Google bestätigt ausdrücklich: **Skalierung an sich ist nicht verboten.** Legitime, stark skalierte Inhalte (z. B. Produktkataloge, Datenbank-Listen) sind zulässig, wenn sie nutzerzentriert, korrekt, hilfreich und **originell genug** sind — z. B. mit eigenen Daten, Tests, strukturiertem Wissen (Google Spam-Policies-Doku; Search Engine Land, „Does Google's helpful content update penalize AI content?", zitiert 2024/2026-Snapshot).
- Google-Position 2026 weiterhin: **kein** automatischer Penalty allein wegen KI-Erstellung — Trigger ist Qualität/Absicht, nicht das Werkzeug (developers.google.com/search/docs/essentials/spam-policies, Stand Juli 2026).

**Relevanz: HOCH.** Das ist die entscheidende Nuance für die Owner-Entscheidung: **Nicht** "keine KI-Inhalte", sondern "**jede Seite muss echten eigenen Mehrwert haben**" (z. B. echte Scan-Daten pro Branche/Region aus `scanner/out/`, keine reinen Text-Variationen). Das deckt sich mit der bereits im System-Prompt genannten Regel "Nichts erfinden" und mit der bestehenden `scan-dataset-aggregat`-Skill-Idee (echte anonymisierte Scan-Daten als Differenzierung).

---

## Fazit für die BFSG-Fuchs-Content-Strategie (Ehrlichkeits-Check)

1. **Das Risiko ist real und aktuell** (bis in den März 2026 aktiv verschärft), nicht ein abgeschlossenes 2024er-Ereignis.
2. **Die dramatischsten Zahlen (91 %, 70–100 % Traffic-Verlust) sind belegt**, aber überwiegend an *Opfern der Verdrängung* (HouseFresh) oder an *aggregierten Mustern ohne Domain-Namen* — nicht an konkret benannten, bestraften Massen-KI-Farmen. Vorsicht vor Overclaiming in beide Richtungen.
3. **Google liefert keine Basisrate/Trefferquote** — man kann nicht seriös sagen "X % der programmatischen Sites werden bestraft". Das Risiko ist qualitativ belegt, nicht quantitativ kalibrierbar.
4. **Entscheidender Hebel:** Programmatic-/Mass-Pages für BFSG-Fuchs müssen pro Seite **echten, einzigartigen Mehrwert** liefern (z. B. echte anonymisierte Branchen-Scan-Daten, keine reinen Text-Umformulierungen einer Basisvorlage), sonst fällt das Vorhaben exakt in die Zieldefinition der Policy.

---

## Quellenliste

1. Google Search Central — Spam Policies for Google Web Search (Abschnitt "Scaled content abuse"), developers.google.com/search/docs/essentials/spam-policies, Snapshot Juli 2026
2. Google — "New ways we're tackling spammy, low-quality content on Search", blog.google/products-and-platforms/products/search/google-search-update-march-2024/, 05.03.2024
3. Google Search Central Blog — "What web creators should know about our March 2024 core update and new spam policies", developers.google.com/search/blog/2024/03/core-update-spam-policies, 05.03.2024
4. Google Search Central — Spam updates Doku, developers.google.com/search/docs/appearance/spam-updates, Snapshot 2026
5. Search Engine Land — "Google March 2024 core update: Things you need to know", searchengineland.com/google-march-2024-core-update-things-you-need-to-know-438370, März 2024
6. Search Engine Land — "Review site's Google traffic plummets amid affiliate SEO content" (HouseFresh), searchengineland.com/review-site-google-traffic-affiliate-seo-content-440143, 2024
7. HouseFresh — "How Google Decimated HouseFresh", housefresh.com/how-google-decimated-housefresh/, 2024
8. HouseFresh — "Finding helpful content in an enshittified Google", housefresh.com/finding-helpful-content-in-an-enshittified-google/, 2024
9. Lily Ray — "It works until it doesn't: AI content risks", lilyraynyc.substack.com/p/it-works-until-it-doesnt-ai-content-risks, März 2024
10. Search Engine Land — "Does Google's helpful content update penalize AI content?", searchengineland.com/does-google-helpful-content-update-penalize-ai-content-433221, 2024/Snapshot 2026
11. Search Engine Journal — "Google begins rolling out the March 2026 spam update", searchengineland.com/... bzw. searchenginejournal.com/google-begins-rolling-out-the-march-2026-spam-update/570428/, 24.03.2026
12. Google Search Status Dashboard — Incident-Log März-2026-Spam-Update, status.search.google.com/incidents/7eTbAa2jWdToLkraZj5y, 24.–25.03.2026
13. Reddit r/DigitalMarketing — "Google March 2026 spam update: a calm data-driven analysis", reddit.com/r/DigitalMarketing/comments/1s401ag/, 2026 (Sekundärquelle/Praktiker-Report, nicht Google-Primärtext)
14. ClickRank — "Google March 2026 core update", clickrank.ai/google-march-2026-core-update/, 2026 (SEO-Tool-Sekundärquelle)
15. onward.justia.com — "Google March 2026 spam update: rollout complete in just one day", 2026

*Recherche-Methode: Perplexity Sonar (Deep-Research + Ask, hoher Search-Context), 09.07.2026. Alle 2025/2026-Datumsangaben und Update-Namen stammen aus SEO-Sekundärquellen und konnten nicht 1:1 gegen ein Google-Primär-Transparenzdokument mit granularen Zahlen verifiziert werden — siehe Abschnitt 4 "Wichtige Einschränkung".*
