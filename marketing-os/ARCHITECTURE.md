# Marketing-Agent-OS — Verbindliche Architektur (v1)

> Autor: Chef-Architekt (Claude, Session 07.07.2026). Dieses Dokument ist der **bindende Kontrakt**
> für alle Build-Teams. Abweichungen nur, wenn hier etwas nachweislich unmöglich ist — dann im
> Team-Report begründen, NICHT stillschweigend abweichen.

## 1. Mission

Vollautomatisiertes, lokales Marketing-Operating-System für BFSG-Fuchs (bfsg-fix.de / bfsg-fuchs.de).
Fokus: **Organic Growth Engine** — schnellstmöglich kostenlose Leads über UWG-sichere 0-€-Kanäle,
maximale Automatisierung der Content-Produktion, Distribution als vorbereitete Action-Cards,
vollständige Visualisierung/Steuerung/Auswertung in einem professionellen Dashboard.
**Keine Abhängigkeit von bezahlten Ads** — Organic bleibt der Kern. *Ergänzung (Owner-Beschluss 08.07.2026):* Paid-Ads ist als eigenständiges Modul erlaubt (Kampagnen-Recherche/-Ausarbeitung per Playbook, manuelles Metrik-Tracking CPC/CTR/CAC, Live-Schaltung ausschließlich manuell durch den Owner) — es gilt weiterhin: kein Auto-Publishing, keine Live-API-Calls zu Ad-Plattformen.

## 2. Nicht-Ziele (v1, hart)

- KEIN Auto-Publishing nach außen (kein Auto-Posting, kein Auto-Submit). Publish = Owner-Approval + separate Computer-Use-Session.
- KEINE Cold-Mails, KEINE LinkedIn/Xing-DMs, KEIN Foren-Seeding (UWG — siehe policy/compliance.json).
- KEINE externe Datenbank, KEIN Deploy auf den Prod-Server (lokal wie das Cockpit).
- KEINE Live-API-Calls (Stripe/Brevo/claude) in Tests — alles injizierbar/DRY_RUN.

## 3. Verzeichnis-Layout + Ownership (hart abgegrenzt)

```
marketing-os/
├── ARCHITECTURE.md          # dieses Dokument (Chef-Architekt)
├── KERNEL.md                # OS-Kernel: Identity, Routing-Tabelle, Agent-Registry   [Team B]
├── policy/compliance.json   # Legal-Gate, maschinenlesbar (Chef-Architekt)
├── agents/*.md              # Spezialisten-Personas                                  [Team B]
├── playbooks/*.json         # Automatisierte Growth-Prozesse                         [Team B]
├── engine/                  # Node.js-Orchestrator (Scheduler/Runner/Gate/API)       [Team A]
│   ├── package.json         #   deps: NUR express. Tests: node:test
│   └── src/ + test/
├── dashboard/               # Vite + React + TypeScript (strict)                     [Team C]
├── data/                    # Laufzeit-State (gitignored) + seed/ (versioniert)      [A: Struktur, B: seed/]
│   ├── seed/                #   Demo-Daten für Erststart + Dashboard-Entwicklung
│   ├── outbox/              #   generierte Artefakte je Job (<jobId>.md)
│   └── logs/                #   append-only Tageslogs (YYYY-MM-DD.md)
└── briefs/                  # Team-Briefs + reports/ (Chef-Architekt / Teams)
```

Jedes Team schreibt AUSSCHLIESSLICH in seine Verzeichnisse. Niemand führt `git commit` aus.
Niemand ändert Dateien außerhalb von `marketing-os/`.

## 4. Datenlayer (dateibasiert, JSON — keine DB)

Alle Dateien in `marketing-os/data/`. Engine erzeugt sie beim ersten Start; wenn `data/*.json`
fehlt und `data/seed/` existiert, werden Seeds kopiert (Bootstrap).

### Job (`data/jobs.json` = Array<Job>)
```json
{
  "id": "job_20260707_0001",
  "playbookId": "seo-pillar-weekly",
  "agent": "seo-pillar-writer",
  "title": "Ratgeber: MLBF-Prüfstrategie 2026",
  "channel": "seo_pillar",
  "status": "queued | running | review | approved | published | failed | skipped",
  "createdAt": "ISO-8601", "updatedAt": "ISO-8601",
  "outputFile": "data/outbox/job_20260707_0001.md",
  "gate": { "checked": true, "passed": false,
            "findings": [{ "severity": "block|warn", "pattern": "…", "match": "…", "hint": "…" }] },
  "publishAction": { "type": "manual-browser | repo-pr | none", "instructions": "…" },
  "error": null
}
```
Status-Fluss: `queued → running → review` (Gate läuft automatisch beim Übergang nach review)
`review → approved` (nur Owner via Dashboard) `approved → published` (nach realer Veröffentlichung)
`review → skipped` (Reject). Gate-Failures bleiben SICHTBAR in review — niemals stilles Auto-Fixen.

### Lead (`data/leads.json`)
`{ "id", "date": "YYYY-MM-DD", "source": "<channel|url>", "kind": "scan|newsletter|contact|sale", "value": number|null, "note": "" }`

### Kpi (`data/kpis.json`)
`{ "date": "YYYY-MM-DD", "channel": "<channel>", "metric": "visits|impressions|clicks|leads|sales_eur", "value": number }`

### Playbook (`playbooks/<id>.json`) — von Team B geliefert, von Team A gelesen
```json
{
  "id": "seo-pillar-weekly", "name": "SEO-Pillar-Artikel", "goal": "…",
  "channel": "seo_pillar", "agent": "seo-pillar-writer",
  "cadence": { "type": "daily|weekly|interval|once", "hour": 6, "weekday": 1, "everyHours": 12 },
  "promptTemplate": "…mit Platzhaltern {date}, {product}, {domain}…",
  "outputType": "markdown", "autoPublish": false, "enabled": true,
  "legalNotes": "…"
}
```

### Scheduler-State (`data/state.json`)
`{ "playbooks": { "<id>": { "lastRun": "ISO|null", "enabled": true } } }`

## 5. Engine (Team A) — Module

| Modul | Aufgabe |
|---|---|
| `src/store.js` | Atomare JSON-Reads/Writes (write-temp + rename), Bootstrap aus seed/ |
| `src/scheduler.js` | Tick alle 60 s: fällige Playbooks → neue Jobs (queued). `once` = nur wenn nie gelaufen |
| `src/runner.js` | Verarbeitet queued-Jobs SEQUENTIELL (max. 1 parallel). Baut Prompt = Persona-Datei (`agents/<agent>.md`) + Policy-Kurzfassung + promptTemplate. Executor injizierbar |
| `src/claude-exec.js` | Default-Executor: `claude -p "<prompt>" --model claude-sonnet-5 --output-format json --max-turns 30 --allowedTools "Read,Grep,Glob"` via child_process (cwd = Repo-Root, Timeout 10 min). Bei `MOS_DRY_RUN=1`: deterministischer Dummy-Markdown-Output, kein Prozess-Spawn |
| `src/gate.js` | Compliance-Gate: lädt `policy/compliance.json`, prüft Artefakt (Regex, case-insensitive), Channel-Whitelist, Disclaimer-Pflicht. Ergebnis in `job.gate` |
| `src/api.js` | Express-API (Kontrakt §6), bind 127.0.0.1:4870, CORS für http://localhost:5183, served `dashboard/dist` statisch falls vorhanden |
| `src/server.js` | Entry: Store-Bootstrap → API + Scheduler + Runner starten |
| `src/log.js` | Append-only Tageslog `data/logs/YYYY-MM-DD.md` (Job-Ereignisse, Gate-Findings) |

Runtime: Node ≥ 20, ESM (`"type":"module"`), einzige Dependency: `express`.
Scripts: `npm start` (Server), `npm test` (`node --test test/`).
Claude-Aufrufe schreiben NIE selbst Dateien — Runner nimmt stdout-Result und schreibt `data/outbox/<jobId>.md`.

## 6. API-Kontrakt (verbindlich für Team A UND Team C)

Basis: `http://127.0.0.1:4870`. Fehlerformat immer `{ "error": "<meldung>" }` mit 4xx/5xx.

| Methode + Pfad | Antwort |
|---|---|
| `GET /api/health` | `{ ok: true, version: "1.0.0", dryRun: boolean, uptimeSec: number }` |
| `GET /api/jobs?status=<s>` | `{ jobs: Job[] }` (neueste zuerst) |
| `POST /api/jobs` Body `{agent,title,channel,prompt}` | `{ job }` (Status queued) |
| `POST /api/jobs/:id/approve` | `{ job }` (nur aus review) |
| `POST /api/jobs/:id/reject` | `{ job }` (→ skipped) |
| `POST /api/jobs/:id/published` | `{ job }` (nur aus approved) |
| `GET /api/jobs/:id/output` | `{ content: string }` (Markdown des Artefakts) |
| `GET /api/playbooks` | `{ playbooks: [Playbook & { lastRun, nextRun, enabled }] }` |
| `POST /api/playbooks/:id/toggle` | `{ playbook }` |
| `POST /api/playbooks/:id/run-now` | `{ job }` |
| `GET /api/leads` | `{ leads: Lead[] }` |
| `POST /api/leads` Body Lead ohne id | `{ lead }` |
| `GET /api/kpis?from=YYYY-MM-DD&to=YYYY-MM-DD` | `{ kpis: Kpi[] }` |
| `POST /api/kpis/import` Body `{ kpis: Kpi[] }` | `{ imported: number }` |
| `GET /api/funnel` | `{ totals: { leads7d, leads30d, jobsInReview, published30d, salesValue30d }, byChannel: [{ channel, leads, published }] }` |
| `GET /api/compliance` | `{ policy: <compliance.json>, recentFindings: [{ jobId, title, findings, at }] }` |

## 7. Dashboard (Team C) — Vite + React + TS strict

Port dev: 5183, Proxy `/api` → `http://127.0.0.1:4870`. Build nach `dashboard/dist`.
Deps: react, react-dom, react-router-dom, recharts. Dunkles professionelles Theme,
Akzent Orange (#F97316, BFSG-Fuchs), deutsche UI-Texte mit echten Umlauten.

Views (Sidebar-Navigation):
1. **Übersicht** — KPI-Tiles (Leads 7d/30d, Jobs in Review, Veröffentlicht 30d, Umsatz 30d), Funnel-Balken, Kanal-Tabelle
2. **Pipeline** — Kanban (Spalten = Status), Job-Karten mit Approve/Reject/Als-veröffentlicht, Gate-Badge (rot bei block-Findings)
3. **Content-Review** — Artefakt-Viewer (Markdown gerendert), Gate-Findings prominent, Approve/Reject
4. **Playbooks** — Tabelle: Name, Kanal, Kadenz, letzter/nächster Lauf, Toggle, „Jetzt ausführen"
5. **Analytics** — Charts (recharts): Leads über Zeit (Linie), Kanal-Split (Balken), KPI-Import-Dialog
6. **Compliance** — Policy-Anzeige (verbotene Muster, erlaubte Kanäle), letzte Findings

## 8. Sicherheits- und Rechtsleitplanken (für ALLE Teams bindend)

- Pflichtsprache: „automatisierte technische Analyse" / „WCAG-2.1-AA-Audit". VERBOTEN: „BFSG-konform", „rechtssicher", „garantiert", TÜV/DEKRA-Bezug. Voll-Liste: `policy/compliance.json`.
- Erlaubte Kanäle NUR: seo_pillar, aeo_answer, comparison_page, pr_free, listings, haro_recherchescout, show_hn, awesome_lists, newsletter_brevo (nur Opt-in-Liste), badge_distribution, social_own_channels, analytics_internal.
- Kein Agent/Prozess greift auf SSH, den Prod-Server, Stripe, Brevo oder GitHub-Secrets zu.
- Echte deutsche Umlaute (ä/ö/ü/ß) in allen Texten — niemals ae/oe/ue.

## 9. Betrieb

Start: `cd marketing-os/engine && npm start` → Dashboard unter `http://127.0.0.1:4870` (nach Build)
bzw. `cd marketing-os/dashboard && npm run dev` (Entwicklung). Geplante Ausführung ohne offene
Session: Windows Task Scheduler-Beispiel in `engine/README.md` dokumentieren (Team A).
