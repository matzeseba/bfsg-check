import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mobile Barrierefreiheit: Test und WCAG-Regeln",
  description:
    "Mobile Barrierefreiheit prüfen: Touch-Targets, 400-%-Zoom, Reflow und Screenreader-Test mit VoiceOver/TalkBack — typische Fehler in Shop-Templates.",
  alternates: {
    canonical: "/mobile-barrierefreiheit",
  },
  openGraph: {
    title: "Mobile Barrierefreiheit: Die unterschätzte Hälfte der WCAG-Prüfung",
    description:
      "Viele Barrieren zeigen sich erst am Smartphone: zu kleine Touch-Targets, kaputter Reflow, unbedienbare Slider. So testen Sie mobil — inkl. Screenreader-Kurzanleitung.",
    url: "https://bfsg-fix.de/mobile-barrierefreiheit",
    type: "article",
  },
};

const MOBILE_FEHLER = [
  {
    fehler: "Zu kleine Touch-Targets",
    wcag: "2.5.8",
    detail:
      "Icon-Buttons, Mengen-Stepper und Filter-Chips unter 24×24 CSS-Pixel — für Menschen mit motorischen Einschränkungen (und große Daumen) kaum treffbar. Empfohlen: 44×44 px.",
  },
  {
    fehler: "Abgeschnittener Inhalt bei Zoom",
    wcag: "1.4.4 / 1.4.10",
    detail:
      "Bei 400 % Zoom oder schmalem Viewport wird Text abgeschnitten oder erzwingt horizontales Scrollen — häufig durch feste Pixel-Breiten und Sticky-Elemente.",
  },
  {
    fehler: "Slider ohne Alternative",
    wcag: "2.1.1 / 2.5.1",
    detail:
      "Produktgalerien und Karussells, die nur auf Wisch-Gesten reagieren — ohne sichtbare Vor/Zurück-Buttons bleiben sie für viele Nutzer unbedienbar.",
  },
  {
    fehler: "Verschwindende Labels im mobilen Checkout",
    wcag: "1.3.1 / 3.3.2",
    detail:
      "Kompakte Mobile-Formulare setzen oft nur auf Platzhalter-Text, der beim Tippen verschwindet — spätestens bei der IBAN weiß niemand mehr, was ins Feld gehört.",
  },
  {
    fehler: "Burger-Menü ohne Screenreader-Semantik",
    wcag: "4.1.2",
    detail:
      "Das Menü-Icon ist ein leeres <div> ohne Namen, Rolle und aria-expanded — Screenreader-Nutzer erfahren nie, dass es dort eine Navigation gibt.",
  },
  {
    fehler: "Sticky Header/Banner verdecken Inhalt",
    wcag: "2.4.7 / 1.4.10",
    detail:
      "Fixierte Header, Cookie-Banner und App-Hinweise stapeln sich auf kleinen Screens und verdecken fokussierte Elemente oder halbe Produktlisten.",
  },
];

const FAQ = [
  {
    q: "Gilt das BFSG auch für die mobile Ansicht meiner Website?",
    a: "Ja. Das BFSG verweist auf die EN 301 549 (im Kern WCAG 2.1 AA), und die WCAG gelten geräteunabhängig — die mobile Darstellung ist dieselbe Dienstleistung wie die Desktop-Ansicht. Anforderungen wie Reflow (1.4.10) und Textvergrößerung (1.4.4) zielen sogar ausdrücklich auf kleine Viewports.",
  },
  {
    q: "Wie groß müssen Touch-Targets sein?",
    a: "WCAG 2.5.8 nennt als Minimum 24×24 CSS-Pixel; als komfortable Praxis-Empfehlung gelten 44×44 px. Betroffen sind vor allem Icon-Buttons, Schließen-Kreuze, Mengen-Stepper und eng gesetzte Footer-Links.",
  },
  {
    q: "Wie teste ich mit VoiceOver oder TalkBack, ohne Vorerfahrung?",
    a: "iPhone: Einstellungen → Bedienungshilfen → VoiceOver aktivieren, dann mit Rechts-Wischen durch die Elemente gehen und mit Doppeltipp aktivieren. Android: Einstellungen → Bedienungshilfen → TalkBack. Zehn Minuten reichen für die Kernfrage: Kommen Sie von der Startseite bis in den Warenkorb, und wird alles Wichtige sinnvoll angesagt?",
  },
  {
    q: "Mein Theme ist „responsive“ — ist es damit auch barrierefrei?",
    a: "Nein. Responsive Design sorgt dafür, dass das Layout sich anpasst — es sagt nichts über Touch-Target-Größen, Fokus-Reihenfolge, Screenreader-Semantik oder Kontraste aus. Viele Shop-Templates sind responsiv und trotzdem voller mobiler Barrieren.",
  },
  {
    q: "Findet ein automatisierter Scan auch mobile Mängel?",
    a: "Einen relevanten Teil: Kontraste, fehlende Alt-Texte, Formular-Labels und Namens-/Rollen-Probleme von Bedienelementen betreffen Desktop und Mobil gleichermaßen. Spezifisch mobile Punkte wie Gesten-Alternativen oder das Verhalten bei 400 % Zoom erfordern zusätzlich manuelle Prüfung — automatisierte Tools finden insgesamt rund 30–50 % der WCAG-Mängel.",
  },
];

export default function MobileBarrierefreiheitPage() {
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
    headline: "Mobile Barrierefreiheit: Die unterschätzte Hälfte der WCAG-Prüfung",
    description: "Touch-Targets, Reflow, Gesten und Screenreader-Tests: mobile Barrierefreiheit praxisnah erklärt.",
    url: "https://bfsg-fix.de/mobile-barrierefreiheit",
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
            Mobile · Barrierefreiheit · WCAG 2.1 AA
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Mobile Barrierefreiheit: Die unterschätzte Hälfte der WCAG-Prüfung
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Geprüft wird am großen Monitor, gekauft wird am Smartphone. Viele Barrieren zeigen sich erst
            auf kleinen Screens: Touch-Targets, die kein Daumen trifft, Layouts, die beim Zoomen
            zerbrechen, Slider, die nur auf Wischen reagieren. Dieser Artikel zeigt die wichtigsten
            mobilen WCAG-Anforderungen, eine 10-Minuten-Screenreader-Anleitung und die typischen Fehler
            in Shop-Templates.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juli 2026 · Automatisierte technische Analyse, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Warum Mobile ein eigenes Prüf-Thema ist</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die WCAG 2.1 gelten geräteunabhängig — das BFSG (über die EN 301 549) unterscheidet nicht
            zwischen Desktop- und Mobil-Ansicht. Trotzdem entstehen auf kleinen Screens eigene
            Fehlerklassen: Platzmangel verführt zu winzigen Bedienelementen und verschwindenden Labels,
            Touch ersetzt die präzise Maus, und Gesten-Interaktionen haben oft keine sichtbare
            Alternative. Genau dafür wurden mit WCAG 2.1 Kriterien wie Reflow (1.4.10) und
            Zeigergesten-Alternativen (2.5.1) eingeführt.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Dazu kommt die Nutzungsrealität: Wer mobil einkauft, tut das häufig einhändig, unterwegs, bei
            Sonnenlicht — Bedingungen, unter denen gute Kontraste und großzügige Touch-Targets allen
            Nutzern helfen, nicht nur Menschen mit dauerhaften Einschränkungen.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Die drei mobilen Kern-Anforderungen</h2>

          <h3 className="mt-6 text-lg font-semibold">1. Touch-Targets: mindestens 24×24, besser 44×44 Pixel</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            WCAG 2.5.8 verlangt für Bedienelemente eine Mindestgröße von 24×24 CSS-Pixeln; bewährte
            Praxis sind 44×44 px. Kritische Kandidaten im Shop: Mengen-Stepper (+/−), Schließen-Kreuze
            von Modals und Cookie-Bannern, Filter-Chips und eng gesetzte Footer-Links.
          </p>

          <h3 className="mt-6 text-lg font-semibold">2. Reflow und Zoom: Inhalt darf nicht zerbrechen</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Bei 400 % Zoom bzw. schmalem Viewport darf Inhalt weder abgeschnitten werden noch
            horizontales Scrollen erzwingen (WCAG 1.4.4 / 1.4.10). Der Test dauert Sekunden: Browser auf
            400 % zoomen und die wichtigsten Seiten durchscrollen — Produktseite, Warenkorb, Checkout.
          </p>

          <h3 className="mt-6 text-lg font-semibold">3. Gesten brauchen Alternativen</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Funktionen, die per Wischen oder Mehrfinger-Geste bedient werden (Galerien, Karussells,
            Karten), brauchen eine Alternative mit einfachem Tippen — sichtbare Vor/Zurück-Buttons statt
            reiner Swipe-Interaktion (WCAG 2.5.1). Das hilft auch Nutzern von Schaltersteuerungen und
            Sprachbedienung.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Screenreader-Test in 10 Minuten: VoiceOver und TalkBack</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Jedes Smartphone hat einen vollwertigen Screenreader eingebaut — der ehrlichste Mobiltest
            kostet nichts:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>iPhone (VoiceOver):</strong> Einstellungen → Bedienungshilfen → VoiceOver. Mit
              Rechts-/Links-Wischen durch die Elemente navigieren, Doppeltipp aktiviert. Tipp: Vorher den
              Bedienungshilfen-Kurzbefehl (Dreifachklick Seitentaste) einrichten, um wieder
              herauszukommen.
            </li>
            <li>
              <strong>Android (TalkBack):</strong> Einstellungen → Bedienungshilfen → TalkBack. Gleiche
              Grundgesten: Wischen navigiert, Doppeltipp aktiviert.
            </li>
            <li>
              <strong>Der Kern-Test:</strong> Augen zu (oder Bildschirm abdecken) und versuchen, ein
              Produkt zu finden und in den Warenkorb zu legen. Wird jedes Bedienelement mit sinnvollem
              Namen angesagt? Erfahren Sie, ob das Menü geöffnet ist? Kommen Sie ohne Sehen bis zur Kasse?
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Typische Mobile-Fehler in Shop-Templates</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Fehler</th>
                  <th className="px-3 py-3 text-left font-semibold">WCAG</th>
                  <th className="px-3 py-3 text-left font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {MOBILE_FEHLER.map((item, i) => (
                  <tr key={item.fehler} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">{item.fehler}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">{item.wcag}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Erst der Gesamtüberblick, dann der Mobiltest</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Viele mobile Barrieren — Kontraste, fehlende Labels, unbenannte Bedienelemente — stecken im
            selben Code wie die Desktop-Ansicht. Der kostenlose Sofort-Check prüft Ihre Startseite in ca.
            60 Sekunden gegen über 80 WCAG-2.1-AA-Regeln und zeigt, wo Sie stehen. Den gezielten
            Mobil-Durchgang mit Zoom- und Screenreader-Test hängen Sie danach an.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos prüfen →
            </Link>
            <Link
              href="/barrierefreiheit-testen"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Alle Selbsttests ansehen
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zur mobilen Barrierefreiheit</h2>
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
              <Link href="/barrierefreiheit-testen" className="text-primary underline underline-offset-2">
                Website-Barrierefreiheit testen: kostenlose Wege im Überblick
              </Link>
            </li>
            <li>
              <Link href="/bfsg-checkliste-online-shop" className="text-primary underline underline-offset-2">
                BFSG-Checkliste 2026: 25 Punkte für Online-Shops
              </Link>
            </li>
            <li>
              <Link href="/wcag-2-1-vs-2-2" className="text-primary underline underline-offset-2">
                WCAG 2.1 vs. 2.2: Die neuen Erfolgskriterien erklärt
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert allgemeine Informationen auf Basis
          der WCAG-2.1-Kriterien und stellt keine Rechtsberatung dar. Automatisierte und manuelle
          Selbsttests decken nur einen Teil der Anforderungen ab; keine Gewähr für Vollständigkeit oder
          Aktualität. Bei rechtlichen Fragen konsultieren Sie einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
