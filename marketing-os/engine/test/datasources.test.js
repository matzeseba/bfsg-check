import { test } from 'node:test';
import assert from 'node:assert/strict';
import { integrationsStatus, sourceLabel, datasourcesSnapshot } from '../src/datasources.js';

test('integrationsStatus: connected nur bei gesetzter, nicht-leerer Env-Var', () => {
  const status = integrationsStatus({ STRIPE_API_KEY: 'sk_live_x', BREVO_API_KEY: '', GOOGLE_ADS_TOKEN: '   ' });
  assert.equal(status.stripe.connected, true);
  assert.equal(status.brevo.connected, false);
  assert.equal(status.googleAds.connected, false);
  assert.equal(status.bingAds.connected, false);
});

test('sourceLabel: leer => "none"', () => {
  assert.equal(sourceLabel([]), 'none');
});

test('sourceLabel: Daten ohne demo-Flag => "real"', () => {
  assert.equal(sourceLabel([{ id: 1 }]), 'real');
});

test('sourceLabel: alles demo => "demo"', () => {
  assert.equal(sourceLabel([{ demo: true }, { demo: true }]), 'demo');
});

test('sourceLabel: gemischt => konservativ "demo" (kein separater Mixed-Zustand im Kontrakt)', () => {
  assert.equal(sourceLabel([{ demo: true }, { demo: false }]), 'demo');
});

test('datasourcesSnapshot: liefert kpis/leads-Source + integrations', async () => {
  const store = {
    readKpis: async () => [{ demo: true }],
    readLeads: async () => [{ demo: false }],
  };
  const snap = await datasourcesSnapshot(store, { STRIPE_API_KEY: 'x' });
  assert.equal(snap.kpis.source, 'demo');
  assert.equal(snap.leads.source, 'real');
  assert.equal(snap.integrations.stripe.connected, true);
  assert.equal(snap.integrations.brevo.connected, false);
});

test('datasourcesSnapshot: keine Daten => "none"', async () => {
  const store = { readKpis: async () => [], readLeads: async () => [] };
  const snap = await datasourcesSnapshot(store, {});
  assert.equal(snap.kpis.source, 'none');
  assert.equal(snap.leads.source, 'none');
});
