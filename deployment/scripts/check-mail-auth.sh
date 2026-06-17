#!/usr/bin/env bash
# check-mail-auth.sh — Prüft SPF / DKIM / DMARC für eine Domain
#
# Usage: bash deployment/scripts/check-mail-auth.sh [domain]
# Default-Domain: bfsg-fix.de
#
# Exit-Codes:
#   0 = alle Checks OK
#   1 = mindestens ein Check FAIL
#   2 = dig nicht installiert
set -u

DOMAIN="${1:-bfsg-fix.de}"
DKIM_SELECTOR="${DKIM_SELECTOR:-mail}"

if ! command -v dig >/dev/null 2>&1; then
    echo "[FAIL] 'dig' nicht installiert. Bitte 'dnsutils' / 'bind-utils' installieren."
    exit 2
fi

FAIL_COUNT=0
ok()   { echo "[OK]   $*"; }
fail() { echo "[FAIL] $*"; FAIL_COUNT=$((FAIL_COUNT+1)); }
info() { echo "[INFO] $*"; }

echo "============================================================"
echo " Mail-Auth-Check für: ${DOMAIN}"
echo " DKIM-Selector:        ${DKIM_SELECTOR}"
echo " Zeit:                 $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "============================================================"

# -------- SPF (TXT auf @) --------
echo ""
echo "--- SPF ---"
SPF_RAW="$(dig +short TXT "${DOMAIN}" | tr -d '"' | grep -i '^v=spf1' || true)"
if [ -z "${SPF_RAW}" ]; then
    fail "Kein SPF-Record (v=spf1) gefunden für ${DOMAIN}."
else
    ok "SPF gefunden: ${SPF_RAW}"
    if echo "${SPF_RAW}" | grep -qi 'include:spf.brevo.com'; then
        ok "Brevo-Include (spf.brevo.com) vorhanden."
    else
        fail "SPF enthält KEIN include:spf.brevo.com — Brevo-Mails könnten als Spam landen."
    fi
    if echo "${SPF_RAW}" | grep -qE '[-~]all'; then
        ok "SPF endet mit ~all oder -all (Policy gesetzt)."
    else
        fail "SPF hat keine all-Policy (~all / -all) — empfohlen: ~all (soft) oder -all (hard)."
    fi
fi

# -------- DKIM (TXT auf ${selector}._domainkey) --------
echo ""
echo "--- DKIM (${DKIM_SELECTOR}._domainkey.${DOMAIN}) ---"
DKIM_RAW="$(dig +short TXT "${DKIM_SELECTOR}._domainkey.${DOMAIN}" | tr -d '"' | tr -d ' ' || true)"
if [ -z "${DKIM_RAW}" ]; then
    fail "Kein DKIM-Record auf ${DKIM_SELECTOR}._domainkey.${DOMAIN} gefunden."
    info "→ In Brevo: Senders, Domains & dedicated IPs → Domains → ${DOMAIN} → DKIM-TXT kopieren und als TXT-Record setzen."
else
    ok "DKIM-Record vorhanden."
    if echo "${DKIM_RAW}" | grep -qi 'p='; then
        ok "DKIM enthält public-key Tag (p=...)."
    else
        fail "DKIM-Record ohne p= Tag — vermutlich invalide."
    fi
fi

# -------- DMARC (TXT auf _dmarc) --------
echo ""
echo "--- DMARC (_dmarc.${DOMAIN}) ---"
DMARC_RAW="$(dig +short TXT "_dmarc.${DOMAIN}" | tr -d '"' | grep -i '^v=DMARC1' || true)"
if [ -z "${DMARC_RAW}" ]; then
    fail "Kein DMARC-Record auf _dmarc.${DOMAIN} gefunden."
else
    ok "DMARC gefunden: ${DMARC_RAW}"
    POLICY="$(echo "${DMARC_RAW}" | grep -oE 'p=[a-z]+' | head -n1 | cut -d= -f2 || true)"
    case "${POLICY}" in
        none)       info "Policy: p=none (Monitoring-Modus — OK für Start, später Migration)." ;;
        quarantine) ok   "Policy: p=quarantine (Migration aktiv)." ;;
        reject)     ok   "Policy: p=reject (Endstufe — voll durchgesetzt)." ;;
        *)          fail "Policy konnte nicht erkannt werden (gefunden: '${POLICY}')." ;;
    esac
    if echo "${DMARC_RAW}" | grep -qi 'rua=mailto:'; then
        ok "rua= (Aggregate-Report-Empfänger) gesetzt."
    else
        fail "Keine rua=mailto:... — Aggregate-Reports laufen ins Leere."
    fi
fi

# -------- MX (Optional / Info) --------
echo ""
echo "--- MX (Info) ---"
MX_RAW="$(dig +short MX "${DOMAIN}" || true)"
if [ -z "${MX_RAW}" ]; then
    info "Kein MX-Record — outbound-only via Brevo SMTP ist OK; Inbound geht nicht."
else
    ok "MX-Records vorhanden:"
    echo "${MX_RAW}" | sed 's/^/        /'
fi

# -------- Summary --------
echo ""
echo "============================================================"
if [ "${FAIL_COUNT}" -eq 0 ]; then
    echo " ERGEBNIS: ALLE CHECKS OK"
    echo "============================================================"
    exit 0
else
    echo " ERGEBNIS: ${FAIL_COUNT} FAIL(S) — bitte beheben."
    echo "============================================================"
    exit 1
fi
