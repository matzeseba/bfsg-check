// Default-Executor: ruft die Claude-CLI headless auf und liefert Markdown zurück.
// MOS_DRY_RUN=1 (cfg.dryRun) => deterministischer Dummy-Markdown OHNE Prozess-Spawn.
//
// Windows-Hinweis: die Claude-CLI ist dort `claude.cmd`; .cmd/.bat brauchen unter
// Node >= 20 `shell:true`. Um die Quoting-Fallen langer, mehrzeiliger Prompts als
// Shell-Argument zu vermeiden, wird der Prompt über stdin übergeben (claude -p liest
// den Prompt aus stdin, wenn kein Prompt-Argument folgt). Faktisch identisch zu
// `claude -p "<prompt>" ...`, aber robust plattformübergreifend.
import { spawn } from 'node:child_process';

const TIMEOUT_MS = 10 * 60 * 1000; // 10 Minuten

export function dryRunArtifact(job) {
  return `# ${job.title}

_Automatisierte technische Analyse — ersetzt keine Rechtsberatung._

**Agent:** ${job.agent}
**Kanal:** ${job.channel}
**Job:** ${job.id}

Dies ist ein deterministisch erzeugtes Platzhalter-Artefakt (MOS_DRY_RUN=1) zum lokalen
Testen der Pipeline ohne echten Claude-Aufruf. Die Bewertung folgt WCAG 2.1 AA.

Preise: Basis 129 €, Profi 399 €, Cookie-Basis 39 €, Cookie-Profi 69 €,
Re-Check-Abo 24,99 €/Monat bzw. 249 €/Jahr. Domain: bfsg-fix.de, Marke BFSG-Fuchs.
`;
}

/** Extrahiert den Markdown-Text aus der `--output-format json`-Antwort der CLI. */
export function extractResult(stdout) {
  const raw = String(stdout || '').trim();
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
    // Claude-CLI JSON: { result: "..." } (oder verschachtelt)
    if (typeof parsed.result === 'string') return parsed.result;
    if (parsed.result && typeof parsed.result.text === 'string') return parsed.result.text;
    return raw;
  } catch {
    return raw; // kein JSON -> roher stdout
  }
}

function spawnClaude(prompt, cfg) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'claude.cmd' : 'claude';
    const args = [
      '-p',
      '--model', 'claude-sonnet-5',
      '--output-format', 'json',
      '--max-turns', '30',
      '--allowedTools', 'Read,Grep,Glob',
    ];

    let child;
    try {
      child = spawn(cmd, args, { cwd: cfg.repoRoot, shell: isWin, windowsHide: true });
    } catch (err) {
      reject(err);
      return;
    }

    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('claude Timeout nach 10 Minuten'));
    }, TIMEOUT_MS);

    child.stdout.on('data', (d) => { out += d.toString(); });
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.on('error', (e) => { clearTimeout(timer); reject(e); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`claude Exit-Code ${code}: ${err.slice(0, 500)}`));
        return;
      }
      resolve(extractResult(out));
    });

    // Prompt über stdin -> keine Shell-Quoting-Probleme
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

/**
 * Executor-Signatur: async ({ prompt, job, cfg }) => string (Markdown).
 * Injizierbar; der Runner ruft ihn genau so auf.
 */
export async function claudeExecutor({ prompt, job, cfg }) {
  if (cfg.dryRun) return dryRunArtifact(job);
  return spawnClaude(prompt, cfg);
}
