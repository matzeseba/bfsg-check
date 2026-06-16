#!/bin/bash
# BFSG-Check Restore-Skript — entschlüsselt GPG-Archive + extrahiert in TARGET-Dir.
# Aufruf: deployment/restore.sh <archive.tar.gz.gpg> [target-dir]
# Voraussetzung: Privater GPG-Key des BACKUP_GPG_RECIPIENT muss im Schlüsselbund sein.

set -euo pipefail
ARCHIVE="${1:?Aufruf: restore.sh <backup.tar.gz.gpg> [target-dir]}"
TARGET="${2:-/tmp/bfsg-restore-$(date +%s)}"

[ -f "$ARCHIVE" ] || { echo "[FAIL] Archive $ARCHIVE nicht gefunden"; exit 1; }

mkdir -p "$TARGET"
echo "=== Restore-Start: $(date -Iseconds) ==="
echo "Archive: $ARCHIVE"
echo "Target:  $TARGET"

gpg --batch --yes --decrypt "$ARCHIVE" | tar -C "$TARGET" -xzf -

echo ""
echo "=== Inhalt nach Restore ==="
ls -la "$TARGET"
echo ""
echo "[OK] Restore abgeschlossen in $TARGET"
echo "Nächster Schritt: Daten manuell in Docker-Volume zurückspielen, dann Container neu starten:"
echo "  docker compose -f /opt/bfsg-check/deployment/docker-compose.yml down"
echo "  rsync -a $TARGET/ /var/lib/docker/volumes/deployment_bfsg_data/_data/"
echo "  docker compose -f /opt/bfsg-check/deployment/docker-compose.yml up -d"
