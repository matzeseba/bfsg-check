# SRE / Operational-Reliability Audit — BFSG-Check

**Datum:** 2026-06-21
**Auditor:** SRE (Agency-Agents Persona) — Read-only, keine Live-Aktionen
**Scope:** Single-Server LIVE-SaaS mit Echtgeld-Zahlungen. Hetzner CPX22 (Nürnberg, Ubuntu 24.04), Docker Compose + Caddy, Node 22, Stripe-Webhook + GoBD-Rechnungen auf einer Box.
**Methodik:** Statische Analyse der Repo-Files (`deployment/`, `.github/workflows/`, `scanner/lib/`, `docs/`). Kein SSH, kein Deploy, keine Stripe-Calls. Secrets redigiert.

> **Reliability ist ein Feature mit Budget.** Diese Box hält Zahlungen, GoBD-pflichtige Rechnungsnummern und PII — der Fehlerbudget-Spielraum bei Datenverlust ist faktisch **null** (legal + finanziell). Die folgenden Findings sind nach Blast-Radius auf genau dieses Risiko sortiert.

---

## Executive Summary

Die Codebase ist für ein Solo-Projekt **überdurchschnittlich sauber**: Webhook-Idempotenz, SSRF-Guard, Concurrency-Gate, append-only Order-Log mit defensivem Parsing, ein durchdachtes (geskriptetes) GPG-Backup, Uptime-Watch alle 5 Min mit Mail-Alert, und ein optionaler Sentry/Pino-Stack. Das Fundament stimmt.

**Aber:** Der entscheidende Reliability-Gap liegt nicht im Code, sondern im **Betriebszustand** — mehrere kritische Mechanismen sind *gebaut, aber nicht scharf*, und der Deploy-Pfad kann während eines Builds bezahlte-aber-noch-nicht-persistierte Webhooks **lautlos verschlucken**. Bei aktuell niedrigem Traffic ist das Risiko gering; **vor jeder Traffic-Skalierung** muss es geschlossen werden, sonst skaliert man die Wahrscheinlichkeit von „Kunde zahlt, bekommt nichts, kein Record, kein Stripe-Retry" linear mit den Sales mit.

### Top 3 Reliability-Risiken vor Traffic-Skalierung

1. **Backup ist NICHT verifiziert scharf (S-01, Critical).** Die gesamte Backup-Kette (Script, Cron, Restore, Monatstest) ist im Repo vorhanden, aber ob auf dem Live-Server `BACKUP_GPG_RECIPIENT` + `BACKUP_TARGET` + `rclone.conf` + GPG-Pubkey wirklich gesetzt sind, ist **unbestätigt**. Ohne diese vier Dinge läuft das Backup nur lokal in `/var/backups/bfsg/` **auf demselben Volume-Host** — d.h. bei Server-/Disk-Verlust sind Orders + GoBD-Rechnungen **weg**. Ein Restore-Test mit echtem Keypair wurde laut Doku noch nie durchgeführt.

2. **Hard-Restart-Deploy kann In-Flight-Webhooks verlieren (D-01, High).** `docker compose up -d --build` killt den App-Container ohne Connection-Draining. Der Webhook-Handler quittiert Stripe mit `200` *bevor* die (10–60 s dauernde) Playwright-Fulfillment läuft. Wird der Container in diesem Fenster neu gebaut, ist die Zahlung erfasst-aber-nicht-ausgeliefert — und weil Stripe bereits `200` bekam, gibt es **keinen Retry**. Recovery ist nur manuell über `recordPaid`-Log möglich, *sofern* dieses bereits geflusht war.

3. **One-Person-On-Call hat blinde Flecken bei Disk/OOM/Cert/Webhook-Fail (M-01, High).** Uptime-Watch prüft nur den HTTP-200/`ok:true`-Happy-Path von `/health`. Es gibt **keine proaktive Alarmierung** für: volllaufende Disk (Chromium-Temp + wachsende JSONL + Docker-Layer), Memory/OOM-Kill (Playwright auf CPX22!), Cert-Expiry, oder fehlgeschlagene Webhook-Fulfillment. Diese Signale existieren teils (Sentry, `daily-health-check.sh`), sind aber **nicht aktiviert / nicht gescheduled**.

---

## Harden-Before-Launch Checkliste (priorisiert)

> „Launch" = bewusste Traffic-Skalierung (Ads hochdrehen). Reihenfolge = Blast-Radius.

- [ ] **(S-01)** Auf dem Server verifizieren: `BACKUP_GPG_RECIPIENT`, `BACKUP_TARGET`, `rclone.conf`, GPG-Pubkey gesetzt → **echten** Restore-Test mit Offline-Privatekey 1× durchführen. Bis dahin gilt: **kein verifiziertes Backup = nicht skalieren.**
- [ ] **(S-02)** Off-Site-Target einrichten (Hetzner Storage-Box, anderes RZ/Provider als der Server-Standort wäre ideal). Lokal-only-Backup zählt nicht als Backup.
- [ ] **(D-01)** Pre-Build Health-Gate + Webhook-Draining in `deploy.yml`: vor `up -d --build` einen Stop-Grace + kurzes Drain-Window; nach Build Health-Check **mit echtem Rollback** statt nur `exit 1`.
- [ ] **(D-02)** Build erfolgt aktuell *auf dem Prod-Host*. Ein fehlschlagender Build (z.B. npm/Playwright-Registry-Hiccup) während `--build` kann den laufenden Container ersetzen/abreißen. Image-Build vom Prod-Pfad entkoppeln oder zumindest `--build` nur bei geänderten Layern + Rollback-Pfad.
- [ ] **(M-01)** Disk-Full + Memory + Cert-Expiry Alerting aktivieren (cron `daily-health-check.sh` ODER 3 Zeilen im Uptime-Watch). Webhook-Fulfillment-Failure → Brevo/Sentry-Alert scharfschalten.
- [ ] **(SEC-01)** Echte Owner-Mail (`matthiasseba92@gmail.com`) aus committed `deployment/cloud-init.yaml` entfernen → auf Platzhalter/Hetzner-API-Injection umstellen.
- [ ] **(C-01)** Memory-Limits + OOM-Verhalten für `app` (Playwright) in Compose setzen; `MAX_CONCURRENT_SCANS` gegen RAM auf CPX22 verifizieren.
- [ ] **(D-03)** `git reset --hard origin/main` im Deploy → Server-lokale Hotfixes/Untracked werden lautlos vernichtet. Bewusst dokumentieren oder absichern.
- [ ] **(S-03)** Invoice-Counter (`invoice-counter.json`) atomar schreiben (temp+rename) — GoBD-Nummernkreis darf bei Crash nicht korrupt/lückig werden.

---

## Findings

### S-01 — Backup-Kette gebaut, aber nicht verifiziert scharf
- **Severity:** Critical
- **Area:** Backup
- **Already-handled?:** Teilweise (Code y / Live-Aktivierung **unbestätigt**, Restore-Test n)
- **Problem:** `deployment/backup.sh`, `restore.sh`, der Cron-Eintrag in `cloud-init.yaml` (`/etc/cron.d/bfsg-backup`, täglich 03:00 UTC) und der monatliche `backup-restore-test.yml` existieren und sind sauber geschrieben. **Aber** das Backup verschlüsselt+uploaded nur, wenn `BACKUP_GPG_RECIPIENT` und `BACKUP_TARGET` in der Server-`.env` gesetzt sind UND `rclone.conf` + GPG-Pubkey importiert wurden. `docs/BACKUP.md` listet das explizit als offene **„Mensch-Pflichten"** mit unangehakten Checkboxen — inkl. *„Restore-Test mind. 1× vor Live-Schaltung"*. Ohne diese Config fällt `backup.sh` per Design auf **lokales** `/var/backups/bfsg/` zurück (`[WARN] BACKUP_TARGET nicht gesetzt`).
- **Blast-radius:** **Total + irreversibel.** Bei Server-/Disk-/Volume-Verlust gehen `orders.jsonl` (alle bezahlten Bestellungen), `invoices/*.pdf` (GoBD-Pflicht 10 Jahre), `invoice-counter.json` und `subscriptions.jsonl` verloren. Das ist gleichzeitig ein **finanzieller** (verlorene Aufträge, keine Nachlieferung) und **rechtlicher** (GoBD-Aufbewahrungsverstoß, fehlende Rechnungsbelege) Schaden. Der `backup-restore-test.yml` testet nur einen **synthetischen symmetrischen GPG-Roundtrip in CI** — er beweist *nicht*, dass das echte Server-Backup mit dem echten asymmetrischen Keypair je funktioniert hat.
- **Concrete Fix:**
  1. Auf dem Server (durch Owner, da SSH außerhalb meines Scopes):
     ```bash
     grep -E '^BACKUP_(GPG_RECIPIENT|TARGET)=' /opt/bfsg-check/deployment/.env   # müssen gesetzt sein
     gpg --list-keys backup@bfsg-fix.de                                          # Pubkey importiert?
     rclone listremotes                                                          # Remote da?
     sudo /opt/bfsg-check/deployment/backup.sh                                   # manueller Lauf
     rclone ls "$BACKUP_TARGET" | tail                                           # liegt das Archiv off-site?
     ```
  2. **Echten** Restore-Test mit dem OFFLINE-Privatekey auf einer separaten Maschine (nicht Prod):
     ```bash
     LATEST=$(rclone lsf "$BACKUP_TARGET" | sort | tail -1)
     rclone copy "$BACKUP_TARGET/$LATEST" /tmp/
     ./deployment/restore.sh "/tmp/$LATEST" /tmp/restore-test
     ls -la /tmp/restore-test/  # orders.jsonl + invoices/ + invoice-counter.json prüfen
     ```
  3. Erst nach erfolgreichem Restore-Test die Checkbox in `docs/BACKUP.md` abhaken **und** Datum/Ergebnis dort vermerken.
- **Hinweis:** Der `notion-sync.yml` (alle 15 Min) zieht Order-/Subscription-**Metadaten** off-box nach Notion — das ist ein *zufälliger* Teil-Backup-Effekt, deckt aber **nicht** die Rechnungs-PDFs oder den Invoice-Counter ab und ist kein Ersatz für ein echtes Backup.

---

### S-02 — Backup-Off-Site-Ziel nicht erzwungen, Single-Provider-Risk
- **Severity:** High
- **Area:** Backup
- **Already-handled?:** n (im Doc adressiert, nicht erzwungen)
- **Problem:** Selbst wenn das Backup läuft: Wenn `BACKUP_TARGET` eine Hetzner Storage-Box am selben Standort ist, trifft ein Hetzner-RZ-/Account-Ausfall Server **und** Backup gleichzeitig (`docs/BACKUP.md` benennt dieses „Single-Provider-Risk" selbst). Es gibt keinen Mechanismus, der erzwingt, dass überhaupt ein Off-Site-Ziel konfiguriert ist — der Fallback ist lautloses Lokal-Backup auf demselben Host.
- **Blast-radius:** Bei Provider-/Account-Level-Incident (Sperrung, RZ-Brand, Zahlungsausfall→Account-Suspend) sind Primärdaten und Backup zusammen verloren.
- **Concrete Fix:** Off-Site auf **anderen Provider/Region** legen (z.B. Backblaze B2 mit SCC für DSGVO, oder zweite Hetzner-Region). Zusätzlich einen Alert einbauen, der schreit, wenn `backup.sh` in den Lokal-Fallback fällt:
  ```bash
  # in backup.sh, im else-Zweig statt nur echo [WARN]:
  # curl Brevo-API oder sendmail → "Backup lief LOKAL ONLY am $(date)"
  ```

---

### D-01 — In-Flight-Webhooks gehen bei Hard-Restart-Deploy verloren
- **Severity:** High
- **Area:** Deploy
- **Already-handled?:** n
- **Problem:** `deploy.yml` macht `docker compose up -d --build`, was den `app`-Container neu erstellt (Hard-Stop, kein Connection-Draining, kein `stop_grace_period`). Im Webhook-Handler (`scanner/app.js:65-117`) ist die Reihenfolge:
  1. `claimEvent(event.id)` → Event wird **nur in-memory** (`processedEvents` Set in `orders.js`) als „behandelt" markiert; persistiert wird erst später in `recordPaid`.
  2. `res.json({ received: true })` → Stripe bekommt **sofort 200** (Zeile 86), *bevor* die Fulfillment läuft.
  3. `await handleCheckoutCompleted()` → erst hier `recordPaid()` (JSONL-Write), dann 10–60 s Playwright-Scan + PDF + Mail.

  Wird der Container zwischen Schritt 2 und dem `recordPaid`-Flush gekillt, ist die Lage: Stripe hat `200` → **kein Retry**; im Log steht **nichts** → keine Wiederaufnahme. Selbst wenn `recordPaid` durch ist, aber die Fulfillment abbricht, bleibt der Order in `FULFILLING` hängen und braucht manuelles `resend`.
- **Blast-radius:** Pro Deploy-Build ein Zeitfenster von ~ Sekunden, in dem ein gerade eingehender bezahlter Webhook **lautlos verschwindet** (Kunde zahlt, bekommt nichts, kein Record). Skaliert mit Deploy-Frequenz × Traffic. Bei einem Solo-Operator, der häufig auf `main` pusht, ist das real.
- **Concrete Fix:**
  - `stop_grace_period` + sauberes SIGTERM-Handling, damit laufende Fulfillments austrudeln:
    ```yaml
    # docker-compose.yml, service app:
    stop_grace_period: 90s
    ```
    und im App-Code einen `process.on('SIGTERM')`-Handler, der neue Webhooks ablehnt (503) aber laufende `await`s zu Ende führt, bevor `server.close()`.
  - Idempotenz-Persistenz **vor** dem 200-Ack härten: `claimEvent` sollte den Claim *durable* schreiben (append `{eventId, status:'CLAIMED'}`), nicht nur in-memory — dann überlebt der Dedup-/Recovery-State einen Crash, und ein periodischer Reconcile-Job kann `CLAIMED`-ohne-`PAID` gegen die Stripe-API nachziehen.
  - **Sicherheitsnetz unabhängig vom Code:** Stripe-Dashboard → Webhook-Endpoint hat eingebautes Retry nur bei non-2xx. Ergänzend einen **täglichen Reconcile** bauen: `stripe.checkout.sessions.list` der letzten 24 h gegen `orders.jsonl` diffen, Lücken alarmieren. Das fängt *jeden* verlorenen Webhook, egal aus welchem Grund.
- **Sauber gelöst ist bereits:** Doppel-Webhook-Race (atomarer `claimEvent` im Single-Thread-Eventloop) und Webhook-Signaturprüfung. Es geht hier rein um den **Crash-zwischen-Ack-und-Persist**-Fall.

---

### SEC-01 — Echte Owner-E-Mail im committed `cloud-init.yaml`
- **Severity:** Medium
- **Area:** Security
- **Already-handled?:** n (bestätigt: in HEAD getrackt)
- **Problem:** `deployment/cloud-init.yaml` (in `git show HEAD` verifiziert, Zeilen 49/53/54) enthält die echte private Adresse `matthiasseba92@gmail.com` als `SMTP_USER`, `REPLY_TO` und `ADMIN_EMAIL`. **Kein Live-Secret** — der `SMTP_PASS` ist korrekt ein `PLACEHOLDER_BREVO_KEY`, und `.env`/`out/` sind sauber gitignored + nicht getrackt (verifiziert). Es ist „nur" PII-Leak einer privaten Mailadresse in einem (vermutlich öffentlichen) GitHub-Repo → Spam-/Phishing-Vektor, und sie weicht von der in `.env.example` genutzten `matze.seba@outlook.de` ab.
- **Blast-radius:** Niedrig-mittel: harvestbare private Mailadresse; kein direkter System-Zugang. Reputations-/Spam-Risiko.
- **Concrete Fix:** In `cloud-init.yaml` die Mailwerte durch Platzhalter ersetzen (wie `SMTP_PASS` schon einer ist) und beim Hetzner-Server-Create per API/User-Data injizieren:
  ```yaml
  SMTP_USER=PLACEHOLDER_SMTP_USER
  REPLY_TO=PLACEHOLDER_REPLY_TO
  ADMIN_EMAIL=PLACEHOLDER_ADMIN_EMAIL
  ```
  Da der Wert keine Credential ist, ist History-Rewrite (BFG) optional; entfernen aus dem aktuellen Stand reicht praktisch. Owner ggf. informieren.

---

### C-01 — Keine Memory-Limits; Playwright/Chromium-OOM-Risiko auf CPX22
- **Severity:** Medium
- **Area:** Capacity
- **Already-handled?:** Teilweise (Concurrency-Cap y / Memory-Limit n)
- **Problem:** `docker-compose.yml` setzt für den `app`-Service `shm_size: 1gb` (gut für Chromium) — aber **keine** `mem_limit`/`deploy.resources`. Chromium ist auf einer CPX22 (laut Doku 4 GB RAM bei CX22-Annahme, CPX22 hat lt. Hetzner-Specs **8 GB / 3 vCPU**) speicherhungrig: pro paralleler Playwright-Instanz schnell 300–700 MB+. Es laufen vier Container (`app`, `landing-next`, `admin-next`, `caddy`) + `invoice.js` startet **zusätzliche** ad-hoc Chromium-Instanzen für PDF (`chromium.launch()` pro Rechnung, außerhalb des `concurrencyGate`!). Bei gleichzeitigen Scans + PDF-Generierung kann der Peak die RAM-Decke reißen → OOM-Killer trifft potenziell den **App- oder DB-schreibenden** Prozess.
- **Blast-radius:** OOM-Kill mitten in Fulfillment → siehe D-01 (Order hängt in `FULFILLING`, evtl. korrupter Invoice-Counter-Write). Unter Last selbstverstärkend.
- **Concrete Fix:**
  - Memory-Limit + Reservation pro Service setzen, app großzügig, andere knapp:
    ```yaml
    app:
      mem_limit: 3g
      mem_reservation: 1g
    landing-next: { mem_limit: 512m }
    admin-next:   { mem_limit: 512m }
    ```
  - PDF-Chromium-Launches in `invoice.js` ebenfalls durch das `concurrencyGate` ziehen oder einen wiederverwendeten Browser-Context nutzen, statt pro Rechnung neu zu launchen.
  - `MAX_CONCURRENT_SCANS` (Default 2) gegen real gemessenen RSS unter Last validieren; konservativ bei 2 bleiben, bis Metriken vorliegen.

---

### M-01 — Monitoring-Lücken für One-Person-On-Call (Disk / OOM / Cert / Webhook-Fail)
- **Severity:** High
- **Area:** Monitoring
- **Already-handled?:** Teilweise (Uptime-Happy-Path y / proaktive Saturation-Alerts n)
- **Problem:** `uptime-watch.yml` ist solide für „ist die Seite oben?" (5-Min `/health`, Brevo-Mail bei non-200 oder `ok:false`). Aber die **Golden Signal „Saturation"** ist komplett unüberwacht-mit-Alert:
  - **Disk-Full:** Chromium-Temp, wachsende JSONL, Docker-Build-Layer (jeder `--build` auf dem Prod-Host akkumuliert Layer!) und Rechnungs-PDFs füllen `/`. `daily-health-check.sh` prüft das **nicht** mal, und es ist **nirgends gescheduled** (nur ein lokal-manuelles Script). `diagnose.yml` zeigt `df -h` nur bei manuellem Trigger.
  - **Memory/OOM:** Kein Alert. Ein OOM-Kill+`restart: unless-stopped`-Recovery sieht für Uptime-Watch evtl. „gesund" aus, während Orders verloren gingen.
  - **Cert-Expiry:** `daily-health-check.sh` prüft Cert-Tage — läuft aber nirgends automatisch. Caddy auto-renewed zwar, aber ein Renewal-Failure (DNS/Rate-Limit) wird **nicht** alarmiert (in `MONITORING.md` ehrlich als „— / manuell" markiert).
  - **Webhook-Fulfillment-Failure:** Wird nur via Sentry/`sendAlert` erfasst — und **Sentry ist optional** (`SENTRY_DSN` muss gesetzt sein; per `sentry.js` sonst no-op). Ob es live aktiv ist: unbestätigt.
- **Blast-radius:** Klassisches „2 Uhr nachts, bfsg-fix.de ist down" — der Operator erfährt es erst, wenn `/health` hart fällt. Schleichende Saturation (Disk bei 95 %, Memory-Pressure) wird **nicht** früh genug erkannt, um zu handeln; der erste Alert ist oft schon der Totalausfall.
- **Concrete Fix:**
  - `daily-health-check.sh` per Cron auf dem Server schärfen **und** um Disk/Memory ergänzen:
    ```bash
    # /etc/cron.d/bfsg-healthcheck
    0 8 * * * root df -h / | awk 'NR==2 && int($5)>85 {print "DISK "$5}' \
      && free -m | awk '/Mem:/ && $4<400 {print "LOW MEM "$4"MB"}'  # → bei Treffer Brevo-Mail
    ```
  - Im Uptime-Watch-Workflow zusätzlich Cert-Expiry alle 6 h checken (`openssl s_client … -enddate`) und < 14 Tage alarmieren — fängt Caddy-Renewal-Failure.
  - **Sentry live verifizieren** (`SENTRY_DSN` in Server-`.env` gesetzt? `/health` o.ä. um Sentry-Status erweitern) — ein optionales Error-Tracking, das niemand aktiviert hat, ist kein Error-Tracking.
  - Webhook-Fulfillment-Failure-Rate aus den Pino-Logs (`logger.error … tag:webhook`) als wöchentliches Signal (passt zum geplanten Notion-Dashboard).

---

### D-02 — Image-Build läuft auf dem Prod-Host (kein getrenntes Build/Release)
- **Severity:** Medium
- **Area:** Deploy
- **Already-handled?:** n
- **Problem:** `deploy.yml` baut das Image direkt auf dem Live-Server (`docker compose up -d --build`). Ein Build-Fehlschlag (npm-Registry-Hiccup, Playwright-Browser-Download-Timeout, OOM beim Build) passiert damit **auf der Box, die gleichzeitig Zahlungen bedient**. Build-RAM/CPU konkurriert mit dem laufenden Betrieb; ein abgebrochener `--build` kann je nach Timing den laufenden Container in einem Zwischenzustand hinterlassen. Es gibt **keinen automatischen Rollback**: bei fehlgeschlagenem Health-Check macht der Workflow `exit 1` (Zeile 76) — d.h. er *meldet* den Fehler, stellt aber **nicht** die vorige funktionierende Version wieder her. Der `concurrency: cancel-in-progress: false` ist korrekt (verhindert parallele Deploys), löst dieses Problem aber nicht.
- **Blast-radius:** Ein kaputter Build/Deploy lässt potenziell eine kaputte oder halb-gestartete Version live, während der Operator nur eine Fehler-Mail bekommt → manuelle Recovery unter Zeitdruck.
- **Concrete Fix:**
  - Image in GitHub Actions (Runner) bauen + in GHCR pushen, auf dem Server nur `pull` + `up -d` (kein `--build`). Entkoppelt Build-Last vom Prod-Host und erlaubt sofortiges Zurückschalten auf den vorigen Image-Tag.
  - Echten Rollback in den Deploy-Script-Tail: vor dem Switch den laufenden Image-Tag merken; wenn Health-Check fehlschlägt → `docker compose up -d` mit dem alten Tag re-deployen statt nur `exit 1`.
  - Mind. ein `docker image prune -f` / `docker builder prune` im Deploy, sonst akkumulieren Build-Layer die Disk voll (verschärft M-01).

---

### D-03 — `git reset --hard origin/main` vernichtet Server-lokale Änderungen lautlos
- **Severity:** Low
- **Area:** Deploy
- **Already-handled?:** Bewusst gewählt (Kommentar im Workflow), aber Risiko nicht abgesichert
- **Problem:** `deploy.yml` macht `git fetch origin main` + `git reset --hard origin/main`. Untracked Files sind zwar geschützt (`.env`, `out/` sind gitignored → bleiben erhalten), aber jede **getrackte** Server-lokale Notfall-Änderung (z.B. ein manueller Hotfix am Caddyfile um 3 Uhr nachts, um die Box wieder hochzubekommen) wird beim nächsten Deploy **lautlos überschrieben**. Das ist ein klassischer „mein Fix ist beim Deploy verschwunden"-Fußangel.
- **Blast-radius:** Niedrig, aber tückisch: Notfall-Hotfixes verfallen unbemerkt; im schlimmsten Fall kehrt ein gerade-behobener Incident beim nächsten Push zurück.
- **Concrete Fix:** Akzeptabel für ein „Git ist Single Source of Truth"-Modell — aber dann muss die Regel **dokumentiert + gelebt** werden: *keine* manuellen Server-Edits an getrackten Files; alle Fixes via PR→main. Optional `git stash` vor reset mit Alert, falls unerwartete getrackte Änderungen vorliegen.

---

### S-03 — Invoice-Counter nicht atomar geschrieben (GoBD-Nummernkreis-Risiko)
- **Severity:** Medium
- **Area:** Backup / Data-Integrity
- **Already-handled?:** Teilweise (In-Process-Mutex y / atomarer Write n)
- **Problem:** `invoice.js:allocateInvoiceNumber()` macht `read → seq+1 → writeFile(COUNTER_FILE, …)` (Zeile 51-64). Der In-Process-`counterLock` serialisiert zwar nebenläufige Webhooks sauber (Single-Instance korrekt), aber `writeFile` ist **nicht atomar**: wird der Prozess mitten im Schreiben gekillt (OOM/Deploy-Restart — siehe C-01/D-01), kann `invoice-counter.json` **truncated/korrupt** zurückbleiben. Der Code fängt das mit `catch { /* corrupt → reset */ }` ab — und **resettet dann auf `seq:0`**. Folge: **Rechnungsnummern werden wiederverwendet** → GoBD-Verstoß (Nummernkreis muss lückenlos *und* eindeutig sein). Zusätzlich wird der Counter nur durch S-01 gesichert; geht das Volume verloren ohne Backup, startet die Nummerierung neu.
- **Blast-radius:** Doppelte/zurückgesetzte Rechnungsnummern = handfester Buchhaltungs-/Finanzamts-Befund. Tritt nur bei Crash-genau-im-Write auf — niedrige Wahrscheinlichkeit, aber bei Echtgeld + GoBD hoher Impact.
- **Concrete Fix:**
  - Atomar schreiben (temp + `rename`, rename ist auf POSIX atomar):
    ```js
    const tmp = COUNTER_FILE + '.tmp';
    await writeFile(tmp, JSON.stringify(counter, null, 2));
    await rename(tmp, COUNTER_FILE);
    ```
  - `catch`-Branch **nicht** lautlos auf `seq:0` resetten — bei korruptem Counter lieber **hart abbrechen + alarmieren** (eine fehlende Rechnung ist nachholbar, eine doppelte Nummer ist ein Compliance-Vorfall). Letzte gültige `seq` ggf. aus `invoices-log.jsonl` rekonstruieren (dort steht jede vergebene Nummer).

---

## Was bereits GUT gelöst ist (nicht anfassen)

| Bereich | Status |
|---|---|
| Secret-Hygiene | `.env`, `scanner/.env`, `*.env`, `out/`, `deployment/.env` korrekt gitignored + **nicht getrackt** (verifiziert). Nur Platzhalter-Secrets im Repo. |
| Webhook-Doppel-Race | Atomarer `claimEvent` im Single-Thread-Eventloop (`orders.js`) — sauber. Signaturprüfung vor jeder Verarbeitung. |
| Order-Log-Robustheit | Append-only JSONL mit defensivem Zeilen-Parsing (`try/catch` pro Zeile) — eine korrupte Zeile killt nicht den ganzen Load. |
| Idempotenz invoice.paid / subscription | Über `claimEvent` für alle Event-Typen, plus Status-Checks. |
| Healthchecks pro Container | Alle vier Services haben Docker-Healthchecks mit `start_period` + retries. `restart: unless-stopped` überall. |
| Caddy / TLS | Let's-Encrypt-Auto-TLS, HSTS, CSP, Webhook-Route mit `flush_interval -1` (roher Body für Stripe-Signatur korrekt). admin-next bewusst hinter Auth-Gate **deaktiviert** bis Auth steht — gute Zurückhaltung. |
| Concurrency-Cap | `concurrencyGate` begrenzt parallele Scan-Browser (OOM-Schutz) — Default 2 konservativ. |
| Backup-Verschlüsselung | GPG-asymmetrisch, Privatekey bleibt offline, kein Plaintext-Zwischenstand auf Disk (`tar | gpg` Pipe). Architektonisch vorbildlich — es fehlt nur die verifizierte Aktivierung (S-01). |
| Deploy-Concurrency | `concurrency: cancel-in-progress: false` verhindert sich überholende Prod-Deploys. |

---

## Severity-Übersicht

| ID | Severity | Area | Kurz |
|---|---|---|---|
| S-01 | **Critical** | Backup | Backup-Kette gebaut, aber Live-Aktivierung + Restore-Test unbestätigt |
| D-01 | High | Deploy | Hard-Restart-Deploy verliert In-Flight-Webhooks (200 vor Persist) |
| M-01 | High | Monitoring | Keine Alerts für Disk-Full / OOM / Cert-Expiry / Webhook-Fail |
| S-02 | High | Backup | Off-Site-Ziel nicht erzwungen, Single-Provider-Risk |
| SEC-01 | Medium | Security | Echte Owner-Mail in committed `cloud-init.yaml` |
| C-01 | Medium | Capacity | Keine Memory-Limits; Playwright-OOM-Risiko (PDF-Chromium ungated) |
| D-02 | Medium | Deploy | Build auf Prod-Host, kein Auto-Rollback |
| S-03 | Medium | Data-Integrity | Invoice-Counter nicht atomar → GoBD-Nummern-Reset-Risiko |
| D-03 | Low | Deploy | `git reset --hard` vernichtet getrackte Server-Hotfixes lautlos |

---

*Read-only Audit. Keine Live-Aktion durchgeführt. Server-seitige Verifikationen (S-01, M-01-Sentry) erfordern SSH durch den Owner und sind als solche markiert.*
