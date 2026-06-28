# Phase-1 → Phase-2 Switch (HTTPS aktivieren)

## Wann?
Sobald **mindestens** für `barrierefrei-pruefen.de` UND `bfsg-fix.de` der A-Record auf `178.105.83.0` zeigt
(via `dig barrierefrei-pruefen.de +short` und `dig bfsg-fix.de +short` prüfen — sollte die Hetzner-IP ausgeben).

Optimal: alle Domains umgestellt, bevor wir Phase 2 aktivieren — dann holt
Caddy für alle gleichzeitig Let's-Encrypt-Zertifikate.

## Was passiert beim Switch?
1. **Phase 1** (jetzt): Caddy lauscht nur auf Port 80, kein TLS, nur App-Reverse-Proxy.
2. **Phase 2** (Ziel): Caddy lauscht auf 80 + 443, holt automatisch Let's-Encrypt-Zertifikate für barrierefrei-pruefen.de + bfsg-fix.de + Alias-Domains, 301-Redirects der 2 Alias-Domains auf `https://barrierefrei-pruefen.de`, HSTS-Header etc.

## Wie? (auf dem Server, via SSH ODER GitHub Actions)

```bash
cd /opt/bfsg-check/deployment

# Phase-1-Override löschen → Caddy nutzt das Standard-Caddyfile (Phase 2)
rm -f docker-compose.override.yml

# Restart — Caddy holt Let's-Encrypt-Cert beim Start (~1 Min)
docker compose up -d

# Logs beobachten
docker compose logs -f caddy
```

## Wie via GitHub Actions
Workflow `Deploy to Hetzner` triggert das automatisch bei jedem Push auf main,
sobald die obige Server-Aktion einmal durchgelaufen ist. Der `git pull --hard`
würde das override-File NICHT löschen (steht in `.gitignore`) — du musst es
einmal manuell auf dem Server entfernen.

**Empfohlener Ablauf:**
1. DNS bei INWX für alle 4 Domains umstellen (siehe `dns-records.md`).
2. Warten 15 Min, `dig` checken.
3. SSH zum Server, Override löschen, `docker compose up -d`.
4. Test neue Domain: `curl -I https://barrierefrei-pruefen.de/health` → HTTP 200.
5. Test alte Domain weiterhin aktiv: `curl -I https://bfsg-fix.de/health` → HTTP 200.
6. Test Alias: `curl -I https://bfsg-barrierecheck.de/` → HTTP 301 nach https://barrierefrei-pruefen.de.

## Wenn Let's Encrypt fehlschlägt
- **Häufigster Grund:** DNS zeigt noch nicht (noch nicht propagiert / falscher Eintrag).
- Caddy logged das in `docker compose logs caddy`.
- Rate-Limit von Let's Encrypt: 5 fehlerhafte Cert-Anfragen pro Stunde pro Domain.
- Notfall-Rollback: `docker-compose.override.yml` aus diesem Doc wiederherstellen + Restart → zurück zu Phase 1.

### Notfall-Rollback-Snippet
```bash
cat > /opt/bfsg-check/deployment/docker-compose.override.yml <<'OVR'
services:
  caddy:
    ports: !override
      - "80:80"
    volumes: !override
      - ./Caddyfile.phase1:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
OVR
docker compose up -d
```
