/**
 * brain.js — Second-Brain-Router (Obsidian-Vault-Suche, read-only)
 *
 * Endpunkte:
 *   GET /api/brain/search?q=SUCHBEGRIFF   — Volltext-Suche im Vault
 *   GET /api/brain/note?path=REL/PFAD.md  — Einzelne Notiz lesen (Pfad-Traversal-gesichert)
 *   GET /api/brain/recent                 — Zuletzt geänderte Notizen
 *
 * Konfiguration (ENV):
 *   VAULT_PATH   Absoluter Pfad zum Obsidian-Vault (Default: ../vault relativ zu cwd)
 *                Falls der Pfad nicht existiert: leere Ergebnisse + {configured:false}
 *
 * Sicherheit:
 *   - Pfad-Traversal: jeder angefragte Pfad wird gegen VAULT_PATH normalisiert und
 *     muss innerhalb von VAULT_PATH liegen — andernfalls 403.
 *   - Nur Markdown-Dateien (.md) werden ausgegeben.
 *   - Read-only: keine schreibenden Operationen.
 *
 * Wiring in server.js (NICHT von diesem Agenten geändert — Snippet für den User):
 *   import brainRoute from './routes/brain.js';
 *   app.use('/api/brain', brainRoute);
 */

import { Router } from 'express';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const router = Router();

// ---------------------------------------------------------------------------
// Vault-Pfad bestimmen
// ---------------------------------------------------------------------------

function getVaultPath() {
  const envPath = process.env.VAULT_PATH;
  if (envPath) return path.resolve(envPath);
  // Fallback: ../vault relativ zum cwd (nützlich für lokale Dev-Umgebungen)
  return path.resolve(process.cwd(), '..', 'vault');
}

/**
 * Sicherheits-Check: angefragter Pfad muss innerhalb vaultPath liegen.
 * Gibt den normalisierten absoluten Pfad zurück oder null bei Verletzung.
 * @param {string} vaultPath  - Normalisierter absoluter Vault-Pfad
 * @param {string} relativePart - Vom Client angefragter (relativer) Pfad
 * @returns {string|null}
 */
function safeJoin(vaultPath, relativePart) {
  if (!relativePart) return null;
  // Normalisieren: absoluten Pfad auflösen ohne vom vaultPath wegzugehen
  const resolved = path.resolve(vaultPath, relativePart);
  // Sicherstellen, dass resolved innerhalb vaultPath liegt
  if (!resolved.startsWith(vaultPath + path.sep) && resolved !== vaultPath) {
    return null; // Traversal-Versuch abgelehnt
  }
  // Nur .md-Dateien erlauben
  if (!resolved.endsWith('.md')) return null;
  return resolved;
}

// ---------------------------------------------------------------------------
// Volltext-Suche
// ---------------------------------------------------------------------------

/**
 * Suche mit ripgrep (falls verfügbar) oder stdlib-Fallback.
 * Gibt max. 30 Treffer zurück mit: path, title, excerpt, score.
 */
async function searchVault(vaultPath, query) {
  const results = [];
  if (!query || !query.trim()) return results;

  const safeQuery = query.slice(0, 200); // Länge begrenzen

  // Versuche ripgrep (schneller, empfohlen)
  try {
    const { stdout } = await execFileAsync(
      'rg',
      [
        '--json',
        '--ignore-case',
        '--max-count', '3',       // max 3 Treffer pro Datei
        '--max-depth', '6',
        '--type', 'md',
        '--', safeQuery, vaultPath,
      ],
      { timeout: 5000, maxBuffer: 1024 * 512 }
    );

    const lines = stdout.split('\n').filter(Boolean);
    const fileSeen = new Map(); // Pfad → Treffer-Anzahl

    for (const line of lines) {
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      if (obj.type !== 'match') continue;

      const filePath = obj.data?.path?.text;
      if (!filePath) continue;

      const relPath = path.relative(vaultPath, filePath).replace(/\\/g, '/');
      const lineText = obj.data?.lines?.text?.trim() ?? '';
      const lineNum = obj.data?.line_number ?? 0;

      if (!fileSeen.has(relPath)) {
        fileSeen.set(relPath, { path: relPath, excerpts: [], lineNumbers: [] });
      }
      const entry = fileSeen.get(relPath);
      if (entry.excerpts.length < 2) {
        entry.excerpts.push(lineText.slice(0, 200));
        entry.lineNumbers.push(lineNum);
      }
    }

    for (const [relPath, data] of fileSeen) {
      // Titel aus Dateiname ableiten (Frontmatter-Parse wäre teurer)
      const basename = path.basename(relPath, '.md');
      results.push({
        path: relPath,
        title: basename.replace(/^\d{8}-/, '').replace(/-/g, ' '),
        excerpt: data.excerpts.join(' … '),
        lineNumbers: data.lineNumbers,
      });
      if (results.length >= 30) break;
    }

    return results;
  } catch (rgErr) {
    // ripgrep nicht verfügbar → stdlib-Fallback
    if (rgErr.code !== 'ENOENT' && rgErr.code !== 'ENOTFOUND') {
      // echter Fehler, kein ENOENT (rg nicht installiert)
      // trotzdem Fallback versuchen
    }
  }

  // ---------------------------------------------------------------------------
  // Stdlib-Fallback: rekursive Suche (langsamer, aber zero-dep)
  // ---------------------------------------------------------------------------
  const queryLower = safeQuery.toLowerCase();

  async function walkDir(dir, depth = 0) {
    if (depth > 6 || results.length >= 30) return;
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      if (results.length >= 30) break;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Versteckte Ordner (. prefix) überspringen
        if (!entry.name.startsWith('.')) await walkDir(fullPath, depth + 1);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = await readFile(fullPath, 'utf8');
          const contentLower = content.toLowerCase();
          const idx = contentLower.indexOf(queryLower);
          if (idx !== -1) {
            const relPath = path.relative(vaultPath, fullPath).replace(/\\/g, '/');
            const start = Math.max(0, idx - 60);
            const end = Math.min(content.length, idx + 160);
            const excerpt = content.slice(start, end).replace(/\n/g, ' ').trim();
            const basename = path.basename(relPath, '.md');
            results.push({
              path: relPath,
              title: basename.replace(/^\d{8}-/, '').replace(/-/g, ' '),
              excerpt: `…${excerpt}…`,
            });
          }
        } catch { /* Datei-Lesefehler überspringen */ }
      }
    }
  }

  await walkDir(vaultPath);
  return results;
}

// ---------------------------------------------------------------------------
// Zuletzt geänderte Dateien
// ---------------------------------------------------------------------------

async function recentNotes(vaultPath, limit = 10) {
  const notes = [];

  async function walkDir(dir, depth = 0) {
    if (depth > 6) return;
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await walkDir(fullPath, depth + 1);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const s = await stat(fullPath);
          const relPath = path.relative(vaultPath, fullPath).replace(/\\/g, '/');
          const basename = path.basename(relPath, '.md');
          notes.push({
            path: relPath,
            title: basename.replace(/^\d{8}-/, '').replace(/-/g, ' '),
            modifiedAt: s.mtime.toISOString(),
          });
        } catch { /* überspringen */ }
      }
    }
  }

  await walkDir(vaultPath);
  notes.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  return notes.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Router-Endpunkte
// ---------------------------------------------------------------------------

/**
 * GET /api/brain/search?q=SUCHBEGRIFF
 *
 * Antwort:
 *   { configured: boolean, query: string, results: SearchResult[] }
 *
 * SearchResult:
 *   { path: string, title: string, excerpt: string, lineNumbers?: number[] }
 */
router.get('/search', async (req, res) => {
  const vaultPath = getVaultPath();

  if (!existsSync(vaultPath)) {
    return res.json({ configured: false, query: req.query.q ?? '', results: [] });
  }

  const query = String(req.query.q ?? '').trim();
  if (!query) {
    return res.json({ configured: true, query: '', results: [] });
  }

  try {
    const results = await searchVault(vaultPath, query);
    return res.json({ configured: true, query, results });
  } catch (err) {
    return res.status(500).json({ error: 'Suche fehlgeschlagen', detail: String(err) });
  }
});

/**
 * GET /api/brain/note?path=REL/PFAD.md
 *
 * Liest eine einzelne Notiz. Pfad muss relativ zu VAULT_PATH sein und
 * auf .md enden. Pfad-Traversal wird abgeblockt (403).
 *
 * Antwort:
 *   { configured: boolean, path: string, content: string, modifiedAt: string }
 */
router.get('/note', async (req, res) => {
  const vaultPath = getVaultPath();

  if (!existsSync(vaultPath)) {
    return res.json({ configured: false });
  }

  const relPart = String(req.query.path ?? '').trim();
  if (!relPart) {
    return res.status(400).json({ error: 'Parameter path fehlt' });
  }

  // Pfad-Traversal-Schutz
  const safePath = safeJoin(vaultPath, relPart);
  if (!safePath) {
    return res.status(403).json({ error: 'Zugriff verweigert: ungültiger Pfad' });
  }

  try {
    const s = await stat(safePath);
    if (!s.isFile()) return res.status(404).json({ error: 'Nicht gefunden' });
    const content = await readFile(safePath, 'utf8');
    return res.json({
      configured: true,
      path: relPart,
      content,
      modifiedAt: s.mtime.toISOString(),
    });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Datei nicht gefunden' });
    return res.status(500).json({ error: 'Lesefehler', detail: String(err) });
  }
});

/**
 * GET /api/brain/recent
 *
 * Zuletzt geänderte Notizen (max. 20).
 *
 * Antwort:
 *   { configured: boolean, notes: RecentNote[] }
 *
 * RecentNote:
 *   { path: string, title: string, modifiedAt: string }
 */
router.get('/recent', async (req, res) => {
  const vaultPath = getVaultPath();

  if (!existsSync(vaultPath)) {
    return res.json({ configured: false, notes: [] });
  }

  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 50);

  try {
    const notes = await recentNotes(vaultPath, limit);
    return res.json({ configured: true, notes });
  } catch (err) {
    return res.status(500).json({ error: 'Fehler beim Lesen', detail: String(err) });
  }
});

export default router;
