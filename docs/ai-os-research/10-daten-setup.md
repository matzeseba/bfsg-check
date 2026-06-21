# Cockpit Daten-Setup — Welche ENV-Variablen für welches Panel

> Stand: 21.06.2026 · BFSG-OS Jarvis-Cockpit · Erstellt: Backend-Architect-Agent

---

## Übersicht: Panels und ihre Credentials

| Panel | Benötigt | ENV-Variable(n) |
|---|---|---|
| 1.1 Tageskasse (Stripe) | Stripe Restricted Key | `STRIPE_API_KEY` |
| 1.2 Monats-Performance | Stripe Restricted Key | `STRIPE_API_KEY` |
| 1.3 Paket-Split | Stripe Restricted Key | `STRIPE_API_KEY` |
| 1.4 Letzte Bestellungen | Admin-Token | `ADMIN_TOKEN` + `PROD_BASE_URL` |
| 2.1 Google Ads Performance | 5 Google Ads Credentials + npm-Paket | Siehe § 3 |
| 2.3 Kampagnen-Übersicht | 5 Google Ads Credentials | Siehe § 3 |
| 2.4 Budget-Ampel | Stripe + Google Ads | Beide oben |
| 3.1 Scan-Funnel | Orders-Daten (Kauf-Count) | `ADMIN_TOKEN` |
| 4.1 Health-Status | kein Credential (öffentlich) | `PROD_BASE_URL` (Standard: `https://bfsg-fix.de`) |
| 4.2 Uptime-History | GitHub Token (empfohlen) | `GITHUB_TOKEN` |
| 4.3 Deploy-Status | GitHub Token (empfohlen) | `GITHUB_TOKEN` + `GITHUB_REPO` |
| 5.1 Unit Economics | Stripe + Google Ads | Beide oben |
| 5.2 Ads-Burn-Rate | Google Ads | Siehe § 3 |

---

## § 1 — Stripe Restricted Read-Key

### Warum Restricted Key statt Secret Key?

Der `rk_live_...`-Restricted-Key hat nur Lese-Rechte und kann keine Zahlungen auslösen.
Das `sk_live_...`-Secret darf **niemals** lokal gespeichert werden.

### Schritt-für-Schritt: Restricted Key erstellen

1. Melde dich an: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Oben rechts: Konto-Icon → **Developers**
3. Linke Sidebar: **API keys** → **Restricted keys** → **+ Create restricted key**
4. Name: `BFSG-Cockpit-ReadOnly`
5. Berechtigungen setzen (nur diese):

| Ressource | Permission |
|---|---|
| Charges | Read |
| Customers | Read |
| Balance transactions | Read |
| Subscriptions | Read |
| Payment Intents | Read |

6. **Create key** → Key beginnt mit `rk_live_...`
7. In `cockpit/.env` eintragen:

```
STRIPE_API_KEY=rk_live_DEIN_KEY_HIER
```

### MRR via Stripe Analytics API

Die Analytics API (Preview-Version `2026-04-22.preview`) liefert MRR automatisch.
Sie benötigt keinen extra Credential — der Restricted Key reicht.
Falls die Analytics API keinen Wert liefert (z.B. weil `ENABLE_ABO=false`), gibt der
Connector `mrr: 0` zurück ohne Fehler.

---

## § 2 — GitHub Personal Access Token (PAT)

Für Deploy-Status (Panel 4.3) und Uptime-History (Panel 4.2).

### Wichtig: Öffentlicher Abruf möglich, aber Rate-Limited

Ohne Token: GitHub API erlaubt 60 anonyme Requests/Stunde. Da der Cockpit-Poller
alle 5 Minuten abruft (2 Workflows × 12 Requests/Stunde), ist das bei normalem Betrieb
ausreichend. Mit Token: 5.000 Requests/Stunde.

**Empfehlung: Token setzen.** Öffentlicher Abruf kann bei GitHub-Lastspitzen drosseln.

### Schritt-für-Schritt: GitHub PAT (Fine-Grained) erstellen

1. GitHub → Dein Profil-Icon → **Settings**
2. Linke Sidebar → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
3. **Generate new token**
4. Einstellungen:

| Feld | Wert |
|---|---|
| Token name | `bfsg-cockpit-readonly` |
| Expiration | 90 Tage (oder "No expiration" für lokales Tool) |
| Repository access | Only selected: `matzeseba/bfsg-check` |
| Permissions → Actions | **Read-only** |
| Permissions → Metadata | **Read-only** (automatisch gesetzt) |

5. **Generate token** → Token beginnt mit `github_pat_...`
6. In `cockpit/.env` eintragen:

```
GITHUB_TOKEN=github_pat_DEIN_TOKEN_HIER
GITHUB_REPO=matzeseba/bfsg-check
```

---

## § 3 — Google Ads API (optional, erfordert Developer Token)

### Voraussetzungen

1. **Google Ads-Konto** mit aktiven Kampagnen
2. **Google Cloud Project** (kostenlos): [https://console.cloud.google.com](https://console.cloud.google.com)
3. **Google Ads Developer Token** — Antrag bei Google (Genehmigung: 2-5 Werktage)
4. **npm-Paket installiert**: `npm install google-ads-api` im `cockpit/`-Verzeichnis

Der Connector startet **ohne das Paket** (`{configured:false}`). Erst nach Installation
werden Ads-Daten abgerufen.

### Schritt-für-Schritt: Credentials besorgen

#### A) Google Cloud OAuth2-Client anlegen

1. [Google Cloud Console](https://console.cloud.google.com) → Projekt wählen/erstellen
2. **APIs & Services** → **Enabled APIs** → **+ ENABLE APIS AND SERVICES**
3. Suche: "Google Ads API" → **Enable**
4. **APIs & Services** → **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Application type: **Desktop app**
6. Name: `bfsg-cockpit`
7. **Create** → `client_id` und `client_secret` kopieren

```
GOOGLE_ADS_CLIENT_ID=DEINE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=DEIN_CLIENT_SECRET
```

#### B) Refresh Token generieren

Nutze das offizielle Google OAuth2-Tool oder den folgenden Einzeiler (Node.js):

```bash
# Einmalig ausführen — öffnet Browser für Google-Login
npx google-auth-library-refresh-token \
  --client_id=$GOOGLE_ADS_CLIENT_ID \
  --client_secret=$GOOGLE_ADS_CLIENT_SECRET \
  --scope=https://www.googleapis.com/auth/adwords
```

Alternativ: [OAuth2 Playground](https://developers.google.com/oauthplayground)
→ Scope: `https://www.googleapis.com/auth/adwords` → Authorize → Exchange → Refresh Token

```
GOOGLE_ADS_REFRESH_TOKEN=DEIN_REFRESH_TOKEN
```

#### C) Developer Token beantragen

1. [Google Ads](https://ads.google.com) → Tools & Einstellungen → **API Center**
2. Wenn noch kein Developer Token: **Apply for production access**
   - Beschreibung: "Eigenes internes Dashboard zur Kampagnenüberwachung"
   - App-Typ: "Internal tool"
3. Google prüft den Antrag (2-5 Werktage)
4. Nach Genehmigung: Developer Token aus dem API Center kopieren

```
GOOGLE_ADS_DEVELOPER_TOKEN=DEIN_DEVELOPER_TOKEN
```

#### D) Customer ID

Die Kunden-ID steht oben rechts in der Google Ads-Oberfläche (Format: `123-456-7890`).
Nur Ziffern verwenden (ohne Bindestriche):

```
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

#### E) npm-Paket installieren

```bash
cd cockpit
npm install google-ads-api
```

Das Backend startet auch ohne dieses Paket — der Connector gibt dann
`{configured:false, setupNote:"Paket 'google-ads-api' nicht installiert..."}` zurück.

---

## § 4 — Scan-Funnel Conversion Rate (Logging-Empfehlung)

### Problem

Die `orders.jsonl` trackt nur bezahlte Bestellungen (Kauf-Count).
Gratis-Scans (Funnel-Einstieg) werden aktuell nicht persistiert.
Ohne Scan-Count ist `convRate` immer `null`.

### Lösung: 1-Zeilen-Logging in scanner/app.js

**NICHT in dieser Session umsetzen** — `scanner/` deployt auf Produktion und
erfordert einen PR-Review-Zyklus.

**Was einzufügen ist (dokumentarisch):**

In `scanner/app.js` in der Route die den Scan-Start verarbeitet
(vermutlich `POST /api/scan` oder ähnlich), direkt nach der URL-Validierung:

```js
// Scan-Start-Logging für Funnel-Conversion-Rate (cockpit/connectors/index.js § convRate)
logger.info({ type: 'scan_start', url: req.body?.url?.replace(/\?.*$/, '') });
```

**Warum diese Position:**
- Nach URL-Validierung (nicht bei offensichtlich ungültigen Requests)
- Vor der eigentlichen Playwright-Ausführung (zählt auch fehlgeschlagene Scans)
- `url` wird query-string-bereinigt (kein PII durch UTM-Parameter)

**Log-Format:** pino JSON, also eine Zeile:
```json
{"level":30,"time":1719000000000,"type":"scan_start","url":"https://example.de/"}
```

**Aggregation im Cockpit:**
Der Cockpit-Connector kann diese Logs via `GET /admin/stats`-Endpoint lesen
(wenn der Scanner einen solchen Endpoint bekommt) oder via Docker-Log-Streaming.

**Erwartetes Update in `connectors/index.js`:**
```js
const convRate = (kaufCount > 0 && scanCount > 0)
  ? r2((kaufCount / scanCount) * 100)
  : null;
```

---

## § 5 — Admin-Endpoint (Bestellungen)

Der Admin-Endpoint `https://bfsg-fix.de/admin/orders` ist bereits im Scanner implementiert.

**Benötigte Credentials:**

```
ADMIN_TOKEN=DEIN_ADMIN_TOKEN
PROD_BASE_URL=https://bfsg-fix.de
```

Den `ADMIN_TOKEN`-Wert findest du in der `.env` auf dem Hetzner-Server unter
`/opt/bfsg-check/deployment/.env` (Feld `ADMIN_TOKEN`).

**Abruf-Test:**
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://bfsg-fix.de/admin/orders | head -c 500
```

---

## § 6 — Vollständige .env für alle Panels

```dotenv
# --- Server ---
COCKPIT_PORT=4317
COCKPIT_HOST=127.0.0.1

# --- Claude ---
CLAUDE_BIN=claude
CLAUDE_MAX_TURNS=12
JOB_CONCURRENCY=2

# --- § 1: Stripe ---
STRIPE_API_KEY=rk_live_...

# --- § 2: Admin-Endpoint ---
PROD_BASE_URL=https://bfsg-fix.de
ADMIN_TOKEN=...

# --- § 2: GitHub ---
GITHUB_TOKEN=github_pat_...
GITHUB_REPO=matzeseba/bfsg-check

# --- § 3: Google Ads (optional, nach Developer-Token-Genehmigung) ---
GOOGLE_ADS_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=...

# --- Voice ---
STT_URL=http://127.0.0.1:5301
TTS_URL=http://127.0.0.1:5302
VOICE_ENABLED=true

# --- Business-Konstanten ---
CAC_CEILING=177
ADS_BUDGET_MONTH=600
```

---

## § 7 — Prioritäts-Reihenfolge für den Start

Für das erste Go-Live des Cockpits (lokal):

1. **Sofort** (keine Wartezeit, kein Antrag):
   - `STRIPE_API_KEY` → alle Revenue-Panels live
   - `ADMIN_TOKEN` → Bestellungs-Panel live
   - `PROD_BASE_URL` → Health-Panel (ist schon Standard-Wert)

2. **10 Minuten** (PAT-Erstellung):
   - `GITHUB_TOKEN` → Deploy + Uptime-Panels live

3. **2-5 Werktage** (Google-Antrag):
   - `GOOGLE_ADS_*` + `npm install google-ads-api` → Ads-Panels live

---

*Erstellt: 21.06.2026 · Backend-Architect-Agent · BFSG-OS Cockpit Setup-Doku*
