// Job-Factory + ID-Vergabe. Schema exakt nach ARCHITECTURE.md §4.
import { ymd } from './util.js';

/**
 * Nächste fortlaufende Job-ID im Format job_YYYYMMDD_NNNN, basierend auf den
 * bereits vorhandenen Jobs desselben Tages.
 */
export function nextJobId(existingJobs = [], now = new Date()) {
  const prefix = `job_${ymd(now)}_`;
  let max = 0;
  for (const j of existingJobs) {
    if (j && typeof j.id === 'string' && j.id.startsWith(prefix)) {
      const n = Number.parseInt(j.id.slice(prefix.length), 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

/**
 * Baut ein vollständiges Job-Objekt (Status queued). `promptTemplate` trägt den
 * Prompt/Template, aus dem der Runner später den Claude-Prompt baut.
 */
export function makeJob({
  existingJobs = [],
  playbookId = null,
  agent,
  title,
  channel,
  promptTemplate = '',
  now = new Date(),
}) {
  const id = nextJobId(existingJobs, now);
  const iso = now.toISOString();
  return {
    id,
    playbookId,
    agent: agent || 'unknown',
    title: title || '(ohne Titel)',
    channel: channel || 'analytics_internal',
    status: 'queued',
    createdAt: iso,
    updatedAt: iso,
    outputFile: `data/outbox/${id}.md`,
    promptTemplate,
    gate: { checked: false, passed: false, findings: [] },
    publishAction: { type: 'none', instructions: '' },
    error: null,
  };
}
