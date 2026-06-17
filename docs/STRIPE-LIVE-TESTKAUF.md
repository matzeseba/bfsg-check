# Stripe Live-Testkauf-Runbook

**Wann:** Vor allerersten Live-Verkauf an Echtkunden. Diesen Test 1× durchführen, dokumentieren, dann freigeben.
**Warum:** Synthetic-Tests (Mock-Webhooks) decken nicht ab: echte Stripe-Signaturen, echte Karte, echte Mail-Zustellung, echter Refund-Pfad.
**Dauer:** ~15 Minuten. Kostet effektiv 0 € (Test-Kauf wird sofort refundiert).

---

## Vorbereitung (1× einmalig)

### 1. Test-Produkt anlegen (1 €)

Stripe-Dashboard → **Produkte** → **Neues Produkt**:
- Name: `BFSG-Check INTERNAL TEST PRODUCT — NICHT KAUFEN`
- Preis: `1,00 €` einmalig
- **Statement-Descriptor**: `BFSG-TEST` (taucht im Bank-Auszug auf)

→ Notiere die `price_id` (z.B. `price_1Tj…`)

### 2. Test-Endpoint im Webhook-Filter

Stripe-Dashboard → **Entwickler → Webhooks → bfsg-fix.de Endpoint**:
- Prüfe dass die 3 Events abonniert sind:
  - `checkout.session.completed`
  - `invoice.paid`
  - `customer.subscription.deleted`

### 3. ADMIN_TOKEN bereitstellen

Auf dem Server (per SSH):
```bash
# Falls noch nicht geschehen:
echo "ADMIN_TOKEN=$(openssl rand -hex 32)" >> /opt/bfsg-check/deployment/.env
cd /opt/bfsg-check/deployment && docker compose restart app

# Den Token notieren (du brauchst ihn für /admin/* + /api/resend/*)
grep ADMIN_TOKEN /opt/bfsg-check/deployment/.env
```

---

## Live-Test-Durchführung

### Schritt 1: Vor-Verifikation

```bash
# Health-Check (sollte live:true zeigen)
curl -fSs https://bfsg-fix.de/health | jq
# Erwartung: {"ok":true,"stripe":true,"live":true,"mailer":"aktiv …"}

# Admin-API erreichbar?
curl -fSs -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://bfsg-fix.de/admin/orders | jq '.count'
# Erwartung: irgendeine Zahl ≥0

# Mail-Auth-Records sauber?
bash /opt/bfsg-check/deployment/scripts/check-mail-auth.sh bfsg-fix.de
```

### Schritt 2: Test-Bestellung mit echter Karte

1. **Landingpage öffnen** (im Browser): https://bfsg-fix.de
2. **Gratis-Scan starten** für eine beliebige öffentliche URL (z.B. example.com)
3. Im Ergebnis: **"Vollreport sichern" → Basis (199 €)** wählen
4. Im Checkout-Modal:
   - **Verbraucher**-Toggle wählen (B2C-Pfad)
   - Widerruf-Consent ankreuzen (sonst kein Vertrag)
   - **Eigene E-Mail** eingeben (für Report-Empfang)
   - "Zahlungspflichtig bestellen"
5. **Im Stripe-Checkout:**
   - **Eigene echte Karte** verwenden (nicht 4242 4242 4242 4242 — die akzeptiert Live-Mode nicht)
   - Kleiner Betrag: 1 €-Test-Produkt aus Vorbereitung (oder akzeptiere die 199 €, refundiere danach komplett)
6. Bezahlen

### Schritt 3: Webhook-Verifikation (max 30 Sekunden)

```bash
# Auf dem Server:
docker compose -f /opt/bfsg-check/deployment/docker-compose.yml logs --tail=50 app | grep -E "webhook|Report"

# Erwartete Sequenz im Log:
#   [webhook] Report ausgeliefert: cs_live_xxx -> deine@email.de
```

Wenn `[webhook] ERFÜLLUNG FEHLGESCHLAGEN` → siehe Troubleshooting unten.

### Schritt 4: Mail-Empfang prüfen (max 2 Min)

- Posteingang öffnen (auch Spam-Ordner!)
- Erwartet: Mail mit Subject `Ihr BFSG-Barrierefreiheits-Report` + PDF-Anhang
- **PDF öffnen** und sichten:
  - Korrekte Domain im Header (example.com)
  - Score sichtbar
  - Findings vorhanden
  - Footer: Disclaimer "keine Konformitätsgarantie"

### Schritt 5: Order-Status verifizieren

```bash
# Auf dem Server oder lokal mit ADMIN_TOKEN
curl -fSs -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://bfsg-fix.de/admin/orders | jq '.orders[0]'
# Erwartung: { "sessionId": "cs_live_...", "status": "MAILED", "pdfPath": "..." }
```

### Schritt 6: Refund

1. **Stripe-Dashboard → Zahlungen → den Test-Payment finden**
2. **"Erstatten"** klicken → Vollbetrag
3. Im Bank-Auszug erscheint nach 5–10 Werktagen Refund

→ Effektive Kosten: 0 €. Stripe-Gebühr (0,30 € + 1,4%) wird bei Refund teilweise refundiert (Stripe-Policy variiert).

---

## Erwartete Ergebnisse (Checkliste)

- [ ] `/health` zeigt `live:true, stripe:true, mailer:aktiv`
- [ ] Stripe-Webhook empfängt 200-Response (Stripe-Dashboard → Webhooks → Logs)
- [ ] `out/orders.jsonl` enthält Eintrag `status:MAILED`
- [ ] Mail mit PDF-Report kommt **nicht** im Spam an
- [ ] PDF ist vollständig, Branding korrekt, Disclaimer im Footer
- [ ] Refund erfolgreich, Order-Status bleibt `MAILED` (nicht zurückrollen)
- [ ] `/admin/orders` zeigt die Test-Order

---

## Troubleshooting

### Webhook 400 (Signatur ungültig)
- `STRIPE_WEBHOOK_SECRET` in `.env` falsch / vertauscht → korrigieren + `docker compose restart app`
- Webhook-Endpoint im Stripe-Dashboard zeigt evtl. auf falsche URL

### "ERFÜLLUNG FEHLGESCHLAGEN"
```bash
# Welcher Fehler genau?
docker compose logs app | grep ERFÜLLUNG
```

Häufige Ursachen:
- **Brevo SMTP down** → Brevo-Dashboard prüfen, ggf. `SMTP_PASS` rotiert
- **Playwright/Chromium-Crash** → `docker stats` zeigt RAM-Mangel → Concurrency `MAX_CONCURRENT_SCANS=1`
- **SSRF-Guard blockt URL** → wenn Test-URL `localhost` o.ä. — andere URL nutzen

### Mail kommt im Spam
- `bash deployment/scripts/check-mail-auth.sh bfsg-fix.de` — SPF/DKIM/DMARC alle OK?
- `mail-tester.com` Score < 9/10 → siehe `docs/EMAIL-DELIVERABILITY.md`
- Brevo-Domain-Verifikation: app.brevo.com → Senders → Domain → Status grün?

### Order bleibt auf "FAILED"
Resend-Pfad:
```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://bfsg-fix.de/api/resend/cs_live_xxx
```

---

## Nach erfolgreichem Test

1. **Test-Produkt deaktivieren** (Stripe-Dashboard) — Stripe lässt sich nicht ganz löschen aber deaktivieren
2. **Test-Order aus `out/orders.jsonl`** ggf. **NICHT** löschen — sie ist historisch korrekt, hat Status `MAILED` und einen echten Refund-Trail
3. **Dokumentiere in `docs/GO-LIVE-SIGNOFF.md`** (selbst anlegen): Datum, Test-Session-ID, Mail-Eingang OK, Refund OK
4. **Erst dann:** Marketing-Funnel scharf schalten (Google-Ads-Kampagne aktivieren, LinkedIn-Owner-Post)
