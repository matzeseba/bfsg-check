import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung",
  description:
    "Widerrufsbelehrung und Muster-Widerrufsformular für Verbraucher-Bestellungen bei BFSG-Check gemäß §§ 355 ff. BGB.",
  alternates: { canonical: "/widerrufsbelehrung" },
};

export default function WiderrufsbelehrungPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Widerrufsbelehrung
      </h1>

      <h2 className="mt-10 text-xl font-semibold">Widerrufsrecht</h2>
      <p className="mt-2 text-muted-foreground">
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
        diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage
        ab dem Tag des Vertragsabschlusses.
      </p>
      <p className="mt-2 text-muted-foreground">
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Matthias Seba,
        Lange Straße 20, 27449 Kutenholz, E-Mail: info@matthias-seba.de)
        mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter
        Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu
        widerrufen, informieren. Sie können dafür das{" "}
        <Link href="/widerruf" className="underline">
          Online-Widerrufsformular
        </Link>{" "}
        verwenden, das jedoch nicht vorgeschrieben ist. Zur Wahrung der
        Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung
        des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Folgen des Widerrufs</h2>
      <p className="mt-2 text-muted-foreground">
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die
        wir von Ihnen erhalten haben, unverzüglich und spätestens binnen
        vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
        Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese
        Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
        ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen
        wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen
        wegen dieser Rückzahlung Entgelte berechnet.
      </p>

      <h2 className="mt-8 text-xl font-semibold">
        Vorzeitiges Erlöschen des Widerrufsrechts
      </h2>
      <p className="mt-2 text-muted-foreground">
        Das Widerrufsrecht erlischt bei einem Vertrag zur Lieferung von nicht
        auf einem körperlichen Datenträger befindlichen digitalen Inhalten
        vorzeitig, wenn wir mit der Ausführung des Vertrags begonnen haben,
        nachdem Sie ausdrücklich zugestimmt haben, dass wir mit der Ausführung
        vor Ablauf der Widerrufsfrist beginnen, und Sie Ihre Kenntnis davon
        bestätigt haben, dass Sie durch Ihre Zustimmung mit Beginn der
        Ausführung des Vertrags Ihr Widerrufsrecht verlieren, und wir Ihnen eine
        Bestätigung hierüber zur Verfügung gestellt haben. Für Unternehmer
        besteht kein Widerrufsrecht.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Muster-Widerrufsformular</h2>
      <p className="mt-2 text-muted-foreground">
        (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses
        Formular aus und senden Sie es zurück.)
      </p>
      <p className="mt-3 whitespace-pre-line rounded-md border border-border bg-muted/40 p-4 text-muted-foreground">
        {`An: Matthias Seba, Lange Straße 20, 27449 Kutenholz, info@matthias-seba.de

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (*):

— Bestellt am (*) / erhalten am (*):
— Name des/der Verbraucher(s):
— Anschrift des/der Verbraucher(s):
— Datum:
— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):

(*) Unzutreffendes streichen.`}
      </p>

      <p className="mt-6 text-muted-foreground">
        Den Widerruf können Sie bequem online über unser{" "}
        <Link href="/widerruf" className="underline">
          Widerrufsformular
        </Link>{" "}
        erklären.
      </p>
    </section>
  );
}
