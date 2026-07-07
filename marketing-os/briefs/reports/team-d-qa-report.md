# Team-D-Report — Integrations-QA (End-to-End)

> Stand: 07.07.2026 · Branch: `feat/marketing-os` · Windows · Node v24.14.0
> Geprüft: das **integrierte** System (Engine + Growth-Schicht + Dashboard) gegen den
> bindenden Kontrakt `ARCHITECTURE.md` (§4 Datenmodell, §6 API, §7 Views) + `policy/compliance.json`.
> Alle Läufe mit `MOS_DRY_RUN=1` (keine echten claude-/SSH-/Prod-/Stripe-/Brevo-Zugriffe).

## Status: PASS_WITH_FIXES

Das integrierte System funktioniert end-to-end: Engine-Tests grün, Bootstrap kopiert Team-B-Seeds,
alle §6-Endpunkte antworten kontraktkonform, Scheduler→Runner→Gate-Schleife produziert live
Artefakte + Gate-Ergebnisse, Dashboard baut fehlerfrei und wird statisch von der Engine ausgeliefert,
alle 6 Views rendern echte Daten, und ein realer Approve/Reject im Kanban schlägt korrekt auf die API durch.
**1 chirurgischer Code-Fix** (Engine, §4-Shape) angewandt. 2 nicht-blockierende Findings dokumentiert.

---

## Prüfmatrix

| # | Check | Ergebnis |
|---|---|---|
| 1 | `engine/ npm test` (MOS_DRY_RUN=1) | **PASS** — 38/38 grün (vor + nach Fix) |
| 2 | Engine-Start `MOS_DRY_RUN=1 npm start` (Hintergrund) | **PASS** — Health `{ok:true,version:"1.0.0",dryRun:true,uptimeSec}` |
| 2 | Bootstrap kopiert `data/seed/*` → `data/*.json` bei fehlender Datei | **PASS** — jobs/leads/kpis/state + outbox/logs erzeugt |
| 3 | `GET /api/health` Shape §6 | **PASS** |
| 3 | `GET /api/jobs` (+`?status=`), neueste zuerst, Job-Shape §4 | **PASS** |
| 3 | `POST /api/jobs` (queued) + 400 ohne Pflichtfelder | **PASS** |
| 3 | `POST /jobs/:id/approve` (review→approved) + 409/404-Fehlerpfade | **PASS** |
| 3 | `POST /jobs/:id/reject` (review→skipped) | **PASS** |
| 3 | `POST /jobs/:id/published` (approved→published) + 409 aus falschem Status | **PASS** |
| 3 | `GET /jobs/:id/output` → 404 ohne Artefakt, 200 `{content}` mit Artefakt | **PASS** |
| 3 | `GET /api/playbooks` (Playbook & {lastRun,nextRun,enabled}) | **PASS** |
| 3 | `POST /playbooks/:id/toggle` (flip) + 404 unbekannt | **PASS** |
| 3 | `POST /playbooks/:id/run-now` → Job (DRY-RUN erzeugt Artefakt + Gate) | **PASS** |
| 3 | `GET /api/leads` + `POST /api/leads` (+400) , Lead-Shape §4 | **PASS** |
| 3 | `GET /api/kpis?from&to` (Datumsfilter) + Kpi-Shape §4 | **PASS** |
| 3 | `POST /api/kpis/import` → `{imported}` (zählt nur valide) + 400 | **PASS** |
| 3 | `GET /api/funnel` totals + byChannel Shape §6 | **PASS** |
| 3 | `GET /api/compliance` policy + recentFindings Shape §6 | **PASS** |
| 3 | unbekannte `/api`-Route → 404 `{error}` | **PASS** |
| 4 | Playbook→Agent-Datei existiert (alle 10) | **PASS** |
| 4 | Playbook→Kanal ∈ `policy.allowedChannels` (alle 10) | **PASS** |
| 4 | jede Persona (8) von ≥1 Playbook genutzt | **PASS** (seo-pillar-writer 3×) |
| 5 | `dashboard/ npm run build` (tsc strict + vite) | **PASS** — nur recharts-Bundle-Warnung (>500 kB), kein Fehler |
| 5 | Engine served `dashboard/dist` statisch (`GET /` → HTML) | **PASS** — HTTP 200, text/html |
| 6 | Alle 6 Views öffnen, Konsole prüfen | **PASS** — 5 sauber; Analytics 1 a11y-`issue` (kein Fehler) |
| 6 | Realer Approve im Kanban → API-Gegenprüfung | **PASS** — 0003 review→**approved** |
| 6 | Realer Reject im Kanban → API-Gegenprüfung | **PASS** — 0006 review→**skipped** |
| 6 | 2 Screenshots gespeichert | **PASS** (siehe unten) |
| 7 | Engine sauber beendet; nur beabsichtigte Quell-Änderung in `git status` | **PASS** |

---

## Angewandte Fixes

### FIX 1 — Runner setzt `outputFile` (Datei: `marketing-os/engine/src/runner.js`)
**Begründung (§4-Shape-Abweichung, Engine-seitig korrekt):** Der Runner schreibt das Artefakt nach
`data/outbox/<id>.md`, aktualisierte aber das Job-Feld `outputFile` nicht. Für Jobs, die mit
`outputFile:null` in den Runner gehen (Seed-Queued-Jobs 0005/0006), blieb das Feld nach Verarbeitung
`null` — im Widerspruch zu §4, wo `outputFile` auf das Artefakt zeigt (`data/outbox/<jobId>.md`).
Minimal-invasiver 1-Zeilen-Patch: beim `review`-Übergang zusätzlich
`outputFile: \`data/outbox/${target.id}.md\`` setzen.
Verifiziert live: `job_20260707_0006` nach Runner-Lauf `outputFile="data/outbox/job_20260707_0006.md"`
(vorher `null`). Bricht keinen Test (Runner-Test prüft `outputFile` nicht) — 38/38 weiterhin grün.
Kein Dashboard-Gegen-Fix nötig, da das Dashboard das Output per Job-`id` lädt (nicht über `outputFile`).

*(Kein weiterer Code-Fix nötig: alle §6-Antwort-Shapes stimmen exakt mit dem Kontrakt überein; das
Dashboard weicht an keiner Stelle vom Kontrakt ab.)*

---

## Findings (nicht-blockierend, kein Fix angewandt — Karpathy: kein Scope-Ausbau)

### F-1 (MEDIUM) — Seed-Jobs 0001–0004 deklarieren `outputFile`, liefern aber keine Artefakt-Datei
`data/seed/jobs.json` setzt für die vor-existierenden Jobs (published/approved/review) einen
`outputFile`-Pfad, aber es werden **keine** zugehörigen `.md`-Dateien mitgeliefert; der Bootstrap
kopiert nur `data/*.json`, keine Outbox-Artefakte. Folge: `GET /jobs/:id/output` liefert für diese
4 Jobs korrekt **404** (dokumentiertes Verhalten, deckt sich mit Team-A-Test). Im Dashboard-Content-Review
wird beim **manuellen Auswählen** eines solchen Jobs (z. B. Block-Demo `job_20260707_0004`) ein
Browser-`404` in der Konsole erzeugt; die App fängt das sauber ab (ErrorView „Kein Artefakt für Job …",
kein Crash, Gate-Findings bleiben sichtbar). Die **Default-Ansicht** aller 6 Views bleibt konsolen-sauber,
da automatisch der neueste (Runner-erzeugte) Review-Job mit echtem Artefakt selektiert wird.
**Empfehlung (Team B + Team A):** Seed-Artefakte unter `data/seed/outbox/*.md` mitliefern und den
Store-Bootstrap um ein Kopieren fehlender Seed-Outbox-Dateien erweitern, falls ein voll bestücktes
Demo-Erlebnis gewünscht ist. Nicht Engine-Kontraktfehler → daher hier nur dokumentiert.

### F-2 (LOW) — Analytics: Metrik-`<select>` ohne `id`/`name`
DevTools meldet in der Analytics-View eine `issue` (kein JS-Fehler): „A form field element should have
an id or name attribute". Betrifft die Metrik-Auswahl. Rein a11y-/Best-Practice-Hinweis, keine
Funktionsbeeinträchtigung. **Empfehlung (Team C):** `id`/`name` + zugeordnetes `<label htmlFor>` ergänzen.

---

## Testresultate

**Engine (`cd marketing-os/engine && MOS_DRY_RUN=1 npm test`):**
```
ℹ tests 38  ℹ pass 38  ℹ fail 0   (identisch vor und nach FIX 1)
```

**API-Smoke (39 Assertions gegen §6, reale HTTP-Aufrufe an 127.0.0.1:4870):**
38 PASS. Die 1 anfängliche „FAIL" war eine zu strenge Test-Annahme meinerseits (Seed-Job ohne
Artefakt → 404 ist korrekt, siehe F-1), kein System-Defekt. Abgedeckt: health, jobs (list/filter/create/
approve/reject/published/output inkl. 400/404/409), playbooks (list/toggle/run-now), leads, kpis
(filter/import), funnel, compliance, unbekannte Route.

**Playbook-Konsistenz:** 10/10 Playbooks → existierende Persona + erlaubter Kanal; 8/8 Personas genutzt.

**Dashboard-Build:** `tsc --noEmit` (strict) + `vite build` fehlerfrei; `dist/` erzeugt und von der
Engine unter `GET /` ausgeliefert (HTTP 200, text/html).

**Live-Integrationsnachweis:** Während der Browser-Session feuerte der 60-s-Scheduler-Tick und erzeugte
aus fälligen Playbooks neue Jobs, die der Runner sequenziell nach `review` verarbeitete (DRY-RUN-Artefakt
+ Gate-Ergebnis) — Scheduler→Runner→Gate-Kette end-to-end bestätigt. Kanban-Approve (`0003`→approved)
und -Reject (`0006`→skipped) per API gegengeprüft.

---

## Screenshots
- `marketing-os/briefs/reports/screenshot-uebersicht.png` — Übersicht (KPI-Tiles, Funnel, Kanal-Tabelle, Engine online · DRY-RUN)
- `marketing-os/briefs/reports/screenshot-pipeline.png` — Pipeline-Kanban (queued/running/review/approved/published, Gate-Badges inkl. „blockiert")

---

## Hygiene / Leitplanken eingehalten
- Kein `git commit`/`push`/`checkout` (nur lesend `git status`/`diff`/`check-ignore`).
- Keine echten claude-Aufrufe (durchgängig `MOS_DRY_RUN=1`), keine SSH-/Prod-/Stripe-/Brevo-Zugriffe.
- `git status` final: nur `engine/src/runner.js` (M, +1 Zeile) + 2 Screenshots + dieser Report (untracked).
  Laufzeitdateien (`data/*.json`, `data/outbox/*`, `data/logs/*`, `dashboard/dist/`) korrekt gitignored,
  erscheinen **nicht** als Änderung. Echte Umlaute durchgängig.
