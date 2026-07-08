# Entwurf: Product-Led-Distribution für BFSG-Fuchs

**Erstellt:** 08.07.2026 · **Rolle:** Senior-Growth-Stratege, Blickwinkel „Product-Led-Distribution"
**Pflicht-Grundlage:** `marketing/no-ads-strategie/synthese.md` + Recherche-Berichte `distribution-as-product.md`, `leadgen-ohne-ads.md`, `wettbewerber-teardown.md`, `partner-channel.md` (alle Stand 08.07.2026)
**Auftrag:** Schwerpunkt Product-Led-Distribution (Free-Tool-Ausbau, Chrome-Extension, WordPress-Plugin, Score-Badge, Marktplatz-Listings), priorisiert nach dem, was Claude Code größtenteils selbst bauen kann.

---

## Positionierung / Story

**„Das Produkt ist der Kanal."**

BFSG-Fuchs verkauft heute bereits einen Gratis-Scan als Lead-Magnet — aber der Scan selbst verlässt nie die eigene Domain. Jeder andere Marketing-Kanal (SEO, PR, Directories) muss Traffic aktiv *zu* bfsg-fuchs.de holen. Product-Led-Distribution dreht das um: Wir bauen Artefakte, die auf *fremden* Websites, in *fremden* Verzeichnissen und in *fremden* Suchergebnissen sichtbar sind und von dort aus zurückverlinken — ohne dass wir dafür einen einzigen Euro Media-Budget einsetzen.

Der Fuchs „Filo" wird dabei zum wiedererkennbaren Vertrauens-Signal: nicht nur auf unserer eigenen Landingpage, sondern auf jeder Website, die einen BFSG-Fuchs-Score-Badge trägt, in jedem WordPress-Verzeichnis-Eintrag, in jeder Marktplatz-Bewertung.

**Warum das strukturell zu uns passt (Finding 11+12, distribution-as-product.md):**
Der Gratis-Scan-Funnel (URL → Score → E-Mail) ist bei HubSpot Website Grader nachweislich viral gewachsen (1 → 2 Mio. geprüfte URLs in 7 Monaten organisch, hubspot.com/blog/bid/5539, ca. 2008) und Trust-Badges liefern direkt messbaren Conversion-Uplift auf der *Kundenwebsite* (+30 % Conversion, +16 % Traffic bei Trustpilot-Widget-Einbindung, business.trustpilot.com/customer-stories). Beides sind bewährte Mechanismen, keine Experimente — wir müssen sie nur aus unserer eigenen Domain heraustragen.

**Warum das gerade jetzt eine Lücke ist (Finding 6, wettbewerber-teardown.md):**
Von den 10+ identifizierten deutschen BFSG-Scanner-Konkurrenten betreibt laut Recherche *keiner* eine Chrome-Extension oder ein systematisches Score-Badge-Programm; nur AccessGO hat ein WordPress-Plugin, positioniert sich dort aber als Overlay-Alternative, nicht als „Scan + Report"-Tool (Finding 5). Der Gratis-Scan-*Mechanismus* selbst ist Kategorie-Standard (Finding 13, synthese.md) — die *Distribution dieses Mechanismus über fremde Oberflächen* ist es noch nicht.

**Kernprinzip für die Priorisierung:** Jedes Artefakt muss (a) zu >80 % von Claude Code buildbar sein (Code, Content, Konfiguration), (b) beim Launch bereits einen Rückverweis/Backlink zu bfsg-fuchs.de tragen, und (c) idealerweise an das bestehende Re-Check-Abo gekoppelt sein, damit Distribution und wiederkehrender Umsatz sich gegenseitig verstärken.

---

## Die 5 Kern-Kanäle

### Kanal 1 — BFSG-Fuchs-Score-Badge (höchste Priorität, sofort)

**Was:** Ein eingebettetes JS-Snippet (`<script src="badge.bfsg-fuchs.de/embed.js" data-domain="...">`), das nach einem bezahlten Scan automatisch generiert wird und auf der Kundenwebsite ein kleines, animiertes Badge zeigt: „Barrierefreiheit geprüft von BFSG-Fuchs · Score: X/100 · Zuletzt geprüft: [Datum]". Klick führt zurück auf einen individuellen Report-Landingpage-Slug (`bfsg-fuchs.de/geprueft/<domain>`) — das ist der Backlink.

**Warum Priorität 1 (Aufwand-Ertrag, distribution-as-product.md, Tabelle):** Von allen vier untersuchten Formaten (Extension, Plugin, Free-Checker, Badge) hat die Recherche das Badge explizit als „bestes Aufwand-Ertrag-Verhältnis für nächsten Schritt" eingestuft — niedrig-mittlerer Aufwand (Grafik + Prüfprozess-Kopplung), mittel-hoher Ertrag bei seriöser Grundlage.

**Der eingebaute Umsatz-Mechanismus:** Das Badge zieht seinen Status live per JS von unserer API — kein statisches Bild. Läuft das Re-Check-Abo aus, verblasst das Badge nach 6 Monaten sichtbar zu „Zuletzt geprüft vor >6 Monaten" (grau statt grün). Das macht das Re-Check-Abo (24,99 €/Monat bzw. 249 €/Jahr) zum eingebauten Upsell — der Kunde will nicht, dass sein eigenes Vertrauens-Signal auf der eigenen Website verblasst. Das ist eine direkte Umsetzung von Finding im wettbewerber-teardown/distribution-as-product-Bericht: „Score-Badges, wenn sie an echte, wiederkehrende Prüfprozesse gekoppelt sind, haben Potenzial für wiederkehrende Erlöse via Re-Zertifizierung."

**Was Claude Code baut:** Embed-JS + Backend-Endpoint im bestehenden Scanner (Express/Node — Stack ist vorhanden), Report-Landingpage-Template (Next.js, Stack ist vorhanden), Einbindung des Snippets in den Post-Kauf-E-Mail-Flow (Mailer existiert bereits).
**Was der Owner tut:** Freigabe des Badge-Designs (Filo-Branding), Testing auf 2–3 echten Kundenseiten vor Rollout.

**Rechtlicher Frame (Pflicht):** Text muss klar „automatisierte technische Analyse" / Datum kommunizieren, keinesfalls „barrierefrei" oder „konform" behaupten (UWG §5) — Badge-Copy läuft vor Launch durch `legal-copy-grep`-Skill. Wichtig auch zur Abgrenzung von Overlay-Anbietern (FTC-Strafe gegen AccessiBe, 1 Mio. USD, Januar 2025, wettbewerber-teardown.md Finding 4/7): Das Badge zeigt einen Scan-*Status*, es behauptet nie, die Website barrierefrei zu *machen*.

---

### Kanal 2 — WordPress-Plugin „Scan + Report" (Priorität 2, Start ab Woche 2)

**Was:** Ein schlankes, kostenloses WordPress.org-Plugin, das (a) einen Scan-Trigger-Button im WP-Admin bereitstellt, (b) das Score-Badge aus Kanal 1 per Shortcode einbindbar macht, (c) bei Klick auf „Vollreport anfordern" zum bezahlten Funnel auf bfsg-fuchs.de verlinkt. Kein Overlay, keine automatischen Fixes — bewusste Abgrenzung von AccessiBe/UserWay/AccessGO.

**Warum Priorität 2 (Finding 8, partner-channel.md):** WordPress.org erhebt 0 % Plattform-Fee, Erstzulassung typischerweise 2–10 Tage. Für ein Nischen-Compliance-Plugin ist der Markt laut Recherche „kaum belegte deutsche BFSG-spezifische Konkurrenz" — mit einer wichtigen Einschränkung: AccessGO ist bereits im Verzeichnis gelistet (wettbewerber-teardown.md Finding 5), positioniert sich dort aber klar als Overlay-Ersatz. Unsere Differenzierung „Scan + Report, kein Overlay" muss im Plugin-Titel/-Beschreibung von Tag 1 an explizit sein, um nicht im selben Suchraum unterzugehen.

**Was Claude Code baut:** PHP-Plugin-Grundgerüst (Shortcode, Admin-Settings-Seite, REST-API-Call zum bestehenden Scanner-Backend), Plugin-Readme nach WordPress-Plugin-Handbook-Standard, Sicherheits-Grundpraxis (Nonces, Capability-Checks, Prepared Statements — Pflicht für Review-Bestehen).
**Was der Owner tut:** WordPress.org-Entwickler-Account-Verifizierung (Identitätsprüfung ist nicht automatisierbar), finale Freigabe vor Einreichung, spätere Reaktion auf Nutzer-Support-Anfragen im Plugin-Forum.

**Aufwand laut Recherche-Tabelle (distribution-as-product.md):** initial 20–40 h, danach ~1 h/Woche laufende Pflege — das ist der aufwändigste der 5 Kanäle, aber vollständig Claude-Code-buildbar bis auf die Account-Verifizierung.

---

### Kanal 3 — Programmatic-SEO als Free-Tool-Ausbau (Priorität 3, laufend)

**Was:** Systematischer Ausbau der bereits 15+ live SEO-Ratgeberseiten um Branchen×Anwendungsfall-Kombinationen im Hub-and-Spoke-Muster („BFSG-Compliance" als Pillar → „BFSG für Online-Shops", „BFSG für Kommunen", „BFSG für Steuerkanzleien" als Spokes), jede Seite mit eigenem eingebetteten Mini-Funnel zum Gratis-Scan. Zusätzlich: der laut wettbewerber-teardown.md Finding 4 identifizierte eigene Content-Lücken-Artikel „Warum Overlay-Widgets nicht reichen" (behördenbasiert, § 6 UWG-konform vergleichend).

**Warum das zum Free-Tool-Gedanken gehört, nicht nur zu klassischem SEO:** Jede neue Landingpage ist kein reiner Content-Artikel, sondern trägt den Gratis-Scan als eingebettetes Werkzeug direkt auf der Seite (nicht nur verlinkt) — das ist der Unterschied zu reinem Blog-Content und macht die Seite selbst zum Distributions-Artefakt.

**Beleg für Skalierbarkeit (Finding 1, leadgen-ohne-ads.md):** Omnius-Fallstudie zeigt 67 → 2.100+ monatliche Sign-ups in 10 Monaten (>30×) durch genau dieses Muster — mit der expliziten Einschränkung, dass es nur funktioniert, wenn jede Seite echten Mehrwert bietet statt reinem Variablen-Austausch.

**Was Claude Code baut:** Next.js-Seiten-Templates (Stack vorhanden, bereits 15+ Beispiele im Repo), Content-Recherche via Perplexity, Schema.org-Markup (FAQPage/SoftwareApplication — laut Finding 20, synthese.md, +19,72 % AI-Overview-Sichtbarkeit bei SchemaApp-Rollout), interne Verlinkung.
**Was der Owner tut:** Stichproben-Freigabe vor Publish (rechtliche Formulierungen, Tonalität), keine laufende Beteiligung nötig.

---

### Kanal 4 — Marktplatz-/Directory-Listings mit systematischer Review-Pflege (Priorität 4, laufend)

**Was:** Aktive Pflege der bereits vorhandenen G2- und SaaSHub-Accounts plus Neuanlage bei OMR Reviews und Capterra (ohne Pay-to-Play-Plätze, siehe Finding 8, leadgen-ohne-ads.md) — inklusive automatisierter Post-Kauf-E-Mail mit direktem Review-Link, konsistent für jeden zahlenden Kunden.

**Warum das hierher gehört (nicht nur klassisches Listing):** Jeder Directory-Eintrag ist wie das Badge ein Artefakt außerhalb unserer eigenen Domain, das Trust signalisiert und einen Backlink trägt — WordPress.org selbst ist im Übrigen auch ein Directory (Kanal 2 zahlt hier doppelt ein).

**Ziel laut Recherche (Finding 6, leadgen-ohne-ads.md):** ~100 Reviews als langfristige Zielgröße, 3–4 neue 5-Sterne-Bewertungen/Monat als Kadenz, jede kritische Review individuell beantworten. Bei unserer aktuellen, noch kleinen Kundenzahl ist „100 Reviews" ein Mehrjahres-Ziel — realistisch für die ersten 12 Wochen sind 3–8 Reviews, wenn konsequent jeder Kunde angefragt wird.

**Was Claude Code baut:** Automatisierte Review-Ask-E-Mail (Text + Trigger-Logik im bestehenden Brevo-Automations-Setup), ausgefüllte Unternehmensprofile mit Screenshots/Funktionsbeschreibung.
**Was der Owner tut:** Individuelle Antworten auf jede Review (kann nicht glaubwürdig von Claude simuliert werden), gelegentliche persönliche Nachfrage bei größeren/zufriedenen Kunden — das ist der einzige Punkt in diesem Kanal, der nicht 0-Touch-automatisierbar ist, aber mit UWG-Cold-Outreach-Verboten nichts zu tun hat (Bestandskunden, kein Fremdkontakt).

---

### Kanal 5 — Chrome-Extension (bewusst niedrigste Priorität, mit klaren Bau-Trigger-Kriterien)

**Was:** Eine Browser-Extension, die auf jeder besuchten Website einen Mini-Scan auslöst und den Score als Badge im Browser-Toolbar-Icon zeigt.

**Warum explizit *nicht* Priorität 1, trotz Nennung im Auftrag:** Die Recherche ist hier ungewöhnlich eindeutig gegenläufig zur intuitiven Erwartung. Zwei unabhängige Berichte kommen trotz unterschiedlicher Ausgangs-Bewertung („hoch" in leadgen-ohne-ads.md, „mittel" in distribution-as-product.md) zum selben Schluss (Widerspruch 2, synthese.md): **zurückstellen, bis leichtere Assets Nachfrage belegt haben.** Grammarlys Erfolgsmuster (>10 Mio. Downloads, 6,9 Mio. DAU, producthabits.com) beruht auf täglichem Nutzungsbedarf (Schreiben) — ein Accessibility-Scan wird selten gebraucht, das Nutzungsmuster ist strukturell ein anderes. Zusätzlich ist Entwicklungs- *und laufender Pflegeaufwand* bei Browser-Updates laut Recherche-Tabelle „mittel–hoch" — der höchste Wartungsaufwand aller 5 Kanäle, bei unsicherstem Ertrag außerhalb eines Nischenfokus.

**Konkrete Bau-Trigger (statt Kalenderdatum):** Extension erst bauen, wenn *zwei* der folgenden Schwellen erreicht sind: (a) Score-Badge auf ≥15 Kundenseiten aktiv eingebettet, (b) WordPress-Plugin ≥50 aktive Installationen, (c) mindestens 5 unaufgeforderte Nutzeranfragen nach einer Browser-Variante. Diese Trigger machen aus einer Kalender-Priorität eine Nachfrage-validierte Priorität — genau die Empfehlung aus beiden Berichten.

---

## Funnel-Logik: Traffic → Gratis-Scan → Kauf → Abo

```
Fremde Oberflächen (NEU durch Product-Led-Distribution)
├─ Score-Badge auf Kundenwebsites  ──┐
├─ WordPress.org-Plugin-Verzeichnis ──┤
├─ Programmatic-SEO-Spoke-Seiten   ──┼──►  bfsg-fuchs.de Gratis-Scan
├─ G2 / SaaSHub / Capterra / OMR   ──┤     (URL + E-Mail, bestehend)
└─ (später: Chrome-Extension)      ──┘
                                          │
                                          ▼
                              Score + Teaser + Double-Opt-in-Mail
                                          │
                                          ▼
                         Brevo-Nurture-Sequenz (bestehend)
                                          │
                                          ▼
                    Kauf: Basis 129 € / Profi 399 € / Cookie 39–69 €
                                          │
                                          ▼
              Post-Kauf-Trigger (NEU): Badge-Snippet + Review-Ask-Mail
                                          │
                                          ▼
                   Re-Check-Abo 24,99 €/Monat oder 249 €/Jahr
              (Badge bleibt nur „grün", solange Abo aktiv → Retention-Hebel)
```

Der entscheidende strukturelle Unterschied zur bisherigen Strategie: **der Funnel bekommt einen Rückkanal.** Jeder Badge- und Plugin-Nutzer erzeugt neuen Traffic für neue potenzielle Kunden (Besucher der Kundenwebsite sehen das Badge → eigener Gratis-Scan), ohne dass wir dafür etwas bezahlen. Das ist der einzige der 12 Kanäle aus der Synthese, der eine echte Compounding-Schleife durch *Kundennutzung selbst* erzeugt statt nur durch unsere eigene Content-Produktion.

---

## Budget-Allokation (600 €/Monat)

Der Kern dieses Schwerpunkts ist bewusst fast kostenlos — der Aufwand ist Claude-Code-Arbeitszeit, nicht Cash. Das unterscheidet Product-Led-Distribution von den anderen Säulen der Gesamtstrategie (PR, Partnerprogramm) und ist laut Aufwand-Ertrag-Tabelle in distribution-as-product.md genau der Punkt.

| Posten | €/Monat | Begründung |
|---|---|---|
| WordPress.org-Plugin-Listing | 0 € | 0 % Plattform-Fee laut Finding 8, partner-channel.md |
| Score-Badge (Hosting/Infra) | 0 € | läuft auf bestehendem Scanner-Server, kein Zusatz-Hosting nötig |
| G2 / SaaSHub / OMR-Listings | 0 € | bewusst nur Plattformen ohne Pay-to-Play (Finding 8, leadgen-ohne-ads.md) |
| AI-Traffic-Tracking-Setup (GA4/Plausible-Erweiterung für AI-Referrer) | 0–19 € | Plausible-Tarif-Sprung nur falls bestehendes Setup das nicht abdeckt; einmalig einrichten |
| Badge-Grafikfeinschliff (falls kein eigenes Design ausreicht) | 0–50 € einmalig | Fiverr/Freelance-Iteration am Filo-Badge-Design, nur bei Bedarf |
| WordPress-Plugin-Security-Review (externe Zweitmeinung vor Einreichung) | 0–80 € einmalig | optional, senkt Ablehnungsrisiko beim Erstreview |
| Reserve für PR-Portal-Distribution-Boost (ergänzt Kanal 3, nicht Kernbudget dieses Schwerpunkts) | 0–50 €/Meldung | nur bei Bedarf, openPR-Basis bleibt kostenlos |
| **Ungebundener Rest** | **~400–550 €** | bleibt für andere Säulen der Gesamtstrategie (PR, Partnerprogramm, ggf. Newsletter-Test Monat 3) — dieser Schwerpunkt selbst braucht strukturell kein Cash-Budget |

**Kernaussage:** Product-Led-Distribution ist der Kanal mit dem besten Verhältnis „Ergebnis pro investiertem Euro" in der gesamten 12-Kanal-Shortlist, weil fast der gesamte Aufwand in Claude-Code-Zeit statt Cash steckt. Das schont das 600-€-Budget für Kanäle, die zwingend Cash brauchen (PR-Distribution-Boosts, ggf. Partnerprogramm-Tooling).

---

## Aufwandsplan (h/Woche)

| Woche | Owner (h/Woche) | Claude Code (Fokus) |
|---|---|---|
| 1–2 | 2–3 h (Badge-Design-Freigabe, Testing auf 2–3 Live-Domains) | Badge-Embed-JS + API-Endpoint + Report-Landingpage bauen, in Post-Kauf-Mail-Flow einhängen |
| 3–4 | 2–3 h (WordPress.org-Account-Verifizierung, finale Plugin-Freigabe) | WP-Plugin-Grundgerüst + Readme + Security-Hardening, zur Review einreichen |
| 5–8 | 1–2 h (Review-Antworten, Stichproben-Freigabe neuer SEO-Seiten) | 4–6 Programmatic-SEO-Spoke-Seiten, Overlay-Kritik-Pillar-Artikel, Marktplatz-Profile vervollständigen, Review-Ask-Automation |
| 9–12 | 1–2 h (Review-Antworten, Trigger-Check für Chrome-Extension) | weitere 2–4 SEO-Seiten, Plugin-Support-Anfragen sichten, Badge-Adoption-Auswertung, Entscheidung Kanal 5 |

Owner-Zeit bleibt konstant niedrig (1–3 h/Woche) — das ist der Kernvorteil dieses Schwerpunkts gegenüber z. B. Founder-LinkedIn-Content oder Partnerprogramm-Aufbau, die beide laufende persönliche Präsenz brauchen.

---

## Erwartete Lead-/Sales-Trajektorie (inkrementeller Beitrag dieser 5 Kanäle)

**Wichtiger Vorbehalt:** Die folgenden Zahlen sind der *zusätzliche* Beitrag von Product-Led-Distribution oben auf die bestehende Baseline (aktueller Gratis-Scan-Funnel, bestehendes SEO, geplante PR-Aktivität) — nicht die Gesamt-Unternehmenstrajektorie. Sie sind Annahmen auf Basis vergleichbarer Zeitachsen aus der Recherche, keine harten Prognosen; WordPress-Plugin-Install-Zahlen und Badge-Adoptionsraten sind insbesondere für ein neues, unbeworbenes Nischen-Plugin nicht durch eine dedizierte 2025/26-Fallstudie belegt (distribution-as-product.md nennt explizit, dass aktuelle Install-Zahlen für neue Launches fehlen) — als Annahme gekennzeichnet.

| Meilenstein | Woche 2 | Woche 4 | Woche 8 | Woche 12 |
|---|---|---|---|---|
| Score-Badge live & im Kauf-Flow | ✅ gebaut, 0–2 Badges aktiv (erste Käufer der Woche) | 3–6 Badges aktiv | 8–15 Badges aktiv | 15–25 Badges aktiv |
| Inkrementeller Traffic durch Badges | ~0 | einzelne Klicks | niedrig zweistellig/Monat | niedrig-mittel zweistellig/Monat |
| WordPress-Plugin-Status | in Entwicklung | zur Review eingereicht | live im Verzeichnis, 0–5 Installs | 5–20 Installs (Annahme, unbelegt) |
| Neue SEO-Spoke-Seiten live | 0 (Fokus Badge) | 2 | 6 | 10 |
| Inkrementelle organische Sessions/Monat aus neuen Seiten | ~0 | ~0 (Indexierung läuft) | niedrig dreistellig | mittel dreistellig (SEO braucht laut Standardwissen 3–6 Monate bis Volumen — Woche 12 zeigt erst den Anfang) |
| Marktplatz-Reviews (kumulativ) | 0–1 | 1–2 | 3–5 | 5–8 |
| Inkrementelle Gratis-Scans/Monat aus diesen 5 Kanälen | ~0–5 | 5–15 | 20–40 | 40–80 |
| Inkrementelle Sales/Monat aus diesen 5 Kanälen | 0 | 0–1 | 1–3 | 2–5 |

**Begründung der Zurückhaltung bei Woche 2/4:** Alle fünf Kanäle sind reine Aufbau-Investitionen ohne Sofort-Traffic — anders als ein Ad-Kampagnenstart gibt es hier keinen Tag-1-Effekt. Das deckt sich mit Finding 7 (leadgen-ohne-ads.md): Aktualität/Freshness ist ein Zitier- und Ranking-Hebel, der erst nach mehreren Wochen Content-Historie greift, und mit der Omnius-Fallstudie, deren 30×-Wachstum sich über 10 Monate erstreckte, nicht Wochen.

**Begründung des Anstiegs ab Woche 8:** Ab hier greifen zwei parallele Compounding-Effekte — das Plugin ist im Verzeichnis auffindbar (organische WordPress-Suche), und die ersten Badges erzeugen echten Backlink-Traffic von echten Kundenwebsites. Beide Effekte sind in Woche 2–4 strukturell noch nicht messbar, weil die zugrundeliegende Nutzerbasis (Kunden mit Badge, Plugin-Installs) selbst noch zu klein ist.

---

## Top-Risiken + Gegenmaßnahmen

| # | Risiko | Gegenmaßnahme |
|---|---|---|
| 1 | Badge/Plugin werden vom Nutzer mit Overlay-Widgets verwechselt → gleiches rechtliches Fettnäpfchen wie AccessiBe (FTC-Strafe 1 Mio. USD, Jan. 2025) | Copy strikt auf „Scan-Status", nie „macht barrierefrei"; jeder Badge-/Plugin-Text läuft vor Launch durch `legal-copy-grep`-Skill |
| 2 | WordPress.org lehnt Plugin beim Erstreview ab (Sicherheitsmängel, Nonce/Capability-Fehler) | WP-Plugin-Handbook-Standards vor Einreichung exakt befolgen, optional externe Zweitmeinung (Budget-Posten oben), Puffer von 1–2 Wochen für Nachbesserung einplanen |
| 3 | AccessGO besetzt bereits denselben Suchraum „BFSG WordPress Plugin" | Plugin-Titel/-Beschreibung von Tag 1 an klar als „Scan + Report, kein Overlay" positionieren, nicht generisch „Barrierefreiheit" nennen |
| 4 | Badge bleibt nach Abo-Kündigung fälschlich „grün" stehen → Vertrauensschaden für BFSG-Fuchs, nicht nur für den Kunden | Badge zieht Live-Status per JS von der API (kein statisches Bild), automatisches visuelles Verblassen nach 6 Monaten ohne Re-Check |
| 5 | Reviews auf G2/SaaSHub kommen zu langsam, weil Owner-Nachfassen nicht automatisierbar ist | Automatisierte Post-Kauf-E-Mail mit Review-Link deckt die Skalierung ab; Owner-Zeit bewusst niedrig budgetiert (1–2 h/Woche reicht für Stichproben-Nachfassen) |
| 6 | Aktuelle Kundenzahl ist noch klein → Badge-/Review-Kanal hat in den ersten Wochen kaum Substanz zum Wachsen | Kanal 3 (SEO) und Kanal 2 (Plugin) laufen bewusst parallel unabhängig von der Kundenbasis, damit die Trajektorie nicht ausschließlich von Sales-Erfolg anderer Kanäle abhängt |
| 7 | Chrome-Extension wird trotz Trigger-Kriterien zu früh gebaut, weil sie im Auftrag explizit genannt war | Trigger-Kriterien (Kanal 5) sind bewusst hart formuliert (2 von 3 Schwellen), keine Kalender-Deadline — verhindert Bau aus Vollständigkeits-Reflex statt Nachfrage-Beleg |

---

## Zusammenfassung: Was zuerst passiert

1. **Woche 1–2:** Score-Badge bauen und in den bestehenden Kauf-Flow einhängen (kein neues System, nur Erweiterung des Bestehenden).
2. **Woche 2–4:** WordPress-Plugin bauen und einreichen, parallel Marktplatz-Profile vervollständigen.
3. **Ab Woche 3, laufend:** Programmatic-SEO-Spoke-Seiten im bestehenden Next.js-Stack, inklusive der identifizierten Content-Lücke „Overlay funktioniert nicht".
4. **Laufend ab Kauf 1:** Review-Ask-Automation nach jedem Kauf.
5. **Nicht jetzt, sondern trigger-basiert:** Chrome-Extension — Entscheidung frühestens Woche 12 anhand der drei definierten Schwellenwerte.
