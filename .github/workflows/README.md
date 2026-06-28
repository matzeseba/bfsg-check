# GitHub Actions — CI/CD für Barrierefrei-Prüfen

## `deploy.yml` — Auto-Deploy auf Hetzner

Bei jedem Push auf `main` (mit Änderungen unter `scanner/`, `landingpage/`, `deployment/`)
wird automatisch zum Hetzner-Server deployt:

1. SSH zum Server (Port 22)
2. `git pull origin main` mit hartem Reset
3. `docker compose up -d` — **mit Build** falls `scanner/**` oder Dockerfile geändert,
   sonst nur Restart (schneller, vor allem für reine Landing-Page-Updates)
4. Health-Check via `curl localhost/health`

## Benötigte GitHub Secrets

Unter **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Wert | Quelle |
|---|---|---|
| `HETZNER_HOST` | `178.105.83.0` | Hetzner Cloud Console |
| `HETZNER_SSH_KEY` | Inhalt der Datei `~/.ssh/bfsg_deploy` (Private Key, mit BEGIN/END-Zeilen) | Wird vom Agent generiert; bei Bedarf neu erstellen |

**Achtung:** Den Public-Key (`~/.ssh/bfsg_deploy.pub`) muss bereits auf dem Server in `~/.ssh/authorized_keys` liegen — passiert automatisch beim cloud-init. Den Private-Key bekommt nur GitHub Secrets (oder dein Mac).

## Manueller Trigger

Im GitHub-UI: **Actions → Deploy to Hetzner → „Run workflow" → Branch wählen → Run**.

## Debugging

- Logs: GitHub → Actions → letzter Run → klicke auf den Job für volle Ausgabe
- Server-Logs falls Deploy-Schritt fehlschlägt: SSH + `docker compose -f /opt/bfsg-check/deployment/docker-compose.yml logs --tail=200`
