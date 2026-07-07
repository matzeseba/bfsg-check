# Schnelle-Leads-Execution-Plan — billigste Leads, schnellster Gewinn

> **Stand:** 07.07.2026 · **Ziel laut Owner:** schnelle Leads, so günstig wie möglich, schnell hohe Gewinne
> **Verhältnis zu Bestandsdocs:** Das ist der **Ausführungsplan** zur Master-Strategie `marketing/2026-06-30-marketing-strategie-master.md` — er ersetzt sie nicht, sondern verdichtet sie auf die nächsten 14 Tage und aktualisiert die Aufhänger (Recherche 07.07.2026).
> **Produktstand:** Launch-Readiness-Audit komplett behoben und live (PR #134), Dark-Glow-LP live, 10+ SEO-Seiten live, Brevo-Nurture aktiv, Listings-Texte einreichfertig.

---

## 1. Die ehrliche Rechnung zuerst

„Schnell + günstig + hoher Gewinn" hat in unserem Setup genau **eine** kritische Abhängigkeit: **Es existieren noch keine Ads- und Listing-Konten.** Alles andere (Texte, Kampagnenstruktur, Keywords, Funnel, Nurture, Tracking-Plan) ist fertig oder von Claude in Stunden herstellbar.

**Kosten pro Lead nach Kanal (aus Master-Strategie, Reihenfolge = Startreihenfolge):**

| Rang | Kanal | Zeit bis erster Lead | Kosten | Blocker |
|---|---|---|---|---|
| 1 | **Listings** (SaaSHub dofollow, AlternativeTo, OMR …) | 2–7 Tage | 0 € | Owner-Accounts (~45 Min) |
| 2 | **Freie PMs** (openPR, inar, firmenpresse) | 3–7 Tage | 0 € | Owner sendet ab (~20 Min) |
| 3 | **Bing Ads** (Exact/Phrase Long-Tail) | 24–72 h | ~8 €/Tag | Owner-Konto + Karte (~20 Min) |
| 4 | **Google Ads** (Long-Tail/Branche) | 24–72 h | ~8–11 €/Tag | Owner-Konto + Karte (~20 Min) |
| 5 | **AEO/SEO** (läuft bereits: 10+ Seiten, llms.txt, IndexNow) | läuft | 0 € | keiner — kompoundiert |
| 6 | **Retargeting** (Meta/YT auf Scan-Besucher) | ab Woche 2 | ~4–6 €/Tag | braucht erst Traffic + Pixel |

**Konsequenz:** Die schnellsten billigen Leads kommen aus **Bing (paid, ab Tag 1)** und **Listings/PMs (gratis, ab Tag 2–7)**. Alles hängt an ~90 Minuten Owner-Zeit für Kontenanlage — danach übernimmt Claude in der eingeloggten Session (Computer Use) den kompletten Rest.

**Gewinn-Fokus:** Marketing zieht konsequent auf **Profi 399 €** (Mengenanker „~16 €/Seite") + **Re-Check-Abo 24,99 €/Mo bzw. 249 €/Jahr** als Attach. Basis 129 € ist bei realistischem CAC (100–150 €) zu margenschwach, um „hohe Gewinne" zu tragen. CAC-Ceiling bleibt **177 €/Sale** (LTV ~533 €).

---

## 2. Neue, belegbare Aufhänger (Recherche 07.07.2026)

Seit der Master-Recherche (30.06.) sind drei Fakten dazugekommen bzw. gehärtet — alle **sachlich belegbar**, damit UWG-§-5-sicher formulierbar:

1. **MLBF ist seit 05.01.2026 in der aktiven Kontrollphase** und hat im Juni 2026 ihre Website (mlbf-barrierefrei.de) samt **öffentlicher Prüfstrategie** veröffentlicht: risikobasiert, reaktiv (Beschwerden haben Vorrang) + aktiv (automatisierte Software-Checks). Verbraucher können Barrieren **direkt über ein Formular melden**. Schwerpunkte: hohe Nutzerreichweite, Bedeutung für autonome Lebensführung, negative Mängel-Historie. *(Quellen: bundesfachstelle-barrierefreiheit.de 08.06.2026, marcus-herrmann.com 06/2026)*
2. **Abmahnwelle 2 läuft seit Februar 2026** (Kanzlei MK, Berlin, Forderungen ~2.700 €) — zusätzlich zur CLAIM-Welle (~600 €). Wichtig für unsere Sprache: Abmahnfähigkeit über § 3a UWG ist **gerichtlich weiter ungeklärt** — wir benennen die Wellen als Fakt, nie als sichere Drohung.
3. **EU-Kommission hat am 11.03.2026 eine ergänzende begründete Stellungnahme an Deutschland gerichtet** (EAA-Umsetzung lückenhaft, Frist Mitte Mai 2026, sonst EuGH). Guter sachlicher PM-/Content-Hook: „Der Druck kommt jetzt von zwei Seiten — Aufsicht in Magdeburg und EU-Kommission."

**Verbotene Formulierungen bleiben verboten** („BFSG-konform", „rechtssicher", „Abmahnschutz garantiert", erfundene Bußgeld-Fälle). Jeder neue Text läuft vor Veröffentlichung durch `scripts/legal-grep.mjs`.

**Content-Idee daraus (0 €, hoher Fit):** Ratgeber-Seite **„MLBF-Prüfstrategie erklärt: So kontrolliert die Aufsicht Websites — und so prüfst du vorher selbst"** — die Behörde prüft laut eigener Aussage automatisiert; genau das ist unser Produkt. Perfekte AEO-Frage („Wie prüft die MLBF?") mit sauberem Scan-CTA.

---

## 3. 14-Tage-Sprint (Owner-Minuten vs. Claude-Arbeit)

### Tag 1 — Konten-Tag (Owner gesamt: ~90 Min, einmalig)
| Wer | Was |
|---|---|
| **Owner** | 1) **Bing-Ads-Konto** + Karte (~20 Min) · 2) **Google-Ads-Konto** + Karte (~20 Min) · 3) **SaaSHub-Account** (~10 Min) · 4) eingeloggt lassen |
| **Claude** | Bing-Kampagne komplett aufsetzen (Import-Struktur, Long-Tail-Keywords Exact/Phrase, RSA-Headlines aus `marketing/google-ads-rsa-headlines.md`, Negativ-Liste, UET-Tag + Conversion-Ziel `lead_captured`/`purchase`); Google-Kampagne als **pausierten Entwurf**; `legal-grep` über alle Ad-Texte |

### Tag 2–3 — Gratis-Distribution raus
| Wer | Was |
|---|---|
| **Owner** | Listings-Accounts bestätigen (E-Mail-Verifizierung), 3 PMs absenden (Texte fertig) |
| **Claude** | 10 Listings ausfüllen (Texte liegen in `marketing/listings-submission-templates.md`); PM-Texte auf die neuen Hooks aus Abschnitt 2 aktualisieren (MLBF-Prüfstrategie + EU-Verfahren, sachlich); MLBF-Ratgeber-Seite schreiben (SEO/AEO, FAQ-Schema) |

### Tag 3–5 — Bing live beobachten, Google nachziehen
| Wer | Was |
|---|---|
| **Owner** | Google-Kampagne aktivieren (1 Klick), Budget-Freigabe 16–19 €/Tag gesamt |
| **Claude** | Täglicher Ads-Pull (`ads-performance-pull`-Skill): CPA/CTR/Suchbegriffe; Suchbegriffs-Hygiene (Negativ-Keywords nachschärfen); erste Keyword-Cuts bei CPC-Ausreißern |

### Tag 5–10 — Retargeting-Fundament + Conversion-Hygiene
| Wer | Was |
|---|---|
| **Owner** | Meta-Pixel-OK (falls Meta-Retargeting gewünscht; sonst nur YouTube/Google-Remarketing über bestehendes Google-Konto = keine neue Plattform) |
| **Claude** | Remarketing-Audience „Scan-Besucher ohne Kauf" + Retargeting-Ads (Text + statisch); Funnel-Check: Scan→Lead-Rate und Lead→Kauf-Rate aus echten Daten; A/B-Vorschläge für ResultCard-CTA falls Lead-Rate < 10 % |

### Tag 10–14 — erste Skalier-Entscheidung (datenbasiert)
| Wer | Was |
|---|---|
| **Owner** | 15-Min-Review mit Claude: Was hat CPL < 30 €? |
| **Claude** | Reallokation: Gewinner-Keywords auf Exact + Budget-Shift dorthin; Verlierer pausieren; Forecast für 30-€/Tag-Stufe nur, wenn CAC-Trend < 177 € |

---

## 4. KPI-Leitplanken (unverändert aus Master, hier nur die Stopp-Schwellen)

| Metrik | Ziel | Aktion bei Verfehlung |
|---|---|---|
| CPL (qualifizierter Lead, Search) | < 30 € | Keyword-Cut, Anzeigentext-Test |
| CAC/Sale (14 Tage rollierend) | < 177 € | Kanal drosseln, Profi-Fokus schärfen |
| Scan→Lead | ≥ 10 % | ResultCard/Gate testen |
| 14-Tage-Ergebnis | 2–4 Sales (400–1.200 €) | bei 0 Sales nach 14 Tagen: Funnel-Audit vor mehr Budget |
| Tagesbudget | 20 €/Tag Deckel | Erhöhung NUR nach CAC-Beweis |

**Wichtig gegen die „schnell"-Falle:** Mehr Tagesbudget beschleunigt bei einem Nischen-Suchvolumen NICHT linear die Leads — es erhöht nur den CPC. Der schnellste Gewinn-Hebel ist nicht mehr Geld, sondern (a) Konten heute anlegen, (b) die 0-€-Kanäle parallel zünden, (c) konsequent auf 399 €/Abo ziehen.

---

## 5. Was ohne jede Owner-Aktion sofort passiert (Claude, 0 €)

1. **MLBF-Prüfstrategie-Ratgeberseite** (Abschnitt 2) — neuer SEO/AEO-Content mit höchstem thematischen Produkt-Fit.
2. **PM-Texte aktualisieren** auf die belegten Juli-Hooks (MLBF-Website + Prüfstrategie, EU-Stellungnahme) — versandfertig für Owner.
3. **Täglicher Ads-Pull + Wochen-Funnel-Snapshot** als stehende Routine, sobald Konten existieren.
4. **Prompt-Audit AEO:** monatlich prüfen, ob ChatGPT/Perplexity uns bei „Website Barrierefreiheit prüfen" zitieren; llms.txt/FAQ-Schema nachschärfen.

---

## 6. Owner-Kurzfassung (das Einzige, was zählt)

> **~90 Minuten am Tag 1: Bing-Konto, Google-Konto, SaaSHub-Account anlegen und eingeloggt lassen.**
> Danach baut Claude alle Kampagnen, Listings und Texte fertig; laufende Optimierung ist automatisiert.
> Erwartung bei 16–19 €/Tag: erste Leads in 24–72 h, 2–4 Sales in 14 Tagen, Stopp-Leine bei CAC 177 €.
