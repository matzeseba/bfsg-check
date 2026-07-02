import { FAQ_ITEMS, SITE } from "@/lib/config";

// canonical/OG-Domain bleibt bis zum DNS-Cutover bfsg-fix.de (SITE.url);
// die MARKE ist "BFSG-Fuchs" (SITE.name) — single source of truth aus lib/config.ts.
const siteUrl = SITE.url;
const organizationName = SITE.name;

type JsonLdSchema = Record<string, unknown>;

const organizationSchema: JsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: organizationName,
  url: siteUrl,
  // TODO: dediziertes quadratisches Logo (kein quadratisches Asset in public/
  // vorhanden — bis dahin auf das OG-Banner zeigen, das immerhin existiert).
  logo: `${siteUrl}/logo-fox.png`,
  description:
    "Der BFSG-Fuchs ist der automatisierte Barrierefreiheits-Scanner für deutsche Websites mit verständlichem Fix-Plan und laufendem Monitoring.",
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
};

type ProductInput = {
  name: string;
  description: string;
  price: string;
  priceSpecification?: JsonLdSchema;
  category: string;
  sku: string;
  // Anker-Ziel der Offer-URL (statt Root → konkreter Paket-/Cookie-Abschnitt).
  offerUrl: string;
  // Default InStock; nicht kaufbare Produkte (Abo-Gate) explizit anders.
  availability?: string;
};

const products: ProductInput[] = [
  {
    name: "BFSG-Report Basis",
    description:
      "Einmaliger automatischer BFSG- und WCAG-2.1-AA-Scan Ihrer Website inklusive priorisiertem Fix-Plan mit Code-Snippets.",
    price: "129.00",
    category: "Barrierefreiheits-Audit",
    sku: "bfsg-basis",
    offerUrl: `${siteUrl}/#pakete`,
  },
  {
    name: "BFSG-Report Profi",
    description:
      "Tiefenscan mit manueller Prüfung kritischer Flows, ausführlichem Fix-Plan, Entwickler-Checkliste und 30 Tagen E-Mail-Support.",
    price: "399.00",
    category: "Barrierefreiheits-Audit",
    sku: "bfsg-profi",
    offerUrl: `${siteUrl}/#pakete`,
  },
  {
    name: "Cookie-Check Basis",
    description:
      "Automatische technische Messung Ihres Cookie-Banners gem. § 25 TDDDG mit konkreter Umsetzungs-Empfehlung.",
    price: "39.00",
    category: "Cookie-Compliance",
    sku: "cookie-basis",
    offerUrl: `${siteUrl}/#cookie`,
  },
  {
    name: "Cookie-Check Profi",
    description:
      "Erweiterter Cookie- und Tracking-Audit inklusive Dokumentation für Datenschutzbeauftragte sowie Konfigurations-Vorschlag.",
    price: "69.00",
    category: "Cookie-Compliance",
    sku: "cookie-profi",
    offerUrl: `${siteUrl}/#cookie`,
  },
  {
    name: "Fuchs Re-Check Abo",
    description:
      "Monatliches Re-Audit Ihrer Website mit Veränderungs-Report. Sofortige Warnung, wenn neue Inhalte Sie aus der Compliance werfen.",
    price: "24.99",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "24.99",
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
    offerUrl: `${siteUrl}/#pakete`,
  },
  {
    // Jahres-Variante (Backend-Paket 'abo-jahr'): gleiche Leistung (monatlicher
    // Re-Check), jährliche Abrechnung zu 249 €. unitCode ANN = Jahr (UN/CEFACT).
    name: "Fuchs Re-Check Abo (jährlich)",
    description:
      "Monatliches Re-Audit Ihrer Website mit Veränderungs-Report bei jährlicher Abrechnung. Erstlaufzeit 12 Monate, danach monatlich kündbar.",
    price: "249.00",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "249.00",
      priceCurrency: "EUR",
      billingDuration: 1,
      billingIncrement: 1,
      unitCode: "ANN",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "ANN",
      },
    },
    category: "Monitoring-Abo",
    sku: "recheck-abo-jahr",
    offerUrl: `${siteUrl}/#pakete`,
  },
];

const productSchemas: JsonLdSchema[] = products.map((product) => {
  const offer: JsonLdSchema = {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "EUR",
    availability: product.availability ?? "https://schema.org/InStock",
    url: product.offerUrl,
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

function JsonLdScripts({
  schemas,
}: {
  schemas: Array<{ id: string; data: JsonLdSchema }>;
}) {
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

// Global (in layout.tsx): gilt für die GANZE Domain — Organization + WebSite.
export function SiteJsonLd() {
  return (
    <JsonLdScripts
      schemas={[
        { id: "ld-organization", data: organizationSchema },
        { id: "ld-website", data: websiteSchema },
      ]}
    />
  );
}

// Nur Startseite (in app/page.tsx): Produkt-Angebote + sichtbare FAQ.
// Darf NICHT global geladen werden — sonst seitenfremdes Markup auf
// /impressum, Pillar-Pages etc. (Spam-/Manual-Action-Risiko) + doppelte
// FAQPage auf Pillar-Pages.
export function HomeJsonLd() {
  return (
    <JsonLdScripts
      schemas={[
        ...productSchemas.map((data, index) => ({
          id: `ld-product-${products[index].sku}`,
          data,
        })),
        { id: "ld-faq", data: faqSchema },
      ]}
    />
  );
}
