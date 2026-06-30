# BFSG-Fuchs — Go-to-Market-Marketing-Strategie (Master)

> **Stand:** 30.06.2026 · **Markt:** DACH / primär Deutschland · **Setup:** Solo, § 19 Kleinunternehmer, faceless / 0-Touch, kein LinkedIn, kein Netzwerk
> **Quelle:** Multi-Team-Recherche (Perplexity + WebSearch, tagesaktuell) → siehe `marketing/2026-06-30-research-anhang.md` (Findings, Quellen, Faktencheck) und `marketing/2026-06-30-filo-ad-videos-opusclip.md` (Video-Pipeline).
> **Verhältnis zu Bestandsdocs:** baut auf `docs/MARKETING-MASTER-2026.md` (4-Säulen-0-Touch) auf — **ersetzt es nicht**, sondern schärft die Budget-Reihenfolge, integriert Filo-Video und korrigiert zwei veraltete Annahmen.

---

## 0. Zwei wichtige Korrekturen vorweg (verifiziert)

1. **Es gibt KEINE belegte BFSG-Bußgeld-/Abmahn-Welle der Behörde.** Belegt ist: das BFSG gilt seit **28.06.2025**, die **Marktüberwachungsstelle der Länder (MLBF, Magdeburg)** ist seit **26.09.2025** aktiv, hatte Stand **Juni 2026 fast 700 Meldungen** und baut von ~31 auf 73–99 Stellen aus; Bußgeldrahmen bis 100.000 € (§ 37 BFSG). Belegt sind außerdem **zwei private Abmahnwellen** (CLAIM RA GmbH / die-website-experten.de ~595 €; Kanzlei MK Berlin mit K3-Prüfberichten ~2.700 €) — die Fachwelt hält beide aber **überwiegend für angreifbar** (fehlendes Wettbewerbsverhältnis, § 3a-UWG-Abmahnfähigkeit gerichtlich ungeklärt). **Konkrete verhängte MLBF-Bußgelder sind öffentlich NICHT belegt.** → Der „1 Jahr BFSG"-Hook bleibt, aber **sachlich** („die Aufsicht prüft aktiv, fast 700 Meldungen"), nie als erfundene Drohkulisse (UWG § 5).
2. **„Meta/TikTok = kein B2B-Intent" ist 2026 überholt** — aber nur als **günstiges Reichweiten-/Retargeting-Volumen**, nicht als Lead-Motor. Intent wird heute über Kampagnenziel + Angebots-Design gelöst, nicht über Keyword-Suche. Für uns heißt das: Search bleibt der Kauf-Kanal, Paid Social wird Verstärker.

---

## 1. Executive Summary

- **Kern-Wette:** Nicht das Ad-Budget gewinnt, sondern die **eigene Tool-Mechanik**. Inbound/SEO/Tool-Loops kosten ~30–80 USD pro Lead, Paid Ads ~80–200 USD (Faktor 2–3 teurer). Das Geld ist der **Verstärker**, nicht der Motor.
- **Reihenfolge umgedreht:** (1) Gratis-Scan auf **„Value-first"** stellen → (2) **Bing zuerst** (billigster Paid-Search) → (3) Google Exact/Phrase nur Long-Tail/Branche → (4) **Retargeting** der Scan-Besucher (30–40 % billiger als Cold) → (5) kleiner Meta-Lead-Form-Test mit Filo-Video. Parallel dauerhaft: SEO/Programmatic + **AEO** (in ChatGPT/Perplexity zitiert werden) + Listings + freie PMs + Show HN.
- **Filo-Videos: JA — als Trust-/Wiedererkennungs-Verstärker auf warmem Traffic** (Retargeting + organische Reels/Shorts), NICHT als Cold-Akquise. Video schlägt Static hart (+44–58 % CTR, bis −80 % CPL), aber „Maskottchen schlägt Live-Action" ist **nicht belegt** → A/B-testen. Produktion via **Higgsfield (Konto bereits bezahlt, ~24.931 Credits)** → effektiv **0 € Mehrkosten** für die ersten ~12 Ads.
- **Markt-Positionierung:** Die Preis-**Lücke** zwischen Billig-Scan (~10–49 €) und Anwalts-/Agentur-Check (ab 930 € bis 10.000 €) ist real — unser **hochwertiger Einmal-Report 129/399 €** sitzt genau dort. Differenzierung: **ehrliches WCAG-2.1-AA-Audit statt Overlay-Etikettenschwindel** (AccessiBe: 1 Mio USD FTC-Vergleich 04/2025; Overlays von DBSV/NFB/WebAIM abgelehnt), **sympathisch statt einschüchternd** (Filo als Lotse).
- **Realistisches Ergebnis:** 14 Tage **2–4 kaufende Sales** (~400–1.200 €), Tag 90 **8–15 Sales/Monat** + erste Re-Check-Abos. Funnel-Math: ~5 % Scan→E-Mail, ~5–8 % E-Mail→Kauf → **500–1.000 qualifizierte Scans für 2–4 Sales**.
- **Budget:** 20–30 €/Tag Ads + ~40–70 €/Mo Tools. Ad-Spend bleibt unangetastet — Filo-Produktion läuft aus dem vorhandenen Higgsfield-Guthaben.
- **CAC-Disziplin:** CAC-Ceiling **177 €** (LTV ~533 €). Marketing primär auf **Profi 399 €** + Abo ziehen — Basis 129 € ist bei 100–150 € CAC zu eng.

---

## 2. Ziel & KPIs

**Conversion-Annahmen (belegt, konservativ; Faktencheck-Bezug im Anhang):**

| Stufe | Annahme | Beleg / Konfidenz |
|---|---|---|
| Scan → E-Mail-Lead | ~5 % (Spanne 2–10 %) | belegt (Free-Tool→E-Mail 2–10 %) |
| E-Mail-Lead → Kauf | ~5–8 % (Median ~8 %) | belegt (Free→Paid 3–12 %) |
| Scan → Kauf (composite) | ~0,3–0,6 % cold, ~1–2 % mit Nurture + Retargeting | belegt (Free-Tool-Realität 1–2 %) |
| **AI-Such-Referral → Lead** | **~3,2–3,7 %** (vs. SEO 1,9–2,6 %) | belegt (DigitalApplied/ADV.me 2024–26); Ahrefs-Ausreißer „23×" produktspezifisch, **nicht** generalisierbar |
| AOV | Ziel 350 € (Mix Basis/Profi/Cookie) | Vorgabe |
| LTV / CAC-Ceiling | ~533 € / 177 € (3:1) | Geschäftsrechnung |

**Ziel-Korridore:**

| Zeitraum | Qual. Scans/Mo | Kaufende Sales | MRR (Abo) | CPL-Ziel (qual. Lead) | CAC-Ceiling/Sale |
|---|---|---|---|---|---|
| **14 Tage** | 120–300 | 2–4 | 0–25 € | < 30 € (Search) | < 150 € |
| **30 Tage** | 200–400 | 3–8 | 25–78 € | < 30 € | < 150 € |
| **90 Tage** | 400–700 | 8–15 | 350–700 € | blended < 25 € (SEO/AEO ziehen) | < 177 € |

**Stopp-/Skalier-Trigger:**
- CAC/Sale > 177 € über 14 Tage rollierend → Keyword-/Kanal-Cut.
- 3 Monate konstant ≥ 1,5 % Scan→Kauf → Ad-Budget auf 50 €/Tag.
- Retargeting-**Video**-CPL < Search-CPL **und** warme Leads konvertieren → Filo-Video skalieren. Sonst: zurück auf organische Reels.
- Jede Video-Creative < 20 % Hook-Rate nach 48–72 h → killen; > 30 % → skalieren. (Hook-Rate-Mediane sind Vendor-Schätzungen, s. Anhang — als **eigenes** Steuerungs-KPI nutzen, nicht als externer Benchmark.)

---

## 3. Kanal-Mix & Priorisierung

> Ranking nach **Kosten pro kaufbereitem Lead** (aufsteigend). Zahlen = Größenordnungen aus der Recherche; **eigene Account-Daten schlagen jeden Benchmark** (Bing-„~41 USD"-Wert ist eine recycelte Hausnummer, kein präziser DE-CPL — s. Anhang).

| # | Kanal | Funnel | €/Tag (30er-Plan) | Erw. Leads/Mo | CPL/CPC-Größenordnung | Aufwand | Eignung |
|---|---|---|---|---|---|---|---|
| 1 | **SEO / Programmatic** (`/check/{domain}`, Pillar, Branche) | TOFU→MOFU | 0 € | 30 → 200+ (wächst) | ~30–80 USD-Klasse, sinkt gegen 0 | hoch (einmalig) | **sehr hoch** — kompoundiert |
| 2 | **AEO/GEO** (in ChatGPT/Perplexity/AI-Overviews zitiert) | TOFU | 0 € | klein, aber **beste Lead-Qualität** | ~0 €; AI-Referral konvertiert ~3,2–3,7 % | mittel | **sehr hoch** — Arbitrage-Fenster |
| 3 | **Bing/Microsoft Ads** (Exact/Phrase, Long-Tail) | BOFU | 8 € | 25–45 qual. | DE ~1,5–5 €/Klick (CPC ~30–40 % < Google) | niedrig (Import) | **sehr hoch** — billigster kaufbereiter Kanal |
| 4 | **Google Ads** (Exact/Phrase, Long-Tail/Branche) | BOFU | 11 € | 30–60 qual. | DE Recht/SaaS ~1,5–12 €/Klick; QS 8>5 = −33 % CPC | mittel | **hoch** — höchste Kaufabsicht |
| 5 | **Retargeting Video + Static** (Meta + YouTube, nur Scan-Besucher) | MOFU→BOFU | 6 € | Re-Engagement | −30–40 % CPA vs. Cold | niedrig (Pixel) | **hoch** — billigster Kaufpfad |
| 6 | **Listings + freie PMs + Show HN** | TOFU | 0 € | Schübe + Backlinks | ~0 € | mittel (einmalig) | **hoch** — Trust + SEO/GEO-Backlinks |
| 7 | **Organische Reels/Shorts** (Filo-Edu) + YouTube/Blog | TOFU | 0 € | variabel, wächst | 0 € | mittel (laufend) | **mittel-hoch** — kompoundiert |
| 8 | **Reddit/Community** (Value-first, Founder-Disclosure) | TOFU | 0 € | wenige, hochwertig + **AI-Zitat-Hebel** | 0 € | mittel | **mittel-hoch** — Reddit = Top-AI-Quelle |
| 9 | **Meta Lead-Forms + Filo-Video** (Test) | TOFU | 5 € | 40–80 low-intent | B2B-SaaS ~63 USD, native −30–50 % | mittel (Nurture Pflicht) | **mittel** — nur mit E-Mail-Nurture |

**Video-/Maskottchen-Entscheidung (datengestützt):**
- **YouTube Bumper (6s) + Shorts + In-Stream:** günstigste Video-Aufmerksamkeit im DACH-Raum (CPV 0,02–0,15 €, Shorts-CPM 2–8 €; man zahlt erst ab 30 s Watch). **Erster Video-Kanal.**
- **Meta Reels:** günstigste Meta-Platzierung für Reach + Retargeting-Pool-Aufbau (9:16, eingebrannte Untertitel, Hook < 2 s).
- **Retargeting (Meta + YouTube) mit Filo-Video: JA** — warm + high-intent, Video drückt CPL, Produktion kostenfrei.
- **Organische Reels/Shorts mit Filo: JA** (0 € Media, kompoundiert).
- **Meta Lead-Forms cold mit Filo: TEST** (5 €/Tag, nur mit Nurture).
- **Video als kalter Direct-Response-Lead: NEIN** — B2B-Video-CPL (80–380 USD) frisst die Marge bei 129–399 €.
- **TikTok-Ads: NEIN vorerst** (schwacher B2B-Intent; erst wenn Meta-Test trägt).
- **LinkedIn: NEIN** (kein Konto; zudem teuerster Kanal, niedrigste Video-CTR).
- **pMax/Display: NEIN** (Budget-Verschwendung bei Mikrobudget).

---

## 4. Budget-Allokation konkret

### Variante A — 20 €/Tag (600 €/Mo)
| Posten | €/Tag | €/Mo |
|---|---|---|
| Bing Ads (Long-Tail Exact/Phrase) | 6 € | 180 € |
| Google Ads (Long-Tail/Branche Exact/Phrase) | 8 € | 240 € |
| Retargeting Video + Static (Meta + YT, Scan-Besucher) | 4 € | 120 € |
| Meta Lead-Form-Test (Filo-Video) | 2 € | 60 € |
| **Ads gesamt** | **20 €** | **600 €** |

### Variante B — 30 €/Tag (900 €/Mo)
| Posten | €/Tag | €/Mo |
|---|---|---|
| Bing Ads | 8 € | 240 € |
| Google Ads | 11 € | 330 € |
| Retargeting Video + Static | 6 € | 180 € |
| Meta Lead-Form-Test | 5 € | 150 € |
| **Ads gesamt** | **30 €** | **900 €** |

### Tool-Stack (Ad-Budget bleibt unberührt)
| Tool | €/Mo | Zweck |
|---|---|---|
| Higgsfield | **0 €** (bereits bezahlt, ~24.931 Credits) | Filo Soul-ID + Stills + Image-to-Video |
| Agent Opus + Opus Clip (Plus) | ~28–42 € | DE-Voiceover, Brand-Kit, Captions, Hook-Varianten, Virality-Score |
| Brevo (E-Mail-Nurture) | 0–25 € | Double-Opt-in + Sequenz |
| AGB-Generator + Buchhaltung | ~20–25 € | Pflicht-Recht + § 19 |
| GA4 / Looker Studio / Search Console | 0 € | Messung |
| **Tools gesamt** | **~40–70 €/Mo** | unter Budget |

---

## 5. Funnel End-to-End

```
TOFU  Bing/Google-Suche · SEO /check/{domain} + Pillar · AEO-Zitate (ChatGPT/Perplexity)
        · Listings · Show HN · Reddit (Value-first) · organische Filo-Reels · Meta-Lead-Form-Test
   │
   ▼  Klick → bfsg-fuchs.de
MOFU  GRATIS-SCAN (URL, kein Login)
        → SOFORT UNGATED: Headline-Score (z. B. 68/100) + 2–4 Top-Fehler
        → Filo (Lotse) führt durch das Ergebnis
        Event: scan_started, score_shown
   │
   ▼  Value-Moment erreicht
LEAD  Voll-PDF + Aktionsplan + Branchen-Benchmark GEGEN E-MAIL (Double-Opt-in)
        Qualifizierung (Rolle/Firmengröße/URL) ERST JETZT
        Event: lead_captured → Pixel-Audience „Scan-Besucher"
   │
   ▼  Brevo-Nurture (5 Mails / 14 Tage)
BOFU  Stripe-Checkout: Basis 129 € / Profi 399 € (Bestseller) / Cookie 39–69 €
        Event: purchase (Webhook)
   │   ↑ parallel: RETARGETING (Filo-Video + statische Beweis-Ad) auf Lead ohne Kauf
   │     → Konzept „Was bekomme ich?" (Profi-399-Upsell)
   ▼
MRR   14 Tage nach Kauf: Re-Check-Abo 24,99 €/Mo (upsell-trigger-Skill, NUR Draft)
        + Cross-Sell Cookie-Check
```

**Value-first-Regel (belegt):** interaktive Tools konvertieren 2–3× besser als statische Lead-Magnets; ungated-„Aha-Moment" zuerst, Gate erst nach dem Wert. Cold-Traffic = ungated-first, warm/Retargeting = strafferes Gate vertretbar.

---

## 6. Creative-/Video-Plan (Filo + Agent Opus) — Kurzfassung

> Volle Pipeline + 8 Ad-Konzepte: `marketing/2026-06-30-filo-ad-videos-opusclip.md`.

**Pipeline:** Filo-PNGs (`landingpage-next/public/mascot-*.png`) → **Higgsfield Soul ID** (Identitäts-Lock gegen Drift — Pflicht) → Stills → Kling/Seedance Image-to-Video → **Agent Opus** (DE-Voiceover nativ, Brand-Kit Indigo/Mint #34d99a/Navy/Orange, Captions, Multi-Aspect 9:16/1:1/16:9) → **Opus Clip** (4–6 Hook-Varianten + Virality-Score) → `legal-copy-grep` + manuelles QA.

**Warum nicht Agent Opus allein:** dessen Charakter-Konsistenz ist referenz-gestützt, **kein** trainierbarer Character-Lock → Filo würde über viele Ads driften. Identität deshalb **upstream** in Higgsfield locken.

**Produktions-Takt (Solo-realistisch):** Woche 1 ein Master-Ad → 4–6 Hook-Varianten (~2–3 h erstes Master, dann ~45–60 Min/Variante). Ab Woche 2: 1 neues Master alle 1–2 Wochen + 2–3 organische Filo-Reels/Woche.

**Creative-Architektur (belegt):** Filo als Marken-Klammer (Intro/Outro, Wiedererkennung) **+ authentischer Bildschirm-Demo des Gratis-Scans als konvertierender Body**. Produktionsqualität ist bei < 200-USD-Logik conversion-irrelevant; Authentizität/Demo schlägt Hochglanz. Maskottchen = Brand/Recall/Langfrist (belegt), **kein** kurzfristiger CPL-Boost (nicht belegt) → konsistent > 6 Monate führen.

---

## 7. 90-Tage-Fahrplan (Owner-Aufgaben vs. Claude/automatisierbar)

> **„Nur Owner"** = Konten, Kreditkarte, Uploads, Live-Aktivierungen, Stripe, Posten/Absenden. Alles andere bereitet/erstellt Claude.

### Woche 1–2 — Fundament + Value-first + erster Video-Test
| Task | Owner | Claude |
|---|---|---|
| Gratis-Scan auf Value-first (Score + Top-Fehler ungated, PDF gegen E-Mail) | Merge-OK | Code + PR |
| Bing- + Google-Ads-Konto, Karte, Conversion-Tag live | ✅ Konto/Karte | Kampagnen-Struktur, Long-Tail-Keywords, RSA-Headlines, Negativ-Liste |
| Impressum + Datenschutz 1-Klick auf jeder LP (sonst Google-Sperre + höherer CPC) | — | Audit + Fix |
| Brevo-Nurture (5 Mails/14 T, Filo-Voice, legal-geprüft) | — | Sequenz schreiben |
| Pixel + „Scan-Besucher"-Retargeting-Audience (Meta + YouTube) | ✅ Pixel-OK | Setup + Event-Plan |
| Filo Soul-ID locken + Master-Ad 1 + Hook-Varianten | ✅ Higgsfield-Login/Upload | Konzept, DE-Skript, Stills/Video, Schnitt, Opus-Clip, Virality-Check |
| 7 Listings (SaaSHub dofollow, G2, Capterra-Stack, AlternativeTo, OMR …) | ✅ Account-Verifizierung | Submission-Texte (liegen vor) |
| 3 freie PMs (openPR/inar/firmenpresse), **sachlicher** 1-Jahr-BFSG-Hook | ✅ Absenden | PM-Texte |

### Woche 3–4 — Skalieren, was zieht + AEO starten
| Task | Owner | Claude |
|---|---|---|
| Top-2–3 Hook-Varianten als Retargeting (Meta+YT, 4–6 €/Tag), A/B Video vs. Static | ✅ Schalten | Targeting + A/B-Plan |
| Meta-Lead-Form-Test (5 €/Tag, Filo-Video) + Nurture-Branch | ✅ Schalten | Lead-Form + Branch |
| 3–4 Pillar-Pages + 2 Branchen-Seiten, **AEO-gehärtet** (FAQ-/HowTo-Schema, Vergleichstabellen, `llms.txt`) | — | Schreiben + Schema |
| `/check/{domain}` indexierbar (Top-Shops, robots-konform, noindex-Steuerung) | Merge-OK | Generator + Templates |
| Show HN „Ich habe X .de-Shops gescannt" (Founder-Disclosure) | ✅ Posten | `scan-dataset-aggregat`-Skill → Daten-Story |
| 2–3 Value-first-Reddit-Posts (r/accessibility, r/webdev, r/de-EntwicklerEcke) | ✅ Posten/Account | Beiträge + Disclosure-Wording |
| Wöchentlicher Ads-Pull (CPA/CTR/Top-Keywords) | — | `ads-performance-pull`-Skill |

### Monat 2 — Distribution-as-Product + AEO vertiefen
| Task | Owner | Claude |
|---|---|---|
| Chrome-Extension MVP (Top-3-Findings frei, Vollreport gegen Mail) | Store-Account | Code + Listing |
| BFSG-Score-Badge (rel=nofollow) zum Embed | Merge-OK | Code + WP-Shortcode |
| 4–6 weitere Pillar/Branchen-Seiten + Prompt-Audit (was sagt ChatGPT über uns?) | — | Schreiben + Monitoring |
| Filo-Edu-Reel-Serie (5–6 Folgen) organisch | ✅ Posten | Komplett produzieren |
| Retargeting auf Profi-399-Upsell ausweiten | ✅ Schalten | Konzept 4 + Audiences |

### Monat 3 — Hebel verstärken + Skalier-Entscheidung
| Task | Owner | Claude |
|---|---|---|
| WordPress-Plugin (Free+Pro) | Store-Account | Code + Listing |
| npm bfsg-cli (AGPLv3) → GitHub-Backlinks | npm/GH-Account | Code + README |
| Awesome-a11y-PRs (4 Repos, Founder-Disclosure) | ✅ PR-Interaktion | PR-Texte |
| Budget-Skalier-Entscheidung (Trigger ≥ 1,5 % Scan→Kauf) | ✅ Entscheidung | Forecast + Empfehlung |
| Monats-Review + Reallokation | — | `weekly-review`/`stripe-revenue-snapshot`-Skills |

---

## 8. Legal-konforme Ad-Texte / Hooks (Pflicht-Sprache)

> Keine Konformitäts-, Garantie- oder Siegel-Claims (Pflicht-Sprache, s. CLAUDE.md). Filo = kompetenter Lotse, neutral. Vor jeder Schaltung durch `legal-copy-grep`.

1. **(Search, BOFU):** „Website auf Barrierefreiheit prüfen — automatisierte WCAG-2.1-AA-Analyse. Score + Top-Fehler sofort, kostenlos. bfsg-fuchs.de"
2. **(Search, Branche):** „{Branche}-Website technisch prüfen lassen — automatisierte Analyse nach WCAG 2.1 AA. Ergebnis in Minuten, ohne Login."
3. **(Retargeting-Video):** „Du hast deinen Score gesehen — und jetzt? Filo zeigt dir die Top-3-Befunde und einen priorisierten Umsetzungsplan."
4. **(Cookie-Nische):** „Cookie-Banner: Ist ‚Ablehnen' gleich sichtbar wie ‚Akzeptieren'? Automatischer Cookie-Check ab 39 €."
5. **(1-Jahr-BFSG, sachlich):** „Seit einem Jahr gilt das BFSG, die Aufsicht prüft aktiv. Viele Websites wurden technisch noch nie geprüft — eine automatisierte WCAG-2.1-AA-Analyse zeigt den Stand in Minuten."
6. **(Meta-Lead-Form):** „Drei Schritte, kein Login: URL eingeben → Score → Top-Fehler. Voll-Report per E-Mail."
7. **(§ 6 UWG vergleichend, neutral):** „Wie barrierefrei ist deine Seite — objektiv gemessen? Hol dir deinen WCAG-Score auf einer Skala von 0–100. (Overlay-Tools decken oft nur einen Teil der Prüfpunkte ab — wir benennen, was automatisiert testbar ist und was manuell zu prüfen bleibt.)"

---

## 9. Mess- & Reporting-Plan

**Tools:** GA4 + Server-Side-Events (CMP-robust), Looker Studio (Stripe + Ads + GA4), Search Console, Brevo-Stats, Pixel (Meta/YT). **AEO-Tracking:** UTM `utm_source=chatgpt|perplexity`, GA4-Segment „AI-Referral", monatlicher Prompt-Audit („Was ist das beste BFSG-/WCAG-Tool?"). Skills: `ads-performance-pull`, `stripe-revenue-snapshot`, `legal-copy-grep` (vor jedem Ad-Launch), `ab-test-tracker`.

**Events:** `scan_started` → `score_shown` → `lead_captured` → `purchase` → `abo_started`.

**Rhythmus:** täglich automatisierter Ads-Pull (Alarm bei CPA > 177 € oder Werktags-Umsatz 0); wöchentlich Funnel-Snapshot + Top/Bottom-Keywords + Hook-Rate-Cut; monatlich Channel-Review + Reallokation + Prompt-Audit.

---

## 10. Risiken & Mitigations

| Risiko | Wahrsch. | Impact | Mitigation |
|---|---|---|---|
| **Google-Ads-Account-Suspension** (Compliance-nahes Thema) | mittel | hoch | Impressum + Datenschutz 1-Klick, klare Disclaimer (`disclaimer-footer.md`), keine Heils-/Garantie-Sprache; **Bing redundant** schon live; Backup SEO/AEO/Listings |
| **CAC > LTV** (DE-Compliance-CPC 4–12 €) | hoch | mittel | nur Long-Tail Exact/Phrase, hoher Quality Score (−33 % CPC), CPA-Cap 177 €, Profi-399-Fokus, Retargeting statt Cold |
| **UWG § 5/§ 5a-Abmahnung** (Ad-Copy / 1-Jahr-Hook reißerisch) | mittel | hoch | `legal-copy-grep` vor Launch, Pflicht-Sprache, § 6-Vergleiche nur objektiv/neutral, **keine erfundene Bußgeld-Welle**, keine Siegel-Optik |
| **Filo-Identitäts-Drift** über viele Ads | mittel | mittel | Higgsfield Soul-ID-Lock upstream (Pflicht), QA pro Video |
| **DE-Captions verhunzen Fachbegriffe** (WCAG/BFSG) | mittel | mittel | nativ deutsch einsprechen, manuell prüfen, nicht auto-übersetzen |
| **Meta-Test verpufft** (Low-Intent ohne Nurture) | mittel | niedrig | Test nur MIT Brevo-Nurture, Hard-Cap 5 €/Tag, schnell killen |
| **Annahme „Maskottchen schlägt Static" falsch** | mittel | niedrig | strukturierter A/B-Test, Budget erst nach Beleg |
| **Benchmark-Fehlsteuerung** (Vendor-Zahlen zu optimistisch) | mittel | mittel | Benchmarks nur als Startwert, nach 2 Wochen auf **eigene Account-Daten** umstellen |
| **Owner-Überlastung** (Solo, viele Kanäle) | hoch | hoch | max. 1 neuer Kanal/8 Wochen, Claude übernimmt Produktion/Setup |

---

## 11. Sofort-Start: die 5 ersten Aktionen DIESE Woche

1. **Gratis-Scan auf Value-first umbauen** (Score + 2–4 Top-Fehler ungated, Voll-PDF/Plan/Benchmark gegen E-Mail). Größter Conversion-Hebel, 0 € Media. → Claude baut PR, Owner merged.
2. **Bing-Ads zuerst live** (Long-Tail Exact/Phrase, 6–8 €/Tag) + Google parallel (8–11 €/Tag). Conversion-Tag + Impressum/Datenschutz-Check. → Owner: Konto/Karte; Claude: Kampagne/Keywords/Headlines.
3. **Pixel + „Scan-Besucher"-Retargeting-Audience** (Meta + YouTube). Ohne das verschenkst du den billigsten Kaufpfad. → Owner: Pixel-OK; Claude: Setup + Event-Plan.
4. **Filo Soul-ID locken + Master-Ad 1 („60-Sekunden-Check") + 4–6 Hook-Varianten** über Higgsfield/Agent Opus/Opus Clip (0 € Mehrkosten). `legal-copy-grep` drüber. → Owner: Higgsfield-Login/Upload; Claude: alles andere.
5. **Brevo-Nurture (5 Mails/14 T) scharf schalten** + 3 freie PMs (openPR/inar/firmenpresse) mit **sachlichem** 1-Jahr-BFSG-Hook. → Owner: absenden; Claude: Texte (legal-geprüft, Filo-Voice).

---

*Belege, Faktencheck-Verdikte und vollständige Quellen: `marketing/2026-06-30-research-anhang.md`. Filo-Video-Pipeline + 8 Ad-Konzepte: `marketing/2026-06-30-filo-ad-videos-opusclip.md`.*
