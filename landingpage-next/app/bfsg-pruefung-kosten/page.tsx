import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Was kostet eine BFSG-Prüfung? Marktpreise 2026",
  description:
    "BFSG-Prüfung: Marktpreise 2026 im Überblick — von kostenlosem Gratis-Check bis manuelles Audit. Tabellen, Entscheidungshilfe und eigene Preislogik erklärt.",
  alternates: {
    canonical: "/bfsg-pruefung-kosten",
  },
  openGraph: {
    title: "Was kostet eine BFSG-Prüfung? Marktpreise 2026 ehrlich verglichen",
    description:
      "Gratis-Tools, automatisierte Reports (129–399 €) und manuelle Audits (1.500–5.000 €) — welcher Ansatz lohnt sich wann?",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/bfsg-pruefung-kosten",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Warum unterscheiden sich die Preise so stark — von kostenlos bis 5.000 €?",
    a: "Der Preisunterschied spiegelt Tiefe und Abdeckung wider. Ein automatisierter Gratis-Check findet ca. 30–40 % der Mängel, gibt keine priorisierten Fix-Hinweise und erfordert technisches Know-how zur Auswertung. Ein manuelles Audit durch Accessibility-Experten deckt nahezu alle Mängel ab, erfordert aber erheblich mehr Zeit. Für die meisten mittelständischen Shops ist ein automatisierter Report mit menschlicher Sichtung das beste Preis-Leistungs-Verhältnis.",
  },
  {
    q: "Sind die Kosten steuerlich absetzbar?",
    a: "Als Betriebsausgabe ist eine BFSG-Prüfung in der Regel absetzbar, da sie der Erhaltung des Geschäftsbetriebs und der Erfüllung gesetzlicher Anforderungen dient. Dies ist eine allgemeine Aussage — für eine steuerliche Einordnung Ihres konkreten Falles wenden Sie sich an Ihren Steuerberater.",
  },
  {
    q: "Was enthält ein automatisierter Report mit Fix-Plan?",
    a: "Ein guter automatisierter Report listet alle gefundenen WCAG-Mängel nach Priorität geordnet auf, gibt für jeden Mangel einen konkreten Lösungshinweis (idealerweise mit Code-Snippet), enthält einen Entwurf der Barrierefreiheitserklärung und ist für technische und nicht-technische Mitarbeitende lesbar.",
  },
  {
    q: "Wann ist ein manuelles Audit notwendig?",
    a: "Ein manuelles Audit empfiehlt sich, wenn der Shop komplexe Interaktionen hat (mehrstufiger Checkout, individuelle Filterlogik, Custom-Player), wenn bereits Abmahnungen eingegangen sind, oder wenn ein hohes B2C-Volumen vorliegt und Haftungsrisiken minimiert werden sollen. Kein automatisiertes Tool ersetzt einen manuellen Accessibility-Test mit echten Screenreadern.",
  },
  {
    q: "Gibt es Fördermittel für BFSG-Audits?",
    a: "Förderprogramme für Barrierefreiheits-Maßnahmen existieren in einigen Bundesländern (z. B. im Rahmen von Digitalisierungsförderungen). Eine allgemeine BFSG-Audit-Förderung auf Bundesebene ist uns zum Stand Juli 2026 nicht bekannt. Prüfen Sie die Förderdatenbank des BMBF oder Ihre zuständige IHK für aktuelle Programme.",
  },
];

export default function BfsgPruefungKostenPage() {
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
    headline: "Was kostet eine BFSG-Prüfung? Marktpreise 2026 ehrlich verglichen",
    description: "Überblick über BFSG-Audit-Kosten: Gratis-Tools, automatisierte Reports und manuelle Audits.",
    url: "https://bfsg-fuchs.de/bfsg-pruefung-kosten",
    publisher: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fuchs.de" },
    datePublished: "2026-06-21",
    dateModified: "2026-07-23",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · Kosten · Marktpreise 2026
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Was kostet eine BFSG-Prüfung? Marktpreise 2026 ehrlich verglichen
          </h1>
          {/* AEO-Direktantwort (agent-05 ASSET 2): Preisfrage in ≤60 Wörtern mit Marktspannen beantworten */}
          <p className="mt-4 text-base font-medium leading-relaxed">
            Eine BFSG-Prüfung kostet je nach Tiefe zwischen 0 € und mehreren tausend Euro: Gratis-Tools sind
            kostenlos, finden aber nur ca. 30–40 % der Mängel. Automatisierte Reports mit Fix-Plan liegen bei
            129–399 €, manuelle Accessibility-Audits bei 1.500–5.000 € (Marktschätzungen, Stand Juli 2026).
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Dieser Artikel schlüsselt die drei Wege auf, zeigt versteckte Kosten und erklärt, warum ein
            automatisierter Report mit menschlicher Sichtung für viele Shops das realistischste
            Preis-Leistungs-Verhältnis bietet.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: 23. Juli 2026 · Preisangaben ohne Gewähr, keine Rechtsberatung
          </p>
        </header>

        {/* Drei Wege */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Welche drei Wege gibt es zur BFSG-Prüfung?</h2>

          <h3 className="mt-8 text-xl font-semibold">Weg 1: Gratis-Tools (Browser-Extensions, Online-Checker)</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Tools wie WAVE, axe DevTools (Browser-Extension), Google Lighthouse oder der WebAIM Contrast
            Checker sind kostenlos nutzbar und liefern sofortige Ergebnisse. Sie sind ein guter Einstieg für
            Entwickler, die einzelne Seiten auf offensichtliche Mängel prüfen wollen.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Die Einschränkung: Sie finden zuverlässig nur ca. 30–40 % aller WCAG-Mängel. Die Rohdaten erfordern
            Accessibility-Know-how zur Auswertung — ohne Priorisierung, ohne Fix-Plan, ohne
            Barrierefreiheitserklärung. Für eine strukturierte BFSG-Dokumentation reicht das nicht.
          </p>

          <h3 className="mt-8 text-xl font-semibold">Weg 2: Automatisierter Scan mit Report (129–399 €)</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Spezialisierte Scan-Dienste wie BFSG-Fuchs kombinieren automatisierte Prüfwerkzeuge (axe-core,
            eigene Regelwerke) mit menschlicher Sichtung vor Auslieferung. Das Ergebnis ist ein strukturierter
            PDF-Report mit priorisierten Mängeln, konkreten Lösungshinweisen und einem Entwurf der
            Barrierefreiheitserklärung.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Der Vorteil: keine Expertise beim Auftraggeber nötig, sofortiger Scan-Start, Lieferung typischerweise
            in Stunden, kein Beratungsmonster. Der Basis-Report (129 €, bis zu 5 Unterseiten) ist für die meisten
            mittelständischen Shops der effizienteste Einstieg. Der Profi-Report (399 €, bis zu 25 Unterseiten)
            enthält zusätzlich einen Umsetzungs-Fahrplan und 30 Tage E-Mail-Support.
          </p>

          <h3 className="mt-8 text-xl font-semibold">Weg 3: Manuelles Accessibility-Audit (1.500–5.000 €)</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Spezialisierte Accessibility-Agenturen und Freelancer führen manuelle Tests mit echten
            Screenreadern (NVDA, JAWS, VoiceOver), Tastatur-Navigation und kognitiven Evaluierungsverfahren
            durch. Abdeckung: ca. 80–95 % aller WCAG-Mängel.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Anbieter wie T-Systems Accessibility Services, Aktion Mensch, Eye-Able oder spezialisierte
            Accessibility-Freelancer berechnen je nach Seitenanzahl und Komplexität zwischen 1.500 und 5.000 €
            für mittelgroße Shops. Für komplexe Buchungsportale oder stark individualisierte Shops kann der
            Aufwand höher sein. Diese Preise sind Marktschätzungen auf Basis öffentlich zugänglicher
            Informationen und können variieren.
          </p>
        </section>

        {/* Vergleichstabelle */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Vergleich: Was leistet welche Stufe?</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Kriterium</th>
                  <th className="px-3 py-3 text-left font-semibold">Gratis-Tool</th>
                  <th className="px-3 py-3 text-left font-semibold">Auto-Report</th>
                  <th className="px-3 py-3 text-left font-semibold">Manuelles Audit</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Kosten", "0 €", "129–399 €", "1.500–5.000 €"],
                  ["WCAG-Mängel-Abdeckung", "30–40 %", "30–50 %", "80–95 %"],
                  ["Fix-Plan enthalten", "Nein", "Ja", "Ja"],
                  ["Barrierefreiheitserklärung", "Nein", "Entwurf", "Vollständig"],
                  ["Expertise beim Auftraggeber nötig", "Hoch", "Gering", "Gering"],
                  ["Lieferzeit", "Sofort", "Stunden", "Wochen"],
                  ["Screenreader-Test", "Nein", "Nein", "Ja"],
                  ["Für BFSG-Dokumentation geeignet", "Begrenzt", "Gut", "Sehr gut"],
                ].map(([k, g, a, m], i) => (
                  <tr key={k} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">{k}</td>
                    <td className="px-3 py-2 text-muted-foreground">{g}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Versteckte Kosten */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Welche versteckten Kosten werden oft vergessen?</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Re-Tests nach Behebung:</strong> Viele Agenturen berechnen Re-Tests separat. Nach der
              Behebung von Mängeln ist eine Nachtestung nötig, um die Konformität zu dokumentieren. Bei manuellen
              Audits können das weitere 500–1.500 € sein.
            </li>
            <li>
              <strong>Entwicklerzeit für die Behebung:</strong> Der eigentliche Aufwand liegt oft nicht beim Audit,
              sondern bei der Umsetzung. Je nach Mängel-Dichte und Tech-Stack kann das 10–80 Entwicklerstunden
              bedeuten.
            </li>
            <li>
              <strong>Barrierefreiheitserklärung pflegen:</strong> Die Erklärung muss aktuell gehalten werden. Bei
              neuen Features oder Re-Designs ist eine erneute Prüfung erforderlich.
            </li>
            <li>
              <strong>PDF-Dokumente:</strong> AGBs, Datenblätter und Rechnungen auf der Website müssen ebenfalls
              BFSG-Anforderungen erfüllen. PDF-Tagging ist ein eigenes Thema und in vielen Angeboten nicht
              enthalten.
            </li>
          </ul>
        </section>

        {/* Warum 129/399 */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Warum 129 € und 399 €?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            BFSG-Fuchs positioniert sich bewusst zwischen Gratis-Tools und manuellen Kanzlei-Audits. Der Basis-Report
            zu 129 € deckt die häufigsten automatisch erkennbaren Mängel ab, liefert einen priorisierten Fix-Plan
            und einen Barrierefreiheitserklärung-Entwurf — alles, was ein mittelständischer Shop für einen ersten
            dokumentierten Nachweis braucht.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Der Profi-Report zu 399 € erweitert das auf bis zu 25 Unterseiten, enthält einen Umsetzungs-Fahrplan
            mit Copy-Paste-Entwickler-Snippets und 30 Tage E-Mail-Support für Rückfragen. Das entspricht etwa
            einer Entwicklerstunde beim Fachanwalt — für einen deutlich breiteren Leistungsumfang.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Es ist keine Garantie auf BFSG-Konformität — das kann kein automatisiertes Tool leisten. Es ist eine
            solide technische Grundlage, die Ihnen zeigt, wo Ihre Prioritäten liegen sollten.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Starten Sie mit dem kostenlosen Sofort-Check</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            In ca. 60 Sekunden erhalten Sie einen ersten Überblick über kritische WCAG-2.1-Mängel Ihrer
            Startseite — ohne Anmeldung, ohne Kosten. Dann entscheiden Sie, welche Stufe sinnvoll ist.
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

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zu BFSG-Prüfkosten</h2>
          <div className="mt-6 divide-y divide-border">
            {FAQ.map((item) => (
              <div key={item.q} className="py-5">
                <h3 className="text-base font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interne Links */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold">Weiterführende Themen</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <Link href="/bfsg-checkliste-online-shop" className="text-primary underline underline-offset-2">
                BFSG-Checkliste 2026: 25 Punkte für Online-Shops
              </Link>
            </li>
            <li>
              <Link href="/axe-lighthouse-wave-vergleich" className="text-primary underline underline-offset-2">
                axe vs. Lighthouse vs. WAVE: Welches Tool findet die meisten Mängel?
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheitserklaerung-muster" className="text-primary underline underline-offset-2">
                Barrierefreiheitserklärung erstellen: Muster und Pflicht-Inhalte
              </Link>
            </li>
            <li>
              <Link href="/wcag-scanner-vs-audit" className="text-primary underline underline-offset-2">
                WCAG-Scanner vs. manuelles Audit: Was findet was?
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Preisangaben sind Marktschätzungen ohne Gewähr. Dieser Artikel
          ist eine automatisierte technische Analyse und stellt keine Rechtsberatung dar. Keine Garantie für
          Vollständigkeit, Aktualität oder rechtliche BFSG-Konformität. Bei rechtlichen Fragen konsultieren
          Sie einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
