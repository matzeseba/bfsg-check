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
};

export const SITE = {
  url: "https://bfsg-fix.de",
  name: "BFSG-Check",
  title: "BFSG-Check — Ist Ihre Website abmahnsicher? | Kostenlose Sofort-Prüfung",
  description:
    "Prüfen Sie in 60 Sekunden, ob Ihre Website das Barrierefreiheitsstärkungsgesetz (BFSG) erfüllt. Kostenloser Sofort-Check, ausführlicher Report auf Wunsch.",
  email: "hallo@bfsg-fix.de",
} as const;

export const HERO = {
  pill: "Barrierefreiheitsstärkungsgesetz (BFSG) seit 28.06.2025 in Kraft",
  headline: "Ist Ihre Website BFSG-konform? Prüfen Sie es kostenlos.",
  subline:
    "Automatisierter Sofort-Check nach WCAG 2.1 / EN 301 549 — mit konkretem, menschlich geprüftem Fix-Plan zum Abarbeiten. Ergebnis in unter 60 Sekunden.",
  cta: "Jetzt prüfen",
  placeholder: "https://ihre-website.de",
  badges: [
    "Ergebnis in 60 Sek.",
    "KI-gestützt + menschlich geprüft",
    "WCAG 2.1 / EN 301 549",
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
    tag: "Beliebt · Profi",
    price: "499 €",
    description: "Report + Umsetzungsplan",
    mode: "payment",
    amountCents: 49900,
    featured: true,
    features: [
      "Alles aus Basis",
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
    price: "49 €",
    priceSuffix: "/Monat",
    description: "Dauerhafte Überwachung",
    mode: "subscription",
    amountCents: 4900,
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
    tag: "Beliebt · Cookie Profi",
    price: "79 €",
    description: "Tiefere Prüfung & manuelle Sichtung",
    mode: "payment",
    amountCents: 7900,
    featured: true,
    features: [
      "Alles aus Cookie Basis",
      "Erweiterte Tracker-Liste (TCF-Hinweise)",
      "Prüfung bekannter CMP-Konfigurationen",
      "Menschliche Sichtung vor Auslieferung",
    ],
  },
];

export const FAQ_ITEMS = [
  {
    q: "Betrifft mich das BFSG überhaupt?",
    a: "Betroffen sind insbesondere Online-Shops und Dienstleister im elektronischen Geschäftsverkehr. Kleinstunternehmen (unter 10 Mitarbeitende und unter 2 Mio. Euro Jahresumsatz) sind bei reinen Dienstleistungen teils ausgenommen. Der kostenlose Check gibt eine erste Einordnung.",
  },
  {
    q: "Ersetzt der Report eine Rechtsberatung?",
    a: "Nein. Der Report ist eine technische Vorprüfung nach WCAG 2.1 und deckt einen Großteil der häufigen Mängel ab. Für eine rechtsverbindliche Bewertung konsultieren Sie bitte einen Fachanwalt für IT- oder Wettbewerbsrecht.",
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
