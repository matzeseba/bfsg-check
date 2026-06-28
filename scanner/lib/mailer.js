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

async function deliver({ to, subject, text, attachments = [] }) {
  if (!enabled) {
    console.log(`[mailer DRY-RUN] An ${to} | ${subject} | Anhänge: ${attachments.map((a) => a.filename).join(', ') || '—'}`);
    return { dryRun: true };
  }
  const { info, attempts } = await sendWithRetry(
    () => transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      replyTo: REPLY_TO_ADDR || undefined,
      subject,
      text,
      attachments,
      // Deliverability: One-Click-List-Unsubscribe (RFC 8058). Verbessert die
      // Zustellbarkeit (Gmail/Yahoo-Sender-Anforderungen). Unsubscribe geht an die
      // Kontaktadresse (nicht no-reply). FROM_EMAIL bleibt die no-reply-Sendeadresse.
      headers: {
        'List-Unsubscribe': `<mailto:${REPLY_TO_ADDR}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    }),
    { to }
  );
  console.log(`[mailer] An ${to} versendet (${info.messageId})`);
  return { dryRun: false, messageId: info.messageId, attempts };
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
