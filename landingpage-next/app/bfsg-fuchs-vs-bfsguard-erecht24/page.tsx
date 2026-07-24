import type { Metadata } from "next";
import Link from "next/link";

// Vergleichsseite (Text: marketing/swarm-2026-07-23/agent-05-seo-aeo.md, ASSET 6).
// Owner-Freigabe G4 vom 24.07.2026 (vorher GELB: namentliche Wettbewerber, § 6 UWG).
// Aufbau exakt wie app/bfsg-software-anbieter-vergleich/page.tsx bzw.
// app/bfsg-abmahnung-kosten/page.tsx (AEO-Template): H1, ≤60-Wörter-Direktantwort,
// Vergleichstabelle nur mit objektiv nachprüfbaren Merkmalen (Preis, Modell, Umfang),
// FAQ sichtbar 1:1 = FAQPage-JSON-LD (Google-Anforderung für FAQ-Rich-Results).
//
// Live-Verifizierung der Fremdangaben am 24.07.2026 (bfsguard.de inkl. /preise,
// e-recht24.de inkl. /premium.html + /barrierefreiheit.html):
// - BFSGuard-Website intern inkonsistent: Preisseite nennt Komplett-Service 990 €
//   und „Auto-Fix für 60–70 % der Verstöße", die Startseite einen Rundum-Service
//   für 499 € — Tabelle folgt der Preisseite, Fußnote weist darauf hin.
// - eRecht24: kein 39-€-Tarif mehr ermittelt (Basic 30 €/Monat, 15 € bei
//   Jahreszahlung) → Preisangabe korrigiert.
// HINWEIS Refresh-Pflicht: Preise/Umfänge der Wettbewerber ändern sich jederzeit —
// bei Änderungen STAND + dateModified aktualisieren (siehe ASSET-6-Pflegelast).
export const metadata: Metadata = {
  title: "BFSG-Fuchs vs. BFSGuard vs. eRecht24: Vergleich 2026",
  description:
    "BFSG-Scanner im Vergleich: BFSG-Fuchs, BFSGuard und eRecht24 — Preise, Prüf-Ansatz, Report-Form und menschliche Sichtung sachlich gegenübergestellt. Stand: Juli 2026.",
  alternates: {
    canonical: "/bfsg-fuchs-vs-bfsguard-erecht24",
  },
  openGraph: {
    title: "BFSG-Fuchs vs. BFSGuard vs. eRecht24: Vergleich 2026",
    description:
      "Drei deutsche Barrierefreiheits-Angebote im sachlichen Vergleich — nur objektiv nachprüfbare Merkmale: Preise, Prüf-Ansatz, Report-Form, menschliche Sichtung.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/bfsg-fuchs-vs-bfsguard-erecht24",
    type: "article",
  },
};

// Sichtbarer „Zuletzt aktualisiert"-Stempel (Freshness = Zitier-Signal, ASSET 2 Regel 6).
const STAND = "24. Juli 2026";
const STAND_KURZ = "24.07.2026";
const DATE_PUBLISHED = "2026-07-24";
const DATE_MODIFIED = "2026-07-24";

type Vergleichszeile = {
  merkmal: string;
  fuchs: string;
  bfsguard: string;
  erecht24: string;
};

// Ausschließlich objektiv nachprüfbare Merkmale aus den öffentlichen Anbieter-Websites
// (§ 6 UWG: vergleichende Werbung ohne Werturteile; Schwächen als fehlende Merkmale,
// nicht als Kritik formuliert — Rechtsbegründung in ASSET 6).
const VERGLEICH: Vergleichszeile[] = [
  {
    merkmal: "Kostenloser Einstieg",
    fuchs: "Sofort-Check der Startseite, ca. 60 Sek., ohne Anmeldung",
    bfsguard: "Kostenloser Scan (1 Seite)",
    erecht24: "Kostenloser Check + Scanner (Detailreport nach E-Mail-Angabe)",
  },
  {
    merkmal: "Preismodell",
    fuchs: "Einmalkauf 129 € / 399 €; optionales Re-Check-Abo 24,99 €/Monat oder 249 €/Jahr",
    bfsguard:
      "Abo: Starter 19,99 €/Monat, Business 69 €/Monat; Komplett-Service 990 € einmalig (laut Preisseite)",
    erecht24:
      "Premium-Abo: Basic 30 €/Monat (15 €/Monat bei Jahreszahlung), Business 80 €/Monat (40 €/Monat bei Jahreszahlung), weitere Tarife verfügbar",
  },
  {
    merkmal: "Ansatz",
    fuchs:
      "Automatisierte technische Analyse (axe-core, 80+ Regeln, WCAG 2.1 AA / EN 301 549) + menschliche Sichtung vor Auslieferung",
    bfsguard:
      "Monitoring-Abo mit Auto-Fix-Widget (Anpassungen zur Laufzeit per Skript); Prüf-Basis laut Anbieter WCAG 2.2",
    erecht24:
      "Scan-Ergebnis als Detailreport nach E-Mail-Angabe (WCAG-orientiert); Teil eines breiteren Rechts-Portals",
  },
  {
    merkmal: "Report-Form",
    fuchs:
      "Priorisierter PDF-Report mit Fix-Hinweisen (Code-Snippets) + Entwurf Barrierefreiheitserklärung",
    bfsguard: "Report + Widget-basierte Auto-Korrekturen; PDF-Checker ab Starter-Plan (5/Monat)",
    erecht24:
      "Detailreport (Kategorien: Fehler/Hinweise/Features); keine Zuordnung zu BFSG-Paragraphen dokumentiert (Stand 24.07.2026)",
  },
  {
    merkmal: "Menschliche Sichtung",
    fuchs: "Ja, vor jeder Auslieferung",
    bfsguard: "Keine Angabe auf der Website ermittelt",
    erecht24: "Keine Angabe auf der Website ermittelt",
  },
  {
    merkmal: "Aussage zur Scanner-Grenze (30–50 %)",
    fuchs: "Explizit auf Website und im Report",
    bfsguard: "„Auto-Fix für 60–70 % der Verstöße“ (Anbieter-Angabe Preisseite)",
    erecht24: "Keine Angabe ermittelt",
  },
  {
    merkmal: "Cookie-/TDDDG-Prüfung",
    fuchs: "Ja, separater Check (39 € / 69 €, § 25 TDDDG)",
    bfsguard: "Keine Angabe ermittelt",
    erecht24:
      "Kein separater Cookie-/TDDDG-Check ermittelt; Cookie-Consent-Tool (Banner-Generator) im Abo enthalten",
  },
  {
    merkmal: "Hosting / Datenschutz",
    fuchs: "Deutschland (Hetzner, Nürnberg)",
    bfsguard: "Deutschland (Anbieter-Angabe)",
    erecht24: "Deutschland (Anbieter-Angabe)",
  },
  {
    merkmal: "Ansprechpartner",
    fuchs: "Gründer mit Namen und Gesicht; Presse-Zitat it-management.today (Juli 2026)",
    bfsguard: "Kein benannter Gründer-Kontakt auf der Website ermittelt",
    erecht24: "Portal mit namentlich bekanntem Gesicht (RA Sören Siebert); Support über Portal-Team",
  },
  {
    merkmal: "Kündbarkeit",
    fuchs: "Einmalkauf; Abo jederzeit zum Monatsende (Jahres-Abo: nach 12 Monaten)",
    bfsguard: "Monatlich kündbar; 14 Tage Geld-zurück",
    erecht24: "Monats- oder Jahreszahlung wählbar; Konditionen laut Portal",
  },
];

const FAQ = [
  {
    q: "Ist dieser Vergleich aktuell?",
    a: "Alle Angaben wurden am 24.07.2026 den öffentlichen Websites der Anbieter entnommen. Preise und Leistungsumfänge können sich jederzeit ändern; maßgeblich sind die aktuellen Angaben des jeweiligen Anbieters. Alle Angaben ohne Gewähr.",
  },
  {
    q: "Warum steht bei einzelnen Merkmalen „keine Angabe ermittelt“?",
    a: "Weil auf der öffentlichen Website des Anbieters zum Stichtag keine Information dazu auffindbar war. Das bedeutet nicht, dass die Leistung fehlt — nur, dass sie öffentlich nicht dokumentiert ist.",
  },
  {
    q: "Ist ein Auto-Fix-Widget besser als ein Report?",
    a: "Es beantwortet eine andere Frage: Ein Widget passt Darstellung zur Laufzeit an, ein Report dokumentiert den Ist-Zustand als Grundlage für Behebung im Quellcode. In der Fachwelt ist der Widget-Ansatz umstritten, weil strukturelle Mängel nicht vollständig behoben werden; pauschale Urteile in beide Richtungen sind nicht seriös — prüfen Sie im Einzelfall.",
  },
  {
    q: "Warum verspricht BFSG-Fuchs keine vollständige Abdeckung?",
    a: "Weil automatisierte Prüfungen technisch nur etwa 30–50 % der WCAG-Kriterien zuverlässig erkennen — bei jedem Anbieter. Wir formulieren unser Ergebnis als automatisierte technische Analyse mit menschlicher Sichtung und empfehlen, Zusicherungen jedes Anbieters an dieser Realität zu messen.",
  },
];

export default function BfsgFuchsVsBfsguardErecht24Page() {
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
    headline: "BFSG-Fuchs vs. BFSGuard vs. eRecht24: drei deutsche Barrierefreiheits-Angebote im Vergleich",
    description:
      "Sachlicher Vergleich von Preis, Modell, Prüf-Ansatz und Report-Form dreier deutscher BFSG-Scan-Angebote — nur objektiv nachprüfbare Merkmale. Stand: 24.07.2026.",
    url: "https://bfsg-fuchs.de/bfsg-fuchs-vs-bfsguard-erecht24",
    inLanguage: "de-DE",
    datePublished: DATE_PUBLISHED,
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
            BFSG · Anbieter-Vergleich · Stand {STAND_KURZ}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            BFSG-Fuchs vs. BFSGuard vs. eRecht24: drei deutsche Barrierefreiheits-Angebote im Vergleich
          </h1>
          <p className="mt-4 text-base leading-relaxed font-medium">
            Die drei Anbieter verfolgen unterschiedliche Modelle: BFSG-Fuchs verkauft kuratierte
            Einmal-Reports (129 € / 399 €) mit menschlicher Sichtung, BFSGuard ein Monitoring-Abo
            mit Auto-Fix-Widget (ab 19,99 €/Monat), eRecht24 einen kostenlosen Scan als Einstieg in
            sein Premium-Abo (ab 30 €/Monat). Dieser Vergleich stellt ausschließlich objektiv
            nachprüfbare Merkmale gegenüber — ohne Wertung.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: {STAND} · Alle Fremdangaben von den öffentlichen
            Anbieter-Websites · Ohne Gewähr · Keine Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Vergleichstabelle (Stand: {STAND_KURZ})</h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Merkmal</th>
                  <th className="px-3 py-3 text-left font-semibold">BFSG-Fuchs (dieses Angebot)</th>
                  <th className="px-3 py-3 text-left font-semibold">BFSGuard</th>
                  <th className="px-3 py-3 text-left font-semibold">eRecht24</th>
                </tr>
              </thead>
              <tbody>
                {VERGLEICH.map((row, i) => (
                  <tr key={row.merkmal} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">{row.merkmal}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.fuchs}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.bfsguard}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.erecht24}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            „Keine Angabe ermittelt“ bedeutet: Auf der öffentlichen Website des Anbieters war zum
            Stichtag {STAND_KURZ} keine Information zu diesem Merkmal auffindbar — nicht, dass die
            Leistung fehlt. Anbieter können Preise und Umfänge jederzeit ändern; maßgeblich sind
            die aktuellen Angaben des jeweiligen Anbieters. Quelle je Zeile: Anbieter-Websites
            bfsg-fuchs.de, bfsguard.de, erecht24.de (Abruf {STAND_KURZ}).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Hinweis zu BFSGuard: Die Anbieter-Website war zum Stichtag intern nicht einheitlich —
            die Preisseite (bfsguard.de/preise) nennt den Komplett-Service 990 € einmalig und
            „Auto-Fix für 60–70 % der Verstöße“, die Startseite einen „Rundum-Service“ für
            499 € einmalig. Diese Tabelle gibt die Angaben der Preisseite wieder.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wie ordne ich die drei Modelle ein?</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Einmal-Report mit Sichtung (BFSG-Fuchs):</strong> passt zu Betreibern, die
              eine datierte Bestandsaufnahme mit priorisiertem Fix-Plan wollen und die Umsetzung
              selbst oder mit ihrer Agentur stemmen.
            </li>
            <li>
              <strong>Monitoring-Abo mit Widget (BFSGuard):</strong> passt zu Betreibern, die
              laufende Kontrolle und automatisierte Anpassungen zur Laufzeit suchen. Zur Einordnung
              des Widget-Ansatzes: Overlay-/Auto-Fix-Mechaniken sind in der Fachwelt umstritten,
              weil sie strukturelle Mängel im Quellcode nicht vollständig beheben; der Anbieter
              selbst weist seine Abdeckung mit „60–70 %“ aus. Ob das zum eigenen Risikoprofil
              passt, ist eine Einzelfallfrage.
            </li>
            <li>
              <strong>Portal-Abo (eRecht24):</strong> passt zu Betreibern, die ohnehin die
              Rechts-Texte-Generatoren des Portals nutzen und den Scan als Zusatz mitverwenden
              wollen.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was alle drei Anbieter gemeinsam haben</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Kein automatisiertes Werkzeug — bei keinem der drei Anbieter — prüft die vollständigen
            WCAG-Kriterien: Automatisierte Verfahren erkennen zuverlässig etwa 30–50 % der
            prüfbaren Punkte (Branchen-Konsens, Stand Juli 2026), und keine technische Analyse
            ersetzt eine Rechtsberatung. Unsere vollständige Marktübersicht mit fünf Anbietern
            steht unter{" "}
            <Link href="/bfsg-software-anbieter-vergleich" className="text-primary underline underline-offset-2">
              BFSG-Software-Anbieter im Vergleich
            </Link>
            .
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Erst kostenlos prüfen, dann vergleichen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check von BFSG-Fuchs prüft Ihre Startseite in ca. 60 Sekunden
            gegen über 80 WCAG-2.1-AA-Regeln — ohne Anmeldung. So sehen Sie vor jeder
            Kaufentscheidung, wo Ihre Website steht.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlosen Sofort-Check starten →
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
          <h2 className="text-2xl font-semibold">Häufige Fragen zum Vergleich</h2>
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
              <Link href="/bfsg-software-anbieter-vergleich" className="text-primary underline underline-offset-2">
                BFSG-Software-Anbieter im Vergleich: 5 Anbieter im Überblick
              </Link>
            </li>
            <li>
              <Link href="/bfsg-pruefung-kosten" className="text-primary underline underline-offset-2">
                Was kostet eine BFSG-Prüfung? Marktpreise 2026
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> BFSG-Fuchs ist Anbieter eines der verglichenen
          Produkte. Dieser Vergleich erhebt keinen Anspruch auf Vollständigkeit und wertet nicht;
          er listet öffentlich dokumentierte Merkmale zum Stichtag {STAND_KURZ} (Quelle: jeweilige
          Anbieter-Website). Preise und Leistungsumfang können sich jederzeit ändern; maßgeblich
          sind allein die aktuellen Angaben des jeweiligen Anbieters. Alle Angaben ohne Gewähr.
          Dieser Artikel liefert eine technische Einordnung und stellt keine Rechtsberatung dar;
          bei rechtlichen Fragen konsultieren Sie einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
