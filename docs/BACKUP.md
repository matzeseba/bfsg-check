# Backup & Restore Runbook (BFSG-Check)

## Was wird gesichert?

Docker-Volume `bfsg_data` auf dem Server: enthält **alle business-kritischen Daten**:
- `out/orders.jsonl` — Bestell-Historie (Stripe-Sessions, Status PAID/MAILED/FAILED/RESENT)
- `out/subscriptions.jsonl` — Abo-Snapshots für Diff-Berechnung
- `out/invoices/` — generierte Rechnungs-PDFs (GoBD-Pflicht, 10 Jahre)
- `out/dsgvo-tokens.jsonl` — DSGVO-Anfrage-Tokens

## Mechanik

| Skript | Wann | Was |
|---|---|---|
| `deployment/backup.sh` | täglich 03:00 UTC via Cron (in cloud-init) | tar→gpg→rclone, GPG-asymmetrisch, Off-Site-Upload |
| `deployment/restore.sh` | manuell bei Bedarf | gpg→tar→target-Dir, dann manuelles rsync zurück |
| `.github/workflows/backup-restore-test.yml` | monatlich 1. d. Monats 04:00 UTC | Synthetic round-trip + Brevo-Mail-Alert bei Fehler |

## Setup (einmalig auf Server)

### 1. GPG-Keypair generieren (für asymmetrische Verschlüsselung)

```bash
# Auf Eigentümer-Laptop (NICHT auf dem Server — Private Key bleibt offline!)
gpg --batch --gen-key <<EOF
Key-Type: RSA
Key-Length: 4096
Name-Real: BFSG-Check Backup
Name-Email: backup@bfsg-fix.de
Expire-Date: 5y
%no-protection
%commit
EOF

# Export Public-Key → kommt auf Server
gpg --armor --export backup@bfsg-fix.de > backup-pubkey.asc

# Export Private-Key → bleibt OFFLINE (USB-Stick, Passwort-Safe)
gpg --armor --export-secret-keys backup@bfsg-fix.de > backup-privkey.asc
# UMGEHEND in Passwort-Safe / 1Password / Bitwarden ablegen!
```

### 2. Public-Key auf Server importieren

```bash
# SCP zum Server
scp backup-pubkey.asc root@bfsg-fix.de:/tmp/

# Auf dem Server: importieren + trusten
gpg --import /tmp/backup-pubkey.asc
echo "$(gpg --list-keys --with-colons backup@bfsg-fix.de | awk -F: '/fpr/{print $10;exit}'):6:" | gpg --import-ownertrust
rm /tmp/backup-pubkey.asc
```

### 3. `.env` ergänzen
```bash
echo "BACKUP_GPG_RECIPIENT=backup@bfsg-fix.de" >> /opt/bfsg-check/deployment/.env
# Optional (wenn Off-Site-Storage gewählt):
echo "BACKUP_TARGET=hetzner-storage:bfsg-backups" >> /opt/bfsg-check/deployment/.env
```

### 4. Off-Site-Storage einrichten

#### Option A: Hetzner Storage-Box (Empfehlung)

| Pro | Contra |
|---|---|
| Im selben RZ wie Server (schnell, geringe Latenz) | Single-Provider-Risk (Hetzner-Ausfall trifft Server + Backup) |
| DSGVO-konform (EU) | Kostet ab 3,20 €/Mo (100 GB) |
| Bezahlung mit gleicher Rechnung | — |

Buchung: https://www.hetzner.com/storage/storage-box
Setup:
```bash
rclone config
# n) new remote
# name> hetzner-storage
# Storage> sftp
# host> uXXXXX.your-storagebox.de
# user> uXXXXX
# password> [aus Storage-Box-Dashboard]
# port> 23  (Storage-Box nutzt 23 statt 22)
```

#### Option B: Backblaze B2 (geo-redundant)

| Pro | Contra |
|---|---|
| Echter Geo-Redundanz (US-Backup zu DE-Server) | Aufpassen wg. DSGVO-Übertragung in Drittländer (Standard Contractual Clauses nötig) |
| Sehr günstig: $5/TB/Mo | Komplexerer Setup (Application-Key) |

Setup:
```bash
# Account anlegen: https://www.backblaze.com/b2/cloud-storage.html
# Application-Key + Bucket erstellen
rclone config
# n) new remote
# name> b2
# Storage> b2
# account> [Application Key ID]
# key> [Application Key Secret]
```

### 5. Backup testen

```bash
# Trockenlauf
sudo BACKUP_GPG_RECIPIENT=backup@bfsg-fix.de /opt/bfsg-check/deployment/backup.sh

# Sollte ohne Fehler durchlaufen + Datei in /var/backups/bfsg/ (oder am BACKUP_TARGET) erstellen.
ls -la /var/backups/bfsg/
```

### 6. Restore-Test (DRINGEND empfohlen vor Go-Live)

```bash
# Letztes Backup nehmen
LATEST=$(ls -t /var/backups/bfsg/*.tar.gz.gpg | head -1)
/opt/bfsg-check/deployment/restore.sh "$LATEST" /tmp/restore-test

# Prüfen: orders.jsonl + subscriptions.jsonl + invoices/ enthalten?
ls -la /tmp/restore-test/
cat /tmp/restore-test/orders.jsonl | head -3
```

## Disaster-Recovery (Volume verloren / Server-Crash)

1. **Neuen Hetzner-Server provisionieren** via cloud-init (siehe `deployment/cloud-init.yaml`)
2. **GPG-Pubkey wieder importieren** (Schritt 2 oben)
3. **`.env` mit gleichen Werten** wieder anlegen (BACKUP_GPG_RECIPIENT + BACKUP_TARGET)
4. **Backup runterladen** + **Restore** ausführen:
   ```bash
   docker compose -f /opt/bfsg-check/deployment/docker-compose.yml down
   rclone copy $BACKUP_TARGET/bfsg-backup-LATEST.tar.gz.gpg /tmp/
   /opt/bfsg-check/deployment/restore.sh /tmp/bfsg-backup-LATEST.tar.gz.gpg /tmp/restored
   rsync -a /tmp/restored/ /var/lib/docker/volumes/deployment_bfsg_data/_data/
   docker compose -f /opt/bfsg-check/deployment/docker-compose.yml up -d
   ```
5. **Verifikation:**
   ```bash
   curl -fSs https://bfsg-fix.de/health  # ok:true, mailer:aktiv
   curl -fSs -H "Authorization: Bearer $ADMIN_TOKEN" https://bfsg-fix.de/admin/orders | jq '.count'
   ```

## Größen-Schätzung

| Posten | Größe |
|---|---|
| orders.jsonl Wachstum | ~150 Bytes/Order (komprimiert ~50 B) |
| subscriptions.jsonl Wachstum | ~250 Bytes/Eintrag (mit Snapshot ~1 KB) |
| invoices/*.pdf | ~50–100 KB/Stück |
| **Backup-Archiv bei 1.000 Orders/Mo** | **~5–10 MB/Backup** (komprimiert + GPG) |
| Storage-Bedarf 1 Jahr | ~3 GB (365 Backups × ~8 MB) |

## Mensch-Pflichten

- [ ] GPG-Keypair generieren + Private-Key in Passwort-Safe
- [ ] Public-Key auf Server importieren + trusten
- [ ] Storage-Ziel wählen (Hetzner Storage-Box vs Backblaze B2)
- [ ] `BACKUP_GPG_RECIPIENT` + `BACKUP_TARGET` in `.env` setzen
- [ ] `rclone config` ausführen + `rclone.conf` validieren
- [ ] Restore-Test mind. 1× **vor Live-Schaltung** durchführen
- [ ] Quartalsweise: Restore-Test in ephemeral Container wiederholen
