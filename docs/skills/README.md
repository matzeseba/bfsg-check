# Cowork-äh, Claude Code Skills für BFSG-Check

> Diese Skills sind bereit für `~/.claude/skills/` auf deinem Windows-PC.

## Installation (einmalig, 2 Min)

```bash
# WSL2 oder Git-Bash auf Windows:
mkdir -p ~/.claude/skills
cp /pfad/zu/bfsg-check/docs/skills/*.md ~/.claude/skills/

# Oder direkt aus dem Repo-Clone:
cd ~/bfsg-check
cp docs/skills/*.md ~/.claude/skills/
```

## Was reinkommt

| File | Trigger | Was es macht |
|---|---|---|
| `daily-health-check.md` | „Tagescheck" | Server + Sales + Bounces + Errors |
| `process-refund.md` | „Erstatte Order #..." | Stripe-Refund + Mail + Audit |
| `outreach-warm-batch.md` | „5 Partner anschreiben" | Personalisierte DM-Drafts |
| `weekly-kpi-report.md` | „Wochenreport" | MRR + Funnel + Pipeline → Notion |
| `publish-blog-post.md` | „Neuer Blog-Artikel über X" | SEO-Draft + PR + Newsletter-Draft |
| `incident-response.md` | „Site ist down" | Logs → Diagnose → Rollback bereit |
| `deploy-scanner-update.md` | „Deploy" | Tests → PR → Smoke-Test |
| `legal-update-check.md` | „Recht-Update" | BFSG-News scannen, Diff |

## Nutzung

In Claude Code Chat:
```
> Tagescheck
```

Claude erkennt den Trigger, lädt den Skill, führt aus.

## Updates

Skills werden im Repo gepflegt. Bei Änderungen:
```bash
cd ~/bfsg-check && git pull && cp docs/skills/*.md ~/.claude/skills/
```

(Oder GitHub Action `sync-skills.yml` automatisieren — kommt im nächsten Sprint.)
