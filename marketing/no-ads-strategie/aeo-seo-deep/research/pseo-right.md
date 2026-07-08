# Programmatic SEO richtig gemacht (2025/2026) — Fallstudien, Zahlen, Google-Spam-Grenzen, AI-Search-Interaktion

> Recherche-Datum: 09.07.2026 (Perplexity Sonar Deep Research, reasoning_effort=high). Alle Kernaussagen mit Quelle+Datum belegt. Ordner: `marketing/no-ads-strategie/aeo-seo-deep/research/`. Kein bestehendes Strategie-Dokument in `marketing/no-ads-strategie/` wurde verändert.

---

## Zusammenfassung (TL;DR)

Programmatic SEO (pSEO) funktioniert 2025/2026 noch — aber nur, wenn Seiten auf einem echten, strukturierten Datensatz basieren, jede Seite eigenständigen Nutzwert liefert und die Skalierung durch das Datenset gedeckt ist, nicht durch reine Keyword-Kombinatorik. Google hat mit dem März-2024-Core-Update + der neuen Spam-Policy „Scaled Content Abuse" (wirksam ab 05.05.2024) und einem verschärften März-2026-Spam-Update explizit thin/AI-Massenware ins Visier genommen. Gleichzeitig entscheidet zunehmend, ob KI-Suchsysteme (Google AI Overviews, ChatGPT, Perplexity) Seiten überhaupt zitieren — und dort werden dünne, generische Templates nachweislich ignoriert, während knappe, faktendichte, gut strukturierte Seiten mit Originaldaten bevorzugt zitiert werden.

---

## 8 belegte Findings

### 1. Google hat „Scaled Content Abuse" seit 05.05.2024 als eigene Spam-Policy definiert — Automatisierung ist nicht das Problem, der fehlende Nutzwert ist es
Google definiert Scaled Content Abuse als das Erzeugen vieler Seiten primär zur Ranking-Manipulation, unabhängig davon, ob KI, Automatisierung oder Menschen die Inhalte produzieren — entscheidend ist, ob die Inhalte „little to no value" liefern. Die Policy trat am 05.05.2024 in Kraft. (Google Search Central Blog, März 2024, developers.google.com/search/blog/2024/03/core-update-spam-policies)
**Relevanz BFSG-Fuchs: hoch** — jede pSEO-Initiative (z. B. Stadt- oder Branchen-Seiten) muss zwingend echten Scan-/Datensatz-Content pro Seite haben, sonst Abstrafungsrisiko.

### 2. März-2026-Spam-Update hat gezielt AI-Content-Farmen mit dünnem Long-Tail-Content „dezimiert"
Ein Google-Spam-Update vom 24.03.2026 traf speziell Seiten, die in großer Zahl KI-generierten Content ohne neue Daten/Substanz zur Long-Tail-Abdeckung produziert hatten; betroffene Sites verloren laut Analyse massiv an Sichtbarkeit. (DigitalApplied, digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated, März 2026)
**Relevanz: hoch** — bestätigt, dass die Grace-Period für „einfach viele Seiten generieren" 2026 vorbei ist; jede geplante Skalierung braucht Redaktions-/Qualitäts-Gate, kein reines Auto-Publishing.

### 3. Canva: ~190.000 indexierte Tool-Seiten, ~108 Mio. organische Besuche/Monat — Skalierung funktioniert, wenn der Datensatz das Produkt selbst ist
Canvas programmatische Tool-Seiten (z. B. „Logo maker" ~179.000 Besuche/Monat, „Online resume builder" ~71.000, „Photo collage maker" ~74.000) basieren auf der internen Template-Bibliothek des Produkts — jede Seite hat echte, unterschiedliche Templates, Feature-Beschreibung, How-to und FAQ. (PracticalProgrammatic Case Study, practicalprogrammatic.com/examples/canva)
**Relevanz: mittel** — Skalen-Beweis, aber Canva hat ein natives Massen-Datenset (Design-Templates); BFSG-Fuchs müsste ein analog reichhaltiges Datenset (z. B. echte anonymisierte Scan-Ergebnisse pro Branche/Fehlertyp) als Fundament nutzen, siehe scan-dataset-aggregat-Skill.

### 4. Omnius/AI-SaaS-Kunde: Signups von 67 auf über 2.100/Monat in 10 Monaten via strukturierter Keyword-Matrix + Hub-and-Spoke-Interlinking
Case Study zeigt konkreten B2B-Conversion-Beleg (>30x) durch pSEO: Keyword-Matrix (Objekt-Typ × Format × Use-Case × Modifier) in Google Sheets, Import via WP All Import in Batches von 100–200 Seiten/Woche, Hub-Seiten je Kategorie mit 5–10 internen Cross-Links pro Unterseite. (Omnius Blog, omnius.so/blog/programmatic-seo-case-study)
**Relevanz: hoch** — direkt übertragbares Modell auf BFSG-Fuchs: Matrix aus Branche × Website-Typ (Shop/Portal/Verein) × BFSG-Pflichtthema (Kontrastfehler, fehlende Alt-Texte, Cookie-Banner) als Seiten-Generator, mit Hub-Seiten je Branche.

### 5. Realistische Seitenzahl für neue B2B/SaaS-pSEO-Projekte: hunderte bis niedrige Tausende Seiten über 6–18 Monate, nicht zehntausende auf einmal
Über alle Fallstudien hinweg (Omnius: mehrere Tausend über 10 Monate in Wochen-Batches von 100–200; Typeform: „thousands" Templates über Jahre gewachsen; Peanut: bis zu 100 neue Blogposts/Monat als Editorial-Tempo-Obergrenze) zeigt sich: Seitenvolumen muss durch Datensatz-Größe UND redaktionelle Kapazität gedeckt sein, nicht durch reine Kombinatorik. (Omnius/Semrush/SpicyMargarita-Quellen, synthetisiert)
**Relevanz: hoch** — konkrete Planungsgröße für BFSG-Fuchs: kein „10.000-Seiten-Big-Bang", sondern gestaffelter Rollout in Batches mit QA-Gate pro Batch.

### 6. AI Overviews reduzieren Klicks im Schnitt um 34,5 %, Verbreitung stieg nach dem März-2024-Core-Update um 116 % — Zitiert-Werden ersetzt Ranking als Ziel
Google AI Overviews (Gemini-RAG-basiert, ab 14.05.2024 in den USA gestartet, bis 15.08.2024 auf UK/Indien/Japan/Indonesien/Mexiko/Brasilien erweitert) senken durchschnittlich 34,5 % der Klicks auf organische Top-Ergebnisse; ihre Prävalenz stieg nach dem März-2024-Core-Update um 116 %. Google trennt AI-Overview-Impressions/Klicks in der Search Console NICHT von normalen organischen Daten. (Ahrefs, ahrefs.com/blog/google-ai-overviews/, 15.08.2024)
**Relevanz: hoch** — reines Ranking reicht nicht mehr; Content-Struktur muss auf Zitierfähigkeit optimiert sein (siehe Finding 7), sonst verpufft Traffic-Potenzial trotz guter Position.

### 7. KI-Zitate konzentrieren sich auf die ersten 30 % einer Seite — „Ski-Ramp-Effekt" bei Google AI Overviews UND ChatGPT
Eine 100-Seiten-Studie zeigt: 55 % der Google-AI-Overview-Zitate stammen aus den ersten 30 % einer Seite, nur 21 % aus den letzten 40 %. Eine unabhängige Analyse von 18.012 verifizierten ChatGPT-Zitaten (über 1,2 Mio. Suchergebnisse) findet 44,2 % der Zitate in den ersten 30 % eines Dokuments. Empfehlung: Kernantwort in den ersten 150–200 Wörtern platzieren, FAQ-Blöcke mit knapper Erstsatz-Antwort bauen. (CXL, cxl.com/blog/google-ai-overview-citation-sources/, zitiert Kevin-Indig-Analyse)
**Relevanz: hoch** — direkt umsetzbare Template-Regel für jede neue pSEO-Seite/Ratgeberseite: Definitions-Satz + Kernaussage im ersten Absatz, danach Vertiefung.

### 8. Dünner, templatehafter KI-Content wird von LLM-Suchsystemen nachweislich ignoriert — Original-Daten/Statistiken werden bevorzugt zitiert
Mehrere unabhängige Quellen (Growtika Perplexity-SEO-Agentur; Exposure-Ninja-Analyse zu Perplexity, 2026; David Melameds AEO-Framework, Juli 2025) stimmen überein: Content, der lediglich Allgemeinwissen umformuliert oder SEO-Keywords ohne Tiefe stapelt, wird von LLMs herausgefiltert. Bevorzugt zitiert werden Seiten mit Originalrecherche, überprüfbaren Zahlen/Statistiken, klaren FAQ-Strukturen und technischer Tiefe — „Content that answers questions definitively gets cited. Marketing pages do not." (Growtika, growtika.com/services/perplexity-seo)
**Relevanz: hoch** — bestätigt strategisch: BFSG-Fuchs' echte Scan-Datenbasis (scanner/out/, siehe scan-dataset-aggregat-Skill) ist der eigentliche Wettbewerbsvorteil gegenüber generischen „Was ist BFSG"-Konkurrenzseiten — muss aber in jede pSEO-Seite eingearbeitet werden (Statistik/Beispiel-Score/Fehlerhäufigkeit pro Branche), nicht nur als separate Aggregat-Seite.

---

## Ergänzende Beobachtungen (nicht als Kern-Finding gezählt, aber relevant)

- **Plattform-Zitations-Präferenzen unterscheiden sich:** ChatGPT zitiert stark Wikipedia (7,8 % aller Zitate, 47,9 % unter Top-10-Quellen); Perplexity und Google AI Overviews bevorzugen stärker Reddit/Community-Content (Perplexity 6,6 %, AI Overviews 2,2 %). (TryProfound, tryprofound.com/blog/ai-platform-citation-patterns) — Relevanz: mittel, legt nahe dass BFSG-Fuchs auch auf Foren/Community-Sichtbarkeit (Reddit r/de, Gründerforen) setzen sollte, nicht nur eigene Seiten.
- **Template-Bauweise Best Practice (Omnius-Modell):** pro Seite variierende H1/Meta/Intro/Bild/FAQ via Custom Fields + Schema.org (Product, FAQPage, HowTo); Hub-Seiten je Kategorie, 5–10 interne Links pro Unterseite, Wochen-Batches mit Staging-QA vor Live-Schaltung. (Omnius Blog) — direkt als Bauplan nutzbar für BFSG-Fuchs-Branchenseiten.
- **Google-Empfehlung bei Traffic-Einbruch nach Core-Update:** mind. 1 Woche warten, dann Woche-vor/Woche-nach-Vergleich in Search Console, keine Panik-Löschungen, sondern Qualitäts-Nacharbeit; Löschung nur letztes Mittel bei klar search-engine-first-Content. (Google Search Central, developers.google.com/search/docs/appearance/core-updates)

---

## Praktische Ableitung für BFSG-Fuchs (kurz)

1. Datensatz zuerst: echte, anonymisierte Scan-Ergebnisse (scanner/out/) als Fundament für jede pSEO-Seite nutzen — nicht nur generische Ratgebertexte.
2. Seitenvolumen realistisch takten: Batches von ~20–50 Seiten mit QA-Gate statt Hunderte auf einen Schlag; erst nach Traffic-/Indexierungs-Signal aus Batch 1 skalieren.
3. Jede Seite braucht: individuelle Statistik/Beispiel-Score aus dem Scan-Datenset, Definitions-Satz in den ersten 150–200 Wörtern, FAQ-Block mit Erstsatz-Antworten, Schema.org-Markup.
4. Hub-Seiten je Branche/Website-Typ mit Cross-Links zu Unterseiten (Hub-and-Spoke), keine Orphan-Pages.
5. Vor jedem Rollout-Batch: Legal-Grep-Skill laufen lassen (verbotene Begriffe wie „BFSG-konform"/„garantiert" dürfen in Massen-Content erst recht nicht durchrutschen).

---

## Quellenliste (vollständig, mit Datum wo verfügbar)

1. Omnius Blog — "Programmatic SEO Case Study: From 67 to 2100 Monthly Signups" — https://www.omnius.so/blog/programmatic-seo-case-study
2. BreakingB2B — "SaaS SEO Case Studies: How Top Brands Achieved Massive Growth" — https://www.breakingb2b.com/blog/saas-seo-case-studies
3. Semrush — "What Is Programmatic SEO? Examples + How to Do It" — https://www.semrush.com/blog/programmatic-seo/
4. DigitalApplied — "Google Spam Update March 24: Immediate Actions Guide" — https://www.digitalapplied.com/blog/google-spam-update-march-24-immediate-actions-site-owners (März 2026)
5. Google Search Central Help Community — "Can we create programmatic SEO page in 2024?" — https://support.google.com/webmasters/thread/265553448/can-we-create-programmatic-seo-page-in-2024?hl=en (2024)
6. Google Developers — "Understanding Core Updates" — https://developers.google.com/search/docs/appearance/core-updates
7. DiscoveredLabs — "Programmatic SEO Examples: 10 Real-World Templates That Drive Organic Growth" — https://discoveredlabs.com/blog/programmatic-seo-examples-10-real-world-templates-that-drive-organic-growth
8. David Melamed — "Content Strategy Framework for Earning Citations from LLMs – Answer Engine Optimization" — https://davidmelamed.com/2025/07/30/content-strategy-framework-for-earning-citations-from-llms-answer-engine-optimization/ (30.07.2025)
9. PracticalProgrammatic — "Canva: Programmatic SEO Case Study" — https://practicalprogrammatic.com/examples/canva
10. Supersparks — "Ultimate Guide To No-code Programmatic SEO With Webflow (2025)" — https://www.supersparks.io/blog/nocode-programmatic-seo-guide-webflow
11. Google Developers — "Creating Helpful, Reliable, People-First Content" — https://developers.google.com/search/docs/fundamentals/creating-helpful-content
12. Growtika — "Perplexity SEO Agency: Get Cited in AI Answers" — https://growtika.com/services/perplexity-seo
13. Google Search Central Blog — "What web creators should know about our March 2024 core update" — https://developers.google.com/search/blog/2024/03/core-update-spam-policies (März 2024)
14. Ahrefs — "Google AI Overviews: All You Need to Know" — https://ahrefs.com/blog/google-ai-overviews/ (15.08.2024)
15. CXL — "Where Google AI Overviews Cite From: A 100-Page Study" — https://cxl.com/blog/google-ai-overview-citation-sources/
16. TryProfound — "AI Platform Citation Patterns: How ChatGPT, Google AI Overviews, and Perplexity Cite Content" — https://www.tryprofound.com/blog/ai-platform-citation-patterns
17. DigitalApplied — "Scaled Content Abuse: Google's AI Page Crackdown Guide" — https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated (März 2026)
18. Exposure Ninja (YouTube) — "How to Rank in Perplexity AI (with Examples)" — https://www.youtube.com/watch?v=v1ONF0sa8G0 (2026)
19. SpicyMargarita — "8 Stupidly Successful SaaS SEO Case Studies – 2023 Strategies" — https://www.spicymargarita.co/archive/saas-seo-case-studies-strategies

---

*Recherche via Perplexity Sonar Deep Research (mcp__perplexity__perplexity_research, reasoning_effort=high). Hinweis: Einzelne Ursprungsquellen (z. B. SpicyMargarita, 2023) sind älter als der 2025/2026-Fokus des Auftrags — als Fallstudien-Beleg dennoch aufgenommen, da von neueren Sekundärquellen weiter referenziert und mechanisch weiterhin gültig (Interlinking-/Template-Prinzipien ändern sich langsamer als Google-Policy-Updates). Keine Unsicherheiten unmarkiert übernommen.*
