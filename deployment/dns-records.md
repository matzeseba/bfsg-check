# DNS-Records — Copy-Paste-Vorlage für INWX

> So trägst du die DNS-Records bei INWX ein. Setzen unter **„Mein Konto → Nameserver → DNS"** für jede Domain einzeln.

**Server-IP (Hetzner):** `178.105.83.0` (IPv4) · `2a01:4f8:1c18:d890::1` (IPv6 — erste Adresse aus dem /64-Subnetz)
**Stand:** 16.06.2026 — Server läuft, Brevo SMTP aktiv.

---

## 1. `bfsg-fix.de` (Haupt-Domain)

| Typ | Host / Name | Wert | TTL |
|---|---|---|---|
| A | `@` | `178.105.83.0` | 3600 |
| A | `www` | `178.105.83.0` | 3600 |
| AAAA | `@` | `2a01:4f8:1c18:d890::1` | 3600 |
| AAAA | `www` | `2a01:4f8:1c18:d890::1` | 3600 |
| TXT | `@` | `v=spf1 include:spf.brevo.com ~all` | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:matthiasseba92@gmail.com` | 3600 |
| TXT | `mail._domainkey` | *(kommt von Brevo nach Domain-Verifizierung)* | 3600 |

### Brevo Domain-Verifizierung
1. https://app.brevo.com → **Senders, Domains & dedicated IPs → Domains → Domain hinzufügen** → `bfsg-fix.de`
2. Brevo zeigt einen einmaligen Verifizierungs-TXT-Record (z. B. `brevo-code:abc123...`) — als TXT auf `@` setzen.
3. Brevo zeigt den DKIM-Wert — als TXT auf `mail._domainkey` setzen.
4. In Brevo „Verifizieren" klicken → grüner Haken nach DNS-Propagation (5 Min – 4 h).

---

## 2. Alias-Domains: nur A/AAAA-Records, Caddy macht 301 zur Haupt-Domain

Für **jede** dieser drei Domains:
- `bfsg-barrierecheck.de`
- `bfsg-sofortcheck.de`
- `barrierefrei-pruefen.de`

| Typ | Host / Name | Wert | TTL |
|---|---|---|---|
| A | `@` | `178.105.83.0` | 3600 |
| A | `www` | `178.105.83.0` | 3600 |
| AAAA | `@` | `2a01:4f8:1c18:d890::1` | 3600 |
| AAAA | `www` | `2a01:4f8:1c18:d890::1` | 3600 |

Diese 301en automatisch auf `https://bfsg-fix.de` weiter (Caddyfile-Konfiguration).

---

## Was nach DNS-Switch passiert

1. **5 Min – 4 h:** DNS propagiert.
2. **Sobald DNS auf Server zeigt:** Caddy fordert automatisch Let's-Encrypt-Zertifikate an (alle 4 Domains).
3. **Cutover Phase-1 → Phase-2:** Aktuell läuft Phase-1 (HTTP-only). Sobald DNS umgestellt ist, deaktivieren wir das Phase-1-Override und nutzen das normale Caddyfile mit HTTPS. Ein Push auf main mit der Deaktivierung reicht — GitHub Actions deployed automatisch.

## Propagation prüfen

```bash
dig bfsg-fix.de +short            # erwartete Ausgabe: 178.105.83.0
dig www.bfsg-fix.de +short        # erwartete Ausgabe: 178.105.83.0
```

Oder im Browser: https://dnschecker.org → `bfsg-fix.de` eingeben.

## Test nach SSL

```bash
curl -I https://bfsg-fix.de/health           # erwartet: HTTP 200 + JSON-Body
curl -I https://bfsg-barrierecheck.de/       # erwartet: HTTP 301 → bfsg-fix.de
```
