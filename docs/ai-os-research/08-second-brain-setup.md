# Second Brain Setup — MCP-Registrierung & Vault-Einrichtung

> **Erstellt:** 2026-06-21 · **Zweck:** Schritt-für-Schritt-Anleitung für obsidian-local-rest-api MCP
> **Referenz:** `docs/ai-os-research/03-second-brain-obsidian.md` (Gesamtbericht)

---

## .mcp.json-Snippet (obsidian-local-rest-api)

> **NICHT als echte `.mcp.json` in diesem Repo ablegen** — dieses File würde bei Git-Push
> potenziell den API-Key exponieren. Stattdessen: in `~/.claude/.mcp.json` (global) oder
> im Vault-Repo-Root als `.mcp.json` (vault-gitignored) eintragen.

```json
{
  "mcpServers": {
    "obsidian": {
      "type": "http",
      "url": "https://127.0.0.1:27124/mcp/",
      "headers": {
        "Authorization": "Bearer DEIN_OBSIDIAN_API_KEY"
      }
    }
  }
}
```

### Warum HTTPS auf 127.0.0.1?

Das obsidian-local-rest-api-Plugin verwendet ein selbst-signiertes TLS-Zertifikat,
auch für localhost. Das verhindert, dass ein anderer lokaler Prozess den Verkehr
mitlesen kann. Claude Code (Node.js) muss das Zertifikat akzeptieren:

**Option A (empfohlen):** Das Plugin bietet ab v4.0 ein HTTPS-Zertifikat, das ins
System-Truststore exportiert werden kann. Einmalig: Plugin-Einstellungen → „Export
certificate" → Windows-Zertifikat-Manager → „Vertrauenswürdige Stammzertifikate".

**Option B (Entwicklung, nicht Prod):**
```bash
# Nur für lokale Entwicklung — nie in CI/Prod
export NODE_TLS_REJECT_UNAUTHORIZED=0
```
→ In `cockpit/.env` als `NODE_TLS_REJECT_UNAUTHORIZED=0` eintragen (nur lokal).

---

## Vault-Speicherort-Empfehlung

```
C:\Users\Administrator\bfsg-vault\     ← Obsidian-Vault (AUSSERHALB des Code-Repos)
C:\Users\Administrator\bfsg-check\     ← Code-Repo (unveändert)
```

**Warum außerhalb?**
- Vault-Markdown-Dateien gehören nicht ins Code-Repo
- Eigene git-History (vault-Commits ≠ code-commits)
- Kein `.gitignore`-Wartungsaufwand

---

## git-Sync für den Vault (privates Repo)

```bash
# Einmalig
cd C:\Users\Administrator\bfsg-vault
git init
git remote add origin git@github.com:matzeseba/bfsg-vault-private.git
echo ".obsidian/workspace.json" > .gitignore
echo ".obsidian/cache" >> .gitignore
git add -A && git commit -m "vault: initial setup" && git push -u origin main

# Täglicher Sync (in Wochenablauf-SOP integrieren)
git add -A && git commit -m "vault sync $(date +%Y%m%d-%H%M)" && git push
```

Das Vault-Repo muss **privat** sein — es wird Business-Entscheidungen und
potentiell sensible Strategie-Notizen enthalten.

---

## Stop-Hook einrichten (memory_extractor.py)

Pfad der Konfigurationsdatei: `.claude/settings.json` (Projekt-Level) oder
`~/.claude/settings.json` (global, für alle Projekte).

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /c/Users/Administrator/bfsg-check/scripts/memory_extractor.py"
          }
        ]
      }
    ]
  }
}
```

**ENV-Variablen für den Hook** (in `cockpit/.env` oder Shell-Profil):
```bash
VAULT_PATH=C:\Users\Administrator\bfsg-vault
```

**Test (ohne echte Session):**
```bash
echo '{"session_id":"test-123","transcript_path":""}' | \
  VAULT_PATH=/c/Users/Administrator/bfsg-vault \
  python3 /c/Users/Administrator/bfsg-check/scripts/memory_extractor.py
```
Erwartetes Ergebnis: Datei in `$VAULT_PATH/08-AI-SESSIONS/YYYY-MM-DD-session.md` erstellt.

---

## Cockpit ENV-Konfiguration

In `cockpit/.env` (oder `cockpit/.env.local`):

```bash
# Second Brain — Obsidian-Vault
VAULT_PATH=C:\Users\Administrator\bfsg-vault

# Optional: SSL-Zertifikat für obsidian-local-rest-api (nur lokal)
# NODE_TLS_REJECT_UNAUTHORIZED=0
```

---

## server.js Wiring-Snippet

Dieser Block muss in `cockpit/src/server.js` eingefügt werden (nach den bestehenden Route-Imports):

```js
// Second Brain (Obsidian-Vault-Suche, read-only)
import brainRoute from './routes/brain.js';

// ... (nach den bestehenden app.use-Zeilen:)
app.use('/api/brain', brainRoute);
```

---

## API-Endpunkte testen

Wenn Cockpit läuft (`npm run dev` in `cockpit/`):

```bash
# Vault konfiguriert?
curl http://127.0.0.1:4317/api/brain/recent

# Suche
curl "http://127.0.0.1:4317/api/brain/search?q=BFSG"

# Einzelne Notiz lesen
curl "http://127.0.0.1:4317/api/brain/note?path=03-RESOURCES/BFSG-Check-Business-Kontext.md"
```

Falls `configured: false` zurückkommt: VAULT_PATH prüfen, ob Ordner existiert.

---

## RAG-Fahrplan

| Phase | Zustand | Strategie |
|---|---|---|
| 0–50 Notizen | Jetzt | Struktur + Volltext-Suche (this file) |
| 50–200 Notizen | Monat 2–3 | obsidian-local-rest-api MCP direkt in Claude Code |
| 200+ Notizen | Monat 4+ | Embedding-RAG (Chroma lokal oder Qdrant) |

Kein RAG bis 200 Notizen — der Overhead lohnt sich nicht, und Claude liest
strukturierte Markdown-Vaults sehr effizient direkt.
