// Zentrale Konfiguration fuer die BFSG-Fuchs Landingpage.
// Preise und Pakete spiegeln scanner/app.js Z40-48 (Quelle der Wahrheit).

export type PackageId =
  | "basis"
  | "profi"
  | "cookie-basis"
  | "cookie-profi"
  | "abo"
  | "abo-jahr"
  | "abo-pro"
  | "abo-pro-jahr"
  | "abo-business"
  | "abo-business-jahr"
  | "startpaket-basis"
  | "startpaket-profi";

export type PackageConfig = {
  id: PackageId;
  name: string;
  tag: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  featured?: boolean;
  mode: "payment" | "subscription";
  amountCents: number;
  moneyBack?: string;
  // Optionaler CTA-Label-Override (Default in PricingCard: "Abo starten"/"Paket kaufen").
  cta?: string;
  // Hinweiszeile unter dem Preis (z. B. Einführungspreis-Frist, d4/d7).
  // Rein deklarativ — KEINE Streichpreise (§ 11 PAngV: kein echter Referenzpreis).
  priceNote?: string;
  // false = Paket beworben, aber noch nicht kaufbar (Backend-Gate, z.B. ENABLE_ABO=false).
  // CTA zeigt dann "Bald verfügbar" statt einen 400-Checkout auszulösen.
  available?: boolean;
  // Optionaler Mengen-Anker unter dem Preis (z.B. "25 Unterseiten — rund 16 €/Seite").
  // Rahmt den Pauschalpreis als Preis-pro-Einheit. Rein optisch, keine Kauf-Logik.
  anchorNote?: string;
  // Jahresoption (nur Abo): FESTE Config-Werte — Anzeige-Preise werden NIE aus dem
  // Monatspreis berechnet (Quelle der Wahrheit: scanner/app.js 'abo-jahr').
  // annualId = Backend-Paket-Id, die der Checkout bei Jahres-Auswahl sendet.
  annualId?: PackageId;
  annualAmountCents?: number;
  annualPrice?: string;
  annualPriceNote?: string;
  annualMoneyBack?: string;
  // Feature-Liste der Jahres-Ansicht (ersetzt z.B. "Jederzeit kündbar", das beim
  // Jahres-Abo mit 12 Monaten Erstlaufzeit irreführend wäre).
  annualFeatures?: string[];
};

// HINWEIS Domain/Rebrand (Cutover 29.06.2026): Marke + Primär-Domain = "bfsg-fuchs.de".
// `url` steuert canonical/OG/sitemap → jetzt bfsg-fuchs.de. bfsg-fix.de läuft im selben
// Caddy-Block PARALLEL weiter (zeigt damit canonical → bfsg-fuchs.de = SEO-Konsolidierung)
// und bleibt voll funktional, bis der Stripe-Webhook umgezogen ist. Die Stripe-success/
// cancel-URLs kommen aus dem Backend (Server-.env PUBLIC_URL → ebenfalls bfsg-fuchs.de).
export const SITE = {
  url: "https://bfsg-fuchs.de",
  name: "BFSG-Fuchs",
  // Ziel-Marken-Domain nach Cutover (rein dokumentarisch, NICHT funktional verlinkt,
  // solange sie nicht aufgelöst/TLS-gesichert ist).
  brandDomain: "bfsg-fuchs.de",
  title: "BFSG-Test: Website kostenlos auf WCAG prüfen | BFSG-Fuchs",
  description:
    "BFSG-Test in 60 Sekunden: automatisierte WCAG-2.1-AA-Analyse mit 80+ Prüfregeln, menschlicher Sichtung und priorisiertem Fix-Plan. Kostenlos & ohne Anmeldung.",
  email: "info@bfsg-fuchs.de",
} as const;

export const BRAND = {
  tagline: "Die schlaue Spürnase für Barrierefreiheit nach WCAG 2.1 / EN 301 549",
  productKicker: "Compliance-Scan-Plattform",
  promise: "Premium-Audit ohne Kanzlei-Honorar",
  hostingNote: "Gehostet in Deutschland · DSGVO-konform",
} as const;

// Root-relative Anchor-Links (/#id) — funktionieren auch von Unterseiten
// (/agb, /impressum, …) aus, von wo eine reine #id-Navigation ins Leere liefe.
export const NAV_LINKS = [
  { href: "/#pakete", label: "Pakete" },
  { href: "/#ablauf", label: "Wie es funktioniert" },
  { href: "/#cookie", label: "Cookie-Check" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const HERO = {
  pillFlag: "DE",
  // Produktwert-Badge (NICHT die Frist — die traegt allein die AnnouncementBar).
  // "menschlich geprüft" ist durch das Owner-Release-Gate wahr. Wird in Hero.tsx
  // als nicht-klickbares <span>-Badge gerendert (kein Link, kein Hover-Pfeil).
  pill: "KI-Spürnase + menschlich geprüft · 80+ WCAG-Kriterien",
  // Fox-Headline (Design "BFSG-Fuchs"): "Schlau wie ein Fuchs — bereit fürs BFSG?"
  // Nur das Akzentwort "BFSG" leuchtet im Orange-Verlauf (headlineEmph); der Rest
  // bleibt creme (headlineLead). "bereit fürs BFSG?" ist eine Bereitschafts-FRAGE,
  // KEINE verbotene Konformitäts-/Garantie-Aussage ("BFSG-konform", UWG §5).
  // Das "?" wird in Hero.tsx an das Akzentwort gehängt; Clip-Schutz sitzt in
  // .gradient-text (padding-/margin-right) → kein Glyph-Clipping, kein CLS.
  headlineLead: "Schlau wie ein Fuchs — ist Ihre Website bereit fürs",
  headlineEmph: "BFSG",
  // Tail leer: die Pointe "bevor es eine Kanzlei tut" steht in der Subline.
  // Hero.tsx rendert das Tail-Span nur, wenn der String nicht leer ist.
  headlineTail: "",
  subline:
    "In 60 Sekunden zeigt der BFSG-Fuchs, wo Ihre Website die WCAG 2.1 AA verfehlt — jeder Mangel priorisiert, mit Copy-Paste-Fix. Premium-Audit ohne Kanzlei-Honorar.",
  cta: "Kostenlos prüfen",
  // Aktionsspezifisches Label am Scan-Feld (Design: "Gratis-Check starten") —
  // verb-getrieben auf die Mikro-Conversion gemünzt; cta bleibt für Header/Final-CTA.
  scanCta: "Kostenlosen Check starten",
  ctaSecondary: "Pakete ansehen",
  placeholder: "ihre-website.de",
  badges: [
    "KI-Spürnase + menschlich geprüft",
    "Hosting in Deutschland",
  ],
  // Mini-Trust-Bar im Hero entfaellt im neuen Design zugunsten des eigenstaendigen
  // Trust-Strip-Bands (STATS) direkt unter dem Hero — Werte dort gepflegt.
  trust: [
    { label: "80+", sub: "Prüfregeln (EN 301 549)" },
    { label: "DSGVO", sub: "konform" },
    { label: "DE", sub: "Hosting" },
    { label: "60 Sek.", sub: "bis zur Fuchs-Fährte" },
  ],
} as const;

// Ankündigungs-Bar (oberster Streifen). Faktisch + bereits in HERO.pill gepruefter
// Wortlaut — keine Garantie-/Spitzenstellungs-Aussage.
export const ANNOUNCEMENT = {
  text: "BFSG seit 28.06.2025 in Kraft · erste Abmahnungen rollen an",
  cta: "der Fuchs prüft kostenlos",
  href: "/#risiko",
} as const;

// Live-Ticker der WCAG-Kriterien, die der Scanner prueft (wahrheitsgemaesse
// Pruef-Checkliste — bewusst NICHT als "live an Ihrer Seite geprueft" framen).
export const RULE_TICKER = {
  label: "Geprüfte WCAG-Kriterien",
  rules: [
    "1.4.3 Kontrast (Minimum)",
    "1.1.1 Nicht-Text-Inhalt",
    "2.1.1 Tastatur",
    "2.4.7 Fokus sichtbar",
    "4.1.2 Name, Rolle, Wert",
    "3.3.2 Beschriftungen",
    "1.3.1 Info & Beziehungen",
    "2.4.4 Linkzweck",
    "1.4.11 Nicht-Text-Kontrast",
    "3.1.1 Sprache der Seite",
  ],
} as const;

// BFSG-Stichtag — der Countdown zaehlt die seither verstrichene Zeit (reine
// faktische Angabe, keine Drohung).
export const DEADLINE = {
  date: "2025-06-28T00:00:00",
  kicker: "Verstrichen seit dem Stichtag",
} as const;

// Daten für die Hero-Vorschau des Sofort-Ergebnisses (rein illustrativ, kein
// echter Scan). Sichtbar als Beispiel gekennzeichnet: sampleLabel (Chip in der
// App-Chrome) + previewHeading machen die Vorschau-Natur transparent.
// HeroVisual rendert damit DIESELBE ResultPanel-Komponente wie das echte
// Scan-Ergebnis (ResultCard) — Vorschau == Realität per Konstruktion.
export const HERO_VISUAL = {
  reportPath: "report/4f2a",
  sampleLabel: "Beispiel",
  // Vorschau-Überschrift über dem Visual — ehrlich: exakt dieses Format liefert
  // der Gratis-Check. previewAccent = das eine Fraunces-Italic-Akzentwort
  // (Editorial-Rhythmus); Hero.tsx splittet die Überschrift an diesem Wort.
  previewHeading: "Ihr Sofort-Ergebnis — exakt in diesem Format",
  previewAccent: "Sofort-Ergebnis",
  // Wahr: nach der Double-Opt-in-Bestätigung verschickt die Brevo-Automation
  // (Template #8, „Deine Barrierefreiheits-Übersicht ist da") die Übersicht
  // per E-Mail — der frühere Backend-Teaser wurde entfernt (Doppel-Mail-Fix).
  footnote:
    "Diese Übersicht erhalten Sie nach dem Gratis-Check zusätzlich per E-Mail.",
  // ScanResult-förmige, in sich konsistente Beispieldaten:
  // counts-Summe 2+5+6+4 = 17 = totalIssues; Score 62 → Note C (gradeFor-Stufen).
  // Severity der topIssues folgt severitySequence(counts): die ersten beiden
  // Befunde sind „Kritisch", der dritte „Schwerwiegend" — die Titel passen dazu
  // (fehlende Alt-Texte/Labels = critical, Farbkontrast = serious, wie axe-core).
  sample: {
    score: 62,
    grade: "C",
    totalIssues: 17,
    counts: { critical: 2, serious: 5, moderate: 6, minor: 4 },
    topIssues: [
      "Bilder ohne Alternativtext",
      "Formularfelder ohne Beschriftung",
      "Zu geringer Farbkontrast bei Text",
    ],
  },
} as const;

// Risiko-/Urgency-Band: faktenbasiert, kein UWG-Versprechen.
export const RISK_BAND = {
  kicker: "Seit 28.06.2025 in Kraft",
  // Stichtag steht bereits im Kicker → Titel verschlankt + GENAU EIN Italic-
  // Akzentwort (titleAccent) für den Editorial-Rhythmus (RiskBand.tsx splittet).
  title: "Die BFSG-Frist ist verstrichen — und die ersten Abmahnungen schnappen zu.",
  titleAccent: "verstrichen",
  desc: "Betroffene Unternehmen müssen ihre digitalen Angebote barrierefrei anbieten. Wettbewerber, Verbände und abmahnende Kanzleien dürfen Verstöße verfolgen. Wer den Fuchs jetzt losschickt, behebt Mängel in Ruhe statt unter Abmahn-Druck. In 60 Sekunden sehen Sie, wo Sie stehen — kostenlos und ohne Anmeldung.",
  points: [
    { value: "28.06.2025", label: "Stichtag bereits überschritten" },
    { value: "WCAG 2.1 AA", label: "geforderter Mindeststandard" },
    // Norm-Fix 04.07.2026 (amtl. Inhaltsübersicht gesetze-im-internet.de/bfsg):
    // § 15 BFSG = Beratungsangebot der Bundesfachstelle — NICHT Klagebefugnis.
    // Verbands-/Einrichtungsrechte: § 32 (Verwaltungsverfahren) + § 33 (Rechtsbehelfe).
    { value: "Verbände", label: "Antrags- & Klagerechte (§§ 32, 33 BFSG)" },
  ],
} as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Website-URL eingeben",
    desc: "Nur die Adresse eintippen, mehr nicht — der Fuchs spitzt die Ohren und bereitet Crawler & Audit-Regeln vor.",
    icon: "globe",
  },
  {
    step: "02",
    title: "Automatisierter WCAG-Scan",
    desc: "Kontraste, Alt-Texte, Tastatur-Fokus, Labels, Strukturen — über 80 Regeln nach EN 301 549 werden durchschnüffelt.",
    icon: "scan",
  },
  {
    step: "03",
    title: "Fix-Plan vom Experten kuratiert",
    desc: "Priorisiert, mit Copy-Paste-Snippets und Entwurf der Barrierefreiheitserklärung — keine Rohdaten-Wüste.",
    icon: "check",
  },
] as const;

// num/prefix/suffix/decimals steuern den Count-up in StatsBar; bei null wird
// `value` statisch angezeigt (z. B. "EN 301 549").
export type StatItem = {
  value: string;
  num: number | null;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
};

// Trust-Strip-Band direkt unter dem Hero (Design: 4 Kennzahlen mit Count-up).
export const STATS: StatItem[] = [
  // "80+" Pruefregeln (EN 301 549) — Count-up von 0 auf 80, danach das "+".
  { value: "80+", num: 80, suffix: "+", label: "Prüfregeln (EN 301 549)" },
  // num:null → statisch. Selbst-Tatsachenangabe (DE-Hosting, nur notwendige Daten,
  // TLS-1.3-Transport) — keine Mess-Quote, kein "100 %".
  { value: "DSGVO", num: null, label: "konform · TLS 1.3" },
  { value: "DE", num: null, label: "Hosting in Deutschland" },
  { value: "60 Sek.", num: 60, suffix: " Sek.", label: "bis zur Fuchs-Fährte" },
] as const;

// Ehrliches Normen-/Standards-Band statt erfundener Presse-Logos.
// Alle hier genannten Normen sind die tatsächliche Prüfgrundlage (UWG-sauber,
// keine Schleichwerbung/Fake-Mentions).
export const LOGO_CLOUD = {
  kicker: "Geprüft nach anerkannten Standards",
  logos: [
    { name: "WCAG 2.1 AA", width: 96 },
    { name: "EN 301 549", width: 96 },
    { name: "BITV 2.0", width: 72 },
    { name: "BFSG", width: 56 },
    { name: "§ 25 TDDDG", width: 88 },
  ],
} as const;

// ============================================================================
// Fuchs Re-Check — Abo-Tier-Modell (ENTWURF, marketing/swarm-2026-07-23/
// agent-01-pricing-offer.md, Assets d2/d4/d7/d8). Launch-Schalter:
// ============================================================================
// Sichtbarkeit der Re-Check-Tier-Sektion — spiegelt das Server-Flag
// ABO_TIERS_ENABLED (Default AUS). false = die Tier-Sektion rendert NICHT und
// 'abo' bleibt die bisherige einzelne Abo-Karte in PACKAGES → der Merge ändert
// am Live-Auftritt NICHTS (kein Stripe-/Server-Vorlauf nötig).
// Launch-PR (nach Owner-Freigabe G1/G2): hier auf true setzen + available-Flags
// der neuen Pakete (abo-pro*, abo-business*, startpaket-*) auf true +
// Server-Env ABO_TIERS_ENABLED=true. Preis-Sync-CI (scripts/check-price-sync.mjs)
// prüft die Spiegelung zu scanner/app.js.
export const RECHECK_TIERS_VISIBLE = false;

export const PACKAGES: PackageConfig[] = [
  {
    id: "basis",
    name: "BFSG-Report Basis",
    tag: "Basis",
    price: "129 €",
    description: "Einmaliger Vollreport",
    mode: "payment",
    amountCents: 12900,
    moneyBack: "Sichere Zahlung über Stripe · Rechnung sofort per E-Mail",
    features: [
      "Vollständiger WCAG-2.1-Report (PDF)",
      "Alle Mängel priorisiert + Lösung",
      "Entwurf Barrierefreiheitserklärung",
      "Bis zu 5 Unterseiten",
    ],
  },
  {
    id: "profi",
    name: "BFSG-Report Profi",
    tag: "Empfohlen · Profi",
    price: "399 €",
    description: "Report + Umsetzungsplan",
    mode: "payment",
    amountCents: 39900,
    featured: true,
    moneyBack: "Sichere Zahlung über Stripe · Rechnung sofort per E-Mail",
    // 399 € / 25 Unterseiten = 15,96 € → gerundet ~16 €/Seite (Mengen-Anker).
    anchorNote: "25 Unterseiten — rund 16 €/Seite",
    features: [
      "Alles aus dem Basis-Report",
      "Bis zu 25 Unterseiten statt 5 (5× Abdeckung)",
      "30 Tage E-Mail-Support bei Rückfragen",
    ],
  },
  // Bisherige Abo-Karte (Grandfathering, d8): Preis/Leistung/Backend-ID bleiben
  // unverändert. Sobald die Tier-Sektion sichtbar ist (RECHECK_TIERS_VISIBLE),
  // übernimmt die Starter-Karte in RECHECK_PACKAGES dieselbe Backend-ID 'abo' —
  // diese Legacy-Karte entfällt dann, damit 'abo' nicht doppelt auf der Seite steht.
  ...(RECHECK_TIERS_VISIBLE
    ? []
    : [
        {
          id: "abo",
          name: "Fuchs Re-Check Abo",
          tag: "Abo",
          price: "24,99 €",
          priceSuffix: "/Monat",
          description: "Dauerhafte Überwachung",
          mode: "subscription",
          amountCents: 2499,
          available: true, // Abo live (Server ENABLE_ABO=true). Bei Backend-Deaktivierung wieder false setzen.
          moneyBack: "Jederzeit zum Monatsende kündbar",
          // Jahresoption 249 €/Jahr (Backend-Paket 'abo-jahr', Exp. 4): gleiche Leistung,
          // jährliche Zahlung. 12 × 24,99 € = 299,88 € → Ersparnis 50,88 € (Anzeige wird in
          // PricingCards aus den beiden Cent-Werten de-DE-formatiert, nie frei erfunden).
          annualId: "abo-jahr",
          annualAmountCents: 24900,
          annualPrice: "249 €",
          annualMoneyBack: "Erstlaufzeit 12 Monate, danach mit Frist von 1 Monat kündbar",
          annualFeatures: [
            "Monatlicher Re-Check",
            "Alarm bei neuen Mängeln",
            "Aktualisierte Erklärung",
            "Nach 12 Monaten Erstlaufzeit monatlich kündbar",
          ],
          features: [
            "Monatlicher Re-Check",
            "Alarm bei neuen Mängeln",
            "Aktualisierte Erklärung",
            "Jederzeit kündbar",
          ],
        } satisfies PackageConfig,
      ]),
];

// Jahres-Abo als eigenständig auflösbares Checkout-Paket (pkg='abo-jahr' im Backend).
// Bewusst NICHT in PACKAGES (die Pricing-Karte zeigt es über den Jahres-Toggle),
// aber im CheckoutModal wählbar/auflösbar. Preisfelder = annual*-Werte des Abo-Eintrags.
export const ABO_ANNUAL: PackageConfig = {
  id: "abo-jahr",
  name: "Fuchs Re-Check Abo (jährlich)",
  tag: "Abo · Jahr",
  price: "249 €",
  priceSuffix: "/Jahr",
  description: "Dauerhafte Überwachung — jährliche Zahlung",
  mode: "subscription",
  amountCents: 24900,
  available: true, // wie 'abo' ans Server-Flag ENABLE_ABO gekoppelt
  moneyBack: "Erstlaufzeit 12 Monate, danach mit Frist von 1 Monat kündbar",
  features: [
    "Monatlicher Re-Check",
    "Alarm bei neuen Mängeln",
    "Aktualisierte Erklärung",
    "Nach 12 Monaten Erstlaufzeit monatlich kündbar",
  ],
};

// ─── Fuchs Re-Check Abo-Tiers (d2/d4) ───────────────────────────────────────
// Sektions-Copy und Startpaket-Karte exakt nach marketing/swarm-2026-07-23/
// agent-01-pricing-offer.md d4 (Claim-geprüfte Entwurfs-Copy). Kein Cross-out
// der regulären Preise (§ 11 PAngV, Claim-Check #7) — das Ankündigungs-Banner
// nennt Frist und Preise stattdessen ausgeschrieben.
export const RECHECK_SECTION = {
  kicker: "Dauerhaft dranbleiben",
  title: "Fuchs Re-Check — Ihre Website ändert sich. Wir sehen es.",
  titleAccent: "Wir sehen es",
  subline:
    "Jede Aktualisierung Ihrer Website kann neue Barrieren schaffen — ein neues Plugin, ein Relaunch, frische Inhalte. Der Fuchs Re-Check prüft in Ihrem Rhythmus automatisiert nach und zeigt im Delta-Report, was sich verändert hat. Automatisierte technische Analyse nach WCAG 2.1 AA — keine Rechtsberatung.",
} as const;

export const RECHECK_BANNER = {
  text: "Einführungspreise bis 30.09.2026: Starter 24,99 €, Pro 69 €, Business 129 € pro Monat. Ab 01.10.2026 gelten die regulären Preise 29 € / 79 € / 149 €. Wir arbeiten ohne Streichpreise — diese Ankündigung gilt.",
} as const;

// Report-Gate (d2): in allen Tier-Cards und beim Startpaket sichtbar.
export const RECHECK_GATE_NOTE = {
  text: "Voraussetzung für den Re-Check ist ein Erst-Report (Basis oder Profi): Er legt die Baseline fest, ab der der Re-Check Veränderungen erkennt. Im Startpaket ist der erste Monat inklusive.",
} as const;

// Tier-Karten. Einführungspreise sind im Code verdrahtet; die Umstellung auf
// die regulären Preise ab 01.10.2026 erfolgt in einem eigenen Preis-PR.
// Bestandskunden mit aktivem Abo behalten dauerhaft ihren Abschlusspreis,
// solange das Abo ununterbrochen läuft (Grandfathering, d8).
export const RECHECK_PACKAGES: PackageConfig[] = [
  {
    // id "abo" bleibt das Legacy-Paket (24,99 €/Monat) — Grandfathering (d8).
    // Stripe-Preis via STRIPE_PRICE_ABO_MONTH / STRIPE_PRICE_ABO_YEAR,
    // sonst Inline-Fallback (wie bisher).
    id: "abo",
    name: "Re-Check Starter",
    tag: "Starter",
    price: "24,99 €",
    priceSuffix: "/Monat",
    priceNote: "Einführungspreis bis 30.09.2026, danach 29 €/Monat",
    description: "Für Websites mit ruhigem Änderungstempo.",
    mode: "subscription",
    amountCents: 2499,
    available: true,
    cta: "Starter aktivieren",
    moneyBack: "Monatlich zum Monatsende kündbar",
    annualId: "abo-jahr",
    annualAmountCents: 24900,
    annualPrice: "249 €",
    annualPriceNote: "Einführungspreis bis 30.09.2026, danach 290 €/Jahr",
    annualMoneyBack:
      "Erstlaufzeit 12 Monate, danach mit Frist von 1 Monat kündbar",
    features: [
      "Vollständiger Re-Check alle 4 Wochen (bis 25 Unterseiten)",
      "Delta-Report: was ist neu, was ist behoben",
      "Aktualisierte Barrierefreiheitserklärung bei jedem Re-Check",
      "Priorisierter Maßnahmenplan",
      "Menschliche Sichtung vor jedem Versand",
      "E-Mail-Support, Antwort in der Regel innerhalb von 5 Werktagen",
      "Monatlich zum Monatsende kündbar",
    ],
    annualFeatures: [
      "Vollständiger Re-Check alle 4 Wochen (bis 25 Unterseiten)",
      "Delta-Report: was ist neu, was ist behoben",
      "Aktualisierte Barrierefreiheitserklärung bei jedem Re-Check",
      "Priorisierter Maßnahmenplan",
      "Menschliche Sichtung vor jedem Versand",
      "10 Monatsbeiträge jährlich — Erstlaufzeit 12 Monate, danach monatlich kündbar",
    ],
  },
  {
    // Stripe: STRIPE_PRICE_ABO_PRO_MONTH / STRIPE_PRICE_ABO_PRO_YEAR,
    // sonst Inline-Fallback.
    id: "abo-pro",
    name: "Re-Check Pro",
    tag: "Pro",
    price: "69 €",
    priceSuffix: "/Monat",
    priceNote: "Einführungspreis bis 30.09.2026, danach 79 €/Monat",
    description: "Für Shops und Websites, die sich ständig ändern.",
    mode: "subscription",
    amountCents: 6900,
    featured: true,
    available: false,
    cta: "Pro aktivieren",
    moneyBack: "Monatlich zum Monatsende kündbar",
    annualId: "abo-pro-jahr",
    annualAmountCents: 69000,
    annualPrice: "690 €",
    annualPriceNote: "Einführungspreis bis 30.09.2026, danach 790 €/Jahr",
    annualMoneyBack:
      "Erstlaufzeit 12 Monate, danach mit Frist von 1 Monat kündbar",
    features: [
      "Re-Check alle 2 Wochen (bis 40 Unterseiten)",
      "Heartbeat: wöchentlicher automatisierter Zwischen-Scan — E-Mail-Alarm, sobald neue kritische Befunde auftauchen",
      "Alles aus Starter",
      "Quartals-Fortschritts-Report (90-Tage-Delta als eigenes PDF — ideal für Geschäftsführung oder Agentur)",
      "Cookie-Quick-Check (§ 25 TDDDG) einmal pro Quartal inklusive",
      "E-Mail-Support, Antwort in der Regel innerhalb von 3 Werktagen",
    ],
  },
  {
    // Stripe: STRIPE_PRICE_ABO_BUSINESS_MONTH / STRIPE_PRICE_ABO_BUSINESS_YEAR,
    // sonst Inline-Fallback.
    id: "abo-business",
    name: "Re-Check Business",
    tag: "Business",
    price: "129 €",
    priceSuffix: "/Monat",
    priceNote: "Einführungspreis bis 30.09.2026, danach 149 €/Monat",
    description: "Für Teams mit mehreren Domains und Release-Betrieb.",
    mode: "subscription",
    amountCents: 12900,
    available: false,
    cta: "Business aktivieren",
    moneyBack: "Monatlich zum Monatsende kündbar",
    annualId: "abo-business-jahr",
    annualAmountCents: 129000,
    annualPrice: "1.290 €",
    annualPriceNote: "Einführungspreis bis 30.09.2026, danach 1.490 €/Jahr",
    annualMoneyBack:
      "Erstlaufzeit 12 Monate, danach mit Frist von 1 Monat kündbar",
    features: [
      "Re-Check jede Woche (bis 50 Unterseiten je Domain)",
      "Heartbeat alle 3 Tage mit kritischem Alarm",
      "Bis zu 3 Domains (gleiche Inhaberin/derselbe Inhaber)",
      "Alles aus Pro",
      "Pre-Release-Scan: Staging oder Relaunch vor dem Go-Live prüfen — 1× pro Monat auf Anfrage",
      "Befundliste als CSV-Export (Jira-/Backlog-tauglich)",
      "Prioritäts-Sichtung + E-Mail-Support, Antwort in der Regel am nächsten Werktag",
      "Kein White-Label — Reports erscheinen im Fuchs-Format",
    ],
  },
];

// Modal-only Jahreskarten für Pro und Business (Muster wie ABO_ANNUAL).
export const ABO_PRO_ANNUAL: PackageConfig = {
  id: "abo-pro-jahr",
  name: "Re-Check Pro (Jahr)",
  tag: "Pro · Jahr",
  price: "690 €",
  priceSuffix: "/Jahr",
  description: "Für Shops und Websites, die sich ständig ändern.",
  mode: "subscription",
  amountCents: 69000,
  available: false,
  cta: "Jetzt Re-Check Pro sichern",
  moneyBack: "Erstlaufzeit 12 Monate, danach mit Frist von 1 Monat kündbar",
  features: RECHECK_PACKAGES[1].features,
};

export const ABO_BUSINESS_ANNUAL: PackageConfig = {
  id: "abo-business-jahr",
  name: "Re-Check Business (Jahr)",
  tag: "Business · Jahr",
  price: "1.290 €",
  priceSuffix: "/Jahr",
  description: "Für Teams mit mehreren Domains und Release-Betrieb.",
  mode: "subscription",
  amountCents: 129000,
  available: false,
  cta: "Jetzt Re-Check Business sichern",
  moneyBack: "Erstlaufzeit 12 Monate, danach mit Frist von 1 Monat kündbar",
  features: RECHECK_PACKAGES[2].features,
};

// Startpaket (d2): Erst-Report + 1. Re-Check-Monat inklusive.
// Frontend-Perspektive: einmalige Zahlung (mode "payment"). Backend-Perspektive:
// der Scanner legt die Report-Einmalposition PLUS die Tier-Subscription mit
// 30 Tagen Trial an — der erste Re-Check-Monat ist dadurch im Startpaket
// enthalten (metadata.tier steuert die Tier-Tiefe des Folge-Abo-Zyklus).
// Stripe: STRIPE_PRICE_STARTPAKET_BASIS / STRIPE_PRICE_STARTPAKET_PROFI für
// die Einmalposition, sonst Inline-Fallback.
export const STARTPAKET_PACKAGES: PackageConfig[] = [
  {
    id: "startpaket-basis",
    name: "Startpaket (Report Basis)",
    tag: "Startpaket",
    price: "129 €",
    priceSuffix: " einmalig",
    description: "Erst-Report Basis inklusive erstem Re-Check-Monat.",
    mode: "payment",
    amountCents: 12900,
    available: false,
    cta: "Startpaket wählen",
    moneyBack: "Sichere Zahlung über Stripe · Rechnung sofort per E-Mail",
    features: [
      "BFSG-Report Basis (bis 5 Unterseiten) mit Entwurf der Barrierefreiheitserklärung",
      "1. Re-Check-Monat inklusive (Tier Ihrer Wahl; danach zum jeweiligen Monatspreis, jederzeit zum Monatsende kündbar)",
      "Menschliche Sichtung vor jedem Versand",
    ],
  },
  {
    id: "startpaket-profi",
    name: "Startpaket (Report Profi)",
    tag: "Startpaket",
    price: "399 €",
    priceSuffix: " einmalig",
    description: "Erst-Report Profi inklusive erstem Re-Check-Monat.",
    mode: "payment",
    amountCents: 39900,
    available: false,
    cta: "Startpaket wählen",
    moneyBack: "Sichere Zahlung über Stripe · Rechnung sofort per E-Mail",
    features: [
      "BFSG-Report Profi (bis 25 Unterseiten) mit Umsetzungsplan und 30 Tage E-Mail-Support",
      "1. Re-Check-Monat inklusive (Tier Ihrer Wahl; danach zum jeweiligen Monatspreis, jederzeit zum Monatsende kündbar)",
      "Menschliche Sichtung vor jedem Versand",
    ],
  },
];

// Startpaket-Info-Card in der Re-Check-Sektion (Copy aus d4).
export const RECHECK_STARTPAKET_CARD = {
  name: "Startpaket",
  tagline: "Erst wissen, wo Sie stehen — dann dranbleiben.",
  priceLine: "einmalig 129 € (Basis) oder 399 € (Profi)",
  features: [
    "Erst-Report nach Wahl (Basis bis 5 Unterseiten oder Profi bis 25 Unterseiten) — legt die Baseline für alle Re-Checks fest",
    "1. Re-Check-Monat inklusive — danach läuft das gewählte Tier zum Monatspreis weiter, jederzeit zum Monatsende kündbar",
    "Menschliche Sichtung vor jedem Versand",
  ],
  cta: "Startpaket wählen",
} as const;

export const COOKIE_PACKAGES: PackageConfig[] = [
  {
    id: "cookie-basis",
    name: "Cookie-Check (§25 TDDDG)",
    tag: "Cookie Basis",
    price: "39 €",
    description: "Einmalige technische Messung",
    mode: "payment",
    amountCents: 3900,
    moneyBack: "Sichere Zahlung über Stripe · Rechnung sofort per E-Mail",
    features: [
      "Welche Tracker feuern vor Consent?",
      "Welche Cookies werden vor Consent gesetzt?",
      "Google Fonts & US-Drittland-Transfer",
      "Konkrete Handlungsempfehlung pro Fund",
    ],
  },
  {
    id: "cookie-profi",
    name: "Cookie-Check Profi",
    tag: "Empfohlen · Cookie Profi",
    price: "69 €",
    description: "Technische Messung + manuelle Sichtung",
    mode: "payment",
    amountCents: 6900,
    featured: true,
    moneyBack: "Sichere Zahlung über Stripe · Rechnung sofort per E-Mail",
    features: [
      "Alles aus Cookie Basis",
      "Manuelle Sichtung durch einen Menschen vor Auslieferung",
      "Individuelle Handlungsempfehlung pro Fund",
    ],
  },
];

export const DIFFERENTIATORS = [
  {
    kicker: "Schneller als die Kanzlei",
    title: "Audit in Stunden, nicht in Wochen",
    desc: "Während andere noch Termine koordinieren, haben Sie schon den Fix-Plan auf dem Tisch. Stripe-Checkout, sofortiger Scan-Start, Lieferung in der Regel innerhalb weniger Stunden — jeder Report wird vorher persönlich gesichtet.",
  },
  {
    kicker: "Tiefer als Gratis-Tools",
    title: "Menschliche Sichtung vor Auslieferung",
    desc: "Automatische Tests finden erfahrungsgemäß nur 30–50 % der Mängel — den Rest übersehen sie. Bei uns liest ein Mensch jeden Report quer, bevor er rausgeht: keine False Positives, keine generischen Empfehlungen.",
  },
  {
    kicker: "Günstiger als Beratung",
    title: "Pauschalpreis statt Stundensatz",
    desc: "Sie zahlen einmalig 129 € oder 399 € — kein Tagessatz, keine offene Rechnung. Sie wissen vorab auf den Euro genau, was es kostet.",
  },
] as const;

// Direktvergleich — UWG-§5/§6-sauber umformuliert: qualitativer, sachlicher
// Vergleich OHNE erfundene Score-Zahlen, OHNE "Bester"-Superlativ, OHNE herabsetzende
// Wertung der Wettbewerber. Jede Zeile ist eine objektiv-pruefbare Eigenschaft.
export type CompareAttr = { label: string; value: string; strong?: boolean };
export type CompareColumn = {
  name: string;
  sub: string;
  highlight?: boolean;
  attrs: CompareAttr[];
  note: string;
};
export const COMPARISON = {
  kicker: "Im Direktvergleich",
  title: "Wo sich der BFSG-Fuchs einordnet",
  titleAccent: "einordnet",
  columns: [
    {
      name: "Gratis-Tools",
      sub: "z. B. WAVE · Lighthouse",
      highlight: false,
      attrs: [
        { label: "Ergebnis", value: "sofort & kostenlos" },
        { label: "Priorisierung", value: "keine — Rohdaten" },
        { label: "Menschliche Sichtung", value: "nein" },
        { label: "Fix-Plan & Erklärung", value: "nein" },
      ],
      note: "Gut für einen ersten technischen Überblick.",
    },
    {
      name: "BFSG-Fuchs",
      sub: "KI-Spürnase + menschliche Sichtung",
      highlight: true,
      attrs: [
        { label: "Ergebnis", value: "in der Regel wenige Stunden", strong: true },
        { label: "Priorisierung", value: "ja — nach Risiko sortiert", strong: true },
        { label: "Menschliche Sichtung", value: "ja, vor Auslieferung", strong: true },
        { label: "Fix-Plan & Erklärung", value: "Copy-Paste-Fix + Entwurf", strong: true },
      ],
      note: "Fester Preis, schnelle Lieferung, kuratierter Fix-Plan.",
    },
    {
      name: "Anwaltskanzlei",
      sub: "externes Vollaudit",
      highlight: false,
      attrs: [
        { label: "Ergebnis", value: "meist Wochen Vorlauf" },
        { label: "Priorisierung", value: "ja, individuell" },
        { label: "Menschliche Sichtung", value: "ja" },
        { label: "Fix-Plan & Erklärung", value: "rechtsverbindliche Einordnung" },
      ],
      note: "Sinnvoll, wenn Sie eine rechtsverbindliche Bewertung brauchen.",
    },
  ] as CompareColumn[],
  footnote:
    "Sachliche Einordnung nach Tempo, Prüftiefe und Kosten — keine Wertung der Anbieter. Jeder Befund in unserem Report ist belegbar.",
} as const;

// Pricing-„Welches Paket passt?"-Slider. Rein clientseitige Kaufhilfe; die echte
// Auswahl/der Kauf laeuft weiter ueber den Checkout (openCheckout). Schwellen
// spiegeln die Seiten-Limits aus PACKAGES (Basis ≤5, Profi ≤25).
export const PLAN_FINDER = {
  kicker: "Welches Paket passt zu Ihnen?",
  min: 1,
  max: 40,
  default: 8,
  unit: "Unterseiten",
  recommendationLabel: "Empfehlung des Fuchses",
} as const;

// Preis-Anker (Pricing-Sektion). Faktisch + hedged: KEINE Garantie, „meist".
export const PRICING_ANCHOR = {
  text: "Eine Abmahnung kostet schnell ein Vielfaches eines Reports — zuzüglich Anwalts- und Nachbesserungskosten unter Zeitdruck.",
  emph: "Vorab prüfen ist meist die günstigere Variante.",
} as const;

export const FAQ_ITEMS = [
  {
    q: "Betrifft mich das BFSG überhaupt?",
    a: "Betroffen sind insbesondere Online-Shops und Dienstleister im elektronischen Geschäftsverkehr. Kleinstunternehmen (unter 10 Mitarbeitende und unter 2 Mio. Euro Jahresumsatz) sind bei reinen Dienstleistungen teils ausgenommen. Der kostenlose Check gibt eine erste Einordnung.",
  },
  {
    q: "Wie unterscheidet sich der BFSG-Fuchs von Gratis-Tools wie WAVE oder Lighthouse?",
    a: "Gratis-Tools liefern Rohdaten — hunderte Findings ohne Priorisierung, ohne Lösungs-Snippet, ohne Kontext. Wir kuratieren: jeder Mangel bekommt eine Priorität, einen konkreten Fix und landet im Umsetzungs-Fahrplan. Plus: Entwurf der Barrierefreiheitserklärung, fertig zum Veröffentlichen.",
  },
  {
    q: "Wie genau ist die KI-gestützte Prüfung?",
    a: "Automatisierte Tests finden erfahrungsgemäß rund 30–50 % aller Mängel zuverlässig (Kontraste, Alt-Texte, Labels, Tastatur-Fokus). Komplexe Punkte wie Bedienlogik oder semantische Korrektheit ergänzen wir durch eine menschliche Sichtung vor Auslieferung.",
  },
  {
    q: "Was passiert nach dem Kauf?",
    a: "Nach erfolgreicher Zahlung startet der vollständige Scan automatisch. Sie erhalten Report (PDF) und Entwurf der Barrierefreiheitserklärung in der Regel innerhalb weniger Stunden per E-Mail — jeder Report wird vor dem Versand persönlich gesichtet.",
  },
  {
    q: "Was, wenn der Report keine relevanten Mängel findet?",
    a: "Dann erhalten Sie genau diese Bestätigung schriftlich — eine dokumentierte, automatisierte WCAG-2.1-AA-Erstprüfung Ihrer Seite zum Stichtag, inklusive Entwurf der Barrierefreiheitserklärung. In der Praxis findet der Scan bei nahezu jeder gewachsenen Website Optimierungspotenzial.",
  },
  {
    q: "Reichen 5 bzw. 25 Unterseiten für meine Website?",
    a: "Für die meisten KMU-Websites und Shops genügt das: Geprüft werden Ihre repräsentativen Seitentypen (Startseite, Kategorie, Produkt, Formular, Checkout) — denn dieselben Mängelmuster wiederholen sich seitenübergreifend. Bei sehr großen Portalen sprechen Sie uns vor dem Kauf kurz an.",
  },
  {
    q: "Ersetzt der Report eine Rechtsberatung?",
    a: "Nein. Der Report ist eine technische Vorprüfung nach WCAG 2.1 und deckt einen Großteil der häufigen Mängel ab. Für eine rechtsverbindliche Bewertung konsultieren Sie bitte einen Fachanwalt für IT- oder Wettbewerbsrecht.",
  },
  {
    q: "Ist der BFSG-Fuchs DSGVO-konform?",
    a: "Ja. Wir hosten ausschließlich in Deutschland, übermitteln keine Daten in Drittländer, speichern nur das, was zur Vertragsabwicklung nötig ist (E-Mail, Rechnungsadresse, gescannte URL) und nutzen nur technisch notwendige Cookies ohne Consent. Details in der Datenschutzerklärung.",
  },
  {
    q: "Wie erhalte ich eine Rechnung?",
    a: "Jede Bestellung erzeugt eine Rechnung von Stripe (PDF). Sie geht automatisch an die bei der Bestellung angegebene E-Mail-Adresse. B2B-Kunden können USt-ID und Firmenadresse hinterlegen.",
  },
  {
    q: "Fällt Umsatzsteuer an?",
    a: "Nein. Wir nutzen die Kleinunternehmer-Regelung nach § 19 UStG und weisen daher keine Umsatzsteuer aus. Der angegebene Preis ist der Gesamtpreis; auf der Rechnung steht der Hinweis „kein Ausweis von Umsatzsteuer gemäß § 19 UStG\".",
  },
  {
    q: "Kann ich vom Vertrag zurücktreten?",
    a: "Als Verbraucher haben Sie ein 14-tägiges Widerrufsrecht. Da die Leistung digital sofort erbracht wird, müssen Sie der sofortigen Ausführung im Checkout aktiv zustimmen — dadurch erlischt das Widerrufsrecht bei vollständiger Vertragserfüllung. B2B-Bestellungen haben kein Widerrufsrecht.",
  },
  {
    q: "Wie kündige ich das Re-Check-Abo?",
    a: "Das Monats-Abo ist jederzeit zum Monatsende ohne Angabe von Gründen kündbar. Das Jahres-Abo (249 €/Jahr) hat eine Erstlaufzeit von 12 Monaten und ist danach jederzeit mit einer Frist von einem Monat kündbar. Eine formlose E-Mail oder das Formular auf der Seite /kuendigen genügt. Die Kündigung bestätigen wir per E-Mail.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Wir speichern nur die zur Vertragsabwicklung nötigen Daten (E-Mail, Rechnungsadresse, gescannte URL). Scan-Ergebnisse enthalten keine personenbezogenen Daten Ihrer Website-Besucher. Details in der Datenschutzerklärung; Auskunft und Löschung über /datenschutz/anfrage.",
  },
  // Re-Check-FAQs aus d4, soweit sie nicht bereits im Bestand stehen:
  // „Wie kündige ich?" ist oben bereits beantwortet; „Kann ich das Tier
  // wechseln?" folgt, sobald der Wechsel im System verdrahtet ist
  // (Claim-Check #9).
  ...(RECHECK_TIERS_VISIBLE
    ? [
        {
          q: "Warum brauche ich vor dem Re-Check-Abo einen Erst-Report?",
          a: "Der Re-Check ist ein Delta-Dienst: Er zeigt, was sich seit der Baseline verändert hat. Ohne Erst-Report gibt es keine Baseline. Deshalb startet jedes Re-Check-Abo mit einem bezahlten Erst-Report — im Startpaket ist der erste Re-Check-Monat inklusive.",
        },
        {
          q: "Bleibt mein Preis stabil?",
          a: "Solange Ihr Abo ununterbrochen aktiv läuft, behalten Sie Ihren Beitrag — auch wenn sich unsere Listenpreise später ändern. Nach einer Kündigung gilt bei Neuabschluss der dann aktuelle Preis.",
        },
      ]
    : []),
];

export const LEGAL_NOTE =
  "Automatisierte, KI-gestützte Erstprüfung mit menschlicher Sichtung — keine Rechtsberatung, keine Konformitätsgarantie. Ergebnisse ersetzen keine vollständige manuelle Prüfung.";
