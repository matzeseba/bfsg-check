import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoMeta, filterDemo, parseIncludeDemo } from '../src/demo.js';

test('demoMeta: zaehlt demo/gesamt korrekt', () => {
  const items = [{ demo: true }, { demo: true }, { demo: false }, {}];
  const meta = demoMeta(items);
  assert.equal(meta.totalCount, 4);
  assert.equal(meta.demoCount, 2);
  assert.equal(meta.hasDemo, true);
});

test('demoMeta: leere Liste => hasDemo false', () => {
  assert.deepEqual(demoMeta([]), { hasDemo: false, demoCount: 0, totalCount: 0 });
});

test('filterDemo: includeDemo=true laesst alles durch', () => {
  const items = [{ demo: true }, { demo: false }];
  assert.equal(filterDemo(items, true).length, 2);
});

test('filterDemo: includeDemo=false entfernt nur demo:true', () => {
  const items = [{ id: 1, demo: true }, { id: 2, demo: false }, { id: 3 }];
  const out = filterDemo(items, false);
  assert.deepEqual(out.map((i) => i.id), [2, 3]);
});

test('parseIncludeDemo: Default true, nur "false" schaltet aus', () => {
  assert.equal(parseIncludeDemo({}), true);
  assert.equal(parseIncludeDemo({ includeDemo: 'false' }), false);
  assert.equal(parseIncludeDemo({ includeDemo: 'true' }), true);
  assert.equal(parseIncludeDemo({ includeDemo: 'anything' }), true);
});
