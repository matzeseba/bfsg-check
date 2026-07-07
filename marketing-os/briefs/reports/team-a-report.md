# Team-A-Report — Core-Engine

**Status: DONE**

Die komplette Engine des Marketing-Agent-OS ist gebaut, exakt nach `ARCHITECTURE.md`
(§4 Datenlayer, §5 Module, §6 API-Kontrakt) und `policy/compliance.json`. `npm test` läuft
grün (38 Tests, keine echten claude-Calls), `MOS_DRY_RUN=1 npm start` startet fehlerfrei und
`GET /api/health` liefert `{ok:true,…}`. Gegen die bereits committeten Team-B-Seeds/-Playbooks
verifiziert (Jobs, Funnel, Playbooks, Compliance liefern echte Daten).

---

## Dateiliste (alle unter `marketing-os/`)

### `engine/` (neu)
- `package.json` — `"type":"module"`, Dep NUR `express`, Scripts `start` + `test`
- `package-lock.json` — generiert durch `npm install` (68 Pakete, 0 Vulnerabilities)
- `README.md` — Start/Test/ENV + Windows-Task-Scheduler-Beispiel (schtasks) + Modul-Landkarte
- `src/config.js` — zentrale Pfad-/Runtime-Config (override-bar für Tests)
- `src/util.js` — Datum-/Datei-Helfer (ymd, pathExists, readFileSafe, withinDays)
- `src/store.js` — atomare JSON-Reads/Writes (temp+rename), Bootstrap aus `data/seed/`, Job-Helfer, `writeArtifact`
- `src/jobs.js` — Job-Factory + fortlaufende ID (`job_YYYYMMDD_NNNN`), Schema nach §4
- `src/scheduler.js` — 60-s-Tick, Kadenz-Logik `daily|weekly|interval|once` + `nextRun`
- `src/runner.js` — sequentielle Job-Verarbeitung (max. 1), Prompt→Executor→Artefakt→Gate→review/failed
- `src/prompt.js` — Prompt-Bau (Persona + Policy-Kurzfassung + promptTemplate, Platzhalter-Substitution)
- `src/claude-exec.js` — Default-Executor (CLI-Spawn / DRY_RUN-Dummy), `extractResult`, `dryRunArtifact`
- `src/gate.js` — Compliance-Gate (Regex case-insensitive/Unicode, Kanal-Whitelist, Disclaimer-Pflicht)
- `src/log.js` — Append-only Tageslog `data/logs/YYYY-MM-DD.md`
- `src/playbooks.js` — defensives Laden `playbooks/*.json` (fehlend/kaputt ⇒ leer, kein Crash)
- `src/api.js` — Express-API nach §6 (bind 127.0.0.1:4870, CORS nur localhost:5183, statisches dashboard/dist)
- `src/server.js` — Entry `main(overrides)`: Bootstrap → API + Scheduler + Runner
- `test/helpers.js` — Temp-Dir-Fixtures + Fake-Executor
- `test/store.test.js` (7), `test/scheduler.test.js` (6), `test/gate.test.js` (7),
  `test/runner.test.js` (5), `test/api.test.js` (13) — zusammen **38 Tests**

### `.gitignore` (neu, `marketing-os/.gitignore`)
Ignoriert `node_modules/`, `dashboard/dist/`, `data/*.json`, `data/outbox/*`, `data/logs/*`;
Negationen `!data/outbox/.gitkeep` + `!data/logs/.gitkeep`; `data/seed/` bleibt versioniert.

### Datenstruktur
`data/outbox/` + `data/logs/` (je mit `.gitkeep`) existieren und werden vom Store-Bootstrap zur
Laufzeit sichergestellt. (Hinweis: `.gitkeep` + `data/seed/` waren im Branch bereits committet;
mein Bootstrap/Touch war insoweit ein No-op — die `.gitignore` schützt die Runtime-JSON/Outbox/Logs.)

---

## Testkommando + vollständiges Ergebnis

```
cd marketing-os/engine
npm install     # einmalig (express)
npm test
```

```
> marketing-os-engine@1.0.0 test
> node --test test/*.test.js

[MOS] Engine läuft auf http://127.0.0.1:56548 (dryRun=true, autoStart=false)
✔ GET /api/health => ok true (39.3161ms)
✔ POST /api/jobs erstellt Job, GET /api/jobs listet ihn (17.7399ms)
✔ POST /api/jobs ohne Pflichtfelder => 400 { error } (1.5349ms)
✔ approve nur aus review; sonst 409 (10.5745ms)
✔ reject setzt review -> skipped (7.9324ms)
✔ published nur aus approved (8.5908ms)
✔ GET /api/jobs/:id/output => 404 ohne Artefakt, 200 danach (5.2872ms)
✔ Leads: POST erstellt, GET listet (3.6555ms)
✔ KPIs: import zählt valide Einträge, GET filtert nach Datum (4.4816ms)
✔ GET /api/funnel liefert totals + byChannel (1.5064ms)
✔ Playbooks: Liste enthält lastRun/nextRun/enabled; toggle + run-now (7.3372ms)
✔ GET /api/compliance => policy + recentFindings (1.2296ms)
✔ unbekannte Route => 404 { error } (1.2735ms)
✔ gate: block bei verbotenem Muster (BFSG-konform) (2.976ms)
✔ gate: case-insensitiv (BFSG-KONFORM in Großbuchstaben) (0.6522ms)
✔ gate: warn-Muster blockt nicht, erzeugt aber Finding (1.0157ms)
✔ gate: unbekannter Kanal => block (0.7346ms)
✔ gate: Disclaimer-Pflicht-Kanal ohne Disclaimer => block (0.6645ms)
✔ gate: sauberer Text auf erlaubtem Kanal mit Disclaimer => passed (0.3789ms)
✔ gate: Kanal ohne Disclaimer-Pflicht braucht keinen Disclaimer (0.4045ms)
✔ runner: queued-Job -> review, Artefakt geschrieben, Gate geprüft (22.9752ms)
✔ runner: Executor-Fehler -> Status failed + error gesetzt (14.748ms)
✔ runner: block-Finding bleibt sichtbar in review (kein Auto-Fix) (16.1695ms)
✔ runner: processNext gibt null zurück ohne queued-Job (7.7189ms)
✔ claude-exec: DRY_RUN liefert deterministischen Dummy ohne Spawn (0.2487ms)
✔ isDue: once nur wenn nie gelaufen (0.4398ms)
✔ isDue: interval nach Ablauf everyHours (0.0801ms)
✔ isDue: daily ab hour, nicht davor, nicht zweimal am Tag (0.6543ms)
✔ isDue: weekly nur am passenden Wochentag (0.075ms)
✔ scheduler.tick: erzeugt Jobs und setzt state.lastRun (26.7299ms)
✔ scheduler.tick: disabled Playbook wird übersprungen (14.3304ms)
✔ store: atomarer Write/Read round-trip (14.9102ms)
✔ store: bootstrap kopiert aus seed/ wenn Zieldatei fehlt (12.4261ms)
✔ store: bootstrap legt valide Leer-Defaults an ohne seed (10.1561ms)
✔ store: bootstrap legt outbox/ und logs/ an (8.6424ms)
✔ store: createJob vergibt fortlaufende IDs (12.0918ms)
✔ store: updateJob patcht per ID und setzt updatedAt (10.6449ms)
✔ store: writeArtifact/readArtifact round-trip (9.152ms)
ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 266.484
```

Zusätzlich verifiziert (Live-Smoke gegen echte Seeds, Port 4901, `MOS_DRY_RUN=1`):
`GET /api/health` → `{"ok":true,"version":"1.0.0","dryRun":true,"uptimeSec":0}`;
`/api/jobs`, `/api/funnel` (`leads7d:6, leads30d:20, jobsInReview:2, salesValue30d:846`),
`/api/playbooks`, `/api/compliance` liefern korrekte Daten; CORS blockt Fremd-Origin und erlaubt
`http://localhost:5183`; ein queued-Seed-Job lief automatisch nach `review` (Dry-Run-Artefakt in Outbox).

---

## Begründete Abweichungen (im Sinne von ARCHITECTURE.md: dokumentiert statt still)

1. **Test-Script** = `node --test test/*.test.js` statt `node --test test/`. Unter Node 24
   (hier v24.14.0) interpretiert der Test-Runner ein reines Verzeichnis-Argument nicht mehr als
   Test-Location (`Cannot find module …\test`). Der Glob ist funktional identisch und deckt exakt
   `test/*.test.js` ab. `node --test` (Auto-Discovery) liefe ebenfalls grün.
2. **claude-exec Prompt-Übergabe via stdin** statt als Shell-Argument. Der Brief nennt
   `claude -p "<prompt>" …`; unter Windows brauchen `.cmd`-Wrapper `shell:true`, wodurch lange,
   mehrzeilige Prompts als Argument an Quoting scheitern. Der Prompt geht daher über stdin an
   `claude -p` (semantisch identisch, plattformrobust). Alle sonstigen Flags exakt wie spezifiziert
   (`--model claude-sonnet-5 --output-format json --max-turns 30 --allowedTools "Read,Grep,Glob"`,
   cwd=Repo-Root, Timeout 10 min).

Beide Abweichungen berühren keinen API-Kontrakt und keine Datenshapes.

---

## Umlaut-/Compliance-Hygiene
Alle deutschen Texte in Code, Kommentaren, Tests und README verwenden echte Umlaute (ä/ö/ü/ß) —
kein ae/oe/ue mehr (per Skript vereinheitlicht, Grep-Selbstcheck sauber). Keine SSH-/Prod-/Stripe-/
Brevo-/Secret-Zugriffe, kein git commit/push, keine Dateien außerhalb `engine/`, `data/` (Struktur),
`.gitignore`, diesem Report.

## Offene Punkte / Hinweise für Team D (QA)
- **Keine echten claude-Läufe getestet** (per Brief verboten) — der Default-Executor wurde nur im
  DRY_RUN-Pfad und über Fake-Executor geprüft. Ein echter End-to-End-Lauf mit der Claude-CLI steht
  noch aus (Owner-Entscheidung, Sonnet-Kosten).
- **Runner mutiert Runtime-`data/*.json`** beim Start (Bootstrap aus Seed + Verarbeitung von
  queued-Seed-Jobs). Alles gitignored; die versionierten `data/seed/*` bleiben unberührt. Für einen
  „frischen" Demo-Zustand ggf. `data/jobs.json|leads.json|kpis.json|state.json` + `data/outbox/*`
  löschen — der Bootstrap stellt sie aus `data/seed/` wieder her.
- **Dashboard-Static-Serving** ist verdrahtet (`dashboard/dist` falls vorhanden) und wird aktiv,
  sobald Team C gebaut hat — bis dahin kein Effekt.
