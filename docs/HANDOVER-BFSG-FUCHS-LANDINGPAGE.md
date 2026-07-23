# Handover — BFSG-Fuchs Landingpage Marken-Relaunch (Fox-Theme)

> **Stand:** 29.06.2026 · **Branch:** `feat/bfsg-fuchs-landingpage` · **PR:** offen (ready, NICHT gemergt)
> Setzt das gelieferte Claude-Design **„BFSG-Fuchs Landingpage.dc.html"** als Re-Skin auf die
> bestehende `landingpage-next/`-Verdrahtung um. Teil des Rebrands BFSG-Check → **BFSG-Fuchs**
> (Option B, siehe `docs/HANDOVER-MASCOT-FILO.md`).

---

## ✅ Was in dieser Session erledigt wurde (autonom, build-/a11y-/legal-verifiziert)

**Fox-Theme (token-driven, beide Modi):** `app/globals.css` komplett auf die BFSG-Fuchs-Palette retuned — warmes Braun-Schwarz `#0f0b09`, **Orange `#ED6A33`** = Marken-Akzent (Kicker, Akzentwort „BFSG", Step-Badges, Glows), **Mint `#34d99a`** = Action/CTA (Buttons, Haken), Amber/Rot-Akzente, warme Creme-Hairlines. Dark = erzwungener Standard; Light-Toggle ebenfalls auf die Marke retuned + AA-verifiziert. Fonts unverändert (Schibsted/Hanken/JetBrains = Design-Fonts).

**Maskottchen + Logo:** Fuchs-Wappen-Logo (Header/Footer/RiskBand/AnnouncementBar/CookieBanner) + Polo-Fuchs-Maskottchen (Hero rechts über der Report-Card + Final-CTA), via `next/image` mit korrekter Aspect-Ratio (kein CLS). PNGs optimiert: Logo **1,9 MB → 64 KB**, Maskottchen **1,7 MB → 103 KB**; Favicon `app/icon.png`.

**Marken-Copy (Fox-Voice):** `lib/config.ts` (Single Source of Truth) + alle 16 Legal-/SEO-Seiten + JSON-LD + OG-Karte auf „BFSG-Fuchs". „BFSG" als **Gesetz/Keyword** überall erhalten; „BFSG-**Checkliste**" (Content) bewusst NICHT umbenannt. E-Mail = `info@bfsg-fuchs.de` (seit 23.07.2026; ersetzt das gelöschte `info@bfsg-fix.de`).

**Alle 11 Sektionen re-skinned + visuell verifiziert (Desktop dark + light + Mobile 375px):** Announcement, Header, Hero (Scan + Maskottchen + Live-Report-Card mit Scan-Animation), Trust-Strip, Rule-Ticker, Risk-Band + Live-Countdown, How-it-works, Why-us + Code-Snippet, Direktvergleich (qualitativ, UWG-sauber), Pricing (Plan-Finder + 3 Karten), Cookie (2 Karten, zentriert), FAQ, Final-CTA, Footer. Mobile-Sticky-CTA erscheint jetzt consent-unabhängig (Conversion-Leck behoben).

**Prozess (Spezialisten-Team):** Foundation (Tokens/Copy/Meta von Hand) → **7 parallele Frontend-Spezialisten** (disjunkte Komponenten-Gruppen) → **5-Lens-Adversarial-Review** (Visual-Fidelity / A11y / Legal-UWG / Code-Wiring / CRO) → Fix-Pass. Das Review fing u. a. eine **UWG-§5-Regression** (das Design trug noch den von PR #91 entfernten „30 Tage Geld-zurück"-Wortlaut — wieder entfernt) sowie mehrere WCAG-Kontrast-Fehler.

**Verifikation (alles grün):**
- `next build` ✓ (21/21 Seiten) · `tsc --noEmit` ✓ · `eslint` ✓ (0 Fehler).
- `legal-copy-grep`: identische Baseline wie origin/main (ROT 16 / GELB 5 / INFO 46) → **kein neues Rechtsrisiko**; die 16 ROT sind unveränderte Disclaimer-Negationen („keine Garantie für BFSG-Konformität") + Keyword-/Regel-Erwähnungen in `marketing/*.md`.
- A11y: `--input`-Feldrahmen auf ≥3:1 angehoben (WCAG 1.4.11), Footer-Newsletter-Hover + Amber-Text im Light-Mode auf ≥4.5:1 gefixt (WCAG 1.4.3), Fokus/aria/Live-Regions/reduced-motion intakt.
- Live-Preview: keine Console-Errors.

**Wiring 1:1 erhalten:** Scan (`/api/scan`), Stripe-Checkout (`checkout-context`/PricingCards/CookieSection/CheckoutModal), Preise/Pakete/PackageIds, alle Legal-Disclaimer.

**Bewusst NICHT geflippt:** funktionale URLs (canonical/OG/sitemap) + Mail + Stripe bleiben auf **bfsg-fix.de** (live, DNS+TLS+Stripe ok). Marke = BFSG-Fuchs. So funktioniert die Seite sofort beim Merge, ohne dass die Domain umgezogen sein muss. Domain-Cutover = unten, owner-gated.

---

## 📋 Was DU noch tun musst (konnte ich nicht autonom + risikofrei erledigen)

### 0. PR mergen = Live-Deploy (1 Klick, deine Entscheidung)
- Fertiger, geprüfter PR liegt vor. **Merge auf `main` löst Auto-Deploy auf bfsg-fix.de aus** (GitHub Actions, ~40 s).
- Ich merge bewusst NICHT eigenmächtig: kundensichtbarer Marken-Relaunch + kein CI-Netz + du hast geschlafen → das ist dein Go. Build-/Screenshot-Beleg liegt im PR.
- **Geht sofort live auf bfsg-fix.de — KEIN Domain-Wechsel nötig.**

### 1. Domain bfsg-fuchs.de scharf schalten (eigentlicher Marken-Cutover)
- ✅ **Besitz geprüft (29.06.):** `bfsg-fuchs.de` ist BEREITS bei INWX registriert (NS = ns.inwx.de / ns2.inwx.de / ns3.inwx.eu). Keine Registrierung nötig.
- 🔴 **DNS-Befund (29.06.):** A-Record `bfsg-fuchs.de` zeigt aktuell auf **`185.181.104.242`** — das ist die **tote INWX-Park-IP**, die am 28.06. bei den anderen Domains entfernt wurde (vgl. `dns-inwx-dead-ip-185`, killte ~50 % Traffic/Webhooks). Muss auf **`178.105.83.0`** (Hetzner) geändert werden.
- [ ] **DNS (INWX):** A-Record `bfsg-fuchs.de` + `www` → `178.105.83.0` (Park-IP 185.181.104.242 entfernen). IDN `barrierefrei-prüfen.de`/`-pruefen.de` als Redirect sichern.
- ⚠️ **Reihenfolge wichtig:** DNS NICHT isoliert flippen — ohne passenden Caddy-Site-Block (TLS) + Stripe-/Frontend-Flip entsteht ein kaputter Zwischenzustand. Als EINE koordinierte Aktion fahren (DNS → Caddy → SITE.url → Stripe → Brevo). Den DNS-Teil bei INWX kann Claude per Computer Use übernehmen, sobald du den Cutover startest + den Stripe-Teil (deine Ausnahme) freigibst.
- [ ] **Caddy (Server):** `bfsg-fuchs.de` als neue Primär (TLS auto); `bfsg-fix.de`/`bfsg-held.de`/`barrierefrei-pruefen.de` → 301.
- [ ] **Frontend-Flip:** `lib/config.ts` `SITE.url` → `https://bfsg-fuchs.de` (+ `sitemap.ts`/`robots.ts` `siteUrl`). 1–3 Konstanten.

### 2. Stripe (NUR du — Dashboard für mich gesperrt)
- [ ] `success_url`/`cancel_url`/`PUBLIC_URL` im Scanner-Backend → bfsg-fuchs.de. Webhook ggf. zusätzlich `https://bfsg-fuchs.de/webhook`.
- [ ] Offener Altpunkt: Webhook-Event `customer.subscription.updated` ergänzen.

### 3. Brevo / Mail-Domain
- [ ] Sender-Domain `bfsg-fuchs.de` in Brevo + DKIM/SPF/DMARC. Server-`.env` `FROM_*`/`INVOICE_CONTACT_EMAIL`/`PUBLIC_URL` → bfsg-fuchs.de.
- [x] `info@bfsg-fuchs.de` angelegt + Weiterleitungen übernommen (erledigt 23.07.2026, LP zeigt `info@bfsg-fuchs.de`).

### 4. Scanner-Backend-Rebrand (eigene, reviewte Folge-PR — NICHT in dieser PR)
- `scanner/lib/invoice.js` · `mailer.js` · `dsgvo.js` (+ `.env.example`, `scripts/stripe-trigger.sh`) tragen „BFSG-Check" in LIVE-Mails/Rechnungen. Bewusst getrennt (kundensichtbar, an Domain/Brevo-Cutover gekoppelt). Tests grün halten (vorher `npm i nodemailer --ignore-scripts`).

### 5. Markenrecht (du / Anwalt)
- [ ] DPMA/EUIPO „BFSG-Fuchs" (Kl. 42/35/41) + Fuchs-Bildmarke (Wiener 03.01). DPMA prüft ältere Rechte NICHT selbst.

---

## 🗒️ Nice-to-have / Backlog (nicht blockierend)
- Konsequente Pricing-CTA-Verben („Report sichern" statt „Paket kaufen") — A/B-würdig, bewusst ausgelassen.
- `docs/brand/bfsg-fuchs-*-final.png` (Owner-Uploads) liegen untracked im Repo — separat committen oder lassen; die LP nutzt die optimierten `public/`-Kopien.

## Offene Altpunkte (unverändert, NICHT von diesem Task)
- bezahlter-Scan-TLS-Bug (`paid-scan-strict-tls`) — eigentlicher Engpass für erste Sales.
- PR #92 (Barrierefrei-Prüfen-Rebrand) schließen/retargeten; PR #93 (Branding-Docs) Status.
