# Barrierefrei-Prüfen — Die „Compliance-Cash-Maschine"

Automatisiertes Geschäftssystem, das deutsche Websites gegen das
**Barrierefreiheitsstärkungsgesetz (BFSG)** prüft und den Mängel-Report als
Produkt verkauft. Faceless, KI-/automatisierungsgetrieben, DACH-Pflichtmarkt.

> Strategie & Begründung: siehe `../businessplan-passives-einkommen-v2-speed-scale.md` (§3).

> ## ⚠️ Stand nach Pre-Launch-Review & Pre-Mortem (15.06.2026)
> Ein 5-Säulen-Review (Technik, Security, Betrieb, Markt, Recht) ergab **NO-GO für „sofort live"**. Befunde + Maßnahmen: **`REVIEW-PRE-MORTEM.md`**.
> - **Technische Blocker:** ✅ alle behoben & getestet (SSRF, Rate-Limit, Idempotenz, Bestell-Persistenz, Fail-fast u. a.).
> - **Produkt-Pivot:** ✅ umgesetzt — Gratis-Scan = Lead-Magnet, verkauft wird der **KI-gestützte + menschlich geprüfte Fix-Plan** (keine Konformitätsgarantie).
> - **Compliance (Code-Seite):** ✅ Checkout-Dialog (B2C/B2B + Widerruf-Consent + „Zahlungspflichtig bestellen"), Widerruf-/Kündigungs-Seiten (§356e/§312k), Rechtstext-Vorlagen.
> - **Cold-Mail:** ❌ als Rechts-Blocker (UWG §7) gesperrt → Opt-in-Funnel/Ads.
> - **Noch offen (Mensch/Anwalt):** Anwalts-Freigabe der Rechtstexte, Platzhalter füllen, Stripe-Steuer/Webhook + Live-Testkauf, Vermögensschaden-Haftpflicht, Cookie-CMP, E-Mail-Deliverability. **Realistischer Live-Gang: ~1–2 Wochen.**

## Was schon gebaut & getestet ist ✅

| Baustein | Datei | Status |
|---|---|---|
| **Scanner** (axe-core/WCAG 2.1) | `scanner/lib/scan.js` | ✅ läuft |
| **Deutscher Regel-Katalog** (Klartext + Lösung) | `scanner/lib/rules-de.js` | ✅ |
| **Report-Generator** (HTML + PDF, Score, Befunde) | `scanner/lib/report.js` | ✅ getestet |
| **Barrierefreiheitserklärung-Generator** | `scanner/lib/statement.js` | ✅ |
| **CLI-Orchestrator** | `scanner/audit.js` | ✅ getestet |
| **Gratis-Teaser-Scan-Server** (Landingpage-API) | `scanner/server.js` | ✅ getestet |
| **Akquise-Automation** (personalisierte Cold-Mail aus echten Befunden) | `scanner/outreach.js` | ✅ getestet |
| **Verkaufs-Server** (Stripe-Checkout + Webhook) | `scanner/app.js` | ✅ getestet |
| **Auto-Erfüllung** (Zahlung → Report-PDF automatisch) | `scanner/lib/fulfill.js` | ✅ getestet |
| **Auto-Versand** (Report per E-Mail, SMTP) | `scanner/lib/mailer.js` | ✅ getestet (Dry-Run) |
| **Landingpage** (Gratis-Check + Kauf-Buttons + Danke-Seite) | `landingpage/` | ✅ |
| **Angebot/Preise** | `marketing/OFFER.md` | ✅ |
| **Cold-E-Mail-Sequenz** | `marketing/cold-email-sequence.md` | ✅ |
| **Google-Ads-Kampagne** | `marketing/google-ads.md` | ✅ |
| **Recht/Compliance** | `legal/disclaimer.md` | ✅ |

## Schnellstart

```bash
cd scanner
npm install            # installiert Playwright + axe-core, lädt Chromium

# Einzelnen Report erzeugen (HTML + PDF + Barrierefreiheitserklärung):
node audit.js https://kunde-website.de --company "Kunde GmbH" --pdf

# Kostenlosen Teaser (JSON) — für die Landingpage:
node audit.js kunde-website.de --teaser

# Voller Verkaufs-Server (Landingpage + Gratis-Scan + Stripe + Auto-Versand):
cp .env.example .env     # Stripe-Keys + SMTP eintragen
npm start                # -> http://localhost:8080  (node app.js)

# Nur Landingpage + Gratis-Scan ohne Verkauf:
node server.js           # -> http://localhost:8080

# Personalisierte Akquise-Mail aus echten Befunden:
node outreach.js kunde-website.de

# Akquise im Batch (Liste von URLs):
cat zielkunden.txt | node outreach.js --batch
```

Ergebnisse landen in `scanner/out/` (gitignored).

## So verdient die Maschine Geld

```
 Google-Ads / Cold-Mail (outreach.js)
        │
        ▼
 Gratis-Sofort-Check  (server.js + landingpage)   ← Lead-Magnet, 0 € Kosten
        │  "Score 48/100, 17 Mängel gefunden"
        ▼
 Vollreport 199 € / 499 €  (audit.js erzeugt PDF)  ← ~98 % Marge, KI-erstellt
        │
        ▼
 Re-Check-Abo 49 €/Monat                            ← wiederkehrender Umsatz (MRR)
```

5–10 Reports/Monat = 1.000–3.000 € · + Abos für planbaren MRR.

## Go-Live-Checkliste (was du noch tun musst)

**Diese Schritte brauchen einen Menschen / externe Konten — kann ich nicht für dich anlegen:**

- [x] ~~Gewerbe anmelden~~ ✅ erledigt
- [x] ~~Zahlungsanbieter~~ ✅ Stripe mit Geschäftskonto verbunden
- [ ] Domain kaufen (z. B. `bfsg-check.de`) + auf Container-Host deployen (Render/Railway/Fly/Hetzner — **nicht** Vercel-Serverless wegen Chromium; `Dockerfile` liegt bei).
- [ ] Im Hosting die Umgebungsvariablen setzen (`.env.example`): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SMTP_*`, `PUBLIC_URL`. **Keys nur dort eintragen, nie in Git/Chat.**
- [ ] Stripe-Webhook anlegen: Dashboard → Entwickler → Webhooks → Endpoint `https://DEINE-DOMAIN/webhook`, Event `checkout.session.completed` → Secret in `STRIPE_WEBHOOK_SECRET`.
- [ ] SMTP-Versand-Konto (Brevo/Postmark/SendGrid) für Report-Mails.
- [ ] Impressum, Datenschutz, AGB einsetzen (Platzhalter in `landingpage/index.html`) — echter Name/Adresse.
- [ ] Anwalts-Kurzcheck der Disclaimer + Cold-Mail-Strategie (`legal/disclaimer.md`).
- [ ] Traffic anschalten: Google-Ads-Konto (`marketing/google-ads.md`) **oder** Versand-Tool für Akquise.

**Optionale nächste Ausbaustufen (kann ich bauen, wenn du willst):**
- [x] ~~Zahlungs-Webhook → Auto-Report nach Kauf~~ ✅ gebaut (`app.js` + `lib/fulfill.js` + `lib/mailer.js`)
- [ ] Multi-Page-Crawl (mehrere Unterseiten je Report automatisch).
- [ ] Automatischer Re-Check-Cronjob für Abo-Kunden + Diff-Report.
- [ ] Zielkunden-Listen-Generator (Shops aus Branchenverzeichnissen → Batch-Scan → Akquise-Mails).

## ⚠️ Wichtig

- Reports sind **automatisierte Vorprüfung, keine Rechtsberatung** — nie „abmahnsicher" garantieren (siehe `legal/disclaimer.md`).
- Cold-E-Mail in DE ist rechtlich heikel → im Zweifel Google-Ads (Such-Intent) bevorzugen.
- Tech-Basis: Node.js ≥ 20, Playwright (Chromium), axe-core.
