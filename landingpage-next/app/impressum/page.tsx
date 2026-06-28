import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung gemäß § 5 DDG.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Impressum
      </h1>

      <h2 className="mt-10 text-xl font-semibold">Angaben gemäß § 5 DDG</h2>
      <p className="mt-2 whitespace-pre-line text-muted-foreground">
        {`Matthias Seba
Lange Straße 20
27449 Kutenholz
Deutschland`}
      </p>

      <h2 className="mt-8 text-xl font-semibold">Kontakt</h2>
      <p className="mt-2 whitespace-pre-line text-muted-foreground">
        {`E-Mail: info@matthias-seba.de`}
      </p>

      <h2 className="mt-8 text-xl font-semibold">Umsatzsteuer</h2>
      <p className="mt-2 text-muted-foreground">
        Gemäß § 19 UStG (Kleinunternehmer-Regelung) wird keine Umsatzsteuer
        ausgewiesen.
      </p>

      <h2 className="mt-8 text-xl font-semibold">
        Redaktionell verantwortlich (§ 18 Abs. 2 MStV)
      </h2>
      <p className="mt-2 whitespace-pre-line text-muted-foreground">
        {`Matthias Seba
Lange Straße 20
27449 Kutenholz`}
      </p>

      <h2 className="mt-8 text-xl font-semibold">EU-Streitschlichtung</h2>
      <p className="mt-2 text-muted-foreground">
        Plattform der EU-Kommission zur Online-Streitbeilegung:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          className="underline"
          rel="noopener noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Haftungs-Disclaimer</h2>
      <p className="mt-2 text-muted-foreground">
        Barrierefrei-Prüfen liefert eine automatisierte technische Erstprüfung. Wir
        geben keine Konformitätsgarantie und ersetzen keine Rechtsberatung. Bei
        rechtlichen Fragen konsultieren Sie einen Fachanwalt für IT- und
        Wettbewerbsrecht.
      </p>
    </section>
  );
}
