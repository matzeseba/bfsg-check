import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie-Banner 2026: 7 Fehler, die Abmahnungen auslösen",
  description:
    "Cookie-Banner-Abmahnungen vermeiden: die 7 häufigsten technischen Fehler nach § 25 TDDDG und DSGVO erklärt — mit Checkliste und Gratis-Check.",
  alternates: {
    canonical: "/cookie-banner-fehler",
  },
  openGraph: {
    title: "Cookie-Banner 2026: 7 Fehler die Abmahnungen auslösen",
    description:
      "§ 25 TDDDG, EuGH Planet49, gleichwertige Buttons: Was Cookie-Banner wirklich erfüllen müssen und welche 7 Fehler typische Abmahn-Auslöser sind.",
    url: "https://bfsg-fix.de/cookie-banner-fehler",
    type: "article",
  },
};

const FEHLER = [
  {
    nr: 1,
    titel: "Kein gleichwertiger „Ablehnen“-Button auf der ersten Ebene",
    beschreibung:
      'Seit dem EuGH-Urteil Planet49 (C-673/17) und der DSGVO-Praxis der Datenschutzbehörden muss ein „Ablehnen“-Button ebenso prominent sein wie der „Akzeptieren“-Button — auf derselben ersten Ebene, gleiche Schriftgröße, kein verstecktes Kleingedrucktes. Wer Ablehnen in einem zweiten Dialog versteckt, riskiert Abmahnungen durch Verbraucherverbände.',
    risiko: "hoch",
  },
  {
    nr: 2,
    titel: "Vorab angekreuzte Checkboxen (Pre-Checked Consent)",
    beschreibung:
      "Vorausgewählte Zustimmungen sind nach Art. 4 Nr. 11 DSGVO keine wirksame Einwilligung. Der Nutzer muss aktiv handeln, um Einwilligung zu geben — eine vorausgewählte Option macht das Gegenteil. Das gilt auch für „alle auswählen“ als Standardzustand.",
    risiko: "hoch",
  },
  {
    nr: 3,
    titel: "Tracking-Scripts feuern vor der Einwilligung",
    beschreibung:
      "Google Analytics, Meta Pixel, TikTok-Pixel und ähnliche Drittanbieter-Scripts dürfen erst nach Einwilligung laden — nicht im Hintergrund parallel zum Laden des Banners. Viele CMP-Konfigurationen starten Scripts bereits beim Seitenaufruf, was § 25 TDDDG direkt verletzt.",
    risiko: "hoch",
  },
  {
    nr: 4,
    titel: "Google Fonts, Gravatar oder andere Ressourcen ohne Consent",
    beschreibung:
      "Das LG München I hat 2022 geurteilt, dass die Einbindung von Google Fonts ohne Einwilligung gegen die DSGVO verstößt (Az. 3 O 17493/20), da die IP-Adresse an US-Server übertragen wird. Viele Websites laden Google Fonts, Gravatar oder ähnliche externe Ressourcen, ohne dafür Consent zu erholen.",
    risiko: "mittel",
  },
  {
    nr: 5,
    titel: "Keine oder falsche Zweckangaben im Banner",
    beschreibung:
      "Ein gültiger Consent erfordert, dass Nutzer vor der Einwilligung verstehen, für welche Zwecke ihre Daten verarbeitet werden. Vage Formulierungen wie „Wir nutzen Cookies für ein besseres Erlebnis“ ohne Auflistung der konkreten Dienste erfüllen die Transparenzanforderungen von Art. 13 DSGVO nicht.",
    risiko: "mittel",
  },
  {
    nr: 6,
    titel: "Consent-Cookie läuft zu lange oder wird nicht respektiert",
    beschreibung:
      "Consent-Entscheidungen müssen nach einer angemessenen Zeit neu eingeholt werden — die DSK empfiehlt maximal 12 Monate. Außerdem muss eine Widerrufsmöglichkeit dauerhaft zugänglich sein (oft über einen Link im Footer). Wird der Consent nicht korrekt gespeichert oder beim Rückkehr nicht geladen, liegt ein technischer Fehler vor.",
    risiko: "mittel",
  },
  {
    nr: 7,
    titel: "Banner selbst nicht barrierefrei bedienbar (BFSG-Schnittstelle)",
    beschreibung:
      "Cookie-Banner müssen nach WCAG 2.1 AA bedienbar sein — das ist eine direkte BFSG-Anforderung für betroffene Websites. Konkret: Fokus-Reihenfolge korrekt (Tastatur kommt zum Ablehnen-Button), Kontrast mind. 4,5:1, aria-Attribute korrekt gesetzt. Viele CMP-Standard-Implementierungen scheitern an diesen Anforderungen.",
    risiko: "mittel",
  },
];

const FAQ = [
  {
    q: "Ist ein Cookie-Banner wirklich Pflicht für jeden Shop?",
    a: "Ein Cookie-Banner (genauer: eine Einwilligungslösung nach § 25 TDDDG) ist Pflicht, sobald auf der Website nicht technisch notwendige Cookies oder ähnliche Speichermechanismen eingesetzt werden. Dazu zählen Analytics-Cookies, Marketing-Pixel, Social-Media-Buttons und viele externe Fonts. Rein technisch notwendige Cookies (Session, Warenkorb, Login) benötigen keinen Consent.",
  },
  {
    q: "Was ist TCF 2.2 und brauche ich das?",
    a: "Das Transparency and Consent Framework (TCF) ist ein IAB-Standard für programmatische Werbung. TCF 2.2 ist notwendig, wenn Sie Programmatic Advertising, Real-Time-Bidding oder Google Consent Mode v2 mit erweiterten Opt-in-Signalen nutzen. Für die meisten mittelständischen Shops ohne Programmatic Ads ist TCF 2.2 nicht zwingend — aber Google Analytics 4 erfordert bei GA4-Activation Consent Mode.",
  },
  {
    q: "Reicht ein selbst gebauter Cookie-Banner?",
    a: "Technisch ja — wenn er alle rechtlichen Anforderungen erfüllt. In der Praxis ist ein selbst gebauter Banner fehleranfälliger, weil rechtliche Anforderungen sich ändern (Urteile, Behördenhinweise) und manuelle Updates nötig werden. Bewährte CMP-Lösungen wie Cookiebot, Usercentrics oder Borlabs Cookie aktualisieren ihre Konfigurationen, wenn sich die Rechtslage ändert.",
  },
  {
    q: "Wie prüfe ich, ob mein Cookie-Banner korrekt implementiert ist?",
    a: "Technisch: Öffnen Sie die Browser-DevTools (Network-Tab), laden Sie die Seite neu ohne Consent zu geben und prüfen Sie, ob externe Requests zu Google Analytics, Meta oder ähnlichen Diensten gesendet werden. Falls ja, feuern Scripts vor Consent. Rechtlich: Prüfen Sie, ob Ablehnen-Button und Akzeptieren-Button gleichwertig auf der ersten Ebene sichtbar sind. Der Cookie-Check von BFSG-Check prüft diese Aspekte automatisiert.",
  },
  {
    q: "Was kostet ein Cookie-Banner-Check?",
    a: "Der kostenlose Gratis-Check von BFSG-Check gibt einen ersten Überblick. Der Cookie-Basis-Check (49 €) prüft, welche Tracker vor Consent feuern, welche Cookies gesetzt werden und ob Google Fonts oder US-Drittland-Transfers ohne Einwilligung stattfinden — mit konkreter Handlungsempfehlung pro Fund.",
  },
];

export default function CookieBannerFehlerPage() {
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
    headline: "Cookie-Banner 2026: Die 7 häufigsten Fehler, die Abmahnungen auslösen",
    description: "§ 25 TDDDG, EuGH Planet49, gleichwertige Buttons: Cookie-Banner-Fehler mit Abmahn-Risiko.",
    url: "https://bfsg-fix.de/cookie-banner-fehler",
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
            Cookie-Banner · § 25 TDDDG · DSGVO
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Cookie-Banner 2026: Die 7 häufigsten Fehler, die Abmahnungen auslösen
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Cookie-Banner-Abmahnungen gehören seit 2022 zu den häufigsten Abmahn-Gründen im deutschen
            E-Commerce. Viele Betreiber sind der Meinung, ein Banner zu haben reicht — aber die technische
            Implementierung entscheidet. Dieser Artikel zeigt die 7 häufigsten Fehler, die Verbraucherschutz-
            verbände und Kanzleien abmahnen.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Stand: Juni 2026 · Informationsartikel, keine Rechtsberatung
          </p>
        </header>

        {/* Rechtslage */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Rechtslage: § 25 TDDDG, DSGVO und EuGH Planet49</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Seit dem Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG, vormals TTDSG) ist die
            Einwilligungspflicht für Cookies und ähnliche Speichermechanismen national gesetzlich geregelt.
            § 25 TDDDG verlangt eine Einwilligung vor dem Setzen nicht technisch notwendiger Cookies — unabhängig
            von der DSGVO-Einwilligungspflicht nach Art. 6.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Das EuGH-Urteil Planet49 (C-673/17, Oktober 2019) stellte klar: Vorab angekreuzte Checkboxen
            sind keine wirksame Einwilligung. Die Datenschutzkonferenz (DSK) ergänzte in ihrer Orientierungs-
            hilfe 2022, dass der Ablehnen-Button gleichwertig sichtbar sein muss wie der Akzeptieren-Button.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Verstöße können über UWG § 3a (Rechtsbruch), DSGVO Art. 77 (Beschwerde bei Aufsichtsbehörde) oder
            durch klagebefugte Verbände (§ 8 UWG) verfolgt werden.
          </p>
        </section>

        {/* Die 7 Fehler */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Die 7 häufigsten Fehler</h2>
          <div className="mt-6 space-y-6">
            {FEHLER.map((fehler) => (
              <div key={fehler.nr} className="rounded-xl border border-border p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-sm font-bold text-background">
                    {fehler.nr}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{fehler.titel}</h3>
                      <span
                        className={
                          fehler.risiko === "hoch"
                            ? "inline-block rounded px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            : "inline-block rounded px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }
                      >
                        Risiko: {fehler.risiko}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fehler.beschreibung}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CMP-Vergleich */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">3 CMP-Lösungen im Kurzvergleich</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Keine Empfehlung oder Garantie — nur sachliche Merkmale auf Basis öffentlicher Dokumentationen.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">CMP</th>
                  <th className="px-3 py-3 text-left font-semibold">Typ</th>
                  <th className="px-3 py-3 text-left font-semibold">TCF 2.2</th>
                  <th className="px-3 py-3 text-left font-semibold">WordPress-Plugin</th>
                  <th className="px-3 py-3 text-left font-semibold">Einstiegspreis</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Cookiebot (Usercentrics)", "SaaS/Hosted", "Ja", "Ja", "ab ~10 €/Mo"],
                  ["Borlabs Cookie", "Self-Hosted WP", "Seit v3", "Ja (nativ)", "49 €/Jahr"],
                  ["Klaro (Open Source)", "Self-Hosted", "Nein", "Per Plugin", "Kostenlos (MIT)"],
                ].map(([cmp, typ, tcf, wp, preis], i) => (
                  <tr key={cmp} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2 font-semibold">{cmp}</td>
                    <td className="px-3 py-2 text-muted-foreground">{typ}</td>
                    <td className="px-3 py-2 text-muted-foreground">{tcf}</td>
                    <td className="px-3 py-2 text-muted-foreground">{wp}</td>
                    <td className="px-3 py-2 text-muted-foreground">{preis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Preisangaben ohne Gewähr, Stand Juni 2026. Prüfen Sie die aktuellen Preise direkt beim Anbieter.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-2xl border border-border bg-card/60 px-6 py-8">
          <h2 className="text-xl font-semibold">Cookie-Banner jetzt technisch prüfen lassen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Der BFSG-Check Cookie-Basis-Check (49 €) prüft automatisiert, welche Tracker vor Consent feuern,
            welche Cookies ohne Einwilligung gesetzt werden, ob Google Fonts oder US-Drittland-Transfers
            stattfinden — mit konkreter Handlungsempfehlung je Fund. Der Cookie-Profi-Check (79 €) enthält
            zusätzlich eine manuelle Sichtung der CMP-Konfiguration.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#cookie"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Cookie-Check starten →
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Kostenloser Gratis-Scan
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Häufige Fragen zum Cookie-Banner</h2>
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
              <Link href="/barrierefreiheitserklaerung-muster" className="text-primary underline underline-offset-2">
                Barrierefreiheitserklärung: Muster und Pflicht-Inhalte
              </Link>
            </li>
            <li>
              <Link href="/wcag-2-1-vs-2-2" className="text-primary underline underline-offset-2">
                WCAG 2.1 vs. 2.2: Die neuen Erfolgskriterien einfach erklärt
              </Link>
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <strong>Wichtiger Hinweis:</strong> Dieser Artikel ist ein Informationsartikel ohne Rechtsberatungscharakter.
          BFSG-Check liefert automatisierte technische Analysen nach WCAG 2.1 AA. Keine Garantie für
          Vollständigkeit, Aktualität oder rechtliche Korrektheit. Bei rechtlichen Fragen rund um
          DSGVO, TDDDG oder Cookie-Banner konsultieren Sie einen Fachanwalt für IT-Recht oder Datenschutzrecht.
        </aside>
      </article>
    </>
  );
}
