# Template fuer bw-inject-env.sh
# Nutzung:
#   bash scripts/bw-inject-env.sh docs/claude-agent-setup/server.env.tpl -- \
#     ssh bfsg "tee /opt/bfsg-check/deployment/.env >/dev/null && docker compose restart app"
#
# Format: VAR_NAME=bw://Item-Name-in-Bitwarden/field-name
# Felder koennen sein: password | username | notes | custom-field-name

# === Aus Block 1 (Vorbereitungen) ===
ADMIN_TOKEN=bw://BFSG-Claude-ADMIN_TOKEN/password
SENTRY_DSN=bw://BFSG-Claude-Sentry/dsn

# === Aus Block 3.2 (Rechnungs-Stammdaten, Kleinunternehmer) ===
VAT_MODE=kleinunternehmer
INVOICE_FROM_NAME=Matthias Seba
INVOICE_FROM_ADDRESS=Lange Straße 20, 27449 Kutenholz
INVOICE_USTID=
INVOICE_TAX_NUMBER=
INVOICE_IBAN=

# === Aus Block 3 (Backup) ===
BACKUP_GPG_RECIPIENT=backup@bfsg-fix.de
BACKUP_TARGET=hetzner-storage:bfsg-backups

# === Aus Block 8 (Secrets, rotierbar) ===
SMTP_USER=bw://BFSG-Claude-Brevo/username
SMTP_PASS=bw://BFSG-Claude-Brevo/password
STRIPE_SECRET_KEY=bw://BFSG-Claude-Stripe/password
STRIPE_WEBHOOK_SECRET=bw://BFSG-Claude-Stripe/webhook_secret
