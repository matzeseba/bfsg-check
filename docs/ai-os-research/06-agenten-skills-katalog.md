# Agenten- & Skill-Katalog — Jarvis-Cockpit BFSG-Check

> **Erstellt:** 21.06.2026 · **Recherche-Agent:** #6 (Agenten- & Skill-Katalog + steuerbare Aktionen)
> **Basis:** Interner Scan aller 217 Agency-Agents, 8 bestehender Skills, 15+ Marketing-Docs, LEGAL-REALITY-CHECK-2026, STRATEGY-2026, HANDOVER-NEXT-SESSION

---

## Executive Summary (5 Bullets)

- **Von 217 auf 27 reduziert.** Für einen Solo-BFSG-SaaS-Founder sind genau 27 Agency-Agents dauerhaft relevant — der Rest deckt China-E-Commerce, GIS, Game-Dev, Blockchain und andere Welten ab, die für dieses Business schlicht nicht existieren. Qualität schlägt Menge.
- **Die Action-Library hat 18 konkrete 1-Klick/1-Sprach-Aktionen** in drei Gefährdungsstufen: Quick-Actions (sofort, read-only), Generatoren (Draft + Freigabe), Live-Aktionen (Geld/extern, Pflicht-Bestätigung). Das Compliance-Versprechen — „keine Live-Aktion ohne User-OK" — ist direkt in die Steuermodell-Architektur eingebaut.
- **7 neue Skills fehlen noch** und schließen die größten Lücken: Ads-Performance-Pull, A/B-Test-Auswertung, Scan-Dataset-Aggregat, Up-Sell-Sequenz-Trigger, Legal-Copy-Grep, Backup-Verify und Stripe-Revenue-Snapshot. Ohne diese ist das Cockpit taub für die wichtigsten täglichen Fragen.
- **25 deutsche Voice-Intents** abgedeckt — von „Wie laufen die Verkäufe?" bis „Starte einen Google-Ads-Sprint" — alle gemappt auf konkrete Actions mit klar definierter Freigabe-Eskalation.
- **Guardrails first.** Das Compliance-System braucht vier Ebenen: (1) Blacklist-Check vor jeder Aktion, (2) Formulation-Guard bei Content-Generierung, (3) Pflicht-Bestätigung bei allen Live-Aktionen, (4) Audit-Log jeder Cockpit-Aktion. Damit ist kein Agent je in der Lage, eine Cold-Mail abzuschicken oder einen Ads-Betrag zu buchen, ohne dass Matthias explizit zustimmt.

---

## Kuratierter Agenten-/Skill-Katalog nach Business-Funktion

### A — Marketing / Ads / Paid Media (höchste Relevanz für Traction)

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `paid-media-ppc-strategist` | Google-Ads-Kampagnenstruktur, Budget-Allokation, Bidding-Strategie — Kern-Kanal #1 des Business |
| `paid-media-search-query-analyst` | Wöchentliche Search-Term-Auswertung, Negativ-Keywords pflegen, Wasted-Spend identifizieren |
| `paid-media-creative-strategist` | RSA-Headline-Rotation, Ad-Copy-Tests, neue Anzeigenvarianten auf Basis Performance-Daten |
| `paid-media-auditor` | Monatlicher Gesamt-Audit (200+ Checkpunkte) des Google-Ads-Kontos — CPA/ROAS-Hygiene |
| `paid-media-tracking-specialist` | Conversion-Tracking-Integrität sichern (GA4 + Stripe-Webhook + GTM) — ohne valides Tracking ist die Optimierung blind |
| `marketing-seo-specialist` | SEO-Content-Plan ausführen, Keyword-Rankings tracken, Pillar-Pages optimieren |
| `marketing-growth-hacker` | Wachstums-Experimente (Chrome Extension, Badge, Programmatic Pages) — Distribution-as-Product |
| `marketing-pr-communications-manager` | Pressemitteilungen, HARO-Antworten, Listings-Submissions (openPR, firmenpresse, inar) |
| `marketing-content-creator` | Blog-Artikel, SEO-Ratgeber, Newsletter-Drafts — wiederkehrende Content-Produktion |
| `marketing-email-strategist` | Nurture-Sequenz (5 Mails / 14 Tage), Re-Engagement, Newsletter-Optimierung via Brevo |

### B — Content / SEO / Second-Brain

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `marketing-ai-citation-strategist` | Sichtbarkeit in Claude/ChatGPT/Perplexity sichern — wachsender Such-Kanal 2026 |
| `marketing-aeo-foundations` | llms.txt, AI-aware robots.txt, strukturierte Markdown-Verfügbarkeit für AI-Crawler |
| `engineering-technical-writer` | Docs, README, API-Referenzen, Help-Center-Artikel auf bfsg-fix.de |
| `support-executive-summary-generator` | Entscheidungs-Briefings aus langen Audit-Outputs destillieren — spart Lesezeit |

### C — Sales / Pipeline / CRM

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `sales-offer-lead-gen-strategist` | Lead-Magnet-Optimierung (Gratis-Scan → E-Mail-Capture), TOFU-Offer-Design |
| `sales-pipeline-analyst` | Notion-Pipeline-Health, Conversion-Rate Scan→Lead→Purchase, Churn-Früherkennung |
| `marketing-email-strategist` | *(auch hier)* Up-Sell-Trigger: Basis→Profi, Cookie-Audit als Cross-Sell nach 14 Tagen |

### D — Produkt / Code / Engineering

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `engineering-code-reviewer` | Jeder PR bevor er auf main geht — vier Kriticals aus dem Audit waren vermeidbar |
| `engineering-minimal-change-engineer` | Bug-Fixes sauber halten, kein Scope-Creep in Hotfix-PRs |
| `engineering-senior-developer` | Feature-Implementierung (Scanner-Verbesserungen, Landing-Konversionselemente) |
| `engineering-frontend-developer` | Landing-Page-Iterationen, A/B-Varianten, Checkout-Modal-Verbesserungen |
| `engineering-sre` | SLO-Definition, Uptime-Monitoring, Error-Budget-Tracking |
| `engineering-devops-automator` | GitHub-Actions-Workflows, Backup-Automatisierung, Deploy-Pipeline |

### E — Security / Reliability

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `security-appsec-engineer` | SSRF-Fix (Audit C1) und laufende Sicherheitsprüfungen neuer Features |
| `security-senior-secops` | Secrets-Scan vor jedem Commit, sicherheitskritische Eingabevalidierung |
| `testing-accessibility-auditor` | Eigene Seite regelmäßig testen — existenziell, weil wir genau das verkaufen |
| `testing-reality-checker` | Verhindert Fantasy-Approvals: „Ist das wirklich production-ready?" |

### F — Legal / Compliance

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `support-legal-compliance-checker` | Ad-Copy und Landing-Page-Texte auf UWG §5/§7-Compliance prüfen |
| `security-compliance-auditor` | Quartals-Compliance-Check DSGVO, BFSG, AGB-Aktualität |

### G — Finance / Controlling

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `finance-bookkeeper-controller` | Monatliche MRR-Auswertung, Stripe-Umsatz vs. Werbekosten, Kleinunternehmer-Grenze im Auge |
| `finance-fpa-analyst` | Budget-Stufen-Entscheidungen (Bootstrap→Validierung→Skalierung), CAC/LTV-Tracking |

### H — A11y-Dogfooding (eigene Produkt-Credibility)

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `testing-accessibility-auditor` | *(auch hier prominent)* Wöchentlicher Selbst-Test bfsg-fix.de — ein A11y-Tool das selbst A11y-Mängel hat ist ein PR-Desaster |
| `testing-evidence-collector` | Screenshot-Beweise für eigene A11y-Score-Verbesserungen → Marketing-Material |

### I — Ops / Second-Brain / Wissensmanagement

| Agent/Skill | Warum regelmäßig gebraucht |
|---|---|
| `support-analytics-reporter` | KPI-Dashboards, wöchentliche Berichte, Notion-Seiten mit Daten befüllen |
| `engineering-prompt-engineer` | Cockpit-Prompts und Skill-Definitionen schärfen, Agent-Performance verbessern |

**Explizit ausgeschlossen (keine Relevanz für dieses Business):**
Alle China-Marketing-Agents (Douyin, Bilibili, Xiaohongshu, Kuaishou, WeChat, Weibo, Zhihu, Baidu SEO, China-E-Commerce, Private-Domain-Operator), GIS-Division (13 Agents), Game-Dev-Division (5 Agents), Spatial-Computing, Blockchain, Embedded-Firmware, LinkedIn-Content-Creator (kein LinkedIn-Account vorhanden), TikTok/Instagram/YouTube-Strategists (falscher Kanal für B2B DACH), alle akademischen Agents.

---

## Action-Library

Die 18 Must-Have-Actions des Cockpits:

| # | Name | Funktion | Agent/Skill | Inputs | Output | Freigabe | Häufigkeit |
|---|---|---|---|---|---|---|---|
| **A01** | Tagescheck | Server-Health + Sales 24h + Bounces + Errors | `daily-health-check` Skill | keine | Markdown-Report im Chat | Keine | Täglich |
| **A02** | Wochenreport / KPIs | MRR, Scans, Conv-Rate, Ads-CPA, Pipeline, Refunds | `weekly-kpi-report` Skill + `support-analytics-reporter` | Stripe MCP + Notion MCP + Porter-Metrics | KPI-Tabelle + Notion-Page | Keine (read-only) | Montags |
| **A03** | Smoke-Check Funnel | Scanformular → Teaser → Checkout → Stripe anklicken (E2E) | `testing-evidence-collector` + `testing-reality-checker` | keine | Grün/Gelb/Rot mit Screenshot-Beweis | Keine | Vor Ads-Hochlauf |
| **A04** | Neue Ad-Varianten | RSA-Headlines für neue Ad-Group oder Topic, A/B-Set erstellen | `paid-media-creative-strategist` + `support-legal-compliance-checker` | Thema/Keyword/Ad-Group | 3-5 Headline-Sets, Compliance-gecheckt, PR-ready | User prüft Copy, dann PR | Bei Ads-Iteration |
| **A05** | Google-Ads-Sprint starten | Neue Kampagne oder Ad-Group aufbauen (Struktur, Match-Types, Budget) | `paid-media-ppc-strategist` | Ziel-Keyword-Set, Budget, Geozone | Kampagnen-Bauplan als Markdown + Implementierungsschritte | User-OK für Live-Aktivierung | Bei neuem Produkt/Test |
| **A06** | Search-Term-Auswertung | Wasted Spend identifizieren, Negativ-Liste erweitern | `paid-media-search-query-analyst` | Google-Ads-Export-CSV (Search Terms) | Priorisierte Negativ-Liste + Exact-Match-Empfehlungen | User bestätigt Negativ-Hinzufügung | Wöchentlich |
| **A07** | SEO-Artikel schreiben | Blog-Post zu Keyword aus Content-Plan, PR + Newsletter-Draft | `publish-blog-post` Skill + `marketing-seo-specialist` | Keyword/Thema | Artikel-Datei in `landingpage-next/content/blog/`, PR erstellt, Newsletter-Draft in Brevo | User klickt Newsletter-Senden | 1-2×/Woche |
| **A08** | Wochen-Content erstellen | Alle SEO-/Blog-Content-Deliverables der Woche bündeln | `marketing-content-creator` + `engineering-technical-writer` | Content-Plan-Slot aus `marketing/seo-content-plan.md` | Fertige Drafts pro Artikel + PR-Drafts | User reviewed, dann PR | Wöchentlich |
| **A09** | Pressemitteilung / Listing | PM verfassen + an Plattformen submittieren (openPR, inar, firmenpresse) | `marketing-pr-communications-manager` | Anlass (Datum, Daten, Meilenstein) | Fertige PM-Datei in `marketing/` + Submission-Checklist | User sieht PM vor Absenden | Bei Events (28.06., 1-Jahr-BFSG) |
| **A10** | Lead / Order bearbeiten | Neue Stripe-Order lookup, Paket prüfen, ggf. Refund | `process-refund` Skill | Order-ID oder Stripe-Session | Bestätigung + Audit-Log-Eintrag | Pflicht: User bestätigt Refund-Betrag | Bei Support-Anfrage |
| **A11** | Up-Sell-Sequenz triggern | Post-Purchase-Mail: 14-Tage-Up-Sell Basis→Profi oder Cookie-Audit | `marketing-email-strategist` | Kunden-E-Mail + Paket-Typ + Kaufdatum | Brevo-Sequenz-Draft (Status: ENTWURF) | User aktiviert Sequenz in Brevo | 14 Tage nach Kauf |
| **A12** | A/B-Test auswerten | Pricing-Experiment oder Headline-Test aus Posthog/Google-Ads analysieren | `paid-media-auditor` + `support-analytics-reporter` | Zeitraum + Variante-IDs | Statistisch-valide Empfehlung (Gewinner/kein Effekt/mehr Daten) | User entscheidet Gewinner-Merge | Bei Stichprobengröße erreicht |
| **A13** | Incident Response | Site down / Bug live: Diagnose → Mitigation → Rollback-Vorschlag | `incident-response` Skill + `engineering-sre` | Fehlerbeschreibung | Diagnose-Report + Rollback-Befehl vorbereitet | User führt Rollback aus | Notfall |
| **A14** | Sicherheits-Scan neuer Code | Code-Review vor PR-Merge mit Security-Fokus | `security-appsec-engineer` + `engineering-code-reviewer` | PR-Diff oder File-Pfad | Findings-Liste mit Severity + Fix-Vorschlägen | User entscheidet ob PR merged | Bei jedem Feature-PR |
| **A15** | A11y-Selbst-Audit | Eigene Site bfsg-fix.de durch den eigenen Scanner laufen lassen + Report | `testing-accessibility-auditor` + `testing-evidence-collector` | `bfsg-fix.de` | axe-Report + WCAG-2.1-AA-Bewertung + Screenshot-Beweise | Keine (automatisch, findings in Issue) | 2×/Woche |
| **A16** | Legal-Copy-Check | Marketing-Texte, Ad-Headlines, Landing-Page-Copy auf UWG §5/RDG prüfen | `support-legal-compliance-checker` + `legal-update-check` Skill | Text-Input oder File-Pfad | Findings mit Rot/Gelb + Alternativformulierung | User übernimmt Fix | Vor jedem Ads-Launch |
| **A17** | Finance-Snapshot | Monatlicher Umsatz vs. Werbekosten vs. Budget-Stufe, CAC-Prüfung | `finance-bookkeeper-controller` + `finance-fpa-analyst` | Stripe-Zeitraum + Ads-Spend | P&L-Übersicht + Budget-Stufen-Empfehlung | Keine (read-only) | 1. Werktag/Monat |
| **A18** | Backup-Verify | Server-Backup-Status prüfen + Restore-Test (Trockenübung) | `engineering-sre` + `engineering-devops-automator` | SSH-Zugang aktiv | Backup-Status + letzte Snapshot-Zeit + Restore-Checkliste | User führt Restore-Befehl aus | Wöchentlich (SRE S-01 offen!) |

---

## Steuer-Modell

### Kategorie 1 — Quick-Actions (sofort, safe, keine Freigabe)

Alle read-only: Daten abfragen, Status prüfen, Reports generieren.

**Actions in dieser Kategorie:** A01 (Tagescheck), A02 (Wochenreport, read-only Teil), A03 (Smoke-Check, nur lesen), A12 (A/B-Test auswerten, nur lesen), A15 (A11y-Selbst-Audit), A17 (Finance-Snapshot).

**Verhalten:** Sofort ausführen. Keine Rückfrage. Ergebnis im Chat. Kein schreibender Zugriff auf externe Systeme.

**Voice-Aktivierung:** Direkt, ohne „Soll ich?" — das würde den Flow brechen.

### Kategorie 2 — Generatoren (erzeugen Draft, User-Freigabe vor Publish/Senden)

Schreiben, generieren, PR erstellen — aber nichts verschicken oder live schalten ohne Bestätigung.

**Actions in dieser Kategorie:** A04 (Ad-Varianten), A05 (Kampagnen-Bauplan), A06 (Search-Term-Auswertung + Negativ-Vorschlag), A07 (SEO-Artikel, PR + Newsletter-Draft), A08 (Wochen-Content), A09 (PM/Listing-Draft), A11 (Up-Sell-Sequenz-Draft), A14 (Security Code-Review), A16 (Legal-Copy-Check).

**Verhalten:** Claude führt durch und präsentiert das fertige Ergebnis. Am Ende: explizite Freigabe-Frage: „Freigabe? (y/n)" bzw. „PR erstellen? (y/n)". Nur bei y weiter. Kein stilles Absenden.

**Voice-Aktivierung:** „Erstelle [X]" → Claude generiert → fragt Freigabe. Kein Auto-Publish.

### Kategorie 3 — Live-Aktionen (Geld/extern, Pflicht-Bestätigung, Audit-Log)

Jede Aktion die Geld bewegt, externe Systeme beschreibt, oder nicht einfach rückgängig zu machen ist.

**Actions in dieser Kategorie:** A10 (Refund ausführen), A05 (Kampagne live schalten — nur der Live-Teil), A09 (PM tatsächlich absenden), A11 (Brevo-Sequenz aktivieren), A13 (Rollback ausführen), A18 (Restore-Befehl ausführen), Ads-Budget-Änderung (zu definieren als A05-Unteraktion).

**Verhalten:**
1. Claude zeigt exakte Aktion: „Ich werde [Betrag] € an [E-Mail] zurückerstatten. Nicht rückgängig machbar."
2. User tippt `y` oder spricht Bestätigung.
3. Erst dann Ausführung.
4. Automatischer Audit-Log-Eintrag: `out/cockpit-actions.jsonl` mit Timestamp, Action-ID, User-Bestätigung, Ergebnis.

**Hard-Stops (nie ausführen, auch nicht bei `y`):**
- Cold-Mail an Einzelpersonen (UWG §7 II Nr.2)
- LinkedIn/Xing-DMs an Fremde
- Ads-Budget > 100 €/Tag ohne separate Session-Bestätigung
- Stripe-Refund > 500 € ohne expliziten Betragsabgleich

---

## Voice-Intents (25 deutsche Beispiel-Kommandos)

| # | Voice-Intent | Mapped Action | Kategorie |
|---|---|---|---|
| 1 | „Tagescheck" / „Wie steht's heute?" | A01 Tagescheck | Quick |
| 2 | „Wochenreport" / „KPIs diese Woche" / „Wie laufen die Verkäufe?" | A02 Wochenreport | Quick |
| 3 | „Smoke-Check Funnel" / „Ist die Site OK?" | A03 Smoke-Check | Quick |
| 4 | „Wie viel haben wir diesen Monat verdient?" | A17 Finance-Snapshot | Quick |
| 5 | „Erstatte Order #cs_live_..." / „Refund Order..." | A10 Refund | Live-Aktion |
| 6 | „Neue Werbekampagne für Cookie-Banner erstellen" | A05 Google-Ads-Sprint | Generator |
| 7 | „Zeig mir die Search-Terms, wo wir Geld verbrennen" | A06 Search-Term-Auswertung | Generator |
| 8 | „Schreib neue RSA-Headlines für die Intent-High-Gruppe" | A04 Ad-Varianten | Generator |
| 9 | „Schreib einen Blog-Artikel über BFSG-Pflicht für WooCommerce" | A07 SEO-Artikel | Generator |
| 10 | „Erstelle den Content für diese Woche" | A08 Wochen-Content | Generator |
| 11 | „Schreib die Pressemitteilung für den 28. Juni" | A09 PM/Listing | Generator |
| 12 | „Submitte die Listing-Templates auf SaaSHub" | A09 (Live-Teil) | Live-Aktion |
| 13 | „Trigger die Up-Sell-Sequenz für Kunde X" | A11 Up-Sell | Generator |
| 14 | „Schau auf den A/B-Test Basis-Preis, haben wir schon Ergebnisse?" | A12 A/B-Auswertung | Quick |
| 15 | „Site ist down!" / „500-Fehler" / „Notfall" | A13 Incident Response | Quick→Live |
| 16 | „Review den neuen Scanner-PR bitte" / „Code-Check vor Merge" | A14 Code-Review | Generator |
| 17 | „Teste unsere eigene Barrierefreiheit" / „A11y-Check heute" | A15 A11y-Selbst-Audit | Quick |
| 18 | „Check die Ad-Copy bevor ich sie live stelle" / „Legal-Check" | A16 Legal-Copy-Check | Generator |
| 19 | „Ist das Backup aktuell?" / „Backup-Status?" | A18 Backup-Verify | Quick |
| 20 | „Starte einen Restore-Test" | A18 (Live-Teil) | Live-Aktion |
| 21 | „Monatliches Ads-Audit" / „Wie läuft das Konto?" | A02 (Ads-Teil) + Paid-Media-Auditor | Quick |
| 22 | „Erstelle ein HARO-Profil / Recherchescout-Profil" | A09 PR-Manager | Generator |
| 23 | „Schreib eine Antwort auf die Journalisten-Anfrage über BFSG" | A09 PR-Manager | Generator |
| 24 | „Wann müssen wir die Budget-Stufe hochschalten?" | A17 Finance + A12 | Quick |
| 25 | „Zeig mir den Conversion-Trichter — wo brechen die Nutzer ab?" | A02 Wochenreport (Funnel-Teil) | Quick |

---

## Neue zu bauende Skills / Commands

Diese 7 Skills fehlen und schließen die größten operativen Lücken:

### S1 — `ads-performance-pull`
- **Zweck:** Täglicher automatischer Pull aus Google Ads (via Porter Metrics MCP oder Google Ads API) — CPA, Impressionen, CTR, Spend, Top-5 und Bottom-5 Keywords
- **Input:** Zeitraum (Standard: letzte 7 Tage)
- **Output:** Kompakte Tabelle im Chat + Notion-Log-Eintrag
- **Trigger:** „Ads-Performance", „Wie laufen die Ads?"
- **Warum jetzt:** Ohne täglichen Pull ist der Founder blind. Aktuell müsste er manuell ins Google-Ads-Dashboard.

### S2 — `ab-test-tracker`
- **Zweck:** A/B-Test aus Posthog oder Google-Ads-Experiment anlegen, Status tracken, Stichprobengrößen-Alarm, Gewinner-Auswertung
- **Input:** Test-Name, Variante A/B, Ziel-Metrik, Mindest-Stichprobengröße
- **Output:** Test-Status-Report + Statistischer Signifikanz-Check (p<0,05 als Schwelle)
- **Trigger:** „A/B-Test Status", „Haben wir einen Gewinner?"
- **Warum jetzt:** `marketing/pricing-experiments.md` definiert 5 Tests — aber es gibt noch keine Infrastruktur um sie systematisch zu tracken.

### S3 — `scan-dataset-aggregat`
- **Zweck:** Anonymisierte Auswertung der echten Scan-Ergebnisse aus `scanner/out/scans.jsonl` — Top-10 häufigste A11y-Fehler, Branchen-Verteilung, Fehler-Score-Verteilung
- **Input:** Zeitraum, optional Branchen-Filter
- **Output:** Aggregiertes Markdown-Dokument (Show-HN-Daten-Story + Marketing-Material)
- **Trigger:** „Scan-Statistiken", „Was findet der Scanner am häufigsten?"
- **Warum jetzt:** Ohne echte Daten kein Show-HN-Post Version 2, kein 28.06.-PR, keine Credibility.

### S4 — `upsell-trigger`
- **Zweck:** Automatisch prüfen, welche Kunden 14 Tage nach Kauf noch kein Upgrade getätigt haben, und Brevo-Up-Sell-Sequenz als Draft anlegen
- **Input:** Stripe-Daten (letzte 30 Tage Käufe, Paket-Typ)
- **Output:** Liste Up-Sell-Kandidaten + Brevo-Campaign-Draft (Status: Entwurf, NICHT automatisch senden)
- **Trigger:** „Up-Sell-Check", „Wen können wir upgraden?"
- **Warum jetzt:** Post-Purchase-Revenue ist der günstigste Umsatz. Ohne diesen Skill verpufft es.

### S5 — `legal-copy-grep`
- **Zweck:** Deterministischer Regex-Scan aller Marketing-Dateien + Landing-Page-Texte auf verbotene Formulierungen (aus `legal-templates/wortwahl-rdg-safe.md` + CLAUDE.md Compliance-Liste)
- **Input:** Keine (scannt automatisch `marketing/*.md`, `landingpage-next/app/**`, `landingpage-next/components/**`)
- **Output:** Grep-Report mit Datei + Zeile + Fundstelle, sortiert nach Risiko-Level
- **Trigger:** „Legal-Grep", „Compliance-Scan" — oder automatisch vor jedem PR auf main
- **Warum jetzt:** Der bestehende `voice_lint.py` ist gut, aber auf Content-Files fokussiert. Code-Dateien (Komponenten-Texte) werden nicht gescannt. Das ist eine echte Lücke, die uns beim letzten Audit zwei Treffer beschert hat.

### S6 — `backup-verify`
- **Zweck:** Server-Backup-Status via SSH prüfen, Snapshot-Alter berechnen, ggf. manuellen Backup-Trigger ausführen, Restore-Trockenübung-Checklist ausgeben
- **Input:** keine (SSH-Alias `bfsg`)
- **Output:** Backup-Status (Datum, Größe, Pfad) + Restore-Checkliste als Markdown
- **Trigger:** „Backup-Check", „Ist das Backup aktuell?"
- **Warum jetzt:** SRE-Audit S-01 ist rot und noch offen. Ohne Backup gibt es bei einem Disk-Failure Totalverlust aller Orders und GoBD-Rechnungen.

### S7 — `stripe-revenue-snapshot`
- **Zweck:** Stripe-Umsatz für beliebigen Zeitraum pullen: Brutto, Net (nach Fees), nach Paket aufgesplittet, MRR-Trend, Refund-Quote
- **Input:** Zeitraum (Standard: aktueller Monat vs. Vormonat)
- **Output:** Kompakte Tabelle + Budget-Stufen-Einordnung (Bootstrap/Validierung/Skalierung)
- **Trigger:** „Stripe-Umsatz", „Revenue diese Woche", „Monatsumsatz"
- **Warum jetzt:** `weekly-kpi-report` macht das, aber ist schwer. Dieser lightweight Skill ist der schnelle Griff in die Kasse ohne den vollen Report-Aufwand.

---

## Governance & Guardrails (Compliance-Schutz)

### Ebene 1 — Blacklist-Gate (vor jeder Aktion)

Jede Action prüft vor Ausführung gegen eine Blacklist von verbotenen Aktions-Typen. Wenn ein Intent irgendwie gegen eine dieser Aktionen matched, **bricht das Cockpit sofort ab** und erklärt warum:

```
VERBOTENE AKTIONEN (hart codiert, nicht übersteuerbar):
- Cold-Mail an Einzelpersonen (UWG §7 II Nr.2)
- LinkedIn-DMs / Xing-DMs an Fremde (OLG Hamm 18 U 154/22)
- Werbebotschaft mit "BFSG-konform" oder "rechtssicher" oder "garantiert" (UWG §5)
- TÜV/DEKRA/Zertifikat-Erwähnung ohne echte Zertifizierung
- Schleichwerbung in Foren/Communities (UWG §5a IV)
- Ads-Budget-Änderung >100 €/Tag ohne explizite Session-Bestätigung
- Stripe-Refund >500 € ohne expliziten Betragsabgleich
- Jeder Datenbankzugriff außer Lesen ohne explizite User-OK
```

### Ebene 2 — Formulation-Guard (bei Content-Generierung)

Jeder generierte Text (Ad-Copy, Blog-Post, PM, Landing-Page-Änderung) läuft durch eine Prüfkette:

1. **Automatisch:** `legal-copy-grep` Skill (Regex, deterministisch) — findet verbotene Phrasen
2. **Automatisch:** `support-legal-compliance-checker` Agent checkt semantisch gegen UWG §5/RDG
3. **Output:** PASS / WARN / FAIL mit konkretem Befund

Bei FAIL: Output wird mit `⚠️ COMPLIANCE-FAIL: [Grund]` markiert, NICHT stillschweigend geändert. Matthias sieht was rausfliegt und warum — so lernt er die Muster.

### Ebene 3 — Pflicht-Bestätigung bei Live-Aktionen

Alle Live-Aktionen (Kategorie 3) folgen diesem Protokoll:

```
Claude zeigt:
  "LIVE-AKTION: [exakte Beschreibung was passiert]
   Betrag/Auswirkung: [€-Betrag oder externe Änderung]
   Nicht automatisch rückgängig machbar.
   Bestätigung erforderlich: y / n"

Nur bei explizitem "y" (oder "ja" per Voice) weiter.
Alles andere → Abbruch mit Log-Eintrag "user_cancelled".
```

### Ebene 4 — Audit-Log

Jede Cockpit-Aktion (Quick, Generator, Live) schreibt einen Eintrag in `out/cockpit-actions.jsonl`:

```json
{
  "ts": "2026-06-21T14:32:00Z",
  "action_id": "A10",
  "action_name": "process-refund",
  "category": "live",
  "inputs": {"session_id": "cs_live_xxx", "amount": 199},
  "user_confirmed": true,
  "result": "success",
  "external_side_effects": ["stripe_refund:re_xxx", "brevo_mail_sent"]
}
```

Das Log ist unveränderlich (append-only). Es ist die Revisions-Spur für steuerliche und rechtliche Zwecke (GoBD-konformes Audit-Trail für alle finanziellen Aktionen).

### Ebene 5 — Channel-Whitelist

Das Cockpit kennt nur diese erlaubten Marketing-Ausgangskanäle:

```
ERLAUBTE OUTBOUND-KANÄLE:
✅ Google Ads (Such-Kampagnen, DSGVO-konform)
✅ Bing Ads (Google-Import)
✅ SEO-Content auf bfsg-fix.de
✅ openPR, inar, firmenpresse (kostenlos + 28 €/Release)
✅ SaaSHub, G2, Capterra, OMR (Listings)
✅ Recherchescout / HARO (Journalisten-Anfragen beantworten)
✅ GitHub Awesome-Lists PRs (mit Founder-Disclosure)
✅ Show HN (Founder-Account, ein Post)
✅ Brevo (Transaktional + Double-Opt-In-Newsletter an bestehende Leads)

GESPERRTE OUTBOUND-KANÄLE:
❌ Cold-Mail (outreach.js gesperrt, Skill nicht verfügbar)
❌ LinkedIn-DMs / Xing (keine Accounts, kein Skill)
❌ partner-warm-dms.md (obsolet, Skill deaktiviert)
❌ Meta Ads / TikTok Ads / Reddit Ads (falscher Channel)
❌ Influencer-Outreach
```

---

## Offene Entscheidungen für den User

1. **Porter Metrics MCP installieren?** — Für A02 (Wochenreport) und S1 (Ads-Performance-Pull) wäre ein Porter-Metrics-MCP-Token nötig, um Google-Ads-Daten direkt zu pullen statt manuell CSV zu exportieren. Entscheidung: Ja/Nein + Auth-Token bereitstellen?

2. **Sentry DSN konfigurieren?** — `daily-health-check` Skill hat Sentry-Schritt, der aktuell skipped wird (kein DSN). Entscheidung: Sentry-Free-Tier anlegen (10.000 Fehler/Monat kostenlos) oder weiter auf Docker-Logs verlassen?

3. **Notion als primäre Pipeline-Datenbank?** — `weekly-kpi-report` und A02 schreiben nach Notion. Notion-MCP ist in `settings.local.json` aktiv, aber die DB „BFSG Sales Pipeline" und „BFSG KPIs" müssen angelegt sein. Entscheidung: Notion-Setup jetzt (15 Min), oder weiter ohne Pipeline-CRM?

4. **Redundante Agency-Divisions löschen?** — Die 4 Divisionen academic, gis, game-development, spatial-computing (ca. 30 Agents) sind für dieses Business definitiv irrelevant. CLAUDE.md nennt schon die Option sie zu entfernen. Entscheidung: Bereinigung jetzt, um Kontext-Overhead zu reduzieren? (Rückgängig via git)

5. **Voice-Integration via MCP oder purem Chat?** — Die 25 Voice-Intents können per Chat-Text funktionieren (sofort), oder über ein Voice-AI-Interface (Whisper → Text → Cockpit). Für Phase 1 reicht Chat-Text. Entscheidung: Ist Voice-Transkription (sprachgesteuert per Mikro) ein kurzfristiges Ziel?

6. **Cockpit-Audit-Log-Pfad bestätigen?** — Aktuell `out/cockpit-actions.jsonl`. Passt das zur bestehenden `out/`-Struktur (scans.jsonl, refunds-log.jsonl)? Oder separates Verzeichnis?

7. **S5 (legal-copy-grep) als Pre-Commit-Hook?** — Der Skill könnte als GitHub-Actions-Step bei jedem PR automatisch laufen und den Merge blockieren bei FAIL. Entscheidung: Automatisch in CI, oder manuell on-demand?

---

## Quellen

- Interner Scan: `C:\Users\Administrator\bfsg-check\docs\skills\*.md` (8 Skills)
- Interner Scan: `C:\Users\Administrator\bfsg-check\.claude\agents\agency\` (217 Agents, vollständige Dateiliste)
- `C:\Users\Administrator\bfsg-check\marketing\STRATEGY-2026.md`
- `C:\Users\Administrator\bfsg-check\docs\LEGAL-REALITY-CHECK-2026.md`
- `C:\Users\Administrator\bfsg-check\docs\HANDOVER-NEXT-SESSION.md`
- `C:\Users\Administrator\bfsg-check\docs\agency-audits\2026-06-21-MASTER-SUMMARY.md`
- `C:\Users\Administrator\bfsg-check\marketing\google-ads-rsa-headlines.md`
- `C:\Users\Administrator\bfsg-check\CLAUDE.md` (Root + Projekt)
- Keine externen Web-Quellen verwendet — alle Befunde basieren auf internem Repo-Scan
