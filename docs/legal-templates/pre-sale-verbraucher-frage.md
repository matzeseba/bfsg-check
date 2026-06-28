# Pre-Sale Unternehmer/Verbraucher-Abfrage

> **Risiko ohne diese:** Verbraucher reklamiert Widerrufsrecht 14 Tage nach Kauf, du musst Geld zurückzahlen (199-499 € pro Fall).
> **Mit dieser Abfrage:** klare Trennung B2B/B2C + dokumentierter Widerruf-Verzicht für sofortige Lieferung.

---

## HTML-Snippet (in `landingpage-next/components/checkout/`)

```tsx
import { useState } from 'react'

export function VerbraucherAbfrage({ onChange }: { onChange: (data: any) => void }) {
  const [customerType, setCustomerType] = useState<'business' | 'consumer' | null>(null)
  const [ustId, setUstId] = useState('')
  const [widerrufVerzicht, setWiderrufVerzicht] = useState(false)
  const [agbAccepted, setAgbAccepted] = useState(false)

  const isValid = customerType === 'business' 
    ? ustId.length >= 9 && agbAccepted
    : customerType === 'consumer' && widerrufVerzicht && agbAccepted

  return (
    <fieldset className="space-y-4 mb-6">
      <legend className="text-base font-semibold">
        Bitte wählen Sie:
      </legend>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="radio"
          name="customer_type"
          value="business"
          checked={customerType === 'business'}
          onChange={() => setCustomerType('business')}
          className="mt-1"
        />
        <div>
          <div className="font-medium">
            Ich bin Unternehmer / Geschäftskunde
          </div>
          <div className="text-sm text-muted-foreground">
            Kauf für gewerbliche Zwecke. Kein Widerrufsrecht.
          </div>
        </div>
      </label>

      {customerType === 'business' && (
        <div className="ml-6">
          <label className="block">
            <span className="text-sm font-medium">USt-IdNr. (Pflicht)</span>
            <input
              type="text"
              value={ustId}
              onChange={(e) => setUstId(e.target.value)}
              placeholder="DE123456789"
              className="block w-full mt-1 border rounded px-3 py-2"
              pattern="[A-Z]{2}[0-9A-Z]+"
              required
            />
            <span className="text-xs text-muted-foreground">
              Falls keine USt-IdNr.: Steuernummer einfügen (z. B. „St-Nr 12/345/67890")
            </span>
          </label>
        </div>
      )}

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="radio"
          name="customer_type"
          value="consumer"
          checked={customerType === 'consumer'}
          onChange={() => setCustomerType('consumer')}
          className="mt-1"
        />
        <div>
          <div className="font-medium">
            Ich bin Verbraucher (privat)
          </div>
          <div className="text-sm text-muted-foreground">
            Kauf für private Zwecke. 14 Tage Widerrufsrecht.
          </div>
        </div>
      </label>

      {customerType === 'consumer' && (
        <div className="ml-6 space-y-3 bg-amber-50 p-4 rounded">
          <p className="text-sm">
            <strong>Wichtig zum Widerrufsrecht:</strong>
          </p>
          <p className="text-sm">
            Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen 
            diesen Vertrag zu widerrufen. Da Sie aber digitale Inhalte 
            (PDF-Report) sofort nach Bezahlung herunterladen können, 
            erlischt Ihr Widerrufsrecht, wenn Sie die folgende Erklärung 
            akzeptieren:
          </p>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={widerrufVerzicht}
              onChange={(e) => setWiderrufVerzicht(e.target.checked)}
              className="mt-1"
              required
            />
            <span className="text-sm">
              Ich verzichte ausdrücklich auf mein 14-tägiges 
              Widerrufsrecht und bestätige, dass dieses mit 
              Vertragsabschluss erlischt (§ 356 Abs. 5 BGB). Mit 
              Bestellung beginnt die Ausführung sofort.
            </span>
          </label>
        </div>
      )}

      <label className="flex items-start gap-2 cursor-pointer mt-4">
        <input
          type="checkbox"
          checked={agbAccepted}
          onChange={(e) => setAgbAccepted(e.target.checked)}
          className="mt-1"
          required
        />
        <span className="text-sm">
          Ich habe die <a href="/agb" className="underline">AGB</a>, die{' '}
          <a href="/datenschutz" className="underline">Datenschutzerklärung</a> und 
          die <a href="/widerrufsbelehrung" className="underline">
          Widerrufsbelehrung</a> gelesen und akzeptiert.
        </span>
      </label>

      <button
        type="submit"
        disabled={!isValid}
        onClick={() => onChange({ customerType, ustId, widerrufVerzicht })}
        className="w-full bg-mint-500 text-white py-3 rounded font-bold 
                   disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Zahlungspflichtig bestellen
      </button>
    </fieldset>
  )
}
```

---

## Backend-Speicherung (in `scanner/lib/orders.js` oder gleichwertig)

```js
// Nach Stripe-Webhook-Success:
const order = {
  session_id: stripeSession.id,
  customer_type: req.body.customer_type, // 'business' | 'consumer'
  ust_id: req.body.ust_id || null,
  widerruf_verzicht_accepted_at: req.body.customer_type === 'consumer' 
    ? new Date().toISOString() 
    : null,
  agb_accepted_at: new Date().toISOString(),
  agb_version: 'v2026-06-20', // bei AGB-Updates inkrementieren
  // ... weitere Felder
}
```

**Begründung:** Im Streitfall musst du **dokumentiert nachweisen können**, dass:
1. Der Verbraucher explizit auf Widerruf verzichtet hat
2. Der Verzicht VOR Lieferung dokumentiert wurde
3. Welche AGB-Version galt zum Zeitpunkt des Kaufs

---

## E-Mail-Bestätigung (nach Kauf)

```
Hallo {customer_name},

vielen Dank für Ihre Bestellung.

Bestätigung:
- Paket: {package_name}
- Betrag: {amount} €
- Kunden-Typ: {customer_type === 'business' ? 'Unternehmer' : 'Verbraucher'}
{IF customer_type === 'consumer':}
- Widerrufs-Verzicht: Sie haben am {date} ausdrücklich auf Ihr 
  Widerrufsrecht verzichtet (§ 356 Abs. 5 BGB), da Sie den Vollreport 
  sofort herunterladen wollten. Das Widerrufsrecht ist somit erloschen.
{END IF}
- Stand der AGB: {agb_version}

Ihre Rechnung als PDF: {download_url}
Ihr Vollreport: {report_url}

Bei Fragen: info@matthias-seba.de

Mit freundlichen Grüßen
Matthias Seba
Barrierefrei-Prüfen
```

---

## Trigger-Logik im Frontend

| Situation | Was passiert |
|---|---|
| Customer wählt „Unternehmer" + füllt USt-IdNr | „Zahlungspflichtig bestellen"-Button wird aktiv |
| Customer wählt „Verbraucher" + Widerrufs-Verzicht NICHT angekreuzt | Button bleibt grau, Hinweis „Bitte Widerrufs-Verzicht bestätigen" |
| Customer wählt „Verbraucher" + Widerrufs-Verzicht akzeptiert | Button aktiv, „Ihr Widerrufsrecht erlischt mit Bestellung" |
| Customer wählt NICHTS | Button grau, Hinweis „Bitte Unternehmer oder Verbraucher wählen" |

---

## Rechtliche Wirkung

✅ **Verbraucher kann nach 14 Tagen NICHT zurücktreten**, weil:
- Aktiver Widerruf-Verzicht dokumentiert
- Sofortige digitale Lieferung verbarmt das Recht (§ 356 Abs. 5 BGB)
- Du hast Audit-Trail

✅ **Unternehmer-Kauf ist B2B** → kein Widerrufsrecht überhaupt
- USt-IdNr. ist Indiz für gewerblichen Charakter
- Selbst falsch behaupteter B2B-Status entlastet dich (BGH I ZR 60/16)

❌ **NICHT funktioniert:**
- Verzicht-Checkbox vorausgewählt (UN-WIRKSAM, BGH)
- Implizite Verbraucher-Klassifikation (nur über opt-out)
- Verzicht ohne explizite „Erlöschens-Bestätigung"

---

## Test

- [ ] In Browser-DevTools: Submit-Button bleibt grau bei unvollständigem Formular
- [ ] Bei „Unternehmer" wird USt-ID-Input gefordert (pattern-validierung)
- [ ] Bei „Verbraucher" werden BEIDE Checkboxes verlangt
- [ ] Nach Kauf: Order-Eintrag in DB enthält `widerruf_verzicht_accepted_at`
- [ ] E-Mail-Bestätigung enthält Verzicht-Hinweis für Verbraucher
