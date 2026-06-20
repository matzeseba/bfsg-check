---
name: process-refund
description: Vollständige Refund-Abwicklung mit Stripe + Kundenmail + Audit-Log. Trigger "Erstatte Order", "Refund #cs_live_...".
---

# Refund-Skill

## Input erforderlich
- Stripe Session/Charge-ID oder Order-Referenz (`cs_live_...` oder `pi_...`)
- Optional: Grund (für Audit-Log)

## Schritte

### 1. Order in Stripe lookup
Stripe MCP: Suche Session/Charge → zeige:
- Betrag, Kunde-Mail, Paket (basis/profi/cookie-basis/cookie-profi)
- Created-Date
- Status (succeeded / refunded?)

**STOP wenn:** schon refunded → Hinweis, keine weitere Aktion.

### 2. Bestätigung holen
Frag den User:
> Ich werde [Betrag] € an [Email] zurückerstatten. Grund: [Grund]. OK? (y/n)

**Nur weiter wenn y.**

### 3. Refund via Stripe MCP
- Vollständiger Refund (oder Teil-Refund falls spezifiziert)
- `reason`: "requested_by_customer"
- Metadata: `refunded_by: claude-skill`, `audit_ts: <ISO>`

### 4. Mail an Kunden via Brevo MCP
Template:
```
Betreff: Rückerstattung deiner BFSG-Check-Bestellung

Hallo [Name],

deine Bestellung vom [Datum] wurde vollständig erstattet ([Betrag] €).
Die Gutschrift erscheint in 5–10 Werktagen auf deiner Karte.

Falls du Feedback hast, was wir verbessern können — würde mich freuen.

Viele Grüße,
Matthias Seba
BFSG-Check
info@matthias-seba.de
```

### 5. Audit-Log
Append zu `~/bfsg-check/out/refunds-log.jsonl`:
```json
{"ts":"2026-...","session_id":"cs_live_...","amount":199,"customer_email":"...","reason":"...","refunded_by":"claude"}
```

### 6. Output
```markdown
## ✅ Refund verarbeitet
- Order: cs_live_xxx
- Betrag: 199 €
- Kunde: kunde@example.com
- Mail: zugestellt via Brevo
- Stripe-Refund-ID: re_...
```
