import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MLBF-Prüfstrategie 2026: Wird meine Website kontrolliert?",
  description:
    "Die MLBF kontrolliert seit 05.01.2026 aktiv. Risikobasierte Prüfstrategie, automatisierte Checks, Beschwerdeverfahren und Bußgeldrahmen nach § 37 BFSG erklärt.",
  alternates: {
    canonical: "/mlbf-pruefstrategie",
  },
  openGraph: {
    title: "MLBF-Prüfstrategie 2026: Wird meine Website kontrolliert?",
    description:
      "Risikobasiert, reaktiv vor aktiv: So kontrolliert die Marktüberwachungsstelle der Länder Websites — und so prüfen Sie vorher selbst.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/mlbf-pruefstrategie",
    type: "article",
  },
};

const TIMELINE = [
  {
    datum: "26.09.2025",
    ereignis: "MLBF offiziell errichtet",
    detail:
      "Der Staatsvertrag der 16 Bundesländer tritt in Kraft. Die Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen (MLBF) nimmt als Anstalt öffentlichen Rechts mit Sitz in Magdeburg ihre Arbeit auf.",
  },
  {
    datum: "05.01.2026",
    ereignis: "Aktive Kontrollphase beginnt",
    detail:
      "Die MLBF geht von der Aufbauphase in die aktive Kontrolle über. Die erste Prüfwelle konzentriert sich laut Berichterstattung auf digitale Dokumente (PDF-Rechnungen, AGB, Handbücher) und Webshops für Endverbraucher.",
  },
  {
    datum: "29.01.2026",
    ereignis: "Marktüberwachungsstrategien beschlossen",
    detail:
      "Der Verwaltungsrat verabschiedet zwei offizielle Strategien nach § 20 Abs. 2 BFSG — eine für Produkte, eine für Dienstleistungen. Sie legen die Prüf-Prioritäten fest.",
  },
  {
    datum: "08.06.2026",
    ereignis: "Website mit Prüfstrategie veröffentlicht",
    detail:
      "mlbf-barrierefrei.de geht online: Kontaktformular für Verbraucher-Meldungen, Informationen zu Rechten und Beschwerdewegen sowie die veröffentlichten Marktüberwachungsstrategien.",
  },
];

const FAQ = [
  {
    q: "Ist meine Website automatisch im Fokus der MLBF?",
    a: "Nicht automatisch jede Website. Die MLBF verfolgt einen risikobasierten Ansatz und nennt drei Schwerpunkte: hohe Nutzerreichweite, große Bedeutung für eine autonome Lebensführung und eine negative Mängel-Historie. Der stärkere Hebel ist aber der reaktive Weg — Meldungen von Verbrauchern oder anerkannten Verbänden haben nach eigener Darstellung der Behörde Vorrang vor der aktiven, automatisierten Kontrolle.",
  },
  {
    q: "Wie meldet jemand meine Website bei der MLBF?",
    a: "Verbraucherinnen und Verbraucher können Barrieren direkt über das Kontaktformular auf mlbf-barrierefrei.de melden — zum Beispiel bei Online-Shops oder Online-Banking. Auch anerkannte Verbände können Anträge stellen.",
  },
  {
    q: "Was prüft die MLBF automatisiert, was manuell?",
    a: "Die Behörde unterscheidet formale Prüfung (liegt eine Barrierefreiheitserklärung vor, sind Pflichtangaben vollständig) und materielle Prüfung (funktioniert die Website tatsächlich barrierefrei). Der aktive Weg läuft nach verfügbaren Informationen zunächst über automatisierte Software-Checks zur Vorsortierung, bei Auffälligkeiten folgt eine inhaltliche Prüfung durch die Behörde.",
  },
  {
    q: "Was passiert, wenn die MLBF einen Verstoß feststellt?",
    a: "Das Verfahren ist gestuft: Zunächst fordert die MLBF den Wirtschaftsakteur auf, die Nichtkonformität innerhalb einer angemessenen Frist zu beheben. Wird diese Frist nicht eingehalten, können Einschränkung, Untersagung der Bereitstellung oder ein Bußgeld nach § 37 BFSG folgen.",
  },
  {
    q: "Wie hoch sind die Bußgelder nach § 37 BFSG?",
    a: "Der Rahmen reicht bis 10.000 € für einzelne Pflichtverstöße — etwa eine fehlende Barrierefreiheitserklärung — und bis 100.000 € für schwerere Verstöße gegen die Barrierefreiheitsanforderungen selbst. Öffentlich bestätigte Einzel-Bußgelder sind uns zum Stand Juli 2026 nicht bekannt.",
  },
  {
    q: "Sind private Abmahnungen dasselbe wie eine MLBF-Kontrolle?",
    a: "Nein. Abmahnungen kommen von privaten Kanzleien oder Verbänden über das Wettbewerbsrecht, unabhängig von der Behörde. Seit Februar 2026 läuft eine zweite Abmahnwelle mit Forderungen um 2.700 €. Ob das BFSG überhaupt eine Marktverhaltensregel im Sinne des § 3a UWG darstellt, ist gerichtlich weiterhin ungeklärt — die Abmahnfähigkeit ist also keine gesicherte Tatsache, sondern eine offene Rechtsfrage.",
  },
  {
    q: "Was sollte ich zuerst prüfen, bevor es die MLBF tut?",
    a: "Erstens den Ist-Zustand technisch erfassen — ein automatisierter WCAG-2.1-AA-Scan zeigt in Minuten die größten Baustellen. Zweitens prüfen, ob eine Barrierefreiheitserklärung gemäß § 14 BFSG veröffentlicht ist, denn deren Fehlen ist der am häufigsten dokumentierte Einzelvorwurf. Drittens kritische Mängel wie Kontraste, Alt-Texte und Formular-Labels priorisiert beheben.",
  },
];

export default function MlbfPruefstrategiePage() {
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
    headline: "MLBF-Prüfstrategie 2026: Wird meine Website kontrolliert?",
    description:
      "Risikobasierte Prüfstrategie der Marktüberwachungsstelle der Länder: Ablauf, automatisierte Checks, Beschwerdeverfahren und Bußgeldrahmen.",
    url: "https://bfsg-fuchs.de/mlbf-pruefstrategie",
    publisher: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fuchs.de" },
    datePublished: "2026-07-08",
    dateModified: "2026-07-23",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · MLBF · Prüfstrategie
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            MLBF-Prüfstrategie 2026: Wird meine Website kontrolliert?
          </h1>
          {/* AEO-Direktantwort (agent-05 ASSET 2): Hauptfrage in ≤60 Wörtern direkt beantworten */}
          <p className="mt-4 text-base font-medium leading-relaxed">
            Ja, möglich — aber nicht automatisch jede Website. Die MLBF kontrolliert seit dem 5. Januar 2026
            aktiv und risikobasiert: Vorrang haben Meldungen von Verbrauchern und anerkannten Verbänden,
            danach folgen systematische Kontrollen entlang der veröffentlichten Marktüberwachungsstrategien
            (seit Juni 2026 öffentlich). Automatisierte Software-Checks sortieren Auffälligkeiten vor.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Dieser Artikel erklärt, wie die Behörde auswählt, was sie automatisiert prüft, was bei einer
            Beschwerde passiert — und wie Sie vorher selbst den eigenen Stand prüfen.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: 23. Juli 2026 · Automatisierte technische Analyse, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Was ist die MLBF?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen
            (MLBF) ist die gemeinsame Aufsichtsbehörde aller 16 Bundesländer für das
            Barrierefreiheitsstärkungsgesetz (BFSG). Sie ist eine Anstalt öffentlichen Rechts mit Sitz in
            Magdeburg und überwacht bundesweit, ob Produkte und Dienstleistungen — darunter Websites und
            Online-Shops im elektronischen Geschäftsverkehr — die gesetzlichen Barrierefreiheitsanforderungen
            einhalten.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wie lief die Kontrollphase bisher ab?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Von der Errichtung bis zur veröffentlichten Prüfstrategie hat sich einiges getan — die wichtigsten
            Stationen im Überblick:
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
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wie wählt die MLBF ihre Prüffälle aus?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die MLBF beschreibt ihr Vorgehen als risikobasiert und unterscheidet zwei Wege — mit einer
            bemerkenswerten Reihenfolge:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Reaktiv, mit Vorrang:</strong> Die Bearbeitung von Meldungen und Anträgen von
              Verbraucherinnen, Verbrauchern und anerkannten Verbänden. Dieser Weg geht dem aktiven Weg vor —
              eine Beschwerde ruft die Behörde also stärker auf den Plan als die routinemäßige Eigeninitiative.
            </li>
            <li>
              <strong>Aktiv:</strong> Systematische Kontrollen entlang der beschlossenen
              Marktüberwachungsstrategien, die nach verfügbaren Informationen über automatisierte Software-Checks
              zur Vorsortierung laufen.
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Da nicht alle betroffenen Angebote gleich behandelt werden können, nennt die MLBF drei Schwerpunkte,
            bei denen sie genauer hinsieht:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Dienstleistungen mit hoher Nutzerreichweite,</li>
            <li>Angebote mit großer Bedeutung für eine autonome Lebensführung,</li>
            <li>und Anbieter mit einer negativen Mängel-Historie.</li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was prüft die MLBF automatisiert?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die Prüfung selbst gliedert sich in zwei Aspekte: die <strong>formale</strong> Kontrolle — liegt eine
            Barrierefreiheitserklärung vor, sind die Pflichtangaben vollständig — und die{" "}
            <strong>materielle</strong> Kontrolle, ob die Website in der Praxis tatsächlich barrierefrei
            nutzbar ist. Genau diese Kombination aus automatisierter Erstprüfung und inhaltlicher Sichtung
            ist auch der Aufbau eines technischen Selbst-Checks: Kontraste, Alt-Texte, Formular-Labels,
            Tastaturbedienbarkeit und die Barrierefreiheitserklärung selbst lassen sich in Minuten
            automatisiert erfassen.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was passiert bei einer Beschwerde?</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              Ein Verbraucher oder ein anerkannter Verband reicht eine Meldung über das Kontaktformular auf
              mlbf-barrierefrei.de ein.
            </li>
            <li>
              Die MLBF prüft, ob ein hinreichender Grund zur Annahme einer Nichtkonformität vorliegt — formal
              und, falls nötig, materiell.
            </li>
            <li>
              Wird eine Nichtkonformität festgestellt, fordert die Behörde den Wirtschaftsakteur auf, die
              Konformität innerhalb einer angemessenen Frist herzustellen.
            </li>
            <li>
              Bleibt die Korrektur aus, folgen weitergehende Maßnahmen: Einschränkung, Untersagung der
              Bereitstellung oder ein Bußgeld nach § 37 BFSG.
            </li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Parallel dazu haben Verbraucherinnen, Verbraucher und anerkannte Verbände ein eigenes Antragsrecht
            bei der zuständigen Landesbehörde. Wird ein Antrag abgelehnt, ist der Weg zu den
            Verwaltungsgerichten eröffnet. Alternativ steht ein kostenloses Schlichtungsverfahren nach § 16
            des Behindertengleichstellungsgesetzes offen — niedrigschwelliger als der Klageweg.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wie hoch sind die Bußgelder nach § 37 BFSG?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Einzelne Pflichtverstöße — etwa eine fehlende Barrierefreiheitserklärung — können mit einem
            Bußgeld bis 10.000 € geahndet werden. Bei schwereren Verstößen gegen die
            Barrierefreiheitsanforderungen selbst reicht der Rahmen bis 100.000 €. Öffentlich bestätigte
            Einzel-Bußgelder der Marktüberwachung sind uns zum Stand Juli 2026 nicht bekannt — wir verzichten
            bewusst auf Drohkulissen, die Faktenlage zum Verfahren ist auch so deutlich genug.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Woher kommt der zusätzliche Druck von zwei Seiten?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Neben der behördlichen Kontrolle sind zwei weitere Entwicklungen sachlich belegt: Seit Februar 2026
            läuft eine zweite private Abmahnwelle mit Forderungen um 2.700 € — zusätzlich zur ersten Welle aus
            dem Herbst 2025. Ob das BFSG eine Marktverhaltensregel im Sinne des § 3a UWG darstellt und damit
            überhaupt abmahnfähig ist, ist gerichtlich weiterhin ungeklärt. Und am 11. März 2026 hat die
            EU-Kommission eine ergänzende begründete Stellungnahme an Deutschland gerichtet, weil sie die
            Umsetzung des European Accessibility Act für lückenhaft hält — mit Frist bis Mitte Mai 2026, sonst
            droht ein Verfahren vor dem EuGH. Der Druck kommt damit derzeit von zwei Seiten: der Aufsicht in
            Magdeburg und der EU-Kommission.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Prüfen Sie selbst, bevor es die MLBF tut</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check prüft Ihre Startseite in ca. 60 Sekunden gegen über 80
            WCAG-2.1-AA-Regeln — ohne Anmeldung. Für die vollständige Dokumentation liefert der
            Basis-Report (129 €) einen priorisierten Fix-Plan und einen Entwurf der Barrierefreiheitserklärung
            gemäß § 14 BFSG.
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
          <h2 className="text-2xl font-semibold">Häufige Fragen zur MLBF-Prüfstrategie</h2>
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
              <Link href="/abmahnung-erhalten" className="text-primary underline underline-offset-2">
                Abmahnung erhalten — was jetzt? Erste Schritte nach dem Schreiben
              </Link>
            </li>
            <li>
              <Link href="/bfsg-frist" className="text-primary underline underline-offset-2">
                BFSG-Frist: Was seit dem 28.06.2025 gilt
              </Link>
            </li>
            <li>
              <Link href="/bfsg-checkliste-online-shop" className="text-primary underline underline-offset-2">
                BFSG-Checkliste 2026: 25 Punkte für Online-Shops
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheitserklaerung-muster" className="text-primary underline underline-offset-2">
                Barrierefreiheitserklärung: Muster und Pflicht-Inhalte
              </Link>
            </li>
            <li>
              <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Prüfung? Marktpreise 2026
              </Link>
            </li>
            <li>
              <Link href="/bfsg-abmahnung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Abmahnung? Forderungen und Rechtslage 2026
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel ist eine automatisierte technische Analyse und
          stellt keine Rechtsberatung dar. Keine Garantie für Vollständigkeit oder Aktualität; Verfahren,
          Fristen und Zuständigkeiten können sich ändern. Bei rechtlichen Fragen zu Ihrem konkreten Fall
          konsultieren Sie einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
