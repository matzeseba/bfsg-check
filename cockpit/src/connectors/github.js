/**
 * GitHub-Connector: Deploy-Status + Uptime-Prozente aus GitHub-Actions-Runs.
 *
 * Ohne GITHUB_TOKEN: versucht öffentlichen API-Abruf (Rate-Limit: 60 req/h).
 * Falls Repo privat oder Rate-Limit getroffen → {configured:false}.
 *
 * Uptime-Berechnung:
 *   - 7-Tage-Fenster: Runs der letzten 7d (max. 200 Runs = ca. 1.000 Min. bei 5-Min-Intervall)
 *   - 30-Tage-Fenster: separate Anfrage für ältere Runs (max. 300 Runs)
 *   - Ein Uptime-Watch-Run gilt als "DOWN", wenn conclusion === 'failure'
 *   - Uptime % = success_runs / total_completed_runs * 100
 */
import { config } from '../config.js';

// ── GitHub-API-Primitiv ────────────────────────────────────────────────────────

async function githubGet(path, params = {}) {
  const url = new URL(`https://api.github.com/${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const headers = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'bfsg-cockpit/1.0',
  };
  if (config.githubToken) {
    headers.authorization = `Bearer ${config.githubToken}`;
  }
  const res = await fetch(url.toString(), {
    headers,
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error(`GitHub auth error (${res.status}) — Token prüfen oder GITHUB_TOKEN setzen`);
  }
  if (res.status === 404) {
    throw new Error(`GitHub 404 — Repo '${config.githubRepo}' nicht gefunden oder privat`);
  }
  if (!res.ok) {
    throw new Error(`GitHub HTTP ${res.status}`);
  }
  return res.json();
}

// ── Workflow-Runs abrufen ─────────────────────────────────────────────────────

async function listWorkflowRuns(workflow, perPage, cutoffDate = null) {
  const params = { per_page: Math.min(perPage, 100) };
  if (cutoffDate) {
    params.created = `>=${cutoffDate.toISOString().slice(0, 10)}`;
  }
  const j = await githubGet(
    `repos/${config.githubRepo}/actions/workflows/${encodeURIComponent(workflow)}/runs`,
    params,
  );
  return j.workflow_runs || [];
}

// ── Uptime-Berechnung ─────────────────────────────────────────────────────────

function calcUptimePct(runs, windowDays) {
  if (!runs || runs.length === 0) return null;
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const inWindow = runs.filter((r) => new Date(r.updated_at).getTime() >= cutoff);
  // Nur abgeschlossene Runs werten
  const completed = inWindow.filter((r) => r.status === 'completed');
  if (completed.length === 0) return null;
  const successful = completed.filter((r) => r.conclusion === 'success').length;
  return Math.round((successful / completed.length) * 1000) / 10; // z.B. 99.3
}

// ── Haupt-Export ──────────────────────────────────────────────────────────────

export async function fetchGithub() {
  const hasToken = !!config.githubToken;

  try {
    // cutoff für 30-Tage-Fenster (mit etwas Puffer für Randfälle)
    const cutoff30d = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);

    const [deployRuns, uptimeRuns30d] = await Promise.all([
      listWorkflowRuns('deploy.yml', 1).catch(() => []),
      // 300 Runs: bei 5-Min-Intervall deckt das ~25 Tage ab; Puffer für 30-Tage-Ziel
      listWorkflowRuns('uptime-watch.yml', 100, cutoff30d).catch(() => []),
    ]);

    // Deploy-Status
    const d = deployRuns[0] || null;
    const deploy = d
      ? {
          status: d.conclusion || d.status || 'unbekannt',
          sha: (d.head_sha || '').slice(0, 7),
          at: d.updated_at || null,
          runUrl: d.html_url || null,
        }
      : { status: 'unbekannt', sha: null, at: null, runUrl: null };

    // Uptime
    const pct7d = calcUptimePct(uptimeRuns30d, 7);
    const pct30d = calcUptimePct(uptimeRuns30d, 30);

    return {
      configured: hasToken,
      deploy,
      uptime: { pct7d, pct30d },
    };
  } catch (e) {
    // Öffentlicher Abruf möglich, aber fehlgeschlagen → kein Hard-Crash
    return {
      configured: hasToken,
      error: String(e.message || e),
      deploy: { status: 'unbekannt', sha: null, at: null, runUrl: null },
      uptime: { pct7d: null, pct30d: null },
    };
  }
}
