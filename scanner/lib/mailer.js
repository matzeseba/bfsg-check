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

// Fail-fast: im Live-Betrieb ohne SMTP nicht starten.
export function requireMailerOrExit() {
  const live = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live');
  if (live && !enabled) {
    console.error('[FATAL] Stripe ist LIVE, aber SMTP ist nicht konfiguriert. ' +
      'Bezahlte Reports könnten nicht versendet werden. Start abgebrochen.');
    process.exit(1);
  }
}

const oneLine = (s = '') => String(s).replace(/[\r\n]+/g, ' ').slice(0, 120);
const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function sendReport({ to, company = '', pdfPath, stmtPath }) {
  if (!isEmail(to)) throw new Error('Ungültige Empfängeradresse: ' + to);
  const subject = `Ihr BFSG-Barrierefreiheits-Report${company ? ' — ' + oneLine(company) : ''}`;
  const text = `Vielen Dank für Ihre Bestellung.

Im Anhang finden Sie:
1. Ihren BFSG-Barrierefreiheits-Report (PDF) mit den automatisiert erkannten Mängeln und Lösungshinweisen.
2. Einen Entwurf Ihrer Erklärung zur Barrierefreiheit (Vorlage zur eigenen Prüfung).

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

  if (!enabled) {
    console.log(`[mailer DRY-RUN] An ${to} | ${subject} | Anhänge: ${attachments.map((a) => a.filename).join(', ')}`);
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
  console.log(`[mailer] Report an ${to} versendet (${info.messageId})`);
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
