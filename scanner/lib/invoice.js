// Eigene Rechnungs-PDF-Generierung als FALLBACK zu Stripe-Receipts.
// Warum: Stripe-Receipt-Mail kann fehlschlagen (Spam, Brevo-Bounce, IP-Block).
// GoBD-Pflicht: Rechnungen müssen 10 Jahre aufbewahrt werden.
//
// Rendering: simples HTML → Playwright page.pdf(). Fortlaufende Nummer in
// out/invoice-counter.json, serialisiert über einen In-Process-Mutex (nur
// Single-Instance — Mehr-Instanz-Betrieb braucht zusätzlich einen externen Lock).
// Atomarer Zähler-Write (tmp + rename); korrupte Zählerdatei bricht hart ab statt
// die Sequenz zurückzusetzen (GoBD: keine Doppelnummer).
//
// vatMode: 'kleinunternehmer' (§ 19 UStG, kein USt-Ausweis) oder 'regelbesteuerung' (19% USt).

import { chromium } from 'playwright';
import { mkdir, writeFile, readFile, appendFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTER_FILE = process.env.INVOICE_COUNTER_FILE || path.join(__dirname, '..', 'out', 'invoice-counter.json');
const INVOICE_DIR = process.env.INVOICE_DIR || path.join(__dirname, '..', 'out', 'invoices');

const FROM = {
  name: process.env.INVOICE_FROM_NAME || process.env.FROM_NAME || 'BFSG-Fuchs',
  // KEIN Platzhalter-Fallback mehr (MF3): ein Platzhaltertext auf einer echten Kunden-
  // rechnung ist §14-UStG-formfehlerhaft. Fehlt die Anschrift, bleibt die Zeile leer und
  // der Startup-Check (invoiceConfigStatus + app.js) alarmiert im Live-Betrieb.
  address: process.env.INVOICE_FROM_ADDRESS || '',
  // Kontaktadresse fuer Rueckfragen (NICHT die no-reply-Sendeadresse). Default info@.
  email: process.env.INVOICE_CONTACT_EMAIL || 'info@bfsg-fuchs.de',
  ustId: process.env.INVOICE_USTID || '',
  taxNumber: process.env.INVOICE_TAX_NUMBER || '',
  iban: process.env.INVOICE_IBAN || ''
};

const VAT_MODE = process.env.VAT_MODE === 'regelbesteuerung' ? 'regelbesteuerung' : 'kleinunternehmer';

// Pflichtangaben-Status für den Startup-Check (MF3/SF6). Reiner Status ohne
// Seiteneffekt — app.js entscheidet über Alarm. Anbieter-Anschrift (§14 UStG) ist
// im Live-Betrieb Pflicht; Steuer-/USt-IdNr. seit 01.01.2025 auch für Kleinunternehmer
// ab 250 € brutto (§ 33/34a UStDV) relevant (z. B. Profi 399 €).
export function invoiceConfigStatus(env = process.env) {
  const missing = [];
  if (!env.INVOICE_FROM_ADDRESS) missing.push('INVOICE_FROM_ADDRESS');
  if (!env.INVOICE_USTID && !env.INVOICE_TAX_NUMBER) missing.push('INVOICE_USTID|INVOICE_TAX_NUMBER');
  return { ok: missing.length === 0, missing };
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// Baut den Empfaenger-Block: Firma (falls vorhanden) / Name / Strasse / Zusatz /
// PLZ Ort / Land (nur falls != DE) / E-Mail. Leere Felder werden ausgelassen, sodass
// keine Leerzeilen und keine Dopplungen entstehen (Bug: E-Mail erschien zweimal, wenn
// kein Firmenname angegeben war). Land wird nur gezeigt, wenn es nicht Deutschland ist.
const COUNTRY_NAMES = { DE: 'Deutschland', AT: 'Österreich', CH: 'Schweiz' };
function recipientLines(c = {}) {
  const cityLine = [c.postalCode, c.city].filter(Boolean).join(' ').trim();
  const countryLine = c.country && String(c.country).toUpperCase() !== 'DE'
    ? (COUNTRY_NAMES[String(c.country).toUpperCase()] || c.country)
    : '';
  const lines = [
    c.company,
    c.name,
    c.line1,
    c.line2,
    cityLine,
    countryLine,
    c.email
  ].map((v) => String(v ?? '').trim()).filter(Boolean);
  // Dedupe direkt aufeinanderfolgender Gleichheit (Schutz gegen versehentliche Dopplung).
  const out = lines.filter((v, i) => v !== lines[i - 1]);
  // Fallback: nichts ausser evtl. E-Mail → mindestens „Privatkunde" + E-Mail zeigen.
  if (out.length === 0) return esc('Privatkunde');
  if (out.length === 1 && out[0] === c.email) return `${esc('Privatkunde')}<br>${esc(c.email)}`;
  return out.map(esc).join('<br>');
}

// In-Process-Mutex: serialisiert die read-modify-write-Sequenz des Zählers, damit
// parallele Webhook-Aufrufe (bis MAX_CONCURRENT_SCANS) im selben Node-Prozess NIE
// dieselbe Nummer vergeben. Eliminiert das Race innerhalb einer Instanz.
// Mehr-Instanz-Betrieb (horizontale Skalierung) braucht zusätzlich einen externen
// Lock (SQLite/Redis) — siehe docs/INVOICE-COMPLIANCE.md.
let counterLock = Promise.resolve();

async function nextInvoiceNumber() {
  const run = counterLock.then(() => allocateInvoiceNumber());
  // Lock-Kette darf nicht durch einen Fehler "vergiftet" werden.
  counterLock = run.then(() => {}, () => {});
  return run;
}

async function allocateInvoiceNumber() {
  const year = new Date().getUTCFullYear();
  await mkdir(path.dirname(COUNTER_FILE), { recursive: true });
  let counter = { year, seq: 0 };
  if (existsSync(COUNTER_FILE)) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(COUNTER_FILE, 'utf8'));
    } catch (err) {
      // NICHT still auf seq:0 zurücksetzen — das vergäbe bereits genutzte Nummern
      // erneut (GoBD-Doppelnummer). Lieber hart abbrechen; safeGenerateInvoice in
      // app.js alarmiert + liefert den Report trotzdem aus (nur ohne eigene Rechnung).
      throw new Error('Rechnungszähler-Datei unlesbar/korrupt — Abbruch statt Nummern-Reset: ' + err.message);
    }
    // Jahres-Rollover nur auf erfolgreich geparster Datei.
    counter = (parsed && parsed.year === year) ? parsed : { year, seq: 0 };
  }
  counter.seq += 1;
  // Atomar schreiben: erst .tmp, dann rename — verhindert eine halb geschriebene
  // Zählerdatei (die beim nächsten Lauf als „korrupt" hart abbräche → Auslieferungs-Stopp).
  const tmpFile = COUNTER_FILE + '.tmp';
  await writeFile(tmpFile, JSON.stringify(counter, null, 2));
  await rename(tmpFile, COUNTER_FILE);
  return `RE-${counter.year}-${String(counter.seq).padStart(4, '0')}`;
}

export function renderInvoiceHtml({ invoiceNumber, date, customer, items, vatMode = VAT_MODE }) {
  // Stripe-Beträge (s.amount_total) sind BRUTTO (der vom Kunden gezahlte Endpreis).
  // Bei Regelbesteuerung die enthaltene USt HERAUSRECHNEN, sodass der Rechnungs-
  // Gesamtbetrag exakt dem gezahlten Betrag entspricht (§14c UStG: kein zu hoher
  // USt-Ausweis). Kleinunternehmer: keine USt, brutto = netto = gezahlter Betrag.
  // SF5b: Der Einzelpreis je Position wird im SELBEN Modus wie die Zwischensumme
  // ausgewiesen — bei Regelbesteuerung also NETTO (it.amount / 1,19, gerundet). Die
  // Zwischensumme (netto) ist die SUMME der gerundeten Positions-Netti (NICHT
  // round(gesamt-brutto / 1,19)), damit Positions-Summe und Zwischensumme bei mehreren
  // Positionen IMMER bitgenau übereinstimmen (keine Rundungsdrift). Die USt ergibt sich
  // als Differenz Brutto − Netto, sodass der Gesamtbetrag exakt dem gezahlten Brutto
  // entspricht. Kleinunternehmer: netto = brutto, USt = 0.
  const regel = vatMode === 'regelbesteuerung';
  const rows = items.map((it) => ({
    ...it,
    net: regel ? Math.round(it.amount / 1.19) : it.amount
  }));
  const totalGross = items.reduce((s, i) => s + i.amount, 0);
  const totalNet = rows.reduce((s, r) => s + r.net, 0);
  const totalVat = totalGross - totalNet;
  const fmt = (cents) => (cents / 100).toFixed(2).replace('.', ',') + ' €';
  const dateStr = new Date(date).toLocaleDateString('de-DE');

  const kleinUntHint = regel
    ? ''
    : '<p style="margin-top:24px;font-size:11px;color:#555">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>';

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"/>
<title>Rechnung ${esc(invoiceNumber)}</title>
<style>
  @page { size: A4; margin: 22mm 18mm 18mm 22mm; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.45; color: #0f172a; }
  header { display: flex; justify-content: space-between; margin-bottom: 36px; }
  .from { font-size: 11px; color: #475569; }
  .to { font-size: 12px; margin-top: 24px; }
  h1 { font-size: 18px; margin: 24px 0 4px; }
  .meta { display: flex; gap: 32px; margin: 16px 0 28px; font-size: 11px; color: #475569; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
  th { font-weight: 600; color: #475569; font-size: 11px; text-transform: uppercase; }
  td.amount, th.amount { text-align: right; }
  .totals { margin-top: 12px; display: flex; justify-content: flex-end; }
  .totals table { width: 280px; }
  .totals .grand { font-weight: 700; font-size: 14px; }
  footer { margin-top: 40px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
</style></head><body>
<header>
  <div class="from">
    <strong>${esc(FROM.name)}</strong><br>
    ${esc(FROM.address)}<br>
    ${esc(FROM.email)}
    ${FROM.ustId ? `<br>USt-IdNr.: ${esc(FROM.ustId)}` : ''}
    ${FROM.taxNumber ? `<br>Steuernummer: ${esc(FROM.taxNumber)}` : ''}
  </div>
  <div style="text-align:right">
    <strong style="font-size:14px">Rechnung</strong><br>
    Nr.: ${esc(invoiceNumber)}<br>
    Rechnungsdatum: ${esc(dateStr)}<br>
    Leistungsdatum: ${esc(dateStr)}
  </div>
</header>

<div class="to">
  <strong>Rechnungsempfänger:</strong><br>
  ${recipientLines(customer)}
</div>

<h1>Leistungsbeschreibung</h1>
<table>
  <thead><tr><th>Pos.</th><th>Leistung</th><th class="amount">Einzelpreis${regel ? ' (netto)' : ''}</th></tr></thead>
  <tbody>
    ${rows.map((it, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${esc(it.description)}</td>
        <td class="amount">${fmt(it.net)}</td>
      </tr>`).join('')}
  </tbody>
</table>

<div class="totals">
  <table>
    <tr><td>Zwischensumme (netto)</td><td class="amount">${fmt(totalNet)}</td></tr>
    ${regel
      ? `<tr><td>USt. 19 %</td><td class="amount">${fmt(totalVat)}</td></tr>`
      : ''}
    <tr class="grand"><td>Gesamtbetrag</td><td class="amount">${fmt(totalGross)}</td></tr>
  </table>
</div>

${kleinUntHint}

<footer>
  Leistung wurde wie vereinbart erbracht. Betrag bereits per Online-Zahlung beglichen.
  ${FROM.iban ? `Bankverbindung: ${esc(FROM.iban)} (nur für Rückerstattungen)` : ''}
  <br><br>
  ${esc(FROM.name)} — automatisierte technische Erstprüfung, keine Konformitätsgarantie, keine Rechtsberatung.
</footer>
</body></html>`;
}

export async function generateInvoicePdf({ orderId, email, company, pkg, amount, vatMode = VAT_MODE, billing = null }) {
  const invoiceNumber = await nextInvoiceNumber();
  const date = new Date().toISOString();
  const items = [{
    description: pkgDescription(pkg),
    amount: Number(amount) || 0
  }];
  const html = renderInvoiceHtml({
    invoiceNumber,
    date,
    customer: {
      company: billing?.company || company || '',
      name: billing?.name || '',
      line1: billing?.line1 || '',
      line2: billing?.line2 || '',
      postalCode: billing?.postalCode || '',
      city: billing?.city || '',
      country: billing?.country || '',
      email
    },
    items,
    vatMode
  });

  await mkdir(INVOICE_DIR, { recursive: true });
  const pdfPath = path.join(INVOICE_DIR, `${invoiceNumber}.pdf`);

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }

  // Append-Log für GoBD-Audit-Trail
  await appendFile(
    path.join(INVOICE_DIR, '..', 'invoices-log.jsonl'),
    JSON.stringify({ invoiceNumber, orderId, email, company, pkg, amount, vatMode, date, pdfPath }) + '\n'
  );

  return { invoiceNumber, pdfPath, date };
}

function pkgDescription(pkg) {
  const map = {
    basis: 'BFSG-Report Basis — automatisierte WCAG-2.1-AA-Erstprüfung (bis 5 Seiten)',
    profi: 'BFSG-Report Profi — Multi-Page-Crawl + Umsetzungsplan + 30 Tage Rückfrage-Support',
    'cookie-basis': 'Cookie-Check Basis — Tracker-Audit gemäß § 25 TDDDG',
    'cookie-profi': 'Cookie-Check Profi — Tracker-Audit + manuelle CMP-Sichtung',
    abo: 'BFSG Re-Check Abo — monatliche Überprüfung mit Diff-Report',
    'abo-jahr': 'BFSG Re-Check Abo (jährlich) — monatliche Überprüfung mit Diff-Report, jährliche Abrechnung',
    // Abo-Tiers (agent-01): bewusst OHNE Intervall-Angabe — die beworbenen Rhythmen
    // (2-wöchentlich/wöchentlich) werden erst nach Scheduler-Umstellung (d10.3) wahr.
    'abo-pro': 'Fuchs Re-Check Pro — wiederkehrende Überprüfung mit Diff-Report',
    'abo-pro-jahr': 'Fuchs Re-Check Pro (jährlich) — wiederkehrende Überprüfung mit Diff-Report, jährliche Abrechnung',
    'abo-business': 'Fuchs Re-Check Business — wiederkehrende Überprüfung mit Diff-Report',
    'abo-business-jahr': 'Fuchs Re-Check Business (jährlich) — wiederkehrende Überprüfung mit Diff-Report, jährliche Abrechnung',
    'startpaket-basis': 'Startpaket: BFSG-Report Basis + 1. Re-Check-Monat inklusive',
    'startpaket-profi': 'Startpaket: BFSG-Report Profi + 1. Re-Check-Monat inklusive'
  };
  return map[pkg] || `BFSG-Fuchs Leistung (${pkg})`;
}

export { nextInvoiceNumber };
