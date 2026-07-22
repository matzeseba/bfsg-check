// Runner: verarbeitet queued-Jobs SEQUENTIELL (max. 1 gleichzeitig).
// Ablauf pro Job: queued -> running -> Executor -> Artefakt schreiben -> Gate ->
// review (bei Erfolg) bzw. failed (bei Executor-Fehler). Executor ist injizierbar.
import { buildPrompt } from './prompt.js';

const POLL_MS = 5_000;

// Runner-Recovery: ein 'running'-Job, dessen letzter Timestamp älter als 30 Minuten
// ist, kann nur aus einer abgebrochenen Session stammen (Runner ist sequentiell,
// max. 1 Job gleichzeitig) und wird beim Engine-Start auf 'failed' gesetzt.
const STALE_RUNNING_MS = 30 * 60_000;
const RECOVERY_ERROR = 'Runner-Recovery: Job hing über Session-Abbruch';

export function createRunner(cfg, store, deps) {
  const executor = deps.executor;
  const gate = deps.gate;
  const log = deps.log;
  let busy = false;
  let timer = null;

  /**
   * Verarbeitet den nächsten queued-Job. Gibt den bearbeiteten Job zurück
   * (oder null, wenn nichts zu tun war / bereits ein Job läuft).
   */
  async function processNext() {
    if (busy) return null;
    const jobs = await store.readJobs();
    const target = jobs.find((j) => j.status === 'queued');
    if (!target) return null;

    busy = true;
    try {
      await store.updateJob(target.id, { status: 'running' });
      if (log) await log.event(`Runner: Job ${target.id} gestartet`, { agent: target.agent });

      const policy = await gate.loadPolicy();
      const prompt = await buildPrompt(cfg, target, policy);

      let artifact;
      try {
        artifact = await executor({ prompt, job: target, cfg });
      } catch (err) {
        const message = err && err.message ? err.message : String(err);
        const failed = await store.updateJob(target.id, { status: 'failed', error: message });
        if (log) await log.event(`Runner: Job ${target.id} FEHLGESCHLAGEN — ${message}`);
        return failed;
      }

      await store.writeArtifact(target.id, artifact);
      const result = await gate.check(artifact, target, policy);
      const reviewed = await store.updateJob(target.id, {
        status: 'review',
        error: null,
        outputFile: `data/outbox/${target.id}.md`,
        gate: { checked: true, passed: result.passed, findings: result.findings },
      });

      if (log) {
        await log.event(
          `Runner: Job ${target.id} -> review (Gate ${result.passed ? 'passed' : 'BLOCK'})`,
          { findings: result.findings.length },
        );
      }
      return reviewed;
    } finally {
      busy = false;
    }
  }

  /**
   * Runner-Recovery beim Engine-Start: hängengebliebene 'running'-Jobs
   * (Timestamp älter als 30 Minuten) werden auf 'failed' gesetzt.
   * @returns {Promise<string[]>} IDs der bereinigten Jobs
   */
  async function recoverStale(now = new Date()) {
    const jobs = await store.readJobs();
    const recovered = [];
    for (const job of jobs) {
      if (job.status !== 'running') continue;
      const ts = new Date(job.updatedAt || job.createdAt || 0).getTime();
      if (!Number.isFinite(ts) || now.getTime() - ts <= STALE_RUNNING_MS) continue;
      await store.updateJob(job.id, { status: 'failed', error: RECOVERY_ERROR });
      recovered.push(job.id);
      if (log) await log.event(`Runner-Recovery: Job ${job.id} auf failed gesetzt (${RECOVERY_ERROR})`);
    }
    return recovered;
  }

  function start() {
    if (timer) return;
    timer = setInterval(() => {
      processNext().catch((err) => {
        if (log) log.event(`Runner-Fehler: ${err.message || err}`);
      });
    }, POLL_MS);
    if (typeof timer.unref === 'function') timer.unref();
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return { processNext, start, stop, recoverStale };
}
