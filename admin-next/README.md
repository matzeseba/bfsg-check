# BFSG-Check Admin (Next.js 16 + Tailwind + shadcn/ui)

Internes Admin-Dashboard für **BFSG-Check**. Zeigt Live-Daten zu Verkäufen,
Bestellungen, Abos, Server-Status und Marketing-Kampagnen.

> Stand: Scaffold-Phase (Welle 4) — alle Routes liefern Mock-Daten via Server
> Components. In Welle 5 werden Mocks gegen echte `bfsg-fix.de/admin/*`-Calls
> ausgetauscht.

## Stack

- **Next.js 16** (App Router, Server Components, `output: 'standalone'`)
- **Tailwind CSS v4**
- **shadcn/ui** (Card, Table, Tabs, Dialog, Badge, Skeleton, Sheet, Sonner …)
- **TypeScript** strict
- **ESLint** (Next-Defaults)

## Routes

| Route             | Inhalt                                                          |
| ----------------- | --------------------------------------------------------------- |
| `/`               | Übersicht: 4 KPI-Cards (Umsätze heute, MRR, Verkäufe, Fehler)   |
| `/orders`         | Bestelltabelle (Stripe Checkout-Sessions)                       |
| `/subscriptions`  | Abo-Tabelle (Monitoring-MRR, Status, Letzter Scan)              |
| `/server`         | Health-Card + GitHub-Workflows-Status                           |
| `/marketing`      | Notion-Sync-Status + laufende Kampagnen                         |

## Lokal starten

```bash
cd admin-next
cp .env.example .env.local        # ADMIN_TOKEN eintragen (für echte Daten)
npm install
npm run dev                       # http://localhost:3000
```

## Build & Lint

```bash
npm run lint
npm run build                     # erzeugt .next/standalone (für Docker)
```

## API-Client (`lib/api.ts`)

Server-Only-Wrapper für das Backend. Liest `ADMIN_TOKEN` aus den env-Variablen
und sendet Bearer-Auth gegen `ADMIN_API_BASE_URL` (Default `https://bfsg-fix.de`).

Verfügbare Funktionen:

- `fetchOrders(limit)` → `GET /admin/orders`
- `fetchSubscriptions()` → `GET /admin/subscriptions`
- `fetchHealth()` → `GET /health`
- `fetchWorkflowRuns()` (Stub für Welle 5)

In der Scaffold-Phase importieren die Routes Mock-Daten aus
`lib/mock-data.ts`. Sobald `ADMIN_TOKEN` gesetzt und das Backend gerüstet ist,
können die Aufrufe schrittweise umgestellt werden.

## Auth

**Wurde in der Scaffold-Phase bewusst übersprungen** (zu viel Friction). Plan
für Welle 5:

1. `middleware.ts` mit Basic-Auth (Username/Passwort aus
   `ADMIN_BASIC_USER` / `ADMIN_BASIC_PASS`)
   **oder**
2. NextAuth-Magic-Link via Brevo-SMTP mit Allowlist `ADMIN_ALLOWED_EMAILS`
   (Default: `matze.seba@outlook.de`).

Bis dahin: Dashboard nur lokal hinter SSH oder mit IP-Allowlist deployen.

## Deploy-Plan

- Sub-Domain: **`admin.bfsg-fix.de`**
- Docker-Image über `output: 'standalone'`-Build (kleiner Footprint, kein
  `node_modules` im Image).
- Reverse-Proxy (Caddy/Traefik auf dem Hetzner-CPX22) terminiert TLS und routet
  `admin.bfsg-fix.de` an den Container auf Port `3000`.
- Deploy-Pipeline: GitHub Actions → SSH → `git pull` + `docker compose up -d`
  (analog Scanner).

## Sicherheits-Header

Konfiguriert in `next.config.ts`:

- `Strict-Transport-Security` (2 Jahre, includeSubDomains, preload)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-DNS-Prefetch-Control: on`
- `poweredByHeader: false`

## Verzeichnis-Layout

```
admin-next/
├── app/
│   ├── layout.tsx           # Globale Navigation + Toaster
│   ├── page.tsx             # /  → Übersicht
│   ├── orders/page.tsx      # /orders
│   ├── subscriptions/page.tsx
│   ├── server/page.tsx
│   └── marketing/page.tsx
├── components/ui/           # shadcn-Komponenten
├── lib/
│   ├── api.ts               # Server-Only API-Client
│   ├── mock-data.ts         # Scaffold-Daten (wird in Welle 5 entfernt)
│   └── format.ts            # de-DE-Formatierer (Währung, Datum, Uptime)
├── next.config.ts           # standalone + Security-Headers
└── .env.example             # Vorlage für ADMIN_TOKEN etc.
```
