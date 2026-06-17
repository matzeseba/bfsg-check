import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung gemäß § 5 DDG.",
};

export default function ImpressumPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Impressum
      </h1>

      <p className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        Platzhalter-Inhalt. Vor Live-Schaltung durch ladungsfähige
        Anbieter-Angaben ersetzen (siehe docs/LEGAL-PLACEHOLDERS.md).
      </p>

      <h2 className="mt-10 text-xl font-semibold">
        Angaben gemäß § 5 DDG
      </h2>
      <p className="mt-2 whitespace-pre-line text-muted-foreground">
        {`Inhaber: [vollständiger Name]
Adresse: [ladungsfähige Anschrift, c/o erlaubt]
PLZ Ort: [PLZ und Ort]
Deutschland`}
      </p>

      <h2 className="mt-8 text-xl font-semibold">Kontakt</h2>
      <p className="mt-2 whitespace-pre-line text-muted-foreground">
        {`E-Mail: hallo@bfsg-fix.de
Telefon: [optional]`}
      </p>

      <h2 className="mt-8 text-xl font-semibold">Umsatzsteuer</h2>
      <p className="mt-2 text-muted-foreground">
        USt-ID gemäß § 27 a UStG: [USt-ID oder Kleinunternehmer-Hinweis nach
        § 19 UStG].
      </p>

      <h2 className="mt-8 text-xl font-semibold">
        Redaktionell verantwortlich (§ 18 Abs. 2 MStV)
      </h2>
      <p className="mt-2 whitespace-pre-line text-muted-foreground">
        {`[Name]
[Anschrift]`}
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
    </section>
  );
}
