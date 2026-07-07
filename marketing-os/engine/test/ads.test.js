import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  jobChannelFor,
  nextCampaignId,
  makeCampaign,
  buildAdsPromptTemplate,
  upsertMetric,
  summarize,
  metricsForCampaign,
} from '../src/ads.js';

test('jobChannelFor: mappt google/bing, sonst null', () => {
  assert.equal(jobChannelFor('google'), 'paid_ads_google');
  assert.equal(jobChannelFor('bing'), 'paid_ads_bing');
  assert.equal(jobChannelFor('meta'), null);
});

test('nextCampaignId: fortlaufend je Tag', () => {
  const now = new Date('2026-07-08T08:00:00Z');
  const id1 = nextCampaignId([], now);
  assert.equal(id1, 'camp_20260708_0001');
  const id2 = nextCampaignId([{ id: id1 }], now);
  assert.equal(id2, 'camp_20260708_0002');
});

test('makeCampaign: Status review, liveAt/liveUrl null', () => {
  const now = new Date('2026-07-08T08:00:00Z');
  const c = makeCampaign({ existingCampaigns: [], channel: 'google', goal: 'Leads', budgetPerDay: 13, jobId: 'job_1', now });
  assert.equal(c.status, 'review');
  assert.equal(c.liveAt, null);
  assert.equal(c.liveUrl, null);
  assert.equal(c.jobId, 'job_1');
  assert.equal(c.channel, 'google');
  assert.equal(c.budgetPerDay, 13);
  assert.ok(c.name.includes('Leads'));
});

test('buildAdsPromptTemplate: enthaelt Ziel, Budget, Kanal, Stil-Referenz', () => {
  const p = buildAdsPromptTemplate({ goal: 'Mehr Scans', channel: 'bing', budgetPerDay: 4, notes: 'Fokus KMU' });
  assert.match(p, /Mehr Scans/);
  assert.match(p, /4 €/);
  assert.match(p, /Fokus KMU/);
  assert.match(p, /google-ads-rsa-headlines\.md/);
});

test('upsertMetric: neuer Eintrag wird angehaengt, gleicher campaignId+date wird ersetzt', () => {
  const base = [{ campaignId: 'c1', date: '2026-07-01', costEur: 1, impressions: 1, clicks: 1, conversions: 0 }];
  const added = upsertMetric(base, { campaignId: 'c2', date: '2026-07-01', costEur: 2, impressions: 2, clicks: 2, conversions: 0 });
  assert.equal(added.length, 2);
  const replaced = upsertMetric(added, { campaignId: 'c1', date: '2026-07-01', costEur: 99, impressions: 1, clicks: 1, conversions: 1 });
  assert.equal(replaced.length, 2);
  assert.equal(replaced.find((m) => m.campaignId === 'c1').costEur, 99);
});

test('summarize: cpc/ctr/cac korrekt, Division durch 0 => null', () => {
  const campaigns = [{ id: 'c1', name: 'Kampagne A', channel: 'google' }];
  const metrics = [
    { campaignId: 'c1', date: '2026-07-01', impressions: 100, clicks: 10, costEur: 20, conversions: 2 },
    { campaignId: 'c1', date: '2026-07-02', impressions: 0, clicks: 0, costEur: 0, conversions: 0 },
  ];
  const { perCampaign, totals, timeseries } = summarize(campaigns, metrics);
  assert.equal(perCampaign.length, 1);
  assert.equal(perCampaign[0].spend, 20);
  assert.equal(perCampaign[0].cpc, 2);
  assert.equal(perCampaign[0].ctr, 0.1);
  assert.equal(perCampaign[0].cac, 10);
  assert.equal(totals.spend, 20);
  assert.equal(timeseries.length, 2);
  const day2 = timeseries.find((d) => d.date === '2026-07-02');
  assert.equal(day2.cpc, null, 'keine Clicks -> cpc null statt NaN/Infinity');
  assert.equal(day2.ctr, null);
  assert.equal(day2.cac, null);
});

test('summarize: from/to filtert Metriken', () => {
  const campaigns = [{ id: 'c1', name: 'A', channel: 'google' }];
  const metrics = [
    { campaignId: 'c1', date: '2026-06-01', impressions: 10, clicks: 1, costEur: 1, conversions: 0 },
    { campaignId: 'c1', date: '2026-07-01', impressions: 10, clicks: 1, costEur: 1, conversions: 0 },
  ];
  const { totals } = summarize(campaigns, metrics, { from: '2026-07-01', to: '2026-07-31' });
  assert.equal(totals.spend, 1);
});

test('metricsForCampaign: filtert nach campaignId, sortiert aufsteigend nach date', () => {
  const metrics = [
    { campaignId: 'c1', date: '2026-07-03', impressions: 1, clicks: 1, costEur: 1, conversions: 0 },
    { campaignId: 'c2', date: '2026-07-01', impressions: 1, clicks: 1, costEur: 1, conversions: 0 },
    { campaignId: 'c1', date: '2026-07-01', impressions: 1, clicks: 1, costEur: 1, conversions: 0 },
  ];
  const out = metricsForCampaign(metrics, 'c1');
  assert.deepEqual(out.map((m) => m.date), ['2026-07-01', '2026-07-03']);
});
