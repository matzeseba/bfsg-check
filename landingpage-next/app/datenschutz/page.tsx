import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von BFSG-Fuchs — welche Daten wir verarbeiten, warum, und wie Sie Ihre Rechte ausüben.",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Datenschutzerklärung
      </h1>

      <p className="mt-3 text-xs text-muted-foreground">
        Stand: {new Date().toLocaleDateString("de-DE")} · Diese Seite ist
        keine Rechtsberatung. Bei Fragen wenden Sie sich an einen Fachanwalt.
      </p>

      <h2 className="mt-10 text-xl font-semibold">1. Verantwortlicher</h2>
      <p className="mt-2 text-muted-foreground">
        Verantwortlich im Sinne der DSGVO ist der im Impressum genannte
        Betreiber von BFSG-Fuchs (siehe{" "}
        <Link href="/impressum" className="underline">
          Impressum
        </Link>
        ).
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Verarbeitete Daten</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>
          <strong>Scan-Anfrage:</strong> die von Ihnen eingegebene URL, Datum,
          Uhrzeit, IP-Adresse (gekürzt) — zur Durchführung des kostenlosen
          Sofort-Checks und zur Missbrauchs-Abwehr.
        </li>
        <li>
          <strong>Bestellung:</strong> Name, E-Mail-Adresse, Rechnungsanschrift,
          Zahlungs-Referenz (Stripe) — zur Vertragsabwicklung gemäß Art. 6
          Abs. 1 lit. b DSGVO.
        </li>
        <li>
          <strong>E-Mail-Zustellung:</strong> Versand der Reports und
          Bestätigungen über Brevo (Sendinblue SAS, Paris). Auftragsverarbeitung
          gemäß Art. 28 DSGVO.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">3. Cookies & Tracking</h2>
      <p className="mt-2 text-muted-foreground">
        Wir setzen ausschließlich technisch notwendige Cookies (Session,
        Sicherheit). Marketing- und Analytics-Tags laden erst nach
        ausdrücklicher Einwilligung über unseren Cookie-Banner (§ 25 TDDDG).
        Einwilligungen können jederzeit über den Link
        &bdquo;Cookie-Einstellungen&ldquo; im Footer widerrufen werden.
      </p>

      <h2 className="mt-8 text-xl font-semibold">4. Ihre Rechte</h2>
      <p className="mt-2 text-muted-foreground">
        Sie haben Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung
        (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und
        Widerspruch (Art. 21) sowie das Beschwerderecht bei einer
        Aufsichtsbehörde (Art. 77).
      </p>

      <div className="mt-6 rounded-md border border-border bg-card p-4">
        <p className="font-semibold">DSGVO-Anfrage stellen</p>
        <p className="mt-1 text-muted-foreground">
          Datenauskunft oder Löschung Ihrer Daten direkt über das
          DSGVO-Anfrageformular:
        </p>
        <Link
          href="/datenschutz/anfrage"
          className="mt-3 inline-flex items-center gap-1 text-primary underline"
        >
          Zur DSGVO-Anfrage
        </Link>
      </div>

      <h2 className="mt-8 text-xl font-semibold">5. Hosting & Dienstleister</h2>
      <p className="mt-2 text-muted-foreground">
        Hosting bei Hetzner Online GmbH, Nürnberg (Deutschland). Zahlungs-
        abwicklung über Stripe Payments Europe Ltd., Dublin. Sämtliche
        Verarbeitungen erfolgen auf Basis abgeschlossener
        Auftragsverarbeitungs-Verträge.
      </p>
    </section>
  );
}
