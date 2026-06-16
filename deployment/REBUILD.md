# Server-Rebuild — falls jemals nötig

## Wann nutzen?
- Server in inkonsistentem Zustand
- Migration auf größeren Server-Typ
- Disaster Recovery

## Voraussetzungen
- Hetzner Cloud API-Token
- Primary IPv4/IPv6 müssen `auto_delete=false` haben (sonst gehen sie mit dem alten Server weg)

## Schritte (vollautomatisch via API)

### 1. Primary-IPs absichern
```bash
HCLOUD_TOKEN="..."
curl -X PUT -H "Authorization: Bearer $HCLOUD_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.hetzner.cloud/v1/primary_ips/<ipv4_id> \
  -d '{"auto_delete":false}'
# Gleiches für IPv6
```

### 2. Alten Server löschen
```bash
curl -X DELETE -H "Authorization: Bearer $HCLOUD_TOKEN" \
  https://api.hetzner.cloud/v1/servers/<old_id>
```

### 3. Neuen Server erstellen mit cloud-init
```bash
USER_DATA=$(python3 -c "import json; print(json.dumps(open('cloud-init.yaml').read()))")
cat > create.json <<JSON
{
  "name": "BSFG-FIX",
  "server_type": "cpx22",
  "image": "ubuntu-24.04",
  "datacenter": "nbg1-dc3",
  "ssh_keys": [<ssh_key_id>],
  "user_data": $USER_DATA,
  "start_after_create": true,
  "public_net": {
    "enable_ipv4": true,
    "enable_ipv6": true,
    "ipv4": <ipv4_id>,
    "ipv6": <ipv6_id>
  }
}
JSON
curl -X POST -H "Authorization: Bearer $HCLOUD_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.hetzner.cloud/v1/servers -d @create.json
```

### 4. Warten
- ~30 Sek: Server bootet
- ~5–10 Min: cloud-init installiert Docker, klont Repo, baut Container, fährt hoch
- Health-Check: `curl http://<ip>/health` muss `{"ok":true,...}` liefern

## Phase-2-Migration (nach erstem Test-Erfolg)
Cloud-init nutzt aktuell HTTP-only ohne TLS (für DNS-frei Tests).
Sobald die 4 Domains DNS auf den Server zeigen:
1. `Caddyfile` aus dem Repo (mit Let's Encrypt) wieder aktivieren
2. `docker-compose.override.yml` löschen (oder leeren)
3. `docker compose up -d` ⇒ SSL automatisch via Caddy
