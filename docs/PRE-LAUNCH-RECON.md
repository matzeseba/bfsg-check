# Pre-Launch RECON (W0)

**Stand:** 2026-06-16 ~22:50 UTC | **Branch:** `claude/pre-launch-sprint` (sync'd auf `origin/main@fad6cb3`)

## Live-Server-Status

```
GET https://bfsg-fix.de/health → {"ok":true,"stripe":true,"live":false,"mailer":"aktiv (SMTP konfiguriert)","aboEnabled":false}
```

- **HTTPS Phase 2:** ✅ (HSTS, TLS 1.3, HTTP/2, alt-svc:h3)
- **Alias-Redirects 301:** ✅ alle 3 (bfsg-barrierecheck.de, bfsg-sofortcheck.de, barrierefrei-pruefen.de)
- **Stripe Webhook:** ✅ konfiguriert auf `https://bfsg-fix.de/webhook` (we_1Tj2cSGZo0zlerNSmtAAGqQM)
- **Brevo SMTP:** ✅ aktiv
- **Abo:** ❌ deaktiviert (ENABLE_ABO=false, korrekt für Pre-Launch)

## Bestätigte Bug-Liste (für W1-Welle)

### B1: `live:false` trotz `rk_live_*` Key (KRITISCH für Hard-Gate)
**Stelle:** `scanner/lib/mailer.js:40` + `scanner/app.js:299`
**Code:** `(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live')` — erkennt nur Secret-Keys, nicht Restricted-Keys
**Fix:** `startsWith('sk_live') || startsWith('rk_live')`
**Owner:** SECURITY-Agent (W1.A)

### B2: 6 npm Audit HIGH-CVEs
- nodemailer 6.9.16 → SMTP-Injection-CVEs
- playwright <1.55 → MITM bei Browser-Download
- express path-to-regexp → ReDoS
- qs → DoS
**Owner:** SECURITY-Agent (W1.A)

### B3: DNS-Rebinding ungeschützt
`url-guard.js` validiert DNS einmal, Playwright löst erneut auf. Angreifer kann zwischen Check und Goto auf localhost umstellen.
**Fix:** `chromium.launch({args:['--host-resolver-rules=MAP <host> <pinned_ip>']})`
**Owner:** SECURITY-Agent (W1.A)

### B4: Keine DSGVO-Endpoints
Kein `/api/dsgvo/export` (Art. 15), kein `/api/dsgvo/delete` (Art. 17).
**Owner:** BACKEND-DSGVO-Agent (W1.B)

### B5: Kein Auto-Retry bei Fulfillment-Fehler
„Bezahlt aber nicht geliefert" geht nur per Admin-Alert raus, kein `/api/resend/:id`.
**Owner:** BACKEND-DSGVO-Agent (W1.B)

### B6: Rechnungs-Fallback fehlt
Stripe-Receipts gehen via Stripe-Mail. Wenn die fehlschlägt → keine Rechnung beim Kunden.
**Owner:** BACKEND-INVOICING-Agent (W1.C)

### B7: UWG-bedenkliche Ads-Headlines
`marketing/google-ads.md`: „Bis 100.000 € Bußgeld vermeiden" + „Barrierefrei = abmahnsicher"
**Owner:** LEGAL-FILLER-Agent (W1.D)

### B8: outreach.js noch ohne Hard-Stop
Pre-Mortem fordert Sperre gegen UWG §7 Cold-Mails.
**Owner:** LEGAL-FILLER-Agent (W1.D)

### B9: Rechtstext-Platzhalter ungefüllt
`landingpage/impressum.html`, `agb.html`, `datenschutz.html`, `widerrufsbelehrung.html`.
**Owner:** LEGAL-FILLER-Agent (W1.D) → inventarisiert für Mensch-Pflicht

## Baseline-Tests

```
cd scanner && npm test  →  8/8 passing (diff + subscriptions Lifecycle)
```

## Branch-Strategie

- `pre-sprint-baseline` (Remote-Backup-Branch, Rollback-Anker auf `origin/main@fad6cb3`)
- `claude/pre-launch-sprint` (Working-Branch, alle Sub-Agent-PRs branchen davon ab)
- Pro Sub-Agent eigener Feature-Branch + PR
- Merge-Strategie: `--squash` über `gh pr merge --auto`

## Sub-Agent-Reihenfolge (zur Konfliktvermeidung in `scanner/app.js`)

Konflikt-Pfad: alle 3 Backend-Agenten editieren `scanner/app.js`. Daher **konsolidiert in 1 Agenten** `BACKEND-HARDENER` der W1.A+B+C+E sequenziell macht.

- **Welle Start (parallel):** BACKEND-HARDENER, LEGAL-FILLER, MARKETING-STRATEGIST, FRONTEND-SCAFFOLD, DEVOPS-BACKUP, DEVOPS-NETWORK
- **Welle 2 (nach BACKEND):** DEVOPS-OBSERVABILITY (logger-Integration in app.js), DASHBOARD-NOTION, DASHBOARD-NEXT
- **Welle 3 (nach FRONTEND-SCAFFOLD):** FRONTEND-COMPONENTS, FRONTEND-SEO, FRONTEND-DEPLOY
