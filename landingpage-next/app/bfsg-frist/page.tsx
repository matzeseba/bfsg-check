import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BFSG-Frist: Was seit dem 28.06.2025 gilt",
  description:
    "Die BFSG-Frist ist abgelaufen: Seit 28.06.2025 gilt das Gesetz. Zeitleiste, Marktüberwachung, Ausnahmen für Kleinstunternehmen und nächste Schritte.",
  alternates: {
    canonical: "/bfsg-frist",
  },
  openGraph: {
    title: "BFSG-Frist: Was seit dem 28.06.2025 gilt — und was jetzt zu tun ist",
    description:
      "28.06.2025 Geltungsbeginn, 26.09.2025 Marktüberwachungsstelle aktiv, erste Abmahnwellen: die BFSG-Zeitleiste sachlich erklärt.",
    url: "https://bfsg-fix.de/bfsg-frist",
    type: "article",
  },
};

const TIMELINE = [
  {
    datum: "28.06.2025",
    ereignis: "Geltungsbeginn des BFSG",
    detail:
      "Das Barrierefreiheitsstärkungsgesetz gilt für Produkte und Dienstleistungen im Anwendungsbereich — im E-Commerce insbesondere für Webshops, die Verbrauchern Waren oder digitale Leistungen anbieten.",
  },
  {
    datum: "26.09.2025",
    ereignis: "Marktüberwachungsstelle (MLBF) errichtet",
    detail:
      "Die Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen (MLBF) in Magdeburg nimmt ihre Arbeit auf.",
  },
  {
    datum: "Herbst 2025",
    ereignis: "Erste private Abmahnwellen",
    detail:
      "Spezialisierte Kanzleien und Dienstleister verschicken Forderungsschreiben an Website-Betreiber. Die Fachwelt hält viele dieser Abmahnungen für rechtlich angreifbar — ignorieren sollte man sie trotzdem nicht.",
  },
  {
    datum: "Juni 2026",
    ereignis: "Fast 700 Meldungen bei der MLBF",
    detail:
      "Die Marktüberwachungsstelle verzeichnet nach eigenen Angaben fast 700 Meldungen und baut ihr Personal von rund 31 auf 73 Stellen aus (perspektivisch bis zu 99).",
  },
];

const FAQ = [
  {
    q: "Gibt es noch eine Übergangsfrist für Websites und Online-Shops?",
    a: "Für Websites und Online-Shops im elektronischen Geschäftsverkehr gilt das BFSG seit dem 28.06.2025 — eine allgemeine Schonfrist für Web-Angebote gibt es nicht. Ob in Ihrem konkreten Fall Sonderregelungen greifen (etwa für Bestandsverträge oder bestimmte Produktkategorien), klärt ein Fachanwalt für IT-Recht. Für die technische Seite gilt: Je früher geprüft und dokumentiert wird, desto besser die Ausgangsposition.",
  },
  {
    q: "Bin ich als Kleinstunternehmen von der Frist ausgenommen?",
    a: "Kleinstunternehmen mit weniger als 10 Beschäftigten UND weniger als 2 Millionen Euro Jahresumsatz können eine Ausnahme dokumentieren, wenn die Anforderungen eine unverhältnismäßige Belastung darstellen. Der Nachweis liegt beim Unternehmen selbst. Die meisten mittelständischen Shops erfüllen die Ausnahmekriterien nicht.",
  },
  {
    q: "Was droht bei Verstößen gegen das BFSG?",
    a: "Das Gesetz sieht in § 37 BFSG einen Bußgeldrahmen bis 100.000 € vor (bei minderschweren Verstößen bis 10.000 €). Öffentlich belegte Einzel-Bußgelder der Marktüberwachung sind uns zum Stand Juni 2026 nicht bekannt. Daneben können Verbände und Mitbewerber Verstöße verfolgen — private Abmahnwellen laufen seit Herbst 2025.",
  },
  {
    q: "Welchen technischen Standard muss ich zur Frist erfüllen?",
    a: "Das BFSG verweist auf die europäische Norm EN 301 549, die im Kern WCAG 2.1 Stufe AA fordert. Eine technische Prüfung nach WCAG 2.1 AA deckt den Pflicht-Mindeststandard ab. WCAG 2.2 ist noch nicht explizit vorgeschrieben, enthält aber sinnvolle Ergänzungen.",
  },
  {
    q: "Die Frist ist verpasst — was sollte ich jetzt zuerst tun?",
    a: "Erstens: den Ist-Zustand technisch erfassen (automatisierter Scan plus Sichtung). Zweitens: kritische Mängel priorisiert beheben — Kontraste, Alt-Texte, Tastaturbedienbarkeit und Formular-Labels sind häufig schnell umsetzbar. Drittens: eine Barrierefreiheitserklärung gemäß § 15 BFSGV veröffentlichen und den Fortschritt dokumentieren. Eine dokumentierte, laufende Verbesserung ist besser als Stillstand.",
  },
];

export default function BfsgFristPage() {
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
    headline: "BFSG-Frist: Was seit dem 28.06.2025 gilt — und was jetzt zu tun ist",
    description: "Zeitleiste zum BFSG: Geltungsbeginn, Marktüberwachung, Abmahnwellen und nächste Schritte.",
    url: "https://bfsg-fix.de/bfsg-frist",
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
            BFSG · Frist · Zeitleiste
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            BFSG-Frist: Was seit dem 28.06.2025 gilt — und was jetzt zu tun ist
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Viele suchen noch nach der „BFSG-Frist“ — dabei ist sie bereits abgelaufen: Das
            Barrierefreiheitsstärkungsgesetz gilt seit dem 28. Juni 2025. Dieser Artikel zeigt die Zeitleiste
            der Ereignisse seit dem Geltungsbeginn, erklärt, wer betroffen ist, und gibt eine sachliche
            Einordnung, was Website-Betreiber jetzt priorisieren sollten.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juli 2026 · Automatisierte technische Analyse, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Die BFSG-Zeitleiste seit dem Geltungsbeginn</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das BFSG setzt den European Accessibility Act in deutsches Recht um. Seit dem Stichtag hat sich
            einiges getan — hier die wichtigsten Stationen im Überblick:
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Datum</th>
                  <th className="px-3 py-3 text-left font-semibold">Ereignis</th>
                  <th className="px-3 py-3 text-left font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {TIMELINE.map((item, i) => (
                  <tr key={item.datum} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-mono whitespace-nowrap text-muted-foreground">{item.datum}</td>
                    <td className="px-3 py-2 font-medium">{item.ereignis}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hinweis: Konkrete, öffentlich belegte Bußgeld-Bescheide der Marktüberwachung sind uns zum Stand
            Juli 2026 nicht bekannt. Wir verzichten bewusst auf Drohkulissen — die Faktenlage ist deutlich genug.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wer ist von der abgelaufenen Frist betroffen?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das BFSG richtet sich an Wirtschaftsakteure, die Produkte oder Dienstleistungen in Deutschland
            anbieten, die unter den Anwendungsbereich fallen. Im E-Commerce zählen vor allem Webshops dazu,
            die Verbrauchern Waren oder digitale Leistungen anbieten — vom Bestellprozess über
            Produktinformationen bis zum Kundenkonto.
          </p>
          <h3 className="mt-8 text-xl font-semibold">Ausnahme: Kleinstunternehmen</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Kleinstunternehmen mit weniger als 10 Beschäftigten und weniger als 2 Millionen Euro Jahresumsatz
            können eine Ausnahme dokumentieren, wenn die Anforderungen eine unverhältnismäßige Belastung
            darstellen. Wichtig: Der Nachweis dieser Belastung liegt beim Unternehmen selbst — die Ausnahme
            gilt nicht automatisch. Wer sich darauf beruft, sollte die Abwägung schriftlich festhalten.
          </p>
          <h3 className="mt-8 text-xl font-semibold">Welche Anforderungen gelten technisch?</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Maßstab ist die EN 301 549, die im Kern WCAG 2.1 Stufe AA fordert. Dazu gehören unter anderem
            ausreichende Kontraste (mindestens 4,5:1 für normalen Text), Alt-Texte für Bilder, vollständige
            Tastaturbedienbarkeit, verknüpfte Formular-Labels und eine korrekte Überschriften-Hierarchie.
            Zusätzlich verlangt § 15 BFSGV eine öffentlich zugängliche Barrierefreiheitserklärung mit
            Konformitätsstatus, bekannten Mängeln, Feedback-Mechanismus und Schlichtungsstellen-Kontakt.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Frist verpasst: Drei Schritte für eine bessere Ausgangsposition</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Wer die Anforderungen noch nicht erfüllt, ist damit nicht allein — sollte aber nachweisbar ins
            Handeln kommen. Eine dokumentierte, laufende Verbesserung ist in jeder Hinsicht besser als
            Stillstand.
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Ist-Zustand erfassen:</strong> Ein automatisierter WCAG-2.1-AA-Scan zeigt in Minuten,
              wo die größten Baustellen liegen. Automatisierte Tools finden zuverlässig rund 30–50 % der
              Mängel — genug für eine belastbare Priorisierung.
            </li>
            <li>
              <strong>Kritische Mängel zuerst beheben:</strong> Kontraste, fehlende Alt-Texte,
              Tastatur-Fallen und Formulare ohne Labels sind häufige, oft schnell behebbare Punkte. Ein
              priorisierter Fix-Plan spart hier Entwicklerstunden.
            </li>
            <li>
              <strong>Dokumentieren und erklären:</strong> Barrierefreiheitserklärung gemäß § 15 BFSGV
              veröffentlichen, bekannte Mängel benennen und den Behebungsfortschritt festhalten. Das zeigt
              der Marktüberwachung und möglichen Abmahnern, dass das Thema aktiv bearbeitet wird.
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Wo steht Ihre Website heute?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check prüft Ihre Startseite in ca. 60 Sekunden gegen über 80
            WCAG-2.1-AA-Regeln — ohne Anmeldung. Für die vollständige Dokumentation liefert der
            Basis-Report (129 €) einen priorisierten Fix-Plan und einen Entwurf der Barrierefreiheitserklärung.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos prüfen →
            </Link>
            <Link
              href="/bfsg-checkliste-online-shop"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              BFSG-Checkliste ansehen
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zur BFSG-Frist</h2>
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
              <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Prüfung? Marktpreise 2026
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheitserklaerung-muster" className="text-primary underline underline-offset-2">
                Barrierefreiheitserklärung: Muster und Pflicht-Inhalte
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheit-testen" className="text-primary underline underline-offset-2">
                Website-Barrierefreiheit testen: kostenlose Wege im Überblick
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert allgemeine Informationen und eine
          technische Einordnung. Er stellt keine Rechtsberatung dar. Keine Gewähr für Vollständigkeit oder
          Aktualität; Fristen und Ausnahmen können sich ändern. Bei rechtlichen Fragen zu Ihrem konkreten
          Fall konsultieren Sie einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
