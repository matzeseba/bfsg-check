# bfsg-fuchs.de Cutover — Schritt-für-Schritt (deine Hände) → dann "weiter"

> **Prinzip (wichtig):** bfsg-fix.de bleibt die GANZE Zeit voll funktionsfähig (inkl. `/webhook`,
> Checkout, Mail). bfsg-fuchs.de wird PARALLEL hochgezogen. So bricht **nichts** am Bezahl-Funnel.
> Die neue Fox-LP ist bereits LIVE auf bfsg-fix.de — dieser Cutover macht nur bfsg-fuchs.de zur
> sichtbaren Haupt-Adresse.

**Server-IP (Ziel für alle Records):** `178.105.83.0` (A) · `2a01:4f8:1c18:d890::1` (AAAA)

---

## ✅ TEIL A — Was DU machst (nur Login-Sachen, die ich nicht darf)

### A1 — INWX DNS für bfsg-fuchs.de  ⟵ PFLICHT (sonst geht die Domain nicht)
INWX → **Mein Konto → Nameserver → DNS** → Domain **bfsg-fuchs.de** wählen.
1. **Lösche** den bestehenden A-Record mit Wert `185.181.104.242` (tote Park-IP).
2. **Trage ein** (identisch zu bfsg-fix.de):

| Typ | Host | Wert | TTL |
|---|---|---|---|
| A | `@` | `178.105.83.0` | 3600 |
| A | `www` | `178.105.83.0` | 3600 |
| AAAA | `@` | `2a01:4f8:1c18:d890::1` | 3600 |
| AAAA | `www` | `2a01:4f8:1c18:d890::1` | 3600 |

→ **Das reicht schon, damit bfsg-fuchs.de live geht.** A2–A4 sind für Mail/Politur.

### A2 — Brevo Mail-Domain bfsg-fuchs.de  ⟵ empfohlen (damit Mails von @bfsg-fuchs.de kommen)
1. https://app.brevo.com → **Senders, Domains & dedicated IPs → Domains → Domain hinzufügen** → `bfsg-fuchs.de`.
2. Brevo zeigt dir **2 Werte**: einen Verifizierungs-TXT (`brevo-code:…`) und einen DKIM-TXT.
3. Diese bei **INWX (bfsg-fuchs.de → DNS)** eintragen + dazu SPF & DMARC:

| Typ | Host | Wert |
|---|---|---|
| TXT | `@` | `v=spf1 include:spf.brevo.com ~all` |
| TXT | `@` | `brevo-code:…` *(Wert von Brevo)* |
| TXT | `mail._domainkey` | *(DKIM-Wert von Brevo)* |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:matthiasseba92@gmail.com` |

4. In Brevo „Verifizieren" klicken (grüner Haken nach 5 Min–4 h).

### A3 — Postfach info@bfsg-fuchs.de  ⟵ empfohlen (Empfang + Kontaktadresse)
INWX (Mail-Easy, wie bei info@bfsg-fix.de): **Weiterleitung `info@bfsg-fuchs.de → matze.seba@outlook.de`** anlegen (+ optional Catch-all `*@bfsg-fuchs.de`). MX-Records wie bei bfsg-fix.de setzen, falls INWX sie nicht automatisch setzt.

### A4 — Stripe Webhook  ⟵ OPTIONAL (Funnel läuft auch ohne)
Nur fürs „sauber langfristig": Stripe-Dashboard → Entwickler → Webhooks → Endpoint **`https://bfsg-fuchs.de/webhook`** ergänzen (den alten bfsg-fix.de-Endpoint **drin lassen**). Nicht nötig fürs Live-Gehen — bfsg-fix.de/webhook bleibt aktiv.

---

## ▶️ Wenn A1 (mind.) erledigt ist: schreib mir **"weiter"**

## 🤖 TEIL B — Was ICH dann mache (automatisch)
1. **Caddy** (`deployment/Caddyfile`, im Repo): `bfsg-fuchs.de` + `www` als neuen, voll funktionalen Vhost ergänzen (Kopie des bfsg-fix.de-Blocks inkl. /webhook, /api, /danke.html, Next-Landing). bfsg-fix.de bleibt **unverändert** aktiv → Let's-Encrypt zieht automatisch ein TLS-Cert für bfsg-fuchs.de.
2. **Frontend** (`lib/config.ts` `SITE.url` + `sitemap.ts`/`robots.ts`): → `https://bfsg-fuchs.de` (canonical/OG/sitemap).
3. → als PR + Merge (kurze Deploy-Freigabe von dir wie eben) → Auto-Deploy.
4. **Server-`.env`** (`PUBLIC_URL`, `FROM_*`, `INVOICE_CONTACT_EMAIL`) → bfsg-fuchs.de (Stripe-Success/Cancel + Rechnungs-/Mail-Links). Mache ich per SSH; falls die Umgebung mich dabei blockt, gebe ich dir 1 fertigen Copy-Paste-Block.
5. **Verifikation:** TLS-Cert + `https://bfsg-fuchs.de/health` grün, Test-Checkout-Redirect landet auf bfsg-fuchs.de, Mail-Absender, 301/Alias-Checks. Screenshot + Report an dich.

> Optionaler Folgeschritt (später, separat): bfsg-fix.de auf 301→bfsg-fuchs.de umstellen + Scanner-Backend-Mails rebranden (eigene PR). Erst NACHDEM Stripe-Webhook auf bfsg-fuchs.de läuft (A4).
