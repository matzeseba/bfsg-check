#!/usr/bin/env node
// Akquise-Automation: scannt eine Ziel-URL und erzeugt daraus eine
// personalisierte Cold-E-Mail, die KONKRETE auf der Seite gefundene Maengel
// nennt. Deterministisch (kein LLM noetig) -> skalierbar + faceless.
//
// Nutzung:
//   node outreach.js <url> [--company "Name"] [--json]
//   cat urls.txt | node outreach.js --batch     (eine URL pro Zeile)
//
// Hinweis Recht: Cold-E-Mail an Unternehmen (B2B) unterliegt in DE strengen
// Regeln (UWG/DSGVO). Vor Versand pruefen: berechtigtes Interesse, klarer
// Bezug, einfache Abmeldung, Impressum. Siehe ../legal/disclaimer.md.

// HARD-STOP (UWG §7) — zwingender ENV-Gate VOR jedem Import/Side-Effect.
// Verhindert, dass auch nur Module geladen werden, wenn der Opt-in nicht
// dokumentiert ist. Greift fuer ESM mit top-level statements vor `import`-
// Auswertung NICHT — deshalb zusaetzlich am Anfang von main() abgesichert.
if (process.env.OUTREACH_OPTIN_CONFIRMED !== 'true') {
  console.error('[outreach] DEAKTIVIERT — UWG §7 verbietet B2B-Cold-Mails in DE ohne Einwilligung.');
  console.error('[outreach] Setze OUTREACH_OPTIN_CONFIRMED=true NUR wenn dokumentierte Opt-ins vorliegen.');
  process.exit(2);
}

const { scanUrl } = await import('./lib/scan.js');
const { renderTeaser } = await import('./lib/report.js');

function emailFrom(teaser, company) {
  const name = company || teaser.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const issuesList = teaser.topIssues.map((t) => `  • ${t}`).join('\n');
  const risk =
    teaser.score < 50
      ? 'deutet auf ein erhoehtes Abmahn- und Bussgeldrisiko hin'
      : 'zeigt konkrete Luecken, die nachgebessert werden sollten';

  const subject = `${name}: ${teaser.totalIssues} Barrierefreiheits-Maengel auf Ihrer Website (BFSG)`;

  const body = `Guten Tag,

ich habe Ihre Website (${teaser.url}) automatisiert auf die Anforderungen des
Barrierefreiheitsstaerkungsgesetzes (BFSG) geprueft, das seit dem 28.06.2025 gilt.

Das Ergebnis: Konformitaets-Score ${teaser.score}/100, ${teaser.totalIssues} erkannte
Maengel. Das ${risk}. Besonders aufgefallen sind:

${issuesList}

Seit 2026 mahnen Mitbewerber und Verbaende nicht-konforme Seiten ab
(typisch 3.500–20.000 Euro). Die meisten der gefundenen Punkte sind technisch
schnell behebbar — wenn man sie kennt.

Ich erstelle Ihnen einen vollstaendigen, priorisierten Report (jeder Mangel mit
konkreter Loesung) inkl. Entwurf Ihrer gesetzlich vorgeschriebenen
Barrierefreiheitserklaerung. Bei Interesse antworten Sie einfach kurz auf
diese E-Mail.

Eine erste kostenlose Kurzpruefung koennen Sie hier selbst starten:
[LANDINGPAGE-URL]

Mit freundlichen Gruessen
[ABSENDER / FIRMA / IMPRESSUM-LINK]

---
Sie moechten keine weiteren E-Mails? Kurze Antwort mit "Abmelden" genuegt.`;

  return { subject, body };
}

async function handle(url, company, asJson) {
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const scan = await scanUrl(url, { timeout: 30000 });
  const teaser = renderTeaser(scan);
  const mail = emailFrom(teaser, company);
  if (asJson) {
    process.stdout.write(JSON.stringify({ ...teaser, email: mail }, null, 2) + '\n');
  } else {
    process.stdout.write(
      `\n========== ${url} ==========\nBetreff: ${mail.subject}\n\n${mail.body}\n`
    );
  }
}

const RECHTS_WARNUNG = `
⚠️  RECHTLICHER WARNHINWEIS — COLD-E-MAIL
────────────────────────────────────────────────────────────
Unaufgeforderte Werbe-E-Mails an Unternehmen (B2B) OHNE vorherige
ausdrückliche Einwilligung sind in DE nach § 7 Abs. 2 Nr. 2 UWG
grundsätzlich UNZULÄSSIG — schon eine einzige Mail ist abmahnbar
(typisch 1.000–5.000 € pro Fall) + DSGVO-Risiko. Das Pre-Launch-
Review hat Cold-Mail als BLOCKER eingestuft.

EMPFOHLEN STATT COLD-MAIL: Opt-in-Funnel (Gratis-Self-Check auf der
Landingpage → freiwillige E-Mail → Double-Opt-in) ODER Google-Ads
auf Such-Intent. Siehe RECHTSSICHERHEIT.md.

Dieses Tool erzeugt nur ENTWÜRFE für bereits eingewilligte Kontakte /
zur internen Analyse. Versand auf eigenes Rechtsrisiko.
────────────────────────────────────────────────────────────
`;

async function main() {
  // HARD-STOP (UWG §7) — zwingender ENV-Gate vor jeder weiteren Verarbeitung.
  if (process.env.OUTREACH_OPTIN_CONFIRMED !== 'true') {
    console.error('[outreach] DEAKTIVIERT — UWG §7 verbietet B2B-Cold-Mails in DE ohne Einwilligung.');
    console.error('[outreach] Setze OUTREACH_OPTIN_CONFIRMED=true NUR wenn dokumentierte Opt-ins vorliegen.');
    process.exit(2);
  }

  const argv = process.argv.slice(2);
  if (!argv.includes('--einwilligung-liegt-vor')) {
    console.error(RECHTS_WARNUNG);
    console.error('Abbruch: Zum Erzeugen Flag --einwilligung-liegt-vor setzen (Bestätigung, dass Einwilligung vorliegt / nur interne Analyse).');
    process.exit(2);
  }
  const asJson = argv.includes('--json');
  const batch = argv.includes('--batch');
  const company = argv.includes('--company') ? argv[argv.indexOf('--company') + 1] : '';

  if (batch) {
    const input = await new Promise((resolve) => {
      let d = '';
      process.stdin.on('data', (c) => (d += c));
      process.stdin.on('end', () => resolve(d));
    });
    const urls = input.split('\n').map((s) => s.trim()).filter(Boolean);
    for (const url of urls) {
      try {
        await handle(url, '', asJson);
      } catch (e) {
        console.error(`[Fehler bei ${url}] ${e.message}`);
      }
    }
    return;
  }

  const url = argv.find((a) => !a.startsWith('--') && a !== company);
  if (!url) {
    console.error('Nutzung: node outreach.js <url> [--company "Name"] [--json]');
    process.exit(1);
  }
  await handle(url, company, asJson);
}

main().catch((e) => {
  console.error('Fehler:', e.message);
  process.exit(1);
});
