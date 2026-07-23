import type { Metadata } from "next";
import Link from "next/link";

// AEO-Ratgeber „Abmahnung erhalten — was jetzt?" (Akut-Suchintention, Sprint-Tag-3-Asset).
// Inhaltliche Vorgaben: marketing/swarm-2026-07-23/agent-05-seo-aeo.md (ASSET 2,
// Answer-First-Template) + Kanzlei-Verweis-Baustein aus
// marketing/swarm-2026-07-23/agent-08-partnerschaften.md (Abschnitt Kanzlei-Konzept).
// Fakten zu Abmahnwellen/§ 3a UWG aus ASSET 3 übernommen (dort belegt) — die Seite
// beantwortet eine ANDERE Suchintention als /bfsg-abmahnung-kosten (Akut-Lage statt
// Kostenfrage). Aufbau exakt wie app/bfsg-abmahnung-kosten/page.tsx:
// H1 = Suchfrage, ≤60-Wörter-Direktantwort, fragebasierte H2s, FAQ sichtbar 1:1 =
// FAQPage-JSON-LD (Google-Anforderung für FAQ-Rich-Results).
export const metadata: Metadata = {
  title: "Abmahnung erhalten – was jetzt? Erste Schritte",
  description:
    "Abmahnung erhalten? Ruhig bleiben: Checkliste für die ersten 48 Stunden, typische Fehler — und wie Sie den Ist-Stand Ihrer Website dokumentieren.",
  alternates: {
    canonical: "/abmahnung-erhalten",
  },
  openGraph: {
    title: "Abmahnung erhalten – was jetzt? Erste Schritte",
    description:
      "Checkliste für die ersten 24–48 Stunden nach einer BFSG-Abmahnung oder einem MLBF-Schreiben: Fristen, typische Fehler, technische Dokumentation — sachlich, ohne Angst-Sprache.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/abmahnung-erhalten",
    type: "article",
  },
};

// Sichtbarer „Zuletzt aktualisiert"-Stempel (Freshness = Zitier-Signal, ASSET 2 Regel 6).
const STAND = "23. Juli 2026";

// HINWEIS Refresh-Pflicht (ASSET 9): Diese Seite ist news-getrieben — bei BFSG-Urteilen
// zur Abmahnfähigkeit (§ 3a UWG), neuen Abmahnwellen oder MLBF-Meldungen
// dateModified + STAND aktualisieren.
const DATE_MODIFIED = "2026-07-23";

const SCHREIBEN_TYPEN = [
  {
    kriterium: "Wer schreibt?",
    privat: "Kanzlei im Auftrag von Mitbewerbern oder eingetragenen Verbänden",
    behoerde: "Marktüberwachungsstelle der Länder (MLBF) oder zuständige Landesbehörde",
  },
  {
    kriterium: "Rechtsgrundlage",
    privat:
      "Wettbewerbsrecht (UWG) — die Abmahnfähigkeit des BFSG über § 3a UWG ist gerichtlich nicht abschließend geklärt",
    behoerde: "BFSG unmittelbar — die Behörde handelt auf eigener gesetzlicher Grundlage",
  },
  {
    kriterium: "Typischer Inhalt",
    privat: "Unterlassungsaufforderung, vorformulierte Unterlassungserklärung, Kostennote",
    behoerde: "Feststellung von Mängeln, Aufforderung zur Behebung in angemessener Frist",
  },
  {
    kriterium: "Bei Nichtreaktion",
    privat: "Gerichtliche Schritte (z. B. einstweilige Verfügung) möglich",
    behoerde: "Gestuft: Einschränkung, Untersagung der Bereitstellung oder Bußgeld nach § 37 BFSG",
  },
];

const FEHLER = [
  {
    fehler: "Das Schreiben ignorieren",
    folge: "Fristen laufen, auch wenn Sie nicht antworten — eine unbeantwortete Abmahnung kann gerichtliche Schritte auslösen, ein behördliches Schreiben gestufte Maßnahmen nach sich ziehen.",
  },
  {
    fehler: "Vorschnell zahlen, „um Ruhe zu haben“",
    folge: "Ohne Prüfung, ob der Anspruch überhaupt besteht und der Betrag angemessen ist — gezahlt ist gezahlt.",
  },
  {
    fehler: "Die beigefügte Unterlassungserklärung ungeprüft unterschreiben",
    folge: "Sie bindet auf Jahre und enthält meist eine Vertragsstrafe; was einmal unterschrieben ist, lässt sich kaum zurücknehmen.",
  },
  {
    fehler: "Die Website panisch umbauen, ohne den Ausgangszustand zu dokumentieren",
    folge: "Danach kann niemand mehr nachvollziehen, was tatsächlich beanstandet war — weder Ihre Kanzlei noch Sie selbst.",
  },
];

const FAQ = [
  {
    q: "Muss ich auf eine Abmahnung reagieren, auch wenn ich sie für unberechtigt halte?",
    a: "Ja. Die Fristen im Schreiben laufen unabhängig davon, ob die Abmahnung berechtigt ist. Ignorieren kann gerichtliche Schritte auslösen — das Schreiben von einem Fachanwalt prüfen zu lassen heißt nicht, es liegen zu lassen.",
  },
  {
    q: "Soll ich die beigefügte Unterlassungserklärung unterschreiben?",
    a: "Nicht ungeprüft. Eine Unterlassungserklärung bindet langfristig und enthält meist eine Vertragsstrafe. Ob und in welcher Form eine Erklärung sinnvoll ist, prüft ein Fachanwalt — vorschnell zu unterschreiben ist einer der häufigsten Fehler nach einer Abmahnung.",
  },
  {
    q: "Was unterscheidet eine private Abmahnung von einem MLBF-Schreiben?",
    a: "Die private Abmahnung kommt von Mitbewerbern oder Verbänden über das Wettbewerbsrecht (UWG); ihre Zulässigkeit über § 3a UWG ist gerichtlich nicht abschließend geklärt. Die MLBF ist eine Behörde und handelt unmittelbar nach dem BFSG — gestuft: Aufforderung zur Behebung in angemessener Frist, danach Einschränkung, Untersagung oder Bußgeld nach § 37 BFSG.",
  },
  {
    q: "Hilft mir ein technischer Prüfreport im Abmahnverfahren?",
    a: "Er dokumentiert datiert den technischen Ist-Stand Ihrer Website — eine Arbeitsgrundlage, die Ihre Kanzlei bei der Bewertung verwerten kann (was wurde beanstandet, was trifft zu, was wurde wann behoben). Er ersetzt keine anwaltliche Prüfung; automatisierte Verfahren erfassen erfahrungsgemäß 30–50 % der WCAG-Kriterien.",
  },
  {
    q: "Was kostet die technische Dokumentation?",
    a: "Der Sofort-Check ist kostenlos (Startseite, ca. 60 Sekunden). Der vollständige Report mit priorisiertem Fix-Plan und Entwurf der Barrierefreiheitserklärung kostet einmalig 129 € (bis 5 Unterseiten) oder 399 € (bis 25 Unterseiten, inkl. 30 Tage E-Mail-Support).",
  },
  {
    q: "Wohin kann ich mich wenden, bevor ich einen Anwalt beauftrage?",
    a: "Die Bundesfachstelle Barrierefreiheit berät Wirtschaftsakteure kostenlos zu den Pflichten aus dem BFSG (§ 15 BFSG). Für die Bewertung Ihres konkreten Schreibens — Fristen, Ansprüche, Unterlassungserklärung — brauchen Sie einen Fachanwalt für IT- oder Wettbewerbsrecht.",
  },
];

export default function AbmahnungErhaltenPage() {
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
    headline: "Abmahnung erhalten — was jetzt? Erste Schritte, Fristen und typische Fehler",
    description:
      "Erste Schritte nach einer BFSG-Abmahnung oder einem MLBF-Schreiben: Checkliste für die ersten 24–48 Stunden, offene Rechtslage § 3a UWG, typische Fehler — sachlich eingeordnet.",
    url: "https://bfsg-fuchs.de/abmahnung-erhalten",
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
            BFSG · Abmahnung · Erste Schritte
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Abmahnung erhalten — was jetzt? Erste Schritte, Fristen und typische Fehler
          </h1>
          <p className="mt-4 text-base leading-relaxed font-medium">
            Ruhe bewahren und die Frist im Schreiben ernst nehmen: Zahlen oder unterschreiben Sie
            nichts ohne Prüfung, notieren Sie das Fristdatum, dokumentieren Sie den aktuellen
            technischen Zustand Ihrer Website und lassen Sie das Schreiben von einem Fachanwalt für
            IT- oder Wettbewerbsrecht bewerten. Die gesetzte Frist ist die einzige echte
            Dringlichkeit — bis dahin bleibt fast immer Zeit für die richtige Reihenfolge.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: {STAND} · Technische Einordnung, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Was tun in den ersten 24–48 Stunden?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das Wichtigste zuerst: Eine Abmahnung ist kein Urteil, sondern ein Schreiben mit
            Fristen. Ihnen bleiben in der Regel Tage bis wenige Wochen — nutzen Sie sie in dieser
            Reihenfolge:
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Schreiben dokumentieren.</strong> Eingangsdatum notieren, Umschlag aufbewahren,
              alles einscannen oder fotografieren. Bei behördlichen Schreiben zusätzlich das
              Aktenzeichen festhalten.
            </li>
            <li>
              <strong>Absender einordnen.</strong> Schreibt eine Kanzlei im Auftrag von Mitbewerbern
              oder Verbänden (private Abmahnung) — oder eine Behörde wie die MLBF? Die Tabelle unten
              hilft bei der Unterscheidung.
            </li>
            <li>
              <strong>Frist notieren.</strong> Die im Schreiben gesetzte Frist bestimmt Ihren
              Zeitrahmen — sie ist die einzige echte Dringlichkeit, alles andere kann geprüft
              werden.
            </li>
            <li>
              <strong>Nichts vorschnell zahlen oder unterschreiben.</strong> Weder die beigefügte
              Kostennote begleichen noch die vorformulierte Unterlassungserklärung unterschreiben —
              erst prüfen lassen.
            </li>
            <li>
              <strong>Technischen Ist-Stand der Website sichern.</strong> Datiert festhalten, was
              Ihre Website heute leistet und wo sie Mängel hat — bevor irgendetwas geändert wird.
            </li>
            <li>
              <strong>Fachanwalt einschalten.</strong> Je früher eine Kanzlei das Schreiben sieht,
              desto mehr Optionen bleiben — Details im Abschnitt{" "}
              <a href="#anwalt" className="text-primary underline underline-offset-2">
                „Wann brauche ich einen Anwalt?“
              </a>
            </li>
          </ol>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Einordnung</th>
                  <th className="px-3 py-3 text-left font-semibold">Private Abmahnung</th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Behördliches Schreiben (MLBF / Landesbehörde)
                  </th>
                </tr>
              </thead>
              <tbody>
                {SCHREIBEN_TYPEN.map((row, i) => (
                  <tr key={row.kriterium} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{row.kriterium}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.privat}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.behoerde}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Ist die Abmahnung überhaupt berechtigt?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ehrliche Antwort: <strong>Das ist gerichtlich noch nicht abschließend geklärt</strong> —
            und zwar genau bei der privaten Abmahnung. Die herrschende Meinung in der Fachliteratur
            sieht das BFSG als Marktverhaltensregel im Sinne des § 3a UWG; danach wären Verstöße
            durch Mitbewerber, eingetragene Wirtschafts- und Verbraucherverbände sowie Kammern
            abmahnfähig (§ 8 UWG). Ein Urteil des Bundesgerichtshofs dazu existiert bislang nicht;
            erste gerichtliche Entscheidungen zur Abmahnfähigkeit werden für die zweite Jahreshälfte
            2026 erwartet (Stand: Juli 2026). [Quelle: ll-ip.com, 25.11.2025]
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Dokumentiert ist bislang, was gefordert wurde: Die Forderungen aus BFSG-Abmahnungen
            liegen zwischen rund 595 € (erste Welle ab August 2025) und 2.706,18 € (zweite Welle ab
            Februar 2026, dokumentiert von der Kanzlei KBM Legal, Stand 23.02.2026). Das sind
            Einzeldatenpunkte aus dokumentierten Fällen — sie sagen nichts darüber aus, wie oft
            insgesamt abgemahnt wird und ob die Forderungen in voller Höhe durchsetzbar wären.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Für Sie folgt daraus weder „alles Bluff“ noch „alles berechtigt“: Nicht jede Forderung
            ist in voller Höhe durchsetzbar — aber eine Abmahnung zu ignorieren ist trotzdem der
            teuerste Weg. Bei einem behördlichen Schreiben der MLBF stellt sich die
            § 3a-Frage gar nicht: Die Behörde handelt unmittelbar auf Grundlage des BFSG.
          </p>
        </section>

        <section className="mt-14" id="anwalt">
          <h2 className="text-2xl font-semibold">Wann brauche ich einen Anwalt?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Vier klare Fälle, in denen Sie das Schreiben nicht allein beantworten sollten:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Private Abmahnung mit Unterlassungsaufforderung und Kostennote:</strong>{" "}
              immer — und vor Fristablauf. Nur eine Kanzlei kann Anspruch, Höhe und Fristen Ihres
              Falls bewerten.
            </li>
            <li>
              <strong>Vor jeder Unterschrift unter eine Unterlassungserklärung:</strong> Sie bindet
              auf Jahre und enthält meist eine Vertragsstrafe. Anwältinnen und Anwälte prüfen, ob
              und in welcher Form eine Erklärung überhaupt abgegeben werden sollte.
            </li>
            <li>
              <strong>Behördliches Schreiben, wenn Sie die Frist nicht halten können</strong> oder
              Rechtsmittel erwägen.
            </li>
            <li>
              <strong>Immer dann, wenn Sie unsicher sind,</strong> wer Ihnen da schreibt und was
              genau gefordert wird.
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Klarstellung in eigener Sache: Wir leisten <strong>keine Rechtsberatung</strong> und
            bewerten Ihr Schreiben nicht — dafür gibt es Fachanwälte für IT- oder Wettbewerbsrecht
            (zu finden etwa über den{" "}
            <a
              href="https://anwalt-suchservice.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Anwaltssuchservice der Bundesrechtsanwaltskammer
            </a>
            ). Ergänzend berät die{" "}
            <a
              href="https://www.bundesfachstelle-barrierefreiheit.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Bundesfachstelle Barrierefreiheit
            </a>{" "}
            Wirtschaftsakteure kostenlos zu den Pflichten aus dem BFSG (§ 15 BFSG) — sie ersetzt
            keine anwaltliche Fallprüfung, hilft aber bei der technischen Einordnung der
            Anforderungen.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was kann ich technisch sofort tun?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Parallel zur anwaltlichen Prüfung können Sie sofort dokumentieren, wo Ihre Website
            steht — das hilft Ihnen und später Ihrer Kanzlei:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Kostenloser Sofort-Check (ca. 60 Sekunden):</strong> prüft Ihre Startseite
              gegen über 80 WCAG-2.1-AA-Regeln — ein erster datierter Beleg für den technischen
              Zustand, ohne Anmeldung.
            </li>
            <li>
              <strong>Vollständiger Report (129 € Basis / 399 € Profi):</strong> priorisierte,
              datierte Befund-Dokumentation mit Fix-Hinweisen und Entwurf der
              Barrierefreiheitserklärung (§ 14 BFSG i. V. m. der BFSGV) — eine Arbeitsgrundlage, die
              Ihre Kanzlei verwerten kann: Was wurde beanstandet, was trifft zu, was wurde wann
              behoben?
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Ehrlichkeit gehört an dieser Stelle dazu: Eine <strong>automatisierte technische
            Analyse</strong> deckt erfahrungsgemäß 30–50 % der WCAG-Kriterien zuverlässig ab — sie
            ersetzt weder die anwaltliche Prüfung Ihres Schreibens noch ein vollständiges manuelles
            Audit. Und die Reihenfolge zählt: erst den Ist-Stand dokumentieren, dann beheben. Wer
            vorher umbaut, verwischt die Ausgangslage, auf die sich die Beanstandung bezieht.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fehler nach einer Abmahnung</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Diese vier Reaktionen kosten am Ende mehr als das Schreiben selbst:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            {FEHLER.map((item) => (
              <li key={item.fehler}>
                <strong>{item.fehler}.</strong> {item.folge}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">
            Den Ist-Stand dokumentieren — in 60 Sekunden, kostenlos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check von BFSG-Fuchs prüft Ihre Startseite gegen über 80
            WCAG-2.1-AA-Regeln — ohne Anmeldung. Das datierte Ergebnis belegt den technischen
            Zustand Ihrer Website; der vollständige Report liefert die priorisierte
            Befund-Dokumentation, die Ihre Kanzlei verwerten kann. Beides ersetzt keine
            Rechtsberatung — bereitet sie aber vor.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlosen Check starten →
            </Link>
            <Link
              href="/bfsg-abmahnung-kosten"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Was Abmahnungen bisher kosteten
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen nach Erhalt einer Abmahnung</h2>
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
              <Link href="/bfsg-abmahnung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Abmahnung? Forderungen und Rechtslage 2026
              </Link>
            </li>
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
              <Link href="/barrierefreiheitserklaerung-muster" className="text-primary underline underline-offset-2">
                Barrierefreiheitserklärung: Muster und Pflicht-Inhalte
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert eine technische Einordnung und
          stellt keine Rechtsberatung dar; bei rechtlichen Fragen — insbesondere nach Erhalt einer
          Abmahnung oder eines behördlichen Schreibens — konsultieren Sie einen Fachanwalt für
          IT-Recht. Alle Angaben zum Stand {STAND}; Quellen: kbm-legal.com (01.03.2026), ll-ip.com
          (25.11.2025).
        </aside>
      </article>
    </>
  );
}
