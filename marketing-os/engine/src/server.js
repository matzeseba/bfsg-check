// Entry-Point: Bootstrap -> API + Scheduler + Runner starten.
// `main(overrides)` ist testbar (Ephemeral-Port, injizierter Executor, autoStart:false).
import { pathToFileURL } from 'node:url';
import { createConfig } from './config.js';
import { createStore } from './store.js';
import { createGate } from './gate.js';
import { createLog } from './log.js';
import { createPlaybookRepo } from './playbooks.js';
import { createScheduler } from './scheduler.js';
import { createRunner } from './runner.js';
import { createApi } from './api.js';
import { claudeExecutor } from './claude-exec.js';

/**
 * Startet die Engine.
 * @param {object} overrides  Config-Overrides + { executor?, autoStart? }
 * @returns {Promise<{ app, server, cfg, store, scheduler, runner, port, stop }>}
 */
export async function main(overrides = {}) {
  const cfg = createConfig(overrides);
  const store = createStore(cfg);
  await store.bootstrap();

  const log = createLog(cfg);
  const gate = createGate(cfg);
  const playbooks = createPlaybookRepo(cfg);
  const runner = createRunner(cfg, store, {
    executor: overrides.executor || claudeExecutor,
    gate,
    log,
  });
  const scheduler = createScheduler(cfg, store, { playbooks, log });
  const app = createApi(cfg, { store, gate, playbooks, scheduler, runner, log });

  const autoStart = overrides.autoStart !== false;

  const server = await new Promise((resolve) => {
    const s = app.listen(cfg.port, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;

  if (autoStart) {
    scheduler.start();
    runner.start();
  }

  // eslint-disable-next-line no-console
  console.log(`[MOS] Engine läuft auf http://127.0.0.1:${port} (dryRun=${cfg.dryRun}, autoStart=${autoStart})`);

  async function stop() {
    scheduler.stop();
    runner.stop();
    await new Promise((resolve) => server.close(resolve));
  }

  return { app, server, cfg, store, scheduler, runner, playbooks, gate, log, port, stop };
}

// Direktaufruf (node src/server.js) — plattformübergreifende Guard.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[MOS] Start fehlgeschlagen:', err);
    process.exitCode = 1;
  });
}
