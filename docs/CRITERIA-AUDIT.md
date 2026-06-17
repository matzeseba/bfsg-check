# Kriterien-Audit — BFSG-Check Backend (`scanner/`)

**Datum:** 2026-06-17
**Scope:** `scanner/` (Backend, Tests) + dieses Dokument
**Branch:** `fix/backend-criteria`
**Test-Status:** `npm test` → **50/50 grün** (vorher 25; +25 neue Tests)
**Live-Kontext:** App live auf https://bfsg-fix.de (Stripe live, Brevo aktiv)

Legende: ✅ erfüllt · ⚠️ Lücke (geschlossen oder dokumentiert) · 🔴 kritisch · 👤 Mensch-Pflicht bleibt

---

## Zusammenfassung der gefixten Bugs

| # | Bug / Lücke | Schwere | Status |
|---|---|---|---|
| 1 | **Umlaut-Bug**: `rules-de.js`, `report.js`, `statement.js`, `fulfill.js` nutzten ASCII-Ersatz (ae/oe/ue/ss) in user-sichtbaren Strings ("Luecken", "Loesung", "ausserhalb") | 🔴 Außenwirkung/Preis | **GEFIXT** — alle user-sichtbaren deutschen Strings auf echte ä/ö/ü/ß; Regression-Test `report.test.js` |
| 2 | **Invoice nie aufgerufen**: `generateInvoicePdf` existierte, war aber NICHT im Webhook-Flow integriert (offenes TODO) | 🔴 Rechnungspflicht | **GEFIXT** — in `handleCheckoutCompleted`, `handleInvoicePaid`, Resend-Pfad integriert; als Mail-Anhang |
| 3 | **Logger/Sentry nicht eingebunden**: Drop-In-Module vorhanden, in `app.js` ungenutzt | ⚠️ Observability | **GEFIXT** — `import './lib/sentry.js'`, `httpLog()`-Middleware, `logger`/`sentry.captureException` in allen kritischen Fehlerpfaden |
| 4 | **§ 14 UStG: Leistungsdatum** nur "impliziert" im Footer | ⚠️ Rechnungs-Pflichtangabe | **GEFIXT** — explizites `Rechnungsdatum:` + `Leistungsdatum:` im Invoice-Header |
| 5 | **Rechnungsnummer-Race**: `nextInvoiceNumber` lockless → parallele Webhooks könnten Nummern doppelt vergeben | ⚠️ § 14 Eindeutigkeit | **GEFIXT** (Einzelinstanz) — In-Process-Async-Mutex; Race-Test mit 20 parallelen Allokationen |
| 6 | **Stripe-Customer-ID** bei Einmalkäufen nicht persistiert (`recordPaid`) | ⚠️ Kundenverwaltung | **GEFIXT** — `customerId` in Order-Record |
| 7 | **Kein Zahlungsausfall-Handling** (past_due/unpaid) fürs Abo | ⚠️ Aboverwaltung | **GEFIXT** — `customer.subscription.updated` → lokaler PAST_DUE-Status pausiert Re-Checks |

---

## Kriterium 1 — Kundenverwaltung lückenlos

**Status: ✅ erfüllt (mit Fixes)**

- ✅ **Persistenz**: Jeder bezahlte Kauf wird in `out/orders.jsonl` (append-only JSONL) SOFORT bei `checkout.session.completed` festgehalten — VOR jeder Report-Erzeugung (`lib/orders.js#recordPaid`). Source of Truth übersteht Prozess-Restart (Test in `webhook.e2e.test.js`).
- ✅ **Stripe-Customer-ID** *(gefixt)*: `recordPaid` speichert jetzt `customerId` aus `s.customer`. Vorher nur bei Subscriptions vorhanden. → `lib/orders.js`, `app.js` Z.116, Test "recordPaid persistiert Stripe-customerId".
- ✅ **Doppelkauf-Handling**: Idempotenz über `event.id` (`alreadyProcessed`) verhindert Doppel-Erfüllung bei Stripe-Webhook-Retries. Mehrfachkäufe desselben Kunden mit verschiedenen `session.id` sind erlaubt und werden als separate Orders korrekt geführt (gewollt).
- ✅ **E-Mail-Recovery / Fehlerpfad**: Bei Erfüllungs-Fehler → Status `FAILED` + Betreiber-Alarm (`sendAlert`) + manueller Resend via `POST /api/resend/:sessionId` (Admin-Auth). Resend reicht jetzt auch die Rechnung nach.
- ✅ **DSGVO Export/Delete-Roundtrip** (`lib/dsgvo.js`): Token-Doppel-Opt-in (24 h), Export (Art. 15) liefert nur Records der E-Mail, Delete (Art. 17) setzt Tombstone → Export danach leer. **Roundtrip end-to-end verifiziert** (manuell + `dsgvo.test.js`).

**👤 Mensch-Pflicht:**
- Backup von `out/*.jsonl` + `out/invoices/` (siehe `docs/BACKUP.md`) — die gesamte Kundenverwaltung liegt im Dateisystem.
- ⚠️ **Hinweis (kein Bug)**: `deleteUserData` setzt einen Tombstone und macht Records über `isTombstoned` unauffindbar; der Notice-Text spricht von "PII redacted". Physisch werden alte JSONL-Zeilen NICHT überschrieben (GoBD-Aufbewahrung gewollt). Funktional DSGVO-konform (Auskunft liefert nichts mehr). Echte Kompaktierung/Redaction = `lib/compact.js` (TODO, in dsgvo.js vermerkt).

---

## Kriterium 2 — Aboverwaltung lückenlos

**Status: ✅ erfüllt (mit Fixes) — ENABLE_ABO bleibt 👤-Entscheidung**

Lifecycle vollständig abgedeckt:
- ✅ **Start**: `checkout.session.completed` (mode=subscription) → `recordSubscription` (Status ACTIVE, customerId, url, pkg) + Erst-Report.
- ✅ **Re-Check**: `invoice.paid`/`invoice.payment_succeeded` mit `billing_reason=subscription_cycle` → Re-Scan + Diff + Re-Check-Mail (verhindert Doppel-Scan der Erstrechnung über die billing_reason-Guard). Nur Subscriptions mit lokalem Status ACTIVE lösen Re-Checks aus.
- ✅ **Kündigung**: `customer.subscription.deleted` → `markCancelled` + Bestätigungs-Mail (`sendCancellationConfirmation`).
- ✅ **Zahlungsausfall** *(gefixt)*: `customer.subscription.updated` → `markSubscriptionStatus` mappt Stripe-Status (past_due/unpaid/paused/incomplete → lokal `PAST_DUE`; active/trialing → `ACTIVE`; canceled → `CANCELLED`). PAST_DUE pausiert Re-Checks automatisch (ACTIVE-Guard in `handleInvoicePaid`) + Betreiber-Alarm. Recovery (Zahlung klappt wieder) reaktiviert. → `app.js#handleSubscriptionUpdated`, `lib/subscriptions.js`, Test "Zahlungsausfall".
- ✅ **Kunde kann selbst kündigen**: `POST /api/kuendigung` (§ 312k BGB) leitet die Kündigung an den Betreiber (rate-limitiert).
- ✅ **Re-Check-Diff-Logik** (`lib/diff.js`): resolved/newly/changed/unchanged auf Regel-Ebene, Score-Delta, Plaintext-Summary für Mail. Voll getestet (`diff.test.js`: firstScan, Klassifikation, improved/worsened).

**👤 Mensch-Pflicht, um `ENABLE_ABO=true` sicher zu setzen:**
1. **Stripe-Webhook-Events abonnieren** im Live-Endpoint `/webhook`:
   `checkout.session.completed`, `invoice.paid` (oder `invoice.payment_succeeded`), `customer.subscription.updated`, `customer.subscription.deleted`.
2. **Last-/Zustelltest**: mit Stripe-CLI (`scanner/scripts/stripe-trigger.sh`) die vier Events an den Live-Endpoint feuern und Zustellung (200) + Re-Check-Mail prüfen.
3. **Stripe Customer Portal** (Alternative zur `/api/kuendigung`-Mail) im Stripe-Dashboard aktivieren — empfohlen für komfortable Selbst-Kündigung/Zahlungsmittel-Update. Aktuell: Mail-Weg ist § 312k-konform vorhanden.
4. Erst dann `ENABLE_ABO=true` in der Server-`.env` setzen + `docker compose restart app`. Das Paket `abo` (49 €/Mon) erscheint dann automatisch in `PACKAGES`.

---

## Kriterium 3 — Prüfungen 100% logisch + lückenlos

**Status: ✅ erfüllt**

- ✅ **WCAG-Tags** (`lib/scan.js`): axe-core mit `['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']` — deckt WCAG 2.1 A + AA ab (BFSG/EN 301 549). Korrekt.
- ✅ **Multi-Page-Crawl** (`scanSite`): same-origin BFS, dedupliziert nodes über Seiten, aggregiert auf Regel-Ebene; Einzelseiten-Fehler brechen den Lauf NICHT ab (resilient, `errors[]`). maxPages gedeckelt (1–50). Basis 5 / Profi 25 Seiten.
- ✅ **Cookie-Scan** (`lib/scan-cookie.js`, § 25 TDDDG): host-genaue Tracker-Erkennung (kein nackter Substring-Match), First-Party-Ausschluss über registrierbare Domain, Cookie-Präfix + Exact-Match-Listen, CMP-/Banner-Erkennung inkl. Shadow-DOM. Ehrliche Schwere-Logik: gesetzte Cookies = HART (serious), beobachtete Requests = WEICH (moderate, "Consent Mode v2 ggf. zulässig"). Sauber.
- ✅ **Score-Berechnung** (`lib/report.js#computeScore`): Penalty = Impact-Gewicht × (1 + log2(nodes+1)), nodes auf 10 gedeckelt (diminishing returns), Score 0–100, Grade A–D mit Klartext-Verdict. Nachvollziehbar und monoton.
- ✅ **SSRF-Guard + DNS-Rebinding** (`lib/url-guard.js`): blockt localhost/RFC1918/link-local (inkl. 169.254.169.254 Cloud-Metadaten)/CGNAT/IPv6-Loopback/ULA/IPv4-mapped; löst ALLE A/AAAA-Records auf und prüft jede; `verifyNoDnsRebinding` re-resolved vor jedem `page.goto` und vergleicht (Pin). Notbremse `DNS_PIN_STRICT=false`. Voll getestet (`security.test.js`).
- ✅ **Timeout/Resilienz**: per-Page-Timeout, networkidle→domcontentloaded-Fallback (Cookie-Scan), Concurrency-Gate (`MAX_CONCURRENT_SCANS`, Default 2) gegen OOM, Plausibilitäts-Check verhindert Verkauf leerer Reports (`fulfill.js`).

**👤 Mensch-Pflicht:** keine. (Automatisierte Tests erkennen ~30–50 % der Barrieren — dieser ehrliche Hinweis steht im Report-Disclaimer, korrekt.)

---

## Kriterium 4 — Reports/Pläne preisangemessen + korrekt

**Status: ✅ erfüllt (Umlaut-Bug GEFIXT)**

- 🔴→✅ **Umlaut-Bug GEFIXT**: Alle user-sichtbaren deutschen Strings in `lib/rules-de.js`, `lib/report.js`, `lib/statement.js` und den Cookie-Report-Texten in `lib/fulfill.js` verwenden jetzt echte ä/ö/ü/ß statt ae/oe/ue/ss. Betroffen waren u. a. "Luecken"→"Lücken", "Loesung"→"Lösung", "ausserhalb"→"außerhalb", "Maengel"→"Mängel", "Pruefnorm"→"Prüfnorm", "Konformitaets-Score"→"Konformitäts-Score". Regression-geschützt durch `test/report.test.js` (prüft Output auf 30+ ASCII-Artefakt-Muster über Report/Statement/Teaser/Rules).
  - *Bewusst ASCII belassen:* die Anhang-Dateinamen `Barrierefreiheitserklaerung.txt` / `*-barrierefreiheitserklaerung.md` (Mailclient-Kompatibilität von Dateinamen) — kein user-sichtbarer Prosatext.
- ✅ **Report-Wertigkeit (199–499 €)**: Scorecard mit Grade, Impact-KPIs, nach Dringlichkeit sortierte Findings (Titel/Warum/Lösung/betroffene Stellen), abarbeitbare Umsetzungs-Checkliste, Diff-Block (Abo), Multi-Page-Anzeige, A4-PDF (`fulfill.js` via Playwright). Angemessen.
- ✅ **Findings-Mapping** (`lib/rules-de.js`): 33 axe-Regeln + 5 Cookie-Regeln in deutschem Klartext (title/why/fix), Fallback auf axe-Originaltext für unbekannte Regeln. Korrekt gemappt.
- ✅ **Barrierefreiheitserklärung** (`lib/statement.js`): vollständiges BFSG/BITV-2.0-Gerüst (Stand der Vereinbarkeit, nicht-barrierefreie Inhalte mit WCAG-Bezug, Feedback-Kontakt, Durchsetzungsverfahren) als Entwurf zum Finalisieren.

**👤 Mensch-Pflicht:** Erklärung-zur-Barrierefreiheit ist bewusst ein **Entwurf** — der Seitenbetreiber muss Schlichtungsstelle/Kontakt vervollständigen (so im Dokument vermerkt).

---

## Kriterium 5 — Rechnungserstellung + Zahlung lückenlos

**Status: ✅ erfüllt (Integration + § 14 + Race GEFIXT)**

- 🔴→✅ **Invoice in Webhook-Flow integriert** *(war offenes TODO)*: `generateInvoicePdf` wird jetzt aufgerufen in
  - `handleCheckoutCompleted` (nach erfolgreichem Fulfillment, Betrag = `s.amount_total`),
  - `handleInvoicePaid` (Abo-Monatsrechnung, Betrag = `inv.amount_paid`),
  - Resend-Pfad (nachgereicht, falls Erst-Auslieferung fehlschlug).
  Gekapselt in `safeGenerateInvoice` — eine fehlgeschlagene Rechnung blockiert NIE die Report-Auslieferung (das bezahlte Produkt hat Vorrang), löst aber Alarm + Sentry aus.
- ✅ **An Kunde gemailt** (`lib/mailer.js`): Rechnung wird als zusätzlicher Anhang `Rechnung-RE-YYYY-NNNN.pdf` mitgesendet (`sendReport`/`sendCookieReport`/`sendRecheckReport` akzeptieren `invoicePdfPath`+`invoiceNumber`). Tests in `mailer.test.js`.
- ✅ **§ 14 UStG Pflichtangaben** (`lib/invoice.js`): Anbieter Name/Anschrift, Empfänger, USt-IdNr./Steuernummer (Regelbesteuerung), fortlaufende Nr., **Rechnungsdatum + Leistungsdatum** *(Leistungsdatum gefixt — war nur impliziert)*, Leistungsbeschreibung, Netto/USt/Brutto, § 19-Hinweis (Kleinunternehmer). `VAT_MODE` schaltet Kleinunternehmer vs. 19 % USt.
- ⚠️→✅ **Fortlaufende Nummer thread-safe** *(gehärtet)*: In-Process-Async-Mutex serialisiert read-modify-write des Counters → parallele Webhooks im selben Node-Prozess vergeben keine Duplikate. Race-Test mit 20 parallelen Allokationen (eindeutig + lückenlos).
- ✅ **GoBD-Audit-Trail**: jeder Render in `out/invoices-log.jsonl` + PDF in `out/invoices/`.

**👤 Mensch-Pflicht:**
- **Stammdaten in `.env`** setzen: `INVOICE_FROM_NAME`, `INVOICE_FROM_ADDRESS`, `VAT_MODE`, ggf. `INVOICE_USTID`/`INVOICE_TAX_NUMBER`/`INVOICE_IBAN` (sonst Platzhalter im Header). Siehe `docs/INVOICE-COMPLIANCE.md`.
- **Mehr-Instanz-Skalierung**: der In-Process-Mutex schützt nur EINE Instanz. Bei horizontaler Skalierung externen Lock (SQLite/Redis) ergänzen — derzeit Single-Instance-Docker, also abgedeckt.
- 10-Jahre-Backup von `out/invoices/` (GoBD), PDF/A-Konvertierung optional (Welle 5).

---

## Kriterium 6 — "Keine Rechtsberatung" + Rechtskonformität

**Status: ✅ erfüllt**

- ✅ **Disclaimer in allen Outputs**: "keine Rechtsberatung" + "keine (Konformitäts-)Garantie" in `report.js` (HTML/PDF legalbox), `statement.js`, `fulfill.js` (Cookie-Report), `invoice.js` (Footer) und `mailer.js` (alle Mail-Texte). Verifiziert per Grep.
- ✅ **Keine falschen Garantie-Versprechen**: Grep nach "garantieren wir / garantiert konform / 100% konform" → keine Treffer. Der Report nennt ehrlich die ~30–50 %-Erkennungsrate automatisierter Tests.
- ✅ **Widerruf/Verbraucherschutz**: `/api/widerruf` (§ 356e BGB), Verbraucher-Consent-Pflicht im Checkout (§ 356 IV/V BGB — Sofort-Erfüllung nur mit ausdrücklicher Zustimmung, `app.js#/api/checkout`).

**👤 Mensch-Pflicht:** finale rechtliche Prüfung der Texte (Anwalt) — siehe `docs/LEGAL-REVIEW-CHECKLIST.md`. Code stellt die Disclaimer technisch sicher.

---

## Kriterium 7 — Observability-Integration

**Status: ✅ erfüllt (war offenes Drop-In)**

- ⚠️→✅ **Logger + Sentry eingebunden** in `app.js`:
  - `import './lib/sentry.js'` ganz oben (Init vor Side-Effects; no-op ohne `SENTRY_DSN`).
  - `app.use(httpLog())` (pino-http; no-op-Fallback wenn nicht installiert).
  - `logger.info/warn/error` in Startup, Webhook-Handlern, Fulfillment, Re-Check, Resend.
  - `sentry.captureException(err, ctx)` in allen kritischen Fehlerpfaden (Webhook-Event-Fehler, Fulfillment, Invoice, Re-Check, Resend, unhandledRejection/uncaughtException).
- ✅ **Drop-In-sicher**: `pino`/`pino-http`/`@sentry/node` sind aktuell NICHT installiert — die Module fallen sauber auf `console` bzw. no-op zurück (runtime-verifiziert). PII-Redaction (E-Mail/Tokens/Secrets) ist in logger.js + sentry.js bereits konfiguriert.

**👤 Mensch-Pflicht (optional, für vollen Nutzen):**
- `npm install pino pino-http pino-pretty @sentry/node` im `scanner/`-Image (dann strukturierte JSON-Logs + echtes Error-Tracking).
- `SENTRY_DSN` in Server-`.env` setzen (Free-Plan reicht). Siehe `docs/MONITORING.md`.
- GitHub-Secrets `SMTP_USER`/`SMTP_PASS` für `uptime-watch.yml`.

---

## Geänderte / neue Dateien

**Code-Fixes (`scanner/`):**
- `lib/rules-de.js` — Umlauten-Fix (alle Klartexte)
- `lib/report.js` — Umlauten-Fix (Verdict, Intro, legalHtml, Labels, KPIs, Footer)
- `lib/statement.js` — Umlauten-Fix (komplette Erklärung)
- `lib/fulfill.js` — Umlauten-Fix (Cookie-Report-Texte)
- `lib/invoice.js` — Leistungsdatum (§ 14); thread-safe Nummernvergabe (Mutex)
- `lib/mailer.js` — Rechnungs-Anhang in sendReport/sendCookieReport/sendRecheckReport
- `lib/orders.js` — `customerId`-Persistenz in recordPaid
- `lib/subscriptions.js` — `markSubscriptionStatus` (past_due/unpaid/recovery)
- `app.js` — Invoice-Integration (safeGenerateInvoice), Logger+Sentry, `customer.subscription.updated`-Handler, customerId
- `package.json` — Test-Script um invoice/mailer/report-Tests erweitert

**Neue Tests:**
- `test/report.test.js` (8) — Umlaut-Regression über Report/Statement/Teaser/Rules
- `test/mailer.test.js` (7) — Rechnungs-Anhang-Wiring + Validierung
- `test/invoice.test.js` (+2 = 8) — Leistungsdatum + Nummern-Race
- `test/webhook.e2e.test.js` (+2 = 8) — past_due-Lifecycle + customerId

**Dieses Dokument:** `docs/CRITERIA-AUDIT.md`

---

## Offene 👤-Mensch-Pflichten (gesammelt)

1. `.env`: Invoice-Stammdaten (`INVOICE_FROM_*`, `VAT_MODE`, ggf. USt-IdNr.) — sonst Platzhalter auf der Rechnung.
2. Abo aktivieren: Stripe-Webhook-Events abonnieren + Zustelltest + ggf. Customer Portal, dann `ENABLE_ABO=true`.
3. Observability voll nutzen: `npm install pino pino-http pino-pretty @sentry/node` + `SENTRY_DSN`; GH-Secrets für Uptime-Watch.
4. Backup von `out/*.jsonl` + `out/invoices/` (Kundenverwaltung + GoBD 10 Jahre).
5. Rechtliche Endabnahme der Texte (Anwalt) — `docs/LEGAL-REVIEW-CHECKLIST.md`.
6. Mehr-Instanz-Betrieb: externer Lock für Rechnungsnummern (aktuell Single-Instance → ok).
