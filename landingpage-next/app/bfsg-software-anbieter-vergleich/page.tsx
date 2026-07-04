import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BFSG-Software im Vergleich: 5 Anbieter & Preise 2026",
  description:
    "BFSG-Tool-Anbieter im Vergleich: Scan-Reports, Monitoring-Abos und Auto-Fix-Widgets — Preise und Leistungen von 5 Anbietern, sachlich gegenübergestellt.",
  alternates: {
    canonical: "/bfsg-software-anbieter-vergleich",
  },
  openGraph: {
    title: "BFSG-Software-Anbieter im Vergleich: Preise und Leistungen 2026",
    description:
      "Einmalkauf oder Abo? Scan-Report, Monitoring oder Widget? Fünf BFSG-Tool-Anbieter im sachlichen Vergleich — nur objektiv nachprüfbare Kriterien.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/bfsg-software-anbieter-vergleich",
    type: "article",
  },
};

const STAND = "03.07.2026";

type Anbieter = {
  name: string;
  preisAb: string;
  modell: string;
  typ: string;
  standard: string;
  umfang: string;
  pdfReport: string;
  umsetzungsplan: string;
  support: string;
};

const VERGLEICH: Anbieter[] = [
  {
    name: "BFSG-Fuchs (dieses Angebot)",
    preisAb: "129 € einmalig",
    modell: "Einmalkauf; optionales Re-Check-Abo 24,99 €/Monat",
    typ: "Scan + PDF-Report mit menschlicher Sichtung",
    standard: "WCAG 2.1 AA / EN 301 549 (axe-core, 80+ Regeln)",
    umfang: "Bis 5 Unterseiten (Basis), bis 25 Unterseiten (Profi, 399 €)",
    pdfReport: "Ja, priorisiert; inkl. Entwurf der Barrierefreiheitserklärung",
    umsetzungsplan: "Ja (Profi): Umsetzungs-Fahrplan mit Entwickler-Hinweisen",
    support: "30 Tage E-Mail-Support (Profi)",
  },
  {
    name: "bf-check.de",
    preisAb: "19 € einmalig (voller Report)",
    modell: "Einmalkauf; Agentur-Paket 49 €/Monat (bis 50 Websites)",
    typ: "Scan + PDF-Report",
    standard: "15 WCAG-2.1-AA-Kriterien (laut Anbieter)",
    umfang: "Keine Angabe zur Seitentiefe auf der Website ermittelt",
    pdfReport: "Ja, per E-Mail; 30 Tage Rescan-Zugang",
    umsetzungsplan: "Maßnahmenplan auf Anfrage (Beratungsleistung)",
    support: "Priority-Support im Agentur-Paket",
  },
  {
    name: "bfsguard.de",
    preisAb: "19,99 €/Monat (Starter, zzgl. USt.)",
    modell: "Abo (monatlich kündbar); Einmal-Services 199–999 €",
    typ: "Auto-Fix-Widget + Monitoring",
    standard: "WCAG 2.2 (laut Anbieter)",
    umfang: "3 Websites im Starter, wöchentlicher Scan; bis 50 Websites (Agentur, 199 €/Monat)",
    pdfReport: "Ja (Report); PDF-Checker ab Business-Plan (69 €/Monat)",
    umsetzungsplan: "Auto-Fixes per Widget; Fix-Pakete mit Code-Snippets als Zusatzleistung",
    support: "E-Mail-Support (Starter), 24h-Priority ab Business",
  },
  {
    name: "barrierefrei-scanner.de",
    preisAb: "9,99 €/Monat (Starter)",
    modell: "Abo, monatlich kündbar",
    typ: "Monitoring-Abo mit wiederkehrenden Scans",
    standard: "WCAG-basierte Prüfung mit KI-Empfehlungen (laut Anbieter)",
    umfang: "1 Domain / 50 Seiten pro Scan (Starter) bis 10 Domains / 500 Seiten (Agentur, 69,99 €/Monat)",
    pdfReport: "Ja (PDF-Export); automatische Erklärung zur Barrierefreiheit",
    umsetzungsplan: "KI-Empfehlungen auf Deutsch",
    support: "Keine Angabe auf der Website ermittelt",
  },
  {
    name: "decareto (decareto.com)",
    preisAb: "34 €/Monat (Starter, 5 Websites)",
    modell: "Abo; Business 199 €/Monat (50 Websites), Premium 299 €/Monat (100 Websites)",
    typ: "Compliance-Monitoring-Suite (Schwerpunkt Datenschutz/Cookies, Accessibility-Report enthalten)",
    standard: "WCAG (laut Anbieter); daneben DSGVO-/ePrivacy-Prüfungen",
    umfang: "5–100 Websites je nach Plan; Startseiten-Scans unbegrenzt, 1 Vollscan/Monat automatisch",
    pdfReport: "Ja (White-Label-Reports)",
    umsetzungsplan: "Keine Angabe auf der Website ermittelt",
    support: "Persönlicher Support ab Starter",
  },
];

const FAQ = [
  {
    q: "Was ist der Unterschied zwischen Overlay-Widget, Scan-Report und Monitoring?",
    a: "Ein Overlay- oder Auto-Fix-Widget wird per Skript in die Website eingebunden und verändert die Darstellung zur Laufzeit. Ein Scan-Report prüft den Ist-Zustand und liefert eine Mängelliste, die das Entwicklerteam im Quellcode behebt. Ein Monitoring-Abo wiederholt solche Scans regelmäßig und meldet Veränderungen. Die Ansätze schließen sich nicht aus — sie beantworten aber unterschiedliche Fragen: „Was ist kaputt?“ (Report), „Bleibt es behoben?“ (Monitoring), „Kann ein Skript nachbessern?“ (Widget).",
  },
  {
    q: "Reicht ein automatisiertes Tool, um die BFSG-Anforderungen zu erfüllen?",
    a: "Nein, kein automatisiertes Tool allein — unabhängig vom Anbieter. Automatisierte Prüfungen erkennen zuverlässig etwa 30–50 % der WCAG-Kriterien; Punkte wie sinnvolle Alt-Texte, verständliche Fehlermeldungen oder logische Fokus-Reihenfolge erfordern menschliche Bewertung. Automatisierte Scans sind der effiziente erste Schritt zur Priorisierung, ersetzen aber weder manuelle Prüfung noch rechtliche Beratung.",
  },
  {
    q: "Einmalkauf oder Abo — was passt zu wem?",
    a: "Ein Einmalkauf passt, wenn Sie eine belastbare Bestandsaufnahme mit Fix-Plan brauchen und die Umsetzung selbst oder mit Ihrer Agentur stemmen. Ein Abo lohnt sich, wenn sich die Website häufig ändert (Shop mit wöchentlichen Releases) und Regressionen früh auffallen sollen. Viele kombinieren beides: einmalige Tiefen-Analyse, danach schlankes Re-Check-Abo.",
  },
  {
    q: "Warum verspricht BFSG-Fuchs keine „Konformität“?",
    a: "Weil ein automatisiertes Tool das seriös nicht zusichern kann: Ein relevanter Teil der WCAG-Kriterien ist nur manuell bewertbar, und ob eine Website die gesetzlichen Anforderungen erfüllt, ist am Ende eine rechtliche Frage. Wir liefern deshalb bewusst eine „automatisierte technische Analyse mit menschlicher Sichtung“ samt priorisiertem Umsetzungsplan — und empfehlen, Zusicherungen jedes Anbieters an dieser technischen Realität zu messen.",
  },
  {
    q: "Wie aktuell und verlässlich sind die Preisangaben in der Tabelle?",
    a: "Alle Preise und Leistungsangaben wurden am 03.07.2026 direkt den öffentlichen Websites der Anbieter entnommen. Anbieter können Preise und Leistungsumfang jederzeit ändern; maßgeblich sind immer die aktuellen Angaben des jeweiligen Anbieters. Die Angaben hier sind ohne Gewähr.",
  },
];

export default function BfsgSoftwareAnbieterVergleichPage() {
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
    headline: "BFSG-Software-Anbieter im Vergleich: Preise und Leistungen 2026",
    description:
      "Fünf BFSG-Tool-Anbieter im sachlichen Vergleich: Scan-Reports, Monitoring-Abos und Auto-Fix-Widgets mit Preisen und Leistungsumfang.",
    url: "https://bfsg-fuchs.de/bfsg-software-anbieter-vergleich",
    publisher: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fuchs.de" },
    dateModified: "2026-07-03",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · Software · Anbieter-Vergleich
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            BFSG-Software-Anbieter im Vergleich: Preise und Leistungen 2026
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Wer seine Website auf Barrierefreiheit prüfen lassen will, trifft auf sehr unterschiedliche
            Angebote: Einmal-Reports ab 19 €, Monitoring-Abos ab 9,99 € im Monat, Widget-Lösungen und
            Compliance-Suiten. Dieser Vergleich stellt fünf Anbieter — einschließlich unseres eigenen
            Angebots — anhand objektiv nachprüfbarer Kriterien gegenüber. Wenn Sie stattdessen die
            zugrunde liegenden Open-Source-Prüf-Engines vergleichen möchten, finden Sie das in unserem
            Artikel{" "}
            <Link href="/axe-lighthouse-wave-vergleich" className="text-primary underline underline-offset-2">
              axe vs. Lighthouse vs. WAVE
            </Link>
            .
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: {STAND} · Alle Fremdangaben von den öffentlichen Anbieter-Websites · Keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Welche Tool-Typen gibt es?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Der Markt lässt sich grob in drei Ansätze einteilen — die meisten Anbieter kombinieren mehrere
            davon:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Scan + Report:</strong> Ein automatisierter Prüflauf erfasst den Ist-Zustand nach
              WCAG-Kriterien und liefert eine priorisierte Mängelliste (meist als PDF). Die Behebung
              erfolgt im Quellcode der Website — durch das eigene Team oder eine Agentur. Vorteil:
              Die Mängel werden an der Ursache behoben. Grenze: Der Report selbst ändert noch nichts.
            </li>
            <li>
              <strong>Monitoring-Abo:</strong> Wiederkehrende Scans (täglich bis monatlich) mit
              Benachrichtigung bei neuen Befunden. Sinnvoll für Websites mit häufigen Änderungen, bei
              denen Regressionen früh auffallen sollen.
            </li>
            <li>
              <strong>Overlay-/Auto-Fix-Widget:</strong> Ein eingebundenes Skript passt die Darstellung
              zur Laufzeit an (z. B. Kontrast-Umschalter, automatische Korrekturen). In der
              Barrierefreiheits-Fachwelt ist dieser Ansatz umstritten: Fachorganisationen wie die
              Initiative hinter dem „Overlay Fact Sheet“ weisen darauf hin, dass Overlays strukturelle
              Mängel im Quellcode nicht vollständig beheben können. Ob und wie gut ein konkretes Widget
              arbeitet, sollte im Einzelfall geprüft werden — pauschale Urteile in beide Richtungen
              helfen nicht weiter.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Vergleichstabelle: 5 Anbieter im Überblick</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Verglichen werden ausschließlich objektiv nachprüfbare Kriterien: Preis, Bezahlmodell,
            Ansatz, Prüf-Standard, Prüf-Umfang, Report, Umsetzungshilfe und Support. Alle Fremdangaben
            stammen von den öffentlichen Websites der Anbieter (Stand: {STAND}, Quelle: jeweilige
            Anbieter-Website) — Angaben ohne Gewähr. Zur Transparenz: BFSG-Fuchs ist unser eigenes
            Angebot und in der ersten Zeile entsprechend gekennzeichnet.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Anbieter</th>
                  <th className="px-3 py-3 text-left font-semibold">Preis ab</th>
                  <th className="px-3 py-3 text-left font-semibold">Modell</th>
                  <th className="px-3 py-3 text-left font-semibold">Ansatz</th>
                  <th className="px-3 py-3 text-left font-semibold">Prüf-Standard / Engine</th>
                  <th className="px-3 py-3 text-left font-semibold">Prüf-Umfang</th>
                  <th className="px-3 py-3 text-left font-semibold">PDF-Report</th>
                  <th className="px-3 py-3 text-left font-semibold">Umsetzungshilfe</th>
                  <th className="px-3 py-3 text-left font-semibold">Support</th>
                </tr>
              </thead>
              <tbody>
                {VERGLEICH.map((a, i) => (
                  <tr key={a.name} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{a.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{a.preisAb}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.modell}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.typ}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.standard}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.umfang}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.pdfReport}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.umsetzungsplan}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            „Keine Angabe ermittelt“ bedeutet: Auf der öffentlichen Website des Anbieters war zum
            Stichtag keine Information zu diesem Kriterium auffindbar — nicht, dass die Leistung fehlt.
            decareto.de leitet auf decareto.com weiter; die Preise dort sind in Euro ausgewiesen.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Die Anbieter im Kurzprofil</h2>
          <h3 className="mt-8 text-xl font-semibold">bf-check.de — günstiger Einmal-Report</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            bf-check.de bietet einen kostenlosen Tages-Scan sowie einen vollen Report für 19 € einmalig
            (ohne Abo, inkl. 30 Tage Rescan-Zugang) und ein Agentur-Paket für 49 €/Monat für bis zu 50
            Kunden-Websites. Geprüft werden laut Anbieter 15 WCAG-2.1-AA-Kriterien; einen detaillierten
            Maßnahmenplan mit Code-Fixes gibt es als separate Beratungsleistung auf Anfrage.
            (Stand: {STAND}, Quelle: bf-check.de)
          </p>
          <h3 className="mt-8 text-xl font-semibold">bfsguard.de — Widget-Ansatz mit Abo-Plänen</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            BFSGuard setzt auf ein Auto-Fix-Widget mit Monitoring: Starter ab 19,99 €/Monat (3 Websites,
            wöchentlicher Scan), Business 69 €/Monat, Agentur 199 €/Monat mit White-Label; dazu
            Einmal-Services zwischen 199 € und 999 € (u. a. Komplett-Service für 499 €). Als Prüf-Basis
            nennt der Anbieter WCAG 2.2. Alle Preise laut Website zzgl. 19 % USt.
            (Stand: {STAND}, Quelle: bfsguard.de)
          </p>
          <h3 className="mt-8 text-xl font-semibold">barrierefrei-scanner.de — Monitoring-Abo ab 9,99 €</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Der Barrierefrei-Scanner ist ein klassisches Monitoring-Abo: Starter 9,99 €/Monat (1 Domain,
            50 Seiten pro Scan, monatlicher Lauf), Professional 29,99 €/Monat (3 Domains, 200 Seiten,
            wöchentlich), Agentur 69,99 €/Monat (10 Domains, 500 Seiten, täglich, White-Label-Berichte).
            Enthalten sind PDF-Export, KI-Empfehlungen auf Deutsch und eine automatisch erzeugte
            Erklärung zur Barrierefreiheit; monatlich kündbar. (Stand: {STAND}, Quelle:
            barrierefrei-scanner.de)
          </p>
          <h3 className="mt-8 text-xl font-semibold">decareto — Compliance-Suite mit Accessibility-Modul</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            decareto (decareto.de leitet auf decareto.com) ist primär eine Datenschutz-Compliance-Suite
            (Cookies, Tracker, Consent-Banner) mit enthaltenem Accessibility-Report nach WCAG. Pläne:
            Starter 34 €/Monat für 5 Websites, Business 199 €/Monat für 50, Premium 299 €/Monat für 100
            Websites — im größten Plan rechnerisch rund 3 € pro Website. Zielgruppe sind laut Anbieter
            vor allem Datenschutzbeauftragte, Kanzleien und Agenturen mit vielen Websites.
            (Stand: {STAND}, Quelle: decareto.com)
          </p>
          <h3 className="mt-8 text-xl font-semibold">BFSG-Fuchs — unser Angebot, ehrlich eingeordnet</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            BFSG-Fuchs ist ein Einmalkauf-Modell: Basis-Report für 129 € (bis 5 Unterseiten) und
            Profi-Report für 399 € (Tiefen-Scan bis 25 Unterseiten, Umsetzungs-Fahrplan mit
            Entwickler-Hinweisen, 30 Tage E-Mail-Support), optional ergänzt um ein Re-Check-Abo für
            24,99 €/Monat. Geprüft wird mit axe-core gegen über 80 Regeln nach WCAG 2.1 AA / EN 301 549,
            jeder Report wird vor Auslieferung menschlich gesichtet und enthält einen Entwurf der
            Barrierefreiheitserklärung gemäß § 14 BFSG (i. V. m. der BFSGV).
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ein Punkt ist uns als Qualitätsmerkmal wichtig: <strong>Wir versprechen bewusst keine
            „Konformität“.</strong> Automatisierte Prüfungen decken technisch nur einen Teil der
            WCAG-Kriterien ab (in der Fachliteratur werden meist 30–50 % genannt), und ob eine Website
            die gesetzlichen Anforderungen erfüllt, ist letztlich eine rechtliche Bewertung. Wir
            formulieren unser Ergebnis deshalb als das, was es ist: eine automatisierte technische
            Analyse mit menschlicher Sichtung und priorisiertem Umsetzungsplan. Unser Rat gilt
            anbieterunabhängig: Messen Sie jedes Versprechen — auch unseres — an dieser technischen
            Realität, und lassen Sie sich Zusicherungen zur Rechtslage schriftlich erläutern.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Erst kostenlos prüfen, dann vergleichen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check von BFSG-Fuchs prüft Ihre Startseite in ca. 60 Sekunden gegen
            über 80 WCAG-2.1-AA-Regeln — ohne Anmeldung. So sehen Sie vor jeder Kaufentscheidung, wo
            Ihre Website steht. Für die vollständige Dokumentation liefert der Basis-Report (129 €)
            einen priorisierten Fix-Plan und einen Entwurf der Barrierefreiheitserklärung.
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
              Marktpreise im Detail
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zum Anbieter-Vergleich</h2>
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
              <Link href="/axe-lighthouse-wave-vergleich" className="text-primary underline underline-offset-2">
                axe vs. Lighthouse vs. WAVE: die Prüf-Engines im Vergleich
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheit-testen" className="text-primary underline underline-offset-2">
                Website-Barrierefreiheit testen: kostenlose Wege im Überblick
              </Link>
            </li>
            <li>
              <Link href="/bfsg-frist" className="text-primary underline underline-offset-2">
                BFSG-Frist: Was seit dem 28.06.2025 gilt
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Vergleich beruht auf den öffentlich zugänglichen
          Angaben der genannten Anbieter zum Stand {STAND} (Quelle: jeweilige Anbieter-Website). Preise
          und Leistungsumfang können sich jederzeit ändern; maßgeblich sind allein die aktuellen Angaben
          des jeweiligen Anbieters. Alle Angaben ohne Gewähr. BFSG-Fuchs ist Anbieter eines der
          verglichenen Produkte. Dieser Artikel liefert eine technische Einordnung und stellt keine
          Rechtsberatung dar; bei rechtlichen Fragen konsultieren Sie einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
