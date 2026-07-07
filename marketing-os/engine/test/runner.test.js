import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConfig } from '../src/config.js';
import { createStore } from '../src/store.js';
import { createGate } from '../src/gate.js';
import { createRunner } from '../src/runner.js';
import { claudeExecutor, dryRunArtifact } from '../src/claude-exec.js';
import { mkTmp, rmTmp, fakeExecutor } from './helpers.js';

const DISCLAIMER = 'Automatisierte technische Analyse — ersetzt keine Rechtsberatung.';

test('runner: queued-Job -> review, Artefakt geschrieben, Gate geprüft', async () => {
  const dir = await mkTmp();
  try {
    const cfg = createConfig({ dataDir: dir });
    const store = createStore(cfg);
    await store.bootstrap();
    const gate = createGate(cfg);
    const artifact = `# Ratgeber\nWCAG 2.1 AA. ${DISCLAIMER}`;
    const runner = createRunner(cfg, store, { executor: fakeExecutor(artifact), gate });

    const job = await store.createJob({ agent: 'seo-pillar-writer', title: 'T', channel: 'seo_pillar', promptTemplate: 'x' });
    const done = await runner.processNext();

    assert.equal(done.status, 'review');
    assert.equal(done.gate.checked, true);
    assert.equal(done.gate.passed, true);
    assert.equal(await store.readArtifact(job.id), artifact);
  } finally {
    await rmTmp(dir);
  }
});

test('runner: Executor-Fehler -> Status failed + error gesetzt', async () => {
  const dir = await mkTmp();
  try {
    const cfg = createConfig({ dataDir: dir });
    const store = createStore(cfg);
    await store.bootstrap();
    const gate = createGate(cfg);
    const runner = createRunner(cfg, store, { executor: fakeExecutor('boom', { throwError: true }), gate });

    await store.createJob({ agent: 'a', title: 'T', channel: 'seo_pillar' });
    const done = await runner.processNext();
    assert.equal(done.status, 'failed');
    assert.match(done.error, /boom/);
  } finally {
    await rmTmp(dir);
  }
});

test('runner: block-Finding bleibt sichtbar in review (kein Auto-Fix)', async () => {
  const dir = await mkTmp();
  try {
    const cfg = createConfig({ dataDir: dir });
    const store = createStore(cfg);
    await store.bootstrap();
    const gate = createGate(cfg);
    const bad = `Wir machen Sie BFSG-konform. ${DISCLAIMER}`;
    const runner = createRunner(cfg, store, { executor: fakeExecutor(bad), gate });

    await store.createJob({ agent: 'a', title: 'T', channel: 'seo_pillar' });
    const done = await runner.processNext();
    assert.equal(done.status, 'review', 'bleibt in review');
    assert.equal(done.gate.passed, false);
    assert.ok(done.gate.findings.some((f) => f.severity === 'block'));
  } finally {
    await rmTmp(dir);
  }
});

test('runner: processNext gibt null zurück ohne queued-Job', async () => {
  const dir = await mkTmp();
  try {
    const cfg = createConfig({ dataDir: dir });
    const store = createStore(cfg);
    await store.bootstrap();
    const runner = createRunner(cfg, store, { executor: fakeExecutor('x'), gate: createGate(cfg) });
    assert.equal(await runner.processNext(), null);
  } finally {
    await rmTmp(dir);
  }
});

test('claude-exec: DRY_RUN liefert deterministischen Dummy ohne Spawn', async () => {
  const cfg = createConfig({ dryRun: true });
  const job = { id: 'job_x', title: 'Titel', agent: 'a', channel: 'seo_pillar' };
  const a = await claudeExecutor({ prompt: 'p', job, cfg });
  const b = await claudeExecutor({ prompt: 'p', job, cfg });
  assert.equal(a, b, 'deterministisch');
  assert.equal(a, dryRunArtifact(job));
  assert.match(a, /ersetzt keine Rechtsberatung/);
  assert.match(a, /WCAG/);
});
