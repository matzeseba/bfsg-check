# 🗺️ BLUEPRINT — Nächste Session (Report-Glaubwürdigkeit, Value-Mail, KI-QA, Mail-Härtung)

> **Lies das nach `CLAUDE.md` als ZWEITES.** Diese Datei ist die vollständige, self-contained Übergabe für die Rest-Umsetzung des „Masterplans Report-Glaubwürdigkeit". Du kannst **ohne Rückfragen durchstarten** — jeder Schritt hat Datei-, Env- und Agenten-Anweisungen. Reihenfolge strikt einhalten: **PR2 → PR3 → PR4 → PR5 → WS7**.
>
> **Stand:** 01.07.2026 · **PR1 ist fertig + gemergt** (Frontend-Politur + Maskottchen). Live nach Merge auf `main`.

---

## 0) Was PR1 erledigt hat (NICHT erneut anfassen)
Branch `feat/pr1-frontend-politur` (4 Commits, gemergt auf `main`):
- **WS-3 Liefer-Claims:** „binnen weniger Stunden" → **„typischerweise innerhalb einer Stunde"** (`lib/config.ts` DIFFERENTIATORS/COMPARISON/FAQ + `PricingCards.tsx`).
- **WS-4 Gratis-Scan-Anzeige:** Mindest-Reveal **~15–18 s** (randomisiert, reduced-motion = sofort) + 15 Fach-Phasen à 1050 ms (`ScanForm.tsx`).
- **WS-5 Lighthouse/WAVE rechtssicher gehärtet (behalten):** „Lighthouse-Dump" → neutrale „Tool-Rohliste" (`CtaSection.tsx`); Marken-/Unabhängigkeits-Disclaimer auf `app/axe-lighthouse-wave-vergleich/page.tsx`. Übrige Nennungen sachlich/attribuiert → §23 MarkenG/§6 UWG-konform. **Rechtsgutachten (Perplexity): namentliche Nennung bei objektivem, belegbarem, nicht-herabsetzendem Vergleich ist zulässig.**
- **WS-6 Maskottchen:** Hero-Fuchs ENTFERNT (Owner: sitzt auf dem Report-Kasten nicht gut); „Wie es funktioniert" = großer Lupen-Fuchs (`mascot-full`) rechts neben Schritt 3; „Schneller als die Kanzlei" = **Uhr-Fuchs** (`mascot-watch.png`, NEU per Higgsfield generiert) links + Daumen-hoch rechts; Schluss-CTA = Thumbsup. **Alle Sektions-Füchse an `max-w-6xl`-Grid verankert** (kein Drift auf breiten Monitoren), nur ab `lg` sichtbar. Footer = nur Logo-Wappen. Gemini-Wasserzeichen aus `mascot-magnify.png` entfernt (665×772). Details: Memory [[gemini-watermark-mascots]].

**Verifiziert:** `next build` grün, `tsc` grün, `legal-copy-grep` = Baseline, unabhängiger Review-Agent über 1920/1440/1280/1024 + Mobile → FREIGABE.

---

## ⚙️ Owner-Entscheidungen, die schon feststehen (nicht neu fragen)
- **Nach Kauf:** sofort tiefstmöglicher Scan → **KI-Report-QA-Agent** prüft/überarbeitet jeden Report → Freigabe → **zeitversetzter Versand**. Gilt **BFSG + Cookie**.
- **Verzögerung:** **zufällig 45–90 Min** (Auto-Release-Fallback bei 90 Min).
- **Value-Mail:** eigene Code-Mail, conversion-optimiert (genug Anreiz, aber Vollreport nicht überflüssig).
- **Claim „menschlich geprüft":** Owner will ihn **behalten** → siehe ⚠️ Rechtshinweis in PR5.

## 🔴 Owner-Inputs, die du zu Beginn abholen musst (blockieren PR4/PR5)
1. **`ANTHROPIC_API_KEY`** (für den KI-QA-Agenten, PR4). Separates API-Konto unter console.anthropic.com (NICHT das Max-Abo — Max ist kein API-Produkt; siehe unten „Warum API statt Max"). Owner legt den Key **server-seitig** (`/opt/bfsg-check/deployment/.env`) + als **GitHub-Secret** ab — **NICHT in den Chat** (Live-Key-Hygiene). Du baust Code + compose-Mapping drumherum.
2. **Sofort-Eingangsbestätigungs-Mail an Kunden** (PR5 2d): ja/nein + Wortlaut? (Empfehlung: ja, knapp: „Zahlung eingegangen. Ihr Report wird geprüft und in Kürze zugestellt.")
3. **Claim-Variante** (PR5, ⚠️): echtes Owner-Freigabefenster [empfohlen, Claim bleibt wahr] vs. voll-automatisch + Claim-Wortlaut anpassen.
4. **Uhr-Fuchs-Variante** (kosmetisch): Variante 1 ist eingebaut; Variante 2 liegt im Scratchpad, 1-Zeilen-Swap falls gewünscht.

---

# 🧩 PR2 — Value-E-Mail nach Gratis-Scan (code-gen, conversion-optimiert)
**Ziel:** Der Gratis-Lead bekommt genau das im Formular versprochene Paket per E-Mail (alle Befund-Kategorien + Zähler + Top-3-Aktionsplan + Score-Ampel), als eigenständig gerenderte Code-Mail statt Brevo-Template. **Isoliert, kein Eingriff in den bezahlten Pfad.**

**Warum:** Aktuell schickt `POST /api/lead` nur `{email,url,score,totalIssues}` an ein Brevo-Template — deshalb steht in der Mail nur der Score (weniger als die Gratis-Vorschau auf der Seite). Das schreckt Käufer ab.

### Umsetzung (Dateien — Zeilennummern vor dem Edit per grep verifizieren, können driften)
- **`scanner/lib/mailer.js` — neue Funktion `sendLeadTeaser({to, url, score, grade, counts, topIssues, totalIssues})`:** HTML **und** text/plain, über den bestehenden `deliver()`-Pfad (erbt List-Unsubscribe/List-Unsubscribe-Post RFC 8058, Reply-To, Legal-Footer §5 DDG). **Filo-Persona + Ton beibehalten** (wie die aktuelle Brevo-Mail „hier ist Filo…"). Betreff conversion-orientiert, z. B. `Ihre WCAG-Erstprüfung: Note ${grade} (${score}/100) für ${host}`.
- **`scanner/app.js` — `POST /api/lead` (grep `'/api/lead'`):** Split-Flow:
  1. **`sendLeadTeaser` SOFORT** senden (best-effort `try/catch`, ein Mailfehler darf den 200 nicht kippen), **unabhängig** vom Brevo-DOI. Rechtsgrund: der Nutzer hat die Übersicht per Button „Übersicht anfordern" **ausdrücklich angefordert** → einmalige, angeforderte Service-Mail (kein §7 UWG-Problem). Läuft sobald `mailerEnabled()`.
  2. **Brevo-DOI-Call unverändert lassen** (Newsletter/5-Mail-Nurture bleibt DOI-gated).
  - `counts`/`topIssues` defensiv aus `req.body` parsen (analog dem bestehenden `score`/`issues`-Parsing).
- **`landingpage-next/components/LeadCapture.tsx` (grep `fetch("/api/lead"`):** POST-Body um `counts` + `topIssues` erweitern. Beides liegt im Client bereits vor: `/api/scan` → `renderTeaser()` in `scanner/lib/report.js` liefert `{url,score,grade,verdict,counts{critical,serious,moderate,minor},totalIssues,topIssues[]}` an `ResultCard`. **Kein Backend-Re-Scan** (Spoofing vernachlässigbar — Mail geht an die selbst angegebene Adresse). ⚠️ **`landingpage-next/AGENTS.md`:** „This is NOT the Next.js you know" — vor FE-Edits node_modules-Docs prüfen.

### Inhalt (Conversion-Kalibrierung — ZEIGEN vs. SPERREN)
- **Zeigen:** Score + Ampel/Note + Einordnung; **alle Befund-Kategorien mit Zählern** („Kritisch: 3 · Schwerwiegend: 5 · …"); **Top-3-Aktionsplan als Prioritäten-Überschriften** (das WAS, ohne WIE/WO); „**N weitere Fundstellen + konkrete Fixes im Vollreport**"; CTA-Button **„Vollständigen Report holen"** (nicht „ansehen") → `${PUBLIC_URL}/#pakete`.
- **Sperren (nur Vollreport):** exakte Fundstellen/Selektoren, Copy-Paste-Fix-Snippets, vollständiger Umsetzungsplan, Barrierefreiheitserklärung, die QA-verbesserten Empfehlungen (PR4). Grenze = genau das, was `LeadCapture.tsx` bereits verspricht.

### Env: keine neuen zwingend (nutzt SMTP-Stack). Optional `LEAD_TEASER_CTA_URL` (dann in `docker-compose.yml environment:` listen).

### Agenten-Orchestrierung PR2
1. **1× `Explore`-Agent** (read-only): bestätige die exakten Zeilen von `/api/lead`, `renderTeaser`, `LeadCapture.tsx`-Payload, und WIE `deliver()`/`sendReport` in `mailer.js` HTML+text zusammenbauen (als Vorlage für `sendLeadTeaser`).
2. **Implementieren** (selbst, mit den Explore-Ergebnissen). Danach **1× `code-reviewer`-Agent** über den Diff (Fokus: Fehler-Isolation im `/api/lead`-200-Pfad, kein Leak gesperrter Inhalte).
3. **Verifikation:** `cd scanner && npm install nodemailer --ignore-scripts && npm test` ([[scanner-local-tests-need-nodemailer]]); Test erweitern: `sendLeadTeaser` erzeugt HTML+text, enthält Score/counts/topIssues + CTA-URL, **enthält KEINEN Selektor/`fix`-Text** und **keine verbotenen Claims** (`voice_lint`/`legal-copy-grep`). FE: `next build` grün. Optional Dry-Run: SMTP leer → `deliver()` loggt statt sendet.

---

# 🧩 PR3 — Tiefen-Scan nach Kauf + TLS-Fix (schließt [[paid-scan-strict-tls]])
**Ziel:** Der bezahlte Scan ist so tief wie möglich; der bekannte TLS-Fehlschlag (matthias-seba.de scheitert strikt) wird sauber gelöst — **ohne SSRF-Schutz zu schwächen**.

### Umsetzung
- **`scanner/lib/fulfill.js` `PKG_CONFIG`:** `basis maxPages 5→8`, `profi 25→40` (`scanSite` cappt hart auf 50 = Sicherheitsnetz); neue Felder `settleMs`, `axeTags`, `perPageTimeout`. `runScan()` reicht sie durch; Timeouts `scanUrl 45→60s`, `scanSite perPage 30→45s`.
- **`scanner/lib/scan.js`:** axe-Tags an **beiden** Stellen (`grep "wcag2aa"`): `['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']`. **`wcag22aa` = einziger sinnvoller Neuzugang; `experimental` bewusst NICHT** (zu viel Rauschen). `gotoResilient` Settle-Kappung `8000→12000` (`settleMs`); Timeout hier bleibt **kein** Fehler.
- **Bewusst NICHT:** Screenshots pro Fund + Mehrfach-Render (RAM/Zeit × Order, kollidiert mit `paidScanGate` = 1 gleichzeitig + 3g-Container-Limit).
- **TLS-Fix:** Server-`.env` **`SCAN_PAID_LENIENT_TLS=true`** (in `docker-compose.yml` **bereits gemappt** → kein Compose-Edit). Setzt **nur** `ignoreHTTPSErrors` in `scan.js`. **SSRF-Schutz bleibt orthogonal aktiv** auf JEDEM Pfad: `assertPublicHttpUrl` + `pinnedHostResolverArg` (`--host-resolver-rules=MAP`) + `verifyNoDnsRebinding` + `installSsrfGuard` — keiner hängt am TLS-Flag. `tlsCertNotice()` weist echten Cert-Mangel als technischen Hinweis im Report aus (kein Score-Abzug).
- **Fail-safe:** leerer Scan → `fulfillOrder` wirft → Webhook-Catch setzt FAILED + Owner-Alert + `sendDelayNotice()`. **Fehlgeschlagener Scan geht NICHT in die Delay-Queue (PR5).**

### Agenten-Orchestrierung PR3
1. **1× `Plan`- oder `engineering-senior-developer`-Agent:** bestätigt die exakten Parameter-Durchreichungen + prüft, dass `SCAN_PAID_LENIENT_TLS` wirklich nur die Zert-Prüfung lockert.
2. **Implementieren.** Dann **`security-appsec-engineer`-Agent** (Agency-Division security): review, dass der SSRF-Guard auf allen Pfaden aktiv bleibt.
3. **Verifikation (KRITISCH):** die SSRF-Tests (`test/ssrf-redirect.test.js`, `test/security.test.js`) MÜSSEN grün bleiben (Beweis: TLS-Flag berührt Guard nicht). Neuer Unit-Test: `PKG_CONFIG` enthält `wcag22aa`, `maxPages ≤ 50`. Integration: `scanner/audit.js` (CLI) gegen `matthias-seba.de` mit `SCAN_PAID_LENIENT_TLS=true` lokal → verwertbares Ergebnis + TLS-Notice.

---

# 🧩 PR4 — KI-Report-QA-Agent (neues Subsystem) — **braucht `ANTHROPIC_API_KEY`**
**Ziel:** Nach der Report-Erzeugung prüft ein LLM (Claude) jeden Report lückenlos: entfernt False Positives, konkretisiert generische Empfehlungen, schließt Lücken — und gibt erst den fehlerfreien Report frei.

### Wo der zu konkretisierende Text lebt (verifiziert)
Der deutsche Klartext (`why`/`fix` je Regel) liegt **statisch** in `scanner/lib/rules-de.js` (`RULES_DE`, `ruleInfo()`); `scanner/lib/report.js` `renderReport()` rendert HTML; `scanner/lib/fulfill.js` druckt daraus das PDF. Der Agent bekommt **axe-Findings (echte Selektoren) + die generischen `ruleInfo`-Texte** und erzeugt fundstellen-spezifische Overrides.

### Umsetzung (neue Module)
- **`scanner/lib/anthropic-client.js` (neu):** SDK `@anthropic-ai/sdk` (in `package.json`), Modell **konfigurierbar via `REPORT_QA_MODEL`** (Default **`claude-sonnet-4-6`** = Kosten/Qualität; `claude-opus-4-8` optional für max. Qualität). Liest `ANTHROPIC_API_KEY`. **Kein `budget_tokens`/kein Assistant-Prefill** (bricht auf 4.x-Modellen → 400); strukturierte Ausgabe via `output_config`/`tool_use`-Schema; **Streaming** (Output kann groß werden). `enabled()`-Helper analog `mailerEnabled()`. → **API-Details via `claude-api`-Skill prüfen** (exakte Params/Modell-IDs).
- **`scanner/lib/report-qa.js` (neu):** `qaReport({scan, reportOpts, pkg})`. Kompakter Input pro Violation (`id, impact, help, nodeTargets(max 5), generischesFix/Why, Score`) — **kein HTML** in den Prompt. Rubrik: (1) FP entfernen (konservativ), (2) `fix` auf konkrete Selektoren beziehen ohne erfundene Fakten, (3) Lücken als gekennzeichnete Hinweise (nicht „Verstoß"), (4) dt. WCAG-2.1/2.2-Fachsprache, (5) **UWG §5-Zwang: nie „BFSG-konform/rechtssicher/garantiert/TÜV/DEKRA"**. Output-Schema (strict): `{verdict:"ok"|"revised", falsePositiveIds[], findingOverrides[{id,why,fix}], additionalNotices[{title,text,severity}], reasoning}`.
- **`scanner/lib/report.js` `renderReport()` geändert:** neuer optionaler `qaOverrides`: filtert `falsePositiveIds` aus `sorted`, ersetzt `ruleInfo()` durch Overrides in `findings`-Map + Checkliste, hängt `additionalNotices` an die bestehende `notices`-Sektion (gleiche Logik wie TLS-Notices). `computeScore` läuft **nach** FP-Filter → Score + `statement.js` konsistent.
- **Env (explizit in `docker-compose.yml environment:` mappen — [[compose-env-explicit-mapping]]):** `ANTHROPIC_API_KEY`, `REPORT_QA_ENABLED` (Default `false`, Kill-Switch), `REPORT_QA_MODEL`. + `.env.example` + GitHub-Secret.
- **Fail-safe (Owner-Regel „nie ohne Report"):** `qaReport` **strikt fail-open** — jeder Fehler/Timeout(~90s)/429/`stop_reason:'refusal'`/fehlender Key → `return null` + Owner-Alert + Sentry → Report geht **unverändert** raus. Kosten ~$0,01–0,25/Report (Modell-abhängig), Latenz ~10–40 s (läuft im Delay-Fenster, nicht im Webhook-Antwortpfad).
- **Deterministischer Post-Check (PFLICHT):** `scripts/voice_lint.py`/`legal-copy-grep` MUSS über den QA-Output laufen — der LLM darf keine verbotenen Claims in den verkauften Report schleusen.

### Warum API statt Max-Abo (falls Owner nochmal fragt)
Der QA-Agent läuft **unbeaufsichtigt server-seitig** → braucht die **Anthropic-API** (pro Token). Der **Max-Plan** ist ein Abo für **interaktive** Nutzung (claude.ai/Claude Code, OAuth), **kein API-Produkt, keine API-Credits**. Technisch ginge `claude -p` headless über das Abo, aber: ToS-Graubereich (Abo nicht für Server-Automaten), Abo-Rate-Limits, Server-Login/Token-Refresh-Fummelei. Bei ~1–25 Cent/Report ist die API die saubere, zuverlässige Wahl (Monatscap in der Console setzen). Optional pluggable bauen (`claude -p`-Adapter hinter Flag), aber Default = API.

### Agenten-Orchestrierung PR4
1. **1× `Plan`-Agent** (mit `claude-api`-Skill-Wissen): finalisiert Prompt-Rubrik + Output-Schema + Anthropic-SDK-Aufrufform (Streaming, strukturierte Ausgabe).
2. **`AI Engineer`- oder `Backend Architect`-Agent** implementiert `anthropic-client.js` + `report-qa.js`; **`Minimal Change Engineer`** für den `renderReport`-Parameter (chirurgisch).
3. **`Legal Compliance Checker`- + deterministischer `legal-copy-grep`-Doppelcheck** über generierte Test-Reports.
4. **Verifikation:** DI-Seam (injizierbarer Client) → Unit-Test mit gemocktem Anthropic-Response (FP-Filter greift, Refusal/Fehler → null = fail-open). `renderReport`-Test: FP-gefilterter Score ≥ ungefilterter. **Zunächst im synchronen Pfad testbar** (QA in `fulfillOrder`), bevor PR5 es in den Scheduler verschiebt.

---

# 🧩 PR5 — Verzögerter Release + Persistenz (invasivster Umbau — zuletzt)
**Ziel:** Report nicht mehr sofort mailen, sondern durabel einqueuen + zeitversetzt (45–90 Min) versenden; QA-Agent läuft im Delay-Fenster. Muss Redeploys überleben. **Gilt BFSG + Cookie + Abo.**

### Zentraler Umbau
Heute ist `handleCheckoutCompleted()` (`scanner/app.js`) **synchron+sofort**: `fulfillOrder()` → `sendReportFor()` in einer `await`-Kette. **Auftrennen nach PDF-/Rechnungs-Rendern:** Report erzeugen + persistieren, aber **nicht mehr sofort mailen** → Job in Queue → Scheduler übernimmt QA + Versand.

### Umsetzung (neue Module)
- **Store = `pending-reports.jsonl`** (NICHT SQLite) im vorhandenen `bfsg_data`-Volume (`/app/out`) — 1:1 append-only-JSONL-Muster von `orders.js`/`subscriptions.js`, überlebt Redeploys.
- **`scanner/lib/report-queue.js` (neu):** In-Memory-Map + `ensureLoaded()` + append `write()`. Job-Felder: `sessionId, subscriptionId?, package, emailKind, to, company, customerType, consentTs, pdfPath, stmtPath, invoicePdfPath, invoiceNumber, diffText, scheduledReleaseAt(=now+random(45..90)min), qaStatus, status, attempts`. Exports: `enqueue, markQueueStatus, listDue(now), getPending, claimForRelease` (**atomarer In-Memory-Claim analog `claimEvent` in `orders.js` → kein Doppelversand**).
- **`scanner/lib/scheduler.js` (neu):** `startScheduler()` = `setInterval(tick,60_000)` + sofortiger `tick()` beim Start (fängt während Redeploy überfällige Jobs → crash-safe). `tick()`: `listDue` → `claimForRelease` → **QA-Call hier** (falls `qaStatus==='pending'` + `anthropicEnabled()`) → ggf. Report neu rendern → `services.sendReportFor()` → `markQueueStatus/markStatus 'MAILED'`. Transienter Mailfehler: Job bleibt fällig, `attempts++` (mailer hat intern 3× Backoff); permanent → `RELEASE_FAILED` + `sendAlert`.
- **`scanner/app.js`:** `handleCheckoutCompleted` Phase-2-Mailblock → `reportQueue.enqueue({...})` + `markStatus RELEASE_SCHEDULED`. `handleInvoicePaid` (Abo) analog. `startScheduler()` neben `reconcileOnStartup()`. Alles in `services`-Objekt für Tests injizierbar.
- **`scanner/lib/orders.js`:** neue Status `SCANNED→QA_PENDING→QA_DONE→RELEASE_SCHEDULED→MAILED`. **Reconcile-Sweeper darf `RELEASE_SCHEDULED` NICHT als „hängend" alarmieren** (erwartet) — `TERMINAL`/erwartete-Zwischenzustände erweitern bzw. „aktiver Queue-Job existiert?"-Check.
- **Env/compose (`docker-compose.yml environment:`):** `PENDING_REPORTS_FILE`, `RELEASE_DELAY_MIN=45`, `RELEASE_DELAY_MAX=90`, `SCHEDULER_INTERVAL_MS=60000`. Volume `bfsg_data:/app/out` deckt die neue Datei ab.

### ⚠️ Rechtshinweis + Owner-Freigabe-Fenster (bitte umsetzen)
Der Claim **„ein Mensch liest jeden Report quer, bevor er rausgeht"** steht an mehreren Stellen (`config.ts` DIFFERENTIATORS, COMPARISON, Cookie-Profi-Feature, FAQ, Trust-Badge „KI-Spürnase + menschlich geprüft", `LEGAL_NOTE`). Wenn faktisch nur eine KI prüft + die Verzögerung nur den *Anschein* erzeugt = **§5 UWG Irreführung** (abmahnbar). **Empfohlene Lösung (macht Claim WAHR, gleicher Automatisierungsgrad):** Flag **`REQUIRE_OWNER_RELEASE=true` (Default)** → im Delay-Fenster geht der fertige Report per Mail an den Owner mit signiertem 1-Klick-„Freigeben & senden"-Endpoint (`/api/release/:token`); Scheduler macht **Auto-Release** bei `scheduledReleaseAt`, falls Owner nichts tut. Flag `false` = reine Auto-Release → dann müssen die o. g. Claim-Stellen zu einer wahren Formulierung geändert werden. **Owner-Entscheidung einholen (Input #3 oben).**

### 2d) Sofort-Eingangsbestätigung (Owner-Input #2)
Neue `sendOrderReceived({to,company})` in `mailer.js` (über `deliver()`), direkt nach `enqueue`. Wortlaut ohne Zeit-/„automatisch"-Angabe. Für Abo-Re-Checks nicht nötig.

### Agenten-Orchestrierung PR5
1. **1× `Plan`- oder `Multi-Agent Systems Architect`-Agent:** finalisiert Queue-/Scheduler-Design + Idempotenz-Kontrakt + Statusmodell gegen den echten `app.js`-Kontrollfluss.
2. **`Backend Architect`** implementiert Queue+Scheduler; **`engineering-sre`** reviewt Crash-Safety/Redeploy-Überleben; **`code-reviewer`** die Idempotenz (`claimForRelease`).
3. **Verifikation (höchste Sorgfalt — hier hängt Umsatz):** Kauf-Simulation → Job in `pending-reports`, `scheduledReleaseAt` 45–90 Min, QA-Verdict geloggt, Owner-Release-Mail erzeugt, Auto-Release-Fallback greift; **Doppelversand-Test** (paralleler Tick → nur 1 Mail; Rechnungs-Mail 2× = §14/GoBD-Problem); Redeploy-Test (Job überlebt); Cookie-Pfad identisch. scanner-Tests grün.

---

# 🧩 WS7 — E-Mail-Zustellung hart verifiziert (parallel/Server-Schritt)
**Live-DNS-Stand (bereits geprüft, [[mail-auth-bfsg-fuchs-verified]]):** SPF ✅, DKIM ✅ (über `brevo1/brevo2._domainkey` — Doc `deployment/dns-records.md` nennt fälschlich `mail._domainkey`), DMARC ✅ (`p=none`), kein MX.

**To-dos:**
1. **Doku fixen:** `deployment/dns-records.md` DKIM-Selector korrigieren + `bfsg-fuchs.de`-Zone dokumentieren (fehlt).
2. **Real-Header-Test:** echte Empfangsmail → `Authentication-Results` = `spf=pass; dkim=pass; dmarc=pass`. Tool: `bash deployment/scripts/check-mail-auth.sh bfsg-fuchs.de`.
3. **mail-tester.com ≥ 9/10:** Testmail senden, Mängel abarbeiten.
4. **text/plain + List-Unsubscribe:** ✅ im Transaktions-Mailer vorhanden; für die neue `sendLeadTeaser`-Mail (PR2) erben, da gleicher `deliver()`-Pfad.
5. **Optional (nach Warm-up):** DMARC `p=none`→`quarantine` (phased, `docs/EMAIL-DELIVERABILITY.md`); Null-MX ergänzen.

---

## 🤖 Agenten-Team-Playbook (bewährte Muster aus dieser Session — wiederverwenden)
Diese Muster haben in PR1 zuverlässig funktioniert:

1. **Explore-Fan-out (Analyse):** bis zu 3 `Explore`-Agenten PARALLEL (read-only) in EINER Nachricht → Codebase-Bereiche kartieren, exakte Datei/Zeile/Funktion + Code-Zitate zurück. Prompt self-contained (jeder startet kalt).
2. **Plan-Agent (Design):** 1× `Plan`-Agent mit vollem Phase-1-Kontext → dateigenauer Implementierungs-Entwurf mit Fail-safes + Test-Strategie, BEVOR implementiert wird.
3. **Implementieren = selbst** für pixel-/visuelle Arbeit (Agenten sehen den Render nicht). Für reine Code-Module: `Backend Architect`/`AI Engineer`/`Minimal Change Engineer` (Agency-Division engineering).
4. **Preview-Verifikations-Schleife (Frontend, DETERMINISTISCH):** `mcp__Claude_Preview__preview_start` (launch.json „landingpage", Port 3000) → `preview_resize` mehrere Breiten (**1920/1440/1280/1024 + 390 Mobile — nicht nur 1280!**) → `preview_eval` für Overlap-Messung (`getBoundingClientRect` + `Range.getClientRects()` gegen Fuchs-Box) → `preview_screenshot`. **Tricks:** Dark setzen via `document.documentElement.classList.add('dark')`; scrollen NUR via `document.scrollingElement.scrollTop = …` (`window.scrollTo` greift nicht); Overlays IMMER an `max-w-6xl`-Container verankern, nie an `overflow-hidden`-Section-Vollbreite (sonst Drift auf breiten Monitoren — Lektion in [[gemini-watermark-mascots]]).
5. **Unabhängiger Review-Agent (Abnahme-Gate):** `Evidence Collector`-Agent (screenshot-obsessed, Default „NEEDS-WORK") mit dem **serverId** des laufenden Preview-Servers + präzisen Kriterien → gibt FREIGABE/NACHARBEIT mit Pixel-Belegen. **Warm weiternutzen via `SendMessage`** (spart Kontext) statt neuem Agent. Bei NACHARBEIT: konkrete Fixes umsetzen → erneut prüfen, bis FREIGABE.
6. **Bild-Generierung (Higgsfield MCP, für neue Maskottchen/Assets):** (a) bestehendes Asset als Referenz `media_upload` → curl PUT → `media_confirm`; (b) `show_reference_elements(action=create, category=character)` → Element-ID; (c) `generate_image(model='seedream_v4_5', prompt='<<<element_id>>> …')` — **Seedream, NICHT nano_banana/Gemini** (sonst Sparkle-Wasserzeichen!), plain weißer Hintergrund, `count:2`; (d) `remove_background`; (e) download + PIL `getbbox`-Trim → `public/`. Konto: pro, Credits vorhanden. Bestehendes Fuchs-Character-Element existiert bereits (`bfsg-fuchs`).
7. **Recherche/Recht:** Perplexity MCP (`perplexity_research` reasoning_effort:high) für Rechts-/Faktenfragen — NICHT WebSearch (CLAUDE.md-Regel).
8. **Cache-bewusst:** kein Modellwechsel/`/fast`-Toggle mitten in der Session; unabhängige Agenten in EINER Nachricht batchen ([[prompt-caching-rule]]).

---

## 🚦 Rollout-Regeln (PFLICHT)
- **Kein PR-CI → Build + Tests LOKAL vor Merge** ([[build-verify-before-merge]]): FE `cd landingpage-next && npx tsc --noEmit && npx eslint . && npx next build`; BE `cd scanner && npm install nodemailer --ignore-scripts && npm test`.
- Vor jedem Merge: **`legal-copy-grep`** (`python scripts/legal_copy_grep.py`) → mein Diff ohne neue ROT/GELB-Treffer (16 ROT-Baseline in unveränderten Legal-Seiten ignorieren).
- **Branch pro PR** (kein Force-Push/Reset auf main). `origin/main` vor Start lesen ([[working-branch-lags-main]]). PR via `gh` (bei Quota → `gh api` REST, [[github-pr-via-rest]]).
- **Merge = Live-Deploy** (GitHub Actions → Hetzner). `/health` nach Deploy = `ok:true, stripe:true, live:true, mailer aktiv`.
- **Reihenfolge strikt:** PR2 (isoliert) → PR3 (Flags) → PR4 (KI-QA, braucht Key) → PR5 (invasiver Umbau) → WS7 (Server). Jeweils erst mergen, wenn build+tests+review grün.
- Server-SSH von diesem Win-PC: `ssh root@178.105.83.0` ([[server-ssh-from-windows]]); Server-`.env`: `/opt/bfsg-check/deployment/.env`.

---

## 3 riskanteste Stellen (Extra-Review)
1. **Kontrollfluss-Umbau `handleCheckoutCompleted`/`handleInvoicePaid` (PR5):** Idempotenz (`claimForRelease`) gegen Doppel-/Nicht-Versand — Rechnungs-Mail 2× = §14/GoBD.
2. **`SCAN_PAID_LENIENT_TLS` (PR3):** vor Scharfschalten via SSRF-Tests beweisen, dass NUR die Cert-Prüfung fällt.
3. **KI-QA-Agent (PR4):** fail-open + Timeout Pflicht; deterministischer `legal-copy-grep`-Post-Check gegen verbotene Claims im verkauften Report.
