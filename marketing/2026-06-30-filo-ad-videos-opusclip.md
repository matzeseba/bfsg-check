# Filo-Ad-Videos mit Opus Clip „Agent Opus" + Higgsfield — Machbarkeit, Pipeline & Konzepte

> **Stand:** 30.06.2026 · Begleitdokument zu `marketing/2026-06-30-marketing-strategie-master.md`
> **Quellen/Faktencheck:** `marketing/2026-06-30-research-anhang.md` (Blöcke `oc-comic`, `mk-video`).

---

## 1. Machbarkeits-Urteil: JA — und günstiger als zunächst angenommen

**Wir können starke Filo-Ad-Videos günstig produzieren.** Entscheidend: In dieser Session ist bereits ein **bezahltes Higgsfield-Konto** aktiv (verifiziert via `show_plans_and_credits`: Plan „pro", **~24.931 Credits**). Das reicht grob für ~200 Videos bzw. ~500 Character-Generierungen — **0 € Zusatzkosten** für die ersten ~12 Ads.

**Belege:**
- **Video-Vorteil ist hart belegt:** Video schlägt Static um +44–58 % CTR, bis −80 % CPL, Reels −20–30 % CPM. Die Filo-PNGs (`mascot-bust/full/magnify/report/thumbsup`) sind ideale Charakter-Referenzen.
- **Agent Opus HAT den Cartoon-Use-Case** (verifiziert): „AI Cartoon Video Generator" mit Custom-Character-Generation, Voice-Synced Lip-Sync, Style-Consistency, plus „AI Marketing Video / Ad Variations / Avatar / Motion Graphics Generator". Die „Actor"-Asset-Kategorie nennt explizit „mascot, stuffed animal" als Upload-Typ.

**Zwei harte Grenzen (ehrlich):**
1. **Agent Opus' Charakter-Konsistenz ist NICHT pixel-stabil.** Sie ist *prompt-/referenz-gestützt*, kein trainierter Character-Lock. Opus selbst: Stil kann „nicht perfekt" repliziert werden; Drift bei Multi-Szenen/mehreren Charakteren; Lip-Sync kann bei langer Narration driften. Reviews: Output teils „leicht off", braucht QA.
2. **Maskottchen ≠ Conversion-Wunder.** Fluent-Device-/Maskottchen-Evidenz ist **Brand/Recall/Langfrist** (System1/IPA: +~30 % Langzeit-Effekt-Wahrscheinlichkeit; Ebiquity: +62 % ROI), **kein** belegter kurzfristiger CPL-/Conversion-Vorteil im Performance-Funnel. → Filo strategisch für Wiedererkennung in Awareness + Retargeting, nicht als kalter Lead-Harvester.

**Schlussfolgerung:** Machbar und billig. Die einzige echte Schwachstelle (Filo-Identität über viele Ads) löst man **upstream** — mit **Higgsfield Soul ID** (trainierter, wiederverwendbarer Character-Lock) + **Kling/Seedance** Image-to-Video. Agent Opus wird zum **Veredler/Repurposer**, nicht zum Charakter-Generator.

---

## 2. Produktions-Pipeline (Schritt für Schritt)

| Stufe | Werkzeug | Rolle | Kosten |
|---|---|---|---|
| **0. Input** | Filo-PNGs (`landingpage-next/public/mascot-*.png`) | Charakter-Referenz-Sheet (5 Posen vorhanden) | — |
| **1. Filo-LOCK** | **Higgsfield Soul ID** | trainiert EINEN wiederverwendbaren Filo aus den PNGs | ~60 cr (in Session vorhanden) |
| **2. On-Model-Stills** | Higgsfield `generate_image` (Soul-Character) | 9:16-Szenen: Filo zeigt auf Score, hält Report, Daumen hoch | ~5 cr/Bild |
| **3. Animation** | Higgsfield `generate_video` (Kling/Seedance) | Stills → 5s-Clips: winken, deuten, nicken | ~15 cr/Clip |
| **4. Master-Ad** | **Agent Opus** | deutsche Voiceover (nativ), Brand-Kit (Indigo/Mint #34d99a/Navy/Orange + Logo), Captions, Multi-Aspect 9:16/1:1/16:9 | Plus/Pro-Abo |
| **5. Repurposing** | **Opus Clip** | 1 Master → 4–6 Hook-Varianten + **AI-Virality-Score 0–100** | Opus Clip Pro ~14,50 $/Mo (annual) |
| **6. Pre-Flight** | Higgsfield `virality_predictor` + `legal-copy-grep`-Skill | Virality-Check + Regex-Scan auf verbotene Claims (legal-copy-grep-Risikotabelle) | in Session |
| **7. QA** | Mensch | Lip-Sync-Drift, Filo-Identität, DE-Rechtschreibung, Uncanny-Frames | Pflicht |

**Rollen klar getrennt:**
- **Agent Opus macht NICHT** die zuverlässige Filo-Identität (Drift) → Higgsfield Soul ID.
- **Agent Opus macht** die schnelle Veredelung: DE-Stimme, Brand-Kit, Captions, Motion-Graphics, Multi-Aspect-Export (spart die Schnitt-Stufe).
- **Opus Clip macht** das billige Multiplizieren eines Masters in Hook-Varianten + Virality-Vorsortierung.

**Schnellstart-Alternative (heute):** Higgsfield `show_marketing_studio` (webproduct = bfsg-fuchs.de) erzeugt direkt Produkt-/Website-Ads inkl. Preset-Hooks — komplett in dieser Session, ohne externes Tool.

**DE-Produktion:** Skript auf Deutsch, deutsche Stimme (eigene oder Agent-Opus-DE-Voice), dann Captions deutsch transkribieren. **Nicht** auf EN→DE-Auto-Caption-Übersetzung verlassen (lange nur EN).

---

## 3. Acht Filo-Ad-Konzepte (alle legal-konform)

> Pflicht-Sprache („automatisierte technische Analyse" / „WCAG-2.1-AA-Audit"). Keine Konformitäts-, Garantie- oder Siegel-Claims (Details: CLAUDE.md → Pflicht-Sprache). Filo = kompetenter Lotse, nie listig. **Architektur jeder Ad:** Hook (0–3 s, Filo + Problem) → Problem in Kundensprache → Lösung/Mechanik (Scan-Demo) → Beweis (echter WCAG-Score, neutral) → CTA. Body als authentische Bildschirm-Demo, Filo als Marken-Klammer.

1. **„Der 60-Sekunden-Check" (Retargeting)** — *Hook:* Filo (Lupe): „Deine Website — schon technisch prüfen lassen?" *15–20 s:* URL-Feld → Score „68/100" → Top-3-Fehlerkarten. „Automatisierte WCAG-2.1-AA-Analyse. Sofort. Kostenlos." *Kanal:* Meta/YouTube-Retargeting. *CTA:* „Jetzt kostenlos prüfen → bfsg-fuchs.de"
2. **„Die unsichtbaren Hürden" (Awareness)** — *Hook:* Filo vor Treppe ohne Rampe. *15–25 s:* Kontrast zu niedrig, Bild ohne Alt-Text, Tastatur-Falle → Filo erklärt ruhig, Daumen hoch. *Kanal:* Reels/Shorts organisch + Meta Lookalike. *CTA:* „Sofort-Check starten."
3. **„Score-Reveal" (§ 6 UWG vergleichend, neutral)** — *Hook:* „Wie barrierefrei ist deine Seite wirklich?" *15 s:* Skala 0–100, Filo platziert WCAG-Score; Overlay-Vergleich neutral („deckt oft nur einen Teil ab"). *Kanal:* YouTube-Retargeting. *CTA:* „Deinen Score holen."
4. **„Was bekomme ich?" (Profi-399-Upsell-Retargeting)** — *Hook:* Filo hält PDF: „Score gesehen — und jetzt?" *20–30 s:* Report-Seiten → priorisierter Umsetzungsplan → 30 Tage Support. *Kanal:* Retargeting nur auf Gratis-Check-Nutzer ohne Kauf. *CTA:* „Profi-Report ansehen."
5. **„Cookie-Banner-Check" (Cookie-Pakete)** — *Hook:* Filo zeigt auf Banner mit nur „Akzeptieren": „Fällt dir was auf?" *15 s:* Gleichgewicht — „Ablehnen" gleich sichtbar (TDDDG). *Kanal:* Bing/Google-Retargeting + Reels. *CTA:* „Cookie-Check ab 39 €."
6. **„1 Jahr BFSG" (PR-Hook, sachlich)** — *Hook:* Filo mit Kalender: „Seit einem Jahr gilt das BFSG, die Aufsicht prüft aktiv." *20 s:* „Viele Websites wurden technisch noch nie geprüft. Eine automatisierte Analyse zeigt den Stand — in Minuten." *Kanal:* organisch + leichtes Retargeting. *CTA:* „Jetzt prüfen lassen." (Keine Drohkulisse, keine erfundene Bußgeld-Welle.)
7. **„Filo erklärt einen Fehler" (Edu-Serie, SEO/AEO-Begleitung)** — *Hook:* Filo zoomt auf `alt=""`: „Dieses leere Attribut kostet dich Sichtbarkeit." *15 s:* Mini-Erklärung Alt-Text. Serie aus 5–6 Folgen (konsistenter Filo via Soul ID). *Kanal:* organisch Reels/Shorts + eingebettet auf Pillar-Pages. *CTA:* „Volle Analyse: Sofort-Check."
8. **„Vom Klick zum Klartext" (Conversion-Demo)** — *Hook:* Filo tippt URL: „Drei Schritte. Kein Login." *15–20 s:* URL → Scan-Animation → Score + Top-Fehler ungated, dann „Voll-Report per E-Mail" (Value-first). *Kanal:* Meta-Lead-Form-Test + Retargeting. *CTA:* „Kostenlos starten."

---

## 4. Wo die Videos am günstigsten warme Leads bringen

1. **Retargeting der Gratis-Check-Besucher (Meta + YouTube)** — billigster Pfad (Retargeting-CPA −30–40 % vs. Cold; jeder Scan-Nutzer ist warm). → Konzepte 1, 3, 4, 8.
2. **Organische Reels/Shorts** (0 € Media) — Edu-Serie (7) + Awareness (2, 6). Kompoundiert wie SEO; Virality-Score sortiert vor.
3. **Meta-Lead-Forms-Test, klein (5 €/Tag)** — B2B-SaaS-CPL ~63 USD, native Forms −30–50 %. Lower-Intent → **zwingend** mit E-Mail-Nurture. → Konzept 8.
4. **NICHT für Cold-Prospecting im Feed.** Such-Intent-First bleibt (Bing/Google). Filo = Trust-/Wiedererkennungs-Verstärker auf warmem Traffic.

**Zahlen-Anker:** ~5 % Scan→E-Mail, ~5–8 % E-Mail→Kauf → 500–1.000 qualifizierte Scans für 2–4 Sales; Retargeting-Video drückt den Cost-per-warmem-Lead am stärksten.

---

## 5. Kosten/Aufwand + 1-Wochen-Quick-Start

**Kosten pro Master-Ad (15–30 s):** Higgsfield (Soul-Training 1× ~60 cr, 3–5 Stills ~25 cr, 3–5 Clips ~75 cr ≈ 160 cr) → **0 € Zusatz** aus dem vorhandenen Guthaben. Agent Opus + Opus Clip im Abo (~28–42 €/Mo gesamt). **Zeit:** ~2–3 h erstes Master (inkl. Soul-Lock), danach ~45–60 Min/Variante.

**1-Wochen-Test:**
- **Tag 1:** Filo via Higgsfield Soul ID locken (5 mascot-PNGs). Brand-Kit-Farben fixieren.
- **Tag 2:** Konzept 1 als Master bauen: 4 Stills → Kling-Clips → Agent Opus DE-Voiceover + Captions + Brand-Kit, 9:16 + 1:1.
- **Tag 3:** Opus Clip → 4–6 Hook-Varianten; `virality_predictor` + Opus-Virality-Score → Top-2–3; `legal-copy-grep` drüber.
- **Tag 4–7:** Top-2–3 als **Meta- + YouTube-Retargeting** auf Gratis-Check-Besucher, ~10–15 €/Tag. **Gegen Static A/B-testen** (Maskottchen-Delta unbelegt → messen). KPI: Hook-Rate, CPM, CTR, CPL, Scan→E-Mail.
- **Erfolgs-Schwelle:** Retargeting-Video-CPL < Search-CPL **und** warme Leads konvertieren → auf Konzepte 3/4/8 + Lookalike skalieren. Sonst: organische Reels + Search behalten.

**Ehrliche Grenzen:** (1) Soul-ID-Lock upstream ist Pflicht, nicht optional. (2) DE-Captions/Fachbegriffe nativ produzieren, QA jedes Mal. (3) Filo-Videos sind Conversion-/Trust-Verstärker auf warmem Traffic — die 0-Touch-Säulen Search + SEO/AEO bleiben der Lead-Motor.

---

*Plattform-Reife: opus.pro (Stand Dez 2025) 16 Mio+ Nutzer, 440 Mio+ Clips. Etabliert genug für Produktion — aber kein „fire-and-forget" im Rechts-/Trust-Thema, QA bleibt Pflicht.*
