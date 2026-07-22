# 🤖 Claude-Agent Setup — Windows-PC Edition

> Damit Claude den Rest des Launch-Plans (siehe `docs/archive/LAUNCH-PLAN.md`) für dich erledigt.
> **Mensch bleibt:** Anwalt, Versicherung, Live-Test-Kauf mit eigener Karte. Sonst nichts.

**Setup-Aufwand:** ~45 Minuten · einmalig.
**Was du brauchst:** Windows 11 PC mit Admin-Rechten, Bitwarden-Account (Free reicht), Anthropic-Console-Account ODER Claude-Pro/Max-Abo.

---

## 🏗️ Was wird gebaut

```
Windows 11 Desktop
└── WSL2 Ubuntu 24.04
    ├── Claude Code (CLI)
    ├── Playwright MCP   →  Browser-Tasks (Sentry, Notion, Hetzner, INWX, GitHub, ...)
    ├── Bitwarden MCP    →  Secrets-Read
    ├── Bash + ssh       →  Server-Tasks (.env, GPG, rclone, restart)
    └── Native Chrome    →  Sichtbares Browser-Fenster (du schaust mit)
            │
            ▼ SSH (dedizierter Key)
        bfsg-fix.de
```

---

## 📋 Setup-Schritte

### Schritt 1 — WSL2 + Ubuntu installieren (10 Min, einmalig)

PowerShell **als Administrator** öffnen (Rechtsklick auf Start → „Terminal (Admin)"):
```powershell
wsl --install -d Ubuntu-24.04
```

Reboot durchführen. Nach dem Start öffnet sich automatisch ein Ubuntu-Fenster → User „matthias" anlegen + Passwort setzen.

**Fertig wenn:** `wsl --status` zeigt Ubuntu-24.04 als Default.

---

### Schritt 2 — Basis-Tools in WSL2 (10 Min)

Im Ubuntu-WSL2-Terminal:
```bash
# System-Update + Basis-Tools
sudo apt update && sudo apt install -y openssh-client gnupg rclone curl git build-essential jq

# Node.js 22 (für Playwright + Claude Code)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Claude Code (offizielle Anleitung von Anthropic)
curl -fsSL https://claude.ai/install.sh | bash

# Test
node --version    # v22.x
claude --version  # zeigt Claude Code Version
```

Bei der ersten `claude`-Ausführung: Browser öffnet sich automatisch → mit deinem Anthropic-Account einloggen.

**Fertig wenn:** `claude` startet ohne Fehler.

---

### Schritt 3 — Bitwarden CLI + Vault einrichten (10 Min)

```bash
# Bitwarden CLI via Snap (kommt mit WSL2)
sudo snap install bw

# Falls Snap fehlt: alternativ via npm
sudo npm install -g @bitwarden/cli

# Login
bw login matze.seba@outlook.de

# Entsperren (gibt Session-Token, der pro Shell-Session nötig ist)
export BW_SESSION="$(bw unlock --raw)"

# Test
bw status   # sollte "unlocked" zeigen
```

**Im Bitwarden-Web-Vault** (vault.bitwarden.com): Folder „BFSG-Claude" anlegen. Pro Secret ein „Login"- oder „Secure Note"-Item:

| Item-Name | Felder |
|---|---|
| `BFSG-Claude-ADMIN_TOKEN` | password: `(noch leer, Claude füllt in Block 1.1)` |
| `BFSG-Claude-Sentry` | custom field `dsn`: `(noch leer, Block 1.2)` |
| `BFSG-Claude-Hetzner-Storage` | username: `uXXXXX`, password: `(aus Block 1.4)` |
| `BFSG-Claude-Stripe` | password: dein Stripe Restricted-Key, custom `webhook_secret`: dein Webhook-Secret |
| `BFSG-Claude-Brevo` | username: `matthiasseba92@gmail.com`, password: dein SMTP-Key |
| `BFSG-Claude-GitHub` | password: GitHub Personal Access Token (Scope: `repo` + `workflow` + `admin:repo_hook`) |
| `BFSG-Claude-INWX` | username + password |
| `BFSG-Claude-Google-Ads` | username + password |
| `BFSG-Claude-LinkedIn` | username + password |

**Tipp:** Für GitHub-PAT, geh zu github.com/settings/tokens → „Generate new token (classic)" → 90 Tage Gültigkeit → Scopes `repo`, `workflow`. Den Token jetzt schon anlegen damit Claude später `gh secret set` machen kann.

**Fertig wenn:** `bw list items --folderid=$(bw get folder BFSG-Claude | jq -r .id)` zeigt deine Items.

---

### Schritt 4 — Playwright MCP + Bitwarden MCP registrieren (5 Min)

```bash
# Playwright MCP (Microsoft offiziell)
claude mcp add playwright npx @playwright/mcp@latest --scope user
npx playwright install chromium

# Bitwarden MCP (offiziell)
claude mcp add bitwarden npx @bitwarden/mcp-server --scope user

# GitHub MCP ist standardmäßig schon registriert in Claude Code Web/Cloud
# Falls nicht: claude mcp add github npx @modelcontextprotocol/server-github

# Test
claude mcp list
# Erwartung: playwright, bitwarden, github (mindestens)
```

**Fertig wenn:** `claude mcp list` zeigt alle 3.

---

### Schritt 5 — Permission-Allowlist + Hook-Script aktivieren (5 Min)

Du bekommst zwei vorbereitete Files aus diesem Repo:

```bash
cd ~/bfsg-check  # oder wo du das Repo geklont hast

# 1. Permission-Config kopieren (BACKUP zuerst!)
cp .claude/settings.local.json .claude/settings.local.json.bak
cp docs/claude-agent-setup/settings.local.json.template .claude/settings.local.json

# 2. Hook-Script kopieren + ausführbar machen
mkdir -p .claude/hooks
cp docs/claude-agent-setup/pretool-pause-on-money.sh.template .claude/hooks/pretool-pause-on-money.sh
chmod +x .claude/hooks/pretool-pause-on-money.sh

# 3. Sanity-Check
cat .claude/settings.local.json | jq .   # JSON parsen, keine Syntax-Fehler
bash -n .claude/hooks/pretool-pause-on-money.sh  # Bash-Syntax-Check
```

**Was die Allowlist erlaubt:**
- SSH zu `bfsg` (deinem Server, via SSH-Config-Alias aus Schritt 6)
- Bitwarden-Reads (`bw get`, `bw list`, `bw create`)
- rclone, gpg, scp, docker compose
- Alle MCPs (playwright, bitwarden, Notion, github)

**Was sie verbietet:**
- `sudo`, `su`, `rm -rf /`, `chmod -R 777`
- `bw delete`, `gh secret delete`, `gh repo delete`
- Force-Push, `git reset --hard`
- GPG-Private-Key-Export (kommt nie aus deinem System)
- SSH zu nicht-`bfsg`-Hosts (Klassifizierer pausiert)

**Was der Hook macht (PreToolUse):** Bei jedem Tool-Call prüft er den Payload auf 10 sensible Patterns (Stripe-Refund, Hetzner-Order, Google-Ads-Activate, LinkedIn-Publish, Brevo-Key-Revoke, ...). Bei Match → Claude pausiert und fragt dich.

**Fertig wenn:** Beide Sanity-Checks ohne Output durchlaufen.

---

### Schritt 6 — SSH-Key für Claude (5 Min)

```bash
# Neuer Key, exklusiv für Claude (so kannst du ihn jederzeit allein revoken)
ssh-keygen -t ed25519 -f ~/.ssh/bfsg_claude -C "claude-agent" -N ""

# Public-Key anzeigen
cat ~/.ssh/bfsg_claude.pub

# Auf bfsg-fix.de in /root/.ssh/authorized_keys ergänzen
# (nutze deinen bestehenden SSH-Zugang dafür, EINMALIG)
ssh root@bfsg-fix.de "echo '$(cat ~/.ssh/bfsg_claude.pub)' >> /root/.ssh/authorized_keys"

# SSH-Config-Alias anlegen
cat >> ~/.ssh/config <<EOF

Host bfsg
  HostName bfsg-fix.de
  User root
  IdentityFile ~/.ssh/bfsg_claude
EOF

# Test
ssh bfsg "uptime"
```

**Fertig wenn:** `ssh bfsg "uptime"` läuft ohne Passwort-Frage.

---

### Schritt 7 — Verifikations-Lauf (5 Min)

```bash
cd ~/bfsg-check
claude
```

Im Claude-CLI eintippen:
```
Mach 3 Tests:
1. Lies https://bfsg-fix.de/health via Playwright MCP und zeig mir die JSON.
2. SSH zu bfsg und zeig `docker compose ps`.
3. Liste alle Items aus dem Bitwarden-Folder „BFSG-Claude".

Wenn alle 3 klappen, sind wir bereit fuer den Launch-Sprint.
```

**Fertig wenn:** Alle 3 Tests grün. Du bist startklar.

---

## 🚨 Security-Checkliste vor jedem Lauf

Bevor du Claude losschickst:
1. ✅ Bitwarden ist unlocked: `bw status` → "unlocked"
2. ✅ Nur Claude-relevanter Browser-Tab offen (kein Online-Banking parallel)
3. ✅ 2FA-App auf Phone griffbereit (Authy, Aegis, etc.)
4. ✅ Bestätige jedes Mal mit „y" wenn Hook pausiert — niemals reflexartig

## 🛑 Kill-Switch (jederzeit, <60 Sekunden)

| Stufe | Wie | Wann |
|---|---|---|
| 1. Soft-Stop | `Strg+C` im Claude-CLI | Aktuellen Tool-Call abbrechen |
| 2. Hard-Stop | `pkill -f claude` in zweitem WSL2-Terminal | Alle Claude-Prozesse killen |
| 3. Total-Cutoff | siehe „Rollback" unten | Wenn was schiefging |

## 🔥 Rollback (Notfall)

```bash
# Alle Sessions stoppen
pkill -f claude

# MCP-Tools entfernen
claude mcp remove playwright
claude mcp remove bitwarden

# SSH-Key vom Server löschen (per bestehendem SSH-Zugang)
ssh root@bfsg-fix.de "sed -i '/claude-agent/d' /root/.ssh/authorized_keys"

# Bitwarden-Session sperren
bw lock

# Allowlist zurücksetzen
cp .claude/settings.local.json.bak .claude/settings.local.json
rm .claude/hooks/pretool-pause-on-money.sh

# GitHub-PAT revoken: github.com/settings/tokens → Revoke

# (Hard-Reset) WSL2 komplett entfernen
wsl --unregister Ubuntu-24.04
```

Alles unter 5 Minuten.

---

## 📚 Was Claude danach automatisch erledigt

(Ausschnitt — komplette Liste in `docs/archive/LAUNCH-PLAN.md`)

| Block | Aktion | Mensch nötig? |
|---|---|---|
| 1.1 | ADMIN_TOKEN generieren + in Bitwarden ablegen | ❌ |
| 1.2 | Sentry-Account anlegen | 🟡 nur 2FA-Code aus App |
| 1.4 | Hetzner Storage-Box bestellen | 🟡 nur Zahlung bestätigen |
| 3.2 | Server-.env aktualisieren | ❌ (via `scripts/bw-inject-env.sh`) |
| 3.3–3.4 | GPG-Pubkey + rclone | ❌ |
| 4.1 | GitHub-Secrets setzen | ❌ (via `gh secret set`) |
| 5.1 | INWX DNS-Records anlegen | ❌ (via INWX API) |
| 6.1–6.2 | Live-Merge + Health-Check | ❌ |
| 6.4 | Mail-Tester | ❌ |
| 7.1 | Google Ads Kampagne anlegen (pausiert) | 🟡 nur Final-Save |
| 7.2–7.3 | LinkedIn Draft + Outreach-DMs | 🟡 pro DM bestätigen |
| 8.x | Key-Rotationen | 🟡 jede Rotation bestätigen |

**Bleibt 100% bei dir:**
- Block 1.3 GPG-Private-Key (deine Hoheit, niemals automatisieren)
- Block 2.1+2.2 Anwalt + Versicherung
- Block 6.3 Live-Test-Bestellung mit eigener Karte

---

## 🆘 Wenn was schiefgeht

Sag mir Bescheid mit:
- Welcher Schritt: z. B. „Schritt 3 — bw login klappt nicht"
- Screenshot vom Fehler
- Was du erwartet hast

Ich debugge. Wir sind ein Team.
