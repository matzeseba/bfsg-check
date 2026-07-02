import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BFSG für Webagenturen: Pflichten und Chancen",
  description:
    "Was bedeutet das BFSG für Webagenturen? Verantwortlichkeiten, typische Mängel in Kundenprojekten und wie Agenturen Barrierefreiheit als Leistung anbieten.",
  alternates: {
    canonical: "/bfsg-fuer-webagenturen",
  },
  openGraph: {
    title: "BFSG für Webagenturen: Pflichten, typische Mängel und das Geschäftsmodell dahinter",
    description:
      "Kundenwebsites fallen unters BFSG — Agenturen sitzen zwischen den Stühlen. So wird aus der Pflicht eine wiederkehrende Leistung.",
    url: "https://bfsg-fix.de/bfsg-fuer-webagenturen",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Haftet die Agentur, wenn die Kundenwebsite die BFSG-Anforderungen nicht erfüllt?",
    a: "Adressat des BFSG ist der Wirtschaftsakteur, der das Produkt oder die Dienstleistung anbietet — im Regelfall also der Betreiber der Website. Ob und in welchem Umfang eine Agentur vertraglich einstehen muss (etwa aus Werkvertrag oder zugesicherten Eigenschaften), hängt vom Einzelfall und den Vereinbarungen ab. Diese Frage sollte jede Agentur mit einem Fachanwalt für IT-Recht klären und in ihren Verträgen sauber regeln.",
  },
  {
    q: "Müssen Bestandsprojekte nachgerüstet werden?",
    a: "Das BFSG gilt seit dem 28.06.2025 für Angebote im Anwendungsbereich — unabhängig davon, wann die Website gebaut wurde. Für Betreiber betroffener Websites stellt sich also nicht die Frage ob, sondern wie priorisiert nachgerüstet wird. Ein automatisierter Scan pro Bestandsprojekt schafft schnell eine belastbare Entscheidungsgrundlage.",
  },
  {
    q: "Wie viel Accessibility-Wissen braucht mein Team, um Reports anzubieten?",
    a: "Für die Auslieferung eines automatisierten Reports mit priorisiertem Fix-Plan: wenig — die Befunde enthalten konkrete Lösungshinweise. Für die Umsetzung reicht solides HTML/CSS/ARIA-Grundwissen, das die meisten Frontend-Entwickler mitbringen. Manuelle Screenreader-Audits für komplexe Projekte bleiben Spezialisten vorbehalten.",
  },
  {
    q: "Gibt es Konditionen für Agenturen mit vielen Kunden-Websites?",
    a: "Ja. Ab 5 Reports pro Monat gibt es eine individuelle Staffel über das Partnerprogramm. Sie schicken die ungefähre Anzahl Ihrer Kunden-Websites und erhalten ein konkretes Angebot — Details auf der Partner-Seite.",
  },
  {
    q: "Reicht ein automatisierter Report für die BFSG-Dokumentation des Kunden?",
    a: "Ein automatisierter Report mit menschlicher Sichtung deckt rund 30–50 % der WCAG-Mängel ab und liefert Fix-Plan plus Entwurf der Barrierefreiheitserklärung — eine solide, dokumentierte Grundlage. Er ist keine Zusicherung rechtlicher Anforderungserfüllung. Bei komplexen Interaktionen (mehrstufiger Checkout, Custom-Player) sollte zusätzlich ein manuelles Audit mit Screenreader-Tests eingeplant werden.",
  },
];

export default function BfsgFuerWebagenturenPage() {
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
    headline: "BFSG für Webagenturen: Pflichten, typische Mängel und das Geschäftsmodell dahinter",
    description: "Wie Webagenturen mit dem BFSG umgehen: Verantwortlichkeiten, Workflow und Barrierefreiheit als Leistung.",
    url: "https://bfsg-fix.de/bfsg-fuer-webagenturen",
    publisher: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fix.de" },
    dateModified: "2026-07-02",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · Webagenturen · Partner
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            BFSG für Webagenturen: Pflichten, typische Mängel und das Geschäftsmodell dahinter
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Seit dem 28.06.2025 gilt das Barrierefreiheitsstärkungsgesetz — und damit landet das Thema auf
            dem Tisch jeder Agentur, die Websites und Shops für Kunden betreibt oder gebaut hat. Dieser
            Artikel ordnet ein, wer wofür verantwortlich ist, welche Mängel in Agentur-Projekten am
            häufigsten auftauchen und wie aus der Pflicht eine wiederkehrende, kalkulierbare Leistung wird.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juli 2026 · Automatisierte technische Analyse, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Die Ausgangslage: Kundenwebsites sind betroffen, Agenturen mittendrin</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das BFSG richtet sich an Wirtschaftsakteure, die Produkte oder Dienstleistungen im
            Anwendungsbereich anbieten — im E-Commerce vor allem Webshops, die Verbrauchern Waren oder
            digitale Leistungen verkaufen. Adressat ist damit im Regelfall der Website-Betreiber, also der
            Kunde der Agentur. Trotzdem sitzt die Agentur mittendrin: Sie hat die Seite gebaut, sie betreut
            sie, und der Kunde erwartet, dass „seine Agentur das regelt“.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Der Druck ist real: Die Marktüberwachungsstelle der Länder (MLBF) in Magdeburg arbeitet seit
            26.09.2025 und verzeichnete bis Juni 2026 fast 700 Meldungen. Parallel laufen seit Herbst 2025
            private Abmahnwellen — die Fachwelt hält viele davon für angreifbar, aber jedes Schreiben
            erzeugt beim Kunden eine dringende Anfrage an die Agentur. Wer dann nur mit Achselzucken
            antworten kann, verliert Vertrauen. Wer einen Prüf- und Behebungs-Workflow parat hat, gewinnt
            ein Projekt.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Zur vertraglichen Seite (Gewährleistung, Nachbesserungspflichten für Bestandsprojekte,
            Leistungsbeschreibung neuer Projekte) gilt: Das ist Anwaltsterrain. Jede Agentur sollte ihre
            Vertragslage einmal sauber mit einem Fachanwalt für IT-Recht durchgehen — dieser Artikel
            behandelt die technische und operative Seite.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Typische Mängel in Agentur-Projekten</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Erfahrungswerte aus axe-core-/WCAG-Audits zeigen wiederkehrende Muster — unabhängig davon, ob
            das Projekt auf Shopify, WooCommerce, Shopware oder einem Custom-Stack läuft:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Design-System-Erbe:</strong> Unzureichende Kontraste bei Sekundär-Texten, Preisen und
              Badges (WCAG 1.4.3 verlangt mindestens 4,5:1 für normalen Text) — oft direkt aus dem
              Styleguide des Kunden übernommen.
            </li>
            <li>
              <strong>Komponenten ohne Tastatur-Support:</strong> Slider, Dropdown-Navigationen und Modals
              ohne Fokus-Management, ARIA-Attribute oder mit Tastatur-Traps (WCAG 2.1.1 / 2.1.2).
            </li>
            <li>
              <strong>Formulare mit Platzhalter statt Label:</strong> Suchfelder und Checkout-Inputs, deren
              einzige Beschriftung beim Tippen verschwindet (WCAG 1.3.1 / 3.3.2).
            </li>
            <li>
              <strong>Bilder-Pipelines ohne Alt-Text-Pflege:</strong> CMS-Uploads, bei denen das
              alt-Attribut leer bleibt oder den Dateinamen enthält (WCAG 1.1.1).
            </li>
            <li>
              <strong>Fehlende Barrierefreiheitserklärung:</strong> Die Erklärung gemäß § 15 BFSGV mit
              Konformitätsstatus, bekannten Mängeln, Feedback-Mechanismus und Schlichtungsstellen-Kontakt
              fehlt auf den meisten Bestandsseiten komplett.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Der Agentur-Workflow: Scan → Report → Umsetzung → Re-Check</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Barrierefreiheit lässt sich als vierstufiger, wiederholbarer Prozess in den Agentur-Alltag
            integrieren:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>1. Bestandsaufnahme pro Kunde:</strong> Automatisierter WCAG-2.1-AA-Scan der
              wichtigsten Seiten. Ergebnis: priorisierte Mängelliste als Gesprächsgrundlage für das
              Kunden-Angebot.
            </li>
            <li>
              <strong>2. Report als Deliverable:</strong> Ein strukturierter PDF-Report mit Fix-Hinweisen
              und Barrierefreiheitserklärungs-Entwurf — lesbar für den Kunden, konkret genug für die
              eigenen Entwickler.
            </li>
            <li>
              <strong>3. Umsetzung als Projekt:</strong> Die Behebung ist klassische Agentur-Arbeit:
              Templates anpassen, Komponenten nachrüsten, Prozesse fürs Content-Team (Alt-Texte!)
              etablieren. Je nach Mängel-Dichte 10–80 Entwicklerstunden.
            </li>
            <li>
              <strong>4. Re-Check und Pflege:</strong> Nach der Umsetzung dokumentiert ein erneuter Scan
              den Fortschritt. Bei laufenden Betreuungsverträgen passt ein wiederkehrender Check (z. B.
              monatlich) als Baustein der Wartungspauschale.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Rechnen statt raten: Einkauf und Marge</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ein eigenes Accessibility-Team lohnt sich für die wenigsten Agenturen. Der pragmatische Weg:
            Scans und Reports einkaufen, Beratung und Umsetzung selbst leisten. Der Basis-Report kostet
            129 € (bis zu 5 Unterseiten), der Profi-Report 399 € (bis zu 25 Unterseiten, Umsetzungs-Fahrplan,
            30 Tage E-Mail-Support), Cookie-Checks gibt es ab 39 €. Ab 5 Reports pro Monat sind
            Staffelkonditionen über das{" "}
            <Link href="/partner" className="text-primary underline underline-offset-2">
              Partnerprogramm
            </Link>{" "}
            möglich — die Umsetzungsstunden und die Kundenbeziehung bleiben komplett bei der Agentur.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Erstes Kundenprojekt kostenlos anprüfen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check liefert in ca. 60 Sekunden einen ersten Überblick über kritische
            WCAG-2.1-Mängel — ideal, um beim nächsten Kunden-Jour-fixe mit konkreten Befunden statt
            Allgemeinplätzen zu sprechen.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos prüfen →
            </Link>
            <Link
              href="/partner"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Partnerprogramm ansehen
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen von Agenturen</h2>
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
              <Link href="/bfsg-checkliste-online-shop" className="text-primary underline underline-offset-2">
                BFSG-Checkliste 2026: 25 Punkte für Online-Shops
              </Link>
            </li>
            <li>
              <Link href="/bfsg-frist" className="text-primary underline underline-offset-2">
                BFSG-Frist: Was seit dem 28.06.2025 gilt
              </Link>
            </li>
            <li>
              <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Prüfung? Marktpreise 2026
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheitserklaerung-muster" className="text-primary underline underline-offset-2">
                Barrierefreiheitserklärung: Muster und Pflicht-Inhalte
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert allgemeine Informationen und eine
          technische Einordnung — er stellt keine Rechtsberatung dar. Vertrags-, Haftungs- und
          Gewährleistungsfragen zwischen Agentur und Kunde klärt ein Fachanwalt für IT-Recht. Keine Gewähr
          für Vollständigkeit oder Aktualität.
        </aside>
      </article>
    </>
  );
}
