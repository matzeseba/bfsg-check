# Marketing-OS Engine (Team A)

Lokaler Node.js-Orchestrator des Marketing-Agent-OS: **Scheduler**, **Runner**, **Compliance-Gate**
und **API** — dateibasiert (JSON), keine Datenbank. Einzige Laufzeit-Dependency: `express`.
Kontrakt: `../ARCHITECTURE.md` (§4 Datenlayer, §5 Module, §6 API), Legal: `../policy/compliance.json`.

## Schnellstart

```bash
cd marketing-os/engine
npm install            # installiert express
npm start              # Engine auf http://127.0.0.1:4870
```

Erststart kopiert vorhandene `../data/seed/*.json` nach `../data/*.json` (Bootstrap) und legt
`../data/outbox/` + `../data/logs/` an. Fehlen Seeds, werden valide Leer-Defaults geschrieben.
Fehlen `../playbooks/` oder `../agents/` (Team B baut parallel), startet die Engine trotzdem —
die Playbook-Liste ist dann einfach leer.

### Health-Check

```bash
curl http://127.0.0.1:4870/api/health
# { "ok": true, "version": "1.0.0", "dryRun": false, "uptimeSec": 3 }
```

## Tests

```bash
npm test               # node --test test/  (>20 Tests, keine echten claude-Calls)
```

Die Tests laufen vollständig offline: der Runner bekommt einen Fake-Executor, die API startet
auf einem Ephemeral-Port und wird per `fetch` geprüft. Nichts spawnt die Claude-CLI.

## Umgebungsvariablen

| Variable        | Default        | Zweck                                                                 |
|-----------------|----------------|-----------------------------------------------------------------------|
| `MOS_PORT`      | `4870`         | API-Port (bind 127.0.0.1)                                             |
| `MOS_DRY_RUN`   | _(aus)_        | `1` => Runner erzeugt deterministischen Dummy-Markdown, kein CLI-Spawn |
| `MOS_DATA_DIR`  | `../data`      | Laufzeit-State-Verzeichnis (für isolierte Setups/Tests)             |

Beispiel (PowerShell):

```powershell
$env:MOS_DRY_RUN = "1"; npm start
```

Beispiel (bash):

```bash
MOS_DRY_RUN=1 npm start
```

## Wie ein Job durch die Engine läuft

1. **Scheduler** (Tick alle 60 s): fällige Playbooks (`daily|weekly|interval|once`) erzeugen
   `queued`-Jobs; `data/state.json` hält `lastRun` je Playbook fest.
2. **Runner** (sequentiell, max. 1): baut den Prompt = Persona (`../agents/<agent>.md`) +
   Policy-Kurzfassung + `promptTemplate`, ruft den Executor, schreibt das Ergebnis nach
   `../data/outbox/<jobId>.md`, lässt das **Gate** laufen und setzt den Status auf `review`
   (bzw. `failed` bei Executor-Fehler).
3. **Gate**: prüft gegen `../policy/compliance.json` (verbotene Regex-Muster case-insensitive,
   Kanal-Whitelist, Disclaimer-Pflicht). `block`-Findings => `passed:false`, bleiben **sichtbar**
   in `review` — kein stilles Auto-Fixen.
4. **Owner** gibt im Dashboard frei (`review -> approved`) und markiert nach realer
   Veröffentlichung `approved -> published`. **Kein Auto-Publishing.**

Der Default-Executor (`src/claude-exec.js`) ruft die Claude-CLI headless:
`claude -p --model claude-sonnet-5 --output-format json --max-turns 30 --allowedTools "Read,Grep,Glob"`
(cwd = Repo-Wurzel, Timeout 10 min, Prompt via stdin — robust unter Windows). Er schreibt **nie
selbst** Dateien; das Artefakt landet ausschließlich über den Runner in der Outbox.

## Headless-Betrieb (Windows Task Scheduler)

Engine ohne offene Session als geplante Aufgabe starten (täglich 07:00, im Hintergrund):

```bat
schtasks /Create ^
  /TN "MarketingOS-Engine" ^
  /TR "cmd /c cd /d C:\Users\Administrator\bfsg-check\marketing-os\engine && npm start >> ..\data\logs\service.out.log 2>&1" ^
  /SC DAILY /ST 07:00 /RL LIMITED /F
```

Sofort testen bzw. wieder entfernen:

```bat
schtasks /Run /TN "MarketingOS-Engine"
schtasks /Delete /TN "MarketingOS-Engine" /F
```

Für echten Dauerbetrieb (Auto-Restart) empfiehlt sich ein Prozess-Manager wie `pm2`
(`pm2 start src/server.js --name marketing-os`). Der Scheduler selbst tickt intern jede Minute,
solange der Prozess läuft.

## Modul-Landkarte (`src/`)

| Datei            | Aufgabe                                                        |
|------------------|---------------------------------------------------------------|
| `config.js`      | Pfade + Runtime-Flags (override-bar für Tests)               |
| `store.js`       | atomare JSON-Reads/Writes (temp+rename), Bootstrap, Job-Helfer |
| `jobs.js`        | Job-Factory + fortlaufende ID (`job_YYYYMMDD_NNNN`)          |
| `scheduler.js`   | Kadenz-Logik + 60-s-Tick                                     |
| `runner.js`      | sequentielle Job-Verarbeitung, Prompt -> Executor -> Gate     |
| `claude-exec.js` | Default-Executor (CLI-Spawn / DRY_RUN-Dummy)                 |
| `prompt.js`      | Prompt-Bau (Persona + Policy-Kurzfassung + Aufgabe)          |
| `gate.js`        | Compliance-Gate (Regex, Kanal, Disclaimer)                  |
| `log.js`         | Append-only Tageslog `data/logs/YYYY-MM-DD.md`              |
| `playbooks.js`   | defensives Laden der `../playbooks/*.json`                   |
| `api.js`         | Express-API nach §6                                          |
| `server.js`      | Entry: Bootstrap -> API + Scheduler + Runner                |
