import { FAQ_ITEMS } from "@/lib/config";

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
  // Default InStock; nicht kaufbare Produkte (Abo-Gate) explizit anders.
  availability?: string;
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
      "Tiefenscan mit manueller Prüfung kritischer Flows, ausführlichem Fix-Plan, Entwickler-Checkliste und 30 Tagen E-Mail-Support.",
    price: "499.00",
    category: "Barrierefreiheits-Audit",
    sku: "bfsg-profi",
  },
  {
    name: "Cookie-Check Basis",
    description:
      "Automatische Prüfung Ihres Cookie-Banners auf TDDDG- und DSGVO-Konformität mit konkreter Umsetzungs-Empfehlung.",
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
    price: "39.00",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "39.00",
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
    // Abo noch nicht kaufbar (Backend ENABLE_ABO=false) → nicht als InStock auszeichnen.
    availability: "https://schema.org/PreOrder",
  },
];

const productSchemas: JsonLdSchema[] = products.map((product) => {
  const offer: JsonLdSchema = {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "EUR",
    availability: product.availability ?? "https://schema.org/InStock",
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

// FAQ-Schema wird aus der SICHTBAREN FAQ (lib/config.ts → FAQ_ITEMS, im
// FAQAccordion gerendert) generiert. Google verlangt für FAQ-Rich-Results, dass
// die ausgezeichneten Fragen/Antworten 1:1 auf der Seite stehen — eine zweite,
// separate FAQ-Liste würde die Auszeichnung riskieren.
const faqs: Array<{ question: string; answer: string }> = FAQ_ITEMS.map(
  (item) => ({ question: item.q, answer: item.a }),
);

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
