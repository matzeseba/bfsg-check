# Context-Checkpoint — Marketing-Agent-OS (07.07.2026)

## Original-Auftrag (Goal, Stop-Hook aktiv)
Chef-KI-Architekt: Marketing-Agent-OS designen, NICHT selbst coden, an Teams spezialisierter
Subagenten (Opus 4.8) delegieren. Kern: Organic Growth Engine (kostenlose Leads, keine Ads),
maximale Automatisierung, separates Team baut professionelles Dashboard (Visualisierung +
Steuerung + Auswertung). ECC-/superpowers-Skills nutzen. One-Shot-präzise Briefs.
Computer-/Browser-Use freigegeben.

## Stand
- Branch: `feat/marketing-os` (von aktuellem origin/main, Commit ce31bf6)
- FERTIG: `marketing-os/ARCHITECTURE.md` (bindender Kontrakt: Layout, Ownership, Datenmodell,
  API-Kontrakt §6, Engine-Module §5, Dashboard-Spec §7, Legal §8), `marketing-os/policy/compliance.json`
- Tasks: #1 Architektur+Briefs (in_progress), #2 Team A Engine, #3 Team B Growth, #4 Team C Dashboard,
  #5 Team D QA+Commit+Draft-PR
- Briefs: `marketing-os/briefs/team-a-engine.md`, `team-b-growth.md`, `team-c-dashboard.md`
- Reports erwartet in: `marketing-os/briefs/reports/team-X-report.md` (Status DONE/BLOCKED + Dateiliste + Tests)

## Schlüssel-Entscheidungen
- Dateibasiertes Agentic-OS (ecc:agentic-os-Pattern): JSON/Markdown statt DB, Kernel=KERNEL.md
- Engine: Node ESM, einzige Dep express, Port 4870, claude -p headless (Sonnet, read-only Tools,
  MOS_DRY_RUN für Tests), Gate aus policy/compliance.json, KEIN Auto-Publish (Owner-Approval)
- Dashboard: Vite+React+TS strict, Port 5183, Proxy /api→4870, recharts, 6 Views (§7)
- Teams A/B/C parallel (disjunkte Pfade, model: opus, KEIN git in Agenten), danach Team D QA
- Team B liest Schnelle-Leads-Plan via `git show origin/worktree-marketing-schnelle-leads:marketing/2026-07-07-schnelle-leads-execution-plan.md`
- Owner-Policy: Runtime-Content-Jobs auf Sonnet; Agenten-Prompts verbieten SSH/Prod explizit

## Nächste Schritte (nach Kompaktierung hier weitermachen)
1. Falls Briefs fehlen: schreiben (Spec steht in ARCHITECTURE.md)
2. Teams A/B/C als parallele Agent-Calls starten (general-purpose, model opus, background),
   Prompt = kurzer Scene-Set + „Lies zuerst marketing-os/briefs/team-X-*.md"
3. Nach Abschluss: Team D QA (install, npm test, DRY_RUN-Start, API-Smoke, Dashboard-Build,
   preview-Screenshot), Fixes minimal
4. Commits gestaffelt (docs/engine/growth/dashboard) auf feat/marketing-os, Draft-PR via gh
   (REST-Fallback `gh api` bei GraphQL-Quota, Memory github-pr-via-rest)
5. Auto-Memory-Eintrag `marketing-os-built` schreiben + MEMORY.md-Zeile, Abschlussbericht
6. Goal gilt erst als erfüllt, wenn QA grün + PR offen + Memory aktualisiert
