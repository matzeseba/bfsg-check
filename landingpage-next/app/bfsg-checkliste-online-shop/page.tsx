import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BFSG-Checkliste 2026: 25 Punkte für Online-Shops",
  description:
    "Welche WCAG-2.1-Anforderungen müssen Online-Shops seit 28.06.2025 erfüllen? 25-Punkte-Checkliste, häufige Fehler und Gratis-Scan.",
  alternates: {
    canonical: "/bfsg-checkliste-online-shop",
  },
  openGraph: {
    title: "BFSG-Checkliste 2026 für Online-Shops — 25 Prüfpunkte",
    description:
      "Seit 28.06.2025 gilt das BFSG. Prüfen Sie mit dieser Checkliste, ob Ihr Shop die WCAG-2.1-AA-Anforderungen erfüllt.",
    url: "https://barrierefrei-pruefen.de/bfsg-checkliste-online-shop",
    type: "article",
  },
};

const CHECK_ITEMS = [
  { nr: 1, kategorie: "Textalternativen", pruefpunkt: "Alle produktbezogenen Bilder haben aussagekräftige Alt-Texte", wcag: "1.1.1", prio: "Kritisch" },
  { nr: 2, kategorie: "Textalternativen", pruefpunkt: 'Dekorative Bilder haben leeres alt-Attribut (alt="")', wcag: "1.1.1", prio: "Kritisch" },
  { nr: 3, kategorie: "Kontrast", pruefpunkt: "Normaler Text: Kontrastverhältnis mind. 4,5:1", wcag: "1.4.3", prio: "Kritisch" },
  { nr: 4, kategorie: "Kontrast", pruefpunkt: "Großer Text (≥18 pt oder ≥14 pt fett): Kontrast mind. 3:1", wcag: "1.4.3", prio: "Kritisch" },
  { nr: 5, kategorie: "Kontrast", pruefpunkt: "UI-Komponenten und Grafiken: Kontrast mind. 3:1", wcag: "1.4.11", prio: "Hoch" },
  { nr: 6, kategorie: "Tastatur", pruefpunkt: "Alle interaktiven Elemente per Tastatur erreichbar", wcag: "2.1.1", prio: "Kritisch" },
  { nr: 7, kategorie: "Tastatur", pruefpunkt: "Sichtbarer Fokus-Indikator auf fokussierten Elementen", wcag: "2.4.7", prio: "Hoch" },
  { nr: 8, kategorie: "Tastatur", pruefpunkt: "Kein Tastatur-Trap in Komponenten oder Modals", wcag: "2.1.2", prio: "Kritisch" },
  { nr: 9, kategorie: "Formulare", pruefpunkt: "Alle Formularfelder haben sichtbare, verknüpfte Labels", wcag: "1.3.1 / 3.3.2", prio: "Kritisch" },
  { nr: 10, kategorie: "Formulare", pruefpunkt: "Fehlermeldungen identifizieren Input und geben Korrekturhinweis", wcag: "3.3.1 / 3.3.3", prio: "Hoch" },
  { nr: 11, kategorie: "Formulare", pruefpunkt: "autocomplete-Attribute für Adress- und Zahlungsfelder gesetzt", wcag: "1.3.5", prio: "Mittel" },
  { nr: 12, kategorie: "Struktur", pruefpunkt: "Heading-Hierarchie korrekt (H1 → H2 → H3, keine Ebenen überspringen)", wcag: "1.3.1", prio: "Hoch" },
  { nr: 13, kategorie: "Struktur", pruefpunkt: 'Seitensprache im <html lang="de"> korrekt gesetzt', wcag: "3.1.1", prio: "Mittel" },
  { nr: 14, kategorie: "Struktur", pruefpunkt: "Landmarks verwendet (header, main, nav, footer, aside)", wcag: "1.3.1", prio: "Mittel" },
  { nr: 15, kategorie: "Navigation", pruefpunkt: "Skip-Link zum Hauptinhalt vorhanden und funktional", wcag: "2.4.1", prio: "Hoch" },
  { nr: 16, kategorie: "Navigation", pruefpunkt: "Seitentitel eindeutig und beschreibend", wcag: "2.4.2", prio: "Hoch" },
  { nr: 17, kategorie: "Navigation", pruefpunkt: 'Linktexte beschreiben das Ziel (kein „hier klicken“)', wcag: "2.4.4", prio: "Hoch" },
  { nr: 18, kategorie: "Multimedia", pruefpunkt: "Videos haben Untertitel oder Transkripte", wcag: "1.2.2 / 1.2.3", prio: "Hoch" },
  { nr: 19, kategorie: "Responsivität", pruefpunkt: "Inhalt bei 400 % Zoom nicht abgeschnitten oder horizontal scrollbar", wcag: "1.4.4 / 1.4.10", prio: "Hoch" },
  { nr: 20, kategorie: "Responsivität", pruefpunkt: "Touch-Targets mind. 24×24 CSS-Pixel (empfohlen: 44×44 px)", wcag: "2.5.8", prio: "Mittel" },
  { nr: 21, kategorie: "Checkout", pruefpunkt: "Fehler im Checkout klar benannt und korrigierbar", wcag: "3.3.1", prio: "Kritisch" },
  { nr: 22, kategorie: "Checkout", pruefpunkt: "Zahlungsformular mit autocomplete-Attributen für Screenreader", wcag: "1.3.5", prio: "Hoch" },
  { nr: 23, kategorie: "Cookie-Banner", pruefpunkt: "Banner mit Tastatur vollständig bedienbar", wcag: "2.1.1", prio: "Hoch" },
  { nr: 24, kategorie: "PDF/Dokumente", pruefpunkt: "AGBs und Datenblätter als barrierefreie PDFs oder HTML", wcag: "1.1.1", prio: "Mittel" },
  { nr: 25, kategorie: "Barrierefreiheitserklärung", pruefpunkt: "Barrierefreiheitserklärung gemäß § 15 BFSGV verlinkt", wcag: "BFSGV §15", prio: "Kritisch" },
];

const FAQ = [
  {
    q: "Gilt das BFSG für jeden Online-Shop?",
    a: "Das Barrierefreiheitsstärkungsgesetz gilt seit 28.06.2025 für Produkte und Dienstleistungen im elektronischen Geschäftsverkehr. Kleinstunternehmen (weniger als 10 Beschäftigte UND weniger als 2 Millionen Euro Jahresumsatz) können eine Ausnahme beantragen, wenn die Anforderungen eine unverhältnismäßige Belastung darstellen. Die meisten mittelständischen Shops sind betroffen.",
  },
  {
    q: "Welche WCAG-Version verlangt das BFSG?",
    a: "Das BFSG verweist auf EN 301 549, die im Kern WCAG 2.1 Stufe AA fordert. WCAG 2.2 ist noch nicht explizit vorgeschrieben, enthält aber sinnvolle Ergänzungen (z. B. 2.5.8 zu Touch-Targets). Eine technische Prüfung nach WCAG 2.1 AA deckt den Pflicht-Mindeststandard ab.",
  },
  {
    q: "Wie viele Mängel findet ein automatisierter Scan?",
    a: "Automatisierte Tools wie axe-core oder Lighthouse finden zuverlässig rund 30–50 % der WCAG-Mängel — vor allem Kontraste, fehlende Alt-Texte, Labels und strukturelle Probleme. Komplexe Anforderungen wie semantische Korrektheit oder korrekte ARIA-Nutzung erfordern zusätzlich manuelle Sichtung.",
  },
  {
    q: "Muss ich eine Barrierefreiheitserklärung veröffentlichen?",
    a: "Ja. Betreiber von Websites im Anwendungsbereich des BFSG sind verpflichtet, eine Barrierefreiheitserklärung gemäß § 15 BFSGV zu veröffentlichen. Diese muss Konformitätsstatus, bekannte Mängel, einen Feedback-Mechanismus und Kontaktdaten einer Schlichtungsstelle enthalten.",
  },
  {
    q: "Was passiert bei Nichterfüllung der BFSG-Anforderungen?",
    a: "Verbände und Mitbewerber können seit 28.06.2025 Verstöße verfolgen. Abmahnkanzleien haben bereits Forderungen verschickt. Dies ist eine technische Analyse, keine Rechtsberatung — für rechtliche Einschätzungen wenden Sie sich an einen Fachanwalt für IT-Recht.",
  },
];

export default function BfsgChecklisteOnlineShopPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "BFSG-Checkliste 2026: 25 Punkte, die jeder Online-Shop prüfen muss",
    description: "25-Punkte-Checkliste für BFSG- und WCAG-2.1-Anforderungen im Online-Shop.",
    url: "https://barrierefrei-pruefen.de/bfsg-checkliste-online-shop",
    publisher: { "@type": "Organization", name: "Barrierefrei-Prüfen", url: "https://barrierefrei-pruefen.de" },
    dateModified: "2026-06-21",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · WCAG 2.1 AA · Online-Shops
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            BFSG-Checkliste 2026: 25 Punkte, die jeder Online-Shop jetzt prüfen muss
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Seit dem 28. Juni 2025 gilt das Barrierefreiheitsstärkungsgesetz (BFSG). Online-Shops im elektronischen
            Geschäftsverkehr müssen ihre Angebote nach WCAG 2.1 AA prüfen und Mängel beheben. Diese Checkliste
            gibt einen praxisorientierten Überblick über die 25 wichtigsten Prüfpunkte — mit WCAG-Referenz und
            Prioritätsstufe.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juni 2026 · Automatisierte technische Analyse, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Wer ist seit 28.06.2025 betroffen?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das BFSG richtet sich an Wirtschaftsakteure, die Produkte oder Dienstleistungen in Deutschland anbieten,
            die unter den Anwendungsbereich fallen. Im E-Commerce zählen vor allem Webshops dazu, die Verbrauchern
            Waren oder digitale Leistungen anbieten. Kleinstunternehmen unter 10 Beschäftigte und 2 Millionen Euro
            Jahresumsatz können eine Ausnahme dokumentieren — der Nachweis der unverhältnismäßigen Belastung liegt
            dabei beim Unternehmen selbst.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Abmahnwellen durch Mitbewerber und spezialisierte Kanzleien laufen seit Herbst 2025. Wer jetzt prüft
            und dokumentiert, hat eine bessere Ausgangsposition — unabhängig davon, ob alle Mängel sofort
            behebbar sind.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Die 25 Prüfpunkte im Überblick</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Alle Punkte basieren auf WCAG 2.1 AA bzw. spezifischen BFSG-Anforderungen. Dies ist eine
            Orientierungsliste, kein vollständiger Audit-Bericht.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">#</th>
                  <th className="px-3 py-3 text-left font-semibold">Kategorie</th>
                  <th className="px-3 py-3 text-left font-semibold">Prüfpunkt</th>
                  <th className="px-3 py-3 text-left font-semibold">WCAG</th>
                  <th className="px-3 py-3 text-left font-semibold">Prio</th>
                </tr>
              </thead>
              <tbody>
                {CHECK_ITEMS.map((item, i) => (
                  <tr key={item.nr} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{item.nr}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.kategorie}</td>
                    <td className="px-3 py-2">{item.pruefpunkt}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{item.wcag}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          item.prio === "Kritisch"
                            ? "inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            : item.prio === "Hoch"
                            ? "inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground"
                        }
                      >
                        {item.prio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufigste Fehler in Shopify, WooCommerce und Shopware</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Erfahrungswerte aus axe-core-/WCAG-Audits zeigen, dass unabhängig vom Shop-System immer
            wieder dieselben Mängel auftauchen.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Shopify</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Produkt-Bilder ohne aussagekräftige Alt-Texte — Themes verwenden häufig den Dateinamen.</li>
            <li>Varianten-Selects (Größe, Farbe) ohne verknüpfte sichtbare Labels.</li>
            <li>Sticky Header überdeckt Sprung-Link-Ziel (#main-content).</li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold">WooCommerce (WordPress)</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Unzureichende Kontraste bei Preisen und Badge-Elementen in Standard-Themes.</li>
            <li>Checkout-Fehlermeldungen ohne programmatische Verknüpfung mit dem Input via aria-describedby.</li>
            <li>Cookie-Plugins erzeugen Banner ohne korrekte Fokus-Reihenfolge.</li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold">Shopware 6</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Dropdown-Navigation ohne ARIA-Attribute (aria-expanded, aria-haspopup).</li>
            <li>Produktgalerie-Slider ohne Tastatur-Bedienbarkeit.</li>
            <li>Suchfeld ohne visuelles Label (nur Platzhalter, der beim Tippen verschwindet).</li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Selbst prüfen, Tool nutzen oder Audit beauftragen?</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Ansatz</th>
                  <th className="px-3 py-3 text-left font-semibold">Geeignet für</th>
                  <th className="px-3 py-3 text-left font-semibold">Abdeckung</th>
                  <th className="px-3 py-3 text-left font-semibold">Kosten</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-background">
                  <td className="px-3 py-2 font-semibold">Browser-Extensions (WAVE, axe DevTools)</td>
                  <td className="px-3 py-2 text-muted-foreground">Entwickler, erste Orientierung</td>
                  <td className="px-3 py-2 text-muted-foreground">ca. 30–40 % der Mängel</td>
                  <td className="px-3 py-2 text-muted-foreground">Kostenlos</td>
                </tr>
                <tr className="bg-muted/20">
                  <td className="px-3 py-2 font-semibold">Automatisierter Scan mit Report</td>
                  <td className="px-3 py-2 text-muted-foreground">Shop-Betreiber ohne Tech-Team; erste strukturierte Übersicht</td>
                  <td className="px-3 py-2 text-muted-foreground">ca. 30–50 % der Mängel</td>
                  <td className="px-3 py-2 text-muted-foreground">129–399 €</td>
                </tr>
                <tr className="bg-background">
                  <td className="px-3 py-2 font-semibold">Manuelles Accessibility-Audit</td>
                  <td className="px-3 py-2 text-muted-foreground">Shops mit hohem B2C-Volumen oder komplexen Checkout-Flows</td>
                  <td className="px-3 py-2 text-muted-foreground">ca. 80–95 % der Mängel</td>
                  <td className="px-3 py-2 text-muted-foreground">1.500–5.000 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Ihren Shop jetzt technisch prüfen lassen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check gibt einen ersten Überblick über kritische WCAG-2.1-Mängel Ihrer
            Startseite — in ca. 60 Sekunden. Der Basis-Report (129 €) deckt bis zu 5 Unterseiten ab
            und enthält einen priorisierten Fix-Plan sowie einen Entwurf der Barrierefreiheitserklärung.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos prüfen →
            </Link>
            <Link
              href="/barrierefreiheitserklaerung-muster"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Barrierefreiheitserklärung erstellen
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
          <div className="mt-6 divide-y divide-border">
            {FAQ.map((item) => (
              <div key={item.q} className="py-5">
                <h3 className="text-base font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold">Weiterführende Themen</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Prüfung? Marktpreise 2026
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheitserklaerung-muster" className="text-primary underline underline-offset-2">
                Barrierefreiheitserklärung: Muster, Pflicht-Inhalte, Generator
              </Link>
            </li>
            <li>
              <Link href="/cookie-banner-fehler" className="text-primary underline underline-offset-2">
                Cookie-Banner 2026: Die 7 häufigsten Fehler
              </Link>
            </li>
            <li>
              <Link href="/axe-lighthouse-wave-vergleich" className="text-primary underline underline-offset-2">
                axe, Lighthouse, WAVE: Welches Tool findet die meisten Mängel?
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert allgemeine Informationen auf Basis der
          WCAG-2.1-Kriterien. Er stellt keine Rechtsberatung dar und ersetzt nicht die Prüfung durch einen
          qualifizierten Anwalt oder eine zertifizierte Konformitätsprüfung. Keine Garantie für Vollständigkeit,
          Aktualität oder rechtliche BFSG-Konformität. Bei rechtlichen Fragen konsultieren Sie einen
          Fachanwalt für IT-Recht oder Wettbewerbsrecht.
        </aside>
      </article>
    </>
  );
}
