# 🤝 Cowork + Claude Code — Dein Hybrid-Plan

> **Für Matthias.** So einfach, dass es jeder versteht.
> Du musst nichts umstellen. Du musst nur Cowork DAZU schalten.

**Stand:** 18.06.2026 · **Status:** Empfehlung nach 3-Agent-Recherche

---

## 🎯 Die Entscheidung in einem Satz

> **Behalte Claude Code für Coding, schalte Cowork für Marketing + Browser dazu. Beide auf demselben Pro-Abo. Du gewinnst Cowork-Stärken ohne Code-Stärken zu verlieren.**

---

## 🚫 Warum NICHT umstellen?

Cowork hat **3 große Schwächen** für ein Coding-Business wie BFSG-Check:

| Schwäche | Was es bedeutet | Quelle |
|---|---|---|
| **Keine Sub-Agents** | Cowork kann nicht 4 Agenten parallel arbeiten lassen (wie wir das machen). Bricht mit „Prompt is too long"-Fehler. | GitHub Issue #55712 |
| **Sandbox blockiert npm + Docker** | Du kannst nicht mal eben `npm install` oder `docker compose up` machen. | GitHub Issue #43334 |
| **5–10× höherer Token-Verbrauch** | Cowork macht ständig Screenshots — jede Aktion kostet viele Tokens. | Cowork-Architektur-Studien |

**Was du verlierst, wenn du komplett auf Cowork umstellst:** Genau die Sache, die in den letzten Tagen 34 PRs in den Repo gebracht hat — Multi-Agent-Sprints.

---

## ✅ Warum Cowork TROTZDEM dazu?

Cowork hat **3 große Stärken** für Tagesgeschäft + Marketing:

| Stärke | Was es bedeutet |
|---|---|
| **Browser-nativ** | Steuert direkt Stripe-Dashboard, Notion, Brevo-UI, INWX, LinkedIn — keine MCP-Setups nötig |
| **Eingebaut in Desktop-App** | 10 Min Setup (Toggle in Settings). Kein WSL2, kein CLI, keine Configs |
| **Schon im Abo** | 1 Claude Pro ($20) deckt Cowork + Claude Code — keine Mehrkosten |

---

## 🧠 Wer macht was? (Aufgaben-Verteilung)

```
┌─────────────────────────────────────────────────────────┐
│  CLAUDE CODE (Maschinenraum)                            │
│  ────────────────────────────────                       │
│  • Multi-Agent-Sprints (4 Agenten parallel)             │
│  • Code-Refactor (scanner/, landingpage-next/)          │
│  • Git-Arbeit (Bisect, Rebase, Merge-Conflicts)         │
│  • Test-Suite + Playwright-Debug                        │
│  • CI/CD-Hooks bauen                                    │
│  • PR-Webhooks subscriben (wie heute Nacht!)            │
│  • Lange Logs durchsuchen                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  COWORK (Front-Office)                                  │
│  ────────────────────────────────                       │
│  • Stripe-Dashboard (Refunds, MRR, Key-Rotation)        │
│  • Brevo-UI (Newsletter, Templates, Sender-Auth)        │
│  • Notion-Pflege (Pipeline, Dashboards, Runbooks)       │
│  • INWX (DNS-Records klicken)                           │
│  • Hetzner-Dashboard (Server-Monitoring)                │
│  • LinkedIn (Posts, DMs, Profil-Edit)                   │
│  • Google Ads (Kampagnen-UI)                            │
│  • Sentry (Error-Triage)                                │
│  • Mail-Tester, Google Search Console                   │
│  • Daily Health-Check Routine                           │
└─────────────────────────────────────────────────────────┘
```

**Faustregel:** Wenn es im Terminal/Editor passiert → Claude Code. Wenn es im Browser passiert → Cowork.

---

## 🚀 Wann lege ich los? (3-Schritte-Setup, 15 Min)

### Schritt 1 — Cowork aktivieren (10 Min, einmalig)
1. Windows-Systemsteuerung → „Windows-Features aktivieren/deaktivieren" → ☑ **Plattform für virtuelle Computer** → Reboot
2. Claude Desktop App öffnen → Settings (Zahnrad) → **General** → Toggle **„Computer use"** EIN
3. Beim ersten Cowork-Start lädt ~2 GB Linux-VM (einmalig, paar Minuten warten)

### Schritt 2 — MCPs in Cowork verbinden (3 Min)
Cowork nutzt die gleichen MCP-Configs wie deine Desktop-App. In **Settings → Customize** verbinden:
- ✅ GitHub (für Repo-Zugriff)
- ✅ Notion (für Knowledge-Hub)
- ✅ Stripe (für Order-Lookups, Refunds)
- ✅ Brevo (für Newsletter, Templates)
- ✅ Porter Metrics (für Ads-Reports)

Optional Zweite Welle: Canva, Gamma, Higgsfield, Google Drive.

### Schritt 3 — Bitwarden-Extension in Cowork-Chrome (2 Min)
Innerhalb der Cowork-Sandbox: Chrome öffnen → Web Store → Bitwarden installieren → Login. Damit muss Claude nicht jedes Mal nach Passwort fragen.

**Fertig.** Du kannst jetzt sagen: *„Cowork, geh auf bfsg-fix.de/health und sag mir was zurückkommt"* — Browser öffnet sich, Cowork klickt durch, gibt Ergebnis zurück.

---

## 📦 Was Cowork ab Tag 1 für dich macht

### Tagesgeschäft (täglich, je 5 Min)
| Aufgabe | Cowork-Befehl |
|---|---|
| Tagescheck | *„Mach den Tagescheck — Stripe + Brevo + Sentry + Notion-Dashboard"* |
| Refund verarbeiten | *„Erstatte Order #cs_live_xxx vollständig"* |
| Sales-Status | *„Wie viel MRR + neue Käufe seit gestern?"* |

### Wöchentlich (montags, 15 Min)
| Aufgabe | Cowork-Befehl |
|---|---|
| KPI-Wochenreport | *„Mach den Wochenreport — alle Kanäle, Notion-Page + Gamma-Slides"* |
| Partner-Outreach | *„10 LinkedIn-DMs an die nächsten Agenturen aus partner-targets.md"* |
| Blog-Artikel | *„Neuer Blog-Artikel über Cookie-Compliance — aus seo-content-plan.md"* |

### Bei Bedarf (event-driven)
| Aufgabe | Cowork-Befehl |
|---|---|
| Live-Bug | *„Site ist down — check Caddy/Docker-Logs, finde Ursache, rollback wenn nötig"* |
| Kunden-Anfrage | *„Antwort-Entwurf für diesen Kunden mit dem Refund-Wunsch"* |
| Pricing-Test | *„Aktiviere A/B-Test 1 aus pricing-experiments.md"* |

---

## 🎁 8 Custom Skills für Cowork (anlegen in Tag 3+4)

Skills sind wiederverwendbare Workflows. Du tippst nur den Trigger-Satz:

| Skill | Trigger | Was es macht |
|---|---|---|
| `daily-health-check` | „Tagescheck" | Stripe + Brevo + Sentry + Notion → 1 Notion-Report |
| `process-refund` | „Erstatte Order #..." | Stripe-Suche → Refund → Kunden-Mail → Audit-Log |
| `publish-blog-post` | „Neuer Blog-Artikel über X" | SEO-Keywords → Draft → Canva-Header → PR → Newsletter |
| `weekly-kpi-report` | „Wochenreport" | MRR + Ads-Spend + Leads → Notion + Gamma-Slides |
| `legal-update-check` | „Recht-Update" | BFSG-News crawlen, Diff zu letztem Stand, Issue falls Änderung |
| `outreach-cold-batch` | „10 Partner anschreiben" | Targets aus marketing/ → Personalisieren → Brevo-Send |
| `deploy-scanner-update` | „Deploy Scanner neu" | Tests → git push → SSH Pull → Smoke-Test |
| `incident-response` | „Site ist down" | Logs → Diff letzter Commit → Rollback bereit |

---

## 🗂️ Wo lebt das Wissen? (Knowledge-Hub-Architektur)

```
        ┌────────────────────────────┐
        │  GitHub Repo (Master)      │  ← du editierst hier (immer)
        │  bfsg-check/               │
        │  - docs/  (markdown)       │
        │  - .claude/ (hooks, perms) │
        │  - scanner/, *-next/       │
        └────────────┬───────────────┘
                     │
        ┌────────────┴───────────────┐
        │                            │
   git clone                  GitHub Action
   (Cowork-Sandbox)          (täglich 06:00)
        │                            │
        ▼                            ▼
   ┌────────┐                ┌──────────────┐
   │ Cowork │◄──── MCP ────► │   Notion     │
   │ + Code │                │  „BFSG Hub"  │
   └────────┘                └──────────────┘
```

**Regel:** Repo schreibt, Notion liest. Wenn du in Notion editierst, geht's beim nächsten Sync verloren. Alle Edits → PR ins Repo.

**Was wandert wohin:**
- **Code, Configs, Hooks** → Repo (wie bisher)
- **Runbooks, Stammdaten, Pricing, KPIs** → Notion (Cowork-Hub)
- **Wiederkehrende Handgriffe** → Cowork-Skills

---

## 📅 7-Tage-Übergangs-Sprint

### Tag 1 — Cowork einschalten
- Schritte 1-3 oben (Cowork aktivieren, MCPs verbinden, Bitwarden installieren)
- Verifikations-Test: *„Lies bfsg-fix.de/health und SSH zu bfsg, zeig docker compose ps"*

### Tag 2 — Notion-Hub anlegen
- Notion-Datenbank „BFSG Runbooks" erstellen (Felder: Title, Kategorie, Last-Updated, Source-Path)
- 12 wichtigste docs (LEGAL-PLACEHOLDERS, PRICING-DECISION, STRIPE-LIVE-TESTKAUF, etc.) nach Notion spiegeln

### Tag 3-4 — 8 Skills bauen
- Skills 1-4 (daily-health-check, process-refund, publish-blog-post, weekly-kpi-report)
- Skills 5-8 (legal-update-check, outreach-cold-batch, deploy-scanner-update, incident-response)
- Jeden Skill 1× live durchspielen

### Tag 5 — Marketing-Setup
- Brevo-Sender-Auth abschließen (Tag-0-Routine aus Marketing-Plan)
- Google-Ads-Konto vorbereiten
- Erste LinkedIn-DMs an Agentur-Partner (siehe partner-targets.md)

### Tag 6 — Parallel-Test-Tag
- Einen ganzen Tag NUR mit Cowork arbeiten
- Notieren: Wo musst du zurück zu Claude Code wechseln?
- Diese Lücken als Skill-V2 nachziehen

### Tag 7 — Soft-Cut
- Cowork = Default für: Marketing, Stripe-Dashboard, Notion, Browser-Tasks
- Claude Code = Default für: Coding, Multi-Agent-Sprints, Git-Operations, Refactors

---

## 💰 Was kostet das? (Spoiler: nichts extra)

| Posten | Kosten |
|---|---|
| Claude Pro Abo | $20/Monat (hast du schon) |
| Cowork-Aktivierung | $0 (eingebaut) |
| Claude Code | $0 (eingebaut) |
| Token-Verbrauch Cowork extra | ~$10/Monat bei deinem Use-Case |
| **Total extra** | **~$10/Monat** |

Wenn du intensiv Cowork nutzt + alle Multi-Agent-Sprints in Code laufen, könnte ein **Max-Abo ($100/Mo, 5× Quota)** sinnvoll werden. Erst beobachten, dann entscheiden.

---

## ✋ 5 Sachen, die du selbst behalten musst (NIE delegieren)

1. **Anwalt-OK + Versicherungs-Police** — keine Cowork-Aktion ersetzt diese Papier-Bestätigungen
2. **LinkedIn-Mass-DMs** — niemals automatisiert (LinkedIn-Ban + UWG-Risiko). Cowork darf nur DRAFTS, du klickst „Senden"
3. **Stripe-Refunds + Steuer-Rechnungen** — Buchhaltung musst du kontrollieren (Umsatzsteuer Reverse-Charge bei AT/CH-Käufen)
4. **Cold-Mail-Sperre nicht aufheben** — auch wenn Cowork „klügere" Vorschläge macht. 1.000–5.000 € Abmahn-Risiko pro Mail
5. **Pricing-Änderungen >20 %** — A/B-Tests ok, aber globale Preisänderungen nur mit deinem Sign-off

---

## 🎯 Erwarteter Impact in 14 Tagen

| Metrik | Konservativ | Stretch |
|---|---|---|
| Gratis-Scans gestartet | 300 | 600 |
| Paid Conversions | 10 (~2.500 €) | 25 (~6.000 €) |
| Re-Check-Abos | 2 | 6 |
| MRR | 78 € | 234 € |
| LinkedIn-Follower | +50 | +150 |
| Partner-Connected | 15/30 DMs | 25/30 |
| Scan→Purchase-Rate | 2 % | 4 % |
| Manueller Aufwand (du) | 30 Min/Tag | 60 Min/Tag |

---

## 🆘 Wenn was schiefgeht

1. **Cowork bleibt hängen** → Strg+C im Cowork-Chat, Session neu starten. Skill nochmal aufrufen.
2. **Cowork macht falschen Klick** → sofort den Browser-Tab in Cowork schließen, Skill neu starten mit klarerem Trigger
3. **Du verwechselst Cowork und Code** → Faustregel: Browser → Cowork. Editor → Code.
4. **Token-Limit erreicht** → vorübergehend Claude Code statt Cowork (Token-effizienter), oder Max-Abo upgraden

---

## ✨ TL;DR

- **Behalte Claude Code** (für Coding, Multi-Agent, deine Stärke)
- **Schalte Cowork dazu** (für Browser, Marketing, Stripe-Dashboard)
- **15 Min Setup heute, 7 Tage Übergang, danach Routine**
- **~$10/Monat Mehrkosten**, dafür ~30 Min/Tag manuell statt 2 h
- **Realistisch 10–25 Sales + 78–234 € MRR in 14 Tagen**

**Du machst das. 💪**
