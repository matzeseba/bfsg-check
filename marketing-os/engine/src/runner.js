// Runner: verarbeitet queued-Jobs SEQUENTIELL (max. 1 gleichzeitig).
// Ablauf pro Job: queued -> running -> Executor -> Artefakt schreiben -> Gate ->
// review (bei Erfolg) bzw. failed (bei Executor-Fehler). Executor ist injizierbar.
import { buildPrompt } from './prompt.js';

const POLL_MS = 5_000;

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

  return { processNext, start, stop };
}
