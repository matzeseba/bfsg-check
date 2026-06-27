// Engine: ruft die LOKALE `claude`-CLI als Child-Prozess (nutzt Abo-Auth, kein API-Key).
// Parst --output-format stream-json (NDJSON) und mappt Events auf onEvent().
//
// runAgent({ prompt, agent?, allowedTools?, maxTurns?, cwd?, signal?, onEvent }) -> { result, costUsd, sessionId }
import { spawn } from 'node:child_process';
import { config } from '../config.js';
import { log } from '../log.js';

// Whitelist erlaubter permissionMode-Werte (verhindert Injektion beliebiger CLI-Flags)
const ALLOWED_PERMISSION_MODES = new Set(['plan', 'acceptEdits', 'bypassPermissions', 'default']);

// R-03: Whitelist erlaubter Tool-Namen für --allowedTools.
// Verhindert, dass durch eine kompromittierte ActionDef oder einen manipulierten
// Request ein beliebiger String als Tool-Name an die Claude-CLI übergeben wird
// (z.B. Shell-Injection via Tool-Namen wie "Bash; rm -rf").
// Nur bekannte, in registry.js tatsächlich genutzte Tools sind erlaubt.
const ALLOWED_TOOLS = new Set([
  'Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep',
  'WebFetch', 'WebSearch', 'TodoRead', 'TodoWrite',
  'Task', 'Computer',   // Task: Sub-Agent-Delegation; Computer: Computer-Use
]);

/**
 * Filtert allowedTools gegen die Whitelist.
 * Unbekannte Einträge werden verworfen und geloggt.
 * @param {string[]|undefined} tools
 * @param {import('../log.js').log} logger
 * @returns {string[]}
 */
function filterAllowedTools(tools, logger) {
  if (!tools?.length) return [];
  const filtered = tools.filter((t) => {
    if (ALLOWED_TOOLS.has(t)) return true;
    logger.warn({ tool: t }, 'R-03: Unbekanntes Tool aus allowedTools verworfen');
    return false;
  });
  return filtered;
}

// Sichere Umgebung: leitet nur die nötigsten Variablen an den Claude-Prozess weiter.
// STRIPE_API_KEY und ähnliche Secrets werden NICHT vererbt, damit ein kompromittierter
// Prompt sie nicht per Tool-Call exfiltrieren kann.
function buildSafeEnv() {
  const allowed = ['PATH', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'TEMP', 'TMP',
    'SystemRoot', 'COMSPEC', 'NODE_ENV', 'ANTHROPIC_API_KEY', 'CLAUDE_BIN',
    'USERNAME', 'USER', 'LANG', 'LC_ALL', 'LC_CTYPE'];
  const env = {};
  for (const key of allowed) {
    if (process.env[key] !== undefined) env[key] = process.env[key];
  }
  return env;
}

export function runAgent({
  prompt,
  // M18: `agent` ist rein advisory — es wird KEIN --agents/--subagent_type-Flag an die
  // claude-CLI übergeben. Der Wert erscheint nur als Hinweis in DELEGATE()-Prompts
  // (registry.js). Delegation erfolgt ausschließlich über den DELEGATE()-Prompt-Text,
  // der Claude anweist, das Task-Tool zu verwenden. Das Setzen dieses Feldes hat
  // keinen direkten Effekt auf den CLI-Aufruf.
  agent,            // advisory: Subagenten-Name (nur für Logging/Dokumentation)
  allowedTools,
  permissionMode = 'acceptEdits',
  maxTurns = config.claudeMaxTurns,
  cwd = process.cwd(),
  signal,
  onEvent = () => {},
}) {
  return new Promise((resolve, reject) => {
    // Whitelist-Prüfung für permissionMode (verhindert Injektion unbekannter Flags)
    const safeMode = ALLOWED_PERMISSION_MODES.has(permissionMode) ? permissionMode : 'acceptEdits';
    if (safeMode !== permissionMode) {
      log.warn({ permissionMode }, 'Ungültiger permissionMode — Fallback auf acceptEdits');
    }

    // R-03: allowedTools gegen Whitelist filtern — unbekannte Tool-Namen verwerfen
    const safeTools = filterAllowedTools(allowedTools, log);

    const args = ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--max-turns', String(maxTurns)];
    if (safeTools.length) args.push('--allowedTools', safeTools.join(','));
    if (safeMode) args.push('--permission-mode', safeMode);

    let child;
    try {
      child = spawn(config.claudeBin, args, {
        cwd,
        signal,
        windowsHide: true,
        env: buildSafeEnv(),   // Nur allowlisted Vars — kein STRIPE_API_KEY, kein ADMIN_TOKEN
      });
    } catch (err) {
      reject(new Error(`Claude-CLI konnte nicht gestartet werden (${config.claudeBin}): ${err.message}`));
      return;
    }

    let sessionId;
    let costUsd;
    let resultText = '';
    let isError = false;     // true, wenn das result-Event einen echten Agent-Fehler meldet (z.B. 401-Auth)
    let stderrBuf = '';
    let buf = '';

    const handleObj = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.type === 'system' && obj.subtype === 'init') {
        sessionId = obj.session_id;
        onEvent({ type: 'status', data: { status: 'running', sessionId } });
        return;
      }
      if (obj.type === 'assistant' && obj.message?.content) {
        for (const block of obj.message.content) {
          if (block.type === 'text' && block.text?.trim()) {
            onEvent({ type: 'log', data: { ts: new Date().toISOString(), level: 'info', message: block.text.trim() } });
          } else if (block.type === 'tool_use') {
            onEvent({ type: 'log', data: { ts: new Date().toISOString(), level: 'tool', message: `→ ${block.name}` } });
          }
        }
        return;
      }
      if (obj.type === 'result') {
        costUsd = obj.total_cost_usd;
        sessionId = obj.session_id || sessionId;
        resultText = typeof obj.result === 'string' ? obj.result : JSON.stringify(obj.result ?? '');
        // Echte Agent-Fehler (Auth/401, max_turns-Abbruch o.ä.) erkennen, damit der Job
        // NICHT fälschlich als erfolgreich gilt.
        isError = obj.is_error === true || (typeof obj.subtype === 'string' && obj.subtype.startsWith('error'));
      }
    };

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try { handleObj(JSON.parse(line)); }
        catch { /* Teilzeile/Noise ignorieren */ }
      }
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (c) => { stderrBuf += c; });

    child.on('error', (err) => {
      reject(new Error(`Claude-CLI-Fehler: ${err.message}. Ist 'claude' installiert und eingeloggt?`));
    });

    child.on('close', (code) => {
      if (buf.trim()) { try { handleObj(JSON.parse(buf.trim())); } catch { /* ignore */ } }
      if (isError) {
        // Agent lief, meldete aber einen Fehler (z.B. 401 Auth) → als Fehler durchreichen,
        // damit jobQueue den Job auf 'failed' setzt statt 'completed'.
        reject(new Error(resultText || 'Claude-Agent meldete einen Fehler (is_error)'));
      } else if (code === 0 || resultText) {
        resolve({ result: resultText, costUsd, sessionId });
      } else {
        log.warn({ code, stderr: stderrBuf.slice(0, 500) }, 'claude exited non-zero');
        reject(new Error(`Claude beendet mit Code ${code}: ${stderrBuf.slice(0, 300) || 'kein stderr'}`));
      }
    });
  });
}
