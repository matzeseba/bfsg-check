# Launch — 3-Spalten-Plan (KORRIGIERT auf echten main-Stand)

> Erstellt: 2026-06-26 | Re-grounded auf `origin/main` (#65) + `docs/AUDIT-LAUNCH-READINESS-2026-06.md` + aktuelle Go-Live-Checkliste im Handover.
> **Korrektur ggü. erster Fassung:** Die erste Analyse basierte auf dem veralteten 21.06.-Audit. Auf dem echten main sind **alle 6 P0-Code-Blocker bereits gemergt + live (PR #55)** und der `SCAN_TEASER_LENIENT_TLS`-Code ist live (PR #63). **Der Launch ist owner-gegated, nicht mehr code-gegated.**

## Kritischer Pfad HEUTE (echt)

Die Website ist **bereits deployed & grün** (`/health` ok, Stripe live, Mailer aktiv). „Go-Live" = Launch/Ads scharf schalten. Was real fehlt, sind **4 Owner-Server-/Konto-Schritte** — keine Code-Blocker mehr:

1. **Server-`.env`: Rechnungs-Pflichtangaben** setzen (§14 UStG) — sonst trägt jede Rechnungs-PDF einen Platzhalter. → Owner via SSH `bfsg`.
2. **Stripe-Live-Testkauf + Refund** (eigene Karte) — Pflicht vor echten Zahlungen/Ads. → Owner.
3. **SCAN_TEASER_LENIENT_TLS=true** im Server-`.env` + rebuild — schaltet den Gratischeck für SMB-Seiten mit unsauberem TLS frei (Code seit #63 live). → Owner via SSH.
4. **(optional) Newsletter aktivieren** — Brevo-Liste ✅ (von Claude angelegt) + DOI-Template + Server-`.env`-Keys. → Brevo-Teil Claude, Server-Teil Owner.

Erst danach: Ad-Konten fertig (Karte) → Kampagne → Spend. **Server-SSH geht laut CLAUDE.md nur vom Owner-Mac (Alias `bfsg`), NICHT aus der Sandbox.**

---

## Spalte 1 — Claude per Computer Use ausführbar (eingeloggte Session)

| # | Schritt | Prio | Status | Benötigt (Login/Entscheidung) |
|---|---|---|---|---|
| 1 | **Brevo: 3 Listen anlegen** (Kunden/Käufer #5, Newsletter-Abonnenten #6, Gratis-Scan-Leads #7) | P1 | ✅ **ERLEDIGT** | Brevo (war eingeloggt) |
| 2 | Brevo: Double-Opt-in-Template anlegen + aktivieren (für Newsletter A.4) | P2 | offen | Brevo eingeloggt |
| 3 | Google-Ads-Kampagne als pausierten Entwurf bauen | P1 | wartet | Konto fertig (Karte=Owner); Aktivierung=Owner nach Stripe-Test |
| 4 | Listings ausfüllen (SaaSHub/G2/OMR/Capterra/AlternativeTo/TrustRadius/SaaSworthy) | P2 | blockiert | Owner muss erst Account anlegen/einloggen; Submit=User-OK |
| 5 | Freie PMs ausfüllen (openPR/inar/firmenpresse) | P2 | offen | Portal-Session; Publish=User-OK |
| 6 | Recherchescout/HARO/W3C-WAI/barrierefreie-agenturen Profile | P2 | blockiert | Owner-Account; Submit=User-OK |
| 7 | Show-HN V1 posten (Di 18:00 CET) | P2 | offen | HN-Login, Karma>10; Post=User-OK |

## Spalte 2 — Nur Owner manuell (Server-SSH / Karte / Konto / Anwalt)

| # | Schritt | Prio | Blocker |
|---|---|---|---|
| 1 | **Server-`.env`: `INVOICE_FROM_NAME/_ADDRESS`, `VAT_MODE=kleinunternehmer`, `ADMIN_TOKEN`** (+ optional `SENTRY_DSN`) → rebuild → 1 Test-Rechnung prüfen | **P0** | **Ja** |
| 2 | **Stripe-Live-Testkauf 199 € + Refund**, Webhook→Scan→PDF+Rechnung+Mail prüfen | **P0** | **Ja** |
| 3 | **Server-`.env`: `SCAN_TEASER_LENIENT_TLS=true`** + rebuild + Verifikations-curls (kutenholz.de liefert JSON statt 502) | P0/P1 | teils |
| 4 | Newsletter-Server-`.env`: `BREVO_API_KEY/_NEWSLETTER_LIST_ID(=#6)/_DOI_TEMPLATE_ID/_DOI_REDIRECT_URL` | P2 | Nein |
| 5 | Google-Ads-Konto fertigstellen + Karte (nur Konto, keine Kampagne) | P0 (für Ads) | Ja (für Ads) |
| 6 | Bing/Microsoft-Ads-Konto + Karte | P1 | Nein |
| 7 | Listings-Accounts anlegen/einloggen (SaaSHub/G2/OMR/…) → danach füllt Claude | P2 | Nein |
| 8 | Conversion-Asset: Gründer-Foto + 1 Satz (für Gründer-Block) | P1 (Conversion) | Nein |
| 9 | Server-Härtung vor Ad-Skalierung (Bucket c): SSRF-Egress-Proxy+Pentest, Chromium non-root, Webhook-Idempotenz-Persist, async-SEPA — Live-Test/Server | P1 | Nein |
| 10 | Anwalts-5-Min-Sign-off Widerrufsbelehrung (optional, Privileg-Effekt) | P2 | Nein |

## Spalte 3 — Aus dieser Sandbox/Code machbar (Code/Repo/PR; Merge = Owner = Live-Deploy)

| # | Schritt | Prio | Status |
|---|---|---|---|
| 1 | **Beispiel-Report-PDF** (anonymisiert) aus `scanner/` erzeugen → `landingpage-next/public/` + Link (Hero/Pakete) — laut Handover einer der 2 stärksten Deal-Closer | P1 (Conversion) | vorbereitbar |
| 2 | **Mail-Retry (Audit P1#3)**: `sendMail` 3× Backoff + Mail-Try von Scan/Rechnungs-Try trennen — **noch NICHT umgesetzt**, verhindert FAILED-Order trotz fertigem Report | P1 | vorbereitbar (Live-Test ideal) |
| 3 | A11y A-03: ResultCard Farb-Punkt → lucide-Icon (WCAG 1.4.1) | P2 | ✅ gebaut, Branch `fix/launch-pflicht-landingpage`, Build grün (wartet auf Merge) |
| 4 | „Sofort sicher fixbar" P1/P2-Polish (Audit Bucket a): timingSafeEqual Admin-Token, isEmail am Checkout (P1), Cache-LRU, AxeBuilder-Timeout, maxQueue, REPLY_TO/Domain in .env.example | P2 | vorbereitbar |
| 5 | DSGVO-Compaction / Multi-Instance-Counter / Abo-Idempotenz-Persist | P1/P2 | meist Server-/Skalierungs-relevant (nach Launch) |

---

## Was bereits LIVE ist (nicht mehr offen — Korrektur)

PR #55 (Launch-Readiness) + #63 (Gratischeck-Reliability) haben gemergt: **alle 6 P0** (SSRF-Guard, §14-ENV-Platzhalter, Rate-Limit `req.ip`, Resend-Doppelrechnung, Light-Fokus-Ring, networkidle-Fallback), die Legal-Copy-P0s („BFSG-konform" raus, Cookie-2-Button-Balance), MotionConfig-A11y, SEO/JSON-LD-Split, Perf/CWV, sowie der `SCAN_TEASER_LENIENT_TLS`-Code. Die erste Fassung dieser Liste (auf 21.06.-Audit-Basis) listete diese fälschlich als offen.

## Hinweis Kapazitätsgrenze

Server-SSH (`bfsg`) + Karten-/Kontodaten = immer Owner. Code-Merge auf main = Live-Deploy = nur Owner. Finaler Listing-Submit / PM-Publish / Ad-Spend = pro Aktion User-OK. Claude bereitet alles bis zum Gate vor.
