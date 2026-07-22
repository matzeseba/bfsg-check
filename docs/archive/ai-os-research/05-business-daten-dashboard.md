# Business-Daten & Dashboard-Informationsarchitektur — Jarvis-Cockpit BFSG-Check

> Recherche-Agent #5 · Stand: 21.06.2026 · Autor: Analytics Reporter (Claude Code)

---

## Executive Summary

- **North-Star-Metrik** ist Revenue per Day (Tages-Umsatz), flankiert von CAC vs. CAC-Ceiling (177 EUR). Alles andere ist nachrangig — ein Solo-Founder braucht maximal 8-10 KPIs im Blickfeld, nicht 30.
- **Alle Kerndatenquellen sind per MCP erschlossen:** Stripe hat einen offiziellen Remote-MCP-Server (`mcp.stripe.com`) mit Analytics-API (MRR, ARR, revenue_growth); Google Ads hat einen offiziellen MCP-Server (read-only, GAQL-Queries); Brevo hat seit Anfang 2026 einen eigenen MCP-Server (Kampagnen + Analytics); GitHub hat einen offiziellen MCP-Server (Workflow-Status, Deployment-Monitoring).
- **Kritische Lücke:** Das offizielle Google Ads MCP ist read-only — Kampagnen-Erstellung erfordert den Direktzugriff auf die Google Ads API (Node.js-Client `google-ads-api@24.1.0`) oder einen Community-MCP mit Write-Zugriff. Microsoft Ads hat keinen First-Party-MCP (erwartet Q4 2026); Community-Implementierungen (bing-ads-mcp via Bun/TypeScript-SDK) sind vorhanden, aktualitaetspruefung noetig.
- **Real-Time ist nur fuer /health noetig.** Stripe/Ads-Daten reichen mit 5-60-Minuten-Polling (API-Latenz ohnehin ca. 1h bei Stripe Analytics). Scan-Logs (JSONL) koennen bei jedem Cockpit-Refresh direkt gelesen werden.
- **Flow "Neue Kampagne erstellen"** muss zwingend mit Freigabe-Gate implementiert werden (Campaigns starten PAUSED, User bestaetigt vor Go-Live) — Google-Ads-API-Direktzugriff ist vorhanden aber riskant ohne Budget-Cap-Guardrail.

---

## North-Star + Top-KPIs

### North-Star-Metrik

**Revenue per Day (EUR/Tag)**

Formel: `SUM(stripe.charges.amount WHERE status='succeeded' AND date=today) / 100`
Quelle: Stripe API — `GET /v1/charges?created[gte]=today_00:00` oder Stripe Analytics API `revenue.mrr` (taeglich granuliert)
Warum: Einzige Metrik, die unmittelbar zeigt ob das Business Geld verdient. Bei 0 EUR/Tag nach 7 Tagen Ads = sofortiger Handlungsbedarf.

---

### Top-KPIs (Cockpit-Header, immer sichtbar)

| # | KPI | Formel | Datenquelle | Refresh |
|---|---|---|---|---|
| 1 | **Umsatz heute** (EUR) | `SUM(charges.amount[today]) / 100` | Stripe API `/v1/charges` | 5 min |
| 2 | **Umsatz Monat** (EUR) | `SUM(charges.amount[MTD]) / 100` | Stripe API `/v1/charges` | 15 min |
| 3 | **MRR** (EUR) | `revenue.mrr` aus Analytics API (0 bis Abo aktiviert; dann automatisch) | Stripe Analytics API | 1h |
| 4 | **Sales Count (heute / MTD)** | `COUNT(charges WHERE status='succeeded' AND pkg IN [basis,profi,...])` | Stripe API + orders.jsonl | 5 min |
| 5 | **CAC (Ads-Kanal)** | `ads_spend_mtd / sales_count_mtd` vs. Ceiling 177 EUR | Google Ads API + Bing Ads API / Stripe | 1h |
| 6 | **ROAS gesamt** | `umsatz_mtd / ads_spend_mtd` (Ziel >= 2,0x) | Google + Bing Spend vs. Stripe Revenue | 1h |
| 7 | **Conversion-Rate Scan→Sale** | `COUNT(orders_PAID) / COUNT(scans_started)` | orders.jsonl + scan-Logs | 1h |
| 8 | **Site-Health** | Binary: OK / DEGRADED / DOWN (`/health` JSON-Check) | `bfsg-fix.de/health` Polling | 30 sec |
| 9 | **Deploy-Status** | Letzter GitHub-Actions-Run: SUCCESS/FAILURE + Timestamp | GitHub API / GitHub MCP | 5 min |
| 10 | **AOV (Average Order Value)** | `umsatz_mtd / sales_count_mtd` (Ziel 350 EUR) | Stripe API | 1h |

**Hinweis MRR:** Aktuell `ENABLE_ABO=false` → MRR = 0. KPI trotzdem einbauen — wird automatisch aktiv sobald Abos aktiviert werden. Bis dahin: "MRR: 0 EUR (Abo deaktiviert)".

---

## Dashboard-Informationsarchitektur

### Bereich 1: Revenue & Sales

**Panel 1.1 — Tageskasse (MUSS)**
- Metriken: Umsatz heute (EUR), Sales heute (Count), AOV heute
- Viz: Grosse Zahl + Mini-Sparkline (letzte 7 Tage)
- Frequenz: 5 min
- Quelle: Stripe API `/v1/charges`

**Panel 1.2 — Monats-Performance (MUSS)**
- Metriken: Umsatz MTD vs. Vormonat, Sales MTD, MRR (wenn Abo aktiv)
- Viz: Bar-Chart Monat-Vergleich + Fortschrittsbalken Monatsziel
- Frequenz: 15 min
- Quelle: Stripe API (Charges + Analytics API)

**Panel 1.3 — Umsatz nach Paket (MUSS)**
- Metriken: Split Basis/Profi/Cookie-Basis/Cookie-Profi/Abo (Anzahl + EUR)
- Viz: Donut-Chart + Tabelle
- Frequenz: 1h
- Quelle: Stripe API (Charges mit Metadata `pkg`)

**Panel 1.4 — Letzte Bestellungen (MUSS)**
- Metriken: Letzten 10 Bestellungen (Email domain, Paket, Betrag, Status, Timestamp)
- Viz: Live-Feed / Tabelle (Email wird zu Domain anonymisiert)
- Frequenz: 1 min
- Quelle: `scanner/out/orders.jsonl` (direktes File-Read) + Stripe API als Fallback

---

### Bereich 2: Marketing & Kampagnen

**Panel 2.1 — Google Ads Performance (MUSS)**
- Metriken: Impressionen, Clicks, CTR (%), CPC (EUR), Spend heute/MTD, Conversions, ROAS
- Viz: KPI-Kacheln + Tages-Kurve (Spend vs. Conversions)
- Frequenz: 1h
- Quelle: Google Ads API (GAQL via MCP oder direkter API-Call)

**Panel 2.2 — Bing/Microsoft Ads Performance (MUSS, sobald Konto aktiv)**
- Metriken: Clicks, Spend MTD, Conversions, CPC
- Viz: Kompakt-Kacheln
- Frequenz: 1h
- Quelle: Microsoft Advertising API (Community bing-ads-mcp oder REST API direkt)

**Panel 2.3 — Kampagnen-Uebersicht (MUSS)**
- Metriken: Aktive Kampagnen (Name, Status, Budget/Tag, Spend MTD, ROAS), Paused/Enabled-Toggle sichtbar
- Viz: Tabelle mit Status-Ampel
- Frequenz: 15 min
- Quelle: Google Ads API + Bing Ads API

**Panel 2.4 — Budget-Ampel (MUSS)**
- Metriken: Ads-Tagesbudget used vs. Cap (Google: 13 EUR, Bing: 4 EUR), Gesamt-CAC live vs. Ceiling 177 EUR
- Viz: Fortschrittsbalken mit Rot-Schwelle
- Frequenz: 30 min
- Quelle: Google Ads API + Bing Ads API

**Panel 2.5 — Brevo Email-Metriken (NICE-TO-HAVE v2)**
- Metriken: Letzte Kampagne (Open Rate, Click Rate, Bounce), Kontaktlisten-Wachstum
- Viz: Tabelle
- Frequenz: 6h
- Quelle: Brevo MCP / Brevo REST API

**Panel 2.6 — SEO-Sichtbarkeit (NICE-TO-HAVE v2)**
- Metriken: Organische Klicks (Google Search Console), Top-Landingpages, Keyword-Rankings fuer 3 Pillar-Targets
- Viz: Tabelle
- Frequenz: 24h
- Quelle: Google Search Console API (OAuth)

---

### Bereich 3: Funnel & Leads

**Panel 3.1 — Scan-Funnel (MUSS)**
- Metriken: Gratis-Scans gestartet (heute/MTD), Teaser-Anzeigen, Checkout-Oeffnungen, Kaeufe → Conversion-Rate je Stufe
- Viz: Funnel-Chart (4 Stufen: Scan → Teaser → Checkout → Kauf)
- Frequenz: 1h
- Quelle: `scanner/out/orders.jsonl` (PAID-Count) + Scanner-Logs (Scan-Count aus pino-Logs oder neuem Counter-Endpoint)

**Panel 3.2 — Leads-Pipeline (NICE-TO-HAVE, wenn Notion aktiviert)**
- Metriken: Leads nach Stage (Interessiert / Demo / Angebot / Gewonnen / Verloren), naechste Aktionen
- Viz: Kanban-Preview
- Frequenz: 15 min
- Quelle: Notion MCP (bereits konfiguriert in `.claude/settings.local.json`)

---

### Bereich 4: Website & Reliability

**Panel 4.1 — Health-Status (MUSS, real-time)**
- Metriken: `ok`, `stripe`, `live`, `mailer`, `aboEnabled` aus `/health`-Endpoint
- Viz: 5 Status-Indikatoren (Gruen/Rot) + letzter Check-Timestamp
- Frequenz: 30 Sekunden
- Quelle: `https://bfsg-fix.de/health` (direktes HTTP-Polling)

**Panel 4.2 — Uptime-History (MUSS)**
- Metriken: Uptime % letzte 7/30 Tage, Incidents, MTTR (Mean Time to Recovery)
- Viz: Uptime-Balken (gruen/rot per Tag) + SLA-Zahl (Ziel 99,9%)
- Frequenz: 5 min
- Quelle: GitHub Actions `uptime-watch.yml` Logs (Workflow-Runs-API) ODER eigener Uptime-Log-Accumulator

**Panel 4.3 — Deploy-Status (MUSS)**
- Metriken: Letzter Deploy (Commit-SHA, Branch, Timestamp, SUCCESS/FAILURE), GitHub Actions Status
- Viz: Badge-Style + Link zum Workflow-Run
- Frequenz: 5 min
- Quelle: GitHub MCP (`github/github-mcp-server`) → `actions.listWorkflowRuns`

**Panel 4.4 — Scan-Performance (NICE-TO-HAVE v2)**
- Metriken: Durchschnittliche Scan-Dauer (sec), Fehlerrate, Top-Fehler-URLs
- Viz: Zeitreihe
- Frequenz: 1h
- Quelle: Docker-Logs / pino-JSON-Logs (`scanner/out/` oder Docker `stdout`)

---

### Bereich 5: Finanzen & Runway

**Panel 5.1 — Unit Economics (MUSS)**
- Metriken: CAC (aktuell vs. Ceiling 177 EUR), LTV (AOV × geschaetzte Wiederkauf-Rate), LTV:CAC-Ratio (Ziel >=3:1), Gross-Margin (Umsatz minus Stripe-Fees 1,4% + 0,25 EUR je Transaktion)
- Viz: KPI-Kacheln mit Ampel
- Frequenz: 1h
- Quelle: Berechnung aus Stripe + Ads-Spend

**Panel 5.2 — Ads-Burn-Rate (MUSS)**
- Metriken: Gesamt-Ads-Spend MTD vs. Budget (600 EUR/Mo), Tages-Burn-Rate, Break-Even (wann deckt Umsatz Ads-Kosten)
- Viz: Burn-Down-Chart
- Frequenz: 1h
- Quelle: Google Ads + Bing Ads API

**Panel 5.3 — Stripe-Fees & Net Revenue (NICE-TO-HAVE v2)**
- Metriken: Gross Revenue, Stripe-Fees (ca. 1,4% + 0,25 EUR), Net Revenue, Refunds-Betrag
- Viz: Tabelle
- Frequenz: 24h
- Quelle: Stripe API `/v1/balance_transactions`

---

### Bereich 6: Agent-Aktionen (Cockpit-interne Tools)

**Panel 6.1 — Neue Kampagne erstellen (MUSS)**
- Flow: Eingabe-Formular → Agent-Vorschlag (Headlines, Keywords, Budget) → Vorschau → User-Freigabe → PAUSED-Push via API
- Details: siehe Abschnitt "Flow: Neue Werbekampagne erstellen"

**Panel 6.2 — Quick-Actions (NICE-TO-HAVE v2)**
- Aktionen: "Scan-Report neu versenden", "Refund ausfuehren" (mit Betragsanzeige), "Health-Check Now", "Deploy-Trigger"
- Quelle: Stripe API (Refund), scanner/app.js Admin-Endpoints, GitHub API (workflow_dispatch)

---

## Daten-Quellen-Mapping je Panel

### Stripe

**Aktueller Stand (Juni 2026):**
- Offizieller Remote-MCP-Server: `https://mcp.stripe.com` (OAuth-Authentifizierung)
- Stripe Analytics API: `POST /v1/data/metric_queries` (API-Version `2026-04-22.preview`)
- Verfuegbare Analytics-Metriken: `revenue.mrr`, `revenue.arr`, `revenue_growth.mrr` (nach change_type: new/churn/expansion/contraction), `revenue_growth_rate.mrr`
- Einzel-Transaktionen: `GET /v1/charges`, `GET /v1/payment_intents`, `GET /v1/balance_transactions`
- Kunden-Daten: `GET /v1/customers`
- Abos: `GET /v1/subscriptions` (fuer spaeter, wenn `ENABLE_ABO=true`)

**Abrufweg fuer Cockpit:**
```
Option A (empfohlen): Stripe MCP via Claude Code
  → stripe.mcp.run("list_charges", { limit: 50, created: { gte: today } })
  
Option B (Backend-Polling): Node.js cron im Jarvis-Backend
  → stripe.charges.list({ limit: 100, created: { gte: startOfMonth } })
  → Ergebnis in Redis/Memory cachen, Dashboard pollt /api/stripe-summary
```

**Wichtig:** Stripe Analytics API hat ca. 1h Latenz. Fuer Echtzeit-Verkaufsbenachrichtigungen besser `orders.jsonl` (Append-Log hat < 1s Latenz nach Webhook).

---

### Scanner-Logs (orders.jsonl + Scan-Logs)

**Pfad auf Server:** `/opt/bfsg-check/scanner/out/orders.jsonl`

**JSONL-Schema (aus `scanner/lib/orders.js`):**
```json
{
  "eventId": "evt_stripe_...",
  "sessionId": "cs_live_...",
  "email": "[REDACTED in Logs]",
  "customerId": "cus_...",
  "url": "https://kunde.de",
  "pkg": "basis|profi|cookie-basis|cookie-profi|abo",
  "amount": 19900,
  "status": "PAID|FULFILLED|FAILED",
  "ts": "2026-06-21T10:00:00.000Z"
}
```

**Abrufweg fuer Cockpit:**
```
Option A: Jarvis-Backend liest Datei direkt (SSH-Mount oder Admin-Endpoint)
  → GET /admin/orders (besteht bereits, via requireAdminAuth)
  
Option B: Scanner-App wird um /admin/stats-Endpoint erweitert
  → gibt aggregierte Counts zurueck (scans_today, sales_today, conv_rate)
```

**Scan-Count-Problem:** Aktuelle JSONL trackt nur ORDERS (Kaeufe). Gratis-Scans (ohne Kauf) werden nicht persistiert. Fuer Funnel-Analyse (`Scans → Teaser → Kauf`) muss ein Scan-Log-Eintrag bei `/api/scan-start` ergaenzt werden (neue Zeile in `app.js`).

---

### Google Ads

**Aktueller Stand (Juni 2026):**
- Offizieller Google MCP-Server: `github.com/googleads/google-ads-mcp` (read-only, GAQL-Queries)
- MCP-Capabilities: `list_accessible_customers`, `search` (GAQL), `get_resource_metadata`
- **Einschraenkung: Read-only. Kampagnen-Erstellung geht NUR ueber Google Ads API direkt.**
- Node.js Client: `google-ads-api@24.1.0` (Opteo, npm), OAuth2 mit Developer Token
- API-Version: v20 (Stand Juni 2026, Google-Ads-Developer-Blog 2026)

**GAQL-Query fuer Panel 2.1:**
```sql
SELECT 
  campaign.name,
  campaign.status,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.ctr
FROM campaign
WHERE segments.date DURING TODAY
  AND campaign.status = 'ENABLED'
```

**Abrufweg:**
```
Jarvis-Backend → google-ads-api Node.js Client → /api/google-ads-summary
ODER
Claude Code → Google Ads MCP (search-Tool) → parse GAQL-Response
```

**Auth:** `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID` als Env-Variablen auf Server.

---

### Microsoft Advertising (Bing Ads)

**Aktueller Stand (Juni 2026):**
- Kein First-Party-MCP (erwartet innerhalb 12 Monate laut Recherche)
- Community-Implementierung: `bing-ads-mcp` (Bun + TypeScript-SDK, Claude-kompatibel)
- Alternative: `syntermedia.ai` Synter MCP fuer Microsoft Ads
- REST API ab Oktober 2026 einzig neue Features (SOAP laeuft weiter bis Ablauf)
- Auth: OAuth2 mit Microsoft-Account, Client-ID/Secret aus Azure AD App

**Wichtige Pruefpflicht:** Community-MCPs auf letzten Commit-Datum pruefen — Microsoft Ads API aendert sich monatlich. MCP mit > 90 Tagen ohne Update ist potentiell gebrochen.

**Abrufweg fuer Cockpit (Empfehlung):**
```
Microsoft Advertising REST API direkt (TypeScript/Node.js)
→ GET /v13/campaigns (mit OAuth Bearer Token)
→ GET /v13/reports/performance (fuer Spend/Klicks/Conversions)
→ Cockpit-Backend cached Ergebnis stundlich
```

---

### Brevo

**Aktueller Stand (Juni 2026):**
- Offizieller Brevo MCP-Server: verfuegbar seit Q1 2026 (Brevo AI Lab Initiative)
- Setup: Brevo Dashboard → Settings → SMTP & API → API Keys & MCP → MCP-Key generieren
- Capabilities: Email-Kampagnen (list/get/create/update/send/schedule/reports), Kontakt-Management, Analytics, SMS, WhatsApp
- Direkter API-Zugriff: `https://api.brevo.com/v3/` (REST, API-Key-Auth)

**Fuer Dashboard relevant:**
- `GET /v3/emailCampaigns?status=sent` → letzte versendete Kampagnen + Stats (openRate, clickRate, bounces)
- `GET /v3/contacts?limit=50&createdSince=...` → neuer Kontakt-Zuwachs

**Abrufweg:**
```
Option A: Brevo MCP via Claude Code (empfohlen fuer agentic Actions)
Option B: Direkte REST-API im Jarvis-Backend (fuer Dashboard-Polling)
```

---

### GitHub

**Aktueller Stand (Juni 2026):**
- Offizieller GitHub MCP-Server: `github/github-mcp-server` (produktiv, weitverbreitet)
- Capabilities: Workflow-Runs abfragen, Repository-Status, Issues, PRs, Actions-Logs
- Token: GitHub Personal Access Token (PAT) oder GITHUB_TOKEN aus Actions

**Abrufweg fuer Panel 4.3 (Deploy-Status):**
```
GitHub MCP → actions.listWorkflowRuns({
  owner: "matzeseba",
  repo: "bfsg-check",
  workflow_id: "deploy.yml",
  per_page: 1
})
→ gibt letzten Run-Status (success/failure/in_progress) + Timestamp
```

**Abrufweg fuer Panel 4.2 (Uptime-History via uptime-watch.yml):**
```
GitHub MCP → actions.listWorkflowRuns({
  workflow_id: "uptime-watch.yml",
  per_page: 200  // letzte 200 Checks = ca. 16h
})
→ Failure-Runs = Downtime-Episoden → Uptime % berechnen
```

---

### Porter Metrics (bereits als MCP verfuegbar in dieser Session)

Porter Metrics ist als MCP-Server `47053f07-e962-4fa2-b094-f707478f638b` in dieser Session aktiv. Er kann fuer die Verbindung zu Google Ads und anderen Marketing-Plattformen genutzt werden. Vorher `mcp__47053f07__whoami()` aufrufen um Auth-Status zu pruefen.

---

## Flow: "Neue Werbekampagne erstellen" ueber das Dashboard

### Schritt-fuer-Schritt-Flow

```
[1] USER: Klickt "Neue Kampagne" im Cockpit-Panel 6.1
         Waehlt: Kanal (Google Ads / Bing Ads)
         Gibt ein: Kampagnen-Ziel (z.B. "BFSG-Basis-Paket, Zielgruppe: 
                  Webagenturen DACH, Budget: 10 EUR/Tag")

[2] AGENT (Ad Creative Strategist / PPC Campaign Strategist):
         Liest: marketing/google-ads-rsa-headlines.md (bestehende Headlines)
         Liest: marketing/google-ads-keywords.csv (50+ Keywords)
         Liest: marketing/google-ads-negatives.csv
         Generiert:
           - 15 RSA-Headlines (max. 30 Zeichen, Keyword-Mix + Benefit + CTA)
           - 4 Descriptions (max. 90 Zeichen)
           - 10-20 Keywords (Keyword-Mix: exact/phrase/broad, mit Match-Type-Label)
           - Budget-Vorschlag (default: Eingabe-Wert)
           - Kampagnen-Struktur (1 Campaign → 1 Ad Group → 1 RSA + Keywords)
         
[3] COCKPIT: Zeigt Vorschau-Panel:
         - RSA-Preview (Google-style: Headline 1 | Headline 2 | Headline 3)
         - Keyword-Tabelle (Match-Type + Estimated CPC)
         - Budget-Uebersicht (x EUR/Tag = y EUR/Mo)
         - CAC-Projektion (bei erwarteter CTR/Conv-Rate)
         - GUARDRAIL: "Budget-Cap-Check: x EUR/Tag <= 13 EUR Limit? JA/NEIN"
         - LEGAL-CHECK: "Headlines enthalten keine verbotenen Begriffe (garantiert/BFSG-konform)?"

[4] USER: Review + Freigabe (oder Ablehnung mit Feedback → zurueck zu [2])

[5] AGENT: Bei Freigabe:
         → Google Ads API: `campaigns.mutate({ operations: [{ create: { ... } }] })`
            Status: PAUSED (immer, sicherer Default)
         → Gibt Campaign-ID + URL zur Google Ads UI zurueck
         
[6] COCKPIT: Zeigt Bestaetigung:
         "Kampagne 'BFSG-Basis-DACH' erstellt (ID: 123456789) — Status: PAUSED
          Zum Aktivieren: [Link Google Ads UI]"
         
[7] USER: Aktiviert manuell in Google Ads UI (bewusstes Final-Gate)
```

### Guardrails (Pflicht)

| Guardrail | Regel | Aktion bei Verletzung |
|---|---|---|
| Budget-Cap | Tagesbudget <= 15 EUR (Google) / 5 EUR (Bing) | Cockpit blockiert, User-Alert |
| Legal-Woerter | Keine "garantiert", "BFSG-konform", "rechtssicher", "TUeV" | Agent prueft, markiert Fehler |
| RSA-Zeichen-Limit | Headlines <= 30 Zeichen, Descriptions <= 90 Zeichen | Agent validiert, Auto-Kuerzung |
| Status PAUSED | Kampagnen starten IMMER paused | Hard-coded, nicht uebersteuerbar |
| Freigabe-Pflicht | Kein Auto-Push ohne User-Bestaetigung in Schritt [4] | Modal mit explizitem "Jetzt erstellen"-Button |
| Google-Developer-Token | Muss PRE-PRODUCTION → PRODUCTION freigegeben sein (Google-Review-Prozess) | Cockpit zeigt Setup-Status |

### Agent-Zuweisung

- Kampagnen-Strategie + RSA-Headlines: **Ad Creative Strategist** (`agency/marketing/ad-creative-strategist.md`)
- Budget-Kalkulation + ROAS-Projektion: **PPC Campaign Strategist** (`agency/paid-media/ppc-campaign-strategist.md`)
- API-Push: **DevOps Automator** oder direkter API-Call im Jarvis-Backend

---

## Real-time vs. Batch (Refresh-Strategie)

| Panel | Refresh-Frequenz | Methode | Begruendung |
|---|---|---|---|
| Site-Health (`/health`) | 30 Sekunden | HTTP-Polling | Downtime sofort erkennen |
| Letzte Bestellungen (orders.jsonl) | 60 Sekunden | File-Watch oder Admin-API-Poll | Verkaufe sollen unmittelbar erscheinen |
| Deploy-Status (GitHub Actions) | 5 Minuten | GitHub API | Deploy-Zyklen dauern Minuten |
| Uptime-Watch (GitHub Actions Runs) | 5 Minuten | GitHub API | Sync mit 5-min-Watch-Interval |
| Tages-Umsatz (Stripe Charges) | 5 Minuten | Stripe API `/v1/charges` | Near-Realtime reicht fuer Entscheidungen |
| Google Ads Performance | 60 Minuten | Google Ads API (GAQL) | API-Limits, Daten lag ohnehin 1-3h |
| Bing Ads Performance | 60 Minuten | Microsoft Ads API | Gleiche Begruendung |
| Stripe Analytics (MRR/ARR) | 60 Minuten | Stripe Analytics API | Offizielle Latenz: ca. 1h |
| Stripe Paket-Split | 60 Minuten | Stripe API + JSONL | Slow-changing |
| Brevo Email-Stats | 6 Stunden | Brevo API / MCP | Kampagnen-Daten veraendern sich langsam |
| Scan-Funnel-Conversion-Rate | 60 Minuten | JSONL-Parse + Log-Aggregation | Ausreichend fuer taktische Entscheidungen |
| SEO-Visibility | 24 Stunden | GSC API | GSC-Daten haben 2-3 Tage Lag |

### Caching-Strategie

```
Architektur-Empfehlung fuer Jarvis-Backend:

1. Background-Poller (Node.js Scheduler / setInterval):
   - Jede Quelle pollt in eigener Frequenz (s. Tabelle)
   - Ergebnisse in Memory-Store (Map) oder Redis (falls persistent)
   
2. Dashboard-Frontend pollt /api/cockpit-data alle 60 Sekunden:
   - Backend antwortet sofort aus Cache (< 5ms)
   - Cache wird async im Hintergrund frisch gehalten
   
3. /health-Sonderfall:
   - Frontend pollt /health direkt (kein Backend-Proxy, minimaler Overhead)
   - Bei Fehler: sofortige Rot-Anzeige + Browser-Notification (falls Permission erteilt)

4. Stripe-Charges-Sonderfall (Bestellungs-Alarm):
   - orders.jsonl-File-Watch via `fs.watch()` auf Server
   - Oder: Stripe-Webhook-Event triggert Dashboard-Push (WebSocket / SSE)
   - → Sale erscheint binnen Sekunden im Dashboard, nicht nach 5min-Poll
```

---

## Priorisierung MUST-HAVE (v1) vs. NICE-TO-HAVE

### MUST-HAVE fuer v1 (Launch-Tag, maximal 2-3 Tage Implementierungsaufwand)

| Panel | Aufwand | Warum MUSS |
|---|---|---|
| 1.1 Tageskasse | 2h | North-Star, sofortige Business-Sichtbarkeit |
| 1.2 Monats-Performance | 2h | Trend-Erkennung, Ziel-Tracking |
| 1.3 Paket-Split | 1h | Weiss welches Paket laeuft (Marketing-Optimierung) |
| 1.4 Letzte Bestellungen | 2h | Echtzeit-Feedback, Fulfillment-Check |
| 2.1 Google Ads Performance | 3h | 13 EUR/Tag Investment — muss sichtbar sein |
| 2.3 Kampagnen-Uebersicht | 2h | Kampagnen-Status auf einen Blick |
| 2.4 Budget-Ampel | 1h | CAC-Ceiling-Guardrail (Pflicht-Sicherheitsnetz) |
| 3.1 Scan-Funnel | 4h | Wichtigste Optimierungsmetrik (wo brechen Nutzer ab) |
| 4.1 Health-Status | 1h | Site-Down sofort sehen |
| 4.2 Uptime-History | 2h | SLA-Monitoring |
| 4.3 Deploy-Status | 1h | Deploy-Risiko-Kontrolle |
| 5.1 Unit Economics | 2h | CAC vs. Ceiling — Kern-Business-Metrik |
| 5.2 Ads-Burn-Rate | 1h | Budget-Kontrolle |
| 6.1 Neue Kampagne erstellen | 6h | Zentrales AI-Cockpit-Feature |

**Gesamt v1: ca. 30h Implementierungsaufwand**

### NICE-TO-HAVE fuer v2 (nach ersten 10 Sales)

| Panel | Aufwand | Begruendung |
|---|---|---|
| 2.2 Bing Ads Performance | 3h | Erst wenn Konto aktiv + laeuft |
| 2.5 Brevo Email-Metriken | 2h | Relevant wenn Newsletter-Liste waechst |
| 2.6 SEO-Sichtbarkeit | 4h | GSC-API-Setup aufwaendig, SEO-Effekte erst nach Wochen |
| 3.2 Leads-Pipeline (Notion) | 3h | Notion-Datenbank muss erst aufgebaut werden |
| 4.4 Scan-Performance | 3h | Nur relevant wenn Fehlerrate steigt |
| 5.3 Stripe-Fees & Net Revenue | 2h | Praezision gut, aber nicht entscheidungsrelevant in Phase 1 |
| 6.2 Quick-Actions | 4h | Komfort-Feature, kein Business-Blocker |

---

## Risiken & Gotchas

### 1. Google Ads MCP ist Read-Only

Das offizielle `googleads/google-ads-mcp` kann Kampagnen NUR lesen, nicht erstellen. Fuer den "Neue Kampagne"-Flow braucht man:
- Option A: Direkten Google Ads API-Call via `google-ads-api` Node.js Client (aufwaendiges OAuth-Setup, Developer-Token-Antrag bei Google noetig — Genehmigung dauert 2-5 Werktage)
- Option B: Community-MCP mit Write-Zugriff (z.B. `gomarble-ai/google-ads-mcp` oder `adkit.so`) — weniger vertrauenswuerdig, Sicherheitspruefung noetig
- Option C: Cockpit erstellt Kampagne als "Draft" im Dashboard, User klickt in Google Ads UI auf "Aktivieren" (kein API-Push noetig, aber weniger nahtlos)

**Empfehlung:** Fuer Phase 1 Option C (Draft-Export); Developer-Token-Antrag parallel stellen.

### 2. Scan-Count fehlt in JSONL

Die `orders.jsonl` trackt nur bezahlte Orders. Gratis-Scans (Funnel-Einstieg) werden nicht persistiert. Fuer Conversion-Rate-Berechnung muss entweder:
- Ein Scan-Start-Log-Eintrag in `scanner/app.js` ergaenzt werden (5-Zeiler), ODER
- Docker-Logs geparst werden (HTTP-Requests auf `/api/scan`)
**Empfehlung:** Minimaler Scan-Counter in `app.js` (1 Zeile `logger.info({type:'scan_start', url})`) + Log-Aggregation.

### 3. Bing Ads: kein offizieller MCP, REST-API-Migration Oktober 2026

SOAP-API laeuft weiter, aber neue Features nur noch REST. Community-MCPs koennen veraltet sein. Pruefe bei jedem genutzten MCP: letzter Commit < 90 Tage alt.

### 4. Stripe Analytics API im Preview-Status

`API-Version 2026-04-22.preview` — Breaking Changes moeglich. Direkte Charges-API ist stabiler fuer Echtzeit-Daten. Analytics API nutzen nur fuer MRR/ARR-Langzeittrends.

### 5. Health-Endpoint gibt `aboEnabled: false` — Dashboard muss das korrekt darstellen

MRR-Panel zeigt "0 EUR (Abo deaktiviert)" — nicht als Bug, sondern als erklaerter Status. Wenn `ENABLE_ABO` auf `true` wechselt, muss Dashboard keine Code-Aenderung benoetigen (dynamisch aus `/health` lesen).

### 6. Google Developer Token Genehmigung

Fuer produktiven Google Ads API-Zugriff mit echten Kundendaten braucht man einen PRODUCTION-Developer-Token (nicht nur TEST-Level). Google-Review-Prozess dauert 2-5 Werktage nach Antrag. Fuer Dashboard-Phase-1 reicht der TEST-Token (eigene Kampagnen, kein Kundenzugriff).

### 7. PII in orders.jsonl

Die `orders.jsonl` enthaelt Kunden-E-Mail-Adressen (unverschluesselt). Dashboard darf diese NUR als Domain anzeigen (`domain.de` statt `name@domain.de`). Admin-API-Endpoint muss Emails redaktieren. Bereits konfiguriert: pino-Logger redaktet `*.email` — aber die JSONL selbst enthaelt Klartext.

### 8. Porter Metrics MCP (in Session aktiv)

Porter Metrics (`mcp__47053f07__*`) ist als MCP in dieser Session verfuegbar und koennte als Daten-Aggregator fuer Google Ads + andere Marketing-Plattformen genutzt werden, ohne eigene API-Integrationen zu bauen. Pruefe via `mcp__47053f07__whoami()` ob bereits Connectors konfiguriert sind.

---

## Offene Entscheidungen fuer den User

| # | Entscheidung | Optionen | Empfehlung | Auswirkung |
|---|---|---|---|---|
| E1 | Cockpit-Architektur: Standalone oder in Admin-Next integriert? | A) Neues Next.js-Dashboard in `admin-next/` | B) Separater Single-Page HTML-Cockpit (keine Deps) | B fuer Phase 1 (schneller, weniger Abhangigkeiten) | Entwicklungsaufwand: A 3x hoher |
| E2 | Google Ads Kampagnen-Erstellung via API oder UI-Link? | A) Direkter API-Push (Developer-Token-Antrag noetig, 2-5d) | B) Draft-Export + User klickt in Google Ads UI | B fuer Phase 1, A fuer Phase 2 nach Token-Genehmigung | E2A: mehr Automatisierung, aber Wartezeit |
| E3 | Scan-Count-Logging: Ergaenzung in app.js oder Log-Parsing? | A) 1 Zeile `logger.info` in `scan`-Route (minimal-invasiv) | B) Docker-Log-Aggregation (aufwaendiger) | A (trivial, sicher) | A erfordert deploy, B kein deploy |
| E4 | Microsoft Ads MCP: Community-MCP oder REST direkt? | A) `bing-ads-mcp` (Community) | B) Direkte REST API im Backend | B (zuverlaessiger, kein fremder MCP-Code) | A schneller, B sicherer |
| E5 | Dashboard-Backend: im Scanner mitlaufen oder eigener Service? | A) Neuer `/admin/cockpit`-Endpoint in `scanner/app.js` | B) Eigener Node.js-Service | A (simpler, ein Container weniger) | B besser isoliert, aber mehr Ops |
| E6 | Real-time Sale-Benachrichtigung: WebSocket, SSE oder Poll? | A) Server-Sent Events (SSE) im Scanner | B) 60s-Poll reicht | B (deutlich simpler fuer Phase 1) | A gibt Echtzeit-Alert bei Sale, B verzoegert 60s |
| E7 | Porter Metrics als Daten-Aggregator nutzen? | A) Porter fuer Google Ads + Marketing-Daten | B) Direkte API-Calls | Pruefe erstmal mit `whoami()` ob Connectors aktiv sind | Koennte viel Eigenimplementierung sparen |

---

## Quellen

- [Stripe MCP Documentation](https://docs.stripe.com/mcp)
- [Stripe Analytics API — Supported Metrics](https://docs.stripe.com/data/analytics/supported-metrics)
- [Stripe Sessions 2026 — Announcements](https://stripe.com/blog/everything-we-announced-at-sessions-2026)
- [GitHub: stripe-analytics-mcp (30-sec morning check)](https://github.com/npow/stripe-analytics-mcp)
- [Google Ads MCP Server — Official Developer Guide](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server)
- [GitHub: googleads/google-ads-mcp](https://github.com/googleads/google-ads-mcp)
- [Google Ads MCP — 46 Tools (MCPBundles)](https://www.mcpbundles.com/skills/google-ads)
- [Google Ads API — Create Campaigns](https://developers.google.com/google-ads/api/docs/campaigns/create-campaigns)
- [GitHub: Opteo/google-ads-node](https://github.com/Opteo/google-ads-node)
- [Microsoft Ads MCP Server Options — aishoppingfeeds.com](https://www.aishoppingfeeds.com/blog/microsoft-ads-mcp-server-options/)
- [MCP Server for Microsoft Ads: Complete 2026 Guide — Synter](https://syntermedia.ai/blog/mcp-server-microsoft-ads)
- [Microsoft Advertising (Bing Ads) MCP Server by mharnett — PulseMCP](https://www.pulsemcp.com/servers/mharnett-bing-ads)
- [Bing Ads API Overview — Microsoft Learn](https://learn.microsoft.com/en-us/advertising/guides/?view=bingads-13)
- [Brevo MCP Server — Developer Documentation](https://developers.brevo.com/docs/mcp-protocol)
- [GitHub: houtini-ai/brevo-mcp](https://github.com/houtini-ai/brevo-mcp)
- [GitHub: BusyBee3333/brevo-mcp-2026-complete](https://github.com/BusyBee3333/brevo-mcp-2026-complete)
- [GitHub: github/github-mcp-server](https://github.com/github/github-mcp-server)
- [GitHub Actions MCP Server — bestmcpserver.info](https://bestmcpserver.info/aitools/github-actions-mcp-server/)
- [SaaS Metrics Every Founder Should Track in 2026 — UltraTalent](https://ultratalent.com/blog/saas-metrics/)
- [SaaS Metrics Checklist — Baremetrics](https://baremetrics.com/blog/saas-metrics-checklist-kpis-founders-should-track)
- [B2B SaaS Trial-to-Paid Conversion Rate Benchmarks 2026 — GrowthSpree](https://www.growthspreeofficial.com/blogs/b2b-saas-trial-to-paid-conversion-rate-benchmarks-2026-by-trial-type-acv-length-credit-card)
- [CAC vs ROAS — MetricHQ](https://www.metrichq.org/difference/cac-vs-roas/)
- [ROAS Benchmarks 2026 — Improvado](https://improvado.io/blog/return-on-ad-spend)

---

*Erstellt: 21.06.2026 · Analytics Reporter Agent (Claude Code claude-sonnet-4-6) · BFSG-Check Jarvis-Cockpit Research Sprint #5*
