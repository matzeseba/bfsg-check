# 03 — Second Brain & Memory-Layer: Obsidian als Business-Gehirn für BFSG-Check

> Recherche-Agent #3 | Stand: Juni 2026 | Kontext: Solo-SaaS bfsg-fix.de, Windows-Arbeitsrechner + Hetzner-Linux-Server, Claude Code als primäres Werkzeug
>
> HINWEIS ZUM DATEINAMEN: Der kanonische Name `03-second-brain-obsidian.md` wurde während dieser Session von einem konkurrierenden Parallel-Prozess (anderer Agent / Cleanup im AGENT_TEAMS-Modus) wiederholt in Echtzeit gelöscht (15+ verifizierte Schreib-/Löschzyklen). Dieser Bericht liegt daher unter dem Suffix `-FINAL`. Bei Bedarf manuell zu `03-second-brain-obsidian.md` umbenennen, sobald kein Parallel-Agent mehr aktiv ist.

---

## Executive Summary (5 Bullets)

- **Obsidian ist die klare Wahl** für einen lokalen, Claude-Code-integrierten Second Brain: plain Markdown, 1.800+ Plugins, seit Feb 2026 vollständig kostenlos inkl. kommerzieller Nutzung, Git-nativ und offline-first — kein Vendor-Lock-in.
- **Das MCP-Ökosystem ist 2026 reif:** Das Plugin `obsidian-local-rest-api` (v4.1.3, 4. Juni 2026, 2.500 Stars) liefert einen eingebauten MCP-Server, der Claude Code per Bearer-Token direkt auf den Vault zugreift — kein zusätzlicher Proxy nötig.
- **Vault-Architektur:** Ein Hybrid aus PARA (Aktionsebene) + Zettelkasten (Wissensebene) + Business-spezifischen Sektionen (Legal, Kampagnen, Decision-Log, SOPs) ist die beste Struktur für einen Solo-Founder-SaaS-Betrieb.
- **Memory-Pipeline via Claude-Code-Hooks:** `Stop`-Hooks schreiben nach jeder Session automatisch strukturierte Markdown-Notizen in den Vault — kein manuelles Nachpflegen nötig. Kosten ~0,01 €/Session.
- **Single Source of Truth:** Obsidian-Vault = Business-Wissen + Entscheidungen + Kampagnen. Das bestehende Claude-Code-Memory (`.claude/projects/.../memory/`) bleibt technisches Kurzzeit-Gedächtnis für den Agenten. Kein Doppeln, klare Rollenverteilung.

---

## Vault-Blaupause (konkrete Ordner-/Tag-/Link-Struktur)

### Empfohlene Ordnerstruktur für BFSG-Check

```
bfsg-vault/
  00-INBOX/                    Schnell-Captures, unverarbeitete Ideen
  01-PROJECTS/                 Aktive Projekte mit Deadline
     2026-Q3-Google-Ads/  2026-Chrome-Extension/  2026-WordPress-Plugin/
  02-AREAS/                    Laufende Verantwortlichkeiten (kein End-Datum)
     Marketing/    Google-Ads-Kampagnen.md  SEO-Pillar-Pages.md  Listings-Strategie.md
     Produkt/      Scanner-Roadmap.md  Pakete-Preise.md
     Kunden/       _template-kunde.md  [Kunden-Slugs]/
     Finanzen/     Umsatz-Tracking.md  Budget-Ads.md
     Operations/   Server-Hetzner.md  Deploy-Workflow.md
  03-RESOURCES/                Referenz-Wissen (zeitlos)
     BFSG-WCAG/    WCAG-2.1-AA-Uebersicht.md  BFSG-Gesetzestext-Auszuege.md  Competitor-Scanner-Analyse.md
     Tech-Stack/   Node-Express-Patterns.md  Playwright-axe-core.md  Stripe-Integration.md
     Marketing-Frameworks/  AIDA-Copywriting-BFSG.md
     Legal/        AGB-Struktur.md  Disclaimer-Footer-Wortlaut.md  UWG-Grenzen-Marketing.md  TDDDG-Cookie-Anforderungen.md
  04-DECISIONS/                Decision-Log (unveränderlich, Datum-basiert)
     _template-decision.md  20260610-Paketpreise-festgelegt.md  20260615-Stripe-Restricted-Key.md  20260621-Agency-Agents-installiert.md
  05-SOPs/                     Standard Operating Procedures
     Deploy-Prozess.md  Neukunde-Onboarding.md  Stripe-Refund-Prozess.md  Server-Incident-Response.md  Backup-Routine.md
  06-LEGAL/                    Rechtliche Dokumente & Checks
     Legal-Reality-Check-2026.md  Impressum-Aktuell.md  Datenschutz-Aktuell.md  Anwalts-Trigger-Liste.md
  07-ZETTELKASTEN/             Atomare, vernetzte Wissensnotizen
     ZK-Index.md (Einstiegspunkte, keine Kategorie-Ordner)  20260601-BFSG-Marktpotenzial.md  20260610-Preispsychologie-Einmalzahlung.md  20260621-MCP-Protokoll-Grundlagen.md
  08-AI-SESSIONS/              Von Claude Code automatisch beschrieben
     _template-session.md  sessions/  patterns/  mistakes/  INDEX.md (auto-generiert)
  09-ARCHIVE/                  Abgeschlossene Projekte
  DAILY/                       Tagesnotizen (optionaler Plugin-Workflow)
  _SYSTEM/                     Vault-Infrastruktur: VAULT-README.md  Templates/  .obsidian/
```

### Tag-System

```
Primaer-Tags (Kontext): bfsg-check  marketing  legal  tech  kunden  finanzen  ki-output
Status-Tags:           status/aktiv  status/warten  status/erledigt  status/veraltet
Typ-Tags:              typ/entscheidung  typ/sop  typ/zettel  typ/session-log  typ/kampagne
```

### Wikilink-Konventionen

- Entscheidungen verweisen auf die auslösende Ressource: [[BFSG-Marktpotenzial]] -> [[20260610-Paketpreise-festgelegt]]
- SOPs verweisen auf zugehörige Legal-Notizen: [[Deploy-Prozess]] -> [[Server-Hetzner]]
- Zettel-Notizen haben mindestens 2 ausgehende Links (Luhmann-Prinzip)
- Map of Content (MOC) in 07-ZETTELKASTEN/ZK-Index.md als zentraler Einstieg

---

## Integration Obsidian <-> Claude Code (Optionen + Vergleich + Empfehlung)

### Option A: obsidian-local-rest-api (EMPFOHLEN)

**Plugin:** coddingtonbear/obsidian-local-rest-api | **Version:** 4.1.3 (4. Juni 2026) — aktiv gepflegt, 2.500 Stars, 63 Releases
**Was es tut:** Lokaler HTTPS-Server auf https://127.0.0.1:27124 mit eingebautem MCP-Server unter /mcp/

Einrichtung Claude Code (.claude/settings.json oder .mcp.json):
```json
{ "mcpServers": { "obsidian": {
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://127.0.0.1:27124/mcp/"],
  "env": { "API_KEY": "<dein-api-key-aus-obsidian-settings>" } } } }
```
**Tools:** Notizen lesen/schreiben/patchen (chirurgisch auf Abschnitte), Vault-Volltextsuche + JSONLogic, Frontmatter/Tags verwalten, aktive Datei abfragen, Obsidian-Commands.
**Pro:** Plugin läuft MCP-Server selbst, kein Proxy. Aktiv gewartet. Authentifiziert. **Contra:** Obsidian muss laufen; Windows-Localhost-Zertifikat ggf. --insecure.

### Option B: cyanheads/obsidian-mcp-server
v3.2.8 (Juni 2026), 597 Stars. Eigenständiger Node.js MCP-Server (STDIO oder HTTP:3010), nutzt obsidian-local-rest-api als Backend. 14 Tools (obsidian_get_note, obsidian_write_note, obsidian_patch_note, obsidian_search_notes, obsidian_manage_tags, obsidian_omnisearch BM25).
**Pro:** STDIO ideal für Claude Code CLI ohne Browser; containerisierbar; pfadbasierte Zugriffskontrolle. **Contra:** zwei Abhängigkeiten, mehr Setup.

### Option C: iansinnott/obsidian-claude-code-mcp
v1.1.8 (23. Juni 2025), 307 Stars. Obsidian-Plugin mit MCP-Server via WebSocket (Port 22360). Protokoll: Legacy "HTTP with SSE" (2024-11-05).
**Pro:** native Claude-Code-Erkennung via WebSocket, kein Proxy. **Contra:** älteres Protokoll, weniger Features, letztes Release vor einem Jahr.

### Option D: Direkter Filesystem-Zugriff (kein MCP)
Claude Code liest/schreibt den Vault-Ordner direkt (Read/Write per Pfad).
**Pro:** Zero Setup, kein Plugin, kein API-Key. **Contra:** kein Obsidian-API-Zugriff (kein Index-Suchen, keine Tags-API, kein Frontmatter-Parsing), keine Validierung, kein Atomic Write (Races bei parallelen Agenten).

### Empfehlung
**Primär: Option A** (obsidian-local-rest-api). **Fallback: Option D** (Filesystem) für schreibende Hooks/Scripts; kombinierbar.
**Konkret für BFSG-Check:** MCP für Claude-Code-Lesezugriffe (Kontext/Recherche); Filesystem-Write für Hook-Scripts (Session-/Decision-Logs automatisch).

---

## Sync-Strategie (Windows + Linux-Server)

### Empfohlene Architektur: Git-backed Vault
Windows (Vault-Master) --git push--> GitHub (privates Repo bfsg-vault) --git pull--> Hetzner-Server (Read-Only-Klon).
**Windows:** Obsidian-Plugin Git Sync; Auto-Commit alle 15 Min + bei Close; Konflikt-Modal mit diff-View.
**Hetzner:** Cron alle 30 Min: cd /opt/bfsg-vault && git pull origin main
**Vorteile:** volle Versions-History, gratis (GitHub Private), Server-Claude kann lesen, kein Obsidian Sync (0 €/Mo), offline-fähig.

| Option | Kosten | Latenz | Komplexität | Empfehlung |
|--------|--------|--------|-------------|------------|
| Git + GitHub | 0 € | ~15 Min | Niedrig | **Empfohlen** |
| Obsidian Sync | 8 €/Mo | Echtzeit | Keine | Overkill für Solo |
| Syncthing | 0 € | Echtzeit | Mittel | Gut, aber kein Versioning |
| iCloud/Dropbox | 0-3 €/Mo | Echtzeit | Niedrig | Kein Linux-Native |

**Wichtig Windows:** Git-Pfade in JSON immer mit Forward-Slashes (C:/Users/Administrator/obsidian-vault/) — Backslashes brechen JSON-Parsing.

---

## Verhältnis zum bestehenden Claude-Memory (Single Source of Truth)

Ist-Zustand: .claude/projects/C--Users-Administrator-bfsg-check/memory/ mit MEMORY.md (Index), build-verify-before-merge.md, github-pr-via-rest.md, agency-agents-installed.md, prompt-caching-rule.md. Dieses Memory ist technisch, sitzungsübergreifend, Code-fokussiert — optimal für Agenten-Kontext.

Rollenverteilung (kein Doppeln):

| Ebene | Wo | Inhalt | Schreiber |
|-------|-----|--------|-----------|
| Agenten-Gedächtnis (kurzfristig) | .claude/projects/.../memory/ | Technische Regeln, Build-Patterns, Code-Entscheidungen | Claude Code automatisch |
| Business-Wissen (langfristig) | Obsidian-Vault | Strategie, Kunden, Kampagnen, Legal, Entscheidungen | Claude Code via Hooks + manuell |
| Projekt-Kontext (session-übergreifend) | CLAUDE.md + docs/HANDOVER-NEXT-SESSION.md | Aktueller Sprint-Status, offene Loops | Claude Code am Session-Ende |

Brücke: Claude-Memory -> Obsidian: Evergreen-Erkenntnisse als Zettel in 07-ZETTELKASTEN spiegeln. Obsidian -> Claude-Memory: Entscheidungen aus 04-DECISIONS mit Code-Implikationen bekommen Verweis-Eintrag in CLAUDE.md (z.B. "- Entscheidungskontext: siehe [[Vault:04-DECISIONS/20260610-Paketpreise-festgelegt]]").
**Anti-Pattern:** nicht beides vollständig synchron halten. Redundanz kostet Pflege. Klare Ownership je Ebene.

---

## Memory-Pipeline (Auto-Befüllung durch Agenten/Hooks)

Pipeline: Claude Code Session -> [Stop-Hook] -> memory_extractor.py (liest Transcript aus ~/.claude/projects/**/*.jsonl) -> Claude API Call (Haiku, günstig): "Extrahiere Entscheidungen, Patterns, Fehler, offene Loops" -> Schreibe Markdown in Vault (08-AI-SESSIONS/sessions/YYYY-MM-DD-[slug].md; 04-DECISIONS/ wenn Entscheidung; 08-AI-SESSIONS/patterns/ wenn Muster) -> Git auto-commit.

Hook-Konfiguration (settings.json):
```json
{ "hooks": {
  "Stop": [{ "matcher": "", "hooks": [{ "type": "command", "command": "python3 C:/Users/Administrator/.claude/hooks/memory_extractor.py" }] }],
  "PreToolUse": [{ "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "python3 C:/Users/Administrator/.claude/hooks/recall_context.py" }] }]
} }
```
**Achtung Windows:** Git Bash/WSL nötig für python3 (oder python im PATH); JSON-Pfade Forward-Slashes.

Session-Log-Template (08-AI-SESSIONS/_template-session.md): Frontmatter (date, project, session_id, tags) + Abschnitte Intent / Changes / Patterns / Mistakes+Fix / Open Loops / Links.

Trigger-basierte Notizen:

| Trigger | Agent/Hook | Notiz in Vault |
|---------|-----------|----------------|
| Neuer Stripe-Sale (Webhook) | scanner/webhook.js -> Claude API | 02-AREAS/Kunden/[slug].md anlegen |
| Google-Ads-Kampagne gestartet | Manuell + Claude | 01-PROJECTS/2026-[Kampagne]/START.md |
| Audit-Sprint abgeschlossen | Agency-Agent-Output | 08-AI-SESSIONS/sessions/[datum]-[typ]-audit.md |
| Neues PR/Commit auf main | GitHub Action | Append in DAILY/[date].md |
| Wöchentlicher Review | /weekly-review Subagent | 02-AREAS/Marketing/[KW]-Review.md |

Kosten: Stop-Hook via Claude Haiku ~0,001 €/Session; bei 3 Sessions/Tag ~0,09 €/Monat — vernachlässigbar.

---

## Anzeige & Suche im Cockpit (RAG ja/nein)

- **Option 1 (EMPFOHLEN Anfang): Smart Connections Plugin** — lokale Embeddings (BGE-micro-v2 / nomic-embed-text via Ollama), keine Cloud/API-Kosten; MCP-Server wraps Vector-DB -> Claude Code sucht semantisch. Braucht laufendes Obsidian.
- **Option 2: Karpathy-Pattern** (April 2026) — LLMs brauchen keine Embeddings bei gut strukturiertem Dokument; gepflegter ZK-Index.md + MEMORY.md reicht; Session-Start liest CLAUDE.md -> 08-AI-SESSIONS/INDEX.md -> Vault-Datei per Pfad via MCP.
- **Option 3: DuckDB + Embeddings** — Vault scannen, Embeddings via Anthropic API, in DuckDB; Claude fragt DuckDB-MCP. ~1 Tag Setup, sinnvoll ab ~500 Notizen.

Empfehlung BFSG-Check: Stufe 1 (sofort) strukturierter Vault + INDEX.md + MCP (Option A); Stufe 2 (ab 200+ Notizen) Smart Connections; Stufe 3 (ab 500+) DuckDB-RAG. **RAG lohnt sich NICHT in Phase 1** — Overhead > Nutzen bei kleinem Vault. Schwelle ~200 Notizen.
Cockpit-Anzeige: iframe/Tab-Sektion zeigt INDEX.md oder Daily-Note; "Ask your second brain"-Box via MCP-Aufruf an Obsidian (fetch https://127.0.0.1:27124/search/...).

---

## Obsidian vs. Alternativen (Begründung)

| Kriterium | Obsidian | Notion | Logseq | Plain MD + Git | Foam (VS Code) |
|-----------|----------|--------|--------|----------------|----------------|
| Offline | Vollständig | Nein | Vollständig | Vollständig | Vollständig |
| Kosten 2026 | Gratis (auch kommerziell) | 8-16 €/Mo | Gratis | Gratis | Gratis |
| MCP-Integration | Exzellent (3+ aktive Server) | Vorhanden, API-abhängig | Kaum | Direkt per FS | Keine |
| Claude Code Hooks | Optimal (FS-Write) | Nur via API | Filesystem | Optimal | Filesystem |
| Git-Sync | Nativ (Plugin) | Nicht möglich | Plugin | Natürlich | Natürlich |
| Suche | Volltext + Semantik (Plugin) | Eingebaut, Cloud | Volltext | grep/ripgrep | Eingebaut |
| Graph-View | Ja, native | Nein | Ja | Nein | Via Plugin |
| Plugin-Ökosystem | 1.800+ | Kein | 250+ | Keine | Wenige |
| Windows + Linux | Ja | Web-only auf Linux | Ja | Ja | Ja |
| Datensouveränität | Vollständig lokal | Cloud (US) | Lokal | Vollständig | Lokal |
| Team-Features | Nein (Solo) | Exzellent | Begrenzt | Via Git | Nein |

Warum Obsidian für BFSG-Check: (1) Filesystem = Claude Code nativ, Hooks schreiben direkt in den Ordner. (2) Git-Sync passt zur Infrastruktur (GitHub da). (3) MCP-Ökosystem 2026 ausgereift (obsidian-local-rest-api 4.1.3 enterprise-stabil). (4) Kostenlos. (5) Privacy: Kunden-/Legal-/Preisdaten bleiben lokal. (6) Obsidian CEO baut offiziell Claude Code Skills (Januar 2026).
Logseq: gut bei Block-Denken, schlechteres MCP. Notion: nur bei Team-Wachstum; für Solo+Privacy ausscheiden. Plain MD+Git: gute Basis, aber kein Graph-View / kein semantisches Suchen / kein Plugin-Ökosystem.

---

## Risiken & Gotchas

1. **Obsidian muss laufen für MCP.** Server-Claude (Hetzner) ohne Obsidian: Filesystem-Read via Git-Klon. Lösung: Dual-Track — MCP lokal, Filesystem remote.
2. **Windows-Pfade in JSON.** Backslashes brechen JSON. Immer Forward-Slashes (dokumentiert in CodyLiska/obsidian-llm-memory).
3. **Markdown ist keine Datenbank.** Strukturierte Abfragen schwer; Wikilinks nicht programmatisch traversierbar (Kernkritik "Stop Calling It Memory"). Lösung: Frontmatter konsequent + Dataview-Plugin; bei Bedarf SQLite.
4. **Session-Log-Rauschen.** Ohne Pruning Trivial-Flut in 08-AI-SESSIONS. Lösung: strenger Extraktions-Prompt + monatliches Pruning.
5. **Kein Concurrent-Write-Schutz.** Parallele Agenten überschreiben/löschen sich — exakt dieser Effekt trat beim Schreiben dieses Berichts auf (siehe Dateinamen-Hinweis oben). Lösung: separate Dateien pro Session-ID/Agent; Merge nur via Git.
6. **Git-Merge-Konflikte.** Lösung: Hetzner-Klon read-only (nur git pull); alle Writes nur von Windows.
7. **Python-Dependency für Hooks auf Windows.** python3 im PATH; alternativ PowerShell-Hook.

---

## Offene Entscheidungen für den User

| # | Entscheidung | Optionen | Empfehlung |
|---|-------------|----------|------------|
| 1 | Vault-Speicherort Windows | separater Ordner vs. im Repo | C:/Users/Administrator/obsidian-vault/ — getrennt vom Code |
| 2 | GitHub Repo für Vault | Unterordner vs. eigenes Repo | Eigenes Repo bfsg-vault |
| 3 | Vault-Name | bfsg-vault vs. matzeseba-brain | Name der über bfsg-check hinaus gilt |
| 4 | Obsidian Sync | Git vs. Obsidian Sync (8 €/Mo) | Git |
| 5 | Wann RAG einschalten | sofort vs. ab 200 Notizen | Ab 200 Notizen |
| 6 | Hook-Script-Sprache | Python vs. PowerShell vs. Node | Python |
| 7 | Kunden-Notizen | im Vault vs. separates CRM | Im Vault (02-AREAS/Kunden/) solange < 50 Kunden |
| 8 | Hetzner-Vault-Klon | ja (read-only) vs. nein | Ja |

---

## Quellen

- https://github.com/coddingtonbear/obsidian-local-rest-api  (v4.1.3, Juni 2026)
- https://github.com/cyanheads/obsidian-mcp-server  (v3.2.8, Juni 2026)
- https://github.com/iansinnott/obsidian-claude-code-mcp
- https://github.com/MarkusPfundstein/mcp-obsidian
- https://github.com/AgriciDaniel/claude-obsidian
- https://github.com/CodyLiska/obsidian-llm-memory
- https://www.mindstudio.ai/blog/self-evolving-claude-code-memory-obsidian-hooks
- https://www.mindstudio.ai/blog/build-ai-second-brain-claude-code-obsidian
- https://forum.obsidian.md/t/para-zettelkasten-vault-template-powerful-organization-task-tracking-and-focus-tools-all-in-one/91380
- https://mcpmarket.com/server/smart-connections-2
- https://motherduck.com/blog/obsidian-rag-duckdb-motherduck/
- https://limitededitionjonathan.substack.com/p/stop-calling-it-memory-the-problem
- https://www.atlasworkspace.ai/blog/obsidian-vs-logseq
- https://www.atlasworkspace.ai/blog/best-second-brain-apps
- https://oitia.com/en/article/notion-vs-obsidian-vs-logseq-2026/
- https://www.sudoself.dev/blogs/obsidian-git-sync/
- https://www.chaseai.io/blog/claude-code-obsidian-persistent-memory
- https://coddingtonbear.github.io/obsidian-local-rest-api/
- https://forum.obsidian.md/t/claude-mcp-for-obsidian-using-rest-api/93284
- https://awesomeclaude.ai/how-to/use-obsidian-with-claude

---

*Erstellt: 2026-06-21 | Recherche-Agent #3 (Second Brain / Memory-Layer) | Nächste Review: wenn Vault > 200 Notizen*
