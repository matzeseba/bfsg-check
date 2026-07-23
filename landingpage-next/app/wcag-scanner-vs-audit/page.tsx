import type { Metadata } from "next";
import Link from "next/link";

// AEO-Sprint-Seite 3 (Text: marketing/swarm-2026-07-23/agent-05-seo-aeo.md, ASSET 5).
// Die 30–50-%-Ehrlichkeit ist hier explizites Vertrauens-Argument (Kern-Differenzierer).
// Aufbau exakt wie app/bfsg-software-anbieter-vergleich/page.tsx (Answer-First-Template,
// ASSET 2): FAQ sichtbar 1:1 = FAQPage-JSON-LD.
export const metadata: Metadata = {
  title: "WCAG-Scanner vs. manuelles Audit: Was findet was? (2026)",
  description:
    "Automatisierte WCAG-Scanner finden zuverlässig nur 30–50 % der Kriterien — wir sagen das offen. Was Scanner leisten, was nur Menschen prüfen, und was sich für wen lohnt.",
  alternates: {
    canonical: "/wcag-scanner-vs-audit",
  },
  openGraph: {
    title: "WCAG-Scanner vs. manuelles Audit: Was findet was — und was lohnt sich für wen?",
    description:
      "Automatisierte WCAG-Scanner finden zuverlässig etwa 30–50 % der Kriterien. Was Scanner leisten, was nur Menschen prüfen können, Kosten und Entscheidungshilfe.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/wcag-scanner-vs-audit",
    type: "article",
  },
};

const STAND = "23. Juli 2026";
const DATE_MODIFIED = "2026-07-23";

const KOSTEN = [
  {
    ansatz: "Gratis-Tools (WAVE, axe DevTools, Lighthouse)",
    kosten: "0 €",
    ergebnis: "Rohdaten ohne Priorisierung",
    grenze: "Auswertung erfordert Accessibility-Know-how",
    eigen: false,
  },
  {
    ansatz: "Automatisierter Report mit menschlicher Sichtung (BFSG-Fuchs)",
    kosten: "129 € / 399 € einmalig",
    ergebnis:
      "Priorisierte Befunde, Fix-Hinweise mit Code-Snippets, Entwurf der Barrierefreiheitserklärung; ein Mensch sichtet vor Auslieferung",
    grenze: "Deckt die automatisiert prüfbaren 30–50 % ab, kuratiert",
    eigen: true,
  },
  {
    ansatz: "Manuelles Experten-Audit",
    kosten: "1.500–5.000 €",
    ergebnis: "Nahezu vollständige Prüfung inkl. Screenreader-Tests, komplexer Flows",
    grenze: "Vorlauf von Wochen, höherer Preis",
    eigen: false,
  },
];

const FAQ = [
  {
    q: "Wie viel Prozent der WCAG-Kriterien findet ein automatisierter Scanner?",
    a: "Zuverlässig etwa 30–50 % — Kontraste, Alt-Texte, Formular-Labels, Tastatur-Fokus und ähnlich objektiv messbare Muster (Branchen-Konsens, Stand Juli 2026). Inhaltliche Bewertungen wie sinnvolle Alt-Texte oder verständliche Fehlermeldungen erfordern einen Menschen.",
  },
  {
    q: "Reicht ein automatischer Scan für das BFSG aus?",
    a: "Für die technische Dokumentation der häufigsten Mängel und einen priorisierten Fix-Plan ja — das ist der effiziente erste Schritt. Eine vollständige Prüfung aller WCAG-Kriterien und die rechtliche Bewertung ersetzt kein Scanner; dafür braucht es manuelle Prüfung bzw. einen Fachanwalt.",
  },
  {
    q: "Was bedeutet „menschliche Sichtung“ bei BFSG-Fuchs konkret?",
    a: "Vor der Auslieferung liest ein Mensch jeden Report quer: False Positives werden entfernt, Befunde nach Risiko priorisiert und die Fix-Hinweise auf Verständlichkeit geprüft. Sie erhalten keine Rohdaten-Wüste, sondern eine kuratierte, datierte Dokumentation.",
  },
  {
    q: "Wann brauche ich ein manuelles Audit für 1.500 € oder mehr?",
    a: "Bei komplexen, mehrstufigen Interaktionen (individuelle Checkouts, Custom-Player), nach einer Abmahnung oder wenn Nutzer mit assistiven Technologien zu Ihrem Kernpublikum gehören. Für die meisten gewachsenen KMU-Websites ist der automatisierte Report mit Sichtung der realistischere Einstieg.",
  },
  {
    q: "Sind Auto-Fix-Widgets eine Alternative?",
    a: "Overlay-Widgets, die Darstellung zur Laufzeit verändern, sind in der Fachwelt umstritten: Strukturelle Mängel im Quellcode beheben sie nicht vollständig, und die FTC-Strafe gegen accessiBe (Januar 2025) hat die Risiken überzogener Werbeversprechen gezeigt. Ob ein konkretes Widget hilft, ist eine Einzelfallprüfung — eine Behebung an der Ursache ersetzt es nicht.",
  },
];

export default function WcagScannerVsAuditPage() {
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
    headline: "WCAG-Scanner vs. manuelles Audit: Was findet was — und was lohnt sich für wen?",
    description:
      "Automatisierte WCAG-Scanner finden zuverlässig etwa 30–50 % der Kriterien. Was Scanner leisten, was nur Menschen prüfen können, Kosten und Entscheidungshilfe.",
    url: "https://bfsg-fuchs.de/wcag-scanner-vs-audit",
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
            WCAG · Automatisierung vs. Experten-Prüfung · Ehrliche Einordnung
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            WCAG-Scanner vs. manuelles Audit: Was findet was — und was lohnt sich für wen?
          </h1>
          <p className="mt-4 text-base leading-relaxed font-medium">
            Automatisierte WCAG-Scanner erkennen zuverlässig etwa 30–50 % der prüfbaren
            Erfolgskriterien — Kontraste, fehlende Alt-Texte, Formular-Labels, Tastatur-Fokus. Den
            Rest kann nur ein Mensch bewerten: ob ein Alt-Text sinnvoll ist, ob Fehlermeldungen
            verständlich sind, ob die Bedienlogik stimmt. Für die meisten KMU-Websites ist der
            Scanner der effiziente erste Schritt; das manuelle Audit ist die Vertiefung bei
            komplexen Abläufen.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: {STAND} · Technische Einordnung, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Was findet ein automatisierter Scanner zuverlässig?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Automatisierte Prüf-Engines wie axe-core (die technische Basis unseres Scanners) prüfen
            den gerenderten Code einer Website gegen ein festes Regelwerk. Zuverlässig erkennen sie
            Muster, die sich objektiv messen lassen:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Farbkontraste</strong> unter den geforderten Schwellen (WCAG 1.4.3, mindestens
              4,5:1 für normalen Text)
            </li>
            <li>
              <strong>Fehlende Alternativtexte</strong> bei Bildern (WCAG 1.1.1 — technisch vorhanden
              oder nicht)
            </li>
            <li>
              <strong>Formularfelder ohne verknüpfte Beschriftung</strong> (WCAG 3.3.2, 4.1.2)
            </li>
            <li>
              <strong>Tastatur-Fallen und fehlende Fokus-Indikatoren</strong> (WCAG 2.1.1, 2.4.7)
            </li>
            <li>
              <strong>
                Fehlende Sprach-Angaben, fehlerhafte Überschriften-Struktur, leere Links und Buttons
              </strong>{" "}
              (WCAG 3.1.1, 1.3.1, 2.4.4)
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Unser Scanner prüft gegen über 80 Regeln nach WCAG 2.1 AA / EN 301 549 — genau die
            Kategorien, aus denen auch die beanstandeten Punkte der dokumentierten Abmahnwelle vom
            Februar 2026 stammten (fehlende Alt-Texte, Kontrastfehler, leere Links; dokumentiert von
            KBM Legal, Stand 23.02.2026).
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was findet kein Scanner der Welt?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Hier sind wir radikal ehrlich, weil es Ihr Vertrauen verdient:{" "}
            <strong>
              Kein automatisiertes Werkzeug — unseres eingeschlossen — kann die folgenden Punkte
              zuverlässig bewerten:
            </strong>
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Ob ein Alt-Text inhaltlich sinnvoll ist.</strong> „Bild von“ oder der Dateiname
              IMG_4521.jpg sind technisch vorhandene Alt-Texte — und praktisch wertlos.
            </li>
            <li>
              <strong>Ob Fehlermeldungen verständlich sind.</strong> Ein Screenreader liest „Fehler
              42“ vor; ein Mensch bewertet, ob die Meldung zur Lösung führt.
            </li>
            <li>
              <strong>Ob die Bedienlogik aufgeht.</strong> Mehrstufige Checkouts, individuelle
              Filter, Custom-Player: erst ein Mensch mit Screenreader und Tastatur erlebt, ob der
              Ablauf funktioniert.
            </li>
            <li>
              <strong>Ob Sprache verständlich ist.</strong> Verschachtelte Sätze und Fachjargon sind
              ein WCAG-Thema (3.1.5) — und eine menschliche Bewertung.
            </li>
            <li>
              <strong>PDF-Inhalte im Detail.</strong> Ob ein Dokument korrekt getaggt ist und die
              Lesereihenfolge stimmt, erfordert Werkzeug plus Prüfung von Hand.
            </li>
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Woher kommt die Zahl „30–50 Prozent“?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            In der Barrierefreiheits-Fachwelt ist Konsens, dass automatisierte Werkzeuge nur einen
            Teil der WCAG-Erfolgskriterien zuverlässig prüfen können; als Korridor werden
            üblicherweise <strong>30–50 %</strong> genannt (Branchen-Konsens aus Fachliteratur und
            Anbieter-Dokumentationen, Stand Juli 2026). Die Spanne erklärt sich aus der Zählweise:
            Gemessen an rein automatisiert prüfbaren Regeln liegt die Abdeckung höher, gemessen an
            allen 50 Kriterien des WCAG-2.1-AA-Niveaus deutlich niedriger. Jeder Anbieter, der eine
            vollständige automatisierte Prüfung verspricht, sagt Ihnen nicht die ganze Wahrheit —
            das gilt für Auto-Fix-Widgets genauso wie für Scanner.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was kostet Scanner, was kostet Audit?</h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Ansatz</th>
                  <th className="px-3 py-3 text-left font-semibold">Typische Kosten</th>
                  <th className="px-3 py-3 text-left font-semibold">Was Sie bekommen</th>
                  <th className="px-3 py-3 text-left font-semibold">Grenze</th>
                </tr>
              </thead>
              <tbody>
                {KOSTEN.map((row, i) => (
                  <tr key={row.ansatz} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">
                      {row.eigen ? <strong>{row.ansatz}</strong> : row.ansatz}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{row.kosten}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.ergebnis}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.grenze}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ausführliche Marktpreise:{" "}
            <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
              Was kostet eine BFSG-Prüfung?
            </Link>{" "}
            · Vergleich der Prüf-Engines:{" "}
            <Link
              href="/axe-lighthouse-wave-vergleich"
              className="text-primary underline underline-offset-2"
            >
              axe vs. Lighthouse vs. WAVE
            </Link>
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Für wen lohnt sich welcher Weg?</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>KMU-Website oder Shop mit üblichen Seitentypen</strong> (Startseite, Kategorie,
              Produkt, Formular): Scanner mit menschlicher Sichtung als Dokumentation und Fix-Plan —
              das beste Preis-Leistungs-Verhältnis.
            </li>
            <li>
              <strong>Komplexe Anwendung</strong> (mehrstufiger Checkout, individuelle Interaktionen,
              hohe Nutzerzahlen): Scanner zuerst für die Breite, manuelles Audit für die kritischen
              Flows dahinter.
            </li>
            <li>
              <strong>Nach einer Abmahnung oder bei laufendem Verfahren:</strong> Fachanwalt plus
              technische Dokumentation; ein vollständiges manuelles Audit kann hier die angemessene
              Vertiefung sein — und wir sagen Ihnen das, obwohl wir es nicht verkaufen.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Warum kommunizieren wir die Grenze offen?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Weil Vertrauen unser einziges dauerhaftes Wettbewerbsmerkmal ist. Die FTC-Strafe gegen
            den Overlay-Anbieter accessiBe (Januar 2025) hat gezeigt, wohin übertriebene
            Automatisierungs-Versprechen führen. Wir versprechen deshalb keine „vollständige
            Konformität“, sondern liefern das, was seriös lieferbar ist: eine automatisierte
            technische Analyse nach WCAG 2.1 AA mit menschlicher Sichtung vor Auslieferung — und die
            klare Aussage, welchen Rest nur ein Mensch prüfen kann. Messen Sie jedes Versprechen
            jedes Anbieters an dieser technischen Realität. Auch unseres.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Sehen Sie selbst, was der Scanner findet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check von BFSG-Fuchs prüft Ihre Startseite in ca. 60 Sekunden gegen
            über 80 WCAG-2.1-AA-Regeln — ohne Anmeldung. Sie erhalten echte Befunde statt
            Werbeversprechen.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos testen, was der Scanner bei mir findet →
            </Link>
            <Link
              href="/barrierefreiheit-testen"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Website-Barrierefreiheit selbst testen: 5 Wege
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zu Scanner und Audit</h2>
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
              <Link
                href="/axe-lighthouse-wave-vergleich"
                className="text-primary underline underline-offset-2"
              >
                axe vs. Lighthouse vs. WAVE: die Prüf-Engines im Vergleich
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheit-testen" className="text-primary underline underline-offset-2">
                Website-Barrierefreiheit testen: kostenlose Wege im Überblick
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
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert eine technische Einordnung und
          stellt keine Rechtsberatung dar; bei rechtlichen Fragen konsultieren Sie einen Fachanwalt
          für IT-Recht. Alle Angaben zum Stand {STAND}.
        </aside>
      </article>
    </>
  );
}
