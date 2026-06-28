# 🤝 Handover für die nächste Session

---

## 🔵 STAND 28.06.2026 (Rebrand) — NÄCHSTE SESSION STARTET HIER

> **Rebrand vorbereitet** (Branch `rebrand/barrierefrei-pruefen`, PR offen): Marke „BFSG-Check" → **„Barrierefrei-Prüfen"**, Hauptdomain → **barrierefrei-pruefen.de**. Grund: Wettbewerber `bfsg-check.de` (Fast Forward IT GmbH) führt identische Marke „BFSG CHECK" → Marken-/Abmahnrisiko. Code fertig + verifiziert (scanner 142/142, `next build` grün, legal-grep Baseline unverändert, 71 Dateien). `bfsg-fix.de` **bleibt** als Redirect-Domain. „BFSG" als Gesetz/Keyword überall erhalten. **Live-Umstellung (DNS, Brevo-DKIM, Server-`.env`, Stripe-Webhook) macht NUR der Owner** → vollständiges Schritt-für-Schritt: **`docs/REBRAND-CUTOVER-RUNBOOK.md`**. **PR NICHT vor DNS-Cutover mergen.**

---

## 🔴 STAND 28.06.2026 (spätabends) — Scan-/TLS-Blocker (weiter offen, vom Rebrand unabhängig)

> **Lies NUR diesen Block für den aktuellen Stand. Alles darunter ist Historie.**

### ⚠️ EIN offener Blocker: bezahlter Scan / Report-Erzeugung scheitert (NICHT Mail!)
Live-Testkauf (Paket **basis**, URL `https://matthias-seba.de/`, Session `cs_live_a1ugi6pE9jFGxGBfvBdedUPvUv6Gp0Q1swNKt6K9Hre7Uu6NNvKCOBNaB0`) endete mit **„ERFÜLLUNG FEHLGESCHLAGEN: Scan lieferte kein verwertbares Ergebnis (Seite blockiert/leer/nicht erreichbar)"**. Webhook + Order liefen. **WICHTIG (Korrektur):** Die `[BFSG-ALERT]`-Mail ist NUR die **Betreiber-Benachrichtigung** — sie ging an `ADMIN_EMAIL=matthiasseba92@gmail.com` (vom Owner an der Business-Adresse `matthias@matthias-seba.de` gelesen), **NICHT** an die Besteller-Adresse. **Der zahlende Kunde (`matze.seba@outlook.de`) hat für diese Bestellung NICHTS erhalten** (Scan fehlgeschlagen → kein Report). Der Alert-Eingang beweist also NICHT, dass Kunden-Mails an outlook.de im Posteingang landen — die frühere Kunden-Mail an `matze.seba@outlook.de` war zwar „Zugestellt", landete aber im **Spam** (Cold-Start, separat). **Produktlücke:** bei Scan-Fehler bekommt der zahlende Kunde aktuell GAR KEINE Mail (nur der Admin) — Owner-Entscheidung offen, ob dem Kunden bei Fehlschlag eine freundliche „wir-kümmern-uns"-Mail gehen soll. Kern: nur der **Scan** lieferte nichts → kein Report.

**Starke Hypothese (verifizieren!):** Der **bezahlte** Scan-Pfad ist **strikt-TLS**. `SCAN_TEASER_LENIENT_TLS=true` (im Container gesetzt) greift NUR für den **Gratis-Teaser** (`/api/scan` → `scanUrl(url,{lenientTls})`), NICHT für den bezahlten `fulfillOrder`/`scanUrl`-Pfad. `matthias-seba.de` hat ein **Hostname-Mismatch-Cert** (`*.web-repository.com`) → Gratis-Check (lenient) scannt durch (Score 24), bezahlter Scan (strikt) scheitert.
→ **HIER STARTEN:** `scanner/lib/scan.js` (`scanUrl`/`gotoResilient`, `ignoreHTTPSErrors`) + `scanner/app.js` (Webhook→`fulfillOrder`→`scanUrl`-Aufruf) prüfen; entscheiden, ob TLS-Toleranz auch für den bezahlten Pfad sinnvoll ist (**SSRF-/DNS-Rebinding-Schutz MUSS aktiv bleiben**), ODER ob ein anderes Problem vorliegt (Bot-Schutz/JS-lastig/leeres axe-Ergebnis). Diagnose: `ssh root@178.105.83.0` → `cd /opt/bfsg-check/deployment && docker compose logs app | grep -i scan`; ggf. strikten Scan von matthias-seba.de gegentesten.
**Order recovern (NACH Scan-Fix):** `POST https://bfsg-fix.de/api/resend/cs_live_a1ugi6...` mit `Authorization: Bearer <ADMIN_TOKEN aus Server-.env>`. ACHTUNG: `/api/resend` re-scannt → erst Scan fixen, sonst scheitert es erneut. Danach Owner: Test-Kauf refunden. (Bonus-Bug aus letzter Session: `/api/resend?force=true` ist NICHT implementiert, app.js:588 → eigener Task-Chip.)

### ✅ Diese Session erledigt (NICHT erneut anfassen — A/B/C/F + Mail-Infra fertig)
- **A** Rechnungs-`.env` (INVOICE_FROM_NAME/ADDRESS, VAT_MODE=kleinunternehmer, ADMIN_TOKEN) ✓
- **B** `SCAN_TEASER_LENIENT_TLS=true` + **docker-compose.yml-Mapping gefixt** (PR #74) → Gratischeck echter Score ✓
- **C** Stripe-Live-Testkauf verifiziert → dabei **3 Live-Bugs gefunden+gefixt**:
  - **DNS:** tote INWX-Park-IP `185.181.104.242` aus A-Records ALLER 4 Domains entfernt (Round-Robin killte ~50 % Webhooks + Besucher-Traffic) ✓
  - **SMTP:** `SMTP_USER` → Brevo-Relay-Login `aedd19001@smtp-brevo.com` (war Account-Mail → 535 Auth failed) ✓
  - **Mail-Zustellung:** bfsg-fix.de bei **Brevo DKIM-authentifiziert** (brevo-code-TXT + brevo1/brevo2-CNAMEs bei INWX) → Mails werden **zugestellt** (vorher „sender invalid", 0 zugestellt) ✓
- **F** PRs #66–#69 waren bereits gemergt ✓ · **Preise** in CLAUDE.md auf Live-Stand (PR #80: Basis 129 / Profi 399 / Cookie 39/69 / Abo 24,99 €) ✓
- **Rechnung/E-Mail-Politur (PR #81, deployt, Tests 92/92):** Rechnungsempfänger Firma/Name/Anschrift statt 2× E-Mail (Stripe `billing_address_collection:'required'`), Pflicht-Footer (Anbieterkennzeichnung), B2C-Widerruf-Bestätigung (§356 V BGB), `List-Unsubscribe`-Header, Kontakt/Reply-To = `info@bfsg-fix.de`. (Volle Empfänger-Anschrift erst bei NEUEN Käufen sichtbar; alte Rechnung RE-2026-0001 ist gecacht.)
- **info@bfsg-fix.de** angelegt: INWX-Paket **„Mail Easy" (0,29 €/mo)** vom Owner gekauft, **Weiterleitung info@ → matze.seba@outlook.de** in Froxlor, MX `smtp-in0/in1.prod0.webspace.bz` gesetzt (SPF/DKIM intakt) ✓

### 📍 Danach: Plan Punkt D
Sobald Scan/Report-Bug gefixt + Order recovered → weiter in `docs/LAUNCH-PLAN-EINFACH.md` bei **D** (Google-Ads-Kampagne als **pausierter Entwurf** per Computer Use bauen, sobald Owner in ads.google.com eingeloggt), dann **E** (Bing-Ads).

### 🔑 Zugänge / Fakten
- Server-SSH von diesem Win-PC: `ssh root@178.105.83.0` (Operator-Key liegt drauf). Server-`.env`: `/opt/bfsg-check/deployment/.env`. Deploy = PR-Merge auf `main` (Auto-Deploy via GitHub Actions, ~20–40 s).
- **Spam:** Mail-Auth ist sauber (DKIM/DMARC pass) — Restspam = **Cold-Start-Reputation** (Warm-up 3–6 Wochen; Owner soll Mail in Outlook als „kein Junk" markieren). KEIN Bug.
- Memories (`memory/MEMORY.md`): u. a. [[email-infra-state]], [[dns-inwx-dead-ip-185]], [[brevo-smtp-relay-login]], [[compose-env-explicit-mapping]], [[server-ssh-from-windows]].

---

> **Lies das nach `CLAUDE.md` als ZWEITES.**
> **Stand:** 27.06.2026 · **Neu (27.06.):** **Dark-Default-Redesign + Conversion-/Dynamik-Politur der Landingpage LIVE** (PR #76 — Dark als dauerhafter Standard, kiberatung-inspirierte Sektions-Rhythmik + Mini-Visuals, heller „Wow"-Counter, Hero-„?"-Clipping-Fix + vergrößerte Vorschau-Überschrift; Build grün, Deploy 43 s, `/health` ok). Details siehe Update-Sektion unten + `docs/redesign/`. · **Neu (25.06.):** Gratischeck-Backend-Reliability-Fix nach `main` gemergt (PR #63) — Owner-Aktion `SCAN_TEASER_LENIENT_TLS=true` offen, siehe GO-LIVE-CHECKLISTE A.4. Letzte Sessions: Conversion-Optimierung (PR #54) · lückenloser FE+BE-Launch-Readiness-Audit (100 verifizierte Funde, alle 6 P0 im Code gefixt, PR #55) · 4 Owner-Entscheidungen umgesetzt · Hero mobil-zentriert + Vorschau-Kasten als „Beispiel" gekennzeichnet (PRs #56–#61). **Alles gemergt + live.** Offene Go-Live-Aufgaben: **siehe direkt unten.**

---

> ▶️ **Nächster Schritt diese Session:** **`docs/LAUNCH-PLAN-EINFACH.md`** (+ `.pdf`) abarbeiten — kompletter kinderleichter Owner-Plan **A–H für Windows** (Rechnungs-`.env`, `SCAN_TEASER_LENIENT_TLS=true`, Stripe-Live-Testkauf, Ads, Listings, Newsletter). Wer-macht-was: **`docs/LAUNCH-3-SPALTEN-PLAN.md`** (Computer-Use / Owner / Code). Code-PRs **#66–#70 gemergt + live** (SSRF-IP-Pin, C3-Fix, Mail-Retry, Beispiel-Report-PDF, A11y-Icon). Server-Zugang: **Windows-PowerShell `ssh root@178.105.83.0`** (KEIN Mac) — der „Terminal auf dem Mac"-Block direkt unten ist im neuen Plan als **Schritt B** Windows-korrigiert enthalten.

---

## ▶️ NÄCHSTE SESSION — 1 offener Owner-Schritt (per Computer Use erledigen)

> **Ziel:** Den Gratischeck auch für kleine SMB-Seiten mit unsauberer Zertifikatskette zum Laufen bringen. Der Code dafür ist seit PR #63 live; es fehlt nur noch **ein Feature-Flag im Server-`.env`**. Dieser Block ist als Computer-Use-Aufgabe selbst-enthalten — einfach ausführen lassen.

**Aufgabe für Computer Use (copy-paste in ein Terminal auf dem Mac):**

```bash
# 1) Auf den Server (SSH-Config-Alias laut CLAUDE.md = "bfsg")
ssh bfsg

# 2) Ins Deployment-Verzeichnis
cd /opt/bfsg-check/deployment

# 3) Flag setzen (fügt die Zeile hinzu, falls sie noch fehlt; sonst auf true setzen)
grep -q '^SCAN_TEASER_LENIENT_TLS=' .env \
  && sed -i 's/^SCAN_TEASER_LENIENT_TLS=.*/SCAN_TEASER_LENIENT_TLS=true/' .env \
  || echo 'SCAN_TEASER_LENIENT_TLS=true' >> .env

# 4) Kontrolle: muss "SCAN_TEASER_LENIENT_TLS=true" zeigen
grep '^SCAN_TEASER_LENIENT_TLS=' .env

# 5) Neu bauen + starten
docker compose up -d --build

# 6) Verifizieren (vom Server ODER vom Mac aus)
curl -s "https://bfsg-fix.de/api/scan?url=https://kutenholz.de"      # ERWARTUNG: echtes JSON mit "score", NICHT 502
curl -s -o /dev/null -w "%{time_total}s\n" "https://bfsg-fix.de/api/scan?url=https://www.zalando.de"  # ERWARTUNG: deutlich < 32 s
```

**Erfolgskriterium:** `kutenholz.de` liefert ein JSON mit `"score"` (statt `{"error":...}`/502); `zalando.de` antwortet spürbar schneller als die früheren ~32 s.

**Rollback (falls etwas hakt):** in `.env` `SCAN_TEASER_LENIENT_TLS=false` setzen, `docker compose up -d --build`. Der bezahlte Scan-Pfad ist von dem Flag NIE betroffen (bleibt immer strikt); SSRF-/DNS-Rebinding-Schutz ebenfalls unberührt.

**Wichtig:** Server-SSH geht nur vom Mac des Owners (Alias `bfsg`), NICHT aus der Claude-Code-Web-/Sandbox-Umgebung — daher ist dies ein Computer-Use-/Mac-Schritt, kein Sandbox-Schritt.

---

## 🚀 GO-LIVE-CHECKLISTE (Stand 24.06.2026, Abend) — DAS HIER ZUERST

> **Was bleibt bis zum Live-Gang offen.** Detail-Belege je Backend-Fund: `docs/AUDIT-LAUNCH-READINESS-2026-06.md` (vollständige P0/P1/P2-Tabellen + Buckets).
> Status der Website selbst: **bereits deployed & grün** (`/health` ok, Stripe live, Mailer aktiv). „Go-Live" = Launch/Ads scharf schalten — dafür fehlt v. a. Owner-Setup + etwas Server-Härtung.

### 🔴 A) PFLICHT heute Abend — nur der Owner kann das (Server-`.env` + Konten)
1. **Rechnungs-Pflichtangaben im Server-`.env`** (`/opt/bfsg-check/deployment/.env`) setzen — sonst trägt JEDE Rechnungs-PDF einen Platzhalter als Anbieter-Anschrift (§14 UStG = formfehlerhaft, Audit-P0#2):
   - `INVOICE_FROM_NAME=Matthias Seba`
   - `INVOICE_FROM_ADDRESS=Lange Straße 20, 27449 Kutenholz`
   - `VAT_MODE=kleinunternehmer`
   - `ADMIN_TOKEN=` (langes Zufallsgeheimnis, z. B. `openssl rand -hex 32`) — schützt `/api/admin/*`
   - `SENTRY_DSN=` (optional)
   → danach `docker compose up -d --build`, dann **1 Test-Rechnung erzeugen und Anschrift/„§19"-Hinweis prüfen**. (Platzhalter stehen bereits in `deployment/.env.example`.)
2. **Stripe-Live-Testkauf** (eigene Karte → danach Refund) — PFLICHT bevor echte Zahlungen/Ads laufen. Verifizieren: Webhook → Scan startet → PDF + eigene Rechnung + Mail kommen an. (Deckt zugleich den Resend-/Rechnungs-Pfad-Live-Test ab, Audit-P0#4.)
3. **Newsletter aktivieren** (optional fürs reine Go-Live — ohne Config meldet das Footer-Formular ehrlich „gerade nicht verfügbar"): in Brevo (a) eine **Newsletter-Liste** anlegen, (b) ein **Double-Opt-in-Template** anlegen + aktivieren (existiert beides noch nicht — per API geprüft), dann im Server-`.env`: `BREVO_API_KEY`, `BREVO_NEWSLETTER_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`, `BREVO_DOI_REDIRECT_URL`. Code + Endpoint (`/api/newsletter`) sind fertig und env-gated.
4. **Gratischeck-TLS-Toleranz aktivieren** (PR #63, behebt „Gratischeck zeigt nur Demowerte"): im Server-`.env` `SCAN_TEASER_LENIENT_TLS=true` setzen, dann `docker compose up -d --build`. Erlaubt dem **kostenlosen** Teaser-Scan, kleine SMB-Seiten mit unvollständiger/abgelaufener Zertifikatskette trotzdem zu prüfen (Default `false` = strikt). Der **bezahlte** Scan-Pfad bleibt immer strikt; SSRF-/DNS-Rebinding-Schutz ist davon unberührt. **Danach verifizieren:** `curl "https://bfsg-fix.de/api/scan?url=https://kutenholz.de"` muss echte Werte statt 502 liefern; `…?url=https://www.zalando.de` sollte deutlich schneller als die früheren ~32 s antworten.

### 🟠 B) Server-/Code-Härtung vor Ad-Skalierung (brauchen Server- oder Live-Test — NICHT im Sandbox machbar)
- **SSRF endgültig schließen (Audit-P0#1):** Code-Guard ist live (Per-Navigation-IP-Check inkl. Redirect-Hops + immer-aktiver Private-IP-Check). **Volle Absicherung = Netz-Egress-Policy / IP-pinnender Proxy auf Hetzner + Pen-Test** gegen interne IPs/Metadaten. Vor breiter Exposition verifizieren.
- **networkidle-Fallback (P0#6) + AxeBuilder-Timeout (#45):** gegen reale tracking-/long-poll-lastige Kundenseiten live testen.
- **Chromium läuft als root mit `--no-sandbox` (P1#4):** `USER pwuser` im `scanner/Dockerfile` + Sandbox aktivieren, Container-Rebuild + Smoke-Test.
- **Mail-Retry (P1#3):** `sendMail` mit 3× Backoff + Mail-Try vom Scan/Rechnungs-Try trennen — **noch NICHT umgesetzt** (verhindert FAILED-Order trotz fertigem Report bei transienter SMTP-Störung).
- **Webhook-Idempotenz-Persistenz + Reconcile-Sweeper (P1#2, #50, #54)** und **async-Zahlart/SEPA (#59):** vor Skalierung / vor `ENABLE_ABO=true`.
- **Multi-Instance-Rechnungszähler (#58)** + **echte DSGVO-Compaction (#60):** erst bei Skalierung/2. Instanz relevant.
- **Rest:** ~40 P2-Politur-Items — siehe Audit-Doc, nicht Go-Live-blockierend.
> Hinweis: Der §19-Brutto/Netto-Fix (P1#1) ist durch die Owner-Entscheidung „Kleinunternehmer" **gegenstandslos** (Default ist korrekt).

### 🟢 C) Conversion-Backlog (brauchen Assets vom Owner — nicht Go-Live-blockierend)
- **Gründer-Block** auf der Landingpage: Foto + Name + Satz („Ich prüfe jeden Report persönlich, bevor er rausgeht. — Matthias Seba"). Stärkstes Trust-Signal für Solo-Founder. **Braucht:** 1 Foto + finalen Satz.
- **Beispiel-Report-PDF** zum Ansehen vor dem Kauf (Link im Hero/bei den Pakketen). **Braucht:** 1 anonymisierten Report aus `scanner/` als PDF unter `landingpage-next/public/`.

### ✅ In dieser Session bereits erledigt + LIVE (nicht mehr offen)
- **Conversion-Optimierung** (PR #54): Legal-P0s („BFSG-konform" raus → „bereit fürs BFSG?"), Cookie-2-Button-Balance, Performance/CWV, A11y-Fokus, CRO-Copy.
- **Launch-Readiness-Audit** (PR #55): alle 6 P0-Blocker im Code (SSRF-Guard, §14-ENV-Platzhalter, Rate-Limit `req.ip`, Resend-Doppelrechnung, Light-Fokus-Ring, networkidle-Fallback) + breite FE-Fixes (SEO/JSON-LD-Split, Canonicals, Perf, A11y, Legal-Copy).
- **4 Owner-Entscheidungen:** USt §19-Captions+FAQ · Social-Links entfernt · B2B-Firmenfeld im Checkout · Newsletter→Brevo-DOI-Endpoint · Checkout-E-Mail-Validierung.
- **Hero/Visual:** Headline-Clipping + Mobile-Zentrierung (per Browser-Messung auf 22/22px verifiziert), Headline „bereit fürs BFSG?", Vorschau-Kasten als **„Beispiel"** gekennzeichnet (Chip + Überschrift „So sieht Ihr kostenloses Sofort-Ergebnis aus"), Eck-Badge entfernt (PRs #56–#61).

---

## 🆕 Update 27.06.2026 (Abend) — Preise gesenkt + Re-Check-Abo LIVE + PayPal (PR #78)

- **Preise marktbasiert gesenkt (LIVE):** Basis **199→129 €** · Profi **499→399 €** · Re-Check-Abo **39→24,99 €/Mo** · Cookie-Basis **49→39 €** · Cookie-Profi **79→69 €**. Grundlage: tagesaktuelle 3-Agenten-Wettbewerbsrecherche (27.06.) — jeweils leicht unter dem nächsten vergleichbaren Anbieter (musnuss.de 190 €, webAION 490 €, AccessGO/gehirngerecht 39/49 €). Alle Stellen synchron (scanner PACKAGES, landingpage config/JsonLd/CheckoutModal + 6 SEO-Seiten, marketing/OFFER.md). Verifiziert live auf der Startseite.
- **Re-Check-Abo SCHARF (LIVE):** `ENABLE_ABO=true` im Server-`.env` gesetzt, deployed, `/health` zeigt **`aboEnabled:true`**, Abo-Checkout liefert echte `cs_live_…`-Session. Produktreif gemacht (PR #78):
  - **Monats-Re-Check** liefert jetzt die **aktualisierte Barrierefreiheitserklärung** mit (vorher NICHT) — `PKG_CONFIG.abo.withStatement=true` + `sendRecheckReport`-Anhang + `handleInvoicePaid` übergibt `stmtPath`.
  - **Webhook-Idempotenz** korrekt: Order-erzeugende Events werden in `prePersistCheckout()` VOR der Quittung durabel festgehalten (kein stiller Order-Verlust); `releaseEvent()` bei Persist-Fehler → Stripe-Redelivery.
  - **Reconcile-Sweeper** beim Start = **alert-only** (kein Auto-Resend → kein Doppel-Mail/-Rechnung-Risiko); Recovery über `/api/resend`.
  - mailer liest optionale Anhänge defensiv. Tests scanner **86/86**, landingpage `next build` grün, legal-copy-grep PASS. Adversariales Code-Review (3 WICHTIG-Befunde) eingearbeitet.
- **PayPal:** vom Owner im Stripe-Dashboard aktiviert (PayPal-Business via OAuth). Einmalzahlung (Basis/Profi/Cookie) zeigt PayPal automatisch (Code nutzt dynamische Zahlmethoden, keine `payment_method_types`). **Abo-PayPal** (recurring) braucht separate Freischaltung (bis 5 Werktage) — Karte/SEPA decken das Abo bis dahin.

### 🔴 OFFENER OWNER-PUNKT (Stripe-Dashboard, ~1 Min — ich kann es nicht, Dashboard ist für mich gesperrt)
**Webhook-Event `customer.subscription.updated` ergänzen.** Aktuell abonniert: `checkout.session.completed, invoice.paid, customer.subscription.deleted` (per Stripe-API verifiziert). Für die **`past_due`-Pause** bei Zahlungsausfall fehlt `customer.subscription.updated` (optional zusätzlich `invoice.payment_succeeded` als Fallback). Ohne das Event läuft das Abo trotzdem (Monats-Re-Check via `invoice.paid` + Kündigung via `subscription.deleted`), nur die proaktive Zahlungsausfall-Pause/-Alarm greift nicht. → Stripe-Dashboard → Entwickler → Webhooks → `https://bfsg-fix.de/webhook` → Events ergänzen.
**Empfohlener Test:** Test-Abo mit eigener Karte (24,99 €) → erster Scan + Report + aktualisierte Erklärung + Rechnung müssen ankommen → kündigen → Kündigungsmail prüfen → Refund.

---

## 🆕 Update 27.06.2026 — Dark-Default-Redesign + Conversion-/Dynamik-Politur (PR #76, LIVE)

- **Owner-Auftrag:** Landingpage designtechnisch komplett überarbeiten — **Dark-Mode dauerhaft als Standard** (Farben unverändert), dynamischer + conversion-stärker im Stil von **kiberatung.de**, plus zwei konkrete Fixes.
- **Prozess (Agenten-Team):** 7-Lens-Audit (CRO/UI/Motion/Copy/A11y/Mobile-Perf/Brand) → 1 Redesign-Architekt-Plan → kohärente Umsetzung aus einer Hand → **5-Lens-Adversarial-Review** (0 P0, **2 P1 gefixt**). Plan + Referenz: `docs/redesign/redesign-masterplan.md` + `docs/redesign/kiberatung-design-analysis.md`.
- **Umgesetzt (23 Dateien in `landingpage-next/`):**
  - **Dark als garantierter Standard:** `ThemeProvider` `defaultTheme="dark"` + `enableSystem={false}`; `layout.tsx viewport` themeColor `#0d0e1a` / colorScheme `dark light`. Toggle bleibt funktional + persistiert die Wahl.
  - **Owner-Fix 1 — Hero-„?"-Clipping:** `.gradient-text` Clip-Box-Schutz (`padding/margin-right`) + „?" als nicht-kursives Kind im selben Gradient-Span (`Hero.tsx`; `config.ts headlineEmph` ohne „?"). Layout-neutral, kein CLS.
  - **Owner-Fix 2 — Vorschau-Heading:** „So sieht Ihr kostenloses *Sofort-Ergebnis* aus" als vergrößerte Sub-Überschrift + „Vorschau"-Chip (`Hero.tsx`; `config.ts previewAccent`). Bewusst `<p>` (kein `<h2>` → Heading-Outline bleibt intakt).
  - **Neue Komponenten:** `SectionKicker` (einheitliche Kicker-Pill, tones default/warn/on-deep/on-light), `WowCounter` (heller Invers-Block, animiertes **ehrliches** „80+" = Prüfregeln EN 301 549, KEINE erfundene Zahl), `MobileStickyCta` (consent-gated → kein Cookie-Banner-Overlap).
  - **Dynamik/Rhythmik:** Sektions-Skelett (Kicker → genau 1 Fraunces-Italic-Akzentwort → Subline) über ALLE Sektionen; Mini-Visuals (HowItWorks-Progress-Line, StatsBar-Underlines, RiskBand-Severity-Bars, Testimonials-Demo-Snippet als „Beispiel" markiert); `card-lift`-Utility; CRO-Sektions-Reihenfolge (TrustSection vor Pricing, Wow nach Stats); `ResultCard` score-/fund-abhängig personalisiert (nur echte Scan-Daten).
  - **A11y-Härtung (Dogfood):** Mint-Button-Fokusringe gehärtet (Dark: kein Mint-auf-Mint mehr), WowCounter-Kontraste ≥ WCAG AA gegen Creme, reduced-motion bei allen neuen Animationen, Heading-Hierarchie geprüft.
- **Verifiziert:** `next build` grün (TS strict, 20/20 Seiten) · `eslint` clean · `legal-copy-grep` (mein Diff ohne ROT/GELB) · Deploy 43 s · `/health` ok · live visuell bestätigt.
- **Backlog aus dem Review (NICHT blockierend):**
  - P2: Mint-Button-Fokusring-**Außenkante** auf dunklem Background könnte stärker sein (aktuell WCAG-2.4.11-konform über die Innenkante gegen die Mint-Fläche). Optional: zweiter heller Outline-Ring.
  - **Bestehende `legal-copy-grep`-ROT-Treffer (16) liegen alle in UNVERÄNDERTEN Legal-/SEO-Seiten** (`agb`, `bfsg-pruefung-kosten`, `wcag-2-1-vs-2-2`, `barrierefreiheitserklaerung-muster`, `bfsg-checkliste-online-shop`, `axe-lighthouse-wave-vergleich`) als **Disclaimer-Formulierungen** („keine Garantie für BFSG-Konformität") + Marketing-Planungsdocs (Keyword-/Regel-Erwähnungen). = Repo-Baseline, **kein neues Risiko aus diesem Diff**. Empfehlung: separater, rein rechtlicher Aufräum-Durchgang (viele sind legitime Negationen/Disclaimer, kein blindes Ersetzen).
  - Mobile-Sticky-CTA + Mini-Visuals wurden am Desktop verifiziert; ein echter Mobile-Viewport-Visual-Check (320–414 px) steht aus (Chrome-MCP `resize_window` lieferte im Test keinen echten schmalen Viewport — responsive Tailwind-Klassen + Build decken es ab).

---

## 🆕 Update 25.06.2026 — Gratischeck Backend-Live-Check zuverlässiger (PR #63)

- **Problem:** Der Gratischeck lieferte bei echten Kundenseiten oft **nur Demowerte**. Ursache war NICHT „Backend unerreichbar" (Endpoint live & grün), sondern **Zuverlässigkeit**: bei Scan-Fehlschlag zeigte das Frontend zufällige Beispielzahlen. Reproduziert am Live-Server: `example.com` ok (2 s), `zalando.de` 200 aber **31,6 s**, `kutenholz.de` (SMB) **502 in 1,2 s**.
- **Fix (PR #63, Draft→Merge):**
  - **Backend `scanner/`:** `gotoResilient` lädt `domcontentloaded` zuerst + kurze gekappte `networkidle`-Settle-Phase (1/3 des Budgets, 2–8 s) statt `networkidle` mit vollem 30-s-Budget → behebt die 30-s-Hänger. **SSRF-/DNS-Rebinding-Schutz bleibt auf jedem Pfad aktiv.** Leichter 1×-Retry bei transientem Fehler (kein Retry bei Timeout). Neue reine Funktion `classifyScanError()` (`lib/scan-error.js`): `/api/scan` liefert grobe Kategorie (`timeout|tls|dns|blocked|unknown`) + deutsche Klartextmeldung + Status (504 bei Timeout), ohne Interna zu leaken. 9 neue Unit-Tests, **59/59 grün**.
  - **Frontend `landingpage-next/`:** `ScanForm` zeigt im Fehlerfall **keine zufälligen Demowerte** mehr, sondern eine ehrliche, kategorie-spezifische Meldung + Button „Erneut versuchen". `ResultCard`-Demo-Hinweis entfernt.
- **🔴 OWNER-AKTION (1 Zeile, schaltet den vollen Effekt frei):** im Server-`.env` `SCAN_TEASER_LENIENT_TLS=true` setzen + `docker compose up -d --build` — Details + Verifikations-`curl`s siehe **GO-LIVE-CHECKLISTE → A) Punkt 4** oben. Ohne dieses Flag scheitern SMB-Seiten mit unvollständiger Zertifikatskette weiterhin (dann greift jetzt aber wenigstens die ehrliche Fehler-/Retry-Anzeige statt Demowerten).
- **Prozess:** Spezialisten-Agenten-Flow (Prüfung → Engineering-Agent → 3 Review-Agenten + `code-review` → Tests). Build grün: scanner 59/59, landingpage `tsc`/`eslint`/`next build` EXIT 0.

---

## 🆕 Update 22.06.2026 — Conversion-Optimierung (Spezialisten-Team-Review)

- ✅ **5 Agency-Agenten parallel** (CRO/Growth · Visual-Design · Conversion-Copy · A11y/Trust · Mobile-Performance) haben die komplette Landingpage auditiert → konvergente, hoch-konfidente Maßnahmen umgesetzt.
- ✅ **PR #54 (Draft):** „Conversion-Optimierung: Legal-P0s, Performance & CRO-Politur". Build grün (Next 16, TS strict, ESLint clean, 20/20 Seiten). **Merge nach `main` = morgen geplant** (User-Entscheid 22.06.) → Auto-Deploy auf Prod.
- **Legal-P0s gefixt (vor paid Traffic kritisch):**
  - „BFSG-konform" aus H1 + SEO-`<title>` + Meta-Description raus (UWG §5) → „barrierefrei genug?" / WCAG-Framing.
  - Cookie-Banner: beide Consent-Buttons gleichwertig (§25 TDDDG / Dark-Pattern-Verbot — das eigene Cookie-Produkt prüft genau das).
  - „Meistgewählt"/„Beliebt" → „Empfohlen" (unbelegbare Marktaussage).
- **Performance/CWV:** `background-attachment:fixed` + Grain-Overlay (Mobile-Scroll-Jank) entfernt/gegated; Hero-H1+Subline statisch (LCP nicht mehr durch `opacity:0` verzögert); Hero-Blurs reduziert.
- **A11y:** Fokus-Ring auf allen Buttons sichtbar (ring-offset, auch auf Mint-CTAs); Link-Fokus-Outline (WCAG 2.4.7); `size=lg` = 44px Touch-Target.
- **CRO/Copy:** Featured-Pricing-Card mit echter Elevation; CTA-Labels, Risk-Band-Urgency, Differentiators geschärft; 2 neue FAQ-Objections + Reihenfolge.

### 🔴 BACKLOG aus dem Conversion-Review (brauchen Assets/User — NICHT in PR #54)
> Laut Trust-Audit die **zwei stärksten Deal-Closer** für einen Solo-Founder ohne Kunden-Logos. Bewusst zurückgestellt, weil echtes Material nötig ist.
1. **Gründer-Block auf der Landingpage** — kleine Sektion „Wer dahintersteht": Foto + Name + ein Satz („Ich prüfe jeden Report persönlich, bevor er rausgeht. — Matthias Seba"). 100 % legal, nicht fälschbar, stärkstes Vertrauenssignal im B2B-Solo-Verkauf. **Braucht:** 1 Foto + finalen Satz vom User. Platzierung: zwischen `Testimonials` (Differentiators) und `PricingCards`, oder im `TrustSection`.
2. **Beispiel-Report (anonymisiertes PDF)** zum Ansehen VOR dem Kauf — „Beispiel-Report ansehen →" im Hero (unter dem Scan-Form) + bei den Pricing-Cards. Senkt die „Was bekomme ich eigentlich?"-Reibung beim 199–499 €-Blind-Kauf massiv. **Braucht:** 1 echten/anonymisierten Report aus `scanner/` als PDF, abgelegt unter `landingpage-next/public/`.

> Weitere, riskantere/größere Ideen aus dem Review (separat zu bewerten, NICHT eilig): Section-Reordering (Differentiators nach Pricing), „Bald verfügbar"-Abo-Karte aus dem 3er-Grid in einen Teaser ziehen, Email-Capture-Fallback bei Scan-Fehler (statt Random-Demo-Zahlen), `ResultCard`-Upsell auf 199 € Basis ankern + „+N weitere Befunde gesperrt", `next.config` `optimizePackageImports` (gegen Next-16-Docs prüfen, s. `landingpage-next/AGENTS.md`).

---

## 🆕 Update 21.06.2026 (spät) — Agency-Agents + Audits + Caching

- ✅ **Agency-Agents installiert** (`msitarzewski/agency-agents`, MIT, 114k★): **217 Spezial-Agenten** in `.claude/agents/agency/` (lokal/gitignored). Ab nächstem Session-Start nativ als `subagent_type` nutzbar. Regel: `CLAUDE.md` → „🤖 Agency-Agents". **Standard-Werkzeug für jede Spezial-Aufgabe.**
- ✅ **6 parallele Audit-Teams** (Security/Code/A11y/Legal/Conversion/SRE) → `docs/agency-audits/2026-06-21-MASTER-SUMMARY.md` (Launch-Ampel + Owner-Split, gegen `origin/main` re-validiert).
- ✅ **PR #46 gemerged + live** (Health: `ok:true, stripe:true, live:true, mailer aktiv`). Enthält: MotionConfig-A11y-Fix + 2 Legal-Copy-Entschärfungen (UWG §5).
- ✅ **Cache-Prompting-Regel** verankert: `CLAUDE.md` → „⚡ Cache-Prompting" + `docs/CACHE-PROMPTING-AGENTS.md`.
- ✅ **§ 356a Widerruf-Button:** Audit ergab **ERFÜLLT** — alter „OVERDUE"-Flag war stale.

### 🔴 Offen vor Ad-Skalierung (priorisiert, brauchen User-OK / Server / Tests)
1. **SSRF-Redirect-Pin** (Security C1) — Scanner folgt 30x zu internen/Metadata-IPs. `scanner/lib/url-guard.js` + `scan*.js`.
2. **Backup scharf schalten + 1 Restore-Test** (SRE S-01) — Server.
3. **Code-Fixes C2/C3** — GoBD-Rechnungsnummern-Verbrennung + toter `resend.js`-Befehl (`scanner/app.js`).
4. **ResultCard-Conversion-Brücke** + Noten-Schwellen Seite„C"/PDF„B" angleichen.
> Details + Severity je Befund: `docs/agency-audits/`.

### 🧠 Parallel-Session-Work (Jarvis-Cockpit) + Session-Config
- ✅ **Im Repo (committet):** `docs/ai-os-research/` (Masterplan + Architektur + Security-Review + Setup-Guides für das lokale Cockpit), `vault-template/` (Second-Brain-Template, keine Secrets), `scripts/legal_copy_grep.py` + `scripts/memory_extractor.py` (Tools).
- ⚠️ **LOKAL-ONLY, bewusst NICHT im Repo:** `cockpit/` + `cockpit-ui/` (Jarvis-Cockpit Next.js/Node-Apps, „standalone, nie auf Prod"), `scripts/voice/` (~600 MB Piper/Whisper-Modelle, gitignored), `vault/` (echtes Second-Brain, gitignored). **Grund:** `cockpit-ui/.env.local` (Secret) + Build-Artefakte + Binär-Modelle gehören nicht ins Git. `.gitignore` wurde entsprechend gehärtet (`*.env.local`, `.next/`, `scripts/voice/`). → Cockpit-Apps können auf Wunsch sauber versioniert werden (jetzt secret-/bloat-sicher).
- ✅ **SessionStart-Hook** aktiv: `.claude/settings.json` (lokal) injiziert bei jedem Session-Start einen Verweis auf dieses Handover. Du musst nichts mehr tippen.
- 📊 **Notion-Dashboard:** [BFSG-Check — Launch & Ops Board](https://app.notion.com/p/3802191b1070812ba39ce089c9e3b510?pvs=1) + [Sales Pipeline](https://app.notion.com/p/f10735999280434bbcd2c0c596d138f6?pvs=1). ⚠️ Der `Notion Dashboard Sync` (GitHub Action) lief zuletzt auf **failure** — vermutlich fehlende Secrets (`NOTION_TOKEN`/`NOTION_DB_*`), siehe `docs/DASHBOARD-NOTION-SETUP.md`.

### 🛰️ Cockpit-Funktionsstand (verifiziert 21.06.2026 — alles LOKAL, nicht auf Prod)
- **Start:** Backend `cd cockpit && npm start` (127.0.0.1:4317) · Frontend `cd cockpit-ui && npm run dev` (3017) · Voice: Skripte unter `scripts/voice/` (faster-whisper STT :5301 + Piper TTS :5302). Komplettanleitung: **`docs/ai-os-research/START-HIER.md`**.
- ✅ **Verifiziert lauffähig:** Dashboard (14 Panels, Live-`/health`), Second-Brain-Suche (Vault `bfsg-check/vault/`, gitignored, 16 Notizen, `/api/brain` configured:true), 18 Agenten-Aktionen + 5-Ebenen-Governance, **Voice TTS→STT-Round-Trip** (Piper „Thorsten" + faster-whisper-small, deutsch). Frontend-Build grün, Backend `node --check` grün, Security R-01..R-05 umgesetzt.
- ⚠️ **Agenten-Auth-Caveat:** Der verschachtelte `claude -p` (den die Aktions-Buttons auslösen) gibt **in der Claude-Code-Agent-Sandbox 401** (host-verwaltete Auth). Auf dem **normalen** Rechner, wo `claude` im Terminal eingeloggt funktioniert, laufen die Aktionen. Schnelltest: `claude -p "ok"` im normalen Terminal → wenn „ok", funktionieren die Buttons. (`claude.js` wertet `is_error` jetzt aus → Fehler erscheinen ehrlich als `failed`.)
- ✅ **Norton-False-Positive gelöst:** `MD:HttpRequest-inf [Susp]` bei URL-dichten Markdown → Projektordner `C:\Users\Administrator\bfsg-check\*` in Norton ausgeschlossen (Echtzeit/Auto-Protect), Quarantäne geleert. Vault liegt **innerhalb** des Repos (gitignored) → kein zweiter Ausschluss nötig. Runbook: `docs/ai-os-research/12-norton-fp-runbook.md`.
- 🔑 **Für echte Zahlen (nur User kann das):** `cockpit/.env` füllen — Stripe Restricted Read-Key, `ADMIN_TOKEN`, `GITHUB_TOKEN` (Google-Ads + Developer-Token später, 2–5 Tage). Eintragen übernimmt Claude nach Erhalt. Details: `docs/ai-os-research/10-daten-setup.md`.

---

## ⚡ TL;DR für Schnell-Start (60 Sekunden)

| | |
|---|---|
| **Live-Status** | ✅ `bfsg-fix.de/health` = `ok:true, stripe:true, live:true, mailer aktiv` |
| **Computer Use** | ✅ aktiviert (User Matthias hat Settings > General > „Computer use" angeschaltet) |
| **Offene PRs** | ✅ **0 offen** — #54–#61 alle gemerged + live (Conversion, Launch-Audit, Owner-Entscheidungen, Hero/Visual-Politur). Offene Go-Live-Aufgaben siehe „🚀 GO-LIVE-CHECKLISTE" oben |
| **Letzter Merge** | PR #49 — AI-OS-Research-Docs + Vault-Template + Tools (Cockpit/Voice bewusst lokal); `main` aktuell, Health grün |
| **Nächste konkrete Aufgabe** | `docs/LAUNCH-HEUTE-CHECKLISTE.md` abarbeiten → nur Matthias-Schritte (Stripe-Testkauf, Ads-Konten, Listings) → erste Sales |
| **Funnel** | ✅ E2E live verifiziert (Scan→Teaser→Checkout-Modal→Stripe-Live, alle Legal-Seiten 200, §356a-Consent sauber) |
| **Scanner-Limit** | ⚠️ Bot-geschützte Seiten (z. B. Zalando) scheitern — bei normalen SMB-Shops ok |

---

## 🎯 Was Matthias jetzt sofort braucht

**Erst-Aufgabe** (Priorität HOCH): Die 3 offenen PRs (#40/#41/#42) reviewen + mergen, dann **`docs/LAUNCH-HEUTE-CHECKLISTE.md`** öffnen — das ist das zentrale Handlungsdokument mit nur den Schritten, die NUR Matthias kann (Konten + Karte + Submits), jeweils mit fertigem Copy-Paste-Text inline:

1. **Stripe-Live-Testkauf** (10 Min) — eigene Karte, dann Refund. PFLICHT bevor Ads-Budget fließt.
2. **Google Ads Konto + Karte** (8 Min) — nur Konto anlegen, Kampagne kommt mit fertigem Setup aus der Checkliste.
3. **Bing Ads Konto + Karte** (5 Min) — für späteren Google-Import.
4. **3 Top-Listings** (12 Min) — SaaSHub/G2/OMR, Texte stehen fertig in der Checkliste.

**Realitäts-Check (ehrlich):** Verkäufe kommen frühestens in 3–7 Tagen (Google-Ads-Freigabe 24–72h + Lernphase). „Sales heute" aus Null-Traffic-Standstart ist unrealistisch — aber der Funnel ist verifiziert und alle Assets sind zünd-fertig. Schnellster realistischer Spike: Show HN (braucht ehrlichen Post = vorhanden, + Matthias' HN-Account).

---

## 📚 Die 5 Files, die du ZUERST liest

| # | File | Warum |
|---|---|---|
| 1 | `CLAUDE.md` (Root) | Arbeits-Regeln, Pakete, Compliance-Regeln |
| 2 | `docs/HANDOVER-NEXT-SESSION.md` | Diese Datei — aktueller Stand |
| 3 | `docs/SALES-DAY-1-V2.md` | Konkrete nächste Aufgaben (8 Tasks) |
| 4 | `docs/MARKETING-MASTER-2026.md` | Strategy-Hintergrund |
| 5 | `docs/LEGAL-REALITY-CHECK-2026.md` | Was darf gemacht werden, was nicht |

**Optional je nach Aufgabe:**
- `marketing/google-ads-rsa-headlines.md` — Ad-Headlines + Keywords + Setup
- `marketing/listings-submission-templates.md` — Submission-Texte für 11 Listings
- `docs/legal-templates/` — AGB-Cap, Disclaimer, Pre-Sale-Frage
- `docs/COMPUTER-USE-AKTIVIEREN.md` — Setup-Doku falls Matthias Probleme hat

---

## 📊 Was wurde in den letzten 7 Tagen geschafft

**14 PRs gemerged auf main:**

| PR | Was |
|---|---|
| #38 | Computer-Use-Aktivierungs-PDF (kindgerecht, 5 Schritte) |
| #37 | 0-Touch-Marketing + Legal-Reality-Check + Sales-Day-1-V2 |
| #36 | Code-Only Plan (Playwright MCP statt WSL2-Setup) |
| #35 | Cowork-Hybrid-Plan (verworfen zugunsten Code-Only) |
| #34 | Claude-Agent-Setup für Windows-PC (WSL2-Variante, jetzt obsolet) |
| #33 | Launch-Plan PDF (22 Seiten) |
| #32 | Stammdaten Matthias Seba + Rechtssicherheits-Audit |
| #31 | Mobile-Cards-Zentrierung |
| #30 | Mobile-Hero + Checkout-Modal Plan-Selector |
| #29 | Touch-Targets WCAG 2.5.5 |
| #28 | Conversion-Design-Iteration 2 (Premium Navy) |
| #27 | Pricing-Entscheidung (Re-Check 49→39€) |
| #26 | Code-Review-Criticals (F1/F3/F5/F7) |
| #25 | Frontend-QA-Fixes |

**Letzte 30 Commits siehe:** `git log origin/main --oneline -30`

---

## 🏗️ Aktuelle Repo-Struktur

```
bfsg-check/
├── CLAUDE.md                          ← Arbeits-Regeln (lies zuerst!)
├── README.md
├── scanner/                            ← Node.js Backend (live)
│   ├── app.js                          ← Express + Stripe-Webhook
│   ├── lib/
│   │   ├── mailer.js                  ← SMTP + rk_live_-Detection (Zeile 43)
│   │   ├── orders.js                  ← Stripe-Order-Handling
│   │   ├── invoice.js                 ← PDF-Rechnungen (Playwright)
│   │   ├── fulfill.js                 ← Auto-Erfüllung
│   │   └── scan*.js                    ← axe-core Scanner-Engine
│   └── package.json                    ← playwright 1.55.1, stripe 17.5.0
├── landingpage-next/                   ← Next.js 16 + Tailwind v4 (live)
│   ├── app/                            ← Pages (impressum, datenschutz, agb, widerruf)
│   ├── components/                     ← Hero, ScanForm, PricingCards, CheckoutModal, etc.
│   ├── CLAUDE.md                       ← „This is NOT the Next.js you know" — lies node_modules docs
│   └── AGENTS.md
├── admin-next/                         ← Next.js Admin-Dashboard
├── landingpage/                        ← Legacy HTML (Volume-Mount-Fallback)
├── deployment/                         ← docker-compose.yml + Caddyfile
├── docs/
│   ├── HANDOVER-NEXT-SESSION.md       ← Diese Datei
│   ├── SALES-DAY-1-V2.md              ← Konkrete nächste Schritte
│   ├── MARKETING-MASTER-2026.md       ← Strategy
│   ├── LEGAL-REALITY-CHECK-2026.md    ← Risiko-Check
│   ├── LAUNCH-PLAN.md + .pdf          ← Original 22-Seiten-Plan
│   ├── RECHTSSICHERHEITS-AUDIT.md     ← Detailliertes Legal-Audit
│   ├── COMPUTER-USE-AKTIVIEREN.md + .pdf
│   ├── legal-templates/                ← Disclaimer, AGB-Cap, Pre-Sale, DPA-Checkliste
│   ├── skills/                         ← 8 Skill-Files für ~/.claude/skills/
│   └── claude-agent-setup/             ← (alt, WSL2-Variante, kann ignoriert werden)
├── marketing/
│   ├── STRATEGY-2026.md
│   ├── OFFER.md                        ← Aktuelle Pakete + Preise
│   ├── google-ads-rsa-headlines.md     ← Setup-Vorlagen
│   ├── google-ads-keywords.csv         ← 50+ Keywords
│   ├── google-ads-negatives.csv
│   ├── listings-submission-templates.md ← 11 Listings
│   ├── press-release-launch.md         ← Launch-PM + 1-Jahr-BFSG-PM (28.06.)
│   ├── show-hn-launch-post.md          ← Daten-Story-Draft
│   ├── awesome-lists-pr-template.md
│   ├── recherchescout-profil.md
│   ├── seo-content-plan.md
│   └── partner-targets.md              ← (LinkedIn-DM-orientiert, NICHT mehr nutzen!)
├── scripts/
│   ├── daily-health-check.sh           ← getestet, lokal lauffähig
│   └── generate-*-pdf.mjs              ← Playwright-PDF-Renderer (3 Versionen)
└── .claude/
    └── settings.local.json             ← Nur Notion-DB-Permission (minimal)
```

---

## ⚙️ Tech-Stack & Tools

### Live-System
- **Server:** Hetzner CPX22, Nürnberg, Ubuntu 24.04, IP `178.105.83.0`
- **HTTPS:** Caddy + Let's Encrypt (Auto-Renewal)
- **App:** Node.js 22, Express 4.22, Playwright 1.55.1, Stripe 17.5.0
- **Mail:** Brevo SMTP (`live:true` bedeutet rk_live_-Key + Mailer aktiv)
- **Database:** SQLite (in `scanner/out/*.jsonl` als Append-Log)

### Marketing-Tools (vorgesehen, noch nicht alle aktiviert)
| Tool | Status | Notes |
|---|---|---|
| Google Ads | ⏳ Konto anlegen | 13 €/Tag Budget |
| Bing Ads | ⏳ Konto anlegen | 4 €/Tag, Import von Google |
| Brevo SMTP | ✅ live | für Transaktional + Newsletter |
| Stripe Live | ✅ live | rk_live_-Key, Webhook signed |
| Notion | ⏳ Setup | für Sales-Pipeline (optional) |
| Recherchescout | ⏳ Profil | DACH-Journalisten-Anfragen |
| HARO/Featured | ⏳ Profil | Global Anfragen |

### MCP-Server (in dieser Claude-Code-Session)
- Notion (in `.claude/settings.local.json` aktiv)
- GitHub (für PR-Operations)
- weitere kommen je nach Session-Konfiguration

---

## 🧰 Projekt-Skills (projektspezifisch — vor passenden Tasks nutzen)

| Skill | Wofür |
|---|---|
| `legal-copy-grep` | Deterministischer Regex-Scan auf verbotene Begriffe (BFSG-konform/rechtssicher/garantiert/TÜV/DEKRA …) → **vor jedem PR-Merge** laufen lassen |
| `scan-dataset-aggregat` | Anonymisierte Auswertung echter Scans aus `scanner/out/` → liefert das Show-HN/PR-Dataset (KEINE Kunden-URLs) |
| `stripe-revenue-snapshot` | Umsatz / MRR / Refund-Quote / Paket-Split schnell |
| `ads-performance-pull` | Täglicher Google-Ads-Report (CPA / CTR / Spend / Top-Keywords) |
| `ab-test-tracker` | A/B-Tests anlegen + Signifikanz (p<0,05) auswerten (Bezug: `marketing/pricing-experiments.md`) |
| `backup-verify` | Server-Backup-Status via SSH prüfen (Restore nur mit User-OK) |
| `upsell-trigger` | 14-Tage-Nach-Kauf-Upsell-Drafts erstellen (nie automatisch senden) |

> Operative Memories zusätzlich in `MEMORY.md` (Build-vor-Merge, gh-REST u. a.).

---

## 🚫 Bekannte Sackgassen / NICHT machen

| Was | Warum |
|---|---|
| ❌ LinkedIn-Outreach planen | Matthias hat KEIN LinkedIn-Konto |
| ❌ Persönliche Bekannten-Outreach | Matthias hat KEIN Business-Netzwerk |
| ❌ Cold-Mails | UWG §7 (Tool in `scanner/outreach.js` schon gesperrt) |
| ❌ `marketing/partner-warm-dms.md` benutzen | Vorlage aus alter LinkedIn-Strategie, obsolet |
| ❌ Cowork starten | Matthias nutzt **Claude Code im „Code"-Modus**, NICHT Cowork |
| ❌ WSL2-Setup pushen | Obsolet seit Computer Use direkt in Desktop App |
| ❌ pMax / Display-Ads / Reddit Ads | Recherche: Geld-Verbrennung bei 20 €/Tag |
| ❌ Anwalts-Endabnahme als Pflicht-Blocker | Reality-Check: 4h Selber-Lösen reicht |
| ❌ VSH-Versicherung vorbeugend | Trigger erst ab MRR > 2.000 € |

---

## 🔥 Hot-Files (häufig bearbeitet)

| File | Wann anfassen |
|---|---|
| `scanner/lib/mailer.js` | Live-Flag-Bugs, SMTP-Probleme |
| `scanner/app.js` | Neue Endpoints, Webhook-Änderungen |
| `landingpage-next/components/*.tsx` | UI-Änderungen, Conversion-Optimierung |
| `landingpage-next/app/*/page.tsx` | Legal-Texte, Pages |
| `marketing/*.md` | Strategy-Iteration |
| `docs/SALES-DAY-1-V2.md` | nach jedem Sprint updaten |
| `deployment/docker-compose.yml` | nur bei Service-Changes |

---

## 🎬 Empfohlene erste 3 Aktionen für nächste Session

### Aktion 1: Smoke-Check (60 Sek)
```bash
curl -fSs https://bfsg-fix.de/health
# Erwartung: {"ok":true,"stripe":true,"live":true,"mailer":"aktiv ..."}
```
Wenn `live:false` → SOFORT debuggen (Stripe-Key abgelaufen?).

### Aktion 2: Matthias begrüßen + Status fragen
```
„Hi Matthias, willkommen zurück. Server ist live (status: ok). 
Computer Use ist aktiviert.

Wo möchtest du weitermachen?
1. Sales-Day-1-V2 abarbeiten (Google Ads, Listings, etc.) ← empfohlen
2. Stripe-Live-Test mit eigener Karte
3. Etwas anderes?"
```

### Aktion 3: Erste Marketing-Task im „Code"-Modus mit Browser
Bei Wahl 1 → Computer-Use-Browser nutzen für:
- Google Ads Konto-Onboarding (Matthias muss eingeloggt sein)
- SaaSHub-Submission (mit Text aus `marketing/listings-submission-templates.md`)
- Setup wie in `docs/SALES-DAY-1-V2.md` Schritt 5

---

## 💡 Pro-Tipps für die nächste Session

1. **Multi-Agent-Sprints sind dein Hebel** — bei großen Tasks (Code-Review, Marketing-Research) 3-4 Agents parallel starten
2. **Skills nutzen** — falls Matthias `~/.claude/skills/*.md` aus `docs/skills/` kopiert hat: Trigger-Sätze funktionieren („Tagescheck", „Erstatte Order #...")
3. **Browser-Aktionen über Computer Use** — Permission-Prompts respektieren, nicht überrumpeln
4. **PR-Workflow** — Branch erstellen, klar commit, draft PR, dann ready → squash-merge
5. **Bei Code-Änderungen scanner/ oder *-next/** — Tests lokal laufen lassen (auch wenn CI sie nicht triggert)
6. **Bei Marketing-Files** — keine LinkedIn-Vorlagen mehr, nur 0-Touch-Kanäle (siehe `MARKETING-MASTER-2026.md`)

---

## 🆘 Eskalations-Pfade

| Problem | Wer |
|---|---|
| `/health` nicht ok | SSH zum Server (User mit Mac/PC), Logs prüfen |
| Stripe-Webhook fehlerhaft | `scanner/lib/orders.js` + Stripe-Dashboard |
| Brevo-Mail-Bounces | `marketing/STRATEGY-2026.md` Email-Deliverability |
| Abmahnung erhalten | `docs/LEGAL-REALITY-CHECK-2026.md` Anwalts-Trigger-Liste → Härting/Plutte/Schwenke |
| Server down | Hetzner-Cloud-Console (User-Account), API-Token rotieren falls leaked |
| GitHub Actions Deploy fehlerhaft | `.github/workflows/deploy.yml` + `HETZNER_SSH_KEY` Secret prüfen |

---

## 📈 Geschäfts-Ziele (für Kontext bei Entscheidungen)

- **Kurzfristig (14 Tage):** 2-6 erste Sales (400-1.500 €)
- **Mittelfristig (Monat 3):** 8-15 Sales/Monat, 350-700 € MRR
- **Langfristig (Q1 2027):** Skalierungs-Entscheidung — Hard-Stop oder 10k €/Mo Marketing-Budget
- **KPI-Trigger für Anwalt/VSH:** MRR > 2.000 € ODER erster 2k€-Großkunde ODER erste Abmahnung
- **AOV-Ziel:** 350 € (Mix Basis/Profi/Cookie)
- **CAC-Ceiling:** 177 € (LTV 533 € bei 3:1-Regel)

---

## ✅ Was die letzte Session NICHT geschafft hat (Übergaben)

Nichts blockierendes. Aber für Vollständigkeit:

- ✅ **§ 356a / Widerruf erledigt** — `WiderrufForm.tsx` + `/widerruf` + `/widerrufsbelehrung` live; Checkout-Consent (ausdrücklicher Sofort-Ausführungs-Verzicht) sauber implementiert (`CheckoutModal.tsx` + `scanner/app.js:324`).
- ⏳ Nur Matthias: **Stripe-Live-Testkauf**, **Google/Bing Ads Konten + Karte**, **Listings/PMs absenden** → alles Schritt-für-Schritt mit Copy-Paste-Text in `docs/LAUNCH-HEUTE-CHECKLISTE.md`
- ✅ **5 PRs (#40–#44) gemerged + live deployed + verifiziert** (Co-Founder-Sprint): Conversion-/Legal-Fixes, Launch-Assets + Checkliste, 6 SEO-Seiten, Preis-Toggle-Fix, Funnel-Audit. Live geprüft: Fake-Presse weg, neue Stat da, alle SEO-Routen 200.
- ⏳ AGB-Generator-Abo (IT-Recht-Kanzlei 15 €/Mo) + DPAs sammeln (Brevo/Stripe/Hetzner) — `docs/legal-templates/dpa-checkliste.md`
- 💡 **Wachstums-Unlock — Scan-Dataset für Show HN VERSION 2 + 28.06.-PM:** Sauberster Weg ist der Skill **`scan-dataset-aggregat`** — er wertet die bereits vorhandenen Scans aus `scanner/out/` anonymisiert aus (häufigste WCAG-Fehler, Score-Verteilung, Branchen; **strikt KEINE Kunden-URLs**), statt externe Sites zu scannen. Zahlen erzeugen ist autonom machbar; die Publikation (Show HN / Pressemitteilung) braucht Matthias' Freigabe. `marketing/show-hn-launch-post.md` VERSION 2 wartet auf diese Belege.
- 💡 Landing-Detail (niedrige Prio): Hero-Headline fadet per Animation ein → ~1 s unsichtbar beim Laden (LCP/Conversion-Detail, bewusstes Design — nur falls Core-Web-Vitals leiden).

---

## 🤖 Wenn du diese Datei liest

**Du bist Claude in einer neuen Session.** Matthias erwartet:
1. Du hast `CLAUDE.md` + diese Datei gelesen
2. Du kennst den Live-Status (`bfsg-fix.de` ist live)
3. Du fragst kurz wo er weitermachen will
4. Du bist im Express-Modus: kein Tutorial, sondern Aktion

**Beispiel-Begrüßung:**
> „Hi Matthias. Letzter Stand: Server live, Computer Use aktiviert, alle PRs auf main, Sales-Day-1-V2 als nächste Aufgabe vorbereitet. Wo möchtest du weitermachen — Stripe-Live-Test, Google Ads Setup, oder etwas anderes?"

**Diese Datei wird bei jeder Session-Übergabe aktualisiert.** Stand dieser Version: 20.06.2026.
