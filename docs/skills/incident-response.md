---
name: incident-response
description: Site-down / Bug-live Notfall-Routine. Trigger "Site ist down", "Bug live", "Notfall", "500-Fehler".
---

# Incident-Response Skill

## Priorität: SPEED. Keine langen Erklärungen, direkte Aktionen.

### 1. Trivial-Checks (30 Sek)
```bash
# Health-Endpoint
curl -fSs https://bfsg-fix.de/health || echo "DOWN"

# Landing erreichbar?
curl -sI https://bfsg-fix.de/ | head -1

# DNS auflösbar?
dig +short bfsg-fix.de
```

### 2. Server-Logs (1 Min)
```bash
ssh bfsg "cd /opt/bfsg-check/deployment && docker compose logs --tail=100 app | grep -E 'ERROR|WARN|FATAL|stack'"
ssh bfsg "cd /opt/bfsg-check/deployment && docker compose logs --tail=50 caddy"
ssh bfsg "df -h /"  # Disk-Voll?
```

### 3. Letzten Commit prüfen
```bash
git log --oneline origin/main -5
git diff HEAD~1 HEAD -- scanner/  # Was hat sich geändert?
```

### 4. Schnell-Mitigation (max 5 Min versuchen)
Versuchen in Reihenfolge:
1. **Container-Restart:** `ssh bfsg "cd /opt/bfsg-check/deployment && docker compose restart app"`
2. **Caddy-Reload:** `ssh bfsg "cd /opt/bfsg-check/deployment && docker compose restart caddy"`
3. **Rollback letzter Commit:** `git revert HEAD --no-edit && git push` (löst Auto-Deploy)

### 5. Stop bei: irreparabel in 10 Min
Falls Mitigation nicht klappt:
- User informieren via "ROT" mit konkretem Befund
- Rollback-Vorschlag (Tag `pre-launch-baseline` oder letzter grüner Commit)
- KEINE risk-Aktionen ohne User-OK (z.B. DB-Restore)

### 6. Post-Mortem-Draft
Nach Lösung: Erstelle GitHub-Issue „Incident YYYY-MM-DD: [Titel]":
- Timeline (was wann)
- Ursache
- Was wir gelernt haben
- Was wir präventiv ändern

## Output-Format
```markdown
## 🚨 Incident-Response — [Status]

**Status:** 🟢/🟡/🔴
**Symptom:** ...
**Letzte Mitigation:** ...
**Nächster Schritt:** ...
```
