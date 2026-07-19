---
name: deploy-scanner-update
description: Code-Update via PR → Auto-Deploy → Smoke-Test. Trigger "Deploy", "Push live", "Update Scanner".
---

# Deploy-Skill

## Voraussetzung
Du musst auf einem Branch sein, der gemerged werden soll.

## Schritte

### 1. Pre-Flight (Repo-Check)
```bash
git status            # Nichts uncommitted?
git log -5 --oneline  # Was wird gepusht?
cd scanner && npm test 2>&1 | tail -20  # Tests grün?
cd landingpage-next && npm run lint && npm run build  # Build OK?
```

**STOP wenn:** Tests rot oder Build fehlschlägt.

### 2. PR + Merge via GitHub MCP
- Branch bereits gepusht? Falls nein: `git push -u origin <branch>`
- PR erstellen via `mcp__github__create_pull_request`
- Falls keine CI-Workflows nötig: direkt `mcp__github__merge_pull_request` (squash)

### 3. Auto-Deploy abwarten (~5 Min)
```bash
# Beobachte GitHub Action
mcp__github__list_workflow_runs branch:main per_page:1
# warte bis status:completed
```

### 4. Smoke-Test
```bash
curl -fSs https://bfsg-fix.de/health
# Erwartung: ok:true, live:true
curl -fSs "https://bfsg-fix.de/api/scan?url=https://example.com" | jq '.score'
# Erwartung: numerische Score
```

### 5. Bei Fehler: Rollback
```bash
git revert HEAD --no-edit && git push origin main
# Auto-Deploy macht den Rollback live
```

### 6. Bei Erfolg: Audit
- GitHub-Issue „Deploy YYYY-MM-DD" mit Diff-Summary

## Output
```markdown
## 🚀 Deploy abgeschlossen
- Branch: feat/...
- PR: #X (merged)
- Health: 🟢 live:true
- Scan-Smoke: ✅ Score=X
- Dauer: Xm
```
