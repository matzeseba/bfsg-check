# Rechnungs-Compliance (GoBD, §14/§19 UStG)

## Was leistet `scanner/lib/invoice.js`

Generiert eigene PDF-Rechnung als **Fallback** zu Stripe-Receipts. Wird parallel zur Stripe-eigenen Receipt-Mail an den Kunden geschickt — falls Stripe-Mail im Spam landet oder Brevo-Bounce hat, ist die Rechnung trotzdem da.

- Fortlaufende Nummer `RE-YYYY-NNNN` (jährlich neu, gespeichert in `out/invoice-counter.json`)
- HTML → Playwright `page.pdf()` → A4-PDF in `out/invoices/RE-2026-0001.pdf`
- Audit-Log: jeder Render-Vorgang in `out/invoices-log.jsonl` (GoBD-Aufbewahrungs-Trail)
- Berücksichtigt `VAT_MODE` env: `kleinunternehmer` (§ 19 UStG, kein USt-Ausweis) ODER `regelbesteuerung` (19% USt explizit)

## Mensch-Pflichten

### 1. Steuermodus festlegen
In `deployment/.env`:
```
VAT_MODE=kleinunternehmer    # Default für Start-Phase (< 22k €/Jahr)
# ODER:
VAT_MODE=regelbesteuerung    # nach Überschreitung Kleinunternehmer-Grenze ODER bei Option zur Regelbesteuerung
```

### 2. Stamm­daten in `.env`
```
INVOICE_FROM_NAME=BFSG-Check (vollständiger rechtlicher Name)
INVOICE_FROM_ADDRESS=Vorname Nachname\nStraße 12\n10115 Berlin
INVOICE_USTID=DE123456789           # nur bei Regelbesteuerung
INVOICE_TAX_NUMBER=12/345/67890     # vom Finanzamt
INVOICE_IBAN=DE12 3456 7890 1234 5678 90   # nur für Rückerstattungen
```

### 3. Integration in `app.js` (5 Min nach Merge dieses PRs)
```js
import { generateInvoicePdf } from './lib/invoice.js';

// In handleCheckoutCompleted, NACH erfolgreichem Fulfillment:
const invoice = await generateInvoicePdf({
  orderId: s.id,
  email,
  company: meta.company || '',
  pkg,
  amount: s.amount_total
});

// In sendReportFor: zusätzlichen Anhang
await sendReportFor({
  to: email,
  company: meta.company,
  pdfPath: order.pdfPath,
  invoicePdfPath: invoice.pdfPath,  // NEU
  emailKind: 'bfsg',
  diffText: diffSummaryText(order.diff)
});
```

Und in `lib/mailer.js` `sendReport()` den `invoicePdfPath` als 3. Anhang ergänzen mit Filename `Rechnung-${invoiceNumber}.pdf`.

## GoBD-Konformität (zusammen mit Backup-Strategie)

GoBD verlangt:
- ☑ Aufbewahrung 10 Jahre (gewährleistet durch `out/invoices/` + tägliches Backup zu Off-Site-Storage, siehe `docs/BACKUP.md`)
- ☑ Unveränderbarkeit (PDF + Append-Log JSONL, niemals überschrieben)
- ☑ Lesbarkeit (PDF/A wäre besser als reines PDF — Welle 5 mit `pdf-lib` oder `puppeteer-pdf-a`)
- ☑ Vollständigkeit (lückenlose Nummer-Sequenz via Counter-File mit Lock)
- ⚠️ Datenträgerprüfung: Restore-Test monatlich (siehe `.github/workflows/backup-restore-test.yml`)

## § 14 UStG Pflicht-Angaben (alle vom Template abgedeckt)

| Pflicht | Position | Quelle |
|---|---|---|
| Vollständiger Name + Anschrift Anbieter | Header oben links | env `INVOICE_FROM_*` |
| Vollständiger Name + Anschrift Empfänger | Mittel-Block "Rechnungsempfänger" | `customer.company` / `customer.email` |
| Steuer-/USt-IdNr. Anbieter | Header | env `INVOICE_USTID` / `INVOICE_TAX_NUMBER` — seit **01.01.2025 (§ 33/34a UStDV)** auch für Kleinunternehmer ab 250 € brutto Pflicht (Ausnahme nur Kleinbetrag bis 250 €), nicht mehr nur bei Regelbesteuerung |
| Rechnungsnummer (fortlaufend) | Header rechts | `nextInvoiceNumber()` |
| Datum der Rechnung | Header rechts | `new Date()` |
| Datum der Leistung | impliziert via "Betrag bereits per Online-Zahlung beglichen" | siehe Footer |
| Menge + Bezeichnung Leistung | Tabelle "Leistungsbeschreibung" | `items[].description` |
| Entgelt (netto) | Tabelle + Totals | `items[].amount` |
| Steuersatz + Steuerbetrag (Regelbesteuerung) | Totals-Block | berechnet aus 19% |
| Hinweis § 19 UStG (Kleinunternehmer) | Footer-Hinweis | abhängig von `VAT_MODE` |

## Tests

6/6 grün in `scanner/test/invoice.test.js`:
- Fortlaufende Nummer
- Kleinunternehmer-Modus (kein USt-Ausweis, § 19-Hinweis)
- Regelbesteuerung (19% USt korrekt berechnet)
- XSS-Escaping in customer-name
- Multiple Items werden summiert
- Umlaute (UTF-8) korrekt

## Open Tasks (Welle 5)

- **PDF/A-Konvertierung** für strikt-GoBD-konforme Langzeit-Archivierung
- **QR-Code für Stripe-Receipt-Link** auf jeder Rechnung (Verifikations-Pfad)
- **Reverse-Charge bei EU-B2B** (`INVOICE_REVERSE_CHARGE_NOTICE` env, Hinweis "Steuerschuldnerschaft des Leistungsempfängers")
- **Counter-Lock** für High-Concurrency (SQLite + INSERT-OR-IGNORE)
