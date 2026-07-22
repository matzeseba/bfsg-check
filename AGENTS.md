# AGENTS.md — Arbeits-Regeln & Projekt-Memory (tool-neutral)

> **Diese Datei ist der Einstiegspunkt für jede KI-Session in diesem Projekt** (Kimi Work, Claude Code, andere Agenten). Erstellt 22.07.2026 beim Umstieg auf Kimi Work. Ergänzt/ersetzt schrittweise `CLAUDE.md` (Claude-Code-spezifisch).
> **Aktueller Projekt-Stand = diese Datei + `_migration/claude-memory/MEMORY.md` (migrierter Index) + `git log origin/main --oneline -10`** — NICHT `docs/archive/HANDOVER-NEXT-SESSION.md` (nur Meilenstein-Archiv).

---

## 🏗️ Projekt-Kontext

- **Produkt/Marke:** BFSG-Fuchs — automatisierter Compliance-Scanner für deutsche Websites (BFSG/WCAG 2.1 AA/TDDDG); Maskottchen „Filo".
- **Primär-Domain:** **bfsg-fuchs.de** (Inhalts-SSOT: `landingpage-next/lib/config.ts`; Cutover 29.06.2026). bfsg-fix.de läuft parallel (canonical → bfsg-fuchs.de, Stripe-/Webhook-URLs, E-Mail info@bfsg-fix.de). **Alle Außen-Texte IMMER auf Marke BFSG-Fuchs + bfsg-fuchs.de!**
- **Owner:** Matthias Seba, Lange Straße 20, 27449 Kutenholz, info@matthias-seba.de · § 19 UStG Kleinunternehmer · User-E-Mail für Accounts: matze.seba@outlook.de
- **Server:** Hetzner CPX22, Nürnberg, Ubuntu 24.04. SSH von diesem PC möglich (Operator-Key via `bootstrap-ssh.yml`); Alias `bfsg` nur auf dem Mac.
- **Status:** Live (`/health` = ok, stripe live, mailer aktiv).
- **Pakete (Stripe Live-Mode):** Basis 129 € · Profi 399 € · Cookie-Basis 39 € · Cookie-Profi 69 € · Re-Check-Abo 24,99 €/Mo oder 249 €/Jahr (`ENABLE_ABO=true`).

### Repo-Layout
```
scanner/          Node.js Backend (Express + Playwright + axe-core + Stripe) — Einstieg: app.js (KEIN server.js!)
landingpage-next/ Next.js 16 Landing (Tailwind v4 + shadcn, React 19, TS strict)
admin-next/       Admin-Dashboard (Next.js 16) — Scaffold, Mock-Daten, KEIN Auth → Caddy-Vhost bewusst deaktiviert
aos/              Agent Operating System — Business-Dashboard (FastAPI + Next.js 15 + 4 Agenten), live auf aos.bfsg-fuchs.de
marketing-os/     Lokales Marketing-Agent-OS (Engine :4870 + Dashboard) — LAUTZEIT-BRUCH: ruft claude-CLI, alle Jobs failed seit 08.07.
cockpit/          Jarvis-Cockpit — Source NUR auf Branch handover/skills-update (Commit 1574a0e), nicht auf main!
landingpage/      Legacy-HTML — nur danke.html wird noch ausgeliefert (Volume-Mount)
deployment/       Docker Compose + Caddy + cloud-init + Backup-Skripte
docs/ · marketing/ · scripts/ · plans/   Doku, Strategie, Helper, Pläne
_migration/claude-memory/   Migriertes Claude-Code-Auto-Memory (54 Dateien, Stand 22.07.2026)
```

---

## 🛠️ Deploy & Operations

- **Deploy:** GitHub Actions auf `main`-Push → SSH zu Hetzner → `git pull && docker compose up -d --build`. **Merge = Live-Deploy → nur via PR, nie direkt auf main.**
- **Workflows:** `deploy.yml` (Auto-Deploy) · `deploy-aos.yml` (AOS) · `pr-ci.yml` (Scanner-Tests + LP-Build + Legal-Grep + Caddy-Validate) · `diagnose.yml` · `uptime-watch.yml` (5-min Health + Brevo-Alert) · `backup-restore-test.yml` (monatlich)
- **Health:** `https://bfsg-fix.de/health` · **Stripe-Webhook:** `https://bfsg-fix.de/webhook` · SSL via Caddy/Let's Encrypt
- **Caddy-Regel (aus P0 09.07. gelernt):** Caddyfile-Änderungen IMMER vorher mit `caddy validate` prüfen (ist CI-Gate in pr-ci.yml).
- **Compose-Env-Regel:** Server-`.env`-Vars erreichen den App-Container nur, wenn sie in `docker-compose.yml` unter `environment:` explizit gelistet sind (kein `env_file`).
- **Backups:** täglicher Cron + GPG + rclone (`deployment/backup.sh`) — ⚠️ BEKANNTER BUG: Cron lädt `.env` nicht; `BACKUP_GPG_RECIPIENT`/`BACKUP_TARGET` fehlen dem Cron-Environment → Backup läuft vermutlich ins Leere. Fix offen (s. Offene Baustellen).

## 🔐 Sensible Daten

- **Niemals** Live-Keys ins Repo oder in den Chat (falls passiert: Owner zur Rotation auffordern). `.env` gitignored, `.env.example` als Template.
- Secrets-Quellen: GitHub Secrets (CI) + Server-`.env` unter `/opt/bfsg-check/deployment/.env`.
- Stripe-Key-Prefix: `rk_live_*` (Restricted) — Live-Flag-Check in `scanner/lib/mailer.js`.
- **Subagenten bekommen grundsätzlich KEINEN SSH-/Prod-/Stripe-/Brevo-Zugriff** (Owner-Vorgabe) — immer explizit in Subagent-Prompts verbieten.

---

## ⚖️ Recht & Compliance (bindend, Quelle: `docs/LEGAL-REALITY-CHECK-2026.md`, Stand 20.06.2026)

**DÜRFEN:** B2B-SaaS-Verkauf ohne Anwalts-Endabnahme (Solo, <30k€/Jahr, Disclaimer + AGB-Cap) · Listings + freie PMs (openPR/inar/firmenpresse) · HARO/Featured-Answers · Show HN + Awesome-Lists (mit Founder-Disclosure) · § 6 UWG vergleichende Werbung (objektiv messbare WCAG-Scores).

**NICHT dürfen:** ❌ Cold-Mails (UWG §7 II Nr.2 — **bindendes NO-GO, nicht erneut prüfen**; `outreach.js` ist per Hard-Stop gesperrt, keine Umgehung) · ❌ LinkedIn-/Xing-DMs an Fremde (OLG Hamm 18 U 154/22) · ❌ „BFSG-konform"-Garantien (UWG §5) · ❌ TÜV/DEKRA-Siegel ohne Zertifizierung · ❌ Schleichwerbung in Foren · ❌ Cookie-Banner ohne 2-Button-Gleichgewicht.

**Pflicht-Sprache:** ✅ „automatisierte technische Analyse" / „WCAG-2.1-AA-Audit" — ❌ „BFSG-konform" / „rechtssicher" / „garantiert" / „abmahnsicher". Disclaimer-SSOT: `legal/disclaimer.md` (Einsatzort-Tabelle steht auf TODO — Ausroll verifizieren!). Legal-Grep läuft als CI-Gate (`scripts/legal-grep.mjs`); `marketing/no-ads-strategie/` ist per `IGNORE_PATH_PREFIXES` ausgenommen (interne Analyse-Docs zitieren Verbotswörter).

---

## 🎯 Strategie (Stand 19.07.2026 — No-Ads)

- **Paid Ads sind TOT:** Bing-Konto endgültig gesperrt (Re-Appeal frühestens ~01/2027, KEIN neues Konto!), Google Ads verworfen (Owner 08.07.). Keine Session plant Ads-Budgets oder fasst Ad-Konten an.
- **4-Säulen-No-Ads-Plan** (`marketing/no-ads-strategie/`, 90-Tage-Plan + KPI-Gates, aktuell ~Woche 3/13): A Content/AEO/PR · B Partner/Channel · C Directories/Listings · D Widget-Kern.
- **Lead-Blitz:** 80-Kanal-Liste + 4 ready-to-launch Assets (`marketing/ready-to-launch/`, Stand 19.07.) — Publish-Status wird im Repo nicht getrackt → `STATUS.md` einführen (offen).
- Budget: 0 €/Tag Ads · 25 €/Mo Tools · Anwalts-Trigger: `docs/LEGAL-REALITY-CHECK-2026.md`.

---

## 🧠 Arbeitsregeln bei neuen Aufgaben

1. **Stand bestimmen:** AGENTS.md + `_migration/claude-memory/MEMORY.md` + `git fetch && git log origin/main --oneline -10`. Session-Branches/Disk-Docs hängen oft hinter origin/main.
2. **Memory SOFORT pflegen:** Nach jedem Meilenstein (PR offen/gemergt, Entscheidung, Blocker) sofort Memory-Eintrag schreiben — nicht erst am Session-Ende. (Kimi Work: eigene Memory-Dateien + ggf. Eintrag in einem projekteigenen Memory-Index.)
3. **Code-Regeln:** TypeScript-Strikt-Mode; echte Umlaute (ä/ö/ü/ß — ESLint-Rule in landingpage-next); deutsche Kommentare mit PR-/Finding-Referenzen sind Projekt-Konvention und Wissensträger — erhalten, nicht „aufräumen".
4. **Deploy nur via PR-Merge auf main.** Vor Merge lokal bauen/testen (pr-ci deckt Scanner-Tests + LP-Build ab).
5. **Marketing-Texte/Externes:** Pflicht-Sprache + Legal-Grep beachten; Owner reicht PMs/Listings selbst ein.

## 🤖 Subagenten-Regeln (Kimi Work)

- Feste Typen: `explore` (Recherche/Analyse), `plan` (Review/Architektur), `coder` (Implementierung). Spezial-Rollen als Label im Prompt (z. B. „Code-Reviewer", „A11y-Auditor") statt nativer Agenten-Typen; unabhängige Agenten parallel in EINER Nachricht starten (AgentSwarm).
- Subagent-Prompts: self-contained, explizit SSH-/Prod-Zugriff verbieten.
- Die 217 Claude-Agency-Agenten (`.claude/agents/agency/`) sind als **Prompt-Bibliothek** weiter nutzbar (Inhalt tool-agnostisch), nicht als native Typen.
- Claude-Modell-Routing (haiku/sonnet/opus) entfällt — in Kimi Work nicht übertragbar.

## 🚫 Was du NICHT tust

- Keine Force-Pushes auf main · kein `git reset --hard` ohne Owner-OK · keine destruktiven `rm -rf` ohne Backup (bei Worktrees: `rmdir` statt `rm -rf` — Junction-Gefahr)
- Keine Live-Aktionen (Stripe-Refunds, Server-Löschung, Ads-Aktivierung) ohne Owner-Bestätigung
- Keine Cold-Mails, keine LinkedIn-DMs, keine Umgehung der `outreach.js`-Sperre
- Keine Secrets in Chat/Repo; bei Fund: melden + Rotation empfehlen

---

## 📋 Owner-Beschlüsse 23.07.2026 (Instandsetzung)

1. **Merge-Modus:** Hygiene-PRs (Docs, Lockfile, .gitignore) darf die KI bei grüner CI selbst mergen; produktiv wirksame PRs nur nach ausdrücklicher Owner-Freigabe („merge #N").
2. **SSH:** Lesender Server-Zugriff (Logs/Verifikation) ist erlaubt; schreibend nie ohne Freigabe.
3. **Domain:** bfsg-fuchs.de = einzige Wahrheit; **Stripe-Webhook zieht auf bfsg-fuchs.de um** (Runbook: `docs/WEBHOOK-CUTOVER-FUCHS.md`, Caddy routet bereits — nur Stripe-Dashboard + neues Secret nötig). Absender bleibt vorerst info@bfsg-fix.de (leitet an matze.seba@outlook.de + info@matthias-seba.de weiter; Postfach @bfsg-fuchs.de existiert noch nicht).
4. **Dashboard:** Zentrales Business-Dashboard kommt — aber **erst nach der vom Owner geplanten Business-Umstrukturierung** (eigene Session). Basis wird dann `aos/`; bis dahin am Dashboard nichts bauen.
5. **LLM-Provider:** Abstraktion statt fester Anthropic-Kopplung (Key/Modell per Env).
6. **cockpit/.env:** gelöscht; **Stripe-/GitHub-/Google-Ads-Keys waren vermutlich live → Rotation durch Owner empfohlen.**
7. Worktrees: alle 16 entfernt · Docs: nach `docs/archive/` · vault/: quarantäne-verschoben nach `C:\Users\Administrator\vault-quarantine-20260723` (finale Löschung durch Owner) · PII: ersetzt · Marketing-OS-Scheduler: pausiert (Default aus, `MOS_SCHEDULER_ENABLED`).

---

## 🔧 Offene Baustellen (Stand 23.07.2026, nach Instandsetzungs-Welle 1)

**Erledigt (PRs #152–#156 gemergt):** Lockfile + npm ci + Preis-Sync-CI-Gate (#153) · Docs-Archivierung + plans-Statusfix (#154) · PII-Entfernung + Skript-Archivierung (#155) · Marketing-OS Runner-Recovery + Scheduler-Pause + Seed-Integrität (#156) · CLAUDE.md-Straffung (#152) · 16 Worktrees entfernt · cockpit/.env gelöscht.

**Wartet auf Owner-Freigabe (produktiv wirksam):**
- **#157** Domain-SSOT bfsg-fuchs.de (Mail-/PDF-Links, Legacy-LP-Bereinigung, Webhook-Runbook)
- **#158** Backup-Env-Sourcing (Voraussetzung für Offsite-Backup)
- **#159** Scanner-LLM-Provider-Abstraktion (dormant, REPORT_QA_ENABLED=false)
- **#160** AOS-LLM-Provider-Abstraktion

**Technisch (offen):**
1. **Backup-Offsite:** Nach #158-Merge + Owner-Schritten (BACKUP_GPG_RECIPIENT + BACKUP_TARGET + rclone-Remote in Server-.env, Testlauf, Restore-Test) — Details `docs/BACKUP.md`.
2. **admin-next ohne Auth** — Container-Port 3001 offen, sobald exposed. Welle-5-Auth vor öffentlichem Vhost. (Langfristig: wird vom künftigen Zentral-Dashboard auf aos-Basis abgelöst — Beschluss 4.)
3. `scanner/app.js` (1.606 Z.) + `mailer.js` (905 Z.) in Module zerlegen (Wartbarkeit, kein akutes Risiko).
4. **Cockpit-Reste:** Source nur auf Branch `handover/skills-update` (Commit 1574a0e) — archivieren/taggen oder Branch löschen; Entscheidung beim Dashboard-Projekt (Beschluss 4).
5. **Follow-ups aus Welle 1:** `backup-restore-test.yml` enthält noch private Alert-E-Mail → auf `secrets.ALERT_EMAIL` umstellen, sobald Secret existiert · neue LLM-Env-Vars in `scanner/.env.example` dokumentieren · Legacy-Doku-Verweise auf alte `landingpage/*.html`-Pfade (in `docs/archive/`, unkritisch) · `docs/MENSCH-PFLICHTEN-START.md` enthält historischen Branch-Link (bewusst belassen).
6. **Marketing-OS-Executor:** `claude-exec.js` ruft `claude.cmd` (bruch seit 08.07.) — Reparatur erst relevant, wenn das Marketing-OS reaktiviert wird (hängt an Beschluss 4).

**Owner-ToDos (Mensch nötig):** 🔑 **Key-Rotation: Stripe (Restricted Key), GitHub-Token, Google-Ads-Keys** (cockpit/.env war befüllt) · GitHub-Secret `ALERT_EMAIL` anlegen (sonst Uptime-Alerts tot) · Stripe-Webhook-Umzug nach `docs/WEBHOOK-CUTOVER-FUCHS.md` · Backup-Offsite (s. o.) · openPR-Konto + PM einreichen · SaaSHub/G2-Listings · Reddit/UGC starten · GitHub-Secrets `AOS_IMAP_*` · Stripe-Scopes · Wortlaut-Freigabe AOS-Blueprint §5 · Disclaimer-Einsatzorte verifizieren · Postfach @bfsg-fuchs.de einrichten (danach 3 kommentierte E-Mail-Stellen umziehen).
