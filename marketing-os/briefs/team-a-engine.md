# Team-A-Brief — Core-Engine (One-Shot)

## Mission
Baue die komplette Engine des Marketing-Agent-OS exakt nach `marketing-os/ARCHITECTURE.md`
(§4 Datenlayer, §5 Module, §6 API-Kontrakt). Die ARCHITECTURE.md ist bindend — lies sie ZUERST
und vollständig, ebenso `marketing-os/policy/compliance.json`.

## Deliverables (nur unter `marketing-os/engine/` + `marketing-os/data/`)
1. `engine/package.json` — `"type":"module"`, Dep NUR `express`, Scripts `start` + `test` (`node --test test/`)
2. `engine/src/store.js` — atomare JSON-Reads/Writes (temp+rename), Bootstrap: kopiert `data/seed/*.json` → `data/` wenn Zieldateien fehlen; legt `data/outbox/`, `data/logs/` an
3. `engine/src/scheduler.js` — 60-s-Tick, Kadenz-Logik (daily/weekly/interval/once) gegen `data/state.json`, erzeugt queued-Jobs
4. `engine/src/runner.js` — sequentielle Job-Verarbeitung (max 1), Prompt-Bau aus `agents/<agent>.md` + Policy-Kurzfassung + promptTemplate, Executor injizierbar, schreibt Artefakt nach `data/outbox/<jobId>.md`, ruft danach Gate, setzt Status review/failed
5. `engine/src/claude-exec.js` — spawnt `claude -p … --model claude-sonnet-5 --output-format json --max-turns 30 --allowedTools "Read,Grep,Glob"` (cwd=Repo-Root, Timeout 10 min, Windows-tauglich: `shell:true` oder `claude.cmd` beachten). `MOS_DRY_RUN=1` → deterministischer Dummy-Markdown ohne Spawn
6. `engine/src/gate.js` — Regex-Checks (case-insensitive, Unicode) aus compliance.json, Channel-Whitelist, Disclaimer-Pflicht je `disclaimerRequiredForChannels`; Findings nach `job.gate`; block ⇒ `passed:false`
7. `engine/src/api.js` — Express, bind 127.0.0.1:4870, CORS nur localhost:5183, ALLE Endpunkte aus §6 exakt (Pfade, Bodies, Antwort-Shapes, Fehlerformat `{error}`), served `../dashboard/dist` statisch falls vorhanden
8. `engine/src/log.js` — append-only `data/logs/YYYY-MM-DD.md`
9. `engine/src/server.js` — Entry (Bootstrap → API + Scheduler + Runner)
10. `engine/test/` — node:test-Suite: store (atomar, bootstrap), scheduler (Kadenzen inkl. once), gate (block/warn/channel/disclaimer), api (supertest-frei: echten Server auf Ephemeral-Port starten + fetch), runner (Fake-Executor). Ziel ≥ 20 Tests, alle grün
11. `engine/README.md` — Start/Test/ENV (`MOS_PORT`, `MOS_DRY_RUN`), Windows-Task-Scheduler-Beispiel (schtasks) für Headless-Betrieb
12. `marketing-os/.gitignore` — `data/*.json`, `data/outbox/`, `data/logs/`, `node_modules/`, `dashboard/dist/` ignorieren; `data/seed/` bleibt versioniert

## Definition of Done
- `npm test` in `marketing-os/engine/` läuft grün (mit MOS_DRY_RUN=1, keine echten claude-Calls)
- `MOS_DRY_RUN=1 npm start` startet fehlerfrei; `GET /api/health` liefert `{ok:true,…}`
- Playbooks aus `marketing-os/playbooks/` werden geladen, sofern vorhanden — FEHLENDE Playbooks/agents dürfen den Start NICHT crashen (Team B baut parallel; defensiv laden, leere Liste ok)

## Harte Verbote
- KEIN `git commit`/`git push`, keine Dateien außerhalb `marketing-os/engine/`, `marketing-os/data/` (nur Struktur/README/.gitignore), keine SSH-/Prod-/Stripe-/Brevo-Zugriffe, keine echten claude-Aufrufe in Tests, keine zusätzlichen npm-Dependencies außer express
- Echte Umlaute (ä/ö/ü/ß) in allen deutschen Texten

## Report-Kontrakt
Schreibe `marketing-os/briefs/reports/team-a-report.md`: Status (DONE / DONE_WITH_CONCERNS /
BLOCKED), Dateiliste, Testkommando + vollständiges Testergebnis, offene Punkte. Antworte am Ende
NUR mit Status + 3 Zeilen Zusammenfassung.
