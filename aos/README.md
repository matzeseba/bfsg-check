# AOS — BFSG-Fuchs Business-Dashboard

Internes Betriebssystem-Dashboard für BFSG-Fuchs: Inbox mit KI-Priorisierung,
Content-Bibliothek, Health-Monitoring des Live-Stacks, Finanz-Übersicht,
autonome Agenten (Research/Lead-Scoring/Competitor/Debrief) und der
Sprach-Assistent **Jarvis**.

> **Verbindlicher Vertrag:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) (Ports, API-Shapes,
> Env-Namen, Design-Tokens). Diese README beschreibt nur Quickstart & Betrieb.

---

## Architektur-Überblick (Kurzfassung)

| Baustein | Technik | Port | Zweck |
|---|---|---|---|
| `aos-frontend` | Next.js 15 / React 19 (standalone) | 3100 | UI (brutalistisch, Signalgelb, A11y-first) |
| `aos-backend` | FastAPI + SQLModel/SQLite + APScheduler | 8100 | API, WebSocket (Jarvis), Scheduler |
| `aos-mcp-research` | Mini-MCP (JSON-RPC) | 8101 | Research & LinkedIn-Post-Entwürfe |
| `aos-mcp-leadscore` | " | 8102 | Lead-Scoring (1–100) |
| `aos-mcp-competitor` | " | 8103 | Trend-Zusammenfassung (öffentliche RSS) |
| `aos-mcp-debrief` | " | 8104 | Tägliches Briefing |

Datenfluss: Frontend spricht **same-origin** `/api` + `/ws` (Caddy proxyt zum
Backend). Adapter (Stripe/Brevo/Scanner/Host) liefern ohne Key/Erreichbarkeit
**Demo-Daten** (`source:"demo"`, gelbes DEMO-Badge im UI). Details: `ARCHITECTURE.md`.

---

## Quickstart lokal (ohne Docker)

Node 24 + Python 3.12+ vorausgesetzt. Drei Terminals (Backend, MCP, Frontend).

### 1. Backend (FastAPI, Port 8100)

```bash
cd aos/backend
python -m venv .venv
# Windows:  .venv\Scripts\activate       Linux/macOS:  source .venv/bin/activate
pip install -r requirements.txt
cp ../deploy/aos.env.example .env        # Werte eintragen (leer = Demo-Modus)
uvicorn app.main:app --host 0.0.0.0 --port 8100 --reload
# Check:  curl http://localhost:8100/healthz
```

Ohne `ANTHROPIC_API_KEY`/`STRIPE_SECRET_KEY` etc. läuft alles im Demo-Modus —
kein Key nötig zum Ausprobieren.

### 2. MCP-Agenten (optional lokal, Ports 8101–8104)

Jeder Agent ist dasselbe Framework mit unterschiedlichem `AGENT_MODULE`:

```bash
cd aos/mcp
python -m venv .venv && source .venv/bin/activate   # bzw. .venv\Scripts\activate
pip install -r common/requirements.txt
# Beispiel Research-Agent:
AGENT_MODULE=research_agent AGENT_PORT=8101 uvicorn common.mcp_server:app --port 8101
```

(In der Praxis lokal meist nicht nötig — das Backend fällt ohne erreichbare MCP
auf Demo-Ausgaben zurück.)

### 3. Frontend (Next.js, Port 3100)

```bash
cd aos/frontend
npm install
# same-origin /api im Dev via Next-Proxy auf localhost:8100 (siehe next.config.ts)
npm run dev -- --port 3100
# Browser:  http://localhost:3100
```

---

## Quickstart lokal (mit Docker)

```bash
cd aos/deploy
cp aos.env.example .env        # Werte eintragen
docker compose -p aos -f docker-compose.aos.yml up -d --build
```

Für erreichbare Ports auf `127.0.0.1` (Dev) eine `docker-compose.override.yml`
neben die Compose-Datei legen — **nur lokal**, nie auf den Server:

```yaml
# aos/deploy/docker-compose.override.yml  (Dev-only, gitignore empfohlen)
services:
  aos-frontend:
    ports:
      - "127.0.0.1:4900:3100"
  aos-backend:
    ports:
      - "127.0.0.1:4901:8100"
```

Dann: `http://127.0.0.1:4900` (UI) · `http://127.0.0.1:4901/healthz` (API).

---

## Betrieb (Server)

Alle Befehle auf dem Hetzner-Server unter `/opt/aos`. Compose-Projekt: **`aos`**.

```bash
CF="-p aos -f /opt/aos/aos/deploy/docker-compose.aos.yml"

# Logs (folgen):
docker compose $CF logs -f aos-backend
docker compose $CF logs -f aos-frontend aos-mcp-research

# Status / Health:
docker compose $CF ps
docker exec aos-backend python -c "import urllib.request;print(urllib.request.urlopen('http://localhost:8100/healthz',timeout=5).read().decode())"

# Neustart einzelner Dienste bzw. gesamter Stack:
docker compose $CF restart aos-backend
docker compose $CF -f /opt/aos/aos/deploy/docker-compose.aos.yml up -d --build

# Env ändern:
nano /opt/aos/aos/deploy/.env          # z.B. neues Modell, PERPLEXITY_API_KEY
docker compose $CF up -d                # Container mit neuem Env neu erstellen

# Stoppen (Daten bleiben) / mit Daten (SQLite löschen):
docker compose $CF down
docker compose $CF down -v
```

Erst-Deploy, Swap-Setup und Rollback: siehe [`deploy/server-setup.md`](./deploy/server-setup.md).

---

## Owner-Aktionen (manuell, einmalig)

1. **DNS-Record setzen** (INWX, Zone **`bfsg-fuchs.de`**, nicht `bfsg-fix.de`):

   | Typ | Host | Wert |
   |---|---|---|
   | A | `aos` | `178.105.83.0` |
   | AAAA | `aos` | `2a01:4f8:1c18:d890::1` |

   Details: `deployment/dns-records.md` → Abschnitt „AOS-Dashboard".

2. **PR mergen** → aktiviert CI (`.github/workflows/deploy-aos.yml`): ab dann
   deployt jeder `aos/**`-Push automatisch. Der Caddy-Vhost
   (`aos.bfsg-fuchs.de`) rollt der bestehende `deploy.yml`-Flow aus
   (`deployment/**`-Pfad).

3. **Login-Token abrufen** (nach Erst-Deploy):
   `grep AOS_ADMIN_TOKEN /opt/aos/aos/deploy/.env` — das ist das Login-Passwort.

---

## Sicherheit / Recht

- Keine Secrets im Repo — nur `aos.env.example` (Platzhalter). Server-`.env` mit `chmod 600`.
- Generierte Texte: **kein** „BFSG-konform / rechtssicher / garantiert" (UWG §5).
- **Kein** LinkedIn-Scraping (Competitor-Agent nutzt nur öffentliche RSS).
- Kein Auto-Publish — LinkedIn-Posts/Mails werden nur als Entwurf gespeichert.
