// Zentrale Konfiguration fuer die BFSG-Fuchs Landingpage.
// Preise und Pakete spiegeln scanner/app.js Z40-48 (Quelle der Wahrheit).

export type PackageId =
  | "basis"
  | "profi"
  | "cookie-basis"
  | "cookie-profi"
  | "abo";

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
  // false = Paket beworben, aber noch nicht kaufbar (Backend-Gate, z.B. ENABLE_ABO=false).
  // CTA zeigt dann "Bald verfügbar" statt einen 400-Checkout auszulösen.
  available?: boolean;
};

// HINWEIS Domain/Rebrand: Die Marke ist "BFSG-Fuchs". Die produktive Domain ist
// bis zum vom Owner gesteuerten DNS-/Stripe-/Brevo-Cutover weiterhin bfsg-fix.de
// (DNS+TLS+Stripe-Redirects+Mail laufen dort). `url` steuert nur canonical/OG/
// sitemap — die Stripe-success/cancel-URLs liegen im Scanner-Backend. Beim Cutover
// nur diese eine Konstante auf https://bfsg-fuchs.de umstellen (+ Backend-.env).
export const SITE = {
  url: "https://bfsg-fix.de",
  name: "BFSG-Fuchs",
  // Ziel-Marken-Domain nach Cutover (rein dokumentarisch, NICHT funktional verlinkt,
  // solange sie nicht aufgelöst/TLS-gesichert ist).
  brandDomain: "bfsg-fuchs.de",
  title: "BFSG-Fuchs — Ist Ihre Website bereit fürs BFSG? | Kostenloser WCAG-Sofort-Check",
  description:
    "Der BFSG-Fuchs prüft in 60 Sekunden, wo Ihre Website die Anforderungen des Barrierefreiheitsstärkungsgesetzes (BFSG) noch verfehlt — automatisierte WCAG-2.1-AA-Analyse mit menschlicher Sichtung, ausführlicher Report auf Wunsch.",
  email: "info@bfsg-fix.de",
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
  pill: "BFSG seit 28.06.2025 in Kraft · Erste Abmahnungen rollen an",
  // Fox-Headline (Design "BFSG-Fuchs"): "Schlau wie ein Fuchs — bereit fürs BFSG?"
  // Nur das Akzentwort "BFSG" leuchtet im Orange-Verlauf (headlineEmph); der Rest
  // bleibt creme (headlineLead). "bereit fürs BFSG?" ist eine Bereitschafts-FRAGE,
  // KEINE verbotene Konformitäts-/Garantie-Aussage ("BFSG-konform", UWG §5).
  // Das "?" wird in Hero.tsx an das Akzentwort gehängt; Clip-Schutz sitzt in
  // .gradient-text (padding-/margin-right) → kein Glyph-Clipping, kein CLS.
  headlineLead: "Schlau wie ein Fuchs — bereit fürs",
  headlineEmph: "BFSG",
  // Tail leer: die Pointe "bevor es eine Kanzlei tut" steht in der Subline.
  // Hero.tsx rendert das Tail-Span nur, wenn der String nicht leer ist.
  headlineTail: "",
  subline:
    "Der BFSG-Fuchs schnüffelt in 60 Sekunden über 80 WCAG-2.1-AA-Regeln durch und legt jeden Mangel priorisiert offen — mit Copy-Paste-Fix und menschlicher Sichtung. Premium-Audit ohne Kanzlei-Honorar.",
  cta: "Kostenlos prüfen",
  // Aktionsspezifisches Label am Scan-Feld (Design: "Gratis-Check starten") —
  // verb-getrieben auf die Mikro-Conversion gemünzt; cta bleibt für Header/Final-CTA.
  scanCta: "Gratis-Check starten",
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

// Daten fuer das Hero-Audit-Report-Visual (rein illustrativ, kein echter Scan).
// Sichtbar als Beispiel/Demo gekennzeichnet: sampleLabel (Chip in der App-Chrome)
// + previewHeading (Ueberschrift ueber dem Visual) machen die Vorschau-Natur transparent.
export const HERO_VISUAL = {
  reportPath: "report/4f2a",
  sampleLabel: "Beispiel",
  // Vorschau-Überschrift über dem Report-Visual. previewAccent = das eine
  // Fraunces-Italic-Akzentwort (Editorial-Rhythmus); Hero.tsx splittet die
  // Überschrift an diesem Wort und setzt es kursiv-gradient.
  previewHeading: "So sieht Ihr kostenloses Sofort-Ergebnis aus",
  previewAccent: "Sofort-Ergebnis",
  score: 62,
  grade: "C",
  totalFindings: 17,
  criticalCount: 4,
  findings: [
    { severity: "Kritisch", title: "8 Bilder ohne Alt-Text", tone: "high" },
    { severity: "Kritisch", title: "Kontrast 1.9:1 auf CTA-Buttons", tone: "high" },
    { severity: "Mittel", title: "Formularfeld ohne sichtbares Label", tone: "mid" },
    { severity: "Hinweis", title: "Heading-Hierarchie überspringt H3", tone: "low" },
  ],
  contrast: {
    before: { ratio: "1.9:1", label: "vorher" },
    after: { ratio: "7.4:1", label: "nachher" },
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
    { value: "Verbände", label: "klagebefugt nach §15 BFSG" },
  ],
} as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Website-URL eingeben",
    desc: "Adresse einfügen, Branche optional angeben — der Fuchs spitzt die Ohren und bereitet Crawler & Audit-Regeln vor.",
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
    features: [
      "Alles aus dem Basis-Report",
      "Bis zu 25 Unterseiten statt 5 (5× Abdeckung)",
      "30 Tage E-Mail-Support bei Rückfragen",
    ],
  },
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
    features: [
      "Monatlicher Re-Check",
      "Alarm bei neuen Mängeln",
      "Aktualisierte Erklärung",
      "Jederzeit kündbar",
    ],
  },
];

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
    desc: "Während andere noch Termine koordinieren, haben Sie schon den Fix-Plan auf dem Tisch. Stripe-Checkout, sofortiger Scan-Start, Lieferung typischerweise binnen weniger Stunden.",
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
        { label: "Ergebnis", value: "typischerweise in Stunden", strong: true },
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
    a: "Nach erfolgreicher Zahlung startet der vollständige Scan automatisch. Sie erhalten Report (PDF) und Entwurf der Barrierefreiheitserklärung typischerweise innerhalb weniger Stunden per E-Mail.",
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
    a: "Das Abo ist jederzeit zum Monatsende ohne Angabe von Gründen kündbar. Eine formlose E-Mail oder das Formular auf der Seite /kündigen genügt. Die Kündigung bestätigen wir per E-Mail.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Wir speichern nur die zur Vertragsabwicklung nötigen Daten (E-Mail, Rechnungsadresse, gescannte URL). Scan-Ergebnisse enthalten keine personenbezogenen Daten Ihrer Website-Besucher. Details in der Datenschutzerklärung; Auskunft und Löschung über /datenschutz/anfrage.",
  },
];

export const LEGAL_NOTE =
  "Automatisierte, KI-gestützte Erstprüfung mit menschlicher Sichtung — keine Rechtsberatung, keine Konformitätsgarantie. Ergebnisse ersetzen keine vollständige manuelle Prüfung.";
