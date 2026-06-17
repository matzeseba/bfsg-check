// E-Mail-Versand des fertigen Reports + Betreiber-Alarm bei Fehlern.
// SMTP aus Umgebungsvariablen. In Produktion (Stripe Live) ist SMTP Pflicht —
// sonst Fail-fast beim Start (siehe requireMailerOrExit), damit nie ein bezahlter
// Kunde im stillen Dry-Run leer ausgeht.

import nodemailer from 'nodemailer';
import { readFile } from 'node:fs/promises';

const {
  SMTP_HOST,
  SMTP_PORT = '587',
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL = 'no-reply@bfsg-check.de',
  FROM_NAME = 'BFSG-Check',
  REPLY_TO,
  ADMIN_EMAIL
} = process.env;

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
  attachments.push({ filename, content: await readFile(invoicePdfPath) });
}

// Sendet die passende Variante (BFSG-Erstreport / Cookie-Report / Re-Check mit Diff)
// auf Basis von emailKind aus PKG_CONFIG. invoicePdfPath (optional) wird als
// zusätzlicher Rechnungs-Anhang mitgesendet.
export async function sendReportFor({ to, company = '', pdfPath, stmtPath, emailKind = 'bfsg', diffText = '', invoicePdfPath = null, invoiceNumber = null }) {
  if (emailKind === 'cookie') {
    return sendCookieReport({ to, company, pdfPath, invoicePdfPath, invoiceNumber });
  }
  if (emailKind === 'recheck') {
    return sendRecheckReport({ to, company, pdfPath, diffText, invoicePdfPath, invoiceNumber });
  }
  return sendReport({ to, company, pdfPath, stmtPath, invoicePdfPath, invoiceNumber });
}

export async function sendReport({ to, company = '', pdfPath, stmtPath, invoicePdfPath = null, invoiceNumber = null }) {
  if (!isEmail(to)) throw new Error('Ungültige Empfängeradresse: ' + to);
  const subject = `Ihr BFSG-Barrierefreiheits-Report${company ? ' — ' + oneLine(company) : ''}`;
  const text = `Vielen Dank für Ihre Bestellung.

Im Anhang finden Sie:
1. Ihren BFSG-Barrierefreiheits-Report (PDF) mit den automatisiert erkannten Mängeln und Lösungshinweisen.
2. Einen Entwurf Ihrer Erklärung zur Barrierefreiheit (Vorlage zur eigenen Prüfung).${invoicePdfPath ? '\n3. Ihre Rechnung (PDF).' : ''}

Dieser Report ist eine automatisierte technische Erstprüfung nach WCAG 2.1 und
ersetzt keine vollständige manuelle Prüfung und keine Rechtsberatung.

Bei Fragen antworten Sie einfach auf diese E-Mail.

Mit freundlichen Grüßen
${FROM_NAME}`;

  const attachments = [];
  if (pdfPath) attachments.push({ filename: 'BFSG-Report.pdf', content: await readFile(pdfPath) });
  // Als .txt statt .md — wird von Mailclients zuverlässiger angezeigt/geöffnet.
  if (stmtPath)
    attachments.push({
      filename: 'Barrierefreiheitserklaerung.txt',
      content: await readFile(stmtPath)
    });
  await pushInvoiceAttachment(attachments, invoicePdfPath, invoiceNumber);

  return deliver({ to, subject, text, attachments });
}

export async function sendCookieReport({ to, company = '', pdfPath, invoicePdfPath = null, invoiceNumber = null }) {
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

Mit freundlichen Grüßen
${FROM_NAME}`;

  const attachments = [];
  if (pdfPath) attachments.push({ filename: 'Cookie-Report.pdf', content: await readFile(pdfPath) });
  await pushInvoiceAttachment(attachments, invoicePdfPath, invoiceNumber);
  return deliver({ to, subject, text, attachments });
}

export async function sendRecheckReport({ to, company = '', pdfPath, diffText = '', invoicePdfPath = null, invoiceNumber = null }) {
  if (!isEmail(to)) throw new Error('Ungültige Empfängeradresse: ' + to);
  const subject = `Ihr monatlicher BFSG-Re-Check${company ? ' — ' + oneLine(company) : ''}`;
  const text = `Hier ist Ihr aktueller Re-Check.

VERÄNDERUNGEN SEIT LETZTEM SCAN
${diffText || 'Keine Veränderungen erkannt.'}

Den vollständigen Report mit allen aktuellen Befunden und Lösungshinweisen
finden Sie im Anhang.${invoicePdfPath ? ' Ihre Rechnung liegt ebenfalls bei.' : ''}

Sie können Ihr Abo jederzeit über /kuendigen.html beenden.

Mit freundlichen Grüßen
${FROM_NAME}`;

  const attachments = [];
  if (pdfPath) attachments.push({ filename: 'BFSG-Recheck.pdf', content: await readFile(pdfPath) });
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

async function deliver({ to, subject, text, attachments = [] }) {
  if (!enabled) {
    console.log(`[mailer DRY-RUN] An ${to} | ${subject} | Anhänge: ${attachments.map((a) => a.filename).join(', ') || '—'}`);
    return { dryRun: true };
  }
  const info = await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    replyTo: REPLY_TO || undefined,
    subject,
    text,
    attachments
  });
  console.log(`[mailer] An ${to} versendet (${info.messageId})`);
  return { dryRun: false, messageId: info.messageId };
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
  }
}
