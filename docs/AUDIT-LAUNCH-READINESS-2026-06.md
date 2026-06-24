# 🚦 Launch-Readiness-Audit — BFSG-Check (Frontend + Backend)

> **Stand:** 24.06.2026 · Erstellt durch einen 10-köpfigen Multi-Agenten-Audit (FE Visual/Code/A11y/Perf/Copy/SEO + BE Scanner/Payments/Security/Consistency), adversarial verifiziert + Completeness-Critic-geprüft.
> **Verifizierte Funde:** 100 bestätigt von 106 roh (False Positives entfernt).
> **Launch-Ampel:** 🔴 Rot — 6 P0-Blocker müssen vor Go-Live fallen.

Dimensionen (gefunden/bestätigt): fe-visual 12/12, fe-code 8/8, fe-a11y 4/6, fe-perf 9/9, fe-copy 11/13, fe-seo 10/10, be-scanner 12/13, be-payments 12/12, be-security 12/13, consistency 10/10

---

## Executive Summary

Das Repo ist insgesamt in solidem, durchdachtem Zustand (viele Probleme sind bewusst dokumentierte Trade-offs), aber es gibt eine Handvoll echter Launch-Blocker in Sicherheit, A11y-Dogfooding, Scan-Robustheit und Rechnungs-Recht. Verteilung: **6 P0/P1-Blocker (launchBlocker=true)**, **~16 weitere P1 (wichtig)**, **~40 P2 (Politur)**. Größte Risiken: ein echter **SSRF-Redirect-Bypass** (P0), **Rate-Limit per X-Forwarded-For umgehbar** (Kosten-DoS auf Headless-Browser), **fehlende §14-UStG-Rechnungsadresse** (jede Rechnung rechtswidrig), **Doppel-Rechnung beim Resend** (GoBD), **Light-Mode-Fokus unsichtbar** (das Produkt verkauft genau diese Prüfung) und **networkidle-Timeout** im bezahlten Scan-Pfad. Die meisten Zahlungs-/Abo-Funde sind durch `ENABLE_ABO=false` und Single-Instance-Betrieb entschärft, aber nicht behoben. Launch-Ampel: **🔴 Rot** — sechs harte Blocker müssen vor Go-Live fallen, danach wechselt die Ampel auf 🟡 (P1-Liste vor Skalierung/Ads-Traffic).

## 🔴 P0 — Launch-Blocker

| # | Bereich | Problem | Datei:Stelle | Fix | Aufwand |
|---|---------|---------|--------------|-----|---------|
| 1 | Security | **SSRF**: Playwright folgt 30x-Redirects zu internen/Metadata-IPs ohne Re-Validierung pro Hop (jede Scan-URL ist angreifer-kontrolliert) | scanner/lib/scan.js:29, :112 (page.goto); url-guard prüft nur Start-URL | `page.route('**/*')`-Hook der jede Hop-URL per `assertPublicHttpUrl`/`isBlockedIp` prüft, ODER IP-pinnender Proxy, ODER Redirects manuell mit Re-Validierung folgen | M |
| 2 | Payments/Recht | **§14-UStG-Adresse fehlt**: `INVOICE_FROM_ADDRESS` nicht in `deployment/.env.example` → jede Rechnungs-PDF trägt Platzhalter „[Anbieter-Adresse fehlt]" als Pflicht-Anschrift | scanner/lib/invoice.js:22 (Fallback) vs deployment/.env.example (Var fehlt) | INVOICE_FROM_NAME/_ADDRESS (Matthias Seba, Lange Straße 20, 27449 Kutenholz), VAT_MODE=kleinunternehmer, ADMIN_TOKEN, SENTRY_DSN in `deployment/.env.example` ergänzen **und vor Launch im Server-.env setzen** | S |
| 3 | Security | **Rate-Limit umgehbar**: liest `x-forwarded-for.split(',')[0]` (client-kontrolliert) statt `req.ip`; bei `trust proxy=1` rotiert ein Angreifer die IP pro Request → 5/min-Limit ausgehebelt → Kosten-/Browser-DoS | scanner/lib/limits.js:15-17; logger.js:89; app.js:60 | `req.ip` statt XFF-Header-Parsing verwenden (respektiert trust proxy); identisch im logger-Serializer | S |
| 4 | Payments/GoBD | **Resend erzeugt Doppel-Rechnung**: bei Mail-Fehler markiert `markStatus FAILED` **ohne** invoiceNumber → resend sieht keine Nummer → zweite Rechnung mit neuer fortlaufender Nummer (zwei GoBD-Nummern für einen Verkauf) | scanner/app.js:139,153,156,450-461; orders.js:70-77 | invoiceNumber direkt nach Erzeugung persistieren (eigenes `markStatus(...,'INVOICED',{invoiceNumber})` **vor** Mailversand), damit FAILED/resend sie kennt | S |
| 5 | A11y/Dogfood | **Light-Mode-Fokus < 3:1** (2.19:1): Tastatur-Fokus auf JEDEM Button/Input/Radio/Checkbox/Accordion faktisch unsichtbar (WCAG 1.4.11/2.4.7) — das Produkt verkauft genau diese Prüfung | ui/button.tsx:7, input.tsx:12, radio-group.tsx:23, checkbox.tsx:13, accordion.tsx:36; --ring globals.css:110 | `--ring` im Light-Theme auf brand-indigo (≈12.8:1) setzen (Dark bleibt mint), `ring-ring/50`-Opacity auf volle Deckung — analog zur bereits gefixten ThemeToggle | S |
| 6 | Scanner | **networkidle ohne Fallback**: tracking-/long-poll-lastige Kundenseiten erreichen nie networkidle → goto-Timeout → 502 im Gratis-Scan / FAILED im **bezahlten** fulfillOrder | scanner/lib/scan.js:29, :112 (scan-cookie.js:70-76 hat den Fallback bereits) | Denselben try/catch wie in scan-cookie.js: networkidle versuchen, bei Timeout auf `domcontentloaded` + kurzes waitForLoadState zurückfallen | M |

## 🟡 P1 — Wichtig vor Skalierung

| # | Bereich | Problem | Datei:Stelle | Fix | Aufwand |
|---|---------|---------|--------------|-----|---------|
| 1 | Payments | **Invoice Brutto-als-Netto**: bei `VAT_MODE=regelbesteuerung` wird der gezahlte Bruttobetrag als Netto interpretiert → 19% zu viel ausgewiesen (199€ → 236,81€). Default `kleinunternehmer` ok | scanner/lib/invoice.js:66-70; app.js:117,139 | Bei regelbesteuerung Brutto behandeln: `net=round(gross/1.19)`, `vat=gross-net`, `gross=gross` | S |
| 2 | Payments | **Abo-Idempotenz nur in-memory**: invoice.paid/subscription-Events nicht persistiert → nach Deploy/Neustart Doppel-Fulfillment/-Rechnung/-Scan. Aktuell durch ENABLE_ABO=false latent | scanner/app.js:81-101; orders.js:14,27,50-56 | `claimEvent` schreibt sofort einen `{eventId,type:'CLAIM'}`-Record; `ensureLoaded` lädt CLAIM-Records ins Set | S |
| 3 | Payments | **Mailversand ohne Retry**: transiente SMTP-/Brevo-Störung markiert Order FAILED trotz fertigem Scan+PDF+Rechnung; resend macht Komplett-Neuscan + ggf. Doppelrechnung | scanner/app.js:142-156; mailer.js:192-207 | `sendMail` mit 3× Retry/Backoff; Mail-Try vom Scan/Rechnungs-Try trennen | M |
| 4 | Security | **Chromium `--no-sandbox` + Root-Container** beim Laden fremder Seiten → maximaler Blast-Radius bei Renderer-Exploit | scanner/lib/scan.js:15,:80; Dockerfile (kein USER) | `USER pwuser` im Dockerfile + Sandbox aktivieren (seccomp/caps), `--no-sandbox` entfernen | M |
| 5 | SEO | **Globales JSON-LD auf ALLEN Routen**: 5 Product-Schemas + Home-FAQPage auch auf /impressum, /agb, Pillar-Pages (seitenfremdes Markup) → Spam-Risiko/Manual-Action | landingpage-next/app/layout.tsx:150; JsonLd.tsx:161-169 | JsonLd splitten: `SiteJsonLd` (Organization/WebSite) global, `HomeJsonLd` (Products/FAQ) nur in app/page.tsx | M |
| 6 | SEO | **Doppelte FAQPage auf Pillar-Pages**: eigene sichtbare FAQ + injizierte Home-FAQ (nicht sichtbar) → verletzt FAQ-Richtlinie | bfsg-checkliste-online-shop/page.tsx:72-80 vs JsonLd.tsx:148-159 | Folgt automatisch aus P1#5 (globales FAQPage nur auf Home) | S |
| 7 | A11y | **Input-Border < 3:1** (1.27:1): 1px-Rahmen ist die einzige Feldbegrenzung (bg-transparent) → Feldgrenze nicht erkennbar (WCAG 1.4.11) | ui/input.tsx:12; --input globals.css:109 | `--input`/`--border` im Light-Theme auf ≥3:1 abdunkeln (≈oklch(0.78 0.02 270)) oder sichtbaren Fill geben | S |
| 8 | Recht/Copy | **USt-Captions widersprechen §19-Status**: „inkl. ges. USt." obwohl Kleinunternehmer keine USt ausweist (UWG §5/Preisangabenrecht) | PricingCards.tsx:133,225; config.ts:324 | Captions auf „Gesamtpreis, keine USt-Ausweisung gem. §19 UStG" ändern, FAQ eindeutig (nicht konditional) | S |
| 9 | Recht/Copy | **Erfundener Mengen-Claim**: „Automatisierte Scans mehrerer hundert deutscher Shops" — Pre-Launch nicht belegbar (UWG §5) | bfsg-checkliste-online-shop/page.tsx:179-180 | Entschärfen: „Erfahrungswerte aus axe-core-/WCAG-Audits zeigen…" — keine konkrete Eigen-Scan-Menge | S |
| 10 | Scanner | **Falsch-Fail im bezahlten Pfad**: Plausibilitäts-Check `violations===0 && passes===0` kann (theoretisch) makellose Seite als „kein Ergebnis" verwerfen → Report nicht ausgeliefert. Real-Risiko gering (axe liefert i.d.R. Dutzende passes) | scanner/lib/fulfill.js:75-77 | Für scanSite `pagesScanned===0` als Abbruchkriterium; 0 Violations bei >0 passes ist valide | M |
| 11 | SEO | **6 Pillar-Pages aus Nav verwaist**: kein Link aus Header/Footer/Home → kaum interner Link-Equity-Fluss | Footer.tsx:17-44; config.ts:46-51; app/page.tsx | „Ratgeber"-Spalte im Footer + Resources-Block auf Home auf die 6 Pillar-Pages | S |
| 12 | Perf | **Voller motion-Namespace-Import** (`* as motion`) auf LCP-Route in 10 Client-Sektionen; motion nicht in Next-16-Default-optimizePackageImports → schiebt motion-Runtime in kritischen Client-JS-Pfad | Hero.tsx:3, HeroVisual.tsx:4, PricingCards.tsx:4, StatsBar.tsx:3 u.a. | `experimental.optimizePackageImports: ["motion"]` in next.config.ts (mit `next build`-Gegencheck wg. Next-16-Breaking) | M |
| 13 | Consistency | **Stale Domain** in scanner/.env.example: `bfsg-check.de` statt `bfsg-fix.de` (PUBLIC_URL treibt Stripe-Erfolgs-Redirect + Mail-Absender) — betrifft nur Vorlage, nicht Server-.env | scanner/.env.example:7,16,21 | Auf bfsg-fix.de korrigieren bzw. auf deployment/.env.example verweisen | S |
| 14 | Consistency | **B2B-Checkout ohne Firmenfeld**: „Unternehmer (gewerblich)" wählbar, aber kein `company`-Feld → B2B-Rechnung trägt nur E-Mail, nie Firmennamen; FAQ verspricht USt-ID/Firmenadresse | CheckoutModal.tsx:99-105,246-251; app.js:317; invoice.js:116,164 | Bei `customerType==='business'` Pflichtfeld „Firma" (+ optional USt-ID) einblenden, als `company` mitsenden (Backend liest es bereits) | M |

## 🟢 P2 — Politur/Optimierung

| # | Bereich | Problem | Datei:Stelle | Fix | Aufwand |
|---|---------|---------|--------------|-----|---------|
| 1 | FE-Visual | gradient-text Descender-Clipping in 3 Sektionen ungefixt (Hero hat pb-[0.12em], andere nicht) | Testimonials.tsx:31, HowItWorks.tsx:41, CookieSection.tsx:25 | Fix in `.gradient-text`-Utility ziehen (padding-bottom:0.12em; inline-block) | S |
| 2 | FE-Visual | Featured-Card `lg:scale-[1.03]` bricht items-stretch-Top-Linie | PricingCards.tsx:182,113,168-177 | scale entfernen, Hervorhebung über border/shadow/Badge | S |
| 3 | FE-Visual | Hero-Grid 1.04fr/0.96fr asymmetrisch + Visual ohne mx-auto („nicht zentriert") | Hero.tsx:44; HeroVisual.tsx:25 | `lg:grid-cols-2` oder Visual `justify-self-center` | S |
| 4 | FE-Visual | HeroVisual Float-Badges -left-3/-right-3 clippen bei 320px (kein Scroll, durch overflow-hidden) | HeroVisual.tsx:33-49; Hero.tsx:17 | Badges erst ab `sm` einblenden oder Wrapper px/max-w | M |
| 5 | FE-Visual | StatsBar `md:border-l` auf erster Spalte → hängende Trennlinie | StatsBar.tsx:56 | `[&:nth-child(4n+1)]:md:border-l-0` | S |
| 6 | FE-Visual | CookieSection bg-muted/40 + embedded PricingCards bg-background → Farbblock-Bruch | CookieSection.tsx:11; PricingCards.tsx:56 | embedded → `bg-transparent` | S |
| 7 | FE-Visual | CookieSection gestückelte Vertikal-Paddings (20/0+10/0+12/20) | CookieSection.tsx:14,44; PricingCards.tsx:61 | Vertikalrhythmus auf py-20/24-Raster vereinheitlichen | S |
| 8 | FE-Visual/A11y | echter `<a href="#pakete">` in aria-hidden HeroVisual → interaktiv für AT unsichtbar | HeroVisual.tsx:25,142-154 | div + pointer-events-none statt anchor | S |
| 9 | FE-Visual | CtaSection `text-brand-mint` statt gradient-text → Konsistenzbruch (bewusst, lesbar) | CtaSection.tsx:51-53 | belassen oder helle Gradient-Variante | S |
| 10 | FE-Visual | Footer 3-Spalten in grid-cols-2 → „Konto" allein in Reihe 2 | Footer.tsx:134 | `grid-cols-1 xs:grid-cols-2 sm:grid-cols-3` | S |
| 11 | FE-Visual | Hero Trust-Bar text-center → optisch „schwimmend" (erwartetes Verhalten) | Hero.tsx:132-143 | optional gemeinsame Achse, niedrigste Prio | S |
| 12 | FE-Visual | HowItWorks Connector-Linie fixe 12% statt Icon-Mitten (dekorativ) | HowItWorks.tsx:51-58 | Linie an Icon-Achse koppeln (optional) | M |
| 13 | FE-Code | ResultCard verwirft Backend-grade/verdict, rechnet neu; verdict-Texte divergieren (Kern-Evidenz teils falsch — D-Stufe existiert backend) | ResultCard.tsx:22-65,15-20 | `grade`/`verdict` in ScanResult aufnehmen + direkt rendern; Kommentar korrigieren | S |
| 14 | FE-Code/Copy | **Footer-Newsletter no-op**: sammelt E-Mail, verwirft sie, meldet fälschlich Erfolg; fehlender DOI bei Anbindung (dedupliziert mit copy-Fund) | Footer.tsx:46-130 | An Brevo (mit DOI) anbinden + ehrliche Meldung, ODER Feld bis Launch ausblenden | M |
| 15 | FE-Code | CheckoutModal kein company/USt-ID-Feld (dedupliziert mit P1#14 — selber Wurzelgrund) | CheckoutModal.tsx:96-106; config.ts:320 | siehe P1#14 | M |
| 16 | FE-Code | CheckoutModal reset email/customerType/consent beim Wiederöffnen fehlt → stale Consent für anderen Vorgang | CheckoutModal.tsx:47-62 | im open-Block `setEmail('')`/`setCustomerType(null)`/`setConsent(false)` | S |
| 17 | FE-Code | Consent-Label htmlFor zeigt auf Base-UI-Button + wrappt Control → doppelte Assoziation | CheckoutModal.tsx:255-274; checkbox.tsx:8-26 | `htmlFor` am wrappenden Label entfernen | S |
| 18 | FE-Code | ScanForm inputWrapper-Ternary identische Zweige (toter Code, variant ohne Wirkung) | ScanForm.tsx:65-68 | Ternary auf eine Konstante reduzieren oder Varianten echt unterscheiden | S |
| 19 | FE-Code | Ungenutzte Form-Deps (react-hook-form, zod, @hookform/resolvers, radix-slot/label, ui/form.tsx, shadcn) | components/ui/form.tsx; package.json:12-29 | entfernen oder bewusst dokumentieren (npm prune) | S |
| 20 | FE-Code | toter Export `__jsonLdFaqs`; FAQ-Schema-Parity bei SSR ok | JsonLd.tsx:144-159,187; FAQAccordion.tsx:18-25 | `__jsonLdFaqs`-Export entfernen | S |
| 21 | A11y | Cookie-Banner: 2-Button-Balance ok, aber Titel kein Heading + nicht fokussiert/erreichbar (DOM-Ende) | CookieBanner.tsx:154,145 | Titel als `<h2>`+aria-labelledby, Fokus beim Mount setzen | S |
| 22 | A11y | ScanForm doppelte Live-Region kann Fehler konkurrierend ansagen | ScanForm.tsx:75-81,132-136 | Fehler in die bestehende persistente sr-only-Region integrieren | S |
| 23 | Perf | next.config.ts ohne experimental.optimizePackageImports (dedupliziert mit P1#12) | next.config.ts:13-25 | `optimizePackageImports:["motion","lucide-react"]` | S |
| 24 | Perf | Header backdrop-blur-xl togglet live beim Scroll → INP/Jank-Spike | Header.tsx:26-33,64-70 | dauerhaft leichten Blur + nur bg/border-Opacity togglen, oder blur-md | S |
| 25 | Perf | Große Blur-Radien 70-100px auf Glow-Flächen (Hero/StatsBar/HeroVisual) | StatsBar.tsx:23,27; HeroVisual.tsx:28,29; Hero.tsx:35,41 | Radien senken (100→64, 80→56), redundante Layer mobil ausblenden | S |
| 26 | Perf | Hero-Scan-Form mit opacity:0 + delay:0.25 → verzögerte Interaktivität der Haupt-CTA | Hero.tsx:91-98 | delay auf 0 / opacity:0 entfernen (nur y-Slide) | S |
| 27 | Perf | CountUp ohne reservierte Mindestbreite → Ziffernzahl-Shift (CLS, lokal in Zelle) | CountUp.tsx:62-67; StatsBar.tsx:62-68 | `min-w-[3ch]` auf tabular-nums-span | S |
| 28 | Perf | 3 Font-Familien inkl. variabler Fraunces (opsz/SOFT) → Font-Last/LCP-Swap (Next-16: nicht raten) | app/layout.tsx:18-40 | Achsen/Subset prüfen, Build-Output gegenchecken | M |
| 29 | Perf | globales `scroll-behavior:smooth` (bewusster Trade-off) | app/globals.css:189 | belassen oder auf Anker-Container begrenzen | S |
| 30 | Perf | Fixed Grain-Overlay (blend-mode) ab md+ → Desktop-Scroll-Composite (mobil bewusst aus) | app/globals.css:209-224 | bei Jank `absolute` statt `fixed` | S |
| 31 | Copy | „Spart 98 €" im Abo-Toggle falsch (real 78 €) — durch available:false verborgen, greift bei ENABLE_ABO | PricingCards.tsx:220,156-157 | `saved = monthly*12 - yearly` dynamisch berechnen | S |
| 32 | Copy/Consistency | **Footer/sameAs/twitter LinkedIn+X-Profile** evtl. nicht existent (dedupliziert über copy+seo+consistency) | Footer.tsx:170-197; JsonLd.tsx:16; layout.tsx:78-79 | Existenz prüfen; falls nicht: Links + sameAs + twitter-Tags entfernen | S |
| 33 | Copy | Stat „100 %" Hosting wirkt wie Mess-Quote statt Eigenschaft | config.ts:154-159; StatsBar.tsx:62 | statische „DE"-Label-Zahl oder Methodik-Zahl | S |
| 34 | Copy | „Belastbar geprüft" suggeriert Fremd-Prüfung (grenzwertig) | StatsBar.tsx:33,39 | „Geprüft nach anerkannten Normen" | S |
| 35 | Copy | Abdeckungsquote inkonsistent: „30–50 %" (Home) vs „40–55 %" (Pillars) | config.ts:276,296 vs bfsg-pruefung-kosten:149, bfsg-checkliste:227 | eine belegbare Logik überall identisch | M |
| 36 | Copy | Spannung „80+ Regeln" vs „30–50 % Abdeckung" (kein Widerspruch, Darstellung) | config.ts:73,63 vs 276 | beide Zahlen explizit verbinden | S |
| 37 | Copy | FAQ-Widerruf-Wording knapp (inhaltlich korrekt) | config.ts:328 | an Checkout-Wortlaut angleichen | S |
| 38 | Copy/Recht | FAQ „dokumentierte WCAG-AA-Erstprüfung/Bestätigung" grenzt an Unbedenklichkeit | config.ts:304 | klarstellen: nur automatisierter Umfang, kein Konformitätsnachweis | S |
| 39 | SEO | Legal-Seiten ohne eigenen canonical → erben fälschlich '/' | layout.tsx:63-65 vs agb/impressum/datenschutz/widerruf/kuendigen | je `alternates:{canonical:'/agb'}` ergänzen | S |
| 40 | SEO | OG-Image referenziert 'Inter' ohne Font-Embed → Satori-Fallback | opengraph-image.tsx:29 | fontFamily entfernen oder Inter via fonts[] laden | S |
| 41 | SEO | Organization.logo = 1200×630 OG-Banner statt echtes Logo | JsonLd.tsx:13 | dediziertes quadratisches /logo.png | S |
| 42 | SEO | robots.txt `host`-Direktive (nur Yandex, von Google ignoriert) | robots.ts:15 | host-Zeile entfernen | S |
| 43 | SEO | alle 5 Product-Offers `url=Root` statt Anker | JsonLd.tsx:116 | je Produkt /#pakete bzw. /#cookie | S |
| 44 | SEO | WebSite-SearchAction zeigt auf nicht existierende Suche | JsonLd.tsx:29-36 | SearchAction entfernen | S |
| 45 | Scanner | AxeBuilder.analyze() ohne Timeout → blockiert scanGate-Slot | scan.js:32-34,113-115 | analyze() in Promise.race mit 60s-Hard-Timeout | M |
| 46 | Scanner | concurrencyGate ohne maxQueue → unbegrenztes Queue-Wachstum (DoS-Backpressure) | scanner/lib/limits.js:35-56 | maxQueue-Grenze + 503 „busy" | M |
| 47 | Scanner | computeScore liest `v.nodes.length` ohne Guard (latent) | scanner/lib/report.js:11 | `(v.nodes?.length)||0` | S |
| 48 | Scanner | renderTeaser mutiert scan.violations per .sort() in place (inkonsistent zu renderReport) | report.js:247-252 | `[...scan.violations].sort(...)` | S |
| 49 | Scanner | Cache `cache.clear()` bei CACHE_MAX wirft gesamten Cache weg | app.js:305 | LRU: `cache.delete(cache.keys().next().value)` | S |
| 50 | Scanner | Webhook fire-and-forget: Crash zwischen 200-Ack und fulfill → Event-Verlust ohne Alarm/Reconcile | app.js:81-101 | claimEvent erst nach Verarbeitung commit ODER Reconcile-Sweeper | M |
| 51 | Scanner | uncaughtException-Handler beendet Prozess nicht (korrupter State, offene Chromium) | app.js:499-502 | nach Flush kontrolliert `process.exit(1)` | S |
| 52 | Scanner/Recht | Cookie-Report erzeugt WCAG-Note/„Konformitäts-Score" auf 4-Punkte-Cookie-Messung | scan-cookie.js:146-156; report.js:61,188-193 | Score/Note im Cookie-Pfad unterdrücken (`reportKind:'cookie'`) | M |
| 53 | Scanner | handleInvoicePaid liest `inv.subscription` (API-Version-abhängig); kein apiVersion-Pin | app.js:182-198,41 | apiVersion pinnen; Alarm statt stilles return (ENABLE_ABO=false → unkritisch) | M |
| 54 | Payments | claimEvent vor Arbeit → Crash mid-handler = stiller Verlust für invoice.paid ohne Spur | app.js:81-102 | zweistufig claim IN_PROGRESS→DONE, oder 200-Ack nach Verarbeitung | M |
| 55 | Payments | invoice-Number-Burn: Nummer vor PDF-Render allokiert → Render-Fehler reißt GoBD-Lücke | invoice.js:51-64,154-179 | erst PDF rendern, dann Nummer+Audit-Log; oder Lücke als VOID dokumentieren | M |
| 56 | Payments | keine USt-ID/Reverse-Charge + fehlende Empfänger-Anschrift (>250€ Profi: §14 Abs.4) | app.js:317-358; invoice.js:114-118 | USt-ID-Feld + Pflicht-Anschrift für business; Reverse-Charge bei Regelbesteuerung | M |
| 57 | Payments | Fulfillment vertraut amount_total/metadata.pkg ungeprüft (kein PACKAGES-Abgleich) | app.js:110-117,139; fulfill.js:65-67 | `PACKAGES[pkg].amount === s.amount_total` asserten, sonst Alert+FAILED | S |
| 58 | Payments | Rechnungs-Zähler nur in-process serialisiert (kein flock) → nicht multi-instance-sicher | invoice.js:37-64; orders.js:35-37 | vor Skalierung externer Lock/atomarer Counter (SQLite/Redis/flock) | M |
| 59 | Payments | checkout.session.completed bei async-Zahlart (SEPA) → kein Fulfillment/Record/Alert | app.js:104-117 | payment_method_types auf Karte beschränken ODER async_payment_succeeded behandeln | S |
| 60 | Payments/DSGVO | DSGVO-Export liefert Roh-Records inkl. customerId/eventId; „Löschung" ist nur Tombstone — Klartext-PII bleibt auf Platte, notice „PII redacted" ist falsch | scanner/lib/dsgvo.js:102-128,45-48,130-142 | Export-Felder projizieren; echte Compaction ODER „redacted"-Behauptung entfernen bis compact.js existiert | M |
| 61 | Payments | Abo-Gating nicht defense-in-depth: subscription-Handler immer aktiv trotz ENABLE_ABO=false | app.js:39,46-54,91-96; fulfill.js:28 | `if(!ENABLE_ABO) return;` in den 3 Subscription-Handlern | S |
| 62 | Security | Admin-Token-Vergleich kein echtes timingSafeEqual (Längen-Leak) | scanner/lib/admin-auth.js:31-36 | `crypto.timingSafeEqual` auf SHA-256-Digests | S |
| 63 | Security | keine CSP für statische HTML (danke.html mit session_id) | app.js:277-279,492 | CSP auch für HTML (script-src 'self'+Nonce/Hash) | M |
| 64 | Security | Roh-`err.message` an Clients (Admin/resend/dsgvo 500er) | app.js:421,431,466,409 | generische 500-Texte, err.message nur ins Log | S |
| 65 | Security | DSGVO-Löschung per GET-Link (Mail-Prefetch konsumiert Token) | app.js:395-411; dsgvo.js:130 | Bestätigungsseite + POST, Token erst beim POST konsumieren | M |
| 66 | Security | geteilter Scan-Cache per voller URL (Query bleibt) → Cache-Flutung/-Stampede | app.js:284-307 | Key auf origin+pathname normalisieren + LRU | S |
| 67 | Security | DNS-Rebinding-Schutz per `DNS_PIN_STRICT=false` global abschaltbar (überspringt auch private-IP-Check) | scanner/lib/url-guard.js:49-50 | private-IP-Check IMMER laufen lassen, nur Set-Gleichheit lockern | S |
| 68 | Security | keine npm-Lockfile-Integrität im Build (`npm install` statt `npm ci`) | scanner/Dockerfile:12-13; package.json:24-27 | package-lock.json einchecken + `npm ci`; npm audit als CI-Gate | S |
| 69 | Security | E-Mail am /api/checkout-Eingang ohne isEmail/Maxlänge (fließt in Stripe-Metadata) | app.js:317-346,352,345 | isEmail-Validierung + Maxlänge analog company-slice(120) | S |
| 70 | Consistency | scanner/.env.example Abo-Preis-Kommentar 49 € statt 39 € | scanner/.env.example | Kommentar auf 39 €/Mon korrigieren | S |
| 71 | Consistency | cookie-profi `maxPages:5` wirkungslos (Cookie-Scan nur Startseite) | fulfill.js:30 vs 51-58 | maxPages aus cookie-* entfernen/auf 1 | S |
| 72 | Consistency | scanner/.env.example dokumentiert REPLY_TO nicht | mailer.js:16,200 vs scanner/.env.example | REPLY_TO=hello@bfsg-fix.de ergänzen | S |
| 73 | Consistency/Recht | JsonLd Cookie-Produkt „TDDDG-/DSGVO-Konformität"-Prüfung kollidiert mit „keine Konformitätsgarantie" | JsonLd.tsx:68-71 vs config.ts:341; fulfill.js:40 | „automatisierte technische Messung gem. §25 TDDDG" statt „Konformität" | S |
| 74 | Consistency | Anchor `#pakete` statt root-relativ `/#pakete` (Projektregel) | ResultCard.tsx:150; HeroVisual.tsx:143; CtaSection.tsx:74 | auf `/#pakete` umstellen | S |
| 75 | Consistency | config.ts-Kommentar verweist auf falsche app.js-Zeilen (Z40-48 statt 46-54) | landingpage-next/lib/config.ts:2 | Zeilenverweis durch „const PACKAGES" ersetzen | S |

## 🗂️ Buckets

### (a) Sofort sicher fixbar (FE/eindeutig — keine Rückfrage nötig)
- **A11y P0/P1**: Light-Mode Fokus-Ring (P0#5) + Input-Border-Kontrast (P1#7) → `--ring`/`--input`/`--border` in globals.css
- **SEO**: JsonLd-Split global/Home (P1#5+6), Legal-canonical (P2#39), robots host entfernen (#42), OG-Font (#40), Org.logo (#41), SearchAction entfernen (#44), Offer-URLs (#43)
- **Perf**: `optimizePackageImports:["motion","lucide-react"]` (P1#12/#23), Header-Blur (#24), Blur-Radien (#25), Hero-CTA-Delay (#26), CountUp min-w (#27)
- **FE-Visual**: gradient-text Descender (#1), scale (#2), Hero-Grid (#3), StatsBar-Border (#5), CookieSection-bg (#6), Footer-Grid (#10), aria-hidden-Anchor (#8), Anchor `/#pakete` (#74)
- **FE-Code**: Checkout-State-Reset (#16), Consent-Label htmlFor (#17), ScanForm-Deadcode (#18), `__jsonLdFaqs` (#20), ResultCard grade/verdict (#13)
- **Scanner**: nodes-Guard (#47), Teaser-sort-Spread (#48), Cache-LRU (#49), uncaughtException-exit (#51), AxeBuilder-Timeout (#45), maxQueue (#46), Abo-Gating-Guard (#61)
- **Security**: req.ip statt XFF (P0#3), timingSafeEqual (#62), err.message (#64), Cache-Key+LRU (#66), DNS-PIN private-IP-Check (#67), npm ci (#68), isEmail-Validierung (#69)
- **Consistency**: stale Domain (P1#13), Abo-Preis-Kommentar (#70), REPLY_TO (#72), cookie-profi maxPages (#71), config.ts-Zeilenverweis (#75), JsonLd Cookie-„Konformität" (#73)
- **Copy** (eindeutig, kein Geschmack): „Spart 98 €" dynamisch (#31), „100 %"-Hosting (#33), „Belastbar geprüft" (#34), Mengen-Claim entschärfen (P1#9)

### (b) Braucht User-Entscheidung (Copy/Preis/Abo/Geschäftspolitik)
- **USt-Status final klären** (P1#8): §19 aktiv genutzt? → bestimmt Captions, FAQ-Wortlaut UND den invoice.js-Brutto/Netto-Fix (P1#1). Echte Geschäfts-/Steuerentscheidung.
- **LinkedIn/X-Profile** (#32): existieren sie? Wenn nein → entfernen, sonst belassen. Nur der Owner weiß das.
- **Newsletter** (#14): an Brevo+DOI anbinden ODER bis Launch ausblenden? Produkt-/Marketing-Entscheidung.
- **B2B-Checkout-Feld** (P1#14): Firma als Pflichtfeld einführen (Rechnungsqualität) vs schlankerer Funnel? + FAQ-Versprechen entsprechend.
- **Abdeckungsquote** (#35): welche belegbare Zahl ist die kanonische (30–50 % vs 40–55 %)? Inhaltliche Festlegung.
- **FAQ-Wording** Widerruf (#37) / „Bestätigung"-Unbedenklichkeit (#38) / „80+ vs 30–50 %" (#36): Copy-Feinschliff.
- **CtaSection mint vs gradient** (#9): bewusst belassen oder vereinheitlichen? Stilentscheidung.

### (c) Braucht Live-Test/Server (Backend/Zahlung/Scanner — hier nicht voll testbar)
- **SSRF-Redirect-Fix (P0#1)**: muss gegen echte interne IPs/Redirect-Targets auf dem Hetzner-Host getestet werden.
- **§14-Rechnungsadresse (P0#2)**: erfordert **Setzen der ENV im Server-.env** + Erzeugung einer echten Test-Rechnung zur Verifikation.
- **Resend-Doppelrechnung (P0#4)** + **invoice-Number-Burn (#55)** + **Brutto/Netto (P1#1)**: nur mit echtem Stripe-Webhook + PDF-Render-Pfad verifizierbar (Live-Mode, Vorsicht).
- **networkidle-Fallback (P0#6)** + **AxeBuilder-Timeout (#45)** + **Falsch-Fail (P1#10)**: gegen reale tracking-lastige Kundenseiten testen.
- **Mail-Retry (P1#3)** + **Webhook-Idempotenz/Reconcile (P1#2, #50, #54)** + **async-Zahlart (#59)**: nur mit echtem Brevo/Stripe-Verhalten + Prozess-Neustart-Szenarien.
- **Chromium-Sandbox/Root (P1#4)**: Container-Rebuild + Smoke-Test auf dem Server (pwuser, seccomp).
- **DSGVO-Compaction (#60)**: echte Lösch-Implementierung + Verifikation auf Platte.
- **Multi-Instance-Counter (#58)** + **Abo-Webhook (#53, #61)**: erst bei Skalierung/ENABLE_ABO relevant, dann Load-/Deploy-Overlap-Test.

---

## 🔍 Plan-Review (Completeness-Critic — zweites Augenpaar)

All key claims confirmed. `trust proxy=1` is set (line 60), which means Express's `req.ip` already correctly extracts the real client IP from the rightmost trusted proxy hop — yet `limits.js:16` ignores `req.ip` and instead parses the leftmost `x-forwarded-for` entry (fully client-controlled). P0#3 is correct and the fix is right. P0#6's reference model (scan-cookie.js:70-76 try/catch fallback) exists exactly as described.

I have enough verified evidence to deliver the review.

## Plan-Review

**(1) Vollständigkeit:** Der Plan ist außergewöhnlich gründlich und — soweit stichprobenartig gegen den echten Code geprüft — technisch korrekt: Ich habe die sechs P0 sowie eine Reihe P1/P2 direkt an den genannten Datei-/Zeilen-Ankern verifiziert und **keine Falsch-Funde** gefunden. P0#1 (SSRF-Redirect: `page.goto` folgt 30x intern ohne Re-Validierung pro Hop, während `assertPublicHttpUrl` nur Start-URL + entdeckte Links prüft — scan.js:29/112), P0#3 (`limits.js:16` parst client-kontrolliertes `x-forwarded-for` statt `req.ip`, obwohl `app.set('trust proxy',1)` in app.js:60 gesetzt ist), P0#4 (`markStatus 'FAILED'` in app.js:156 trägt KEINE `invoiceNumber`, nur `MAILED` in :153 tut es → resend in :450 sieht keine Nummer → zweite Rechnung), P0#5/P1#7 (`--ring`/`--input` im Light-Theme auf mint `oklch(0.72 0.18 158)` bzw. blassgrau — niedriger Kontrast, button.tsx/input.tsx nutzen genau diese Tokens) und P0#6 (networkidle ohne Fallback in scan.js, während scan-cookie.js:69-76 den try/catch-Fallback bereits hat) sind allesamt belegt. Der vom User gemeldete Punkt ist klar adressiert (Hero-Zentrierung als P2#3 mit `lg:grid-cols-[1.04fr_0.96fr]` + fehlendes `mx-auto` an HeroVisual; Headline-Clipping als P2#1 gradient-text Descender). Vollständigkeit der Backend-/Payment-/Security-/SEO-Achsen ist sehr hoch.

### Fehlende/zusätzliche Funde

- **`/api/checkout` Race: kein consumer-`consent`-Timestamp-Cap / aber Validierung ok — KEIN Fund.** Hingegen fehlt im Plan: **`/api/checkout` akzeptiert `email` ohne Format-Validierung UND ohne Längen-Cap, gibt sie aber als `customer_email` an Stripe** (app.js:317,352). Der Plan listet dies als #69, aber unterbewertet — die E-Mail fließt zusätzlich in `subscription_data.metadata.email` (app.js:345) und später ungeprüft in `sendReportFor`/Invoice-Empfänger. Einordnung als reines P2 ist zu mild, da eine fehlerhafte E-Mail die **Report-Zustellung des bezahlten Produkts** verhindert (Geld kassiert, nichts geliefert). Empfehlung: auf P1 heben.
- **`handleCheckoutCompleted` setzt KEIN `markStatus('INVOICED', {invoiceNumber})` zwischen Invoice-Erzeugung (app.js:139) und Mailversand (:142).** Der Plan benennt das korrekt als P0#4-Fix, aber die Lücke betrifft **auch den Happy-Path-Crash** (Prozess stirbt zwischen :139 und :153): dann ist die Rechnung auf Platte + im `invoices-log.jsonl` (invoice.js:182), aber der Order-Record kennt die Nummer nie → resend dupliziert. Das ist dieselbe Wurzel, sollte aber im Fix explizit als „persistiere invoiceNumber UNMITTELBAR nach `generateInvoicePdf`" formuliert werden, nicht erst vor Mailversand.
- **Nicht im Plan: `subscription_data.metadata.email` umgeht `customer_details.email`-Priorität.** Bei Abo wird `email` aus dem rohen Request-Body genommen (app.js:345), während der Nicht-Abo-Pfad `s.customer_details?.email` bevorzugt (app.js:111). Latent (ENABLE_ABO=false), aber bei Abo-Aktivierung Quelle für Zustell-an-falsche-Adresse. Niedrige Prio, aber erwähnenswert in der Abo-Härtungsliste (#53/#61).
- **Kein eigener Fund zu fehlenden Kategorien** — Admin-Dashboard (`admin-next/`) wurde im Plan nicht erkennbar geprüft. Falls es öffentlich erreichbar deployt ist, wäre ein kurzer Auth-/Exposure-Check ratsam. Ansonsten: keine wesentlichen weiteren Lücken in den geprüften Bereichen.

### Korrektur-Hinweise

- **P0#1 (SSRF) Fix-Variante „page.route('**/*')-Hook der jede Hop-URL prüft" ist riskant/unvollständig:** `page.route` interzeptiert Requests, aber ein 30x-**Redirect** wird vom Netzwerk-Stack als Response der bereits erlaubten Navigation behandelt — der Hook sieht die Redirect-*Ziel*-Navigation u.U. nicht zuverlässig als eigenes `route`-Event (gerade bei Top-Level-Document-Redirects). Die robustere der drei genannten Optionen ist **IP-pinnender Proxy** oder **manuelles Redirect-Following mit Re-Validierung** (`maxRedirects:0` + eigene Hop-Schleife durch `assertPublicHttpUrl`). Empfehlung: Fix-Spalte auf die Proxy-/Manual-Variante als primär umstellen, `page.route` nur als ergänzende Defense.
- **P1#1 (Brutto/Netto) ist rechnerisch korrekt, aber Code-Befund ergänzen:** `renderInvoiceHtml` (invoice.js:67-70) rechnet `totalGross = totalNet + totalVat`, behandelt den übergebenen `amount` also als **Netto**. Bei `regelbesteuerung` und Stripe-Brutto-`amount_total` weist die Rechnung 19% zu viel aus — korrekt erkannt. Der Fix gehört aber in `generateInvoicePdf`/`renderInvoiceHtml` zentral (nicht im Webhook), sonst divergieren Abo- und Einmal-Pfad. Default `kleinunternehmer` ist sicher.
- **P0#2 Fix-Text nennt konkrete Anschrift (Lange Straße 20, 27449 Kutenholz) zum Eintragen in `deployment/.env.example`** — das ist eine **Template-Datei** (gitignored ist nur die echte `.env`). Personenbezogene Anbieter-Anschrift gehört in `.env.example` höchstens als Platzhalter-Kommentar, die echten Werte nur ins Server-`.env`. Sonst landet die Privatadresse versioniert im Repo. Klarstellen: Platzhalter in `.example`, echte Werte server-seitig.
- **Legal sauber:** Keine der vorgeschlagenen Copy-Fixes führt verbotene Claims ein. P1#8 („keine USt-Ausweisung gem. §19 UStG"), P1#9 (Mengen-Claim entschärfen), #73 („automatisierte technische Messung gem. §25 TDDDG" statt „Konformität") und #38 sind UWG-konform formuliert. Korrekt ist auch, dass `invoice.js:149` bereits „keine Konformitätsgarantie, keine Rechtsberatung" trägt — der Footer-Disclaimer der Rechnung ist sauber. **Kein einziger Fix empfiehlt einen verbotenen Claim.**
- **Kein Widerspruch, aber Reihenfolge-Hinweis:** P1#1 (Brutto/Netto) und Bucket (b) „USt-Status final klären" hängen zusammen — der Brutto/Netto-Fix darf NICHT umgesetzt werden, solange der USt-Modus nicht entschieden ist (Default kleinunternehmer macht den Fix gegenstandslos). Plan erkennt das in Bucket (b) korrekt; nur sicherstellen, dass das Team P1#1 nicht „blind" fixt.

### Launch-Ampel-Empfehlung

**🔴 Rot — bestätigt.** Die sechs P0 sind real und je ein echter Blocker (zwei davon — SSRF-Redirect + Rate-Limit-Bypass — sind ausnutzbar mit Kosten-/Sicherheitsfolge; zwei — §14-Adresse + Doppelrechnung — machen jede Rechnung rechts-/GoBD-fehlerhaft; einer — Light-Fokus — untergräbt die Produkt-Kernaussage im eigenen Dogfood; einer — networkidle — bricht den bezahlten Scan-Pfad). Nach Fall der sechs P0 **plus** der zwei nachgeschärften P1 (E-Mail-Validierung am Checkout hochstufen, INVOICED-Persist unmittelbar nach Invoice) wechselt die Ampel auf **🟡 Gelb**: launchfähig für kontrollierten Start, aber die P1-Liste (besonders Mail-Retry P1#3, Abo-Idempotenz-Persist P1#2, Chromium-Root P1#4) ist vor Ads-Traffic/Skalierung abzuarbeiten. **🟢 Grün** erst nach P1-Komplettabbau + Live-Verifikation der Bucket-(c)-Punkte auf dem Hetzner-Host.

Verifizierte Anker: scanner/lib/scan.js:29,112 · scanner/lib/limits.js:16 + scanner/app.js:60 · scanner/app.js:139,153,156,450 + scanner/lib/orders.js:70 · scanner/lib/url-guard.js:76-104 · scanner/lib/invoice.js:22,67-70,149 · scanner/lib/scan-cookie.js:69-76 · landingpage-next/app/globals.css (--ring/--input Light) · landingpage-next/components/Hero.tsx:44 + components/HeroVisual.tsx · scanner/app.js:317,345,352.
