# AOS Business-Dashboard — Master-Architektur-Spezifikation (SSOT)

> **Verbindlicher Vertrag für alle Teams (Alpha/Beta/Gamma/Delta).**
> Jede Abweichung von Ports, Pfaden, Env-Namen oder JSON-Shapes bricht die Integration.
> Stand: 09.07.2026 · Ziel: `aos.bfsg-fuchs.de` auf dem Hetzner-Server (178.105.83.0).

---

## 0. Kontext & harte Rahmenbedingungen

- **Produkt-Umfeld:** BFSG-Fuchs — SaaS-Scanner für Website-Barrierefreiheit (WCAG/BFSG). Live-Stack auf demselben Server: `bfsg-app:8080` (Scan-Engine), `bfsg-landing-next:3000`, `bfsg-admin-next:3001`, `bfsg-caddy` (Compose-Projekt `deployment`, Netz `deployment_default`).
- **Server:** Ubuntu 24.04, 2 vCPU, **3,8 GB RAM (kein Swap!)**, 36 GB frei. Der Scan-Container darf bis 3g spiken → **AOS-Gesamtbudget ≤ 1,2 GB RAM, strikte `mem_limit` pro Container.**
- **Sprache aller UI-Texte:** Deutsch (echte Umlaute ä/ö/ü/ß, niemals ae/oe/ue).
- **Rechtliches:** KEIN LinkedIn-Scraping (ToS + OLG-Rechtsprechung). Competitor-Agent nutzt ausschließlich öffentliche RSS-/News-Quellen. Keine Formulierungen wie „BFSG-konform/rechtssicher/garantiert" in generierten Texten (UWG §5) — Generator-Prompts müssen das verbieten.
- **Kein Auto-Publish:** Generierte LinkedIn-Posts/Mails werden NUR als Entwurf gespeichert.

## 1. Verzeichnisstruktur (Repo-Root)

```
aos/
├── ARCHITECTURE.md              # diese Datei
├── README.md                    # Quickstart + Betrieb (Team Delta)
├── frontend/                    # Team Alpha (+ Gamma für Jarvis-UI)
│   ├── Dockerfile
│   ├── package.json             # next@15, react@19, tailwindcss@4
│   ├── next.config.ts           # output: 'standalone'
│   ├── src/app/                 # App Router: login, (dash)/{page,inbox,library,health,finance,agents}
│   ├── src/components/          # ui/ (Widgets, Cards, Badge, ...), layout/ (Sidebar, Topbar)
│   ├── src/jarvis/              # Team Gamma: Overlay, useJarvisSocket, useSpeech, JarvisProvider
│   ├── src/lib/                 # api.ts (fetch-Wrapper), auth.ts (Cookie-HMAC-Verify für middleware)
│   ├── src/middleware.ts        # Auth-Gate (Edge, Web-Crypto-HMAC)
│   └── public/brand/            # Logo/Maskottchen (aus docs/brand/ kopiert)
├── backend/                     # Team Beta (+ Gamma für app/jarvis/)
│   ├── Dockerfile
│   ├── requirements.txt         # fastapi, uvicorn[standard], sqlmodel, aiosqlite, httpx, anthropic, apscheduler, psutil, feedparser, python-dotenv, itsdangerous
│   ├── app/main.py              # FastAPI-App, Router-Mounts, Lifespan (DB-Init+Seed, Scheduler)
│   ├── app/config.py            # Env-Parsing (Pydantic Settings), alle Vars aus §7
│   ├── app/db.py                # SQLModel-Engine (/data/aos.db), Session-Dependency
│   ├── app/models.py            # Tabellen aus §6
│   ├── app/seed.py              # Demo-Seeds (deutsch, realistisch, source="demo")
│   ├── app/auth.py              # Login/Cookie-HMAC (itsdangerous), require_auth-Dependency
│   ├── app/routers/             # auth, dashboard, inbox, library, health, finance, agents, notifications
│   ├── app/adapters/            # stripe_adapter, brevo_adapter, scanner_adapter, host_adapter (je is_live() + Demo-Fallback)
│   ├── app/services/            # ai.py (Anthropic-Client), healthcheck.py, scheduler.py (APScheduler Europe/Berlin)
│   ├── app/jarvis/              # Team Gamma: ws.py (Endpoint), brain.py (Anthropic-Streaming+Tools), tools.py
│   └── tests/                   # pytest: auth, inbox, adapters-demo-mode, jarvis-tools
├── mcp/                         # Team Beta
│   ├── common/mcp_server.py     # Mini-MCP-Framework (JSON-RPC 2.0 über HTTP POST /)
│   ├── common/Dockerfile        # EIN gemeinsames Image, AGENT_MODULE per Env
│   ├── common/requirements.txt
│   ├── research_agent/agent.py
│   ├── leadscore_agent/agent.py
│   ├── competitor_agent/agent.py
│   └── debrief_agent/agent.py
└── deploy/                      # Team Delta
    ├── docker-compose.aos.yml   # Compose-Projekt "aos", joint deployment_default (external)
    ├── aos.env.example
    └── server-setup.md          # Erst-Deploy-Runbook (inkl. Swap, /opt/aos-Clone)
.github/workflows/deploy-aos.yml # Team Delta: CI-Deploy (Muster: deploy.yml)
deployment/Caddyfile             # Team Delta: NUR aos-Vhost-Block ANHÄNGEN (nichts Bestehendes ändern!)
deployment/dns-records.md        # Team Delta: aos-A/AAAA-Record-Zeile ergänzen
```

## 2. Services, Ports, Netz

| Container | Port (intern) | Image-Basis | mem_limit | Zweck |
|---|---|---|---|---|
| `aos-frontend` | 3100 | node:22-alpine (standalone) | 256m | Next.js UI |
| `aos-backend` | 8100 | python:3.12-slim | 512m | FastAPI + WS + Scheduler |
| `aos-mcp-research` | 8101 | python:3.12-slim (common) | 128m | Research & Content |
| `aos-mcp-leadscore` | 8102 | " | 128m | Lead-Scoring |
| `aos-mcp-competitor` | 8103 | " | 128m | Competitor & Trend |
| `aos-mcp-debrief` | 8104 | " | 128m | Daily Debriefing |

- Compose-Projekt: `aos` (`docker compose -p aos -f docker-compose.aos.yml`). **Keine Host-Port-Mappings auf dem Server** (Caddy proxyt intern). Lokal (Dev): `127.0.0.1:4900→3100`, `127.0.0.1:4901→8100` via `docker-compose.override`-Beispiel im README.
- Netzwerke: eigenes `aos_internal` (default) **plus** externes `deployment_default` NUR für `aos-frontend` + `aos-backend` (Caddy-Erreichbarkeit; Backend erreicht `bfsg-app:8080`). MCP-Container hängen NUR in `aos_internal`.
- Volume: `aos_data` → `/data` (aos.db) am Backend.
- Jeder Container: `restart: unless-stopped`, Healthcheck auf eigenen `/healthz` (Frontend: `/api/ping` via node-fetch auf localhost:3100).

## 3. Design-System (Team Alpha — verbindliche Tokens)

- **Stil:** Brutalistisch, hochfunktional: sichtbares Grid, 1–2px harte Borders, Ecken max. 4px, UPPERCASE-Micro-Labels (tracking-wide), Monospace für Zahlen/KPIs, keine Verläufe, keine Glassmorphism-Effekte.
- **Farb-Tokens (CSS-Custom-Properties in globals.css):**
  - `--bg: #0A0A0B` (Onyx) · `--surface: #121214` · `--surface-2: #1A1A1D` · `--border: #26262B`
  - `--accent: #FFD600` (**Signalgelb** — ALLE primären CTAs, aktive Agenten-Status, Warn-Badges, wichtige KPI-Zahlen) · `--accent-hover: #FFE14D` · Text auf Gelb: `#0A0A0B`
  - `--text: #F4F4F5` · `--muted: #A1A1AA` · `--ok: #4ADE80` · `--err: #F87171`
- **Schrift:** System-Stack + `ui-monospace` für Zahlen (kein Google-Fonts-CDN — self-host oder System).
- **Maskottchen:** `public/brand/bfsg-fuchs-mascot-final.png` (Sidebar-Footer klein + Login-Seite groß + Jarvis-Avatar), `bfsg-fuchs-wordmark.svg` (Topbar), `bfsg-fuchs-favicon-mono.svg` (Favicon). Professionell, dezent — kein Comic-Overload.
- **Dashboard-Home:** Drag-and-Drop-Widget-Grid via `react-grid-layout` (Layout in localStorage persistiert, Reset-Button). Widgets: KPI-Kacheln (Umsatz 30d, offene Anfragen, Leads heute, System-Status), Health-Mini-Monitor, Inbox-Preview (Top 5 nach KI-Priorität), Lead-Feed, Agenten-Status, Umsatz-Sparkline.
- **A11y (Dogfooding! Wir sind eine Barrierefreiheits-Firma):** Fokus-Ringe (2px Gelb), aria-Labels, Tastatur-Navigation, Kontrast AA erfüllt (Gelb #FFD600 auf #0A0A0B = ~13:1 ✓).

## 4. Backend-API-Kontrakt (alle JSON; Auth: Cookie `aos_session` ODER `Authorization: Bearer <AOS_ADMIN_TOKEN>`)

Unauth: `GET /healthz` → `{"ok":true,"service":"aos-backend","version":"1.0.0"}` · `POST /api/auth/login`.

| Endpoint | Antwort-Shape (Kern) |
|---|---|
| `POST /api/auth/login` `{token}` | 200 `{ok:true}` + Set-Cookie (HttpOnly, Secure, SameSite=Lax, 7d) · 401 `{detail}` |
| `POST /api/auth/logout` | Cookie löschen |
| `GET /api/auth/me` | `{authenticated:true}` |
| `GET /api/dashboard/summary` | `{revenue_30d_eur, revenue_source, open_inbox, leads_today, services_ok, services_total, agent_runs_today, notifications_unread, sparkline_30d:[{date,eur}]}` |
| `GET /api/inbox?status=&priority=` | `{items:[{id,subject,sender,channel,preview,priority(1-5),priority_reason,status(open/drafted/replied/closed),created_at,source}]}` |
| `GET /api/inbox/{id}` | Item + `{body, draft}` |
| `POST /api/inbox/{id}/draft` | KI-Antwortentwurf → `{draft, model}` (speichert draft am Item, Status→drafted) |
| `PATCH /api/inbox/{id}` `{status}` | aktualisiertes Item |
| `GET /api/library?q=&category=` | `{items:[{id,title,category(linkedin/case-study/audit-template/sonstiges),tags:[],preview,updated_at}]}` (SQLite LIKE-Suche über title+body+tags) |
| `GET/POST/PUT /api/library[/{id}]` | CRUD, Felder: `{title,category,tags,body_md}` |
| `GET /api/health/services` | `{services:[{key,name,url,ok,latency_ms,checked_at,detail}]}` — Checks: scan-engine(`http://app:8080/health`), landing(`http://landing-next:3000/`), admin(`http://admin-next:3001/`), public(`https://bfsg-fuchs.de/health`), mcp-research/leadscore/competitor/debrief(`http://aos-mcp-*:810x/healthz`), aos-backend(self) |
| `GET /api/health/host` | `{cpu_pct,mem_used_mb,mem_total_mb,disk_used_pct,containers:[{name,status,mem_mb}]|null}` (containers nur bei AOS_DOCKER_SOCK=true) |
| `GET /api/health/history?service=&hours=24` | `{points:[{ts,ok,latency_ms}]}` (health_checks-Tabelle, Scheduler schreibt alle 60s) |
| `GET /api/finance/summary` | `{gross_30d,net_30d,fees_30d,mrr,active_subs,refund_rate_pct,by_package:[{name,count,eur}],source(stripe/demo)}` |
| `GET /api/finance/invoices?limit=50` | `{invoices:[{id,date,amount_eur,package,status,customer_masked}]}` (E-Mails maskieren: `m***@firma.de`) |
| `GET /api/finance/thresholds` | `{kleinunternehmer:{limit_prev_year:25000,limit_current_year:100000,ytd_revenue,pct_used,projected_year_end,warn:bool}}` |
| `GET /api/agents` | `{agents:[{key,name,description,schedule_human,last_run:{ts,ok,summary}|null,enabled}]}` (keys: research/leadscore/competitor/debrief) |
| `POST /api/agents/{key}/run` | startet Run (Backend ruft MCP-Service via JSON-RPC `tools/call`), 202 `{run_id}` |
| `GET /api/agents/{key}/results?limit=20` | `{runs:[{id,started_at,finished_at,ok,summary,output_md}]}` |
| `GET /api/notifications?unread=true` | `{items:[{id,ts,level(info/warn/lead),title,body,read}]}` |
| `POST /api/notifications/read` `{ids:[]}` | `{ok:true}` |

**Fehler:** immer `{"detail": "..."}` mit passendem HTTP-Code. **Adapters:** ohne Key/Erreichbarkeit → Demo-Daten mit `source:"demo"`; Frontend zeigt dann gelbes „DEMO"-Badge.

## 5. Jarvis (Team Gamma) — WS-Protokoll `/ws/jarvis`

Auth über Cookie beim Upgrade (Backend prüft, sonst Close 4401). JSON-Messages:

```
Client→Server: {"type":"user_text","text":"...","context":{"route":"/inbox","screen_summary":"Inbox, 7 offene Anfragen, Filter: alle"}}
               {"type":"cancel"}
Server→Client: {"type":"assistant_delta","text":"..."}          # Streaming-Text
               {"type":"ui_action","action":"navigate","params":{"route":"/finance"}}
               {"type":"ui_action","action":"run_agent","params":{"key":"debrief"}}
               {"type":"done","full_text":"..."}
               {"type":"error","detail":"..."}
```

- **brain.py:** Anthropic Messages-API-Streaming, Modell `AOS_MODEL_JARVIS` (Default `claude-sonnet-4-6`), max_tokens 1024, System-Prompt deutsch („Du bist Jarvis, das Betriebssystem des BFSG-Fuchs-Dashboards…", kennt Modul-Routen, MUSS UWG-No-Gos beachten). Tools (Anthropic tool use): `navigate(route)`, `get_dashboard_summary()`, `get_health()`, `get_finance_summary()`, `search_library(q)`, `run_agent(key)`, `draft_inbox_reply(inbox_id)`. Tool-Ausführung serverseitig gegen interne Services (direkte Funktionsaufrufe, kein HTTP-Loopback), Ergebnis zurück in den Modell-Loop; `navigate`/`run_agent` zusätzlich als `ui_action` an den Client.
- **Ohne ANTHROPIC_API_KEY:** Regelbasierter Fallback (Keyword-Routing „öffne/zeige X" → navigate, „debriefing" → run_agent) + Hinweis-Text „KI-Modus inaktiv (kein API-Key)".
- **Frontend-Voice:** Web Speech API — `SpeechRecognition` (lang `de-DE`, continuous=false, interimResults=true) + `speechSynthesis` (deutsche Stimme, Antworten ≤ 2 Sätze vorlesen wenn Voice-Modus aktiv). Feature-Detection: ohne Support → Text-Only + Hinweis. Overlay: Floating-Action-Button (Fuchs-Avatar, gelber Puls bei Listening) + `Strg+K`. Context-aware: JarvisProvider sammelt route + je Seite registrierte `screen_summary`.

## 6. DB-Schema (SQLModel, SQLite `/data/aos.db`)

`inbox_items(id, subject, sender, channel[email/form/support], body, preview, priority int, priority_reason, status, draft, source[demo/live], created_at, updated_at)`
`library_assets(id, title, category, tags_json, body_md, source, created_at, updated_at)`
`health_checks(id, service_key, ok bool, latency_ms int, detail, ts)` (Index auf service_key+ts; Aufbewahrung 7 Tage, Scheduler räumt auf)
`agent_runs(id, agent_key, started_at, finished_at, ok bool, summary, output_md, trigger[schedule/manual])`
`notifications(id, ts, level, title, body, read bool)`
`finance_cache(id, key unique, payload_json, fetched_at)` (Stripe-TTL-Cache 10 min)

## 7. Environment-Variablen (SSOT — `aos/deploy/aos.env.example`)

```
AOS_ADMIN_TOKEN=            # Login-Token (Server: wird beim Erst-Deploy generiert)
AOS_SESSION_SECRET=         # HMAC-Secret für Session-Cookies (generiert)
ANTHROPIC_API_KEY=          # aus Server-.env vorhanden
AOS_MODEL_JARVIS=claude-sonnet-4-6
AOS_MODEL_AGENTS=claude-sonnet-4-6
PERPLEXITY_API_KEY=         # optional (Research-Agent); leer = Anthropic-only
STRIPE_SECRET_KEY=          # aus Server-.env (rk_live, read-only Nutzung!)
BREVO_API_KEY=              # aus Server-.env
ADMIN_EMAIL=                # Owner-Mail für Lead-/Debrief-Benachrichtigungen
SCANNER_BASE_URL=http://app:8080
SCANNER_ADMIN_TOKEN=        # = ADMIN_TOKEN der Scan-Engine (für /admin/*-Daten)
PUBLIC_HEALTH_URL=https://bfsg-fuchs.de/health
AOS_DOCKER_SOCK=false       # true nur auf Server (Container-Übersicht)
AOS_BASE_URL=https://aos.bfsg-fuchs.de
MCP_RESEARCH_URL=http://aos-mcp-research:8101
MCP_LEADSCORE_URL=http://aos-mcp-leadscore:8102
MCP_COMPETITOR_URL=http://aos-mcp-competitor:8103
MCP_DEBRIEF_URL=http://aos-mcp-debrief:8104
TZ=Europe/Berlin
```

Frontend braucht zur Laufzeit KEINE davon (same-origin `/api`-Calls via Caddy); `src/middleware.ts` erhält `AOS_SESSION_SECRET` als Env im Compose.

## 8. MCP-Microservices (Team Beta)

`common/mcp_server.py`: FastAPI-App-Factory `create_mcp_app(name, tools: dict[str, ToolDef])`; `POST /` verarbeitet JSON-RPC 2.0 (`initialize` → `{protocolVersion:"2025-06-18",serverInfo,capabilities:{tools:{}}}`, `tools/list`, `tools/call`), `GET /healthz`. Kein Auth intern (nur `aos_internal`-Netz).

| Agent | Tools | Logik |
|---|---|---|
| research (8101) | `research_topic(query)`, `generate_linkedin_post(topic)` | Perplexity-API wenn Key, sonst Anthropic; Post-Entwurf (Hook+Body+CTA, deutsch, UWG-sicher: NIE „konform/rechtssicher/garantiert") → via Backend-Callback `POST /api/library` (interner Call vom Backend-Scheduler aus — MCP liefert nur Ergebnis zurück) |
| leadscore (8102) | `score_leads()` | holt Scan-/Bestell-Daten (Backend übergibt Daten im Call-Argument), Score 1-100 (Kritikalität der A11y-Mängel × Firmengröße-Heuristik aus Domain), Ergebnis-Liste mit Begründung |
| competitor (8103) | `trend_summary()` | feedparser über öffentliche RSS (heise.de RSS, t3n RSS, Google-News-RSS `barrierefreiheit+BFSG`), Anthropic-Zusammenfassung: 5 Trends + je 1 Konter-Strategie. KEIN LinkedIn-Scraping (rechtlich untersagt) |
| debrief (8104) | `daily_debrief(kpis)` | erhält KPI-JSON vom Backend, formuliert deutsches Morgen-/Abend-Briefing (max. 150 Wörter, vorlesbar) |

**Orchestrierung:** Backend-`scheduler.py` (APScheduler, TZ Europe/Berlin): research Mo 08:00 · leadscore */30min · competitor täglich 07:30 · debrief 08:00+18:00 · healthchecks */60s · cleanup 03:00. Jeder Run → `agent_runs`-Zeile + ggf. `notifications` + Brevo-Mail an ADMIN_EMAIL (nur leadscore-Treffer ≥80 + debrief; Brevo-Adapter, transactional).

## 9. Caddy-Vhost (Team Delta — an bestehendes Caddyfile ANHÄNGEN)

```
aos.bfsg-fuchs.de {
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        Permissions-Policy "microphone=(self), geolocation=(), camera=()"   # Mikro für Jarvis ERLAUBEN
        X-Frame-Options "DENY"
        Referrer-Policy "no-referrer"
        -Server
    }
    handle /api/* { reverse_proxy aos-backend:8100 }
    handle /ws/*  { reverse_proxy aos-backend:8100 }
    handle /healthz { reverse_proxy aos-backend:8100 }
    handle        { reverse_proxy aos-frontend:3100 }
    log { output stdout format console level INFO }
}
```

(CSP bewusst weggelassen — Next.js inline-Scripts; Auth schützt alles. `aos-frontend`/`aos-backend` sind via `deployment_default` erreichbar.)

## 10. Deploy (Team Delta)

- **CI:** `.github/workflows/deploy-aos.yml` — `on: push: branches:[main] paths:['aos/**','.github/workflows/deploy-aos.yml']` + `workflow_dispatch`. SSH (appleboy, Muster deploy.yml inkl. chage-Fix + `request_pty`): `/opt/aos` = eigener Clone des Repos (falls fehlt: `git clone`, sonst `git fetch && git reset --hard origin/main`); `.env`-Bootstrap: fehlende Werte aus `/opt/bfsg-check/deployment/.env` übernehmen (STRIPE_SECRET_KEY, BREVO_API_KEY, ANTHROPIC_API_KEY, ADMIN_EMAIL, ADMIN_TOKEN→SCANNER_ADMIN_TOKEN), `AOS_ADMIN_TOKEN`/`AOS_SESSION_SECRET` nur beim ersten Mal generieren (`openssl rand -hex 24`), niemals überschreiben; dann `docker compose -p aos -f aos/deploy/docker-compose.aos.yml up -d --build`, Healthchecks, `docker compose -p deployment ... exec caddy caddy reload` NICHT nötig (Caddyfile-Änderung deployt der bestehende deploy.yml-Flow).
- **Swap-Sicherung (Erst-Deploy, idempotent):** 2G-Swapfile (`/swapfile`, swappiness 10) — schützt die Live-SaaS vor OOM durch den Zusatz-Stack.
- **DNS (einzige Owner-Aktion):** INWX → `bfsg-fuchs.de` → A `aos` → `178.105.83.0` (+ AAAA `2a01:4f8:1c18:d890::1`). In `dns-records.md` dokumentieren.
- **Erst-Deploy in DIESER Session:** per SSH vom Branch (Clone /opt/aos auf Branch `worktree-aos-dashboard`), damit das System sofort läuft; CI übernimmt ab Merge.

## 11. Qualitäts-Gates (jedes Team verifiziert selbst)

1. Frontend: `npm install && npm run build` fehlerfrei (Node 24 lokal ok, Ziel node:22-alpine).
2. Backend/MCP: `python -m compileall` + pytest-Suite grün (venv lokal; Windows-kompatible Deps).
3. Keine Secrets im Code/Repo. Keine `console.log`-Debug-Leichen. Deutsche Umlaute korrekt.
4. Alle API-Shapes exakt wie §4 (Frontend und Backend werden unabhängig gebaut!).
5. Docker-Builds erfolgen auf dem Server (lokal kein Docker) — Dockerfiles müssen ohne lokalen Test korrekt sein: multi-stage, `--frozen-lockfile`/`--no-cache-dir`, non-root User wo möglich.
