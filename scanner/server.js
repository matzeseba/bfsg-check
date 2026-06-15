#!/usr/bin/env node
// Minimaler HTTP-Server fuer den kostenlosen Teaser-Scan der Landingpage.
// Kein zusaetzliches Framework noetig. Start: node server.js  (Port 8080)
// Endpoints:
//   GET /api/scan?url=...   -> Teaser-JSON (Score + Anzahl Probleme)
//   GET /                   -> liefert ../landingpage/index.html
//
// Hinweis Produktion: Rate-Limiting + Caching + Warteschlange ergaenzen,
// da jeder Scan einen Headless-Browser startet (CPU/Zeit-intensiv).

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanUrl } from './lib/scan.js';
import { renderTeaser } from './lib/report.js';
import { assertPublicHttpUrl } from './lib/url-guard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

// Sehr einfacher In-Memory-Cache (5 Min), damit gleiche URL nicht doppelt scannt.
const cache = new Map();
const TTL = 5 * 60 * 1000;

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);

  if (u.pathname === '/api/scan') {
    let target = u.searchParams.get('url');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!target) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Parameter url fehlt' }));
    }
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    try {
      await assertPublicHttpUrl(target); // SSRF-Schutz
    } catch (e) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'URL nicht erlaubt: ' + e.message }));
    }
    try {
      const cached = cache.get(target);
      if (cached && Date.now() - cached.t < TTL) {
        return res.end(JSON.stringify(cached.data));
      }
      const scan = await scanUrl(target, { timeout: 30000 });
      const teaser = renderTeaser(scan);
      cache.set(target, { t: Date.now(), data: teaser });
      return res.end(JSON.stringify(teaser));
    } catch (err) {
      res.statusCode = 502;
      return res.end(JSON.stringify({ error: 'Scan fehlgeschlagen', detail: err.message }));
    }
  }

  if (u.pathname === '/' || u.pathname === '/index.html') {
    try {
      const html = await readFile(path.join(__dirname, '..', 'landingpage', 'index.html'));
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(html);
    } catch {
      res.statusCode = 404;
      return res.end('Landingpage nicht gefunden');
    }
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`BFSG-Audit-Server laeuft auf http://localhost:${PORT}`);
  console.log(`Teaser-API: http://localhost:${PORT}/api/scan?url=example.de`);
});
