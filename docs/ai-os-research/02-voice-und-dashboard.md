# Recherche-Bericht 02: Sprachsteuerung & Jarvis-Cockpit-UI

**Recherche-Agent #2 — Stand: Juni 2026**
**Projekt:** BFSG-Check / bfsg-fix.de — Jarvis Business-Cockpit

---

## Executive Summary (5 Bullets)

- **Voice-Stack für Deutsch:** Der produktionsreife Offline-Stack 2026 ist `openWakeWord` (Wake-Word) + `faster-whisper large-v3` (STT, ~7,4 % WER auf Deutsch) + `Piper TTS` mit Thorsten-Stimme (TTS, RTF 0,008, CPU-only). Kokoro hat **kein offizielles Deutsch** — nur Community-Finetuning. Für höhere Qualität ohne Datenschutzbedenken: Deepgram Nova-3 (10,5 % WER DE, ~150 ms).
- **Voice-Bridge zu Claude Code:** Zwei bewährte Architekturpfade existieren: (a) MCP-Server `voicemode` (Python, OpenAI-API-kompatibel, `uvx voice-mode`) oder (b) Browser-basiertes MCP `mcp-voice-hooks` (Web Speech API, kein API-Key, TypeScript). Beide integrieren sich nativ in Claude Code als MCP-Server — gesprochene Befehle werden zu strukturierten Agent-Aufrufen.
- **Voice-Frameworks 2026:** Pipecat v1.4 (Daily, Python, Claude-Support bestätigt, 20+ STT/40+ TTS-Backends) und LiveKit Agents v1.6 (Go/Python, native MCP-Tool-Integration, sub-500-ms-Latenz-Budget, Claude Haiku/Sonnet bestätigt) sind die produktionsreifen Open-Source-Optionen. Vapi/Retell nur für Prototypen (<10k Minuten/Monat).
- **Dashboard-Stack:** Integration in `admin-next/` (Next.js + Tailwind v4 + shadcn) ist der richtige Weg — kein neues App-Repo. Tremor (Recharts-basiert, Tailwind v4 kompatibel, 300+ Blöcke) für Charts, SSE via Next.js App Router Route Handlers für Agenten-Echtzeit-Streaming.
- **Jarvis-Ästhetik + Accessibility:** Hybrid-Ansatz (2026 Best Practice): Dark-Base `#0a0a0f` + glassmorphism selektiv auf Karten (nicht hinter Text), Aceternity UI / Magic UI für Spotlight/Glare/Moving-Border-Animationen, Framer Motion für HUD-Transitions — aber immer 4,5:1 Kontrast-Ratio auf Textelementen und `prefers-reduced-transparency` respektieren (Pflicht für ein A11y-Produkt).

---

## Teil A — Sprachsteuerung

### Voice-Stack-Empfehlung (Deutsch)

#### Tabelle: Komponenten-Vergleich

| Schicht | Option | Deutsch-Qualität | Latenz | Kosten | Lokal/Cloud | Empfehlung |
|---|---|---|---|---|---|---|
| **Wake-Word** | openWakeWord | Trainierbar (synthetisch + eigene Stimme, 20–50 Samples) | ~10–30 ms | Kostenlos, MIT | Lokal | ✅ **Empfohlen** |
| **Wake-Word** | Porcupine (Picovoice) | 29 vorgefertigte Wörter inkl. Deutsch, hohe Präzision | ~5 ms | Gratis-Tier (personal) | Lokal | ✅ Gut für "Hey Jarvis" |
| **Wake-Word** | Snowboy | Veraltet, nicht mehr gepflegt | — | — | Lokal | ❌ Nicht mehr verwenden |
| **STT** | faster-whisper large-v3 | ~7,4 % WER DE (Mischbenchmark), exzellent | RTX 3060: 1–2 s; CPU: 3–5 s | Kostenlos, LGPL | Lokal | ✅ **Empfohlen (lokal)** |
| **STT** | whisper.cpp | ~gleich wie faster-whisper, besser für Apple Silicon | Ähnlich, Single-Binary | Kostenlos, MIT | Lokal | ✅ Für CPU-only Server |
| **STT** | Deepgram Nova-3 | 10,5 % WER DE (Production), ~150 ms Finallatenz | ~150 ms | ~0,0059 $/min | Cloud | ✅ **Empfohlen (Cloud)** |
| **STT** | OpenAI Whisper API | 19,9 % WER DE (Production), deutlich schlechter | 300–800 ms | ~0,006 $/min | Cloud | ⚠️ Schlechteste DE-Qualität |
| **STT** | Web Speech API | Browserabhängig, Google-Backend, keine Kontrolle | <500 ms | Kostenlos | Cloud | ⚠️ Nur für Prototypen |
| **TTS** | Piper (Thorsten-Stimme) | Gut für Deutsch, emotionale Varianten verfügbar | RTF 0,008 (Echtzeit CPU) | Kostenlos, MIT | Lokal | ✅ **Empfohlen (lokal)** |
| **TTS** | Kokoro-82M | Kein offizielles Deutsch; Community-Finetuning `kikiri-german-martin` vorhanden | RTF 0,03, <1 GB VRAM | Kostenlos (Apache 2.0) | Lokal | ⚠️ Experimentell für DE |
| **TTS** | ElevenLabs v3 | Exzellent, Elo 1542 (Benchmark Mai 2026) | ~200–400 ms | $0,11/1.000 Zeichen | Cloud | ✅ Beste Qualität, kein Budget |
| **TTS** | Cartesia Sonic-3 | Sehr gut, ~100 ms First Audio | ~100 ms TTFA | ~0,065 $/1.000 Zeichen | Cloud | ✅ Beste Latenz Cloud |
| **TTS** | OpenAI TTS-1 | Mittelgut Deutsch | ~200–500 ms | $0,015/1.000 Zeichen | Cloud | ⚠️ Preis/Leistung mäßig |

#### Konkrete Empfehlung für BFSG-Check (Solo-Budget, Deutsch, Privacy)

**Phase 1 — Lokal + kostenlos (sofort):**
```
Wake-Word: openWakeWord (custom "Hey Jarvis" trainiert mit eigener Stimme)
STT:       faster-whisper large-v3 INT8 (GPU auf Hetzner CPX22 nicht vorhanden → small/medium für CPU)
TTS:       Piper TTS, Stimme: de_DE-thorsten-high
```

**Phase 2 — Hybrid (wenn Latenz stört):**
```
STT:  Deepgram Nova-3 (150 ms, bestes DE-WER Cloud)
TTS:  Cartesia Sonic-3 (100 ms TTFA) oder ElevenLabs Turbo v2.5 (DE-Support)
Wake: openWakeWord bleibt lokal
```

**Wichtig für Hetzner CPX22 (2 vCPU, 4 GB RAM):**
- faster-whisper `small` (244 MB) schafft ~3–5 s RTF auf CPU — akzeptabel für Push-to-Talk
- `large-v3` auf CPU wäre 30–60 s — unbrauchbar ohne GPU
- Alternative: whisper.cpp mit GGML-Quantisierung (`ggml-medium.bin`) — Single-Binary, kein Python

---

### Voice-Bridge-Architektur (Voice → Claude Code → Action → Voice)

#### Variante A: MCP-Server `voicemode` (empfohlen für sofortigen Start)

```
[Mikrofon]
    │
    ▼
[VoiceMode MCP Server]  ← uvx voice-mode (Python)
    │  OpenAI-kompatibles STT (Whisper API oder lokal)
    ▼
[Transkript-Text]
    │
    ▼
[Claude Code CLI]  ← MCP-Protokoll
    │  Intent-Parsing → Agent/Skill-Auswahl
    │  z.B. "Erstelle eine Werbekampagne" → /carousel oder Agency-Agent marketing-*
    ▼
[Antwort-Text]
    │
    ▼
[VoiceMode MCP Server]  → TTS (OpenAI TTS oder lokal)
    │
    ▼
[Lautsprecher]
```

**Installation:**
```bash
claude mcp add --scope user voicemode -- uvx --refresh voice-mode
# Optional: lokal statt OpenAI
export VOICEMODE_STT_BASE_URL=http://localhost:8000  # faster-whisper Server
export VOICEMODE_TTS_BASE_URL=http://localhost:5500  # Piper HTTP-Server
```

**Kosten:** ~$0,006/min rein STT (OpenAI), oder $0 lokal. Ein Tag Sprach-Coding < $1.

#### Variante B: Browser-basiert `mcp-voice-hooks` (kein API-Key, macOS/Chrome)

```
[Browser Tab localhost:5111]
    │  Web Speech API (Chrome/Safari, Client-Side)
    ▼
[mcp-voice-hooks MCP Server]  ← TypeScript, Port 5111
    │  Claude Code Hooks-Integration
    ▼
[Claude Code]
    │
    ▼
[Browser TTS]  ← System-Stimmen (macOS: Siri-Qualität downloadbar)
```

**Einschränkung:** Funktioniert nicht mit Background-Agenten (Agent-Tool-Ergebnisse kommen nicht zurück). Für BFSG-Check-Cockpit (Windows Server / Hetzner) weniger geeignet, da macOS-abhängig.

#### Variante C: Jarvis-Cockpit-eigene Voice-Bridge (für Dashboard-Integration)

Für das Jarvis-Cockpit im Browser (`admin-next/`) ist ein **eigener kleiner WebSocket-Bridge-Dienst** die sauberste Lösung:

```
[Cockpit-Browser]
    │  1. Push-to-Talk (Spacebar) → MediaRecorder API → PCM-Audio-Blob
    ▼
[WebSocket Bridge /api/voice]  ← Next.js API Route oder kleiner Node-Dienst
    │  2. Audio → faster-whisper HTTP (lokal) oder Deepgram WebSocket
    ▼
[Transkript]
    │  3. Intent-Mapping → Claude Code Agent-SDK (subagent_type)
    ▼
[Agenten-Ergebnis als SSE]  → Dashboard-UI (Streaming-Anzeige)
    │  4. Antworttext → Piper HTTP → Audio-Blob
    ▼
[Browser AudioContext.play()]
```

**Push-to-Talk vs. Wake-Word im Browser:**
- **Push-to-Talk** (Spacebar halten): deutlich zuverlässiger, keine Fehlauslösungen, kein Always-On-Mikrofon, deutlich A11y-freundlicher → **für Business-Dashboard empfohlen**
- Wake-Word im Browser: erfordert TensorFlow.js / ONNX Runtime Web für openWakeWord — möglich aber 50–200 ms zusätzlicher JS-Overhead und komplexere Datenschutz-Kommunikation

---

### Fertige Voice-Frameworks 2026

| Framework | URL | Sprache | Version (Juni 2026) | Claude-Support | DE-Qualität | Eignung Jarvis |
|---|---|---|---|---|---|---|
| **Pipecat** | [github.com/pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat) | Python | v1.4.0 (17.06.2026) | ✅ Anthropic bestätigt, `.claude-plugin` | Über STT/TTS-Plugin wählbar | ✅✅ Sehr gut, 20+ STT / 40+ TTS |
| **LiveKit Agents** | [github.com/livekit/agents](https://github.com/livekit/agents) | Python/Go | v1.6.2 (19.06.2026) | ✅ Claude Haiku/Sonnet bestätigt | DE tier-1 ("mature ASR+TTS") | ✅✅ Beste Produktionsreife |
| **VoiceMode MCP** | [voicemode (PyPI/uvx)](https://pypi.org/project/voice-mode/) | Python | aktuell | ✅ Nativ Claude Code | Via OpenAI-kompatiblem Backend | ✅ Sofort einsetzbar |
| **mcp-voice-hooks** | [github.com/johnmatthewtennant/mcp-voice-hooks](https://github.com/johnmatthewtennant/mcp-voice-hooks) | TypeScript | früh | ✅ Nativ Claude Code | Web Speech API | ⚠️ macOS, kein Agent-Callback |
| **Vapi** | [vapi.ai](https://vapi.ai) | SaaS | — | ✅ Via Anthropic API | Gut | ⚠️ Nur Prototyp, Black-Box |
| **Retell AI** | [retellai.com](https://www.retellai.com) | SaaS | — | ✅ | Gut | ⚠️ Wie Vapi |
| **TEN Framework** | [github.com/TEN-framework](https://github.com/TEN-framework) | C++/Python | 2025 | Über Adapter | Teilweise | ⚠️ Komplex, wenig Community |

#### Detailbewertung der Top-3:

**Pipecat v1.4 (Daily)**
- Frame-basierte Pipeline: Transport → VAD → STT → LLM → TTS → Transport
- Automatisches Interruption-Handling (VAD unterbricht TTS)
- Multi-Agent-Komposition: Fan-out, Sidecar-Workers, Handoff
- Claude Code Skills im Repo (`.claude/skills/`) → direkt scaffoldbar
- Für BFSG-Check: als lokaler Python-Daemon, STT=faster-whisper, LLM=Claude, TTS=Piper

**LiveKit Agents v1.6 (Agentkit-Fokus)**
- Concurrent 4-Layer-Pipeline: VAD + ASR + LLM + TTS gleichzeitig → sub-500 ms
- Latenz-Budget: VAD 80ms + ASR 120ms + LLM 180ms + TTS 70ms = 450ms p50
- Native MCP-Tool-Integration (1-Zeile-Integration)
- Semantic Turn Detection (Transformer-basiert, reduziert Fehlunterbrechungen)
- Empfohlener Stack 2026: Deepgram Nova-3 + Claude Haiku + Cartesia Sonic-3

**VoiceMode MCP (pragmatisch für Claude Code)**
- Direkt in Claude Code einbindbar (`claude mcp add`)
- Unterstützt jeden OpenAI-kompatiblen STT/TTS-Endpoint → lokal austauschbar
- Kosten < $1/Tag bei voller Nutzung
- Einschränkung: kein Wake-Word, Push-to-Talk über `/voice`-Command

---

## Teil B — Dashboard & Cockpit-UI

### Dashboard-Stack-Empfehlung

#### Entscheidung: In `admin-next/` integrieren, kein neues Repo

**Begründung:**
- Bestehende Next.js + Tailwind v4 + shadcn-Basis ist bereits produktionsreif
- Kein zusätzlicher Deployment-Overhead (Docker-Compose-Eintrag)
- shadcn/ui Chart-Primitives (Recharts-basiert) integrieren automatisch mit dem Theming-System
- Tailwind v4 und shadcn sind seit Q1 2025 vollständig kompatibel

#### Stack-Komponenten

| Kategorie | Empfehlung | Alternative | Begründung |
|---|---|---|---|
| **Charts/KPIs** | Tremor v3 (Recharts-Basis, 300+ Blöcke) | shadcn Chart Primitives | Tremor: vollständige Dashboard-Komponenten; shadcn Charts: minimaler, mehr Kontrolle |
| **Real-Time** | SSE via Next.js App Router Route Handlers | Socket.io / ws | SSE ist unidirektional (Server → Client), reicht für 95 % der Dashboard-Cases; simpler als WebSocket |
| **Animationen** | Framer Motion | GSAP | Framer Motion: React-native, SSR-safe, Layout-Animationen out-of-the-box |
| **Glassmorphism-Komponenten** | Aceternity UI + Magic UI (copy-paste, shadcn-kompatibel) | motion-primitives | Alle drei sind MIT, copy-paste-ready für Next.js/Tailwind |
| **Voice-Visualisierung** | Custom Canvas/WebAudio API | react-audio-visualize | Lissajous-Wellen / Frequenzbalken als HUD-Element |
| **Terminal/Log-Stream** | `xterm.js` oder Custom `<pre>`-SSE-Stream | react-terminal-ui | xterm.js: vollständiges Terminal-Emulator-Widget; Custom: leichter für reine Log-Anzeige |

#### Real-Time Architektur (SSE in Next.js App Router)

```typescript
// app/api/agent-stream/route.ts
export async function GET(req: Request) {
  const agentId = new URL(req.url).searchParams.get('agentId');
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Agent-Job-Updates aus Redis/In-Memory-Queue pollen
      const interval = setInterval(async () => {
        const update = await getAgentUpdate(agentId);
        if (update) {
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify(update)}\n\n`
          ));
        }
        if (update?.status === 'completed') {
          clearInterval(interval);
          controller.close();
        }
      }, 100);
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

```typescript
// Cockpit-Komponente
const useAgentStream = (agentId: string) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'idle'|'running'|'completed'|'error'>('idle');
  
  useEffect(() => {
    if (!agentId) return;
    const es = new EventSource(`/api/agent-stream?agentId=${agentId}`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLogs(prev => [...prev, data]);
      setStatus(data.status);
    };
    return () => es.close();
  }, [agentId]);
  
  return { logs, status };
};
```

---

### Jarvis-Ästhetik (konkret + accessible)

#### Design-Sprache

**Farbpalette (HUD-Dark + A11y-safe):**
```css
/* CSS Custom Properties — Jarvis-Cockpit-Theme */
--bg-base: #0a0a0f;          /* Fast-Schwarz, kein reines #000 (Eye-Strain) */
--bg-panel: #0d1117;         /* Panel-Hintergrund */
--glass-bg: rgba(13, 17, 23, 0.7);  /* Glassmorphism-Karten */
--glass-border: rgba(0, 212, 255, 0.15); /* Cyan-Rand subtil */
--accent-primary: #00d4ff;   /* Iron-Man-Cyan / Jarvis-Blau */
--accent-secondary: #ff6b35; /* Warn-Orange (Stripe-Alerts) */
--accent-success: #00ff88;   /* Grün (Sales-Bestätigung) */
--text-primary: #e2e8f0;     /* 4.5:1+ Kontrast auf bg-base ✅ */
--text-secondary: #94a3b8;   /* 3:1+ Kontrast (large text only) */
--text-muted: #475569;       /* Nur dekorativ, kein informativer Text! */

/* Glassmorphism-Karte */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(1.8);
  -webkit-backdrop-filter: blur(12px) saturate(1.8);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  /* A11y: NIEMALS Text direkt über blurry Hintergrund ohne Overlay! */
}

/* Fallback für prefers-reduced-transparency */
@media (prefers-reduced-transparency: reduce) {
  .glass-card {
    background: #0d1117;
    backdrop-filter: none;
  }
}
```

#### Aceternity UI / Magic UI — Konkrete Komponenten für Jarvis-Cockpit

| Komponente | Bibliothek | Einsatz im Cockpit |
|---|---|---|
| **Spotlight Card** | Aceternity UI / Magic UI | Karten für Verkaufszahlen — Licht folgt dem Cursor |
| **Moving Border** | Aceternity UI | Aktiver Agent-Job — pulsierender Rand |
| **Glowing Effect** | Magic UI | Wake-Word-aktiv-Indikator |
| **Text Generate Effect** | Aceternity UI | Agenten-Antwort progressiv einblenden (wie Jarvis-Readout) |
| **Aurora Background** | Aceternity UI | Dashboard-Hintergrund-Atmosphäre (reduziert mit motion-reduce) |
| **Tracing Beam** | Aceternity UI | Scrolling-Seitenleiste — visueller Anker |
| **Floating Dock** | Aceternity UI | Agent-Launch-Leiste (wie Iron-Man HUD Icons) |
| **Terminal** | Aceternity UI | Agent-Log-Stream-Anzeige |
| **Bento Grid** | Aceternity UI | Dashboard-Haupt-Layout |
| **Magic Card** | Magic UI | Stripe-Sales-Widget mit Gradient-Hover |

**Motion Primitives** (github.com/itsjwill/motion-primitives-website) als Ergänzung: 110+ freie Komponenten (GSAP + Framer Motion + Three.js), inkl. Glassmorphism, Dock, Scroll Animations.

#### Framer Motion — HUD-Animationen

```typescript
// Scan-Line-Animation (klassisches Jarvis-Element)
const scanAnimation = {
  initial: { scaleX: 0, opacity: 0 },
  animate: { 
    scaleX: [0, 1, 1, 0], 
    opacity: [0, 0.6, 0.6, 0],
    transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
  }
};

// Agent-Aktivierung (HUD-Aufblenden)
const hudReveal = {
  initial: { opacity: 0, scale: 0.95, filter: 'blur(4px)' },
  animate: { 
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

// Daten-Aktualisierung (non-disruptive)
const dataUpdate = {
  key: value, // React key-Trick: neue Nummer → Framer Motion erkennt Wechsel
  initial: { y: -8, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 8, opacity: 0 }
};
```

#### A11y-Pflicht-Checkliste (Dogfooding!)

Da BFSG-Check ein A11y-Produkt ist, muss das eigene Cockpit WCAG 2.1 AA erfüllen:

- ✅ Alle Texte: 4,5:1 Kontrast-Ratio (messen mit `axe-core` oder `whocanuse.com`)
- ✅ Glassmorphism nur auf dekorativen Flächen, nie unter informativen Texten ohne Solid-Overlay
- ✅ `prefers-reduced-transparency`: Blur/Glassmorphism deaktivieren
- ✅ `prefers-reduced-motion`: Scan-Animationen, Aurora, Moving-Border auf `opacity` reduzieren
- ✅ Alle Action-Buttons: `aria-label` + Keyboard-navigierbar (Tab-Order)
- ✅ Voice-Steuerung: immer auch per Tastatur bedienbar (Accessibility-Fallback)
- ✅ Agent-Status-Log: `role="log" aria-live="polite"` (Screen-Reader-Kompatibilität)
- ✅ Fokus-Indikator: sichtbar, 3:1 Kontrast gegen Hintergrund
- ✅ Farb-Information: nie allein (immer Icon + Text, nicht nur Farbe für Status)

---

### Agent-Status / Logs / Action-Buttons im UI

#### Strukturvorschlag: Cockpit-Layout

```
┌─────────────────────────────────────────────────────────────┐
│  BFSG-CHECK COCKPIT          [Voice 🎙️] [Date] [Status: ●] │ ← Header
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Stripe Sales │ Website      │ Ads Budget   │ WER Score      │ ← KPI-Row
│ €1.249 MRR  │ ✅ Live      │ 20€/Tag      │ < 5% (mock)    │   (Tremor AreaChart)
├──────────────┴──────────────┴──────────────┴────────────────┤
│  AGENT LAUNCHER                                              │ ← Action-Panel
│  [▶ Weekly Review] [▶ Content-Week] [▶ SEO-Audit]          │
│  [▶ Email-Seq]     [▶ Google Ads]   [▶ New Campaign]        │
├───────────────────────────────┬─────────────────────────────┤
│  AKTIVER JOB                  │  LOG-STREAM                 │ ← Live-Panel
│  Agent: content-week          │  [14:32:01] Starte Hook-... │
│  Status: ████████░░ 80%       │  [14:32:04] Hook 1/10: "..." │
│  Laufzeit: 00:02:14           │  [14:32:08] Reel-Skript...  │
│  [⏹ Abbrechen]                │  [14:32:11] Fertig ✅       │
├───────────────────────────────┴─────────────────────────────┤
│  VOICE INPUT   ▓▓▓░░░░░░ [●●● Zuhören...]  [Push: SPACE]  │ ← Voice-Bar
└─────────────────────────────────────────────────────────────┘
```

#### Action-Button → Agent-Dispatch-Pattern

```typescript
// app/cockpit/components/AgentLauncher.tsx
'use client';

interface AgentAction {
  id: string;
  label: string;
  agentType: string;  // z.B. 'content-week', 'email-seq'
  args?: Record<string, string>;
}

export function AgentLauncher({ actions }: { actions: AgentAction[] }) {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const launchAgent = async (action: AgentAction) => {
    const res = await fetch('/api/agents/launch', {
      method: 'POST',
      body: JSON.stringify({ agentType: action.agentType, args: action.args }),
      headers: { 'Content-Type': 'application/json' }
    });
    const { jobId } = await res.json();
    setActiveJobId(jobId);  // → SSE-Stream-Komponente aufmachen
  };

  return (
    <div role="group" aria-label="Agent-Starter">
      {actions.map(action => (
        <motion.button
          key={action.id}
          onClick={() => launchAgent(action)}
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
          whileTap={{ scale: 0.98 }}
          className="glass-card px-4 py-2 text-cyan-300 border-cyan-500/30 
                     hover:border-cyan-400/60 transition-colors"
          aria-label={`Agent starten: ${action.label}`}
        >
          ▶ {action.label}
        </motion.button>
      ))}
      {activeJobId && <AgentJobPanel jobId={activeJobId} />}
    </div>
  );
}
```

#### Agenten-Log-Stream-Panel (SSE)

```typescript
// app/cockpit/components/AgentJobPanel.tsx
export function AgentJobPanel({ jobId }: { jobId: string }) {
  const { logs, status } = useAgentStream(jobId);
  
  return (
    <motion.div {...hudReveal} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <StatusDot status={status} />
        <span className="text-cyan-300 text-sm font-mono">JOB {jobId}</span>
      </div>
      
      {/* A11y: role=log + aria-live für Screen-Reader */}
      <div 
        role="log" 
        aria-live="polite" 
        aria-label="Agent-Fortschritt"
        className="h-48 overflow-y-auto font-mono text-xs text-green-400/80 
                   bg-black/40 rounded p-2 space-y-0.5"
      >
        {logs.map((entry, i) => (
          <div key={i}>
            <span className="text-slate-500">[{entry.timestamp}]</span>{' '}
            {entry.message}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
```

---

## Risiken & Gotchas

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| **faster-whisper auf CPX22-CPU zu langsam** (large-v3 > 30 s) | Hoch | Hoch | Whisper `small` oder `medium` für lokale Nutzung; Deepgram Nova-3 für Produktion |
| **Kokoro für Deutsch nicht ausgereift** | Hoch | Mittel | Piper Thorsten-Stimme verwenden; Kokoro erst bei Community-Reife wechseln |
| **Glassmorphism scheitert an Kontrast-Ratio** | Mittel | Hoch (A11y-Dogfooding!) | Solid-Overlay hinter Text-Elementen zwingend; axe-core in CI |
| **SSE-Verbindungen bei langen Jobs (>30 min) brechen ab** | Mittel | Mittel | Reconnect-Logik im EventSource-Client + Job-State in Redis persistieren |
| **Browser-Wake-Word (JS/ONNX Runtime Web) hohe CPU-Last** | Mittel | Mittel | Push-to-Talk als primäre Interaktion; Wake-Word optional deaktivierbar |
| **mcp-voice-hooks: keine Background-Agent-Callbacks** | Hoch (bereits dokumentiert) | Mittel | VoiceMode MCP nutzen; oder eigene Bridge mit Polling-Fallback |
| **Tailwind v4 Breaking Changes zu Tremor** | Niedrig | Mittel | Tremor Blocks bereits für Tailwind v4 gebaut (Stand Jan 2025) |
| **Framer Motion + `prefers-reduced-motion` vergessen** | Mittel | Hoch | `useReducedMotion()`-Hook in alle Animations-Komponenten |
| **LiveKit Agents: Wake-Word nicht eingebaut** | Hoch | Niedrig | Separater Wake-Word-Prozess (openWakeWord) → WebSocket-Signal an LiveKit-Room |
| **Piper-TTS: schlechte Zahlen/Adressen-Aussprache** | Hoch | Niedrig | TTS-Normalisierungs-Pre-Processing (Zahlen ausschreiben) |

---

## Offene Entscheidungen für den User (Matthias)

1. **STT-Budget:** Lokal (gratis, 3–5 s Latenz auf CPU) oder Deepgram Nova-3 (Cloud, ~$5–15/Monat bei normaler Nutzung, 150 ms)?
   - Empfehlung: Start lokal mit `whisper.cpp medium`, Upgrade auf Deepgram wenn Latenz nervt.

2. **TTS-Stimme:** Piper Thorsten (lokal, gratis, dezent robotisch) oder Cartesia Sonic-3/ElevenLabs (Cloud, natürlich, ~$10–30/Monat)?
   - Empfehlung: Piper für MVP; ElevenLabs für spätere Demo-Videos.

3. **Wake-Word vs. Push-to-Talk:** Wake-Word (always-on, macOS/Linux-Daemon nötig, Privacy-Trade-off) oder Spacebar-Hold (einfacher, deterministisch, A11y-freundlich)?
   - Empfehlung: Push-to-Talk für Cockpit, Wake-Word als Phase-2.

4. **Voice-Framework-Wahl:** VoiceMode MCP (sofort, kein extra Framework) oder Pipecat v1.4 (mehr Kontrolle, Python-Setup)?
   - Empfehlung: VoiceMode MCP sofort starten; Pipecat wenn mehr Pipeline-Kontrolle gebraucht.

5. **Cockpit separat oder in `admin-next/` integrieren?**
   - Entscheidung bereits klar: in `admin-next/` integrieren als `/cockpit`-Route.

6. **Echtzeit-Datenbasis für KPI-Widgets:** Stripe Webhooks → eigene DB (PostgreSQL?) oder direkte Stripe API Calls im SSE-Stream?
   - Empfehlung: Stripe-Webhook → lokale SQLite/PostgreSQL → Cockpit liest daraus. Kein Polling gegen Stripe-API (Rate-Limits).

---

## Quellen

- [Build Offline Voice Assistant 2026 — promptquorum.com](https://www.promptquorum.com/power-local-llm/build-local-voice-assistant-2026)
- [Wake Word Detection Guide 2026 — Picovoice](https://picovoice.ai/blog/complete-guide-to-wake-word/)
- [openWakeWord GitHub — dscripka](https://github.com/dscripka/openWakeWord)
- [Deepgram German Benchmarks — #1 in German STT](https://deepgram.com/learn/german-benchmarks)
- [Whisper vs Deepgram 2025 — Deepgram](https://deepgram.com/learn/whisper-vs-deepgram)
- [How Accurate Is Whisper in 2026 (WER Data) — VexaScribe](https://novascribe.ai/how-accurate-is-whisper)
- [Best Open Source STT 2026 — Northflank](https://northflank.com/blog/best-open-source-speech-to-text-stt-model-in-2026-benchmarks)
- [Piper TTS German Review — gewusst-ki.de](https://gewusst-ki.de/ki-tools/piper-tts/)
- [Kokoro vs Piper TTS 2026 — Slashdot Comparison](https://slashdot.org/software/comparison/Kokoro-TTS-vs-Piper-TTS/)
- [Kokoro TTS German Martin (Community Fine-tune) — Hugging Face](https://huggingface.co/Godelaune/Kokoro-82M-ONNX-German-Martin)
- [Best TTS Models 2026 (Elo Rankings) — CodeSOTA](https://www.codesota.com/guides/tts-models)
- [Pipecat GitHub — pipecat-ai](https://github.com/pipecat-ai/pipecat)
- [LiveKit Agents GitHub — livekit](https://github.com/livekit/agents)
- [Build and Deploy LiveKit AI Voice Agents 2026 — forasoft.com](https://www.forasoft.com/blog/article/livekit-ai-agents-guide)
- [Voice Agent Frameworks Comparison (LiveKit/Pipecat/TEN) — Medium](https://medium.com/@ggarciabernardo/realtime-ai-agents-frameworks-bb466ccb2a09)
- [Top Voice AI Agent Frameworks 2026 — Medium](https://medium.com/@mahadise0011/top-voice-ai-agent-frameworks-in-2026-a-complete-guide-for-developers-4349d49dbd2b)
- [How I Added Voice Mode to Claude Code — Medium](https://medium.com/@kumaran.isk/how-i-added-voice-mode-to-claude-code-hands-free-coding-in-5-minutes-101a5086968f)
- [mcp-voice-hooks GitHub — johnmatthewtennant](https://github.com/johnmatthewtennant/mcp-voice-hooks)
- [Voice Dictation — Claude Code Docs](https://code.claude.com/docs/en/voice-dictation)
- [Aceternity UI — Framer Motion + Tailwind Komponenten](https://ui.aceternity.com/)
- [Magic UI — 150+ Animated React Components](https://magicui.design/)
- [Motion Primitives — 110+ Free Animated Components](https://github.com/itsjwill/motion-primitives-website)
- [Tremor — Tailwind v4 Dashboard Blocks](https://blocks.tremor.so/)
- [Tremor.so — Recharts-basierte Dashboard-Bibliothek](https://www.tremor.so/)
- [Glassmorphism Meets Accessibility — Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Glassmorphism Web Design 2026 — neelnetworks.com](https://www.neelnetworks.com/blog/glassmorphism-web-design-guide-2026/)
- [SSE in Next.js 15 Real-Time Updates — damianhodgkiss.com](https://damianhodgkiss.com/tutorials/real-time-updates-sse-nextjs)
- [Streaming AI Agents via SSE — Medium](https://akanuragkumar.medium.com/streaming-ai-agents-responses-with-server-sent-events-sse-a-technical-case-study-f3ac855d0755)
- [LiveKit Voice Agents Overview — livekit.com](https://livekit.com/voice-agents)
