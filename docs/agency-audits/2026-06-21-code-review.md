# Code-Review: Correctness & Reliability — `scanner/` Backend

**Datum:** 2026-06-21 · **Reviewer:** Code Reviewer (Agency-Agent) · **Scope:** `scanner/` (Node.js Backend, Stripe-Live-Zahlungspfad)
**Methode:** Read-only. `node --check` (alle 13 Libs grün), `node --test` (offline-Subset). Quervergleich mit `docs/CODE-REVIEW-FINDINGS.md` (2026-06-17) + `docs/REVIEW-PRE-MORTEM.md` (2026-06-15).
**Verifiziert:** Git-Historie bestätigt, dass die alten Criticals F1/F3/F5/F7 + Invoice-Wiring in PRs #24/#26 gefixt wurden. Dieser Review sucht daher gezielt **was NEU ist bzw. nach den Fixes offen blieb**.

---

## Executive Summary

Das Backend ist für ein Solo-Projekt überdurchschnittlich gehärtet. Der größte Geld-Risiko-Pfad (Webhook → recordPaid → fulfill → mail) ist architektonisch korrekt: Zahlung wird **vor** Erzeugung persistiert, Event-Idempotenz per atomarem `claimEvent`, Betreiber-Alarm bei Fehlern, Resend-Pfad vorhanden. **Preise sind server-seitig vertrauenswürdig** — `s.amount_total` stammt aus der server-seitig erzeugten Checkout-Session (`unit_amount: PACKAGES[pkg].amount`), nicht vom Client. Kein Client-Trust-Loch.

Die offenen Befunde sind **zweiter Ordnung**, aber für einen Live-Zahlungsbetrieb relevant: Die **Event-Idempotenz schützt nicht gegen Fulfillment-Wiederholung** (anderer Event-Typ/neue Event-ID für dieselbe Session → Doppel-Report + Doppel-Rechnungsnummer). **Invoice-Nummern werden auf dem FAILED→Resend-Pfad verschwendet** (GoBD-Lücken-Risiko). Der **Abo-Pfad ist unverändert nicht load-getestet** und hat mindestens drei latente Bugs, die bei `ENABLE_ABO=true` greifen. Eine alte „gefixte" Anweisung (`node resend.js`) ist **immer noch im Code** und zeigt im Ernstfall auf eine nicht existente Datei.

| ID | Sev | Bereich | Kurz | Already-covered? |
|----|-----|---------|------|------------------|
| C1 | 🔴 Critical | Idempotenz | Event-Dedup ≠ Fulfillment-Dedup → Doppel-Report/Doppel-Rechnungsnr. bei neuem event.id für gleiche Session | Teilweise (F1 nur event.id) |
| C2 | 🔴 Critical | Invoice/GoBD | FAILED→Resend allokiert 2. Rechnungsnummer für 1 Zahlung (Lücke in fortlaufender Nr.) | Nein (neu) |
| C3 | 🔴 Critical | Ops | `node resend.js`-Anweisung im FAILED-Alert zeigt auf nicht existente Datei | Ja (F4) — **nicht gefixt** |
| H1 | 🟠 High | Abo | `handleInvoicePaid` liest `inv.subscription` top-level → bei Stripe-Version still kein Re-Check, kein Alarm | Ja (M2) — **nicht gefixt** |
| H2 | 🟠 High | Abo | `subscription.updated` race mit `recordSubscription`; `updated===null` schluckt verlorene Status | Nein (neu) |
| H3 | 🟠 High | Resend | Doppel-Auslieferung möglich: kein Status-Guard gegen paralleles Webhook+Resend | Teilweise (M1) |
| M1 | 🟡 Med | Invoice | Multi-Prozess-Counter-Race weiterhin offen (nur In-Process-Mutex) | Ja (F2) — teilfix |
| M2 | 🟡 Med | Mailer | Mail-Throw NACH Invoice-Allokation verliert keine Zahlung, aber Order bleibt FAILED trotz erzeugter Rechnung | Nein (neu) |
| M3 | 🟡 Med | Scan | `scanSite` sammelt unbegrenzt viele Links in die Queue (Memory) bei Riesen-Sites | Teilweise (L7) |
| M4 | 🟡 Med | Abo | `cycleAmount`-Fallback `?? 0` → 0-€-Rechnung möglich (GoBD-falsch) | Nein (neu) |
| L1 | 🟢 Low | Tests | `invoice.test.js` + `mailer.test.js` brechen ohne installierte Deps (Playwright-Import-Kette) | Nein (neu) |
| L2 | 🟢 Low | Cache | `/api/scan`-Cache `clear()` statt LRU; harmlos | Ja (L2) |
| L3 | 🟢 Low | Diff | `diffSummaryText` nutzt `prevScore` ohne Null-Guard im Nicht-firstScan-Pfad (kann `null`-Arithmetik zeigen) | Nein (neu) |

### Top 3 — Must-Fix vor (weiterem) Live-Betrieb

1. **C2 — Rechnungsnummern-Verschwendung auf dem Resend-Pfad.** Jeder bezahlte Auftrag, dessen Erst-Auslieferung scheitert (SMTP-Timeout etc.) und der danach resendet wird, verbraucht **zwei** fortlaufende GoBD-Rechnungsnummern für **eine** Zahlung. Die erste Nummer hat ein PDF + Log-Eintrag, wird aber nie zugestellt → Lücke/Dublette in der lückenlos geforderten Sequenz. Direkt durch den dokumentierten „SMTP-down"-Fall ausgelöst.

2. **C3 — Toter Resend-Befehl im Ernstfall-Alert.** Wenn ein Kunde bezahlt hat und die Auslieferung scheitert, bekommt der Betreiber die Anweisung `node resend.js <id>` — die Datei existiert nicht. Im genau kritischsten Moment (Geld kassiert, Report fehlt) folgt der Betreiber einer Sackgasse. Einzeiler-Fix.

3. **C1 — Fulfillment-Idempotenz absichern, bevor Volumen steigt.** `claimEvent` dedupliziert nur `event.id`. Sobald Stripe denselben Kauf über einen anderen Event-Typ oder eine Wiederholung mit neuer Event-ID meldet (oder ein manueller Webhook-Replay aus dem Dashboard), wird **erneut gescannt, gemailt und eine zweite Rechnung erzeugt** — Doppel-Mail an den Kunden + Doppel-Rechnungsnummer. Guard auf Session-Status (`if order.status in {FULFILLING,MAILED,RESENT} return`) schließt das.

---

## Findings (Detail)

### 🔴 C1 — Event-Idempotenz schützt nicht gegen wiederholtes Fulfillment
**Location:** `scanner/app.js:81-83` (claimEvent), `scanner/app.js:104-117` (handleCheckoutCompleted), `scanner/lib/orders.js:50-56`
**Problem:** Die Idempotenz-Sperre ist `claimEvent(event.id)` — sie dedupliziert **nur identische `event.id`**. `handleCheckoutCompleted` prüft jedoch **nie**, ob für `s.id` (die Checkout-Session) bereits ein Order in Status `FULFILLING`/`MAILED`/`RESENT` existiert, bevor es scannt, mailt und `safeGenerateInvoice` aufruft. Stripe garantiert „at least once" pro Event, aber dieselbe Geschäfts-Transaktion kann mehrfach signalisiert werden: manueller „Resend"-Replay aus dem Stripe-Dashboard (neue `event.id`!), gleichzeitiger `checkout.session.completed` + `checkout.session.async_payment_succeeded`, oder ein Event-Backfill nach Webhook-Endpoint-Wechsel.
**Impact (Geld/Daten):** Doppelter Scan (Browser-Last), **zwei Reports + zwei Mails an den Kunden** (Verwirrung, Support-Last), und — am teuersten — **eine zweite fortlaufende Rechnungsnummer** für eine einzige Zahlung (GoBD: Nummern müssen eindeutig *und* einer realen Leistung zugeordnet sein). Tritt nicht im Normalbetrieb auf, aber jeder Dashboard-Replay löst es aus.
**Fix:**
```js
async function handleCheckoutCompleted(event) {
  const s = event.data.object;
  // ... payment_status-Check ...
  await recordPaid({ ... });               // wie bisher: Zahlung sofort sichern
  // NEU: Fulfillment-Idempotenz auf Session-Ebene
  const existing = await getOrder(s.id);
  if (existing && ['FULFILLING','MAILED','RESENT'].includes(existing.status)) {
    logger.info({ sessionId: s.id, status: existing.status }, 'Fulfillment bereits erfolgt — übersprungen');
    return;
  }
  // ... ab hier scannen/mailen ...
}
```
(`getOrder` ist bereits importiert via `orders.js`; `recordPaid` setzt Status `PAID`, daher greift der Guard nur ab `FULFILLING`.)
**Already-covered?** Teilweise — F1 (2026-06-17) härtete *nur* die `event.id`-Race; die Fulfillment-Wiederholung über andere Event-Quellen ist **nicht** abgedeckt.

---

### 🔴 C2 — FAILED→Resend verschwendet eine fortlaufende Rechnungsnummer
**Location:** `scanner/app.js:139` (Invoice im Erst-Flow), `scanner/app.js:156` (FAILED ohne invoiceNumber), `scanner/app.js:450-452` (Resend allokiert neu)
**Problem:** Im Erst-Flow wird `safeGenerateInvoice` (Z139) aufgerufen — das allokiert via `nextInvoiceNumber()` eine fortlaufende Nummer, schreibt das PDF + den `invoices-log.jsonl`-Eintrag (`invoice.js:155,182`). Schlägt **danach** `sendReportFor` fehl (SMTP-Timeout), springt der Code in den `catch` und ruft `markStatus(s.id, 'FAILED', { error })` (Z156) — **ohne `invoiceNumber` zu speichern**. Beim Resend prüft `app.js:450` `order.invoiceNumber ? null : safeGenerateInvoice(...)` — da der FAILED-Record keine `invoiceNumber` trägt, wird eine **zweite** Nummer allokiert.
**Impact (Geld/GoBD):** Für eine Zahlung existieren zwei Rechnungs-PDFs (`RE-2026-000X` ungenutzt, `RE-2026-000Y` zugestellt). Die erste Nummer ist „verbrannt" → die fortlaufende Sequenz hat einen Eintrag ohne zugestellte Leistung. Bei Betriebsprüfung erklärungsbedürftig; die im Header von `invoice.js` behauptete Lückenlosigkeit ist verletzt.
**Fix:** Die Invoice-Allokation im Erst-Flow so umstellen, dass die Nummer **im Order persistiert wird, sobald sie existiert** — auch wenn der spätere Mailversand scheitert:
```js
let invoice = null;
try {
  const order = await scanGate(() => fulfillOrder({ ... }));
  invoice = await safeGenerateInvoice({ orderId: s.id, ... });
  // Nummer SOFORT festhalten, bevor gemailt wird:
  if (invoice) await markStatus(s.id, 'FULFILLING', { invoiceNumber: invoice.invoiceNumber, invoicePdfPath: invoice.pdfPath });
  await sendReportFor({ ..., invoicePdfPath: invoice?.pdfPath, invoiceNumber: invoice?.invoiceNumber });
  await markStatus(s.id, 'MAILED', { ... });
} catch (err) {
  await markStatus(s.id, 'FAILED', { error: err.message, invoiceNumber: invoice?.invoiceNumber || null, invoicePdfPath: invoice?.pdfPath || null });
  // ...
}
```
Dann reuse't der Resend (`app.js:450`) die bereits allokierte Nummer korrekt.
**Already-covered?** Nein — neu. (F2/F8 betrafen die Counter-Race bzw. das Wiring, nicht die Resend-Reallokation.)

---

### 🔴 C3 — `node resend.js`-Anweisung zeigt auf nicht existente Datei
**Location:** `scanner/app.js:159`, Kommentar `scanner/lib/orders.js:4`
**Problem:** Der FAILED-Alert enthält wörtlich `Manuell nachliefern: node resend.js ${s.id}`. `scanner/resend.js` **existiert nicht** (per `ls` + Grep verifiziert). Der reale Weg ist `POST /api/resend/:sessionId` (mit Bearer-Token, `app.js:436`).
**Impact:** Genau im Geld-kritischen Fall (bezahlt, nicht geliefert) folgt der Betreiber einer Sackgasse → Zeitverlust, frustrierter Kunde, evtl. Chargeback.
**Fix:**
```js
`\n\nManuell nachliefern: curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${PUBLIC_URL}/api/resend/${s.id}`
```
(Gleiche Korrektur im `orders.js:4`-Kommentar.)
**Already-covered?** Ja — als **F4** im 2026-06-17-Review gelistet und als Backend-Fix markiert, aber **im aktuellen Code unverändert offen**. Regression/nicht umgesetzt.

---

### 🟠 H1 — `handleInvoicePaid` liest `inv.subscription` top-level → stiller Re-Check-Ausfall
**Location:** `scanner/app.js:188` (`if (!inv.subscription) return;`), `app.js:185` (`billing_reason`)
**Problem:** Der Re-Check-Trigger hängt an `inv.subscription` als Top-Level-Feld der Invoice. In neueren Stripe-API-Versionen ist die Subscription-Referenz teils unter `inv.parent.subscription_details.subscription` bzw. nur via Expand verfügbar. Ist `inv.subscription` `undefined`, returnt der Handler **still** (Z188) — kein Re-Scan, kein Fehler, **kein Alarm**.
**Impact (Geld):** Abo-Umsatz wird kassiert (Stripe zieht ein), aber die monatliche Leistung (Re-Check) unterbleibt stillschweigend. Kunde zahlt für nichts → Rückbuchung/Reputationsrisiko. Greift **nur bei `ENABLE_ABO=true`** (Default aus).
**Fix:** Defensiv lesen + bei aktivem Abo aber fehlender Referenz alarmieren statt still zu returnen:
```js
const subId = inv.subscription
  ?? inv.parent?.subscription_details?.subscription
  ?? inv.subscription_details?.subscription;
if (!subId) {
  await sendAlert('invoice.paid ohne auflösbare Subscription-Referenz', `Invoice: ${inv.id}\nbilling_reason: ${inv.billing_reason}`);
  return;
}
```
**Already-covered?** Ja — als **M2** gelistet, **nicht gefixt**. Mit dem geplanten Abo-Launch hochpriorisieren.

---

### 🟠 H2 — `customer.subscription.updated` race + verschluckte Status bei `updated===null`
**Location:** `scanner/app.js:236-248` (`handleSubscriptionUpdated`), `scanner/lib/subscriptions.js:93-103`
**Problem (a) Ordering-Race:** Stripe feuert `customer.subscription.updated` teils **vor oder gleichzeitig** mit dem `checkout.session.completed`, der `recordSubscription` aufruft. `markSubscriptionStatus` (subscriptions.js:96) macht `const prev = subs.get(id); if (!prev) return null;` — d.h. trifft das Update-Event zuerst ein, ist die Subscription lokal noch nicht angelegt, der Status-Wechsel wird **verworfen**. Wird die Subscription später `past_due`, ohne dass ein weiteres Update kommt, läuft `handleInvoicePaid` evtl. auf einem veralteten `ACTIVE`-Status weiter.
**Problem (b):** `handleSubscriptionUpdated` wertet nur `if (updated && updated.status === 'PAST_DUE')` bzw. `'ACTIVE'` aus. Bei `updated === null` (Subscription unbekannt) passiert **nichts** — kein Log, kein Alarm. Ein „verlorenes" erstes Update bleibt unsichtbar.
**Impact (Geld):** Edge-Case, aber im Abo-Betrieb real: Re-Checks könnten für eine eigentlich `past_due`-Subscription weiterlaufen (Leistung ohne Bezahlung) oder umgekehrt für eine wieder-aktive pausieren.
**Fix:** Bei `updated === null` in `handleSubscriptionUpdated` einen `sendAlert` feuern *und* den Status-Wechsel zwischenpuffern (z.B. Pending-Map, die `recordSubscription` beim Anlegen konsultiert), oder `markSubscriptionStatus` so umbauen, dass es bei unbekannter Sub einen Platzhalter-Record mit dem Stripe-Status anlegt statt zu verwerfen.
**Already-covered?** Nein — neu. (M1 betraf Last-Write-Wins bei *bekannten* Records, nicht das „Event-vor-Anlage"-Ordering.)

---

### 🟠 H3 — Kein Status-Guard gegen paralleles Webhook-Fulfillment + Resend
**Location:** `scanner/app.js:436-468` (Resend), `app.js:131-154` (Webhook-Fulfillment), `scanner/lib/orders.js:70-77` (`markStatus`, kein Lock)
**Problem:** Der Resend-Endpoint prüft `if (order.status === 'MAILED' || 'RESENT') return 409` (Z442) — gut. Aber zwischen diesem Check und dem `markStatus('RESENDING')` (Z445) liegt kein Lock. Ein gleichzeitig eintreffender Webhook-Retry, der C1 auslöst, kann parallel fulfillen. `markStatus` selbst ist read-modify-write ohne Serialisierung (Last-Write-Wins). Praktisch selten (Resend ist manuell), aber im genau-falschen-Moment → Doppel-Mail.
**Impact:** Doppel-Auslieferung + (über C2-Mechanik) zusätzliche Rechnungsnummer.
**Fix:** Status-Writes pro `sessionId` serialisieren (Promise-Queue je Key in `orders.js`) und den Resend-Guard + `RESENDING`-Markierung atomar machen (compare-and-set). C1-Fix entschärft die Webhook-Seite bereits deutlich.
**Already-covered?** Teilweise — M1 beschrieb die Last-Write-Wins-Race generisch; der konkrete Resend×Webhook-Doppelpfad ist hier präzisiert.

---

### 🟡 M1 — Invoice-Counter nur In-Process serialisiert (Multi-Prozess weiterhin offen)
**Location:** `scanner/lib/invoice.js:42-64`
**Problem:** Der `counterLock`-Promise-Mutex (Z42-49) serialisiert `nextInvoiceNumber` korrekt **innerhalb eines Prozesses** — der Test `invoice.test.js:109` (20 parallele Allokationen, lückenlos) bestätigt das. Aber der Header behauptet weiterhin „**mit Flock-Schutz**" (Z6), obwohl es **kein** Datei-Lock gibt. Bei horizontaler Skalierung (>1 App-Container, geteiltes `out/`-Volume) lesen zwei Prozesse denselben `seq` → Doppel-Nummer.
**Impact:** Aktuell unkritisch (1 Container laut compose). Wird zur Zeitbombe bei Skalierung. Irreführender Kommentar verschleiert das.
**Fix:** Header korrigieren (In-Process-Mutex, kein Flock) **oder** echtes `O_EXCL`-Lockfile/SQLite-Sequence ergänzen, bevor skaliert wird.
**Already-covered?** Ja — **F2**, In-Process-Teil **gefixt** (PR #24), Multi-Prozess + Kommentar **offen**.

---

### 🟡 M2 — Mail-Throw nach Invoice-Erzeugung lässt Order FAILED trotz gültiger Rechnung
**Location:** `scanner/app.js:139-156`
**Problem:** Hängt mit C2 zusammen, aber eigener Aspekt: Schlägt nur der **Mailversand** fehl (Report + Invoice wurden korrekt erzeugt), wird der Order als `FAILED` markiert. Die Rechnung existiert physisch (`out/invoices/RE-...pdf` + Log), wird aber nirgends mit dem Order verknüpft (siehe C2). Der Order-Record suggeriert „nichts erzeugt", obwohl GoBD-relevante Artefakte auf Disk liegen.
**Impact:** Daten-Inkonsistenz; manuelle Nachverfolgung erschwert; Doppel-Rechnung bei Resend (C2).
**Fix:** Identisch zu C2 — Invoice-Metadaten im FAILED-Record persistieren.
**Already-covered?** Nein — neu.

---

### 🟡 M3 — `scanSite` Queue unbeschränkt → Memory-Spike auf Riesen-Sites
**Location:** `scanner/lib/scan.js:119-135`
**Problem:** Pro besuchter Seite werden **alle** same-origin-Links in `queue` gepusht (`if (!visited.has(l) && !queue.includes(l)) queue.push(l)`). `visited.size < maxPages` begrenzt nur die **besuchten** Seiten (Default 5, Profi 25), nicht die **Queue-Länge**. Eine Seite mit 5.000 internen Links füllt die Queue mit 5.000 Einträgen, obwohl nur 25 abgearbeitet werden. `queue.includes(l)` ist zudem O(n) pro Link → O(n²) bei großen Linklisten.
**Impact:** Memory + CPU-Spike pro Scan auf großen Seiten; im Concurrency-Gate (2 parallel) addiert. Kein Absturz bei normalen KMU-Seiten, aber unnötig.
**Fix:** Queue nach `maxPages` cappen und ein `Set` für Dedup statt `Array.includes` nutzen:
```js
const queued = new Set([startUrl]);
// beim Push: if (queue.length + visited.size < maxPages * 3 && !queued.has(l)) { queue.push(l); queued.add(l); }
```
**Already-covered?** Teilweise — L7 nannte fehlende Priorisierung/Fallback, nicht das Queue-Wachstum.

---

### 🟡 M4 — Abo-`cycleAmount`-Fallback `?? 0` erzeugt 0-€-Rechnung
**Location:** `scanner/app.js:210-211`
**Problem:** `const cycleAmount = inv.amount_paid ?? inv.total ?? 0;` — fällt im schlimmsten Fall auf `0` zurück. `safeGenerateInvoice(..., amount: 0)` → `generateInvoicePdf` rendert eine Rechnung über **0,00 €** mit fortlaufender Nummer.
**Impact (GoBD):** Eine 0-€-Rechnung mit echter Nummer ist sachlich falsch und erklärungsbedürftig. Greift nur bei `ENABLE_ABO=true` und wenn Stripe weder `amount_paid` noch `total` liefert (unwahrscheinlich, aber kein Guard).
**Fix:** Bei `cycleAmount <= 0` keine Eigen-Rechnung erzeugen, sondern `sendAlert` (manuell prüfen) und auf die Stripe-Invoice verweisen.
**Already-covered?** Nein — neu.

---

### 🟢 L1 — Test-Suite bricht ohne installierte Dependencies (Playwright-Importkette)
**Location:** `scanner/test/invoice.test.js`, `scanner/test/mailer.test.js`
**Problem:** Beide Tests importieren `lib/invoice.js` bzw. (transitiv) `lib/mailer.js`; `invoice.js:10` macht `import { chromium } from 'playwright'`. Ohne `npm install` (kein `node_modules` in diesem Workspace) → `ERR_MODULE_NOT_FOUND: playwright`, beide Suites schlagen beim Laden fehl. `diff/webhook/report`-Tests laufen grün (keine Playwright-Kette). **Auf dem Server mit installierten Deps passieren beide** — es ist ein reines Umgebungs-Artefakt dieses Review-Sandbox, **kein Code-Bug**. Hinweis dennoch: `invoice.js` zieht Playwright auf Modul-Ebene, obwohl nur `generateInvoicePdf` es braucht → Tests, die nur `renderInvoiceHtml`/`nextInvoiceNumber` prüfen, schleppen die schwere Dependency mit.
**Fix (optional):** `chromium` lazy importieren (`const { chromium } = await import('playwright')` innerhalb `generateInvoicePdf`), dann sind die reinen HTML/Counter-Tests dependency-frei.
**Already-covered?** Nein — neu (Testbarkeits-Hinweis).

---

### 🟢 L2 — `/api/scan`-Cache nutzt `clear()` statt Eviction
**Location:** `scanner/app.js:284-307`
Bei `cache.size >= 500` → `cache.clear()` (kompletter Reset statt LRU). Funktional korrekt (Bound eingehalten), nur leicht ineffizient. **Already-covered?** Ja (L2).

---

### 🟢 L3 — `diffSummaryText` Null-Arithmetik bei fehlendem `prevScore`
**Location:** `scanner/lib/diff.js:97`
`d.score - d.prevScore` wird im Nicht-`firstScan`-Pfad gerechnet. `firstScan` ist der einzige Pfad, der `prevScore: null` setzt, und der wird oben abgefangen (Z92) — also aktuell unerreichbar. Aber: kommt je ein `diff`-Objekt mit `firstScan:false` und `prevScore:null` durch (z.B. korrupter Snapshot ohne `score`), zeigt die Mail `NaN`. Defensive: `const delta = d.score - (d.prevScore ?? d.score);`. **Already-covered?** Nein — neu, niedrigste Priorität.

---

## Test-Coverage-Lücken (speziell Zahlungspfad)

Vorhandene Coverage ist für ein Solo-Projekt stark: `claimEvent`-Race (10 parallele Claims), Status-Übergänge PAID→…→RESENT, Subscription-Lifecycle inkl. past_due-Recovery, Invoice-Sequenz + 20-parallel-Race + USt-Modi + XSS, Mailer-Attachment-Wiring + Empfänger-Validierung. **Aber es fehlt für den Geld-Pfad:**

1. **Kein Test für C1** — kein Test, dass eine bereits gefulfillte Session bei erneutem Trigger (anderer event.id) **nicht** doppelt ausgeliefert wird. Höchste Lücke.
2. **Kein Test für C2** — kein Test, dass FAILED→Resend **dieselbe** Rechnungsnummer wiederverwendet (statt einer zweiten).
3. **`handleInvoicePaid`/`handleSubscriptionUpdated` sind ungetestet** — die gesamte Abo-Webhook-Logik (`app.js:182-261`) hat **keinen** Test. Die E2E-Tests prüfen nur die `orders.js`/`subscriptions.js`-Primitive isoliert, nie die Handler. Das deckt sich mit „Abo nicht load-getestet" — vor `ENABLE_ABO=true` sind Handler-Tests Pflicht.
4. **Kein Test für den `fulfillOrder`-Throw → FAILED + Alert-Pfad** (nur die `markStatus`-Übergänge manuell, nicht der Handler-`catch`).
5. **`safeGenerateInvoice`-Fehlerpfad ungetestet** — was passiert, wenn Invoice wirft aber Report-Mail klappt (Order MAILED ohne invoiceNumber).

**Hinweis Abo allgemein:** `ENABLE_ABO=false` ist korrekt der sichere Default. Die obigen H1/H2/M4 + Coverage-Lücke 3 bestätigen: **Der Abo-Webhook-Pfad ist nicht produktionsreif** und darf erst nach Handler-Tests + Stripe-CLI-Replay (`stripe trigger invoice.paid`) auf der gepinnten API-Version 17.5.0 aktiviert werden.

---

## Was nachweislich GUT ist (nicht ändern)

- **Server-seitige Preis-Autorität:** `s.amount_total` kommt aus der server-erzeugten Session (`unit_amount: PACKAGES[pkg].amount`), kein Client-Trust. Kein Manipulationsvektor.
- **Zahlung-vor-Erzeugung:** `recordPaid` (Status PAID) läuft **vor** Scan/PDF/Mail — keine Zahlung geht verloren, FAILED ist nachlieferbar.
- **Webhook-Architektur:** roher Body vor `express.json`, sofortiges 200-Quittieren + async-Arbeit, Signatur-Verifikation, `payment_status==='paid'`-Check.
- **`claimEvent`** ist eine saubere synchrone Check-and-Set-Atomarität gegen die event.id-Race (F1 korrekt behoben + getestet).
- **`safeGenerateInvoice`** kapselt Invoice-Fehler korrekt: Report-Auslieferung (das bezahlte Produkt) hat Vorrang, Invoice-Fehler blockiert nicht.
- **SSRF-Guard** (`url-guard.js`): v4/v6, IPv4-mapped, CGNAT, Cloud-Metadaten, Creds-in-URL — gründlich, getestet.
- **Playwright-Lifecycle:** `try/finally { await browser.close() }` in allen drei Scan-Funktionen + `fulfill.js` + `invoice.js` — **keine Browser-Leaks gefunden**. `page.close().catch(()=>{})` im Crawl-Loop ist resilient.
- **Fail-fast** (`requireMailerOrExit`) + `isStripeLive()` erkennt `rk_live`.

---

*Read-only-Review. Keine Quellcode-Änderung, kein Deploy, keine Live-Calls. `node --check` für alle 13 Libs grün; `node --test`-Subset (diff/webhook/report) grün, invoice/mailer nur wegen fehlender `node_modules` im Sandbox rot (L1, kein Code-Bug). Unsichere/versionsabhängige Punkte (H1 Stripe-Feldpfad, H2 Event-Ordering) sind als solche markiert und brauchen Verifikation gegen die reale Stripe-API 17.5.0.*
