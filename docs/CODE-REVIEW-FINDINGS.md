# Code-Review Findings (2026-06-17)

Vollständiger Staff-Engineer- + Security-Review des gesamten BFSG-Check-Repos
(Stand `origin/main` @ `92d354a`). Read-only-Befund; **keine Code-Änderungen**.
Parallel laufen ein Frontend-QA-Agent (`landingpage-next/`) und ein
Backend-Criteria-Agent (`scanner/`) — am Ende jedes Findings ist markiert, wer es
voraussichtlich fixt (🛠️ Backend / 🎨 Frontend / 📦 bleibt für Ops/Review übrig).

## Zusammenfassung

**8 kritisch · 13 mittel · 11 niedrig**

Gesamteindruck: Das Backend ist für ein Solo-Projekt überdurchschnittlich
sorgfältig gehärtet (SSRF-Guard mit DNS-Rebinding-Pin, Webhook-Idempotenz,
Fail-fast bei Live-ohne-SMTP, persistente Order-States, constant-time Admin-Auth,
PII-Redaction in Logger/Sentry, gute Test-Abdeckung der kritischen Pfade). Die
kritischen Befunde sind überwiegend **Race-Conditions bei nebenläufigen Writes**
(JSONL/Invoice-Counter), eine **DSGVO-Request-Lücke** (User bekommt nie eine
Mail, Token geht nur an den Betreiber), ein **referenziertes, nicht existentes
`resend.js`**, **tote, unsichere `server.js`** (CORS `*`, kein Rate-Limit) und
**echte Kontaktdaten/Secrets-Platzhalter im Repo** (cloud-init Gmail). Im
Frontend ist der größte latente Block die **auth-lose Admin-App** hinter
`admin.bfsg-fix.de` (heute nur Mock, aber Wiring-Bug + fehlender Auth-Layer).

---

## 🔴 Kritisch (sofort fixen)

### [F1] Nebenläufige Webhook-Duplikate umgehen die Idempotenz-Sperre — `scanner/app.js:75-93`, `scanner/lib/orders.js:40-53`
**Problem:** Idempotenz ist als „check-then-act" ohne Lock implementiert. `alreadyProcessed(event.id)` liest aus dem In-Memory-`Set`; erst `recordPaid()` fügt die `eventId` hinzu. Zwischen Check und Record liegt `await`-Zeit (DNS, Scan, PDF). Stripe sendet bei langsamer/fehlender Quittung Retries — und liefert Events teils **parallel**. Zwei gleichzeitige Zustellungen desselben `event.id` bestehen beide `alreadyProcessed`→false, bevor einer `recordPaid` schreibt → **doppelte Erfüllung** (zwei Scans, zwei Reports, zwei Rechnungsnummern, zwei Mails an den Kunden).
**Impact:** Doppelte PDF-/Mail-Auslieferung, doppelt vergebene fortlaufende Rechnungsnummern (GoBD-Problem), doppelte Browser-Last. Tritt v.a. bei Retry-Stürmen / langsamen Scans auf.
**Fix:** Idempotenz synchron *vor* dem `res.json()` festschreiben. `recordPaid`/eine neue `reserveEvent(eventId)` so umbauen, dass das Markieren der `eventId` **atomar vor** dem Quittieren passiert (Set-Insert ist synchron — sofort nach erfolgreichem `constructEvent` `if (processedEvents.has(id)) return dup; processedEvents.add(id);` ausführen, *dann* erst async arbeiten). Persistenz (`write`) kann async folgen. Für echte Multi-Prozess-Sicherheit: SQLite mit `INSERT OR IGNORE` auf `event_id UNIQUE` (ist als „Welle 5" schon notiert). 🛠️ Backend

### [F2] Invoice-Counter Race-Condition → doppelte/fehlende Rechnungsnummern — `scanner/lib/invoice.js:37-53`
**Problem:** Der Datei-Header behauptet „Fortlaufende Nummer … mit **Flock-Schutz**", aber `nextInvoiceNumber()` ist **lockless** (read-modify-write ohne Lock; Kommentar Z48 gibt das selbst zu). Zwei gleichzeitige `fulfillOrder` (Concurrency-Gate erlaubt 2!) lesen denselben `seq`, erhöhen beide auf denselben Wert, schreiben beide → **identische Rechnungsnummer** für zwei Bestellungen.
**Impact:** GoBD-Verstoß (Rechnungsnummern müssen eindeutig + lückenlos sein). Direkt durch `MAX_CONCURRENT_SCANS=2` getriggerbar.
**Fix:** Atomares Increment. Einfachste robuste Variante ohne neue Dependency: ein In-Process-`Promise`-Mutex (Serialisierung aller `nextInvoiceNumber`-Aufrufe) **plus** `O_EXCL`-Lockfile oder `fs` rename-Trick für Multi-Prozess. Mittelfristig: SQLite-Sequence. Mindestens den irreführenden „Flock-Schutz"-Kommentar korrigieren. Hinweis: `invoice.js` wird aktuell von `fulfill.js` **gar nicht aufgerufen** (siehe F8) — der Bug ist latent, bis die Rechnungs-PDF tatsächlich verdrahtet wird. 🛠️ Backend

### [F3] DSGVO-Request: User bekommt nie eine Bestätigungs-Mail — Token geht nur an den Betreiber — `scanner/app.js:319-334`, `scanner/lib/dsgvo.js:50-67`
**Problem:** Der Endpoint antwortet „Bestätigungs-Mail wird an angegebene Adresse gesendet" (Z329), versendet aber **keine Mail an den User**. Stattdessen geht der Token via `sendAlert()` (Z325-328) an `ADMIN_EMAIL`/`FROM_EMAIL`. Der Doppel-Opt-in-Link erreicht den Betroffenen also nie automatisch — der Betreiber müsste ihn manuell weiterleiten. Zusätzlich verspricht `DsgvoForm.tsx` dem User „Zur Identitätsprüfung erhalten Sie eine Bestätigungs-E-Mail", was technisch nicht passiert.
**Impact:** DSGVO-Auskunft/Löschung (Art. 15/17) ist faktisch nicht self-service nutzbar; Fristverletzungsrisiko + Falschaussage gegenüber dem Nutzer. Privacy/Compliance-kritisch.
**Fix:** Im Request-Handler den Bestätigungslink **an die angegebene E-Mail** senden (eigener `deliver()`-Aufruf an `email`, neutraler Text), nicht nur den Alert an den Betreiber. Wichtig: aus Enumeration-Schutz-Sicht immer dieselbe 202-Antwort liefern (ist bereits so), aber die Mail nur senden, wenn plausibel. 📦 bleibt übrig (weder reines Frontend noch Scan-Kriterien)

### [F4] `resend.js` existiert nicht, wird aber in der Betreiber-Anleitung referenziert — `scanner/app.js:144`
**Problem:** Bei Fulfillment-Fehler enthält der Alert die Handlungsanweisung `Manuell nachliefern: node resend.js ${s.id}`. Eine Datei `scanner/resend.js` existiert nicht (verifiziert). Der reale Resend-Weg ist der HTTP-Endpoint `POST /api/resend/:sessionId` (Z377).
**Impact:** Im Ernstfall (bezahlt, aber nicht geliefert) folgt der Betreiber einer toten Anweisung und verliert Zeit, während ein Kunde auf seinen bezahlten Report wartet.
**Fix:** Alert-Text auf den echten Weg ändern, z.B. `Manuell nachliefern: curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" $PUBLIC_URL/api/resend/<sessionId>`. (Alternativ ein `resend.js`-CLI-Wrapper bauen.) 🛠️ Backend

### [F5] Tote `server.js` mit CORS `*` und ohne Rate-Limit/SSRF-Pin — `scanner/server.js`
**Problem:** `server.js` ist ein älterer, paralleler Teaser-Scan-Server (Duplikat von `/api/scan`). Er setzt `Access-Control-Allow-Origin: *` (Z31), hat **kein** Rate-Limit (der eigene Kommentar Z7-8 sagt „Produktion: Rate-Limiting … ergänzen") und ruft `assertPublicHttpUrl` ohne den Rebinding-Pin von `scan.js` auf. Er ist per `npm run server` startbar und im `package.json` als Script (`"server": "node server.js"`) hinterlegt.
**Impact:** Footgun: Wer versehentlich `server.js` statt `app.js` deployt, hat einen offenen, rate-limit-losen, CORS-allow-all Scan-Proxy (DoS-/Kosten-Missbrauch, SSRF-Teaser). Tote Code-Pfade verwässern außerdem den Security-Audit.
**Fix:** `server.js` löschen (Funktionalität ist vollständig in `app.js`) und das `server`-Script aus `package.json` entfernen. Falls als Minimal-Dev-Server gewünscht: gleiche Guards wie `app.js` nachziehen + CORS entfernen. 🛠️ Backend / 📦

### [F6] Echte Kontaktdaten + Secret-Platzhalter im Repo (cloud-init) — `deployment/cloud-init.yaml:48-53`, `.github/workflows/*`
**Problem:** `cloud-init.yaml` committet die **reale Gmail-Adresse** `matthiasseba92@gmail.com` als `SMTP_USER`/`REPLY_TO`/`ADMIN_EMAIL` und den Klartext-Platzhalter `SMTP_PASS=PLACEHOLDER_BREVO_KEY` in einer Datei, die mit `git clone` öffentlich gezogen wird (Z37 `git clone https://github.com/matzeseba/bfsg-check.git`). Auch `deployment/.env.example` und mehrere Workflows enthalten die persönliche Adresse `matze.seba@outlook.de`. Der Deploy-SSH-Pubkey + Hostname stehen ebenfalls im Klartext (Pubkey ist unkritisch, aber das Gesamtbild ist „PII im Repo").
**Impact:** PII-Leak (persönliche Adressen), Spam-/Phishing-Ziel; falls das Repo public ist, ist die Brevo-User-Identität bekannt. Kein Secret-Leak im engeren Sinn (Passwort ist nur Platzhalter), aber schlechte Hygiene + DSGVO-relevante Eigen-PII.
**Fix:** In `cloud-init.yaml` alle Mail-Werte auf Platzhalter (`__SMTP_USER__` etc.) setzen und beim Hetzner-Create per Templating einsetzen (der Kommentar Z41 verlangt das bereits — aber die echte Adresse steht trotzdem drin). Persönliche Adressen aus `.env.example`/Workflows durch generische (`alerts@bfsg-fix.de`) ersetzen bzw. nur als GitHub-Secret führen. 📦 bleibt übrig (Ops)

### [F7] `admin.bfsg-fix.de` ohne eigenen Auth-Layer — latenter Daten-Leak ab Welle 5 — `deployment/Caddyfile:86-95`, `deployment/docker-compose.yml:70-84`, `admin-next/` (kein `middleware.ts`)
**Problem:** Caddy proxied `admin.bfsg-fix.de` → `admin-next:3001` **ohne** `basicauth`/Forward-Auth. Die Admin-App hat kein `middleware.ts`. Heute unkritisch, weil alle Seiten Mock-Daten (`lib/mock-data.ts`) rendern — aber `docker-compose` injiziert bereits `ADMIN_TOKEN` + Backend-URL. Sobald `lib/api.ts` (das den Bearer-Token serverseitig hält) verdrahtet wird, ist die Admin-App ein **öffentlicher, unauthentifizierter Proxy** auf `/admin/orders` + `/admin/subscriptions` (Kunden-Mails, Stripe-Session-IDs, Umsätze). Der Bearer-Token schützt nur das Backend vor dem Internet — die Admin-App sitzt *innerhalb* dieser Vertrauensgrenze und exponiert die Daten ungeschützt wieder.
**Impact:** Vollständiger Leak aller Bestell-/Abo-PII, sobald Welle-5-Wiring live geht. Heute „nur" ein öffentlich erreichbares Mock-Dashboard.
**Fix:** **Vor** jedem echten Daten-Wiring** einen Auth-Gate einziehen — `admin-next/middleware.ts` (Session/Basic-Auth) **oder** sofort ein `basicauth`-Block im `admin.bfsg-fix.de`-Caddy-Site. Minimal jetzt: Basic-Auth in Caddy, damit das Scaffold nicht world-readable ist. 🎨 Frontend / 📦

### [F8] Rechnungs-PDF (`invoice.js`) wird im Live-Flow nie erzeugt — GoBD-Lücke — `scanner/lib/fulfill.js`, `scanner/app.js` (kein `generateInvoicePdf`-Aufruf)
**Problem:** `generateInvoicePdf()`/`nextInvoiceNumber()` aus `invoice.js` werden **nirgends in `app.js` oder `fulfill.js` aufgerufen** (verifiziert per Grep — nur Tests importieren `invoice.js`). Der Datei-Header bezeichnet die eigene Rechnung als „FALLBACK zu Stripe-Receipts" für den Fall, dass die Stripe-Mail bounced. Dieser Fallback ist nicht verdrahtet: Bei einem Stripe-Receipt-Bounce existiert **keine** Rechnung — entgegen der dokumentierten 10-Jahre-Aufbewahrungspflicht.
**Impact:** Wenn man sich auf den eigenen GoBD-Fallback verlässt, ist er nicht aktiv. Rechtsrisiko bei Betriebsprüfung, falls Stripe-Receipts ausfallen. (Solange Stripe-Receipts zuverlässig zustellen, praktisch verdeckt.)
**Fix:** Entweder `generateInvoicePdf` in `fulfillOrder` (nach erfolgreichem Scan, vor/parallel zum Mailversand) aufrufen und das PDF als zweiten Anhang mitsenden + in `out/invoices/` ablegen — **dann aber zuerst F2 (Counter-Race) fixen**. Oder klar dokumentieren, dass die Rechnung ausschließlich über Stripe läuft und `invoice.js` toter Code ist (dann entfernen). 🛠️ Backend / 📦

---

## 🟡 Mittel

### [M1] Status-Übergänge sind nicht gegen Last-Write-Wins-Races geschützt — `scanner/lib/orders.js:55-62`, `scanner/lib/subscriptions.js:53-61`
**Problem:** `markStatus`/`saveSnapshot` machen `read map → spread → write` ohne Lock. Bei nebenläufigen Updates derselben `sessionId` (z.B. paralleler Resend + Webhook-Retry) gewinnt der letzte Write; ein zwischenzeitlicher Status (`FULFILLING`/`FAILED`) kann verloren gehen. JSONL ist append-only, also bleibt die History erhalten — aber die In-Memory-`Map` (Quelle für `getOrder`/Admin) kann inkonsistent werden.
**Impact:** Selten, aber möglich: ein Order „springt" im Dashboard auf einen veralteten Status; Resend-Guard (`status === 'MAILED'`) greift evtl. nicht. Kein Geld-/Datenverlust (JSONL ist Wahrheit), aber verwirrende States.
**Fix:** Status-Writes pro `sessionId` serialisieren (Promise-Queue je Key) oder beim Lesen den letzten JSONL-Eintrag als maßgeblich nehmen. 🛠️ Backend

### [M2] `handleInvoicePaid`: `inv.subscription`/`billing_reason` evtl. nicht (mehr) auf dem Invoice-Objekt — `scanner/app.js:150-167`
**Problem:** Der Re-Check-Trigger liest `inv.subscription` (Z156) und `inv.billing_reason` (Z153) direkt vom Invoice. In neueren Stripe-API-Versionen wandert die Subscription-Referenz teils nach `inv.parent.subscription_details.subscription` bzw. ist nur via Expand verfügbar; `billing_reason` bleibt, aber `subscription` als Top-Level-Feld ist versionsabhängig. Wenn `inv.subscription` `undefined` ist, returnt der Handler still (Z156) → **Re-Check wird nie ausgelöst**, kein Fehler, kein Alert.
**Impact:** Abo-Umsatz (MRR) wird kassiert, aber der monatliche Re-Check unterbleibt stillschweigend → Kunde zahlt für eine Leistung, die nicht erbracht wird. Tritt nur bei aktivem `ENABLE_ABO=true` auf (Default aus).
**Fix:** Auf die in `package.json` gepinnte Stripe-Version (17.5.0) gegen Doku abgleichen; defensiv `inv.subscription ?? inv.parent?.subscription_details?.subscription` lesen und bei aktivem Abo, aber fehlender Subscription-Referenz einen `sendAlert` feuern statt still zu returnen. 🛠️ Backend

### [M3] `checkout.session.completed` nutzt `s.amount_total` ohne Abo-Sonderfall + ohne Currency-Check — `scanner/app.js:107`
**Problem:** `recordPaid` speichert `amount: s.amount_total`. Bei Subscriptions ist `amount_total` der Session ggf. 0/null (die erste Zahlung läuft über die Invoice). Außerdem wird `currency` nie geprüft/gespeichert (Admin-Typ `Order.currency` erwartet es, siehe M11).
**Impact:** Abo-Orders zeigen ggf. Betrag 0 im Dashboard/Export; keine Mehrwährungsfähigkeit (aktuell nur EUR, daher gering).
**Fix:** Bei `isSub` den Betrag aus der ersten Invoice nachziehen oder als „—" markieren; `currency` aus der Session übernehmen. 🛠️ Backend

### [M4] Grade-/Score-Schwellen weichen zwischen Teaser-Card (Frontend) und Report/Statement (Backend) ab — `landingpage-next/components/ResultCard.tsx:28-58` vs `scanner/lib/report.js:16-28` & `scanner/lib/statement.js:9-14`
**Problem:** Drei unterschiedliche Notensysteme für denselben Score:
- `ResultCard.tsx`: A≥85, B≥70, C≥55, sonst D
- `report.js` (PDF): A≥90, B≥75, C≥50, sonst D
- `statement.js`: „weitgehend konform"≥90, „teilweise"≥50, sonst „nicht konform"
Ein Score von z.B. 72 zeigt im Web-Teaser „B / Solide Basis", im gekauften PDF aber „C / Deutliche Mängel".
**Impact:** Inkonsistente Außendarstellung; Kunde fühlt sich nach Kauf „herabgestuft" → Reklamationsrisiko/Vertrauensverlust.
**Fix:** Eine Single-Source-of-Truth für Grade-Grenzen. Da Frontend (TS) und Backend (JS) getrennt sind: identische Schwellen festlegen (vorzugsweise die `report.js`-Werte, da der Teaser nur informiert) und in beiden spiegeln. 🎨 Frontend (+🛠️ Backend Abgleich)

### [M5] Alle Frontend-Formulare setzen `noValidate`, validieren aber kaum in JS — `landingpage-next/components/{DsgvoForm,WiderrufForm,KuendigungForm,ScanForm,CheckoutModal}.tsx`
**Problem:** `noValidate` deaktiviert die native Browser-Prüfung von `required`/`type="email"`. DsgvoForm/WiderrufForm/KuendigungForm haben **keinerlei** Client-Validierung vor dem `fetch`; CheckoutModal prüft nur auf Leerstring (nicht auf E-Mail-/URL-Format); ScanForm prüft nur `!url`. Leere/Müll-E-Mails gehen so an `/api/dsgvo/request`, `/api/widerruf`, `/api/kuendigung`.
**Impact:** Schlechte UX + falsches Sicherheitsgefühl; gesamte Validierung liegt beim Backend. Für DSGVO (Schlüssel = E-Mail) besonders relevant.
**Fix:** Entweder `noValidate` entfernen (Browser erzwingt `required`/`type=email`) oder eine kurze Regex-/`URL()`-Prüfung vor jedem `fetch`. Priorität: `DsgvoForm`. 🎨 Frontend

### [M6] DSGVO-Formular sendet `note`, Backend ignoriert es — Erwartungslücke — `landingpage-next/components/DsgvoForm.tsx:28` vs `scanner/app.js:320`
**Problem:** Das Formular schickt `{email, action, note}`; der Endpoint liest nur `{email, action}` (Z320) — `note` wird verworfen. Der User glaubt, seine Anmerkung wird übermittelt.
**Impact:** Stille Daten-Verwerfung; bei einer Löschanfrage mit erklärendem Kontext geht dieser verloren.
**Fix:** `note` im Backend in den Alert/Token-Record aufnehmen oder das Feld im Frontend als rein lokal kennzeichnen/entfernen. 🛠️ Backend / 🎨 Frontend

### [M7] Fehler-Handling der POST-Formulare verschluckt die Server-Meldung — `landingpage-next/components/{DsgvoForm,WiderrufForm,KuendigungForm}.tsx`
**Problem:** Muster `if (!response.ok) throw new Error("api")` + bare `catch {}` → eine generische Toast-Meldung für alles (offline, 400, 429, 500). Die konkrete Backend-Meldung (z.B. „Name und E-Mail erforderlich", Rate-Limit) wird verworfen. CheckoutModal macht es richtig (liest `data.error`).
**Impact:** User bekommt bei behebbaren Fehlern (Rate-Limit, Validierung) keine verwertbare Rückmeldung.
**Fix:** Bei non-OK `await response.json()` lesen und `data.error` anzeigen (wie in `CheckoutModal.tsx:80-88`). 🎨 Frontend

### [M8] Frontend hängt hart von Caddy-`/api/*`-Routing ab — 404 in Dev/Standalone, Healthcheck merkt es nicht — `landingpage-next/next.config.ts` (keine `rewrites`), `deployment/docker-compose.yml:61-66`
**Problem:** Es gibt keine Next-Route-Handler (`app/api/**`) und **keine** `rewrites`. `/api/scan|checkout|dsgvo|widerruf|kuendigung` funktionieren nur, weil Caddy am Edge auf `app:8080` routet. `next dev` oder das Standalone-Image ohne Caddy → alle Formulare laufen ins Leere. Der Container-Healthcheck prüft nur `/` (Z62), nicht die API-Erreichbarkeit — ein kaputtes API-Wiring besteht den Health-Check.
**Impact:** Lokale Entwicklung ohne Backend frustrierend; fehlkonfiguriertes Routing wird vom Health-Check nicht erkannt. ScanForm degradiert wenigstens auf Demo-Fallback; die POST-Formulare nur auf generischen Fehler.
**Fix:** Harte Abhängigkeit dokumentieren (README `landingpage-next`); optional Dev-`rewrites` in `next.config.ts` auf den lokalen Scanner. 🎨 Frontend / 📦

### [M9] Open-Redirect-Restrisiko: Checkout folgt `data.url` ohne Scheme-Allowlist — `landingpage-next/components/CheckoutModal.tsx:84-85`
**Problem:** `if (data.url) window.location.href = data.url;` vertraut blind der Backend-Antwort. Ziel ist Stripe-Checkout; Risiko gering (URL stammt vom eigenen Backend), aber falls das Backend je manipulierbar reflektiert, ist es ein Open Redirect.
**Impact:** Niedrig-mittel; Phishing-Weiterleitung nur bei Backend-Kompromittierung.
**Fix:** Vor dem Redirect prüfen, dass `data.url` mit `https://checkout.stripe.com/` (oder eigener Domain) beginnt. 🎨 Frontend

### [M10] `scanSite` Multi-Page: Rebinding-Pin pro Host nutzbar, aber `addrCache` wird nirgends gelesen — `scanner/lib/scan.js:74-112`
**Problem:** `addrCache` wird befüllt (Z77, Z102), aber beim erneuten `verifyNoDnsRebinding` (Z111) werden die **frisch** aufgelösten `safeTarget.addresses` übergeben, nicht der Erst-Auflösungs-Cache. D.h. der Rebinding-Vergleich vergleicht die Adresse mit sich selbst (immer „intersect"). Der eigentliche Schutz greift nur, weil `assertPublicHttpUrl` (Z101) bei jedem Link erneut auflöst und private IPs sofort blockt — der `verifyNoDnsRebinding`-Aufruf ist hier praktisch ein No-Op, und `addrCache` ist toter Zustand.
**Impact:** Kein akutes Loch (jede URL wird via `assertPublicHttpUrl` geprüft), aber der dokumentierte „Pin im Crawl-Loop" existiert effektiv nicht; toter Code suggeriert mehr Schutz als vorhanden.
**Fix:** Entweder `addrCache.get(host)` als `expectedAddresses` an `verifyNoDnsRebinding` übergeben (echtes Pinning gegen die Erstauflösung), oder den No-Op-Aufruf + `addrCache` entfernen und im Kommentar klarstellen, dass der Schutz aus dem Per-Link-`assertPublicHttpUrl` kommt. 🛠️ Backend

### [M11] Admin-API-Vertrag (TS-Typen) passt nicht zum tatsächlichen Backend-Output — `admin-next/lib/api.ts:16-33` vs `scanner/lib/orders.js`/`subscriptions.js`
**Problem:** `api.ts` definiert `Order.status` als `"paid"|"pending"|"failed"|"refunded"` und ein Pflichtfeld `currency`. Das Backend schreibt aber `status` GROSS (`PAID`,`FULFILLING`,`MAILED`,`FAILED`,`RESENT`) und kein `currency`. Ebenso `Subscription.status` (`"active"|…`) vs Backend `ACTIVE`/`CANCELLED`. Auch `ADMIN_API_BASE_URL` (api.ts) vs `BFSG_API_URL` (compose, siehe M12).
**Impact:** Sobald Welle 5 die echten Calls verdrahtet, matchen Status-Filter/Anzeigen nicht → leere/falsche Dashboards. Heute latent (Mock).
**Fix:** TS-Typen an den realen JSONL-Output angleichen (Status-Enums GROSS, `currency` optional) bzw. im Backend ein stabiles Admin-DTO definieren. 🎨 Frontend / 🛠️ Backend

### [M12] Env-Namens-Mismatch admin-next: `BFSG_API_URL` (compose) ≠ `ADMIN_API_BASE_URL` (code) — `deployment/docker-compose.yml:84` vs `admin-next/lib/api.ts:47`
**Problem:** Compose setzt `BFSG_API_URL=http://app:8080`, der Code liest `process.env.ADMIN_API_BASE_URL ?? "https://bfsg-fix.de"`. Die in-Cluster-URL wird ignoriert; ab Welle 5 würde Admin-Traffic über die öffentliche Domain hairpinnen statt direkt `app:8080` zu treffen.
**Impact:** Latente Fehlkonfiguration; unnötiger Umweg über Caddy/Internet, defeats internal routing.
**Fix:** Einen Namen wählen — entweder `api.ts:47` auf `process.env.BFSG_API_URL ?? process.env.ADMIN_API_BASE_URL ?? DEFAULT` erweitern oder die Compose-Variable umbenennen. 🎨 Frontend / 📦

### [M13] Cookie-Scan: `passes`-Zählung kann „kein Tracker" doppelt positiv werten + `incomplete:0` trotz Mess-Unsicherheit — `scanner/lib/scan-cookie.js:146-156`
**Problem:** `passes` wird aus vier unabhängigen Booleans summiert; bei einer Seite ganz ohne Tracker/Cookies/Banner zählt sie mehrere „passes" und das Ergebnis kann für ein reines 1-Page-Cookie-Signal optimistisch wirken. `incomplete` ist hart `0`, obwohl der Report-Disclaimer selbst sagt, die Messung sei unvollständig (interaktions-/scroll-getriggerte Tags). `computeScore` (report.js) ist außerdem auf axe-Impacts geeicht, nicht auf Cookie-Findings — der Score im Cookie-Report ist nur grob plausibel.
**Impact:** Cookie-Report-Score/`passes` sind eher Marketing- als Messgröße; vertretbar dank klarem Disclaimer, aber inkonsistent zur „ehrlichen Mess-Philosophie" im Header.
**Fix:** Für Cookie-Reports `incomplete` mit den nicht abgedeckten Kategorien füllen (z.B. „interaktionsgetriggerte Tags nicht gemessen") und `passes` auf die tatsächlich geprüften, relevanten Checks begrenzen. 🛠️ Backend

---

## 🟢 Niedrig / Nice-to-have

### [L1] Rate-Limit per `X-Forwarded-For` umgehbar bei direktem App-Zugriff — `scanner/lib/limits.js:15-18`
Das Limit vertraut dem ersten Eintrag von `x-forwarded-for`. Hinter Caddy (`trust proxy`,1) ist das korrekt (Caddy setzt die echte Client-IP). Würde die App je direkt exponiert, könnte ein Angreifer den Header fälschen und das Limit pro „IP" umgehen. **Fix:** OK solange ausschließlich hinter Caddy; dokumentieren, dass die App nie direkt ans Netz darf (compose nutzt `expose`, nicht `ports` — gut). 🛠️ Backend

### [L2] In-Memory Rate-Limit + Cache sind nicht Multi-Instanz-fähig — `scanner/lib/limits.js`, `scanner/app.js:228-230`
Bei horizontaler Skalierung (mehr als 1 App-Container) sind Rate-Limit-Counter und Scan-Cache pro Prozess. Aktuell 1 Container → unkritisch. **Fix:** Bei Skalierung Redis. Der `CACHE_MAX=500`-Bound + `cache.clear()` (Z249) verhindert immerhin unbegrenztes Wachstum — gut gelöst, wenn auch grob (clear statt LRU-Eviction). 🛠️ Backend

### [L3] `JsonLd` nutzt `dangerouslySetInnerHTML` mit `JSON.stringify` ohne `<`-Escaping — `landingpage-next/components/JsonLd.tsx:209`
Daten sind statisch (Kommentar korrekt), daher kein aktuelles XSS. `JSON.stringify` escaped jedoch nicht `</script>`; sollte je User-Input in JSON-LD landen, wäre Breakout möglich. **Fix:** Defensive `.replace(/</g,'\\u003c')` auf den String, falls künftig dynamische Daten. 🎨 Frontend

### [L4] CSP erlaubt `script-src 'unsafe-inline'`; `X-XSS-Protection` deprecated — `deployment/Caddyfile:13-15`
`'unsafe-inline'` schwächt den XSS-Schutz. Next unterstützt Nonce-basierte CSP. `X-XSS-Protection: 1; mode=block` ist veraltet (moderne Empfehlung: `0`). CSP existiert nur in Caddy, nicht in den Next-Configs → Standalone-Betrieb ohne CSP. **Fix:** Nonce-CSP, `'unsafe-inline'` für Scripts entfernen, `X-XSS-Protection: 0`. 🎨 Frontend / 📦

### [L5] Security-Header zwischen den zwei Next-Apps inkonsistent — `landingpage-next/next.config.ts:3-11` vs `admin-next/next.config.ts`
Landing (public) hat **kein** app-level HSTS und `X-Frame-Options: DENY`; admin hat HSTS + `SAMEORIGIN`. Caddy ergänzt HSTS für beide, daher gering. **Fix:** Header-Listen angleichen. 🎨 Frontend

### [L6] `report.js`/`statement.js` „passes" als verkäuferische, nicht geprüfte Zahl — `scanner/lib/report.js:201`
`scan.passes` ist die Summe bestandener axe-Regeln über alle Seiten (bei Multi-Page also addiert) — als KPI „Bestandene Prüfungen" im PDF kann das aufgebläht wirken (25 Seiten × Basis-Passes). Ehrlich, aber leicht missverständlich. **Fix:** Optional „pro Seite gemittelt" oder als „Regel-Checks gesamt" beschriften. 🛠️ Backend

### [L7] `scanSite` lädt `networkidle` + sammelt alle same-origin-Links unpriorisiert — `scanner/lib/scan.js:112-135`
BFS nimmt Links in DOM-Reihenfolge; bei großen Seiten werden evtl. „unwichtige" Unterseiten (Impressum, Tags) zuerst gescannt, bis `maxPages` erreicht ist. `networkidle` kann auf tracker-lastigen Seiten in Timeout laufen (anders als Cookie-Scan hat `scanSite` keinen `domcontentloaded`-Fallback → einzelne Seite scheitert, wird aber resilient übersprungen). **Fix:** Optional Priorisierung (Navigations-Links zuerst) + `domcontentloaded`-Fallback wie in `scan-cookie.js`. 🛠️ Backend

### [L8] `deleteUserData` „redacted PII" — Behauptung vs Realität — `scanner/lib/dsgvo.js:130-143`
Der Tombstone-Eintrag behauptet „PII wurde aus aktiven Records redacted (Hash-Replacement)", tatsächlich wird **nur ein Tombstone angehängt**; die ursprünglichen Order-Zeilen mit Klartext-E-Mail bleiben in der JSONL stehen (Compaction ist als TODO markiert, Z131). `exportUserData` filtert sie korrekt aus (Tombstone-Check), aber physisch ist die PII noch da. **Impact:** DSGVO-Art.-17-Löschung ist faktisch „logisch gelöscht", nicht „physisch" — vertretbar mit GoBD-Aufbewahrungs-Begründung, aber die Notice ist irreführend. **Fix:** Notice ehrlich formulieren („für die Aufbewahrungsfrist gesperrt, danach gelöscht") und die Compaction (`compact.js`) tatsächlich bauen. 🛠️ Backend / 📦

### [L9] `subscriptions/page.tsx` Copy-Bug + `admin` Mock-Texte — `admin-next/app/subscriptions/page.tsx:46`
„{canceledCount} Aktive Kündigungen" mischt aktiv/gekündigt. Kosmetisch, Mock-only. 🎨 Frontend

### [L10] `audit.js`/`outreach.js`/`audit-cookie.js` CLI-Tools ungetestet + nicht im `test`-Script — `scanner/`
Die CLI-Orchestratoren sind nützlich, aber ohne Tests und teilen Logik mit den Lib-Funktionen. Geringes Risiko (nur manuell genutzt). **Fix:** Bei Bedarf Smoke-Test. 🛠️ Backend

### [L11] `package.json` Stripe/Express gepinnt, aber Next-Apps mit `^`-Ranges — Lieferketten-Drift — `landingpage-next/package.json`, `admin-next/package.json`
Scanner pinnt exakt (gut). Die Next-Apps nutzen `^`-Ranges (z.B. `motion ^12`, `zod ^4`) → reproduzierbare Builds nur via Lockfile. Lockfiles sind vorhanden. **Fix:** Im Docker-Build `npm ci` statt `npm install` sicherstellen (Dockerfiles prüfen). 📦

---

## Positiv (was gut gelöst ist)

- **SSRF-Guard** (`url-guard.js`): deckt v4/v6 inkl. IPv4-mapped, CGNAT, Cloud-Metadaten (169.254.169.254), Benchmarking-Ranges ab; blockt Creds-in-URL und Nicht-http(s); gibt aufgelöste Adressen zurück. Sehr gründlich, mit Tests.
- **Webhook-Design**: roher Body vor `express.json` (Z60), sofortiges Quittieren + asynchrone Verarbeitung, Signatur-Verifikation, `payment_status`-Check, Status-Persistenz **vor** Erzeugung, Betreiber-Alarm bei Fehler. (Race-Detail siehe F1, aber die Architektur ist richtig.)
- **Fail-fast** (`mailer.js`): Live-Stripe ohne SMTP → Prozess-Exit; erkennt `sk_live` **und** `rk_live` (mit Test).
- **Admin-Auth**: constant-time-Vergleich, Min-32-Zeichen-Enforcement mit Exit, 503 statt 200 wenn nicht konfiguriert.
- **PII-Hygiene in Telemetrie**: `logger.js` + `sentry.js` redacten E-Mail/Token/Stripe-Signature/Secrets konsequent (Header, Query, Error-Message-Pattern).
- **Token-DSGVO-Flow**: Doppel-Opt-in, 24h-TTL, Single-Use (Consume-Marker), Tombstone-Logik mit gehashter E-Mail — konzeptionell sauber (Versand-Lücke F3 ausgenommen).
- **HTML-Escaping**: `esc()` in `report.js` **und** `invoice.js` deckt `& < > " '` ab; mit explizitem XSS-Test in `invoice.test.js`. React-Frontend escaped ohnehin (keine echten XSS-Vektoren).
- **Cookie-Scan-Ehrlichkeit**: Trennung hartes Signal (gesetzte Cookies) vs weiches (Tracker-Request), host-genaue Listen (keine Substring-Fehltreffer), Erst-/Dritt-Partei via registrierbarer Domain, Consent-Mode-v2-Disclaimer.
- **Test-Abdeckung der kritischen Pfade**: Idempotenz, Status-Übergänge (PAID→…→RESENT), Subscription-Lifecycle, SSRF/Rebinding, DSGVO-Roundtrip, Invoice-Sequenz + USt-Modi + XSS. Für ein Solo-Projekt stark.
- **Concurrency-Gate** + `shm_size: 1gb` + `--disable-dev-shm-usage`: durchdachter OOM-Schutz für Headless-Chromium.
- **Ops**: GPG-verschlüsselte Backups ohne Plaintext-on-Disk, monatlicher Restore-Roundtrip-Test, Uptime-Watch mit Health-JSON-Feldprüfung, force-recreate für Caddy-Config. Reifer als für die Projektgröße üblich.

---

## Konsistenz-Check Paket-Preise

Quelle der Wahrheit laut Kommentaren: `scanner/app.js` PACKAGES. Abgeglichen mit
`scanner/lib/fulfill.js` PKG_CONFIG (Engine/Seiten/Mail) und
`landingpage-next/lib/config.ts` (Anzeige).

| Paket-ID | app.js `amount` (Cent) | app.js Name | config.ts `amountCents` | config.ts Preis-Anzeige | fulfill.js vorhanden? | Status |
|---|---|---|---|---|---|---|
| `basis` | 19900 | BFSG-Report Basis | 19900 | 199 € | ✅ (bfsg, 5 Seiten, Statement) | ✅ konsistent |
| `profi` | 49900 | BFSG-Report Profi | 49900 | 499 € | ✅ (bfsg, 25 Seiten, Statement) | ✅ konsistent |
| `cookie-basis` | 4900 | Cookie-Check (§25 TDDDG) | 4900 | 49 € | ✅ (cookie, 1 Seite) | ✅ konsistent |
| `cookie-profi` | 7900 | Cookie-Check Profi | 7900 | 79 € | ✅ (cookie, 5 Seiten) | ✅ konsistent |
| `abo` | 4900 (nur wenn `ENABLE_ABO`) | BFSG Re-Check Abo | 4900 | 49 €/Monat | ✅ (bfsg, 25 Seiten, recheck) | ⚠️ siehe Hinweise |

**Preise/Beträge: vollständig konsistent** über alle drei Quellen. ✅

**Aber Inkonsistenzen drumherum:**
1. **`abo` ist im Frontend immer sichtbar** (`config.ts` PACKAGES enthält `abo` fest), im Backend aber nur wenn `ENABLE_ABO=true` (Default **false**, compose Default **false**). Ein Kunde, der das Abo auf der Landingpage wählt, bekommt bei `POST /api/checkout` → `PACKAGES['abo']` `undefined` → **400 „Ungültiges Paket"**. **Fix:** Abo im Frontend nur zeigen, wenn aktiv (Feature-Flag/Env an die Landing geben) oder Backend-Default angleichen. (Mittel-Severity, hier zusätzlich erfasst.)
2. **`profi`/`abo` Seitenzahl**: config.ts bewirbt Profi „Bis zu 25 Unterseiten" — `fulfill.js` `maxPages:25` ✅. Abo `maxPages:25` ohne Statement (`withStatement:false`) ✅ — aber `report.js`/Mail für Abo nutzt `emailKind:'recheck'` korrekt.
3. **Cookie-Profi Erwartung**: config.ts verspricht „Tiefere Prüfung", `fulfill.js` macht `maxPages:5` (vs Basis 1) — der Kommentar in `fulfill.js:53-56` sagt, Multi-Page-Cookie sei „V1: nur Startseite", die Tiefe komme aus „manueller Prüfung im Backend". `runScan` ruft für Cookie aber **immer `scanCookie(url)` (nur Startseite)**, unabhängig von `maxPages` → die beworbene erweiterte Prüfung ist im Automatik-Teil nicht abgebildet (rein manuell). Konsistent mit Disclaimer, aber Marketing > Technik.

---

## Anhang: Wer fixt was (Erwartung)

- **🛠️ Backend-Criteria-Agent (scanner/):** F1, F2, F4, M1, M2, M3, M10, M13, L1, L2, L6, L7 — sowie die Scan-/Score-seitige Hälfte von M4 und L8.
- **🎨 Frontend-QA-Agent (landingpage-next/):** M4 (Grade-Schwellen), M5, M7, M9, L3, L4, L5, L9 — sowie die Frontend-Hälfte von M6/M11/M12 und den Abo-Sichtbarkeits-Punkt aus dem Preis-Check.
- **📦 Bleibt übrig (Ops/Cross-cutting, kein einzelner Agent):** F3 (DSGVO-Mailversand), F5 (server.js löschen), F6 (cloud-init PII), F7 (Admin-Auth-Layer), F8 (Invoice-Verdrahtung/GoBD), M8 (Doku/Dev-Wiring), M12 (Compose-Env), L8 (Compaction), L11 (npm ci).
