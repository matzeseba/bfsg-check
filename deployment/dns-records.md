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
| CNAME | `brevo1._domainkey` | `b1.bfsg-fix-de.dkim.brevo.com` | 3600 |
| CNAME | `brevo2._domainkey` | `b2.bfsg-fix-de.dkim.brevo.com` | 3600 |

> **Korrektur (02.07.2026):** Brevo nutzt **CNAME-Selektoren `brevo1`/`brevo2`**, NICHT den früher hier dokumentierten TXT auf `mail._domainkey`. Live per DNS verifiziert.

### ⚠️ OFFENE DNS-FEHLER auf `bfsg-fix.de` (Owner-Fix bei INWX, je ~1 Min)
Live-Abfrage 02.07.2026 zeigt **doppelte Records — beide RFC-widrig:**
1. **Zwei SPF-TXT-Records** auf `@`: `v=spf1 a mx include:_spf.webspace.bz ~all` (INWX Mail Easy) UND `v=spf1 include:spf.brevo.com ~all`. Mehr als ein `v=spf1`-Record ⇒ **SPF PermError = SPF fail**. Fix: beide löschen, EINEN setzen: `v=spf1 a mx include:_spf.webspace.bz include:spf.brevo.com ~all`
2. **Zwei DMARC-TXT-Records** auf `_dmarc`: mit und ohne `rua=`. Mehrere DMARC-Records ⇒ Empfänger ignorieren BEIDE. Fix: den ohne `rua=` löschen.

### Brevo Domain-Verifizierung
1. https://app.brevo.com → **Senders, Domains & dedicated IPs → Domains → Domain hinzufügen** → `bfsg-fix.de`
2. Brevo zeigt einen einmaligen Verifizierungs-TXT-Record (z. B. `brevo-code:abc123...`) — als TXT auf `@` setzen.
3. Brevo zeigt zwei **DKIM-CNAMEs** (`brevo1._domainkey` / `brevo2._domainkey`) — als CNAME setzen.
4. In Brevo „Verifizieren" klicken → grüner Haken nach DNS-Propagation (5 Min – 4 h).

---

## 1b. `bfsg-fuchs.de` (Marken- + Sende-Domain) — Stand: live verifiziert 02.07.2026 ✅

| Typ | Host / Name | Wert | Status |
|---|---|---|---|
| A | `@` | `178.105.83.0` | ✅ live |
| AAAA | `@` | `2a01:4f8:1c18:d890::1` | ✅ live |
| TXT | `@` | `v=spf1 include:spf.brevo.com ~all` | ✅ live |
| TXT | `@` | `brevo-code:69af8f0d07a88b8b18828edde557ae23` | ✅ live |
| CNAME | `brevo1._domainkey` | `b1.bfsg-fuchs-de.dkim.brevo.com` | ✅ live |
| CNAME | `brevo2._domainkey` | `b2.bfsg-fuchs-de.dkim.brevo.com` | ✅ live |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | ✅ live |
| MX | — | *(kein MX — Domain empfängt nicht; optional Null-MX `0 .` nach Warm-up)* | — |

Transaktions-Absender ist `no-reply@bfsg-fuchs.de` (Brevo SMTP-Relay). SPF/DKIM/DMARC dieser Zone sind sauber — Restspam = Cold-Start-Reputation (Warm-up).

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

## 3. Künftige Sub-Domains (für Welle 4/5)

Beide Records bei INWX unter **`bfsg-fix.de` → DNS** zusätzlich eintragen, damit Caddy beim Hochziehen der neuen Container sofort Let's-Encrypt-Zertifikate ziehen kann.

| Typ | Host / Name | Wert | TTL | Zweck |
|---|---|---|---|---|
| A | `preview` | `178.105.83.0` | 3600 | Staging / Preview-Builds (Next.js) |
| A | `admin` | `178.105.83.0` | 3600 | Internes Admin-Backend |
| AAAA | `preview` | `2a01:4f8:1c18:d890::1` | 3600 | optional, sobald IPv6 produktiv |
| AAAA | `admin` | `2a01:4f8:1c18:d890::1` | 3600 | optional, sobald IPv6 produktiv |

### AOS-Dashboard (`aos.bfsg-fuchs.de`)

> **Wichtig:** Diese beiden Records gehören in die **`bfsg-fuchs.de`**-Zone (NICHT `bfsg-fix.de`), da das Dashboard unter `aos.bfsg-fuchs.de` läuft. Eintragen bei INWX unter **`bfsg-fuchs.de` → DNS**.

| Typ | Host / Name | Wert | TTL | Zweck |
|---|---|---|---|---|
| A | `aos` | `178.105.83.0` | 3600 | AOS Business-Dashboard |
| AAAA | `aos` | `2a01:4f8:1c18:d890::1` | 3600 | AOS Business-Dashboard |

Sobald der Record propagiert ist und das Compose-Projekt `aos` läuft, zieht Caddy automatisch ein Let's-Encrypt-Zertifikat für `aos.bfsg-fuchs.de` (Vhost-Block liegt bereits im `deployment/Caddyfile`).

Caddy-Vhosts liegen bereits im `deployment/Caddyfile` (Targets `landing-next:3000` / `admin-next:3001`) — werden aktiv, sobald die Container im `docker-compose.yml` ergänzt sind.

---

## 4. DMARC-Migrationsschritte (über 90 Tage)

DMARC wird stufenweise schärfer geschaltet. Vorher mindestens 30 Tage Reports einsammeln und prüfen, dass nur Brevo-IPs als aligned auftauchen. Vollständiger Hintergrund: `docs/EMAIL-DELIVERABILITY.md`.

**Wo eintragen:** INWX `bfsg-fix.de` → DNS → TXT auf Host `_dmarc` **überschreiben** (nicht zusätzlich anlegen!).

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
bash deployment/scripts/check-mail-auth.sh bfsg-fix.de
```

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
