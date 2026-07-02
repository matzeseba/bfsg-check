// E-Mail-Versand des fertigen Reports + Betreiber-Alarm bei Fehlern.
// SMTP aus Umgebungsvariablen. In Produktion (Stripe Live) ist SMTP Pflicht —
// sonst Fail-fast beim Start (siehe requireMailerOrExit), damit nie ein bezahlter
// Kunde im stillen Dry-Run leer ausgeht.

import nodemailer from 'nodemailer';
import { readFile } from 'node:fs/promises';
import sentry from './sentry.js';

const {
  SMTP_HOST,
  SMTP_PORT = '587',
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL = 'no-reply@bfsg-check.de',
  FROM_NAME = 'BFSG-Check',
  REPLY_TO,
  INVOICE_CONTACT_EMAIL = 'info@bfsg-fix.de',
  ADMIN_EMAIL
} = process.env;

// Rueckfragen sollen NICHT an die no-reply-Sendeadresse gehen: explizites REPLY_TO
// gewinnt, sonst die Kontaktadresse (info@). So landet „antworten Sie auf diese E-Mail"
// immer in einem echten Postfach. FROM_EMAIL (no-reply@) bleibt die Sende-Adresse.
const REPLY_TO_ADDR = REPLY_TO || INVOICE_CONTACT_EMAIL;

// --- Pflicht-Footer fuer transaktionale Mails (Anbieterkennzeichnung § 5 DDG +
// Disclaimer-Kurzform). Anschrift aus Env, damit sie nicht hartkodiert ist. ---
const INVOICE_FROM_NAME = process.env.INVOICE_FROM_NAME || FROM_NAME;
const INVOICE_FROM_ADDRESS = process.env.INVOICE_FROM_ADDRESS || '';
const PUBLIC_HOST = (process.env.PUBLIC_URL || 'https://bfsg-fix.de')
  .replace(/^https?:\/\//, '').replace(/\/+$/, '');
// Voll-URL (mit Schema) fuer Links in HTML-Mails; CTA der Value-Mail (PR2).
const PUBLIC_URL = (process.env.PUBLIC_URL || 'https://bfsg-fix.de').replace(/\/+$/, '');
const LEAD_TEASER_CTA_URL = process.env.LEAD_TEASER_CTA_URL || `${PUBLIC_URL}/#pakete`;

// Exportiert fuer Unit-Tests (reine Funktion, keine Seiteneffekte).
export function legalFooter() {
  const anschrift = INVOICE_FROM_ADDRESS
    ? `${INVOICE_FROM_NAME} · ${INVOICE_FROM_ADDRESS}`
    : INVOICE_FROM_NAME;
  return `--
${anschrift}
Kontakt: ${REPLY_TO_ADDR} · ${PUBLIC_HOST}

BFSG-Check liefert eine automatisierte technische Analyse nach WCAG 2.1 AA.
Keine Rechtsberatung, keine Konformitätsgarantie. Empfehlungen ersetzen nicht
die anwaltliche Prüfung.`;
}

// B2C-Widerrufs-Verzicht-Bestaetigung (§ 356 Abs. 5 BGB). Nur fuer Verbraucher
// relevant; bei Unternehmern leerer String (kein Widerrufsrecht).
// Exportiert fuer Unit-Tests (reine Funktion, keine Seiteneffekte).
export function widerrufHinweis({ customerType = '', consentTs = '' } = {}) {
  if (customerType !== 'consumer') return '';
  let datum = '';
  if (consentTs) {
    const d = new Date(consentTs);
    if (!Number.isNaN(d.getTime())) datum = d.toLocaleDateString('de-DE');
  }
  return `
WIDERRUFSRECHT (Verbraucher)
Sie haben vor dem Kauf${datum ? ` am ${datum}` : ''} ausdrücklich zugestimmt, dass die
Ausführung sofort beginnt, und bestätigt, dass Ihr 14-tägiges Widerrufsrecht mit
vollständiger Erbringung der Leistung erlischt (§ 356 Abs. 5 BGB). Der Report wurde
sofort erstellt und mit dieser E-Mail bereitgestellt.
`;
}

const enabled = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = enabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    })
  : null;

export function mailerEnabled() {
  return enabled;
}
export function mailerStatus() {
  return enabled ? 'aktiv (SMTP konfiguriert)' : 'DRY-RUN (kein SMTP — es wird nichts versendet)';
}

// Live-Modus für Stripe-Keys: erkennt sowohl Secret-Keys (sk_live) als auch
// Restricted-Keys (rk_live). Vorher wurden rk_live-Keys fälschlich als Test-Modus
// gewertet, sodass /health live:false zeigte und Fail-Fast übersprungen wurde.
export function isStripeLive() {
  const k = process.env.STRIPE_SECRET_KEY || '';
  return k.startsWith('sk_live') || k.startsWith('rk_live');
}

// Fail-fast: im Live-Betrieb ohne SMTP nicht starten.
export function requireMailerOrExit() {
  if (isStripeLive() && !enabled) {
    console.error('[FATAL] Stripe ist LIVE, aber SMTP ist nicht konfiguriert. ' +
      'Bezahlte Reports könnten nicht versendet werden. Start abgebrochen.');
    process.exit(1);
  }
}

const oneLine = (s = '') => String(s).replace(/[\r\n]+/g, ' ').slice(0, 120);
// Schärfere E-Mail-Validierung als RFC-light: erlaubt nur sinnvolle Zeichen,
// TLD min 2 Chars max 63. Fängt häufige Tippfehler ab.
export const isEmail = (s = '') => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(String(s).trim());

// Hängt die selbst erzeugte Rechnungs-PDF (§ 14 UStG) als zusätzlichen Anhang an.
// Filename trägt die fortlaufende Rechnungsnummer (RE-YYYY-NNNN.pdf), falls bekannt.
async function pushInvoiceAttachment(attachments, invoicePdfPath, invoiceNumber) {
  if (!invoicePdfPath) return;
  const filename = invoiceNumber ? `Rechnung-${invoiceNumber}.pdf` : 'Rechnung.pdf';
  try {
    attachments.push({ filename, content: await readFile(invoicePdfPath) });
  } catch {
    // SF4: Eine fehlende/unlesbare Rechnungs-PDF (z. B. out/-Volume nach Restart weg)
    // darf NICHT den gesamten Report-Versand kippen — das Kernprodukt ist der Report.
    // Anhang überspringen + warnen; die Stripe-Receipt bleibt als Beleg gültig, der
    // Operator kann die Rechnung separat nachreichen.
    console.warn(`[mailer] Rechnungs-Anhang fehlt/übersprungen: ${filename} (${invoicePdfPath})`);
  }
}

// Liest eine OPTIONALE Anhang-Datei (z. B. Barrierefreiheitserklärung) defensiv:
// fehlt sie (out/-Volume nach Restart weg, Datei gelöscht), wird der Anhang
// übersprungen statt den gesamten Versand zu kippen — das Kernprodukt (Report-PDF)
// hat Vorrang. Pflicht-Anhänge (PDF) werden weiterhin strikt gelesen.
async function pushOptionalAttachment(attachments, filePath, filename) {
  if (!filePath) return;
  try {
    attachments.push({ filename, content: await readFile(filePath) });
  } catch {
    console.warn(`[mailer] optionaler Anhang fehlt/übersprungen: ${filename} (${filePath})`);
  }
}

// Sendet die passende Variante (BFSG-Erstreport / Cookie-Report / Re-Check mit Diff)
// auf Basis von emailKind aus PKG_CONFIG. invoicePdfPath (optional) wird als
// zusätzlicher Rechnungs-Anhang mitgesendet.
export async function sendReportFor({ to, company = '', pdfPath, stmtPath, emailKind = 'bfsg', diffText = '', invoicePdfPath = null, invoiceNumber = null, customerType = '', consentTs = '' }) {
  if (emailKind === 'cookie') {
    return sendCookieReport({ to, company, pdfPath, invoicePdfPath, invoiceNumber, customerType, consentTs });
  }
  if (emailKind === 'recheck') {
    return sendRecheckReport({ to, company, pdfPath, stmtPath, diffText, invoicePdfPath, invoiceNumber, customerType, consentTs });
  }
  return sendReport({ to, company, pdfPath, stmtPath, invoicePdfPath, invoiceNumber, customerType, consentTs });
}

export async function sendReport({ to, company = '', pdfPath, stmtPath, invoicePdfPath = null, invoiceNumber = null, customerType = '', consentTs = '' }) {
  if (!isEmail(to)) throw new Error('Ungültige Empfängeradresse: ' + to);
  const subject = `Ihr BFSG-Barrierefreiheits-Report${company ? ' — ' + oneLine(company) : ''}`;
  const text = `Vielen Dank für Ihre Bestellung.

Im Anhang finden Sie:
1. Ihren BFSG-Barrierefreiheits-Report (PDF) mit den automatisiert erkannten Mängeln und Lösungshinweisen.
2. Einen Entwurf Ihrer Erklärung zur Barrierefreiheit (Vorlage zur eigenen Prüfung).${invoicePdfPath ? '\n3. Ihre Rechnung (PDF).' : ''}

Dieser Report ist eine automatisierte technische Erstprüfung nach WCAG 2.1 und
ersetzt keine vollständige manuelle Prüfung und keine Rechtsberatung.

Bei Fragen antworten Sie einfach auf diese E-Mail.
${widerrufHinweis({ customerType, consentTs })}
Mit freundlichen Grüßen
${FROM_NAME}

${legalFooter()}`;

  const attachments = [];
  if (pdfPath) attachments.push({ filename: 'BFSG-Report.pdf', content: await readFile(pdfPath) });
  // Als .txt statt .md — wird von Mailclients zuverlässiger angezeigt/geöffnet.
  // Defensiv: fehlt die Erklärung, blockiert das NICHT die Report-Auslieferung.
  await pushOptionalAttachment(attachments, stmtPath, 'Barrierefreiheitserklaerung.txt');
  await pushInvoiceAttachment(attachments, invoicePdfPath, invoiceNumber);

  return deliver({ to, subject, text, attachments });
}

export async function sendCookieReport({ to, company = '', pdfPath, invoicePdfPath = null, invoiceNumber = null, customerType = '', consentTs = '' }) {
  if (!isEmail(to)) throw new Error('Ungültige Empfängeradresse: ' + to);
  const subject = `Ihr Cookie- & Consent-Report (§ 25 TDDDG)${company ? ' — ' + oneLine(company) : ''}`;
  const text = `Vielen Dank für Ihre Bestellung.

Im Anhang finden Sie Ihren Cookie- & Consent-Report (PDF): welche Tracker und
Cookies VOR einer Einwilligung auf Ihrer Seite feuern (§ 25 TDDDG / DSGVO),
mit konkretem Handlungsvorschlag pro Fund.${invoicePdfPath ? '\nZusätzlich liegt Ihre Rechnung (PDF) bei.' : ''}

Dieser Report ist eine automatisierte technische Einzelmessung ohne
Banner-Interaktion. Er ersetzt keine vollständige manuelle Prüfung und keine
Rechtsberatung.

Bei Fragen antworten Sie einfach auf diese E-Mail.
${widerrufHinweis({ customerType, consentTs })}
Mit freundlichen Grüßen
${FROM_NAME}

${legalFooter()}`;

  const attachments = [];
  if (pdfPath) attachments.push({ filename: 'Cookie-Report.pdf', content: await readFile(pdfPath) });
  await pushInvoiceAttachment(attachments, invoicePdfPath, invoiceNumber);
  return deliver({ to, subject, text, attachments });
}

export async function sendRecheckReport({ to, company = '', pdfPath, stmtPath = null, diffText = '', invoicePdfPath = null, invoiceNumber = null, customerType = '', consentTs = '' }) {
  if (!isEmail(to)) throw new Error('Ungültige Empfängeradresse: ' + to);
  const subject = `Ihr monatlicher BFSG-Re-Check${company ? ' — ' + oneLine(company) : ''}`;
  const text = `Hier ist Ihr aktueller Re-Check.

VERÄNDERUNGEN SEIT LETZTEM SCAN
${diffText || 'Keine Veränderungen erkannt.'}

Im Anhang finden Sie:
1. Den vollständigen Re-Check-Report (PDF) mit allen aktuellen Befunden und Lösungshinweisen.${stmtPath ? '\n2. Ihre auf den aktuellen Stand gebrachte Erklärung zur Barrierefreiheit (Vorlage).' : ''}${invoicePdfPath ? `\n${stmtPath ? '3' : '2'}. Ihre Rechnung (PDF).` : ''}

Sie können Ihr Abo jederzeit über https://bfsg-fix.de/kuendigen beenden.
${widerrufHinweis({ customerType, consentTs })}
Mit freundlichen Grüßen
${FROM_NAME}

${legalFooter()}`;

  const attachments = [];
  if (pdfPath) attachments.push({ filename: 'BFSG-Recheck.pdf', content: await readFile(pdfPath) });
  // Aktualisierte Erklärung zur Barrierefreiheit mitschicken (.txt für maximale
  // Mailclient-Kompatibilität) — Owner-Anforderung: jeder Re-Check liefert die
  // auf den aktuellen Stand gebrachte Erklärung. Defensiv: fehlende Datei
  // überspringt nur den Anhang, blockiert nicht den Re-Check-Versand.
  await pushOptionalAttachment(attachments, stmtPath, 'Barrierefreiheitserklaerung-aktuell.txt');
  await pushInvoiceAttachment(attachments, invoicePdfPath, invoiceNumber);
  return deliver({ to, subject, text, attachments });
}

export async function sendCancellationConfirmation({ to, company = '' }) {
  if (!isEmail(to)) return { dryRun: true, skipped: 'no-recipient' };
  const subject = `Bestätigung: Ihr BFSG-Re-Check-Abo wurde beendet${company ? ' — ' + oneLine(company) : ''}`;
  const text = `Wir bestätigen die Beendigung Ihres BFSG-Re-Check-Abos.

Es werden keine weiteren Beträge abgebucht und keine weiteren Re-Checks
durchgeführt. Sollte das nicht in Ihrem Sinne sein, antworten Sie einfach
auf diese E-Mail.

Mit freundlichen Grüßen
${FROM_NAME}`;
  return deliver({ to, subject, text, attachments: [] });
}

// --- PR2: Value-E-Mail nach dem Gratis-Scan --------------------------------
// Minimal-HTML-Escape fuer nutzergelieferte Strings (URL/Host/Befund-Titel).
function escHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// Note aus Score — identische Schwellen wie scanner/lib/report.js computeScore,
// damit die Mail-Note nie der Report-Note widerspricht. Fallback, falls der
// Client keine grade mitschickt.
function gradeFromScore(score) {
  if (!Number.isFinite(score)) return '—';
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}
function verdictFromScore(score) {
  if (!Number.isFinite(score)) return 'Erste automatisierte Einschätzung deiner Seite.';
  if (score >= 90) return 'Weitgehend konform — nur Feinschliff nötig.';
  if (score >= 75) return 'Solide Basis, aber relevante Lücken mit Handlungsbedarf.';
  if (score >= 50) return 'Deutliche Mängel — Handlungsbedarf.';
  return 'Kritisch — viele Mängel, dringender Handlungsbedarf.';
}
// Reine, host-tolerante URL→Host-Extraktion (kein Throw bei krummer Eingabe).
function hostFromUrl(url = '') {
  const raw = String(url).trim();
  if (!raw) return '';
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw).host;
  } catch {
    return oneLine(raw).replace(/^https?:\/\//i, '').split('/')[0].slice(0, 80);
  }
}
// Grad → Ampel-Farben (Score-Badge im HTML).
function toneForGrade(grade) {
  if (grade === 'A') return { bg: '#ecfdf5', fg: '#047857' };
  if (grade === 'D') return { bg: '#fef2f2', fg: '#b91c1c' };
  if (grade === '—') return { bg: '#f3f4f6', fg: '#374151' };
  return { bg: '#fffbeb', fg: '#b45309' }; // B/C = amber
}

// Schwere-Stufen für die Top-Befunde — identische Stufen/Farben wie die Zähler-Tabelle.
const SEVERITY_ORDER = ['critical', 'serious', 'moderate', 'minor'];
const SEVERITY_LABEL = { critical: 'KRITISCH', serious: 'SCHWERWIEGEND', moderate: 'MITTEL', minor: 'GERING' };
// Solide Füll-Farben → in hellen UND dunklen Mail-Clients (Outlook Dark) kontraststark.
// Keine hellgrau-auf-weiß-Chips, die in Dark-Mode verschwinden. Textfarbe je Fläche:
// Weiß auf Amber wäre nur ~1,9:1 → dunkler Text auf der hellen MITTEL-Fläche.
const SEVERITY_COLOR = { critical: '#F8554B', serious: '#ED6A33', moderate: '#f5b13d', minor: '#6b7280' };
const SEVERITY_TEXT = { critical: '#ffffff', serious: '#ffffff', moderate: '#2b1206', minor: '#ffffff' };

// Leitet je Top-Befund den Schweregrad her. renderTeaser (report.js) sortiert die
// Befunde streng nach IMPACT_WEIGHT absteigend (critical>serious>moderate>minor) und
// schickt die Top-3. Genau diese Reihenfolge entsteht, wenn man die counts in derselben
// Schwere-Ordnung expandiert — der i-te Top-Befund trägt also die i-te Schwere dieser
// Sequenz. So zeigt die Mail dieselbe Schwere wie die Website-Übersicht, ohne Re-Scan
// oder Frontend-Umbau. Ein künftig explizit mitgeschickter severity/impact hat Vorrang.
function severitySequence(counts) {
  const seq = [];
  for (const sev of SEVERITY_ORDER) {
    const n = Math.max(0, Number(counts?.[sev]) || 0);
    for (let i = 0; i < n; i++) seq.push(sev);
  }
  return seq;
}

// Baut Betreff + text/plain + HTML der Value-Mail. PURE Funktion (keine
// Seiteneffekte) → deterministisch unit-testbar. ZEIGT: Score/Note + Einordnung,
// ALLE Befund-Kategorien mit Zählern, Top-3-Prioritäten (nur das WAS, keine
// Selektoren/Fixes). SPERRT (nur Vollreport): exakte Fundstellen, Copy-Paste-Fixes,
// Umsetzungsplan, Erklärung. Keine verbotenen Claims (UWG §5).
export function buildLeadTeaser({ url = '', score, grade = '', counts = {}, topIssues = [], totalIssues = 0 } = {}) {
  const s = Number.isFinite(Number(score)) ? Math.round(Number(score)) : null;
  const g = grade || gradeFromScore(s);
  const verdict = verdictFromScore(s);
  const host = hostFromUrl(url);
  const c = {
    critical: Math.max(0, Number(counts?.critical) || 0),
    serious: Math.max(0, Number(counts?.serious) || 0),
    moderate: Math.max(0, Number(counts?.moderate) || 0),
    minor: Math.max(0, Number(counts?.minor) || 0)
  };
  const sumCounts = c.critical + c.serious + c.moderate + c.minor;
  const total = Number.isFinite(Number(totalIssues)) && Number(totalIssues) >= 0
    ? Math.round(Number(totalIssues)) : sumCounts;
  const sevSeq = severitySequence(c);
  const tops = (Array.isArray(topIssues) ? topIssues : [])
    .slice(0, 3)
    .map((item, i) => {
      const rawTitle = typeof item === 'string' ? item : (item?.title || item?.label || item?.text || '');
      const explicit = item && typeof item === 'object' ? (item.severity || item.impact) : null;
      const sev = SEVERITY_LABEL[explicit] ? explicit : (sevSeq[i] || null);
      return { title: oneLine(rawTitle), severity: SEVERITY_LABEL[sev] ? sev : null };
    })
    .filter((t) => t.title);
  const remaining = Math.max(0, total - tops.length);
  const cta = LEAD_TEASER_CTA_URL;
  const ctaTarget = host || 'deine Seite';
  const subject = `Ihre WCAG-Erstprüfung: Note ${g}${s !== null ? ` (${s}/100)` : ''}${host ? ` für ${host}` : ''}`;
  // Preheader (Vorschautext) mit konkretem Befund-Bezug — kein Clickbait.
  const lead0 = tops[0];
  const preheader = lead0
    ? `Note ${g}${s !== null ? ` (${s}/100)` : ''} — ${lead0.severity ? `${SEVERITY_LABEL[lead0.severity]}: ` : ''}${lead0.title}`
    : `Deine automatisierte WCAG-2.1-AA-Erstprüfung${host ? ` für ${host}` : ''}: Note ${g}`;

  const topsText = tops.length
    ? `DEINE TOP-${tops.length}-PRIORITÄTEN (nach Schwere, was zuerst anzupacken ist)
${tops.map((t, i) => `  ${i + 1}. [${t.severity ? SEVERITY_LABEL[t.severity] : 'BEFUND'}] ${t.title}`).join('\n')}

`
    : '';
  const text = `Hallo,

hier ist Filo, der BFSG-Fuchs. Danke, dass du deine Seite${host ? ` (${host})` : ''} durch die
kostenlose WCAG-2.1-AA-Erstprüfung geschickt hast. Hier ist deine Übersicht:

DEINE NOTE: ${g}${s !== null ? ` — ${s} von 100 Punkten` : ''}
${verdict}

GEFUNDENE BEFUNDE NACH SCHWERE
  Kritisch:       ${c.critical}
  Schwerwiegend:  ${c.serious}
  Mittel:         ${c.moderate}
  Gering:         ${c.minor}
  ------------------------------
  Gesamt:         ${total}

${topsText}WAS DAS KONKRET BEDEUTET
Seit dem 28. Juni 2025 gelten die Anforderungen des BFSG für viele Websites und
Online-Dienste. Nach § 15 BFSG können auch anerkannte Verbände festgestellte
Verstöße geltend machen. Die oben gefundenen Punkte sind technische Ansatzpunkte,
an denen eine Prüfung typischerweise zuerst ansetzt.

GRATIS-CHECK vs. VOLLREPORT
Gratis-Check (diese Mail):
  - Note & Score, Befunde nach Schwere, Top-${tops.length || 3}-Prioritäten
Vollreport:
  - jede einzelne Fundstelle (genaue Stelle im Code)
  - fertiger Copy-Paste-Fix je Befund${remaining > 0 ? `\n  - ${remaining} weitere Fundstellen über die Top-${tops.length} hinaus` : ''}
  - priorisierter Umsetzungsplan
  - Entwurf deiner Erklärung zur Barrierefreiheit
  - alles als PDF zum Weitergeben

Vollreport für ${ctaTarget} sichern:
${cta}

Diese Übersicht ist eine automatisierte technische Erstprüfung nach WCAG 2.1 AA
und ersetzt keine vollständige manuelle Prüfung und keine Rechtsberatung.

Viele Grüße
Filo & das Team von ${FROM_NAME}

${legalFooter()}`;

  const tone = toneForGrade(g);
  const countRow = (label, val, emoji) =>
    `<tr><td style="padding:7px 0;border-bottom:1px solid #f1f1f1;font-size:14px;color:#1f2430;">${emoji} ${label}</td>` +
    `<td align="right" style="padding:7px 0;border-bottom:1px solid #f1f1f1;font-size:14px;font-weight:700;color:#1f2430;">${val}</td></tr>`;
  const chipHtml = (sev) => sev
    ? `<span style="display:inline-block;background:${SEVERITY_COLOR[sev]};color:${SEVERITY_TEXT[sev]};font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:6px;">${SEVERITY_LABEL[sev]}</span>`
    : '';
  const topsHtml = tops.length
    ? `<p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin:22px 0 8px;">Deine Top-${tops.length}-Prioritäten (nach Schwere)</p>
      <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 4px;">
        ${tops.map((t) => `<tr>
          <td style="padding:6px 10px 6px 0;vertical-align:top;white-space:nowrap;">${chipHtml(t.severity)}</td>
          <td style="padding:6px 0;font-size:14px;line-height:1.5;color:#1f2430;vertical-align:top;">${escHtml(t.title)}</td>
        </tr>`).join('')}
      </table>`
    : '';
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2430;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f5f3ef;font-size:1px;line-height:1px;">${escHtml(preheader)}</div>
  <div style="max-width:560px;margin:0 auto;padding:24px 14px;">
    <div style="background:#ffffff;border-radius:16px;padding:26px 24px;border:1px solid #ececec;">
      <p style="font-size:15px;margin:0 0 12px;color:#1f2430;">Hallo,</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 20px;color:#1f2430;">hier ist <strong>Filo, der BFSG-Fuchs</strong> — danke, dass du ${host ? `<strong>${escHtml(host)}</strong>` : 'deine Seite'} durch die kostenlose WCAG-2.1-AA-Erstprüfung geschickt hast. Hier ist deine Übersicht.</p>
      <div style="text-align:center;background:${tone.bg};border-radius:14px;padding:20px 16px;margin:0 0 22px;">
        <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${tone.fg};">Deine Note</div>
        <div style="font-size:46px;font-weight:800;color:${tone.fg};line-height:1.05;margin:2px 0;">${escHtml(g)}</div>
        ${s !== null ? `<div style="font-size:15px;color:${tone.fg};font-weight:600;">${s} / 100 Punkten</div>` : ''}
        <div style="font-size:13px;color:${tone.fg};margin-top:6px;line-height:1.4;">${escHtml(verdict)}</div>
      </div>
      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin:0 0 6px;">Gefundene Befunde nach Schwere</p>
      <table role="presentation" width="100%" style="border-collapse:collapse;margin:0;">
        ${countRow('Kritisch', c.critical, '🔴')}
        ${countRow('Schwerwiegend', c.serious, '🟠')}
        ${countRow('Mittel', c.moderate, '🟡')}
        ${countRow('Gering', c.minor, '⚪')}
        <tr><td style="padding:9px 0;font-size:14px;font-weight:800;color:#1f2430;">Gesamt</td><td align="right" style="padding:9px 0;font-size:14px;font-weight:800;color:#1f2430;">${total}</td></tr>
      </table>
      ${topsHtml}
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin:24px 0 6px;">Was das konkret bedeutet</p>
      <p style="font-size:13px;line-height:1.55;color:#4b5563;margin:0 0 20px;">Seit dem <strong>28. Juni 2025</strong> gelten die Anforderungen des BFSG für viele Websites und Online-Dienste. Nach <strong>§ 15 BFSG</strong> können auch anerkannte Verbände festgestellte Verstöße geltend machen. Die gefundenen Punkte sind technische Ansatzpunkte, an denen eine Prüfung typischerweise zuerst ansetzt.</p>
      <table role="presentation" width="100%" style="border-collapse:separate;border-spacing:0;margin:0 0 20px;">
        <tr>
          <td width="50%" style="background:#f3f4f6;border-radius:12px 0 0 12px;padding:14px 14px;vertical-align:top;">
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin:0 0 6px;">Gratis-Check</div>
            <div style="font-size:12px;line-height:1.55;color:#4b5563;">Note &amp; Score · Befunde nach Schwere · Top-${tops.length || 3}-Prioritäten</div>
          </td>
          <td width="50%" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:0 12px 12px 0;padding:14px 14px;vertical-align:top;">
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#c2410c;margin:0 0 6px;">Vollreport</div>
            <div style="font-size:12px;line-height:1.55;color:#7c2d12;">Jede genaue Fundstelle · Copy-Paste-Fix je Befund${remaining > 0 ? ` · ${remaining} weitere Fundstellen` : ''} · Umsetzungsplan · Entwurf der Erklärung zur Barrierefreiheit · PDF</div>
          </td>
        </tr>
      </table>
      <div style="text-align:center;margin:0 0 6px;">
        <a href="${escHtml(cta)}" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 30px;border-radius:12px;">Vollreport für ${escHtml(ctaTarget)} sichern →</a>
      </div>
      <p style="font-size:12px;line-height:1.5;color:#9ca3af;margin:22px 0 0;">Diese Übersicht ist eine automatisierte technische Erstprüfung nach WCAG 2.1 AA und ersetzt keine vollständige manuelle Prüfung und keine Rechtsberatung.</p>
      <p style="font-size:14px;margin:16px 0 0;color:#1f2430;">Viele Grüße<br>Filo &amp; das Team von ${escHtml(FROM_NAME)}</p>
    </div>
    <div style="white-space:pre-line;font-size:11px;color:#9ca3af;padding:16px 10px 0;line-height:1.5;">${escHtml(legalFooter())}</div>
  </div>
</body></html>`;

  return { subject, text, html };
}

// Versendet die Value-Mail. Der Lead hat über den Button „Übersicht anfordern"
// die schriftliche Übersicht AUSDRÜCKLICH angefordert → einmalige, angeforderte
// Service-Mail (kein § 7 UWG-Problem; der Newsletter-DOI läuft getrennt über
// Brevo). Ungültige Adresse → Dry-Run-Skip (kein Throw), damit /api/lead robust
// bleibt. Best-Effort: Aufrufer kapselt den Call in try/catch.
export async function sendLeadTeaser({ to, url = '', score, grade = '', counts = {}, topIssues = [], totalIssues = 0 }) {
  if (!isEmail(to)) return { dryRun: true, skipped: 'invalid-recipient' };
  const { subject, text, html } = buildLeadTeaser({ url, score, grade, counts, topIssues, totalIssues });
  return deliver({ to, subject, text, html, attachments: [] });
}

// MF5: Best-Effort-Eingangs-/Verzögerungs-Mail an den ZAHLENDEN Kunden, wenn der
// automatische Scan/Report fehlschlägt (FAILED). Bewusst KEIN Report-Anhang (es gibt
// im Fehlerfall kein PDF) und KEINE Termin-/Refund-Zusage — nur „wir haben es bemerkt
// und kümmern uns". Verhindert, dass ein Kunde nach der Zahlung im Schweigen sitzt
// (Trust-/Chargeback-Schutz). Ungültige Adresse → Dry-Run-Skip (kein Throw).
export async function sendDelayNotice({ to, company = '' }) {
  if (!isEmail(to)) return { dryRun: true, skipped: 'invalid-recipient' };
  const subject = `Ihre Bestellung ist eingegangen${company ? ' — ' + oneLine(company) : ''}`;
  const text = `Vielen Dank für Ihre Bestellung — Ihre Zahlung ist bei uns eingegangen.

Bei der automatischen Erstellung Ihres Reports ist ein technisches Problem
aufgetreten (Ihre Website ließ sich nicht vollständig automatisiert auswerten).
Wir haben das bemerkt und kümmern uns persönlich darum — Sie erhalten Ihren
Report in Kürze per E-Mail. Sie müssen nichts weiter tun.

Bei Rückfragen antworten Sie einfach auf diese E-Mail.

Mit freundlichen Grüßen
${FROM_NAME}

${legalFooter()}`;
  return deliver({ to, subject, text, attachments: [] });
}

// Kunden-Eingangsbestätigung direkt nach der Zahlung (PR5 Owner-Release-Gate).
// Bewusst OHNE Zeit-/„automatisch"-Angabe: der Report wird geprüft und in Kürze
// zugestellt. Kein Anhang. Best-effort — ein Fehler darf den Webhook nicht kippen.
export async function sendOrderReceived({ to, company = '' }) {
  if (!isEmail(to)) return { dryRun: true, skipped: 'invalid-recipient' };
  const subject = `Zahlung eingegangen — Ihr Report wird geprüft${company ? ' · ' + oneLine(company) : ''}`;
  const text = `Vielen Dank für Ihre Bestellung — Ihre Zahlung ist bei uns eingegangen.

Ihr Report wird jetzt geprüft und Ihnen anschließend per E-Mail zugestellt.
Sie müssen nichts weiter tun.

Bei Rückfragen antworten Sie einfach auf diese E-Mail.

Mit freundlichen Grüßen
${FROM_NAME}

${legalFooter()}`;
  return deliver({ to, subject, text, attachments: [] });
}

// Owner-Freigabe-Mail (PR5): geht an den Betreiber (ADMIN_EMAIL), enthält den fertigen
// Report als Anhang zur Sichtung + einen 1-Klick-„Freigeben & senden"-Button. Tut der
// Owner nichts, gibt der Scheduler den Report bei `releaseAt` automatisch frei. So bleibt
// der Claim „jeder Report wird vor Auslieferung gesichtet" wahr, ohne die Auslieferung
// unbegrenzt zu blockieren.
export async function sendOwnerReview({ sessionId, to = ADMIN_EMAIL, customerEmail = '', url = '', company = '', pkg = '', summary = '', releaseUrl = '', releaseAt = null, pdfPath = null, stmtPath = null, invoicePdfPath = null }) {
  const recipient = to || FROM_EMAIL;
  const when = releaseAt
    ? new Date(releaseAt).toLocaleString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) + ' Uhr'
    : '90 Minuten';
  const subject = `Freigabe nötig: Report für ${oneLine(customerEmail || url || sessionId)}`;
  const lines = [
    `Ein bezahlter Report ist fertig und wartet auf deine Freigabe.`,
    ``,
    `Kunde:  ${customerEmail || '—'}`,
    `Website: ${url || '—'}`,
    `Paket:  ${pkg || '—'}`,
    company ? `Firma:  ${company}` : '',
    summary ? `\n${summary}` : '',
    ``,
    `>> FREIGEBEN & SENDEN:`,
    releaseUrl || '(Release-Link nicht konfiguriert — bitte ADMIN_TOKEN/RELEASE_TOKEN_SECRET setzen)',
    ``,
    `Wenn du nichts tust, wird der Report um ${when} automatisch freigegeben und an den Kunden gesendet.`,
    `Der Report hängt zur Sichtung an dieser Mail.`
  ].filter((l) => l !== '');
  const text = lines.join('\n');

  const html = `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
<h2 style="margin:0 0 4px">Report-Freigabe</h2>
<p style="color:#555;margin:0 0 16px">Ein bezahlter Report ist fertig und wartet auf deine Sichtung.</p>
<table style="font-size:14px;border-collapse:collapse;margin-bottom:16px">
<tr><td style="padding:2px 12px 2px 0;color:#777">Kunde</td><td>${escHtml(customerEmail || '—')}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#777">Website</td><td>${escHtml(url || '—')}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#777">Paket</td><td>${escHtml(pkg || '—')}</td></tr>
${company ? `<tr><td style="padding:2px 12px 2px 0;color:#777">Firma</td><td>${escHtml(company)}</td></tr>` : ''}
</table>
${summary ? `<div style="background:#f6f6f6;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:16px">${escHtml(summary).replace(/\n/g, '<br>')}</div>` : ''}
${releaseUrl ? `<p style="margin:0 0 20px"><a href="${escHtml(releaseUrl)}" style="display:inline-block;background:#e8590c;color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:10px;font-size:16px">Freigeben &amp; senden &rarr;</a></p>` : `<p style="color:#c00">Release-Link nicht konfiguriert (ADMIN_TOKEN/RELEASE_TOKEN_SECRET fehlt).</p>`}
<p style="color:#777;font-size:13px;margin:0">Wenn du nichts tust, wird der Report um <strong>${escHtml(when)}</strong> automatisch freigegeben und an den Kunden gesendet. Der Report hängt zur Sichtung an dieser Mail.</p>
</body></html>`;

  const attachments = [];
  for (const [p, name] of [[pdfPath, 'report.pdf'], [stmtPath, 'barrierefreiheitserklaerung.md'], [invoicePdfPath, 'rechnung.pdf']]) {
    if (p) attachments.push({ filename: name, path: p });
  }
  return deliver({ to: recipient, subject, text, html, attachments });
}

// DSGVO-Bestätigungs-Mail an den ANTRAGSTELLER (Code-Review F3).
// Der Token-Link MUSS an die angefragte Adresse gehen — das ist der Double-Opt-in,
// der Eigentum der E-Mail nachweist. Vorher ging der Token nur an den Betreiber.
export async function sendDsgvoToken({ to, action, link, expiresAt }) {
  if (!isEmail(to)) return { dryRun: true, skipped: 'invalid-recipient' };
  const aktion = action === 'delete' ? 'Löschung' : 'Auskunft';
  const subject = `Ihre DSGVO-Anfrage (${aktion}) — Bestätigung erforderlich`;
  const text = `Sie haben eine ${aktion} Ihrer bei BFSG-Check gespeicherten Daten angefragt.

Bitte bestätigen Sie die Anfrage über folgenden Link (gültig bis ${expiresAt}):

${link}

Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail —
ohne Bestätigung passiert nichts.

Mit freundlichen Grüßen
${FROM_NAME}`;
  return deliver({ to, subject, text, attachments: [] });
}

// Klassifiziert SMTP-/Netzwerk-Fehler: transient (lohnt Retry) vs. permanent
// (Retry zwecklos, würde nur Zeit kosten). Transient = Verbindungsabbrüche,
// Timeouts, Greylisting und temporäre Mailserver-Antworten (SMTP 4xx + die
// transienten 5xx-Codes für Rate-Limit/„try again later"). Permanent = harte
// Ablehnung (invalid recipient, Mailbox existiert nicht, Auth/Policy-Reject).
const TRANSIENT_CODES = new Set([
  'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ESOCKET', 'ECONNECTION',
  'EAI_AGAIN', 'ETLS', 'EDNS', 'EPIPE'
]);
// Nodemailer legt die SMTP-Antwort-Stufe in err.responseCode (numerisch) ab.
// 421/450/451/452 = temporär; 454 = TLS temporär; 471 = lokales Greylisting.
// 421 ist formal 4xx, manche Server senden Rate-Limit aber als 4xx/5xx-Mischung.
const TRANSIENT_SMTP = new Set([421, 450, 451, 452, 454, 471]);

export function isTransientMailError(err) {
  if (!err) return false;
  const code = err.code || '';
  if (TRANSIENT_CODES.has(code)) return true;
  // nodemailer-Connection-Fehler signalisieren teils nur über err.command/'CONN'.
  if (code === 'CONN' || code === 'EENVELOPE' && err.responseCode && TRANSIENT_SMTP.has(err.responseCode)) {
    return TRANSIENT_SMTP.has(err.responseCode);
  }
  const rc = Number(err.responseCode);
  if (TRANSIENT_SMTP.has(rc)) return true;
  // Greylisting wird oft als 4xx mit Klartext gemeldet (kein sauberer Code).
  if (/greylist|temporar|try again|rate limit|too many/i.test(err.message || '')) return true;
  return false;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Verschickt eine Mail mit bis zu 3 Wiederholungen (Backoff 1s/2s/4s + Jitter)
// AUSSCHLIESSLICH bei transienten Fehlern. Permanente Fehler (ungültiger
// Empfänger, harte Ablehnung) werfen sofort — kein Retry, da zwecklos.
// MAX_MAIL_ATTEMPTS env-überschreibbar (Default 3) für Tests/Tuning.
const MAX_MAIL_ATTEMPTS = Math.max(1, Number(process.env.MAX_MAIL_ATTEMPTS) || 3);
const MAIL_BACKOFF_BASE_MS = Math.max(0, Number(process.env.MAIL_BACKOFF_BASE_MS ?? 1000));

// Reine Retry-Schleife, vom konkreten Transport entkoppelt (direkt unit-testbar):
// `send` ist eine async-Funktion, die genau einen Versandversuch macht und das
// nodemailer-Info-Objekt zurückgibt oder einen Fehler wirft. Retry nur bei
// transienten Fehlern (isTransientMailError), sonst sofortiges Re-Throw.
export async function sendWithRetry(send, {
  to = '',
  maxAttempts = MAX_MAIL_ATTEMPTS,
  backoffBaseMs = MAIL_BACKOFF_BASE_MS
} = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const info = await send();
      if (attempt > 1) console.log(`[mailer] Versand an ${to} im ${attempt}. Versuch erfolgreich`);
      return { info, attempts: attempt };
    } catch (err) {
      lastErr = err;
      const transient = isTransientMailError(err);
      if (!transient || attempt === maxAttempts) {
        if (!transient) console.error(`[mailer] Permanenter Fehler an ${to} — kein Retry: ${err.message}`);
        else console.error(`[mailer] Versand an ${to} nach ${attempt} Versuchen endgültig fehlgeschlagen: ${err.message}`);
        throw err;
      }
      // Exponentieller Backoff (1s/2s/4s) + bis zu 250 ms Jitter gegen Thundering-Herd.
      const delay = backoffBaseMs * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      console.warn(`[mailer] Transienter Fehler an ${to} (Versuch ${attempt}/${maxAttempts}): ${err.message} — Retry in ${delay} ms`);
      await sleep(delay);
    }
  }
  throw lastErr; // unerreichbar, aber explizit für den Linter.
}

// --- Brevo-Transactional-API-Fallback ---------------------------------------
// Hintergrund (Prod-Vorfall 07/2026): Scheitert SMTP mit einem PERMANENTEN
// Auth-Fehler (z. B. „535 Authentication failed", weil der SMTP-Schlüssel im
// Brevo-Konto gelöscht/abgelaufen ist), wäre JEDE Transaktionsmail verloren,
// obwohl die Brevo-REST-API mit BREVO_API_KEY weiterhin funktioniert. Darum:
// EINMALIGER API-Fallback nur für genau diesen Fall. Transiente Fehler laufen
// weiter über den bestehenden Retry (sendWithRetry) — dort KEIN Fallback.

// Permanenter Auth-Fehler? (SMTP 535 = „Authentication credentials invalid";
// /auth/i fängt Textvarianten wie „Authentication failed" ab.) Bewusst NUR
// nicht-transiente Fehler — bei transienten greift der Retry.
export function isPermanentAuthError(err) {
  if (!err || isTransientMailError(err)) return false;
  if (Number(err.responseCode) === 535) return true;
  return /\b535\b|auth/i.test(err.message || '');
}

// Kill-Switch: Fallback ist an, sobald BREVO_API_KEY existiert; explizit
// abschaltbar via MAILER_API_FALLBACK=false. Zur Laufzeit gelesen (testbar,
// keine neue Pflicht-Env-Variable).
function apiFallbackEnabled() {
  return !!process.env.BREVO_API_KEY && process.env.MAILER_API_FALLBACK !== 'false';
}

// Versand über die Brevo-Transactional-API (POST /v3/smtp/email) — natives
// fetch, keine neue Dependency. Mapping nodemailer→Brevo: Anhänge mit
// `content` (Buffer/String) oder `path` (Datei) werden base64-kodiert;
// `attachment` wird nur gesetzt, wenn Anhänge existieren.
export async function sendViaBrevoApi({ to, subject, text, html = null, attachments = [], replyTo = REPLY_TO_ADDR, headers = null }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY fehlt — Brevo-API-Versand nicht möglich');
  const attachment = [];
  for (const a of attachments || []) {
    const buf = a.content != null
      ? (Buffer.isBuffer(a.content) ? a.content : Buffer.from(String(a.content)))
      : await readFile(a.path);
    attachment.push({ name: a.filename || 'anhang', content: buf.toString('base64') });
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      textContent: text,
      ...(html ? { htmlContent: html } : {}),
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      ...(attachment.length ? { attachment } : {}),
      ...(headers ? { headers } : {})
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo-API-Versand fehlgeschlagen (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json().catch(() => ({}));
  return { messageId: data.messageId || null };
}

// Retry-Schleife + einmaliger API-Fallback bei permanentem Auth-Fehler.
// Erfolg via API → wie Erfolg behandelt (fallback: 'brevo-api'); scheitert
// auch die API, wird der URSPRÜNGLICHE SMTP-Fehler geworfen (Verhalten für
// Aufrufer exakt wie bisher). Direkt unit-testbar (gleiche Seam wie
// sendWithRetry: `send` = ein SMTP-Versandversuch).
export async function sendWithFallback(send, { to = '', subject = '', text = '', html = null, attachments = [], headers = null, maxAttempts, backoffBaseMs } = {}) {
  try {
    return await sendWithRetry(send, { to, maxAttempts, backoffBaseMs });
  } catch (err) {
    if (!(isPermanentAuthError(err) && apiFallbackEnabled())) throw err;
    try {
      const info = await sendViaBrevoApi({ to, subject, text, html, attachments, headers });
      console.warn('[mailer] SMTP fehlgeschlagen — über Brevo-API zugestellt (Fallback)');
      return { info, attempts: 1, fallback: 'brevo-api' };
    } catch (apiErr) {
      console.error(`[mailer] Brevo-API-Fallback an ${to} ebenfalls fehlgeschlagen: ${apiErr.message}`);
      throw err;
    }
  }
}

async function deliver({ to, subject, text, html = null, attachments = [] }) {
  if (!enabled) {
    console.log(`[mailer DRY-RUN] An ${to} | ${subject} | Anhänge: ${attachments.map((a) => a.filename).join(', ') || '—'}`);
    return { dryRun: true };
  }
  // Deliverability: One-Click-List-Unsubscribe (RFC 8058). Verbessert die
  // Zustellbarkeit (Gmail/Yahoo-Sender-Anforderungen). Unsubscribe geht an die
  // Kontaktadresse (nicht no-reply). FROM_EMAIL bleibt die no-reply-Sendeadresse.
  // Einmal gebaut, damit BEIDE Transportwege (SMTP + Brevo-API-Fallback) sie tragen.
  const headers = {
    'List-Unsubscribe': `<mailto:${REPLY_TO_ADDR}?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
  };
  const { info, attempts, fallback } = await sendWithFallback(
    () => transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      replyTo: REPLY_TO_ADDR || undefined,
      subject,
      text,
      // HTML nur setzen, wenn vorhanden — bestehende Text-only-Mails bleiben unveraendert.
      ...(html ? { html } : {}),
      attachments,
      headers
    }),
    { to, subject, text, html, attachments, headers }
  );
  console.log(`[mailer] An ${to} versendet (${info.messageId}${fallback ? ' — via Brevo-API-Fallback' : ''})`);
  return { dryRun: false, messageId: info.messageId, attempts, ...(fallback ? { fallback } : {}) };
}

// Betreiber-Alarm bei bezahlt-aber-nicht-geliefert (an ADMIN_EMAIL).
export async function sendAlert(subject, body) {
  const to = ADMIN_EMAIL || FROM_EMAIL;
  if (!enabled) {
    console.error(`[ALERT DRY-RUN] ${subject} :: ${body}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME} ALERT" <${FROM_EMAIL}>`,
      to,
      subject: '[BFSG-ALERT] ' + oneLine(subject),
      text: body
    });
  } catch (e) {
    console.error('[ALERT] konnte nicht gesendet werden:', e.message);
    // SF9: Der Alarm-Kanal selbst ist ausgefallen — ein stiller Totalausfall (bezahlt-
    // aber-nicht-geliefert würde sonst niemanden erreichen). Zusätzlich an Sentry melden,
    // damit es trotz toter Alarm-Mail sichtbar bleibt.
    sentry.captureException(e instanceof Error ? e : new Error(String(e)), { stage: 'sendAlert' });
  }
}
