// Zentrale Konfiguration für BFSG-Check Landingpage.
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

export const SITE = {
  url: "https://bfsg-fix.de",
  name: "BFSG-Check",
  title: "BFSG-Check — Ist Ihre Website bereit fürs BFSG? | Kostenloser WCAG-Sofort-Check",
  description:
    "Prüfen Sie in 60 Sekunden, wo Ihre Website die Anforderungen des Barrierefreiheitsstärkungsgesetzes (BFSG) noch verfehlt — automatisierte WCAG-2.1-AA-Analyse, ausführlicher Report auf Wunsch.",
  email: "hallo@bfsg-fix.de",
} as const;

export const BRAND = {
  tagline: "BFSG- & WCAG-Audit für mittelständische Website-Betreiber",
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
  headlineLead: "Ist Ihre Website",
  // "bereit fürs BFSG?" bringt den vom Owner gewünschten BFSG-Hook zurück, ohne
  // die laut CLAUDE.md/UWG §5 verbotene Konformitäts-Aussage "BFSG-konform"
  // (= Garantie-Behauptung). Eine Bereitschafts-FRAGE behauptet keine Konformität.
  headlineEmph: "bereit fürs BFSG?",
  headlineTail: "In 60 Sekunden wissen Sie es — bevor es eine Kanzlei tut.",
  subline:
    "Wir scannen Ihre Seite nach über 80 WCAG-2.1-AA-Regeln und liefern jeden Mangel priorisiert — mit Copy-Paste-Fix und menschlicher Sichtung. Premium-Audit ohne Kanzlei-Honorar.",
  cta: "Jetzt kostenlos prüfen",
  ctaSecondary: "Pakete ansehen",
  placeholder: "https://ihre-website.de",
  badges: [
    "Ergebnis in 60 Sek.",
    "KI-gestützt + menschlich geprüft",
    "WCAG 2.1 / EN 301 549",
  ],
  trust: [
    { label: "80+", sub: "Prüfregeln (EN 301 549)" },
    { label: "DSGVO", sub: "konform" },
    { label: "DE", sub: "Hosting" },
    { label: "60 Sek.", sub: "bis Ergebnis" },
  ],
} as const;

// Daten fuer das Hero-Audit-Report-Visual (rein illustrativ, kein echter Scan).
export const HERO_VISUAL = {
  reportPath: "report/4f2a",
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
  title: "Die BFSG-Frist ist seit dem 28. Juni 2025 verstrichen — und die ersten Abmahnungen sind da.",
  desc: "Betroffene Unternehmen müssen ihre digitalen Angebote barrierefrei anbieten. Wettbewerber, Verbände und abmahnende Kanzleien dürfen Verstöße verfolgen. Wer jetzt prüft, behebt Mängel in Ruhe statt unter Abmahn-Druck. In 60 Sekunden sehen Sie, wo Sie stehen — kostenlos und ohne Anmeldung.",
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
    desc: "Adresse einfügen, Branche optional angeben — wir bereiten Crawler & Audit-Regeln vor.",
    icon: "globe",
  },
  {
    step: "02",
    title: "Automatisierter WCAG-Scan",
    desc: "Kontraste, Alt-Texte, Tastatur-Fokus, Labels, Strukturen — über 80 Regeln nach EN 301 549.",
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

export const STATS: StatItem[] = [
  {
    value: "60 Sek.",
    num: 60,
    suffix: " Sek.",
    label: "bis zum ersten Ergebnis",
  },
  // num:null → statisch rendern. Eine Versionsnummer ("2.1") darf NICHT über
  // toLocaleString("de-DE") laufen, sonst wird daraus das Dezimalkomma "2,1".
  { value: "WCAG 2.1", num: null, label: "Prüfung nach AA-Standard" },
  { value: "EN 301 549", num: null, label: "Audit-Methodik" },
  {
    value: "100 %",
    num: 100,
    suffix: " %",
    label: "Hosting in Deutschland",
  },
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
    price: "199 €",
    description: "Einmaliger Vollreport",
    mode: "payment",
    amountCents: 19900,
    moneyBack: "30 Tage Geld-zurück bei berechtigter Reklamation",
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
    price: "499 €",
    description: "Report + Umsetzungsplan",
    mode: "payment",
    amountCents: 49900,
    featured: true,
    moneyBack: "30 Tage Geld-zurück bei berechtigter Reklamation",
    features: [
      "Alles aus Basis — plus tiefere Abdeckung:",
      "Bis zu 25 Unterseiten",
      "Konkreter Umsetzungs-Fahrplan",
      "Entwickler-Checkliste (Copy-Paste)",
      "30 Tage E-Mail-Support",
    ],
  },
  {
    id: "abo",
    name: "BFSG Re-Check Abo",
    tag: "Abo",
    price: "39 €",
    priceSuffix: "/Monat",
    description: "Dauerhafte Überwachung",
    mode: "subscription",
    amountCents: 3900,
    available: false, // Backend ENABLE_ABO=false → noch nicht kaufbar. Auf true, sobald Abo live.
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
    price: "49 €",
    description: "Einmalige technische Messung",
    mode: "payment",
    amountCents: 4900,
    moneyBack: "30 Tage Geld-zurück bei berechtigter Reklamation",
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
    price: "79 €",
    description: "Tiefere Prüfung & manuelle Sichtung",
    mode: "payment",
    amountCents: 7900,
    featured: true,
    moneyBack: "30 Tage Geld-zurück bei berechtigter Reklamation",
    features: [
      "Alles aus Cookie Basis — plus tiefere Prüfung:",
      "Erweiterte Tracker-Liste (TCF-Hinweise)",
      "Prüfung bekannter CMP-Konfigurationen",
      "Menschliche Sichtung vor Auslieferung",
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
    desc: "Sie zahlen einmalig 199 € oder 499 € — kein Tagessatz, keine offene Rechnung. Sie wissen vorab auf den Euro genau, was es kostet.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Betrifft mich das BFSG überhaupt?",
    a: "Betroffen sind insbesondere Online-Shops und Dienstleister im elektronischen Geschäftsverkehr. Kleinstunternehmen (unter 10 Mitarbeitende und unter 2 Mio. Euro Jahresumsatz) sind bei reinen Dienstleistungen teils ausgenommen. Der kostenlose Check gibt eine erste Einordnung.",
  },
  {
    q: "Wie unterscheidet sich BFSG-Check von Gratis-Tools wie WAVE oder Lighthouse?",
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
    q: "Ist BFSG-Check DSGVO-konform?",
    a: "Ja. Wir hosten ausschließlich in Deutschland, übermitteln keine Daten in Drittländer, speichern nur das, was zur Vertragsabwicklung nötig ist (E-Mail, Rechnungsadresse, gescannte URL) und nutzen nur technisch notwendige Cookies ohne Consent. Details in der Datenschutzerklärung.",
  },
  {
    q: "Wie erhalte ich eine Rechnung?",
    a: "Jede Bestellung erzeugt eine Rechnung von Stripe (PDF). Sie geht automatisch an die bei der Bestellung angegebene E-Mail-Adresse. B2B-Kunden können USt-ID und Firmenadresse hinterlegen.",
  },
  {
    q: "Fällt Umsatzsteuer an?",
    a: "Für Bestellungen aus Deutschland weisen wir die gesetzliche USt aus, sofern wir nicht die Kleinunternehmer-Regelung nach §19 UStG nutzen. Im B2B-Reverse-Charge-Fall (EU-Ausland mit gültiger USt-ID) wird die Steuerschuld auf den Empfänger übertragen.",
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
