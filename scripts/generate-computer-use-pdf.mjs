#!/usr/bin/env node
// Generiert docs/COMPUTER-USE-AKTIVIEREN.pdf — kindgerechte Schritt-für-Schritt-Anleitung.

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PDF = path.join(__dirname, '..', 'docs', 'COMPUTER-USE-AKTIVIEREN.pdf');

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

const steps = [
  {
    num: '1', time: '2 Min', title: 'App aktualisieren',
    why: 'Computer Use gibt es erst seit April 2026. Deine App muss neu genug sein.',
    items: [
      'Browser öffnen → <code>claude.com/download</code> eingeben',
      '<strong>„Download for Windows"</strong> klicken',
      'Heruntergeladene Datei doppelklicken → installieren',
      'Falls gefragt „App ersetzen?" → <strong>Ja</strong>',
      'Claude Desktop App öffnen'
    ],
    done: 'Die App startet ohne Update-Hinweis.'
  },
  {
    num: '2', time: '1 Min', title: 'Einstellungen öffnen',
    why: 'Hier liegt der Schalter, den wir brauchen.',
    items: [
      'Das <strong>Zahnrad-Symbol ⚙️</strong> suchen (das sind die „Settings")',
      'Draufklicken',
      'Links im Menü auf <strong>„General"</strong> klicken'
    ],
    done: 'Du siehst eine Seite mit Schaltern und einem Bereich „Desktop app".'
  },
  {
    num: '3', time: '30 Sek', title: 'Den Schalter umlegen',
    why: 'DAS ist der wichtigste Schritt!',
    highlight: true,
    items: [
      'Im Bereich <strong>„Desktop app"</strong> den Eintrag <strong>„Computer use"</strong> suchen',
      'Den <strong>Schalter daneben anklicken</strong> → von grau (aus) auf farbig (an)',
      'Falls Warnung erscheint → lesen + <strong>„Aktivieren / Enable"</strong> klicken'
    ],
    done: 'Der Schalter ist farbig/an.'
  },
  {
    num: '4', time: '30 Sek', title: 'Zu Claude Code wechseln',
    why: 'Damit du im richtigen Modus arbeitest.',
    items: [
      'Oben/seitlich gibt es einen Umschalter: <strong>„Chat" · „Cowork" · „Code"</strong>',
      'Auf <strong>„Code"</strong> klicken (das ist Claude Code!)',
      'Ein neues Chat-Fenster öffnet sich'
    ],
    done: 'Du bist im „Code"-Modus.'
  },
  {
    num: '5', time: '1 Min', title: 'Ersten Test machen',
    why: 'Beweisen, dass alles funktioniert.',
    items: [
      'Ins Eingabefeld tippen: <code>Öffne den Browser und gehe auf bfsg-fix.de. Sag mir was du siehst.</code>',
      'Enter drücken',
      '<strong>Erlaubnis-Fenster</strong> erscheint („Claude möchte Chrome benutzen") → <strong>„Erlauben / Allow"</strong>',
      'Browser öffnet sich, Claude klickt selbst herum',
      'Claude sagt dir, was es sieht'
    ],
    done: 'Der Browser hat sich von selbst geöffnet. 🎉'
  }
];

const security = [
  ['Nicht blind „immer erlauben" klicken', 'Vor allem bei Stripe/Geld-Sachen jedes Mal selbst prüfen'],
  ['Online-Banking + Passwort-Manager schließen', 'Bevor Claude arbeitet — sicher ist sicher'],
  ['Dabei bleiben, nicht über Nacht laufen lassen', 'Du sollst zuschauen können'],
  ['Nur nötige Seiten erlauben', 'Weniger Risiko']
];

const troubleshoot = [
  ['„Ich finde den Schalter nicht"', 'App nicht aktuell → Schritt 1 nochmal (claude.com/download)'],
  ['„Schalter ist ausgegraut"', 'Du hast Team/Enterprise → Computer Use braucht Pro oder Max'],
  ['„Browser öffnet sich nicht"', 'Erlaubnis-Fenster übersehen? Aufgabe nochmal, auf „Allow" achten'],
  ['„Claude kann Computer nicht benutzen"', 'Schritt 3 prüfen: Schalter wirklich an? App neu starten']
];

function renderStep(s) {
  return `
  <div class="step ${s.highlight ? 'step-highlight' : ''}">
    <div class="step-head">
      <div class="step-num">${s.num}</div>
      <div class="step-titles">
        <div class="step-title">${s.title}</div>
        <span class="time-chip">⏱ ${s.time}</span>
      </div>
    </div>
    <div class="step-why"><strong>Warum:</strong> ${s.why}</div>
    <ol class="step-items">${s.items.map(i => `<li>${i}</li>`).join('')}</ol>
    <div class="step-done">✓ <strong>Fertig wenn:</strong> ${s.done}</div>
  </div>`;
}

function renderHtml() {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Computer Use aktivieren</title>
<style>
  @page { size: A4; margin: 14mm; }
  @page :first { margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${INK}; background: ${PAPER}; font-size: 11pt; line-height: 1.5; }

  .cover { height: 297mm; width: 210mm; background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 55%, ${MINT_DARK} 130%); color: white; padding: 34mm 24mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; break-after: page; }
  .cover-brand { font-size: 14pt; letter-spacing: 2px; opacity: 0.85; font-weight: 600; text-transform: uppercase; }
  .cover-title { font-size: 40pt; font-weight: 800; line-height: 1.08; margin-top: 18mm; }
  .cover-title em { color: ${MINT}; font-style: normal; }
  .cover-subtitle { font-size: 16pt; opacity: 0.92; margin-top: 6mm; font-weight: 400; line-height: 1.4; }
  .cover-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14mm; }
  .pill { background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 999px; font-size: 10pt; }
  .pill strong { color: ${MINT}; }
  .cover-foot { font-size: 9pt; opacity: 0.7; display: flex; justify-content: space-between; align-items: end; }
  .cover-foot-right { text-align: right; }
  .cover-foot strong { color: ${MINT}; }

  .section { padding-top: 4mm; }
  .section h1 { color: ${NAVY}; font-size: 22pt; margin: 0 0 4mm; border-bottom: 3px solid ${MINT}; padding-bottom: 3mm; }
  .section h2 { color: ${NAVY}; font-size: 15pt; margin: 8mm 0 3mm; }
  .lead { font-size: 12pt; color: ${MUTED}; line-height: 1.6; margin-bottom: 6mm; }
  p { margin: 0 0 3mm; }
  code { background: #F1F5F9; padding: 1px 5px; border-radius: 3px; font-size: 9.5pt; color: #BE185D; font-family: "SF Mono", Menlo, Consolas, monospace; }

  .req-table, .sec-table, .ts-table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 10pt; }
  .req-table th, .sec-table th, .ts-table th { background: ${NAVY}; color: white; padding: 3mm 4mm; text-align: left; font-size: 9pt; text-transform: uppercase; }
  .req-table td, .sec-table td, .ts-table td { border-bottom: 1px solid ${BORDER}; padding: 3mm 4mm; background: white; vertical-align: top; }

  .what-box { background: white; border-left: 4px solid ${MINT}; padding: 5mm 6mm; border-radius: 0 8px 8px 0; margin: 5mm 0; }
  .what-box ul { padding-left: 5mm; margin: 2mm 0; }

  .steps-page { break-before: page; page-break-before: always; padding-top: 2mm; }
  .step { background: white; border: 1px solid ${BORDER}; border-radius: 10px; padding: 5mm 6mm; margin-bottom: 4mm; page-break-inside: avoid; }
  .step-highlight { border: 2px solid ${MINT}; box-shadow: 0 0 0 3px rgba(31,191,142,0.12); }
  .step-head { display: flex; gap: 4mm; align-items: center; margin-bottom: 3mm; }
  .step-num { background: ${MINT}; color: white; min-width: 13mm; height: 13mm; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 800; font-size: 15pt; flex-shrink: 0; }
  .step-titles { flex: 1; }
  .step-title { font-size: 15pt; font-weight: 700; color: ${NAVY}; }
  .time-chip { display: inline-block; background: ${PAPER}; border: 1px solid ${BORDER}; padding: 1mm 3mm; border-radius: 999px; font-size: 9pt; color: ${MUTED}; font-weight: 600; margin-top: 1mm; }
  .step-why { background: #F8FAFC; border-left: 3px solid ${NAVY}; padding: 2mm 4mm; margin-bottom: 3mm; font-size: 10pt; border-radius: 0 4px 4px 0; }
  .step-items { padding-left: 6mm; margin: 0 0 3mm; font-size: 10.5pt; }
  .step-items li { margin-bottom: 2mm; line-height: 1.5; }
  .step-done { background: #ECFDF5; border-left: 3px solid ${MINT}; padding: 2mm 4mm; font-size: 10pt; border-radius: 0 4px 4px 0; color: ${MINT_DARK}; }

  .success-box { background: linear-gradient(135deg, ${MINT} 0%, ${MINT_DARK} 100%); color: white; padding: 7mm; border-radius: 10px; margin: 6mm 0; }
  .success-box h2 { color: white; margin: 0 0 3mm; font-size: 17pt; }
  .success-box ul { padding-left: 5mm; margin: 2mm 0; }

  .warn-box { background: #FEF2F2; border-left: 4px solid ${CORAL}; padding: 4mm 5mm; border-radius: 0 6px 6px 0; margin: 4mm 0; }

  .tldr { background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%); color: white; padding: 8mm; border-radius: 10px; margin-top: 6mm; }
  .tldr h2 { color: ${MINT}; margin: 0 0 3mm; font-size: 16pt; }
  .tldr ol { padding-left: 6mm; font-size: 11pt; }
  .tldr li { margin-bottom: 2mm; }
  .pb { display: block; height: 0; page-break-after: always; break-after: page; }
</style></head><body>

<div class="cover">
  <div>
    <div class="cover-brand">BFSG-Check · Computer Use</div>
    <div class="cover-title">Gib Claude<br><em>Hände.</em></div>
    <div class="cover-subtitle">Computer Use für Claude Code aktivieren.<br>5 Schritte. 5 Minuten. Kinderleicht.</div>
    <div class="cover-pills">
      <span class="pill"><strong>5 Min</strong> Setup</span>
      <span class="pill"><strong>1 Schalter</strong> umlegen</span>
      <span class="pill"><strong>Pro/Max</strong> Abo nötig</span>
    </div>
  </div>
  <div class="cover-foot">
    <div><strong>Für:</strong> Matthias Seba<br>Claude Code in der Desktop App</div>
    <div class="cover-foot-right"><strong>Stand:</strong> 20.06.2026<br>tagesaktuell recherchiert</div>
  </div>
</div>

<div class="section">
  <h1>🎯 Was passiert hier?</h1>
  <p class="lead">Stell dir vor, Claude bekommt Hände. Bisher kann Claude nur reden und Code schreiben. Mit „Computer Use" kann Claude jetzt selbst:</p>
  <div class="what-box">
    <ul>
      <li>Den Browser öffnen und klicken (Google Ads, Stripe, Listings...)</li>
      <li>Programme bedienen</li>
      <li>Formulare ausfüllen</li>
    </ul>
    <p style="margin:2mm 0 0"><strong>Du musst es nur EINMAL anschalten.</strong> Danach fragt Claude jedes Mal um Erlaubnis, bevor es etwas macht.</p>
  </div>

  <h2>✅ Was du brauchst</h2>
  <table class="req-table">
    <thead><tr><th>Brauchst du</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>Claude Pro ($20/Mo) ODER Max ($100/Mo) Abo</td><td>☐</td></tr>
      <tr><td>Claude Desktop App auf Windows</td><td>☐</td></tr>
      <tr><td>PC der wach bleibt während Claude arbeitet</td><td>☐</td></tr>
    </tbody>
  </table>
  <div class="warn-box">
    <strong>⚠ Wichtig:</strong> Mit Team- oder Enterprise-Plan geht Computer Use (noch) NICHT. Du brauchst Pro oder Max.
  </div>
</div>

<div class="pb"></div>

<div class="steps-page">
  <h1 style="color:${NAVY};font-size:22pt;margin:0 0 5mm;border-bottom:3px solid ${MINT};padding-bottom:3mm;">📋 Die 5 Schritte</h1>
  ${steps.map(renderStep).join('')}

  <div class="success-box">
    <h2>🎉 Geschafft!</h2>
    <p>Ab jetzt kann Claude Code für dich:</p>
    <ul>
      <li>Google Ads Kampagnen einrichten</li>
      <li>Listings ausfüllen (SaaSHub, G2, Capterra)</li>
      <li>Stripe-Dashboard bedienen</li>
      <li>Pressemitteilungen einreichen</li>
    </ul>
    <p style="margin:3mm 0 0"><strong>Du sagst, was du willst — Claude macht es.</strong> Bei wichtigen Sachen (Geld, Veröffentlichen) fragt Claude immer vorher.</p>
  </div>
</div>

<div class="pb"></div>

<div class="steps-page">
  <h1 style="color:${NAVY};font-size:22pt;margin:0 0 5mm;border-bottom:3px solid ${MINT};padding-bottom:3mm;">🛑 Sicherheit + Hilfe</h1>

  <h2 style="color:${NAVY};">Sicherheit — bitte beachten</h2>
  <p>Claude steuert deinen ECHTEN Computer (keine Sandbox). Darum:</p>
  <table class="sec-table">
    <thead><tr><th>Regel</th><th>Warum</th></tr></thead>
    <tbody>${security.map(([r, w]) => `<tr><td>⚠ ${r}</td><td>${w}</td></tr>`).join('')}</tbody>
  </table>
  <div class="warn-box">
    <strong>Automatisch gesperrt:</strong> Banking, Trading + Krypto sind von Anthropic gesperrt — das lässt du so.
  </div>

  <h2 style="color:${NAVY};">🆘 Wenn was nicht klappt</h2>
  <table class="ts-table">
    <thead><tr><th>Problem</th><th>Lösung</th></tr></thead>
    <tbody>${troubleshoot.map(([p, l]) => `<tr><td>${p}</td><td>${l}</td></tr>`).join('')}</tbody>
  </table>
  <p style="margin-top:3mm;font-size:10pt;color:${MUTED};">Sonst: Screenshot machen + mir schicken mit „Schritt X klappt nicht". Ich helfe.</p>

  <div class="tldr">
    <h2>✨ TL;DR — die 5 Schritte</h2>
    <ol>
      <li>App aktualisieren (claude.com/download)</li>
      <li>Settings ⚙️ → General</li>
      <li>„Computer use"-Schalter AN</li>
      <li>Auf „Code"-Modus wechseln</li>
      <li>Test: „Öffne Browser und gehe auf bfsg-fix.de"</li>
    </ol>
    <p style="margin:4mm 0 0;font-size:13pt;font-weight:600;text-align:center;">Dauer: 5 Minuten. Du schaffst das. 💪</p>
  </div>
</div>

</body></html>`;
}

async function main() {
  const html = renderHtml();
  await mkdir(path.dirname(OUT_PDF), { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: OUT_PDF, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log('PDF:', OUT_PDF);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('FAILED:', err); process.exit(1); });
