import type { Metadata } from "next";
import Link from "next/link";

// AEO-Sprint-Seite 1 (Text: marketing/swarm-2026-07-23/agent-05-seo-aeo.md, ASSET 3).
// Aufbau exakt wie app/bfsg-software-anbieter-vergleich/page.tsx (Answer-First-Template,
// ASSET 2): H1 = exakte Suchfrage, ≤60-Wörter-Direktantwort, fragebasierte H2s,
// FAQ sichtbar 1:1 = FAQPage-JSON-LD (Google-Anforderung für FAQ-Rich-Results).
export const metadata: Metadata = {
  title: "BFSG-Abmahnung: Kosten, Forderungen & Rechtslage 2026",
  description:
    "Was kostet eine BFSG-Abmahnung? Dokumentierte Forderungen von 595 € bis 2.706,18 €, Bußgeldrahmen nach § 37 BFSG, offene Rechtslage — sachlich eingeordnet, keine Angst-Sprache.",
  alternates: {
    canonical: "/bfsg-abmahnung-kosten",
  },
  openGraph: {
    title: "BFSG-Abmahnung: Kosten, Forderungen & Rechtslage 2026",
    description:
      "Dokumentierte Forderungen aus BFSG-Abmahnungen (595 € bis 2.706,18 €), Bußgeldrahmen nach § 37 BFSG und der offene Stand der Rechtsprechung — sachlich eingeordnet.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/bfsg-abmahnung-kosten",
    type: "article",
  },
};

// Sichtbarer „Zuletzt aktualisiert"-Stempel (Freshness = Zitier-Signal, ASSET 2 Regel 6).
const STAND = "23. Juli 2026";

// HINWEIS Refresh-Pflicht (ASSET 9): Diese Seite ist news-getrieben — bei BFSG-Urteilen,
// neuen Abmahnwellen oder MLBF-Meldungen dateModified + STAND aktualisieren.
const DATE_MODIFIED = "2026-07-23";

const ABMAHNWELLEN = [
  {
    welle: "Welle 1",
    zeitraum: "ab August 2025",
    forderung: "ca. 595 € pro Fall",
    besonderheiten: "Forderungsschreiben ohne durchgängig belastbare Prüfberichte",
  },
  {
    welle: "Welle 2",
    zeitraum: "ab Februar 2026",
    forderung: "2.706,18 € pro Fall",
    besonderheiten:
      "Mit konkretem WCAG-Prüfbericht (fehlende Alt-Texte, Kontrastfehler, leere Links), echtem Unterlassungsanspruch und Androhung gerichtlicher Schritte",
  },
];

const FAQ = [
  {
    q: "Wie viel kostet eine BFSG-Abmahnung?",
    a: "Die dokumentierten Forderungen liegen bei ca. 595 € (Abmahnwelle ab August 2025) bis 2.706,18 € (Welle ab Februar 2026, dokumentiert von KBM Legal, Stand 23.02.2026). Dazu kommen eigene Anwaltskosten und die Kosten der technischen Nachbesserung.",
  },
  {
    q: "Sind BFSG-Abmahnungen überhaupt zulässig?",
    a: "Das ist gerichtlich nicht abschließend geklärt. Die herrschende Meinung hält Verstöße über § 3a UWG für abmahnfähig; ein BGH-Urteil existiert bislang nicht, erste Entscheidungen werden für H2 2026 erwartet. Eine Abmahnung sollte trotzdem nie ignoriert werden — lassen Sie sie von einem Fachanwalt prüfen.",
  },
  {
    q: "Gibt es schon BFSG-Bußgelder?",
    a: "§ 37 BFSG sieht Bußgelder bis 10.000 € bzw. in schweren Fällen bis 100.000 € vor. Öffentlich dokumentierte Einzel-Bußgelder sind bislang nicht bekannt (Stand Juli 2026). Die MLBF kontrolliert seit Januar 2026 aktiv, Beschwerden haben Vorrang.",
  },
  {
    q: "Ersetzt ein technischer Report die anwaltliche Prüfung?",
    a: "Nein. Ein automatisierter WCAG-Report dokumentiert den technischen Zustand Ihrer Website — eine Arbeitsgrundlage für Kanzlei und Entwicklungsteam. Die rechtliche Bewertung einer Abmahnung ist ausschließlich Aufgabe eines Fachanwalts für IT- oder Wettbewerbsrecht.",
  },
  {
    q: "Was kostet die Vorab-Prüfung im Vergleich?",
    a: "Der Gratis-Check kostet nichts (Startseite, ca. 60 Sekunden). Der vollständige Report mit priorisiertem Fix-Plan und Entwurf der Barrierefreiheitserklärung kostet einmalig 129 € (bis 5 Unterseiten) oder 399 € (bis 25 Unterseiten, inkl. 30 Tage E-Mail-Support).",
  },
];

export default function BfsgAbmahnungKostenPage() {
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
    headline:
      "Was kostet eine BFSG-Abmahnung? Forderungen, Bußgelder und die offene Rechtslage 2026",
    description:
      "Dokumentierte Forderungen aus BFSG-Abmahnungen (595 € bis 2.706,18 €), Bußgeldrahmen nach § 37 BFSG und der offene Stand der Rechtsprechung — sachlich eingeordnet.",
    url: "https://bfsg-fuchs.de/bfsg-abmahnung-kosten",
    inLanguage: "de-DE",
    datePublished: "2026-07-23",
    dateModified: DATE_MODIFIED,
    publisher: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fuchs.de" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · Abmahnung · Kosten &amp; Rechtslage 2026
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Was kostet eine BFSG-Abmahnung? Forderungen, Bußgelder und die offene Rechtslage 2026
          </h1>
          <p className="mt-4 text-base leading-relaxed font-medium">
            Die bisher dokumentierten Forderungen aus BFSG-Abmahnungen liegen zwischen rund 595 €
            (erste Abmahnwelle ab August 2025) und 2.706,18 € (zweite Welle ab Februar 2026, mit
            externem Prüfbericht und Unterlassungsanspruch). Hinzu kommen eigene Anwaltskosten und
            die Kosten der Nachbesserung unter Zeitdruck. Ob Verstöße gegen das BFSG überhaupt
            wettbewerbsrechtlich abgemahnt werden dürfen, ist gerichtlich noch nicht abschließend
            geklärt.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: {STAND} · Technische Einordnung, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Wie teuer waren die bisherigen BFSG-Abmahnwellen?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Zwei Abmahnwellen sind öffentlich dokumentiert — beide richteten sich an Betreiber von
            Websites und Online-Shops:
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Welle</th>
                  <th className="px-3 py-3 text-left font-semibold">Zeitraum</th>
                  <th className="px-3 py-3 text-left font-semibold">Dokumentierte Forderung</th>
                  <th className="px-3 py-3 text-left font-semibold">Besonderheiten</th>
                </tr>
              </thead>
              <tbody>
                {ABMAHNWELLEN.map((w, i) => (
                  <tr key={w.welle} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{w.welle}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{w.zeitraum}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{w.forderung}</td>
                    <td className="px-3 py-2 text-muted-foreground">{w.besonderheiten}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die Forderung der zweiten Welle (2.706,18 €) wurde von der Kanzlei KBM Legal dokumentiert
            (Stand 23.02.2026); die abmahnende Seite trat mit formell saubereren Schreiben auf, die
            Fachwelt bewertet diese Welle als „ernst zu nehmen“. Beide Zahlen sind Einzeldatenpunkte
            aus dokumentierten Fällen — sie sagen nichts darüber aus, wie oft Abmahnungen insgesamt
            verschickt werden. [Quellen: kbm-legal.com, 01.03.2026; ll-ip.com, 25.11.2025]
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Welche Kosten kommen zur Abmahnforderung hinzu?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die Abmahnsumme ist nur der erste Posten. Realistisch entstehen weitere Kosten:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Eigene Verteidigung:</strong> Wer sich anwaltlich beraten lässt, zahlt für die
              außergerichtliche Prüfung und Antwort je nach Kanzlei und Streitwert.
            </li>
            <li>
              <strong>Nachbesserung unter Zeitdruck:</strong> Der Unterlassungsanspruch verlangt die
              Behebung der beanstandeten Mängel — Entwicklungsarbeit, die unter Abmahn-Druck meist
              teurer ist als in Ruhe geplant.
            </li>
            <li>
              <strong>Wiederholungsgefahr:</strong> Ohne strukturierte Behebung drohen
              Folge-Abmahnungen anderer Anspruchsgegner (Mitbewerber, eingetragene Verbände,
              Kammern nach § 8 UWG).
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was droht zusätzlich von Behördenseite?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Unabhängig von privaten Abmahnungen sieht § 37 BFSG Bußgelder vor: bis zu 10.000 €, in
            schweren Fällen bis zu 100.000 €. Wichtig für die Einordnung:{" "}
            <strong>
              Öffentlich dokumentierte Einzel-Bußgelder der Marktüberwachung sind bislang nicht
              bekannt (Stand Juli 2026).
            </strong>{" "}
            Die Marktüberwachungsstelle der Länder (MLBF) kontrolliert seit Januar 2026 aktiv —
            risikobasiert, mit Vorrang für Beschwerden; seit Juni 2026 gibt es zusätzlich ein
            Verbraucher-Beschwerdeportal (§ 32 BFSG). Wer behauptet, es seien bereits Bußgelder
            verhängt worden, sollte die Quelle verlangen können.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Ist die BFSG-Abmahnung überhaupt rechtens?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ehrliche Antwort: <strong>Das ist gerichtlich noch nicht abschließend geklärt.</strong>{" "}
            Die herrschende Meinung in der Fachliteratur sieht das BFSG als Marktverhaltensregel im
            Sinne des § 3a UWG — danach wären Verstöße durch Mitbewerber, eingetragene Wirtschafts-
            und Verbraucherverbände sowie Kammern abmahnfähig (§ 8 UWG). Es gibt jedoch bislang kein
            Urteil des Bundesgerichtshofs dazu; erste gerichtliche Entscheidungen zur Abmahnfähigkeit
            werden für die zweite Jahreshälfte 2026 erwartet (Stand: Juli 2026). [Quelle: ll-ip.com,
            25.11.2025]
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Für Website-Betreiber folgt daraus weder „alles Bluff“ noch „alles berechtigt“: Eine
            Abmahnung sollte nie ignoriert werden — sie enthält Fristen, und eine unbeantwortete
            Unterlassungsaufforderung kann teuer werden. Gleichzeitig ist nicht jede Forderung in
            voller Höhe durchsetzbar. Das ist eine Frage für einen Fachanwalt, nicht für einen
            Website-Scanner.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">
            Was sollte ich tun, wenn eine Abmahnung eingegangen ist?
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Fristen notieren und ernst nehmen.</strong> Keine vorschnelle Zahlung, keine
              vorschnelle Unterlassungserklärung — aber auch kein Aussitzen.
            </li>
            <li>
              <strong>Fachanwalt für IT- oder Wettbewerbsrecht einschalten.</strong> Nur eine Kanzlei
              kann die Rechtslage Ihres Falls bewerten. Das ist der wichtigste Schritt — alles
              andere ist Vorbereitung dafür.
            </li>
            <li>
              <strong>Technischen Ist-Stand dokumentieren.</strong> Ein datierter, nachvollziehbarer
              Prüfbericht des eigenen Auftritts hilft der Kanzlei bei der Bewertung: Was ist
              tatsächlich beanstandet? Was davon trifft zu? Was wurde wann behoben?
            </li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            An genau diesem Punkt setzen wir an — nicht früher und nicht später: BFSG-Fuchs liefert
            eine <strong>automatisierte technische Analyse</strong> Ihrer Website nach WCAG 2.1 AA /
            EN 301 549 mit menschlicher Sichtung vor Auslieferung. Das Ergebnis ist eine
            priorisierte, datierte Befund-Dokumentation — eine Arbeitsgrundlage für Ihre Kanzlei und
            Ihr Entwicklungsteam. Es ist ausdrücklich <strong>keine Rechtsberatung</strong> und keine
            Bewertung der Abmahnung selbst.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">
            Was kann ich tun, bevor es überhaupt zur Abmahnung kommt?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die rationale Abwehrinvestition ist die vorherige Prüfung: Eine automatisierte technische
            Analyse findet die häufigsten Mängelmuster (Kontraste, Alt-Texte, Formular-Labels,
            Tastatur-Fokus) in ca. 60 Sekunden als Gratis-Check und dokumentiert sie im
            kostenpflichtigen Report (129 € Basis / 399 € Profi) priorisiert mit Fix-Hinweisen und
            einem Entwurf der Barrierefreiheitserklärung (§ 14 BFSG i. V. m. der BFSGV).
            Automatisierte Verfahren decken erfahrungsgemäß 30–50 % der WCAG-Kriterien zuverlässig
            ab — den Rest ergänzt eine manuelle Prüfung. Wer Mängel in Ruhe behebt, statt unter
            Abmahn-Druck, zahlt dafür in der Regel deutlich weniger als die dokumentierten
            Abmahnforderungen.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Technischen Ist-Stand kennen, bevor andere ihn prüfen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check von BFSG-Fuchs prüft Ihre Startseite in ca. 60 Sekunden gegen
            über 80 WCAG-2.1-AA-Regeln — ohne Anmeldung. So dokumentieren Sie früh, wo Ihre Website
            steht, statt unter Zeitdruck zu reagieren.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlosen Check starten →
            </Link>
            <Link
              href="/mlbf-pruefstrategie"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              MLBF-Prüfstrategie 2026 lesen
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zu Kosten und Rechtslage</h2>
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
              <Link href="/mlbf-pruefstrategie" className="text-primary underline underline-offset-2">
                MLBF-Prüfstrategie 2026: Wird meine Website kontrolliert?
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
              <Link href="/wcag-scanner-vs-audit" className="text-primary underline underline-offset-2">
                WCAG-Scanner vs. manuelles Audit: Was findet was?
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert eine technische Einordnung und
          stellt keine Rechtsberatung dar; bei rechtlichen Fragen — insbesondere nach Erhalt einer
          Abmahnung — konsultieren Sie einen Fachanwalt für IT-Recht. Alle Angaben zum Stand {STAND};
          Quellen: kbm-legal.com (01.03.2026), ll-ip.com (25.11.2025).
        </aside>
      </article>
    </>
  );
}
