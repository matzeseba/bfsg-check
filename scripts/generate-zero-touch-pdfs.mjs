#!/usr/bin/env node
// Generiert die 3 Master-PDFs für Zero-Touch-Marketing-Sprint:
// - MARKETING-MASTER-2026.pdf
// - LEGAL-REALITY-CHECK-2026.pdf
// - SALES-DAY-1-V2.pdf

import { chromium } from 'playwright';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(__dirname, '..', 'docs');

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
  html, body { margin: 0; padding: 0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${INK}; background: ${PAPER}; font-size: 10.5pt; line-height: 1.5; }

  .cover { height: 297mm; width: 210mm; color: white; padding: 32mm 22mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; break-after: page; }
  .cover-brand { font-size: 13pt; letter-spacing: 2px; opacity: 0.85; font-weight: 600; text-transform: uppercase; }
  .cover-title { font-size: 38pt; font-weight: 800; line-height: 1.08; margin-top: 18mm; }
  .cover-title em { color: ${MINT}; font-style: normal; }
  .cover-subtitle { font-size: 15pt; opacity: 0.92; margin-top: 6mm; font-weight: 400; line-height: 1.4; }
  .cover-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14mm; }
  .pill { background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 999px; font-size: 10pt; }
  .pill strong { color: ${MINT}; }
  .cover-foot { font-size: 9pt; opacity: 0.7; display: flex; justify-content: space-between; align-items: end; }
  .cover-foot-right { text-align: right; }
  .cover-foot strong { color: ${MINT}; }

  .section { break-before: page; page-break-before: always; padding-top: 4mm; }
  .section h1 { color: ${NAVY}; font-size: 22pt; margin: 0 0 4mm; border-bottom: 3px solid ${MINT}; padding-bottom: 3mm; }
  .section h2 { color: ${NAVY}; font-size: 15pt; margin: 8mm 0 3mm; }
  .section h3 { color: ${NAVY_DARK}; font-size: 11.5pt; margin: 5mm 0 2mm; }
  .section p { margin: 0 0 3mm; }
  .section ul, .section ol { padding-left: 6mm; margin: 0 0 4mm; }
  .section li { margin-bottom: 2mm; line-height: 1.5; }

  .lead { font-size: 12pt; color: ${MUTED}; line-height: 1.6; margin-bottom: 6mm; }

  table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 9.5pt; }
  th { background: ${NAVY}; color: white; padding: 3mm 4mm; text-align: left; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
  td { border-bottom: 1px solid ${BORDER}; padding: 3mm 4mm; background: white; vertical-align: top; }
  td code, p code { background: #F1F5F9; padding: 1px 4px; border-radius: 3px; font-size: 9pt; color: #BE185D; font-family: "SF Mono", Menlo, monospace; }

  pre { background: ${NAVY_DARK}; color: #E2E8F0; padding: 4mm; border-radius: 6px; font-family: "SF Mono", Menlo, monospace; font-size: 8.5pt; line-height: 1.4; overflow-x: auto; white-space: pre-wrap; margin: 3mm 0; }

  .callout { border-left: 4px solid; padding: 4mm 5mm; margin: 4mm 0; border-radius: 0 6px 6px 0; background: white; page-break-inside: avoid; }
  .callout.warn { border-left-color: ${CORAL}; background: #FEF2F2; }
  .callout.info { border-left-color: ${NAVY}; background: #F1F5F9; }
  .callout.good { border-left-color: ${MINT}; background: #ECFDF5; }
  .callout.tip { border-left-color: ${AMBER}; background: #FFFBEB; }
  .callout strong { display: block; margin-bottom: 1mm; font-size: 10pt; }

  .task-step { background: white; border: 1px solid ${BORDER}; border-radius: 8px; padding: 5mm; margin-bottom: 4mm; page-break-inside: avoid; display: flex; gap: 4mm; align-items: flex-start; }
  .step-num { background: ${MINT}; color: white; min-width: 12mm; height: 12mm; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: 800; font-size: 13pt; flex-shrink: 0; }
  .step-body h3 { margin: 0 0 2mm; font-size: 12pt; color: ${NAVY}; }
  .step-body p { margin: 0 0 2mm; font-size: 10pt; }

  .hero-decision { background: linear-gradient(135deg, ${MINT} 0%, ${MINT_DARK} 100%); color: white; padding: 8mm; border-radius: 10px; margin: 6mm 0; text-align: center; }
  .hero-decision p { font-size: 12pt; margin: 0; font-weight: 600; line-height: 1.5; }

  .tldr { background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%); color: white; padding: 10mm; border-radius: 10px; margin-top: 8mm; }
  .tldr h2 { color: ${MINT}; margin: 0 0 4mm; font-size: 16pt; }
  .tldr ul { padding-left: 5mm; font-size: 10.5pt; }
  .tldr li { margin-bottom: 2mm; }
  .tldr strong { color: ${MINT}; }
`;

// Marketing-Master Cover (Navy → Mint)
const marketingCover = `
<div class="cover" style="background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 55%, ${MINT_DARK} 130%);">
  <div>
    <div class="cover-brand">BFSG-Check · Marketing-Master 2026</div>
    <div class="cover-title">0-Touch.<br>0 Cold-Mails.<br><em>20 €/Tag.</em></div>
    <div class="cover-subtitle">Komplette Neuausrichtung der Marketing-Strategie.<br>Basiert auf 15 Sub-Recherchen + DACH-Daten.</div>
    <div class="cover-pills">
      <span class="pill"><strong>4 Säulen</strong> Strategie</span>
      <span class="pill"><strong>27 Kanäle</strong> aktivierbar</span>
      <span class="pill"><strong>3-8 Sales</strong> in 14 Tagen</span>
    </div>
  </div>
  <div class="cover-foot">
    <div><strong>Für:</strong> Matthias Seba<br>Lange Straße 20, 27449 Kutenholz</div>
    <div class="cover-foot-right"><strong>Stand:</strong> 20.06.2026<br>Strategy v2.0</div>
  </div>
</div>
`;

const legalCover = `
<div class="cover" style="background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 60%, #7c3aed 130%);">
  <div>
    <div class="cover-brand">BFSG-Check · Legal-Realitäts-Check 2026</div>
    <div class="cover-title">Live gehen<br>ohne Anwalt?<br><em>JA, mit Plan.</em></div>
    <div class="cover-subtitle">Ehrlicher Risiko-Check aller 8 Audit-Kategorien.<br>Was Realität sagt vs. was Audit-GELB sagte.</div>
    <div class="cover-pills">
      <span class="pill"><strong>4 h</strong> Selber-Lösen</span>
      <span class="pill"><strong>25 €/Mo</strong> Fixkosten</span>
      <span class="pill"><strong>0-500 €</strong> Restrisiko Jahr 1</span>
    </div>
  </div>
  <div class="cover-foot">
    <div><strong>Disclaimer:</strong> Kein Rechtsrat. Recherchierte Risiko-Einschätzung mit Quellen-Belegen.</div>
    <div class="cover-foot-right"><strong>Stand:</strong> 20.06.2026<br>Reality-Check v1.0</div>
  </div>
</div>
`;

const salesCover = `
<div class="cover" style="background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 55%, ${MINT_DARK} 130%);">
  <div>
    <div class="cover-brand">BFSG-Check · Sales-Day-1 V2</div>
    <div class="cover-title">OHNE LinkedIn.<br>OHNE Netzwerk.<br><em>Trotzdem live.</em></div>
    <div class="cover-subtitle">60 Min heute + 90 Min morgen.<br>Setup für ersten Verkauf in 7-14 Tagen.</div>
    <div class="cover-pills">
      <span class="pill"><strong>8 Tasks</strong> für dich</span>
      <span class="pill"><strong>Google Ads</strong> live</span>
      <span class="pill"><strong>7 Listings</strong> live</span>
    </div>
  </div>
  <div class="cover-foot">
    <div><strong>Für:</strong> Matthias Seba<br>Ziel: erste Verkäufe 7-14 Tage</div>
    <div class="cover-foot-right"><strong>Stand:</strong> 20.06.2026<br>Sales Sprint v2.0</div>
  </div>
</div>
`;

async function renderMd(mdPath) {
  // Sehr simpler Markdown→HTML-Renderer mit den wichtigsten Konstrukten
  const md = await readFile(mdPath, 'utf8');
  let html = md;

  // Code blocks
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
  });

  // Tables (basic)
  html = html.replace(/(\|.*\|\n\|[-: |]+\|\n(?:\|.*\|\n)+)/g, (block) => {
    const rows = block.trim().split('\n');
    const header = rows[0].split('|').slice(1, -1).map(s => s.trim());
    const body = rows.slice(2).map(r => r.split('|').slice(1, -1).map(s => s.trim()));
    let table = '<table><thead><tr>';
    for (const h of header) table += `<th>${h}</th>`;
    table += '</tr></thead><tbody>';
    for (const row of body) {
      table += '<tr>';
      for (const c of row) table += `<td>${c}</td>`;
      table += '</tr>';
    }
    table += '</tbody></table>';
    return table;
  });

  // Headings
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');

  // Inline formatting
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bullet lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>(?:\n<li>[\s\S]*?<\/li>)*)/g, '<ul>$1</ul>');

  // Paragraphs
  html = html.split('\n\n').map(p => {
    if (p.match(/^<(h[1-6]|ul|ol|table|pre)/)) return p;
    if (!p.trim()) return '';
    return `<p>${p.replace(/\n/g, ' ')}</p>`;
  }).join('\n');

  return html;
}

async function generate(mdPath, coverHtml, outPath, accent) {
  const content = await renderMd(mdPath);
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>${sharedCSS}</style></head><body>
${coverHtml}
<div class="section">${content}</div>
</body></html>`;

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: outPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log('PDF:', outPath);
  } finally {
    await browser.close();
  }
}

async function main() {
  await generate(
    path.join(DOCS, 'MARKETING-MASTER-2026.md'),
    marketingCover,
    path.join(DOCS, 'MARKETING-MASTER-2026.pdf'),
    MINT
  );
  await generate(
    path.join(DOCS, 'LEGAL-REALITY-CHECK-2026.md'),
    legalCover,
    path.join(DOCS, 'LEGAL-REALITY-CHECK-2026.pdf'),
    '#7c3aed'
  );
  await generate(
    path.join(DOCS, 'SALES-DAY-1-V2.md'),
    salesCover,
    path.join(DOCS, 'SALES-DAY-1-V2.pdf'),
    MINT
  );
}

main().catch((err) => { console.error('FAILED:', err); process.exit(1); });
