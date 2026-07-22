# Bauplan & Status — BFSG-Check (God-Mode-Build)

**Stand:** 15.06.2026 · Alles in PR #45. Dies ist der Gesamt-Bauplan: was steht, wie es zusammenhängt, was noch fehlt.

## Architektur (alles gebaut & getestet ✅)

```
                    ┌─────────────────────────────────────────┐
   Besucher  ──►    │  Landingpage (schön, Hero-Bild, FAQ)     │
                    │  landingpage/index.html                  │
                    └───────────────┬──────────────────────────┘
            Gratis-Check            │            Kauf
                    ▼               │               ▼
        GET /api/scan (Teaser)      │     Bestell-Dialog (B2C/B2B + Widerruf-Consent
        Rate-Limit + SSRF-Guard     │     + „Zahlungspflichtig bestellen")
                    │               │               │
                    ▼               │               ▼
   ┌────────────────────────┐       │     POST /api/checkout ──► Stripe Checkout
   │ Engine (Playwright)     │       │               │
   │ • scan.js  (BFSG/axe)   │◄──────┘               ▼
   │ • scan-cookie.js (TDDDG)│             Stripe-Webhook /webhook
   │ • report.js (HTML+PDF)  │             (Signatur + Idempotenz + payment_status)
   └────────────────────────┘                       │
                                          fulfill.js ▼ (Scan → PDF → Mail)
                                          + Order-Persistenz + Betreiber-Alarm
```

## Produkte (auf einer Engine)
| Produkt | Status | Datei |
|---|---|---|
| **BFSG-Fix-Plan** (199/499 €) — Report + Checkliste + Erklärung-Vorlage | ✅ getestet | `scan.js` + `report.js` |
| **Multi-Page-Crawl** (Basis 5 Seiten / Profi 25 Seiten, same-origin BFS) | ✅ Welle 2 | `scan.js#scanSite` + `fulfill.js#PKG_CONFIG` |
| **Cookie/Consent-Scan** (49 / 79 €, § 25 TDDDG) — eigener Checkout + Landing-Sektion | ✅ Welle 2 | `scan-cookie.js` + Pakete `cookie-basis`/`cookie-profi` |
| **Re-Check-Abo** (49 €/Mon, MRR) — `invoice.paid`→Re-Scan+Diff, `customer.subscription.deleted`→Bestätigung | ✅ Welle 2 (per `ENABLE_ABO=true` scharfgeschaltet) | `subscriptions.js` + `diff.js` + `app.js` |
| White-Label-/Agentur-Reseller, Embeddable Widget | ⏳ Welle 3 | `EXPANSION-ROADMAP.md` |

## Sicherheit & Recht (Code-Seite ✅)
SSRF-Guard · Rate-Limit · Concurrency-Cap · Webhook-Idempotenz · Bestell-Persistenz + Alarm · Fail-fast · Checkout-Compliance (Button/Widerruf-Consent/B2C-B2B) · Widerruf-/Kündigungs-Seiten · Rechtstext-Vorlagen · ehrliches Framing (keine Konformitätsgarantie) · Cold-Mail gesperrt.

## Konnektoren genutzt
- **Higgsfield** → Hero-Bild generiert (`landingpage/assets/hero.png`).
- **Notion** → „BFSG-Check — Launch & Ops Board" angelegt (dein Workspace).
- **Stripe** → Code fertig; OAuth/Keys trägst du ein.
- **Gamma/Canva** → bereit für Partner-Seiten/Assets (nächste Welle).

## Was NUR du / ein Anwalt kann (nicht automatisierbar)
Siehe `SCHNELL-LIVE.pdf` (kinderleichter 48–72-h-Plan) + `REVIEW-PRE-MORTEM.md` (§ B).

## Reviews
Jeder Bauschritt wurde von einem separaten Review-Agenten geprüft (Code, Security, Betrieb, Recht, Markt). Ergebnisse + Fixes: `REVIEW-PRE-MORTEM.md`. Cookie-Scanner-Review: laufend.
