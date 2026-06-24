import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Barrierefreiheitserklärung Muster + Pflicht-Inhalte 2026",
  description:
    "Barrierefreiheitserklärung erstellen: vollständiges Muster nach § 15 BFSGV mit allen Pflichtangaben, häufige Fehler und Generator-CTA.",
  alternates: {
    canonical: "/barrierefreiheitserklaerung-muster",
  },
  openGraph: {
    title: "Barrierefreiheitserklärung Muster 2026 — Copy-Paste nach § 15 BFSGV",
    description:
      "Alle 8 Pflicht-Felder laut BFSGV, vollständiges Muster und häufige Fehler bei der Barrierefreiheitserklärung.",
    url: "https://bfsg-fix.de/barrierefreiheitserklaerung-muster",
    type: "article",
  },
};

const PFLICHT_FELDER = [
  {
    nr: 1,
    feld: "Konformitätsstatus",
    beschreibung:
      "Angabe, ob die Website vollständig konform, teilweise konform oder nicht konform ist. Unterscheidung nach WCAG 2.1 AA.",
  },
  {
    nr: 2,
    feld: "Nicht barrierefreie Inhalte",
    beschreibung:
      "Liste der bekannten Mängel mit Begründung, warum sie noch nicht behoben wurden — z. B. unverhältnismäßige Belastung oder Inhalte von Dritten.",
  },
  {
    nr: 3,
    feld: "Alternativen für nicht barrierefreie Inhalte",
    beschreibung:
      "Beschreibung, wie Nutzer mit Behinderungen trotz der Mängel an die Informationen gelangen können (telefonische Auskunft, E-Mail-Kontakt o. Ä.).",
  },
  {
    nr: 4,
    feld: "Feedback-Mechanismus",
    beschreibung:
      "Kontaktmöglichkeit, über die Nutzer Barrierefreiheitsprobleme melden können — E-Mail-Adresse oder Kontaktformular.",
  },
  {
    nr: 5,
    feld: "Schlichtungsstelle",
    beschreibung:
      "Hinweis auf die zuständige Schlichtungsstelle und deren Kontaktdaten für den Fall, dass Beschwerden nicht direkt gelöst werden.",
  },
  {
    nr: 6,
    feld: "Datum der Erstellung/Aktualisierung",
    beschreibung: "Zeitstempel, wann die Erklärung erstellt oder zuletzt aktualisiert wurde.",
  },
  {
    nr: 7,
    feld: "Selbstbewertungsmethode",
    beschreibung:
      "Angabe, wie die Prüfung erfolgte: Selbstbewertung, externer Audit oder automatisierte technische Analyse.",
  },
  {
    nr: 8,
    feld: "Anwendungsbereich",
    beschreibung:
      "Welche URL(s) und welcher Zeitraum der Erklärung zugrunde liegt. Bei mehreren Websites oder Apps ist je eine Erklärung nötig.",
  },
];

const FAQ = [
  {
    q: "Ist eine Barrierefreiheitserklärung wirklich Pflicht für private Unternehmen?",
    a: "Für private Unternehmen, die unter den Anwendungsbereich des BFSG fallen, ist eine Barrierefreiheitserklärung nach § 15 BFSGV vorgeschrieben. Das betrifft vor allem Online-Shops und Dienstleister im elektronischen Geschäftsverkehr. Kleinstunternehmen unter 10 Beschäftigte und 2 Mio. Euro Umsatz können eine Ausnahme geltend machen — die müssen sie aber dokumentieren.",
  },
  {
    q: "Wie oft muss die Erklärung aktualisiert werden?",
    a: "Es gibt keine explizite gesetzliche Aktualisierungsfrist. Empfohlen wird eine Überprüfung mindestens einmal jährlich sowie immer dann, wenn wesentliche Änderungen an der Website vorgenommen werden oder neue Mängel bekannt werden.",
  },
  {
    q: "Kann ich teilweise konform sein?",
    a: "Ja. Der Status 'teilweise konform' ist zulässig und in der Praxis häufiger als 'vollständig konform'. Wichtig ist die ehrliche Auflistung der bekannten Mängel mit Begründung. 'Wir arbeiten daran' reicht nicht — Sie brauchen konkrete Angaben, warum der Mangel noch besteht.",
  },
  {
    q: "Was ist der Unterschied zwischen BFSG-Erklärung und DSGVO-Datenschutzerklärung?",
    a: "Zwei völlig unterschiedliche Dokumente. Die Datenschutzerklärung regelt die Verarbeitung personenbezogener Daten nach DSGVO. Die Barrierefreiheitserklärung dokumentiert den Stand der technischen Zugänglichkeit nach BFSG/WCAG. Beide müssen separat auf der Website vorhanden sein.",
  },
  {
    q: "Reicht ein automatisierter Scan als Grundlage für die Erklärung?",
    a: "Ein automatisierter Scan ist eine zulässige Methode für die Selbstbewertung und muss entsprechend als solche in der Erklärung ausgewiesen werden ('Selbstbewertung mittels automatisierter technischer Analyse'). Er deckt ca. 30–50 % der WCAG-Mängel ab — vollständige manuelle Prüfung wird empfohlen, ist aber nicht zwingend vorgeschrieben.",
  },
];

const MUSTER_TEXT = `Barrierefreiheitserklärung für [WEBSITE-URL]

Stand: [DATUM]

[UNTERNEHMENSNAME] ist bemüht, die Website [WEBSITE-URL] barrierefrei zugänglich zu machen,
gemäß den Anforderungen des Barrierefreiheitsstärkungsgesetzes (BFSG) und der
Barrierefreiheitsstärkungsgesetz-Verordnung (BFSGV) sowie EN 301 549.

1. KONFORMITÄTSSTATUS

Diese Website ist mit den Anforderungen des BFSG [teilweise / vollständig / nicht] konform.

[Bei "teilweise konform": Folgende Bereiche erfüllen die Anforderungen noch nicht:]

2. NICHT BARRIEREFREIE INHALTE

Folgende Inhalte sind noch nicht vollständig barrierefrei:

- [Beschreibung Mangel 1, z. B. "Einige Produktbilder haben noch keine Alt-Texte."]
  Grund: [z. B. "Unverhältnismäßige Belastung bei der Nachbearbeitung von 3.000 Produktfotos."]
  Geplante Behebung: [Datum oder "fortlaufend"]

- [Beschreibung Mangel 2]
  Grund: [Begründung]

3. ALTERNATIVEN

Nutzer, die von den o. g. Mängeln betroffen sind, können uns kontaktieren:
E-Mail: [barrierefreiheit@ihre-domain.de]
Telefon: [Ihre Telefonnummer]

Wir bemühen uns, Anfragen innerhalb von [5] Werktagen zu beantworten.

4. FEEDBACK-MECHANISMUS

Wenn Sie Barrierefreiheitsprobleme auf dieser Website bemerken oder wenn
Inhalte für Sie nicht zugänglich sind, kontaktieren Sie uns:

E-Mail: [barrierefreiheit@ihre-domain.de]

5. SCHLICHTUNGSSTELLE

Bei Beschwerden, die nicht direkt mit uns gelöst werden können, können Sie
sich an die Schlichtungsstelle nach § 16 BFSGV wenden:

Schlichtungsstelle für barrierefreie Informationstechnik (BFIT-Bund)
Der Beauftragter der Bundesregierung für die Belange von Menschen mit Behinderungen
Mauerstraße 53, 10117 Berlin
E-Mail: info@schlichtungsstelle-bfit.de

6. METHODE DER BEURTEILUNG

Diese Erklärung wurde auf Grundlage einer [Selbstbewertung / externen Prüfung] erstellt.
Eingesetztes Verfahren: [automatisierte technische Analyse nach WCAG 2.1 AA mittels BFSG-Check]
Datum der Prüfung: [DATUM]

Diese Erklärung wurde zuletzt aktualisiert am: [DATUM]`;

export default function BarrierefreiheitserklaerungMusterPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Barrierefreiheitserklärung nach § 15 BFSGV erstellen",
    description: "Schritt-für-Schritt-Anleitung zur Erstellung einer gesetzeskonformen Barrierefreiheitserklärung",
    step: [
      { "@type": "HowToStep", name: "Konformitätsstatus bestimmen", text: "Website technisch prüfen und Konformitätsgrad festlegen: vollständig, teilweise oder nicht konform." },
      { "@type": "HowToStep", name: "Mängel dokumentieren", text: "Alle bekannten nicht barrierefreien Inhalte auflisten mit Begründung, warum sie noch nicht behoben wurden." },
      { "@type": "HowToStep", name: "Alternativen benennen", text: "Kontaktwege angeben, über die Nutzer trotz Mängeln an Informationen kommen können." },
      { "@type": "HowToStep", name: "Feedback-Mechanismus einrichten", text: "Dedizierte E-Mail-Adresse oder Formular für Barrierefreiheits-Rückmeldungen bereitstellen." },
      { "@type": "HowToStep", name: "Schlichtungsstelle nennen", text: "Kontaktdaten der zuständigen Schlichtungsstelle einbinden." },
      { "@type": "HowToStep", name: "Erklärung veröffentlichen und verlinken", text: "Barrierefreiheitserklärung auf der Website publizieren und im Footer verlinken." },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · § 15 BFSGV · Barrierefreiheitserklärung
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Barrierefreiheitserklärung erstellen: Muster, Pflicht-Inhalte und häufige Fehler
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Eine Barrierefreiheitserklärung ist seit dem 28. Juni 2025 für viele Websites Pflicht. Doch was muss
            drin stehen — und was passiert bei Fehlern? Dieser Artikel erklärt alle 8 Pflichtangaben nach § 15
            BFSGV, enthält ein vollständiges Copy-Paste-Muster und zeigt die häufigsten Fehler, die in der Praxis
            unterlaufen.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juni 2026 · Informationsartikel, keine Rechtsberatung
          </p>
        </header>

        {/* Pflicht-Inhalte */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Die 8 Pflichtangaben nach § 15 BFSGV</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die BFSGV (Barrierefreiheitsstärkungsgesetz-Verordnung) schreibt vor, was in einer
            Barrierefreiheitserklärung stehen muss. Fehlen Pflichtangaben, ist die Erklärung formal unvollständig
            — auch wenn die Website selbst gut abschneidet.
          </p>
          <div className="mt-6 space-y-4">
            {PFLICHT_FELDER.map((feld) => (
              <div key={feld.nr} className="flex gap-4 rounded-xl border border-border bg-card/40 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                  {feld.nr}
                </span>
                <div>
                  <p className="text-sm font-semibold">{feld.feld}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{feld.beschreibung}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Muster */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Vollständiges Muster (Copy-Paste)</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ersetzen Sie alle Platzhalter in eckigen Klammern durch Ihre Angaben. Lassen Sie die Erklärung
            von einem Fachanwalt für IT-Recht prüfen, bevor Sie sie veröffentlichen.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl bg-muted/40 p-5">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-mono">
              {MUSTER_TEXT}
            </pre>
          </div>
        </section>

        {/* Häufige Fehler */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fehler in der Praxis</h2>

          <h3 className="mt-6 text-lg font-semibold">Fehler 1: Falsche Konformitäts-Aussage</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Viele Erklärungen behaupten „vollständig konform“, obwohl ein automatisierter Scan oder eine manuelle
            Prüfung noch Mängel zeigt. Das ist nicht nur formal falsch, sondern birgt Abmahnrisiken. „Teilweise
            konform“ mit ehrlicher Mängelliste ist rechtlich sicherer als ein aufgeblasener Status.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Fehler 2: Fehlender oder unerreichbarer Feedback-Mechanismus</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Ein Kontaktformular, das selbst nicht barrierefrei ist, erfüllt nicht den Zweck. Die Kontakt-E-Mail
            muss direkt erreichbar sein, ohne mehrere Klicks durch nicht zugängliche Navigationsebenen.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Fehler 3: Fehlende Schlichtungsstellen-Angabe</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Die Angabe der zuständigen Schlichtungsstelle (BFIT-Bund) ist Pflichtbestandteil nach § 15 BFSGV und
            wird in vielen Eigenversuchen vergessen.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Fehler 4: Veraltetes Datum</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Eine Erklärung mit Erstellungsdatum 2023, ohne jegliche Aktualisierung seitdem, signalisiert fehlende
            Pflege. Besonders bei Re-Designs oder neuen Features sollte das Datum und die Mängelliste
            aktualisiert werden.
          </p>
        </section>

        {/* CTA mit Generator-Hinweis */}
        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Ihren Scan-basierten Erklärungsentwurf erhalten</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            BFSG-Check erstellt im Rahmen des Basis-Reports (199 €) einen Entwurf Ihrer
            Barrierefreiheitserklärung — auf Basis der gefundenen Mängel aus dem WCAG-2.1-Scan. Sie müssen
            die Erklärung dann noch mit eigenen Kontaktdaten ergänzen und veröffentlichen.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Report mit Erklärungsentwurf bestellen →
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Kostenloser Gratis-Check
            </Link>
          </div>
        </section>

        {/* Schlichtungsstellen */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Schlichtungsstellen-Liste</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Für private Unternehmen im Anwendungsbereich des BFSG ist die zentrale Schlichtungsstelle:
          </p>
          <div className="mt-4 rounded-xl border border-border bg-card/40 p-4 text-sm">
            <p className="font-semibold">Schlichtungsstelle für barrierefreie Informationstechnik (BFIT-Bund)</p>
            <p className="mt-1 text-muted-foreground">
              Beauftragter der Bundesregierung für die Belange von Menschen mit Behinderungen
            </p>
            <p className="mt-1 text-muted-foreground">Mauerstraße 53, 10117 Berlin</p>
            <p className="mt-1 text-muted-foreground">E-Mail: info@schlichtungsstelle-bfit.de</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
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
              <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Prüfung? Marktpreise 2026
              </Link>
            </li>
            <li>
              <Link href="/cookie-banner-fehler" className="text-primary underline underline-offset-2">
                Cookie-Banner 2026: Die 7 häufigsten Fehler
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Das Muster in diesem Artikel dient der Orientierung und ersetzt
          keine anwaltliche Prüfung. BFSG-Check liefert automatisierte technische Analysen, keine
          Rechtsberatung. Lassen Sie Ihre Barrierefreiheitserklärung von einem Fachanwalt für IT-Recht
          prüfen, bevor Sie sie veröffentlichen.
        </aside>
      </article>
    </>
  );
}
