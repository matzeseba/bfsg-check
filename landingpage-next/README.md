# landingpage-next

Next.js-Skelett (App Router) für die Barrierefrei-Prüfen-Landingpage.
Ablöser für die statische `landingpage/` — wird aktuell parallel ausgeliefert
und stufenweise umgeschaltet (siehe Welle 5).

## Stack

- **Next.js 16** (App Router, `output: "standalone"` für Docker-Deploys)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** (PostCSS-Plugin)
- **shadcn/ui** (Style `base-nova`, Icons via `lucide-react`)
- **ESLint** (Flat Config) mit Custom-Rule gegen ASCII-Umlaute

## Build- und Dev-Commands

```bash
# Lokale Entwicklung
npm install
npm run dev          # http://localhost:3000

# Qualitätschecks (müssen grün sein, bevor PRs gemerged werden)
npm run lint
npm run build

# Production-Start (nach `npm run build`)
npm run start
# oder via Standalone-Output:
node .next/standalone/server.js
```

## Architektur-Skizze

```
landingpage-next/
├── app/                    App-Router-Routes
│   ├── layout.tsx          Root-Layout, Inter-Font, OpenGraph-Metadata
│   ├── page.tsx            Stub-Hero + Feature-Cards (echte Umlaute!)
│   └── globals.css         Tailwind v4 + shadcn-Theme-Tokens
├── components/
│   └── ui/                 shadcn-Komponenten (button, card, form, ...)
├── lib/
│   └── utils.ts            cn()-Helper
├── public/                 Static Assets (Favicon, OG-Bilder kommen noch)
├── next.config.ts          standalone-Output + Security-Headers
├── eslint.config.mjs       Flat Config + Umlaute-Lint
└── components.json         shadcn-Registry-Konfiguration
```

## Umlaute-Lint

Im Repo dürfen keine ASCII-Ersätze für Umlaute mehr landen
(`Pruef…`, `Loes…`, `Maen…`, `Busgeld`, `Auswaehl…`, `fuehl…`).
ESLint bricht den Build hart ab — bitte echte `ä`, `ö`, `ü`, `ß` schreiben.

Regel: `eslint.config.mjs` → `no-restricted-syntax`.

## Security-Headers

`next.config.ts` setzt projektweit:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

Erweiterungen (z.B. CSP) folgen, sobald die Komponenten-Welle steht und der
finale Asset-/Skript-Mix bekannt ist.

## Roadmap

- **FRONTEND-COMPONENTS-Welle:** Hero, Pricing, FAQ, Lead-Form, Trust-Bar,
  Cookie-Banner als richtige Komponenten ausbauen, Sonner-Toaster verdrahten.
- **Welle 5:** PWA-Manifest, Service-Worker, Offline-Fallback, Lighthouse-Pass,
  Umschaltung der barrierefrei-pruefen.de-Production-Auslieferung auf `landingpage-next`.

Bis dahin ist diese App ein **Stub** — der Inhalt zeigt nur, dass Routing,
Fonts, Tailwind, shadcn und der Umlaute-Lint korrekt laufen.
