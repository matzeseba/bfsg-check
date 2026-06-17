# Dashboard MVP — Notion + GitHub-Workflow Sync

## Warum dieses Dashboard
Du brauchst sofort **eine Sicht** auf "Was läuft? Wie viel Umsatz heute? Welche Orders sind FAILED?" — bevor das vollständige Next.js-Admin-Dashboard (siehe `admin-next/`) production-ready ist.

**Lösung:** 3 Notion-Datenbanken + 1 GitHub-Workflow alle 15 Min sync.

Aufwand für Setup: ~30 Min einmalig. Dann läuft es bis das echte Admin-Dashboard live ist (siehe Welle 5).

---

## 1. Notion-Workspace vorbereiten

### 1.1 Workspace + Notion-Integration

1. Notion-Workspace öffnen (falls noch nicht: notion.so/signup)
2. **Settings & Members → Connections → Develop or manage integrations**
3. **+ New integration** → Name `BFSG-Check Dashboard` → Internal Integration
4. Capabilities: ☑ Read content, ☑ Update content, ☑ Insert content
5. **Submit** → kopiere `secret_xxx`-Token

### 1.2 Page „BFSG-Check Dashboard" anlegen

- Neue Page im Workspace, Name: **`BFSG-Check Dashboard`**
- In der Page oben rechts: `…` → **Connect to Integration** → wähle `BFSG-Check Dashboard`
- Page-ID kopieren (aus URL: `notion.so/BFSG-Check-Dashboard-ABCDEFG...` → ID = `ABCDEFG...`)

---

## 2. Drei Datenbanken erstellen

### DB 1: Orders
Klick in der Page: **/database** → **Table - Inline** → Name `Orders`
Spalten (Type):
- `Session-ID` (Title)
- `E-Mail` (Email)
- `URL` (URL)
- `Paket` (Select: basis, profi, cookie-basis, cookie-profi, abo)
- `Betrag (€)` (Number)
- `Status` (Select: PAID, FULFILLING, MAILED, FAILED, RESENDING, RESENT)
- `Erstellt` (Date)
- `PDF-Pfad` (Text)
- `Fehler` (Text)

→ DB-ID kopieren (aus URL der Database: `notion.so/Orders-XYZ?...` → ID = `XYZ`)

### DB 2: Subscriptions
- `Subscription-ID` (Title)
- `E-Mail` (Email)
- `URL` (URL)
- `Paket` (Select)
- `Status` (Select: ACTIVE, CANCELLED)
- `Created` (Date)
- `Letzter Re-Check` (Date)
- `Customer-ID Stripe` (Text)

### DB 3: Marketing-Events
- `Datum` (Title — als ISO-String)
- `Channel` (Select: google-ads, linkedin, seo, partner, direct)
- `Event` (Select: click, scan-started, scan-complete, checkout-started, checkout-completed)
- `UTM-Source` (Text)
- `UTM-Campaign` (Text)
- `Wert (€)` (Number)

(Für Welle 5 — wenn UTM-Tracking implementiert ist. Aktuell leer.)

---

## 3. Views einrichten (in Notion-UI klicken)

Für DB **Orders**:
- View 1: **Heute** — Filter: `Erstellt = Today`, Sort: `Erstellt desc`
- View 2: **Diese Woche** — Filter: `Erstellt > 7 days ago`
- View 3: **Failed Fulfillments** — Filter: `Status = FAILED`, Sort: `Erstellt desc`
- View 4: **MRR-Übersicht** — Gruppiert nach `Paket`, Sum: `Betrag`

Für DB **Subscriptions**:
- View 1: **Aktive Abos** — Filter: `Status = ACTIVE`
- View 2: **MRR-Berechnung** — Filter: `Status = ACTIVE`, zeige Count + Calc: count × 49 € = aktueller MRR
- View 3: **Letzter Re-Check älter als 35 Tage** — Filter `Letzter Re-Check < 35 days ago`

---

## 4. GitHub-Workflow für Sync

Erstellt: `.github/workflows/notion-sync.yml` (in diesem PR).

**Mechanik:** Alle 15 Min:
1. `curl -H "Authorization: Bearer $ADMIN_TOKEN" https://bfsg-fix.de/admin/orders` → JSON-Liste
2. Pro Order: Notion-API POST/PATCH (idempotent via `Session-ID`)
3. Analog für `/admin/subscriptions`

**GitHub-Secrets (du legst sie morgen an):**
- `NOTION_TOKEN` — `secret_xxx` aus 1.1
- `NOTION_DB_ORDERS` — DB-ID aus 2 (Orders)
- `NOTION_DB_SUBSCRIPTIONS` — DB-ID aus 2 (Subscriptions)
- `ADMIN_TOKEN` — gleicher Wert wie in Server-`.env`

---

## 5. Manuelles erstes Sync (zum Testen)

```bash
# GH-Workflow manuell triggern
gh workflow run notion-sync.yml

# Status checken
gh run list --workflow notion-sync.yml --limit 1

# Notion-Page öffnen → Orders sollten erscheinen (oder leer wenn noch keine Orders)
```

---

## 6. Alternative falls Notion-MCP nicht aktiviert ist

**n8n-Workflow** (auf gleichem Hetzner-Server, eigener Docker-Container):
1. `npm install -g n8n` ODER n8n-Cloud-Account
2. Trigger: HTTP-Request alle 15 Min an `/admin/orders`
3. Funktion-Node: JSON → Notion-API-Aufruf
4. Vorteil: visueller Editor, keine Code-Änderungen
5. Nachteil: weiterer Service zum Maintainen

**Empfehlung:** Für MVP ist GitHub-Actions ausreichend (kein extra Service, kostenlos, transparent).

---

## 7. Erfolgs-Kriterien Dashboard-MVP

- [ ] 3 Notion-DBs angelegt (Orders/Subs/Marketing)
- [ ] 4 GitHub-Secrets gesetzt
- [ ] Workflow `notion-sync.yml` läuft alle 15 Min ohne Fehler
- [ ] Notion zeigt Live-Orders mit max. 15 Min Latenz
- [ ] View "Heute-Umsatz" zeigt aktuelle Tageszahlen
- [ ] View "Failed Fulfillments" zeigt 0 (oder Alerts darauf eingerichtet)

## Wann auf Next.js-Admin-Dashboard wechseln (Welle 5)?

Trigger:
- ≥ 100 Orders/Monat → Notion wird langsam beim Filtern
- Bedarf an Custom-Charts (MRR-Trend, CAC, LTV-Berechnung)
- Mehrere Mitarbeiter (Notion-Free hat begrenzte Member)

Dann: `admin-next/` (gescaffoldet in Welle 4, deployed auf `admin.bfsg-fix.de` per Caddy-Reverse-Proxy aus PR #9).
