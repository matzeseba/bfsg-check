# AI Operating System / Jarvis-Cockpit auf Claude Code-Basis
## Architektur-Recherche — Stand Juni 2026

> Recherche-Agent #1: Architektur & Top-Performer-Patterns  
> Erstellt: 21.06.2026 | Basis: WebSearch, WebFetch, offizielle Anthropic-Doku

---

## Executive Summary

- **Claude Agent SDK** (TypeScript + Python, veröffentlicht 11.06.2025, umbenannt Ende 2025) ist die sauberste Integrationsschicht: `npm install @anthropic-ai/claude-agent-sdk`, eine `query()`-Funktion, Streaming via `async for`, Subagents, Hooks und MCP-Server — alles programmatisch steuerbar aus einer Backend-App heraus.
- **Claude Managed Agents** (Beta seit 08.04.2026) ist die gehostete REST-API-Alternative für lang laufende, asynchrone Jobs: Anthropic betreibt Sandbox + State, deine App sendet Events und empfängt SSE-Streams. Empfehlung von Anthropic: Prototyp mit Agent SDK, Produktion mit Managed Agents.
- **Seit 15.06.2026** zählt programmatische Claude-Nutzung (Agent SDK, `claude -p`, GitHub Actions) **nicht** mehr gegen das Claude-Abo-Kontingent — das ändert die Kosten-Kalkulation für Claude-Max-Nutzer fundamental.
- Das Ökosystem 2025/2026 hat mindestens ein Dutzend produktionsreife Referenz-Architekturen hervorgebracht (`Ramsbaby/jarvis`, `gAIOS`, `hoangsonww/Claude-Code-Agent-Monitor`, `async-code`), die als Blaupause dienen können.
- Für BFSG-Check empfiehlt sich eine **3-Layer-Architektur**: (1) Next.js-Dashboard-Frontend mit SSE/WebSocket, (2) Node.js-Orchestrator-Backend mit BullMQ-Jobqueue und Claude-Agent-SDK-Integration, (3) Persistente Memory-Schicht mit SQLite (für Metadaten) + Mem0/Graphiti (für semantisches Langzeit-Gedächtnis).

---

## Wie Top-Performer es bauen (mit URLs + Aktualität)

### Jarvis-Projekte auf Claude Code-Basis

**1. Ramsbaby/jarvis** — Self-healing AI Ops Platform  
URL: https://github.com/ramsbaby/jarvis  
Aktuell: 132+ Commits, aktiv entwickelt 2024/2025  
Kern-Idee: Jede Discord-Nachricht und jeder Cron-Task ist eine `claude -p`-Invokation unter Claude Max — kein per-Message-API-Preis. 99 Automatisierungs-Scripts, die sich selbst reparieren wenn Services ausfallen (< 3 Minuten Recovery). Memory-System mit 3-Stufen-Kontext-Management (40K/60K/80K Token), BM25 + Vektor-Hybrid-Search über 10.000+ Dokumente, 77 % Token-Einsparung durch tiered prompt loading. Discord Bot als Frontend. 4 Ingest-Pfade: Realtime-Keyword-Routing, Background-LLM-Digest (Haiku), nächtliche Batch-Synthese (03:30 Uhr), wöchentlicher Lint. Theoretische LLM-Kosten für 7 Tage: $9.42 — tatsächlich $0 auf Claude Max.

**2. gAIOS** — Open-Source AI Operating System Blueprint  
URL: https://github.com/alirezarezvani/gaios  
Aktuell: v0.1.0, Juni 2026, 15 Stars  
Framework "Four Cs" (Context, Connections, Capabilities, Cadence) + "Three Ms" (Mindset, Method, Machine). Kernkonzept "WAT": Workflows · Agents · Tools — "Probabilistic AI reasons; deterministic code executes." Komponenten: `.claude/skills/` (16 Slash-Commands), `wiki/` Second Brain, `context/`, `tools/` (deterministische Python-Scripts), `decisions/log.md`. Python (82,7%) + HTML. Claude Code als First-Class-Runtime via `CLAUDE.md` + native Skills.

**3. ethanplusai/jarvis** — Voice-First macOS AI Assistant  
URL: https://github.com/ethanplusai/jarvis  
Voice-first Ansatz: Mit Mac sprechen, Jarvis spawnt Claude Code-Sessions um ganze Projekte zu bauen, plant den Tag. Relevant als Voice-Bridge-Referenz.

**4. Julian-Ivanov/jarvis-voice-assistant** — Personal AI mit Voice + Browser-Automation  
URL: https://github.com/Julian-Ivanov/jarvis-voice-assistant  
Komplett mit Claude Code gebaut (kein manueller Code). Voice-Steuerung + Browser-Automation. Zeigt: Solo-Founder kann vollständiges AI OS in einer Session bauen.

**5. AndrewKochulab/jarvis-dashboard** — Obsidian + Tauri Dashboard  
URL: https://github.com/AndrewKochulab/jarvis-dashboard  
62 Stars. 13 konfigurierbare Widgets: Voice Command, Live Sessions, Focus Timer, Activity Analytics, 30-Tage-GitHub-style-Heatmaps, Agent Fleet Management mit visuellen Avataren. Tauri 2.0 für macOS native App, SwiftUI für iOS. Überwacht Claude Code-Sessions live via JSONL-Monitoring.

### Monitoring / Cockpit-Systeme

**6. hoangsonww/Claude-Code-Agent-Monitor** — Real-Time Dashboard  
URL: https://github.com/hoangsonww/Claude-Code-Agent-Monitor  
484 Stars, 521 Commits. Tech: Node.js + Express + SQLite3 + React 18 + Vite + TailwindCSS + WebSockets + SSE + D3.js + Electron. Integration via Claude Code **native Hook-System**: parst JSONL-Transcripts aus `~/.claude/`, inkrementelle Byte-Offset-Updates, erkennt Subagent-Tool-Nutzung via `subagents/agent-*.jsonl`. Features: Echtzeit-Kanban, Session-Detail-Pages mit Transcripts, Workflow-Visualisierung (D3 DAGs, Sankey), 14 Webhook-Provider (Slack, Discord, Teams), 25-Tool-MCP-Server, Electron Desktop-App, PWA. **Beste verfügbare Open-Source-Referenz für ein Dashboard.**

**7. ObservedObserver/async-code** — Multi-Agent Parallel UI  
URL: https://github.com/ObservedObserver/async-code  
Next.js + TypeScript + TailwindCSS (Frontend) + Python Flask (Backend) + Docker (Containerisierung). Parallele Claude Code / Codex Task-Ausführung mit Codex-ähnlicher UI. Git-Integration, Modell-Vergleich, Supabase-Option. Zeigt das Parallel-Fan-Out-Pattern mit Web-UI.

**8. MindStudio-Blog-Serie** — Agentic Business OS  
URL: https://www.mindstudio.ai/blog/agentic-business-os-claude-code-architecture-guide  
Umfangreichste Dokumentation zur Business-OS-Architektur: Brand-Context-Layer als persistente Wissensbasis, Memory-Stack (Working, Declarative, Episodic, Procedural), Orchestrator-Worker-Pattern mit strukturierten Output-Schemas.

### Akademische / Analyse-Ressourcen

**9. VILA-Lab/Dive-into-Claude-Code** — Systematic Analysis  
URL: https://github.com/VILA-Lab/Dive-into-Claude-Code  
Systematische Analyse von Claude Code für die Gestaltung heutiger und zukünftiger AI-Agent-Systeme.

---

## Claude Code als Engine (Integrationsschicht, konkret)

### 3 Integrationsebenen — von simpel zu vollständig

**Ebene 1: CLI-Print-Mode (`claude -p`)**

```bash
# Basis
claude -p "Erstelle Analyse der letzten 7 Stripe-Transaktionen" \
  --allowedTools "Read,Bash" \
  --output-format json | jq -r '.result'

# Mit JSON-Schema für strukturierten Output
claude -p "Extrahiere Verkaufsdaten" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"sales":{"type":"array"},"total":{"type":"number"}}}' \
  | jq '.structured_output'

# Streaming für Live-Updates
claude -p "Führe WCAG-Audit durch" \
  --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'

# Mit --bare für schnellere Starts in CI/Cron (überspringt CLAUDE.md etc.)
claude --bare -p "Health-Check bfsg-fix.de" --allowedTools "Bash"
```

Output-Struktur von `--output-format json`:
```json
{
  "result": "...",
  "session_id": "uuid",
  "usage": {"input_tokens": 1820, "output_tokens": 412, "cache_read": 1200},
  "total_cost_usd": 0.0087,
  "duration_ms": 1243
}
```

Session-Resumption für Konversations-Ketten:
```bash
SESSION=$(claude -p "Start BFSG-Analyse" --output-format json | jq -r '.session_id')
claude -p "Jetzt Detail-Report für fehlgeschlagene Rules" --resume "$SESSION"
```

**Ebene 2: Claude Agent SDK (TypeScript — empfohlen für Dashboard-Backend)**

```typescript
import { query, AgentDefinition } from "@anthropic-ai/claude-agent-sdk";

// Einfache Invokation mit strukturiertem Output
async function runBFSGAudit(url: string) {
  for await (const message of query({
    prompt: `Führe WCAG 2.1 AA Audit für ${url} durch`,
    options: {
      allowedTools: ["Bash", "WebFetch", "Read"],
      agents: {
        "wcag-scanner": {
          description: "WCAG accessibility scanner",
          prompt: "Analysiere Barrierefreiheit nach WCAG 2.1 AA",
          tools: ["WebFetch", "Bash"]
        }
      }
    }
  })) {
    if ("result" in message) return message.result;
    if (message.type === "system" && message.subtype === "init") {
      // Session-ID für Status-Tracking speichern
      console.log("Session:", message.session_id);
    }
  }
}

// Hooks für Audit-Logging
const logToolCall: HookCallback = async (input) => {
  await auditLog.write({ agent: "wcag-scanner", tool: input.tool_name, ts: new Date() });
  return {};
};

for await (const msg of query({
  prompt: "...",
  options: {
    hooks: { PostToolUse: [{ matcher: ".*", hooks: [logToolCall] }] }
  }
})) { ... }
```

**Ebene 3: Claude Managed Agents REST API (für Produktion / Langläufer)**

```
POST /v1/agents — Agent definieren (Modell, System-Prompt, Tools, MCP-Server)
POST /v1/agents/{id}/sessions — Session starten (async)
POST /v1/sessions/{id}/events — User-Turn senden
GET  /v1/sessions/{id}/events — SSE-Stream empfangen
GET  /v1/sessions/{id} — Status abfragen
DELETE /v1/sessions/{id} — Session beenden
```

Beta-Header erforderlich: `managed-agents-2026-04-01`  
Stateful by design: Sessions sind langlebig, Sandbox und History server-seitig persistiert.  
Nicht ZDR- oder HIPAA-eligible (Sessions werden server-seitig gespeichert).

### Wann welche Ebene?

| Use Case | Empfehlung |
|---|---|
| Einfache Cron-Jobs, CI-Scripts | `claude -p --bare` |
| Dashboard-Backend, strukturierte Outputs, Hooks | Claude Agent SDK (TypeScript) |
| Langläufer (> 5 Min), async Jobs ohne eigene Infra | Claude Managed Agents REST API |
| Prototyping in Claude Code Sessions | Skills / Slash Commands |

**Kritische Eigenheit:** Ab v2.1.163 werden Background-Bash-Tasks 5 Sekunden nach dem letzten Result beendet. Ab v2.1.182 gibt es ein 10-Minuten-Cap für wartende Background-Subagents (konfigurierbar via `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`).

---

## Orchestrierungs-Patterns (Entscheidungsregeln)

### Entscheidungsbaum: Welches Pattern für welchen Task?

```
Task-Art?
├── Einmaliger, kurzer Abruf (< 30s)
│   └── Slash Command oder claude -p
│
├── Wiederkehrend, vorhersehbar (täglich/wöchentlich)
│   └── Scheduled Agent (cron) via /schedule oder CronCreate
│
├── Komplex, mehrere Subtasks, unbekannte Menge an Schritten
│   └── Hierarchisches Orchestrator-Subagent-Pattern (Agent SDK)
│
├── Parallel unabhängige Teilaufgaben
│   └── Fan-Out / Fan-In (mehrere Subagents in einer Nachricht)
│
├── Iterative Qualitäts-Optimierung
│   └── Evaluator-Optimizer-Loop (max 3 Iterationen)
│
└── Externe System-Integration (Stripe, GitHub, Brevo, Hetzner)
    └── MCP-Server
```

### Pattern-Detail: Subagents

**Wann:** Subtasks sind kognitiv distinct, können parallelisiert werden, brauchen separaten Kontext.  
**Wie:** `allowedTools: ["Agent"]` + `agents: { "name": AgentDefinition }` im Agent-SDK-Call.  
**Für BFSG-Check:** Scanner-Agent, Report-Generator-Agent, Marketing-Agent als separate Definitionen.

```typescript
// Parallel Fan-Out für BFSG-Audit
const results = await Promise.all([
  runAgent("wcag-scanner", { url }),
  runAgent("tdddg-checker", { url }),
  runAgent("contrast-analyzer", { url })
]);
const report = await synthesize(results);
```

**Gotcha:** Subagents in `claude -p` warten maximal 10 Minuten (ab v2.1.182). Bei Bedarf `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0` setzen.

### Pattern-Detail: Skills (ehemals Slash Commands)

**Wann:** Wiederkehrender, definierter Workflow den der Agent auch auto-invoken soll.  
**Speicherort:** `.claude/skills/` (projektspezifisch) oder `~/.claude/skills/` (global).  
**Unterschied zu Commands:** Skills haben `description`-Feld → Claude kann sie **auto-invoken** wenn der Kontext passt. Commands waren rein manuell.  
**Für BFSG-Check:** `/wcag-audit`, `/stripe-report`, `/marketing-brief`, `/deploy-check` als Skills.

### Pattern-Detail: Hooks

**Wann:** Quer durch alle Patterns — für Logging, Guardrails, Validierung, Metriken.  
**Verfügbare Hook-Events (17 total):** `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`, und mehr.  
**Für BFSG-Check:** `PostToolUse`-Hook für Audit-Trail aller Tool-Calls, `Stop`-Hook für Kosten-Logging.

### Pattern-Detail: Scheduled/Cron Agents

**Wann:** Täglich, wöchentlich, zu festen Zeiten — Health-Checks, Reports, Kampagnen-Monitoring.  
**Wie:** `/schedule` Command in Claude Code oder `claude trigger create` CLI oder CronCreate-Tool.  
**Für BFSG-Check:** Nachtlicher Health-Check von bfsg-fix.de, wöchentlicher SEO-Report, monatliche Stripe-Auswertung.

### Pattern-Detail: MCP-Server

**Wann:** Anbindung externer Systeme mit stabiler API (Stripe, GitHub, Brevo, Hetzner-API).  
**Wie:** `mcpServers: { "stripe": { command: "node", args: ["stripe-mcp.js"] } }` im Agent-SDK-Call.  
**Für BFSG-Check:** Stripe-MCP für Verkaufsdaten, Brevo-MCP (bereits via MCP vorhanden), GitHub-MCP für Deployment-Status.

### Wartbarkeits-Regel für Solo-Founder

**Max. 7 Skills aktiv gleichzeitig**. Mehr schafft zu viel Kontext-Overhead. Inaktive Skills in `.claude/skills/archive/` auslagern. Skills dokumentieren wann sie zuletzt gelaufen sind (in `decisions/log.md`).

---

## Job/Task-Layer (async, Status, Logs)

### Das Problem

Dashboard-Nutzer klickt "Neue Werbekampagne erstellen" → Agent läuft 3-10 Minuten → Browser kann nicht 10 Minuten warten → asynchrones Job-System nötig.

### Empfohlenes Pattern: BullMQ + Redis + SSE

```
User klickt "Kampagne erstellen"
        ↓
Dashboard-Backend: Job in BullMQ-Queue einreihen → Job-ID zurück
        ↓
Worker-Prozess: Job aus Queue nehmen, Agent SDK aufrufen
        ↓
Agent SDK: Streaming-Output zeilenweise in Redis/DB schreiben
        ↓
SSE-Endpoint: Client streamt /api/jobs/{id}/stream
        ↓
Dashboard: Live-Log-Ausgabe, Status-Indikator, Token-Counter
```

**BullMQ** (Redis Streams-basiert, TypeScript-nativ) ist die Referenz-Implementierung für Claude-Code-Job-Queues (aktiv 2025/2026 dokumentiert). Features: Job-Priorisierung, Retry mit exponentialem Backoff, Job-Dependencies, Bull Board Dashboard.

**Konkrete Job-Datenstruktur:**
```typescript
interface AgentJob {
  id: string;           // UUID
  type: "audit" | "campaign" | "report" | "health-check";
  prompt: string;
  agentOptions: ClaudeAgentOptions;
  status: "queued" | "running" | "completed" | "failed" | "paused";
  sessionId?: string;   // Claude-Session für Resume
  logs: LogEntry[];     // Stream-Output
  startedAt?: Date;
  completedAt?: Date;
  cost?: number;        // total_cost_usd
  result?: unknown;     // structured output
  error?: string;
}
```

**SQLite als Job-Persistenz** (kein PostgreSQL-Overhead für Solo-Founder). JSONL-Logs als Rohformat (Claude schreibt nativ JSONL).

**SSE-Stream-Pattern:**
```typescript
// Express-Endpoint
app.get("/api/jobs/:id/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  
  // chokidar watchet die JSONL-Log-Datei des Jobs
  const watcher = chokidar.watch(`./jobs/${req.params.id}.jsonl`);
  watcher.on("change", () => {
    const newLines = getNewLines(req.params.id);
    res.write(`data: ${JSON.stringify(newLines)}\n\n`);
  });
  
  req.on("close", () => watcher.close());
});
```

**Rate-Limit-Handling:** Für Claude-Max-Nutzer relevant: `claude-queue` (JCSnap/claude-code-queue) und `claude-queue` (vasiliyk/claude-queue) sind Open-Source-Tools die automatisch pausieren wenn Rate-Limit erreicht und resumieren wenn Limit zurückgesetzt.

---

## Empfohlene Referenz-Architektur für BFSG-Check

### Komponenten-Diagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                    BFSG-OS COCKPIT                              │
├──────────────────────────┬──────────────────────────────────────┤
│   DASHBOARD-FRONTEND     │   AGENT-STEUERUNG                   │
│   (Next.js + shadcn)     │   Kampagne / Audit / Report         │
│   - Business-Metriken    │   per Klick oder per Sprache        │
│   - Job-Queue-Status     │                                     │
│   - Live-Log-Stream      │                                     │
│   - Second-Brain-Search  │                                     │
└──────────┬───────────────┴──────────────────┬──────────────────┘
           │ HTTP/SSE                          │ HTTP/WebSocket
           ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR-BACKEND (Node.js + Express)           │
├───────────────┬──────────────────┬──────────────────────────────┤
│  JOB QUEUE    │  AGENT REGISTRY  │   WEBHOOK RECEIVER           │
│  (BullMQ +    │  Skills, Agents  │   Stripe / GitHub Actions    │
│   Redis)      │  MCP-Configs     │   / bfsg-fix.de /health      │
└───────┬───────┴─────────┬────────┴──────────────────────────────┘
        │                 │
        ▼                 ▼
┌──────────────────────────────────────────────────────────────────┐
│              CLAUDE AGENT SDK LAYER                              │
├──────────────────────┬───────────────────────────────────────────┤
│  claude -p (Cron)    │  @anthropic-ai/claude-agent-sdk           │
│  Scheduled Jobs      │  query() + Streaming + Hooks + Subagents  │
└──────────────────────┴───────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│              MEMORY & STATE LAYER                                │
├───────────────┬──────────────────┬───────────────────────────────┤
│  CLAUDE.md    │  SQLite          │  Mem0 (self-hosted)           │
│  + Skills +   │  (Jobs, Metriken │  Semantisches Langzeit-       │
│  HANDOVER.md  │   Sessions, Logs)│  Gedächtnis, Entitäten        │
└───────────────┴──────────────────┴───────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│              DATEN-KONNEKTOREN (via MCP-Server)                  │
├────────────┬───────────────┬──────────────┬──────────────────────┤
│  Stripe    │  GitHub API   │  Brevo       │  Hetzner API         │
│  (Sales)   │  (Deploys,    │  (Email,     │  (Server-Status,     │
│            │   Issues)     │   Campaigns) │   Metriken)          │
└────────────┴───────────────┴──────────────┴──────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│              VOICE BRIDGE (optional, Phase 2)                    │
│  voicemode MCP + Whisper STT (lokal) + Kokoro TTS               │
└──────────────────────────────────────────────────────────────────┘
```

### Tech-Stack-Empfehlung

| Schicht | Tech | Begründung |
|---|---|---|
| Dashboard-Frontend | Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui | Bereits im Projekt (landingpage-next), kein neuer Stack |
| State Management | Zustand + TanStack Query | Leichtgewichtig, SSE-kompatibel |
| Charts | Recharts (oder Tremor) | React-nativ, keine D3-Kenntnisse nötig |
| Backend Orchestrator | Node.js + Express | Bereits in scanner/ vorhanden, kein neuer Stack |
| Job Queue | BullMQ + Redis | TypeScript-nativ, Referenz für Claude-Code-Jobs |
| Job-Persistenz | SQLite + better-sqlite3 | Zero-Overhead, Solo-Founder gerecht |
| Claude-Engine | @anthropic-ai/claude-agent-sdk | Offiziell, strukturierte Outputs, Hooks, Subagents |
| Echtzeit-Push | SSE (einfacher als WebSockets, Proxy-sicher) | Ausreichend für unidirektionale Job-Logs |
| Memory / Second Brain | CLAUDE.md + SQLite + Mem0 (self-hosted, OSS) | Drei Ebenen: sofort / kurzfristig / semantisch |
| MCP-Konnektoren | Stripe-MCP, GitHub-MCP (bestehend), Brevo-MCP (bestehend) | Bereits via MCP integrierbar |
| Voice Bridge (Phase 2) | voicemode MCP + Whisper STT local + Kokoro TTS | Lokal, < 0,3s Latenz, kein API-Key |
| Deployment | Docker Compose + Hetzner CPX22 (bestehend) | Kein neuer Server nötig |

### Implementierungs-Reihenfolge (Solo-Founder-gerecht)

**Phase 1 (Woche 1-2): Fundament**
1. Orchestrator-Backend in `cockpit/` als neues Verzeichnis im Repo
2. BullMQ + Redis im Docker Compose ergänzen
3. Claude Agent SDK einbinden, ein Job-Typ ("health-check") implementieren
4. SSE-Endpoint für Job-Log-Streaming

**Phase 2 (Woche 3-4): Dashboard**
5. Dashboard-Frontend in `cockpit-ui/` (Next.js, reuse landingpage-next-Setup)
6. Stripe-Daten über MCP oder direkten API-Call einbinden
7. Job-Queue-View mit Kanban-Status
8. Second-Brain-Suche (SQLite FTS5 über HANDOVER.md + Entscheidungslog)

**Phase 3 (Woche 5-6): Skills + Voice**
9. 3-5 Skills für häufige Tasks (wcag-audit, stripe-report, deploy-check)
10. Cron-Jobs für tägliche Health-Checks
11. VoiceMode-MCP als optionale Steuerungsschicht

---

## Top-Bausteine zum Wiederverwenden

### 1. `@anthropic-ai/claude-agent-sdk` (TypeScript)
**Zweck:** Programmatische Claude-Code-Engine — `query()`, Streaming, Hooks, Subagents, Sessions, MCP, Permissions.  
**Warum:** Offiziell, stabil (seit 11.06.2025), alle Features die `claude -p` kann + mehr, TypeScript-nativ, kein Spawning von Child-Prozessen nötig.  
**URL:** https://code.claude.com/docs/en/agent-sdk/overview  
**Install:** `npm install @anthropic-ai/claude-agent-sdk`

### 2. `hoangsonww/Claude-Code-Agent-Monitor`
**Zweck:** Open-Source Dashboard-Referenz: JSONL-Parsing, Hook-Integration, Real-time Kanban, Session-Transcripts, D3-Visualisierungen, Electron.  
**Warum:** 484 Stars, 521 Commits, produktionsreif, zeigt exakt wie man Claude Code-Events in ein Dashboard integriert (Hook-System + JSONL-Byte-Offset-Monitoring).  
**URL:** https://github.com/hoangsonww/Claude-Code-Agent-Monitor  
**Lizenz:** MIT

### 3. `BullMQ`
**Zweck:** Job-Queue für asynchrone Agenten-Jobs: Priorisierung, Retry, Dependencies, Bull-Board-Dashboard.  
**Warum:** Redis Streams-basiert, TypeScript-nativ, dokumentierter Standard für Node.js + Claude Code-Job-Queues (2025/2026 aktiv dokumentiert). Kein RabbitMQ-Overhead.  
**URL:** https://bullmq.io/  
**Install:** `npm install bullmq`

### 4. `mem0ai/mem0`
**Zweck:** Self-hosted semantisches Langzeit-Gedächtnis für Agenten: Vektor + Knowledge Graph, Entitäts-Relationen, Apache 2.0, 48k+ Stars.  
**Warum:** Günstigste Option für self-hosted Graph-Memory (kein Neo4j nötig), direkte Anthropic-Integration, Community-Support solid, Benchmark: 49% LongMemEval (ausreichend für Business-OS).  
**URL:** https://github.com/mem0ai/mem0  
**Install:** `pip install mem0ai` (Python API)

### 5. `vasiliyk/claude-queue` / `JCSnap/claude-code-queue`
**Zweck:** Rate-Limit-Handler für Claude-Code-Jobs: auto-pause bei Rate-Limit, auto-resume wenn Limit zurückgesetzt, Prioritäten, Dependencies.  
**Warum:** Bei Claude Max + vielen parallelen Cron-Jobs unvermeidbar — statt manuellem Retry-Handling.  
**URLs:** https://github.com/vasiliyk/claude-queue | https://github.com/JCSnap/claude-code-queue  

### 6. `mbailey/voicemode`
**Zweck:** MCP-Server für lokale Voice-Steuerung von Claude Code: Whisper STT + Kokoro TTS, < 0,3s Latenz, kein Cloud-API-Key.  
**Warum:** Drop-in MCP, funktioniert sofort mit bestehender Claude Code + MCP-Infrastruktur. Für "Jarvis"-Voice-Steuerung des Cockpits.  
**URL:** https://github.com/mbailey/voicemode  
**Install:** Als MCP-Server in `.claude/settings.json` eintragen

### 7. `chokidar`
**Zweck:** File-Watcher für JSONL-Transcripts aus `~/.claude/` → SSE-Push an Dashboard.  
**Warum:** Etabliert, zuverlässig unter Node.js, exakte Methode die `Claude-Code-Agent-Monitor` nutzt (inkrementelle Byte-Offset-Updates).  
**URL:** https://github.com/paulmillr/chokidar  
**Install:** `npm install chokidar`

### 8. `alirezarezvani/gaios`
**Zweck:** Vollständige Blueprint-Referenz für ein AI OS auf Claude Code: CLAUDE.md-Struktur, Skills-Organisation, Second-Brain-Wiki, Decision-Log.  
**Warum:** Direkt übertragbare Struktur auf BFSG-Check — `context/`, `wiki/`, `tools/` (deterministische Scripts), `decisions/log.md`. Apache 2.0.  
**URL:** https://github.com/alirezarezvani/gaios

### 9. `hesreallyhim/awesome-claude-code`
**Zweck:** Kuratierte Liste aller Claude Code Skills, Hooks, Slash-Commands, Agent-Orchestratoren (47.000+ Stars).  
**Warum:** Erste Anlaufstelle vor jeder Eigenentwicklung — sehr wahrscheinlich existiert schon ein Skill der passt.  
**URL:** https://github.com/hesreallyhim/awesome-claude-code

---

## Risiken & Gotchas

### Risiko 1: Rate-Limit-Kaskade
**Problem:** Mehrere parallele Cron-Jobs + Dashboard-Nutzung gleichzeitig triggern Claude-Rate-Limits. Seit 15.06.2026 zählt Agent-SDK-Nutzung nicht gegen Abo — aber API-Keys unterliegen weiterhin Rate-Limits.  
**Mitigation:** BullMQ mit Concurrency-Limit (max. 2-3 gleichzeitige Claude-Jobs), `claude-queue` für automatisches Rate-Limit-Handling.

### Risiko 2: Kontextfenster-Erschöpfung bei Cron-Ketten
**Problem:** Tägliche Berichte, die vorherige Berichte einlesen, eskalieren exponentiell in der Token-Zahl. Klassisches Context-Budget-Problem.  
**Mitigation:** `--bare` Mode für Cron-Jobs (überspringt CLAUDE.md, spart ~2K-5K Token). Strikte Summarisierungs-Outputs: jeder Agent produziert sowohl full-output als auch ≤200-Token-Summary. Summary geht in nächsten Job, full-output in SQLite.

### Risiko 3: Stale CLAUDE.md / Prompt-Injection durch alte Kontext-Dateien
**Problem:** CLAUDE.md wächst unkontrolliert und enthält widersprüchliche Regeln. Externe Inhalte (Scan-Ergebnisse von fremden Websites) könnten Prompt-Injection enthalten.  
**Mitigation:** Wöchentlicher CLAUDE.md-Review-Cron. Alle gescannten Website-Inhalte durch einen "Sanitizer"-Subagent schleusen, der nur strukturierte Daten (JSON) weitergibt — niemals rohe HTML/Text direkt in den Orchestrator-Prompt.

### Risiko 4: BullMQ-Redis als Single Point of Failure
**Problem:** Fällt Redis aus, fallen alle Jobs aus.  
**Mitigation:** Redis mit Persistenz (`appendonly yes` in redis.conf). Auf CPX22 ausreichend, Backup via `redis-cli --rdb`. Alternativ: SQLite-basierte Job-Queue (einfacher aber kein Fan-Out).

### Risiko 5: Managed Agents Beta-Instabilität
**Problem:** `managed-agents-2026-04-01` ist explizit Beta — API-Änderungen möglich.  
**Mitigation:** Erst mit Agent SDK (stable) bauen, optional später zu Managed Agents migrieren. Anthropic-Guidance: "Prototype with SDK, graduate to Managed Agents for production."

### Risiko 6: Keine serverseitige Voice-Steuerung sicher realisierbar
**Problem:** VoiceMode-MCP läuft lokal (Mikrofon-Zugriff), nicht remote im Dashboard.  
**Mitigation:** Web Speech API im Browser für Voice-Input (kein MCP nötig), MCP nur für TTS-Output falls Claude antworten soll. Oder: Voice nur für lokale Claude Code CLI-Sessions, nicht für das Web-Dashboard.

### Risiko 7: Deployment-Overhead auf CPX22
**Problem:** Redis + BullMQ Worker + Cockpit-Backend + Cockpit-Frontend + bestehende scanner/ + landingpage/ auf einem shared vCPU sind eng.  
**Mitigation:** Dashboard und Cockpit-Backend als leichtgewichtige Prozesse (nicht Node-Cluster). Redis Memory-Limit setzen (`maxmemory 256mb`, `maxmemory-policy allkeys-lru`). Alternativ: Cockpit nur lokal laufen lassen (kein öffentlicher Zugriff), Daten über SSH-Tunnel.

---

## Offene Entscheidungen für den User

### Entscheidung 1: Agent SDK vs. Managed Agents als Haupt-Engine
**Option A (Agent SDK):** Läuft auf eigenem Hetzner-Server, volle Kontrolle, kein Vendor-Lock, $0 extra.  
**Option B (Managed Agents):** Anthropic-Infra, kein Server-Management, Beta-Status, Kosten unklar, ZDR-ausgeschlossen.  
**Empfehlung:** Option A für Solo-Founder. Option B wenn Langläufer (> 10 Min) dominieren oder CPX22 zu schwach ist.

### Entscheidung 2: Memory-System — SQLite-only vs. Mem0
**Option A (SQLite + FTS5):** Nur Volltextsuche über strukturierte Daten. Kein extra Service, 0 Kosten, wartungsarm.  
**Option B (SQLite + Mem0 self-hosted):** Semantische Suche, Entitäts-Extraktion, Knowledge Graph. Zweiter Prozess, ~100MB RAM extra.  
**Empfehlung:** Phase 1 mit SQLite starten (FTS5 reicht für <10k Einträge), Mem0 in Phase 3 wenn semantische Suche nötig wird.

### Entscheidung 3: Cockpit-Zugriff — öffentlich vs. lokal
**Option A (lokal):** Dashboard auf localhost, kein auth nötig, kein Security-Risk, kein extra Port.  
**Option B (öffentlich auf bfsg-fix.de/cockpit):** Überall erreichbar, aber auth-Schicht nötig (JWT oder Magic-Link), Security-Review nötig.  
**Empfehlung:** Phase 1 lokal, Phase 2 optional mit Magic-Link-Auth öffentlich machen.

### Entscheidung 4: Voice-Steuerung — Browser vs. CLI
**Option A (Web Speech API im Browser):** Einfach, kein MCP nötig, aber Cloud-abhängig.  
**Option B (voicemode MCP):** Lokal, privat, < 0,3s Latenz, aber nur über Claude Code CLI nutzbar (nicht Web).  
**Empfehlung:** Option A für Web-Dashboard, Option B für lokale Claude Code-Sessions.

### Entscheidung 5: Cockpit als eigenes Repo oder als Verzeichnis in bfsg-check
**Option A (Verzeichnis `cockpit/`):** Einfaches Deployment, shared CI/CD, alles in einem Repo.  
**Option B (eigenes Repo):** Sauberere Trennung, eigener Deploy-Cycle, aber mehr Overhead.  
**Empfehlung:** Option A — Monorepo passt zu Solo-Founder-Arbeitsweise.

---

## Quellen

- [Claude Agent SDK Overview — code.claude.com](https://code.claude.com/docs/en/agent-sdk/overview)
- [Claude Code Headless / -p Mode — code.claude.com](https://code.claude.com/docs/en/headless)
- [Claude Managed Agents Overview — platform.claude.com](https://platform.claude.com/docs/en/managed-agents/overview)
- [Claude Agent SDK Billing Change June 15 — vantagepoint.io](https://vantagepoint.io/blog/ai/claude-agent-sdk-billing-change-june-15)
- [Ramsbaby/jarvis — GitHub](https://github.com/ramsbaby/jarvis)
- [gAIOS — AI Operating System Blueprint — GitHub](https://github.com/alirezarezvani/gaios)
- [ethanplusai/jarvis — Voice-First Jarvis — GitHub](https://github.com/ethanplusai/jarvis)
- [Julian-Ivanov/jarvis-voice-assistant — GitHub](https://github.com/Julian-Ivanov/jarvis-voice-assistant)
- [AndrewKochulab/jarvis-dashboard — Obsidian Dashboard — GitHub](https://github.com/AndrewKochulab/jarvis-dashboard)
- [hoangsonww/Claude-Code-Agent-Monitor — GitHub](https://github.com/hoangsonww/Claude-Code-Agent-Monitor)
- [ObservedObserver/async-code — Parallel Agent UI — GitHub](https://github.com/ObservedObserver/async-code)
- [hesreallyhim/awesome-claude-code — GitHub](https://github.com/hesreallyhim/awesome-claude-code)
- [VILA-Lab/Dive-into-Claude-Code — GitHub](https://github.com/VILA-Lab/Dive-into-Claude-Code)
- [alirezarezvani/gaios — GitHub](https://github.com/alirezarezvani/gaios)
- [Build Your Own Jarvis — frankx.ai](https://www.frankx.ai/blog/build-your-own-jarvis-claude-code)
- [MindStudio: Agentic Business OS Architecture Guide](https://www.mindstudio.ai/blog/agentic-business-os-claude-code-architecture-guide)
- [MindStudio: Agentic OS Claude Code](https://www.mindstudio.ai/blog/how-to-build-agentic-operating-system-claude-code)
- [Claude Code Agent View (May 2026) — claudefa.st](https://claudefa.st/blog/guide/agents/agent-view)
- [Claude Code Async Workflows — claudefa.st](https://claudefa.st/blog/guide/agents/async-workflows)
- [Background Job Queues mit Claude Code: BullMQ — DEV Community](https://dev.to/myougatheaxo/background-job-queues-with-claude-code-bullmq-patterns-for-nodejs-4mgm)
- [JCSnap/claude-code-queue — GitHub](https://github.com/JCSnap/claude-code-queue)
- [vasiliyk/claude-queue — GitHub](https://github.com/vasiliyk/claude-queue)
- [mbailey/voicemode — MCP Voice — GitHub](https://github.com/mbailey/voicemode)
- [AI Agent Memory 2026: Mem0 vs Zep — Medium](https://medium.com/@wasowski.jarek/i-compared-5-ai-agent-memory-systems-across-6-dimensions-none-wins-6a658335ed0a)
- [Mem0 vs Zep (Graphiti) — vectorize.io](https://vectorize.io/articles/mem0-vs-zep)
- [State of AI Agent Memory 2026 — mem0.ai](https://mem0.ai/blog/state-of-ai-agent-memory-2026)
- [Understanding Claude Code's Full Stack — alexop.dev](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [Claude Code Best Practices 2026 — mcp.directory](https://mcp.directory/blog/claude-code-best-practices)
- [Programmatically Using Claude Code — GitHub Gist (JacobFV)](https://gist.github.com/JacobFV/2c4a75bc6a835d2c1f6c863cfcbdfa5a)
- [Code with Claude 2026: 5 New Agent Features — MindStudio](https://www.mindstudio.ai/blog/code-with-claude-2026-new-agent-features)
- [InfoQ: Anthropic Code with Claude — Managed Agents, Proactive Workflows](https://www.infoq.com/news/2026/05/code-with-claude/)
- [Claude Agent SDK and Managed Agents: Production Guide — hatchworks.com](https://hatchworks.com/blog/claude/claude-agent-sdk-and-managed-agents/)
