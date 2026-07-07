# Team D — QA-Report: Marketing-OS-Dashboard v2 (E2E-Verifikation)

**Datum:** 08.07.2026
**Worktree:** `C:\Users\Administrator\bfsg-check\.claude\worktrees\marketing-os-dashboard-v2\marketing-os`
**Branch:** `worktree-marketing-os-dashboard-v2` (uncommitted WIP von Team Engine + Team Dashboard, aufbauend auf `506c382`/PR #136)
**Engine-Port:** 4871 (MOS_DRY_RUN=1)

## Verdikt: **PASS_WITH_FINDINGS**

Alle 71 Engine-Tests grün, Dashboard-Build grün, kompletter Ads-Lifecycle (generate → review → freigegeben → live → pausiert) und Job-Publish-Nachweis funktionieren End-to-End korrekt inkl. Persistenz. Ein echter Anzeigefehler gefunden (CTR wird um Faktor 100 zu klein angezeigt), kein Blocker für Kernfunktion, aber sichtbar falsch für den Nutzer. Sonst keine Blocker, keine Konsolen-Errors.

---

## 1. Build + Tests

| Prüfpunkt | Soll | Ist | Status |
|---|---|---|---|
| `engine/` `npm test` | 71/71 grün | 71/71 grün, 0 fail | ✅ |
| `dashboard/` `npm run build` | grün, `dist/` entsteht | grün (`tsc --noEmit && vite build`), `dist/` vorhanden. Nur Info-Warnung "chunk > 500kB" (kein Fehler) | ✅ |

## 2. Engine-Start (DRY-RUN, Port 4871)

| Prüfpunkt | Soll | Ist | Status |
|---|---|---|---|
| `MOS_PORT=4871 MOS_DRY_RUN=1 node src/server.js` | startet, `/api/health` antwortet | `{"ok":true,"version":"1.0.0","dryRun":true,...}` | ✅ |

## 3. API-E2E

| Prüfpunkt | Soll | Ist | Status |
|---|---|---|---|
| `GET /api/datasources` | integrations alle `connected:false`, kpis/leads `source:"demo"` | exakt so: `{"kpis":{"source":"demo"},"leads":{"source":"demo"},"integrations":{"stripe":{"connected":false},"brevo":{"connected":false},"googleAds":{"connected":false},"bingAds":{"connected":false}}}` | ✅ |
| `GET /api/kpis` | `meta.hasDemo=true` | `meta:{"hasDemo":true,"demoCount":64,"totalCount":64}` | ✅ |
| `GET /api/kpis?includeDemo=false` | `data` leer, `meta.totalCount` stimmig | `{"data":[],"meta":{"hasDemo":false,"demoCount":0,"totalCount":0}}` | ✅ |
| `GET /api/leads` (+ `?includeDemo=false`) | analog kpis | `meta:{"hasDemo":true,"demoCount":20,"totalCount":20}` → mit Filter `{"data":[],"meta":{hasDemo:false,demoCount:0,totalCount:0}}` | ✅ |
| `GET /api/funnel` (+ `?includeDemo=false`) | `{data:{totals,byChannel},meta}` | Form korrekt; bei `includeDemo=false` bleiben `jobsInReview:4` und `published30d:1` erhalten (stammen aus dem Job-Store, nicht aus den demo-geflaggten Lead-/KPI-Datensätzen) — plausibel, kein Bug | ✅ |
| `POST /api/ads/campaigns/generate` | `{campaign,jobId}`, Status `review` | `camp_20260708_0002` / `job_20260708_0002`, Status `review` | ✅ |
| `GET /api/ads/campaigns` | neue Kampagne mit Status `review` | vorhanden | ✅ |
| DRY-RUN-Job Verarbeitung | Job läuft automatisch `queued→review` | ja, innerhalb von ~3s ohne Polling-Notwendigkeit (Gate `passed:true`) | ✅ |
| `POST /api/jobs/:id/approve` | Kampagne → `freigegeben` | Job-Status `approved`, Kampagne-Status `freigegeben` | ✅ |
| `POST /api/ads/campaigns/:id/live` | Status `live` + `liveAt` | gesetzt, `liveUrl` korrekt übernommen | ✅ |
| `POST /api/ads/metrics` (costEur) | Eintrag anlegen | `{"metric":{...,"costEur":13,...}}` | ✅ |
| `GET /api/ads/campaigns/:id/metrics` | 1 Eintrag | genau 1 Eintrag mit den geposteten Werten | ✅ |
| `GET /api/ads/summary` | spend=13, clicks=50, cpc=0.26, ctr=0.05, cac=6.5 | exakt: `{"spend":13,...,"cpc":0.26,"ctr":0.05,...,"cac":6.5}` inkl. korrektem `perCampaign` und `timeseries` | ✅ |
| `POST /api/ads/campaigns/:id/pause` | Status `pausiert` | ✅ | ✅ |
| `POST /api/jobs/:id/published` `{url}` | `publishedUrl`/`publishedAt` gesetzt und persistent | gesetzt, beim Re-Fetch weiterhin vorhanden | ✅ |
| `GET /api/jobs/gibtsnicht` | 404 | `404 {"error":"Job gibtsnicht nicht gefunden"}` | ✅ |
| `GET /api/ads/campaigns/gibtsnicht/metrics` | 404 | `404 {"error":"Kampagne gibtsnicht nicht gefunden"}` | ✅ |

## 4. UI-Smoke (Chrome DevTools, http://localhost:4871)

| Bereich | Soll | Ist | Status |
|---|---|---|---|
| Übersicht | 4 Kern-Kacheln, "Nächste Schritte", Datenquellen-Panel alle "Nicht verbunden", Demo-Hinweis mit Toggle | 4 KPI-Kacheln vorhanden ("Wartet auf Freigabe", "Veröffentlicht diese Woche", "Datenquellen", "Ads"), "Nächste Schritte für dich" mit 10 Einträgen, Datenquellen-Panel korrekt alle "Nicht verbunden". Statt eines dauerhaft sichtbaren "Demo-Banners" gibt es einen Hinweis-Block + Button "Demo-Daten anzeigen" (Default: aus). Klick blendet Demo-Zahlen inkl. Warnhinweis "⚠ Demo-Daten — das sind KEINE echten Zahlen" korrekt ein, danach wieder korrekt zurückgesetzt. **Funktional korrekt**, Wording "Banner" aus dem Auftrag trifft nicht exakt zu, aber die Demo-Ehrlichkeits-Logik (versteckt by default, klar markiert wenn eingeblendet) funktioniert wie gewünscht. | ✅ |
| Pipeline + Drawer | Job anklicken → Drawer mit Markdown-Vorschau + "So wird veröffentlicht"-Box; Sektion "Veröffentlicht" mit Was/Wo/Wann | Job liegt korrekt in Kanban-Spalte "Veröffentlicht"; separate Pipeline-Sektion "Veröffentlicht" (Was/Wo/Wann) zeigt `paid_ads_google` / `https://bfsg-fix.de/qa-test` / `08.07.2026, 00:37 Uhr`. Drawer zeigt Markdown-Inhalt korrekt. Für den bereits publizierten Job wird statt "So wird veröffentlicht" (das ist laut Code, `dashboard/src/components/JobDrawer.tsx:145`, bewusst nur für nicht-veröffentlichte Jobs vorgesehen) die Sektion "Veröffentlichung bestätigt" mit Datum + Link angezeigt — **das ist korrektes, gewolltes State-Verhalten, kein Bug** (mein ursprünglicher Prüfauftrag ging fälschlich von Koexistenz beider Boxen aus). | ✅ |
| Paid Ads + Drawer + Modal | Summary-Kacheln zeigen echte Werte, Kampagnentabelle zeigt QA-Kampagne, Kampagnen-Drawer mit Verlaufstabelle, "Neue Kampagne"-Modal öffnet ohne Absenden | Summary-Kacheln zeigen echte Werte (13 €, 1.000, 50, 0,26 €, 2, 6,50 €) — **außer CTR, siehe Bug unten**. Kampagne mit Status "Pausiert" korrekt in Tabelle. Kampagnen-Drawer zeigt Verlaufstabelle mit exakt dem geposteten Metrik-Eintrag. Modal "Neue Kampagne erstellen" öffnet mit allen erwarteten Feldern, wurde per "Abbrechen" ohne Submit geschlossen. | ⚠️ (CTR-Bug) |
| Konsole | keine JS-Errors | 0 error/warn. Ein einzelner `issue`-Eintrag (kein Error/Warning): "A form field element should have an id or name attribute (count: 9)" — Accessibility-Hinweis im "Neue Kampagne"-Modal, kein funktionaler Fehler, aber erwähnenswert für das eigene A11y-Dogfooding-Ziel des Produkts. | ✅ (info) |

### Screenshots
Alle unter `marketing-os/briefs/reports/`:
- `qa-v2-uebersicht.png`
- `qa-v2-uebersicht-demo-toggle.png`
- `qa-v2-pipeline.png`
- `qa-v2-pipeline-drawer.png`
- `qa-v2-paid-ads.png`
- `qa-v2-paid-ads-drawer.png`
- `qa-v2-paid-ads-new-campaign-modal.png`

---

## 5. Gefundene Bugs

### Bug 1 (mittel): CTR wird im UI um Faktor 100 zu klein angezeigt

- **Symptom:** Bei `ctr=0.05` (= 5 %, von der Engine korrekt als Bruch geliefert und in `engine/test/ads.test.js:66` auch so spezifiziert — `assert.equal(perCampaign[0].ctr, 0.1)` für 10 %) zeigt die Paid-Ads-Summary-Kachel "0,1 %" statt "5 %".
- **Ursache (Verdacht):** `dashboard/src/lib/format.ts:195-197`, Funktion `formatPercent(value)`:
  ```ts
  export function formatPercent(value: number): string {
    return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(value)} %`;
  }
  ```
  Die Funktion hängt nur ein "%"-Zeichen an, ohne den als Bruch (0–1) übergebenen Wert mit 100 zu multiplizieren. `formatPercent(0.05)` rundet auf `Intl.NumberFormat`-Ebene zu "0,1" und ergibt "0,1 %" statt "5,0 %".
  Aufrufstelle: `dashboard/src/views/PaidAds.tsx:34` — `{ label: 'CTR', value: formatOrDash(s.ctr, formatPercent) }`.
- **Reproduktion:** `GET /api/ads/summary` liefert `ctr:0.05` (verifiziert), UI zeigt "0,1 %" (per Screenshot `qa-v2-paid-ads.png` bestätigt).
- **Fix-Empfehlung:** In `formatPercent` den Wert vor Formatierung mit 100 multiplizieren (`value * 100`), oder — falls `formatPercent` an anderer Stelle bereits Prozent-skalierte Werte erwartet — stattdessen am Call-Ort in `PaidAds.tsx` mit einer Variante `formatRatioAsPercent` arbeiten. Nicht selbst gefixt (keine triviale String-Korrektur, sondern Logikänderung — außerhalb meines QA-Mandats).
- **Schweregrad:** Mittel — keine Datenkorruption, aber irreführende Kennzahl für den Nutzer (5 % vs. angezeigte 0,1 % ist ein Faktor 50 Unterschied in der Wahrnehmung der Klickrate).

---

## 6. Sonstige Beobachtungen (kein Bug)

- **Seed-Dateien lokal verändert:** `git status --porcelain marketing-os/data/` zeigt ausschließlich `data/seed/kpis.json` und `data/seed/leads.json` als modifiziert (Feld `demo: true` ergänzt gegenüber dem committeten Stand aus PR #136/Team B). Verifiziert per Zeitstempel: Diese Änderung existierte bereits **vor** meinem Testlauf (Team-Engine/Team-Dashboard-WIP, Teil der unkommittierten v2-Arbeit — passt exakt zur Erwartung aus dem Prüfauftrag "…außer ggf. seed/"). Keine meiner Aktionen (Tests, curl, UI-Klicks) hat diese Dateien verändert; `bootstrap()` in `engine/src/store.js:45-66` schreibt nachweislich nur nach `data/*.json`, nie zurück nach `data/seed/*.json`. **Kein Rollback nötig, kein Bug.**
- **Vorbestehender Chrome-Prozess blockierte die Browser-Automation kurzzeitig** (verwaister `chrome-devtools-mcp`-Prozess, PID 45960, aus einer früheren Session) — wurde vom UI-Test-Agent per `taskkill` beendet, bevor die eigentlichen Tests liefen. Kein Produktbug, reine Testumgebungs-Hygiene.
- A11y-Hinweis "form field element should have an id or name attribute (count: 9)" im "Neue Kampagne"-Modal — kein funktionaler Fehler, aber angesichts des eigenen BFSG-Fuchs-Produktanspruchs (Accessibility-Scanner) erwähnenswert für ein späteres A11y-Pass.

---

## 7. Cleanup

- Engine-Prozess (PID 26224, Port 4871) beendet, `/api/health` antwortet danach nicht mehr.
- `git status --porcelain marketing-os/data/` zeigt weiterhin nur die vorbestehende `seed/`-Änderung (siehe oben) — keine neuen unerwarteten Diffs durch meinen Testlauf.
- Neu erzeugt (nicht zurückgerollt, wie im Auftrag verlangt): Testkampagne `camp_20260708_0002`, Testjob `job_20260708_0002`, 7 Screenshot-Dateien unter `briefs/reports/`.
