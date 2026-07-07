import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { main } from '../src/server.js';
import { mkTmp, rmTmp, writePlaybooks, fakeExecutor } from './helpers.js';

let engine;
let base;
let dataDir;
let pbDir;

before(async () => {
  dataDir = await mkTmp();
  pbDir = await mkTmp('mos-pb-');
  await writePlaybooks(pbDir, [
    { id: 'seo-pillar-weekly', name: 'SEO Pillar', agent: 'seo-pillar-writer', channel: 'seo_pillar', cadence: { type: 'weekly', weekday: 1, hour: 6 }, promptTemplate: 'Schreibe {date}', enabled: true },
  ]);
  engine = await main({
    dataDir,
    playbooksDir: pbDir,
    dryRun: true,
    port: 0,
    autoStart: false, // Scheduler/Runner aus -> deterministische Assertions
    executor: fakeExecutor('# X'),
  });
  base = `http://127.0.0.1:${engine.port}`;
});

after(async () => {
  if (engine) await engine.stop();
  await rmTmp(dataDir);
  await rmTmp(pbDir);
});

const get = (p) => fetch(`${base}${p}`);
const post = (p, body) =>
  fetch(`${base}${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

test('GET /api/health => ok true', async () => {
  const res = await get('/api/health');
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.ok, true);
  assert.equal(j.version, '1.0.0');
  assert.equal(j.dryRun, true);
  assert.equal(typeof j.uptimeSec, 'number');
});

test('POST /api/jobs erstellt Job, GET /api/jobs listet ihn', async () => {
  const res = await post('/api/jobs', { agent: 'seo-pillar-writer', title: 'Neuer Job', channel: 'seo_pillar', prompt: 'p' });
  assert.equal(res.status, 201);
  const { job } = await res.json();
  assert.equal(job.status, 'queued');

  const list = await (await get('/api/jobs')).json();
  assert.ok(list.jobs.some((j) => j.id === job.id));

  const filtered = await (await get('/api/jobs?status=queued')).json();
  assert.ok(filtered.jobs.every((j) => j.status === 'queued'));
});

test('POST /api/jobs ohne Pflichtfelder => 400 { error }', async () => {
  const res = await post('/api/jobs', { title: 'nur Titel' });
  assert.equal(res.status, 400);
  const j = await res.json();
  assert.ok(j.error);
});

test('approve nur aus review; sonst 409', async () => {
  const { job } = await (await post('/api/jobs', { agent: 'a', title: 'T', channel: 'seo_pillar', prompt: '' })).json();
  // queued -> approve verboten
  const bad = await post(`/api/jobs/${job.id}/approve`);
  assert.equal(bad.status, 409);
  // Status künstlich auf review setzen und erneut approven
  await engine.store.updateJob(job.id, { status: 'review' });
  const ok = await post(`/api/jobs/${job.id}/approve`);
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).job.status, 'approved');
});

test('reject setzt review -> skipped', async () => {
  const { job } = await (await post('/api/jobs', { agent: 'a', title: 'T', channel: 'seo_pillar', prompt: '' })).json();
  await engine.store.updateJob(job.id, { status: 'review' });
  const res = await post(`/api/jobs/${job.id}/reject`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).job.status, 'skipped');
});

test('published nur aus approved', async () => {
  const { job } = await (await post('/api/jobs', { agent: 'a', title: 'T', channel: 'seo_pillar', prompt: '' })).json();
  await engine.store.updateJob(job.id, { status: 'approved' });
  const res = await post(`/api/jobs/${job.id}/published`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).job.status, 'published');
});

test('GET /api/jobs/:id/output => 404 ohne Artefakt, 200 danach', async () => {
  const { job } = await (await post('/api/jobs', { agent: 'a', title: 'T', channel: 'seo_pillar', prompt: '' })).json();
  const miss = await get(`/api/jobs/${job.id}/output`);
  assert.equal(miss.status, 404);
  await engine.store.writeArtifact(job.id, '# Inhalt');
  const hit = await get(`/api/jobs/${job.id}/output`);
  assert.equal(hit.status, 200);
  assert.equal((await hit.json()).content, '# Inhalt');
});

test('Leads: POST erstellt, GET listet', async () => {
  const res = await post('/api/leads', { source: 'seo_pillar', kind: 'scan', value: null, note: 'test' });
  assert.equal(res.status, 201);
  const { lead } = await res.json();
  assert.ok(lead.id);
  assert.ok(lead.date);
  const list = await (await get('/api/leads')).json();
  assert.ok(list.leads.some((l) => l.id === lead.id));
});

test('KPIs: import zählt valide Einträge, GET filtert nach Datum', async () => {
  const res = await post('/api/kpis/import', {
    kpis: [
      { date: '2026-07-01', channel: 'seo_pillar', metric: 'visits', value: 10 },
      { date: '2026-07-05', channel: 'seo_pillar', metric: 'clicks', value: 3 },
      { invalid: true },
    ],
  });
  assert.equal((await res.json()).imported, 2);
  const ranged = await (await get('/api/kpis?from=2026-07-04&to=2026-07-10')).json();
  assert.ok(ranged.kpis.every((k) => k.date >= '2026-07-04'));
  assert.ok(ranged.kpis.some((k) => k.date === '2026-07-05'));
});

test('GET /api/funnel liefert totals + byChannel', async () => {
  const j = await (await get('/api/funnel')).json();
  assert.ok(j.totals);
  assert.equal(typeof j.totals.leads7d, 'number');
  assert.equal(typeof j.totals.salesValue30d, 'number');
  assert.ok(Array.isArray(j.byChannel));
});

test('Playbooks: Liste enthält lastRun/nextRun/enabled; toggle + run-now', async () => {
  const list = await (await get('/api/playbooks')).json();
  assert.equal(list.playbooks.length, 1);
  const pb = list.playbooks[0];
  assert.equal(pb.id, 'seo-pillar-weekly');
  assert.ok('lastRun' in pb && 'nextRun' in pb && 'enabled' in pb);

  const toggled = await (await post('/api/playbooks/seo-pillar-weekly/toggle')).json();
  assert.equal(toggled.playbook.enabled, false);

  const run = await post('/api/playbooks/seo-pillar-weekly/run-now');
  assert.equal(run.status, 201);
  assert.equal((await run.json()).job.playbookId, 'seo-pillar-weekly');
});

test('GET /api/compliance => policy + recentFindings', async () => {
  const j = await (await get('/api/compliance')).json();
  assert.ok(j.policy);
  assert.ok(Array.isArray(j.policy.forbiddenPatterns));
  assert.ok(Array.isArray(j.recentFindings));
});

test('unbekannte Route => 404 { error }', async () => {
  const res = await get('/api/gibtsnicht');
  assert.equal(res.status, 404);
  assert.ok((await res.json()).error);
});
