// MF4: resolveSubscriptionId(inv) ist die aus handleInvoicePaid herausgelöste reine
// Funktion, die die Subscription-ID einer Stripe-Invoice robust findet. Stripe hat mit
// der Basil-API (>= 2025-03-31) das Top-Level-Feld Invoice.subscription entfernt und die
// ID nach inv.parent.subscription_details.subscription bzw. in die Line-Items verschoben.
// Findet die Funktion nichts, MUSS sie null liefern (handleInvoicePaid alarmiert dann,
// statt den abgebuchten Kunden ohne Re-Check ins Leere laufen zu lassen).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSubscriptionId } from '../app.js';

test('Basil: subscription aus inv.parent.subscription_details.subscription', () => {
  const inv = {
    id: 'in_basil_parent',
    billing_reason: 'subscription_cycle',
    parent: { subscription_details: { subscription: 'sub_PARENT123' } }
  };
  assert.equal(resolveSubscriptionId(inv), 'sub_PARENT123');
});

test('Basil: subscription aus inv.lines.data[0].parent.subscription_item_details.subscription', () => {
  const inv = {
    id: 'in_basil_line',
    billing_reason: 'subscription_cycle',
    lines: { data: [{ parent: { subscription_item_details: { subscription: 'sub_LINE456' } } }] }
  };
  assert.equal(resolveSubscriptionId(inv), 'sub_LINE456');
});

test('Legacy: subscription aus Top-Level inv.subscription (Pre-Basil)', () => {
  const inv = { id: 'in_legacy', billing_reason: 'subscription_cycle', subscription: 'sub_TOP789' };
  assert.equal(resolveSubscriptionId(inv), 'sub_TOP789');
});

test('Keine Subscription-ID auffindbar → null (löst Alarm-Pfad aus)', () => {
  const inv = {
    id: 'in_orphan',
    billing_reason: 'subscription_cycle',
    parent: { subscription_details: {} },
    lines: { data: [{ parent: {} }] }
  };
  assert.equal(resolveSubscriptionId(inv), null);
});

test('Leere/fehlende Invoice → null (kein Throw)', () => {
  assert.equal(resolveSubscriptionId(null), null);
  assert.equal(resolveSubscriptionId(undefined), null);
  assert.equal(resolveSubscriptionId({}), null);
  assert.equal(resolveSubscriptionId({ lines: { data: [] } }), null);
});

test('Präzedenz: Top-Level gewinnt vor parent, parent vor line-item', () => {
  // Alle drei Quellen gesetzt → Top-Level zuerst.
  const all = {
    subscription: 'sub_TOP',
    parent: { subscription_details: { subscription: 'sub_PARENT' } },
    lines: { data: [{ parent: { subscription_item_details: { subscription: 'sub_LINE' } } }] }
  };
  assert.equal(resolveSubscriptionId(all), 'sub_TOP');
  // Ohne Top-Level → parent.
  const noTop = { parent: all.parent, lines: all.lines };
  assert.equal(resolveSubscriptionId(noTop), 'sub_PARENT');
  // Nur Line-Item → Line.
  const onlyLine = { lines: all.lines };
  assert.equal(resolveSubscriptionId(onlyLine), 'sub_LINE');
});
