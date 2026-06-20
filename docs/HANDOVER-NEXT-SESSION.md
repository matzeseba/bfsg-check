# 🤝 Handover für die nächste Session

> **Lies das nach `CLAUDE.md` als ZWEITES.**
> **Stand:** 20.06.2026 · **Letzte Session:** Marketing-Strategie + Legal-Reality-Check + Computer-Use-Aktivierung

---

## ⚡ TL;DR für Schnell-Start (60 Sekunden)

| | |
|---|---|
| **Live-Status** | ✅ `bfsg-fix.de/health` = `ok:true, stripe:true, live:true, mailer aktiv` |
| **Computer Use** | ✅ aktiviert (User Matthias hat Settings > General > „Computer use" angeschaltet) |
| **Offene PRs** | 0 (alles auf main) — PR #5 (uralt) geschlossen |
| **Letzter Merge** | PR #38 — Computer-Use-Aktivierung |
| **Nächste konkrete Aufgabe** | `docs/SALES-DAY-1-V2.md` Schritt 1-8 ausführen → erste Sales |
| **Goal-Frist** | „morgen Verkäufe" (laut letztem User-Goal) |

---

## 🎯 Was Matthias jetzt sofort braucht

**Erst-Aufgabe in der nächsten Session** (Priorität HOCH):

Matthias hat Computer Use aktiviert. Er erwartet, dass Claude Code in der Desktop App jetzt **direkt Marketing-Tasks ausführt** (Browser steuern). Konkret:

1. **Stripe-Live-Test** (15 Min) — Matthias kauft selbst mit eigener Karte, du beobachtest Webhook + Mail-Versand
2. **Google Ads Konto-Setup** (15 Min) — Matthias loggt sich ein, du füllst Kampagnen-Settings aus
3. **Bing Ads Konto-Setup** (10 Min) — Matthias loggt sich ein, du importierst von Google
4. **3 Listings einreichen** (20 Min) — du füllst die Forms (SaaSHub, G2, OMR) aus den Templates in `marketing/listings-submission-templates.md`

**WICHTIG:** Bei jeder Browser-Aktion fragt Claude Code um Erlaubnis (Computer-Use-Permission-Prompt). Matthias muss „Allow" klicken. Keine Auto-Zustimmung erwarten.

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

- ⏳ User soll noch die **Stripe-Live-Test-Bestellung** mit eigener Karte machen (Schritt 1 in SALES-DAY-1-V2)
- ⏳ Google Ads + Bing Ads Konten anlegen (Schritte 2-3) — braucht Matthias mit seiner Karte
- ⏳ AGB-Generator-Abo abschließen (IT-Recht-Kanzlei 15 €/Mo) — `docs/LEGAL-REALITY-CHECK-2026.md`
- ⏳ DPAs sammeln (Brevo/Stripe/Hetzner/Sentry) → `docs/legal-templates/dpa-checkliste.md`
- ⏳ § 356a Widerrufs-Button vor 19.06.2026 implementieren — DEADLINE WAR GESTERN, Risiko mittel

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
