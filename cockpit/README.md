# BFSG-OS Cockpit — Lokale Betriebsanleitung

> **Nur lokal.** Dieses Backend bindet ausschliesslich auf `127.0.0.1`. Es darf NICHT
> auf den Prod-Server (bfsg-fix.de / Hetzner) deployed werden und NICHT in `admin-next/`
> eingebaut werden. Details: `ARCHITECTURE.md`, `docs/ai-os-research/04-hosting-und-security.md`.

---

## Voraussetzungen

| Anforderung | Mindestversion | Prüfen |
|---|---|---|
| Node.js | 20 LTS | `node --version` |
| claude-CLI | aktuell (Abo-Auth) | `claude --version` |
| claude eingeloggt | — | `claude -p "test"` einmalig ausführen |
| Git Bash / PowerShell | — | wird für `npm`-Befehle genutzt |

Die `claude`-CLI muss **lokal eingeloggt** sein (Max/Pro-Abo, OAuth). Kein API-Key nötig —
das Backend ruft `claude -p` als Child-Prozess auf und erbt deine bestehende Auth.

---

## Schnellstart (5 Minuten)

### 1. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Dann `.env` im Editor öffnen und befüllen:

| Variable | Pflicht | Wert |
|---|---|---|
| `STRIPE_API_KEY` | empfohlen | Restricted Read-Key (`rk_live_...`) — NUR Lese-Rechte |
| `ADMIN_TOKEN` | optional | Token für `bfsg-fix.de/admin/orders` |
| `GITHUB_TOKEN` | optional | GitHub PAT mit `repo:read` + `actions:read` |
| `GOOGLE_ADS_*` | optional | Alle 5 Felder nötig für Live-Ads-Daten |
| Rest | — | Defaults aus `.env.example` übernehmen |

Alle Felder sind optional — fehlt ein Wert, zeigt das Panel "nicht konfiguriert" und
das Cockpit startet trotzdem.

### 2. Abhängigkeiten installieren

```bash
cd cockpit
npm install
```

### 3. Backend starten

```bash
npm start
# oder mit Auto-Reload während der Entwicklung:
npm run dev
```

Das Backend läuft dann auf `http://127.0.0.1:4317`.
Health-Check: `curl http://127.0.0.1:4317/api/health`

### 4. Frontend starten (cockpit-ui)

In einem zweiten Terminal:

```bash
cd cockpit-ui
npm install
npm run dev
```

Frontend öffnet sich unter `http://localhost:3017`.

### 5. Voice-Server starten (optional)

Voice erfordert lokal laufende STT- und TTS-Server. Start-Skripte unter `scripts/voice/`:

```bash
# Schnelles-Whisper-Server (STT) auf Port 5301
bash scripts/voice/start-whisper.sh

# Piper TTS-Server auf Port 5302
bash scripts/voice/start-piper.sh

# Wake-Word-Daemon (optional, immer-aktiv)
bash scripts/voice/start-wakeword.sh
```

Voice kann über `VOICE_ENABLED=false` in `.env` komplett deaktiviert werden.

---

## Scheduler (automatische Jobs)

Der lokale Scheduler startet automatisch mit dem Backend und läuft **ohne externen Cron**.
Standard-Jobs:

| Job | Wann | Action | ENV-Override |
|---|---|---|---|
| Tagescheck (A01) | Täglich 08:00 Uhr | Server-Health + Sales 24h | `SCHEDULER_DAILY_HOUR=8` |
| Wochenreport (A02) | Montags 09:00 Uhr | MRR, Ads-CPA, KPIs | `SCHEDULER_WEEKLY_DAY=1` + `SCHEDULER_WEEKLY_HOUR=9` |

**Catch-up-Logik:** Wenn der PC zur geplanten Zeit aus war, holt der Scheduler den Job
beim nächsten Start nach — einmalig, nicht mehrfach. Das Catch-up-Fenster ist 16 Stunden
(überschreibbar: `SCHEDULER_CATCHUP_MAX_HOURS=16`).

Logs: `cockpit/out/scheduler.jsonl` (append-only, je Lauf eine JSON-Zeile).

ENV-Übersicht für den Scheduler:

```
SCHEDULER_DAILY_HOUR=8        # Stunde des Tageschecks (0-23)
SCHEDULER_WEEKLY_DAY=1        # Wochentag Report (0=So, 1=Mo, ..., 6=Sa)
SCHEDULER_WEEKLY_HOUR=9       # Stunde des Wochenreports (0-23)
SCHEDULER_CATCHUP_MAX_HOURS=16 # Max. Catch-up-Fenster in Stunden
SCHEDULER_TICK_MS=60000       # Prüf-Intervall in ms (Standard: 60 s)
```

---

## Ports im Überblick

| Dienst | Port | Beschreibung |
|---|---|---|
| Backend (Express + WS) | `127.0.0.1:4317` | Dieses Backend |
| Frontend (Next.js) | `127.0.0.1:3017` | cockpit-ui |
| STT (faster-whisper) | `127.0.0.1:5301` | Sprache → Text |
| TTS (Piper) | `127.0.0.1:5302` | Text → Sprache |

Alle Dienste binden auf `127.0.0.1` — kein einziger Port ist nach aussen sichtbar.

---

## Output-Dateien

Alle Outputs landen in `cockpit/out/` (gitignored):

| Datei | Inhalt |
|---|---|
| `scheduler.jsonl` | Lauf-Protokoll des Schedulers (append-only) |
| `cockpit-jobs.jsonl` | Kompakte Job-Zusammenfassungen (append-only) |
| `cockpit-actions.jsonl` | Vollständiger Audit-Trail aller Aktionen (append-only) |
| `kpi-cache.json` | Letzter KPI-Snapshot (überschrieben je Refresh) |

---

## Sicherheits-Hinweise (Pflicht-Lektüre)

### Binding: nur 127.0.0.1

Das Backend bindet hartcodiert auf `127.0.0.1`. Ändere das NICHT auf `0.0.0.0`.
Kein Reverse-Proxy (Nginx/Caddy) vor diesem Backend schalten, der es nach aussen exponiert.

### Stripe-Key: immer Restricted Read-Key

Verwende **niemals** den vollen Stripe-Secret-Key (`sk_live_...`) oder den vollständigen
Restricted-Key mit Schreib-Rechten. Erstelle in der Stripe-Konsole einen eigenen
Restricted-Key mit **ausschliesslich Lese-Berechtigungen** (`charges:read`, `customers:read`).

Anleitung:
1. Stripe-Dashboard → Entwickler → API-Schlüssel → Restricted Keys
2. „Neuen Restricted Key erstellen"
3. Nur lesen erlauben: Charges, Customers, Subscriptions
4. Key beginnt mit `rk_live_...`

### Kein Deployen auf Prod-Server

Dieses Cockpit darf **nicht** auf bfsg-fix.de oder einen anderen öffentlich erreichbaren
Server deployed werden. Begründung: Claude-Code-Steuerung über ein Web-Interface ist
technisch eine RCE-Oberfläche (CVE-2026-31975, CVSS 8.7). Auf dem Prod-Server liegen
Stripe-Live-Keys und Kundendaten — ein Angriff auf das Cockpit würde alles kompromittieren.

Referenz: `docs/ai-os-research/04-hosting-und-security.md` → Abschnitt 2.1 und 2.2.

### Kein Einbau in admin-next/

`admin-next/` ist das öffentlich deployte Admin-Dashboard. Das Cockpit-Backend darf nicht
als Teil davon deployt werden. Beide Systeme sind bewusst getrennt.

### .env niemals committen

Die `.env`-Datei ist in `.gitignore` eingetragen. Nie manuell zu Git hinzufügen.
Secrets-Rotation: Wenn ein Key versehentlich in Chat oder Git landet, sofort in der
jeweiligen Konsole rotieren (Stripe, GitHub, Google Ads).

### Live-Aktionen erfordern Bestätigung

Jobs der Kategorie `live` (Refunds, Incident-Rollback, Backup-Restore) warten im
Status `awaiting_approval` und fahren erst nach explizitem Approve fort.
Endpoint: `POST /api/jobs/:id/approve`

---

## Entwicklung

```bash
# Syntax-Check aller Src-Dateien (kein node_modules benötigt)
node --check src/server.js
node --check src/scheduler.js

# Backend mit Auto-Reload
npm run dev

# Direkter Scheduler-Test (ohne vollständiges Server-Start)
node -e "import('./src/scheduler.js').then(m => { m.startScheduler(); setTimeout(() => m.stopScheduler(), 5000); })"
```

---

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| `claude`-CLI nicht gefunden | `npm install -g @anthropic-ai/claude-code` + neu einloggen |
| Port 4317 belegt | `COCKPIT_PORT=4318` in `.env` setzen |
| Stripe-Connector zeigt "not configured" | `STRIPE_API_KEY=rk_live_...` in `.env` eintragen |
| Jobs starten aber schlagen sofort fehl | `claude -p "test"` manuell ausführen — Auth prüfen |
| Scheduler startet keinen Catch-up | PC war zu lange aus (> CATCHUP_MAX_HOURS) oder Job lief bereits heute |
| Voice-STT antwortet nicht | `scripts/voice/start-whisper.sh` muss laufen + Port 5301 frei sein |
