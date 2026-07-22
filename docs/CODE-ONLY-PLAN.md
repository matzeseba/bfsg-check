# 🛠️ Code-Only Plan — Claude Code reicht

> **Entscheidung:** Du brauchst Cowork nicht. Wir machen alles in Claude Code mit Playwright MCP.
> **Setup:** 5 Minuten · **Mehrkosten:** 0 €

---

## 🎯 Die Idee in einem Satz

Für 90% der Aufgaben gibt es schon ein MCP (Stripe, Brevo, Notion, GitHub, Porter, Canva, Gamma, Higgsfield, n8n, Google Drive). Für den Rest fügen wir **Playwright MCP** hinzu → Claude steuert Chrome direkt aus deiner Claude Desktop App.

---

## 🚀 Setup — 5 Minuten

### 1 Befehl im Terminal
```bash
claude mcp add playwright npx @playwright/mcp@latest --scope user
npx playwright install chromium
```

Damit hat Claude Code Browser-Steuerung **direkt in der Desktop-App**. Sichtbares Chrome-Fenster öffnet sich, du schaust mit.

**Fertig.** Kein WSL2, kein Docker, keine VM, keine Sandbox-Konfiguration.

---

## 📦 Was Claude Code damit alles kann

| Service | Wie |
|---|---|
| **Stripe** (Refunds, Keys, MRR) | Stripe MCP (schon aktiv) |
| **Brevo** (Newsletter, Templates) | Brevo MCP (schon aktiv) |
| **Notion** (Pipeline, Runbooks) | Notion MCP (schon aktiv) |
| **GitHub** (PRs, Secrets, Issues) | GitHub MCP (schon aktiv) |
| **Marketing-Reports** (Ads, MRR-KPIs) | Porter Metrics MCP (schon aktiv) |
| **Designs/Visuals** | Canva + Gamma + Higgsfield (schon aktiv) |
| **Sentry-Setup** | Browser via Playwright (1× initial) → danach Sentry-API |
| **Hetzner Storage-Box-Order** | Browser via Playwright (1×) |
| **INWX DNS-Records** | INWX hat XML-RPC-API → direkt curl, kein Browser nötig |
| **LinkedIn-Drafts** | Browser via Playwright, du klickst „Publish" |
| **Google Ads Setup** | Browser via Playwright |
| **Mail-Tester** | API direkt via curl |
| **SSH zu Server** | Bash + ssh-config (wie bisher in Claude Code) |
| **GPG, rclone, docker** | Bash (wie bisher) |

---

## 🆚 Code-Only vs. Cowork

| Aspekt | Code + Playwright | Cowork |
|---|---|---|
| Setup-Zeit | **5 Min** | 15 Min (2 GB VM-Download) |
| Sub-Agents | ✅ **funktioniert** | ❌ broken (Issue #55712) |
| Token-Verbrauch | **normal** | 5–10× höher |
| npm + Docker | ✅ frei | ❌ blockiert |
| Skills | ✅ stabil | ⚠ UI-Bug (Issue #50669) |
| Browser-Steuerung | ✅ via Playwright | ✅ nativ |
| Persistente Sessions | ✅ ja | nur in Projects |
| **Tool-Anzahl** | **1 (nur Code)** | 2 (Code + Cowork) |
| Mehrkosten | **0 €** | ~$10/Monat (mehr Tokens) |

**Klare Empfehlung:** Code + Playwright. Du verlierst nichts, gewinnst Einfachheit.

---

## 🧠 Aufgaben-Mapping

### Tagesgeschäft (automatisiert via MCP)
- Tagescheck (Stripe + Brevo + Sentry + Notion) → MCPs reichen, kein Browser
- Refunds → Stripe MCP
- Newsletter → Brevo MCP
- KPI-Reports → Porter + Notion MCPs

### Browser-Tasks (via Playwright MCP)
- LinkedIn-Drafts erstellen (du klickst Publish)
- Google Ads UI (initial Kampagne anlegen)
- Hetzner-Storage-Order
- Sentry-initial-Setup
- Mail-Tester-UI-Check

### Manuell für dich (nie automatisierbar)
- 2FA-Codes (Phone Authenticator)
- Live-Test-Kauf mit eigener Karte
- LinkedIn „Publish"-Klick (UWG-Sicherheit)
- Anwalt-Gespräch, Versicherungs-Antrag

---

## 🎁 8 Skills für Claude Code (in `~/.claude/skills/`)

Anbei in `docs/skills/` als Markdown-Files — du kopierst sie in `~/.claude/skills/` und kannst sie via Trigger-Satz aufrufen:

| Skill | Trigger | Was es macht |
|---|---|---|
| `daily-health-check` | „Tagescheck" | Server-Health + Stripe-Sales + Brevo-Bounces + Sentry-Errors |
| `process-refund` | „Erstatte Order #..." | Stripe-Refund + Mail an Kunden + Audit-Log |
| `publish-blog-post` | „Neuer Blog-Artikel" | SEO-Draft + Canva-Header + PR + Newsletter |
| `weekly-kpi-report` | „Wochenreport" | MRR + Ads + Leads → Notion + Gamma-Slides |
| `legal-update-check` | „Recht-Update" | BFSG-News scannen, Diff zu letztem Stand |
| `outreach-warm-batch` | „5 Partner anschreiben" | Personalisierte DM-Drafts in LinkedIn |
| `deploy-scanner-update` | „Deploy Scanner" | Tests → push → SSH pull → Smoke-Test |
| `incident-response` | „Site ist down" | Logs + Diff letzter Commit + Rollback bereit |

---

## ✅ Was ich JETZT für dich gemacht habe

- [x] `docs/CODE-ONLY-PLAN.md` (diese Datei)
- [x] `docs/archive/SALES-DAY-1.md` (Morgen-Sprint, 5-Jährige-tauglich)
- [x] `marketing/linkedin-launch-posts.md` (3 fertige Posts)
- [x] `marketing/partner-warm-dms.md` (5 personalisierbare DM-Vorlagen)
- [x] `docs/skills/*.md` (8 Skill-Files bereit zum Kopieren)
- [x] `scripts/daily-health-check.sh` (Tagescheck-Script, lokal ausführbar)
- [x] Live-Server-Verifikation: `bfsg-fix.de/health` → ok, stripe live, mailer aktiv ✅

---

## 📋 Was DU jetzt machst (siehe SALES-DAY-1.md)

Kurz-Liste — Details in `docs/archive/SALES-DAY-1.md`:

**Heute Abend (30 Min):**
1. Live-Test mit eigener Karte
2. LinkedIn-Profil scharfmachen
3. Launch-Post auswählen (Variante A/B/C)

**Morgen früh (60 Min, ab 8:00):**
4. Launch-Post posten um 9:00
5. 5 personalisierte Warm-DMs
6. 3 Scans aus deinem Netzwerk vorbereiten
7. Reaktions-Fenster halten

**Morgen Mittag:**
8. Inbox-Check alle 2 Std → bei Interesse Payment-Link senden
