const siteUrl = "https://bfsg-fix.de";
const organizationName = "BFSG-Check";

type JsonLdSchema = Record<string, unknown>;

const organizationSchema: JsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: organizationName,
  url: siteUrl,
  logo: `${siteUrl}/opengraph-image`,
  description:
    "BFSG-Check ist der automatisierte Barrierefreiheits-Scanner für deutsche Websites mit verständlichem Fix-Plan und laufendem Monitoring.",
  sameAs: ["https://www.linkedin.com/company/bfsg-check"],
};

const websiteSchema: JsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: organizationName,
  url: siteUrl,
  inLanguage: "de-DE",
  publisher: {
    "@type": "Organization",
    name: organizationName,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

type ProductInput = {
  name: string;
  description: string;
  price: string;
  priceSpecification?: JsonLdSchema;
  category: string;
  sku: string;
};

const products: ProductInput[] = [
  {
    name: "BFSG-Check Basis",
    description:
      "Einmaliger automatischer BFSG- und WCAG-2.1-AA-Scan Ihrer Website inklusive priorisiertem Fix-Plan mit Code-Snippets.",
    price: "199.00",
    category: "Barrierefreiheits-Audit",
    sku: "bfsg-basis",
  },
  {
    name: "BFSG-Check Profi",
    description:
      "Tiefenscan mit manueller Prüfung kritischer Flows, ausführlichem Fix-Plan, Entwickler-Handover und 30 Minuten Beratungs-Call.",
    price: "499.00",
    category: "Barrierefreiheits-Audit",
    sku: "bfsg-profi",
  },
  {
    name: "Cookie-Check Basis",
    description:
      "Automatische Prüfung Ihres Cookie-Banners auf TTDSG- und DSGVO-Konformität mit konkreter Umsetzungs-Empfehlung.",
    price: "49.00",
    category: "Cookie-Compliance",
    sku: "cookie-basis",
  },
  {
    name: "Cookie-Check Profi",
    description:
      "Erweiterter Cookie- und Tracking-Audit inklusive Dokumentation für Datenschutzbeauftragte sowie Konfigurations-Vorschlag.",
    price: "79.00",
    category: "Cookie-Compliance",
    sku: "cookie-profi",
  },
  {
    name: "BFSG-Re-Check-Abo",
    description:
      "Monatliches Re-Audit Ihrer Website mit Veränderungs-Report. Sofortige Warnung, wenn neue Inhalte Sie aus der Compliance werfen.",
    price: "49.00",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "49.00",
      priceCurrency: "EUR",
      billingDuration: 1,
      billingIncrement: 1,
      unitCode: "MON",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "MON",
      },
    },
    category: "Monitoring-Abo",
    sku: "recheck-abo",
  },
];

const productSchemas: JsonLdSchema[] = products.map((product) => {
  const offer: JsonLdSchema = {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: siteUrl,
    seller: {
      "@type": "Organization",
      name: organizationName,
    },
  };

  if (product.priceSpecification) {
    offer.priceSpecification = product.priceSpecification;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    category: product.category,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: organizationName,
    },
    offers: offer,
  };
});

const faqs: Array<{ question: string; answer: string }> = [
  {
    question: "Für wen gilt das Barrierefreiheitsstärkungsgesetz (BFSG)?",
    answer:
      "Das BFSG gilt ab 28. Juni 2025 für nahezu alle Unternehmen, die Verbraucherinnen und Verbrauchern digitale Produkte oder Dienstleistungen anbieten — also Onlineshops, Buchungsstrecken, Banken-Portale, Streaming und vieles mehr. Kleinstunternehmen mit weniger als 10 Beschäftigten und höchstens 2 Millionen Euro Jahresumsatz sind bei Dienstleistungen ausgenommen, nicht aber beim Verkauf von Produkten.",
  },
  {
    question: "Welche Bußgelder drohen bei Nicht-Einhaltung?",
    answer:
      "Die Marktüberwachungsbehörden können Bußgelder bis 100.000 Euro pro Verstoß verhängen. Hinzu kommen Abmahnungen durch Verbraucherverbände sowie ein vorübergehendes Vertriebsverbot für betroffene Produkte oder Dienstleistungen.",
  },
  {
    question: "Was prüft der BFSG-Check genau?",
    answer:
      "Wir testen Ihre Website automatisiert gegen die Anforderungen aus WCAG 2.1 Level AA und BFSG: Farbkontraste, Tastatur-Bedienbarkeit, ARIA-Auszeichnungen, Formular-Labels, Alt-Texte, Fokus-Reihenfolge, Cookie-Banner-Konformität sowie die Erreichbarkeit der Barrierefreiheits-Erklärung.",
  },
  {
    question: "Wie lange dauert ein Scan?",
    answer:
      "Der Basis-Scan ist in der Regel in unter 10 Minuten fertig. Sie erhalten den Report sofort per E-Mail. Der Profi-Scan mit manueller Nachprüfung kritischer Nutzer-Flows wird innerhalb von 2 Werktagen geliefert.",
  },
  {
    question: "Was bekomme ich konkret geliefert?",
    answer:
      "Einen verständlichen PDF-Report mit allen Findings, priorisiert nach Risiko, sowie einen Fix-Plan mit konkreten Code-Snippets für Ihre Entwicklerinnen und Entwickler. Beim Profi-Paket zusätzlich ein 30-minütiges Übergabe-Gespräch.",
  },
  {
    question: "Was kostet das Ganze?",
    answer:
      "Der Basis-Check kostet 199 Euro einmalig, der Profi-Check 499 Euro einmalig. Für den Cookie-Banner gibt es Basis für 49 Euro und Profi für 79 Euro. Wer dauerhaft compliant bleiben will, bucht das Re-Check-Abo für 49 Euro pro Monat — jederzeit kündbar.",
  },
  {
    question: "Brauche ich nach einem Fix einen erneuten Scan?",
    answer:
      "Ja — Barrierefreiheit ist kein einmaliger Zustand, sondern ein Prozess. Neue Inhalte, Theme-Updates oder Drittanbieter-Scripts können bestehende Compliance kippen. Das Re-Check-Abo prüft Ihre Website monatlich automatisch.",
  },
  {
    question: "Können Sie meine Fixes auch direkt umsetzen?",
    answer:
      "BFSG-Check liefert den Fix-Plan; die Umsetzung übernimmt Ihr Team oder Ihre Agentur. Auf Wunsch empfehlen wir geprüfte Umsetzungs-Partner aus unserem Netzwerk, die mit unserem Fix-Plan vertraut sind.",
  },
];

const faqSchema: JsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const schemas: Array<{ id: string; data: JsonLdSchema }> = [
  { id: "ld-organization", data: organizationSchema },
  { id: "ld-website", data: websiteSchema },
  ...productSchemas.map((data, index) => ({
    id: `ld-product-${products[index].sku}`,
    data,
  })),
  { id: "ld-faq", data: faqSchema },
];

export function JsonLd() {
  return (
    <>
      {schemas.map(({ id, data }) => (
        <script
          key={id}
          id={id}
          type="application/ld+json"
          // JSON.stringify is safe here: data is fully static and contains no user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}

export const __jsonLdFaqs = faqs;
