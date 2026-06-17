#!/bin/bash
# Stripe-CLI Helper zum Triggern von Webhook-Events während Entwicklung.
# Voraussetzung: stripe-cli installiert + `stripe login` durchgeführt.
# Server muss lokal auf $LOCAL_URL laufen (default http://localhost:8080).

set -euo pipefail

LOCAL_URL="${LOCAL_URL:-http://localhost:8080}"
EVENT="${1:-help}"

if ! command -v stripe &> /dev/null; then
  echo "[FAIL] stripe-CLI nicht gefunden. Install: https://stripe.com/docs/stripe-cli"
  exit 1
fi

case "$EVENT" in
  help|--help|-h|"")
    cat <<USAGE
Stripe-Trigger-Helper für BFSG-Check Webhook-Tests.

Aufruf: $0 <event>

Verfügbare Events:
  checkout            checkout.session.completed (Basis-Paket-Kauf)
  checkout-profi      checkout.session.completed (Profi-Paket-Kauf)
  checkout-cookie     checkout.session.completed (Cookie-Basis-Paket)
  abo-checkout        checkout.session.completed (Subscription-Mode, Re-Check-Abo)
  invoice-paid        invoice.paid (monatlicher Re-Check)
  sub-deleted         customer.subscription.deleted (Kündigung)
  refund              charge.refunded (Refund-Pfad)

Environment:
  LOCAL_URL           Server-URL (default: $LOCAL_URL)

Beispiel:
  $0 checkout                         # gewöhnlicher Erstkauf
  LOCAL_URL=http://localhost:18080 $0 abo-checkout
USAGE
    ;;

  checkout)
    stripe trigger checkout.session.completed \
      --add checkout_session:metadata.url=https://example.com \
      --add checkout_session:metadata.pkg=basis \
      --add checkout_session:metadata.customerType=business \
      --add checkout_session:metadata.consent=ja
    ;;

  checkout-profi)
    stripe trigger checkout.session.completed \
      --add checkout_session:metadata.url=https://example.com \
      --add checkout_session:metadata.pkg=profi \
      --add checkout_session:metadata.customerType=business \
      --add checkout_session:metadata.consent=ja
    ;;

  checkout-cookie)
    stripe trigger checkout.session.completed \
      --add checkout_session:metadata.url=https://example.com \
      --add checkout_session:metadata.pkg=cookie-basis \
      --add checkout_session:metadata.customerType=business \
      --add checkout_session:metadata.consent=ja
    ;;

  abo-checkout)
    stripe trigger checkout.session.completed \
      --add checkout_session:mode=subscription \
      --add checkout_session:metadata.url=https://example.com \
      --add checkout_session:metadata.pkg=abo \
      --add checkout_session:metadata.customerType=business \
      --add checkout_session:metadata.consent=ja
    ;;

  invoice-paid)
    stripe trigger invoice.paid \
      --add invoice:billing_reason=subscription_cycle
    ;;

  sub-deleted)
    stripe trigger customer.subscription.deleted
    ;;

  refund)
    stripe trigger charge.refunded
    ;;

  *)
    echo "[FAIL] Unbekanntes Event: $EVENT"
    echo "Verfügbare: checkout, checkout-profi, checkout-cookie, abo-checkout, invoice-paid, sub-deleted, refund"
    exit 1
    ;;
esac

echo ""
echo "[INFO] Event ausgelöst. Erwartete Server-Reaktion: siehe out/orders.jsonl"
echo "[INFO] Tail-Logs:    docker compose -f deployment/docker-compose.yml logs -f --tail=30 app"
echo "[INFO] Order-Status: tail -n 5 out/orders.jsonl | jq"
