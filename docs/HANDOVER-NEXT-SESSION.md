# Handover für die nächste Session

> **Lies das nach `CLAUDE.md` als ZWEITES.**
> **Stand:** 21.06.2026 (Ende Co-Founder-Agenten-Sprint) · **Letzte Session:** Funnel-Verifikation + SEO-Pillar-Pages + Conversion-Fixes + Legal-Sanitize

---

## TL;DR für Schnell-Start (60 Sekunden)

| | |
|---|---|
| **Live-Status** | `/health` = `ok:true, stripe:true, live:true, mailer aktiv, aboEnabled:false` |
| **Letzter Merge** | PR #44 — Preis-Toggle-Fix + Funnel-Audit-Doku |
| **PRs heute gemerged** | #40 #41 #42 #43 #44 — alle squash-gemerged, live deployed + verifiziert |
| **Funnel-Status** | E2E live verifiziert: Scan → Teaser → Checkout-Modal → Stripe-Live |
| **Selbst-Scan** | Unsere eigene Startseite: Score 100/A, 0 Mängel (starkes Trust-Asset) |
| **SEO-Pillar-Pages** | 6 neue Seiten live (alle 200, in Sitemap) |
| **Nächste konkrete Aufgabe** | `docs/LAUNCH-HEUTE-CHECKLISTE.md` abarbeiten — NUR Matthias kann das auslösen (Konto/Karte) |
| **Realistischer erster Sale** | 3–7 Tage nach Ads-Freigabe (nicht same-day, außer Show HN schlägt ein) |

---

## Was Matthias jetzt sofort braucht

**Einzige Blocker sind Matthias' eigene Accounts + Karte.** Alles andere ist fertig und live. Die Checkliste in `docs/LAUNCH-HEUTE-CHECKLISTE.md` führt Schritt für Schritt durch.

**Reihenfolge (Priorität HOCH):**

1. **Stripe-Live-Testkauf + Refund** (15 Min) — Matthias kauft selbst mit eigener Karte das Basis-Paket (199 €), prüft Mail + PDF, dann Refund über Stripe-Dashboard. Pflicht vor allem anderen.
2. **Google-Ads-Konto anlegen + Kampagne live schalten** (45 Min) — Matthias loggt sich ein, Claude begleitet per Teach-Mode. Werte sind fertig (Block B1 in der Checkliste): Suche, 13 €/Tag, Manuelle CPC max 4 €, Exact+Phrase, 15 Keywords, 15 RSA-Headlines, 4 Descriptions, Negatives, Pinning.
3. **Bing Ads** (10 Min) — Konto anlegen + „Import from Google Ads" (4 €/Tag).
4. **Show HN VERSION 1 posten** — Text fertig in `marketing/show-hn-launch-post.md`. Einziger Same-Day-Traffic-Kanal, Münzwurf.
5. **Listings** — SaaSHub (dofollow DR 74!), G2, OMR: Texte fertig in `marketing/listings-submission-templates.md`.
6. **Freie PMs** — openPR / inar / firmenpresse: Texte in `marketing/press-release-launch.md`.

**Was Claude NICHT darf:** Konten anlegen, Kartendaten eingeben, Kampagnen live schalten ohne explizite Freigabe. Nur Teach-Mode/Begleitung per Computer Use.

---

## Offene Matthias-Entscheidungen (keine Blocker, aber brauchen Input)

Diese drei Punkte wurden im Funnel-Audit (PR #44, `docs/FUNNEL-AUDIT-2026-06-21.md`) identifiziert:

1. **Seitentitel „Ist Ihre Website BFSG-konform?"** — enthält das Verbotswort „BFSG-konform" als rhetorische Frage. Schwächer als eine Garantie (ist keine), aber stärkstes SEO-Keyword. Betrifft `landingpage-next/lib/config.ts` SITE.title + HERO.headlineEmph. Entscheidung: behalten oder vorsichtigere Variante (z. B. „Erfüllt Ihre Website das BFSG?")?

2. **Selbst-Scan-Score 100/A als sichtbares Trust-Badge** — empfohlen als Testimonial-Ersatz für die Landing Page, da noch keine echten Kundenstimmen existieren. Formulierung und Platzierung = Design-Entscheidung von Matthias.

3. **„Bald verfügbar"-Karte für Re-Check-Abo in Pricing** — aktuell deaktiviert (`ENABLE_ABO=false`). Lassen (zeigt Roadmap) oder bis Abo-Launch ausblenden (weniger Ablenkung)?

---

## Die 5 Files, die du ZUERST liest

| # | File | Warum |
|---|---|---|
| 1 | `CLAUDE.md` (Root) | Arbeits-Regeln, Pakete, Compliance-Regeln |
| 2 | `docs/HANDOVER-NEXT-SESSION.md` | Diese Datei — aktueller Stand |
| 3 | `docs/LAUNCH-HEUTE-CHECKLISTE.md` | Konkrete nächste Aufgaben (Matthias-Checkliste) |
| 4 | `docs/FUNNEL-AUDIT-2026-06-21.md` | Funnel-Status + offene Entscheidungen |
| 5 | `docs/LEGAL-REALITY-CHECK-2026.md` | Was darf gemacht werden, was nicht |

**Optional je nach Aufgabe:**
- `marketing/google-ads-rsa-headlines.md` — Ad-Headlines + Keywords + Setup (Werte fertig)
- `marketing/listings-submission-templates.md` — Submission-Texte für Listings (fertig)
- `marketing/show-hn-launch-post.md` — Show HN VERSION 1 Text (paste-ready)
- `marketing/press-release-launch.md` — PM-Texte + 28.06.-BFSG-1-Jahr-Hook
- `docs/legal-templates/` — Disclaimer, AGB-Cap

---

## Was heute (21.06.2026) geschafft wurde

**5 Pull Requests gemerged — alle live deployed + verifiziert:**

| PR | Was | Live-Verifizierung |
|---|---|---|
| #40 | fix(legal/conversion): Fake-Presse-Leiste „Bald berichtet in" entfernt; erfundene Stat „5.247 Websites geprüft" → „80+ Prüfregeln (EN 301 549)"; CLAUDE.md Cookie-Preise korrigiert | Fake-Presse weg, neue Stat sichtbar |
| #41 | chore(launch): `docs/LAUNCH-HEUTE-CHECKLISTE.md` erstellt; RSA-Descriptions auf ≤90 Zeichen; „rechtssicherste" + Cold-Mail entfernt; Show-HN ehrlich umgeschrieben (VERSION 1 launchbar, VERSION 2 = Beleg nötig); 5 UWG-Risiko-Marketingdateien nach `marketing/_obsolete/` + WARN-README | Build grün |
| #42 | feat(seo): 6 SEO-Pillar-Pages live — `/bfsg-checkliste-online-shop`, `/bfsg-pruefung-kosten`, `/barrierefreiheitserklaerung-muster` (~1.100 Mo-Suchen, höchstes Volumen), `/cookie-banner-fehler`, `/axe-lighthouse-wave-vergleich`, `/wcag-2-1-vs-2-2`; alle mit metadata, JSON-LD, Lead-CTA, interner Verlinkung; sitemap.ts erweitert | Alle 200, in Sitemap |
| #43 | docs: Zwischen-Handover (durch diese Datei ersetzt) | — |
| #44 | fix(conversion): Preis-Toggle (Monatlich/Jährlich) bei Einmal-Paketen ausgeblendet, zeigt nur noch bei aktivem Abo; `docs/FUNNEL-AUDIT-2026-06-21.md` erstellt | Verifiziert |

**Weitere Deliverables heute:**
- Funnel E2E live verifiziert: Gratis-Scan → Teaser → Checkout-Modal → Stripe-Live; alle Legal-Seiten 200; §312j-Button „Zahlungspflichtig bestellen" + §356a Sofort-Ausführungs-Consent korrekt
- Selbst-Scan bfsg-fix.de mit eigenem Scanner: Score 100/A, 0 Mängel
- Scanner-Limitation dokumentiert: bot-geschützte Seiten (Cloudflare, Zalando) scheitern, normale SMB-Shops ok; example.com → 88, Wikipedia → 100
- Notion-Datenbank „BFSG Sales Pipeline" angelegt (Status / Paket / Betrag / Quelle / E-Mail / URL) für CAC/Conversion-Tracking ab Sale 1
- 2 persistente Memories geschrieben: (a) kein CI-Build → vor Merge lokal bauen (`${PIPESTATUS[0]}` prüfen), (b) gh GraphQL-Quota → PRs via `gh api` REST statt `gh pr create`

---

## Aktuelle Repo-Struktur

```
bfsg-check/
├── CLAUDE.md                              Arbeits-Regeln (lies zuerst!)
├── scanner/                               Node.js Backend (live)
│   ├── app.js                             Express + Stripe-Webhook
│   ├── lib/
│   │   ├── mailer.js                      SMTP + rk_live_-Detection (Zeile 43)
│   │   ├── orders.js                      Stripe-Order-Handling
│   │   ├── invoice.js                     PDF-Rechnungen (Playwright)
│   │   ├── fulfill.js                     Auto-Erfüllung
│   │   └── scan*.js                       axe-core Scanner-Engine
│   └── package.json                       playwright 1.55.1, stripe 17.5.0
├── landingpage-next/                      Next.js + Tailwind v4 (live)
│   ├── app/
│   │   ├── page.tsx                       Startseite
│   │   ├── agb/ datenschutz/ impressum/ widerruf/ widerrufsbelehrung/ kuendigen/
│   │   ├── bfsg-checkliste-online-shop/   SEO-Pillar (PR #42)
│   │   ├── bfsg-pruefung-kosten/          SEO-Pillar (PR #42)
│   │   ├── barrierefreiheitserklaerung-muster/  SEO-Pillar, ~1.100/Mo (PR #42)
│   │   ├── cookie-banner-fehler/          SEO-Pillar (PR #42)
│   │   ├── axe-lighthouse-wave-vergleich/ SEO-Pillar (PR #42)
│   │   └── wcag-2-1-vs-2-2/              SEO-Pillar (PR #42)
│   ├── components/                        Hero, ScanForm, PricingCards, CheckoutModal etc.
│   ├── lib/config.ts                      SITE.title + HERO.headlineEmph (Entscheidung #1 oben)
│   └── CLAUDE.md                          „This is NOT the Next.js you know" — lies node_modules docs
├── admin-next/                            Admin-Dashboard (Next.js)
├── landingpage/                           Legacy HTML (Volume-Mount-Fallback)
├── deployment/                            docker-compose.yml + Caddyfile
├── docs/
│   ├── HANDOVER-NEXT-SESSION.md           Diese Datei
│   ├── LAUNCH-HEUTE-CHECKLISTE.md         Matthias-Checkliste (NEU, PR #41)
│   ├── FUNNEL-AUDIT-2026-06-21.md         Funnel-Status + offene Entscheidungen (NEU, PR #44)
│   ├── SALES-DAY-1-V2.md                 Detaillierte Schritte (weiterhin gültig)
│   ├── LEGAL-REALITY-CHECK-2026.md        Risiko-Check
│   ├── MARKETING-MASTER-2026.md           Strategy
│   ├── STRIPE-LIVE-TESTKAUF.md            Anleitung Testkauf
│   ├── legal-templates/                   Disclaimer, AGB-Cap, Pre-Sale, DPA-Checkliste
│   └── skills/                            8 Skill-Files für ~/.claude/skills/
├── marketing/
│   ├── google-ads-rsa-headlines.md        15 Headlines + 4 Descriptions (≤90 Zeichen, fertig)
│   ├── google-ads-keywords.csv            50+ Keywords
│   ├── google-ads-negatives.csv           Negativ-Liste
│   ├── listings-submission-templates.md   Texte für SaaSHub/G2/OMR (paste-ready)
│   ├── show-hn-launch-post.md             Show HN VERSION 1 (launchbar)
│   ├── press-release-launch.md            PM-Texte + 28.06.-BFSG-1-Jahr-Hook
│   ├── seo-content-plan.md                SEO-Strategie
│   ├── OFFER.md                           Aktuelle Pakete + Preise
│   ├── STRATEGY-2026.md                   Strategie-Übersicht
│   └── _obsolete/                         5 UWG-Risiko-Dateien quarantänt (PR #41) + WARN-README
├── scripts/
│   ├── daily-health-check.sh              Lokal lauffähig
│   └── generate-*-pdf.mjs                 Playwright-PDF-Renderer
└── .claude/
    └── settings.local.json                Notion-DB-Permission (minimal)
```

---

## Operative Fakten für Code-Arbeit

| Fakt | Detail |
|---|---|
| **Kein PR-CI-Build** | Merge deployt direkt live → Build vorher **lokal verifizieren** (Worktree + `npm run build`, `${PIPESTATUS[0]}` prüfen) |
| **Keine lokalen node_modules** | `landingpage-next/` läuft via Docker — kein `npm install` im Worktree nötig (und auch nicht möglich ohne node_modules) |
| **gh GraphQL-Quota** | Kann erschöpft sein → PRs + Merges via `gh api` REST statt `gh pr create` |
| **gh Auth** | Authentifiziert als `matzeseba` |
| **Deploy-Mechanismus** | GitHub Actions on main-push, concurrency: cancel-in-progress false → Runs queuen sich |
| **Worktree-Isolation** | Agenten arbeiten in isolierten git-Worktrees — Hauptrepo-Dateien ggf. nicht sichtbar |
| **Scanner-Limitation** | Bot-geschützte Seiten (Cloudflare, Zalando etc.) scheitern — normale SMB-Shops ok |

---

## Tech-Stack & Live-System

| | |
|---|---|
| **Server** | Hetzner CPX22, Nürnberg, Ubuntu 24.04 |
| **HTTPS** | Caddy + Let's Encrypt (Auto-Renewal) |
| **App** | Node.js 22, Express 4.22, Playwright 1.55.1, Stripe 17.5.0 |
| **Mail** | Brevo SMTP (`live:true` = rk_live_-Key + Mailer aktiv) |
| **Frontend** | Next.js 15 + Tailwind v4 + shadcn (base-nova) |
| **Database** | SQLite (Append-Log in `scanner/out/*.jsonl`) |
| **Stripe-Key** | rk_live_* (Restricted, nicht sk_live_*) |

### Marketing-Tools — Status

| Tool | Status |
|---|---|
| Google Ads | Konto noch nicht angelegt — Matthias-Aktion ausstehend |
| Bing Ads | Konto noch nicht angelegt — Matthias-Aktion ausstehend |
| Brevo SMTP | Live |
| Stripe Live | Live (rk_live_*) |
| Notion Sales Pipeline | Angelegt (21.06.2026, Co-Founder-Sprint) |
| SaaSHub / G2 / OMR | Texte fertig, Einreichung ausstehend — Matthias-Aktion |
| Show HN | Text fertig (VERSION 1), Post ausstehend — Matthias-Aktion |
| Recherchescout / HARO | Profil-Setup ausstehend |

---

## Bekannte Sackgassen — NICHT machen

| Was | Warum |
|---|---|
| LinkedIn-Outreach | Matthias hat kein LinkedIn-Konto |
| Persönliche Bekannte ansprechen | Matthias hat kein Business-Netzwerk |
| Cold-Mails | UWG §7 (Tool in `scanner/outreach.js` gesperrt) |
| `marketing/_obsolete/` nutzen | Quarantänte UWG-Risiko-Dateien — WARN-README lesen |
| WSL2-Setup pushen | Obsolet seit Computer Use direkt in Desktop App |
| pMax / Display-Ads / Reddit Ads | Geld-Verbrennung bei 20 €/Tag Budget |
| Anwalts-Endabnahme als Blocker | Solo <30k€/Jahr: Self-Service mit Disclaimer + AGB-Cap reicht |
| VSH-Versicherung vorbeugend | Trigger erst ab MRR > 2.000 € |
| „BFSG-konform" als Marketing-Aussage | UWG §5 Irreführung — nur „automatisierte technische Analyse" |
| `gh pr create` bei Quota-Erschöpfung | stattdessen: `gh api` REST |

---

## Ehrlicher Sales-Realitäts-Check

- **Erste Verkäufe realistisch in 3–7 Tagen** nach Ads-Freigabe (Google-Ads: 24–72h Freigabe + Lernphase; Listings/SEO: indexieren über Tage/Wochen)
- **Same-Day-Sale aus Null-Traffic-Kaltstart ist nicht garantierbar** — einziger Versuch: Show HN (Münzwurf)
- **Setup ist 100 % startklar und live** — der Ball liegt bei Matthias' Account-Aktionen

---

## Eskalations-Pfade

| Problem | Weg |
|---|---|
| `/health` nicht ok | SSH zum Server (User), Logs prüfen → `docker logs bfsg-scanner` |
| Stripe-Webhook fehlerhaft | `scanner/lib/orders.js` + Stripe-Dashboard Events |
| Brevo-Mail-Bounces | `docs/EMAIL-DELIVERABILITY.md` |
| Abmahnung erhalten | `docs/LEGAL-REALITY-CHECK-2026.md` Anwalts-Trigger-Liste → Härting / Plutte / Schwenke |
| Server down | Hetzner-Cloud-Console (User-Account), API-Token rotieren falls leaked |
| GitHub Actions Deploy fehlerhaft | `.github/workflows/deploy.yml` + `HETZNER_SSH_KEY` Secret prüfen |
| Google-Ads-Ablehnung | Werbung anpassen (kein „BFSG-konform", kein „rechtssicher") → `marketing/google-ads-rsa-headlines.md` |

---

## Backlog — nicht geschafft (ehrlich)

| Was | Warum offen | Prio |
|---|---|---|
| Mehrstufiger Multi-Agent-Audit (6 Dimensionen + adversariale Verifikation) | Session-Token-Limit (Reset 02:20 Uhr Europe/Berlin) — nur fokussierte Einzel-Analyse | Mittel |
| Volle A11y-Runde (Fokus-Reihenfolge, aria-Labels, prefers-reduced-motion) | Nicht angefangen | Niedrig (Score schon 100) |
| Aggregiertes Scan-Dataset für Show HN VERSION 2 + 28.06.-PM | Wachstums-Unlock; Publikation = Matthias-Freigabe | Mittel (Trigger: 100 Scans) |
| Hero-Headline Fade-in (~1 s unsichtbar) | LCP/Conversion-Detail | Niedrig |
| AGB-Generator-Abo (IT-Recht-Kanzlei 15 €/Mo) | Matthias-Aktion | Mittel |
| DPAs sammeln (Brevo/Stripe/Hetzner/Sentry) | Matthias-Aktion | Mittel |

---

## Geschäfts-Ziele

| Horizont | Ziel |
|---|---|
| 14 Tage | 2–6 erste Sales (400–1.500 €) |
| Monat 3 | 8–15 Sales/Monat, 350–700 € MRR |
| Q1 2027 | Skalierungs-Entscheidung: Hard-Stop oder 10k €/Mo Marketing-Budget |
| KPI-Trigger Anwalt/VSH | MRR > 2.000 € ODER erster 2k€-Großkunde ODER erste Abmahnung |
| AOV-Ziel | 350 € (Mix Basis/Profi/Cookie) |
| CAC-Ceiling | 177 € (LTV 533 € bei 3:1-Regel) |

---

## Wenn du diese Datei liest

**Du bist Claude in einer neuen Session.** Matthias erwartet:
1. Du hast `CLAUDE.md` + diese Datei gelesen
2. Du kennst den Live-Status — Server ist live, 5 PRs wurden heute gemergt
3. Du fragst kurz wo er weitermachen will
4. Du bist im Express-Modus: keine Tutorials, sondern Aktion

**Empfohlene Begrüßung:**
> „Hi Matthias. Server live (ok:true, stripe:true). Heute wurden 5 PRs gemerged und live verifiziert — Funnel läuft E2E, 6 SEO-Seiten sind live, Fake-Claims sind raus. Nächster Schritt liegt bei dir: `docs/LAUNCH-HEUTE-CHECKLISTE.md` — Stripe-Testkauf, dann Ads. Wo fangen wir an?"

---

*Stand: 21.06.2026, Ende Co-Founder-Sprint. Nächste Session-Übergabe überschreibt diese Datei.*
