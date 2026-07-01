// Dünner Wrapper um das Anthropic-SDK für den KI-Report-QA-Agenten (PR4).
//
// Design-Prinzipien:
// - KILL-SWITCH: REPORT_QA_ENABLED (Default false). Ohne Flag + Key ist die
//   QA komplett inaktiv (dormant) — nichts am verkauften Report ändert sich.
// - KEIN Top-Level-`import ... from '@anthropic-ai/sdk'`: das SDK wird LAZY per
//   dynamischem Import geladen, erst wenn tatsächlich ein Client gebaut wird.
//   → dieses Modul (und alle Importeure wie fulfill.js) laden auch dann, wenn
//     das Paket (noch) nicht installiert ist. Fail-safe by design.
// - Strukturierte Ausgabe über einen STRICT-Tool-Call (`strict:true`) mit
//   erzwungenem `tool_choice` → validierte JSON-Struktur statt Freitext-Parsing.
// - Streaming (`messages.stream` + `finalMessage()`): der QA-Output kann groß
//   werden; Streaming vermeidet HTTP-Timeouts.
// - KEIN `budget_tokens`, KEIN Assistant-Prefill (beides bricht auf 4.x → 400).
//
// Modell konfigurierbar via REPORT_QA_MODEL (Default `claude-sonnet-4-6` =
// Kosten/Qualität; `claude-opus-4-8` optional für maximale Qualität).

const REPORT_QA_MODEL = process.env.REPORT_QA_MODEL || 'claude-sonnet-4-6';
// Timeout in ms (SDK-Konvention Node/TS = Millisekunden). Default 90s.
const QA_TIMEOUT_MS = Math.max(10_000, Number(process.env.REPORT_QA_TIMEOUT_MS) || 90_000);
const QA_MAX_TOKENS = Math.max(1024, Number(process.env.REPORT_QA_MAX_TOKENS) || 8000);

// Kill-Switch + Key-Check. Nur wenn beides gesetzt ist, läuft die QA.
export function anthropicQaEnabled(env = process.env) {
  return env.REPORT_QA_ENABLED === 'true' && !!env.ANTHROPIC_API_KEY;
}

export function reportQaModel(env = process.env) {
  return env.REPORT_QA_MODEL || REPORT_QA_MODEL;
}

// Baut den echten SDK-Client. Lazy import → keine harte Import-Zeit-Dependency.
async function createClient() {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: QA_TIMEOUT_MS,
    maxRetries: 1 // ein Retry reicht; QA ist strikt fail-open (Fehler → null)
  });
}

// Ruft das LLM mit erzwungenem strict-Tool-Call auf und gibt das validierte
// Tool-Input-Objekt zurück. `deps.client`/`deps.model` sind injizierbar (Tests).
// Rückgabe: { refused:boolean, data:object|null }.
//   - refused=true  → das Modell hat abgelehnt (stop_reason 'refusal') → fail-open
//   - data=null     → kein Tool-Call im Ergebnis → fail-open
// Wirft bei Netzwerk-/Timeout-/API-Fehlern (Aufrufer kapselt in try/catch).
export async function callReportQa({ system, user, toolName, toolSchema, maxTokens = QA_MAX_TOKENS }, deps = {}) {
  const client = deps.client || await createClient();
  const model = deps.model || reportQaModel();

  const tool = {
    name: toolName,
    description: 'Gib das QA-Ergebnis strukturiert über dieses Werkzeug zurück.',
    input_schema: toolSchema,
    strict: true
  };

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system,
    tools: [tool],
    // Erzwingt genau diesen Tool-Call → deterministisch strukturierte Ausgabe.
    tool_choice: { type: 'tool', name: toolName },
    messages: [{ role: 'user', content: user }]
  });

  const final = await stream.finalMessage();

  // Refusal MUSS vor dem Lesen von content geprüft werden (fail-open).
  if (final && final.stop_reason === 'refusal') {
    return { refused: true, data: null };
  }
  const block = (final?.content || []).find((b) => b && b.type === 'tool_use' && b.name === toolName);
  return { refused: false, data: block ? block.input : null };
}
