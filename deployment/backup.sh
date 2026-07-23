#!/bin/bash
# BFSG-Check täglich Backup — GPG-verschlüsselt, via rclone zu BACKUP_TARGET.
# Erwartet env: BACKUP_GPG_RECIPIENT (E-Mail des GPG-Pubkeys), BACKUP_TARGET (rclone-Remote z.B. "hetzner-storage:bfsg-backups").
# Ohne BACKUP_TARGET → nur lokales Backup in /var/backups/bfsg/ (Retention 14 Tage).
# Wird produktiv via /usr/local/bin/bfsg-backup-run.sh (Cron) aufgerufen — siehe docs/BACKUP.md.

set -euo pipefail

# Env-Fallback: Cron startet ohne Server-Umgebung. Wenn BACKUP_GPG_RECIPIENT
# oder BACKUP_TARGET fehlen und die Server-.env existiert → sourcen, damit das
# Offsite-Backup auch ohne korrekt sourcenden Wrapper funktioniert.
ENV_FILE=/opt/bfsg-check/deployment/.env
if [ -f "$ENV_FILE" ] && { [ -z "${BACKUP_GPG_RECIPIENT:-}" ] || [ -z "${BACKUP_TARGET:-}" ]; }; then
  set -a
  . "$ENV_FILE"
  set +a
fi

exec > >(tee -a /var/log/bfsg-backup.log) 2>&1
echo "=== Backup-Start: $(date -Iseconds) ==="

DATA_DIR=/var/lib/docker/volumes/deployment_bfsg_data/_data
STAGE_DIR=$(mktemp -d)
TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
ARCHIVE="bfsg-backup-${TIMESTAMP}.tar.gz.gpg"

# Sanity-Check
if [ ! -d "$DATA_DIR" ]; then
  echo "[FAIL] Data-Dir $DATA_DIR existiert nicht. Volume umbenannt? docker volume ls"
  exit 1
fi

# Tar + GPG (kein Zwischen-Plaintext auf Disk)
tar -C "$DATA_DIR" -czf - . \
  | gpg --batch --yes --trust-model always \
        --encrypt --recipient "${BACKUP_GPG_RECIPIENT:?BACKUP_GPG_RECIPIENT env missing — siehe docs/BACKUP.md}" \
        --output "${STAGE_DIR}/${ARCHIVE}"

SIZE=$(stat -c%s "${STAGE_DIR}/${ARCHIVE}")
echo "[INFO] Archive: ${ARCHIVE} (${SIZE} Bytes)"

# Upload via rclone (oder lokal fallback)
if [ -n "${BACKUP_TARGET:-}" ]; then
  rclone copy "${STAGE_DIR}/${ARCHIVE}" "$BACKUP_TARGET/" \
    --config /root/.config/rclone/rclone.conf \
    --transfers 2 --checkers 4 --retries 3
  echo "[OK] Uploaded to $BACKUP_TARGET/$ARCHIVE"
else
  LOCAL=/var/backups/bfsg
  mkdir -p "$LOCAL"
  mv "${STAGE_DIR}/${ARCHIVE}" "$LOCAL/"
  echo "[WARN] BACKUP_TARGET nicht gesetzt — Backup nur lokal: $LOCAL/$ARCHIVE"
fi

rm -rf "$STAGE_DIR"

# Lokale Retention: 14 Tage. Remote-Retention via rclone-Lifecycle (Storage-eigener).
find /var/backups/bfsg -name "bfsg-backup-*.tar.gz.gpg" -mtime +14 -delete 2>/dev/null || true

echo "=== Backup-Ende: $(date -Iseconds) ==="
