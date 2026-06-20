#!/usr/bin/env node
// Generiert docs/CODE-ONLY-PLAN.pdf + docs/SALES-DAY-1.pdf
// Kompakte 2-Doc-PDFs fuer den schnellen Sales-Day-1-Start.

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NAVY = '#2E2A6B';
const NAVY_DARK = '#1f1c4d';
const MINT = '#1FBF8E';
const MINT_DARK = '#10996f';
const CORAL = '#FF6B6B';
const AMBER = '#F59E0B';
const PAPER = '#FAFAF7';
const INK = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';

const sharedCSS = `
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  @page :first { margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${INK}; background: ${PAPER}; font-size: 11pt; line-height: 1.5; }

  .cover { height: 297mm; width: 210mm; background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 55%, ${MINT_DARK} 130%); color: white; padding: 36mm 24mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; break-after: page; }
  .cover-brand { font-size: 14pt; letter-spacing: 2px; opacity: 0.85; font-weight: 600; text-transform: uppercase; }
  .cover-title { font-size: 42pt; font-weight: 800; line-height: 1.1; margin-top: 18mm; }
  .cover-title em { color: ${MINT}; font-style: normal; }
  .cover-subtitle { font-size: 16pt; opacity: 0.9; margin-top: 6mm; font-weight: 400; line-height: 1.4; }
  .cover-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14mm; }
  .pill { background: rgba(255,255,255,0.15); padding: 6px 14px; border-radius: 999px; font-size: 10pt; }
  .pill strong { color: ${MINT}; }
  .cover-foot { font-size: 9pt; opacity: 0.7; display: flex; justify-content: space-between; align-items: end; }
  .cover-foot-right { text-align: right; }
  .cover-foot strong { color: ${MINT}; }

  .section { break-before: page; page-break-before: always; padding-top: 4mm; }
  .section h1 { color: ${NAVY}; font-size: 22pt; margin: 0 0 4mm; border-bottom: 3px solid ${MINT}; padding-bottom: 3mm; }
  .section h2 { color: ${NAVY}; font-size: 16pt; margin: 8mm 0 3mm; }
  .section h3 { color: ${NAVY_DARK}; font-size: 12pt; margin: 5mm 0 2mm; }
  .section p { margin: 0 0 3mm; }
  .section ul, .section ol { padding-left: 6mm; margin: 0 0 4mm; }
  .section li { margin-bottom: 2mm; line-height: 1.5; }

  .lead { font-size: 13pt; color: ${MUTED}; line-height: 1.6; margin-bottom: 6mm; }

  table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 10pt; }
  th { background: ${NAVY}; color: white; padding: 3mm 4mm; text-align: left; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
  td { border-bottom: 1px solid ${BORDER}; padding: 3mm 4mm; background: white; vertical-align: top; }
  td code, p code { background: #F1F5F9; padding: 1px 4px; border-radius: 3px; font-size: 9pt; color: #BE185D; font-family: "SF Mono", Menlo, monospace; }

  pre { background: ${NAVY_DARK}; color: #E2E8F0; padding: 4mm; border-radius: 6px; font-family: "SF Mono", Menlo, monospace; font-size: 8.5pt; line-height: 1.4; overflow-x: auto; white-space: pre-wrap; margin: 3mm 0; }

  .callout { border-left: 4px solid; padding: 4mm 5mm; margin: 4mm 0; border-radius: 0 6px 6px 0; background: white; page-break-inside: avoid; }
  .callout.warn { border-left-color: ${CORAL}; background: #FEF2F2; }
  .callout.info { border-left-color: ${NAVY}; background: #F1F5F9; }
  .callout.good { border-left-color: ${MINT}; background: #ECFDF5; }
  .callout.tip { border-left-color: ${AMBER}; background: #FFFBEB; }
  .callout strong { display: block; margin-bottom: 1mm; font-size: 10.5pt; }

  .task-step { background: white; border: 1px solid ${BORDER}; border-radius: 8px; padding: 5mm; margin-bottom: 4mm; page-break-inside: avoid; display: flex; gap: 4mm; align-items: flex-start; }
  .step-num { background: ${MINT}; color: white; min-width: 12mm; height: 12mm; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: 800; font-size: 13pt; flex-shrink: 0; }
  .step-body h3 { margin: 0 0 2mm; font-size: 13pt; color: ${NAVY}; }
  .step-body p { margin: 0 0 2mm; font-size: 10.5pt; }
  .step-body ol { margin: 1mm 0; padding-left: 5mm; font-size: 10pt; }

  .hero-decision { background: linear-gradient(135deg, ${MINT} 0%, ${MINT_DARK} 100%); color: white; padding: 8mm; border-radius: 10px; margin: 6mm 0; text-align: center; }
  .hero-decision p { font-size: 13pt; margin: 0; font-weight: 600; line-height: 1.5; }

  .tldr { background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%); color: white; padding: 10mm; border-radius: 10px; margin-top: 8mm; }
  .tldr h2 { color: ${MINT}; margin: 0 0 4mm; font-size: 18pt; }
  .tldr ul { padding-left: 5mm; font-size: 11pt; }
  .tldr li { margin-bottom: 2mm; }
  .tldr strong { color: ${MINT}; }
`;

function renderCodeOnlyPlan() {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Code-Only Plan</title><style>${sharedCSS}</style></head><body>

<div class="cover">
  <div>
    <div class="cover-brand">BFSG-Check · Code-Only Plan</div>
    <div class="cover-title">Claude Code<br><em>reicht.</em></div>
    <div class="cover-subtitle">Kein Cowork. Kein WSL2. Kein Docker.<br>1 Befehl, 5 Minuten, fertig.</div>
    <div class="cover-pills">
      <span class="pill"><strong>5 Min</strong> Setup</span>
      <span class="pill"><strong>0 €</strong> Mehrkosten</span>
      <span class="pill"><strong>Sub-Agents</strong> bleiben</span>
    </div>
  </div>
  <div class="cover-foot">
    <div><strong>Für:</strong> Matthias Seba<br>Lange Straße 20, 27449 Kutenholz</div>
    <div class="cover-foot-right"><strong>Stand:</strong> 20.06.2026<br>v1.0</div>
  </div>
</div>

<div class="section">
  <h1>🛠️ Die Entscheidung</h1>
  <p class="lead">Für 90% der Aufgaben gibt es schon ein MCP. Für den Rest: Playwright MCP. Damit kann Claude Code Chrome direkt aus deiner Desktop App steuern.</p>

  <div class="hero-decision">
    <p>Claude Code + Playwright MCP = Cowork-Funktionen ohne Cowork-Nachteile.</p>
  </div>

  <h2>Setup (1 Befehl)</h2>
  <pre>claude mcp add playwright npx @playwright/mcp@latest --scope user
npx playwright install chromium</pre>

  <div class="callout good">
    <strong>✓ Fertig wenn:</strong> Du sagst „Öffne bfsg-fix.de/health im Browser" — Chrome-Fenster öffnet sich, Claude steuert, du siehst mit.
  </div>
</div>

<div class="section">
  <h1>📦 Was Claude Code damit alles kann</h1>

  <table>
    <thead><tr><th>Service</th><th>Wie</th></tr></thead>
    <tbody>
      <tr><td><strong>Stripe</strong> (Refunds, Keys, MRR)</td><td>Stripe MCP (schon aktiv)</td></tr>
      <tr><td><strong>Brevo</strong> (Newsletter, Templates)</td><td>Brevo MCP (schon aktiv)</td></tr>
      <tr><td><strong>Notion</strong> (Pipeline, Runbooks)</td><td>Notion MCP (schon aktiv)</td></tr>
      <tr><td><strong>GitHub</strong> (PRs, Secrets, Issues)</td><td>GitHub MCP (schon aktiv)</td></tr>
      <tr><td><strong>Marketing-Reports</strong></td><td>Porter Metrics MCP (schon aktiv)</td></tr>
      <tr><td><strong>Designs/Visuals</strong></td><td>Canva + Gamma + Higgsfield (schon aktiv)</td></tr>
      <tr><td><strong>Sentry-Setup</strong></td><td>Browser via Playwright (1× initial)</td></tr>
      <tr><td><strong>Hetzner Storage-Box</strong></td><td>Browser via Playwright (1× initial)</td></tr>
      <tr><td><strong>INWX DNS-Records</strong></td><td>XML-RPC-API via curl (kein Browser!)</td></tr>
      <tr><td><strong>LinkedIn-Drafts</strong></td><td>Browser via Playwright, du klickst „Publish"</td></tr>
      <tr><td><strong>Google Ads Setup</strong></td><td>Browser via Playwright</td></tr>
      <tr><td><strong>Mail-Tester</strong></td><td>API direkt via curl</td></tr>
      <tr><td><strong>SSH zu Server</strong></td><td>Bash + ssh-config (wie bisher)</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h1>🆚 Code-Only vs Cowork</h1>

  <table>
    <thead><tr><th>Aspekt</th><th>Code + Playwright</th><th>Cowork</th></tr></thead>
    <tbody>
      <tr><td>Setup-Zeit</td><td><strong>5 Min</strong></td><td>15 Min (2 GB VM)</td></tr>
      <tr><td>Sub-Agents</td><td>✅ funktioniert</td><td>❌ broken (#55712)</td></tr>
      <tr><td>Token-Verbrauch</td><td><strong>normal</strong></td><td>5–10× höher</td></tr>
      <tr><td>npm + Docker</td><td>✅ frei</td><td>❌ blockiert</td></tr>
      <tr><td>Skills</td><td>✅ stabil</td><td>⚠ UI-Bug</td></tr>
      <tr><td>Browser-Steuerung</td><td>✅ via Playwright</td><td>✅ nativ</td></tr>
      <tr><td>Tool-Anzahl</td><td><strong>1</strong></td><td>2</td></tr>
      <tr><td>Mehrkosten</td><td><strong>0 €</strong></td><td>~$10/Mo</td></tr>
    </tbody>
  </table>

  <div class="callout info">
    <strong>💡 Faustregel</strong>
    Du verlierst NICHTS, gewinnst Einfachheit.
  </div>
</div>

<div class="section">
  <h1>🎁 8 Skills für ~/.claude/skills/</h1>
  <p class="lead">Liegen bereit in <code>docs/skills/</code>. Du kopierst sie einmalig.</p>

  <table>
    <thead><tr><th>Skill</th><th>Trigger</th><th>Was es macht</th></tr></thead>
    <tbody>
      <tr><td><code>daily-health-check</code></td><td>„Tagescheck"</td><td>Server + Sales + Bounces + Errors</td></tr>
      <tr><td><code>process-refund</code></td><td>„Erstatte Order #..."</td><td>Stripe + Mail + Audit</td></tr>
      <tr><td><code>publish-blog-post</code></td><td>„Neuer Blog-Artikel"</td><td>SEO + Canva + PR + Newsletter</td></tr>
      <tr><td><code>weekly-kpi-report</code></td><td>„Wochenreport"</td><td>MRR + Funnel → Notion</td></tr>
      <tr><td><code>legal-update-check</code></td><td>„Recht-Update"</td><td>BFSG-News, Diff</td></tr>
      <tr><td><code>outreach-warm-batch</code></td><td>„5 Partner anschreiben"</td><td>Personalisierte DM-Drafts</td></tr>
      <tr><td><code>deploy-scanner-update</code></td><td>„Deploy"</td><td>Tests → PR → Smoke-Test</td></tr>
      <tr><td><code>incident-response</code></td><td>„Site ist down"</td><td>Logs → Diagnose → Rollback</td></tr>
    </tbody>
  </table>

  <h2>Install (2 Min)</h2>
  <pre>cd ~/bfsg-check
cp docs/skills/*.md ~/.claude/skills/</pre>
</div>

<div class="section">
  <h1>✅ Was ich JETZT für dich erledigt habe</h1>
  <ul>
    <li><code>docs/CODE-ONLY-PLAN.md</code> + PDF (diese Datei)</li>
    <li><code>docs/SALES-DAY-1.md</code> + PDF (Tag-1-Sprint)</li>
    <li><code>marketing/linkedin-launch-posts.md</code> — 3 fertige Posts</li>
    <li><code>marketing/partner-warm-dms.md</code> — 5 personalisierbare DM-Vorlagen</li>
    <li><code>docs/skills/*.md</code> — 8 Skill-Files (copy-ready)</li>
    <li><code>scripts/daily-health-check.sh</code> — getestet, lokal ausführbar</li>
    <li><strong>Live-Verifikation:</strong> bfsg-fix.de/health → ok, stripe live, mailer aktiv ✅</li>
  </ul>

  <div class="tldr">
    <h2>✨ TL;DR</h2>
    <ul>
      <li><strong>1 Befehl</strong> für Playwright MCP → Browser-Steuerung aktiv</li>
      <li><strong>0 €</strong> Mehrkosten, Sub-Agents bleiben verfügbar</li>
      <li><strong>8 Skills</strong> bereit zum Kopieren</li>
      <li><strong>Server ist live</strong> — du kannst morgen starten</li>
      <li>Details deiner Aufgaben: <strong>SALES-DAY-1.pdf</strong></li>
    </ul>
  </div>
</div>

</body></html>`;
}

function renderSalesDay1() {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Sales-Day-1</title><style>${sharedCSS}</style></head><body>

<div class="cover">
  <div>
    <div class="cover-brand">BFSG-Check · Sales Day 1</div>
    <div class="cover-title">Morgen<br>der erste<br><em>Verkauf.</em></div>
    <div class="cover-subtitle">8 konkrete Tasks. Heute Abend 30 Min, morgen 75 Min.<br>Realistisch: 1–5 Sales.</div>
    <div class="cover-pills">
      <span class="pill"><strong>30 Min</strong> heute Abend</span>
      <span class="pill"><strong>75 Min</strong> morgen</span>
      <span class="pill"><strong>1–5</strong> erste Sales</span>
    </div>
  </div>
  <div class="cover-foot">
    <div><strong>Für:</strong> Matthias Seba<br>Live: bfsg-fix.de</div>
    <div class="cover-foot-right"><strong>Stand:</strong> 20.06.2026<br>Goal: morgen Verkäufe</div>
  </div>
</div>

<div class="section">
  <h1>🌙 Heute Abend — 30 Minuten</h1>
  <p class="lead">3 Sachen. Pflichtprogramm vor dem Schlafengehen.</p>

  <div class="task-step">
    <div class="step-num">1</div>
    <div class="step-body">
      <h3>Live-Test mit eigener Karte (15 Min) — PFLICHT</h3>
      <p><strong>Warum:</strong> Wenn das nicht klappt, kann morgen kein Kunde kaufen.</p>
      <ol>
        <li>Browser: bfsg-fix.de öffnen</li>
        <li>Gratis-Scan mit deiner eigenen Domain starten</li>
        <li>„Vollreport sichern" → <strong>Basis (199 €)</strong></li>
        <li>Checkout: Verbraucher · Widerrufs-Verzicht · DEINE E-Mail · Zahlungspflichtig bestellen</li>
        <li>Mit eigener Karte bezahlen → 2 Min warten auf Mail (auch Spam!)</li>
        <li>PDF prüfen: Score + Findings + Stand + dein Name im Footer</li>
        <li><strong>Refund:</strong> Stripe → Zahlungen → Test finden → Erstatten</li>
      </ol>
    </div>
  </div>

  <div class="task-step">
    <div class="step-num">2</div>
    <div class="step-body">
      <h3>LinkedIn-Profil scharfmachen (10 Min)</h3>
      <ol>
        <li>Headline: „Gründer BFSG-Check · Compliance-Scans für deutsche Websites · ab 199 €"</li>
        <li>Info-Sektion: 3 Sätze (siehe Vorlage in <code>SALES-DAY-1.md</code>)</li>
        <li>„Aktuelle Position": „Gründer · BFSG-Check"</li>
      </ol>
    </div>
  </div>

  <div class="task-step">
    <div class="step-num">3</div>
    <div class="step-body">
      <h3>Launch-Post vorbereiten (5 Min)</h3>
      <p>Datei <code>marketing/linkedin-launch-posts.md</code> öffnen → Variante A/B/C wählen → in LinkedIn-Drafts. <strong>Noch NICHT posten</strong> — das machen wir morgen 9:00.</p>
    </div>
  </div>
</div>

<div class="section">
  <h1>🌅 Morgen 8:00–9:30 — 60 Minuten</h1>
  <p class="lead">Posten + DMs + Wartet auf Reaktionen.</p>

  <div class="task-step">
    <div class="step-num">4</div>
    <div class="step-body">
      <h3>Launch-Post posten (5 Min)</h3>
      <p>LinkedIn → Draft auswählen → <strong>POSTEN um genau 9:00 Uhr</strong>. Sofort 5 Likes von Bekannten holen (Algorithmus-Push).</p>
    </div>
  </div>

  <div class="task-step">
    <div class="step-num">5</div>
    <div class="step-body">
      <h3>5 Warm-DMs an direkte Kontakte (30 Min)</h3>
      <p><code>marketing/partner-warm-dms.md</code> → 5 personalisierte DMs an Bekannte (Ex-Kollegen, Agentur-Inhaber, Anwälte). Eine pro Person, NICHT copy-paste.</p>
      <p><strong>Zielgruppe:</strong> Leute mit eigener Site, Agentur-Inhaber, IT-Anwälte. KEINE Cold-Kontakte!</p>
    </div>
  </div>

  <div class="task-step">
    <div class="step-num">6</div>
    <div class="step-body">
      <h3>3 personalisierte Scans (15 Min)</h3>
      <p>3 Domains aus deinem LinkedIn-Netzwerk auswählen → Gratis-Scan auf bfsg-fix.de → Score + Top-3 Findings notieren → in DM erwähnen.</p>
    </div>
  </div>

  <div class="task-step">
    <div class="step-num">7</div>
    <div class="step-body">
      <h3>Reaktions-Fenster (10 Min)</h3>
      <p>30 Min nach dem Post am Phone bleiben → jeden Kommentar/Like in 5 Min beantworten. Algorithmus liebt das.</p>
    </div>
  </div>
</div>

<div class="section">
  <h1>🌞 Morgen Mittag — Inbox-Check</h1>

  <div class="task-step">
    <div class="step-num">8</div>
    <div class="step-body">
      <h3>Reaktion auf Antworten (alle 2 Std)</h3>
      <ol>
        <li>Auf jede DM-Antwort in 60 Min reagieren</li>
        <li>Bei „Interessiert" → Stripe-Payment-Link senden</li>
        <li><strong>Falls erster Verkauf:</strong> persönliche Mail + LinkedIn-Story-Update („Erster Kunde 🎉")</li>
      </ol>
    </div>
  </div>

  <h2>🎯 Realistische Tag-1-Ziele</h2>
  <table>
    <thead><tr><th>Ziel</th><th>Konservativ</th><th>Stretch</th></tr></thead>
    <tbody>
      <tr><td>Post-Impressionen</td><td>500</td><td>2.000</td></tr>
      <tr><td>Direkte Reaktionen</td><td>10</td><td>50</td></tr>
      <tr><td>DM-Antworten (von 5)</td><td>2</td><td>4</td></tr>
      <tr><td>Gratis-Scans gestartet</td><td>5</td><td>20</td></tr>
      <tr><td><strong>Bezahlte Verkäufe</strong></td><td><strong>1</strong></td><td><strong>3–5</strong></td></tr>
      <tr><td>Umsatz</td><td>199 €</td><td>600–1.500 €</td></tr>
    </tbody>
  </table>

  <div class="callout warn">
    <strong>⚠ Was du NICHT machst</strong>
    <ol>
      <li>Keine Cold-Mails (UWG-Risiko 1.000–5.000 €/Mail)</li>
      <li>Keine Google Ads (warte auf Anwalts-OK + erste Sales-Daten)</li>
      <li>Keine Mass-DMs (max 10/Tag, sonst LinkedIn-Ban)</li>
      <li>Keine Aggressiv-Sells</li>
    </ol>
  </div>

  <div class="callout info">
    <strong>🆘 Wenn morgen nichts klappt</strong>
    0 Verkäufe Tag 1 ist NORMAL für neues B2B-SaaS. Tag-7-Ziel ist realistischer. Wir probieren trotzdem.
  </div>

  <div class="tldr">
    <h2>✨ Deine 8 Tasks im Überblick</h2>
    <ul>
      <li><strong>1.</strong> Live-Test mit Karte (heute, 15 Min)</li>
      <li><strong>2.</strong> LinkedIn-Profil (heute, 10 Min)</li>
      <li><strong>3.</strong> Launch-Post wählen (heute, 5 Min)</li>
      <li><strong>4.</strong> Posten morgen 9:00 (5 Min)</li>
      <li><strong>5.</strong> 5 Warm-DMs (30 Min)</li>
      <li><strong>6.</strong> 3 Scans (15 Min)</li>
      <li><strong>7.</strong> Reaktions-Fenster (10 Min)</li>
      <li><strong>8.</strong> Inbox-Check mittags</li>
    </ul>
    <p style="margin-top: 6mm; font-size: 14pt; font-weight: 600; text-align: center;">Du machst das. 💪</p>
  </div>
</div>

</body></html>`;
}

async function generate(html, outPdf) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: outPdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log('PDF:', outPdf);
  } finally {
    await browser.close();
  }
}

async function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  await mkdir(docsDir, { recursive: true });

  await generate(renderCodeOnlyPlan(), path.join(docsDir, 'CODE-ONLY-PLAN.pdf'));
  await generate(renderSalesDay1(), path.join(docsDir, 'SALES-DAY-1.pdf'));
}

main().catch((err) => { console.error('FAILED:', err); process.exit(1); });
