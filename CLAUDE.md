# CLAUDE.md — Arbeits-Regeln für dieses Projekt

> Diese Datei wird von Claude Code automatisch beim Session-Start gelesen.
> **Lies sie ZUERST. Dann lies `docs/HANDOVER-NEXT-SESSION.md` für den aktuellen Status.**

---

## 🚀 Express-Modus (FESTE REGEL)

**Immer den schnellsten Weg gehen. Maximal viel selbst erledigen.**

Konkret:
- **Keine Klick-Anleitungen** für den User, wenn ich es per API/CLI selbst machen kann
- **Aktiv nach Zugängen fragen** (API-Tokens, Credentials), statt User durch UIs zu schicken
- **Sofort handeln** nach Erhalt der Credentials — nicht erst lange erklären
- **Knappe Status-Updates** statt langer Tutorials
- **Parallele Tool-Calls** wo immer möglich (Bash + Read + Write gleichzeitig)
- **Self-cleanup**: Credentials nach Nutzung `shred`-en, aus Repo raushalten, User zur Rotation auffordern
- **Bei Hindernissen**: Eigenständig Plan B/C wählen, nicht mit klärenden Fragen blockieren (außer Entscheidungen sind echt nur vom User zu treffen)

---

## 🏗️ Projekt-Kontext

- **Produkt:** BFSG-Check — automatisierter Compliance-Scanner für deutsche Websites (BFSG/WCAG/TDDDG)
- **Domain:** bfsg-fix.de (Server bei Hetzner Cloud CPX22, Nürnberg, Ubuntu 24.04)
- **Owner:** Matthias Seba, Lange Straße 20, 27449 Kutenholz, info@matthias-seba.de
- **Steuer:** § 19 UStG Kleinunternehmer
- **Status:** Live (`/health` = `ok:true, stripe:true, live:true, mailer aktiv`)

### Repo-Layout
```
scanner/          Node.js Backend (Express + Playwright + axe-core + Stripe)
landingpage-next/ Next.js Landing (Tailwind v4 + shadcn, base-nova style)
admin-next/       Admin-Dashboard (Next.js)
landingpage/      Legacy HTML-Fallback (Volume-Mount)
deployment/       Docker Compose + Caddy + cloud-init
docs/             Pläne, Audits, Runbooks, Skills, Legal-Templates
marketing/        Strategy, Ad-Headlines, Listings-Templates, PRs
scripts/          PDF-Generator + Helper-Scripts
.claude/          Claude Code Settings (settings.local.json)
```

### Pakete (alle live, Stripe Live-Mode)
- **Basis** 129 € (einmalig, Auto-Scan + PDF-Report)
- **Profi** 399 € (einmalig, Multi-Page + Umsetzungsplan + 30 Tage Support)
- **Cookie-Basis** 39 € · **Cookie-Profi** 69 €
- **Re-Check-Abo** 24,99 €/Monat (`ENABLE_ABO=true`, Re-Check-Abo live)

---

## 🛠️ Deploy & Operations

- **Deploy:** GitHub Actions auf `main`-Push → SSH zu Hetzner → `git pull && docker compose up -d --build`
- **Health-Endpoint:** `https://bfsg-fix.de/health`
- **Stripe-Webhook:** `https://bfsg-fix.de/webhook` (Signatur-validated)
- **SSL:** Let's Encrypt via Caddy (auto-renewal)
- **Backups:** noch nicht voll automatisiert (siehe `docs/BACKUP.md`)

### Wichtigste Workflows
- `.github/workflows/deploy.yml` — Auto-Deploy auf main-Push
- `.github/workflows/diagnose.yml` — Manueller SSH-Diagnose-Trigger
- `.github/workflows/uptime-watch.yml` — 5-min /health-Check + Brevo-Alert

---

## 🔐 Sensible Daten — Hygiene

- **Niemals** Live-Keys ins Repo (`.env` ist gitignored, `.env.example` als Template)
- **Niemals** Live-Keys in Chat — falls passiert: User aktiv zur Rotation auffordern
- **Secrets-Quellen:**
  - GitHub Secrets (für CI): `HETZNER_SSH_KEY`, `STRIPE_*`, `SMTP_*`, `ADMIN_TOKEN`, etc.
  - Server `.env` auf bfsg-fix.de unter `/opt/bfsg-check/deployment/.env`
- **Stripe-Key-Prefix:** `rk_live_*` (Restricted, nicht `sk_live_*`) — Live-Flag-Check in `scanner/lib/mailer.js:43`

---

## ⚖️ Recht & Compliance

### Was wir DÜRFEN (Stand 20.06.2026, siehe `docs/LEGAL-REALITY-CHECK-2026.md`)
- ✅ B2B-positionierter SaaS-Verkauf ohne Anwalts-Endabnahme (Solo, <30k€/Jahr, mit Disclaimer + AGB-Cap)
- ✅ Google Ads + Bing Ads + Listings + freie PMs (openPR/inar/firmenpresse)
- ✅ HARO/Recherchescout/Featured-Answers
- ✅ Show HN + Awesome-List-PRs (mit klarer Disclosure „I'm the founder")
- ✅ § 6 UWG vergleichende Werbung (objektiv messbare WCAG-Scores, nicht herabsetzend)

### Was wir NICHT dürfen
- ❌ Cold-Mails an Einzelpersonen (UWG §7 II Nr.2 — 270-800€ Abmahnung pro Mail)
- ❌ LinkedIn-DMs / Xing-DMs an Fremde (OLG Hamm 18 U 154/22 — selbst 1:1 personalisiert)
- ❌ „BFSG-konform"-Garantien in Marketing (UWG §5 Irreführung)
- ❌ TÜV/DEKRA-Siegel ohne echte Zertifizierung
- ❌ Schleichwerbung in Foren (UWG §5a IV + §22 MStV — bis 500.000€ Strafrahmen)
- ❌ Cookie-Banner ohne 2-Button-Gleichgewicht („Ablehnen" muss gleich sichtbar)

### Pflicht-Sprache
- ✅ „automatisierte technische Analyse" / „WCAG-2.1-AA-Audit"
- ❌ „BFSG-konform" / „rechtssicher" / „garantiert"
- Disclaimer-Wortlaut: siehe `docs/legal-templates/disclaimer-footer.md`

---

## 🎯 Aktuelle Strategie (Stand 20.06.2026)

### Marketing (0-Touch, kein LinkedIn, kein persönliches Netzwerk)
- **Säule 1:** Google Ads (13 €/Tag) + Bing Ads (4 €/Tag) → siehe `marketing/google-ads-rsa-headlines.md`
- **Säule 2:** SEO + Programmatic (8-10 Pillar-Pages) → siehe `marketing/seo-content-plan.md`
- **Säule 3:** Distribution-as-Product (Chrome Extension Tag 7-14, WordPress-Plugin Tag 30, BFSG-Score-Badge)
- **Säule 4:** Listings (SaaSHub dofollow! + G2 + Capterra + OMR) + PRs (kostenlos + 28.06.2026 1-Jahr-BFSG-Hook)

### Budget
- 20 €/Tag Ads (600 €/Monat)
- 25 €/Mo Tools (AGB-Generator IT-Recht-Kanzlei 15€ + lexoffice/sevdesk 10€)
- Trigger-Kalender für VSH/Anwalt: siehe `docs/LEGAL-REALITY-CHECK-2026.md`

### Realistisches Ziel
- 14 Tage: 2-6 Sales (400-1.500 €)
- Monat 3: 8-15 Sales (350-700 € MRR)

---

## 🧠 Wenn du eine neue Aufgabe bekommst

1. **Lies `docs/HANDOVER-NEXT-SESSION.md` ZUERST** für aktuellen Stand
2. Prüfe `git log origin/main --oneline -10` für letzte Änderungen
3. Bei Marketing-Tasks: `marketing/` + `docs/SALES-DAY-1-V2.md`
4. Bei Code-Änderungen: TypeScript-Strikt-Mode, ESLint-No-ASCII-Umlaute-Rule (echte ä/ö/ü/ß!)
5. Bei Deploy: nur via PR-Merge auf main (Auto-Deploy via GitHub Actions)
6. Multi-Agent-Sprints: nutze die **Agency-Agents** (siehe unten) + Explore + Plan parallel
7. **Computer Use ist aktiviert** (seit 20.06.2026) — Claude Code kann Browser nativ steuern

---

## 🤖 Agency-Agents (FESTE REGEL — dauerhaft installiert seit 21.06.2026)

**Wir nutzen das Agency-Agents-Set (`msitarzewski/agency-agents`, MIT, 114k★) als Standard-Werkzeug für jede Spezial-Aufgabe.**

- **Installiert unter:** `.claude/agents/agency/` — **217 spezialisierte Agenten** in 16 Divisionen (engineering, security, design, marketing, sales, product, testing, support, paid-media, project-management, finance, academic, gis, game-development, spatial-computing, specialized). Hinweis: `.claude/` ist gitignored → die Agenten leben lokal auf Disk (nicht im Repo), Regel + Audits sind aber versioniert.
- **Quelle/Update:** kanonisches Original `msitarzewski/agency-agents` (native Claude-Code-`.md`+YAML-Agenten, kein fremder Hook-Code). Update via `git -C /tmp/agency-agents pull` + Re-Copy der 16 Divisionen.
- **Registrierung:** Agenten stehen ab dem **nächsten Session-Start** als native `subagent_type` zur Verfügung. In der Install-Session: Persona-Datei lesen und in einen `general-purpose`/`Explore`/`Plan`-Agenten injizieren.

**Wann welche Division (Auswahl für unser Business):**
| Aufgabe | Agenten (Beispiele) |
|---|---|
| Code-Review / Architektur | `engineering-code-reviewer`, `engineering-software-architect`, `engineering-senior-developer`, `engineering-minimal-change-engineer` |
| Sicherheit / Pentest | `security-appsec-engineer`, `security-penetration-tester`, `security-architect`, `security-compliance-auditor` |
| Landingpage / UX / Conversion | `design-ux-architect`, `design-ux-researcher`, `marketing-growth-hacker` |
| Accessibility (eigenes Dogfood) | `testing-accessibility-auditor`, `testing-reality-checker` |
| Marketing / SEO / Ads | Division `marketing` + `paid-media` |
| Reliability / Deploy | `engineering-sre`, `engineering-devops-automator` |

**Regel:** Bei jeder substanziellen Spezial-Aufgabe zuerst prüfen, ob ein Agency-Agent fachlich passt, und ihn nutzen — statt generisch zu arbeiten. Mehrere Agenten parallel starten, wenn die Teilaufgaben unabhängig sind.

**Erster Einsatz (21.06.2026):** 6 parallele Teams haben einen Pre-Launch-Audit gefahren → `docs/agency-audits/2026-06-21-MASTER-SUMMARY.md` (Security/Code/A11y/Legal/Conversion/SRE).

**Hinweis Kontext:** 217 Agenten erhöhen den Agent-Typen-Listing-Overhead pro Session. Falls zu schwer → unrelevante Divisionen (academic, gis, game-development, spatial-computing) aus `.claude/agents/agency/` entfernen.

---

## ⚡ Cache-Prompting (FESTE REGEL — gilt für die festen Agenten)

> **Warum:** Die 217 Agency-Agenten + diese CLAUDE.md sind ein großer, stabiler Prompt-Prefix. Claude Code cached den automatisch (System- + Projekt-Kontext-Layer). Cache-Read kostet ~0,1×, ein Cache-Miss zahlt den vollen Prefix neu. Cache-bewusst arbeiten = schneller + günstiger. Details: `docs/CACHE-PROMPTING-AGENTS.md`.

**Wie Caching hier wirkt (Stand 21.06.2026, doc-belegt):**
- **Automatisch + an by default.** Der feste Agenten-Prefix + CLAUDE.md laden 1× beim Session-Start und liegen im Cache. Nichts manuell zu setzen.
- **Subagents:** jeder Agency-Agent baut seinen **eigenen** Cache (kalt → warm über seine Turns), **immer 5-Min-TTL** (auch bei Abo). Die 1h-TTL gilt nur fürs Haupt-Gespräch.

**Regeln, um den warmen Prefix NICHT zu zerstören:**
1. **Kein Modellwechsel mitten in der Session** (Opus↔Sonnet, `/fast`-Toggle, Effort-Änderung) — jedes davon = voller Re-Read des gesamten Prefix.
2. **CLAUDE.md / `.claude/agents/` nicht mitten im Task ändern.** Edits greifen ohnehin erst nächste Session und der Mid-Session-Edit ist zwar cache-sicher, aber Struktur-Churn vermeiden. Agenten-/Regel-Änderungen an Session-Grenzen.
3. **MCP-Server / Plugins nicht unnötig mitten in der Session an-/abschalten** (kann Prefix invalidieren, wenn Tools in den Prefix laden).
4. **Agency-Sprints batchen:** unabhängige Agenten in EINER Nachricht parallel starten; iterative Arbeit innerhalb des 5-Min-Fensters halten. Bei langen Pausen `/loop`-Kadenz < 5 Min oder die 1h-Haupt-Cache (s. u.).
5. **Warmen Agenten weiternutzen** via `SendMessage` (Kontext + Cache bleiben warm) statt neuem `Agent`-Call, wenn die Arbeit zusammenhängt.
6. **Subagent-Prompts self-contained** geben (Persona-Datei-Pfad + voller Task vorne), da jeder Subagent kalt startet und nur über eigene Turns warm wird — Nachfüttern in Tröpfchen ist teuer.

**Optionaler 1h-Haupt-Cache (manuell, vom User zu setzen — NICHT eigenmächtig):**
- `ENABLE_PROMPT_CACHING_1H=1` in `.claude/settings.json` (`env`-Block) hält den **Haupt-Gespräch**-Cache 1h warm (gut für lange Sprints mit Weg-Pausen). Trade-off: Cache-Writes 2× statt 1,25×; greift nur bei API-Key-Auth (bei Abo ist 1h ohnehin automatisch). Zurück: Zeile entfernen oder `FORCE_PROMPT_CACHING_5M=1`. Komplett aus: `DISABLE_PROMPT_CACHING=1`.

---

## 📞 Bei Fragen / Blockern

- **User-E-Mail:** matze.seba@outlook.de (für Account-Erstellungen, etc.)
- **Anwalts-Liste** (Trigger-basiert, NICHT vorbeugend): siehe `docs/LEGAL-REALITY-CHECK-2026.md` Sektion „Anwalts-Kontakte"
- **Server-SSH:** via SSH-Config-Alias `bfsg` (nur vom User-Mac, nicht aus Claude Code Web/Sandbox)
- **MCPs in der Session:** dynamisch — checke mit `claude mcp list`

---

## 🚫 Was du NICHT tust

- Keine Force-Pushes auf main
- Keine `git reset --hard` ohne explizite User-OK
- Keine Live-Aktionen (Stripe-Refunds, Hetzner-Server-Löschung, Google-Ads-Aktivierung) ohne User-Bestätigung
- Keine destruktiven `rm -rf` ohne Backup
- Keine eigenmächtigen Permission-Erweiterungen in `.claude/settings.local.json` (Auto-Mode-Classifier blockt das ohnehin)
- Keine Cold-Mails, keine LinkedIn-DMs, keine `outreach.js`-Sperre umgehen
