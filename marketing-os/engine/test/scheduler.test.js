import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConfig } from '../src/config.js';
import { createStore } from '../src/store.js';
import { createScheduler, isDue } from '../src/scheduler.js';
import { createPlaybookRepo } from '../src/playbooks.js';
import { mkTmp, rmTmp, writePlaybooks } from './helpers.js';

test('isDue: once nur wenn nie gelaufen', () => {
  const pb = { id: 'p', cadence: { type: 'once' } };
  assert.equal(isDue(pb, null, new Date()), true);
  assert.equal(isDue(pb, '2026-07-01T00:00:00Z', new Date()), false);
});

test('isDue: interval nach Ablauf everyHours', () => {
  const pb = { id: 'p', cadence: { type: 'interval', everyHours: 12 } };
  const now = new Date('2026-07-07T12:00:00Z');
  assert.equal(isDue(pb, null, now), true, 'nie gelaufen => fällig');
  assert.equal(isDue(pb, '2026-07-07T00:00:00Z', now), true, '12h vergangen');
  assert.equal(isDue(pb, '2026-07-07T06:00:00Z', now), false, 'erst 6h vergangen');
});

test('isDue: daily ab hour, nicht davor, nicht zweimal am Tag', () => {
  const pb = { id: 'p', cadence: { type: 'daily', hour: 6 } };
  const before = new Date('2026-07-07T05:30:00'); // lokal
  const after = new Date('2026-07-07T07:00:00');
  assert.equal(isDue(pb, null, before), false, 'vor hour nicht fällig');
  assert.equal(isDue(pb, null, after), true, 'nach hour fällig');
  assert.equal(isDue(pb, after.toISOString(), new Date('2026-07-07T09:00:00')), false, 'heute schon gelaufen');
  assert.equal(isDue(pb, after.toISOString(), new Date('2026-07-08T07:00:00')), true, 'nächster Tag wieder fällig');
});

test('isDue: weekly nur am passenden Wochentag', () => {
  // 2026-07-06 ist ein Montag (getDay()===1)
  const pb = { id: 'p', cadence: { type: 'weekly', weekday: 1, hour: 6 } };
  const monday = new Date('2026-07-06T08:00:00');
  const tuesday = new Date('2026-07-07T08:00:00');
  assert.equal(monday.getDay(), 1);
  assert.equal(isDue(pb, null, monday), true, 'Montag ab 6 Uhr fällig');
  assert.equal(isDue(pb, null, tuesday), false, 'Dienstag nicht fällig');
});

test('scheduler.tick: erzeugt Jobs und setzt state.lastRun', async () => {
  const dir = await mkTmp();
  const pbDir = await mkTmp('mos-pb-');
  try {
    await writePlaybooks(pbDir, [
      { id: 'daily-a', name: 'Daily A', agent: 'seo-pillar-writer', channel: 'seo_pillar', cadence: { type: 'daily', hour: 0 }, promptTemplate: 'x', enabled: true },
      { id: 'once-b', name: 'Once B', agent: 'pr-writer', channel: 'pr_free', cadence: { type: 'once' }, promptTemplate: 'y', enabled: true },
    ]);
    const cfg = createConfig({ dataDir: dir, playbooksDir: pbDir });
    const store = createStore(cfg);
    await store.bootstrap();
    const scheduler = createScheduler(cfg, store, { playbooks: createPlaybookRepo(cfg) });

    const now = new Date('2026-07-07T10:00:00');
    const created = await scheduler.tick(now);
    assert.equal(created.length, 2, 'beide Playbooks fällig');

    const state = await store.readState();
    assert.ok(state.playbooks['daily-a'].lastRun);
    assert.ok(state.playbooks['once-b'].lastRun);

    // zweiter Tick am selben Tag: nichts Neues
    const again = await scheduler.tick(new Date('2026-07-07T11:00:00'));
    assert.equal(again.length, 0);
  } finally {
    await rmTmp(dir);
    await rmTmp(pbDir);
  }
});

test('scheduler.tick: disabled Playbook wird übersprungen', async () => {
  const dir = await mkTmp();
  const pbDir = await mkTmp('mos-pb-');
  try {
    await writePlaybooks(pbDir, [
      { id: 'off', name: 'Off', agent: 'a', channel: 'seo_pillar', cadence: { type: 'daily', hour: 0 }, enabled: true },
    ]);
    const cfg = createConfig({ dataDir: dir, playbooksDir: pbDir });
    const store = createStore(cfg);
    await store.bootstrap();
    await store.writeState({ playbooks: { off: { lastRun: null, enabled: false } } });
    const scheduler = createScheduler(cfg, store, { playbooks: createPlaybookRepo(cfg) });
    const created = await scheduler.tick(new Date('2026-07-07T10:00:00'));
    assert.equal(created.length, 0);
  } finally {
    await rmTmp(dir);
    await rmTmp(pbDir);
  }
});
