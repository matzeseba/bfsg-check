# ⚡ Cache-Prompting für die festen Agency-Agenten

> **Stand:** 21.06.2026 · **Quelle:** Anthropic Prompt-Caching-Referenz + Claude-Code-Docs (doc-belegt, keine Annahmen)
> **Kurzfassung + Regeln:** `CLAUDE.md` Sektion „⚡ Cache-Prompting (FESTE REGEL)". Dieses Doc ist die Begründung + Mechanik.

---

## Warum das für uns zählt

Seit 21.06.2026 sind **217 Agency-Agenten** (`.claude/agents/agency/`) + eine umfangreiche `CLAUDE.md` dauerhaft installiert. Diese bilden zusammen einen **großen, stabilen Prompt-Prefix**. Claude Code legt diesen Prefix automatisch in den Anthropic-Prompt-Cache. Ökonomie:

| Vorgang | Kosten (relativ zu uncached Input) |
|---|---|
| Cache-**Read** (Prefix war warm) | **~0,1×** |
| Cache-**Write** 5-Min-TTL | ~1,25× |
| Cache-**Write** 1-Std-TTL | ~2,0× |
| Cache-**Miss** (Prefix neu, voll) | 1,0× (voller Preis) |

→ Ein warmer Prefix ist ~10× günstiger zu lesen als ein Miss. Bei einem großen festen Agenten-Prefix lohnt cache-bewusstes Arbeiten spürbar (Geschwindigkeit + Kosten).

---

## Wie Claude Code cached (belegt)

- **Automatisch + an by default.** Drei Layer: **System** (Kern + Tool-Defs) → **Projekt-Kontext** (CLAUDE.md, Auto-Memory, Agenten-Definitionen) → **Conversation** (Messages/Results). Render-Reihenfolge `tools → system → messages`; jede Byte-Änderung im Prefix invalidiert alles danach (Prefix-Match).
- **CLAUDE.md** lädt 1× beim Session-Start. Mid-Session-Edit ist **cache-sicher** (Cache bleibt warm), greift aber **erst nächste Session**.
- **TTL:** Default 5 Min; Claude Code wählt die TTL nach Auth-Methode. Bei **Abo** bekommt das **Haupt-Gespräch** automatisch 1h. **Subagents nutzen IMMER 5-Min-TTL** — auch bei Abo.
- **Mindest-Prefix für Caching:** modellabhängig 1024–4096 Tokens (Opus 4.8: 4096). Kürzere Prefixe cachen still nicht.
- **Max. 4 Cache-Breakpoints** pro Request (managed Claude Code, nichts manuell zu setzen).

## Subagents (= unsere Agency-Agenten)

- Jeder Subagent startet **eigenes** Gespräch mit **eigenem** System-Prompt (die Agency-Persona) + Tool-Set, **separater Cache**.
- Startet **kalt** (kein Hit im ersten Call), wärmt über **eigene** Turns auf → **5-Min-TTL**.
- Der Eltern-Cache bleibt unberührt (Subagent-Call + -Result hängen als Conversation-Layer an).
- **Folgerung:** Subagent-Prompts **vollständig vorne** geben (Persona-Pfad + ganzer Task). Tröpfchen-Nachfüttern über viele Turns zahlt jeweils 5-Min-Warmup. Zusammenhängende Folgearbeit: **denselben** Agenten via `SendMessage` weiternutzen (warm) statt neu spawnen (kalt).

---

## Was den warmen Prefix INVALIDIERT (→ voller Re-Read)

| Aktion | Effekt |
|---|---|
| **Modellwechsel** (Opus↔Sonnet) | voller Re-Read (jedes Modell eigener Cache) |
| **Effort-Level ändern** | voller Re-Read (separat gekeyt) |
| **Fast-Mode an/aus** (`/fast`) | voller Re-Read (Header Teil des Cache-Keys) |
| **MCP-Server connect/disconnect** | invalidiert, falls Tools in den Prefix laden (deferred Tools = cache-sicher) |
| **Plugin enable/disable** | invalidiert nur, wenn das Plugin MCP-Server bringt (Skills/Commands = cache-sicher) |
| **Ganzes Tool denyen** (z. B. `Bash`) | voller Re-Read (Tool fällt aus System-Prompt) |
| **Claude-Code-Upgrade mitten in Session** | voller Re-Read der ganzen History |

## Cache-SICHER (kein Re-Read)

- CLAUDE.md mitten in der Session editieren (greift erst nächste Session)
- Dateien im Repo editieren (nur File-Changed-Reminder wird angehängt)
- Subagent spawnen (hängt an Conversation-Layer)
- Skills/Commands aufrufen, `/recap`, Rewind innerhalb der TTL
- Permission-Mode wechseln (außer `opusplan` → Modellwechsel)
- `/compact` (ersetzt nur Conversation-Layer, System+Projekt bleiben)

---

## 5-Min-Fenster — praktische Folgerung

Pause > 5 Min zwischen Turns → nächster Request ist ein **Miss**: System- + Projekt-Layer (inkl. 217 Agenten) werden neu geschrieben (höhere Input-Tokens + langsamer). **Kein dokumentierter Keep-Warm-Mechanismus.** Hebel:

1. **Innerhalb des Fensters batchen** — Agency-Sprints in einer Sitzung halten, unabhängige Agenten parallel in EINER Nachricht starten.
2. **`/loop` < 5 Min** für getaktete Arbeit (hält Prefix warm).
3. **1h-Haupt-Cache** für lange Sprints mit echten Weg-Pausen (Accounts/Karte anlegen etc.):

   ```json
   // .claude/settings.json  (lokal, .claude/ ist gitignored)
   { "env": { "ENABLE_PROMPT_CACHING_1H": "1" } }
   ```

   - Hält **Haupt-Gespräch** 1h warm. **Subagents bleiben 5 Min.**
   - Trade-off: Cache-Writes 2× statt 1,25×. Greift nur bei **API-Key-Auth** (bei Abo ist 1h ohnehin automatisch → dann No-op).
   - Zurück: Zeile entfernen oder `FORCE_PROMPT_CACHING_5M=1`. Ganz aus: `DISABLE_PROMPT_CACHING=1` (+ `_HAIKU`/`_SONNET`/`_OPUS`/`_FABLE`-Varianten).
   - **Bewusst manuell** (vom User), weil es Startup-Config + Billing berührt — Claude setzt das nicht eigenmächtig (Auto-Mode-Classifier blockt das ohnehin).

---

## Verifikation (ob Caching greift)

Im API-`usage`: `cache_read_input_tokens` > 0 bei wiederholten Turns mit gleichem Prefix = Cache greift. Dauerhaft 0 → ein stiller Invalidator ist aktiv (Modellwechsel, Effort-Change, Tool-/MCP-Änderung mitten drin). `input_tokens` ist nur der **uncached Rest** — Gesamt-Prefix = `input_tokens + cache_creation_input_tokens + cache_read_input_tokens`.
