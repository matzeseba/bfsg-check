import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WCAG 2.1 vs. 2.2: Die 9 neuen Kriterien einfach erklärt",
  description:
    "Was hat sich von WCAG 2.1 zu 2.2 geändert? Die 9 neuen Erfolgskriterien erklärt, welche das BFSG fordert und wie Sie migrieren.",
  alternates: {
    canonical: "/wcag-2-1-vs-2-2",
  },
  openGraph: {
    title: "WCAG 2.1 vs. WCAG 2.2 — Die 9 neuen Kriterien für Shop-Betreiber",
    description:
      "Übersicht der 9 neuen WCAG-2.2-Erfolgskriterien, welche das BFSG fordert und was Entwickler jetzt tun sollten.",
    url: "https://barrierefrei-pruefen.de/wcag-2-1-vs-2-2",
    type: "article",
  },
};

const NEUE_KRITERIEN = [
  {
    sc: "2.4.11",
    titel: "Focus Not Obscured (Minimum) — Stufe AA",
    erklaerung:
      "Ein per Tastatur fokussiertes Element darf nicht vollständig von anderen Inhalten verdeckt sein — z. B. durch einen Sticky Header oder ein eingefrorenes Banner. Das Element muss zumindest teilweise sichtbar bleiben.",
    shopRelevanz: "Hoch — Sticky-Header-Problematik trifft fast jeden Shop.",
    bfsg: "Nicht explizit verlangt (BFSG referenziert WCAG 2.1), aber empfohlen.",
  },
  {
    sc: "2.4.12",
    titel: "Focus Not Obscured (Enhanced) — Stufe AAA",
    erklaerung:
      "Schärfere Version: Das fokussierte Element muss vollständig sichtbar sein. AAA-Kriterium, das BFSG fordert nur AA.",
    shopRelevanz: "Mittel — AAA, nicht BFSG-Pflicht.",
    bfsg: "Nicht BFSG-Pflicht (AAA).",
  },
  {
    sc: "2.4.13",
    titel: "Focus Appearance — Stufe AAA",
    erklaerung:
      "Fokus-Indikatoren müssen mindestens 2 CSS-Pixel Rahmendicke haben und sich im Kontrast von 3:1 zum Hintergrund abheben. AAA-Kriterium.",
    shopRelevanz: "Mittel — AAA, nicht BFSG-Pflicht, aber gute Praxis.",
    bfsg: "Nicht BFSG-Pflicht (AAA).",
  },
  {
    sc: "2.5.7",
    titel: "Dragging Movements — Stufe AA",
    erklaerung:
      "Funktionen, die durch Ziehen (Drag) ausgeführt werden, müssen alternativ durch einfaches Zeigen/Klicken erreichbar sein. Betrifft Slider, Kartenansichten und Drag-and-Drop-Interfaces.",
    shopRelevanz: "Mittel — betrifft Shops mit Produkt-Slidern oder Drag-Interfaces.",
    bfsg: "Nicht explizit BFSG-Pflicht, aber Teil von WCAG 2.2 AA.",
  },
  {
    sc: "2.5.8",
    titel: "Target Size (Minimum) — Stufe AA",
    erklaerung:
      "Interaktive Elemente müssen mind. 24×24 CSS-Pixel groß sein oder ausreichend Abstand zu Nachbarelementen haben. Ziel: Touch-Bedienung auf mobilen Geräten erleichtern.",
    shopRelevanz: "Hoch — Mobile-Checkout-Buttons, Paginierung, Warenkorb-Icons.",
    bfsg: "Nicht explizit BFSG-Pflicht (WCAG 2.2 AA), aber stark empfohlen.",
  },
  {
    sc: "3.2.6",
    titel: "Consistent Help — Stufe A",
    erklaerung:
      "Wenn eine Website Hilfe-Mechanismen anbietet (Kontakt, Chat, FAQ), müssen diese auf mehreren Seiten an konsistenter Position erscheinen.",
    shopRelevanz: "Mittel — betrifft Live-Chats und Kontakt-Widgets.",
    bfsg: "Nicht BFSG-Pflicht (WCAG 2.2 A = aber BFSG fordert AA, nicht extra A-Kriterien).",
  },
  {
    sc: "3.3.7",
    titel: "Redundant Entry — Stufe A",
    erklaerung:
      "Nutzer dürfen innerhalb eines Prozesses nicht gezwungen werden, dieselbe Information mehrfach einzugeben, es sei denn, das ist aus technischen Gründen notwendig oder zur Sicherheit (z. B. Passwort-Bestätigung).",
    shopRelevanz: "Hoch — mehrstufiger Checkout: Lieferadresse ≠ erneut Rechnungsadresse eingeben.",
    bfsg: "Nicht BFSG-Pflicht (WCAG 2.2 A).",
  },
  {
    sc: "3.3.8",
    titel: "Accessible Authentication (Minimum) — Stufe AA",
    erklaerung:
      "Kognitive Tests (CAPTCHA, Rätsel, Memorieraufgaben) dürfen nicht das einzige Authentifizierungsmittel sein, wenn der Nutzer keine Alternative hat. Muss durch Kopieren/Einfügen oder Passwort-Manager unterstützt werden.",
    shopRelevanz: "Hoch — Login-Formulare, Konto-Erstellung, CAPTCHA-Implementierungen.",
    bfsg: "Nicht explizit BFSG-Pflicht, aber WCAG 2.2 AA.",
  },
  {
    sc: "3.3.9",
    titel: "Accessible Authentication (Enhanced) — Stufe AAA",
    erklaerung:
      "Wie 3.3.8, aber ohne jegliche Ausnahme für kognitive Tests. AAA-Kriterium.",
    shopRelevanz: "Gering — AAA, nicht BFSG-Pflicht.",
    bfsg: "Nicht BFSG-Pflicht (AAA).",
  },
];

const FAQ = [
  {
    q: "Welche WCAG-Version fordert das BFSG?",
    a: "Das BFSG verweist auf die europäische Norm EN 301 549, die sich wiederum auf WCAG 2.1 Stufe AA bezieht. WCAG 2.2 ist Stand Juni 2026 noch nicht in EN 301 549 eingeflossen. Das bedeutet: BFSG-Pflicht ist WCAG 2.1 AA. WCAG 2.2 enthält sinnvolle Ergänzungen, ist aber noch keine Pflicht.",
  },
  {
    q: "Sollte ich dennoch WCAG 2.2 umsetzen?",
    a: "Empfehlenswert, ja. WCAG 2.2 ist seit Oktober 2023 W3C-Recommendation. Die EU-Norm EN 301 549 wird in absehbarer Zeit auf WCAG 2.2 aktualisiert. Wer jetzt WCAG 2.2 umsetzt, ist auf der sicheren Seite für kommende Anforderungen — und die meisten 2.2-Kriterien wie Target Size (2.5.8) und Focus Not Obscured (2.4.11) sind ohnehin gute UX-Praxis.",
  },
  {
    q: "Welche WCAG-2.2-Kriterien sind für Shops am wichtigsten?",
    a: "Für Online-Shops besonders relevant: 2.5.8 (Target Size — Touch-Buttons im Checkout), 2.4.11 (Focus Not Obscured — Sticky Header), 3.3.8 (Accessible Authentication — Login und CAPTCHA) und 3.3.7 (Redundant Entry — mehrstufiger Checkout). Diese verbessern sowohl Barrierefreiheit als auch allgemeine Usability.",
  },
  {
    q: "Wurde ein WCAG-2.1-Kriterium in 2.2 entfernt?",
    a: "Ja, ein Kriterium wurde entfernt: 4.1.1 (Parsing). Dieses Kriterium war ursprünglich für ältere Browser relevant, die bei fehlendem HTML-Parsing scheiterten. Moderne Browser sind robust genug, sodass das Kriterium entfiel. Es hat aber keinen Einfluss auf BFSG-Anforderungen, da BFSG auf WCAG 2.1 verweist.",
  },
  {
    q: "Prüft Barrierefrei-Prüfen auch WCAG-2.2-Kriterien?",
    a: "Ja, Barrierefrei-Prüfen prüft auf Basis von axe-core 4.x, das bereits WCAG-2.2-Kriterien einschließt. Der Report gibt an, welche Findings WCAG-2.1- und welche WCAG-2.2-Kriterien betreffen, damit Sie Prioritäten setzen können.",
  },
];

export default function Wcag21vs22Page() {
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
    headline: "WCAG 2.1 vs. 2.2: Die 9 neuen Erfolgskriterien einfach erklärt",
    description: "Was hat sich von WCAG 2.1 zu 2.2 geändert? Alle Neuerungen und BFSG-Relevanz erklärt.",
    url: "https://barrierefrei-pruefen.de/wcag-2-1-vs-2-2",
    publisher: { "@type": "Organization", name: "Barrierefrei-Prüfen", url: "https://barrierefrei-pruefen.de" },
    dateModified: "2026-06-21",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            WCAG · Barrierefreiheit · Entwickler
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            WCAG 2.1 vs. 2.2: Die 9 neuen Erfolgskriterien einfach erklärt
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Im Oktober 2023 wurde WCAG 2.2 zur offiziellen W3C-Recommendation. Für Shop-Betreiber und
            Entwickler stellt sich die Frage: Was hat sich geändert — und was davon betrifft das BFSG?
            Dieser Artikel erklärt alle 9 neuen Erfolgskriterien mit Shop-Kontext und gibt eine klare
            Einordnung, was jetzt Pflicht ist und was empfohlene Vorbereitung.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juni 2026 · Technischer Artikel, keine Rechtsberatung
          </p>
        </header>

        {/* Schnell-Tabelle */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Kurz-Tabelle: Alle 9 neuen Kriterien auf einen Blick</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">SC</th>
                  <th className="px-3 py-3 text-left font-semibold">Titel</th>
                  <th className="px-3 py-3 text-left font-semibold">Shop-Relevanz</th>
                  <th className="px-3 py-3 text-left font-semibold">BFSG-Pflicht</th>
                </tr>
              </thead>
              <tbody>
                {NEUE_KRITERIEN.map((k, i) => (
                  <tr key={k.sc} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-mono font-semibold">{k.sc}</td>
                    <td className="px-3 py-2">{k.titel}</td>
                    <td className="px-3 py-2 text-muted-foreground">{k.shopRelevanz.split(" — ")[0]}</td>
                    <td className="px-3 py-2 text-muted-foreground text-[11px]">{k.bfsg.startsWith("Nicht BFSG-Pflicht") ? "Nein" : "Empfohlen"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Welche Version fordert BFSG */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Welche Version fordert das BFSG?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das BFSG verweist auf die harmonisierte europäische Norm <strong>EN 301 549</strong>, die ihrerseits
            WCAG 2.1 Stufe AA als technischen Mindeststandard referenziert. WCAG 2.2 ist Stand Juni 2026
            noch nicht in EN 301 549 eingeflossen — das bedeutet: <strong>BFSG-Pflicht ist aktuell WCAG 2.1 AA</strong>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            WCAG 2.2 enthält sinnvolle Ergänzungen, besonders für Mobile und kognitive Barrierefreiheit,
            und wird empfohlen — ist aber noch keine gesetzliche Pflicht nach BFSG.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-card/40 p-4 text-sm">
            <p className="font-semibold">Migrationsstrategie</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Zuerst: WCAG 2.1 AA vollständig umsetzen (BFSG-Pflicht).</li>
              <li>Danach: AA-Kriterien aus WCAG 2.2 ergänzen (2.4.11, 2.5.7, 2.5.8, 3.3.8).</li>
              <li>Optional: AAA-Kriterien aus 2.2 nach Bedarf und Budget.</li>
            </ol>
          </div>
        </section>

        {/* Detailerklärungen */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Die 9 neuen Kriterien im Detail</h2>
          <div className="mt-6 space-y-8">
            {NEUE_KRITERIEN.map((k) => (
              <div key={k.sc} className="rounded-xl border border-border p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold">{k.sc}</span>
                  <h3 className="text-sm font-semibold">{k.titel}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{k.erklaerung}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  <span className="text-muted-foreground">
                    <strong>Shop-Relevanz:</strong> {k.shopRelevanz}
                  </span>
                  <span className="text-muted-foreground">
                    <strong>BFSG:</strong> {k.bfsg}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Entferntes Kriterium */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Was wurde in WCAG 2.2 entfernt?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Erfolgskriterium <strong>4.1.1 Parsing</strong> (A) wurde aus WCAG 2.2 gestrichen. Dieses
            Kriterium verlangte, dass HTML wohlgeformt und valide sein muss, damit Browser und Hilfsmittel
            den DOM korrekt aufbauen können. Moderne Browser sind jedoch so robust im HTML-Parsing, dass
            fehlerhafte HTML die Hilfsmittel-Nutzung nicht mehr wesentlich beeinträchtigt. Das W3C hat
            deshalb das Kriterium für obsolet erklärt.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sauberes HTML ist dennoch gute Praxis — aus SEO- und Wartungsgründen, nicht wegen WCAG.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">WCAG-2.1-Stand Ihrer Website prüfen lassen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Barrierefrei-Prüfen prüft auf Basis von axe-core 4.x, das WCAG 2.1 AA vollständig und ausgewählte
            WCAG-2.2-Kriterien abdeckt. Der Basis-Report (129 €) zeigt klar, welche Mängel BFSG-Pflicht
            sind und welche WCAG-2.2-Empfehlungen drüber hinaus gehen.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos prüfen →
            </Link>
            <Link
              href="/axe-lighthouse-wave-vergleich"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Tool-Vergleich: axe vs. Lighthouse vs. WAVE
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zu WCAG 2.1 vs. 2.2</h2>
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
              <Link href="/axe-lighthouse-wave-vergleich" className="text-primary underline underline-offset-2">
                axe vs. Lighthouse vs. WAVE: Tool-Vergleich
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
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel ist ein technischer Informationsartikel und
          stellt keine Rechtsberatung dar. Barrierefrei-Prüfen liefert automatisierte technische Analysen nach
          WCAG 2.1 AA. Keine Garantie für Vollständigkeit, Aktualität oder rechtliche BFSG-Konformität.
          Bei rechtlichen Fragen wenden Sie sich an einen Fachanwalt für IT-Recht.
        </aside>
      </article>
    </>
  );
}
