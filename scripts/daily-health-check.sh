#!/usr/bin/env bash
# Daily Health-Check für BFSG-Check.
# Nutzung: ./scripts/daily-health-check.sh
# Cron-faehig: 0 8 * * * cd /pfad/zu/bfsg-check && ./scripts/daily-health-check.sh

set -uo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=============================================="
echo "  BFSG-Check Tagescheck — $(date '+%Y-%m-%d %H:%M')"
echo "=============================================="
echo ""

# 1. Server-Health
echo "🌐 1. Server-Health"
HEALTH=$(curl -fSs --max-time 10 https://bfsg-fix.de/health 2>&1)
if echo "$HEALTH" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ ok:true${NC}"
  echo "$HEALTH" | grep -oE '"(stripe|live|mailer|aboEnabled)":[^,}]*' | sed 's/^/   /'
else
  echo -e "${RED}❌ HEALTH-Endpoint nicht ok!${NC}"
  echo "   Response: $HEALTH"
fi
echo ""

# 2. SSL-Cert
echo "🔒 2. SSL-Zertifikat"
CERT_EXPIRY=$(echo | openssl s_client -servername bfsg-fix.de -connect bfsg-fix.de:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [[ -n "$CERT_EXPIRY" ]]; then
  EXPIRY_TS=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null || echo 0)
  NOW_TS=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_TS - NOW_TS) / 86400 ))
  if [[ $DAYS_LEFT -gt 30 ]]; then
    echo -e "${GREEN}✅ gueltig noch $DAYS_LEFT Tage${NC}"
  elif [[ $DAYS_LEFT -gt 7 ]]; then
    echo -e "${YELLOW}⚠ laeuft in $DAYS_LEFT Tagen ab${NC}"
  else
    echo -e "${RED}❌ KRITISCH: $DAYS_LEFT Tage!${NC}"
  fi
else
  echo -e "${YELLOW}⚠ konnte nicht geprueft werden${NC}"
fi
echo ""

# 3. DNS
echo "🌍 3. DNS"
IP=$(dig +short bfsg-fix.de 2>/dev/null | head -1)
if [[ -n "$IP" ]]; then
  echo -e "${GREEN}✅ $IP${NC}"
else
  echo -e "${RED}❌ DNS-Aufloesung fehlgeschlagen${NC}"
fi
echo ""

# 4. Latency
echo "⚡ 4. Latency"
LATENCY=$(curl -o /dev/null -s -w '%{time_total}\n' https://bfsg-fix.de/ 2>/dev/null)
LATENCY_MS=$(echo "$LATENCY * 1000" | bc 2>/dev/null | cut -d. -f1)
if [[ -n "$LATENCY_MS" ]]; then
  if [[ $LATENCY_MS -lt 500 ]]; then
    echo -e "${GREEN}✅ ${LATENCY_MS}ms${NC}"
  elif [[ $LATENCY_MS -lt 1500 ]]; then
    echo -e "${YELLOW}⚠ ${LATENCY_MS}ms (langsam)${NC}"
  else
    echo -e "${RED}❌ ${LATENCY_MS}ms (sehr langsam)${NC}"
  fi
fi
echo ""

# 5. /api/scan funktional?
echo "🔍 5. Scanner funktional (example.com)"
SCAN=$(curl -fsS --max-time 60 "https://bfsg-fix.de/api/scan?url=https://example.com" 2>&1)
if echo "$SCAN" | grep -q '"score"'; then
  SCORE=$(echo "$SCAN" | grep -oE '"score":[0-9]+' | head -1 | cut -d: -f2)
  echo -e "${GREEN}✅ Score: $SCORE/100${NC}"
else
  echo -e "${RED}❌ Scan fehlgeschlagen${NC}"
  echo "   Response: $SCAN" | head -3
fi
echo ""

# 6. Stripe-Webhook erreichbar?
echo "💳 6. Stripe-Webhook-Endpoint"
STATUS=$(curl -o /dev/null -s -w '%{http_code}' -X POST https://bfsg-fix.de/webhook -H 'Content-Type: application/json' -d '{}' 2>/dev/null)
if [[ "$STATUS" == "400" ]] || [[ "$STATUS" == "401" ]]; then
  echo -e "${GREEN}✅ erreichbar (HTTP $STATUS — erwartet wegen fehlender Signatur)${NC}"
else
  echo -e "${YELLOW}⚠ HTTP $STATUS unerwartet${NC}"
fi
echo ""

echo "=============================================="
echo "  Tagescheck fertig."
echo "=============================================="
