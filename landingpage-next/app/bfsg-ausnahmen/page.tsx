import type { Metadata } from "next";
import Link from "next/link";

// AEO-Sprint-Seite 2 (Text: marketing/swarm-2026-07-23/agent-05-seo-aeo.md, ASSET 4).
// Implementiert Leitplanke 6 (aktives Abraten von Nicht-Betroffenen) als Vertrauens-Signal.
// Aufbau exakt wie app/bfsg-software-anbieter-vergleich/page.tsx (Answer-First-Template,
// ASSET 2): FAQ sichtbar 1:1 = FAQPage-JSON-LD.
export const metadata: Metadata = {
  title: "Bin ich vom BFSG ausgenommen? Kleinstunternehmen-Check 2026",
  description:
    "Vom BFSG ausgenommen sind Kleinstunternehmen (unter 10 Mitarbeitende UND unter 2 Mio. € Umsatz) — aber nur bei Dienstleistungen, nicht bei Produkten. Der ehrliche Selbst-Check.",
  alternates: {
    canonical: "/bfsg-ausnahmen",
  },
  openGraph: {
    title: "Bin ich vom BFSG ausgenommen? Der ehrliche Selbst-Check",
    description:
      "Kleinstunternehmen-Ausnahme (<10 Mitarbeitende UND <2 Mio. € Umsatz), Dienstleistung vs. Produkt, Übergangsfrist 28.06.2028 — mit Selbst-Check-Tabelle.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/bfsg-ausnahmen",
    type: "article",
  },
};

const STAND = "23. Juli 2026";
const DATE_MODIFIED = "2026-07-23";

const SELBSTCHECK = [
  {
    angebot: "Online-Shop (Waren an Verbraucher, Vertragsschluss online)",
    kategorie: "Dienstleistung im elektronischen Geschäftsverkehr",
    betroffen: "Ja — sofern über den Kleinst-Schwellen",
  },
  {
    angebot: "Reine Beratung/Agenturleistung, Friseur mit Online-Termin etc.",
    kategorie: "Dienstleistung",
    betroffen: "Nur ausgenommen, wenn Kleinstunternehmen (<10 MA UND <2 Mio. €)",
  },
  {
    angebot: "SaaS / digitale Dienste mit B2C-Verträgen",
    kategorie: "Dienstleistung im elektronischen Geschäftsverkehr",
    betroffen: "Ja — sofern über den Kleinst-Schwellen",
  },
  {
    angebot: "Eigene Produkte (Hardware, Software, E-Books)",
    kategorie: "Produkt",
    betroffen: "Ja — unabhängig von der Größe",
  },
  {
    angebot: "Ausschließlich B2B-Verträge",
    kategorie: "Außerhalb des Verbraucher-Bezugs",
    betroffen: "Grundsätzlich nicht — im Zweifel anwaltlich prüfen lassen",
  },
];

const FAQ = [
  {
    q: "Bin ich als Kleinstunternehmen vom BFSG ausgenommen?",
    a: "Bei Dienstleistungen ja, sofern Sie weniger als 10 Beschäftigte UND weniger als 2 Millionen Euro Jahresumsatz haben. Bei Produkten (Hersteller, Importeure, Händler) gibt es diese Ausnahme nicht — dort gilt das BFSG unabhängig von der Unternehmensgröße.",
  },
  {
    q: "Ist mein Online-Shop eine Dienstleistung im Sinne des BFSG?",
    a: "Ja — der Verkauf von Waren an Verbraucher über einen Onlineshop zählt als Dienstleistung im elektronischen Geschäftsverkehr und ist damit grundsätzlich vom BFSG erfasst, sobald Sie über den Kleinstunternehmen-Schwellen liegen. Die Produkte, die Sie verkaufen, müssen zusätzlich von deren Herstellern barrierefrei gestaltet werden.",
  },
  {
    q: "Gilt die Frist bis 28.06.2028 für mich?",
    a: "Die Übergangsfrist betrifft nur bestimmte Altdienstleistungen mit Vertragsverhältnissen von vor dem 28.06.2025 — und sie ist eng auszulegen. Neue Shops, Relaunches und wesentliche Änderungen fallen in der Regel nicht darunter. Im Zweifel: Fachanwalt oder die Beratung der Bundesfachstelle (§ 15 BFSG).",
  },
  {
    q: "Was passiert, wenn ich fälschlich annehme, ausgenommen zu sein?",
    a: "Dann gelten für Sie seit dem 28.06.2025 die vollen Anforderungen — mit den bekannten Risiken: private Abmahnungen (dokumentierte Forderungen bis 2.706,18 €, Stand Februar 2026), Verbandsrechte (§§ 32, 33 BFSG) und Prüfungen der Marktüberwachung. Die Schwellen sollten deshalb sorgfältig geprüft werden — die Fehleinschätzung trägt allein das Unternehmen.",
  },
  {
    q: "Muss ich als ausgenommenes Kleinstunternehmen trotzdem etwas tun?",
    a: "Rechtlich nicht im Hinblick auf das BFSG. Sinnvoll ist Barrierefreiheit trotzdem: Sie verbessert Bedienbarkeit für alle Besucher, und wer über die Schwellen wächst, ist sofort im Anwendungsbereich. Ein kostenloser technischer Check schafft Klarheit ohne Kaufdruck.",
  },
];

export default function BfsgAusnahmenPage() {
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
    headline: "Bin ich vom BFSG ausgenommen? Der ehrliche Selbst-Check",
    description:
      "Kleinstunternehmen-Ausnahme (<10 Mitarbeitende UND <2 Mio. € Umsatz), Dienstleistung vs. Produkt, Übergangsfrist 28.06.2028 — mit Selbst-Check-Tabelle.",
    url: "https://bfsg-fuchs.de/bfsg-ausnahmen",
    inLanguage: "de-DE",
    datePublished: "2026-07-23",
    dateModified: DATE_MODIFIED,
    publisher: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fuchs.de" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG · Anwendungsbereich · Ausnahmen
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Bin ich vom BFSG ausgenommen? Der ehrliche Selbst-Check
          </h1>
          <p className="mt-4 text-base leading-relaxed font-medium">
            Ausgenommen vom BFSG sind Kleinstunternehmen — weniger als 10 Beschäftigte UND weniger
            als 2 Millionen Euro Jahresumsatz —, aber nur bei Dienstleistungen. Wer Produkte
            herstellt, importiert oder in Verkehr bringt, ist unabhängig von der Unternehmensgröße
            im Anwendungsbereich. Für bestimmte Altdienstleistungen gilt zudem eine Übergangsfrist
            bis 28.06.2028.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: {STAND} · Allgemeine Einordnung, keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Wer genau ist vom BFSG ausgenommen?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das BFSG gilt seit dem 28.06.2025 für Produkte und bestimmte Dienstleistungen, die für
            Verbraucher bereitgestellt werden. Die wichtigste Ausnahme betrifft{" "}
            <strong>Kleinstunternehmen bei Dienstleistungen</strong>: Unternehmen mit weniger als 10
            Beschäftigten und weniger als 2 Millionen Euro Jahresumsatz müssen die
            Dienstleistungs-Anforderungen des BFSG nicht erfüllen. Beide Schwellen sind
            UND-verknüpft — schon ein einziges Kriterium darüber (z. B. 9 Beschäftigte, aber 2,4
            Mio. € Umsatz) lässt die Ausnahme entfallen.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Wichtig: Bei <strong>Produkten</strong> gibt es diese Ausnahme nicht. Hersteller,
            Importeure, Bevollmächtigte und Händler erfasster Produkte (etwa Hardware, Software mit
            digitalen Elementen oder E-Book-Dateien) sind unabhängig von der Größe verantwortlich.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was zählt als Dienstleistung — und was als Produkt?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Die Betroffenheits-Logik in einer Tabelle:
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Ihr Angebot</th>
                  <th className="px-3 py-3 text-left font-semibold">Kategorie</th>
                  <th className="px-3 py-3 text-left font-semibold">Betroffen?</th>
                </tr>
              </thead>
              <tbody>
                {SELBSTCHECK.map((row, i) => (
                  <tr key={row.angebot} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">{row.angebot}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.kategorie}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.betroffen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Diese Tabelle ist eine allgemeine Einordnung. Die Abgrenzung im Einzelfall (Mischmodelle,
            Marktplätze, Abos) ist eine Rechtsfrage — bei Unsicherheit hilft das kostenlose
            Beratungsangebot der Bundesfachstelle Barrierefreiheit (§ 15 BFSG) oder ein Fachanwalt.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Gilt die Kleinstunternehmen-Ausnahme automatisch?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Nein — zwei Fallstricke sind häufig. Erstens werden die Schwellen oft falsch gerechnet:
            Teilzeitkräfte zählen anteilig, Aushilfen können mitzählen, und die Umsatzgrenze liegt
            bei 2 Millionen Euro — viele gewachsene Shops liegen längst darüber, ohne es zu merken.
            Zweitens existiert neben der Kleinstunternehmen-Ausnahme die{" "}
            <strong>Unverhältnismäßigkeits-Klausel</strong>: Wer als größeres Unternehmen die
            Anforderungen für unverhältnismäßig belastend hält, muss diese Abwägung selbst nachweisen
            und schriftlich dokumentieren. Die Ausnahme gilt nicht automatisch. Details dazu auf
            unserer Seite zur{" "}
            <Link href="/bfsg-frist" className="text-primary underline underline-offset-2">
              BFSG-Frist
            </Link>
            .
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was bedeutet die Übergangsfrist bis 28.06.2028?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Für bestimmte Altdienstleistungen — Vertragsverhältnisse, die bereits vor dem 28.06.2025
            bestanden — sieht das Gesetz eine Übergangsfrist bis zum 28.06.2028 vor. Diese Frist
            sollte <strong>eng ausgelegt</strong> werden: Sie ist kein pauschales Ruherecht für
            Bestands-Websites. Wer heute einen Shop relauncht, neue Vertragsmodelle einführt oder
            wesentliche Änderungen vornimmt, kann die Frist verkürzen. Zwei Jahre klingen lang — ein
            strukturierter Umsetzungsplan mit Prüfung, Behebung und Dokumentation braucht jedoch
            realistisch Monate.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wenn Sie ausgenommen sind: unsere ehrliche Empfehlung</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Viele unserer Mitbewerber verschweigen diese Ausnahme, weil sie Verkäufe kostet. Wir
            sagen es offen:{" "}
            <strong>
              Wenn Sie ein Kleinstunternehmen mit reiner Dienstleistung sind, brauchen Sie unseren
              Report nicht als Pflicht-Dokumentation — und wir raten Ihnen aktiv davon ab, aus reiner
              Pflichtangst zu kaufen.
            </strong>{" "}
            Der kostenlose Gratis-Check lohnt sich trotzdem: Barrierefreiheit verbessert Nutzbarkeit
            und Conversion unabhängig von jeder Rechtspflicht, und wer an der Schwelle wächst, sollte
            den technischen Zustand kennen, bevor er hineinwächst. Aber eine Kaufentscheidung gehört
            zu den Betroffenen — nicht zu den Ausgenommenen.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">
            Wie prüfe ich meinen technischen Zustand, wenn ich betroffen bin?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Betroffene sollten drei Schritte gehen: <strong>Erstens</strong> technischen Ist-Stand
            ermitteln — der kostenlose Sofort-Check analysiert die Startseite in ca. 60 Sekunden
            gegen über 80 Regeln nach WCAG 2.1 AA / EN 301 549. <strong>Zweitens</strong> Mängel
            priorisiert beheben — der Report (129 € / 399 €) liefert Fix-Hinweise mit Code-Snippets
            und den Entwurf der Barrierefreiheitserklärung. <strong>Drittens</strong> dauerhaft
            dokumentieren — das Re-Check-Abo (24,99 €/Monat) prüft monatlich nach und aktualisiert
            die Erklärung. Alle Angaben verstehen sich als automatisierte technische Analyse mit
            menschlicher Sichtung — keine Rechtsberatung.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Klarheit in 60 Sekunden — mit oder ohne Pflicht</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check von BFSG-Fuchs prüft Ihre Startseite gegen über 80
            WCAG-2.1-AA-Regeln — ohne Anmeldung und ohne Kaufdruck. Sie sehen sofort, ob und wo
            Ihre Website technische Mängel hat.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos prüfen, ob meine Website Mängel hat →
            </Link>
            <Link
              href="/bfsg-frist"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              BFSG-Frist: Zeitleiste und Pflichten
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zu den BFSG-Ausnahmen</h2>
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
              <Link href="/bfsg-frist" className="text-primary underline underline-offset-2">
                BFSG-Frist: Was seit dem 28.06.2025 gilt
              </Link>
            </li>
            <li>
              <Link href="/bfsg-abmahnung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Abmahnung? Forderungen und Rechtslage 2026
              </Link>
            </li>
            <li>
              <Link
                href="/barrierefreiheitserklaerung-muster"
                className="text-primary underline underline-offset-2"
              >
                Barrierefreiheitserklärung: Muster und Pflicht-Inhalte nach § 14 BFSG
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel liefert eine allgemeine, technische
          Einordnung und stellt keine Rechtsberatung dar. Für die Einordnung Ihres Falls:
          Bundesfachstelle Barrierefreiheit (§ 15 BFSG) oder Fachanwalt. Alle Angaben zum Stand{" "}
          {STAND}.
        </aside>
      </article>
    </>
  );
}
