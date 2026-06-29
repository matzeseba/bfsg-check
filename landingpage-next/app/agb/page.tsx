import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description:
    "AGB von BFSG-Fuchs für die automatisierte Barrierefreiheits-Prüfung und Reports.",
  alternates: { canonical: "/agb" },
};

export default function AgbPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Allgemeine Geschäftsbedingungen
      </h1>

      <p className="mt-3 text-xs text-muted-foreground">
        Stand: {new Date().toLocaleDateString("de-DE")} · Diese Seite ist
        keine Rechtsberatung. Bei Fragen wenden Sie sich an einen Fachanwalt.
      </p>

      <h2 className="mt-10 text-xl font-semibold">§ 1 Geltungsbereich</h2>
      <p className="mt-2 text-muted-foreground">
        Diese AGB gelten für sämtliche Verträge zwischen dem im Impressum
        genannten Anbieter und Kundinnen und Kunden über die Erbringung von
        Prüfungs- und Report-Leistungen rund um die digitale Barrierefreiheit
        nach BFSG / WCAG 2.1.
      </p>

      <h2 className="mt-8 text-xl font-semibold">§ 2 Leistungsbeschreibung</h2>
      <p className="mt-2 text-muted-foreground">
        Der Anbieter führt eine automatisierte, KI-gestützte technische
        Vorprüfung der vom Kunden benannten URL durch und liefert einen
        PDF-Report mit priorisierten Mängeln und Lösungsempfehlungen sowie auf
        Wunsch einen Entwurf der Barrierefreiheitserklärung. Eine
        Konformitäts- oder Abmahnsicherheits-Garantie wird ausdrücklich nicht
        übernommen.
      </p>

      <h2 className="mt-8 text-xl font-semibold">§ 3 Vertragsschluss & Zahlung</h2>
      <p className="mt-2 text-muted-foreground">
        Der Vertrag kommt mit Abschluss der Bestellung im Checkout-Dialog und
        anschließender Zahlung über Stripe zustande. Die Rechnung wird
        elektronisch zugesandt.
      </p>

      <h2 className="mt-8 text-xl font-semibold">§ 4 Widerrufsrecht (Verbraucher)</h2>
      <p className="mt-2 text-muted-foreground">
        Verbraucherinnen und Verbraucher haben ein 14-tägiges Widerrufsrecht.
        Bei digitalen Inhalten erlischt dieses mit ausdrücklicher Zustimmung
        zur sofortigen Ausführung und vollständiger Vertragserfüllung. Details
        in der{" "}
        <a href="/widerrufsbelehrung" className="underline">
          Widerrufsbelehrung
        </a>
        ; Erklärung über{" "}
        <a href="/widerruf" className="underline">/widerruf</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">§ 5 Abo-Laufzeit & Kündigung</h2>
      <p className="mt-2 text-muted-foreground">
        Das Re-Check-Abo läuft monatlich und ist jederzeit zum Ende der
        laufenden Abrechnungsperiode kündbar — Formular unter{" "}
        <a href="/kuendigen" className="underline">/kündigen</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">§ 6 Haftung</h2>
      <p className="mt-2 text-muted-foreground">
        Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit
        sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der
        Gesundheit. Im Übrigen ist die Haftung auf den vertragstypischen,
        vorhersehbaren Schaden begrenzt.
      </p>

      <h2 className="mt-8 text-xl font-semibold">§ 7 Streitbeilegung</h2>
      <p className="mt-2 text-muted-foreground">
        Wir nehmen nicht an einem Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teil. Plattform der EU-Kommission zur
        Online-Streitbeilegung:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          className="underline"
          rel="noopener noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
    </section>
  );
}
