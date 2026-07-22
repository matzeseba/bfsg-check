# Umsetzungsplan — Audit-Remediation (02.07.2026)

> Quelle: 10-Agenten-Vollaudit (Technik + Business) vom 02.07.2026.
> Status: **Plan — wartet auf Owner-Freigabe.** Nichts davon ist umgesetzt.
> Drei offene Owner-Entscheidungen siehe unten (§ „Offene Entscheidungen").
>
> ---
> ⚠️ **Status-Korrektur (22.07.2026):** Die Status-Zeile oben ist historisch. Inzwischen längst gemergt:
> **S2/PR3** (`SCAN_PAID_LENIENT_TLS` / LENIENT_TLS), **S4** (nodemailer 9.0.3) und **PR4** (anthropic-sdk).
> Der aktuelle Fortschritt lebt in `docs/BLUEPRINT-NEXT-SESSION.md` — der Inhalt unten bleibt als
> historischer Plan unverändert.

---

## SOFORT (Launch-Blocker) — Reihenfolge = Umsetzungsreihenfolge

### S1 — Claim „menschliche Sichtung" auflösen (§5-UWG) ⚠️ ENTSCHEIDUNG NÖTIG
- **Fund:** LP verkauft „menschlich geprüft" (`landingpage-next/lib/config.ts` Z.41/76/84/187/326/359–371/421/466, `components/CheckoutModal.tsx:143`), Report geht aber voll-automatisch raus (`scanner/lib/fulfill.js` → `sendReportFor`, kein Freigabe-Gate).
- **Optionen (Owner wählt):**
  - **A) Feature bauen:** `REQUIRE_OWNER_RELEASE=true` + verzögerter Release; Claim bleibt wahr, „innerhalb 1 Stunde" muss weichen.
  - **B) Copy entschärfen:** „menschliche Sichtung" → „KI-gestützt + stichprobenartige Kontrolle". Schnell, schwächeres Trust-Argument.
  - **C) Kombi:** PR4-KI-QA aktivieren (`ANTHROPIC_API_KEY` + `REPORT_QA_ENABLED=true`) + Copy als „automatisierte Qualitätsprüfung" präzisieren.
- **Verify:** `legal-copy-grep` clean auf geänderten Dateien; kein Widerspruch „automatisch" ↔ „menschlich geprüft".

### S2 — Bezahlten Scan entsperren (strikt-TLS) ⚠️ PROD-AKTION
- **Fund:** `scanner/lib/fulfill.js:71-92` — `SCAN_PAID_LENIENT_TLS` Default false → SMB-Seiten mit Cert-Eigenheiten scheitern beim Kauf (der eine reale Testkauf ist daran gescheitert). Code ready.
- **Aktion:** `SCAN_PAID_LENIENT_TLS=true` in `/opt/bfsg-check/deployment/.env` + `docker compose up -d --build`. SSRF-/DNS-Rebinding-Schutz bleibt orthogonal aktiv.
- **Verify:** Testkauf gegen matthias-seba.de (bzw. www-Fallback) liefert Report; `docker compose logs app | grep -i scan` ohne „kein verwertbares Ergebnis".

### S3 — DSGVO Art. 17 echt implementieren (Bußgeldrisiko)
- **Fund:** `scanner/lib/dsgvo.js:130-143` hängt nur Tombstone an; Klartext-PII bleibt in `orders.jsonl`/`subscriptions.jsonl` + weiter über `GET /admin/orders` (`app.js:777`) abrufbar.
- **Aktion:** Echte Redaction der Originalzeilen (Rewrite/Compaction) in `orders.js`/`subscriptions.js`; `listOrders()` muss redigierte Records liefern. Kommentar in `deleteUserData` an die Realität anpassen.
- **Verify:** Neuer Test — nach `deleteUserData` liefert `listOrders()`/Admin-API keine Klartext-PII mehr; Export-Endpoint konsistent.

### S4 — nodemailer patchen (bekannte CVEs)
- **Fund:** `scanner/package.json:21` `nodemailer 6.10.1` (DoS CVSS 7.5, „unintended domain").
- **Aktion:** auf `>=8.0.8` heben, `npm install`, Mailer-Tests + `mail-retry`/`mailer` grün.
- **Verify:** `cd scanner && npm test` (164+), `npm audit` ohne high in nodemailer.

## DIESE WOCHE (Qualität & Conversion)
- **W1** Cookie-Profi 69€ = Basis 39€ identisch → `fulfill.js:79-85` Multipage bauen ODER Preis/Copy angleichen (§5).
- **W2** Preis-Divergenz bereinigen: `marketing/OFFER.md` + `pricing-experiments.md` (199/499) vs. Live 129/399 (`CLAUDE.md`).
- **W3** `/api/resend?force=true` implementieren (`app.js:802-906`, aktuell hart 409).
- **W4** supertest-`/webhook`-Test (Vorbild `resend.api.test.js`) + Frontend-Smoke-Test — größte Testlücke, VOR weiteren `app.js`-Merges.
- **W5** Security: IPv6-SSRF-Bypass (`url-guard.js:27-36`, 6to4/NAT64) + Admin-Rate-Limits (`app.js:777/788/802`).
- **W6** Sentry-Status in `/health` (`app.js:732`) + verifizieren, dass Error-Tracking live läuft (`sentry.js:6-11`).
- **W7** Stripe (Owner, 1 Min): Event `customer.subscription.updated` abonnieren.
- **W8** Hero-Conversion 3 Fixes: zweite Vorschau-Überschrift entschärfen (`Hero.tsx:203-216`), Subline kürzen (`config.ts:75`), Urgency-Pill entklicken + Frist-Wiederholung halbieren (`Hero.tsx:75-88`).
- **W9** Gründer-Block + Beispiel-Report an Pricing + aggregierte Scan-Zahlen als Social-Proof (`scan-dataset-aggregat`).

## VOR DEM DESIGN-OVERHAUL (strukturell)
- Motion-Duplizierung → Atome: `<SectionHeading>` (6×), `lib/motion.ts` mit `EASE`+Varianten (8×), `<Reveal>`, `<CtaButton>` (7×).
- Ambient-Animationsdichte reduzieren (Motion-Audit vor Scroll-Layer).
- `scanner/app.js` (989 Z.) in Route-Module splitten + Webhook/Resend-Fulfillment teilen.
- Client/Server-Schnitt für `TrustSection`/`Footer`.

## STRATEGISCHE PRIORITÄTEN
- **Inbound-Partnerprogramm Webagenturen** (`/partner` + Affiliate `?ref=` + Verzeichnis-Listing) — schnellster+günstigster Kanal (~150$ CAC), constraint-konform (Pull).
- **Abo → Jahresplan ~390€/Jahr** („Audit + 12 Monate Überwachung") — löst 1:1-LTV:CAC.
- **BFSG-Score-Badge** (dofollow-Backlink, rechtssichere Wortwahl) — Viralität + SEO + AEO.
- **Positionierung:** „echtes Audit statt Overlay" + Rechtssicherheits-Report statt „Scanner".
- **Value-Prop-Lücke:** Pain-Aktivierung oben + Social Proof unten + Profi-399-Anker.
- **Bing-first Long-Tail-Exact** als Cashflow-Motor, CPA-Cap 177€.

## BACKLOG
Chromium non-root/Sandbox · mem_limits landing/admin/caddy · Job-Queue statt fire-and-forget · Browser-Reuse statt 3× Launch · JSONL→DB · admin-next Auth-Gate · mailer-Duplizierung · 2. Uptime-Monitor · UI-Deps pinnen · WP-Plugin/Chrome-Ext · CMS-API.

---

## Offene Entscheidungen (Owner)
1. **Claim-Fix (S1):** Option A / B / C?
2. **Server-Zugriff (S2 u.a.):** Claude setzt .env selbst per SSH — ODER Owner führt Runbook aus?
3. **Reihenfolge:** Erst 4 SOFORT-Blocker — ODER parallel 1 Blocker + `/partner`-Seite?
