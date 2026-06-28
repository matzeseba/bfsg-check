# Rebrand-Cutover-Runbook — „BFSG-Check" → „Barrierefrei-Prüfen"

> **Stand:** 28.06.2026 · **Branch/PR:** `rebrand/barrierefrei-pruefen`
> **Status:** Code-Rebrand fertig + verifiziert (scanner 142/142, `next build` grün, legal-copy-grep Baseline unverändert). **Live-Schritte unten kann nur der Owner ausführen.**

---

## Warum dieser Rebrand

Der Wettbewerber **`bfsg-check.de`** (Fast Forward IT GmbH, Düsseldorf) führt aktiv die Marke **„BFSG CHECK"** mit identischem Angebot. Unsere bisherige UI-Marke „BFSG-Check" war damit quasi deckungsgleich → reales Abmahn-/Verwechslungsrisiko (§5/§15 MarkenG, §5 UWG).

**Entscheidung (4-Agenten-Analyse, 28.06.2026):** neue Hauptmarke **„Barrierefrei-Prüfen"**, Hauptdomain **barrierefrei-pruefen.de**.
- **Recht:** einzige der 3 Kandidaten mit NIEDRIGEM Konfliktrisiko (enthält weder „BFSG" noch „check" → maximale Distanz zum Wettbewerber).
- **Marke/Conversion + SEO:** je Platz 1 (eigenständig, „prüfen" = auditieren statt „fix" = reparieren, Evergreen-SEO).
- **Trade-off:** „BFSG" entfällt in der Domain → wird über H1/Title/Pillar-Pages on-page kompensiert (BFSG bleibt überall als Gesetzes-Keyword erhalten).
- `bfsg-fix.de` **bleibt** als Domain (Redirect), wird aber nicht mehr als Marke genutzt.

---

## Was der Code-PR ändert (bereits erledigt, 71 Dateien)

| Bereich | Änderung |
|---|---|
| `landingpage-next/` | Marke „BFSG-Check"→„Barrierefrei-Prüfen", Domain→barrierefrei-pruefen.de (SITE, JsonLd, sitemap, robots, OG, layout-Metadata, alle Rechts- + SEO-Seiten). **„BFSG" als Gesetz/Keyword bleibt** (Titles, „BFSG-Checkliste", Paketnamen „BFSG-Report"). |
| `scanner/` | `FROM_NAME`, `FROM_EMAIL`-Default (war fälschlich `no-reply@bfsg-check.de` = **Wettbewerber-Domain**!), `INVOICE_CONTACT_EMAIL`, `PUBLIC_URL`-Default, legalFooter, DSGVO-Mail, kuendigen-URL, `.env.example`. Mail-Subjects mit „BFSG" (= Gesetz) **bleiben**. Tests 142/142. |
| `admin-next/`, `deployment/`, `.github/` | Anzeige-Texte, Caddyfile (neue Primär-Domain + `bfsg-fix.de` bleibt voll funktionsfähig, **kein blunter 301**), dns-records, .env-Defaults, CI-Health-Hinweise (cutover-gated). |
| `README.md`, `CLAUDE.md`, `marketing/`, `docs/legal-templates/`, legacy `landingpage/` | Marke/Domain/Mail. Wettbewerber-Nennungen + Keyword „bfsg check" **bleiben**. |

**Server-Pfad `/opt/bfsg-check/`, Docker-Volume-/Container-Namen (`bfsg-app` etc.) und der Repo-Name `bfsg-check` bleiben unverändert** (kein Domain/Marken-String).

---

## E-Mail-Identität (neue Domain)

| Zweck | Adresse |
|---|---|
| Öffentlicher Kontakt / Reply-To / Rechnung | `info@barrierefrei-pruefen.de` |
| Transaktions-Absender (send-only, Brevo) | `no-reply@barrierefrei-pruefen.de` |
| Betreiber-Alarm | `admin@` → tatsächlich `matze.seba@outlook.de` (Server-`.env`) |
| Rechts-Formulare (bestehendes Design) | `widerruf@`, `datenschutz@`, `kuendigen@barrierefrei-pruefen.de` |

➡️ **Einfachster Weg:** bei INWX (Mail-Easy) **eine Catch-all-Weiterleitung** `*@barrierefrei-pruefen.de → matze.seba@outlook.de` einrichten — deckt alle obigen Empfangs-Adressen mit einer Regel ab. `no-reply@` ist send-only (Brevo, kein Postfach nötig).

---

## LIVE-Schritte (nur Owner) — in dieser Reihenfolge

> Leitprinzip: `bfsg-fix.de` bleibt während der gesamten Umstellung voll funktionsfähig (Stripe-Webhook, /health, Traffic). Nichts bricht.

### Schritt 1 — DNS für die neue Domain (INWX) — ZUERST
Bei `barrierefrei-pruefen.de` → DNS auf den Server zeigen:
```
A     @    178.105.83.0          TTL 3600
A     www  178.105.83.0          TTL 3600
AAAA  @    <IPv6 des Servers>    TTL 3600   (optional, falls genutzt)
```
Propagation prüfen: `dig barrierefrei-pruefen.de +short` → `178.105.83.0`.
> Wichtig: DNS VOR dem PR-Merge setzen, damit Caddy beim Deploy direkt ein Let's-Encrypt-Cert holen kann und die Landingpage-Canonicals sofort auf eine erreichbare Domain zeigen.

### Schritt 2 — Brevo: neue Sender-Domain verifizieren (parallel, dauert)
In Brevo `barrierefrei-pruefen.de` als Sender-Domain hinzufügen → SPF + DKIM-Records bei INWX setzen (Werte siehe `deployment/dns-records.md` Abschnitt 1). Bis DKIM grün ist, **Mailversand auf `bfsg-fix.de` belassen** (Server-`.env` noch nicht umstellen).

### Schritt 3 — Catch-all-Weiterleitung einrichten (INWX Mail-Easy)
`*@barrierefrei-pruefen.de → matze.seba@outlook.de` (s. o.). Testmail an `info@barrierefrei-pruefen.de` schicken → muss in Outlook ankommen.

### Schritt 4 — PR mergen → Auto-Deploy
PR `rebrand/barrierefrei-pruefen` mergen (GitHub Actions deployt automatisch). Danach verifizieren:
```bash
curl -I https://barrierefrei-pruefen.de/health   # → HTTP 200 (neues Cert)
curl -I https://bfsg-fix.de/health               # → muss WEITER HTTP 200 liefern
```
Beide Domains liefern jetzt dieselbe App; die Seite zeigt überall die neue Marke. (Server-`.env` ist noch auf bfsg-fix.de → Mails/Stripe laufen unverändert weiter, kein Bruch.)

### Schritt 5 — Server-`.env` auf neue Domain (erst NACH Brevo-DKIM grün)
`/opt/bfsg-check/deployment/.env`:
```
PUBLIC_URL=https://barrierefrei-pruefen.de
FROM_EMAIL=no-reply@barrierefrei-pruefen.de
FROM_NAME=Barrierefrei-Prüfen
REPLY_TO=info@barrierefrei-pruefen.de
INVOICE_CONTACT_EMAIL=info@barrierefrei-pruefen.de
```
Dann: `cd /opt/bfsg-check/deployment && docker compose up -d app`. Eine Testmail/Test-Rechnung prüfen (Absender + Footer + Links auf neuer Domain).

### Schritt 6 — Stripe-Dashboard (manuell, Owner)
- **Webhook** `https://bfsg-fix.de/webhook` → zusätzlich/neu `https://barrierefrei-pruefen.de/webhook` anlegen, mit Test-Event prüfen, dann den alten deaktivieren. `STRIPE_WEBHOOK_SECRET` bleibt gleich (gleicher App-Container).
- `success_url`/`cancel_url` werden aus `PUBLIC_URL` gebaut → ab Schritt 5 automatisch korrekt.

### Schritt 7 — CI-Health-URL umstellen
In `.github/workflows/uptime-watch.yml` die Health-URL auf `https://barrierefrei-pruefen.de/health` setzen; `from:`-Alert-Adressen auf `@barrierefrei-pruefen.de` (sobald Brevo-Domain verifiziert). GitHub-Secret `BFSG_URL=https://barrierefrei-pruefen.de` setzen (Notion-Sync).

### Schritt 8 — Google/Bing: neue Property + Ads-URLs
Search Console Property für `barrierefrei-pruefen.de` anlegen + Sitemap einreichen. Ads-Ziel-URLs (sobald Kampagnen laufen) auf neue Domain.

### Schritt 9 (optional, später) — `bfsg-fix.de` auf 301 reduzieren
Erst wenn Webhook migriert + Links/Bookmarks umgezogen sind: im `Caddyfile` den `bfsg-fix.de`-Block durch einen 301-Redirect auf `barrierefrei-pruefen.de` ersetzen (überträgt SEO-Linkjuice).

---

## Rollback
Vor Schritt 5: PR-Revert + Deploy stellt die alte Marke wieder her; `bfsg-fix.de` lief ohnehin durchgehend. Nach Schritt 5: Server-`.env` zurück auf bfsg-fix.de-Werte + `docker compose up -d app`.

## Bewusst NICHT geändert (Records/Follow-up, kein Risiko)
- `docs/HANDOVER-NEXT-SESSION.md` (außer Status-Block), `docs/agency-audits/`, `docs/AUDIT-*`, `docs/*-PLAN*.md` → historische Protokolle.
- `marketing/_obsolete/`, `vault-template/`, `scripts/generate-*.mjs` → archiviert/Follow-up.
- Keyword „bfsg check" in Ads-Keyword-Listen + Wettbewerber-Nennungen → absichtlich erhalten.

## Markenrecht — Owner-Pflichtprüfung vor Go-live
Vor dem Live-Gang unter der neuen Marke selbst prüfen (kostenlos, ~20 Min): **DPMAregister** (register.dpma.de) + **EUIPO eSearch** nach `barrierefrei`, `Barrierefrei-Prüfen`, `Fast Forward IT` (Inhaber-Suche). „Barrierefrei-Prüfen" ist rein beschreibend → niedriges Verletzungsrisiko, aber auch geringe eigene Schutzfähigkeit; bei Umsatz Richtung 30 k€ ggf. distinctives Zusatz-Wortmark prüfen.
