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
- **Basis** 199 € (einmalig, Auto-Scan + PDF-Report)
- **Profi** 499 € (einmalig, Multi-Page + Umsetzungsplan + 30 Tage Support)
- **Cookie-Basis** 49 € · **Cookie-Profi** 79 €
- **Re-Check-Abo** 39 €/Monat (`ENABLE_ABO=false` aktuell, Webhook nicht load-getestet)

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
6. Multi-Agent-Sprints: nutze Explore + Plan + general-purpose Agents parallel
7. **Computer Use ist aktiviert** (seit 20.06.2026) — Claude Code kann Browser nativ steuern

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
