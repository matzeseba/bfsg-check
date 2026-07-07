// Append-only Tageslog: data/logs/YYYY-MM-DD.md
import fs from 'node:fs/promises';
import path from 'node:path';
import { ymdDash } from './util.js';

export function createLog(cfg) {
  async function event(message, meta = null) {
    const now = new Date();
    const file = path.join(cfg.logsDir, `${ymdDash(now)}.md`);
    const suffix = meta ? ` — ${JSON.stringify(meta)}` : '';
    const line = `- ${now.toISOString()} — ${message}${suffix}\n`;
    try {
      await fs.mkdir(cfg.logsDir, { recursive: true });
      await fs.appendFile(file, line, 'utf8');
    } catch {
      // Logging darf den Betrieb nie unterbrechen
    }
  }
  return { event };
}
