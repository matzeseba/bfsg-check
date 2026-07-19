# Monitoring & Observability (BFSG-Check)

## Stack-Übersicht

| Layer | Tool | Aktivierung | Kosten |
|---|---|---|---|
| Structured Logs | Pino (drop-in) | `npm install pino pino-http pino-pretty` + import | 0 € |
| Error-Tracking | Sentry (optional) | `npm install @sentry/node` + `SENTRY_DSN` in .env | 0 € (5k Events/Mo Free-Plan) |
| Uptime | GitHub-Actions `uptime-watch.yml` | automatisch (alle 5 Min) | 0 € (GH-Actions Free-Minutes) |
| Mail-Alerts | Brevo SMTP (bereits konfiguriert) | GH-Secret `SMTP_USER` + `SMTP_PASS` setzen | 0 € (Brevo Free 300/Tag) |

## Integration in scanner/app.js (5 Min Aufwand nach PR-Merge)

```js
// Am Anfang (vor dem ersten Side-Effect):
import './lib/sentry.js';                 // Init falls SENTRY_DSN gesetzt
import logger, { httpLog } from './lib/logger.js';

// Nach app = express():
app.use(httpLog());

// console.log → logger.info, console.error → logger.error in webhook-Handler, fulfillOrder etc.
// Beispiele:
logger.info({ sessionId: s.id, pkg, amount: s.amount_total }, 'Order paid');
logger.error({ sessionId: s.id, err: err.message }, 'Fulfillment failed');

// Bei Webhook-Fehlern zusätzlich:
import sentry from './lib/sentry.js';
sentry.captureException(err, { webhook_event: event.type, session_id: s.id });

// Process-Level (am Ende der Datei):
process.on('unhandledRejection', (e) => {
  logger.error({ err: e }, 'unhandledRejection');
  sentry.captureException(e, { source: 'unhandledRejection' });
});
```

## Pino-Logger (`scanner/lib/logger.js`)

**Features:**
- JSON-Logs in Produktion (Docker-Logs sammelt das ein)
- Pretty-Format mit Farben in Dev (`NODE_ENV != production`)
- **PII-Redaction**: `authorization`, `cookie`, `stripe-signature`, `*.email`, alle `*_KEY`/`*_SECRET`/`*_PASS`/`*_TOKEN` werden geredact
- HTTP-Middleware via `pino-http` mit eigenem Request-Serializer (URL-`email=` redacted)
- Fallback auf `console` wenn Pino nicht installiert (Drop-in-Safe)
- `LOG_LEVEL=debug` in .env für ausführlichere Logs

## Sentry (`scanner/lib/sentry.js`)

**Features:**
- 10% Trace-Sampling (reicht für 1000-Order/Mo)
- `beforeSend`-Hook redactet PII (E-Mails, Auth-Header, IP-Adressen)
- Drop-In: ohne SENTRY_DSN passiert nichts (lokale Dev OK)
- Exposed: `captureException(err, context)`, `captureMessage(msg, level, context)`

**Setup für Eigentümer:**
1. https://sentry.io/signup/ — Free-Plan (5k Events/Monat)
2. Project anlegen: Platform "Node.js"
3. DSN kopieren (sieht aus wie `https://abc@o123.ingest.sentry.io/456`)
4. In `/opt/bfsg-check/deployment/.env`:
   ```
   SENTRY_DSN=https://abc@o123.ingest.sentry.io/456
   ```
5. `docker compose restart app`

## Uptime-Watch (`.github/workflows/uptime-watch.yml`)

**Mechanik:** alle 5 Minuten curl auf `https://bfsg-fix.de/health`. Fail-Bedingungen:
- HTTP != 200
- JSON-Body enthält nicht `"ok":true`
- (Warning, kein Fail) `"mailer"` ungleich `aktiv`
- (Warning) `"live":false` trotz Stripe konfiguriert

**Alert:** Bei Failure → Brevo-Mail an `matze.seba@outlook.de` mit:
- Failure-Reason
- Workflow-Run-Link
- 4-Schritte Sofortmaßnahmen-Plan (SSH, Logs, Restart, Re-Deploy)

**Mensch-Pflicht GitHub-Secrets:**
- `SMTP_USER` = Brevo SMTP-User (gleicher Wert wie in Server-.env)
- `SMTP_PASS` = Brevo SMTP-Key

(Optional zusätzlich: UptimeRobot Free-Plan für 2nd-Channel-Alert. Nicht zwingend.)

## Failure-Modi & Detection

| Failure | Detection | Alert | Sofortmaßnahme |
|---|---|---|---|
| App-Container down | Uptime-Watch (5 Min) | Brevo-Mail | `docker compose restart app` |
| Stripe-Webhook 500 | Sentry (sofort) | Sentry-Alert-Rule (manuell konfigurieren) | Logs prüfen → resend |
| Mail-Versand failt | sendAlert() (sofort) + Sentry | ADMIN_EMAIL bekommt sendAlert + Sentry | Brevo-Status prüfen, Key rotieren |
| Disk voll | Uptime-Watch (indirekt) | Brevo-Mail | `du -sh /var/lib/docker` + cleanup |
| Out-of-Memory (Playwright) | Sentry + unhandledRejection | Sentry-Alert | `MAX_CONCURRENT_SCANS=1` |
| Cert-Renewal failt | Caddy-Log (manuell) | — | DNS prüfen, Caddy-Logs |

## Dashboard-Vorbereitung (für Welle 4)

Diese Logger-Outputs sind die Datenquellen für das Admin-Dashboard (`admin-next/`):
- `logger.info` mit Tag `order.paid` → MRR-Tracker
- `logger.info` mit Tag `order.mailed` → Fulfillment-Rate
- `logger.error` mit Tag `webhook` → Failure-Rate-Trend
- `/admin/orders` API (aus PR #6) → Datenquelle des Admin-Dashboards (`admin-next/`)

## Sanity-Test nach Setup

```bash
# 1. Pino läuft?
cd /opt/bfsg-check/scanner && node -e "import('./lib/logger.js').then(m => m.default.info('test'))"

# 2. Sentry empfängt?
node -e "import('./lib/sentry.js').then(m => m.captureMessage('sanity-test', 'info'))"
# → in Sentry-Dashboard erscheint "sanity-test" als Event

# 3. Uptime-Watch manuell triggern
gh workflow run uptime-watch.yml
# → Workflow-Run sollte grün sein, kein Alert
```
