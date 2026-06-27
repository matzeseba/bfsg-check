# BFSG-OS Cockpit — Architektur & Integrations-Contract

> **Verbindlicher Vertrag** für alle Bau-Agenten. Wer ein Modul baut, hält sich an diese Schnittstellen.
> Standalone, **nur lokal** (Windows-PC). Nicht in `admin-next/`. Nicht im Prod-Deploy.

## Top-Level-Layout

```
cockpit/                 # Orchestrator-Backend (Node.js, ESM, Express)
  package.json
  .env.example
  src/
    server.js            # Express-App, mountet alle Routen, startet Poller + Graceful-Shutdown
    config.js            # zentrale Konfig (Pfade, Ports, Feature-Flags)
    log.js               # pino-Logger (redacted — Secrets/Tokens/PII)
    engine/
      claude.js          # runAgent(): spawnt `claude -p` (lokale Auth), stream-json → Events
      jobQueue.js        # In-Process-Queue (Concurrency-Cap). Gleiche API wie BullMQ-Upgrade.
    connectors/          # Daten-Quellen (read-only). Jeder exportiert async fetch() -> JSON
      stripe.js          # Umsatz, Sales, Paket-Split (orders.jsonl + optional Stripe API)
      health.js          # GET https://bfsg-fix.de/health
      orders.js          # liest scanner/out/orders.jsonl (Domain-anonymisiert)
      github.js          # Deploy-Status + Uptime via GitHub Actions (optional Token)
      ads.js             # Google/Bing Ads (optional; liefert sonst leere/mock Struktur)
    actions/
      registry.js        # ACTIONS: die 18 Aktionen (id, label, category, agent, prompt-builder)
      guardrails.js      # 5-Ebenen-Governance (Blacklist, Formulation, Approval, Audit, Channel)
      auditLog.js        # append-only out/cockpit-actions.jsonl (mit Rotation bei 5 MB)
      sanitize.js        # Prompt-Arg-Sanitizer (R-01, Prompt-Injection-Abschwächung)
    routes/
      cockpit.js         # GET /api/cockpit/summary, /api/cockpit/panels/:id
      jobs.js            # POST /api/actions/:id/launch, GET /api/jobs[/:id][/stream], approve, cancel
      voice.js           # POST /api/voice/intent  (text → action), WS /ws/voice (audio)
      health.js          # GET /api/health (Cockpit-eigener Health)
    voice/
      bridge.js          # WS-Server: PCM-Audio → STT → intent → runAgent → TTS
      stt.js             # faster-whisper HTTP-Client (lokal) + Fallback
      tts.js             # Piper HTTP-Client
      intents.js         # INTENTS: 25 deutsche Sprach-Muster → actionId + arg-Extraktion
      wakeword.js        # openWakeWord-Anbindung (optionaler Always-on-Daemon)

cockpit-ui/              # Dashboard-Frontend (Next.js 15 + Tailwind + shadcn + Tremor)
  app/
    page.tsx             # Cockpit-Hauptseite (Bento-Grid)
    layout.tsx
    globals.css          # Jarvis-HUD-Theme (CSS-Variablen, A11y-Fallbacks)
  components/
    KpiHeader.tsx        # Top-KPI-Leiste
    panels/*.tsx         # 14 Panels (siehe unten)
    AgentLauncher.tsx    # Action-Buttons (Floating Dock)
    AgentJobPanel.tsx    # Live-Log-Stream (SSE, role=log aria-live)
    VoiceBar.tsx         # Push-to-Talk + Wake-Word-Status + Waveform
    SecondBrainSearch.tsx
  lib/
    api.ts               # fetch-Wrapper gegen Backend (BACKEND_URL)
    useAgentStream.ts    # EventSource-Hook
    types.ts             # GETEILTE Typen (siehe Contract unten) — Single Source of Truth

scripts/
  voice/                 # Start-Skripte: faster-whisper-Server, piper-Server, wakeword-daemon
  memory_extractor.py    # Stop-Hook → Obsidian-Vault (AI-SESSIONS)

vault-template/          # Obsidian Second-Brain-Blaupause (Ordner, Templates, INDEX.md)
```

## Ports (lokal)

- Backend (Express + WS): `http://127.0.0.1:4317`
- Frontend (Next.js dev): `http://127.0.0.1:3017`
- faster-whisper STT-Server: `http://127.0.0.1:5301`
- Piper TTS-Server: `http://127.0.0.1:5302`

Alle binden auf `127.0.0.1` — niemals `0.0.0.0`. Kein öffentlicher Port.

## Kern-Datentypen (Contract)

```ts
type JobCategory = 'quick' | 'generator' | 'live';
type JobStatus   = 'queued' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled';

interface LogEntry { ts: string; level: 'info'|'tool'|'warn'|'error'; message: string; }

interface Job {
  id: string;                 // uuid
  actionId: string;           // z.B. "A05"
  label: string;              // "Google-Ads-Sprint starten"
  category: JobCategory;
  status: JobStatus;
  args: Record<string, unknown>;
  logs: LogEntry[];
  result?: unknown;           // strukturiertes Ergebnis (z.B. Kampagnen-Draft)
  error?: string;
  costUsd?: number;
  sessionId?: string;         // Claude-Session (für Resume)
  requiresApproval: boolean;  // true bei category 'live' (und gen. mit Side-Effect)
  approved?: boolean;
  createdAt: string; startedAt?: string; completedAt?: string;
}

// GET /api/cockpit/summary
interface CockpitSummary {
  generatedAt: string;
  kpis: {
    revenueToday: number; revenueMonth: number; revenuePrevMonth: number;
    salesToday: number; salesMonth: number; mrr: number; aboEnabled: boolean;
    aov: number; cac: number | null; cacCeiling: 177; roas: number | null;
    convRate: number | null;
  };
  health: { ok: boolean; stripe: boolean; live: boolean; mailer: boolean; checkedAt: string };
  packageSplit: { pkg: string; count: number; revenue: number }[];
  recentOrders: { domain: string; pkg: string; amount: number; status: string; ts: string }[];
  ads: { source: 'google'|'bing'; spendToday: number; spendMonth: number; clicks: number; impressions: number; conversions: number; roas: number|null; campaigns: { name: string; status: string; budget: number; spend: number }[] }[];
  funnel: { stage: string; count: number }[];     // Scan→Teaser→Checkout→Kauf
  uptime: { pct7d: number|null; pct30d: number|null };
  deploy: { status: string; sha?: string; at?: string };
  budget: { adsSpentMonth: number; adsBudgetMonth: number };
}
```

## REST-Contract

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/health` | Cockpit-eigener Health `{ok:true}` |
| GET | `/api/cockpit/summary` | aggregierter KPI-Snapshot (aus Cache) → `CockpitSummary` |
| GET | `/api/cockpit/panels/:id` | optionale Detaildaten je Panel |
| GET | `/api/actions` | Liste aller Aktionen (`registry.js`, ohne prompt-builder) |
| POST | `/api/actions/:actionId/launch` | Body `{args}` → `{ jobId }`. Startet Job in Queue. |
| GET | `/api/jobs` | letzte Jobs (Liste) |
| GET | `/api/jobs/:id` | Einzel-Job → `Job` |
| GET | `/api/jobs/:id/stream` | **SSE**: Events `{type:'log'|'status'|'result'|'approval_required', data}` |
| POST | `/api/jobs/:id/approve` | Live-Aktion freigeben → setzt approved, fährt fort |
| POST | `/api/jobs/:id/cancel` | Job abbrechen |
| POST | `/api/voice/intent` | Body `{text}` → `{actionId, args, needsConfirmation, jobId?}` |
| WS | `/ws/voice` | Audio-Frames (PCM) ⇄ Transkript/Status/TTS-Audio |

**SSE-Event-Format:** Jede Nachricht `data: <json>\n\n` mit `{type, data}`. `type:'status'` enthält `{status}`, `type:'log'` enthält `LogEntry`, `type:'result'` enthält `{result, costUsd}`, `type:'approval_required'` enthält `{summary, sideEffects}`.

## Persistenz (tatsächliche Implementierung)

Keine SQLite-Datenbank. Persistenz erfolgt über drei JSONL/JSON-Dateien unter `cockpit/out/`:

| Datei | Inhalt | Schreiber |
|---|---|---|
| `out/cockpit-jobs.jsonl` | Job-Zusammenfassungen (id, actionId, status, costUsd, ts) | `jobQueue.js` → `persist()` |
| `out/cockpit-actions.jsonl` | Audit-Trail (append-only, Rotation bei 5 MB) | `auditLog.js` → `appendAudit()` |
| `out/kpi-cache.json` | Aggregierter KPI-Snapshot (TTL: 60 s) | `connectors/index.js` → `refreshSummary()` |

Die In-Process-Job-Map (`jobQueue.js`) hält den Laufzeit-State im Arbeitsspeicher. Beim Neustart des Cockpit-Prozesses gehen laufende Jobs verloren (Designentscheidung für lokalen Betrieb). Ein BullMQ-Upgrade würde diese Grenze aufheben (API-kompatibel).

## Engine-Schnittstelle (`engine/claude.js`)

```ts
runAgent(opts: {
  prompt: string;
  agent?: string;            // ADVISORY — wird NICHT als CLI-Flag übergeben.
                             // Nur Hinweis für Logging/Dokumentation; Delegation erfolgt
                             // ausschließlich über den DELEGATE()-Prompt-Text in registry.js,
                             // der Claude anweist, das Task-Tool zu verwenden.
                             // Kein --agents / --subagent_type wird gesetzt.
  allowedTools?: string[];   // Wird gegen interne Whitelist gefiltert (R-03)
  maxTurns?: number;
  cwd?: string;
  onEvent: (e: { type:'log'|'status'|'result'; data: any }) => void;
}): Promise<{ result: string; costUsd?: number; sessionId?: string }>
```
Implementierung lokal: spawnt `claude -p` mit `--output-format stream-json --verbose`, parst NDJSON, mappt `assistant`/`tool_use`/`result`-Events auf `onEvent`. Keine API-Keys im Code.

## Action-Registry-Form (`actions/registry.js`)

```ts
interface ActionDef {
  id: string;                 // "A05"
  label: string;
  category: JobCategory;
  description: string;
  agent?: string;             // welcher .claude-Agent
  allowedTools?: string[];
  buildPrompt: (args) => string;
  requiresApproval: boolean;
  guardrails?: string[];      // z.B. ['budget-cap','legal-words']
}
export const ACTIONS: Record<string, ActionDef>;
```

## Governance (`actions/guardrails.js`) — Pflicht vor jeder Ausführung

1. **Blacklist-Gate:** Cold-Mail, LinkedIn/Xing-DM, „BFSG-konform/rechtssicher/garantiert", TÜV-Siegel, Schleichwerbung, Ads >100 €/Tag, Refund >500 € → harter Abbruch.
2. **Formulation-Guard:** generierte Texte durch `legal-copy-grep`-Regex → PASS/WARN/FAIL (FAIL sichtbar markieren, nicht still ändern).
3. **Approval:** `category:'live'` → `awaiting_approval`, erst nach `/approve` weiter.
4. **Audit-Log:** jeder Job → `out/cockpit-actions.jsonl` (append-only).
5. **Channel-Whitelist:** nur erlaubte Outbound-Kanäle (Google/Bing Ads, SEO, openPR/inar/firmenpresse, Listings, Brevo Double-Opt-In, Show HN, Awesome-PRs).

## 14 Panels (Frontend)

Tageskasse · Monats-Performance · Paket-Split · Letzte Bestellungen · Google-Ads-Performance · Kampagnen-Übersicht · Budget-Ampel · Scan-Funnel · Health-Status · Uptime-History · Deploy-Status · Unit-Economics · Ads-Burn-Rate · **Neue Kampagne erstellen**.

## A11y-Pflicht (Dogfooding)

Text-Kontrast ≥ 4,5:1; Glassmorphism nur mit Solid-Overlay hinter Text; `prefers-reduced-transparency` + `prefers-reduced-motion` respektieren; alle Buttons `aria-label` + Tastatur; Log `role="log" aria-live="polite"`; Voice immer mit Tastatur-Alternative. axe-core-Gate.
