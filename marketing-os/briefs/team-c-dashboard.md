# Team-C-Brief — Dashboard (One-Shot)

## Mission
Baue das professionelle Steuerungs-Dashboard des Marketing-Agent-OS exakt nach
`marketing-os/ARCHITECTURE.md` §6 (API-Kontrakt — deine einzige Datenquelle) und §7 (Views).
ARCHITECTURE.md ZUERST vollständig lesen. Die Engine (Team A) entsteht parallel — du baust
strikt gegen den Kontrakt, NICHT gegen deren Code.

## Stack (verbindlich)
Vite + React 18 + TypeScript strict in `marketing-os/dashboard/`. Deps NUR: react, react-dom,
react-router-dom, recharts (+ Dev: vite, @vitejs/plugin-react, typescript, @types/react,
@types/react-dom). Dev-Port 5183, Proxy `/api` → `http://127.0.0.1:4870` (vite.config.ts).
Build → `dashboard/dist` (relative Base `./`, da die Engine dist statisch served).

## Deliverables
1. `src/api/client.ts` — typisierter Fetch-Client für ALLE §6-Endpunkte; TS-Interfaces exakt
   nach §4-Schemas (Job, Lead, Kpi, Playbook, Funnel, Compliance); Fehler-Handling `{error}`
2. `src/App.tsx` + Router + Sidebar-Layout (dunkles professionelles Theme, Akzent #F97316,
   klare Typo, deutsche Labels mit echten Umlauten ä/ö/ü/ß)
3. Views (je eigene Datei unter `src/views/`):
   - `Uebersicht.tsx` — KPI-Tiles (Leads 7d/30d, Jobs in Review, Veröffentlicht 30d, Umsatz 30d €),
     Funnel-Balken, Kanal-Tabelle (GET /api/funnel)
   - `Pipeline.tsx` — Kanban: Spalten queued/running/review/approved/published (+failed/skipped
     kompakt), Job-Karten mit Titel/Agent/Kanal/Zeit, Gate-Badge (rot „Gate: blockiert" bei
     block-Findings, gelb bei warn), Buttons: Freigeben (approve), Ablehnen (reject),
     Als veröffentlicht markieren (published) — mit optimistischem Update + Refetch
   - `ContentReview.tsx` — Job-Liste (status=review) links, rechts Artefakt-Viewer
     (GET /api/jobs/:id/output, Markdown simpel gerendert: Überschriften/Listen/Absätze — eigene
     kleine Render-Funktion, KEINE zusätzliche Dependency), Gate-Findings prominent über dem Text,
     Approve/Reject-Buttons
   - `Playbooks.tsx` — Tabelle: Name, Kanal, Agent, Kadenz (lesbar formatiert), letzter/nächster
     Lauf, Enabled-Toggle (POST toggle), „Jetzt ausführen" (POST run-now mit Erfolgs-Toast)
   - `Analytics.tsx` — recharts: Leads über Zeit (LineChart, 30 Tage), Kanal-Split (BarChart),
     Metrik-Auswahl; KPI-Import-Dialog (JSON-Textarea → POST /api/kpis/import)
   - `Compliance.tsx` — verbotene Muster + Severity, erlaubte/verbotene Kanäle mit Begründung,
     letzte Gate-Findings (GET /api/compliance)
4. Poll-Refresh alle 15 s auf Pipeline/Übersicht (einfaches setInterval-Hook), Lade-/Fehler-/
   Leerzustände überall (z. B. „Engine nicht erreichbar — läuft npm start in marketing-os/engine?")
5. `README.md` — dev/build/preview-Anleitung

## Definition of Done
- `npm run build` läuft fehlerfrei durch (tsc strict + vite build) — das ist dein Pflicht-Beweis
- `npm run dev` startet; ohne Engine zeigen Views saubere Fehlerzustände statt Crash
- Kein `any` ohne Not, keine ESLint-Katastrophen, UI wirkt professionell (Abstände, Kontraste,
  konsistente Karten/Buttons — Handarbeit statt UI-Lib)

## Harte Verbote
KEIN git, keine Dateien außerhalb `marketing-os/dashboard/`, keine weiteren Dependencies
(keine UI-Libs, kein axios, kein markdown-Paket), keine SSH-/Prod-Zugriffe, keine Mock-Server-Dep
(Seeds liefern echte Daten via Engine).

## Report-Kontrakt
`marketing-os/briefs/reports/team-c-report.md`: Status (DONE/…/BLOCKED), Dateiliste,
Build-Output (letzte Zeilen), offene Punkte. Antworte am Ende NUR mit Status + 3 Zeilen.
