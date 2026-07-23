import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BFSG-Partnerprogramm für Webagenturen: 15 % Provision",
  description:
    "BFSG-/WCAG-Prüfberichte für Ihre Kunden, ohne selbst zu auditieren: 15 % Provision, Mengenstaffel ab 5 Reports/Monat, echtes Audit statt Overlay-Widget.",
  alternates: {
    canonical: "/partner",
  },
  openGraph: {
    title: "Partnerprogramm für Webagenturen — BFSG-Reports für Ihre Kunden",
    description:
      "15 % Provision, Mengenstaffel, Reports zur Weitergabe an Ihre Kunden. Echtes WCAG-Audit statt Overlay-Widget.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/partner",
    type: "website",
  },
};

const KONTAKT_MAIL = "info@bfsg-fuchs.de";
const MAILTO = `mailto:${KONTAKT_MAIL}?subject=Partnerprogramm%20BFSG-Fuchs&body=Hallo%2C%0A%0Awir%20m%C3%B6chten%20Partner%20werden.%0A%0AAgentur%2FFirma%3A%20%0AWebsite%3A%20%0AAnzahl%20Kunden-Websites%20(ca.)%3A%20%0A%0AViele%20Gr%C3%BC%C3%9Fe`;

const FAQ = [
  {
    q: "Wie funktioniert die Zuordnung der Bestellungen zu unserer Agentur?",
    a: "Unkompliziert und transparent: Sie nennen uns bei der Anmeldung (und danach laufend per E-Mail) die Domains Ihrer Kunden. Jede Bestellung für eine dieser Domains wird Ihrer Agentur zugeordnet — ohne Tracking-Cookies, ohne Link-Pflicht. Alternativ bestellen Sie die Reports direkt selbst für Ihre Kunden und geben sie weiter.",
  },
  {
    q: "Dürfen wir die Reports an unsere Kunden weitergeben?",
    a: "Ja. Die Weitergabe des Reports an den jeweiligen Endkunden, für dessen Website er erstellt wurde, ist ausdrücklich erlaubt und gewollt. Sie können den Report als Teil Ihrer eigenen Leistung (z. B. Relaunch, Wartungsvertrag, BFSG-Umsetzung) einsetzen.",
  },
  {
    q: "Wie hoch ist die Provision und wann wird sie ausgezahlt?",
    a: "15 % auf jede zugeordnete Bestellung (Basis, Profi, Cookie-Checks). Die Abrechnung erfolgt monatlich gesammelt per Überweisung gegen Gutschrift. Die Konditionen bestätigen wir Ihnen bei der Anmeldung schriftlich.",
  },
  {
    q: "Gibt es Mengenrabatte, wenn wir viele Kunden-Websites prüfen lassen?",
    a: "Ja. Ab 5 Reports pro Monat vereinbaren wir eine individuelle Staffel. Schreiben Sie uns die ungefähre Anzahl Ihrer Kunden-Websites — Sie bekommen ein konkretes Angebot, keine Verhandlungsrunden.",
  },
  {
    q: "Warum kein Overlay-Widget wie bei anderen Anbietern?",
    a: "Overlay-Widgets versprechen Barrierefreiheit per JavaScript-Einbindung — in der Accessibility-Fachwelt sind sie stark umstritten, weil sie die zugrunde liegenden Mängel im Code nicht beheben. Unser Ansatz ist ein echtes technisches Audit (WCAG 2.1/2.2 AA, EN 301 549) mit priorisiertem Fix-Plan, den Ihre Entwickler tatsächlich umsetzen können. Das ist die Leistung, die Sie Ihren Kunden guten Gewissens weitergeben können.",
  },
  {
    q: "Macht ihr uns bei unseren Kunden Konkurrenz?",
    a: "Nein. Wir verkaufen Prüfberichte — die Umsetzung (Design, Entwicklung, Relaunch) bleibt vollständig bei Ihnen. Genau dort entsteht Ihr Folgegeschäft: Jeder Report enthält konkrete Umsetzungsaufgaben, die Ihre Agentur beim Kunden abrechnen kann.",
  },
];

export default function PartnerPage() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Partnerprogramm · Agenturen · IT-Dienstleister
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            BFSG-Prüfberichte für Ihre Kunden — ohne selbst zu auditieren
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Ihre Kunden fragen nach dem Barrierefreiheitsstärkungsgesetz, aber ein eigenes
            Accessibility-Team lohnt sich nicht? Als Partner liefern Sie automatisierte
            WCAG-2.1-AA-Audits mit menschlicher Sichtung unter Ihrer Regie — mit 15 % Provision
            und Mengenstaffel. Die Umsetzung der Funde bleibt Ihr Geschäft.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Automatisierte technische Analyse mit menschlicher Sichtung · keine Rechtsberatung, keine Konformitätsgarantie
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">So funktioniert die Partnerschaft</h2>
          <ol className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">1. Anmelden per E-Mail.</strong> Kurze Mail mit
              Agenturname, Website und ungefährer Anzahl Ihrer Kunden-Websites — Sie erhalten die
              Partnerkonditionen schriftlich bestätigt. Keine Mindestabnahme, keine Laufzeit.
            </li>
            <li>
              <strong className="text-foreground">2. Kunden-Domains benennen.</strong> Sie nennen uns
              die Domains Ihrer Kunden. Jede Bestellung für diese Domains wird Ihnen zugeordnet —
              egal ob der Kunde selbst bestellt oder Sie für ihn.
            </li>
            <li>
              <strong className="text-foreground">3. Report liefern, Umsetzung verkaufen.</strong>{" "}
              Der Report (PDF, priorisierte Funde, Copy-Paste-Fixes, Entwurf der
              Barrierefreiheitserklärung) geht an Sie oder direkt an den Kunden. Die
              Umsetzungsaufgaben daraus sind Ihr Folgegeschäft.
            </li>
            <li>
              <strong className="text-foreground">4. Monatliche Abrechnung.</strong> 15 % Provision
              auf alle zugeordneten Bestellungen, gesammelt per Gutschrift und Überweisung.
            </li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Warum Agenturen mit uns arbeiten</h2>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Echtes Audit statt Overlay-Widget:</strong>{" "}
              WCAG-2.1/2.2-AA-Prüfung (EN 301 549) mit über 80 Prüfregeln und menschlicher Sichtung
              vor Auslieferung — keine JavaScript-Einbindung, die Mängel nur überdeckt.
            </li>
            <li>
              <strong className="text-foreground">Fester Preis, schnelle Lieferung:</strong> Basis
              129 €, Profi 399 €, Cookie-Checks ab 39 € — Lieferung in der Regel innerhalb weniger
              Stunden. Kalkulierbar für Ihre Angebote.
            </li>
            <li>
              <strong className="text-foreground">Keine Kanalkonflikte:</strong> Wir prüfen, Sie
              setzen um. Design, Entwicklung und Betreuung bleiben bei Ihnen.
            </li>
            <li>
              <strong className="text-foreground">Deutsch, transparent, Mittelstand:</strong>{" "}
              deutsche Rechnungen, deutscher Support, Reports in deutscher Fachsprache — gemacht für
              KMU-Websites und -Shops.
            </li>
          </ul>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
          <h2 className="text-xl font-semibold">Partner werden</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Eine kurze E-Mail genügt — Agenturname, Website, ungefähre Anzahl Kunden-Websites. Sie
            erhalten die Konditionen schriftlich und können sofort starten.
          </p>
          <p className="mt-4">
            <a
              href={MAILTO}
              className="btn-cta inline-flex h-12 items-center rounded-xl px-6 text-base font-semibold"
            >
              Partner werden — E-Mail schreiben
            </a>
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Oder direkt an{" "}
            <a href={`mailto:${KONTAKT_MAIL}`} className="underline underline-offset-2">
              {KONTAKT_MAIL}
            </a>{" "}
            mit dem Betreff &bdquo;Partnerprogramm&ldquo;.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Häufige Fragen von Agenturen</h2>
          <div className="mt-6 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="text-base font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            BFSG-Fuchs liefert eine automatisierte technische Analyse nach WCAG 2.1 AA mit
            menschlicher Sichtung — keine Rechtsberatung, keine Konformitätsgarantie. Provisions-
            und Staffelkonditionen werden bei der Anmeldung schriftlich bestätigt.{" "}
            <Link href="/" className="underline underline-offset-2">
              Zur Startseite
            </Link>
          </p>
        </footer>
      </article>
    </>
  );
}
