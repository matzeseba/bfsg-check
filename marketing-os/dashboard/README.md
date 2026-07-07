# Marketing-OS Dashboard (Team C)

Professionelles Steuerungs-Dashboard für das BFSG-Fuchs **Marketing-Agent-OS**.
Vite + React 18 + TypeScript (strict). Baut strikt gegen den API-Kontrakt aus
`marketing-os/ARCHITECTURE.md` §6 — kein Mock-Server, echte Daten kommen von der Engine (Team A).

## Views

1. **Übersicht** — KPI-Tiles (Leads 7 d/30 d, Jobs in Prüfung, Veröffentlicht 30 d, Umsatz 30 d), Funnel-Balken, Kanal-Tabelle
2. **Pipeline** — Kanban nach Status mit Gate-Badges und Owner-Aktionen (Freigeben / Ablehnen / Als veröffentlicht)
3. **Content-Review** — Artefakt-Viewer (eigener Markdown-Renderer) mit prominenten Gate-Findings
4. **Playbooks** — Tabelle mit Kadenz, letzter/nächster Lauf, Enabled-Toggle, „Jetzt ausführen"
5. **Analytics** — recharts: Leads/Metrik über Zeit (Linie), Kanal-Split (Balken), KPI-Import-Dialog
6. **Compliance** — verbotene Muster + Schweregrad, erlaubte/verbotene Kanäle, letzte Gate-Findings

Übersicht und Pipeline aktualisieren automatisch alle 15 Sekunden. Ohne laufende Engine
zeigen alle Views saubere Fehlerzustände statt eines Crashs.

## Entwicklung

```bash
cd marketing-os/dashboard
npm install
npm run dev        # http://localhost:5183  (Proxy /api -> http://127.0.0.1:4870)
```

Für echte Daten parallel die Engine starten:

```bash
cd marketing-os/engine
npm start          # API + Scheduler + Runner auf 127.0.0.1:4870
```

## Build & Preview

```bash
npm run build      # tsc --noEmit (strict) + vite build  ->  dist/
npm run preview    # baut nicht, dient nur zur lokalen Vorschau von dist/
```

Der Build nutzt relative Base (`./`), damit die Engine `dashboard/dist/` statisch unter
`http://127.0.0.1:4870` ausliefern kann.

## Technik

- **Stack:** react, react-dom, react-router-dom (HashRouter), recharts — keine UI-Lib, kein axios, kein Markdown-Paket.
- **API-Client:** `src/api/client.ts` — typisiert, deckt alle §6-Endpunkte ab, einheitliches `{ error }`-Handling.
- **Typen:** `src/types.ts` — 1:1 zu den §4-Schemas (Job, Lead, Kpi, Playbook, Funnel, Compliance).
- **Markdown:** `src/components/Markdown.tsx` — minimaler eigener Renderer (Überschriften, Listen, Zitate, Code, `**fett**`, `` `code` ``, Links).
- **Theme:** dunkel, Akzent Orange `#F97316`, deutsche Labels mit echten Umlauten.
