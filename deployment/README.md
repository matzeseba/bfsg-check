# Deployment — BFSG-Check auf Hetzner

## Was liegt hier

| Datei | Zweck |
|---|---|
| `docker-compose.yml` | App-Container (Node+Chromium) + Caddy (Auto-HTTPS) |
| `Caddyfile` | Reverse-Proxy mit Let's-Encrypt-SSL für bfsg-fix.de + 301 für die 3 Alias-Domains |
| `dns-records.md` | INWX-DNS-Eintragsvorlage (A/SPF/DKIM/DMARC) |
| `.env.example` | Vorlage für die Server-Env-Vars |

## Server-Voraussetzungen
- Linux mit Docker + Docker Compose Plugin
- Hetzner CX22 (2 vCPU / 4 GB RAM / 80 GB) reicht (Chromium-Concurrency auf 2 begrenzt)
- Firewall: Ports 80 + 443 offen (Hetzner Cloud Console → Firewall → Inbound)
- DNS aller 4 Domains zeigt auf Server-IP (siehe `dns-records.md`)

## Erst-Deploy (passiert über mich/SSH, sobald Token + IP da sind)

```bash
# 1. Docker installieren (falls noch nicht da)
curl -fsSL https://get.docker.com | sh

# 2. Repo holen
git clone https://github.com/matzeseba/bfsg-check.git /opt/bfsg-check
cd /opt/bfsg-check/deployment

# 3. .env aus Vorlage + echte Werte rein
cp .env.example .env
nano .env  # echte Keys eintragen

# 4. Hochfahren
docker compose up -d --build

# 5. Logs prüfen
docker compose logs -f
```

Caddy holt sich automatisch ein Let's-Encrypt-Zertifikat (1–2 Min beim ersten Mal).

## Updates (nach Code-Änderungen auf main)

```bash
cd /opt/bfsg-check
git pull
cd deployment
docker compose up -d --build
```

## Logs / Diagnose

```bash
docker compose logs -f app     # App-Logs (Stripe-Webhooks, Mail-Versand, Scans)
docker compose logs -f caddy   # Reverse-Proxy + SSL-Renewals
docker compose ps              # Container-Status
docker compose exec app sh     # Shell im App-Container (für Notfall-Debug)
```

## Daten-Persistenz

JSONL-Dateien und generierte PDFs liegen im Docker-Volume `bfsg_data`:
- `/var/lib/docker/volumes/deployment_bfsg_data/_data/orders.jsonl`
- `/var/lib/docker/volumes/deployment_bfsg_data/_data/subscriptions.jsonl`

Backup-Strategie (nice-to-have, Welle 3):
```bash
# Manuelles Backup ins Home-Verzeichnis
docker run --rm -v deployment_bfsg_data:/data -v ~/backups:/backup alpine \
  tar czf /backup/bfsg-data-$(date +%Y%m%d).tgz -C /data .
```

## Health-Check

```bash
curl https://bfsg-fix.de/health
# Erwartet: {"ok":true,"stripe":true,...}
```
