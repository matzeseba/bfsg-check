# CLAUDE.md — Arbeits-Regeln für dieses Projekt

> Wird automatisch beim Session-Start geladen. **Aktueller Projekt-Stand = Auto-Memory (MEMORY.md-Index, auto-geladen) + `git log origin/main`** — NICHT `docs/HANDOVER-NEXT-SESSION.md` (nur Meilenstein-Archiv, kann veraltet sein).

---

## 🚀 Express-Modus (FESTE REGEL)

**Schnellster Weg, maximal viel selbst erledigen:**
- Keine Klick-Anleitungen, wenn es per API/CLI selbst geht; aktiv nach Credentials fragen, sofort handeln (danach aus Repo raushalten, Rotation empfehlen)
- Knappe Status-Updates statt Tutorials; parallele Tool-Calls wo möglich
- Bei Hindernissen eigenständig Plan B/C — Rückfrage nur bei echten Owner-Entscheidungen

## 🧭 Coding-Guidelines (Karpathy — FESTE REGEL)

**Think Before Coding · Simplicity First · Surgical Changes · Goal-Driven Execution** — gelten global, Quelle `~/.claude/rules/karpathy-coding-guidelines.md` (auto-geladen). Express-Modus regelt das WIE (Tempo, selbst erledigen), die Guidelines das WAS/OB (vorher denken, minimal ändern, verifizieren).

---

## 🏗️ Projekt-Kontext

- **Produkt/Marke:** BFSG-Fuchs — automatisierter Compliance-Scanner für deutsche Websites (BFSG/WCAG/TDDDG); Maskottchen „Filo"
- **Primär-Domain:** bfsg-fuchs.de (SSOT: `landingpage-next/lib/config.ts`; Cutover 29.06.2026). bfsg-fix.de läuft parallel (canonical → bfsg-fuchs.de, E-Mail info@bfsg-fix.de, Stripe-/Webhook-URLs). Server: Hetzner CPX22, Nürnberg, Ubuntu 24.04. **Alle Außen-Texte (PMs, Listings, Social) IMMER auf Marke BFSG-Fuchs + bfsg-fuchs.de!**
- **Owner:** Matthias Seba, Lange Straße 20, 27449 Kutenholz, info@matthias-seba.de · § 19 UStG Kleinunternehmer
- **Status:** Live (`/health` = `ok:true, stripe:true, live:true, mailer aktiv`)

### Repo-Layout
```
scanner/          Node.js Backend (Express + Playwright + axe-core + Stripe)
landingpage-next/ Next.js Landing (Tailwind v4 + shadcn)
admin-next/       Admin-Dashboard (Next.js)
aos/              Agent Operating System — Business-Dashboard, eigener Docker-Stack, live auf aos.bfsg-fuchs.de
landingpage/      Legacy HTML-Fallback (Volume-Mount)
deployment/       Docker Compose + Caddy + cloud-init
docs/ · marketing/ · scripts/ · plans/   Doku, Strategie, Helper, Pläne
.claude/          Settings + lokale Agenten/Skills (gitignored)
```

### Pakete (alle live, Stripe Live-Mode)
Basis 129 € · Profi 399 € · Cookie-Basis 39 € · Cookie-Profi 69 € · Re-Check-Abo 24,99 €/Mo oder 249 €/Jahr (`ENABLE_ABO=true`; Jahresoption = Backend-Paket `abo-jahr`)

---

## 🛠️ Deploy & Operations

- **Deploy:** GitHub Actions auf `main`-Push → SSH zu Hetzner → `git pull && docker compose up -d --build`. **Merge = Live-Deploy** → nur via PR.
- **Health:** `https://bfsg-fix.de/health` · **Stripe-Webhook:** `https://bfsg-fix.de/webhook` · SSL via Caddy/Let's Encrypt
- **Workflows:** `deploy.yml` (Auto-Deploy) · `deploy-aos.yml` (AOS-Stack) · `pr-ci.yml` (Scanner-Tests + LP-Build + Legal-Grep + Caddy-Validate) · `diagnose.yml` · `uptime-watch.yml` (5-min Health + Brevo-Alert)
- Backups: noch nicht voll automatisiert (`docs/BACKUP.md`)

## 🔐 Sensible Daten

- **Niemals** Live-Keys ins Repo oder in den Chat (falls passiert: Owner zur Rotation auffordern). `.env` gitignored, `.env.example` als Template.
- Secrets-Quellen: GitHub Secrets (CI) + Server-`.env` unter `/opt/bfsg-check/deployment/.env`
- Stripe-Key-Prefix: `rk_live_*` (Restricted) — Live-Flag-Check in `scanner/lib/mailer.js:43`

---

## ⚖️ Recht & Compliance

**DÜRFEN** (Stand 20.06.2026, Details `docs/LEGAL-REALITY-CHECK-2026.md`): B2B-SaaS-Verkauf ohne Anwalts-Endabnahme (Solo, <30k€/Jahr, Disclaimer + AGB-Cap) · Listings + freie PMs (openPR/inar/firmenpresse) · HARO/Featured-Answers · Show HN + Awesome-Lists (mit Founder-Disclosure) · § 6 UWG vergleichende Werbung (objektiv messbare WCAG-Scores).

**NICHT dürfen:** ❌ Cold-Mails (UWG §7 II Nr.2, 270–800 € Abmahnung/Mail) · ❌ LinkedIn-/Xing-DMs an Fremde (OLG Hamm 18 U 154/22) · ❌ „BFSG-konform"-Garantien (UWG §5) · ❌ TÜV/DEKRA-Siegel ohne Zertifizierung · ❌ Schleichwerbung in Foren (UWG §5a IV, §22 MStV) · ❌ Cookie-Banner ohne 2-Button-Gleichgewicht.

**Pflicht-Sprache:** ✅ „automatisierte technische Analyse" / „WCAG-2.1-AA-Audit" — ❌ „BFSG-konform" / „rechtssicher" / „garantiert". Disclaimer: `docs/legal-templates/disclaimer-footer.md`.

---

## 🎯 Strategie (Stand 19.07.2026 — No-Ads)

- **⚠️ Paid Ads sind TOT:** Bing-Konto endgültig gesperrt (Re-Appeal frühestens ~01/2027, KEIN neues Konto!), Google Ads verworfen (Owner 08.07.). Keine Session plant Ads-Budgets oder fasst Ad-Konten an.
- **4-Säulen-No-Ads-Plan** (`marketing/no-ads-strategie/`, inkl. 90-Tage-Plan + KPI-Gates): A Content/AEO/PR · B Partner/Channel · C Directories/Listings · D Widget-Kern
- **Lead-Blitz:** 80-Kanal-Liste + ready-to-launch Assets → `marketing/no-ads-strategie/2026-07-19-lead-blitz-strategie.md` + `marketing/ready-to-launch/`
- **Bindend:** Kaltakquise-Scan+Mail = NO-GO (UWG § 7 II Nr. 2 — nicht erneut prüfen)
- Budget: 0 €/Tag Ads · 25 €/Mo Tools · Anwalts-Trigger: `docs/LEGAL-REALITY-CHECK-2026.md`

---

## 🧠 Arbeitsregeln bei neuen Aufgaben

1. **Stand = Auto-Memory + `git log origin/main --oneline -10`** (Branches/Disk-Docs hängen oft hinterher)
2. **Memory SOFORT pflegen (FESTE REGEL):** Nach jedem Meilenstein (PR offen/gemergt, Entscheidung, Blocker) sofort Memory-Datei + MEMORY.md-Indexzeile schreiben — nicht erst am Session-Ende. Kein ` #` in YAML-`description` (schneidet Text ab).
3. Code: TypeScript-Strikt-Mode, echte Umlaute (ä/ö/ü/ß — ESLint-Rule)
4. Deploy nur via PR-Merge auf main; Marketing-Tasks: `marketing/` + `docs/SALES-DAY-1-V2.md`
5. Computer Use ist aktiviert (Browser nativ steuerbar)

---

## 🤖 Agency-Agents (FESTE REGEL)

**217 spezialisierte Agenten** (`msitarzewski/agency-agents`, MIT) lokal unter `.claude/agents/agency/` — 16 Divisionen (engineering, security, design, marketing, sales, testing, support, …). Gitignored; Update: `git -C /tmp/agency-agents pull` + Re-Copy. Als native `subagent_type` ab nächstem Session-Start verfügbar.

**Regel:** Bei jeder substanziellen Spezial-Aufgabe zuerst passenden Agency-Agenten wählen statt generisch arbeiten; unabhängige Agenten parallel in EINER Nachricht starten. Beispiele: Code-Review → `engineering-code-reviewer` · Security → `security-appsec-engineer` · Conversion/UX → `design-ux-architect`, `marketing-growth-hacker` · A11y-Dogfood → `testing-accessibility-auditor` · Reliability → `engineering-sre`. Falls Kontext-Overhead zu groß: irrelevante Divisionen (academic, gis, game-development, spatial-computing) löschen.

## 💰 Cost-Aware Model-Routing (FESTE REGEL, seit 22.07.2026)

**Jeder Sub-Agent bekommt beim Start EXPLIZIT das günstigste Modell zugewiesen, das die Aufgabe sicher schafft** — nie stillschweigend das Haupt-Session-Modell erben lassen. Mechanik je Startweg: `model`-Parameter im Agent-Tool · `opts.model` + `opts.effort` im Workflow-Tool · `model`-Frontmatter in `.claude/agents/*.md` · `--model`-Flag bei `claude`-CLI-Aufrufen.

| Tier | Einsatz |
|---|---|
| `haiku` | Mechanik/Volumen: Grep-/Datei-Sweeps, Extraktion, Format-/Checklisten-Prüfungen, simple Zusammenfassungen (+ `effort: low`) |
| `sonnet` | **Default für ALLE Subagenten** (Owner-Vorgabe): Code, Review, Recherche, Forensik, Content |
| `opus` | Nur einzeln begründet: schwerste Architektur-/Judge-/Verify-Stages |
| Fable/Mythos | **NIE für Subagenten** — nur Haupt-Loop |

Im Zweifel `sonnet`. Zusatzregel: Subagenten-Prompts verbieten SSH-/Prod-Zugriff explizit (Memory `subagent-model-policy`).

## ⚡ Cache-Prompting (FESTE REGEL)

Fester Prefix (CLAUDE.md + Agenten) wird automatisch gecacht — warm halten (Details: `docs/CACHE-PROMPTING-AGENTS.md`):
1. Kein Modellwechsel des HAUPT-Gesprächs mitten in der Session (`/fast`, Opus↔Sonnet, Effort) — Subagenten-Routing (s. o.) ist davon unberührt
2. CLAUDE.md / `.claude/agents/` nur an Session-Grenzen ändern
3. MCP-Server nicht unnötig mid-Session togglen
4. Agenten-Sprints batchen (eine Nachricht); warmen Agenten via `SendMessage` weiternutzen statt neu spawnen; Subagent-Prompts self-contained
5. Optionaler 1h-Haupt-Cache: `ENABLE_PROMPT_CACHING_1H=1` — nur vom Owner zu setzen

## 🪨 Caveman-Modus (Token-Sparen — FESTE REGEL, seit 22.07.2026)

Skill `caveman` (github.com/JuliusBrussee/caveman, MIT) lokal unter `.claude/skills/caveman/` (gitignored; bei frischem Checkout `skills/caveman/SKILL.md` aus dem Quell-Repo re-kopieren).

**Standard:** Zu Session-Beginn Skill `caveman` invoken (Level `full`) und für ALLE Chat-Antworten halten — Fragmente statt Füllsätze, keine Tool-Call-Narration, keine Deko-Tabellen/Emojis. Substanz vollständig: Code, Befehle, Pfade, Fehlermeldungen byte-genau; Sprache bleibt Deutsch.

**Ausnahmen (IMMER normale Sprache):** Deliverables/Außen-Texte (Marketing, Mails, PMs, Listings, LP-Texte, `docs/`, README, PR-/Commit-Texte — Brand-Voice vor Ersparnis) · Sicherheitswarnungen + irreversible Aktionen · Owner-Runbooks · Memory-Dateien. Steuerung: `/caveman lite|full|ultra` · aus: „normal mode".

---

## 📞 Bei Fragen / Blockern

- **User-E-Mail:** matze.seba@outlook.de (Account-Erstellungen etc.)
- Anwalts-Liste (Trigger-basiert): `docs/LEGAL-REALITY-CHECK-2026.md` · Server-SSH: Alias `bfsg` (nur User-Mac) · MCPs: `claude mcp list`

## 🚫 Was du NICHT tust

- Keine Force-Pushes auf main · kein `git reset --hard` ohne User-OK · keine destruktiven `rm -rf` ohne Backup
- Keine Live-Aktionen (Stripe-Refunds, Server-Löschung, Ads-Aktivierung) ohne User-Bestätigung
- Keine eigenmächtigen Permission-Erweiterungen in `.claude/settings.local.json`
- Keine Cold-Mails, keine LinkedIn-DMs, keine Umgehung der `outreach.js`-Sperre
