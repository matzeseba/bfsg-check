// LLM-Client für den KI-Report-QA-Agenten (PR4) mit Provider-Abstraktion (PR-P3a).
//
// Design-Prinzipien:
// - KILL-SWITCH: REPORT_QA_ENABLED (Default false). Ohne Flag + Key ist die
//   QA komplett inaktiv (dormant) — nichts am verkauften Report ändert sich.
// - PROVIDER-ABSTRAKTION: LLM_PROVIDER ('anthropic' | 'openai-compatible',
//   Default 'anthropic'). Der OpenAI-kompatible Pfad nutzt einen schlanken
//   HTTPS-Call auf /chat/completions via stdlib `fetch` (Node ≥20) — KEINE
//   neue Dependency. Details siehe docs/LLM-PROVIDER.md.
// - KEIN Top-Level-`import ... from '@anthropic-ai/sdk'`: das SDK wird LAZY per
//   dynamischem Import geladen, erst wenn tatsächlich ein Anthropic-Client
//   gebaut wird → dieses Modul (und alle Importeure wie fulfill.js) laden auch
//   dann, wenn das Paket (noch) nicht installiert ist. Fail-safe by design.
// - Strukturierte Ausgabe über einen STRICT-Tool-Call (`strict:true`) mit
//   erzwungenem `tool_choice` → validierte JSON-Struktur statt Freitext-Parsing.
// - Anthropic-Pfad: Streaming (`messages.stream` + `finalMessage()`), da der
//   QA-Output groß werden kann; KEIN `budget_tokens`, KEIN Assistant-Prefill.
//
// Konfiguration (Env):
// - LLM_PROVIDER   'anthropic' (Default) | 'openai-compatible'
// - LLM_API_KEY    API-Key; Fallback: ANTHROPIC_API_KEY (Rückwärtskompatibilität)
// - LLM_BASE_URL   Basis-URL für OpenAI-kompatible Endpunkte
//                  (Default 'https://api.openai.com/v1')
// - LLM_MODEL      Modellname; Fallbacks: REPORT_QA_MODEL (legacy), dann
//                  'claude-sonnet-4-6' (bisheriger Default, Kosten/Qualität).

const DEFAULT_QA_MODEL = 'claude-sonnet-4-6';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
// Timeout in ms. Default 90s (gilt für beide Provider-Pfade).
const QA_TIMEOUT_MS = Math.max(10_000, Number(process.env.REPORT_QA_TIMEOUT_MS) || 90_000);
const QA_MAX_TOKENS = Math.max(1024, Number(process.env.REPORT_QA_MAX_TOKENS) || 8000);

// Provider-Auswahl. Unbekannte Werte fallen sicher auf 'anthropic' zurück.
export function llmProvider(env = process.env) {
  const p = String(env.LLM_PROVIDER || 'anthropic').trim().toLowerCase();
  return p === 'openai-compatible' ? 'openai-compatible' : 'anthropic';
}

// API-Key: LLM_API_KEY hat Vorrang, ANTHROPIC_API_KEY bleibt als
// Rückwärtskompatibilitäts-Fallback bestehen.
export function llmApiKey(env = process.env) {
  return env.LLM_API_KEY || env.ANTHROPIC_API_KEY || '';
}

// Kill-Switch + Key-Check. Nur wenn beides gesetzt ist, läuft die QA.
// (Historischer Name; gilt provider-übergreifend für beide Pfade.)
export function anthropicQaEnabled(env = process.env) {
  return env.REPORT_QA_ENABLED === 'true' && !!llmApiKey(env);
}

// Modell: LLM_MODEL > REPORT_QA_MODEL (legacy) > Default.
export function reportQaModel(env = process.env) {
  return env.LLM_MODEL || env.REPORT_QA_MODEL || DEFAULT_QA_MODEL;
}

// Basis-URL für den OpenAI-kompatiblen Pfad (ohne trailing slashes).
export function llmBaseUrl(env = process.env) {
  return String(env.LLM_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/+$/, '');
}

// Baut den echten Anthropic-SDK-Client. Lazy import → keine harte
// Import-Zeit-Dependency.
async function createAnthropicClient() {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  return new Anthropic({
    apiKey: llmApiKey(),
    timeout: QA_TIMEOUT_MS,
    maxRetries: 1 // ein Retry reicht; QA ist strikt fail-open (Fehler → null)
  });
}

// Anthropic-Pfad: strict-Tool-Call via Streaming.
async function callAnthropic({ system, user, toolName, toolSchema, maxTokens, model }, deps) {
  const client = deps.client || await createAnthropicClient();

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

// OpenAI-kompatibler Pfad: schlanker HTTPS-Call auf /chat/completions mit
// stdlib `fetch` (Node ≥20) — bewusst KEINE neue Dependency. Funktioniert mit
// OpenAI und kompatiblen Endpunkten (z. B. vLLM, LiteLLM, Azure-Proxys).
// `deps.fetch` ist injizierbar (Tests ohne Netzwerk).
async function callOpenAiCompatible({ system, user, toolName, toolSchema, maxTokens, model }, deps) {
  const apiKey = deps.apiKey || llmApiKey();
  if (!apiKey) throw new Error('LLM_API_KEY/ANTHROPIC_API_KEY fehlt (openai-compatible)');
  const baseUrl = deps.baseUrl || llmBaseUrl();
  const fetchImpl = deps.fetch || globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('fetch nicht verfügbar (Node ≥20 erforderlich)');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QA_TIMEOUT_MS);
  try {
    const res = await fetchImpl(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        tools: [{
          type: 'function',
          function: {
            name: toolName,
            description: 'Gib das QA-Ergebnis strukturiert über dieses Werkzeug zurück.',
            parameters: toolSchema,
            strict: true
          }
        }],
        // Erzwingt genau diesen Tool-Call → strukturierte Ausgabe wie beim
        // Anthropic-Pfad. Endpunkte ohne strict-Support ignorieren das Flag.
        tool_choice: { type: 'function', function: { name: toolName } }
      }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`LLM-Endpunkt antwortete mit HTTP ${res.status}`);
    const json = await res.json();
    const msg = json?.choices?.[0]?.message;
    // OpenAI-Refusal-Feld → fail-open wie Anthropic-stop_reason 'refusal'.
    if (msg && typeof msg.refusal === 'string' && msg.refusal) {
      return { refused: true, data: null };
    }
    const call = (msg?.tool_calls || []).find((c) => c?.function?.name === toolName);
    if (!call) return { refused: false, data: null };
    let data = null;
    try { data = JSON.parse(call.function.arguments || 'null'); } catch { data = null; }
    return { refused: false, data };
  } finally {
    clearTimeout(timer);
  }
}

// Ruft das LLM mit erzwungenem strict-Tool-Call auf und gibt das validierte
// Tool-Input-Objekt zurück. Provider via LLM_PROVIDER (Default 'anthropic').
// `deps.client` (Anthropic-Shape) / `deps.fetch` / `deps.model` /
// `deps.provider` sind injizierbar (Tests). Ein injizierter `deps.client`
// erzwingt den Anthropic-Pfad (bisheriges Test-Verhalten unverändert).
// Rückgabe: { refused:boolean, data:object|null }.
//   - refused=true  → das Modell hat abgelehnt → fail-open
//   - data=null     → kein Tool-Call im Ergebnis → fail-open
// Wirft bei Netzwerk-/Timeout-/API-Fehlern (Aufrufer kapselt in try/catch).
export async function callReportQa({ system, user, toolName, toolSchema, maxTokens = QA_MAX_TOKENS }, deps = {}) {
  const model = deps.model || reportQaModel();
  const provider = deps.client ? 'anthropic' : (deps.provider || llmProvider());
  const args = { system, user, toolName, toolSchema, maxTokens, model };
  if (provider === 'openai-compatible') {
    return callOpenAiCompatible(args, deps);
  }
  return callAnthropic(args, deps);
}
