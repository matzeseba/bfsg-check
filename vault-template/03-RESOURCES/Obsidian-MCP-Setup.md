---
type: resource
created: 2026-06-21
tags: [obsidian, mcp, setup, werkzeug]
links: ["[[INDEX]]", "[[08-AI-SESSIONS/INDEX-Sessions]]", "[[03-RESOURCES/BFSG-Check-Business-Kontext]]"]
---

# Obsidian MCP-Setup

> Detaillierte Anleitung: `docs/ai-os-research/08-second-brain-setup.md` im Code-Repo.

## Kurzfassung

1. Obsidian installieren, neuen Vault anlegen (z.B. `C:\Users\Administrator\bfsg-vault\`)
2. Plugin **Local REST API** installieren (Community Plugins → suchen: „Local REST API")
3. API-Key in Plugin-Einstellungen generieren und notieren
4. `.mcp.json` im Claude-Code-Projekt eintragen (Anleitung: Setup-Doku)
5. Claude Code neu starten → Vault-Tools verfügbar

## Vault-Ort (empfohlen)

**Außerhalb des Code-Repos.** Empfehlung: `C:\Users\Administrator\bfsg-vault\`

Warum getrennt:
- Kein Vault-Content im Code-Repo
- Eigenes privates git-Repo für Vault-Sync
- Kein `.gitignore`-Konflikt

## git-Sync

```bash
cd C:\Users\Administrator\bfsg-vault
git init
git remote add origin git@github.com:USERNAME/bfsg-vault-private.git
# täglicher Sync (manuell oder per Cron):
git add -A && git commit -m "vault sync $(date +%Y%m%d)" && git push
```

---
*Links: [[INDEX]] · [[08-AI-SESSIONS/INDEX-Sessions]]*
