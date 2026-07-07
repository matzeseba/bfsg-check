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

test('Leads: POST erstellt, GET listet ({ data, meta })', async () => {
  const res = await post('/api/leads', { source: 'seo_pillar', kind: 'scan', value: null, note: 'test' });
  assert.equal(res.status, 201);
  const { lead } = await res.json();
  assert.ok(lead.id);
  assert.ok(lead.date);
  const list = await (await get('/api/leads')).json();
  assert.ok(list.data.some((l) => l.id === lead.id));
  assert.ok(list.meta);
});

test('KPIs: import zählt valide Einträge, GET filtert nach Datum ({ data, meta })', async () => {
  const res = await post('/api/kpis/import', {
    kpis: [
      { date: '2026-07-01', channel: 'seo_pillar', metric: 'visits', value: 10 },
      { date: '2026-07-05', channel: 'seo_pillar', metric: 'clicks', value: 3 },
      { invalid: true },
    ],
  });
  assert.equal((await res.json()).imported, 2);
  const ranged = await (await get('/api/kpis?from=2026-07-04&to=2026-07-10')).json();
  assert.ok(ranged.data.every((k) => k.date >= '2026-07-04'));
  assert.ok(ranged.data.some((k) => k.date === '2026-07-05'));
});

test('GET /api/funnel liefert data.totals + data.byChannel', async () => {
  const j = await (await get('/api/funnel')).json();
  assert.ok(j.data.totals);
  assert.equal(typeof j.data.totals.leads7d, 'number');
  assert.equal(typeof j.data.totals.salesValue30d, 'number');
  assert.ok(Array.isArray(j.data.byChannel));
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

test('GET /api/jobs/:id liefert Einzel-Job, 404 wenn unbekannt', async () => {
  const { job } = await (await post('/api/jobs', { agent: 'a', title: 'Einzel', channel: 'seo_pillar', prompt: '' })).json();
  const hit = await get(`/api/jobs/${job.id}`);
  assert.equal(hit.status, 200);
  assert.equal((await hit.json()).job.id, job.id);

  const miss = await get('/api/jobs/job_nope');
  assert.equal(miss.status, 404);
  assert.ok((await miss.json()).error);
});

test('published akzeptiert optionale url und setzt publishedUrl/publishedAt', async () => {
  const { job } = await (await post('/api/jobs', { agent: 'a', title: 'T', channel: 'seo_pillar', prompt: '' })).json();
  await engine.store.updateJob(job.id, { status: 'approved' });
  const res = await post(`/api/jobs/${job.id}/published`, { url: 'https://bfsg-fix.de/blog/x' });
  assert.equal(res.status, 200);
  const { job: updated } = await res.json();
  assert.equal(updated.status, 'published');
  assert.equal(updated.publishedUrl, 'https://bfsg-fix.de/blog/x');
  assert.ok(updated.publishedAt);
});

test('published ohne url funktioniert weiterhin (kein publishedUrl)', async () => {
  const { job } = await (await post('/api/jobs', { agent: 'a', title: 'T', channel: 'seo_pillar', prompt: '' })).json();
  await engine.store.updateJob(job.id, { status: 'approved' });
  const res = await post(`/api/jobs/${job.id}/published`);
  assert.equal(res.status, 200);
  const { job: updated } = await res.json();
  assert.equal(updated.status, 'published');
  assert.equal(updated.publishedUrl, undefined);
  assert.ok(updated.publishedAt);
});

test('GET /api/kpis liefert { data, meta } und filtert includeDemo=false', async () => {
  await engine.store.writeKpis([
    { date: '2026-07-01', channel: 'seo_pillar', metric: 'visits', value: 10, demo: true },
    { date: '2026-07-02', channel: 'seo_pillar', metric: 'visits', value: 5, demo: false },
  ]);
  const all = await (await get('/api/kpis')).json();
  assert.equal(all.data.length, 2);
  assert.equal(all.meta.hasDemo, true);
  assert.equal(all.meta.demoCount, 1);
  assert.equal(all.meta.totalCount, 2);

  const real = await (await get('/api/kpis?includeDemo=false')).json();
  assert.equal(real.data.length, 1);
  assert.equal(real.data[0].demo, false);
  assert.equal(real.meta.hasDemo, false);
});

test('GET /api/leads liefert { data, meta } und filtert includeDemo=false', async () => {
  await engine.store.writeLeads([
    { id: 'l1', date: '2026-07-01', source: 'seo_pillar', kind: 'scan', value: null, note: '', demo: true },
    { id: 'l2', date: '2026-07-02', source: 'seo_pillar', kind: 'scan', value: null, note: '', demo: false },
  ]);
  const all = await (await get('/api/leads')).json();
  assert.equal(all.data.length, 2);
  assert.equal(all.meta.demoCount, 1);

  const real = await (await get('/api/leads?includeDemo=false')).json();
  assert.equal(real.data.length, 1);
  assert.equal(real.data[0].id, 'l2');
});

test('GET /api/funnel liefert { data: { totals, byChannel }, meta }', async () => {
  const j = await (await get('/api/funnel')).json();
  assert.ok(j.data);
  assert.ok(j.data.totals);
  assert.equal(typeof j.data.totals.leads7d, 'number');
  assert.ok(Array.isArray(j.data.byChannel));
  assert.ok(j.meta);
  assert.equal(typeof j.meta.demoCount, 'number');
});

test('GET /api/datasources liefert source je kpis/leads + integrations (Kontrakt: demo|real|none)', async () => {
  const j = await (await get('/api/datasources')).json();
  assert.ok(['demo', 'real', 'none'].includes(j.kpis.source));
  assert.ok(['demo', 'real', 'none'].includes(j.leads.source));
  assert.equal(j.integrations.stripe.connected, false);
  assert.equal(j.integrations.brevo.connected, false);
  assert.equal(j.integrations.googleAds.connected, false);
  assert.equal(j.integrations.bingAds.connected, false);
});

test('Ads: generate legt Campaign (review) + Job an, Approve -> freigegeben, live, pause', async () => {
  const gen = await post('/api/ads/campaigns/generate', { goal: 'Mehr Scans', channel: 'google', budgetPerDay: 13 });
  assert.equal(gen.status, 201);
  const { campaign, jobId } = await gen.json();
  assert.equal(campaign.status, 'review');
  assert.equal(campaign.channel, 'google');
  assert.ok(jobId);

  const list = await (await get('/api/ads/campaigns')).json();
  assert.ok(list.data.some((c) => c.id === campaign.id));

  const job = await engine.store.getJob(jobId);
  assert.equal(job.channel, 'paid_ads_google');

  await engine.store.updateJob(jobId, { status: 'review' });
  const approved = await post(`/api/jobs/${jobId}/approve`);
  assert.equal(approved.status, 200);

  const afterApprove = (await (await get('/api/ads/campaigns')).json()).data.find((c) => c.id === campaign.id);
  assert.equal(afterApprove.status, 'freigegeben');

  const liveRes = await post(`/api/ads/campaigns/${campaign.id}/live`, { liveUrl: 'https://ads.google.com/x' });
  assert.equal(liveRes.status, 200);
  const live = (await liveRes.json()).campaign;
  assert.equal(live.status, 'live');
  assert.ok(live.liveAt);
  assert.equal(live.liveUrl, 'https://ads.google.com/x');

  const pauseRes = await post(`/api/ads/campaigns/${campaign.id}/pause`);
  assert.equal(pauseRes.status, 200);
  assert.equal((await pauseRes.json()).campaign.status, 'pausiert');
});

test('Ads: generate mit ungueltigem channel => 400', async () => {
  const res = await post('/api/ads/campaigns/generate', { goal: 'X', channel: 'meta', budgetPerDay: 10 });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error);
});

test('Ads: live nur aus "freigegeben" moeglich => 409 aus review', async () => {
  const { campaign } = await (await post('/api/ads/campaigns/generate', { goal: 'Y', channel: 'bing', budgetPerDay: 4 })).json();
  const res = await post(`/api/ads/campaigns/${campaign.id}/live`);
  assert.equal(res.status, 409);
});

test('Ads: metrics upsert (costEur) + summary liefert flaches AdsSummary (spend/cpc/ctr/cac)', async () => {
  const { campaign } = await (await post('/api/ads/campaigns/generate', { goal: 'Z', channel: 'google', budgetPerDay: 5 })).json();
  const m1 = await post('/api/ads/metrics', { campaignId: campaign.id, date: '2026-07-01', impressions: 100, clicks: 10, costEur: 20, conversions: 2 });
  assert.equal(m1.status, 201);
  // Upsert: gleicher Tag ersetzt statt zu duplizieren
  await post('/api/ads/metrics', { campaignId: campaign.id, date: '2026-07-01', impressions: 200, clicks: 20, costEur: 40, conversions: 4 });

  const summary = await (await get(`/api/ads/summary?from=2026-07-01&to=2026-07-31`)).json();
  // AdsSummary ist flach auf Top-Level (Kontrakt dashboard/src/types.ts), nicht unter .totals verschachtelt
  assert.equal(summary.spend, 40, 'Upsert statt Duplikat');
  assert.equal(summary.impressions, 200);
  assert.equal(summary.clicks, 20);
  assert.equal(summary.cpc, 2);
  assert.equal(summary.ctr, 0.1);
  assert.equal(summary.cac, 10);
  // perCampaign/timeseries bleiben als Zusatzfelder erhalten
  assert.ok(Array.isArray(summary.perCampaign));
  assert.ok(Array.isArray(summary.timeseries));
});

test('Ads: metrics mit fehlenden Feldern => 400', async () => {
  const res = await post('/api/ads/metrics', { campaignId: 'x', date: '2026-07-01' });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error);
});

test('GET /api/ads/campaigns/:id/metrics liefert { data } sortiert nach date, 404 bei unbekannter Kampagne', async () => {
  const { campaign } = await (await post('/api/ads/campaigns/generate', { goal: 'Metrics-Test', channel: 'bing', budgetPerDay: 6 })).json();
  await post('/api/ads/metrics', { campaignId: campaign.id, date: '2026-07-03', impressions: 1, clicks: 1, costEur: 1, conversions: 0 });
  await post('/api/ads/metrics', { campaignId: campaign.id, date: '2026-07-01', impressions: 2, clicks: 2, costEur: 2, conversions: 0 });

  const res = await get(`/api/ads/campaigns/${campaign.id}/metrics`);
  assert.equal(res.status, 200);
  const { data } = await res.json();
  assert.deepEqual(data.map((m) => m.date), ['2026-07-01', '2026-07-03']);
  assert.equal(data[0].costEur, 2);

  const miss = await get('/api/ads/campaigns/camp_nope/metrics');
  assert.equal(miss.status, 404);
  assert.ok((await miss.json()).error);
});
