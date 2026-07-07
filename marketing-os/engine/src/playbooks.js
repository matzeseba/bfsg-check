// Liest Playbooks aus marketing-os/playbooks/*.json (von Team B geliefert).
// Defensiv: fehlendes Verzeichnis oder kaputte Dateien => werden übersprungen,
// niemals ein Crash (Team B baut parallel).
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathExists } from './util.js';

export function createPlaybookRepo(cfg) {
  async function all() {
    if (!(await pathExists(cfg.playbooksDir))) return [];
    let entries;
    try {
      entries = await fs.readdir(cfg.playbooksDir);
    } catch {
      return [];
    }
    const out = [];
    for (const f of entries) {
      if (!f.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(path.join(cfg.playbooksDir, f), 'utf8');
        const pb = JSON.parse(raw);
        if (pb && pb.id) out.push(pb);
      } catch {
        // ungültiges Playbook ignorieren
      }
    }
    return out;
  }

  async function byId(id) {
    const list = await all();
    return list.find((p) => p.id === id) || null;
  }

  return { all, byId };
}
