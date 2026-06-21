# 🏛️ Agency-Agents Pre-Launch-Audit — Master-Synthese

> **Datum:** 21.06.2026 · **Durchgeführt von:** 6 parallele Agency-Agents-Teams (`msitarzewski/agency-agents`, frisch installiert)
> **Geprüft:** Security · Code/Payments · Accessibility (eigene Seite) · Legal/UWG · Conversion/UX · SRE/Reliability
> **Abgeglichen gegen:** `origin/main` (Working-Branch war 5 Commits behind — siehe Methodik-Hinweis unten)

---

## ⚠️ Methodik-Hinweis (WICHTIG)

Dieser Audit lief auf Branch `docs/handover-final-2026-06-21`, der **0 ahead / 5 behind `origin/main`** war. Drei Teams (Legal, Conversion, teils A11y) sahen daher Dinge als „offen", die auf **main bereits gefixt** sind. Alle Befunde unten sind **gegen `origin/main` re-validiert**:

- ✅ **Bereits auf main gefixt** (NICHT mehr tun): LogoCloud Fake-Presse entfernt · „5.247 Websites geprüft" entfernt · irreführender Preis-Toggle bei Einmal-Paketen entfernt (PRs #40/#42/#44).
- 🔴 **Noch offen auf main** (echte To-dos): siehe Tabellen.

---

## 🚦 Launch-Ampel

| Bereich | Ampel | Begründung |
|---|---|---|
| **Security** | 🟡→🔴 | 1 Critical (SSRF-Redirect-Bypass) muss vor Skalierung des Traffics gefixt werden |
| **Code/Payments** | 🟡 | Kern solide (server-autoritative Preise, Idempotenz). 3 Correctness-Bugs (GoBD-Nummern, toter Resend-Befehl, Replay≠Fulfill-Dedup) |
| **Accessibility (eigene Seite)** | 🟡 | Überdurchschnittlich, aber 5 Major-Findings, die ein axe/Lighthouse-Lauf SOFORT zeigt — existenziell, weil wir genau das verkaufen |
| **Legal/UWG** | 🟡 | 0 harte Abmahn-Stopper auf main. 3 High-Risk-Formulierungen offen |
| **Conversion** | 🟢→🟡 | Funktioniert, aber Scan-Ergebnis→Kauf-Brücke ist die größte ungenutzte Conversion-Quelle |
| **SRE/Reliability** | 🟡→🔴 | Backup-Kette gebaut, aber **Live-Aktivierung + 1 echter Restore-Test unbestätigt** → Datenverlust-Risiko für bezahlte Orders + GoBD-Rechnungen |

**Gesamt-Urteil: Launch-fähig, ABER vor dem Hochdrehen des Ad-Budgets diese 5 Dinge fixen:**
1. 🔴 **SSRF-Redirect-Pin** (Security C1) — Server kann zu internen/Metadata-IPs umgeleitet werden.
2. 🔴 **Backup-Kette scharf schalten + 1 Restore-Test** (SRE S-01) — sonst Totalverlust bei Disk-Failure.
3. 🟠 **GoBD-Rechnungsnummern-Bug** (Code C2) — verbrennt Nummern bei Mail-Fehler.
4. 🟠 **Legal-Copy** (StatsBar „vor Gericht standhält", TrustSection-Badges) — UWG §5 vor Paid-Traffic.
5. 🟠 **A11y MotionConfig + ResultCard-Differenzierung** — wir dürfen unseren eigenen axe-Lauf nicht failen.

---

## 🔐 Security (Team: security-penetration-tester + appsec-engineer)

| ID | Sev | Ort | Problem | Fix | Owner |
|---|---|---|---|---|---|
| **C1** | 🔴 Critical | `lib/url-guard.js` + `lib/scan*.js` | SSRF nur am Original-Host geprüft; `page.goto()` folgt 30x-Redirects zu `169.254.169.254`/`127.0.0.1`/RFC1918 — **kein IP-Pin, kein `page.route`-Hook** | Chromium mit `--host-resolver-rules=MAP` + `page.route`-Hook der `assertPublicHttpUrl` pro Request re-prüft | **Claude (PR)** |
| H1 | 🟠 High | `deployment/cloud-init.yaml` | Echte Owner-Mail `matthiasseba92@…` ×3 git-tracked (public clone) | Platzhalter/Rollen-Adresse; ggf. History scrubben | Claude+User |
| H2 | 🟠 High | `lib/url-guard.js` | DNS-Rebinding-Defense schwach; `DNS_PIN_STRICT=false`-Kill-Switch; Crawl-Pin ist No-op (`addrCache` nie gelesen) | Auf C1-IP-Pin stützen; toten Crawl-Pin entfernen | Claude |
| H3 | 🟠 High | `app.js` | Free-Scan teilt globalen `concurrencyGate(2)` mit Paid-Fulfillment → DoS/Abuse-Proxy | Getrennte Lanes + Free-Scan-Ceiling | Claude |
| M5 | 🟡 Med | `lib/invoice.js`/`report.js` | PDF-Render in `--no-sandbox`-Chromium mit JS an; Escaping heute korrekt, aber ungetestet | `javaScriptEnabled:false` + Injection-Tests | Claude |

*Bestätigt solide (kein Handlungsbedarf): Webhook-Sig-Verify mit Raw-Body, atomare Idempotenz, konstantzeit Admin-Compare, Mailer-Header-Injection-Schutz, Dependency-Pinning, PII-Redaction.*

---

## 💳 Code / Payments (Team: engineering-code-reviewer)

| ID | Sev | Ort | Problem | Fix | Owner |
|---|---|---|---|---|---|
| **C2** | 🔴 Critical | `app.js:139/156/450` | Mail-Fehler verbrennt **zwei sequentielle GoBD-Rechnungsnummern** pro Zahlung | `invoiceNumber` via `markStatus` VOR dem Mailen in die Order persistieren | **Claude (PR)** |
| **C3** | 🔴 Critical | `app.js:159` | Alert verweist auf `node resend.js` — **Datei existiert nicht** | Auf echten `curl -X POST …/api/resend/<id>` zeigen | **Claude (PR)** |
| C1 | 🔴 Critical | `lib/orders.js` | Event-Dedup ≠ Fulfillment-Dedup; Stripe-Dashboard-Replay (neue event.id) re-scannt/re-mailt/re-invoiced | Guard auf Order-Status (`FULFILLING/MAILED/RESENT → return`) | Claude |
| H1 | 🟠 High | `app.js:188` | Abo: `inv.subscription` top-level → bei neuer Stripe-Shape `undefined` → stiller Fehler, Kunde zahlt umsonst | `inv.parent?.subscription_details?.subscription`-Fallback + Alert | Claude (nur falls Abo an) |
| M4 | 🟡 Med | `app.js:210` | 0-€-Rechnung mit echter Nummer möglich | Bei `amount ≤ 0` skip + Alert | Claude |

**Abo-Verdikt:** `ENABLE_ABO=false` ist korrekt. Abo-Webhook-Logik (`app.js:182-261`) hat **0 Handler-Tests** → vor Aktivierung Tests + `stripe trigger invoice.paid`-Replay gegen API 17.5.0 Pflicht.

---

## ♿ Accessibility — UNSERE EIGENE Seite (Team: testing-accessibility-auditor)

> Existenziell: Wir verkaufen WCAG-Audits. Ein Prospect läuft axe auf bfsg-fix.de. Wir müssen sauberer als sauber sein.
> **Verdikt: PARTIALLY CONFORMS — keine Blocker, aber 5 Major, die ein axe-Lauf sofort zeigt.** (Ziel-Dateien sind branch==main → alle gültig.)

| ID | WCAG | Sev | Ort | Fix | Owner |
|---|---|---|---|---|---|
| **A-01** | 2.3.3/2.2.2 | 🟠 Major | `layout.tsx` | `prefers-reduced-motion` deckt die 35 Framer-Motion-JS-Animationen NICHT ab (nur CSS). **`<MotionConfig reducedMotion="user">` → 1 Zeile fixt alle 10 Komponenten** | **Claude (PR)** |
| **A-03** | 1.4.1 | 🟠 Major | `ResultCard.tsx:126` | Farbe als einziger Bedeutungsträger (3× gleicher roter Punkt) — peinlich für A11y-Vendor. Icon (`AlertCircleIcon`) statt Punkt | **Claude (PR)** |
| A-02 | 1.4.1 | 🟠 Major | `CookieBanner.tsx:167` | „Alle akzeptieren" filled vs „Nur notwendige" dim outline → visuelle Imbalance (a11y + TDDDG-Optik). Gleiche visuelle Wertigkeit | Claude |
| A-04 | 1.4.3 | 🟠 Major* | `text-brand-mint`/`-amber` | Kontrast-Verdacht <4.5:1 (Footer, PricingCards). *Braucht Live-axe-Messung* → dunkleres Text-Token | Claude+Verify |
| A-07 | 3.3.1/4.1.3 | 🟠 Major | CheckoutModal + 3 Legal-Forms | Fehler nur als Toast, nicht feld-assoziiert (`aria-invalid`/`describedby`). `ui/form.tsx`-Primitives machen es bereits richtig | Claude |

**Empfehlung:** `@axe-core/cli` in CI gegen die gebaute Seite — ein A11y-Vendor ohne A11y-Gate in der eigenen Pipeline ist das eigentliche Risiko.

---

## ⚖️ Legal / UWG (Team: security-compliance-auditor)

> **§ 356a Widerruf-Button-Verdikt: ✅ ERFÜLLT** — Handover-Flag „OVERDUE" ist **stale**. `/widerruf` + `/api/widerruf`, `/widerrufsbelehrung` (inkl. „Vorzeitiges Erlöschen" für digitale Inhalte + Muster), und Checkout-§356-Abs.5-Waiver-Checkbox existieren und sind korrekt verdrahtet. **Kein Blocker.**

| ID | Risiko | Sev | Ort (origin/main) | Fix | Owner |
|---|---|---|---|---|---|
| F-02 | UWG §5 | 🟠 High | `StatsBar.tsx:39` „…vor Gericht standhält" | → „Normen, auf die sich Behörden und Kanzleien berufen" | **Claude (PR)** |
| F-02b | UWG §5 | 🟠 High | `TrustSection.tsx:19` „DSGVO-konform"-Badge | → „Datenschutz nach DSGVO" | **Claude (PR)** |
| F-08 | UWG §5 | 🟠 High | `TrustSection.tsx:25` „menschlicher Sichtung" neben Gratis-Auto-Scan | Scope auf „Bezahlreports mit menschlicher Sichtung" | **Claude (PR)** |
| F-01 | UWG §5 | 🟠 High | `config.ts:57` H1 „BFSG-konform?" (Frage) | Erwägen: „WCAG-2.1-AA-geprüft?"/„BFSG-fit?" (Frageform gilt als grenzwertig-ok) | User-Entscheid |
| F-05 | §356a | 🟡 Med | Widerrufsbelehrung | Nicht wortgleich Anlage-1-EGBGB → 1× 5-Min-Anwalts-Sign-off für Privileg-Effekt | Anwalt |

---

## 📈 Conversion / UX (Team: design-ux-architect + marketing-growth-hacker)

**Top-3 Hebel:**
1. **Scan-Ergebnis→Kauf-Brücke zu schwach** — `ResultCard` zeigt 3 generische Findings, springt direkt auf Profi/499 €. Nennt nie die Anzahl versteckter Findings, quantifiziert nie das Risiko (Abmahnung 3.500–20.000 € — steht in eurer OFFER.md, fehlt am Kaufmoment), bietet Cold-Traffic keinen 199-€-Einstieg.
2. **Trust-Signale teils hohl/riskant** — echte Anker (DE-Hosting, menschl. Review, 30-Tage-Geld-zurück, Stripe) müssen lauter werden als schwache.
3. **Mobile unterversorgt** — kein Sticky-CTA, „Gratis prüfen" versteckt im Burger; kein persistenter Post-Scan-Kaufbalken.

**Quick-Wins (gegen main re-validiert):**
| # | Ort | Änderung | Status |
|---|---|---|---|
| 1 | `page.tsx` LogoCloud | Fake-Presse entfernen | ✅ auf main schon erledigt |
| 2 | `config.ts` „5.247 geprüft" | durch verifizierbare Anker ersetzen | ✅ auf main schon erledigt |
| 3 | `StatsBar.tsx:39` | „vor Gericht standhält" entschärfen | 🔴 offen (= Legal F-02) |
| 4 | `ResultCard.tsx:28-57` vs `report.js:16` | Noten-Schwellen angleichen (Seite zeigt „Note C", PDF „Note B" bei gleichem Score) | 🔴 offen |
| 5 | `ResultCard.tsx:142` | Risiko-/Hidden-Findings-Teaser: „{n} Befunde — 3 sichtbar, Rest im Vollreport. Abmahnung kostet meist 3.500–20.000 €." | 🔴 offen |

**Doc-Sync-Flag:** `marketing/OFFER.md`+`STRATEGY-2026.md` haben **veraltete Preise** (Cookie 99/249, Abo 49) — die Live-Seite ist korrekt (Cookie 49/79, Abo 39). Marketing-Docs nachziehen.

---

## 🛠️ SRE / Reliability (Team: engineering-sre + devops-automator)

| ID | Sev | Area | Problem | Fix | Owner |
|---|---|---|---|---|---|
| **S-01** | 🔴 Critical | Backup | Backup-Kette gebaut, aber Live-Aktivierung (`BACKUP_GPG_RECIPIENT`/`BACKUP_TARGET`/`rclone.conf`/GPG-Pubkey) + echter Restore-Test **unbestätigt** → Totalverlust bezahlter Orders + GoBD-Rechnungen bei Disk-Failure | 4 Env/Config-Items am Server prüfen + 1 echten Off-site-Restore-Test | **User (Server)** |
| D-01 | 🟠 High | Deploy | `up -d --build` hart-restartet ohne Draining; Webhook ackt Stripe `200` VOR 10–60s-Fulfillment → Rebuild mid-flight verliert Order | `stop_grace_period`+SIGTERM-Drain, claim-before-ack, täglicher Stripe-vs-Orders-Reconcile | Claude+User |
| M-01 | 🟠 High | Monitoring | Uptime-Watch nur HTTP-200. Keine Alerts für Disk-Full/OOM/Cert-Expiry/Webhook-Failure | Health-Check cronen mit Disk/Mem-Schwellen; Cert-Expiry in uptime-watch; Sentry-Live verifizieren | Claude+User |
| S-02 | 🟠 High | Backup | Off-site-Target nicht erzwungen; gleiche Location = ein Incident killt beides | Cross-Provider/Region-Target + Alert bei Local-only-Fallback | User |
| C-01 | 🟡 Med | Capacity | Keine `mem_limit`; `invoice.js` startet separates ungated Chromium → OOM-Kill-Risiko auf CPX22 | Per-Service-mem_limit + PDF-Chromium durch Concurrency-Gate | Claude |

---

## ✅ Was Claude jetzt direkt umsetzt (sicher, build-verifizierbar, kein Auto-Deploy)

In einem sauberen Branch ab `origin/main`, als PR (Merge = User, weil Merge live deployt):
- **A-01** MotionConfig reduced-motion (1 Zeile, 35 Animationen)
- **F-02 / F-02b / F-08** Legal-Copy entschärfen (StatsBar + TrustSection)
- Build-Verify `landingpage-next` vor PR

## 📋 Was als nächstes ansteht (priorisiert, mit User-OK weil deploy-/server-/anwaltsrelevant)
1. 🔴 SSRF-Pin (C1) + Backup-Schärfung (S-01) — höchste Priorität vor Ad-Skalierung
2. 🟠 Code-Fixes C2/C3/C1 (GoBD-Nummern, Resend-Befehl, Replay-Dedup) — Worktree + Tests + PR
3. 🟠 ResultCard-Conversion-Brücke + Noten-Schwellen-Fix
4. 🟡 A11y-Rest (Cookie-Balance, Form-Fehler, Kontrast-Messung), `@axe-core/cli` in CI
5. 🟡 Marketing-Doc-Preis-Sync, Anwalts-5-Min-Sign-off Widerrufsbelehrung

---

*Volldetails je Bereich: `docs/agency-audits/2026-06-21-{security-pentest,code-review,accessibility,legal-compliance,conversion-ux,sre-reliability}.md`*
