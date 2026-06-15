# Pre-Launch-Review & Pre-Mortem — BFSG-Audit

**Datum:** 15.06.2026 · **Methode:** Spezialisten-Agenten-Team (Code, Security, Betrieb, Markt + 10 vertiefte Rechts-Recherchen) gegen den **echten Code** + tagesaktuelle Quellen.

## Gesamt-Verdikt: 🔴 NO-GO für „morgen live" in der ursprünglichen Form

Nicht weil die Idee schlecht ist — sondern weil **mehrere unabhängige Reviews dieselben Blocker** fanden. Die **technischen** Blocker habe ich bereits behoben (✅ unten). Die **rechtlichen** Blocker brauchen Entscheidungen + teils einen Anwalt und ein paar Tage — nicht 24 Stunden. Einer (Widerrufsbutton) ist sogar ein neues Gesetz, das **am 19.06.2026** in Kraft tritt.

---

## A) Technische Blocker — ✅ BEHOBEN & getestet

| # | Befund (Code/Security/Betrieb) | Fix | Status |
|---|---|---|---|
| 1 | **SSRF**: beliebige URL wurde headless geladen → interne Cloud-Metadaten (169.254.169.254) abrufbar | `lib/url-guard.js`: nur öffentliche http(s), private/link-local IPs geblockt; in `/api/scan` + Webhook | ✅ getestet |
| 2 | **Kein Rate-Limit / Concurrency** → DoS + OOM-Absturz unter Last | `lib/limits.js`: 5/min pro IP + max. 2 parallele Browser | ✅ getestet |
| 3 | **Bezahlt-aber-kein-Report** (Fehler verpuffte still) | `lib/orders.js`: Zahlung sofort persistiert (PAID→MAILED/FAILED) + Betreiber-Alarm + `resend`-Pfad | ✅ getestet |
| 4 | **Keine Webhook-Idempotenz** → Doppel-Reports bei Stripe-Retries | Dedup per `event.id` | ✅ getestet |
| 5 | **Dry-Run-Mailer als „Erfolg"** → Live ohne SMTP verkauft, aber liefert nicht | `requireMailerOrExit()`: Live-Stripe ohne SMTP = Start-Abbruch | ✅ |
| 6 | Keine `payment_status==='paid'`-Prüfung (SEPA-Risiko) | Webhook prüft Zahlstatus | ✅ |
| 7 | E-Mail-Header-Injection, `.md`-Anhang, kein Reply-To | Sanitisierung + Validierung + `.txt` + Reply-To | ✅ |
| 8 | Leerer/kaputter Report wird verkauft | Sanity-Check in `fulfill.js` (sonst FAILED + Alarm) | ✅ |
| 9 | Abo ohne Lifecycle (Folgemonate ohne Leistung) | Abo **standardmäßig deaktiviert** (`ENABLE_ABO`) | ✅ |
| 10 | `ignoreHTTPSErrors`, var-Scope-Bug, Header, Graceful Shutdown, Cache-Leak, Playwright-Pinning | alles gepatcht | ✅ |

**Noch offen (Betrieb, vor Werbung):** E-Mail-Zustellbarkeit (SPF/DKIM/DMARC, mail-tester ≥9/10), Uptime-Monitor auf `/health`, echter Stripe-Live-Testkauf inkl. Webhook-200, Instanz ≥1 GB RAM. Runbook im Review.

---

## B) Rechtliche Blocker — ⚠️ ENTSCHEIDUNG + ANWALT nötig (kein Code-Fix)

> Quellen-Konsens aus 10 Recherchen. **Keine Rechtsberatung** — Fachanwalt (Wettbewerbs-/IT-Recht) + Steuerberater vor Live zwingend.

| # | Blocker | Kern | Maßnahme |
|---|---|---|---|
| L1 | **Cold-E-Mail (`outreach.js`)** | § 7 UWG: B2B-Werbemail ohne Einwilligung unzulässig, schon 1 Mail abmahnbar (1.000–5.000 €) + DSGVO | **Streichen** → Opt-in-Funnel (Gratis-Self-Check, schon gebaut) oder Google-Ads. Tool jetzt mit Sperre versehen. |
| L2 | **Angst-Werbung** („bis 100.000 € droht") | § 5/§5a/§4a UWG: irreführend (Staffelung/Kleinstunternehmen verschwiegen) + aggressiv | **Faktisch entschärft** (Landingpage umformuliert). Ad-Texte nüchtern halten. |
| L3 | **„abmahnsicher/konform"-Versprechen** | macht aus dem Audit einen Werkvertrag mit Erfolgshaftung; FTC-Präzedenz: accessiBe 1 Mio. $ Strafe | **Nie versprechen.** Nur „automatisierte Erstprüfung". Als Dienstvertrag ausgestalten. |
| L4 | **Button-Lösung** | § 312j BGB: Stripe-Default-Button reicht nicht → sonst **kein gültiger Vertrag** | Checkout-Button „Zahlungspflichtig bestellen" + Pflichtinfos davor |
| L5 | **Widerrufs-Consent** | § 356 IV/V BGB: ohne Checkbox + § 312f-Mail kann B2C-Kunde nach Erhalt widerrufen → Report gratis + Geld zurück (EuGH C-97/22) | nicht-vorgehakte Checkbox + Bestätigungsmail + B2C/B2B-Abfrage |
| L6 | **Widerrufsbutton** | § 356e BGB **Pflicht ab 19.06.2026** (in 4 Tagen) für B2C-Online-Verträge | zweistufiger Button bauen |
| L7 | **Impressum** | § 5 DDG: echter Name + ladungsfähige Anschrift Pflicht (Postfach reicht nicht) | reale c/o-/Geschäftsadresse |
| L8 | **Datenschutz/Cookie** | Art. 13 DSGVO + Stripe-DPA + USA-Transfer; § 25 TDDDG: Consent vor Ads-Tracking | DSE + AVV + CMP (TCF 2.2) |
| L9 | **RDG** | individuelle Rechtsbewertung = unerlaubte Rechtsdienstleistung | nur technisch/Generator-Modus, keine Einzelfall-Rechtswürdigung |
| L10 | **Steuer/Stripe** | Stripe als KU auf „steuerbefreit"; § 19-Hinweis; EU-Verkäufe (OSS/Reverse-Charge) | Steuerberater + Stripe-Konfig; ggf. EU-KU-IdNr. |
| L11 | **EU AI Act** (ab 02.08.2026) | Chatbot muss sich als KI zu erkennen geben; menschliche Review dokumentieren | KI-Hinweis + Review-Vermerk |

---

## C) Geschäftliche Pre-Mortem (Markt)

- **Der Scan ist bereits ein Gratis-Gut** (BFSGuard, Eye-Able, WAVE, axe — alle kostenlos). „Warum 199 € zahlen?" ist die Kernfrage.
- **Auto-Scan findet nur ~30–50 %** aller Barrieren → Vertrauens-/Haftungslücke + Chargeback-Risiko.
- **Conversion 4–6 % war zu optimistisch** (real eher 0,5–2 %); bei Paid-Ads kann CAC > Umsatz werden.
- **Echte Marge eher 40–60 %**, nicht 95 % (Stripe-Gebühren, Refunds, Support).

**→ Empfohlener Pivot (rettet das Modell):**
1. **Auto-Scan = kostenloser Lead-Magnet** (nicht das Produkt).
2. **Verkauft wird der menschlich kuratierte Fix-Plan + Barrierefreiheitserklärung-Vorlage** — das, was Gratis-Tools NICHT liefern. (Bricht „>90 % KI / null Aufwand" — das ist der Preis fürs Überleben & für die Haftungssicherheit.)
3. **Ehrliches Framing**, kein Angst-Verkauf, keine Konformitätsgarantie.
4. **Unit Economics zuerst mit ~200–300 € Test-Budget beweisen**, dann skalieren.

---

## D) Ehrliches Fazit

Das System ist technisch jetzt **deutlich sicherer und zuverlässiger** (alle Code-Blocker behoben & getestet). Aber **„morgen live" ist nicht verantwortbar**, solange L1–L7 nicht geklärt sind — vor allem Cold-Mail raus, Button/Widerruf/Impressum/Datenschutz rechtskonform, und ein Anwalts-Kurzcheck. Realistischer, seriöser Live-Termin: **~1–2 Wochen** (Anwalt + Rechtstexte + Checkout-Compliance + Deliverability), mit dem Produkt-Pivot als Fundament.

Genau dafür war dieses Review da: **teure Fehler VOR dem Start zu verhindern, nicht danach.**
