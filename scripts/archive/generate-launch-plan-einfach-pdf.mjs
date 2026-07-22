#!/usr/bin/env node
// Baut aus docs/LAUNCH-PLAN-EINFACH.md eine druckfertige HTML-Datei (Markdown -> HTML).
// Die PDF wird danach per Chrome-Headless erzeugt:
//   chrome.exe --headless --print-to-pdf=docs/LAUNCH-PLAN-EINFACH.pdf <diese HTML>
// (kein Playwright/npm noetig). Gibt den HTML-Pfad auf stdout aus.

import { readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const MD_PATH = path.join(REPO, 'docs', 'LAUNCH-PLAN-EINFACH.md');
const OUT_HTML = path.join(REPO, 'docs', '_launch-plan-einfach.tmp.html');

const NAVY = '#2E2A6B';
const NAVY_DARK = '#1f1c4d';
const MINT = '#1FBF8E';
const MINT_DARK = '#10996f';
const INK = '#0F172A';

function mdToHtml(md) {
  let html = md;
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
  html = html.replace(/^---\s*$/gm, '<hr/>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^(> .*(?:\n> .*)*)/gm, (m) => {
    const inner = m.split('\n').map((l) => l.replace(/^> ?/, '')).join('<br/>');
    return `<blockquote>${inner}</blockquote>`;
  });
  html = html.replace(/^- \[ \] (.+)$/gm, '<li class="cb">$1</li>');
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="num">$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(?:^|\n)((?:[ \t]*<li[\s\S]*?<\/li>\n?)+)/g, (m, items) => `\n<ul>${items}</ul>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.split('\n\n').map((p) => {
    if (p.match(/^\s*<(h[1-6]|ul|ol|table|pre|blockquote|hr)/)) return p;
    if (!p.trim()) return '';
    return `<p>${p.replace(/\n/g, ' ')}</p>`;
  }).join('\n');
  return html;
}

const md = await readFile(MD_PATH, 'utf8');
const content = mdToHtml(md);
const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 14mm; }
  @page :first { margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${INK}; background: #fff; font-size: 11pt; line-height: 1.55; }
  .cover { height: 297mm; width: 210mm; background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 55%, ${MINT_DARK} 135%); color: white; padding: 40mm 26mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; break-after: page; }
  .cover-brand { font-size: 14pt; letter-spacing: 2px; opacity: 0.85; font-weight: 600; text-transform: uppercase; }
  .cover-title { font-size: 46pt; font-weight: 800; line-height: 1.06; margin-top: 16mm; }
  .cover-title em { color: ${MINT}; font-style: normal; }
  .cover-subtitle { font-size: 17pt; opacity: 0.93; margin-top: 7mm; font-weight: 400; line-height: 1.4; }
  .cover-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16mm; }
  .pill { background: rgba(255,255,255,0.18); padding: 7px 15px; border-radius: 999px; font-size: 11pt; }
  .pill strong { color: ${MINT}; }
  .cover-foot { font-size: 10pt; opacity: 0.78; }
  .cover-foot strong { color: ${MINT}; }
  .content h1 { color: ${NAVY}; font-size: 19pt; margin: 9mm 0 4mm; border-bottom: 3px solid ${MINT}; padding-bottom: 2.5mm; }
  .content h2 { color: ${NAVY}; font-size: 14pt; margin: 7mm 0 2mm; break-after: avoid; }
  .content h3 { color: ${NAVY_DARK}; font-size: 11.5pt; margin: 4mm 0 1.5mm; break-after: avoid; }
  p { margin: 0 0 2.5mm; }
  ul { padding-left: 6mm; margin: 0 0 3mm; }
  li { margin-bottom: 1.8mm; break-inside: avoid; }
  li.cb { list-style: none; margin-left: -5mm; }
  li.cb::before { content: "\\2610"; color: ${MINT_DARK}; font-weight: 700; margin-right: 2.5mm; font-size: 13pt; }
  li.num { list-style: none; margin-left: -5mm; }
  code { background: #F1F5F9; padding: 1px 5px; border-radius: 3px; font-size: 10pt; color: #BE185D; font-family: "Consolas", monospace; }
  pre { background: ${NAVY_DARK}; color: #E2E8F0; padding: 4mm 5mm; border-radius: 6px; font-family: "Consolas", monospace; font-size: 9.5pt; line-height: 1.45; white-space: pre-wrap; margin: 3mm 0; break-inside: avoid; }
  blockquote { border-left: 4px solid ${MINT}; padding: 3mm 5mm; background: #ECFDF5; margin: 3mm 0; border-radius: 0 6px 6px 0; break-inside: avoid; }
  hr { border: none; border-top: 1px dashed #CBD5E1; margin: 6mm 0; }
  strong { color: ${NAVY_DARK}; }
</style></head><body>
  <div class="cover">
    <div>
      <div class="cover-brand">BFSG-Check &middot; bfsg-fix.de</div>
      <div class="cover-title">Dein<br><em>Launch-Plan.</em></div>
      <div class="cover-subtitle">Schritt fuer Schritt &mdash; ganz einfach erklaert.<br>Von oben nach unten durchgehen und abhaken.</div>
      <div class="cover-pills">
        <span class="pill"><strong>3 Pflicht-Schritte</strong> (A&ndash;C)</span>
        <span class="pill">dann Werbung</span>
        <span class="pill">Windows-PC</span>
      </div>
    </div>
    <div class="cover-foot"><strong>Fuer:</strong> Matthias Seba &middot; <strong>Stand:</strong> 27.06.2026 &middot; zum Ausdrucken &amp; Abhaken</div>
  </div>
  <div class="content">${content}</div>
</body></html>`;

await writeFile(OUT_HTML, html, 'utf8');
console.log(pathToFileURL(OUT_HTML).href);
