# AOS-Dashboard — Erst-Deploy-Runbook (Hetzner)

> Ziel: `aos.bfsg-fuchs.de` als Compose-Projekt **`aos`** neben dem Live-SaaS-Stack
> (`/opt/bfsg-check`, Projekt `deployment`) hochziehen. Getrennte Clones, getrennte
> Netze — der Live-Betrieb bleibt unberührt.
>
> **Ab Merge auf `main` übernimmt CI** (`.github/workflows/deploy-aos.yml`). Dieses
> Runbook beschreibt den **manuellen Erst-Deploy in dieser Session** vom Branch
> `worktree-aos-dashboard`, damit das System sofort läuft.

---

## 0. Rahmen (WICHTIG)

- **Host:** Ubuntu 24.04, 2 vCPU, **3,8 GB RAM, kein Swap ab Werk** → Schritt 2 (Swap) ist Pflicht, sonst OOM-Risiko für die Live-SaaS.
- **AOS-RAM-Budget:** ~1,2 GB (frontend 256m + backend 512m + 4× MCP 128m).
- **SSH:** `root@178.105.83.0` (bzw. SSH-Config-Alias `bfsg`).
- Kommandos als `root` ausführen.

---

## 1. Repo-Clone auf Branch (Erst-Deploy-Variante)

```bash
# Origin-URL vom bestehenden Live-Clone übernehmen (kein neuer Deploy-Key nötig).
ORIGIN=$(git -C /opt/bfsg-check remote get-url origin)

# Nur beim ersten Mal klonen:
if [ ! -d /opt/aos/.git ]; then git clone "$ORIGIN" /opt/aos; fi

cd /opt/aos
git fetch origin
# In DIESER Session vom Branch deployen (CI nutzt später origin/main):
git checkout worktree-aos-dashboard
git reset --hard origin/worktree-aos-dashboard
```

---

## 2. Swap-Sicherung (2G, idempotent)

```bash
if ! swapon --show | grep -q '/swapfile'; then
  [ -f /swapfile ] || { fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048; }
  chmod 600 /swapfile
  swapon --show | grep -q '/swapfile' || { mkswap /swapfile 2>/dev/null; swapon /swapfile; }
fi
sysctl -w vm.swappiness=10
grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
grep -q '^vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
swapon --show   # Kontrolle: /swapfile 2G sichtbar
```

---

## 3. `.env`-Bootstrap (`/opt/aos/aos/deploy/.env`)

Identische Schritte wie im CI-Workflow — hier als kopierbare Befehle:

```bash
ENV_DIR=/opt/aos/aos/deploy
ENV_FILE=$ENV_DIR/.env
SRC=/opt/bfsg-check/deployment/.env
mkdir -p "$ENV_DIR"; touch "$ENV_FILE"; chmod 600 "$ENV_FILE"

getval() { grep -E "^$1=" "$2" 2>/dev/null | head -n1 | cut -d= -f2- ; }
upsert() { grep -v "^$1=" "$ENV_FILE" > "$ENV_FILE.tmp" 2>/dev/null || true; printf '%s=%s\n' "$1" "$2" >> "$ENV_FILE.tmp"; mv "$ENV_FILE.tmp" "$ENV_FILE"; }
ensure() { [ -z "$(getval "$1" "$ENV_FILE")" ] && upsert "$1" "$2" || true; }

# Secrets aus Live-.env (nur wenn im aos-.env leer). Mapping ZIEL:QUELLE.
for MAP in STRIPE_SECRET_KEY:STRIPE_SECRET_KEY BREVO_API_KEY:BREVO_API_KEY \
           ANTHROPIC_API_KEY:ANTHROPIC_API_KEY ADMIN_EMAIL:ADMIN_EMAIL \
           SCANNER_ADMIN_TOKEN:ADMIN_TOKEN; do
  DST="${MAP%%:*}"; SRCKEY="${MAP##*:}"
  if [ -z "$(getval "$DST" "$ENV_FILE")" ]; then
    V="$(getval "$SRCKEY" "$SRC")"; [ -n "$V" ] && upsert "$DST" "$V" || true
  fi
done

# Login-/Session-Secrets nur einmalig generieren, NIE überschreiben.
[ -z "$(getval AOS_ADMIN_TOKEN "$ENV_FILE")" ] && upsert AOS_ADMIN_TOKEN "$(openssl rand -hex 24)" || true
[ -z "$(getval AOS_SESSION_SECRET "$ENV_FILE")" ] && upsert AOS_SESSION_SECRET "$(openssl rand -hex 24)" || true

# Rest-Defaults (§7).
ensure SCANNER_BASE_URL "http://app:8080"
ensure PUBLIC_HEALTH_URL "https://bfsg-fuchs.de/health"
ensure AOS_DOCKER_SOCK "true"
ensure AOS_BASE_URL "https://aos.bfsg-fuchs.de"
ensure AOS_MODEL_JARVIS "claude-sonnet-4-6"
ensure AOS_MODEL_AGENTS "claude-sonnet-4-6"
ensure MCP_RESEARCH_URL "http://aos-mcp-research:8101"
ensure MCP_LEADSCORE_URL "http://aos-mcp-leadscore:8102"
ensure MCP_COMPETITOR_URL "http://aos-mcp-competitor:8103"
ensure MCP_DEBRIEF_URL "http://aos-mcp-debrief:8104"
ensure TZ "Europe/Berlin"
chmod 600 "$ENV_FILE"
```

> **Login-Token merken:** `grep AOS_ADMIN_TOKEN /opt/aos/aos/deploy/.env` — das ist das Passwort auf der Login-Seite.

---

## 4. Stack starten

```bash
cd /opt/aos
docker compose -p aos -f aos/deploy/docker-compose.aos.yml --env-file aos/deploy/.env up -d --build
```

Erst-Build dauert einige Minuten (Next.js-Standalone + Python-Images).

---

## 5. Health-Verify

```bash
# Backend meldet sich selbst:
docker exec aos-backend python -c "import urllib.request;print(urllib.request.urlopen('http://localhost:8100/healthz',timeout=5).read().decode())"
# → {"ok":true,"service":"aos-backend","version":"1.0.0"}

docker compose -p aos -f aos/deploy/docker-compose.aos.yml ps   # alle 6 „healthy"

# Nach DNS-Record + Caddy-Deploy (siehe deployment/dns-records.md §3):
curl -I https://aos.bfsg-fuchs.de/healthz   # HTTP 200
```

Caddy zieht das Let's-Encrypt-Zertifikat automatisch, sobald `aos.bfsg-fuchs.de`
per DNS auf den Server zeigt und der Vhost-Block (bereits im `deployment/Caddyfile`)
ausgerollt ist.

---

## 6. Rollback

```bash
# Stack stoppen + entfernen (Volume aos_data bleibt erhalten):
docker compose -p aos -f /opt/aos/aos/deploy/docker-compose.aos.yml down

# Komplett inkl. Daten (SQLite-DB löschen — nur bei Bedarf!):
docker compose -p aos -f /opt/aos/aos/deploy/docker-compose.aos.yml down -v
```

Der Live-SaaS-Stack (`deployment`) ist davon **nicht** betroffen — getrennte
Compose-Projekte, getrennte Volumes, getrennte Container.

---

## 7. RAM-Hinweis

Der 3,8-GB-Host trägt Live-SaaS + AOS gleichzeitig. Bei RAM-Druck zuerst prüfen:

```bash
free -h
docker stats --no-stream
```

Der Scan-Container (`bfsg-app`) darf bis 3g spiken — deshalb ist der 2G-Swap
(Schritt 2) die Absicherung. AOS selbst ist per `mem_limit` hart gedeckelt
(~1,2 GB Summe), kann den Host also nicht überziehen.
