import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createConfig } from '../src/config.js';
import { createStore } from '../src/store.js';
import { mkTmp, rmTmp } from './helpers.js';

test('store: atomarer Write/Read round-trip', async () => {
  const dir = await mkTmp();
  try {
    const store = createStore(createConfig({ dataDir: dir }));
    await store.bootstrap();
    await store.writeJobs([{ id: 'x', status: 'queued' }]);
    const jobs = await store.readJobs();
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0].id, 'x');
    // keine .tmp-Reste
    const files = await fs.readdir(dir);
    assert.ok(!files.some((f) => f.endsWith('.tmp')), 'keine Temp-Dateien');
  } finally {
    await rmTmp(dir);
  }
});

test('store: bootstrap kopiert aus seed/ wenn Zieldatei fehlt', async () => {
  const dir = await mkTmp();
  try {
    const seed = path.join(dir, 'seed');
    await fs.mkdir(seed, { recursive: true });
    await fs.writeFile(path.join(seed, 'leads.json'), JSON.stringify([{ id: 'L1', kind: 'sale' }]), 'utf8');
    const store = createStore(createConfig({ dataDir: dir }));
    await store.bootstrap();
    const leads = await store.readLeads();
    assert.equal(leads.length, 1);
    assert.equal(leads[0].id, 'L1');
  } finally {
    await rmTmp(dir);
  }
});

test('store: bootstrap legt valide Leer-Defaults an ohne seed', async () => {
  const dir = await mkTmp();
  try {
    const store = createStore(createConfig({ dataDir: dir }));
    await store.bootstrap();
    assert.deepEqual(await store.readJobs(), []);
    assert.deepEqual(await store.readState(), { playbooks: {} });
  } finally {
    await rmTmp(dir);
  }
});

test('store: bootstrap legt outbox/ und logs/ an', async () => {
  const dir = await mkTmp();
  try {
    const cfg = createConfig({ dataDir: dir });
    await createStore(cfg).bootstrap();
    const outbox = await fs.stat(cfg.outboxDir);
    const logs = await fs.stat(cfg.logsDir);
    assert.ok(outbox.isDirectory());
    assert.ok(logs.isDirectory());
  } finally {
    await rmTmp(dir);
  }
});

test('store: createJob vergibt fortlaufende IDs', async () => {
  const dir = await mkTmp();
  try {
    const store = createStore(createConfig({ dataDir: dir }));
    await store.bootstrap();
    const now = new Date('2026-07-07T08:00:00Z');
    const j1 = await store.createJob({ agent: 'a', title: 't1', channel: 'seo_pillar', now });
    const j2 = await store.createJob({ agent: 'a', title: 't2', channel: 'seo_pillar', now });
    assert.equal(j1.id, 'job_20260707_0001');
    assert.equal(j2.id, 'job_20260707_0002');
    assert.equal(j1.status, 'queued');
    assert.equal(j1.outputFile, 'data/outbox/job_20260707_0001.md');
  } finally {
    await rmTmp(dir);
  }
});

test('store: updateJob patcht per ID und setzt updatedAt', async () => {
  const dir = await mkTmp();
  try {
    const store = createStore(createConfig({ dataDir: dir }));
    await store.bootstrap();
    const job = await store.createJob({ agent: 'a', title: 't', channel: 'seo_pillar' });
    const updated = await store.updateJob(job.id, { status: 'approved' });
    assert.equal(updated.status, 'approved');
    const missing = await store.updateJob('nope', { status: 'x' });
    assert.equal(missing, null);
  } finally {
    await rmTmp(dir);
  }
});

test('store: writeArtifact/readArtifact round-trip', async () => {
  const dir = await mkTmp();
  try {
    const store = createStore(createConfig({ dataDir: dir }));
    await store.bootstrap();
    await store.writeArtifact('job_1', '# Hallo\nWelt');
    assert.equal(await store.readArtifact('job_1'), '# Hallo\nWelt');
  } finally {
    await rmTmp(dir);
  }
});
