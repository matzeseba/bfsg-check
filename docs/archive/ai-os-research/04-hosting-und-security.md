# Hosting & Security: AI-OS / Jarvis-Cockpit auf Basis von Claude Code

> Recherche-Agent #4 — Stand: Juni 2026  
> Ziel: Klare, begruendete Hosting-Empfehlung fuer ein Claude-Code-basiertes Business-Cockpit neben einer laufenden Prod-Web-App (bfsg-fix.de, Hetzner CPX22).

---

## Executive Summary (5 Bullets)

1. **Claude Code laeuft headless auf Linux — mit API-Key, nicht mit Subscription-OAuth.** Die offizielle CLI unterstuetzt seit Anfang 2026 explizit VPS/CI-Betrieb via `ANTHROPIC_API_KEY`-Umgebungsvariable. Subscription-OAuth-Token sind fuer automatisierten/Server-Betrieb per ToS verboten und verfallen ohnehin nach 8-12 Stunden. API-Key-Billing ist der einzige valide Weg fuer 24/7-Headless-Betrieb.

2. **Ein Web-Dashboard, das Code ausfuehren kann, ist eine RCE-Oberflaeche — auf dem Prod-Server ein K.O.-Kriterium.** Echte Sicherheitsluecken (CVE-2026-31975 mit CVSS 8.7, Unauthenticated WebSocket Shell Injection) belegen: Claude-Code-UIs auf offentlich erreichbaren Servern sind hochriskant. Stripe-Live-Keys und Kundendaten auf derselben Maschine schliessen Option A (Co-Hosting Prod-Server) aus.

3. **Hosting-Empfehlung: Option D (Hybrid) mit lokalem Windows-PC als primaere Engine.** Claude Code laeuft in WSL2/Docker Desktop auf dem vorhandenen Windows-PC — dort, wo ohnehin entwickelt wird. Ein kleiner Hetzner-Zusatz-Server (CAX11, 5,99 EUR/Monat) uebernimmt nur Scheduled Jobs, Uptime-Monitoring und das Web-Dashboard — strikt hinter Tailscale oder Caddy-Auth, ohne direkten Internetexpose.

4. **Die CPX22 nach dem Juni-2026-Preisschock (19,49 EUR/Monat, +144%) hat bereits jetzt Ressourcenknappheit mit Playwright/Chromium.** Fuer gleichzeitigen Prod-Betrieb UND AI-OS-Engine fehlt RAM (4 GB effektiv bei shared vCPU). Wer den Prod-Server nicht anfassen will — Option B (separater Server CX33 zu 8,49 EUR/Monat) ist die sauberste Loesung.

5. **DSGVO-Anforderung: Agent-Memory darf keine Kundendaten speichern.** Second-Brain-Inhalte muessen vom Stripe/Kundendaten-Scope getrennt bleiben. Bei lokalem Hosting liegt alles auf dem eigenen Rechner (DSGVO-guenstig); bei Server-Hosting ist explizite Datentrennung + Loeschkonzept Pflicht.

---

## 1. Claude Code headless 24/7 (Machbarkeit, Auth, Lizenz)

### 1.1 Technische Machbarkeit

Claude Code ist ein Terminal-basiertes Tool ohne Display-Anforderungen. Es laeuft nativ auf headless Linux-Servern, in Docker-Containern und in CI/CD-Pipelines. Anthropic dokumentiert dies explizit und liefert mit `claude -p "<prompt>"` einen One-Shot-Headless-Modus sowie mit `claude --output-format stream-json` einen maschinenlesbaren Output.

Fuer 24/7-Betrieb werden typischerweise eingesetzt:
- **tmux** oder **screen**: Haelt die Session ueber SSH-Trennungen hinweg am Leben. Ist das Minimum fuer interaktive Nutzung.
- **systemd-Unit**: Fuer vollautomatische, nicht-interaktive Scheduled-Runs (cron-getriggerte Tasks via `claude -p`).
- **Claude Code Channels** (seit Maerz 2026): Erlaubt Telegram/Discord als Frontend fuer Server-seitigen Claude Code Agent.

Ressourcenverbrauch: Claude-Inferenz laeuft auf Anthropic-Servern, nicht lokal. Der lokale Prozess (Node.js-CLI) benoetigt typisch 100-300 MB RAM. CPU-Last minimal, ausser bei MCP-Tool-Ausfuehrung (z.B. Playwright-Scraping).

### 1.2 Authentifizierung: API-Key vs. Subscription-OAuth

| Kriterium | API-Key (`ANTHROPIC_API_KEY`) | Subscription-OAuth (Pro/Max) |
|---|---|---|
| Ablauf | Nie | 8-12 Stunden auf VPS |
| Headless-Tauglichkeit | Voll | Braeuchte Browser-Workaround |
| ToS-Konformitaet | Vollstaendig erlaubt | Nur interaktive CLI-Nutzung |
| Kosten | Pay-per-Token (variabel) | Abo-Flat (Max: 100-200 EUR/Monat) |
| Automation | Explizit erlaubt | Verboten per Commercial Terms |
| Bekannte Probleme | Keine | Token-Refresh-Race (#24317), DC-IP-Blocking (#21678) |

**Fazit**: Fuer Server-Headless-Betrieb gibt es keine Alternative zum API-Key. Subscription-OAuth ist per Anthropic-ToS (Update Februar 2026) explizit verboten fuer automatisierten Betrieb, SDK-Nutzung und Drittanbieter-Dienste.

Kosten-Beispiel (API, Haiku-Modell fuer einfache Tasks, Sonnet fuer komplexe):
- Leichter Monitoring-Agent (5 Calls/Tag): ~1-3 EUR/Monat
- Mittelintensiver Cockpit-Betrieb (50-100 Calls/Tag): ~15-40 EUR/Monat
- Intensiv mit Scraping/Analyse: 50+ EUR/Monat

Zum Vergleich: Claude Max-Abo ist sinnvoll, wenn intensiv interaktiv gearbeitet wird UND gleichzeitig auf dem lokalen Rechner. Auf dem Server ist API-Key das einzig legale Modell.

### 1.3 Lizenz und Nutzungsbedingungen

- **Claude Code CLI selbst**: MIT-lizenziert, kommerziell nutzbar, auch auf Servern.
- **API-Nutzung**: Anthropic Commercial Terms of Service gelten — keine Automation-Beschraenkung, keine Concurrent-Session-Limits (hardware-seitig).
- **Verboten**: OAuth-Token aus Subscription extrahieren und in Dritttools (auch eigene) verwenden, Claude-Output zum Training konkurrierender Modelle nutzen.
- **Erlaubt**: `claude -p` in cron-Jobs, systemd-Units, CI-Pipelines, eigenen Web-Dashboards — solange API-Key-Auth verwendet wird.

---

## 2. Threat-Model & Isolation (RCE-Oberflaeche, Do/Don't)

### 2.1 Das fundamentale Problem: AI-Cockpit = RCE-Surface

Ein Web-Dashboard, das Claude Code steuert, ist technisch identisch mit einer Remote-Code-Execution-Shell. Claude Code selbst hat die Faehigkeit, Dateien zu lesen/schreiben, Bash-Befehle auszufuehren und externe APIs aufzurufen. Wer das Dashboard kontrolliert, kontrolliert den gesamten Server.

**Dokumentierte Sicherheitsluecken in 2026:**

- **CVE-2025-59536 (CVSS 8.7)**: Code Injection durch Hooks in `.claude/settings.json` — beim Oeffnen eines Repositories werden automatisch Shell-Befehle ausgefuehrt.
- **CVE-2026-21852 (CVSS 5.3)**: ANTHROPIC_BASE_URL kann vor Trust-Prompt gesetzt werden → API-Key-Exfiltration an Angreifer-Server moeglich.
- **CVE-2026-31975 (CVSS 8.7)**: `@siteboon/claude-code-ui` — Unauthenticated WebSocket Shell Injection. Standard-JWT-Secret `'claude-ui-dev-secret-change-in-production'` ermoeglicht vollstaendige RCE ohne Login. Drei verkettete Luecken: unsicheres Default-Secret, fehlende DB-Validation im WebSocket, OS-Command-Injection durch String-Interpolation.
- **CVE-2026-39861**: Weitere RCE-Luecke (SentinelOne, Details nicht voll public).

**Lernpunkt**: Ein Claude-Code-UI auf einem oeffentlich erreichbaren Port, auch hinter Passwortschutz, war in mindestens einem Fall durch Standard-Credentials vollstaendig kompromittierbar.

### 2.2 Threat-Model fuer bfsg-fix.de Kontext

```
Angreifer-Ziele auf dem Prod-Server:
├── Stripe Live-Keys (.env) → Finanzbetrug
├── Kundendaten (E-Mails, Scan-URLs) → DSGVO-Verstoß, Erpressung
├── GitHub Deploy-Key → Supply-Chain-Angriff auf alle Kunden
├── Brevo-SMTP-Credentials → Spam-Relaying
└── Server selbst → Cryptomining, Pivot zu weiteren Zielen
```

Wenn das AI-OS-Dashboard auf demselben Server laeuft:
- **Blast Radius eines Angriffs**: Komplett. Ein einziger kompromittierter Dashboard-Zugang bedeutet Zugriff auf alle Secrets.
- **Angriffsvektoren**: Oeffentliches Dashboard-Interface → JWT-Bypass (s.o.), gestohlene Dashboard-Credentials, Prompt-Injection via AI-Antworten, SSRF durch Agent-Tool-Calls.

### 2.3 Do/Don't-Liste (Absolute Regeln)

**DO — Pflicht fuer jeden Hosting-Ansatz:**

- Dashboard NIEMALS ohne Authentifizierung ins Internet exposen. Minimum: Caddy `basicauth` + starkes Passwort. Besser: Tailscale (Zero-Config-VPN, kostenlos bis 100 Devices) oder Cloudflare Access.
- Claude Code-Engine in einem eigenen Docker-Netzwerk (`internal: true`) ohne direkten Internet-Zugang betreiben. Nur Allowlist-Egress ueber Squid-Proxy (api.anthropic.com + was wirklich gebraucht wird).
- AI-OS-Container niemals als root starten. Nicht-Root-User + `--read-only` Filesystem + `--tmpfs /tmp`.
- `ANTHROPIC_API_KEY` und alle anderen Secrets als Umgebungsvariablen zur Laufzeit, nie im Docker-Image eingebaut, nie in volumes die der Agent lesen kann.
- JWT_SECRET fuer Dashboard-UI explizit setzen (min. 64 Zeichen random) — Default-Strings sind CVE-Einladungen.
- Agent-Workspace (Filesystem) vom Rest des Servers isolieren. Nur den einen Workspace-Ordner mounten, kein `/opt/bfsg-check/deployment/` im Scope.
- SSH-Zugang zum AI-OS-Server separate Deploy-Keys ohne Prod-Server-Scope.

**DON'T — Absolute Verbote:**

- Option A (Co-Hosting auf Prod-Server mit Stripe-Keys/Kundendaten) — kategorisch ausschliessen.
- Dashboard auf oeffentlichem Port ohne VPN/Auth betreiben — auch nicht "vorerst".
- Prod-Server `.env` in den Agent-Workspace-Mount einbeziehen.
- `--dangerously-skip-permissions` Flag setzen ohne isoliertes Netzwerk.
- Subscription-OAuth-Token auf Servern verwenden (ToS-Verstoß + sicherheitstechnisch fragwuerdig durch Token-Leakage-Risiko).
- Dashboard-Passwort wiederverwenden (aus einer anderen Anwendung).
- Unbekannte MCP-Server in der Server-Installation aktivieren (jeder MCP-Server erhaelt Tool-Zugriff auf den Agent).

---

## 3. Optionen-Vergleich A/B/C/D

### Optionen-Uebersicht

| Kriterium | A: Prod-Server (CPX22) | B: Eigener Hetzner-Server | C: Lokal Windows-PC | D: Hybrid (Empfehlung) |
|---|---|---|---|---|
| **Sicherheit** | KRITISCH — Stripe-Keys + RCE-Surface auf einem Server | Gut — strenge Isolation moeglich | Sehr gut — kein Internet-Expose noetig | Sehr gut — Engine lokal, nur Dashboard hinter VPN online |
| **Kosten/Monat** | 0 EUR Zusatz (aber CPX22 jetzt 19,49 EUR!) | +5,49-8,49 EUR (CX23/CX33) oder 5,99-10,49 EUR (CAX11/CAX21) | 0 EUR Server (Stromkosten ~1-3 EUR/Monat) | 0 + 5,99 EUR (CAX11 fuer Scheduled Jobs) |
| **Performance** | Problematisch: 4 GB shared RAM + Playwright + AI-OS = OOM-Risiko | Ausreichend: eigene 4-8 GB RAM unbelastet | Gut: voller PC-RAM verfuegbar, schnelle Filesystem-I/O via WSL2 | Optimal: PC fuer Engine (RAM), Server nur Lightweight-Scheduler |
| **24/7-Verfuegbarkeit** | Ja (aber Downtime bringt AI-OS und Prod-App gemeinsam down) | Ja (unabhaengig vom Prod-Server) | Nein: PC kann aus/schlafen/neustarten; keine garantierte Uptime | Teilweise: Scheduled Jobs online (24/7), interaktive Engine lokal (nicht 24/7) |
| **Wartung** | Minimal (ein Server) | Mittel (zwei Server, SSH x2) | Minimal (lokal, kein SSH) | Mittel (PC + ein Mini-Server) |
| **DSGVO** | Heikel — Kundendaten und AI-Memory auf einem Server | Gut — klare Datentrennung, Server in DE | Optimal — Daten verlassen den eigenen PC nicht | Gut — Memory lokal, nur Scheduler online (kein Kundendaten-Scope) |
| **Komfort Solo-Founder** | Schlecht — Sicherheitsrisiko ueberwiegt Komfort-Vorteil | Gut — saubere Trennung, SSH wie gewohnt | Sehr gut — lokaler Zugriff, keine Latenz, IDE direkt | Sehr gut — lokale Entwicklung + automatisierte Online-Jobs |

### Detailanalyse pro Option

**Option A (Gleicher Prod-Server):**
Empfehlung: NICHT umsetzen. Begründung über Sicherheit hinaus: Die CPX22 hat nach dem Preisschock zwar 4 GB RAM, aber als shared vCPU AMD teilt sie sich mit anderen Hetzner-Kunden. Playwright/Chromium-Instanzen fuer den BFSG-Scanner verbrauchen 500 MB bis 2 GB je nach Last. Der AI-OS-Prozess (Node.js + MCP-Server) benoetigt weitere 200-500 MB. Gleichzeitig Caddy (SSL-Terminierung), scanner, landingpage-next, admin-next. Das fuehrt zu OOM-Situationen unter Last und reisst dann sowohl Prod-App als auch AI-OS gemeinsam ab.

**Option B (Separater Hetzner-Server):**
Sinnvoll wenn 24/7-Online-Verfuegbarkeit der AI-Engine gewuenscht. Empfohlene Groesse: **CX33** (4 vCPU, 8 GB RAM, 8,49 EUR/Monat nach Juni-2026-Preisanpassung) oder **CAX21** ARM (4 vCPU, 8 GB RAM, 10,49 EUR/Monat). Die CAX-ARM-Serie ist fuer Node.js-Workloads gut geeignet und war preisguenstiger bis Juni 2026 (jetzt weitgehend gleich). Achtung: Auch dieser Server muss streng abgesichert sein (Tailscale/VPN, kein oeffentliches Dashboard).

**Option C (Lokal Windows-PC):**
Technisch solide via WSL2 (near-native Performance, ~9x schneller als /mnt/c/ Zugriff). Claude Code hat seit Anfang 2026 eine native Windows-App, WSL2 bleibt aber der empfohlene Weg fuer komplexe Workloads. Einziger echter Nachteil: kein 24/7 ohne den PC am Laufen zu halten. Fuer ein Jarvis-Cockpit, das einen Solo-Founder unterstuetzt, ist das vertretbar — der Founder ist ohnehin nur tagesaktiv.

**Option D (Hybrid — Empfehlung):**
Engine (Claude Code CLI + MCP-Server + lokale Memory-Files + Second Brain) laeuft auf dem Windows-PC in WSL2. Ein billiger Hetzner-Mini-Server (CAX11, 5,99 EUR/Monat) laeuft nur mit: Scheduled Agents (cron + `claude -p`), Uptime-Monitor (wie der bestehende `uptime-watch.yml`), einem leichten Web-Dashboard (statisches HTML + Websocket zu lokalem PC via Tailscale). Der PC muss nur laufen, wenn man arbeitet. Abendliche/naechliche Batch-Jobs laufen auf dem Mini-Server.

---

## 4. Ressourcen-Realitaet

### 4.1 CPX22 nach Juni-2026-Preisanpassung

**Status vor Anpassung**: CPX22 = 7,99 EUR/Monat, 3 vCPU AMD (shared), 4 GB RAM, 40 GB SSD.
**Status nach 15. Juni 2026**: CPX22 = **19,49 EUR/Monat** (+144%). Gleiche Hardware.

Der Preis hat sich mehr als verdoppelt. Damit ist die CPX22 heute schlechter bewertet als CX33 oder CAX21, die deutlich mehr RAM fuer vergleichbare oder niedrigere Preise bieten.

**Aktuelle RAM-Bilanz auf der CPX22 (Prod-Stack):**

| Prozess | RAM-Verbrauch (typisch) |
|---|---|
| Caddy (SSL + Reverse Proxy) | 30-80 MB |
| scanner (Node.js + axe-core) | 150-300 MB idle |
| Playwright/Chromium (waehrend Scan) | 500 MB - 2 GB |
| landingpage-next | 100-200 MB |
| admin-next | 80-150 MB |
| Docker Engine + Betriebssystem | 400-600 MB |
| **Gesamt ohne AI-OS** | **~1,3 GB idle, bis 3,5 GB unter Last** |
| **Verbleibend fuer AI-OS** | **~500 MB idle, unter Last: OOM-Risiko** |

Fazit: Die CPX22 reicht fuer den Prod-Stack alleine aus. AI-OS-Engine darauf hinzuzufuegen — auch als leichter Claude-Code-Prozess — fuehrt unter Last zum Arbeitsspeicher-Engpass.

### 4.2 Server-Sizing fuer separaten AI-OS-Server (Option B)

| Server | vCPU | RAM | SSD | Preis (ab 15.06.2026) | Empfehlung |
|---|---|---|---|---|---|
| CX23 | 2 (Intel shared) | 4 GB | 40 GB | 5,49 EUR/Mo | Minimaloption — knapp fuer Dashboard+Scheduler |
| **CX33** | 4 (Intel shared) | 8 GB | 80 GB | **8,49 EUR/Mo** | **Empfohlen fuer Option B** |
| CAX11 | 2 (ARM64) | 4 GB | 40 GB | 5,99 EUR/Mo | Gut fuer reinen Scheduler ohne Dashboard |
| **CAX21** | 4 (ARM64) | 8 GB | 80 GB | **10,49 EUR/Mo** | **ARM-Alternative fuer Option B** |
| CAX31 | 8 (ARM64) | 16 GB | 160 GB | 20,99 EUR/Mo | Ueberdimensioniert fuer diesen Use-Case |

**Anmerkung ARM (CAX)**: Node.js und Claude Code CLI laufen problemlos auf ARM64. Docker-Images muss man auf ARM-Kompatibilitaet pruefen (die meisten offiziellen Images unterstuetzen `linux/arm64`). Playwright/Chromium hat ARM-Support, aber manche npm-Pakete koennen Kompilierprobleme haben.

### 4.3 Lokales Hosting Windows-PC (Option C/D Engine)

- **WSL2**: Nahezu native Linux-Performance. `networkingMode=mirrored` in `.wslconfig` fuer besseres Netzwerk (Achtung: bricht Docker Desktop — Trade-off beachten). Projekte unbedingt auf Linux-Filesystem (`~/`) statt `/mnt/c/` ablegen (9x Performance-Unterschied).
- **RAM-Zuweisung**: In `.wslconfig` mindestens 4-8 GB fuer WSL2 reservieren (je nach PC-RAM 50-75% des Gesamt-RAM).
- **Docker Desktop**: Laeuft gut, aber `mirrored networking` Konflikt beachten. Alternative: Podman Desktop oder direkt Docker-Engine in WSL2.
- **Stolpersteine**: Windows-Updates koennen WSL2 neustarten, Schlafmodus unterbricht Prozesse, Antivirus kann Filesystem-Performance bremsen.
- **Claude Code Windows-App** (nativ, seit Anfang 2026): Verfuegbar als Desktop-App, kein WSL2 noetig fuer einfache interaktive Nutzung. Fuer komplexe Workloads mit Docker/MCP weiterhin WSL2 empfohlen.

---

## 5. Betrieb (Deploy, Backup, Secrets)

### 5.1 Deployment-Strategie

**Fuer Option D (Hybrid-Empfehlung):**

Lokaler PC:
- Claude Code CLI per `npm install -g @anthropic-ai/claude-code` (Update via `npm update -g`)
- Workspace-Dateien in Git-Repo (z.B. `~/jarvis/`) — kein `.env` eingecheckt
- WSL2: Autostart-Skript in `/etc/rc.local` oder `~/.bashrc` fuer MCP-Server-Start

Hetzner Mini-Server (CAX11/CX33):
- Docker Compose fuer Scheduler und leichtes Dashboard
- Deployment: GitHub Actions SSH-Deploy (identisch zum bestehenden bfsg-check-Workflow)
- Updates: `git pull && docker compose up -d --build` — selbes Muster wie Prod

```yaml
# Minimales docker-compose.yml fuer AI-OS Scheduler-Server
version: '3.9'
services:
  scheduler:
    image: node:20-alpine
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./workspace:/workspace:rw
      - ./schedules:/schedules:ro
    command: node /schedules/runner.js
    networks:
      - internal
    user: "1001:1001"  # non-root
  
  dashboard:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "127.0.0.1:2020:2020"  # NUR localhost, kein 0.0.0.0
    volumes:
      - ./dashboard:/srv:ro
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

### 5.2 Backup-Strategie

**Was zu sichern ist:**

| Datentyp | Lage | Backup-Methode | Frequenz |
|---|---|---|---|
| Second Brain / Memory-Files | Lokal PC (`~/jarvis/memory/`) | Git-Commit + GitHub (private Repo) | Bei jeder Aenderung |
| Agent-Outputs | Lokal PC | Git oder Cloud-Sync (Nextcloud/OneDrive) | Taeglich |
| Scheduler-Workspace | Hetzner Mini-Server | Hetzner Volume-Snapshot oder rsync → PC | Taeglich |
| `.env` Secrets | NIEMALS in Git | Passwortmanager (Bitwarden, 1Password) | Bei Aenderung |
| Scheduled-Job-Configs | `schedules/` Ordner | Git (ohne Secrets) | Bei Aenderung |

**Backup-Script (Hetzner → lokal via rsync, in GitHub Actions oder Cron):**
```bash
# Auf dem Windows-PC (WSL2) per cron
0 3 * * * rsync -avz --delete user@jarvis-server:/opt/jarvis/workspace/ ~/jarvis-backup/
```

### 5.3 Secrets-Management

Bestehende Praxis (bfsg-check) beibehalten und erweitern:

```
Secrets-Hierarchie:
├── GitHub Secrets (CI/CD)
│   ├── JARVIS_SSH_KEY → SSH-Zugang Mini-Server
│   ├── ANTHROPIC_API_KEY → fuer Scheduled Agents
│   └── JARVIS_DEPLOY_TOKEN → Dashboard-Auth
├── Server .env (nur Mini-Server, nicht Prod)
│   ├── ANTHROPIC_API_KEY
│   └── DASHBOARD_SECRET (JWT, min 64 Zeichen)
└── Lokal (Windows PC, WSL2)
    ├── ~/.claude/.credentials.json (Auto-gesetzt)
    └── ~/jarvis/.env (gitignored)
```

**Kritisch**: `ANTHROPIC_API_KEY` fuer den Server-Scheduler ist ein eigener Restricted-Key mit nur den noetigen Berechtigungen (nur Claude API, kein Stripe-Zugriff). Separate Keys fuer lokale Nutzung und Server-Nutzung.

### 5.4 Zugriff auf Dashboard (Zero-Trust-Ansatz)

Empfohlene Reihenfolge (von einfach nach sicher):

1. **Tailscale** (Empfehlung fuer Solo-Founder): Kostenlos bis 100 Devices. Mini-Server und Windows-PC joinen das selbe Tailnet. Dashboard laeuft nur auf Tailscale-IP (`100.x.x.x`), kein oeffentlicher Port. Zugriff von ueberall via Tailscale-App (auch Smartphone).

2. **Caddy Basic Auth**: Fallback wenn kein Tailscale. In `Caddyfile`:
   ```
   :2020 {
     basicauth {
       admin $HASHED_PASSWORD
     }
     file_server
   }
   ```
   Nur zusammen mit HTTPS (Let's Encrypt via Caddy) und Rate-Limiting sinnvoll.

3. **Cloudflare Access**: Wenn Browser-SSO (Google-Login) gewuenscht. Etwas aufwaendiger, aber sehr robust. Cloudflare-Tunnel leitet Traffic, kein Port muss geoeffnet werden.

---

## 6. EMPFEHLUNG: Option D — Hybrid (Eindeutig)

### Empfohlener Referenz-Aufbau

```
[Windows PC — WSL2]
├── Claude Code CLI (Engine)
├── MCP-Server (Stripe, Browser, Memory)
├── Second Brain / Memory-Files (Git-versioniert)
├── Interaktive Cockpit-Nutzung (taeglich)
└── API-Key: ANTHROPIC_API_KEY (lokal in .env)
         |
         | Tailscale VPN (peer-to-peer, kein Daten-Proxy)
         |
[Hetzner CAX11 — 5,99 EUR/Monat]
├── Scheduled Agents (cron + claude -p)
│   ├── Naechlicher Bericht-Agent
│   ├── Wochenreview-Agent
│   └── Uptime-Monitor (ergaenzt bestehenden GH-Actions-Watch)
├── Leichtes Web-Dashboard (statisches HTML, read-only)
│   └── NUR erreichbar via Tailscale IP
├── Docker Compose (non-root, internal network)
└── GitHub Actions Deploy (identisch wie bfsg-check)
```

### Begruendung

1. **Sicherheit**: Prod-Server (CPX22) wird NICHT angefasst. Stripe-Keys/Kundendaten haben keinerlei Beruehrungspunkt mit dem AI-OS. Der Mini-Server hat keine Prod-Secrets, nur einen eigenen ANTHROPIC_API_KEY. Kein Dashboard ist oeffentlich erreichbar.

2. **Kosten**: 5,99 EUR/Monat fuer den Mini-Server. API-Kosten je nach Nutzung. Fuer leichten Scheduled-Betrieb (10-20 Calls/Tag) unter 10 EUR/Monat API. Gesamtkosten AI-OS: ~15-20 EUR/Monat.

3. **Komfort**: Entwicklung und interaktive Nutzung laufen auf dem PC — wo ohnehin alle Tools, der Code und die IDE sind. Kein SSH-Overhead fuer taeglich Arbeit. Scheduled Jobs laufen autonom.

4. **DSGVO**: Second Brain und Memory-Files liegen lokal auf dem eigenen PC. Keine Kundendaten im AI-OS-Scope. Der Mini-Server hat nur Scheduler-Logs (keine PII).

5. **Skalierbarkeit**: Wenn spaeter mehr Rechenleistung gebraucht wird: Upgrade Mini-Server von CAX11 auf CAX21 (10,49 EUR/Monat). Oder zweiter separater Server. Prod-Server bleibt immer unberuehrt.

---

## 7. Risiken & Gotchas

### 7.1 Technische Risiken

- **Hetzner-Preiserhoehung Juni 2026**: CPX22 kostet jetzt 19,49 EUR (+144%). Wer den Prod-Server upgraden muss, sollte zu CX33 (8,49 EUR, 8 GB RAM) oder CAX21 (10,49 EUR, 8 GB ARM) wechseln — besser fuer dasselbe Geld. Die bestehende CPX22-Instanz behaelt alten Preis solange sie nicht reskaliert wird.
- **Claude Code RCE-History**: Mehrere kritische CVEs in 2026 zeigen, dass Claude-Code-bezogene Web-UIs attraktive Angriffsziele sind. Niemals npm-Pakete wie `@siteboon/claude-code-ui` unkritisch in Prod einsetzen — immer aktuell halten und CVE-Tracker abonnieren.
- **OAuth-Token-Ablauf**: Wer doch OAuth-Subscription auf einem Server versucht: Tokens verfallen regelmaessig, IP-Blocking durch Cloudflare bei Datacenter-Ranges (GitHub Issues #21678) ist dokumentiert. API-Key ist die einzige stabile Loesung.
- **WSL2 auf Windows**: Windows-Updates koennen WSL2 stilllegen oder neustarten. `wsl --shutdown` durch Updates ist moeglich. Kein Produktionszuverlassigkeitsniveau fuer kritische 24/7-Prozesse.
- **ARM-Kompatibilitaet** (CAX-Server): Einige npm-Module mit nativen Addons koennen auf ARM64 nicht kompilieren. Vor Deployment pruefen: `npm install --target_arch=arm64`.
- **Playwright auf ARM**: Offiziell unterstuetzt, aber aeltere Docker-Images evtl. nicht. `mcr.microsoft.com/playwright:v1.x-noble` unterstuetzt ARM64 ab v1.30+.

### 7.2 Betriebliche Risiken

- **Single-Point-of-Failure Windows-PC**: Wenn der PC ausfaellt, laeuft nur noch der Scheduler. Fuer einen Solo-Founder akzeptabel.
- **API-Key-Rotation vergessen**: Wenn `ANTHROPIC_API_KEY` rotiert werden muss (Security-Incident), muss er auf dem Mini-Server in `.env` UND in GitHub Secrets UND lokal aktualisiert werden. Checkliste anlegen.
- **Kosten-Explosion durch agentic Loops**: Scheduled Agents koennen bei Bugs in Loops unkontrolliert viele API-Calls machen. Immer Rate-Limits / Max-Turns in `claude -p` setzen (`--max-turns 5` oder aehnlich). Anthropic-Console-Spend-Limits aktivieren.
- **Memory-Bloat**: Second-Brain-Dateien wachsen mit der Zeit. Git-Repo fuer Memory-Files anlegen und regelmaessig Cleanup einplanen.

### 7.3 Compliance-Risiken

- **DSGVO**: Wenn Agent-Memory oder Cockpit-Logs Kundendaten enthalten (auch indirekt, z.B. Scan-Ergebnisse), muss Loeschkonzept existieren. Empfehlung: Memory-Files enthalten nur Meta-Daten und eigene Business-Daten, niemals Kunden-URLs, -Adressen oder Scan-Ergebnisse.
- **EU AI Act (ab August 2026)**: Gilt fuer BFSG-Check als Tool, nicht direkt fuer das interne Cockpit. Aber: Wenn das Cockpit Entscheidungen trifft, die Kunden betreffen (z.B. automatisch Rechnungen stellt), koennte Transparenzpflicht entstehen. Bei internem Solo-Founder-Tool: kein Problem.

---

## 8. Offene Entscheidungen fuer den User

1. **Tailscale oder Cloudflare Access?** Tailscale ist einfacher (kein Browser-SSO noetig, P2P). Cloudflare Access ist robuster fuer Zugriff von fremden Geraeten ohne App-Installation. Empfehlung fuer Solo-Founder: Tailscale.

2. **API-Key-Modell-Wahl**: Welches Modell fuer Scheduled Agents? Haiku (guenstigst, fuer einfache Berichte) vs. Sonnet (besser fuer komplexe Analyse, ~10x teurer). Empfehlung: Haiku fuer Monitoring, Sonnet fuer Wochenreview-Analyse.

3. **CAX11 (2 vCPU/4 GB) vs. CX33 (4 vCPU/8 GB) fuer Mini-Server?** CAX11 reicht wenn der Scheduler nur cron-Jobs startet und kein Memory-intensives Dashboard hostet. CX33 wenn geplant ist, den Mini-Server fuer mehr Aufgaben zu nutzen. Preisdifferenz: 2,50 EUR/Monat.

4. **Second Brain in Git-Repo (privat, GitHub) oder nur lokal?** GitHub Private Repo ist kostenlos und gibt automatisches Cloud-Backup. Risiko: Anthropic-Analyse sieht Memory-Inhalte nicht, aber GitHub als US-Unternehmen verarbeitet Repo-Daten. Fuer Business-Kontext-Daten vertretbar. Fuer sehr sensible Informationen: lokales Backup-only.

5. **Bestehende CPX22 reskalieren?** Nach dem Preisschock kostet die CPX22 nun 19,49 EUR. Eine CX33 (8 GB RAM, 8,49 EUR) waere guenstiger UND leistungsfaehiger. Migration bedeutet kurze Downtime. Entscheidung: jetzt wechseln (spart 11 EUR/Monat) oder erst bei naechstem groesseren Deploy?

---

## 9. Quellen

- [Authentication - Claude Code Docs](https://code.claude.com/docs/en/authentication)
- [Claude Code Headless Mode Guide (2026) — amux.io](https://amux.io/guides/claude-code-headless/)
- [Claude Code on VPS Authentication Guide — autonomee.ai](https://autonomee.ai/blog/claude-code-server-vps-authentication-guide/)
- [How to Run Claude Code 24/7 VPS Setup — Medium/@0xmega](https://medium.com/@0xmega/how-to-run-claude-code-24-7-for-under-10-month-vps-setup-guide-6d8c8fd7f09e)
- [Claude Code ToS Explained — autonomee.ai](https://autonomee.ai/blog/claude-code-terms-of-service-explained/)
- [CVE-2025-59536 + CVE-2026-21852 RCE & API Token Exfiltration — Check Point Research](https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/)
- [CVE-2026-31975: @siteboon/claude-code-ui WebSocket Shell Injection — GitHub Advisory](https://github.com/advisories/GHSA-gv8f-wpm2-m5wr)
- [Claude Code RCE via Deeplinks — cybersecuritynews.com](https://cybersecuritynews.com/claude-code-rce-flaw/)
- [Hetzner Price Adjustment 15 June 2026 — Hetzner Docs](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)
- [Hetzner June 2026 Price Shock (CPX +144%) — byteiota.com](https://byteiota.com/hetzner-june-2026-price-shock/)
- [Hetzner Cloud VPS Pricing Calculator Jun 2026 — costgoat.com](https://costgoat.com/pricing/hetzner)
- [Hetzner cloud price increases 2026 — Northflank](https://northflank.com/blog/hetzner-cloud-server-price-increases)
- [Docker Compose Network-Isolated Claude Code Setup — shaharia.com](https://shaharia.com/blog/run-claude-code-docker-network-isolation/)
- [How to Run Claude Code Sandboxed — dev.to/wartzarbee](https://dev.to/wartzarbee/how-to-run-claude-code-sandboxed-containers-network-walls-and-secret-isolation-2jkn)
- [Claude Code Sandboxing Guide — claudefa.st](https://claudefa.st/blog/guide/sandboxing-guide)
- [Docker Sandboxes for Coding Agents — Docker Blog](https://www.docker.com/blog/docker-sandboxes-run-claude-code-and-other-coding-agents-unsupervised-but-safely/)
- [Optimizing WSL2 for Claude Code 2026 — thetributary.ai](https://www.thetributary.ai/blog/optimizing-wsl2-claude-code-performance-guide/)
- [Claude Code for Windows (Native App) — opencowork.chat](https://opencowork.chat/blog/claude-code-for-windows)
- [Playwright in Docker Production Guide 2026 — bug0.com](https://bug0.com/knowledge-base/playwright-docker)
- [8GB Was a Lie: Playwright in Production — Medium/@onurmaciit](https://medium.com/@onurmaciit/8gb-was-a-lie-playwright-in-production-c2bdbe4429d6)
- [Tailscale vs Cloudflare Tunnels 2026 — needtoknowit.com.au](https://needtoknowit.com.au/blog/tailscale-vs-cloudflare-tunnels-for-remote-access/)
- [GDPR AI Agent Memory Compliance Germany 2026 — agentliability.co](https://agentliability.co/articles/germany-ai-regulation-operators-guide-2026)
- [Legal and compliance — Claude Code Docs](https://code.claude.com/docs/en/legal-and-compliance)

---

*Erstellt: Juni 2026 | Recherche-Agent #4 (Hosting & Security)*
