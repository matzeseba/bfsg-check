# DNS-Records — Copy-Paste-Vorlage für INWX

> So trägst du die DNS-Records bei INWX ein, sobald wir die Hetzner-Server-IP
> kennen. Setzen unter **„Mein Konto → Nameserver → DNS"** für jede Domain.

**Platzhalter:** `<HETZNER_IP>` ersetze ich, sobald der Server provisioniert ist.
**Brevo-DKIM-Wert** bekommen wir beim Verifizieren der Domain in Brevo.

---

## 1. bfsg-fix.de (Haupt-Domain)

| Typ | Host / Name | Wert | TTL |
|---|---|---|---|
| A | @ | `<HETZNER_IP>` | 3600 |
| A | www | `<HETZNER_IP>` | 3600 |
| TXT | @ | `v=spf1 include:spf.brevo.com ~all` | 3600 |
| TXT | `mail._domainkey` | (Wert kommt von Brevo nach Verifizierung) | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@bfsg-fix.de` | 3600 |

**Brevo-Verifizierung:** Zusätzlich verlangt Brevo einen einmaligen Verifizierungs-TXT-Record (Form `brevo-code:xxxxxxxx`). Den setzt du, sobald du die Domain in Brevo hinzufügst — Brevo zeigt dir den exakten String.

---

## 2. Die 3 Alias-Domains (bfsg-barrierecheck.de, bfsg-sofortcheck.de, barrierefrei-pruefen.de)

Bei **jeder** Alias-Domain nur diese 2 Records:

| Typ | Host / Name | Wert | TTL |
|---|---|---|---|
| A | @ | `<HETZNER_IP>` | 3600 |
| A | www | `<HETZNER_IP>` | 3600 |

Caddy übernimmt den 301-Redirect auf bfsg-fix.de automatisch.

---

## Propagation
DNS-Änderungen brauchen 5 Min bis 4 h, bis sie weltweit aktiv sind. Prüfen kannst du sie über:
- https://dnschecker.org
- `dig bfsg-fix.de` auf der Kommandozeile

## Brevo-DKIM-Setup-Flow
1. Domain in Brevo hinzufügen (app.brevo.com → Senders, Domains & dedicated IPs → Domains)
2. Brevo zeigt dir den DKIM-Wert + Verifizierungs-TXT
3. Beide TXT-Records bei INWX eintragen
4. In Brevo „Verifizieren" klicken → grüner Haken
