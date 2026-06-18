#!/usr/bin/env bash
# Bitwarden-ENV-Injection-Wrapper.
#
# Liest Secret-Mappings aus einer .env.tpl-Datei (Format: VAR=bw://Item/Field),
# holt die Werte via `bw get`, exportiert sie als ENV und fuehrt das uebergebene
# Kommando aus. Nichts wird persistent geschrieben.
#
# Nutzung:
#   ./scripts/bw-inject-env.sh deployment/.env.tpl -- ssh bfsg "cat > /opt/bfsg-check/deployment/.env"
#   ./scripts/bw-inject-env.sh deployment/.env.tpl -- docker compose restart app
#
# Voraussetzung: bw ist eingeloggt + entsperrt (BW_SESSION exportiert).
# Test: `bw status` muss "unlocked" zeigen.

set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <env.tpl> -- <command> [args...]" >&2
  echo "Example: $0 deployment/.env.tpl -- docker compose restart app" >&2
  exit 1
fi

TPL_FILE="$1"
shift
if [[ "$1" != "--" ]]; then
  echo "Error: erwarte '--' nach .env.tpl-Pfad" >&2
  exit 1
fi
shift

if [[ ! -f "$TPL_FILE" ]]; then
  echo "Error: $TPL_FILE nicht gefunden" >&2
  exit 1
fi

if ! command -v bw >/dev/null 2>&1; then
  echo "Error: bw (Bitwarden CLI) nicht installiert. Setup: docs/CLAUDE-AGENT-SETUP.md Schritt 3." >&2
  exit 1
fi

if ! bw status 2>/dev/null | grep -q '"status":"unlocked"'; then
  echo "Error: Bitwarden ist gesperrt. Erst: export BW_SESSION=\$(bw unlock --raw)" >&2
  exit 1
fi

# Build ENV-Map aus Template
declare -a ENV_EXPORTS=()

while IFS= read -r line; do
  # Skip Kommentare und leere Zeilen
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

  # Format: VAR_NAME=bw://Item-Name/field-name
  if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=bw://(.+)/(.+)$ ]]; then
    var_name="${BASH_REMATCH[1]}"
    item_name="${BASH_REMATCH[2]}"
    field_name="${BASH_REMATCH[3]}"

    # Hol den Wert (notes/login.password/custom field)
    case "$field_name" in
      password)
        value="$(bw get password "$item_name" 2>/dev/null || true)"
        ;;
      username)
        value="$(bw get username "$item_name" 2>/dev/null || true)"
        ;;
      notes)
        value="$(bw get notes "$item_name" 2>/dev/null || true)"
        ;;
      *)
        # Custom field
        value="$(bw get item "$item_name" 2>/dev/null | jq -r ".fields[] | select(.name==\"$field_name\") | .value" 2>/dev/null || true)"
        ;;
    esac

    if [[ -z "$value" || "$value" == "null" ]]; then
      echo "Warning: $var_name (bw://$item_name/$field_name) nicht gefunden, skip" >&2
      continue
    fi

    ENV_EXPORTS+=("$var_name=$value")
  else
    # Pass-through fuer Plain-Values
    ENV_EXPORTS+=("$line")
  fi
done < "$TPL_FILE"

# Exec mit injizierten ENV
exec env "${ENV_EXPORTS[@]}" "$@"
