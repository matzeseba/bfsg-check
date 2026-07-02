import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website-Barrierefreiheit testen: kostenlos",
  description:
    "Barrierefreiheit der Website kostenlos testen: 5 Selbsttests ohne Tools, Gratis-Checker im Vergleich und die Grenzen automatisierter Prüfungen.",
  alternates: {
    canonical: "/barrierefreiheit-testen",
  },
  openGraph: {
    title: "Website auf Barrierefreiheit testen: kostenlose Wege im Überblick",
    description:
      "Tastatur-Test, Kontrast, Zoom, Alt-Texte: Was Sie selbst prüfen können, welche Gratis-Tools helfen — und wo automatisierte Tests aufhören.",
    url: "https://bfsg-fix.de/barrierefreiheit-testen",
    type: "article",
  },
};

const SELF_TESTS = [
  {
    nr: 1,
    name: "Tastatur-Test",
    wcag: "2.1.1 / 2.4.7",
    anleitung:
      "Maus weglegen und die Seite nur mit Tab, Shift+Tab und Enter bedienen. Jedes interaktive Element muss erreichbar sein, der Fokus muss sichtbar bleiben und nirgends „hängen“ (Tastatur-Trap in Modals ist ein Klassiker).",
  },
  {
    nr: 2,
    name: "Kontrast-Stichprobe",
    wcag: "1.4.3 / 1.4.11",
    anleitung:
      "Normaler Text braucht ein Kontrastverhältnis von mindestens 4,5:1, großer Text und UI-Komponenten mindestens 3:1. Graue Schrift auf Weiß und Preis-Badges sind typische Ausfälle — mit einem Contrast-Checker in Sekunden messbar.",
  },
  {
    nr: 3,
    name: "Zoom auf 400 %",
    wcag: "1.4.4 / 1.4.10",
    anleitung:
      "Im Browser auf 400 % zoomen. Inhalte dürfen nicht abgeschnitten werden und kein horizontales Scrollen erzwingen. Sticky Header, die dann den halben Bildschirm belegen, fallen hier sofort auf.",
  },
  {
    nr: 4,
    name: "Alt-Text-Stichprobe",
    wcag: "1.1.1",
    anleitung:
      "Rechtsklick auf Produktbilder → untersuchen: Steht im alt-Attribut eine sinnvolle Beschreibung oder nur der Dateiname? Dekorative Bilder brauchen ein leeres alt=\"\" — gar kein Attribut ist ein Fehler.",
  },
  {
    nr: 5,
    name: "Formular-Check",
    wcag: "1.3.1 / 3.3.2",
    anleitung:
      "In ein Formularfeld klicken, ohne etwas einzugeben, und absenden. Werden Fehler klar benannt und dem Feld zugeordnet? Hat jedes Feld ein sichtbares Label — oder nur einen Platzhalter, der beim Tippen verschwindet?",
  },
];

const FAQ = [
  {
    q: "Kann ich Barrierefreiheit komplett kostenlos testen?",
    a: "Einen ersten, ernstzunehmenden Eindruck: ja. Die fünf Selbsttests in diesem Artikel plus ein Gratis-Tool wie WAVE oder Lighthouse decken die offensichtlichsten Mängel ab. Für eine strukturierte BFSG-Dokumentation mit priorisiertem Fix-Plan und Barrierefreiheitserklärung reicht das aber in der Regel nicht — hier beginnt der Bereich bezahlter Reports und manueller Audits.",
  },
  {
    q: "Wie viele Mängel findet ein automatisierter Test?",
    a: "Automatisierte Tools wie axe-core oder Lighthouse finden zuverlässig rund 30–50 % der WCAG-Mängel — vor allem Kontraste, fehlende Alt-Texte, Labels und strukturelle Probleme. Semantische Korrektheit, sinnvolle Fokus-Reihenfolgen oder verständliche Fehlermeldungen erfordern menschliche Sichtung.",
  },
  {
    q: "Welches Gratis-Tool ist das beste für den Einstieg?",
    a: "Für Nicht-Techniker ist WAVE am zugänglichsten (visuelle Markierungen direkt auf der Seite). Entwickler greifen eher zu axe DevTools (präzise, wenig False-Positives) oder Lighthouse (in Chrome eingebaut). Die Tools finden unterschiedliche Mängel-Mengen — ein Vergleich lohnt sich, siehe unseren Tool-Vergleich.",
  },
  {
    q: "Muss ich für das BFSG nach WCAG 2.1 oder 2.2 testen?",
    a: "Das BFSG verweist auf die EN 301 549, die im Kern WCAG 2.1 Stufe AA fordert. WCAG 2.2 ist noch nicht explizit vorgeschrieben, enthält aber sinnvolle Ergänzungen wie Mindestgrößen für Touch-Targets. Ein Test nach WCAG 2.1 AA deckt den Pflicht-Mindeststandard ab.",
  },
  {
    q: "Was unterscheidet den kostenlosen Sofort-Check von einem bezahlten Report?",
    a: "Der Gratis-Check prüft die Startseite automatisiert und zeigt kritische Mängel als ersten Überblick. Der Basis-Report (129 €) prüft bis zu 5 Unterseiten, wird vor Auslieferung menschlich gesichtet und enthält einen priorisierten Fix-Plan mit Lösungshinweisen sowie einen Entwurf der Barrierefreiheitserklärung — also das, was für eine dokumentierte BFSG-Bearbeitung gebraucht wird.",
  },
];

export default function BarrierefreiheitTestenPage() {
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
    headline: "Website auf Barrierefreiheit testen: kostenlose Wege im Überblick",
    description: "Fünf Selbsttests, Gratis-Tools und die Grenzen automatisierter Barrierefreiheits-Prüfungen.",
    url: "https://bfsg-fix.de/barrierefreiheit-testen",
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
            Barrierefreiheit · Testen · WCAG 2.1 AA
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Website auf Barrierefreiheit testen: kostenlose Wege im Überblick
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Sie müssen kein Accessibility-Experte sein, um die größten Barrieren Ihrer Website zu finden.
            Dieser Artikel zeigt fünf Selbsttests, die jeder in 15 Minuten durchführen kann, vergleicht die
            wichtigsten Gratis-Tools — und erklärt ehrlich, wo automatisierte Tests an ihre Grenzen stoßen.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juli 2026 · Automatisierte technische Analyse, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Warum überhaupt testen?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Seit dem 28.06.2025 gilt das Barrierefreiheitsstärkungsgesetz (BFSG). Websites und Shops im
            elektronischen Geschäftsverkehr müssen die Anforderungen der EN 301 549 erfüllen — im Kern
            WCAG 2.1 Stufe AA. Private Abmahnwellen laufen seit Herbst 2025, die Marktüberwachungsstelle
            der Länder (MLBF) ist aktiv. Unabhängig vom rechtlichen Druck gilt: Jede Barriere kostet
            Kunden — Menschen mit Sehbeeinträchtigung, motorischen Einschränkungen oder schlicht Nutzer
            mit kaputter Maus und grellem Sonnenlicht auf dem Display.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Fünf Selbsttests ohne Spezial-Tools</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Diese Prüfungen brauchen nur einen Browser. Sie ersetzen keinen vollständigen Test, decken aber
            die häufigsten und schwerwiegendsten Mängel-Kategorien ab.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">#</th>
                  <th className="px-3 py-3 text-left font-semibold">Test</th>
                  <th className="px-3 py-3 text-left font-semibold">WCAG</th>
                  <th className="px-3 py-3 text-left font-semibold">So geht&apos;s</th>
                </tr>
              </thead>
              <tbody>
                {SELF_TESTS.map((item, i) => (
                  <tr key={item.nr} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{item.nr}</td>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{item.name}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">{item.wcag}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.anleitung}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Kostenlose Test-Tools im Kurzüberblick</h2>

          <h3 className="mt-6 text-lg font-semibold">WAVE (Browser-Extension und Online-Checker)</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Markiert Fehler visuell direkt auf der geprüften Seite — ideal für Nicht-Techniker, die sehen
            wollen, wo genau ein Problem sitzt. Gut für Alt-Texte, Kontraste und Struktur-Fehler.
          </p>

          <h3 className="mt-6 text-lg font-semibold">axe DevTools (Browser-Extension)</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Der Entwickler-Standard auf Basis der axe-core-Engine. Präzise Befunde mit wenigen
            False-Positives und konkreten Hinweisen zum betroffenen Code-Element. Erfordert etwas
            technisches Verständnis beim Auswerten.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Google Lighthouse (in Chrome eingebaut)</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Liefert einen Accessibility-Score von 0–100 und ist ohne Installation verfügbar (DevTools →
            Lighthouse). Der Score ist ein grober Indikator — ein hoher Wert bedeutet nicht, dass die Seite
            barrierefrei ist, sondern nur, dass die automatisiert prüfbaren Punkte weitgehend bestanden sind.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Welches Tool findet am meisten? Die drei Werkzeuge decken unterschiedliche Mängel-Mengen ab —
            wir haben sie im Detail verglichen:{" "}
            <Link href="/axe-lighthouse-wave-vergleich" className="text-primary underline underline-offset-2">
              axe vs. Lighthouse vs. WAVE
            </Link>
            .
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Die ehrliche Grenze: Was kein automatischer Test findet</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Automatisierte Tools finden zuverlässig rund 30–50 % der WCAG-Mängel. Was sie nicht bewerten
            können: Ist der Alt-Text inhaltlich sinnvoll oder nur vorhanden? Ist die Fokus-Reihenfolge
            logisch? Sind Fehlermeldungen verständlich formuliert? Funktioniert der Checkout mit einem
            echten Screenreader? Diese Fragen erfordern menschliche Sichtung — bei komplexen Shops ein
            manuelles Audit mit Screenreader-Tests.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Für die Einordnung der drei Stufen — Gratis-Tool, automatisierter Report mit Sichtung, manuelles
            Audit — inklusive Marktpreisen lohnt ein Blick auf{" "}
            <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
              Was kostet eine BFSG-Prüfung?
            </Link>
            .
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">In 60 Sekunden zum ersten Testergebnis</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check von BFSG-Fuchs prüft Ihre Startseite gegen über 80
            WCAG-2.1-AA-Regeln — ohne Anmeldung, ohne Installation. Sie sehen sofort, wo die kritischen
            Punkte liegen, und entscheiden dann, ob ein vollständiger Report sinnvoll ist.
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
          <h2 className="text-2xl font-semibold">Häufige Fragen zum Barrierefreiheits-Test</h2>
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
              <Link href="/axe-lighthouse-wave-vergleich" className="text-primary underline underline-offset-2">
                axe, Lighthouse, WAVE: Welches Tool findet die meisten Mängel?
              </Link>
            </li>
            <li>
              <Link href="/bfsg-frist" className="text-primary underline underline-offset-2">
                BFSG-Frist: Was seit dem 28.06.2025 gilt
              </Link>
            </li>
            <li>
              <Link href="/mobile-barrierefreiheit" className="text-primary underline underline-offset-2">
                Mobile Barrierefreiheit: Touch-Targets, Zoom und Screenreader
              </Link>
            </li>
            <li>
              <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Prüfung? Marktpreise 2026
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert allgemeine Informationen auf Basis der
          WCAG-2.1-Kriterien und stellt keine Rechtsberatung dar. Automatisierte Tests decken nur einen Teil
          der Anforderungen ab; keine Gewähr für Vollständigkeit oder Aktualität. Bei rechtlichen Fragen
          konsultieren Sie einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
