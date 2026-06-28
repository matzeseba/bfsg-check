# DNS-Records — Copy-Paste-Vorlage für INWX

> So trägst du die DNS-Records bei INWX ein. Setzen unter **„Mein Konto → Nameserver → DNS"** für jede Domain einzeln.

**Server-IP (Hetzner):** `178.105.83.0` (IPv4) · `2a01:4f8:1c18:d890::1` (IPv6 — erste Adresse aus dem /64-Subnetz)
**Stand:** 16.06.2026 — Server läuft, Brevo SMTP aktiv.

---

## 1. `barrierefrei-pruefen.de` (Neue Primär-Domain — nach Cutover)

> CUTOVER-VORAUSSETZUNG: Diese Records erst setzen, wenn PR auf `main` gemergt
> und Caddy auf dem Server mit dem neuen Caddyfile läuft. Reihenfolge im CUTOVER-RUNBOOK beachten.

| Typ | Host / Name | Wert | TTL |
|---|---|---|---|
| A | `@` | `178.105.83.0` | 3600 |
| A | `www` | `178.105.83.0` | 3600 |
| AAAA | `@` | `2a01:4f8:1c18:d890::1` | 3600 |
| AAAA | `www` | `2a01:4f8:1c18:d890::1` | 3600 |
| TXT | `@` | `v=spf1 include:spf.brevo.com ~all` | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:matthiasseba92@gmail.com` | 3600 |
| TXT | `mail._domainkey` | *(kommt von Brevo nach Domain-Verifizierung)* | 3600 |

### Brevo Domain-Verifizierung für neue Domain
1. https://app.brevo.com → **Senders, Domains & dedicated IPs → Domains → Domain hinzufügen** → `barrierefrei-pruefen.de`
2. Brevo zeigt einen einmaligen Verifizierungs-TXT-Record (z. B. `brevo-code:abc123...`) — als TXT auf `@` setzen.
3. Brevo zeigt den DKIM-Wert — als TXT auf `mail._domainkey` setzen.
4. In Brevo „Verifizieren" klicken → grüner Haken nach DNS-Propagation (5 Min – 4 h).

---

## 2. `bfsg-fix.de` (Alte Haupt-Domain — bleibt aktiv bis Stripe-Cutover)

> NICHT abschalten: Stripe-Webhook `bfsg-fix.de/webhook` + `/health` laufen hier.
> Records bleiben unverändert bis Stripe-Webhook-URL umgestellt ist.

| Typ | Host / Name | Wert | TTL |
|---|---|---|---|
| A | `@` | `178.105.83.0` | 3600 |
| A | `www` | `178.105.83.0` | 3600 |
| AAAA | `@` | `2a01:4f8:1c18:d890::1` | 3600 |
| AAAA | `www` | `2a01:4f8:1c18:d890::1` | 3600 |
| TXT | `@` | `v=spf1 include:spf.brevo.com ~all` | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:matthiasseba92@gmail.com` | 3600 |
| TXT | `mail._domainkey` | *(Brevo-DKIM-Wert)* | 3600 |

---

## 3. Alias-Domains: nur A/AAAA-Records, Caddy macht 301 zur Primär-Domain

Für **jede** dieser zwei Domains (Caddy leitet auf `barrierefrei-pruefen.de` weiter):
- `bfsg-barrierecheck.de`
- `bfsg-sofortcheck.de`

| Typ | Host / Name | Wert | TTL |
|---|---|---|---|
| A | `@` | `178.105.83.0` | 3600 |
| A | `www` | `178.105.83.0` | 3600 |
| AAAA | `@` | `2a01:4f8:1c18:d890::1` | 3600 |
| AAAA | `www` | `2a01:4f8:1c18:d890::1` | 3600 |

Diese 301en automatisch auf `https://barrierefrei-pruefen.de` weiter (Caddyfile-Konfiguration).

---

## 4. Künftige Sub-Domains (für Welle 4/5)

Beide Records bei INWX unter **`barrierefrei-pruefen.de` → DNS** zusätzlich eintragen, damit Caddy beim Hochziehen der neuen Container sofort Let's-Encrypt-Zertifikate ziehen kann.

| Typ | Host / Name | Wert | TTL | Zweck |
|---|---|---|---|---|
| A | `preview` | `178.105.83.0` | 3600 | Staging / Preview-Builds (Next.js) |
| A | `admin` | `178.105.83.0` | 3600 | Internes Admin-Backend |
| AAAA | `preview` | `2a01:4f8:1c18:d890::1` | 3600 | optional, sobald IPv6 produktiv |
| AAAA | `admin` | `2a01:4f8:1c18:d890::1` | 3600 | optional, sobald IPv6 produktiv |

Caddy-Vhosts liegen bereits im `deployment/Caddyfile` (auskommentiert, Welle 5).

---

## 5. DMARC-Migrationsschritte (über 90 Tage)

DMARC wird stufenweise schärfer geschaltet. Vorher mindestens 30 Tage Reports einsammeln und prüfen, dass nur Brevo-IPs als aligned auftauchen. Vollständiger Hintergrund: `docs/EMAIL-DELIVERABILITY.md`.

**Wo eintragen:** INWX `barrierefrei-pruefen.de` → DNS → TXT auf Host `_dmarc` **überschreiben** (nicht zusätzlich anlegen!).

### Phase 0 — Start (jetzt, Monitoring)

| Typ | Host | Wert | TTL |
|---|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:matthiasseba92@gmail.com` | 3600 |

Wirkung: Reports kommen, **nichts wird blockiert**.

### Phase 1 — Tag 30 (10 % Quarantine)

| Typ | Host | Wert | TTL |
|---|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; pct=10; rua=mailto:matthiasseba92@gmail.com` | 3600 |

Wirkung: 10 % der nicht-konformen Mails landen im Spam.

### Phase 2 — Tag 60 (100 % Quarantine)

| Typ | Host | Wert | TTL |
|---|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; pct=100; rua=mailto:matthiasseba92@gmail.com` | 3600 |

Wirkung: Alle nicht-konformen Mails → Spam.

### Phase 3 — Tag 90 (Reject = Endstufe)

| Typ | Host | Wert | TTL |
|---|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:matthiasseba92@gmail.com` | 3600 |

Wirkung: Nicht-konforme Mails werden **abgelehnt** (kein Spam, sondern Bounce beim Versender).

**Vor jedem Phasenwechsel:**
```bash
bash deployment/scripts/check-mail-auth.sh barrierefrei-pruefen.de
```

---

## Was nach DNS-Switch passiert

1. **5 Min – 4 h:** DNS propagiert.
2. **Sobald DNS auf Server zeigt:** Caddy fordert automatisch Let's-Encrypt-Zertifikate an.
3. **Cutover Phase-1 → Phase-2:** Aktuell läuft Phase-1 (HTTP-only). Sobald DNS umgestellt ist, deaktivieren wir das Phase-1-Override und nutzen das normale Caddyfile mit HTTPS. Ein Push auf main mit der Deaktivierung reicht — GitHub Actions deployed automatisch.

## Propagation prüfen

```bash
dig barrierefrei-pruefen.de +short       # erwartete Ausgabe: 178.105.83.0
dig www.barrierefrei-pruefen.de +short   # erwartete Ausgabe: 178.105.83.0
# Alte Domain weiterhin aktiv prüfen:
dig bfsg-fix.de +short                   # erwartete Ausgabe: 178.105.83.0
```

Oder im Browser: https://dnschecker.org → `barrierefrei-pruefen.de` eingeben.

## Test nach SSL

```bash
curl -I https://barrierefrei-pruefen.de/health    # erwartet: HTTP 200 + JSON-Body
curl -I https://bfsg-fix.de/health                # muss weiterhin HTTP 200 liefern!
curl -I https://bfsg-barrierecheck.de/            # erwartet: HTTP 301 → barrierefrei-pruefen.de
```
