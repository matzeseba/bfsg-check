import type { Metadata } from "next";
import Link from "next/link";

import { PACKAGES } from "@/lib/config";

// Praxis-Report-Download-Seite (Ziel der Pressemitteilung marketing/swarm-2026-07-23/
// pm-02-final.md — ersetzt dort den Platzhalter [report-slug]). Daten-SSOT:
// marketing/swarm-2026-07-23/moat-daten/aggregat-2026-07-24.json (n = 411 deduplizierte
// Scans, 23.–24.07.2026, axe-core 4.10.1, nur Startseiten). Eine 1:1-Kopie liegt als
// öffentlicher Download unter public/downloads/bfsg-praxis-report-2026-daten.json,
// die CSV-Variante ist daraus generiert. Aufbau folgt dem Answer-First-Template der
// AEO-Seiten (vgl. app/bfsg-abmahnung-kosten/page.tsx): FAQ sichtbar 1:1 = FAQPage-JSON-LD.
export const metadata: Metadata = {
  title: "BFSG-Praxis-Report 2026: Auswertung von 411 Websites (Download)",
  description:
    "Automatisierte technische Analyse von 411 deutschen Website-Startseiten nach WCAG 2.1 AA: 93,2 % mit mindestens einem Befund, Median 5 Befunde pro Seite. Alle Aggregatdaten kostenlos als JSON/CSV.",
  alternates: {
    canonical: "/bfsg-praxis-report-2026",
  },
  openGraph: {
    title: "BFSG-Praxis-Report 2026: Auswertung von 411 Websites",
    description:
      "93,2 % der untersuchten Startseiten mit mindestens einem automatisiert feststellbaren Befund — alle Aggregatdaten kostenlos zum Download, Methodik offengelegt.",
    // relativ — Next resolved gegen metadataBase (SITE.url = bfsg-fuchs.de)
    url: "/bfsg-praxis-report-2026",
    type: "article",
  },
};

// Sichtbarer „Zuletzt aktualisiert"-Stempel + dateModified (Freshness-Signal).
const STAND = "24. Juli 2026";
const DATE_MODIFIED = "2026-07-24";

// Basis-Preis aus der Inhalts-SSOT (lib/config.ts → PACKAGES) — NICHT hartcodieren,
// damit Preis-PRs nur eine Stelle anfassen (Preis-Sync-CI: scripts/check-price-sync.mjs).
const BASIS_PREIS = PACKAGES.find((p) => p.id === "basis")?.price ?? "129 €";

// Alle Werte exakt aus aggregat-2026-07-24.json übernommen (keine Rundung, keine
// Hochrechnung). Zusatz-Kennzahlen 93,2 % / Median 5 Befunde: in der PM verifizierte
// Werte (X2/X3, s. Kopf von pm-02-final.md).
const KENNZAHLEN = {
  n: 411,
  zeitraum: "23.–24. Juli 2026",
  pctMitBefund: 93.2,
  medianBefunde: 5,
  pctKritisch: 45.7,
};

type TopBefund = { label: string; seiten: number; prozent: number };

const TOP_BEFUNDE_GESAMT: TopBefund[] = [
  { label: "Zu geringer Farbkontrast", seiten: 186, prozent: 45 },
  { label: "Links ohne erkennbaren Text", seiten: 99, prozent: 24 },
  { label: "Bilder ohne Alternativtext", seiten: 87, prozent: 21 },
  { label: "Schaltflächen ohne Beschriftung", seiten: 69, prozent: 17 },
  { label: "Inhalte außerhalb von Landmarks", seiten: 68, prozent: 17 },
];

type Sektor = {
  name: string;
  n: number;
  scoreMedian: number;
  scoreMean: number;
  pctKritisch: number;
  topBefunde: TopBefund[];
};

const SEKTOREN: Sektor[] = [
  {
    name: "Online-Shops (8 Kategorien)",
    n: 172,
    scoreMedian: 36.5,
    scoreMean: 42.4,
    pctKritisch: 49.4,
    topBefunde: [
      { label: "Zu geringer Farbkontrast", seiten: 92, prozent: 53 },
      { label: "Links ohne erkennbaren Text", seiten: 58, prozent: 34 },
      { label: "Bilder ohne Alternativtext", seiten: 44, prozent: 26 },
      { label: "Zoom unterdrückt (Viewport)", seiten: 26, prozent: 15 },
      { label: "Schaltflächen ohne Beschriftung", seiten: 26, prozent: 15 },
    ],
  },
  {
    name: "Reise/Buchung",
    n: 123,
    scoreMedian: 43,
    scoreMean: 46.5,
    pctKritisch: 48,
    topBefunde: [
      { label: "Zu geringer Farbkontrast", seiten: 57, prozent: 46 },
      { label: "Schaltflächen ohne Beschriftung", seiten: 29, prozent: 24 },
      { label: "Bilder ohne Alternativtext", seiten: 27, prozent: 22 },
      { label: "Links ohne erkennbaren Text", seiten: 22, prozent: 18 },
      { label: "Inhalte außerhalb von Landmarks", seiten: 19, prozent: 15 },
    ],
  },
  {
    name: "Kommunen/ÖD",
    n: 116,
    scoreMedian: 61.5,
    scoreMean: 59.7,
    pctKritisch: 37.9,
    topBefunde: [
      { label: "Zu geringer Farbkontrast", seiten: 37, prozent: 32 },
      { label: "Inhalte außerhalb von Landmarks", seiten: 25, prozent: 22 },
      { label: "Links ohne erkennbaren Text", seiten: 19, prozent: 16 },
      { label: "Bilder ohne Alternativtext", seiten: 16, prozent: 14 },
      { label: "Schaltflächen ohne Beschriftung", seiten: 14, prozent: 12 },
    ],
  },
];

type ShopKategorie = {
  name: string;
  n: number;
  scoreMedian: number;
  pctKritisch: number;
};

// Anzeigenamen: wo die PM (pm-02-final.md) Kategorienamen nennt, werden diese
// übernommen (Garten, Sport/Outdoor, Schmuck/Uhren, Drogerie/Kosmetik); die übrigen
// sind die kapitalisierten Daten-Schlüssel aus dem Aggregat.
const SHOP_KATEGORIEN: ShopKategorie[] = [
  { name: "Garten", n: 43, scoreMedian: 41, pctKritisch: 48.8 },
  { name: "Sport/Outdoor", n: 40, scoreMedian: 30, pctKritisch: 50 },
  { name: "Schmuck/Uhren", n: 19, scoreMedian: 30, pctKritisch: 57.9 },
  { name: "Geschenke", n: 17, scoreMedian: 38, pctKritisch: 52.9 },
  { name: "Tier", n: 11, scoreMedian: 43, pctKritisch: 27.3 },
  { name: "Baumarkt", n: 10, scoreMedian: 40.5, pctKritisch: 60 },
  { name: "Drogerie/Kosmetik", n: 19, scoreMedian: 51, pctKritisch: 42.1 },
  { name: "Spielwaren", n: 13, scoreMedian: 37, pctKritisch: 53.8 },
];

const FAQ = [
  {
    q: "Ist der BFSG-Praxis-Report 2026 kostenlos?",
    a: "Ja. Alle Aggregatdaten stehen als JSON- und CSV-Datei kostenlos und ohne Registrierung zum Download bereit. Sie dürfen die Daten unter Quellenangabe weiterverwenden: „BFSG-Praxis-Report 2026, BFSG-Fuchs (bfsg-fuchs.de), Stand 24.07.2026“.",
  },
  {
    q: "Sind die Ergebnisse repräsentativ für alle deutschen Websites?",
    a: "Nein. Die Auswahl ist keine Zufallsstichprobe: Online-Shops stammen aus dem Trusted-Shops-Verzeichnis, Kommunen und öffentliche Einrichtungen über Wikidata P856 und das Verzeichnis german-gov-domains, Reise- und Buchungsportale über Trusted-Shops, Wikidata P856 und die Wikipedia-Kategorie Touristikunternehmen. Die Werte beschreiben die untersuchte Stichprobe von 411 Startseiten — nicht den Gesamtmarkt.",
  },
  {
    q: "Warum liegt die tatsächliche Verbreitung der Befunde über den Prozentwerten?",
    a: "Die Prozentwerte geben an, bei wie vielen Seiten ein Befund unter den drei häufigsten Befunden dieser Seite auftauchte. Befunde, die auf einer Seite zwar vorkommen, aber nicht zu deren drei häufigsten zählen, gehen nicht in die Prozentwerte ein — die tatsächliche Verbreitung liegt daher höher.",
  },
  {
    q: "Ersetzt die automatisierte Analyse eine manuelle Prüfung?",
    a: "Nein. Nach Einschätzung des Government Digital Service finden automatisierte Werkzeuge nur etwa 30–50 % der WCAG-Prüfschritte zuverlässig. Der Report ist eine automatisierte technische Analyse und dokumentiert den automatisierbar prüfbaren Teil — eine manuelle Prüfung bleibt notwendig, und der Report ersetzt keine Rechtsberatung.",
  },
  {
    q: "Was bedeutet der Score von 0 bis 100?",
    a: "Der Score ist ein technischer Wert des Scanners: Er startet bei 100 (kein automatisierter Befund) und sinkt mit Anzahl und Schwere der gefundenen Befunde. Ein Median von 45 bedeutet also: Die Hälfte der untersuchten Seiten lag bei 45 Punkten oder darunter. Der Score sagt nichts darüber aus, wie eine manuelle Prüfung die Seite bewerten würde.",
  },
];

// Deutsche Zahlenformatierung (Komma-Dezimalstelle), serverseitig beim Build gerendert.
const de = (v: number) => v.toLocaleString("de-DE", { maximumFractionDigits: 1 });

export default function BfsgPraxisReport2026Page() {
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
    headline: "BFSG-Praxis-Report 2026: Auswertung von 411 deutschen Website-Startseiten",
    description:
      "Automatisierte technische Analyse von 411 deutschen Website-Startseiten nach WCAG 2.1 AA: Kennzahlen, Top-Befunde, Sektoren und Methodik — mit kostenlosem Daten-Download.",
    url: "https://bfsg-fuchs.de/bfsg-praxis-report-2026",
    inLanguage: "de-DE",
    datePublished: "2026-07-24",
    dateModified: DATE_MODIFIED,
    publisher: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fuchs.de" },
  };

  // Dataset-Schema für die offenen Aggregatdaten (Download ohne Registrierung).
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "BFSG-Praxis-Report 2026 — Aggregatdaten",
    description:
      "Aggregierte Ergebnisse automatisierter WCAG-2.1-AA-Analysen von 411 deutschen Website-Startseiten (23.–24.07.2026, axe-core 4.10.1). Weiterverwendung unter Quellenangabe.",
    url: "https://bfsg-fuchs.de/bfsg-praxis-report-2026",
    inLanguage: "de-DE",
    datePublished: "2026-07-24",
    dateModified: DATE_MODIFIED,
    creator: { "@type": "Organization", name: "BFSG-Fuchs", url: "https://bfsg-fuchs.de" },
    license: "https://bfsg-fuchs.de/bfsg-praxis-report-2026",
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: "https://bfsg-fuchs.de/downloads/bfsg-praxis-report-2026-daten.json",
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: "https://bfsg-fuchs.de/downloads/bfsg-praxis-report-2026-daten.csv",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            BFSG-Praxis-Report 2026 · Auswertung n = 411 · 23.–24. Juli 2026
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            BFSG-Praxis-Report 2026: So viele deutsche Websites zeigen automatisiert
            feststellbare WCAG-Befunde
          </h1>
          <p className="mt-4 text-base leading-relaxed font-medium">
            Der BFSG-Praxis-Report 2026 wertet 411 deutsche Website-Startseiten aus — 172
            Online-Shops in acht Kategorien, 123 Reise- und Buchungsportale sowie 116
            Kommunen und öffentliche Einrichtungen. Geprüft wurde am 23. und 24. Juli 2026
            automatisiert mit axe-core 4.10.1 gegen die Kriterien der WCAG 2.1 AA. Das
            Ergebnis: 93,2 % der Seiten weisen mindestens einen automatisiert
            feststellbaren Befund auf, im Median sind es 5 Befunde pro Seite. Alle
            Aggregatdaten stehen auf dieser Seite kostenlos und ohne Registrierung zum
            Download.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Zuletzt aktualisiert: {STAND} · Automatisierte technische Analyse, keine
            Rechtsberatung
          </p>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Die wichtigsten Kennzahlen im Überblick</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card/60 px-4 py-5 text-center">
              <p className="text-2xl font-semibold">{KENNZAHLEN.n}</p>
              <p className="mt-1 text-xs text-muted-foreground">geprüfte Startseiten (dedupliziert)</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 px-4 py-5 text-center">
              <p className="text-2xl font-semibold">{de(KENNZAHLEN.pctMitBefund)} %</p>
              <p className="mt-1 text-xs text-muted-foreground">mit mindestens 1 Befund</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 px-4 py-5 text-center">
              <p className="text-2xl font-semibold">{KENNZAHLEN.medianBefunde}</p>
              <p className="mt-1 text-xs text-muted-foreground">Befunde pro Seite (Median)</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 px-4 py-5 text-center">
              <p className="text-2xl font-semibold">{de(KENNZAHLEN.pctKritisch)} %</p>
              <p className="mt-1 text-xs text-muted-foreground">mit kritischem Befund</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            „Kritisch“ bezeichnet Befunde der höchsten axe-core-Schweregrade — also Mängel,
            die betroffene Nutzerinnen und Nutzer an zentralen Schritten ernsthaft blockieren
            können. Wie die Werte gezählt werden und wo die Grenzen der Auswertung liegen,
            steht im Abschnitt{" "}
            <a href="#methodik" className="text-primary underline underline-offset-2">
              Methodik und Grenzen
            </a>
            .
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Alle Aggregatdaten kostenlos herunterladen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der vollständige Datensatz steht — wie in der Pressemitteilung angekündigt —
            kostenlos und ohne Registrierung bereit: als JSON mit allen Kennzahlen,
            Sektoren, Shop-Kategorien und Top-Befunden sowie als CSV mit den flachen
            Kennzahlen je Bereich (Dezimalpunkt-Notation).
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/downloads/bfsg-praxis-report-2026-daten.json"
              download
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Aggregatdaten herunterladen (JSON) ↓
            </a>
            <a
              href="/downloads/bfsg-praxis-report-2026-daten.csv"
              download
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Kennzahlen-Tabelle (CSV) ↓
            </a>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Weiterverwendung unter Quellenangabe: BFSG-Praxis-Report 2026, BFSG-Fuchs
            (bfsg-fuchs.de), Stand 24.07.2026.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Welche Befunde treten am häufigsten auf?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Über alle 411 Startseiten hinweg dominieren fünf Befund-Typen. Angeführt wird
            die Auswertung von zu geringem Farbkontrast — ein Muster, das auf 45 % der
            Seiten zu den drei häufigsten Befunden zählte:
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Befund</th>
                  <th className="px-3 py-3 text-right font-semibold">Seiten</th>
                  <th className="px-3 py-3 text-right font-semibold">Anteil</th>
                </tr>
              </thead>
              <tbody>
                {TOP_BEFUNDE_GESAMT.map((b, i) => (
                  <tr key={b.label} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">{b.label}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{b.seiten}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{b.prozent} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wie schneiden die drei Bereiche ab?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Der Score (0–100) gewichtet Anzahl und Schwere der automatisiert gefundenen
            Befunde: 100 bedeutet kein automatisierter Befund, niedrigere Werte bedeuten
            mehr oder schwerere Befunde. Kommunen und öffentliche Einrichtungen liegen im
            Median deutlich über den beiden Wirtschaftsbereichen — sie zeigen auch den
            geringsten Anteil an Seiten mit kritischem Befund:
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Bereich</th>
                  <th className="px-3 py-3 text-right font-semibold">Seiten (n)</th>
                  <th className="px-3 py-3 text-right font-semibold">Score-Median</th>
                  <th className="px-3 py-3 text-right font-semibold">Score-Mittelwert</th>
                  <th className="px-3 py-3 text-right font-semibold">mit kritischem Befund</th>
                </tr>
              </thead>
              <tbody>
                {SEKTOREN.map((s, i) => (
                  <tr key={s.name} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{s.n}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{de(s.scoreMedian)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{de(s.scoreMean)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{de(s.pctKritisch)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">
            Welche Befunde dominieren in den einzelnen Bereichen?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Zu geringer Farbkontrast ist in allen drei Bereichen der häufigste Befund —
            danach unterscheiden sich die Muster deutlich:
          </p>
          <div className="mt-6 space-y-6">
            {SEKTOREN.map((s) => (
              <div key={s.name}>
                <h3 className="text-base font-semibold">
                  {s.name} <span className="font-normal text-muted-foreground">(n = {s.n})</span>
                </h3>
                <div className="mt-2 overflow-x-auto rounded-xl border border-border">
                  <table className="min-w-full text-xs">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Befund</th>
                        <th className="px-3 py-2 text-right font-semibold">Seiten</th>
                        <th className="px-3 py-2 text-right font-semibold">Anteil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.topBefunde.map((b, i) => (
                        <tr key={b.label} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-3 py-2 font-medium">{b.label}</td>
                          <td className="px-3 py-2 text-right text-muted-foreground">{b.seiten}</td>
                          <td className="px-3 py-2 text-right text-muted-foreground">{b.prozent} %</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wie unterscheiden sich die acht Shop-Kategorien?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Innerhalb der 172 Online-Shops liegen die Kategorien teils weit auseinander —
            der Anteil der Seiten mit kritischem Befund reicht von 27,3 % (Tier) bis
            60 % (Baumarkt). Bei kleinen Stichproben (n = 10 bis 43) schwanken die Werte
            jedoch stärker; sie sind als Orientierung, nicht als Rangfolge zu lesen:
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Shop-Kategorie</th>
                  <th className="px-3 py-3 text-right font-semibold">Seiten (n)</th>
                  <th className="px-3 py-3 text-right font-semibold">Score-Median</th>
                  <th className="px-3 py-3 text-right font-semibold">mit kritischem Befund</th>
                </tr>
              </thead>
              <tbody>
                {SHOP_KATEGORIEN.map((k, i) => (
                  <tr key={k.name} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">{k.name}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{k.n}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{de(k.scoreMedian)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{de(k.pctKritisch)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14" id="methodik">
          <h2 className="text-2xl font-semibold">
            Wie wurde gemessen — und wo liegen die Grenzen der Auswertung?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Der Report ist eine automatisierte technische Analyse. Damit die Zahlen
            eingeordnet werden können, legen wir Methodik und Grenzen vollständig offen:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Messwerkzeug und Zeitraum:</strong> axe-core 4.10.1
              (@axe-core/playwright) in Playwright/Chromium, Scans am 23. und 24. Juli 2026,
              411 nach Domain deduplizierte Startseiten.
            </li>
            <li>
              <strong>Nur Startseiten:</strong> Geprüft wurde ausschließlich die jeweilige
              Startseite. Unterseiten (etwa Checkout, Formulare oder Suchergebnisse) sind
              nicht Teil der Auswertung — Mängel dort erscheinen in diesen Zahlen nicht.
            </li>
            <li>
              <strong>Keine Zufallsstichprobe:</strong> Online-Shops stammen aus dem
              Trusted-Shops-Verzeichnis, Kommunen und öffentliche Einrichtungen über
              Wikidata P856 und das Verzeichnis german-gov-domains, Reise- und
              Buchungsportale über Trusted-Shops, Wikidata P856 und die Wikipedia-Kategorie
              Touristikunternehmen. Die Ergebnisse beschreiben diese Stichprobe und lassen
              sich nicht auf alle deutschen Websites verallgemeinern.
            </li>
            <li>
              <strong>Prozentwerte = Top-3-Anteil:</strong> Die Prozentwerte bei den
              Befunden geben den Anteil der Seiten an, bei denen der Befund unter den drei
              häufigsten Befunden dieser Seite auftauchte. Die tatsächliche Verbreitung
              liegt höher.
            </li>
            <li>
              <strong>Automatisierte Tests sind eine Teilprüfung:</strong> Nach Einschätzung
              des Government Digital Service finden automatisierte Werkzeuge nur etwa
              30–50 % der WCAG-Prüfschritte (Quelle:
              design.sis.gov.uk/accessibility/testing/automated-testing/). Eine manuelle
              Prüfung bleibt notwendig — der Report ersetzt sie nicht.
            </li>
            <li>
              <strong>Score (0–100):</strong> Technischer Wert des Scanners aus Anzahl und
              Schwere der Befunde; 100 bedeutet kein automatisierter Befund. Der Score ist
              ein Ordnungsmaß innerhalb dieser Auswertung, keine Bewertung nach einer
              manuellen Prüfung.
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Wo steht Ihre eigene Website?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check von BFSG-Fuchs prüft Ihre Startseite in ca. 60
            Sekunden mit demselben WCAG-2.1-AA-Audit wie in dieser Auswertung — ohne
            Anmeldung. Wer die Ergebnisse dokumentiert braucht, erhält den vollständigen
            Report mit priorisiertem Fix-Plan und Entwurf der Barrierefreiheitserklärung
            als Basis-Report ab {BASIS_PREIS} (einmalig).
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlosen Check starten →
            </Link>
            <Link
              href="/wcag-scanner-vs-audit"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Scanner vs. manuelles Audit: Was findet was?
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zum BFSG-Praxis-Report 2026</h2>
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
              <Link href="/bfsg-checkliste-online-shop" className="text-primary underline underline-offset-2">
                BFSG-Checkliste für Online-Shops: die häufigsten Mängel beheben
              </Link>
            </li>
            <li>
              <Link href="/wcag-scanner-vs-audit" className="text-primary underline underline-offset-2">
                WCAG-Scanner vs. manuelles Audit: Was findet was?
              </Link>
            </li>
            <li>
              <Link href="/mlbf-pruefstrategie" className="text-primary underline underline-offset-2">
                MLBF-Prüfstrategie 2026: Wird meine Website kontrolliert?
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheit-testen" className="text-primary underline underline-offset-2">
                Barrierefreiheit testen: Werkzeuge und Vorgehen im Überblick
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Der BFSG-Praxis-Report 2026 ist eine
          automatisierte technische Analyse und keine Rechtsberatung. Die Auswertung
          beschreibt den automatisierbar prüfbaren Zustand von 411 Startseiten zum
          Zeitpunkt der Scans (23.–24. Juli 2026); sie ersetzt weder eine manuelle Prüfung
          der eigenen Website noch eine rechtliche Bewertung. Alle Angaben zum Stand{" "}
          {STAND}.
        </aside>
      </article>
    </>
  );
}
