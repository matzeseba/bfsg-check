import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "axe vs. Lighthouse vs. WAVE: Welches A11y-Tool ist besser?",
  description:
    "axe, Lighthouse oder WAVE? Stärken, Schwächen und Abdeckungsrate im Vergleich — und warum kein Tool allein ausreicht. Mit Gratis-Scan-CTA.",
  alternates: {
    canonical: "/axe-lighthouse-wave-vergleich",
  },
  openGraph: {
    title: "axe vs. Lighthouse vs. WAVE: Welches Tool findet die meisten Mängel?",
    description:
      "Detaillierter Vergleich: Abdeckungsrate, False Positives, Browser-Integration und was jedes Tool am besten kann.",
    url: "https://bfsg-fix.de/axe-lighthouse-wave-vergleich",
    type: "article",
  },
};

const VERGLEICH_DATEN = [
  { kriterium: "Primäre Engine", axe: "axe-core (Deque)", lighthouse: "Lighthouse (Google)", wave: "WAVE (WebAIM)" },
  { kriterium: "Kostenlos nutzbar", axe: "Ja (Browser-Extension)", lighthouse: "Ja (Chrome DevTools)", wave: "Ja (Online + Extension)" },
  { kriterium: "Automatische Mängel-Abdeckung", axe: "~35–45 %", lighthouse: "~25–35 %", wave: "~30–40 %" },
  { kriterium: "False-Positive-Rate", axe: "Niedrig", lighthouse: "Mittel", wave: "Mittel–Hoch" },
  { kriterium: "CI/CD-Integration", axe: "Sehr gut (axe-core npm)", lighthouse: "Gut (Lighthouse CI)", wave: "Eingeschränkt (API kostenpflichtig)" },
  { kriterium: "WCAG 2.2 Coverage", axe: "Ja (axe-core 4.x)", lighthouse: "Teilweise", wave: "Teilweise" },
  { kriterium: "Visuelle Annotation", axe: "Mittelmäßig", lighthouse: "Gut", wave: "Sehr gut" },
  { kriterium: "Kontrast-Prüfung", axe: "Präzise (APCA-Option)", lighthouse: "Standard", wave: "Standard" },
  { kriterium: "Screenreader-Test", axe: "Nein (manuell)", lighthouse: "Nein", wave: "Nein" },
  { kriterium: "API / Abo für Teams", axe: "axe DevTools Pro (~100–500 $/Mo)", lighthouse: "Kostenlos via CI", wave: "WAVE API (ca. 30–100 $/Mo)" },
];

const FAQ = [
  {
    q: "Welches Tool soll ich für meinen Online-Shop verwenden?",
    a: "Für erste Orientierung reicht jedes der drei Tools. axe DevTools (Browser-Extension) hat die niedrigste False-Positive-Rate und ist für Entwickler empfohlen, die Mängel schnell identifizieren und beheben wollen. WAVE eignet sich für nicht-technische Nutzer dank der visuellen Overlays. Lighthouse ist bereits in Chrome DevTools integriert und braucht keine Installation.",
  },
  {
    q: "Warum findet kein automatisiertes Tool 100 % der Mängel?",
    a: "Automatisierte Tools prüfen, was maschinell messbar ist: Kontrastverhältnisse, vorhandene Attribute, DOM-Struktur. Ob ein Alt-Text tatsächlich beschreibend ist, ob eine Animation kognitiv störend ist, oder ob ein komplexer Interaktionsflow von Screenreadern wirklich nutzbar ist — das erfordert menschliche Urteilskraft und echte Screenreader-Tests.",
  },
  {
    q: "Kann ich axe-core in meine CI/CD-Pipeline einbinden?",
    a: "Ja. axe-core ist als npm-Paket verfügbar und lässt sich mit Jest, Playwright, Cypress oder Vitest kombinieren. axe-playwright und @axe-core/react sind fertige Integrationen. Damit können Regressionstests bei jedem Commit laufen.",
  },
  {
    q: "Zählt ein Lighthouse-Score als Nachweis für die BFSG-Prüfung?",
    a: "Ein Lighthouse-Score allein reicht nicht als BFSG-Dokumentationsgrundlage. Der Accessibility-Score in Lighthouse misst eine begrenzte Auswahl von WCAG-Kriterien und keine vollständige BFSG-Prüfung nach EN 301 549. Für eine dokumentierte BFSG-Prüfung brauchen Sie einen strukturierten Bericht mit Mangel-Priorisierung und Bezug zu den WCAG-Erfolgskriterien.",
  },
  {
    q: "Wie unterscheidet sich BFSG-Check von diesen kostenlosen Tools?",
    a: "BFSG-Check kombiniert automatisierte Prüfwerkzeuge (axe-core, eigene Regelwerke für über 80 WCAG-Regeln) mit menschlicher Sichtung vor Auslieferung. Das Ergebnis ist ein strukturierter PDF-Report mit priorisierten Mängeln, konkreten Fix-Hinweisen und einem Entwurf der Barrierefreiheitserklärung — kein Rohdaten-Dump, sondern eine umsetzbare Grundlage.",
  },
];

export default function AxeLighthouseWaveVergleichPage() {
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
    headline: "axe vs. Lighthouse vs. WAVE: Welches A11y-Tool findet die meisten Mängel?",
    description: "Detaillierter Vergleich der drei wichtigsten kostenlosen Accessibility-Tools.",
    url: "https://bfsg-fix.de/axe-lighthouse-wave-vergleich",
    publisher: { "@type": "Organization", name: "BFSG-Check", url: "https://bfsg-fix.de" },
    dateModified: "2026-06-21",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header>
          <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Accessibility-Tools · WCAG-Prüfung · Vergleich
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            axe, Lighthouse, WAVE: Welches A11y-Tool findet die meisten Mängel?
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Drei kostenlose Tools dominieren den Markt der automatisierten Accessibility-Prüfung: axe DevTools
            (Deque), Lighthouse (Google) und WAVE (WebAIM). Jedes hat andere Stärken, Schwächen und
            Abdeckungsraten. Dieser Vergleich hilft Entwicklern und Shop-Betreibern, das richtige Tool für
            ihre Situation zu wählen — und erklärt, warum kein Tool allein ausreicht.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juni 2026 · Technischer Vergleichsartikel, keine Rechtsberatung
          </p>
        </header>

        {/* Kurzvorstellung */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Die drei Tools im Überblick</h2>

          <h3 className="mt-8 text-xl font-semibold">axe DevTools (Deque Systems)</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            axe-core ist die zugrunde liegende Open-Source-Engine, die auch viele andere Tools (Lighthouse,
            Pa11y, IBM Equal Access Checker) verwenden. Die Browser-Extension „axe DevTools" ist für Chrome und
            Firefox verfügbar. Bekannt für niedrige False-Positive-Rate und gute WCAG-2.2-Abdeckung in der
            aktuellen Version (axe-core 4.x). Besonders stark bei Formular-Labeling, ARIA-Attribute und
            Fokus-Management.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das kostenpflichtige axe DevTools Pro (~100–500 USD/Monat je Teamgröße) ergänzt manuelle
            Guided-Tests und Integrations-APIs. Für Einzelentwickler reicht die kostenlose Extension.
          </p>

          <h3 className="mt-8 text-xl font-semibold">Google Lighthouse</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Lighthouse ist in Chrome DevTools (Audit-Tab) direkt integriert und zusätzlich als CLI und
            Node-Modul nutzbar. Es prüft nicht nur Accessibility, sondern auch Performance, SEO und
            Best Practices. Der Accessibility-Score basiert teilweise auf axe-core, deckt aber nur eine
            begrenzte Auswahl der WCAG-Kriterien ab — der Score selbst ist kein direkter Maßstab für
            BFSG-Konformität.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Stärke von Lighthouse: Integration in Google PageSpeed Insights und einfache CI/CD-Einbindung
            über Lighthouse CI. Schwäche: höhere False-Positive-Rate als axe bei einigen ARIA-Checks.
          </p>

          <h3 className="mt-8 text-xl font-semibold">WAVE (WebAIM)</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            WAVE des Web Accessibility in Mind (WebAIM)-Teams ist als Online-Checker und Browser-Extension
            verfügbar. Die visuelle Annotierung direkt auf der Website ist einzigartig: Mängel werden als
            Symbole im Seitenkontext angezeigt, was für nicht-technische Nutzer besonders hilfreich ist.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Schwäche: höhere False-Positive-Rate bei strukturellen Prüfungen und begrenzte
            CI/CD-Unterstützung ohne kostenpflichtige WAVE API.
          </p>
        </section>

        {/* Vergleichstabelle */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Detaillierter Vergleich</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Kriterium</th>
                  <th className="px-3 py-3 text-left font-semibold">axe DevTools</th>
                  <th className="px-3 py-3 text-left font-semibold">Lighthouse</th>
                  <th className="px-3 py-3 text-left font-semibold">WAVE</th>
                </tr>
              </thead>
              <tbody>
                {VERGLEICH_DATEN.map((row, i) => (
                  <tr key={row.kriterium} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-medium">{row.kriterium}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.axe}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.lighthouse}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.wave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Abdeckungsraten sind Schätzungen basierend auf publizierten Studien (WebAIM, Deque, Tenon.io).
            Tatsächliche Werte variieren je nach Website-Typ und -Komplexität.
          </p>
        </section>

        {/* Warum kein Tool 100% findet */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Warum kein automatisiertes Tool 100 % der Mängel findet</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Automatisierte Tools prüfen, was maschinell messbar ist. Das sind vor allem:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Vorhandensein von Alt-Attributen (aber nicht, ob der Inhalt sinnvoll ist)</li>
            <li>Kontrastverhältnisse von Text und Hintergrundfarben</li>
            <li>Verknüpfung von Formularfeldern mit Labels (aria-labelledby, for/id)</li>
            <li>Vorhandensein von Sprachattributen im HTML</li>
            <li>Heading-Hierarchie im DOM</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Was automatisierte Tools <strong>nicht</strong> zuverlässig erkennen:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Ob ein Alt-Text den Bildinhalt tatsächlich beschreibt (z. B. „Bild" vs. „Produktfoto Herrenjacke blau Größe M")</li>
            <li>Ob die Tastatur-Reihenfolge logisch und sinnvoll ist</li>
            <li>Ob komplexe Interaktionen (mehrstufiger Checkout, Akkordeon-Navigation) von Screenreadern nutzbar sind</li>
            <li>Kognitive Belastung, Zeitlimits oder Animation (WCAG 2.3, 2.5)</li>
            <li>Korrekte ARIA-Live-Region-Verwendung bei dynamischen Inhalten</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Für eine solide BFSG-Dokumentation ist ein automatisierter Scan der sinnvolle erste Schritt —
            ergänzt durch gezielte manuelle Tests an den kritischen User-Flows des Shops.
          </p>
        </section>

        {/* Wie BFSG-Check Tools kombiniert */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Wie BFSG-Check die Tools kombiniert</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            BFSG-Check setzt axe-core als Primär-Engine ein und ergänzt eigene Prüfregeln für über 80
            WCAG-2.1-Kriterien. Vor Auslieferung des Reports sichtet ein Mensch die Ergebnisse: False
            Positives werden herausgefiltert, kritische Mängel werden priorisiert und mit konkreten
            Fix-Hinweisen versehen. Das Ergebnis ist kein Rohdaten-Dump, sondern ein umsetzbarer Plan.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Ihren Shop mit über 80 WCAG-Regeln prüfen lassen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der kostenlose Sofort-Check gibt einen ersten Überblick in ca. 60 Sekunden. Der Basis-Report
            (199 €) liefert den vollständigen priorisierten WCAG-2.1-Report mit Fix-Plan für bis zu 5
            Unterseiten — inklusive Entwurf der Barrierefreiheitserklärung.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#pakete"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Kostenlos prüfen →
            </Link>
            <Link
              href="/bfsg-pruefung-kosten"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Preisvergleich ansehen
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
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
              <Link href="/wcag-2-1-vs-2-2" className="text-primary underline underline-offset-2">
                WCAG 2.1 vs. 2.2: Die 9 neuen Erfolgskriterien erklärt
              </Link>
            </li>
            <li>
              <Link href="/bfsg-checkliste-online-shop" className="text-primary underline underline-offset-2">
                BFSG-Checkliste 2026: 25 Punkte für Online-Shops
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
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel ist ein technischer Informationsartikel ohne
          Rechtsberatungscharakter. Abdeckungsraten sind Schätzungen auf Basis veröffentlichter
          Forschungsdaten — tatsächliche Werte variieren je nach Website. BFSG-Check liefert automatisierte
          technische Analysen nach WCAG 2.1 AA, keine Rechtsberatung und keine Konformitätsgarantie.
        </aside>
      </article>
    </>
  );
}
