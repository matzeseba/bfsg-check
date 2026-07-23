import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "1 Jahr BFSG: Bilanz 2026 — Marktstand & Abmahnrisiko",
  description:
    "Ein Jahr BFSG seit 28.06.2025: Wo der Markt steht (rund 49 % Kriterienerfüllung laut itiko.de), was die MLBF macht und wie das Abmahnrisiko 2026 aussieht.",
  alternates: {
    canonical: "/bfsg-1-jahr-bilanz",
  },
  openGraph: {
    title: "1 Jahr BFSG: Die Bilanz 2026 — was sich getan hat und was jetzt zählt",
    description:
      "BFSG-Bilanz nach einem Jahr: Marktstand, Marktüberwachungsstelle MLBF, professionellere Abmahnwellen mit Prüfberichten — sachlich eingeordnet mit Quellen.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/bfsg-1-jahr-bilanz",
    type: "article",
  },
};

const BILANZ_STATIONEN = [
  {
    datum: "28.06.2025",
    ereignis: "Geltungsbeginn des BFSG",
    detail:
      "Das Barrierefreiheitsstärkungsgesetz gilt für Produkte und Dienstleistungen im Anwendungsbereich — im E-Commerce insbesondere für Webshops, die Verbrauchern Waren oder digitale Leistungen anbieten. Technischer Maßstab: EN 301 549, im Kern WCAG 2.1 AA.",
  },
  {
    datum: "Sommer 2025",
    ereignis: "Erste breite Abmahnwelle",
    detail:
      "Spezialisierte Kanzleien verschicken Forderungsschreiben an Website-Betreiber. Viele Schreiben der ersten Welle gelten in der Fachwelt als formal angreifbar.",
  },
  {
    datum: "26.09.2025",
    ereignis: "Marktüberwachungsstelle (MLBF) nimmt Arbeit auf",
    detail:
      "Die Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen (MLBF) startet in Magdeburg — zuständig für die bundesweite Überwachung.",
  },
  {
    datum: "Anfang 2026",
    ereignis: "Zweite, professionellere Abmahnwelle",
    detail:
      "Neue Schreiben stützen sich auf formale Barrierefreiheits-Prüfberichte externer Dienstleister. Dokumentierte Forderungen: rund 1.784 € netto Anwaltskosten plus rund 490 € netto für die Webseitenanalyse (laut Kanzlei KBM Legal, Stand 23.02.2026).",
  },
  {
    datum: "Juni 2026",
    ereignis: "Bilanz: Markt bei rund 49 % Kriterienerfüllung",
    detail:
      "Laut einer Markteinschätzung von itiko.de (Stand 30.06.2026) erfüllen Unternehmen im Schnitt nur rund 49 % der Barrierefreiheits-Kriterien. Selbst die Barrierefreiheitserklärung — eine Grundpflicht — fehlt vielerorts.",
  },
];

const FAQ = [
  {
    q: "Was hat sich im ersten Jahr BFSG konkret getan?",
    a: "Drei Entwicklungen prägen das erste Jahr: Erstens hat die Marktüberwachungsstelle MLBF in Magdeburg am 26.09.2025 ihre Arbeit aufgenommen und prüft sowohl reaktiv auf Beschwerden als auch aktiv per Stichproben. Zweitens sind die privaten Abmahnwellen professioneller geworden — aktuelle Schreiben enthalten formale Prüfberichte statt pauschaler Behauptungen. Drittens bleibt die Umsetzungsquote niedrig: Laut itiko.de (Stand 30.06.2026) erfüllen Unternehmen im Schnitt nur rund 49 % der Kriterien.",
  },
  {
    q: "Sind BFSG-Verstöße 2026 tatsächlich abmahnfähig?",
    a: "Das ist gerichtlich nicht abschließend geklärt. Ob BFSG-Verstöße über das UWG abgemahnt werden können, hat bisher kein Gericht rechtskräftig entschieden — viele Fachanwälte halten die kursierenden Abmahnungen für angreifbar (so etwa die Einordnung von KBM Legal, Stand 23.02.2026). Es handelt sich also um ein Risiko, nicht um eine gesicherte Rechtslage. Trotzdem gilt: Ein Forderungsschreiben nie ignorieren, sondern anwaltlich prüfen lassen — und die eigene Website vorher in einen dokumentiert besseren Zustand bringen.",
  },
  {
    q: "Was kostet eine BFSG-Abmahnung, wenn sie kommt?",
    a: "In dokumentierten Fällen der zweiten Welle werden rund 1.784 € netto vorgerichtliche Anwaltskosten plus rund 490 € netto für einen Webseiten-Prüfbericht gefordert — zusammen etwa 2.700 € brutto (laut Kanzlei KBM Legal, Stand 23.02.2026). Ob diese Forderungen durchsetzbar sind, ist im Einzelfall offen. Zum Vergleich: Ein automatisierter WCAG-2.1-AA-Report mit priorisiertem Fix-Plan kostet einen Bruchteil davon.",
  },
  {
    q: "Hat die Marktüberwachung schon Bußgelder verhängt?",
    a: "Öffentlich belegte Einzel-Bußgelder der MLBF sind uns zum Stand Juli 2026 nicht bekannt. Der gesetzliche Rahmen existiert aber: § 37 BFSG sieht für bestimmte Verstöße — unter anderem das Anbieten nicht barrierefreier Dienstleistungen — Bußgelder bis 100.000 € vor; für Verstöße gegen Informations- und Auskunftspflichten bis 10.000 €. Die MLBF ist mit rund 70 Mitarbeitenden arbeitsfähig und prüft nach eigenen Angaben auch aktiv per Stichproben — nicht nur auf Beschwerden hin.",
  },
  {
    q: "Ich habe noch nichts umgesetzt — ist es jetzt zu spät?",
    a: "Nein, aber Abwarten verschlechtert die Position. Wer nachweisbar prüft, priorisiert behebt und eine Barrierefreiheitserklärung gemäß § 14 BFSG (i. V. m. der BFSGV) veröffentlicht, steht gegenüber Marktüberwachung und möglichen Abmahnern deutlich besser da als bei Stillstand. Der erste Schritt ist eine technische Bestandsaufnahme — automatisiert geht das in Minuten.",
  },
  {
    q: "Welche Mängel fallen in der Praxis am häufigsten auf?",
    a: "Typische, immer wiederkehrende technische Barrieren sind fehlende Alt-Texte, unzureichende Kontraste, unklare Linkbeschreibungen, fehlende Formular-Labels und mangelnde Tastaturbedienbarkeit — genau diese Punkte tauchen auch in den Prüfberichten der Abmahnschreiben auf. Viele davon sind mit überschaubarem Aufwand behebbar.",
  },
];

export default function BfsgEinJahrBilanzPage() {
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
    headline: "1 Jahr BFSG: Die Bilanz 2026 — was sich getan hat und was jetzt zählt",
    description:
      "Bilanz nach einem Jahr Barrierefreiheitsstärkungsgesetz: Marktstand, Marktüberwachung MLBF, Abmahnrisiko und nächste Schritte für Website-Betreiber.",
    url: "https://bfsg-fuchs.de/bfsg-1-jahr-bilanz",
    publisher: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fuchs.de" },
    datePublished: "2026-07-03",
    dateModified: "2026-07-23",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · 1 Jahr · Bilanz 2026
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            1 Jahr BFSG: Die Bilanz 2026 — was sich getan hat und was jetzt zählt
          </h1>
          {/* AEO-Direktantwort (agent-05 ASSET 2): Bilanz-Kern in ≤60 Wörtern, Zahlen mit Quelle */}
          <p className="mt-4 text-base font-medium leading-relaxed">
            Die Bilanz ist gemischt: Die Umsetzung hinkt — laut itiko.de (Stand 30.06.2026) erfüllen
            Unternehmen im Schnitt nur rund 49 % der Kriterien. Gleichzeitig ist der Druck real: Die MLBF ist
            seit September 2025 arbeitsfähig, und die zweite Abmahnwelle stützt sich auf formale Prüfberichte
            mit dokumentierten Forderungen um 2.700 € (KBM Legal, Stand 23.02.2026).
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Zeit für eine sachliche Bilanz: Wo steht der Markt wirklich? Was macht die Marktüberwachung? Wie
            ernst ist das Abmahnrisiko 2026? Alle Zahlen in diesem Artikel sind mit Quelle und Stand
            gekennzeichnet.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: 23. Juli 2026 · Automatisierte technische Analyse, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Was ist im ersten BFSG-Jahr passiert?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das BFSG setzt den European Accessibility Act in deutsches Recht um und gilt für Websites und
            Online-Shops im elektronischen Geschäftsverkehr seit dem 28.06.2025 — ohne allgemeine Schonfrist.
            Die wichtigsten Stationen des ersten Jahres:
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Zeitpunkt</th>
                  <th className="px-3 py-3 text-left font-semibold">Ereignis</th>
                  <th className="px-3 py-3 text-left font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {BILANZ_STATIONEN.map((item, i) => (
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
          <h2 className="text-2xl font-semibold">Wo steht der Markt? Rund 49 % — mit deutlichen Lücken</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Laut einer Markteinschätzung des IT-Portals itiko.de (Stand 30.06.2026) erfüllen Unternehmen im
            Schnitt nur rund 49 % der Barrierefreiheits-Kriterien. Eine benannte Primärstudie mit
            Stichprobengröße liegt der Zahl nicht bei — sie deckt sich aber mit dem Bild, das wir aus
            automatisierten Scans kennen: Die Mehrheit der geprüften Seiten zeigt Findings, und selbst die
            Barrierefreiheitserklärung gemäß § 14 BFSG — eine vergleichsweise einfach erfüllbare
            Grundpflicht — fehlt vielerorts.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die immer gleichen technischen Barrieren dominieren dabei: fehlende Alt-Texte, unzureichende
            Kontraste, unklare Linkbeschreibungen und mangelnde Tastaturbedienbarkeit. Das ist insofern
            bemerkenswert, als genau diese Punkte zu den am schnellsten behebbaren Mängeln gehören — und
            gleichzeitig zu denen, die automatisierte Prüfberichte (auch die von Abmahnern) zuverlässig
            finden.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was macht die Marktüberwachung MLBF?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen
            (MLBF) hat am 26.09.2025 in Magdeburg ihre Arbeit aufgenommen. Sie ist die gemeinsame Behörde der
            16 Bundesländer und mit rund 70 Mitarbeitenden ausgestattet (laut itiko.de, Stand 30.06.2026). Nach
            eigenen Angaben prüft die MLBF sowohl reaktiv auf Beschwerden als auch aktiv über eigene
            Stichproben.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Der gesetzliche Rahmen: § 37 BFSG sieht für bestimmte Verstöße — unter anderem das Anbieten nicht
            barrierefreier Dienstleistungen — Bußgelder bis 100.000 € vor; für Verstöße gegen Informations-
            und Auskunftspflichten bis 10.000 €. Öffentlich belegte Einzel-Bußgelder sind uns zum Stand Juli 2026 nicht bekannt — wir
            verzichten bewusst auf Drohkulissen. Die realistische Einordnung: Die Behörde setzt bisher
            erkennbar auf Prüfung und Nachbesserung, aber der Sanktionsrahmen steht und die Stichproben-Praxis
            läuft.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wie groß ist das Abmahnrisiko 2026?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Auf die erste breite Abmahnwelle im Sommer 2025 folgte eine zweite mit deutlich höherem formalen
            Anspruch: Aktuelle Forderungsschreiben stützen sich auf automatisiert erstellte
            Barrierefreiheits-Prüfberichte externer Dienstleister, die konkrete WCAG-Verstöße auflisten —
            fehlende Alt-Texte, Kontrastfehler, leere Links.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Zu den dokumentierten Forderungen: In von der Kanzlei KBM Legal analysierten Fällen (Stand
            23.02.2026) werden rund 1.784 € netto vorgerichtliche Anwaltskosten plus 490 € netto für die
            Webseitenanalyse gefordert — insgesamt etwa 2.700 € brutto pro Schreiben.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Wichtig für die Einordnung: <strong>Ob BFSG-Verstöße über das UWG abmahnfähig sind, ist
            gerichtlich nicht abschließend geklärt.</strong> Viele Fachanwälte halten die kursierenden
            Abmahnungen für angreifbar, teils wird Missbräuchlichkeit diskutiert (so etwa KBM Legal, Stand
            23.02.2026). Es handelt sich also um ein Kostenrisiko mit offener Rechtslage — nicht um eine
            gesicherte Anspruchsgrundlage. Die praktische Konsequenz bleibt trotzdem dieselbe: Wer die
            typischen, maschinell auffindbaren Mängel behebt, nimmt genau den Prüfberichten die Grundlage, auf
            die sich die aktuellen Schreiben stützen.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was sollten Website-Betreiber jetzt prüfen?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die Bilanz des ersten Jahres zeigt: Weder Marktüberwachung noch Abmahner verschwinden wieder — und
            die Umsetzungslücke im Markt ist groß. Drei Schritte verbessern die Ausgangsposition nachweisbar:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Ist-Zustand erfassen:</strong> Ein automatisierter WCAG-2.1-AA-Scan zeigt in Minuten,
              wo die größten Baustellen liegen — insbesondere die maschinell auffindbaren Mängel, auf die
              sich auch die Prüfberichte der Abmahnschreiben stützen.
            </li>
            <li>
              <strong>Kritische Mängel priorisiert beheben:</strong> Kontraste, Alt-Texte, Tastatur-Fallen
              und Formulare ohne Labels sind häufige, oft schnell behebbare Punkte. Ein priorisierter
              Fix-Plan spart Entwicklerstunden.
            </li>
            <li>
              <strong>Barrierefreiheitserklärung veröffentlichen:</strong> Die Erklärung gemäß § 14 BFSG ist
              eine Grundpflicht, fehlt aber laut itiko.de (Stand 30.06.2026) vielerorts. Bekannte Mängel
              benennen, Fortschritt dokumentieren — das zeigt Marktüberwachung und möglichen Abmahnern, dass
              das Thema aktiv bearbeitet wird.
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Jahr 2 beginnt: Wo steht Ihre Website?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check prüft Ihre Startseite in ca. 60 Sekunden gegen über 80
            WCAG-2.1-AA-Regeln — ohne Anmeldung. Für die vollständige Dokumentation liefert der Basis-Report
            (129 €) einen priorisierten Fix-Plan und einen Entwurf der Barrierefreiheitserklärung; das
            Re-Check-Abo (24,99 €/Monat) hält den Stand laufend aktuell.
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
          <h2 className="text-2xl font-semibold">Häufige Fragen zur BFSG-Bilanz nach einem Jahr</h2>
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
              <Link href="/bfsg-frist" className="text-primary underline underline-offset-2">
                BFSG-Frist: Was seit dem 28.06.2025 gilt — die Zeitleiste
              </Link>
            </li>
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
              <Link href="/bfsg-abmahnung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Abmahnung? Forderungen und Rechtslage 2026
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert allgemeine Informationen und eine
          technische Einordnung. Er stellt keine Rechtsberatung dar. Alle Zahlen sind Sekundärquellen
          entnommen und mit Quelle und Stand gekennzeichnet; keine Gewähr für Vollständigkeit oder
          Aktualität. Ob und wie BFSG-Verstöße abmahnfähig sind, ist gerichtlich nicht abschließend geklärt.
          Bei rechtlichen Fragen zu Ihrem konkreten Fall konsultieren Sie einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
