#!/usr/bin/env node
// Generiert docs/HANDOVER-NEXT-SESSION.pdf — kompakter Handover für nächste Session.

import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PDF = path.join(__dirname, '..', 'docs', 'HANDOVER-NEXT-SESSION.pdf');
const MD_PATH = path.join(__dirname, '..', 'docs', 'HANDOVER-NEXT-SESSION.md');

const NAVY = '#2E2A6B';
const NAVY_DARK = '#1f1c4d';
const MINT = '#1FBF8E';
const MINT_DARK = '#10996f';
const PAPER = '#FAFAF7';
const INK = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';

async function mdToHtml() {
  const md = await readFile(MD_PATH, 'utf8');
  let html = md;
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
  html = html.replace(/(\|.*\|\n\|[-: |]+\|\n(?:\|.*\|\n)+)/g, (block) => {
    const rows = block.trim().split('\n');
    const header = rows[0].split('|').slice(1, -1).map(s => s.trim());
    const body = rows.slice(2).map(r => r.split('|').slice(1, -1).map(s => s.trim()));
    let t = '<table><thead><tr>';
    for (const h of header) t += `<th>${h}</th>`;
    t += '</tr></thead><tbody>';
    for (const row of body) {
      t += '<tr>';
      for (const c of row) t += `<td>${c}</td>`;
      t += '</tr>';
    }
    return t + '</tbody></table>';
  });
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>(?:\n<li>[\s\S]*?<\/li>)*)/g, '<ul>$1</ul>');
  html = html.split('\n\n').map(p => {
    if (p.match(/^<(h[1-6]|ul|ol|table|pre|blockquote)/)) return p;
    if (!p.trim()) return '';
    return `<p>${p.replace(/\n/g, ' ')}</p>`;
  }).join('\n');
  return html;
}

async function main() {
  const content = await mdToHtml();
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 14mm; }
    @page :first { margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${INK}; background: ${PAPER}; font-size: 10pt; line-height: 1.5; }

    .cover { height: 297mm; width: 210mm; background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 50%, ${MINT_DARK} 130%); color: white; padding: 36mm 24mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; break-after: page; }
    .cover-brand { font-size: 14pt; letter-spacing: 2px; opacity: 0.85; font-weight: 600; text-transform: uppercase; }
    .cover-title { font-size: 42pt; font-weight: 800; line-height: 1.08; margin-top: 18mm; }
    .cover-title em { color: ${MINT}; font-style: normal; }
    .cover-subtitle { font-size: 16pt; opacity: 0.92; margin-top: 6mm; font-weight: 400; line-height: 1.4; }
    .cover-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14mm; }
    .pill { background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 999px; font-size: 10pt; }
    .pill strong { color: ${MINT}; }
    .cover-foot { font-size: 9pt; opacity: 0.7; display: flex; justify-content: space-between; align-items: end; }
    .cover-foot strong { color: ${MINT}; }

    .content { padding-top: 4mm; }
    .content h1 { color: ${NAVY}; font-size: 20pt; margin: 8mm 0 4mm; border-bottom: 3px solid ${MINT}; padding-bottom: 3mm; break-before: page; page-break-before: always; }
    .content h1:first-of-type { break-before: auto; page-break-before: auto; }
    .content h2 { color: ${NAVY}; font-size: 14pt; margin: 7mm 0 3mm; }
    .content h3 { color: ${NAVY_DARK}; font-size: 11.5pt; margin: 5mm 0 2mm; }
    p { margin: 0 0 3mm; }
    ul, ol { padding-left: 6mm; margin: 0 0 4mm; }
    li { margin-bottom: 1.5mm; }
    code { background: #F1F5F9; padding: 1px 4px; border-radius: 3px; font-size: 9pt; color: #BE185D; font-family: "SF Mono", Menlo, monospace; }
    pre { background: ${NAVY_DARK}; color: #E2E8F0; padding: 4mm; border-radius: 6px; font-family: "SF Mono", Menlo, monospace; font-size: 8.5pt; line-height: 1.4; overflow-x: auto; white-space: pre-wrap; margin: 3mm 0; }
    table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 9pt; page-break-inside: avoid; }
    th { background: ${NAVY}; color: white; padding: 2.5mm 3mm; text-align: left; font-size: 9pt; }
    td { border-bottom: 1px solid ${BORDER}; padding: 2.5mm 3mm; background: white; vertical-align: top; }
    blockquote { border-left: 4px solid ${MINT}; padding: 3mm 5mm; background: #ECFDF5; margin: 3mm 0; }
  </style></head><body>

  <div class="cover">
    <div>
      <div class="cover-brand">BFSG-Check · Session-Handover</div>
      <div class="cover-title">Übergabe<br>für die nächste<br><em>Claude-Session.</em></div>
      <div class="cover-subtitle">Server live · Computer Use aktiv · alles auf main.<br>Lies CLAUDE.md, dann diese Datei.</div>
      <div class="cover-pills">
        <span class="pill"><strong>0 offene PRs</strong></span>
        <span class="pill"><strong>14 PRs</strong> letzte Woche</span>
        <span class="pill"><strong>SALES-DAY-1-V2</strong> als nächstes</span>
      </div>
    </div>
    <div class="cover-foot">
      <div><strong>Für:</strong> Matthias Seba<br>Repo: matzeseba/bfsg-check</div>
      <div style="text-align:right"><strong>Stand:</strong> 20.06.2026<br>Handover v1.0</div>
    </div>
  </div>

  <div class="content">${content}</div>
  </body></html>`;

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
