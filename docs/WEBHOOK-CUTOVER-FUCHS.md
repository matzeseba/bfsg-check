# Runbook: Stripe-Webhook-Cutover auf bfsg-fuchs.de

Stand: 2026-07. Ziel: Der Stripe-Webhook läuft unter der Marken-Primär
`https://bfsg-fuchs.de/webhook`; der bisherige Endpoint auf `bfsg-fix.de` wird
danach deaktiviert. bfsg-fuchs.de ist die einzige Wahrheit für alle
nutzerseitigen Links (Domain-SSOT, PR `fix/domain-ssot`).

**Wichtig:** Absender-/Kontakt-Postfächer laufen seit 23.07.2026 auf `info@bfsg-fuchs.de` bzw.
`no-reply@bfsg-fuchs.de` (Brevo-verifiziert); `info@bfsg-fix.de` ist gelöscht.
Der Cutover betrifft NUR den Webhook/ die öffentliche Domain, NICHT die
E-Mail-Adressen.

---

## 1. Technischer Check: routet bfsg-fuchs.de/webhook bereits ans Backend?

**Ja.** Befund aus `deployment/Caddyfile` (Hauptblock):

```caddy
bfsg-fix.de, www.bfsg-fix.de, bfsg-fuchs.de, www.bfsg-fuchs.de {
    ...
    # Stripe-Webhook: rohes Body, kein Caddy-Buffer (sonst Signatur-Verifikation kaputt).
    handle /webhook {
        reverse_proxy app:8080 {
            flush_interval -1
        }
    }
```

- `bfsg-fuchs.de` und `www.bfsg-fuchs.de` sind im SELBEN Site-Block wie
  `bfsg-fix.de` — der `handle /webhook`-Block gilt also bereits für beide
  Domains. `https://bfsg-fuchs.de/webhook` wird heute schon unverändert (roher
  Body, `flush_interval -1`, kein Buffering) an `app:8080` durchgereicht.
- Caddy holt die Let's-Encrypt-Zertifikate für alle vier Hostnames automatisch.
- **Es ist KEINE Caddyfile-Änderung nötig.** (Hätte eine nötig gewesen, wäre sie
  als separater Commit gekommen — Caddy-Änderungen sind P0-sensitiv und vor jedem
  Reload mit `caddy validate --config /etc/caddy/Caddyfile` im Container
  bzw. `docker exec bfsg-caddy caddy validate --config /etc/caddy/Caddyfile`
  zu prüfen.)
- Der Caddyfile-Kommentar sieht vor: sobald der Stripe-Webhook auf
  bfsg-fuchs.de umgezogen ist, KANN bfsg-fix.de optional per 301 auf
  bfsg-fuchs.de gelegt werden. Das ist ein eigener, späterer Schritt
  (eigener Commit + `caddy validate`), NICHT Teil dieses Cutovers.

Vorab-Verifikation auf dem Server (ohne Änderung):

```bash
curl -sS -X POST https://bfsg-fuchs.de/webhook -d '{}' -o /dev/null -w '%{http_code}\n'
# Erwartet: 400 (Signatur fehlt/ungültig) — beweist: Route + Backend erreichbar.
# Ein 404/502 würde dagegen ein Routing-Problem bedeuten.
```

## 2. Owner-Schritte (Stripe-Dashboard + Server)

1. **Neuen Endpoint anlegen:**
   Stripe-Dashboard → Entwickler → Webhooks → „Endpoint hinzufügen":
   - URL: `https://bfsg-fuchs.de/webhook`
   - Events (Pflicht): `checkout.session.completed`
   - Events (zusätzlich, solange das Re-Check-Abo aktiv/freigeschaltet ist —
     vgl. `scanner/.env.example` ENABLE_ABO-Hinweis):
     `invoice.paid`, `invoice.payment_succeeded`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - API-Version: dieselbe wie beim bisherigen Endpoint (im alten Endpoint
     nachsehen, damit das Event-Schema identisch bleibt).
2. **Neues Signing-Secret übernehmen:** Im neuen Endpoint
   „Signing-Secret anzeigen" (`whsec_...`) kopieren und eintragen:
   - Server: in der produktiven `.env` (neben `deployment/docker-compose.yml`)
     `STRIPE_WEBHOOK_SECRET=whsec_<neu>` setzen. Die Compose-Datei reicht die
     Variable als `STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}` in den
     App-Container durch.
   - GitHub: prüfen, ob unter Settings → Secrets and variables → Actions ein
     Secret `STRIPE_WEBHOOK_SECRET` existiert und ggf. aktualisieren.
     (Befund aus diesem Repo: aktuell referenziert KEIN Workflow unter
     `.github/workflows/` dieses Secret — Stand dieser Prüfung. Der Eintrag im
     GitHub-Secret-Store ist damit voraussichtlich nicht erforderlich, aber
     vor Ort zu verifizieren.)
3. **App neu starten**, damit die neue Env greift:
   `docker compose up -d app` (im `deployment/`-Verzeichnis) bzw. den
   üblichen Deploy-Pfad nutzen.
4. **Testen (vor Deaktivierung des alten Endpoints!):**
   - Stripe CLI: `stripe trigger checkout.session.completed` gegen den neuen
     Endpoint bzw. im Dashboard unter dem neuen Endpoint „Test-Event senden".
   - Erwartung: App quittiert mit 2xx; in `out/orders.jsonl` erscheint die
     Bestellung als bezahlt; Erfüllung (Report + Mail) läuft an.
   - Optional End-to-End: echter Testkauf über die bfsg-fuchs.de-Checkout-
     Strecke (Testmodus) — danke.html als success_url muss erscheinen.
   - Fehlersignatur: 400er im App-Log („Webhook-Signatur ungültig") =
     falsches/altes Secret → Schritt 2 wiederholen.
5. **Alten Endpoint deaktivieren** (nicht löschen — Verlauf behalten):
   alten `bfsg-fix.de/webhook`-Endpoint im Stripe-Dashboard deaktivieren,
   sobald der neue Endpoint mindestens einen echten Live-Event erfolgreich
   verarbeitet hat.
6. **Beobachten:** 24–48 h Stripe-Dashboard → Webhooks → „Fehlgeschlagene
   Events" des alten UND neuen Endpoints prüfen. Stripe sendet bei
   fehlgeschlagenen Zustellungen Warn-Mails — Postfach im Blick behalten.

## 3. Rollback

Falls der neue Endpoint Probleme macht: alten Endpoint im Stripe-Dashboard
wieder aktivieren und in der Server-`.env` das alte `STRIPE_WEBHOOK_SECRET`
zurücksetzen, App neu starten. Beide Endpoints können parallel aktiv sein —
die App dedupliziert Events durable über `event.id` (`recordPaid`), doppelte
Zustellung während der Übergangszeit führt also nicht zu doppelter Erfüllung.

## 4. Offene Folgeschritte (nicht Teil dieses Runbooks)

- Optionaler 301 bfsg-fix.de → bfsg-fuchs.de im Caddyfile (eigener Commit,
  `caddy validate` Pflicht, P0-sensitiv).
- Postfach `@bfsg-fuchs.de` einrichten; erst danach Absender-/Kontakt-
  E-Mail-Adressen (FROM_EMAIL, INVOICE_CONTACT_EMAIL, REPLY_TO) umziehen.
