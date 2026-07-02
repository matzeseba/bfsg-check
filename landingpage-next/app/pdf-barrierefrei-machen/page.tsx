import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PDF barrierefrei machen: Tagging-Anleitung",
  description:
    "PDFs barrierefrei machen: Tagging, Lesereihenfolge, Alt-Texte und Sprach-Tag nach PDF/UA. Anleitung für Acrobat, Word/LibreOffice und veraPDF.",
  alternates: {
    canonical: "/pdf-barrierefrei-machen",
  },
  openGraph: {
    title: "PDF barrierefrei machen: Tagging, Lesereihenfolge, Sprach-Tag",
    description:
      "AGB, Datenblätter und Rechnungen auf der Website sind BFSG-relevant. So werden PDFs nach PDF/UA-Grundsätzen zugänglich — Schritt für Schritt.",
    url: "https://bfsg-fix.de/pdf-barrierefrei-machen",
    type: "article",
  },
};

const PDF_FEHLER = [
  {
    fehler: "Nur gescanntes Bild statt Text",
    folge: "Screenreader lesen nichts vor; Inhalt ist komplett unzugänglich.",
    fix: "OCR-Texterkennung durchführen oder das Dokument aus der Quelldatei neu exportieren.",
  },
  {
    fehler: "Fehlende oder falsche Tags",
    folge: "Überschriften, Listen und Tabellen werden als Fließtext-Brei vorgelesen.",
    fix: "Beim Export „getaggtes PDF“ aktivieren; Tag-Struktur in Acrobat Pro nachprüfen.",
  },
  {
    fehler: "Falsche Lesereihenfolge",
    folge: "Mehrspaltige Layouts werden in unsinniger Reihenfolge vorgelesen.",
    fix: "Lesereihenfolge im Tag-Baum korrigieren — nicht nur in der visuellen Anordnung.",
  },
  {
    fehler: "Bilder ohne Alternativtext",
    folge: "Diagramme und Grafiken bleiben für blinde Nutzer ohne Information.",
    fix: "Alt-Texte in der Quelldatei pflegen (Word/LibreOffice übernehmen sie beim Export).",
  },
  {
    fehler: "Fehlendes Sprach-Tag",
    folge: "Screenreader nutzen die falsche Aussprache-Engine (z. B. Englisch für deutschen Text).",
    fix: "Dokumentsprache in den PDF-Eigenschaften auf „Deutsch“ setzen.",
  },
  {
    fehler: "Kein Dokumenttitel",
    folge: "Im Screenreader und Browser-Tab erscheint nur der Dateiname (z. B. „final_v3.pdf“).",
    fix: "Titel in den Dokumenteigenschaften setzen und „Titel statt Dateiname anzeigen“ aktivieren.",
  },
];

const FAQ = [
  {
    q: "Sind PDFs auf meiner Website überhaupt BFSG-relevant?",
    a: "Ja, wenn sie Teil des Angebots im Anwendungsbereich sind. AGB, Produktdatenblätter, Anleitungen und Rechnungen, die im Bestellprozess oder zur Produktinformation bereitgestellt werden, gehören zur Dienstleistung dazu. Ein perfekt zugänglicher Shop mit unzugänglichen Pflicht-Dokumenten bleibt lückenhaft.",
  },
  {
    q: "Was ist PDF/UA und muss ich es vollständig erfüllen?",
    a: "PDF/UA-1 (ISO 14289-1) ist der internationale Standard für zugängliche PDFs — er konkretisiert, wie Tags, Lesereihenfolge, Alt-Texte und Metadaten aussehen müssen. Als technischer Zielstandard ist er die beste Orientierung. Pragmatisch gilt: korrekt getaggte Struktur, Alt-Texte, Sprach-Tag und Dokumenttitel beheben bereits die schwerwiegendsten Barrieren.",
  },
  {
    q: "Kann ich barrierefreie PDFs direkt aus Word oder LibreOffice erzeugen?",
    a: "Ja, das ist sogar der empfohlene Weg: Formatvorlagen für Überschriften nutzen, Alt-Texte an Bildern pflegen, echte Listen- und Tabellenfunktionen verwenden — und beim Export die Option für getaggte/barrierefreie PDFs aktivieren (in LibreOffice: „Universelle Zugänglichkeit (PDF/UA)“). Nachträgliches Tagging in Acrobat ist deutlich aufwendiger als saubere Quelldokumente.",
  },
  {
    q: "Wie prüfe ich ein PDF kostenlos auf Barrierefreiheit?",
    a: "veraPDF ist ein kostenloses Open-Source-Werkzeug, das PDFs gegen den PDF/UA-Standard prüft. Acrobat Pro bringt eine eingebaute Barrierefreiheitsprüfung mit. Wie bei Websites gilt: Automatisierte Prüfungen finden strukturelle Fehler zuverlässig, die inhaltliche Qualität von Alt-Texten und Lesereihenfolge braucht menschliche Sichtung.",
  },
  {
    q: "Ist es einfacher, PDFs durch HTML-Seiten zu ersetzen?",
    a: "Oft ja. HTML ist von Haus aus flexibler zugänglich (Zoom, Reflow, Screenreader-Support) und lässt sich mit denselben Werkzeugen prüfen wie der Rest der Website. Für Inhalte ohne Druck-Zwang — AGB, FAQ, Anleitungen — ist eine HTML-Seite meist die wartungsärmere Lösung. PDFs bleiben sinnvoll, wo ein festes Layout gebraucht wird.",
  },
];

export default function PdfBarrierefreiMachenPage() {
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
    headline: "PDF barrierefrei machen: Tagging, Lesereihenfolge, Sprach-Tag",
    description: "Anleitung für zugängliche PDFs nach PDF/UA: Tagging, Alt-Texte, Werkzeuge und häufige Fehler.",
    url: "https://bfsg-fix.de/pdf-barrierefrei-machen",
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
            PDF · Barrierefreiheit · PDF/UA
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            PDF barrierefrei machen: Tagging, Lesereihenfolge, Sprach-Tag
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Die Website ist geprüft, die Kontraste stimmen — und dann liegt im Footer eine AGB-PDF, die für
            Screenreader ein einziges unlesbares Bild ist. PDFs sind der blinde Fleck vieler
            Barrierefreiheits-Projekte. Dieser Artikel erklärt, warum Dokumente auf der Website
            BFSG-relevant sind, wie PDF-Tagging funktioniert und mit welchen Werkzeugen Sie zugängliche
            PDFs erzeugen und prüfen.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juli 2026 · Automatisierte technische Analyse, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Warum PDFs auf der Website BFSG-relevant sind</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das Barrierefreiheitsstärkungsgesetz gilt seit dem 28.06.2025 für Dienstleistungen im
            elektronischen Geschäftsverkehr — und dazu gehört nicht nur die HTML-Oberfläche. AGB,
            Produktdatenblätter, Bedienungsanleitungen, Preislisten und Rechnungen, die als PDF
            bereitgestellt werden, sind Teil des Angebots. In unserer{" "}
            <Link href="/bfsg-checkliste-online-shop" className="text-primary underline underline-offset-2">
              25-Punkte-Checkliste für Online-Shops
            </Link>{" "}
            ist der Punkt entsprechend enthalten: Pflicht-Dokumente als barrierefreie PDFs oder als
            HTML-Alternative anbieten.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Der technische Zielstandard für zugängliche PDFs ist PDF/UA-1 (ISO 14289-1). Er beschreibt im
            Kern dasselbe Prinzip wie die WCAG für Websites: Inhalte brauchen eine maschinenlesbare
            Struktur, damit assistive Technologien sie sinnvoll wiedergeben können.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Tagging-Grundlagen: Was ein zugängliches PDF ausmacht</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ein „getaggtes“ PDF enthält neben dem sichtbaren Layout einen unsichtbaren Strukturbaum — die
            Tags. Sie sagen dem Screenreader: Das hier ist eine Überschrift der Ebene 1, das eine Liste mit
            fünf Punkten, das eine Tabelle mit Spaltenköpfen. Fünf Elemente entscheiden über die
            Zugänglichkeit:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Struktur-Tags:</strong> Überschriften (H1–H6), Absätze, Listen und Tabellen müssen als
              solche ausgezeichnet sein — analog zur Heading-Hierarchie auf Websites.
            </li>
            <li>
              <strong>Lesereihenfolge:</strong> Der Tag-Baum bestimmt, in welcher Reihenfolge vorgelesen
              wird. Bei mehrspaltigen Layouts weicht die visuelle Anordnung oft von der logischen
              Reihenfolge ab.
            </li>
            <li>
              <strong>Alternativtexte:</strong> Bilder, Diagramme und Logos brauchen Alt-Texte; rein
              dekorative Elemente werden als Artefakt markiert, damit Screenreader sie überspringen.
            </li>
            <li>
              <strong>Dokumentsprache:</strong> Das Sprach-Tag (z. B. „de-DE“) steuert die
              Aussprache-Engine des Screenreaders — fehlt es, klingt deutscher Text wie englisches
              Kauderwelsch.
            </li>
            <li>
              <strong>Dokumenttitel und Metadaten:</strong> Ein aussagekräftiger Titel in den
              Dokumenteigenschaften ersetzt kryptische Dateinamen in Tab-Leiste und Screenreader-Ansage.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Die häufigsten PDF-Fehler und ihre Behebung</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Fehler</th>
                  <th className="px-3 py-3 text-left font-semibold">Folge</th>
                  <th className="px-3 py-3 text-left font-semibold">Behebung</th>
                </tr>
              </thead>
              <tbody>
                {PDF_FEHLER.map((item, i) => (
                  <tr key={item.fehler} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">{item.fehler}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.folge}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Werkzeuge: Erzeugen, Nachbessern, Prüfen</h2>

          <h3 className="mt-6 text-lg font-semibold">Quelldokumente sauber aufsetzen (Word, LibreOffice)</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Der mit Abstand effizienteste Weg: Barrierefreiheit im Quelldokument anlegen. Formatvorlagen
            für Überschriften statt manuell vergrößerter Schrift, echte Listen- und Tabellenfunktionen,
            Alt-Texte direkt am Bild. Beim Export die Option für getaggte PDFs aktivieren — LibreOffice
            bietet dafür „Universelle Zugänglichkeit (PDF/UA)“ im PDF-Export-Dialog.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Nachträglich reparieren (Adobe Acrobat Pro)</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Für Bestands-PDFs ohne Quelldatei bleibt Acrobat Pro das Standard-Werkzeug: Tag-Baum
            bearbeiten, Lesereihenfolge korrigieren, Alt-Texte ergänzen, eingebaute
            Barrierefreiheitsprüfung ausführen. Realistische Erwartung: Nachträgliches Tagging ist
            Handarbeit und bei umfangreichen Dokumenten schnell teurer als ein Neuaufbau aus einer sauberen
            Quelldatei.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Kostenlos prüfen (veraPDF)</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            veraPDF ist ein kostenloses Open-Source-Validierungswerkzeug, das PDFs gegen den
            PDF/UA-Standard prüft und sich per Kommandozeile auch für ganze Dokumenten-Bestände
            automatisieren lässt — nützlich, wenn ein Shop Dutzende Datenblätter im Download-Bereich hat.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Oder: PDF durch HTML ersetzen</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Für viele Inhalte ist die ehrlichste Lösung, das PDF abzuschaffen: AGB, FAQ und Anleitungen
            funktionieren als HTML-Seite besser (Zoom, Reflow, Suche) und werden bei jedem
            Website-Scan automatisch mitgeprüft — statt als separates Dokument zu veralten.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Erst die Website, dann die Dokumente</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            PDF-Nacharbeit lohnt sich am meisten, wenn die Website selbst keine kritischen Barrieren mehr
            hat. Der kostenlose Sofort-Check zeigt in ca. 60 Sekunden, wo Ihre Startseite bei den
            WCAG-2.1-AA-Regeln steht — der Basis-Report (129 €) liefert den priorisierten Fix-Plan für bis
            zu 5 Unterseiten.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos prüfen →
            </Link>
            <Link
              href="/bfsg-pruefung-kosten"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Prüf-Kosten vergleichen
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zu barrierefreien PDFs</h2>
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
              <Link href="/barrierefreiheit-testen" className="text-primary underline underline-offset-2">
                Website-Barrierefreiheit testen: kostenlose Wege im Überblick
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert allgemeine technische Informationen
          zur PDF-Zugänglichkeit und stellt keine Rechtsberatung dar. Keine Gewähr für Vollständigkeit
          oder Aktualität. Ob und in welchem Umfang einzelne Dokumente in Ihrem Fall unter das BFSG
          fallen, klärt ein Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
