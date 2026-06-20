#!/usr/bin/env node
// Generiert docs/COWORK-HYBRID-PLAN.pdf - visueller Hybrid-Plan
// Cowork + Claude Code, Brand-Design, kindgerechte Sprache.

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PDF = path.join(__dirname, '..', 'docs', 'COWORK-HYBRID-PLAN.pdf');
const OUT_HTML = path.join(__dirname, '..', 'docs', 'COWORK-HYBRID-PLAN.html');

const NAVY = '#2E2A6B';
const NAVY_DARK = '#1f1c4d';
const MINT = '#1FBF8E';
const MINT_DARK = '#10996f';
const CORAL = '#FF6B6B';
const AMBER = '#F59E0B';
const PURPLE = '#A855F7';
const PAPER = '#FAFAF7';
const INK = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';

function renderHtml() {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>Cowork-Hybrid-Plan</title>
<style>
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  @page :first { margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${INK}; background: ${PAPER}; font-size: 11pt; line-height: 1.5; }

  /* COVER */
  .cover {
    height: 297mm; width: 210mm;
    background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 45%, ${PURPLE} 130%);
    color: white;
    padding: 32mm 22mm;
    display: flex; flex-direction: column; justify-content: space-between;
    page-break-after: always; break-after: page;
  }
  .cover-brand { font-size: 14pt; letter-spacing: 2px; opacity: 0.85; font-weight: 600; text-transform: uppercase; }
  .cover-title { font-size: 40pt; font-weight: 800; line-height: 1.05; margin-top: 18mm; }
  .cover-title em { color: ${MINT}; font-style: normal; }
  .cover-subtitle { font-size: 16pt; opacity: 0.92; margin-top: 6mm; font-weight: 400; line-height: 1.4; }
  .cover-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14mm; }
  .pill { background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 999px; font-size: 10pt; }
  .pill strong { color: ${MINT}; }
  .cover-foot { font-size: 9pt; opacity: 0.7; display: flex; justify-content: space-between; align-items: end; }
  .cover-foot-right { text-align: right; }
  .cover-foot strong { color: ${MINT}; }

  /* SECTIONS */
  .section { break-before: page; page-break-before: always; padding-top: 4mm; }
  .section h1 { color: ${NAVY}; font-size: 22pt; margin: 0 0 4mm; border-bottom: 3px solid ${MINT}; padding-bottom: 3mm; }
  .section h2 { color: ${NAVY}; font-size: 16pt; margin: 8mm 0 3mm; }
  .section h3 { color: ${NAVY_DARK}; font-size: 12pt; margin: 5mm 0 2mm; }
  .section p { margin: 0 0 3mm; }
  .section ul, .section ol { padding-left: 6mm; margin: 0 0 4mm; }
  .section li { margin-bottom: 2mm; line-height: 1.5; }

  .lead { font-size: 13pt; color: ${MUTED}; line-height: 1.6; margin-bottom: 6mm; }

  /* DECISION HERO BOX */
  .decision-hero {
    background: linear-gradient(135deg, ${MINT} 0%, ${MINT_DARK} 100%);
    color: white;
    padding: 8mm;
    border-radius: 10px;
    margin: 6mm 0;
    text-align: center;
  }
  .decision-hero p { font-size: 13pt; margin: 0; font-weight: 600; line-height: 1.5; }

  /* TABLES */
  table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 10pt; }
  th { background: ${NAVY}; color: white; padding: 3mm 4mm; text-align: left; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
  td { border-bottom: 1px solid ${BORDER}; padding: 3mm 4mm; background: white; vertical-align: top; }
  td code { background: #F1F5F9; padding: 1px 4px; border-radius: 3px; font-size: 9pt; color: #BE185D; font-family: "SF Mono", Menlo, Consolas, monospace; }

  /* CONTRAST CARDS (Code vs Cowork) */
  .duo { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; margin: 6mm 0; }
  .duo-card { background: white; border: 2px solid ${BORDER}; border-radius: 8px; padding: 5mm 6mm; page-break-inside: avoid; }
  .duo-card.code { border-color: ${NAVY}; }
  .duo-card.cowork { border-color: ${PURPLE}; }
  .duo-card h3 { font-size: 13pt; margin: 0 0 3mm; text-transform: uppercase; letter-spacing: 1px; }
  .duo-card.code h3 { color: ${NAVY}; }
  .duo-card.cowork h3 { color: ${PURPLE}; }
  .duo-card ul { padding-left: 5mm; margin: 0; font-size: 10pt; }
  .duo-card li { margin-bottom: 1.5mm; }

  /* ASCII-art / pre */
  pre { background: ${NAVY_DARK}; color: #E2E8F0; padding: 4mm; border-radius: 6px; font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 8.5pt; line-height: 1.4; overflow-x: auto; white-space: pre; margin: 3mm 0; }

  /* CALLOUT BOXES */
  .callout { border-left: 4px solid; padding: 4mm 5mm; margin: 4mm 0; border-radius: 0 6px 6px 0; background: white; page-break-inside: avoid; }
  .callout.warn { border-left-color: ${CORAL}; background: #FEF2F2; }
  .callout.info { border-left-color: ${NAVY}; background: #F1F5F9; }
  .callout.good { border-left-color: ${MINT}; background: #ECFDF5; }
  .callout.tip { border-left-color: ${AMBER}; background: #FFFBEB; }
  .callout strong { display: block; margin-bottom: 1mm; font-size: 10.5pt; }
  .callout p { margin: 0; font-size: 10pt; }

  /* STEP CARDS */
  .step { background: white; border: 1px solid ${BORDER}; border-radius: 8px; padding: 5mm; margin-bottom: 4mm; page-break-inside: avoid; display: flex; gap: 4mm; align-items: flex-start; }
  .step-num { background: ${MINT}; color: white; min-width: 12mm; height: 12mm; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: 800; font-size: 13pt; flex-shrink: 0; }
  .step-body h3 { margin: 0 0 2mm; font-size: 13pt; color: ${NAVY}; }
  .step-body p { margin: 0 0 2mm; font-size: 10.5pt; }
  .step-body ol { margin: 1mm 0; padding-left: 5mm; font-size: 10pt; }
  .step-body code { background: #F1F5F9; padding: 1px 4px; border-radius: 3px; font-size: 9.5pt; color: #BE185D; }

  /* TL;DR FOOTER */
  .tldr {
    background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%);
    color: white;
    padding: 10mm;
    border-radius: 10px;
    margin-top: 8mm;
  }
  .tldr h2 { color: ${MINT}; margin: 0 0 4mm; font-size: 18pt; }
  .tldr ul { padding-left: 5mm; font-size: 11pt; }
  .tldr li { margin-bottom: 2mm; }
  .tldr strong { color: ${MINT}; }

  /* SKILL TABLE */
  .skill-name { font-family: "SF Mono", monospace; font-size: 9.5pt; color: ${PURPLE}; font-weight: 600; }

  /* RULE BOX */
  .rule {
    background: ${MINT};
    color: white;
    padding: 5mm 7mm;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12pt;
    text-align: center;
    margin: 5mm 0;
  }

  /* page break helper */
  .pb { display: block; height: 0; page-break-after: always; break-after: page; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div>
    <div class="cover-brand">BFSG-Check · Cowork-Hybrid-Plan</div>
    <div class="cover-title">Behalte<br>was funktioniert.<br>Erweitere mit<br><em>Cowork.</em></div>
    <div class="cover-subtitle">3 spezialisierte Agenten haben recherchiert. Hier ist die Antwort.</div>
    <div class="cover-pills">
      <span class="pill"><strong>15 Min</strong> Setup</span>
      <span class="pill"><strong>7 Tage</strong> Übergang</span>
      <span class="pill"><strong>~$10</strong> Mehrkosten/Monat</span>
      <span class="pill"><strong>10–25 Sales</strong> in 14 Tagen</span>
    </div>
  </div>
  <div class="cover-foot">
    <div>
      <strong>Für:</strong> Matthias Seba<br>
      Lange Straße 20, 27449 Kutenholz
    </div>
    <div class="cover-foot-right">
      <strong>Stand:</strong> 18.06.2026<br>
      Hybrid-Empfehlung v1.0
    </div>
  </div>
</div>

<!-- SECTION 1: ENTSCHEIDUNG -->
<div class="section">
  <h1>🎯 Die Entscheidung</h1>
  <p class="lead">3 spezialisierte Research-Agenten haben 5 Sub-Studien zu Cowork-Fähigkeiten, Marketing-Beschleunigung und Wissens-Migration durchgeführt. Hier das Ergebnis in einem Satz:</p>

  <div class="decision-hero">
    <p>Behalte Claude Code für Coding, schalte Cowork für Marketing + Browser DAZU.<br>Beide auf demselben Pro-Abo. Du gewinnst Cowork-Stärken ohne Code-Stärken zu verlieren.</p>
  </div>

  <h2>Warum NICHT umstellen?</h2>
  <table>
    <thead><tr><th>Cowork-Schwäche</th><th>Was es bedeutet</th><th>Quelle</th></tr></thead>
    <tbody>
      <tr><td><strong>Keine Sub-Agents</strong></td><td>Cowork kann nicht 4 Agenten parallel arbeiten lassen. Bricht mit „Prompt is too long".</td><td>GitHub Issue #55712</td></tr>
      <tr><td><strong>Sandbox blockiert npm + Docker</strong></td><td>Kein <code>npm install</code> oder <code>docker compose up</code> möglich.</td><td>GitHub Issue #43334</td></tr>
      <tr><td><strong>5–10× höherer Token-Verbrauch</strong></td><td>Ständige Screenshots — jede Aktion teuer.</td><td>Cowork-Architektur-Studien</td></tr>
    </tbody>
  </table>

  <div class="callout warn">
    <strong>⚠ Was du verlierst</strong>
    <p>Genau die Sache, die in den letzten Tagen 34 PRs in den Repo gebracht hat — Multi-Agent-Sprints (z. B. 4 parallele QA-Agents).</p>
  </div>

  <h2>Warum Cowork trotzdem DAZU?</h2>
  <table>
    <thead><tr><th>Cowork-Stärke</th><th>Was es bedeutet</th></tr></thead>
    <tbody>
      <tr><td><strong>Browser-nativ</strong></td><td>Steuert direkt Stripe, Notion, Brevo, INWX, LinkedIn — keine MCP-Setups nötig</td></tr>
      <tr><td><strong>Eingebaut in Desktop-App</strong></td><td>10 Min Setup (Toggle in Settings). Kein WSL2, kein CLI</td></tr>
      <tr><td><strong>Schon im Abo</strong></td><td>1 Claude Pro ($20) deckt Cowork + Claude Code</td></tr>
    </tbody>
  </table>
</div>

<!-- SECTION 2: AUFGABEN-VERTEILUNG -->
<div class="section">
  <h1>🧠 Wer macht was?</h1>
  <p class="lead">Klare Trennung. Du musst dir nur eine Faustregel merken.</p>

  <div class="rule">Browser-Tasks → Cowork · Editor/Terminal-Tasks → Claude Code</div>

  <div class="duo">
    <div class="duo-card code">
      <h3>🛠 Claude Code (Maschinenraum)</h3>
      <ul>
        <li>Multi-Agent-Sprints (4 Agenten parallel)</li>
        <li>Code-Refactor (scanner/, landingpage-next/)</li>
        <li>Git-Arbeit (Bisect, Rebase, Merge-Conflicts)</li>
        <li>Test-Suite + Playwright-Debug</li>
        <li>CI/CD-Hooks bauen</li>
        <li>PR-Webhooks subscriben</li>
        <li>Lange Logs durchsuchen (ripgrep)</li>
        <li>Neue Skills/Hooks bauen</li>
      </ul>
    </div>
    <div class="duo-card cowork">
      <h3>🌐 Cowork (Front-Office)</h3>
      <ul>
        <li>Stripe-Dashboard (Refunds, MRR, Keys)</li>
        <li>Brevo-UI (Newsletter, Templates)</li>
        <li>Notion-Pflege (Pipeline, Dashboards)</li>
        <li>INWX (DNS-Records klicken)</li>
        <li>Hetzner-Dashboard (Monitoring)</li>
        <li>LinkedIn (Posts, DMs, Profil)</li>
        <li>Google Ads (Kampagnen-UI)</li>
        <li>Sentry (Error-Triage)</li>
      </ul>
    </div>
  </div>

  <h2>Konkrete Beispiele</h2>
  <table>
    <thead><tr><th>Aufgabe</th><th>Tool</th><th>Cowork-Befehl</th></tr></thead>
    <tbody>
      <tr><td>Tagescheck (5 Min)</td><td>Cowork</td><td><em>„Mach den Tagescheck — Stripe + Brevo + Sentry"</em></td></tr>
      <tr><td>Refund verarbeiten</td><td>Cowork</td><td><em>„Erstatte Order #cs_live_xxx vollständig"</em></td></tr>
      <tr><td>Multi-Agent-Sprint</td><td>Code</td><td>(wie bisher in Claude Code)</td></tr>
      <tr><td>Wöchentlicher KPI-Report</td><td>Cowork</td><td><em>„Mach den Wochenreport mit Notion + Gamma-Slides"</em></td></tr>
      <tr><td>Code-Refactor scanner/</td><td>Code</td><td>(wie bisher)</td></tr>
      <tr><td>10 Partner-DMs (Draft)</td><td>Cowork</td><td><em>„10 LinkedIn-DMs an Agenturen aus partner-targets.md"</em></td></tr>
      <tr><td>Live-Bug debuggen</td><td>Code</td><td>(Logs + Tests im Terminal)</td></tr>
      <tr><td>Site-Outage-Triage</td><td>Cowork</td><td><em>„Site ist down — check Caddy/Docker-Logs + Rollback wenn nötig"</em></td></tr>
    </tbody>
  </table>
</div>

<!-- SECTION 3: SETUP -->
<div class="section">
  <h1>🚀 Setup in 15 Minuten</h1>
  <p class="lead">3 Schritte. Einmalig. Danach Routine.</p>

  <div class="step">
    <div class="step-num">1</div>
    <div class="step-body">
      <h3>Cowork aktivieren (10 Min)</h3>
      <ol>
        <li>Windows-Systemsteuerung → „Windows-Features aktivieren/deaktivieren" → ☑ <strong>Plattform für virtuelle Computer</strong> → Reboot</li>
        <li>Claude Desktop App öffnen → Settings (Zahnrad) → <strong>General</strong> → Toggle <strong>„Computer use"</strong> EIN</li>
        <li>Beim ersten Cowork-Start lädt ~2 GB Linux-VM (einmalig, paar Minuten)</li>
      </ol>
    </div>
  </div>

  <div class="step">
    <div class="step-num">2</div>
    <div class="step-body">
      <h3>MCPs in Cowork verbinden (3 Min)</h3>
      <p>Cowork nutzt die gleichen MCP-Configs wie deine Desktop-App. In <strong>Settings → Customize</strong>:</p>
      <ol>
        <li>✅ GitHub (Repo-Zugriff)</li>
        <li>✅ Notion (Knowledge-Hub)</li>
        <li>✅ Stripe (Order-Lookups, Refunds)</li>
        <li>✅ Brevo (Newsletter, Templates)</li>
        <li>✅ Porter Metrics (Ads-Reports)</li>
        <li>Optional Welle 2: Canva, Gamma, Higgsfield, Google Drive</li>
      </ol>
    </div>
  </div>

  <div class="step">
    <div class="step-num">3</div>
    <div class="step-body">
      <h3>Bitwarden-Extension in Cowork-Chrome (2 Min)</h3>
      <ol>
        <li>In der Cowork-Sandbox Chrome öffnen → Web Store → <strong>Bitwarden</strong> installieren</li>
        <li>Login. Damit muss Claude nicht jedes Mal nach Passwort fragen.</li>
      </ol>
    </div>
  </div>

  <div class="callout good">
    <strong>✓ Fertig wenn:</strong>
    <p>Du sagst <em>„Cowork, geh auf bfsg-fix.de/health und sag mir was zurückkommt"</em> — Browser öffnet, Cowork klickt durch, gibt Ergebnis zurück.</p>
  </div>
</div>

<!-- SECTION 4: 8 SKILLS -->
<div class="section">
  <h1>🎁 8 Custom Skills für Cowork</h1>
  <p class="lead">Skills = wiederverwendbare Workflows. Du tippst nur den Trigger-Satz.</p>

  <table>
    <thead><tr><th>Skill</th><th>Trigger</th><th>Was es macht</th></tr></thead>
    <tbody>
      <tr><td><span class="skill-name">daily-health-check</span></td><td><em>„Tagescheck"</em></td><td>Stripe + Brevo + Sentry + Notion → 1 Report</td></tr>
      <tr><td><span class="skill-name">process-refund</span></td><td><em>„Erstatte Order #..."</em></td><td>Stripe-Suche → Refund → Kunden-Mail → Audit-Log</td></tr>
      <tr><td><span class="skill-name">publish-blog-post</span></td><td><em>„Neuer Blog-Artikel über X"</em></td><td>SEO-Keywords → Draft → Canva-Header → PR → Newsletter</td></tr>
      <tr><td><span class="skill-name">weekly-kpi-report</span></td><td><em>„Wochenreport"</em></td><td>MRR + Ads + Leads → Notion + Gamma-Slides</td></tr>
      <tr><td><span class="skill-name">legal-update-check</span></td><td><em>„Recht-Update"</em></td><td>BFSG-News crawlen, Diff, Issue falls Änderung</td></tr>
      <tr><td><span class="skill-name">outreach-cold-batch</span></td><td><em>„10 Partner anschreiben"</em></td><td>Targets → personalisieren → Brevo-Send</td></tr>
      <tr><td><span class="skill-name">deploy-scanner-update</span></td><td><em>„Deploy Scanner neu"</em></td><td>Tests → git push → SSH Pull → Smoke-Test</td></tr>
      <tr><td><span class="skill-name">incident-response</span></td><td><em>„Site ist down"</em></td><td>Logs → Diff letzter Commit → Rollback bereit</td></tr>
    </tbody>
  </table>

  <div class="callout info">
    <strong>💡 Wo liegen Skills?</strong>
    <p>Als Markdown-Files in <code>~/.claude/skills/</code> (auf deinem Windows-PC). Wir bauen sie in Tag 3 + 4 des Übergangs-Sprints.</p>
  </div>
</div>

<!-- SECTION 5: KNOWLEDGE-HUB -->
<div class="section">
  <h1>🗂️ Wo lebt das Wissen?</h1>
  <p class="lead">3 Orte, klare Rollen. Konflikte werden vermieden durch eine Single-Source-Regel.</p>

  <pre>        ┌────────────────────────────┐
        │  GitHub Repo (Master)      │  ← du editierst hier (immer)
        │  bfsg-check/               │
        │  - docs/  (markdown)       │
        │  - .claude/ (hooks, perms) │
        │  - scanner/, *-next/       │
        └────────────┬───────────────┘
                     │
        ┌────────────┴───────────────┐
        │                            │
   git clone                  GitHub Action
   (Cowork-Sandbox)          (täglich 06:00)
        │                            │
        ▼                            ▼
   ┌────────┐                ┌──────────────┐
   │ Cowork │◄──── MCP ────► │   Notion     │
   │ + Code │                │  „BFSG Hub"  │
   └────────┘                └──────────────┘</pre>

  <div class="rule">Repo schreibt, Notion liest. Edits IMMER via PR.</div>

  <h2>Was wandert wohin?</h2>
  <table>
    <thead><tr><th>Typ</th><th>Ort</th></tr></thead>
    <tbody>
      <tr><td>Code, Configs, Hooks</td><td><strong>Repo</strong> (wie bisher)</td></tr>
      <tr><td>Runbooks, Stammdaten, Pricing, KPIs</td><td><strong>Notion</strong> (Cowork-Hub) + Repo (Master)</td></tr>
      <tr><td>Wiederkehrende Handgriffe</td><td><strong>Cowork-Skills</strong></td></tr>
      <tr><td>Sales-Pipeline, Leads, Deal-Stages</td><td><strong>Notion</strong> (CRM)</td></tr>
      <tr><td>Deploy-Log, Incident-Reports</td><td><strong>Notion</strong> + GitHub Issues</td></tr>
    </tbody>
  </table>
</div>

<!-- SECTION 6: 7-TAGE-SPRINT -->
<div class="section">
  <h1>📅 7-Tage-Übergangs-Sprint</h1>
  <p class="lead">Soft-Cut. Du bist immer arbeitsfähig, auch wenn ein Schritt scheitert.</p>

  <div class="step">
    <div class="step-num">1</div>
    <div class="step-body">
      <h3>Tag 1 — Cowork einschalten</h3>
      <p>Setup-Schritte 1-3 oben. Verifikations-Test: <em>„Lies bfsg-fix.de/health und SSH zu bfsg, zeig docker compose ps"</em></p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">2</div>
    <div class="step-body">
      <h3>Tag 2 — Notion-Hub anlegen</h3>
      <p>Datenbank „BFSG Runbooks" erstellen. 12 wichtigste docs (LEGAL-PLACEHOLDERS, PRICING-DECISION, STRIPE-LIVE-TESTKAUF, etc.) nach Notion spiegeln.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">3</div>
    <div class="step-body">
      <h3>Tag 3-4 — 8 Skills bauen</h3>
      <p>Skills 1-4 (daily-health-check, process-refund, publish-blog-post, weekly-kpi-report). Skills 5-8 (legal-update-check, outreach-cold-batch, deploy-scanner-update, incident-response). Jeden Skill 1× live durchspielen.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">4</div>
    <div class="step-body">
      <h3>Tag 5 — Marketing-Setup</h3>
      <p>Brevo-Sender-Auth abschließen. Google-Ads-Konto vorbereiten. Erste LinkedIn-DMs an Agentur-Partner.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">5</div>
    <div class="step-body">
      <h3>Tag 6 — Parallel-Test-Tag</h3>
      <p>Einen ganzen Tag NUR mit Cowork arbeiten. Notieren: Wo musst du zurück zu Claude Code wechseln? Diese Lücken als Skill-V2 nachziehen.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">6</div>
    <div class="step-body">
      <h3>Tag 7 — Soft-Cut</h3>
      <p>Cowork = Default für Marketing, Stripe, Notion, Browser. Claude Code = Default für Coding, Multi-Agent-Sprints, Refactors.</p>
    </div>
  </div>
</div>

<!-- SECTION 7: KOSTEN + RISIKEN -->
<div class="section">
  <h1>💰 Kosten + 5 Sachen für DICH</h1>

  <h2>Was kostet das?</h2>
  <table>
    <thead><tr><th>Posten</th><th>Kosten</th></tr></thead>
    <tbody>
      <tr><td>Claude Pro Abo</td><td>$20/Mo (hast du schon)</td></tr>
      <tr><td>Cowork-Aktivierung</td><td>$0 (eingebaut)</td></tr>
      <tr><td>Claude Code</td><td>$0 (eingebaut)</td></tr>
      <tr><td>Token-Verbrauch Cowork extra</td><td>~$10/Mo</td></tr>
      <tr><td><strong>Total Mehrkosten</strong></td><td><strong>~$10/Mo</strong></td></tr>
    </tbody>
  </table>

  <div class="callout tip">
    <strong>💡 Upgrade auf Max ($100/Mo, 5× Quota)?</strong>
    <p>Erst beobachten — wenn du intensiv Cowork + viele Multi-Agent-Sprints fährst, dann ja. Sonst Pro reicht.</p>
  </div>

  <h2>5 Sachen, die du NIE delegieren darfst</h2>
  <ol>
    <li><strong>Anwalt-OK + Versicherungs-Police</strong> — keine Cowork-Aktion ersetzt diese Papier-Bestätigungen</li>
    <li><strong>LinkedIn-Mass-DMs</strong> — niemals automatisiert (LinkedIn-Ban + UWG-Risiko). Cowork darf nur DRAFTS, du klickst „Senden"</li>
    <li><strong>Stripe-Refunds + Steuer-Rechnungen</strong> — Buchhaltung musst du kontrollieren (Umsatzsteuer Reverse-Charge bei AT/CH-Käufen)</li>
    <li><strong>Cold-Mail-Sperre nicht aufheben</strong> — auch wenn Cowork „klügere" Vorschläge macht. 1.000–5.000 € Abmahn-Risiko pro Mail</li>
    <li><strong>Pricing-Änderungen &gt; 20 %</strong> — A/B-Tests ok, aber globale Preisänderungen nur mit deinem Sign-off</li>
  </ol>
</div>

<!-- SECTION 8: IMPACT + TL;DR -->
<div class="section">
  <h1>🎯 Erwarteter Impact in 14 Tagen</h1>

  <table>
    <thead><tr><th>Metrik</th><th>Konservativ</th><th>Stretch</th></tr></thead>
    <tbody>
      <tr><td>Gratis-Scans gestartet</td><td>300</td><td>600</td></tr>
      <tr><td>Paid Conversions</td><td>10 (~2.500 €)</td><td>25 (~6.000 €)</td></tr>
      <tr><td>Re-Check-Abos</td><td>2</td><td>6</td></tr>
      <tr><td>MRR</td><td>78 €</td><td>234 €</td></tr>
      <tr><td>LinkedIn-Follower</td><td>+50</td><td>+150</td></tr>
      <tr><td>Partner-Connected</td><td>15/30 DMs</td><td>25/30</td></tr>
      <tr><td>Scan→Purchase-Rate</td><td>2 %</td><td>4 %</td></tr>
      <tr><td>Dein manueller Aufwand</td><td>30 Min/Tag</td><td>60 Min/Tag</td></tr>
    </tbody>
  </table>

  <div class="tldr">
    <h2>✨ TL;DR</h2>
    <ul>
      <li><strong>Behalte Claude Code</strong> — für Coding, Multi-Agent, deine Stärke</li>
      <li><strong>Schalte Cowork dazu</strong> — für Browser, Marketing, Stripe-Dashboard</li>
      <li><strong>15 Min Setup heute, 7 Tage Übergang, danach Routine</strong></li>
      <li><strong>~$10/Monat Mehrkosten</strong>, dafür ~30 Min/Tag manuell statt 2 h</li>
      <li><strong>Realistisch 10–25 Sales + 78–234 € MRR in 14 Tagen</strong></li>
    </ul>
    <p style="margin-top: 6mm; font-size: 14pt; font-weight: 600; text-align: center;">Du machst das. 💪</p>
  </div>
</div>

</body>
</html>`;
}

async function main() {
  const html = renderHtml();
  await mkdir(path.dirname(OUT_PDF), { recursive: true });
  await writeFile(OUT_HTML, html, 'utf8');
  console.log(`HTML: ${OUT_HTML}`);

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: OUT_PDF, format: 'A4', printBackground: true, preferCSSPageSize: true
    });
  } finally {
    await browser.close();
  }
  console.log(`PDF: ${OUT_PDF}`);
}

main().catch((err) => { console.error('FAILED:', err); process.exit(1); });
