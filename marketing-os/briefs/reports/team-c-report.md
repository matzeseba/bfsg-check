# Team-C-Report — Dashboard

**Status: DONE**

Vite + React 18 + TypeScript-strict-Dashboard vollständig gebaut, strikt gegen den
API-Kontrakt aus `ARCHITECTURE.md` §6 (nicht gegen Engine-Code). Alle 6 Views, dunkles
professionelles Theme mit Orange-Akzent `#F97316`, deutsche UI-Texte mit echten Umlauten.
`npm install` + `npm run build` laufen fehlerfrei (tsc strict + vite build).

## Erfüllte Deliverables

| Brief-Punkt | Umsetzung |
|---|---|
| 1. `src/api/client.ts` | Typisierter Fetch-Client für **alle** §6-Endpunkte, einheitliches `{ error }`-Handling, `ApiError`, Offline-Erkennung |
| 1. Typen nach §4 | `src/types.ts` — Job, Lead, Kpi, Playbook(+State), Funnel, Compliance, Health, Gate(Finding), PublishAction |
| 2. App + Router + Sidebar | `App.tsx` (HashRouter), `Sidebar.tsx` mit Health-Indikator, dunkles Theme, deutsche Labels |
| 3. Übersicht | `views/Uebersicht.tsx` — 5 KPI-Tiles, Funnel-Balken, Kanal-Tabelle (`GET /api/funnel`) |
| 3. Pipeline | `views/Pipeline.tsx` — Kanban queued/running/review/approved/published (+failed/skipped kompakt), Gate-Badge (rot block / gelb warn), Approve/Reject/Published mit **optimistischem Update + Refetch** |
| 3. Content-Review | `views/ContentReview.tsx` — Job-Liste links, Artefakt-Viewer rechts (`GET /api/jobs/:id/output`), eigener Markdown-Renderer (keine Dep), Gate-Findings prominent, Approve/Reject |
| 3. Playbooks | `views/Playbooks.tsx` — Tabelle Name/Kanal/Agent/Kadenz/letzter+nächster Lauf, Enabled-Toggle (POST toggle), „Jetzt ausführen" (POST run-now) mit Erfolgs-Toast |
| 3. Analytics | `views/Analytics.tsx` — recharts LineChart (Metrik über 30 Tage) + BarChart (Kanal-Split), Metrik-Auswahl, KPI-Import-Dialog (JSON-Textarea → `POST /api/kpis/import`) |
| 3. Compliance | `views/Compliance.tsx` — verbotene Muster + Severity, erlaubte/verbotene Kanäle mit Begründung, letzte Gate-Findings (`GET /api/compliance`) |
| 4. Poll 15 s + Zustände | `usePolling`-Hook auf Übersicht/Pipeline (+Health); `AsyncBoundary` mit Lade-/Fehler-/Leerzustand überall, Fehlertext „Engine nicht erreichbar — läuft npm start in marketing-os/engine?" |
| 5. README | `README.md` mit dev/build/preview-Anleitung |

## Dateiliste (`marketing-os/dashboard/`)

```
index.html · package.json · tsconfig.json · vite.config.ts · .gitignore · README.md
src/main.tsx · src/App.tsx · src/styles.css · src/types.ts
src/api/client.ts
src/hooks/useFetch.ts · src/hooks/usePolling.ts
src/lib/format.ts
src/components/Sidebar.tsx · Toast.tsx · StateViews.tsx · GateBadge.tsx · GateFindings.tsx · Markdown.tsx
src/views/Uebersicht.tsx · Pipeline.tsx · ContentReview.tsx · Playbooks.tsx · Analytics.tsx · Compliance.tsx
```

## Stack / Verbote eingehalten

- Deps exakt wie erlaubt: `react`, `react-dom`, `react-router-dom`, `recharts` (+ Dev: vite,
  @vitejs/plugin-react, typescript, @types/react, @types/react-dom). **Keine** UI-Lib, kein axios,
  kein Markdown-Paket, kein Mock-Server.
- Dev-Port **5183**, Proxy `/api` → `http://127.0.0.1:4870`, Build-Base `./` → `dist/`.
- Kein `git`, keine Dateien außerhalb `dashboard/`, keine SSH-/Prod-Zugriffe.
- TypeScript strict: kein `any` außer bewusst typisiertem `unknown` an den Systemgrenzen
  (JSON-Parsing, Fehler-Cast). `noUnusedLocals`/`noUnusedParameters` aktiv und sauber.

## Build-Output (Pflicht-Beweis, letzte Zeilen)

```
> tsc --noEmit && vite build
vite v5.4.21 building for production...
✓ 848 modules transformed.
dist/index.html                  0.46 kB │ gzip:   0.30 kB
dist/assets/index-Bp_LIoa4.css  14.88 kB │ gzip:   3.66 kB
dist/assets/index-j-X4VcXy.js  581.43 kB │ gzip: 168.91 kB
✓ built in 1.84s
```

`tsc --noEmit` (strict) läuft ohne Fehler durch, danach `vite build` erfolgreich.

## Zusätzlich verifiziert

- `npm run dev` startet auf 5183 (HTTP 200 auf `/` und `/src/main.tsx`).
- Mit **ausgeschalteter Engine** liefert der Proxy `/api/*` einen Verbindungsfehler → Client
  wirft `ApiError` → Views zeigen sauberen `ErrorView` („Engine nicht erreichbar …") statt Crash
  (5xx ohne JSON-Fehlerkörper wird als Offline behandelt).

## Offene Punkte / Hinweise

- **Bundle-Größe:** Der JS-Chunk ist 581 kB (168 kB gzip), fast vollständig recharts. Nur eine
  Vite-**Warnung** (>500 kB), kein Fehler. Bewusst nicht code-gesplittet, um im erlaubten
  Dep-/Komplexitäts-Rahmen zu bleiben; bei Bedarf später `manualChunks` für recharts.
- **Weekday-Konvention** in `cadenceLabel`: 0 = Sonntag … 6 = Samstag (JS `getDay`). Falls die
  Engine/Playbooks eine andere Zählung nutzen, hier anpassen — reine Anzeige, kein Funktionsrisiko.
- **KPI-Import** akzeptiert sowohl `{ "kpis": [...] }` als auch ein blankes Array; sendet immer
  `{ kpis }` an `POST /api/kpis/import` gemäß Kontrakt.
- Kein automatisierter Browser-Screenshot-Beweis: Preview würde `.claude/launch.json` außerhalb
  des erlaubten Schreibpfads erfordern; stattdessen Build + Dev-Boot + Offline-Proxy-Probe verifiziert.
