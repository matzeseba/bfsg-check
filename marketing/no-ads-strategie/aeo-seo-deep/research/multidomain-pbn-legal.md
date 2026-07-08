# Adversarial-Check: Multi-Domain-Mass-Content-Strategie (BFSG-Fuchs)

**Auftrag:** Risiken von (a) hunderten Seiten auf Zweit-/Backup-Domains derselben Marke, die zur Hauptdomain verlinken/funneln, aus Google-Sicht (Doorway/PBN/Cross-Domain-Duplicate/Crawl-Budget) — kann das die Hauptdomain mitreissen? Und (b) rechtliches Risiko für einen Compliance-Anbieter bei massengeneriertem Rechts-Content (UWG, Impressumspflicht pro Domain).

**Recherche-Methode:** Perplexity Deep-Research + Sonar Pro (web-grounded), Stand der Quellen 2024–2026. Wo unklar/nicht belegt, ist es explizit markiert.

**Kontext BFSG-Fuchs:** Primärdomain bfsg-fuchs.de, Parallel-Domain bfsg-fix.de läuft im selben Caddy-Block und kanonisiert bereits auf bfsg-fuchs.de; vermutlich weitere Domain barrierefrei-pruefen.de (Redirect). Die im Auftrag angefragte "Hunderte-Seiten-auf-Backup-Domains"-Strategie ist aktuell **nicht** umgesetzt (nur 15+ SEO-Seiten, alle auf der Hauptdomain) — dieser Check ist eine Vorab-Risikoprüfung, bevor eine solche Strategie überhaupt gebaut wird.

---

## Teil A — SEO/Google-Risiko (Multi-Domain-Mass-Content)

### Finding 1 — Google klassifiziert "Backup-Domains mit Massen-Content, die zur Haupt-Domain funneln" explizit als Doorway- und Scaled-Content-Abuse-Muster
Googles Search-Central-Spam-Policies (seit März 2024 um die Kategorie "Scaled Content Abuse" erweitert) definieren genau dieses Muster: viele Seiten mit geringer Differenzierung, primär erstellt, um Rankings zu manipulieren, nicht um Nutzern zu helfen. Doorway-Abuse deckt zusätzlich Netzwerke ab, deren einziger Zweck ist, für Suchbegriffe zu ranken und Nutzer zu einer zentralen Zieldomain zu leiten (Quelle: breaklineagency.com/guide-to-googles-scaled-content-abuse, digitalapplied.com, März 2024/2025-Updates; Perplexity-Recherche 09.07.2026).
**Relevanz BFSG-Fuchs: HOCH** — genau das im Auftrag beschriebene Szenario (Hunderte Seiten auf Zweit-Domains, die zur Hauptdomain funneln) ist ein Lehrbuchbeispiel für dieses Google-Enforcement-Ziel.

### Finding 2 — Das Risiko ist NICHT auf die Zweit-Domain begrenzt: Google kann die Haupt-/Zieldomain algorithmisch abwerten oder mit einer manuellen Massnahme belegen
Mehrere 2024–2026-Quellen zu PBN- und Link-Scheme-Enforcement stellen übereinstimmend fest: Wird ein Netzwerk erkannt, trifft die Strafe typischerweise die "Money-Site" (das Ziel der Links), nicht nur die Satelliten — entweder algorithmisch (SpamBrain entwertet die Linksignale, Rankings fallen ohne sichtbare Warnung in der Search Console) oder manuell ("Unnatural Links"-Action, die praktisch site-weit wirkt bis zur Bereinigung) (Quellen: zayanhassan.com/pbn-link-building-2026, reportcard.com/blog/pbn-backlinks, respona.com/blog/pbn-backlinks; Perplexity 09.07.2026).
**Relevanz BFSG-Fuchs: HOCH** — die Hauptdomain bfsg-fuchs.de (Umsatzträger) ist damit direkt exponiert, nicht nur die Zweit-Domain(s).

### Finding 3 — Skalenfaktor entscheidet: eine Handvoll Redundanz-/Markenschutz-Domains wird meist ignoriert, "Hunderte" Seiten überschreiten klar die Schwelle
Die Recherche betont explizit: kleine Mengen brand-protection-motivierter Duplikate werden von Google typischerweise ignoriert; "Hunderte" templatebasierte, gering differenzierte Seiten treffen exakt die "scaled"- und "doorway"-Schwellen der 2024–2026-Policy-Dokumente (Quelle: Google Search Central Spam-Policy-Zusammenfassungen, Perplexity 09.07.2026).
**Relevanz BFSG-Fuchs: HOCH** — der im Auftrag beschriebene Umfang ("hunderte Seiten") liegt im Hochrisikobereich, nicht im tolerierten Bereich.

### Finding 4 — Google-eigene Doku (Discover/Core-Update Feb. 2026) nennt "duplicate content and multiple site issues" explizit als aktives Fokusthema
Ein Google-Search-Central-Blogpost vom Februar 2026 (developers.google.com/search/blog/2026/02/discover-core-update) hebt "duplicate content and multiple site issues" als wiederkehrendes Problemfeld hervor, das zu reduzierter Sichtbarkeit führen kann (Perplexity 09.07.2026, Quelle direkt von Google).
**Relevanz BFSG-Fuchs: MITTEL** — bestätigt, dass das Thema 2026 aktuell auf Googles Radar ist, ist aber allgemeine Policy-Kommunikation, kein branchenspezifischer Beleg.

### Finding 5 — Cross-Domain-Duplicate-Content ohne Canonical/301 führt primär zu algorithmischer Verwässerung (Cannibalization), nicht zwingend zu einer manuellen Massnahme — ABER die Grenze zu Doorway ist fliessend
Ohne rel=canonical oder 301-Redirect wählt Google selbst eine bevorzugte Version aus; die andere(n) werden de-priorisiert, Crawl-Budget wird auf redundante Seiten verschwendet, Rankings konkurrieren sich gegenseitig ("Cannibalization"). Das ist zunächst "nur" algorithmisch und schwächt Performance, keine harte Strafe. Sobald aber das Muster wie ein gezieltes Doorway-/Spam-Netzwerk aussieht (viele dünne, fast identische Seiten + gezieltes internes Cross-Linking + Intent zur Signal-Bündelung), wird daraus laut Recherche potenziell eine manuelle Spam-Massnahme (Quelle: Perplexity-Synthese aus Google-Canonical-Doku + SEO-Recovery-Guides, 09.07.2026).
**Relevanz BFSG-Fuchs: HOCH** — das aktuelle Setup (bfsg-fix.de kanonisiert bereits auf bfsg-fuchs.de) ist der sichere Weg; eine geplante Ausweitung auf "Hunderte Seiten" auf einer Zweit-Domain OHNE sauberes Canonical/301-Konzept wäre der Weg ins Risiko.

### Finding 6 — Fehlende dokumentierte Präzedenzfälle für exakt dieses Szenario: Aussagen sind Policy-Interpretation, keine bestätigten Einzelfälle
Die Recherche liefert **keine** öffentlich dokumentierten, namentlich benannten Fälle, bei denen exakt "Marke X betrieb Backup-Domain Y mit Hunderten Duplikat-Seiten → Hauptdomain Z wurde bestraft" 1:1 nachvollziehbar ist. Die Schlussfolgerungen stützen sich auf Googles allgemeine Policy-Texte, PBN-Recovery-Case-Studies (generisch) und SEO-Agentur-Analysen, nicht auf ein Gerichtsurteil oder eine öffentlich bestätigte Google-Aussage zu einem konkreten Fall (Perplexity-Recherche 09.07.2026, explizit als Lücke benannt).
**Relevanz BFSG-Fuchs: MITTEL** — das Risiko ist plausibel und policy-konsistent hergeleitet, aber nicht mit einem "Smoking Gun"-Fall belegt. Für eine Owner-Entscheidung heisst das: Vorsicht ist geboten, aber die Aussage "das killt garantiert die Hauptdomain" ist nicht 1:1 belegbar — nur "das ist ein reales, ernstzunehmendes Risiko laut Policy".

### Finding 7 — Praxisempfehlung aus der Recherche deckt sich mit dem bereits gewählten Ansatz: EIN Haupt-Suchbrand, Zweit-Domains 301/Canonical, KEINE Content-Duplizierung in der Fläche
Die Recherche empfiehlt konsistent: eine Domain als "Such-Marke" festlegen, Zweit-Domains entweder komplett per 301 auf die Hauptdomain umleiten oder — falls Content live bleiben muss — sauber cross-domain kanonisieren; keine Netzwerke aus vielen ähnlichen Seiten zur Signalbündelung aufbauen (Perplexity 09.07.2026).
**Relevanz BFSG-Fuchs: HOCH** — bestätigt: das aktuelle Setup (bfsg-fix.de → kanonisiert auf bfsg-fuchs.de) ist der Google-konforme Weg. Eine "Hunderte-Seiten-Mass-Content-auf-Zweit-Domain"-Strategie würde dieses saubere Setup konterkarieren und wäre ein Rückschritt ins Risiko.

---

## Teil B — Rechtliches Risiko Deutschland (Compliance-Anbieter + Massen-Content)

### Finding 8 — UWG §5-Irreführung: fehlerhafte Rechtsaussagen in automatisiert generiertem Marketing-Content werden dem Betreiber voll zugerechnet, KI-Ausrede zählt nicht
Ein LG-Kiel-Urteil (29.02.2024, Az. 6 O 151/23) bejaht die Störerhaftung eines Betreibers für geschäftsschädigende Falschinformationen einer fehleranfällig programmierten KI. Ein kanadisches Präzedenz-Urteil (Civil Resolution Tribunal, 14.02.2024, BCCRT 149) stellt zusätzlich klar: "die KI hat das gesagt" schützt nicht vor Haftung — der KI-Output bindet das Unternehmen wie eine reguläre Aussage auf der Website (Quelle: datenschutzticker.de, 2025; Perplexity 09.07.2026).
**Relevanz BFSG-Fuchs: HOCH** — bei massengeneriertem Content mit Aussagen zu BFSG-Pflichten/Fristen/Ausnahmen (z. B. Kleinstunternehmer-Regel, Stichtag 28.06.2025) haftet BFSG-Fuchs für jeden Fehler, unabhängig davon, dass der Content KI-gestützt entsteht.

### Finding 9 — Rechtsdienstleistungsgesetz (RDG) über §3a UWG: die Grenze zwischen "allgemeine Rechtsinformation" (erlaubt) und "Einzelfall-Rechtsberatung" (nur mit Zulassung) ist eng und wird bei automatisiertem Content leicht überschritten
Juristische Ausbildungsmaterialien (Skript-UWG-2026, Uni Mainz) bestätigen: RDG-Verstösse sind über §3a UWG abmahnfähig. Kritisch wird automatisierter Content, sobald er über generische Information hinausgeht in Richtung konkreter Einzelfall-Bewertung ("Ihr Shop ist BFSG-konform", "Sie brauchen keinen Audit, weil..."). Ein Disclaimer ("keine Rechtsberatung im Sinne des RDG") schützt nicht, wenn der Inhalt materiell doch eine Rechtsberatung ist — entscheidend ist der Inhalt, nicht die Überschrift (Perplexity 09.07.2026, mehrere Quellen konsistent).
**Relevanz BFSG-Fuchs: HOCH** — bei Skalierung auf hunderte SEO-Seiten mit Rechtsaussagen steigt das Risiko, dass generische Templates unbeabsichtigt in Einzelfall-Bewertungen abrutschen (z. B. durch KI-generierte "Ist Ihre Branche betroffen?"-Absätze).

### Finding 10 — Impressumspflicht (§5 DDG, Nachfolgenorm zu §5 TMG): gilt PRO geschäftlich genutzter Domain — ein gemeinsames Impressum für mehrere Domains ist nur zulässig, wenn Anbieter-Identität für Nutzer klar erkennbar bleibt
Die Recherche bestätigt: jede geschäftsmässige Online-Präsenz (Website, Landingpage, Zweit-Domain) braucht eine erkennbare, in max. 2 Klicks erreichbare Anbieterkennzeichnung. Mehrere Domains dürfen auf ein gemeinsames Impressum verweisen, WENN der tatsächliche Anbieter identisch und die Zuordnung für Nutzer eindeutig ist. Fehlt diese Zuordnung bei Satelliten-/Landingpage-Domains, ist das ein eigenständig abmahnfähiger Verstoss — von Abmahnvereinen und Mitbewerbern laut Recherche regelmässig genutzt (Quelle: e-recht24.de, qualimero.com/blog/shopify-impressum; Perplexity 09.07.2026).
**Relevanz BFSG-Fuchs: HOCH** — bei mehreren Domains (bfsg-fuchs.de, bfsg-fix.de, ggf. barrierefrei-pruefen.de) muss auf JEDER geschäftlich aktiven Domain ein korrektes, klar zugeordnetes Impressum liegen bzw. sauber weiterleiten — sonst eigenständiges Abmahnrisiko zusätzlich zum SEO-Risiko.

### Finding 11 — Keine dokumentierten Präzedenzfälle 2024–2026 speziell gegen "SEO-KI-Rechtsratgeber" im BFSG/WCAG-Kontext — Analogie-Fälle (KI-Chatbot-Werbung, Google-KI-Übersichten) zeigen aber eine klare Haftungstendenz
Die Recherche findet explizit **keine** öffentlich dokumentierte Abmahnwelle speziell gegen automatisiert generierten BFSG/WCAG-Rechtscontent. Die vorhandenen Präzedenzfälle (LG Kiel, LG München I ./. Google-KI-Suchübersichten, kanadisches Chatbot-Urteil) betreffen KI-Fehlinformationen allgemein, nicht branchenspezifisch Compliance-Marketing. Die juristische Ableitung "gleiche Prinzipien gelten auch hier" ist plausibel, aber nicht durch einen identischen Fall bestätigt (Perplexity 09.07.2026, Lücke explizit benannt).
**Relevanz BFSG-Fuchs: MITTEL** — Risiko ist real und mit Nachbar-Präzedenzfällen unterlegt, aber "noch niemand wurde exakt dafür abgemahnt" heisst nicht "es ist sicher" — eher: das Zeitfenster bis zum ersten Präzedenzfall in genau dieser Nische ist möglicherweise noch offen, was gleichzeitig ein Erstrisiko UND ein zeitlich begrenztes Gelegenheitsfenster sein kann.

### Finding 12 — Werbekennzeichnung/Schleichwerbung: Massen-Content, der sich als "neutraler Rechtsratgeber" tarnt, aber faktisch Lead-Gen für eigene Produkte ist, kann als Schleichwerbung gewertet werden — bei klar erkennbarer Marken-Domain meist unkritisch
Solange die Domain klar dem Anbieter zugeordnet ist (z. B. "bfsg-fuchs.de/ratgeber/..."), ist der werbliche Charakter meist evident und braucht kein separates "Anzeige"-Label. Kritisch wird es nur, wenn Content pseudo-neutral als "unabhängige Analyse" auftritt (§5a Abs. 4 UWG), was bei markeneigenen Ratgeberseiten untypisch, bei "neutral wirkenden" Zweit-Domains-ohne-erkennbaren-Markenbezug aber ein zusätzliches Risiko wäre (Perplexity 09.07.2026).
**Relevanz BFSG-Fuchs: NIEDRIG** — solange alle Domains klar als BFSG-Fuchs-Eigentum erkennbar bleiben (Branding, Impressum, Footer-Link), ist dieses Einzelrisiko gering; würde aber bei "neutral getarnten" Zweit-Domains ohne Markenbezug zum echten Problem.

---

## Fazit / Einordnung für die Owner-Entscheidung

**Die im ursprünglichen Auftrag angefragte Strategie ("Hunderte Seiten auf Zweit-/Backup-Domains, die zur Hauptdomain funneln") ist auf BEIDEN geprüften Achsen hochriskant:**

1. **SEO-Achse:** Das Muster trifft laut Google-eigener Policy-Sprache (Scaled Content Abuse, Doorway Abuse, seit März 2024, verschärft 2025/2026) exakt das, was Google explizit bekämpft — und das Risiko trifft potenziell die Hauptdomain (bfsg-fuchs.de), nicht nur die Zweit-Domain. Kein dokumentierter 1:1-Präzedenzfall, aber konsistente Policy-Herleitung von mehreren unabhängigen Quellen (Findings 1–3, 5).
2. **Rechts-Achse:** Massengenerierter Rechts-Content als Compliance-Anbieter erhöht das UWG-§5-Irreführungsrisiko und die RDG-Grenzüberschreitungsgefahr proportional zur Content-Menge — bei gleichzeitig ungeklärter Impressumspflicht pro Domain (Findings 8–10).

**Was laut Recherche NICHT riskant ist** und bereits so umgesetzt wird: eine Hauptdomain (bfsg-fuchs.de) + eine Parallel-Domain, die technisch sauber kanonisiert (bfsg-fix.de). Das ist der von der Recherche empfohlene sichere Pfad (Finding 7) — eine Ausweitung in Richtung "viele Zweit-Domains mit eigenem Massen-Content" wäre der Bruch mit diesem sicheren Muster.

**Empfehlung (aus der Recherche abgeleitet, keine Rechtsberatung):** Falls die Mass-Content-Strategie weiterverfolgt wird, dann NUR auf der Hauptdomain selbst skalieren (mehr Seiten auf bfsg-fuchs.de), nicht über zusätzliche Zweit-Domains mit eigenem Content-Korpus. Jede zusätzliche Domain braucht eigenes/korrekt zugeordnetes Impressum + sauberes 301/Canonical-Konzept, kein eigenständiges Content-Volumen.

---

## Quellenliste (Auswahl, mit Datum lt. Perplexity-Recherche 09.07.2026)

- Google Search Central, "Discover/Core Update" Blogpost, Februar 2026 — developers.google.com/search/blog/2026/02/discover-core-update
- breaklineagency.com/guide-to-googles-scaled-content-abuse (2024–2025)
- digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated (März 2024)
- zayanhassan.com/pbn-link-building-2026
- reportcard.com/blog/pbn-backlinks
- respona.com/blog/pbn-backlinks
- digicobweb.com/google-march-2026-spam-update-guide
- seo-kreativ.de/en/blog/google-march-2026-spam-update
- searchenginesdaily.com/google-algorithm-updates/site-reputation-abuse-sra-algorithm-update
- LG Kiel, Urteil vom 29.02.2024, Az. 6 O 151/23 (zitiert via datenschutzticker.de, 2025)
- Civil Resolution Tribunal Kanada, 14.02.2024, BCCRT 149 (Air-Canada-Chatbot-Fall)
- Skript-UWG-2026, Uni Mainz (oechsler.jura.uni-mainz.de) — RDG/§3a UWG
- e-recht24.de/online-marketing/13490-social-media-fuer-handwerker.html — Impressumspflicht/Werbekennzeichnung
- qualimero.com/blog/shopify-impressum — Impressumspflicht Onlineshop/BFSG-Stichtag
- datenschutz-generator.de/ki-transparenz — KI-VO/AI-Act Kennzeichnungspflicht

**Ausdrücklich benannte Recherche-Lücken:** Kein 1:1-dokumentierter Präzedenzfall "Marke mit Backup-Domain-Netzwerk → Hauptdomain bestraft"; kein dokumentierter Präzedenzfall "Compliance-Anbieter wegen Massen-SEO-Rechtscontent abgemahnt". Beide Risikoeinschätzungen sind Policy-/Analogie-Herleitungen, keine bestätigten Einzelfälle — im Bericht entsprechend als HOCH (Policy-Beleg stark) bzw. MITTEL (kein Direktfall) markiert.
