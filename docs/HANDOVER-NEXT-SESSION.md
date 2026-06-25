# 🤝 Handover für die nächste Session

> **Lies das nach `CLAUDE.md` als ZWEITES.**
> **Stand:** 24.06.2026 (Abend) · **ZIEL: heute Abend Go-Live.** Letzte Sessions: Conversion-Optimierung (PR #54) · lückenloser FE+BE-Launch-Readiness-Audit (100 verifizierte Funde, alle 6 P0 im Code gefixt, PR #55) · 4 Owner-Entscheidungen umgesetzt · Hero mobil-zentriert + Vorschau-Kasten als „Beispiel" gekennzeichnet (PRs #56–#61). **Alles gemergt + live.** Offene Go-Live-Aufgaben: **siehe direkt unten.**

---

## 🚀 GO-LIVE-CHECKLISTE (Stand 24.06.2026, Abend) — DAS HIER ZUERST

> **Was bleibt bis zum Live-Gang offen.** Detail-Belege je Backend-Fund: `docs/AUDIT-LAUNCH-READINESS-2026-06.md` (vollständige P0/P1/P2-Tabellen + Buckets).
> Status der Website selbst: **bereits deployed & grün** (`/health` ok, Stripe live, Mailer aktiv). „Go-Live" = Launch/Ads scharf schalten — dafür fehlt v. a. Owner-Setup + etwas Server-Härtung.

### 🔴 A) PFLICHT heute Abend — nur der Owner kann das (Server-`.env` + Konten)
1. **Rechnungs-Pflichtangaben im Server-`.env`** (`/opt/bfsg-check/deployment/.env`) setzen — sonst trägt JEDE Rechnungs-PDF einen Platzhalter als Anbieter-Anschrift (§14 UStG = formfehlerhaft, Audit-P0#2):
   - `INVOICE_FROM_NAME=Matthias Seba`
   - `INVOICE_FROM_ADDRESS=Lange Straße 20, 27449 Kutenholz`
   - `VAT_MODE=kleinunternehmer`
   - `ADMIN_TOKEN=` (langes Zufallsgeheimnis, z. B. `openssl rand -hex 32`) — schützt `/api/admin/*`
   - `SENTRY_DSN=` (optional)
   → danach `docker compose up -d --build`, dann **1 Test-Rechnung erzeugen und Anschrift/„§19"-Hinweis prüfen**. (Platzhalter stehen bereits in `deployment/.env.example`.)
2. **Stripe-Live-Testkauf** (eigene Karte → danach Refund) — PFLICHT bevor echte Zahlungen/Ads laufen. Verifizieren: Webhook → Scan startet → PDF + eigene Rechnung + Mail kommen an. (Deckt zugleich den Resend-/Rechnungs-Pfad-Live-Test ab, Audit-P0#4.)
3. **Newsletter aktivieren** (optional fürs reine Go-Live — ohne Config meldet das Footer-Formular ehrlich „gerade nicht verfügbar"): in Brevo (a) eine **Newsletter-Liste** anlegen, (b) ein **Double-Opt-in-Template** anlegen + aktivieren (existiert beides noch nicht — per API geprüft), dann im Server-`.env`: `BREVO_API_KEY`, `BREVO_NEWSLETTER_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`, `BREVO_DOI_REDIRECT_URL`. Code + Endpoint (`/api/newsletter`) sind fertig und env-gated.

### 🟠 B) Server-/Code-Härtung vor Ad-Skalierung (brauchen Server- oder Live-Test — NICHT im Sandbox machbar)
- **SSRF endgültig schließen (Audit-P0#1):** Code-Guard ist live (Per-Navigation-IP-Check inkl. Redirect-Hops + immer-aktiver Private-IP-Check). **Volle Absicherung = Netz-Egress-Policy / IP-pinnender Proxy auf Hetzner + Pen-Test** gegen interne IPs/Metadaten. Vor breiter Exposition verifizieren.
- **networkidle-Fallback (P0#6) + AxeBuilder-Timeout (#45):** gegen reale tracking-/long-poll-lastige Kundenseiten live testen.
- **Chromium läuft als root mit `--no-sandbox` (P1#4):** `USER pwuser` im `scanner/Dockerfile` + Sandbox aktivieren, Container-Rebuild + Smoke-Test.
- **Mail-Retry (P1#3):** `sendMail` mit 3× Backoff + Mail-Try vom Scan/Rechnungs-Try trennen — **noch NICHT umgesetzt** (verhindert FAILED-Order trotz fertigem Report bei transienter SMTP-Störung).
- **Webhook-Idempotenz-Persistenz + Reconcile-Sweeper (P1#2, #50, #54)** und **async-Zahlart/SEPA (#59):** vor Skalierung / vor `ENABLE_ABO=true`.
- **Multi-Instance-Rechnungszähler (#58)** + **echte DSGVO-Compaction (#60):** erst bei Skalierung/2. Instanz relevant.
- **Rest:** ~40 P2-Politur-Items — siehe Audit-Doc, nicht Go-Live-blockierend.
> Hinweis: Der §19-Brutto/Netto-Fix (P1#1) ist durch die Owner-Entscheidung „Kleinunternehmer" **gegenstandslos** (Default ist korrekt).

### 🟢 C) Conversion-Backlog (brauchen Assets vom Owner — nicht Go-Live-blockierend)
- **Gründer-Block** auf der Landingpage: Foto + Name + Satz („Ich prüfe jeden Report persönlich, bevor er rausgeht. — Matthias Seba"). Stärkstes Trust-Signal für Solo-Founder. **Braucht:** 1 Foto + finalen Satz.
- **Beispiel-Report-PDF** zum Ansehen vor dem Kauf (Link im Hero/bei den Pakketen). **Braucht:** 1 anonymisierten Report aus `scanner/` als PDF unter `landingpage-next/public/`.

### ✅ In dieser Session bereits erledigt + LIVE (nicht mehr offen)
- **Conversion-Optimierung** (PR #54): Legal-P0s („BFSG-konform" raus → „bereit fürs BFSG?"), Cookie-2-Button-Balance, Performance/CWV, A11y-Fokus, CRO-Copy.
- **Launch-Readiness-Audit** (PR #55): alle 6 P0-Blocker im Code (SSRF-Guard, §14-ENV-Platzhalter, Rate-Limit `req.ip`, Resend-Doppelrechnung, Light-Fokus-Ring, networkidle-Fallback) + breite FE-Fixes (SEO/JSON-LD-Split, Canonicals, Perf, A11y, Legal-Copy).
- **4 Owner-Entscheidungen:** USt §19-Captions+FAQ · Social-Links entfernt · B2B-Firmenfeld im Checkout · Newsletter→Brevo-DOI-Endpoint · Checkout-E-Mail-Validierung.
- **Hero/Visual:** Headline-Clipping + Mobile-Zentrierung (per Browser-Messung auf 22/22px verifiziert), Headline „bereit fürs BFSG?", Vorschau-Kasten als **„Beispiel"** gekennzeichnet (Chip + Überschrift „So sieht Ihr kostenloses Sofort-Ergebnis aus"), Eck-Badge entfernt (PRs #56–#61).

---

## 🆕 Update 22.06.2026 — Conversion-Optimierung (Spezialisten-Team-Review)

- ✅ **5 Agency-Agenten parallel** (CRO/Growth · Visual-Design · Conversion-Copy · A11y/Trust · Mobile-Performance) haben die komplette Landingpage auditiert → konvergente, hoch-konfidente Maßnahmen umgesetzt.
- ✅ **PR #54 (Draft):** „Conversion-Optimierung: Legal-P0s, Performance & CRO-Politur". Build grün (Next 16, TS strict, ESLint clean, 20/20 Seiten). **Merge nach `main` = morgen geplant** (User-Entscheid 22.06.) → Auto-Deploy auf Prod.
- **Legal-P0s gefixt (vor paid Traffic kritisch):**
  - „BFSG-konform" aus H1 + SEO-`<title>` + Meta-Description raus (UWG §5) → „barrierefrei genug?" / WCAG-Framing.
  - Cookie-Banner: beide Consent-Buttons gleichwertig (§25 TDDDG / Dark-Pattern-Verbot — das eigene Cookie-Produkt prüft genau das).
  - „Meistgewählt"/„Beliebt" → „Empfohlen" (unbelegbare Marktaussage).
- **Performance/CWV:** `background-attachment:fixed` + Grain-Overlay (Mobile-Scroll-Jank) entfernt/gegated; Hero-H1+Subline statisch (LCP nicht mehr durch `opacity:0` verzögert); Hero-Blurs reduziert.
- **A11y:** Fokus-Ring auf allen Buttons sichtbar (ring-offset, auch auf Mint-CTAs); Link-Fokus-Outline (WCAG 2.4.7); `size=lg` = 44px Touch-Target.
- **CRO/Copy:** Featured-Pricing-Card mit echter Elevation; CTA-Labels, Risk-Band-Urgency, Differentiators geschärft; 2 neue FAQ-Objections + Reihenfolge.

### 🔴 BACKLOG aus dem Conversion-Review (brauchen Assets/User — NICHT in PR #54)
> Laut Trust-Audit die **zwei stärksten Deal-Closer** für einen Solo-Founder ohne Kunden-Logos. Bewusst zurückgestellt, weil echtes Material nötig ist.
1. **Gründer-Block auf der Landingpage** — kleine Sektion „Wer dahintersteht": Foto + Name + ein Satz („Ich prüfe jeden Report persönlich, bevor er rausgeht. — Matthias Seba"). 100 % legal, nicht fälschbar, stärkstes Vertrauenssignal im B2B-Solo-Verkauf. **Braucht:** 1 Foto + finalen Satz vom User. Platzierung: zwischen `Testimonials` (Differentiators) und `PricingCards`, oder im `TrustSection`.
2. **Beispiel-Report (anonymisiertes PDF)** zum Ansehen VOR dem Kauf — „Beispiel-Report ansehen →" im Hero (unter dem Scan-Form) + bei den Pricing-Cards. Senkt die „Was bekomme ich eigentlich?"-Reibung beim 199–499 €-Blind-Kauf massiv. **Braucht:** 1 echten/anonymisierten Report aus `scanner/` als PDF, abgelegt unter `landingpage-next/public/`.

> Weitere, riskantere/größere Ideen aus dem Review (separat zu bewerten, NICHT eilig): Section-Reordering (Differentiators nach Pricing), „Bald verfügbar"-Abo-Karte aus dem 3er-Grid in einen Teaser ziehen, Email-Capture-Fallback bei Scan-Fehler (statt Random-Demo-Zahlen), `ResultCard`-Upsell auf 199 € Basis ankern + „+N weitere Befunde gesperrt", `next.config` `optimizePackageImports` (gegen Next-16-Docs prüfen, s. `landingpage-next/AGENTS.md`).

---

## 🆕 Update 21.06.2026 (spät) — Agency-Agents + Audits + Caching

- ✅ **Agency-Agents installiert** (`msitarzewski/agency-agents`, MIT, 114k★): **217 Spezial-Agenten** in `.claude/agents/agency/` (lokal/gitignored). Ab nächstem Session-Start nativ als `subagent_type` nutzbar. Regel: `CLAUDE.md` → „🤖 Agency-Agents". **Standard-Werkzeug für jede Spezial-Aufgabe.**
- ✅ **6 parallele Audit-Teams** (Security/Code/A11y/Legal/Conversion/SRE) → `docs/agency-audits/2026-06-21-MASTER-SUMMARY.md` (Launch-Ampel + Owner-Split, gegen `origin/main` re-validiert).
- ✅ **PR #46 gemerged + live** (Health: `ok:true, stripe:true, live:true, mailer aktiv`). Enthält: MotionConfig-A11y-Fix + 2 Legal-Copy-Entschärfungen (UWG §5).
- ✅ **Cache-Prompting-Regel** verankert: `CLAUDE.md` → „⚡ Cache-Prompting" + `docs/CACHE-PROMPTING-AGENTS.md`.
- ✅ **§ 356a Widerruf-Button:** Audit ergab **ERFÜLLT** — alter „OVERDUE"-Flag war stale.

### 🔴 Offen vor Ad-Skalierung (priorisiert, brauchen User-OK / Server / Tests)
1. **SSRF-Redirect-Pin** (Security C1) — Scanner folgt 30x zu internen/Metadata-IPs. `scanner/lib/url-guard.js` + `scan*.js`.
2. **Backup scharf schalten + 1 Restore-Test** (SRE S-01) — Server.
3. **Code-Fixes C2/C3** — GoBD-Rechnungsnummern-Verbrennung + toter `resend.js`-Befehl (`scanner/app.js`).
4. **ResultCard-Conversion-Brücke** + Noten-Schwellen Seite„C"/PDF„B" angleichen.
> Details + Severity je Befund: `docs/agency-audits/`.

### 🧠 Parallel-Session-Work (Jarvis-Cockpit) + Session-Config
- ✅ **Im Repo (committet):** `docs/ai-os-research/` (Masterplan + Architektur + Security-Review + Setup-Guides für das lokale Cockpit), `vault-template/` (Second-Brain-Template, keine Secrets), `scripts/legal_copy_grep.py` + `scripts/memory_extractor.py` (Tools).
- ⚠️ **LOKAL-ONLY, bewusst NICHT im Repo:** `cockpit/` + `cockpit-ui/` (Jarvis-Cockpit Next.js/Node-Apps, „standalone, nie auf Prod"), `scripts/voice/` (~600 MB Piper/Whisper-Modelle, gitignored), `vault/` (echtes Second-Brain, gitignored). **Grund:** `cockpit-ui/.env.local` (Secret) + Build-Artefakte + Binär-Modelle gehören nicht ins Git. `.gitignore` wurde entsprechend gehärtet (`*.env.local`, `.next/`, `scripts/voice/`). → Cockpit-Apps können auf Wunsch sauber versioniert werden (jetzt secret-/bloat-sicher).
- ✅ **SessionStart-Hook** aktiv: `.claude/settings.json` (lokal) injiziert bei jedem Session-Start einen Verweis auf dieses Handover. Du musst nichts mehr tippen.
- 📊 **Notion-Dashboard:** [BFSG-Check — Launch & Ops Board](https://app.notion.com/p/3802191b1070812ba39ce089c9e3b510?pvs=1) + [Sales Pipeline](https://app.notion.com/p/f10735999280434bbcd2c0c596d138f6?pvs=1). ⚠️ Der `Notion Dashboard Sync` (GitHub Action) lief zuletzt auf **failure** — vermutlich fehlende Secrets (`NOTION_TOKEN`/`NOTION_DB_*`), siehe `docs/DASHBOARD-NOTION-SETUP.md`.

### 🛰️ Cockpit-Funktionsstand (verifiziert 21.06.2026 — alles LOKAL, nicht auf Prod)
- **Start:** Backend `cd cockpit && npm start` (127.0.0.1:4317) · Frontend `cd cockpit-ui && npm run dev` (3017) · Voice: Skripte unter `scripts/voice/` (faster-whisper STT :5301 + Piper TTS :5302). Komplettanleitung: **`docs/ai-os-research/START-HIER.md`**.
- ✅ **Verifiziert lauffähig:** Dashboard (14 Panels, Live-`/health`), Second-Brain-Suche (Vault `bfsg-check/vault/`, gitignored, 16 Notizen, `/api/brain` configured:true), 18 Agenten-Aktionen + 5-Ebenen-Governance, **Voice TTS→STT-Round-Trip** (Piper „Thorsten" + faster-whisper-small, deutsch). Frontend-Build grün, Backend `node --check` grün, Security R-01..R-05 umgesetzt.
- ⚠️ **Agenten-Auth-Caveat:** Der verschachtelte `claude -p` (den die Aktions-Buttons auslösen) gibt **in der Claude-Code-Agent-Sandbox 401** (host-verwaltete Auth). Auf dem **normalen** Rechner, wo `claude` im Terminal eingeloggt funktioniert, laufen die Aktionen. Schnelltest: `claude -p "ok"` im normalen Terminal → wenn „ok", funktionieren die Buttons. (`claude.js` wertet `is_error` jetzt aus → Fehler erscheinen ehrlich als `failed`.)
- ✅ **Norton-False-Positive gelöst:** `MD:HttpRequest-inf [Susp]` bei URL-dichten Markdown → Projektordner `C:\Users\Administrator\bfsg-check\*` in Norton ausgeschlossen (Echtzeit/Auto-Protect), Quarantäne geleert. Vault liegt **innerhalb** des Repos (gitignored) → kein zweiter Ausschluss nötig. Runbook: `docs/ai-os-research/12-norton-fp-runbook.md`.
- 🔑 **Für echte Zahlen (nur User kann das):** `cockpit/.env` füllen — Stripe Restricted Read-Key, `ADMIN_TOKEN`, `GITHUB_TOKEN` (Google-Ads + Developer-Token später, 2–5 Tage). Eintragen übernimmt Claude nach Erhalt. Details: `docs/ai-os-research/10-daten-setup.md`.

---

## ⚡ TL;DR für Schnell-Start (60 Sekunden)

| | |
|---|---|
| **Live-Status** | ✅ `bfsg-fix.de/health` = `ok:true, stripe:true, live:true, mailer aktiv` |
| **Computer Use** | ✅ aktiviert (User Matthias hat Settings > General > „Computer use" angeschaltet) |
| **Offene PRs** | ✅ **0 offen** — #54–#61 alle gemerged + live (Conversion, Launch-Audit, Owner-Entscheidungen, Hero/Visual-Politur). Offene Go-Live-Aufgaben siehe „🚀 GO-LIVE-CHECKLISTE" oben |
| **Letzter Merge** | PR #49 — AI-OS-Research-Docs + Vault-Template + Tools (Cockpit/Voice bewusst lokal); `main` aktuell, Health grün |
| **Nächste konkrete Aufgabe** | `docs/LAUNCH-HEUTE-CHECKLISTE.md` abarbeiten → nur Matthias-Schritte (Stripe-Testkauf, Ads-Konten, Listings) → erste Sales |
| **Funnel** | ✅ E2E live verifiziert (Scan→Teaser→Checkout-Modal→Stripe-Live, alle Legal-Seiten 200, §356a-Consent sauber) |
| **Scanner-Limit** | ⚠️ Bot-geschützte Seiten (z. B. Zalando) scheitern — bei normalen SMB-Shops ok |

---

## 🎯 Was Matthias jetzt sofort braucht

**Erst-Aufgabe** (Priorität HOCH): Die 3 offenen PRs (#40/#41/#42) reviewen + mergen, dann **`docs/LAUNCH-HEUTE-CHECKLISTE.md`** öffnen — das ist das zentrale Handlungsdokument mit nur den Schritten, die NUR Matthias kann (Konten + Karte + Submits), jeweils mit fertigem Copy-Paste-Text inline:

1. **Stripe-Live-Testkauf** (10 Min) — eigene Karte, dann Refund. PFLICHT bevor Ads-Budget fließt.
2. **Google Ads Konto + Karte** (8 Min) — nur Konto anlegen, Kampagne kommt mit fertigem Setup aus der Checkliste.
3. **Bing Ads Konto + Karte** (5 Min) — für späteren Google-Import.
4. **3 Top-Listings** (12 Min) — SaaSHub/G2/OMR, Texte stehen fertig in der Checkliste.

**Realitäts-Check (ehrlich):** Verkäufe kommen frühestens in 3–7 Tagen (Google-Ads-Freigabe 24–72h + Lernphase). „Sales heute" aus Null-Traffic-Standstart ist unrealistisch — aber der Funnel ist verifiziert und alle Assets sind zünd-fertig. Schnellster realistischer Spike: Show HN (braucht ehrlichen Post = vorhanden, + Matthias' HN-Account).

---

## 📚 Die 5 Files, die du ZUERST liest

| # | File | Warum |
|---|---|---|
| 1 | `CLAUDE.md` (Root) | Arbeits-Regeln, Pakete, Compliance-Regeln |
| 2 | `docs/HANDOVER-NEXT-SESSION.md` | Diese Datei — aktueller Stand |
| 3 | `docs/SALES-DAY-1-V2.md` | Konkrete nächste Aufgaben (8 Tasks) |
| 4 | `docs/MARKETING-MASTER-2026.md` | Strategy-Hintergrund |
| 5 | `docs/LEGAL-REALITY-CHECK-2026.md` | Was darf gemacht werden, was nicht |

**Optional je nach Aufgabe:**
- `marketing/google-ads-rsa-headlines.md` — Ad-Headlines + Keywords + Setup
- `marketing/listings-submission-templates.md` — Submission-Texte für 11 Listings
- `docs/legal-templates/` — AGB-Cap, Disclaimer, Pre-Sale-Frage
- `docs/COMPUTER-USE-AKTIVIEREN.md` — Setup-Doku falls Matthias Probleme hat

---

## 📊 Was wurde in den letzten 7 Tagen geschafft

**14 PRs gemerged auf main:**

| PR | Was |
|---|---|
| #38 | Computer-Use-Aktivierungs-PDF (kindgerecht, 5 Schritte) |
| #37 | 0-Touch-Marketing + Legal-Reality-Check + Sales-Day-1-V2 |
| #36 | Code-Only Plan (Playwright MCP statt WSL2-Setup) |
| #35 | Cowork-Hybrid-Plan (verworfen zugunsten Code-Only) |
| #34 | Claude-Agent-Setup für Windows-PC (WSL2-Variante, jetzt obsolet) |
| #33 | Launch-Plan PDF (22 Seiten) |
| #32 | Stammdaten Matthias Seba + Rechtssicherheits-Audit |
| #31 | Mobile-Cards-Zentrierung |
| #30 | Mobile-Hero + Checkout-Modal Plan-Selector |
| #29 | Touch-Targets WCAG 2.5.5 |
| #28 | Conversion-Design-Iteration 2 (Premium Navy) |
| #27 | Pricing-Entscheidung (Re-Check 49→39€) |
| #26 | Code-Review-Criticals (F1/F3/F5/F7) |
| #25 | Frontend-QA-Fixes |

**Letzte 30 Commits siehe:** `git log origin/main --oneline -30`

---

## 🏗️ Aktuelle Repo-Struktur

```
bfsg-check/
├── CLAUDE.md                          ← Arbeits-Regeln (lies zuerst!)
├── README.md
├── scanner/                            ← Node.js Backend (live)
│   ├── app.js                          ← Express + Stripe-Webhook
│   ├── lib/
│   │   ├── mailer.js                  ← SMTP + rk_live_-Detection (Zeile 43)
│   │   ├── orders.js                  ← Stripe-Order-Handling
│   │   ├── invoice.js                 ← PDF-Rechnungen (Playwright)
│   │   ├── fulfill.js                 ← Auto-Erfüllung
│   │   └── scan*.js                    ← axe-core Scanner-Engine
│   └── package.json                    ← playwright 1.55.1, stripe 17.5.0
├── landingpage-next/                   ← Next.js 16 + Tailwind v4 (live)
│   ├── app/                            ← Pages (impressum, datenschutz, agb, widerruf)
│   ├── components/                     ← Hero, ScanForm, PricingCards, CheckoutModal, etc.
│   ├── CLAUDE.md                       ← „This is NOT the Next.js you know" — lies node_modules docs
│   └── AGENTS.md
├── admin-next/                         ← Next.js Admin-Dashboard
├── landingpage/                        ← Legacy HTML (Volume-Mount-Fallback)
├── deployment/                         ← docker-compose.yml + Caddyfile
├── docs/
│   ├── HANDOVER-NEXT-SESSION.md       ← Diese Datei
│   ├── SALES-DAY-1-V2.md              ← Konkrete nächste Schritte
│   ├── MARKETING-MASTER-2026.md       ← Strategy
│   ├── LEGAL-REALITY-CHECK-2026.md    ← Risiko-Check
│   ├── LAUNCH-PLAN.md + .pdf          ← Original 22-Seiten-Plan
│   ├── RECHTSSICHERHEITS-AUDIT.md     ← Detailliertes Legal-Audit
│   ├── COMPUTER-USE-AKTIVIEREN.md + .pdf
│   ├── legal-templates/                ← Disclaimer, AGB-Cap, Pre-Sale, DPA-Checkliste
│   ├── skills/                         ← 8 Skill-Files für ~/.claude/skills/
│   └── claude-agent-setup/             ← (alt, WSL2-Variante, kann ignoriert werden)
├── marketing/
│   ├── STRATEGY-2026.md
│   ├── OFFER.md                        ← Aktuelle Pakete + Preise
│   ├── google-ads-rsa-headlines.md     ← Setup-Vorlagen
│   ├── google-ads-keywords.csv         ← 50+ Keywords
│   ├── google-ads-negatives.csv
│   ├── listings-submission-templates.md ← 11 Listings
│   ├── press-release-launch.md         ← Launch-PM + 1-Jahr-BFSG-PM (28.06.)
│   ├── show-hn-launch-post.md          ← Daten-Story-Draft
│   ├── awesome-lists-pr-template.md
│   ├── recherchescout-profil.md
│   ├── seo-content-plan.md
│   └── partner-targets.md              ← (LinkedIn-DM-orientiert, NICHT mehr nutzen!)
├── scripts/
│   ├── daily-health-check.sh           ← getestet, lokal lauffähig
│   └── generate-*-pdf.mjs              ← Playwright-PDF-Renderer (3 Versionen)
└── .claude/
    └── settings.local.json             ← Nur Notion-DB-Permission (minimal)
```

---

## ⚙️ Tech-Stack & Tools

### Live-System
- **Server:** Hetzner CPX22, Nürnberg, Ubuntu 24.04, IP `178.105.83.0`
- **HTTPS:** Caddy + Let's Encrypt (Auto-Renewal)
- **App:** Node.js 22, Express 4.22, Playwright 1.55.1, Stripe 17.5.0
- **Mail:** Brevo SMTP (`live:true` bedeutet rk_live_-Key + Mailer aktiv)
- **Database:** SQLite (in `scanner/out/*.jsonl` als Append-Log)

### Marketing-Tools (vorgesehen, noch nicht alle aktiviert)
| Tool | Status | Notes |
|---|---|---|
| Google Ads | ⏳ Konto anlegen | 13 €/Tag Budget |
| Bing Ads | ⏳ Konto anlegen | 4 €/Tag, Import von Google |
| Brevo SMTP | ✅ live | für Transaktional + Newsletter |
| Stripe Live | ✅ live | rk_live_-Key, Webhook signed |
| Notion | ⏳ Setup | für Sales-Pipeline (optional) |
| Recherchescout | ⏳ Profil | DACH-Journalisten-Anfragen |
| HARO/Featured | ⏳ Profil | Global Anfragen |

### MCP-Server (in dieser Claude-Code-Session)
- Notion (in `.claude/settings.local.json` aktiv)
- GitHub (für PR-Operations)
- weitere kommen je nach Session-Konfiguration

---

## 🧰 Projekt-Skills (projektspezifisch — vor passenden Tasks nutzen)

| Skill | Wofür |
|---|---|
| `legal-copy-grep` | Deterministischer Regex-Scan auf verbotene Begriffe (BFSG-konform/rechtssicher/garantiert/TÜV/DEKRA …) → **vor jedem PR-Merge** laufen lassen |
| `scan-dataset-aggregat` | Anonymisierte Auswertung echter Scans aus `scanner/out/` → liefert das Show-HN/PR-Dataset (KEINE Kunden-URLs) |
| `stripe-revenue-snapshot` | Umsatz / MRR / Refund-Quote / Paket-Split schnell |
| `ads-performance-pull` | Täglicher Google-Ads-Report (CPA / CTR / Spend / Top-Keywords) |
| `ab-test-tracker` | A/B-Tests anlegen + Signifikanz (p<0,05) auswerten (Bezug: `marketing/pricing-experiments.md`) |
| `backup-verify` | Server-Backup-Status via SSH prüfen (Restore nur mit User-OK) |
| `upsell-trigger` | 14-Tage-Nach-Kauf-Upsell-Drafts erstellen (nie automatisch senden) |

> Operative Memories zusätzlich in `MEMORY.md` (Build-vor-Merge, gh-REST u. a.).

---

## 🚫 Bekannte Sackgassen / NICHT machen

| Was | Warum |
|---|---|
| ❌ LinkedIn-Outreach planen | Matthias hat KEIN LinkedIn-Konto |
| ❌ Persönliche Bekannten-Outreach | Matthias hat KEIN Business-Netzwerk |
| ❌ Cold-Mails | UWG §7 (Tool in `scanner/outreach.js` schon gesperrt) |
| ❌ `marketing/partner-warm-dms.md` benutzen | Vorlage aus alter LinkedIn-Strategie, obsolet |
| ❌ Cowork starten | Matthias nutzt **Claude Code im „Code"-Modus**, NICHT Cowork |
| ❌ WSL2-Setup pushen | Obsolet seit Computer Use direkt in Desktop App |
| ❌ pMax / Display-Ads / Reddit Ads | Recherche: Geld-Verbrennung bei 20 €/Tag |
| ❌ Anwalts-Endabnahme als Pflicht-Blocker | Reality-Check: 4h Selber-Lösen reicht |
| ❌ VSH-Versicherung vorbeugend | Trigger erst ab MRR > 2.000 € |

---

## 🔥 Hot-Files (häufig bearbeitet)

| File | Wann anfassen |
|---|---|
| `scanner/lib/mailer.js` | Live-Flag-Bugs, SMTP-Probleme |
| `scanner/app.js` | Neue Endpoints, Webhook-Änderungen |
| `landingpage-next/components/*.tsx` | UI-Änderungen, Conversion-Optimierung |
| `landingpage-next/app/*/page.tsx` | Legal-Texte, Pages |
| `marketing/*.md` | Strategy-Iteration |
| `docs/SALES-DAY-1-V2.md` | nach jedem Sprint updaten |
| `deployment/docker-compose.yml` | nur bei Service-Changes |

---

## 🎬 Empfohlene erste 3 Aktionen für nächste Session

### Aktion 1: Smoke-Check (60 Sek)
```bash
curl -fSs https://bfsg-fix.de/health
# Erwartung: {"ok":true,"stripe":true,"live":true,"mailer":"aktiv ..."}
```
Wenn `live:false` → SOFORT debuggen (Stripe-Key abgelaufen?).

### Aktion 2: Matthias begrüßen + Status fragen
```
„Hi Matthias, willkommen zurück. Server ist live (status: ok). 
Computer Use ist aktiviert.

Wo möchtest du weitermachen?
1. Sales-Day-1-V2 abarbeiten (Google Ads, Listings, etc.) ← empfohlen
2. Stripe-Live-Test mit eigener Karte
3. Etwas anderes?"
```

### Aktion 3: Erste Marketing-Task im „Code"-Modus mit Browser
Bei Wahl 1 → Computer-Use-Browser nutzen für:
- Google Ads Konto-Onboarding (Matthias muss eingeloggt sein)
- SaaSHub-Submission (mit Text aus `marketing/listings-submission-templates.md`)
- Setup wie in `docs/SALES-DAY-1-V2.md` Schritt 5

---

## 💡 Pro-Tipps für die nächste Session

1. **Multi-Agent-Sprints sind dein Hebel** — bei großen Tasks (Code-Review, Marketing-Research) 3-4 Agents parallel starten
2. **Skills nutzen** — falls Matthias `~/.claude/skills/*.md` aus `docs/skills/` kopiert hat: Trigger-Sätze funktionieren („Tagescheck", „Erstatte Order #...")
3. **Browser-Aktionen über Computer Use** — Permission-Prompts respektieren, nicht überrumpeln
4. **PR-Workflow** — Branch erstellen, klar commit, draft PR, dann ready → squash-merge
5. **Bei Code-Änderungen scanner/ oder *-next/** — Tests lokal laufen lassen (auch wenn CI sie nicht triggert)
6. **Bei Marketing-Files** — keine LinkedIn-Vorlagen mehr, nur 0-Touch-Kanäle (siehe `MARKETING-MASTER-2026.md`)

---

## 🆘 Eskalations-Pfade

| Problem | Wer |
|---|---|
| `/health` nicht ok | SSH zum Server (User mit Mac/PC), Logs prüfen |
| Stripe-Webhook fehlerhaft | `scanner/lib/orders.js` + Stripe-Dashboard |
| Brevo-Mail-Bounces | `marketing/STRATEGY-2026.md` Email-Deliverability |
| Abmahnung erhalten | `docs/LEGAL-REALITY-CHECK-2026.md` Anwalts-Trigger-Liste → Härting/Plutte/Schwenke |
| Server down | Hetzner-Cloud-Console (User-Account), API-Token rotieren falls leaked |
| GitHub Actions Deploy fehlerhaft | `.github/workflows/deploy.yml` + `HETZNER_SSH_KEY` Secret prüfen |

---

## 📈 Geschäfts-Ziele (für Kontext bei Entscheidungen)

- **Kurzfristig (14 Tage):** 2-6 erste Sales (400-1.500 €)
- **Mittelfristig (Monat 3):** 8-15 Sales/Monat, 350-700 € MRR
- **Langfristig (Q1 2027):** Skalierungs-Entscheidung — Hard-Stop oder 10k €/Mo Marketing-Budget
- **KPI-Trigger für Anwalt/VSH:** MRR > 2.000 € ODER erster 2k€-Großkunde ODER erste Abmahnung
- **AOV-Ziel:** 350 € (Mix Basis/Profi/Cookie)
- **CAC-Ceiling:** 177 € (LTV 533 € bei 3:1-Regel)

---

## ✅ Was die letzte Session NICHT geschafft hat (Übergaben)

Nichts blockierendes. Aber für Vollständigkeit:

- ✅ **§ 356a / Widerruf erledigt** — `WiderrufForm.tsx` + `/widerruf` + `/widerrufsbelehrung` live; Checkout-Consent (ausdrücklicher Sofort-Ausführungs-Verzicht) sauber implementiert (`CheckoutModal.tsx` + `scanner/app.js:324`).
- ⏳ Nur Matthias: **Stripe-Live-Testkauf**, **Google/Bing Ads Konten + Karte**, **Listings/PMs absenden** → alles Schritt-für-Schritt mit Copy-Paste-Text in `docs/LAUNCH-HEUTE-CHECKLISTE.md`
- ✅ **5 PRs (#40–#44) gemerged + live deployed + verifiziert** (Co-Founder-Sprint): Conversion-/Legal-Fixes, Launch-Assets + Checkliste, 6 SEO-Seiten, Preis-Toggle-Fix, Funnel-Audit. Live geprüft: Fake-Presse weg, neue Stat da, alle SEO-Routen 200.
- ⏳ AGB-Generator-Abo (IT-Recht-Kanzlei 15 €/Mo) + DPAs sammeln (Brevo/Stripe/Hetzner) — `docs/legal-templates/dpa-checkliste.md`
- 💡 **Wachstums-Unlock — Scan-Dataset für Show HN VERSION 2 + 28.06.-PM:** Sauberster Weg ist der Skill **`scan-dataset-aggregat`** — er wertet die bereits vorhandenen Scans aus `scanner/out/` anonymisiert aus (häufigste WCAG-Fehler, Score-Verteilung, Branchen; **strikt KEINE Kunden-URLs**), statt externe Sites zu scannen. Zahlen erzeugen ist autonom machbar; die Publikation (Show HN / Pressemitteilung) braucht Matthias' Freigabe. `marketing/show-hn-launch-post.md` VERSION 2 wartet auf diese Belege.
- 💡 Landing-Detail (niedrige Prio): Hero-Headline fadet per Animation ein → ~1 s unsichtbar beim Laden (LCP/Conversion-Detail, bewusstes Design — nur falls Core-Web-Vitals leiden).

---

## 🤖 Wenn du diese Datei liest

**Du bist Claude in einer neuen Session.** Matthias erwartet:
1. Du hast `CLAUDE.md` + diese Datei gelesen
2. Du kennst den Live-Status (`bfsg-fix.de` ist live)
3. Du fragst kurz wo er weitermachen will
4. Du bist im Express-Modus: kein Tutorial, sondern Aktion

**Beispiel-Begrüßung:**
> „Hi Matthias. Letzter Stand: Server live, Computer Use aktiviert, alle PRs auf main, Sales-Day-1-V2 als nächste Aufgabe vorbereitet. Wo möchtest du weitermachen — Stripe-Live-Test, Google Ads Setup, oder etwas anderes?"

**Diese Datei wird bei jeder Session-Übergabe aktualisiert.** Stand dieser Version: 20.06.2026.
